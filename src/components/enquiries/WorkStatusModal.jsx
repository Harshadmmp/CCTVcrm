import React, { useState, useEffect } from 'react';
import { CheckCircle2, Calendar, FileText } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

export const WorkStatusModal = ({ isOpen, onClose, order }) => {
  const { updateWorkStatus } = useApp();

  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [workNotes, setWorkNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (order && isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(order.startDate || order.assignmentDate || today);
      setCompletionDate(order.completionDate || today);
      setWorkNotes(order.workNotes || '');
      setErrors({});
    }
  }, [order, isOpen]);

  if (!order) return null;

  const validate = () => {
    const errs = {};
    const today = new Date().toISOString().split('T')[0];
    if (!completionDate) {
      setCompletionDate(today);
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const today = new Date().toISOString().split('T')[0];
    const finalStartDate = startDate || today;
    const finalCompletionDate = completionDate || today;

    updateWorkStatus(order.id, {
      enquiryId: order.enquiryId,
      workStatus: 'Completed',
      startDate: finalStartDate,
      completionDate: finalCompletionDate,
      workNotes,
      checklist: order.checklist || {},
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[60]"
      title="Complete Installation Work"
      subtitle={`Order ${order.id} • Customer: ${order.customerName}`}
      maxWidth="max-w-2xl"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Work
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Read-only details */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-slate-500 font-medium">Customer:</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{order.customerName}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Lead Technician:</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {order.assignedTechnicianName || 'Technician Assigned'}
            </p>
            <p className="text-slate-600">{order.technicianPhone}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Job Value:</span>
            <p className="font-bold text-blue-600 text-sm mt-0.5">
              ₹{order.grandTotal?.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Completion Confirmation Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-xs">Ready to Complete Installation</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Confirm installation completion to mark work finished and enable final Tax Invoice creation.
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Completion Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                errors.completionDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium`}
            />
            {errors.completionDate && (
              <p className="mt-1 text-xs text-rose-500">{errors.completionDate}</p>
            )}
          </div>
        </div>

        {/* Work Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Installation Completion Notes & Handover Remarks
          </label>
          <textarea
            rows="3"
            placeholder="Enter completion remarks (e.g. All cameras mounted, wiring encased, mobile app configured, customer feeds handover signed-off)..."
            value={workNotes}
            onChange={(e) => setWorkNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
};

export default WorkStatusModal;
