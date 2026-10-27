import React from 'react';
import { PackageCheck, ShieldCheck, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import { formatINR } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const CreateOrderModal = ({ isOpen, onClose, quotation }) => {
  const { createOrderFromQuotation } = useApp();

  if (!quotation) return null;

  const handleConfirm = () => {
    createOrderFromQuotation(quotation.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[60]"
      title="Create Order from Approved Quotation"
      subtitle={`Source Quotation: ${quotation.id} • Customer: ${quotation.customerName}`}
      maxWidth="max-w-xl"
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
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <PackageCheck className="w-4 h-4" />
            Confirm & Generate Order
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Quotation Officially Approved</span>
            <p className="mt-0.5 text-blue-800">
              This action will convert approved quotation <strong>{quotation.id}</strong> into a confirmed operational work order. All items, pricing, and customer details will be carried over automatically.
            </p>
          </div>
        </div>

        {/* Order Details summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
            <div>
              <span className="text-slate-500 font-medium">Customer:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{quotation.customerName}</p>
              <p className="text-slate-600">{quotation.customerPhone}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Site Address:</span>
              <p className="text-slate-800 mt-0.5 leading-tight">{quotation.siteAddress}</p>
            </div>
          </div>

          <div>
            <span className="text-slate-500 font-medium block mb-1">
              Products & Services to be Installed:
            </span>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-center w-16">Qty</th>
                    <th className="py-2 px-3 text-right w-24">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.items?.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2 px-3 text-slate-800 font-medium">{item.name}</td>
                      <td className="py-2 px-3 text-center text-slate-700">{item.quantity}</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900">
                        {formatINR(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-600">Grand Total:</span>
              <p className="text-[10px] text-slate-500">(Inclusive of applicable taxes)</p>
            </div>
            <span className="text-base font-bold text-blue-600">
              {formatINR(quotation.grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateOrderModal;

