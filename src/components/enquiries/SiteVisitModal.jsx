import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, CheckCircle2, Clock } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
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
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (enquiry) {
      const existing = enquiry.siteVisit;
      // Default to 'Completed' for already scheduled visits, or 'Scheduled' for brand new visits
      const defaultStatus = existing ? 'Completed' : 'Scheduled';

      setFormData({
        visitDate: existing?.visitDate || enquiry.expectedVisitDate || new Date().toISOString().split('T')[0],
        visitTime: existing?.visitTime || '10:00 AM',
        staffOrTechId: existing?.staffOrTechId || enquiry.technicianId || 'TECH-001',
        staffOrTechName: existing?.staffOrTechName || enquiry.technicianName || 'Ramesh Kumar',
        status: defaultStatus,
        notes: existing?.notes || '',
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
    if (!formData.staffOrTechId) {
      errs.staffOrTechId = 'Please select a technician';
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
    if (errors.staffOrTechId) setErrors((prev) => ({ ...prev, staffOrTechId: undefined }));
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
      zIndex="z-[60]"
      title={enquiry.siteVisit ? 'Update Site Visit' : 'Schedule Site Visit'}
      subtitle={`Enquiry ${enquiry.id} • ${enquiry.customerName}`}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Save Site Visit
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enquiry Summary */}
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

        {/* Visit Status & Visit Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visit Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
            >
              {!enquiry.siteVisit && <option value="Scheduled">Scheduled</option>}
              <option value="Completed">Completed (Allows Quotation)</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {formData.status === 'Completed' ? (
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Site visit completed. Quotation sending is unlocked.
              </p>
            ) : (
              <p className="text-[11px] text-amber-600 mt-1">
                * Note: Mark as Completed to unlock quotation generation.
              </p>
            )}
          </div>

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
              } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.visitDate && (
              <p className="mt-1 text-xs text-rose-500">{errors.visitDate}</p>
            )}
          </div>
        </div>

        {/* Assigned Technician & Preferred Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Field Technician <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.staffOrTechId}
              onChange={handleTechChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.staffOrTechId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer`}
            >
              <option value="">-- Select Technician --</option>
              {technicians
                .filter((t) => t.status === 'Active')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id} - {t.specialization})
                  </option>
                ))}
            </select>
            {errors.staffOrTechId && (
              <p className="mt-1 text-xs text-rose-500">{errors.staffOrTechId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Time Slot
            </label>
            <select
              value={formData.visitTime}
              onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="10:00 AM">Morning (10:00 AM - 12:00 PM)</option>
              <option value="01:00 PM">Afternoon (01:00 PM - 03:00 PM)</option>
              <option value="04:00 PM">Evening (04:00 PM - 06:00 PM)</option>
              <option value="06:30 PM">Late Evening (06:30 PM - 08:00 PM)</option>
            </select>
          </div>
        </div>

        {/* Visit Notes / Instructions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Instructions for Technician & Site
          </label>
          <textarea
            rows="3"
            placeholder="e.g. Check corner blind spots, ceiling height, and cable conduit pathways."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
};

export default SiteVisitModal;
