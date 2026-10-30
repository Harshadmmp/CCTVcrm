import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-2xl',
  preventBackdropClose = false,
  zIndex = 'z-50',
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !preventBackdropClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, preventBackdropClose]);

  if (!isOpen) return null;

  // Map z-index into high-stacking range (above topbar z-30 and sidebar z-40)
  const effectiveZIndex = (() => {
    if (!zIndex || zIndex === 'z-50') return 'z-[99990]';
    if (zIndex === 'z-[60]') return 'z-[99992]';
    if (zIndex === 'z-[70]') return 'z-[99994]';
    if (zIndex === 'z-[80]') return 'z-[99996]';
    if (zIndex === 'z-[90]') return 'z-[99998]';
    return zIndex.includes('999') ? zIndex : 'z-[99999]';
  })();

  const modalContent = (
    <div
      className={`fixed inset-0 ${effectiveZIndex} flex items-start justify-center p-3 sm:p-4 pt-3 sm:pt-4 pb-4 overflow-y-auto bg-slate-950/90 backdrop-blur-2xl animate-fadeIn print:static print:inset-auto print:p-0 print:bg-white print:overflow-visible print:block`}
      style={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (!preventBackdropClose && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[calc(100vh-32px)] overflow-hidden animate-scaleUp print:static print:w-full print:max-w-none print:max-h-none print:overflow-visible print:border-none print:shadow-none print:rounded-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10 print:hidden">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4 text-slate-700 text-sm print:p-0 print:overflow-visible print:block print:space-y-0">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 z-10 print:hidden">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default Modal;

