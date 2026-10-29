import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Eye,
  Calendar,
  FileText,
  FileCheck2,
  PackageCheck,
  UserCheck,
  Wrench,
  CheckCircle2,
  Receipt,
  PhoneCall,
  Edit,
  Send,
  AlertCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EnquiryActions = ({
  enquiry,
  onOpenDetails,
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
  const { quotations, orders, invoices, recordCustomerDecision, createOrderFromQuotation } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const quotation = quotations.find(
    (q) => (enquiry.quotationId && q.id === enquiry.quotationId) || q.enquiryId === enquiry.id
  );
  const order = orders.find(
    (o) => (enquiry.orderId && o.id === enquiry.orderId) || o.enquiryId === enquiry.id
  );
  const invoice = order?.invoiceId
    ? invoices.find((i) => i.id === order.invoiceId)
    : null;

  const isSiteVisitRequired =
    enquiry.requiresSiteVisit === true ||
    (Boolean(enquiry.siteVisit) && enquiry.requiresSiteVisit !== false);

  const canCreateQuotation =
    !isSiteVisitRequired || (enquiry.siteVisit && enquiry.siteVisit.status === 'Completed');

  // Render contextual primary action button based on workflow stage
  const renderPrimaryAction = () => {
    switch (enquiry.workflowStatus) {
      case 'Pending':
        if (!isSiteVisitRequired) {
          return (
            <button
              type="button"
              onClick={() => onOpenQuotation(enquiry)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              Create Quote
            </button>
          );
        } else if (!enquiry.siteVisit) {
          return (
            <button
              type="button"
              onClick={() => onOpenSiteVisit(enquiry)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              Schedule Visit
            </button>
          );
        } else if (enquiry.siteVisit.status !== 'Completed') {
          return (
            <button
              type="button"
              onClick={() => onOpenSiteVisit(enquiry)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              Update Visit
            </button>
          );
        } else {
          // Site visit is completed! Can create quotation now
          return (
            <button
              type="button"
              onClick={() => onOpenQuotation(enquiry)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              Create Quote
            </button>
          );
        }

      case 'Quotation Sent':
        return (
          <button
            type="button"
            onClick={() => onOpenDetails?.(enquiry)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            title="Open enquiry details & approve or revise quotation"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            Approve & Order
          </button>
        );

      case 'Customer Approved':
        return (
          <button
            type="button"
            onClick={() => onOpenDetails?.(enquiry)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            Create Order
          </button>
        );

      case 'Confirmed':
        if (!order?.assignedTechnicianId) {
          return (
            <button
              type="button"
              onClick={() => onOpenAssignTechnician(order)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Assign Tech
            </button>
          );
        }
        return (
          <button
            type="button"
            onClick={() => onOpenWorkStatus(order)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Complete Work
          </button>
        );

      case 'Ongoing':
        return (
          <button
            type="button"
            onClick={() => onOpenWorkStatus(order)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Complete Work
          </button>
        );

      case 'Completed':
        if (!invoice) {
          return (
            <button
              type="button"
              onClick={() => onOpenCreateInvoice(order)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <Receipt className="w-3.5 h-3.5" />
              Create Invoice
            </button>
          );
        } else if (invoice.status === 'Draft') {
          return (
            <button
              type="button"
              onClick={() => onOpenPreviewInvoice(invoice)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <Receipt className="w-3.5 h-3.5" />
              Review Invoice
            </button>
          );
        } else {
          return (
            <button
              type="button"
              onClick={() => onOpenPreviewInvoice(invoice)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5" />
              View Invoice
            </button>
          );
        }

      default:
        return (
          <button
            type="button"
            onClick={() => onOpenDetails(enquiry)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
        );
    }
  };

  return (
    <div className="flex items-center justify-end gap-1.5 relative">
      {/* Primary Action Button */}
      {renderPrimaryAction()}

      {/* 3-Dot More Actions Menu */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="More actions"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-fadeIn text-xs">
            {/* View Details always available */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenDetails(enquiry);
              }}
              className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span>View Full Details</span>
            </button>

            {/* Edit Customer Details */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenDetails(enquiry);
              }}
              className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              <Edit className="w-4 h-4 text-blue-600" />
              <span>Edit Customer Details</span>
            </button>

            {/* Follow-up always available */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenFollowUp(enquiry);
              }}
              className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700"
            >
              <PhoneCall className="w-4 h-4 text-blue-500" />
              <span>Add Follow-up</span>
            </button>

            {/* Site Visit */}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onOpenSiteVisit(enquiry);
              }}
              className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700"
            >
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{enquiry.siteVisit ? 'Edit Site Visit' : 'Schedule Site Visit'}</span>
            </button>

            {/* Quotation Actions */}
            {quotation ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenPreviewQuotation(quotation);
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Preview Quotation</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenQuotation(enquiry, quotation);
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-amber-700 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                  <span>Revise / Edit Quote</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenDecision(quotation, 'Declined');
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-600 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Customer Declined</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={!canCreateQuotation}
                onClick={() => {
                  setMenuOpen(false);
                  onOpenQuotation(enquiry);
                }}
                className={`w-full px-3.5 py-2 text-left flex items-center gap-2 ${
                  canCreateQuotation
                    ? 'hover:bg-slate-50 text-slate-700'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title={!canCreateQuotation ? 'Requires completed site visit' : 'Draft quotation'}
              >
                <FileText className="w-4 h-4" />
                <span>Create Quotation {!canCreateQuotation && '(Locked)'}</span>
              </button>
            )}

            {/* Order & Technician Actions */}
            {order && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenAssignTechnician(order);
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                >
                  <UserCheck className="w-4 h-4 text-cyan-600" />
                  <span>Assign / Change Tech</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenWorkStatus(order);
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Complete Work</span>
                </button>
              </>
            )}

            {/* Invoice Actions */}
            {invoice && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPreviewInvoice(invoice);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700"
              >
                <Receipt className="w-4 h-4 text-violet-600" />
                <span>View Tax Invoice</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiryActions;

