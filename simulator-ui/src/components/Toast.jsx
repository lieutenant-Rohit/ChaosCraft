import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timeoutRef.current[id]);
    delete timeoutRef.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', durationMs = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    timeoutRef.current[id] = setTimeout(() => removeToast(id), durationMs);
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 6000),
    info: (msg) => addToast(msg, 'info'),
  };

  useEffect(() => {
    return () => {
      Object.values(timeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-slide-in-right px-4 py-3 rounded-2xl border text-sm font-medium shadow-2xl backdrop-blur-sm max-w-sm ${
              t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
              t.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
              'bg-white/[0.06] border-white/[0.08] text-white/70'
            }`}
            onClick={() => removeToast(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
