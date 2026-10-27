import React, { useState, useEffect } from 'react';
import { Wrench, CheckSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { useApp } from '../../context/AppContext';

export const WorkStatusModal = ({ isOpen, onClose, order }) => {
  const { updateWorkStatus } = useApp();

  const [workStatus, setWorkStatus] = useState('Assigned');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [workNotes, setWorkNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (order) {
      setWorkStatus(order.workStatus || 'Assigned');
      setStartDate(order.startDate || '');
      setCompletionDate(order.completionDate || '');
      setWorkNotes(order.workNotes || '');
      setErrors({});
    }
  }, [order, isOpen]);

  if (!order) return null;

  const validate = () => {
    const errs = {};
    if (workStatus === 'In Progress') {
      if (!startDate) {
        errs.startDate = 'Start date is required when work is In Progress';
      }
    } else if (workStatus === 'Completed') {
      if (!startDate) {
        errs.startDate = 'Start date is required';
      }
      if (!completionDate) {
        errs.completionDate = 'Completion date is required when marking work as Completed';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    updateWorkStatus(order.id, {
      workStatus,
      startDate,
      completionDate: workStatus === 'Completed' ? completionDate : '',
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
      title="Update Installation Work Status"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            Update Work Status
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
              {order.assignedTechnicianName || 'Not yet assigned'}
            </p>
            <p className="text-slate-600">{order.technicianPhone}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Job Value:</span>
            <p className="font-bold text-blue-600 text-sm mt-0.5">₹{order.grandTotal?.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Installation Work Status <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Assigned', label: 'Assigned', desc: 'Tech allocated, pending kickoff' },
              { id: 'In Progress', label: 'In Progress', desc: 'On-site installation ongoing' },
              { id: 'Completed', label: 'Completed', desc: 'Setup & sign-off finished' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setWorkStatus(st.id);
                  if (st.id === 'Completed' && !completionDate) {
                    setCompletionDate(new Date().toISOString().split('T')[0]);
                  }
                  if (st.id === 'In Progress' && !startDate) {
                    setStartDate(new Date().toISOString().split('T')[0]);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  workStatus === st.id
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500 font-medium'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <p className="text-xs font-bold">{st.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{st.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date {workStatus !== 'Assigned' && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                errors.startDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.startDate && (
              <p className="mt-1 text-xs text-rose-500">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Completion Date {workStatus === 'Completed' && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              disabled={workStatus !== 'Completed'}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                errors.completionDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } ${workStatus !== 'Completed' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.completionDate && (
              <p className="mt-1 text-xs text-rose-500">{errors.completionDate}</p>
            )}
          </div>
        </div>

        {/* Work Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Installation Notes & Remarks
          </label>
          <textarea
            rows="3"
            placeholder="Enter Installation Notes & Remarks"
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
