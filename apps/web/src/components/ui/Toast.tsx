import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const borderColors = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  info: 'var(--color-info)',
};

function ToastItem({ toast, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 4000;
  const Icon = icons[toast.type] || icons.info;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [toast.id, duration, onDismiss]);

  return (
    <div
      style={{
        width: '320px',
        background: 'var(--color-bg-overlay)',
        borderLeft: `3px solid ${borderColors[toast.type] || borderColors.info}`,
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-3) var(--space-4)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        animation: 'toastIn var(--duration-normal) var(--ease-spring)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Icon size={18} style={{ color: borderColors[toast.type], flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              marginBottom: 'var(--space-1)',
            }}
          >
            {toast.title}
          </div>
        )}
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {toast.message}
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          padding: '2px',
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2px',
          width: `${progress}%`,
          background: borderColors[toast.type] || borderColors.info,
          transition: 'width 50ms linear',
        }}
      />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, dismissToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 'var(--space-6)',
          right: 'var(--space-6)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 'var(--space-3)',
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastItem;
