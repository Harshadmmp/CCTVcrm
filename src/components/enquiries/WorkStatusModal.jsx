import React from 'react';
import { Wrench, CheckCircle2, Clock, CheckSquare, ShieldCheck, MapPin, Phone } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { formatINR, formatDate, cleanPhoneForDisplay } from '../../utils/formatters';

export const WorkStatusModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const checklist = order.checklist || {
    cameraMounting: false,
    cablingConduit: false,
    nvrSetup: false,
    mobileAppConfig: false,
    customerTraining: false,
  };

  const checklistItems = [
    { key: 'cameraMounting', label: 'Camera Physical Mounting & Weatherproof Angle Alignment' },
    { key: 'cablingConduit', label: 'Cat6 Cabling, Conduit Pipe Casing & RJ45 Crimping Tested' },
    { key: 'nvrSetup', label: 'NVR / DVR Storage Setup, Recording Schedule & Resolution Configured' },
    { key: 'mobileAppConfig', label: 'Mobile App Live Streaming & Cloud Remote Access Verified' },
    { key: 'customerTraining', label: 'Customer Handover, Admin Password Transfer & Feeds Sign-off' },
  ];

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const isCompleted = order.workStatus === 'Completed';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[60]"
      title={`Installation Progress: ${order.id}`}
      subtitle={`Customer: ${order.customerName} • Managed by Field Technician`}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-slate-500">
            {isCompleted ? 'Installation finished and verified by technician.' : 'Real-time field status from Technician Portal.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Notice Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
          <Wrench className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-blue-950">Field Execution Handled by Technician</p>
            <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
              Installation kickoff, technical checklist testing, and completion sign-off are exclusively executed by the assigned lead technician from the <strong>Technician Portal</strong>. Office admin can monitor progress here in real time.
            </p>
          </div>
        </div>

        {/* Order & Technician Details Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-slate-500 font-medium block text-[11px]">Customer & Site:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{order.customerName}</p>
            <p className="text-slate-600 text-[11px] flex items-center gap-1 mt-0.5 truncate" title={order.siteAddress}>
              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span>{order.siteAddress}</span>
            </p>
          </div>

          <div>
            <span className="text-slate-500 font-medium block text-[11px]">Lead Technician:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {order.assignedTechnicianName || 'Not Assigned'}
            </p>
            {order.technicianPhone && (
              <p className="text-slate-600 text-[11px] flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span>{cleanPhoneForDisplay(order.technicianPhone)}</span>
              </p>
            )}
          </div>

          <div>
            <span className="text-slate-500 font-medium block text-[11px]">Live Work Status:</span>
            <div className="mt-1">
              <StatusBadge status={order.workStatus} size="sm" />
            </div>
            {order.grandTotal && (
              <p className="text-slate-500 text-[11px] mt-1">
                Order Value: <span className="font-bold text-slate-900">{formatINR(order.grandTotal)}</span>
              </p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 font-bold text-[10px] uppercase block">Start Date</span>
            <span className="text-xs font-semibold text-slate-800">
              {order.startDate ? formatDate(order.startDate) : 'Pending technician kickoff'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-bold text-[10px] uppercase block">Completion Date</span>
            <span className="text-xs font-semibold text-slate-800">
              {order.completionDate ? formatDate(order.completionDate) : 'In progress with technician'}
            </span>
          </div>
        </div>

        {/* Technician Checklist (Read-Only) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Field Technical Checklist</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {completedCount} of 5 verified
            </span>
          </div>

          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {checklistItems.map((chk) => {
              const checked = Boolean(checklist[chk.key]);
              return (
                <div
                  key={chk.key}
                  className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs transition-colors ${
                    checked
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-medium'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  {checked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={checked ? 'text-slate-900' : 'text-slate-500'}>
                    {chk.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technician Notes */}
        <div>
          <span className="text-slate-700 font-bold text-xs block mb-1">
            Technician Handover & Progress Notes:
          </span>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 min-h-[50px] leading-relaxed">
            {order.workNotes ? (
              <p>{order.workNotes}</p>
            ) : (
              <p className="text-slate-400 italic">No notes recorded yet by technician.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WorkStatusModal;
