import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Eye, Send } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';

export const QuotationModal = ({
  isOpen,
  onClose,
  enquiry,
  quotationToEdit,
  onOpenPreview,
}) => {
  const { createQuotation, updateQuotation, products, addToast } = useApp();

  const [date, setDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [terms, setTerms] = useState(
    '1. Prices are all-inclusive of applicable GST.\n2. 50% advance along with work order, remaining 50% upon installation sign-off.\n3. 1-Year on-site warranty on all cameras and recording equipment.\n4. Free mobile view app configuration and staff training included.'
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (quotationToEdit) {
        setDate(quotationToEdit.date || new Date().toISOString().split('T')[0]);
        setValidUntil(quotationToEdit.validUntil || '');
        setItems(quotationToEdit.items || []);
        setDiscount(quotationToEdit.discount || 0);
        setTerms(quotationToEdit.terms || '');
      } else {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);

        setDate(today.toISOString().split('T')[0]);
        setValidUntil(nextMonth.toISOString().split('T')[0]);

        // Default with 1 sample item or empty
        const defaultProduct = products.find((p) => p.status === 'Active') || products[0];
        if (defaultProduct) {
          const qty = enquiry?.cameraCount || 4;
          setItems([
            {
              id: 'item-' + Date.now(),
              productId: defaultProduct.id,
              name: defaultProduct.name,
              category: defaultProduct.category,
              quantity: qty,
              unitPrice: defaultProduct.unitPrice,
              lineTotal: qty * defaultProduct.unitPrice,
            },
          ]);
        } else {
          setItems([]);
        }
        setDiscount(0);
      }
      setErrors({});
    }
  }, [isOpen, quotationToEdit, enquiry, products]);

  if (!enquiry) return null;

  // Site visit prerequisite check: required ONLY IF site visit was requested in enquiry form
  const isSiteVisitRequired =
    enquiry.requiresSiteVisit === true ||
    (Boolean(enquiry.siteVisit) && enquiry.requiresSiteVisit !== false);

  const canSendQuotation =
    !isSiteVisitRequired || (enquiry.siteVisit && enquiry.siteVisit.status === 'Completed');

  // Dynamic calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0));

  const handleAddItem = () => {
    const activeProducts = products.filter((p) => p.status === 'Active');
    const prod = activeProducts[0] || { id: 'custom', name: 'Custom Item', unitPrice: 1000, category: 'Hardware' };
    const newItem = {
      id: 'item-' + Date.now() + Math.random().toString().slice(2, 5),
      productId: prod.id,
      name: prod.name,
      category: prod.category,
      quantity: 1,
      unitPrice: prod.unitPrice,
      lineTotal: prod.unitPrice,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemProductChange = (index, productId) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const lineTotal = item.quantity * prod.unitPrice;
        return {
          ...item,
          productId: prod.id,
          name: prod.name,
          category: prod.category,
          unitPrice: prod.unitPrice,
          lineTotal,
        };
      })
    );
  };

  const handleItemQtyChange = (index, qty) => {
    const quantity = Math.max(1, parseInt(qty, 10) || 1);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          quantity,
          lineTotal: quantity * item.unitPrice,
        };
      })
    );
  };

  const handleItemPriceChange = (index, price) => {
    const unitPrice = Math.max(0, parseFloat(price) || 0);
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          unitPrice,
          lineTotal: item.quantity * unitPrice,
        };
      })
    );
  };

  const validate = () => {
    const errs = {};
    if (!date) errs.date = 'Quotation date is required';
    if (!validUntil) errs.validUntil = 'Validity date is required';
    if (items.length === 0) errs.items = 'At least one line item is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildQuotationPayload = (status = 'Draft') => {
    return {
      enquiryId: enquiry.id,
      customerName: enquiry.customerName,
      customerPhone: enquiry.phone,
      siteAddress: enquiry.siteAddress,
      date,
      validUntil,
      items,
      discount: Number(discount) || 0,
      subtotal,
      grandTotal,
      terms,
      status,
    };
  };

  const handleSaveDraft = () => {
    if (!validate()) return;
    const payload = buildQuotationPayload('Draft');
    if (quotationToEdit) {
      updateQuotation(quotationToEdit.id, payload);
    } else {
      createQuotation(payload);
    }
    onClose();
  };

  const handleSendQuotation = () => {
    if (!validate()) return;
    if (!canSendQuotation) {
      addToast(
        'Action Blocked',
        'Cannot send quotation until the required site visit has been marked as Completed.',
        'error'
      );
      return;
    }
    const payload = buildQuotationPayload('Sent');
    if (quotationToEdit) {
      updateQuotation(quotationToEdit.id, payload);
    } else {
      createQuotation(payload);
    }
    onClose();
  };

  const handlePreview = () => {
    if (!validate()) return;
    const currentPayload = {
      ...(quotationToEdit || {}),
      ...buildQuotationPayload(quotationToEdit ? quotationToEdit.status : 'Draft'),
      id: quotationToEdit?.id || 'QT-DRAFT',
    };
    onOpenPreview(currentPayload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={quotationToEdit ? `Edit Quotation ${quotationToEdit.id}` : 'Create Formal Quotation'}
      subtitle={`Enquiry ${enquiry.id} • ${enquiry.customerName}`}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div>
            {!canSendQuotation && (
              <span className="text-xs text-amber-700 flex items-center gap-1.5 font-medium bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Site visit pending completion. "Send Quotation" is locked.
              </span>
            )}
            {!isSiteVisitRequired && (
              <span className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                Direct quotation (no site visit required).
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              type="button"
              onClick={handleSendQuotation}
              disabled={!canSendQuotation}
              title={
                !canSendQuotation
                  ? 'Quotation sending is disabled until required site visit is completed'
                  : 'Send formal quotation to customer'
              }
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors cursor-pointer ${
                !canSendQuotation
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Send Quotation
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Customer & Address Details */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Customer:</span>
            <p className="font-semibold text-slate-800 text-sm">{enquiry.customerName}</p>
            <p className="text-slate-600">{enquiry.phone}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Installation Location:</span>
            <p className="text-slate-700 mt-0.5">{enquiry.siteAddress}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Requirement & Scope:</span>
            <p className="text-slate-700 mt-0.5 font-medium">{enquiry.requirement} ({enquiry.cameraCount || 'N/A'} Cameras)</p>
            <p className="text-[11px] text-slate-500 truncate">{enquiry.productsOfInterest}</p>
          </div>
        </div>

        {/* Quotation Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quotation Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Valid Until <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Products & Services Line Items
            </h4>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          {errors.items && (
            <p className="text-xs text-rose-500 mb-2">{errors.items}</p>
          )}

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Item / Service</th>
                  <th className="py-2.5 px-3 w-24">Qty</th>
                  <th className="py-2.5 px-3 w-32">Unit Price (₹)</th>
                  <th className="py-2.5 px-3 w-32 text-right">Line Total</th>
                  <th className="py-2.5 px-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No items added yet. Click "+ Add Item" above.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemProductChange(index, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        >
                          {products
                            .filter((p) => p.status === 'Active')
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} [{p.category}]
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemQtyChange(index, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-medium"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemPriceChange(index, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                      </td>
                      <td className="p-2.5 text-right font-semibold text-slate-800">
                        {formatINR(item.lineTotal)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Calculation Summary (Strict business rule: No GST field or line item shown, GST inclusive) */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2 border-t border-slate-200">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Terms & Conditions
            </label>
            <textarea
              rows="3"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Special Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 px-2 py-1 text-xs text-right rounded border border-slate-300 bg-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                  (Inclusive of applicable GST)
                </p>
              </div>
              <span className="text-lg font-bold text-blue-600">{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuotationModal;

