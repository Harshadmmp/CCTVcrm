import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, RotateCcw, Sparkles, Calendar } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { validateIndianPhone } from '../../utils/formatters';

const initialForm = {
  phone: '',
  customerName: '',
  email: '',
  cameraCount: '',
  siteAddress: '',
  source: 'Direct',
  requirement: 'CCTV Installation',
  requiresSiteVisit: false,
  visitDate: '',
  staffOrTechId: 'TECH-001',
  staffOrTechName: 'Ramesh Kumar',
};

export const AddEnquiryModal = ({ isOpen, onClose }) => {
  const { addEnquiry, enquiries, technicians } = useApp();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchedClient, setMatchedClient] = useState(null);
  const [suggestedClients, setSuggestedClients] = useState([]);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setErrors({});
      setMatchedClient(null);
      setSuggestedClients([]);
    }
  }, [isOpen]);

  // Clean phone helper for comparison (extract last 10 digits)
  const cleanPhone = (p) => (p || '').replace(/\D/g, '').slice(-10);

  // Phone number change with automatic client lookup: numbers only, max 10 digits
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    // Strictly numbers only, exactly up to 10 digits (rejects 11th digit and non-digits)
    const cleanedInput = rawVal.replace(/\D/g, '').slice(0, 10);

    setFormData((prev) => ({ ...prev, phone: cleanedInput }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }

    if (cleanedInput.length >= 3) {
      // Find matching previous clients
      const matches = enquiries.filter((item) => {
        const itemClean = cleanPhone(item.phone);
        return itemClean.includes(cleanedInput);
      });

      // Deduplicate by customerName + phone
      const uniqueMatches = [];
      const seen = new Set();
      matches.forEach((m) => {
        const key = `${m.customerName.toLowerCase()}_${cleanPhone(m.phone)}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueMatches.push(m);
        }
      });

      setSuggestedClients(uniqueMatches.slice(0, 3));

      // Exact 10-digit match -> auto-fill immediately
      if (cleanedInput.length === 10) {
        const exactMatch = enquiries.find((item) => cleanPhone(item.phone) === cleanedInput);
        if (exactMatch) {
          applyClientData(exactMatch);
        }
      }
    } else {
      setSuggestedClients([]);
      setMatchedClient(null);
    }
  };

  const applyClientData = (client) => {
    setFormData((prev) => ({
      ...prev,
      phone: client.phone || prev.phone,
      customerName: client.customerName || prev.customerName,
      email: client.email || prev.email,
      siteAddress: client.siteAddress || prev.siteAddress,
      cameraCount: client.cameraCount || prev.cameraCount,
    }));
    setMatchedClient(client);
    setSuggestedClients([]);

    // Clear validation errors for auto-filled fields
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.phone;
      delete copy.customerName;
      delete copy.siteAddress;
      return copy;
    });
  };

  const handleClearAutoFill = () => {
    setMatchedClient(null);
    setFormData((prev) => ({
      ...prev,
      customerName: '',
      email: '',
      siteAddress: '',
      cameraCount: '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    const phoneDigits = (formData.phone || '').replace(/\D/g, '');
    if (!phoneDigits) {
      errs.phone = 'Phone number is required';
    } else if (phoneDigits.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits';
    } else if (!validateIndianPhone(phoneDigits)) {
      errs.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)';
    }
    if (!formData.customerName.trim()) {
      errs.customerName = 'Customer name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.siteAddress.trim()) {
      errs.siteAddress = 'Site address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      addEnquiry({
        ...formData,
        cameraCount: formData.cameraCount ? parseInt(formData.cameraCount, 10) : null,
        requiresSiteVisit: Boolean(formData.requiresSiteVisit),
        visitDate: formData.requiresSiteVisit ? formData.visitDate : '',
        staffOrTechId: formData.requiresSiteVisit ? (formData.staffOrTechId || 'TECH-001') : null,
        staffOrTechName: formData.requiresSiteVisit ? (formData.staffOrTechName || 'Ramesh Kumar') : '',
      });
      setFormData(initialForm);
      setErrors({});
      setMatchedClient(null);
      setSuggestedClients([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer Enquiry"
      subtitle="Enter client phone number to automatically detect and populate existing customer records."
      maxWidth="max-w-2xl"
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Enquiry'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Existing Client Auto-detected Banner */}
        {matchedClient && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs text-emerald-900 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold flex items-center gap-1.5">
                  <span>Existing Client Detected</span>
                  <span className="bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
                    Auto-Filled
                  </span>
                </p>
                <p className="mt-0.5 text-emerald-800">
                  Found existing records for <strong>{matchedClient.customerName}</strong>. Name, email, and installation site address have been populated automatically.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearAutoFill}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline flex items-center gap-1 whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              Clear & Enter New Details
            </button>
          </div>
        )}

        {/* Row 1: 1. Phone Number & 2. Customer Name (Balanced 2-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone Number Field (FIRST) with Smart Search */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>
                1. Phone Number <span className="text-rose-500">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="phone"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10-digit mobile number"
                value={formData.phone}
                onChange={handlePhoneChange}
                autoFocus
                className={`w-full h-10 pl-3 pr-9 text-sm rounded-lg border font-medium ${
                  errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>
            )}

            {/* Suggestions dropdown if matching existing clients */}
            {suggestedClients.length > 0 && !matchedClient && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 z-20 p-1.5 text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                  Matching Existing Clients (Click to auto-fill):
                </p>
                {suggestedClients.map((client) => (
                  <button
                    type="button"
                    key={client.id}
                    onClick={() => applyClientData(client)}
                    className="w-full text-left p-2 rounded hover:bg-blue-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{client.customerName}</p>
                      <p className="text-[11px] text-slate-500">{client.phone} • {client.siteAddress.slice(0, 32)}...</p>
                    </div>
                    <span className="text-[11px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Name Field (SECOND) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              2. Customer Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="customerName"
              placeholder="Enter Customer Name"
              value={formData.customerName}
              onChange={handleChange}
              className={`w-full h-10 px-3 text-sm rounded-lg border font-medium ${
                errors.customerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.customerName && (
              <p className="mt-1 text-xs text-rose-500">{errors.customerName}</p>
            )}
          </div>
        </div>

        {/* Row 2: Email Address & Camera Count (Balanced 2-Column Grid with Equal Height) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full h-10 px-3 text-sm rounded-lg border ${
                errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Camera Count
            </label>
            <input
              type="number"
              name="cameraCount"
              placeholder="Enter Camera Count"
              min="1"
              value={formData.cameraCount}
              onChange={handleChange}
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 3: Site Address (Full Width Span for Perfect Symmetry) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Site Address (Physical Location) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows="2"
            name="siteAddress"
            placeholder="Enter physical site address (building, street, landmark, city)"
            value={formData.siteAddress}
            onChange={handleChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border resize-none ${
              errors.siteAddress ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.siteAddress && (
            <p className="mt-1 text-xs text-rose-500">{errors.siteAddress}</p>
          )}
        </div>

        {/* Row 4: Site Visit Checkbox Box (Full Width Card Container) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 transition-all">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="requiresSiteVisit"
              checked={formData.requiresSiteVisit}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData((prev) => ({
                  ...prev,
                  requiresSiteVisit: isChecked,
                  visitDate: isChecked
                    ? (prev.visitDate || new Date().toISOString().split('T')[0])
                    : '',
                  staffOrTechId: isChecked ? (prev.staffOrTechId || 'TECH-001') : '',
                  staffOrTechName: isChecked ? (prev.staffOrTechName || 'Ramesh Kumar') : '',
                }));
              }}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Site Visit Required</span>
            </span>
          </label>

          {/* Conditional Date & Technician option when Site Visit is checked */}
          {formData.requiresSiteVisit ? (
            <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Site Visit Date
                </label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleChange}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assign Technician
                </label>
                <select
                  name="staffOrTechId"
                  value={formData.staffOrTechId || 'TECH-001'}
                  onChange={(e) => {
                    const techId = e.target.value;
                    const tech = technicians.find((t) => t.id === techId);
                    setFormData((prev) => ({
                      ...prev,
                      staffOrTechId: techId,
                      staffOrTechName: tech ? tech.name : '',
                    }));
                  }}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {technicians
                    .filter((t) => t.status === 'Active')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.id} • {t.specialization})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-slate-500 pl-7">
              Unchecked: Direct quotation will be sent without an on-site survey.
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default AddEnquiryModal;
