import React, { useState, useEffect } from 'react';
import { CheckCheck, XCircle, RefreshCw, Clock } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/formatters';

export const CustomerDecisionModal = ({ isOpen, onClose, quotation, initialDecision = 'Approved' }) => {
  const { recordCustomerDecision } = useApp();

  const [decision, setDecision] = useState('Approved');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (quotation) {
      setDecision(initialDecision || (quotation.status === 'Approved' ? 'Approved' : 'Approved'));
      setNotes(quotation.decisionNotes || '');
    }
  }, [quotation, isOpen, initialDecision]);

  if (!quotation) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    recordCustomerDecision(quotation.id, decision, notes);
    onClose();
  };

  const decisionOptions = [
    {
      value: 'Approved',
      label: 'Customer Approved',
      icon: CheckCheck,
      color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
      description: 'Customer accepted the pricing and terms. Enables immediate Order Creation.',
    },
    {
      value: 'Revision Requested',
      label: 'Revision Requested',
      icon: RefreshCw,
      color: 'border-orange-500 bg-orange-50 text-orange-900',
      description: 'Customer requested changes in camera count, pricing, or specifications.',
    },
    {
      value: 'Declined',
      label: 'Customer Declined',
      icon: XCircle,
      color: 'border-rose-500 bg-rose-50 text-rose-900',
      description: 'Customer cancelled the requirement or chose an alternative vendor.',
    },
    {
      value: 'Awaiting Response',
      label: 'Awaiting Response',
      icon: Clock,
      color: 'border-slate-300 bg-slate-50 text-slate-800',
      description: 'Quotation remains under client review.',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[60]"
      title="Record Customer Decision"
      subtitle={`Quotation ${quotation.id} • ${quotation.customerName} (${formatINR(quotation.grandTotal)})`}
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
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Save Decision
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Customer Decision <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {decisionOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = decision === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setDecision(opt.value)}
                  className={`cursor-pointer p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? `${opt.color} ring-2 ring-blue-500`
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs font-bold">{opt.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                    {opt.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Decision Notes & Communication Record
          </label>
          <textarea
            rows="3"
            placeholder="Enter Decision Notes & Communication Record"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {decision === 'Approved' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4" /> Ready for Work Order Creation
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-700">
              Saving this approval will transition the workflow stage to "Customer Approved" and unlock the "Create Order" action button.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CustomerDecisionModal;

