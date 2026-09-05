export default function PageHeader({ section, title, action }) {
  return (
    <div className={`flex items-end justify-between animate-fade-in-up ${action ? '' : ''}`}>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-3">{section}</p>
        <h1 className="text-4xl font-semibold tracking-tight gradient-text">{title}</h1>
      </div>
      {action}
    </div>
  );
}
