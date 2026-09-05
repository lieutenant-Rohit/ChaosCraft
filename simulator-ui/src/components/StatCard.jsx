import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

export default function StatCard({ label, value, color = 'text-white', icon, delay = 0 }) {
  const animated = useAnimatedNumber(typeof value === 'number' ? value : 0);

  return (
    <div className="card-bezel magnetic-hover" style={{ animationDelay: `${delay}ms` }}>
      <div className="card-bezel-inner">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium">{label}</span>
          {icon}
        </div>
        <div className={`text-3xl font-semibold tracking-tight tabular-nums ${color}`}>
          {typeof value === 'number' ? animated : value ?? 0}
        </div>
      </div>
    </div>
  );
}
