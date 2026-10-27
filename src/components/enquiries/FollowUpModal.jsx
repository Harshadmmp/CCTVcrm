import React, { useState } from 'react';
import { PhoneCall } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

export const FollowUpModal = ({ isOpen, onClose, enquiry }) => {
  const { addFollowUp } = useApp();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('Phone');
  const [outcome, setOutcome] = useState('Interested');
  const [customerResponse, setCustomerResponse] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!enquiry) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerResponse.trim()) {
      setError('Please record the customer response');
      return;
    }

    addFollowUp(enquiry.id, {
      date,
      method,
      outcome,
      customerResponse,
      nextDate: nextDate || null,
      notes,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[60]"
      title="Log Customer Follow-up"
      subtitle={`Enquiry ${enquiry.id} • ${enquiry.customerName}`}
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
            <PhoneCall className="w-4 h-4" />
            Save Follow-up
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Customer header */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800 text-sm">{enquiry.customerName}</p>
              <p className="text-slate-600">{enquiry.phone}</p>
            </div>
            <span className="text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200 font-mono text-[11px]">
              {enquiry.id}
            </span>
          </div>
        </div>

        {/* Date & Contact Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Follow-up Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Phone">Phone Call</option>
              <option value="WhatsApp">WhatsApp Message / Call</option>
              <option value="Email">Email Communication</option>
              <option value="In Person">In Person Site Discussion</option>
            </select>
          </div>
        </div>

        {/* Outcome & Next Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Follow-up Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Interested">Customer Highly Interested</option>
              <option value="Quotation Review">Under Management Review</option>
              <option value="Site Visit Requested">Site Visit Requested</option>
              <option value="Negotiation">Price Negotiation Underway</option>
              <option value="Postponed">Postponed to Later Date</option>
              <option value="Not Reachable">Did Not Answer / Busy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Next Scheduled Follow-up Date
            </label>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Customer Response */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer Response / Conversation Summary <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows="3"
            placeholder="Enter Customer Response / Conversation Summary"
            value={customerResponse}
            onChange={(e) => {
              setCustomerResponse(e.target.value);
              if (error) setError('');
            }}
            className={`w-full px-3 py-2 text-xs rounded-lg border ${
              error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Internal Office Notes
          </label>
          <textarea
            rows="2"
            placeholder="Enter Internal Office Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
};

export default FollowUpModal;

