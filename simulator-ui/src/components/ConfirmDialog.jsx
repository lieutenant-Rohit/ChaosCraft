import { useState } from 'react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div className="card-bezel max-w-sm w-full mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="card-bezel-inner">
          <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
          <p className="text-sm text-white/40 mb-6">{message}</p>
          <div className="flex items-center gap-3 justify-end">
            <button onClick={onCancel} className="py-2 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/50 text-sm font-medium btn-press hover:bg-white/[0.06]">
              Cancel
            </button>
            <button onClick={onConfirm} className="py-2 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium btn-press hover:bg-red-500/20">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = (title, message) => new Promise((resolve) => {
    setConfirmState({ title, message, resolve });
  });

  const ConfirmComponent = confirmState ? (
    <ConfirmDialog
      title={confirmState.title}
      message={confirmState.message}
      onConfirm={() => { confirmState.resolve(true); setConfirmState(null); }}
      onCancel={() => { confirmState.resolve(false); setConfirmState(null); }}
    />
  ) : null;

  return { confirm, ConfirmComponent };
}
