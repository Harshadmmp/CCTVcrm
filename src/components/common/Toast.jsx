import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
        let border = 'border-emerald-200';
        let bg = 'bg-white';

        if (toast.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
          border = 'border-rose-200';
        } else if (toast.type === 'warning') {
          icon = <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
          border = 'border-amber-200';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
          border = 'border-blue-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${border} ${bg} shadow-lg shadow-slate-200/50 transition-all duration-300 transform translate-y-0`}
            role="alert"
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;

