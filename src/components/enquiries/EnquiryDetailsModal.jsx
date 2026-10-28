import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  XCircle,
  Edit2,
  Check,
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
  const { enquiries, quotations, orders, invoices, recordCustomerDecision, updateEnquiry } = useApp();

  const enquiry = enquiries.find((e) => e.id === enquiryId);

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    siteAddress: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen && enquiry) {
      setEditForm({
        customerName: enquiry.customerName || '',
        phone: (enquiry.phone || '').replace(/\D/g, '').slice(-10),
        email: enquiry.email || '',
        siteAddress: enquiry.siteAddress || '',
        notes: enquiry.notes || '',
      });
      setIsEditingCustomer(false);
      setFormErrors({});
    }
  }, [isOpen, enquiryId]);

  if (!enquiry) return null;

  const quotation = quotations.find((q) => q.id === enquiry.quotationId);
  const order = orders.find((o) => o.id === enquiry.orderId);
  const invoice = invoices.find(
    (i) => i.enquiryId === enquiry.id || (order && i.orderId === order.id)
  );

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    const errs = {};
    if (!editForm.customerName.trim()) {
      errs.customerName = 'Customer name is required';
    }
    const cleanPhone = editForm.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits';
    }
    if (!editForm.siteAddress.trim()) {
      errs.siteAddress = 'Installation site address is required';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    updateEnquiry(enquiry.id, {
      customerName: editForm.customerName.trim(),
      phone: cleanPhone,
      email: editForm.email.trim(),
      siteAddress: editForm.siteAddress.trim(),
      notes: editForm.notes.trim(),
    });
    setIsEditingCustomer(false);
    setFormErrors({});
  };

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
          <div className="flex items-center gap-2 flex-wrap">
            {quotation && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenQuotation(enquiry, quotation)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                  title="Revise quotation items or pricing"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Revise</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDecision(quotation, 'Declined')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                  title="Mark quotation as declined"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Decline</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenPreviewQuotation(quotation)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  Preview Quote
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                if (quotation) {
                  if (quotation.status !== 'Approved') {
                    recordCustomerDecision(quotation.id, 'Approved', 'Approved by customer (On-call / In-person)');
                  }
                  onOpenCreateOrder({ ...quotation, status: 'Approved' });
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 whitespace-nowrap cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Approve & Create Order</span>
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-nowrap cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Work</span>
          </button>
        );

      case 'Ongoing':
        return (
          <button
            type="button"
            onClick={() => onOpenWorkStatus(order)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 whitespace-nowrap cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Work</span>
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
      subtitle={`${enquiry.customerName} • Created ${formatDate(enquiry.createdAt)}`}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenFollowUp(enquiry)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Add Follow-up</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
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

        {/* Customer & Site Details Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3.5">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Customer & Site Details</span>
              </h4>
              <div className="flex items-center gap-2">
                {!isEditingCustomer && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        customerName: enquiry.customerName || '',
                        phone: (enquiry.phone || '').replace(/\D/g, '').slice(-10),
                        email: enquiry.email || '',
                        siteAddress: enquiry.siteAddress || '',
                        notes: enquiry.notes || '',
                      });
                      setFormErrors({});
                      setIsEditingCustomer(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                    title="Edit Customer Information"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Customer</span>
                  </button>
                )}
                <StatusBadge status={enquiry.workflowStatus} />
              </div>
            </div>

            {isEditingCustomer ? (
              <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
                {/* Customer Name */}
                <div>
                  <label className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.customerName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, customerName: e.target.value }))}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.customerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                    placeholder="Enter customer name"
                  />
                  {formErrors.customerName && (
                    <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.customerName}</p>
                  )}
                </div>

                {/* Phone & Email (2-col grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider mb-1">
                      Phone Number (10 digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={editForm.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setEditForm((prev) => ({ ...prev, phone: val }));
                      }}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                      placeholder="9876543210"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>

                {/* Installation Site Address & Notes (2-col grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider mb-1">
                      Installation Site Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.siteAddress}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, siteAddress: e.target.value }))}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.siteAddress ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                      }`}
                      placeholder="Shop/Flat No., Building, Street, City"
                    />
                    {formErrors.siteAddress && (
                      <p className="mt-1 text-[11px] text-rose-500 font-medium">{formErrors.siteAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wider mb-1">
                      Enquiry Notes / Requirements
                    </label>
                    <textarea
                      rows={2}
                      value={editForm.notes}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Customer specific notes or requirements"
                    />
                  </div>
                </div>

                {/* Action Buttons: Save & Cancel */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingCustomer(false);
                      setFormErrors({});
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">
                      Installation Site Address
                    </span>
                    <p className="font-semibold text-slate-800 flex items-start gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{enquiry.siteAddress}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">
                      Enquiry Notes / Requirements
                    </span>
                    <p className="font-semibold text-slate-800 mt-0.5 leading-relaxed whitespace-pre-wrap">
                      {enquiry.notes || '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

            {enquiry.cameraCount && (
              <div className="mt-3.5 flex items-center justify-between bg-blue-50/70 border border-blue-200/70 rounded-lg px-3 py-2">
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
