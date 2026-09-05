import { useState, useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';
import { SEVERITY_COLORS } from '../constants';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

function Incidents() {
  const fetchIncidents = useCallback(() => api.getIncidents(), []);
  const { data: incidents, loading } = usePolling(fetchIncidents, 5000);
  const [selectedId, setSelectedId] = useState(null);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <PageHeader section="Incidents" title="Incident Reports" />

      <div className="space-y-3 stagger-children">
        {(!incidents || incidents.length === 0) ? (
          <div className="card-bezel">
            <div className="card-bezel-inner">
              <EmptyState
                icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                title="No incidents"
                subtitle="Run an experiment to generate incidents"
              />
            </div>
          </div>
        ) : (
          incidents.map((incident) => {
            const sev = SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.MEDIUM;
            const isSelected = selectedId === incident.id;

            return (
              <div key={incident.id} className="card-bezel magnetic-hover cursor-pointer"
                role="button" tabIndex={0}
                onClick={() => setSelectedId(isSelected ? null : incident.id)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(isSelected ? null : incident.id); } }}>
                <div className="card-bezel-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${sev.bg}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={sev.text}>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{incident.title || incident.failureType}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-white/30">{incident.targetService}</span>
                          <span className="text-white/10">&middot;</span>
                          <span className="text-xs text-white/30">{incident.failureType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] uppercase tracking-[0.15em] font-medium px-2.5 py-1 rounded-full ${sev.bg} ${sev.text}`}>
                        {incident.severity}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                        className={`text-white/20 transition-transform duration-200 ${isSelected ? 'rotate-180' : ''}`}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-6 pt-6 border-t border-white/[0.04] animate-fade-in">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {[
                          { label: 'Error Rate', value: `${incident.errorRate || 0}%` },
                          { label: 'Avg Latency', value: `${incident.avgLatency || 0}ms` },
                          { label: 'Requests', value: incident.totalRequests || 0 },
                          { label: 'Duration', value: incident.duration || '0s' },
                        ].map(m => (
                          <div key={m.label} className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                            <div className="text-xs text-white/30 mb-1">{m.label}</div>
                            <div className="text-lg font-semibold text-white tabular-nums">{m.value}</div>
                          </div>
                        ))}
                      </div>

                      {incident.rootCause && (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-2">Root Cause</div>
                          <p className="text-sm text-white/60 leading-relaxed">{incident.rootCause}</p>
                        </div>
                      )}

                      {incident.recommendations?.length > 0 && (
                        <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-3">Recommendations</div>
                          <div className="space-y-2">
                            {incident.recommendations.map((rec, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-white/20 mt-2 flex-shrink-0" />
                                <span className="text-sm text-white/50">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Incidents;
