import { createContext, useContext, useCallback, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, type = 'info', duration = 4000) => {
      if (!message) return null;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  const toast = {
    success: (m, d) => push(m, 'success', d),
    error: (m, d) => push(m, 'error', d ?? 5500),
    warning: (m, d) => push(m, 'warning', d),
    info: (m, d) => push(m, 'info', d),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map(({ id, message, type }) => {
          const Icon = ICONS[type] || Info;
          return (
            <div key={id} className={`toast-item is-${type}`}>
              <Icon size={18} className="flex-shrink-0 mt-1" />
              <span className="flex-grow-1">{message}</span>
              <button
                type="button"
                className="btn btn-sm border-0 p-0 text-muted flex-shrink-0"
                onClick={() => dismiss(id)}
                aria-label="Đóng thông báo"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
