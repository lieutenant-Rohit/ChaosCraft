import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

function getLatencyColor(ms) {
  if (ms <= 50) return 'text-emerald-400';
  if (ms <= 200) return 'text-amber-400';
  return 'text-red-400';
}

function LatencyItem({ label, value }) {
  const animated = useAnimatedNumber(value);
  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
      <div className={`text-2xl font-semibold tabular-nums mb-1 ${getLatencyColor(value)}`}>{animated}</div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-white/25 font-medium">{label}</div>
      <div className="text-[10px] text-white/15 mt-1">ms</div>
    </div>
  );
}

export default function LatencyGrid({ p50 = 0, p95 = 0, p99 = 0, avg = 0, compact = false }) {
  const metrics = [
    { label: 'P50', value: p50 },
    { label: 'P95', value: p95 },
    { label: 'P99', value: p99 },
    { label: 'AVG', value: avg },
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-center">
            <div className={`text-lg font-semibold text-white tabular-nums mb-0.5 ${getLatencyColor(m.value)}`}>{m.value}</div>
            <div className="text-[9px] uppercase tracking-[0.15em] text-white/20 font-medium">{m.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <LatencyItem key={m.label} label={m.label} value={m.value} />
      ))}
    </div>
  );
}
