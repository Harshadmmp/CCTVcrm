import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Calendar, UserCheck } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';

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
        staffOrTechId: existing?.staffOrTechId || enquiry.technicianId || 'TECH-001',
        staffOrTechName: existing?.staffOrTechName || enquiry.technicianName || 'Ramesh Kumar',
        status: existing?.status || 'Scheduled',
        notes: existing?.notes || '',
        outcome: existing?.outcome || '',
      });
      setErrors({});
    }
  }, [enquiry, isOpen]);

  if (!enquiry) return null;

  const isCompleted = formData.status === 'Completed';

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
      title={isCompleted ? `Site Survey Report: ${enquiry.id}` : 'Site Visit Schedule & Technician'}
      subtitle={`Enquiry ${enquiry.id} • ${enquiry.customerName}`}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {isCompleted ? 'Close' : 'Cancel'}
          </button>
          {!isCompleted && (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Save Schedule & Assign Tech
            </button>
          )}
        </div>
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

        {/* Informative Status Banner: Managed by Technician */}
        {isCompleted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Physical Survey Completed by Technician
              </span>
              <StatusBadge status="Completed" size="xs" />
            </div>
            <p className="text-slate-700">
              <strong>Lead Technician:</strong> {formData.staffOrTechName} ({formData.staffOrTechId})
            </p>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 mt-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                Technician Findings & Recommendations:
              </span>
              <p className="text-slate-800 text-xs font-medium">
                {formData.outcome || 'Site inspected. Cable conduits and camera angles verified on location.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-amber-900">Handled Exclusively by Field Technician</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Site visit inspection, cable pathway feasibility, and survey completion report must be submitted by the assigned technician from the <strong>Technician Portal</strong>. Office admin can only assign the technician and set the scheduled date.
              </p>
            </div>
          </div>
        )}

        {/* Visit Date & Assigned Technician */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Scheduled Visit Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              disabled={isCompleted}
              value={formData.visitDate}
              onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.visitDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } ${isCompleted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.visitDate && (
              <p className="mt-1 text-xs text-rose-500">{errors.visitDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Field Technician <span className="text-rose-500">*</span>
            </label>
            <select
              disabled={isCompleted}
              value={formData.staffOrTechId}
              onChange={handleTechChange}
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.staffOrTechId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } ${isCompleted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
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
        </div>

        {/* Visit Notes for Technician */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Instructions for Technician
          </label>
          <textarea
            rows="2"
            disabled={isCompleted}
            placeholder="e.g. Check corner blind spots and ceiling height."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-300 ${
              isCompleted ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </form>
    </Modal>
  );
};

export default SiteVisitModal;
