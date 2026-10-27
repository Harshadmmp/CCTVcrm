import React, { useState, useEffect } from 'react';
import { Wrench, CheckSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

export const WorkStatusModal = ({ isOpen, onClose, order }) => {
  const { updateWorkStatus, addToast } = useApp();

  const [workStatus, setWorkStatus] = useState('Assigned');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [workNotes, setWorkNotes] = useState('');
  const [checklist, setChecklist] = useState({
    cameraMounting: false,
    cablingConduit: false,
    nvrSetup: false,
    mobileAppConfig: false,
    customerTraining: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (order) {
      setWorkStatus(order.workStatus || 'Assigned');
      setStartDate(order.startDate || '');
      setCompletionDate(order.completionDate || '');
      setWorkNotes(order.workNotes || '');
      setChecklist(
        order.checklist || {
          cameraMounting: false,
          cablingConduit: false,
          nvrSetup: false,
          mobileAppConfig: false,
          customerTraining: false,
        }
      );
      setErrors({});
    }
  }, [order, isOpen]);

  if (!order) return null;

  const handleChecklistToggle = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
      // Business rule: Prevent completion when required checklist items are missing
      const allChecked = Object.values(checklist).every(Boolean);
      if (!allChecked) {
        errs.checklist = 'All checklist items must be completed and checked before marking the job as Completed.';
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
      checklist,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Installation Work Status"
      subtitle={`Order ${order.id} • Customer: ${order.customerName}`}
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            Update Work Status
          </button>
        </>
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
              { id: 'In Progress', label: 'In Progress', desc: 'On-site cabling / installation' },
              { id: 'Completed', label: 'Completed', desc: 'Handover complete, ready for invoice' },
            ].map((st) => (
              <button
                type="button"
                key={st.id}
                onClick={() => {
                  setWorkStatus(st.id);
                  if (st.id === 'In Progress' && !startDate) {
                    setStartDate(new Date().toISOString().split('T')[0]);
                  }
                  if (st.id === 'Completed') {
                    if (!startDate) setStartDate(new Date().toISOString().split('T')[0]);
                    if (!completionDate) setCompletionDate(new Date().toISOString().split('T')[0]);
                  }
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
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
              } ${workStatus !== 'Completed' ? 'bg-slate-100 text-slate-400' : ''} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.completionDate && (
              <p className="mt-1 text-xs text-rose-500">{errors.completionDate}</p>
            )}
          </div>
        </div>

        {/* Installation Checklist */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Technical Installation Checklist
            </label>
            <span className="text-[11px] text-slate-500">
              {Object.values(checklist).filter(Boolean).length} of 5 completed
            </span>
          </div>

          {errors.checklist && (
            <div className="mb-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.checklist}</span>
            </div>
          )}

          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {[
              { key: 'cameraMounting', label: 'Camera Physical Mounting & Angle Alignment' },
              { key: 'cablingConduit', label: 'Cat6 Cabling, Conduit Pipe Casing & Connectors (RJ45 / BNC)' },
              { key: 'nvrSetup', label: 'NVR / DVR Storage Setup, Recording Schedule & Resolution Config' },
              { key: 'mobileAppConfig', label: 'Mobile App Live Streaming & Cloud Remote Access Testing' },
              { key: 'customerTraining', label: 'Customer Handover, Admin Password Transfer & Sign-off' },
            ].map((chk) => (
              <label
                key={chk.key}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checklist[chk.key]}
                  onChange={() => handleChecklistToggle(chk.key)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className={`text-xs ${checklist[chk.key] ? 'font-medium text-slate-900 line-through text-slate-400' : 'text-slate-700'}`}>
                  {chk.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Work Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Technician Notes & Progress Updates
          </label>
          <textarea
            rows="3"
            placeholder="Enter Technician Notes & Progress Updates"
            value={workNotes}
            onChange={(e) => setWorkNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
};

export default WorkStatusModal;

