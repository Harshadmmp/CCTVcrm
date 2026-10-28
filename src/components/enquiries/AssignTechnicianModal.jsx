import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

export const AssignTechnicianModal = ({ isOpen, onClose, order, enquiry }) => {
  const { assignTechnician, technicians } = useApp();

  const [selectedTechId, setSelectedTechId] = useState('');
  const [techPhone, setTechPhone] = useState('');
  const [assignmentDate, setAssignmentDate] = useState('');
  const [workStatus, setWorkStatus] = useState('Assigned');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setSelectedTechId(order.assignedTechnicianId || '');
      setTechPhone(order.technicianPhone || '');
      setAssignmentDate(order.assignmentDate || new Date().toISOString().split('T')[0]);
      setWorkStatus(order.workStatus || 'Assigned');
      setNotes(order.workNotes || '');
      setError('');
    }
  }, [order, isOpen]);

  if (!order) return null;

  const handleTechChange = (e) => {
    const techId = e.target.value;
    setSelectedTechId(techId);
    const tech = technicians.find((t) => t.id === techId);
    setTechPhone(tech ? tech.phone : '');
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTechId) {
      setError('Please select a technician');
      return;
    }
    assignTechnician(order.id, selectedTechId, notes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[60]"
      title="Assign Technician to Work Order"
      subtitle={`Order ${order.id} • Customer: ${order.customerName}`}
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
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            Save Assignment
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Order Details summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 font-medium">Customer:</span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5">{order.customerName}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Site Address:</span>
              <p className="text-slate-700 mt-0.5">{order.siteAddress}</p>
            </div>
          </div>
        </div>

        {/* Technician selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Lead Technician <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedTechId}
            onChange={handleTechChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
            } bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium`}
          >
            <option value="">-- Choose active technician --</option>
            {technicians
              .filter((t) => t.status === 'Active')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.specialization} ({t.activeJobsCount} active jobs)
                </option>
              ))}
          </select>
          {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>

        {/* Phone & Assignment Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technician Phone Number
            </label>
            <input
              type="text"
              readOnly
              value={techPhone || 'Select technician above'}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assignment Date
            </label>
            <input
              type="date"
              value={assignmentDate}
              onChange={(e) => setAssignmentDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Work Status (Direct In Progress) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Work Status on Assignment
          </label>
          <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>In Progress (Auto-activated)</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assignment Notes / Instructions for Technician
          </label>
          <textarea
            rows="3"
            placeholder="Enter Assignment Notes / Instructions for Technician"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
};

export default AssignTechnicianModal;

