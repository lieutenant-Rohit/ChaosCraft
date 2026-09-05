export default function SectionHeader({ label, title, count }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-1">{label}</p>
        <h2 className="text-lg font-medium text-white">{title}</h2>
      </div>
      {count != null && count > 0 && (
        <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/[0.04] text-white/40">
          {count}
        </span>
      )}
    </div>
  );
}
