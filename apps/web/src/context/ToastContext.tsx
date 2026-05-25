import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const typeStyles = {
  success: {
    background: 'rgba(0, 195, 201, 0.15)',
    border: '1px solid rgba(0, 195, 201, 0.3)',
    color: 'rgb(0, 195, 201)',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: 'rgb(239, 68, 68)',
  },
  info: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: 'var(--color-text-primary)',
  },
};

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--space-4)',
      right: 'var(--space-4)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => {
        const style = typeStyles[toast.type] || typeStyles.info;
        return (
          <div
            key={toast.id}
            onClick={() => onRemove(toast.id)}
            style={{
              ...style,
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'toastSlideIn 0.25s ease-out',
              maxWidth: '360px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            {toast.message}
          </div>
        );
      })}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
