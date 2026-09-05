export default function Spinner({ size = 8 }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className={`w-${size} h-${size} border-[1.5px] border-white/10 border-t-white/60 rounded-full animate-spin`} />
    </div>
  );
}
