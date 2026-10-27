import React, { useState, useEffect } from 'react';
import { Eye, Receipt, FileText } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';

export const InvoiceModal = ({ isOpen, onClose, order, onOpenPreview }) => {
  const { createInvoice } = useApp();

  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState(
    'Tax invoice for supply and installation of CCTV surveillance system as per approved specifications. Payment due within 15 days.'
  );

  useEffect(() => {
    if (order && isOpen) {
      const today = new Date();
      const due = new Date();
      due.setDate(today.getDate() + 15);

      setInvoiceDate(today.toISOString().split('T')[0]);
      setDueDate(due.toISOString().split('T')[0]);
    }
  }, [order, isOpen]);

  if (!order) return null;

  const subtotal = order.items?.reduce((sum, it) => sum + (Number(it.lineTotal) || 0), 0) || order.grandTotal;
  const grandTotal = order.grandTotal;

  const handleSaveDraft = () => {
    const newInv = createInvoice({
      orderId: order.id,
      enquiryId: order.enquiryId,
      quotationId: order.quotationId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      siteAddress: order.siteAddress,
      invoiceDate,
      dueDate,
      items: order.items,
      subtotal,
      grandTotal,
      notes,
    });
    onClose();
    return newInv;
  };

  const handlePreview = () => {
    const draftInvoice = {
      id: 'INV-DRAFT',
      orderId: order.id,
      enquiryId: order.enquiryId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      siteAddress: order.siteAddress,
      invoiceDate,
      dueDate,
      items: order.items,
      subtotal,
      grandTotal,
      notes,
      status: 'Draft',
    };
    onOpenPreview(draftInvoice);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Tax Invoice"
      subtitle={`Completed Job • Order ${order.id} • ${order.customerName}`}
      maxWidth="max-w-3xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview Invoice
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Receipt className="w-4 h-4" />
            Save Invoice Draft
          </button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Order details */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <span className="text-slate-500 font-medium">Customer Details:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{order.customerName}</p>
            <p className="text-slate-600">{order.customerPhone}</p>
            <p className="text-slate-600 mt-1">{order.siteAddress}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Order References:</span>
            <p className="text-slate-700 mt-0.5 font-medium">Order ID: {order.id}</p>
            <p className="text-slate-600">Quotation ID: {order.quotationId}</p>
            <p className="text-slate-600">Completion Date: {order.completionDate || 'Recently Completed'}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Items table */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            Billed Items & Services
          </label>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center w-20">Qty</th>
                  <th className="py-2.5 px-3 text-right w-28">Unit Price</th>
                  <th className="py-2.5 px-3 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((it, idx) => (
                  <tr key={it.id || idx}>
                    <td className="py-2 px-3 font-medium text-slate-800">{it.name}</td>
                    <td className="py-2 px-3 text-center text-slate-700">{it.quantity}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{formatINR(it.unitPrice)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900">{formatINR(it.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Notes */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2 border-t border-slate-200">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice Terms & Payment Notes
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full sm:w-64 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
            </div>
            <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
              <div>
                <span className="text-xs font-bold text-slate-900">Grand Total:</span>
                <p className="text-[10px] text-slate-500">(All applicable taxes included)</p>
              </div>
              <span className="text-base font-bold text-blue-600">{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;

