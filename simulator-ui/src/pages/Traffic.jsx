import { useState, useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import SuccessRateBar from '../components/SuccessRateBar';
import LatencyGrid from '../components/LatencyGrid';
import SectionHeader from '../components/SectionHeader';
import Spinner from '../components/Spinner';

function Traffic() {
  const toast = useToast();
  const [config, setConfig] = useState({ requestsPerSecond: 10, durationSeconds: 60, rampUpSeconds: 5 });
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);

  const fetchStats = useCallback(() => api.getTrafficStats(), []);
  const { data: stats, loading } = usePolling(fetchStats, 1000);

  const isRunning = stats?.running;
  const successRate = stats?.totalRequests > 0
    ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)
    : '0.0';

  async function startTraffic() {
    setStarting(true);
    try {
      await api.startTraffic(config);
      toast.success('Traffic started');
    } catch (err) {
      toast.error('Failed to start traffic: ' + err.message);
    } finally {
      setStarting(false);
    }
  }

  async function stopTraffic() {
    setStopping(true);
    try {
      await api.stopTraffic();
      toast.success('Traffic stopped');
    } catch (err) {
      toast.error('Failed to stop traffic: ' + err.message);
    } finally {
      setStopping(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <PageHeader section="Traffic" title="Traffic Generator" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-bezel animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="card-bezel-inner">
            <SectionHeader label="Control" title="Configuration" />

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/30 font-medium block mb-2">Requests per second</label>
                <input
                  type="number" value={config.requestsPerSecond}
                  onChange={e => setConfig(prev => ({ ...prev, requestsPerSecond: parseInt(e.target.value) || 0 }))}
                  className="input-premium" min="1" max="1000"
                />
              </div>
              <div>
                <label className="text-xs text-white/30 font-medium block mb-2">Duration (seconds)</label>
                <input
                  type="number" value={config.durationSeconds}
                  onChange={e => setConfig(prev => ({ ...prev, durationSeconds: parseInt(e.target.value) || 0 }))}
                  className="input-premium" min="10" max="3600"
                />
              </div>
              <div>
                <label className="text-xs text-white/30 font-medium block mb-2">Ramp up (seconds)</label>
                <input
                  type="number" value={config.rampUpSeconds}
                  onChange={e => setConfig(prev => ({ ...prev, rampUpSeconds: parseInt(e.target.value) || 0 }))}
                  className="input-premium" min="0" max="60"
                />
              </div>

              <div className="pt-4">
                {!isRunning ? (
                  <button onClick={startTraffic} disabled={starting}
                    className="w-full py-3 px-6 rounded-2xl bg-white text-[#030303] text-sm font-medium btn-press magnetic-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {starting && <div className="w-4 h-4 border-[1.5px] border-[#030303]/20 border-t-[#030303] rounded-full animate-spin" />}
                    {starting ? 'Starting...' : 'Start Traffic'}
                  </button>
                ) : (
                  <button onClick={stopTraffic} disabled={stopping}
                    className="w-full py-3 px-6 rounded-2xl bg-white/[0.06] border border-white/[0.08] text-white text-sm font-medium btn-press magnetic-hover hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {stopping && <div className="w-4 h-4 border-[1.5px] border-white/20 border-t-white/60 rounded-full animate-spin" />}
                    {stopping ? 'Stopping...' : 'Stop Traffic'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 card-bezel animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="card-bezel-inner">
            <div className="flex items-center justify-between mb-6">
              <SectionHeader label="Status" title="Live Statistics" />
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-white/20'}`} />
                <span className="text-xs text-white/40 font-medium">{isRunning ? 'Active' : 'Idle'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total', value: stats?.totalRequests || 0, color: 'text-white' },
                { label: 'Success', value: stats?.successfulRequests || 0, color: 'text-emerald-400/90' },
                { label: 'Failed', value: stats?.failedRequests || 0, color: 'text-red-400/90' },
                { label: 'RPS', value: stats?.requestsPerSecond || 0, color: 'text-white' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className={`text-2xl font-semibold tabular-nums mb-1 ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-white/25 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            {stats?.totalRequests > 0 && <SuccessRateBar rate={successRate} />}

            <div className="mt-4">
              <LatencyGrid
                compact
                p50={stats?.p50Latency || 0}
                p95={stats?.p95Latency || 0}
                p99={stats?.p99Latency || 0}
                avg={stats?.avgLatency || 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Traffic;
