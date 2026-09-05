import { useState, useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { api } from '../services/api';
import { FAILURE_TYPES, SERVICES } from '../constants';
import PageHeader from '../components/PageHeader';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

function Failures() {
  const toast = useToast();
  const { confirm, ConfirmComponent } = useConfirm();
  const fetchActive = useCallback(() => api.getActiveFailures(), []);
  const { data: activeFailures, loading, refetch } = usePolling(fetchActive, 3000);

  const [form, setForm] = useState({ targetService: 'demo-app', failureType: 'LATENCY', parameters: 'latencyMs:3000' });
  const [injecting, setInjecting] = useState(false);

  function updateParamsForType(type) {
    const ft = FAILURE_TYPES.find(f => f.value === type);
    setForm(prev => ({ ...prev, failureType: type, parameters: ft?.defaultParams || '' }));
  }

  async function injectFailure(e) {
    e.preventDefault();
    setInjecting(true);
    try {
      await api.injectFailure({ targetService: form.targetService, failureType: form.failureType, parameters: form.parameters, durationSeconds: 0 });
      toast.success(`Injected ${form.failureType} on ${form.targetService}`);
      refetch();
    } catch (err) {
      toast.error('Failed to inject: ' + err.message);
    } finally {
      setInjecting(false);
    }
  }

  async function removeFailure(service, type) {
    try {
      await api.removeFailure(service, type);
      toast.success('Failure removed');
      refetch();
    } catch (err) {
      toast.error('Failed to remove: ' + err.message);
    }
  }

  async function removeAll(service) {
    const ok = await confirm('Remove all failures?', `This will remove all active failures from ${service}.`);
    if (!ok) return;
    try {
      await api.removeAllFailures(service);
      toast.success('All failures removed');
      refetch();
    } catch (err) {
      toast.error('Failed to remove: ' + err.message);
    }
  }

  if (loading) return <Spinner />;

  const failureEntries = Object.entries(activeFailures || {});

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {ConfirmComponent}
      <PageHeader section="Failures" title="Failure Injection" />

      <div className="card-bezel animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="card-bezel-inner">
          <SectionHeader label="Manual" title="Inject Failure" />

          <form onSubmit={injectFailure} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {FAILURE_TYPES.map(type => (
                <button key={type.value} type="button" onClick={() => updateParamsForType(type.value)}
                  className={`p-4 rounded-2xl border transition-all duration-200 ease-premium text-left group ${
                    form.failureType === type.value ? 'bg-white/[0.06] border-white/[0.12]' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
                  }`}>
                  <div className={`mb-3 transition-colors ${form.failureType === type.value ? 'text-white' : 'text-white/30 group-hover:text-white/50'}`}>{type.icon}</div>
                  <div className={`text-xs font-medium mb-0.5 ${form.failureType === type.value ? 'text-white' : 'text-white/60'}`}>{type.label}</div>
                  <div className="text-[10px] text-white/20">{type.description}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-white/30 font-medium block mb-2">Target Service</label>
                <select value={form.targetService} onChange={e => setForm(prev => ({ ...prev, targetService: e.target.value }))} className="select-premium">
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-white/30 font-medium block mb-2">Parameters</label>
                <input type="text" value={form.parameters} onChange={e => setForm(prev => ({ ...prev, parameters: e.target.value }))}
                  placeholder="key:value,key:value" className="input-premium" />
              </div>
            </div>

            <button type="submit" disabled={injecting}
              className="py-2.5 px-6 rounded-2xl bg-white text-[#030303] text-sm font-medium btn-press magnetic-hover disabled:opacity-50 flex items-center gap-2">
              {injecting && <div className="w-4 h-4 border-[1.5px] border-[#030303]/20 border-t-[#030303] rounded-full animate-spin" />}
              {injecting ? 'Injecting...' : 'Inject Failure'}
            </button>
          </form>
        </div>
      </div>

      <div className="card-bezel animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="card-bezel-inner">
          <SectionHeader label="Active" title="Active Failures" count={failureEntries.length} />

          {failureEntries.length === 0 ? (
            <EmptyState
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15"><polyline points="20 6 9 17 4 12"/></svg>}
              title="No active failures"
              subtitle="System nominal"
            />
          ) : (
            <div className="space-y-3">
              {failureEntries.map(([key, failure]) => {
                const ft = FAILURE_TYPES.find(t => t.value === failure.failureType);
                return (
                  <div key={key} className="p-4 rounded-2xl bg-red-500/[0.04] border border-red-500/[0.08]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-red-500/[0.08] flex items-center justify-center flex-shrink-0">
                          <span className="text-red-400/80">{ft?.icon || <span>&#x1F4A5;</span>}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{failure.targetService}</div>
                          <div className="text-xs text-red-400/70">{failure.failureType}</div>
                          {failure.parameters && Object.keys(failure.parameters).length > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              {Object.entries(failure.parameters).map(([k, v]) => (
                                <span key={k} className="text-[10px] text-white/25">{k}={v}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFailure(failure.targetService, failure.failureType)}
                          className="py-1.5 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs font-medium btn-press hover:bg-white/[0.06]">Remove</button>
                        <button onClick={() => removeAll(failure.targetService)}
                          className="py-1.5 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-white/25 text-xs font-medium btn-press hover:bg-white/[0.04]">Remove All</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Failures;
