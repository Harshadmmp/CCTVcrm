import React from 'react';
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  Video,
  CheckCircle2,
  User,
  FileText,
  Receipt,
  MessageSquare,
  Wrench,
  FileCheck2,
  PackageCheck,
  UserCheck,
} from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { formatINR, formatDate, cleanPhoneForDisplay } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const EnquiryDetailsModal = ({
  isOpen,
  onClose,
  enquiryId,
  onOpenSiteVisit,
  onOpenQuotation,
  onOpenPreviewQuotation,
  onOpenDecision,
  onOpenCreateOrder,
  onOpenAssignTechnician,
  onOpenWorkStatus,
  onOpenFollowUp,
  onOpenCreateInvoice,
  onOpenPreviewInvoice,
}) => {
  const { enquiries, quotations, orders, invoices } = useApp();

  const enquiry = enquiries.find((e) => e.id === enquiryId);
  if (!enquiry) return null;

  const quotation = quotations.find((q) => q.id === enquiry.quotationId);
  const order = orders.find((o) => o.id === enquiry.orderId);
  const invoice = invoices.find(
    (i) => i.enquiryId === enquiry.id || (order && i.orderId === order.id)
  );

  const isSiteVisitRequired =
    enquiry.requiresSiteVisit === true ||
    (Boolean(enquiry.siteVisit) && enquiry.requiresSiteVisit !== false);

  // Workflow progress milestones
  const stages = [
    { key: 'Enquiry', label: 'Enquiry Received', done: true },
    ...(isSiteVisitRequired
      ? [
          {
            key: 'SiteVisit',
            label: 'Site Visit',
            done: Boolean(enquiry.siteVisit && enquiry.siteVisit.status === 'Completed'),
            current: !enquiry.siteVisit || enquiry.siteVisit.status !== 'Completed',
          },
        ]
      : []),
    {
      key: 'Quotation',
      label: 'Quotation',
      done: Boolean(quotation && quotation.status !== 'Draft'),
      current:
        (!isSiteVisitRequired || enquiry.siteVisit?.status === 'Completed') &&
        (!quotation || quotation.status === 'Draft'),
    },
    {
      key: 'Approval',
      label: 'Approved',
      done: Boolean(quotation && (quotation.status === 'Approved' || order)),
      current: quotation && quotation.status === 'Sent',
    },
    {
      key: 'Order',
      label: 'Order',
      done: Boolean(order),
      current: quotation?.status === 'Approved' && !order,
    },
    {
      key: 'Installation',
      label: 'Installation',
      done: Boolean(order && order.workStatus === 'Completed'),
      current: order && order.workStatus !== 'Completed',
    },
    {
      key: 'Invoice',
      label: 'Invoiced',
      done: Boolean(invoice && (invoice.status === 'Reviewed' || invoice.status === 'Sent')),
      current: order?.workStatus === 'Completed' && (!invoice || invoice.status === 'Draft'),
    },
  ];

  // Contextual primary action button for the modal footer
  const renderPrimaryAction = () => {
    switch (enquiry.workflowStatus) {
      case 'Pending':
        if (!isSiteVisitRequired) {
          return (
            <button
              type="button"
              onClick={() => onOpenQuotation(enquiry)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Create Quotation</span>
            </button>
          );
        }

        if (!enquiry.siteVisit) {
          return (
            <button
              type="button"
              onClick={() => onOpenSiteVisit(enquiry)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Site Visit</span>
            </button>
          );
        } else if (enquiry.siteVisit.status !== 'Completed') {
          return (
            <button
              type="button"
              onClick={() => onOpenSiteVisit(enquiry)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Update / Complete Site Visit</span>
            </button>
          );
        } else {
          return (
            <button
              type="button"
              onClick={() => onOpenQuotation(enquiry)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Create Quotation</span>
            </button>
          );
        }

      case 'Quotation Sent':
        return (
          <div className="flex items-center gap-2">
            {quotation && (
              <button
                type="button"
                onClick={() => onOpenPreviewQuotation(quotation)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
              >
                Preview Quote
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenDecision(quotation)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Record Customer Decision</span>
            </button>
          </div>
        );

      case 'Customer Approved':
        return (
          <button
            type="button"
            onClick={() => onOpenCreateOrder(quotation)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Create Order from Quotation</span>
          </button>
        );

      case 'Confirmed':
        if (!order?.assignedTechnicianId) {
          return (
            <button
              type="button"
              onClick={() => onOpenAssignTechnician(order)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign Technician</span>
            </button>
          );
        }
        return (
          <button
            type="button"
            onClick={() => onOpenWorkStatus(order)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-nowrap"
          >
            <Wrench className="w-4 h-4" />
            <span>Update Work Status</span>
          </button>
        );

      case 'Ongoing':
        return (
          <button
            type="button"
            onClick={() => onOpenWorkStatus(order)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-nowrap"
          >
            <Wrench className="w-4 h-4" />
            <span>Update Work Status</span>
          </button>
        );

      case 'Completed':
        if (!invoice) {
          return (
            <button
              type="button"
              onClick={() => onOpenCreateInvoice(order)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 whitespace-nowrap"
            >
              <Receipt className="w-4 h-4" />
              <span>Generate Tax Invoice</span>
            </button>
          );
        } else if (invoice.status === 'Draft') {
          return (
            <button
              type="button"
              onClick={() => onOpenPreviewInvoice(invoice)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 whitespace-nowrap"
            >
              <Receipt className="w-4 h-4" />
              <span>Review Invoice</span>
            </button>
          );
        } else {
          return (
            <button
              type="button"
              onClick={() => onOpenPreviewInvoice(invoice)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-2xs transition-all whitespace-nowrap"
            >
              <Receipt className="w-4 h-4" />
              <span>View Invoice</span>
            </button>
          );
        }

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enquiry Details: ${enquiry.id}`}
      subtitle={`${enquiry.customerName} • Status: ${enquiry.workflowStatus}`}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenFollowUp(enquiry)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Add Follow-up</span>
            </button>
            {enquiry.siteVisit && (
              <button
                type="button"
                onClick={() => onOpenSiteVisit(enquiry)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Site Visit</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>
            {renderPrimaryAction()}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Workflow Progress Stepper */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2 scrollbar-none">
            {stages.map((st, idx) => (
              <div key={st.key} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    st.done
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : st.current
                      ? 'bg-blue-50 text-blue-800 border-blue-400 font-bold ring-2 ring-blue-300'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {st.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        st.current ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                  )}
                  <span>{st.label}</span>
                </div>
                {idx < stages.length - 1 && (
                  <div className="w-4 sm:w-6 h-0.5 bg-slate-200 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Clean 2-Column Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Customer & Site Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Customer & Site Details</span>
              </h4>
              <StatusBadge status={enquiry.workflowStatus} />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">
                  Customer Name
                </span>
                <p className="font-bold text-slate-900 text-base mt-0.5">{enquiry.customerName}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">
                    Phone Number
                  </span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${enquiry.phone}`} className="hover:text-blue-600 hover:underline">
                      {cleanPhoneForDisplay(enquiry.phone)}
                    </a>
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">
                    Email Address
                  </span>
                  <p className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {enquiry.email ? (
                      <a href={`mailto:${enquiry.email}`} className="hover:text-blue-600 hover:underline truncate">
                        {enquiry.email}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">
                  Installation Site Address
                </span>
                <p className="font-medium text-slate-800 flex items-start gap-1.5 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{enquiry.siteAddress}</span>
                </p>
              </div>

              {enquiry.cameraCount && (
                <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/70 rounded-lg px-3 py-2">
                  <span className="text-blue-900 font-semibold flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-blue-600" />
                    Estimated Camera Count
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-xs">
                    {enquiry.cameraCount} Cameras
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Workflow Stage & Operational Records */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Workflow Stage & Records</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                Created {formatDate(enquiry.createdAt)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Site Visit Record */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Site Visit Status
                  </span>
                  {enquiry.siteVisit ? (
                    <StatusBadge status={enquiry.siteVisit.status} size="xs" />
                  ) : !isSiteVisitRequired ? (
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Not Required (Direct Quotation)
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Not Scheduled
                    </span>
                  )}
                </div>

                {enquiry.siteVisit ? (
                  <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Visit Date</span>
                      <span className="font-semibold">{formatDate(enquiry.siteVisit.visitDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Time Slot</span>
                      <span className="font-semibold">{enquiry.siteVisit.visitTime || '10:00 AM'}</span>
                    </div>
                    {enquiry.siteVisit.notes && (
                      <div className="col-span-2 pt-1 border-t border-slate-200/80">
                        <span className="text-slate-400 block text-[10px] uppercase">Visit Notes</span>
                        <p className="text-slate-700 italic">{enquiry.siteVisit.notes}</p>
                      </div>
                    )}
                  </div>
                ) : !isSiteVisitRequired ? (
                  <p className="text-[11px] text-slate-500">
                    Client does not require an on-site survey. Direct quotation path is active.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    No site visit scheduled yet. Click below or in the footer to schedule a physical survey.
                  </p>
                )}
              </div>

              {/* Quotation Record */}
              {quotation ? (
                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Quotation: {quotation.id}
                    </span>
                    <StatusBadge status={quotation.status} size="xs" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Grand Total (GST Inc.)</span>
                      <span className="font-bold text-blue-700 text-sm">{formatINR(quotation.grandTotal)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenPreviewQuotation(quotation)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-white hover:bg-blue-100/60 border border-blue-300 rounded shadow-2xs transition-colors"
                    >
                      Preview Quote
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Order & Technician Record */}
              {order ? (
                <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-purple-600" />
                      Work Order: {order.id}
                    </span>
                    <StatusBadge status={order.workStatus} size="xs" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Assigned Technician</span>
                      <span className="font-semibold text-slate-800">
                        {order.technicianName || 'Pending Assignment'}
                      </span>
                    </div>
                    {order.technicianName && (
                      <span className="text-[11px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded">
                        Field Engineer
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Invoice Record */}
              {invoice ? (
                <div className="p-3 rounded-lg border border-violet-200 bg-violet-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-violet-950 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-violet-600" />
                      Tax Invoice: {invoice.id}
                    </span>
                    <StatusBadge status={invoice.status} size="xs" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Invoice Total</span>
                      <span className="font-bold text-violet-800 text-sm">{formatINR(invoice.grandTotal)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenPreviewInvoice(invoice)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-violet-700 bg-white hover:bg-violet-100/60 border border-violet-300 rounded shadow-2xs transition-colors"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Follow-up History (if any recorded) */}
        {enquiry.followUps && enquiry.followUps.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Follow-up History ({enquiry.followUps.length})</span>
            </h4>
            <div className="space-y-2">
              {enquiry.followUps.map((fu) => (
                <div
                  key={fu.id}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800">{fu.outcome}</span>
                    <span className="text-slate-500 ml-2">via {fu.method}</span>
                    <p className="text-slate-600 mt-0.5">{fu.customerResponse}</p>
                  </div>
                  <span className="text-slate-400 text-[11px] font-medium whitespace-nowrap ml-4">
                    {formatDate(fu.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EnquiryDetailsModal;
