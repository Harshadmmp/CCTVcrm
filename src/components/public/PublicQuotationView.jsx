import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate, numberToWords } from '../../utils/formatters';
import { printDocument } from '../../utils/printDocument';

export const PublicQuotationView = () => {
  const { id } = useParams();
  const { quotations = [], adminSettings, products = [], enquiries = [] } = useApp();

  const quotation = useMemo(() => {
    return quotations.find((q) => q.id === id);
  }, [quotations, id]);

  const matchingEnquiry = useMemo(() => {
    if (!quotation) return null;
    return (enquiries || []).find((e) => e.id === quotation.enquiryId || e.quotationId === quotation.id);
  }, [enquiries, quotation]);

  const displayCustomerName =
    (matchingEnquiry?.customerName && quotation?.customerName === 'Green Valley Residential Society')
      ? matchingEnquiry.customerName
      : quotation?.customerName || matchingEnquiry?.customerName || 'Customer';

  const displayCustomerPhone =
    (matchingEnquiry?.phone && quotation?.customerName === 'Green Valley Residential Society')
      ? matchingEnquiry.phone
      : quotation?.customerPhone || matchingEnquiry?.phone || '';

  const displaySiteAddress =
    (matchingEnquiry?.siteAddress && quotation?.customerName === 'Green Valley Residential Society')
      ? matchingEnquiry.siteAddress
      : quotation?.siteAddress || matchingEnquiry?.siteAddress || '';

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

  const handlePrint = () => {
    printDocument('.printable-document', `Estimate_${quotation?.id || 'Estimate'}`);
  };

  if (!quotation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Loading Estimate...</h2>
          <p className="text-xs text-slate-500">
            Retrieving quotation details. If it doesn't appear shortly, please verify the link or contact support.
          </p>
        </div>
      </div>
    );
  }

  const totalQuantity = (quotation.items || []).reduce(
    (sum, it) => sum + (Number(it.quantity) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6">
      {/* Top Action Bar (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-4 bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            QT
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Estimate #{quotation.id}
            </h1>
            <p className="text-[11px] text-slate-500">
              {adminSettings?.companyName || 'AP SECURITY SYSTEM'} • Customer: {displayCustomerName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Main Quotation Sheet */}
      <div className="max-w-4xl mx-auto">
        <div className="printable-document bg-white border border-slate-400 p-6 sm:p-8 text-slate-900 shadow-md">
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

          {/* Two Shaded Header Blocks (Estimate For & Estimate Details) */}
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
                  <span className="font-bold text-slate-900">{quotation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Date:</span>
                  <span className="font-bold text-slate-900">{formatDate(quotation.createdAt)}</span>
                </div>
                {quotation.validUntil && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Valid Until:</span>
                    <span className="font-bold text-slate-900">{formatDate(quotation.validUntil)}</span>
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
                <span className="font-semibold text-slate-900">{formatINR(quotation.subtotal || quotation.grandTotal)}</span>
              </div>
              {Number(quotation.discount) > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
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

          {/* Amount In Words Box */}
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
    </div>
  );
};

export default PublicQuotationView;

