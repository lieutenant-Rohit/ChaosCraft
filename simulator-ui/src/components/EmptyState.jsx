export default function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white/60 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-white/25">{subtitle}</p>}
    </div>
  );
}
