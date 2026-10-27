import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

export const SiteVisitModal = ({ isOpen, onClose, enquiry }) => {
  const { scheduleSiteVisit, technicians } = useApp();

  const [formData, setFormData] = useState({
    visitDate: '',
    visitTime: '10:00 AM',
    staffOrTechId: '',
    staffOrTechName: '',
    status: 'Scheduled',
    notes: '',
    outcome: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (enquiry) {
      const existing = enquiry.siteVisit;
      setFormData({
        visitDate: existing?.visitDate || enquiry.expectedVisitDate || new Date().toISOString().split('T')[0],
        visitTime: existing?.visitTime || '10:00 AM',
        staffOrTechId: existing?.staffOrTechId || enquiry.technicianId || '',
        staffOrTechName: existing?.staffOrTechName || enquiry.technicianName || '',
        status: existing?.status || 'Scheduled',
        notes: existing?.notes || '',
        outcome: existing?.outcome || '',
      });
      setErrors({});
    }
  }, [enquiry, isOpen]);

  if (!enquiry) return null;

  const validate = () => {
    const errs = {};
    if (!formData.visitDate) {
      errs.visitDate = 'Visit date is required';
    }
    if (!formData.visitTime) {
      errs.visitTime = 'Visit time is required';
    }
    if (formData.status === 'Completed' && !formData.outcome.trim()) {
      errs.outcome = 'Please specify the visit outcome / findings before marking as completed';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleTechChange = (e) => {
    const techId = e.target.value;
    const selectedTech = technicians.find((t) => t.id === techId);
    setFormData((prev) => ({
      ...prev,
      staffOrTechId: techId,
      staffOrTechName: selectedTech ? selectedTech.name : '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    scheduleSiteVisit(enquiry.id, formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={enquiry.siteVisit ? 'Update Site Visit' : 'Schedule Site Visit'}
      subtitle={`Enquiry ${enquiry.id} • ${enquiry.customerName}`}
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
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Save Site Visit
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Readonly Enquiry Summary Box */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <span className="text-slate-500 font-medium">Customer:</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{enquiry.customerName}</p>
            <p className="text-slate-600">{enquiry.phone}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Site Address:</span>
            <p className="text-slate-700 mt-0.5">{enquiry.siteAddress}</p>
          </div>
        </div>

        {/* Visit Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visit Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.visitDate}
              onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.visitDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.visitDate && (
              <p className="mt-1 text-xs text-rose-500">{errors.visitDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visit Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Visit Time"
              value={formData.visitTime}
              onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.visitTime ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.visitTime && (
              <p className="mt-1 text-xs text-rose-500">{errors.visitTime}</p>
            )}
          </div>
        </div>

        {/* Staff/Technician & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Staff / Technician
            </label>
            <select
              value={formData.staffOrTechId}
              onChange={handleTechChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Technician --</option>
              {technicians
                .filter((t) => t.status === 'Active')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialization})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visit Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed (Allows Quotation)</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {formData.status !== 'Completed' && (
              <p className="text-[11px] text-amber-600 mt-1">
                * Note: A site visit must be marked Completed before quotation generation is unlocked.
              </p>
            )}
          </div>
        </div>

        {/* Visit Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Visit Notes & Survey Requirements
          </label>
          <textarea
            rows="2"
            placeholder="Enter Visit Notes & Survey Requirements"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Visit Outcome */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Visit Outcome & Client Discussion {formData.status === 'Completed' && <span className="text-rose-500">*</span>}
          </label>
          <textarea
            rows="2"
            placeholder="Enter Visit Outcome & Client Discussion"
            value={formData.outcome}
            onChange={(e) => {
              setFormData({ ...formData, outcome: e.target.value });
              if (errors.outcome) setErrors({ ...errors, outcome: undefined });
            }}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              errors.outcome ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.outcome && (
            <p className="mt-1 text-xs text-rose-500">{errors.outcome}</p>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default SiteVisitModal;

