import React from 'react';
import {
  MapPin,
  Calendar,
  FileText,
  PackageCheck,
  UserCheck,
  CheckCircle2,
  Wrench,
  Receipt,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { formatINR } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const EnquiryTable = ({
  enquiries,
  activeTab = 'All',
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
  const { quotations, orders, invoices, recordCustomerDecision } = useApp();
  const showAmount =
    activeTab !== 'Pending' &&
    activeTab !== 'Quotation Sent' &&
    activeTab !== 'All' &&
    activeTab !== 'Confirmed' &&
    activeTab !== 'Ongoing';
  const showStatus =
    activeTab !== 'Pending' &&
    activeTab !== 'Confirmed' &&
    activeTab !== 'Ongoing' &&
    activeTab !== 'Completed';
  const showAction = activeTab !== 'All';

  const renderRowAction = (enquiry) => {
    const quotation = quotations.find((q) => q.id === enquiry.quotationId);
    const order = orders.find((o) => o.id === enquiry.orderId);
    const invoice = invoices?.find(
      (i) => i.enquiryId === enquiry.id || (order && i.orderId === order.id)
    );

    const isSiteVisitRequired =
      enquiry.requiresSiteVisit === true ||
      (Boolean(enquiry.siteVisit) && enquiry.requiresSiteVisit !== false);

    const isSiteVisitDone = Boolean(enquiry.siteVisit && enquiry.siteVisit.status === 'Completed');

    switch (enquiry.workflowStatus) {
      case 'Pending':
        if (isSiteVisitRequired && !isSiteVisitDone) {
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSiteVisit?.(enquiry);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
              title="Site Visit Required - Schedule or view visit"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Site Visit</span>
            </button>
          );
        }
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuotation?.(enquiry);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            title="Create formal quotation"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Create Quotation</span>
          </button>
        );

      case 'Quotation Sent':
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (quotation) {
                if (quotation.status !== 'Approved') {
                  recordCustomerDecision?.(
                    quotation.id,
                    'Approved',
                    'Approved by customer (On-call / In-person)'
                  );
                }
                onOpenCreateOrder?.({ ...quotation, status: 'Approved' });
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            title="Approve quotation & create work order"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Approve & Order</span>
          </button>
        );

      case 'Customer Approved':
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCreateOrder?.(quotation);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Create Order</span>
          </button>
        );

      case 'Confirmed':
        if (!order?.assignedTechnicianId) {
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAssignTechnician?.(order);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign Tech</span>
            </button>
          );
        }
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenWorkStatus?.(order);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            title="Complete installation work"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete Work</span>
          </button>
        );

      case 'Ongoing':
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenWorkStatus?.(order);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            title="Complete installation work"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Complete Work</span>
          </button>
        );

      case 'Completed':
        if (invoice) {
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPreviewInvoice?.(invoice);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Invoice</span>
            </button>
          );
        }
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCreateInvoice?.(order);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Generate Invoice</span>
          </button>
        );

      default:
        return null;
    }
  };

  if (!enquiries || enquiries.length === 0) {
    return (
      <EmptyState
        title="No matching enquiries"
        description="Try clearing your search query or switching workflow status tabs."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200 select-none">
          <tr>
            <th className="py-3 px-4 w-16 text-left">Sr. No.</th>
            <th className={`py-3 px-4 text-left ${showAmount ? 'w-52 min-w-[170px]' : 'w-60 min-w-[190px]'}`}>Customer</th>
            <th className="py-3 px-4 text-left w-60 min-w-[200px] max-w-[240px]">Site Address</th>
            {showAmount && <th className="py-3 px-4 text-left w-36 min-w-[120px]">Amount</th>}
            {showStatus && <th className="py-3 px-4 text-left w-36 min-w-[120px]">Status</th>}
            {showAction && <th className="py-3 px-4 text-left w-44 min-w-[150px]">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {enquiries.map((enquiry, index) => {
            const quotation = quotations.find((q) => q.id === enquiry.quotationId);
            const order = orders.find((o) => o.id === enquiry.orderId);
            const displayTotal = order?.grandTotal || quotation?.grandTotal || null;

            return (
              <tr
                key={enquiry.id}
                onClick={() => onOpenDetails(enquiry)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                title="Click anywhere to open enquiry details & actions"
              >
                {/* 1. Serial Number */}
                <td className="py-3.5 px-4 font-semibold text-slate-600 text-xs text-left">
                  {index + 1}
                </td>

                {/* 2. Customer */}
                <td className="py-3.5 px-4 text-left">
                  <span
                    className="font-semibold text-slate-900 text-sm block leading-snug truncate text-left"
                    title={enquiry.customerName}
                  >
                    {enquiry.customerName}
                  </span>
                </td>

                {/* 3. Site Address (2 lines) */}
                <td className="py-3.5 px-4 text-left">
                  <div className="flex items-start justify-start gap-1.5 text-xs text-slate-600 w-[210px] max-w-[220px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span
                      className="line-clamp-2 break-words leading-snug text-slate-700 text-left"
                      title={enquiry.siteAddress}
                    >
                      {enquiry.siteAddress}
                    </span>
                  </div>
                </td>

                {/* 4. Amount (Hidden for Pending tab) */}
                {showAmount && (
                  <td className="py-3.5 px-4 text-left whitespace-nowrap">
                    {displayTotal ? (
                      <div className="text-left">
                        <span className="font-bold text-slate-900 text-sm block">
                          {formatINR(displayTotal)}
                        </span>
                        {quotation && (
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {quotation.id}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">—</span>
                    )}
                  </td>
                )}

                {/* 5. Status (Hidden for Pending tab) */}
                {showStatus && (
                  <td className="py-3.5 px-4 whitespace-nowrap text-left">
                    <div className="inline-flex items-center justify-start">
                      <StatusBadge status={enquiry.workflowStatus} />
                    </div>
                  </td>
                )}

                {/* 6. Action Button (Hidden on 'All' tab, visible on remaining tabs) */}
                {showAction && (
                  <td className="py-3.5 px-4 text-left whitespace-nowrap">
                    <div
                      className="inline-flex items-center justify-start"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderRowAction(enquiry)}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EnquiryTable;
