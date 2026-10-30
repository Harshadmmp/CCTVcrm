import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import Modal from './Modal';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  isSubmitting = false,
  zIndex = 'z-[99998]',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-6 h-6 text-rose-600" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-emerald-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      case 'warning':
      default:
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-50 border border-rose-200 text-rose-600';
      case 'success':
        return 'bg-emerald-50 border border-emerald-200 text-emerald-600';
      case 'info':
        return 'bg-blue-50 border border-blue-200 text-blue-600';
      case 'warning':
      default:
        return 'bg-amber-50 border border-amber-200 text-amber-600';
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20';
      case 'warning':
      default:
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex={zIndex}
      title={title}
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonClass()} disabled:opacity-50 cursor-pointer transition-all`}
          >
            {isSubmitting ? 'Processing...' : confirmText}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3.5 py-1">
        <div className={`p-3 rounded-xl flex-shrink-0 shadow-xs ${getIconBg()}`}>
          {getIcon()}
        </div>
        <div className="text-xs text-slate-600 space-y-1.5 flex-1 pt-0.5">
          <p className="leading-relaxed font-medium text-slate-700">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

