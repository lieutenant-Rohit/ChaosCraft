import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

function getRateColor(rate) {
  const r = parseFloat(rate);
  if (r >= 90) return 'bg-emerald-400 text-emerald-400';
  if (r >= 70) return 'bg-amber-400 text-amber-400';
  return 'bg-red-400 text-red-400';
}

export default function SuccessRateBar({ rate, showLabel = true }) {
  const colorClass = getRateColor(rate);

  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
      {showLabel && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/30 font-medium">Success Rate</span>
          <span className={`text-sm font-medium tabular-nums ${colorClass.split(' ')[1]}`}>
            {rate}%
          </span>
        </div>
      )}
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-premium ${colorClass.split(' ')[0]}`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}
