import { useState, useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { FAILURE_TYPES, SERVICES } from '../constants';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const SIMPLE_FAILURE_TYPES = FAILURE_TYPES.filter(t => ['LATENCY', 'ERROR', 'SERVICE_KILL'].includes(t.value));

function Experiments() {
  const toast = useToast();
  const fetchExperiments = useCallback(() => api.getExperiments(), []);
  const { data: experiments, loading } = usePolling(fetchExperiments, 3000);

  const [form, setForm] = useState({
    name: '', targetService: 'demo-app', failureType: 'LATENCY',
    parameters: 'latencyMs:3000', durationSeconds: 60, trafficRps: 10,
  });
  const [showForm, setShowForm] = useState(false);

  function updateParamsForType(type) {
    const ft = FAILURE_TYPES.find(f => f.value === type);
    setForm(prev => ({ ...prev, failureType: type, parameters: ft?.defaultParams || '' }));
  }

  async function createExperiment(e) {
    e.preventDefault();
    try {
      await api.createExperiment(form);
      toast.success('Experiment created');
      setShowForm(false);
      setForm({ name: '', targetService: 'demo-app', failureType: 'LATENCY', parameters: 'latencyMs:3000', durationSeconds: 60, trafficRps: 10 });
    } catch (err) {
      toast.error('Failed to create experiment: ' + err.message);
    }
  }

  async function stopExperiment(id) {
    try {
      await api.stopExperiment(id);
      toast.success('Experiment stopped');
    } catch (err) {
      toast.error('Failed to stop: ' + err.message);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <PageHeader
        section="Experiments"
        title="Chaos Experiments"
        action={
          <button onClick={() => setShowForm(!showForm)}
            className="py-2.5 px-5 rounded-2xl bg-white text-[#030303] text-sm font-medium btn-press magnetic-hover flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {showForm ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
            </svg>
            {showForm ? 'Close' : 'New Experiment'}
          </button>
        }
      />

      {showForm && (
        <div className="card-bezel animate-scale-in">
          <div className="card-bezel-inner">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-1">Create</p>
            <h2 className="text-lg font-medium text-white mb-6">New Experiment</h2>

            <form onSubmit={createExperiment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/30 font-medium block mb-2">Experiment Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Latency Test 1" className="input-premium" required />
                </div>
                <div>
                  <label className="text-xs text-white/30 font-medium block mb-2">Target Service</label>
                  <select value={form.targetService} onChange={e => setForm(prev => ({ ...prev, targetService: e.target.value }))} className="select-premium">
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/30 font-medium block mb-2">Failure Type</label>
                  <select value={form.failureType} onChange={e => updateParamsForType(e.target.value)} className="select-premium">
                    {SIMPLE_FAILURE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/30 font-medium block mb-2">Parameters</label>
                  <input type="text" value={form.parameters} onChange={e => setForm(prev => ({ ...prev, parameters: e.target.value }))}
                    placeholder="key:value,key:value" className="input-premium" />
                </div>
                <div>
                  <label className="text-xs text-white/30 font-medium block mb-2">Duration (seconds)</label>
                  <input type="number" value={form.durationSeconds} onChange={e => setForm(prev => ({ ...prev, durationSeconds: parseInt(e.target.value) || 0 }))}
                    className="input-premium" min="10" />
                </div>
                <div>
                  <label className="text-xs text-white/30 font-medium block mb-2">Traffic (RPS)</label>
                  <input type="number" value={form.trafficRps} onChange={e => setForm(prev => ({ ...prev, trafficRps: parseInt(e.target.value) || 0 }))}
                    className="input-premium" min="1" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4">
                <button type="submit" className="py-2.5 px-6 rounded-2xl bg-white text-[#030303] text-sm font-medium btn-press">Create & Run</button>
                <button type="button" onClick={() => setShowForm(false)} className="py-2.5 px-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white/60 text-sm font-medium btn-press hover:bg-white/[0.06]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3 stagger-children">
        {(!experiments || experiments.length === 0) ? (
          <div className="card-bezel">
            <div className="card-bezel-inner">
              <EmptyState
                icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15"><path d="M9 3v12l-3 3h12l-3-3V3"/><path d="M8 3h8"/></svg>}
                title="No experiments yet"
                subtitle="Create your first chaos experiment"
              />
            </div>
          </div>
        ) : (
          experiments.map((exp) => (
            <div key={exp.id} className="card-bezel magnetic-hover">
              <div className="card-bezel-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      exp.status === 'RUNNING' ? 'bg-emerald-500/[0.08]' : exp.status === 'COMPLETED' ? 'bg-white/[0.04]' : 'bg-white/[0.02]'
                    }`}>
                      {exp.status === 'RUNNING' ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)] animate-pulse-subtle" />
                      ) : exp.status === 'COMPLETED' ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{exp.name || exp.targetService}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/30">{exp.targetService}</span>
                        <span className="text-white/10">&middot;</span>
                        <span className="text-xs text-white/30">{exp.failureType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-[0.15em] font-medium px-2.5 py-1 rounded-full ${
                      exp.status === 'RUNNING' ? 'text-emerald-400 bg-emerald-500/[0.08]' : exp.status === 'COMPLETED' ? 'text-white/40 bg-white/[0.04]' : 'text-white/30 bg-white/[0.02]'
                    }`}>{exp.status}</span>
                    {exp.status === 'RUNNING' && (
                      <button onClick={() => stopExperiment(exp.id)}
                        className="py-1.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 text-xs font-medium btn-press hover:bg-white/[0.06]">Stop</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Experiments;
