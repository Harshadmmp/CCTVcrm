import React, { useState } from 'react';
import {
  Printer,
  Share2,
  CheckCircle,
  ArrowLeft,
  PackageCheck,
} from 'lucide-react';
import Modal from '../common/Modal';
import { formatINR, formatDate, numberToWords } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { printDocument } from '../../utils/printDocument';

export const QuotationPreviewModal = ({
  isOpen,
  onClose,
  quotation,
  onBackToEdit,
  onOpenCustomerDecision,
  onOpenCreateOrder,
}) => {
  const { addToast, adminSettings, products = [], enquiries = [], quotations = [] } = useApp();
  const [showWhatsAppNotice, setShowWhatsAppNotice] = useState(false);

  // Keep live status in sync with application state if quotation already exists
  const liveQuotation = (quotations || []).find((q) => q.id === quotation?.id) || quotation;

  const matchingEnquiry = (enquiries || []).find(
    (e) => (liveQuotation?.enquiryId && e.id === liveQuotation.enquiryId) ||
           (liveQuotation?.id && e.quotationId === liveQuotation.id)
  );

  const displayCustomerName =
    (matchingEnquiry?.customerName && liveQuotation?.customerName === 'Green Valley Residential Society')
      ? matchingEnquiry.customerName
      : liveQuotation?.customerName || matchingEnquiry?.customerName || 'Customer';

  const displayCustomerPhone =
    (matchingEnquiry?.phone && liveQuotation?.customerName === 'Green Valley Residential Society')
      ? matchingEnquiry.phone
      : liveQuotation?.customerPhone || matchingEnquiry?.phone || '';

  const displaySiteAddress =
    (matchingEnquiry?.siteAddress && liveQuotation?.customerName === 'Green Valley Residential Society')
      ? matchingEnquiry.siteAddress
      : liveQuotation?.siteAddress || matchingEnquiry?.siteAddress || '';

  const getEffectiveHsn = (it) => {
    if (it?.hsnSac && it.hsnSac !== '-' && it.hsnSac !== '—') return String(it.hsnSac);
    const match = products.find(
      (p) => p.id === it?.productId || p.name?.toLowerCase().trim() === it?.name?.toLowerCase().trim()
    );
    if (match?.hsnSac) return String(match.hsnSac);
    const cat = it?.category || match?.category;
    if (cat === 'Installation & Services') return '995469';
    if (cat === 'Cameras') return '85258900';
    if (cat === 'DVR / NVR') return '85219090';
    if (cat === 'Storage & Cables') return '84717020';
    if (cat === 'Power & Accessories') return '85044090';
    return '85258900';
  };

  if (!liveQuotation) return null;

  const totalQuantity = (liveQuotation.items || []).reduce(
    (sum, it) => sum + (Number(it.quantity) || 0),
    0
  );

  const handlePrint = () => {
    printDocument('.printable-document', `Estimate_${liveQuotation.id || 'Draft'}`);
  };

  const handleWhatsAppShare = () => {
    const rawPhone = displayCustomerPhone ? displayCustomerPhone.replace(/\D/g, '') : '';
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const isDraft = !liveQuotation.id || liveQuotation.id === 'QT-DRAFT';
    const viewUrl = isDraft ? window.location.href : `${window.location.origin}/view-quotation/${liveQuotation.id}`;
    const companyName = adminSettings?.companyName || 'AP SECURITY SYSTEM';
    const message = `Hello ${displayCustomerName},\n\nHere is your CCTV Installation Estimate (${liveQuotation.id || 'Draft'}) from ${companyName}.\nTotal Amount: ${formatINR(liveQuotation.grandTotal)} (Inclusive of applicable taxes).\nValid until: ${formatDate(liveQuotation.validUntil || liveQuotation.quotationDate)}.\n\n📄 View & Download your Estimate PDF here:\n${viewUrl}\n\nPlease reply with your approval to proceed.\nThank you!`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setShowWhatsAppNotice(true);
    if (addToast) {
      addToast(
        'WhatsApp Action Triggered',
        'Opened WhatsApp dispatch link for estimate.',
        'info'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[70]"
      title={`Formal Estimate / Quotation • ${liveQuotation.id || 'Draft'}`}
      subtitle={`Customer: ${displayCustomerName} • Status: ${liveQuotation.status || 'Draft'}`}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            {onBackToEdit && (
              <button
                type="button"
                onClick={onBackToEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Edit
              </button>
            )}
            {showWhatsAppNotice && (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-medium">
                Estimate dispatch link opened!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Send via WhatsApp
            </button>

            {onOpenCustomerDecision && liveQuotation.status !== 'Approved' && (
              <button
                type="button"
                onClick={() => onOpenCustomerDecision(liveQuotation)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Customer Decision
              </button>
            )}

            {onOpenCreateOrder && liveQuotation.status === 'Approved' && !liveQuotation.isOrderCreated && (
              <button
                type="button"
                onClick={() => onOpenCreateOrder(liveQuotation)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                Convert to Order
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 print:space-y-0">
        {/* Printable Estimate Sheet matching exact photo layout */}
        <div className="printable-document bg-white border border-slate-400 p-6 sm:p-8 text-slate-900 shadow-xs print:p-4 print:border print:border-slate-400 print:shadow-none print:w-full print:max-w-none">
          {/* Top Title: Estimate */}
          <h1 className="text-xl font-bold tracking-wider text-center uppercase text-slate-800 mb-2">
            Estimate
          </h1>

          {/* Company Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-md flex items-center justify-center font-black text-sm tracking-wider flex-shrink-0 shadow-xs">
                CCTV
              </div>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 tracking-tight">
                {adminSettings?.companyName || 'AP SECURITY SYSTEM'}
              </h2>
              <p className="text-[11px] text-slate-700 max-w-md sm:ml-auto leading-tight">
                {adminSettings?.companyAddress ||
                  'Co/off- C.S. No 8265/4 KORE CLASSIC FRONT JAI HIND COLONY FRONT OF DR SAKEKAR VISHRAMBAG, SANGLI 416415'}
              </p>
              <p className="text-[11px] text-slate-700">
                Phone no.: <span className="font-semibold text-slate-900">{adminSettings?.companyPhone || '7410108728'}</span> | Email:{' '}
                <span className="font-semibold text-slate-900">{adminSettings?.companyEmail || 'akpatil7788@gmail.com'}</span>
              </p>
              <p className="text-[11px] text-slate-800 font-bold">
                GSTIN: <span className="font-mono">{adminSettings?.gstin || '27EUDPP0562H1ZJ'}</span> | State:{' '}
                <span className="font-semibold">27-Maharashtra</span>
              </p>
            </div>
          </div>

          {/* Two Shaded Blocks (Estimate For & Estimate Details) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-slate-400 mt-2 text-xs">
            {/* Left: Estimate For */}
            <div className="border-b sm:border-b-0 sm:border-r border-slate-400">
              <div className="bg-[#b9cde5] text-slate-900 font-bold px-3 py-1 border-b border-slate-400 tracking-wide text-xs">
                Estimate For
              </div>
              <div className="p-2.5 space-y-1">
                <p className="font-bold text-sm text-slate-900">{displayCustomerName}</p>
                {displayCustomerPhone && (
                  <p className="text-slate-700">
                    Phone: <span className="font-medium text-slate-900">{displayCustomerPhone}</span>
                  </p>
                )}
                {displaySiteAddress && (
                  <p className="text-slate-700 leading-snug">{displaySiteAddress}</p>
                )}
              </div>
            </div>

            {/* Right: Estimate Details */}
            <div>
              <div className="bg-[#b9cde5] text-slate-900 font-bold px-3 py-1 border-b border-slate-400 tracking-wide text-xs">
                Estimate Details
              </div>
              <div className="p-2.5 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Estimate No.:</span>
                  <span className="font-bold text-slate-900">{quotation.id || 'QT-DRAFT'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Date:</span>
                  <span className="font-bold text-slate-900">{formatDate(quotation.date)}</span>
                </div>
                {quotation.validUntil && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Valid Until:</span>
                    <span className="font-bold text-slate-900">{formatDate(quotation.validUntil)}</span>
                  </div>
                )}
                {quotation.enquiryId && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Enquiry Ref:</span>
                    <span className="font-mono">{quotation.enquiryId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Classic Itemized Table */}
          <div className="border border-slate-400 mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#b9cde5] text-slate-900 font-bold border-b border-slate-400">
                  <th className="py-2 px-2.5 w-10 text-center border-r border-slate-400">#</th>
                  <th className="py-2 px-3 border-r border-slate-400">Item name</th>
                  <th className="py-2 px-2.5 w-28 text-center border-r border-slate-400">HSN/ SAC</th>
                  <th className="py-2 px-2.5 w-20 text-center border-r border-slate-400">Quantity</th>
                  <th className="py-2 px-3 w-28 text-right border-r border-slate-400">Price/ unit</th>
                  <th className="py-2 px-3 w-32 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items?.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-slate-300 hover:bg-slate-50/50">
                    <td className="py-1.5 px-2.5 text-center text-slate-700 border-r border-slate-300">{idx + 1}</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-900 border-r border-slate-300">{item.name}</td>
                    <td className="py-1.5 px-2.5 text-center font-mono text-[11px] text-slate-800 border-r border-slate-300 font-medium">
                      {getEffectiveHsn(item)}
                    </td>
                    <td className="py-1.5 px-2.5 text-center font-medium text-slate-800 border-r border-slate-300">
                      {item.quantity}
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-800 border-r border-slate-300">
                      {formatINR(item.unitPrice)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                      {formatINR(item.lineTotal)}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-slate-50/90 font-bold text-slate-900 border-t border-slate-400">
                  <td className="py-2 px-2.5 text-center border-r border-slate-400 font-bold" colSpan={3}>
                    Total
                  </td>
                  <td className="py-2 px-2.5 text-center border-r border-slate-400 font-bold">
                    {totalQuantity}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-400"></td>
                  <td className="py-2 px-3 text-right font-black text-slate-900">
                    {formatINR(quotation.grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amounts Box */}
          <div className="w-full sm:w-72 ml-auto border border-slate-400 mt-2 text-xs">
            <div className="bg-[#b9cde5] text-slate-900 font-bold px-3 py-1 border-b border-slate-400">
              Amounts
            </div>
            <div className="p-2.5 space-y-1.5">
              <div className="flex justify-between text-slate-700">
                <span>Sub Total:</span>
                <span className="font-semibold text-slate-900">{formatINR(quotation.subtotal)}</span>
              </div>
              {Boolean(quotation.discount) && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Discount:</span>
                  <span className="font-semibold">- {formatINR(quotation.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-300">
                <span>Total:</span>
                <span className="text-blue-900 font-black">{formatINR(quotation.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Amount In Words */}
          <div className="border border-slate-400 mt-2 text-xs">
            <div className="bg-[#b9cde5] text-slate-900 font-bold px-3 py-1 border-b border-slate-400">
              Estimate Amount In Words
            </div>
            <div className="p-2.5 font-bold text-slate-900 tracking-wide text-xs">
              {numberToWords(quotation.grandTotal)}
            </div>
          </div>

          {/* Bottom 3 Blocks: Bank Details, Terms, and Authorized Signatory */}
          <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 border border-slate-400 mt-2 text-xs">
            {/* Block 1: Bank Details with UPI QR */}
            <div className="border-b sm:border-b-0 sm:border-r print:border-b-0 print:border-r border-slate-400">
              <div className="bg-[#b9cde5] text-slate-900 font-bold px-3 py-1 border-b border-slate-400">
                Bank Details
              </div>
              <div className="p-2.5 flex items-start gap-2.5">
                <div className="w-20 h-20 bg-white border border-slate-300 p-1 rounded flex flex-col items-center justify-center flex-shrink-0 shadow-2xs">
                  <svg viewBox="0 0 100 100" className="w-14 h-14 text-slate-900">
                    <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                    <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                    <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                    <rect x="35" y="10" width="10" height="10" fill="currentColor" />
                    <rect x="50" y="15" width="15" height="10" fill="currentColor" />
                    <rect x="35" y="35" width="30" height="30" fill="currentColor" />
                    <rect x="40" y="40" width="20" height="20" fill="white" />
                    <rect x="45" y="45" width="10" height="10" fill="currentColor" />
                    <rect x="10" y="45" width="15" height="10" fill="currentColor" />
                    <rect x="75" y="45" width="15" height="15" fill="currentColor" />
                    <rect x="40" y="75" width="20" height="10" fill="currentColor" />
                    <rect x="70" y="70" width="10" height="20" fill="currentColor" />
                    <rect x="85" y="85" width="10" height="10" fill="currentColor" />
                  </svg>
                  <span className="text-[7.5px] font-black tracking-tighter text-blue-700 mt-0.5">UPI SCAN & PAY</span>
                </div>
                <div className="text-[10px] space-y-0.5 text-slate-800 leading-snug">
                  <p>
                    <span className="text-slate-500">Name:</span> <strong className="text-slate-900">YES BANK, VISHRAM BAUG, SANGLI</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Account No.:</span> <strong className="font-mono text-slate-900">112761900000855</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">IFSC code:</span> <strong className="font-mono text-slate-900">YESB0001127</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Account holder&apos;s name:</span>{' '}
                    <strong className="text-slate-900">{adminSettings?.companyName || 'AP SECURITY SYSTEM'}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Block 2: Terms and Conditions in One Line */}
            <div className="border-b sm:border-b-0 sm:border-r print:border-b-0 print:border-r border-slate-400">
              <div className="bg-[#b9cde5] text-slate-900 font-bold px-3 py-1 border-b border-slate-400">
                Terms and Conditions
              </div>
              <div className="p-2.5 text-[10px] text-slate-700 leading-relaxed">
                <p className="font-medium text-slate-900 mb-1">Thank you for doing business with us.</p>
                <p>1. Prices inclusive of GST. • 2. 1-Year on-site warranty on all cameras & recording equipment.</p>
              </div>
            </div>

            {/* Block 3: Authorized Signatory */}
            <div className="flex flex-col justify-between p-2.5 min-h-[110px] bg-white">
              <p className="text-xs font-semibold text-slate-900 text-right">
                For: <span className="font-bold uppercase">{adminSettings?.companyName || 'AP SECURITY SYSTEM'}</span>
              </p>
              <div className="my-1 flex justify-center">
                <svg viewBox="0 0 120 40" className="w-24 h-9 text-slate-800 opacity-80">
                  <path
                    d="M10 28 Q 28 6, 48 24 T 88 14 Q 104 18, 114 30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path d="M34 14 Q 44 34, 58 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-900 text-center border-t border-slate-300 pt-1">
                Authorized Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuotationPreviewModal;
