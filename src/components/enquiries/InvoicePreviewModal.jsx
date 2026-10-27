import React from 'react';
import { Printer, CheckCircle2, Send, AlertCircle, FileText } from 'lucide-react';
import Modal from '../common/Modal';
import { formatINR, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const InvoicePreviewModal = ({ isOpen, onClose, invoice }) => {
  const { reviewInvoice, sendInvoice, invoices } = useApp();

  // Keep live status in sync with application state if invoice already exists
  const liveInvoice = invoices.find((i) => i.id === invoice?.id) || invoice;

  if (!liveInvoice) return null;

  const isReviewed = liveInvoice.status === 'Reviewed' || liveInvoice.status === 'Sent';
  const isSent = liveInvoice.status === 'Sent';
  const isDraftOnly = liveInvoice.id === 'INV-DRAFT';

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsReviewed = () => {
    if (isDraftOnly) {
      alert('Please save the invoice draft first before marking as reviewed.');
      return;
    }
    reviewInvoice(liveInvoice.id);
  };

  const handleSendInvoice = () => {
    if (!isReviewed) return;
    sendInvoice(liveInvoice.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[70]"
      title={`Tax Invoice • ${liveInvoice.id}`}
      subtitle={`Customer: ${liveInvoice.customerName} • Status: ${liveInvoice.status}`}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            {!isReviewed && !isDraftOnly && (
              <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Office Review Required before sending to customer.
              </span>
            )}
            {isSent && (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Invoice sent on {liveInvoice.sentAt || 'record'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            {!isReviewed && !isDraftOnly && (
              <button
                type="button"
                onClick={handleMarkAsReviewed}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark as Reviewed
              </button>
            )}

            {!isSent && !isDraftOnly && (
              <button
                type="button"
                onClick={handleSendInvoice}
                disabled={!isReviewed}
                title={!isReviewed ? 'Review required before sending' : 'Send invoice to customer'}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors ${
                  !isReviewed
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Send Invoice
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Printable Invoice Sheet */}
        <div className="printable-document bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs text-slate-800">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  SV
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  SecureEye CCTV Solutions Pvt. Ltd.
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Plot 104, Institutional Area, Sector 32, Gurugram, Haryana 122001
              </p>
              <p className="text-xs text-slate-500">
                Email: billing@securevision.in | Phone: +91 124 456 7890
              </p>
              <p className="text-xs font-mono text-slate-600 mt-0.5 font-medium">
                GSTIN: 07AABCS1429B1Z8
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-violet-100 text-violet-800 rounded">
                Tax Invoice
              </span>
              <p className="text-sm font-bold text-slate-900 mt-2">
                {liveInvoice.id}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Invoice Date: <span className="font-medium text-slate-700">{formatDate(liveInvoice.invoiceDate)}</span>
              </p>
              <p className="text-xs text-slate-500">
                Due Date: <span className="font-medium text-slate-700">{formatDate(liveInvoice.dueDate)}</span>
              </p>
              <p className="text-xs text-slate-500">
                Order Ref: <span className="font-medium text-slate-700">{liveInvoice.orderId}</span>
              </p>
            </div>
          </div>

          {/* Billed to */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <h5 className="font-bold text-slate-500 uppercase tracking-wider mb-1">
                Billed To:
              </h5>
              <p className="text-sm font-semibold text-slate-900">{liveInvoice.customerName}</p>
              <p className="text-slate-600 mt-0.5">{liveInvoice.customerPhone}</p>
              <p className="text-slate-600 leading-relaxed mt-0.5">{liveInvoice.siteAddress}</p>
            </div>
            <div>
              <h5 className="font-bold text-slate-500 uppercase tracking-wider mb-1">
                Installation & Commissioning Site:
              </h5>
              <p className="text-slate-700 leading-relaxed">{liveInvoice.siteAddress}</p>
              {liveInvoice.reviewedAt && (
                <p className="text-[11px] text-violet-700 mt-2 font-medium">
                  Office Reviewed on: {liveInvoice.reviewedAt}
                </p>
              )}
            </div>
          </div>

          {/* Item Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Description of Work / Hardware</th>
                  <th className="py-2.5 px-3 text-center w-16">Qty</th>
                  <th className="py-2.5 px-3 text-right w-28">Unit Price</th>
                  <th className="py-2.5 px-3 text-right w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveInvoice.items?.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                    <td className="py-2.5 px-3 text-center text-slate-700">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{formatINR(item.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      {formatINR(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-600 max-w-sm">
              <h5 className="font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank & Payment Details
              </h5>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Bank: HDFC Bank Ltd.<br />
                Account Name: SecureEye CCTV Solutions Pvt. Ltd.<br />
                Account No: 50200067891234<br />
                IFSC: HDFC0001234<br />
                UPI ID: securevision@hdfcbank
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">{formatINR(liveInvoice.subtotal)}</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                  <p className="text-[10px] text-slate-500">(Includes applicable taxes)</p>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {formatINR(liveInvoice.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-medium text-slate-700">Payment terms: Strictly 15 days from invoice date.</p>
              <p className="text-[11px]">This is a computer-generated tax invoice.</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">For SecureEye CCTV Solutions Pvt. Ltd.</p>
              <div className="h-10"></div>
              <p className="border-t border-slate-300 pt-1 text-[11px]">Accounts Department</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InvoicePreviewModal;

