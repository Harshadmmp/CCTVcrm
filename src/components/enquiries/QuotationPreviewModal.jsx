import React, { useState } from 'react';
import {
  Printer,
  Share2,
  CheckCircle,
  ArrowLeft,
  FileCheck2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Modal from '../common/Modal';
import { formatINR, formatDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const QuotationPreviewModal = ({
  isOpen,
  onClose,
  quotation,
  onBackToEdit,
  onOpenCustomerDecision,
}) => {
  const { addToast } = useApp();
  const [showWhatsAppNotice, setShowWhatsAppNotice] = useState(false);

  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    // Generate clean message summary for WhatsApp
    const message = `Hello ${quotation.customerName}, here is your CCTV Installation Quotation (${quotation.id}) from SecureEye CCTV Solutions.\nTotal: ${formatINR(quotation.grandTotal)} (Inclusive of applicable taxes).\nValid until: ${formatDate(quotation.validUntil)}.\nPlease reply with your approval to proceed with order confirmation.`;
    const cleanPhone = quotation.customerPhone ? quotation.customerPhone.replace(/\D/g, '') : '';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    // Open WhatsApp link in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setShowWhatsAppNotice(true);
    addToast(
      'WhatsApp Action Triggered',
      'Opened WhatsApp dispatch link. Note: Customer approval must still be recorded explicitly in the workbench.',
      'info'
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[70]"
      title={`Quotation Preview • ${quotation.id || 'Draft'}`}
      subtitle={`Customer: ${quotation.customerName} • Status: ${quotation.status || 'Draft'}`}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div>
            {onBackToEdit && (
              <button
                type="button"
                onClick={onBackToEdit}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Edit
              </button>
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
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Send via WhatsApp
            </button>
            {onOpenCustomerDecision && (
              <button
                type="button"
                onClick={() => {
                  onOpenCustomerDecision(quotation);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                Record Customer Decision
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Compliance Warning Notice banner */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Business Workflow Rule:</span> Viewing or sending this quotation does not count as customer approval. An explicit customer decision must be recorded using the "Record Customer Decision" button.
          </div>
        </div>

        {/* Printable Quotation Sheet */}
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
                Email: quotes@securevision.in | Phone: +91 124 456 7890
              </p>
              <p className="text-xs font-mono text-slate-600 mt-0.5 font-medium">
                GSTIN: 07AABCS1429B1Z8
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 rounded">
                Formal Quotation
              </span>
              <p className="text-sm font-bold text-slate-900 mt-2">
                {quotation.id || 'QT-DRAFT'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Date: <span className="font-medium text-slate-700">{formatDate(quotation.date)}</span>
              </p>
              <p className="text-xs text-slate-500">
                Valid Until: <span className="font-medium text-slate-700">{formatDate(quotation.validUntil)}</span>
              </p>
            </div>
          </div>

          {/* Customer & Site Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <h5 className="font-bold text-slate-500 uppercase tracking-wider mb-1">
                Quotation For:
              </h5>
              <p className="text-sm font-semibold text-slate-900">{quotation.customerName}</p>
              <p className="text-slate-600 mt-0.5">{quotation.customerPhone}</p>
              <p className="text-slate-600">{quotation.enquiryId && `Enquiry Ref: ${quotation.enquiryId}`}</p>
            </div>
            <div>
              <h5 className="font-bold text-slate-500 uppercase tracking-wider mb-1">
                Installation Location:
              </h5>
              <p className="text-slate-700 leading-relaxed">{quotation.siteAddress}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Description of Goods & Services</th>
                  <th className="py-2.5 px-3 w-24">HSN/SAC</th>
                  <th className="py-2.5 px-3 text-center w-16">Qty</th>
                  <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
                  <th className="py-2.5 px-3 text-center w-16">GST %</th>
                  <th className="py-2.5 px-3 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotation.items?.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {item.name}
                      {item.category && (
                        <span className="block text-[11px] text-slate-500 font-normal">
                          Category: {item.category}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 font-medium">
                      {item.hsnSac || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{formatINR(item.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-center text-[11px] font-semibold text-slate-700">
                      {item.gstRate ?? 18}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      {formatINR(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-600 max-w-sm">
              <h5 className="font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Terms & Conditions
              </h5>
              <p className="whitespace-pre-line text-[11px] leading-relaxed text-slate-500">
                {quotation.terms}
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-900">{formatINR(quotation.subtotal)}</span>
              </div>
              {Boolean(quotation.discount) && (
                <div className="flex justify-between text-emerald-600">
                  <span>Special Discount:</span>
                  <span className="font-medium">- {formatINR(quotation.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                  <p className="text-[10px] text-slate-500">(Includes applicable GST)</p>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {formatINR(quotation.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Authorised Signatory */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div>
              <p className="font-medium text-slate-700">Thank you for your business!</p>
              <p className="text-[11px]">For inquiries call: +91 98112 34567</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">For SecureEye CCTV Solutions Pvt. Ltd.</p>
              <div className="h-10"></div>
              <p className="border-t border-slate-300 pt-1 text-[11px]">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuotationPreviewModal;

