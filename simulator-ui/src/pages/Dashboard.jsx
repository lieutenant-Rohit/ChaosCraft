import { useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import SuccessRateBar from '../components/SuccessRateBar';
import LatencyGrid from '../components/LatencyGrid';
import SectionHeader from '../components/SectionHeader';
import Spinner from '../components/Spinner';

function Dashboard() {
  const fetchDashboard = useCallback(() => api.getDashboard(), []);
  const { data: dashboard, loading, error } = usePolling(fetchDashboard, 3000);

  if (loading) return <Spinner />;
  if (error && !dashboard) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="card-bezel max-w-sm w-full">
          <div className="card-bezel-inner text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="text-sm font-medium text-white/80 mb-1">Connection Error</h3>
            <p className="text-xs text-white/30">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Experiments', value: dashboard?.totalExperiments ?? 0, color: 'text-white' },
    { label: 'Running', value: dashboard?.runningExperiments ?? 0, color: 'text-emerald-400',
      icon: dashboard?.runningExperiments > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" /> },
    { label: 'Completed', value: dashboard?.completedExperiments ?? 0, color: 'text-white' },
    { label: 'Active Failures', value: Object.keys(dashboard?.activeFailures || {}).length,
      color: Object.keys(dashboard?.activeFailures || {}).length > 0 ? 'text-red-400' : 'text-white',
      icon: Object.keys(dashboard?.activeFailures || {}).length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]" /> },
  ];

  const trafficStats = dashboard?.trafficStats || {};
  const successRate = trafficStats.totalRequests > 0
    ? ((trafficStats.successfulRequests / trafficStats.totalRequests) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <PageHeader section="Dashboard" title="System Overview" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} color={stat.color} icon={stat.icon} delay={i * 50} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-bezel animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="card-bezel-inner">
            <div className="flex items-center justify-between mb-6">
              <SectionHeader label="Traffic" title="Live Metrics" />
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${trafficStats.running ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-white/20'}`} />
                <span className="text-xs text-white/40 font-medium">{trafficStats.running ? 'Live' : 'Idle'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-2xl font-semibold text-white mb-1 tabular-nums">{trafficStats.totalRequests || 0}</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/25 font-medium">Total</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-2xl font-semibold text-emerald-400/90 mb-1 tabular-nums">{trafficStats.successfulRequests || 0}</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/25 font-medium">Success</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-2xl font-semibold text-red-400/90 mb-1 tabular-nums">{trafficStats.failedRequests || 0}</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/25 font-medium">Failed</div>
              </div>
            </div>

            {trafficStats.totalRequests > 0 && (
              <div className="mt-6">
                <SuccessRateBar rate={successRate} />
              </div>
            )}
          </div>
        </div>

        <div className="card-bezel animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="card-bezel-inner">
            <SectionHeader label="Status" title="Active Failures" count={Object.keys(dashboard?.activeFailures || {}).length} />

            {Object.keys(dashboard?.activeFailures || {}).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-sm text-white/30">No active failures</p>
                <p className="text-xs text-white/15 mt-1">System nominal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(dashboard.activeFailures).map(([key, failure]) => (
                  <div key={key} className="p-4 rounded-2xl bg-red-500/[0.04] border border-red-500/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-500/[0.08] flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400/80">
                          <path d="M12 9v4"/>
                          <path d="M12 17h.01"/>
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">{failure.targetService}</div>
                        <div className="text-xs text-red-400/70">{failure.failureType}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {trafficStats.totalRequests > 0 && (
        <div className="card-bezel animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="card-bezel-inner">
            <SectionHeader label="Performance" title="Latency Distribution" />
            <LatencyGrid
              p50={trafficStats.p50Latency || 0}
              p95={trafficStats.p95Latency || 0}
              p99={trafficStats.p99Latency || 0}
              avg={trafficStats.avgLatency || 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
