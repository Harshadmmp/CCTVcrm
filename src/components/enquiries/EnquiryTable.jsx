import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Calendar,
  FileText,
  PackageCheck,
  UserCheck,
  CheckCircle2,
  Wrench,
  Receipt,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { formatINR, formatDate } from '../../utils/formatters';
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
  const { quotations, orders, invoices, recordCustomerDecision, adminSettings } = useApp();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever tab or enquiries count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, enquiries?.length]);

  const totalItems = enquiries ? enquiries.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * pageSize;

  const paginatedEnquiries = useMemo(() => {
    if (!enquiries) return [];
    return enquiries.slice(startIndex, startIndex + pageSize);
  }, [enquiries, startIndex, pageSize]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (activePage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (activePage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', activePage - 1, activePage, activePage + 1, '...', totalPages];
  }, [totalPages, activePage]);
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
    const quotation = quotations.find(
      (q) => (enquiry.quotationId && q.id === enquiry.quotationId) || q.enquiryId === enquiry.id
    );
    const order = orders.find(
      (o) => (enquiry.orderId && o.id === enquiry.orderId) || o.enquiryId === enquiry.id
    );
    const invoice = order?.invoiceId
      ? invoices?.find((i) => i.id === order.invoiceId)
      : null;

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
              onOpenDetails?.(enquiry);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            title="Open enquiry details & approve or revise quotation"
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
              onOpenDetails?.(enquiry);
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
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPreviewInvoice?.({
                    ...invoice,
                    customerName: enquiry.customerName || invoice.customerName,
                    customerPhone: enquiry.phone || invoice.customerPhone,
                    siteAddress: enquiry.siteAddress || invoice.siteAddress,
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                <span>View Invoice</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const rawPhone = (enquiry.phone || order?.customerPhone || '').replace(/\D/g, '');
                  const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                  const viewUrl = `${window.location.origin}/view-invoice/${invoice.id}`;
                  const companyName = adminSettings?.companyName || 'AP SECURITY SYSTEM';
                  const message = `Hello ${enquiry.customerName},\n\nHere is your Tax Invoice (${invoice.id}) from ${companyName}.\nTotal Amount: ${formatINR(invoice.grandTotal)} (Inclusive of applicable GST).\nDue Date: ${formatDate(invoice.dueDate)}\n\n📄 View & Download your PDF Invoice here:\n${viewUrl}\n\nThank you for choosing ${companyName}!`;
                  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                }}
                className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                title="Send invoice via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        }
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCreateInvoice?.(
                order
                  ? {
                      ...order,
                      customerName: enquiry.customerName || order.customerName,
                      customerPhone: enquiry.phone || order.customerPhone,
                      siteAddress: enquiry.siteAddress || order.siteAddress,
                      quotationId: quotation?.id || order.quotationId,
                      items: (quotation?.items && quotation.items.length > 0) ? quotation.items : order.items,
                      grandTotal: quotation?.grandTotal || order.grandTotal,
                      subtotal: quotation?.subtotal || quotation?.grandTotal || order.grandTotal,
                    }
                  : order
              );
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
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
    <div className="flex flex-col">
      <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200 select-none">
          <tr>
            <th className="py-3 px-4 w-16 text-left font-bold text-slate-800">Sr. No.</th>
            <th className={`py-3 px-4 text-left font-bold text-slate-800 ${showAmount ? 'w-52 min-w-[170px]' : 'w-60 min-w-[190px]'}`}>Customer</th>
            <th className="py-3 px-4 text-left font-bold text-slate-800 w-60 min-w-[200px] max-w-[240px]">Site Address</th>
            {showAmount && <th className="py-3 px-4 text-left font-bold text-slate-800 w-36 min-w-[120px]">Amount</th>}
            {showStatus && <th className="py-3 px-4 text-left font-bold text-slate-800 w-36 min-w-[120px]">Status</th>}
            {showAction && <th className="py-3 px-4 text-left font-bold text-slate-800 w-44 min-w-[150px]">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {paginatedEnquiries.map((enquiry, index) => {
            const quotation = quotations.find(
              (q) => (enquiry.quotationId && q.id === enquiry.quotationId) || q.enquiryId === enquiry.id
            );
            const order = orders.find(
              (o) => (enquiry.orderId && o.id === enquiry.orderId) || o.enquiryId === enquiry.id
            );
            const displayTotal = quotation?.grandTotal || order?.grandTotal || null;
            const serialNumber = startIndex + index + 1;

            return (
              <tr
                key={enquiry.id}
                onClick={() => onOpenDetails(enquiry)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                title="Click anywhere to open enquiry details & actions"
              >
                {/* 1. Serial Number */}
                <td className="py-3.5 px-4 font-semibold text-slate-600 text-xs text-left">
                  {serialNumber}
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
                  <td
                    className="py-3.5 px-4 text-left whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
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

    {/* Pagination Bar */}
    <div className="border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white select-none">
      {/* Left Info: Range & Rows per page */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>
          Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span> to{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(startIndex + pageSize, totalItems)}
          </span>{' '}
          of <span className="font-semibold text-slate-800">{totalItems}</span> entries
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-[11px] text-slate-400">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-0.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Right Controls: Previous, Page Numbers, Next */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={activePage === 1}
            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 text-xs select-none">
                    ...
                  </span>
                );
              }
              const isActive = pageNum === activePage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[28px] h-7 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={activePage === totalPages}
            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  </div>
  );
};

export default EnquiryTable;
