import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Layers,
  Clock,
  Send,
  Wrench,
  CheckCircle2,
  FileText,
  Plus,
  ArrowRight,
  Calendar,
  AlertCircle,
  Building,
  User,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SummaryCard from '../common/SummaryCard';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatINR } from '../../utils/formatters';
import EnquiryDetailsModal from '../enquiries/EnquiryDetailsModal';
import AddEnquiryModal from '../enquiries/AddEnquiryModal';

export const DashboardPage = () => {
  const { enquiries, metrics, quotations, orders, invoices, technicians } = useApp();
  const navigate = useNavigate();
  const outletContext = useOutletContext();

  const [isAddEnquiryOpen, setIsAddEnquiryOpen] = useState(false);
  const [detailsEnquiryId, setDetailsEnquiryId] = useState(null);

  // Upcoming site visits
  const upcomingVisits = enquiries
    .filter((e) => e.siteVisit && (e.siteVisit.status === 'Scheduled' || e.siteVisit.status === 'Rescheduled'))
    .slice(0, 4);

  // Recent 5 enquiries
  const recentEnquiries = enquiries.slice(0, 5);

  // Recent activity aggregated from workStatusHistory
  const recentActivity = enquiries
    .flatMap((e) =>
      (e.workStatusHistory || []).map((h) => ({
        ...h,
        enquiryId: e.id,
        customerName: e.customerName,
      }))
    )
    .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Summary Cards Grid (6 cards required by Section 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <SummaryCard
          title="Total Enquiries"
          value={metrics.totalEnquiries}
          icon={Layers}
          variant="blue"
          onClick={() => navigate('/workflow')}
        />
        <SummaryCard
          title="Pending Visits"
          value={metrics.pendingSiteVisits}
          icon={Clock}
          variant="amber"
          onClick={() => navigate('/workflow')}
        />
        <SummaryCard
          title="Quotes Awaiting"
          value={metrics.quotationsAwaitingApproval}
          icon={Send}
          variant="indigo"
          onClick={() => navigate('/workflow')}
        />
        <SummaryCard
          title="Active Jobs"
          value={metrics.activeJobs}
          icon={Wrench}
          variant="purple"
          onClick={() => navigate('/workflow')}
        />
        <SummaryCard
          title="Completed"
          value={metrics.completedJobs}
          icon={CheckCircle2}
          variant="emerald"
          onClick={() => navigate('/workflow')}
        />
        <SummaryCard
          title="Pending Invoice"
          value={metrics.invoicesPendingReview}
          icon={FileText}
          variant="slate"
          onClick={() => navigate('/workflow')}
        />
      </div>

      {/* Bottom Grid: Recent Enquiries, Upcoming Visits & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Enquiries Table (2 columns on large screen) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Customer Enquiries</h3>
              <p className="text-xs text-slate-500">Latest business inquiries in system</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/workflow')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">ID</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-3">Requirement</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 w-10 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEnquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    onClick={() => setDetailsEnquiryId(enq.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    title="Click anywhere to open enquiry details & actions"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {enq.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{enq.customerName}</p>
                      <p className="text-[11px] text-slate-500">{enq.phone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800">{enq.requirement}</span>
                      <span className="block text-[11px] text-slate-500">{enq.cameraCount ? `${enq.cameraCount} Cams` : 'Scope TBD'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={enq.workflowStatus} size="xs" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Site Visits & Recent Activity */}
        <div className="space-y-5">
          {/* Upcoming Visits */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
              <span>Upcoming Site Visits</span>
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                {upcomingVisits.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">Field surveys scheduled</p>

            <div className="space-y-2.5">
              {upcomingVisits.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No pending visits scheduled.</p>
              ) : (
                upcomingVisits.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">{v.customerName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(v.siteVisit?.visitDate)} • {v.siteVisit?.visitTime}</span>
                      </p>
                      <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                        Tech: {v.siteVisit?.staffOrTechName || 'Assign Staff'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/workflow')}
                      className="text-[11px] text-blue-600 hover:underline font-semibold flex-shrink-0"
                    >
                      Open
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Recent Activity</h3>
            <p className="text-xs text-slate-500 mb-3">Latest audit transitions</p>
            <div className="space-y-3">
              {recentActivity.map((act) => (
                <div key={act.id} className="text-xs flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 font-medium truncate">
                      <span className="font-bold">{act.customerName}</span>: {act.status}
                    </p>
                    <p className="text-[11px] text-slate-400">{act.timestamp} • {act.updatedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Enquiry Modal */}
      <AddEnquiryModal
        isOpen={isAddEnquiryOpen}
        onClose={() => setIsAddEnquiryOpen(false)}
      />

      {/* Dossier Modal */}
      {detailsEnquiryId && (
        <EnquiryDetailsModal
          isOpen={Boolean(detailsEnquiryId)}
          onClose={() => setDetailsEnquiryId(null)}
          enquiryId={detailsEnquiryId}
          onOpenSiteVisit={() => navigate('/workflow')}
          onOpenQuotation={() => navigate('/workflow')}
          onOpenPreviewQuotation={() => navigate('/workflow')}
          onOpenDecision={() => navigate('/workflow')}
          onOpenCreateOrder={() => navigate('/workflow')}
          onOpenAssignTechnician={() => navigate('/workflow')}
          onOpenWorkStatus={() => navigate('/workflow')}
          onOpenFollowUp={() => navigate('/workflow')}
          onOpenCreateInvoice={() => navigate('/workflow')}
          onOpenPreviewInvoice={() => navigate('/workflow')}
        />
      )}
    </div>
  );
};

export default DashboardPage;

