import React from 'react';
import { Phone, MapPin, ChevronRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import { formatINR, formatDate, cleanPhoneForDisplay } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const EnquiryTable = ({
  enquiries,
  onOpenDetails,
}) => {
  const { quotations, orders } = useApp();

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
            <th className="py-3 px-4 w-32">Enquiry ID</th>
            <th className="py-3 px-4 min-w-[200px]">Customer</th>
            <th className="py-3 px-4 min-w-[240px]">Site Address</th>
            <th className="py-3 px-3 min-w-[140px]">Amount</th>
            <th className="py-3 px-3 min-w-[130px]">Status</th>
            <th className="py-3 px-4 w-12 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {enquiries.map((enquiry) => {
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
                {/* 1. Enquiry ID */}
                <td className="py-3.5 px-4 font-mono">
                  <span className="font-semibold text-slate-800 block text-xs">
                    {enquiry.id}
                  </span>
                  <span className="block text-[11px] text-slate-400 font-sans mt-0.5">
                    {formatDate(enquiry.createdAt)}
                  </span>
                </td>

                {/* 2. Customer */}
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-slate-900 text-sm block leading-snug">
                    {enquiry.customerName}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>{cleanPhoneForDisplay(enquiry.phone)}</span>
                  </div>
                </td>

                {/* 3. Site Address */}
                <td className="py-3.5 px-4">
                  <div className="flex items-start gap-1.5 text-xs text-slate-600 max-w-sm">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="truncate" title={enquiry.siteAddress}>
                      {enquiry.siteAddress}
                    </span>
                  </div>
                </td>

                {/* 4. Amount */}
                <td className="py-3.5 px-3">
                  {displayTotal ? (
                    <div>
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

                {/* 5. Status */}
                <td className="py-3.5 px-3">
                  <StatusBadge status={enquiry.workflowStatus} />
                </td>

                {/* 6. Click indicator Chevron */}
                <td className="py-3.5 px-4 text-right">
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all ml-auto" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EnquiryTable;
