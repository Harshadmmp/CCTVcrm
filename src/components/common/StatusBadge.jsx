import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Send,
  XCircle,
  Wrench,
  Calendar,
  CheckCheck,
} from 'lucide-react';

export const StatusBadge = ({ status, size = 'sm' }) => {
  if (!status) return null;

  const sizeClasses = size === 'xs'
    ? 'px-2 py-0.5 text-[11px]'
    : size === 'md'
    ? 'px-3 py-1 text-xs font-semibold'
    : 'px-2.5 py-0.5 text-xs font-medium';

  const normalized = String(status).trim();

  let config = {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock,
    label: normalized,
  };

  switch (normalized) {
    // Workflow & Site Visit statuses
    case 'Pending':
      config = {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Clock,
        label: 'Pending',
      };
      break;
    case 'Site Visit Scheduled':
    case 'Scheduled':
      config = {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: Calendar,
        label: normalized,
      };
      break;
    case 'Site Visit Completed':
      config = {
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        icon: CheckCircle2,
        label: 'Site Visit Done',
      };
      break;
    case 'Quotation Sent':
      config = {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Send,
        label: 'Quotation Sent',
      };
      break;
    case 'Customer Approved':
    case 'Approved':
      config = {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: CheckCheck,
        label: 'Approved',
      };
      break;
    case 'Confirmed':
      config = {
        bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        icon: UserCheck,
        label: 'Confirmed',
      };
      break;
    case 'Ongoing':
    case 'In Progress':
      config = {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: Wrench,
        label: 'In Progress',
      };
      break;
    case 'Completed':
      config = {
        bg: 'bg-green-50 text-green-800 border-green-200',
        icon: CheckCircle2,
        label: 'Completed',
      };
      break;
    case 'Declined':
    case 'Cancelled':
      config = {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
        label: normalized,
      };
      break;
    case 'Revision Requested':
      config = {
        bg: 'bg-orange-50 text-orange-800 border-orange-200',
        icon: AlertCircle,
        label: 'Revision Requested',
      };
      break;

    // Work statuses
    case 'Assigned':
      config = {
        bg: 'bg-sky-50 text-sky-800 border-sky-200',
        icon: UserCheck,
        label: 'Assigned',
      };
      break;

    // Invoice statuses
    case 'Draft':
      config = {
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        icon: FileText,
        label: 'Draft',
      };
      break;
    case 'Reviewed':
      config = {
        bg: 'bg-violet-50 text-violet-700 border-violet-200',
        icon: CheckCircle2,
        label: 'Reviewed',
      };
      break;
    case 'Sent':
      config = {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Send,
        label: 'Sent',
      };
      break;

    // Active / Inactive
    case 'Active':
      config = {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
        label: 'Active',
      };
      break;
    case 'Inactive':
      config = {
        bg: 'bg-slate-100 text-slate-500 border-slate-200',
        icon: XCircle,
        label: 'Inactive',
      };
      break;

    default:
      config = {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: Clock,
        label: normalized,
      };
  }

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bg} ${sizeClasses} whitespace-nowrap`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;

