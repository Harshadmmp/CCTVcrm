import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import EnquiryTable from './EnquiryTable';
import AddEnquiryModal from './AddEnquiryModal';
import SiteVisitModal from './SiteVisitModal';
import QuotationModal from './QuotationModal';
import QuotationPreviewModal from './QuotationPreviewModal';
import CustomerDecisionModal from './CustomerDecisionModal';
import CreateOrderModal from './CreateOrderModal';
import AssignTechnicianModal from './AssignTechnicianModal';
import WorkStatusModal from './WorkStatusModal';
import FollowUpModal from './FollowUpModal';
import InvoiceModal from './InvoiceModal';
import InvoicePreviewModal from './InvoicePreviewModal';
import EnquiryDetailsModal from './EnquiryDetailsModal';

export const EnquiryWorkbench = () => {
  const { enquiries, metrics, technicians, quotations, orders, invoices } = useApp();

  // Filter States
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'Quotation Sent', 'Confirmed', 'Ongoing', 'Completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddEnquiryOpen, setIsAddEnquiryOpen] = useState(false);
  const [detailsEnquiryId, setDetailsEnquiryId] = useState(null);
  const [siteVisitEnquiry, setSiteVisitEnquiry] = useState(null);
  const [quotationEnquiry, setQuotationEnquiry] = useState(null);
  const [quotationToEdit, setQuotationToEdit] = useState(null);
  const [previewQuotation, setPreviewQuotation] = useState(null);
  const [decisionQuotation, setDecisionQuotation] = useState(null);
  const [decisionInitial, setDecisionInitial] = useState('Approved');
  const [orderQuotation, setOrderQuotation] = useState(null);
  const [technicianOrder, setTechnicianOrder] = useState(null);
  const [workStatusOrder, setWorkStatusOrder] = useState(null);
  const [followUpEnquiry, setFollowUpEnquiry] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: enquiries.length,
      Pending: enquiries.filter((e) => e.workflowStatus === 'Pending').length,
      'Quotation Sent': enquiries.filter((e) => e.workflowStatus === 'Quotation Sent').length,
      Confirmed: enquiries.filter(
        (e) => e.workflowStatus === 'Confirmed' || e.workflowStatus === 'Customer Approved'
      ).length,
      Ongoing: enquiries.filter((e) => e.workflowStatus === 'Ongoing').length,
      Completed: enquiries.filter((e) => e.workflowStatus === 'Completed').length,
    };
  }, [enquiries]);

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      // 1. Workflow Tab Filter
      if (activeTab === 'Pending' && item.workflowStatus !== 'Pending') return false;
      if (activeTab === 'Quotation Sent' && item.workflowStatus !== 'Quotation Sent') return false;
      if (
        activeTab === 'Confirmed' &&
        item.workflowStatus !== 'Confirmed' &&
        item.workflowStatus !== 'Customer Approved'
      )
        return false;
      if (activeTab === 'Ongoing' && item.workflowStatus !== 'Ongoing') return false;
      if (activeTab === 'Completed' && item.workflowStatus !== 'Completed') return false;

      // 2. Search (Phone Number, Customer Name, Enquiry ID, Address)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const cleanQuery = query.replace(/\D/g, '');
        const cleanItemPhone = (item.phone || '').replace(/\D/g, '');
        const matchesName = item.customerName.toLowerCase().includes(query);
        const matchesPhone =
          item.phone.toLowerCase().includes(query) ||
          (cleanQuery.length >= 2 && cleanItemPhone.includes(cleanQuery));
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesAddress = item.siteAddress.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesId && !matchesAddress) return false;
      }

      return true;
    });
  }, [enquiries, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Workflow Tabs + Search Bar in same row (No horizontal scrollbar) */}
        <div className="border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50">
          {/* Tabs without scrollbar */}
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'All', label: 'All' },
              { id: 'Pending', label: 'Pending' },
              { id: 'Quotation Sent', label: 'Quotation Sent' },
              { id: 'Confirmed', label: 'Confirmed / Approved' },
              { id: 'Ongoing', label: 'Ongoing' },
              { id: 'Completed', label: 'Completed' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              const count = tabCounts[tab.id] || 0;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ fontSize: '0.85rem' }}
                  className={`inline-flex items-center gap-1.5 py-1.5 px-2.5 text-[0.85rem] font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span style={{ fontSize: '0.85rem' }}>{tab.label}</span>
                  <span
                    style={{ fontSize: '0.75rem' }}
                    className={`px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar in same line after filters */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by phone, name, ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem' }}
              className="w-full pl-9 pr-8 py-1.5 text-[0.85rem] rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Enquiries Table */}
        <EnquiryTable
          enquiries={filteredEnquiries}
          onOpenDetails={(enq) => setDetailsEnquiryId(enq.id)}
          onOpenSiteVisit={(enq) => setSiteVisitEnquiry(enq)}
          onOpenQuotation={(enq, qToEdit = null) => {
            const existingQ = qToEdit || quotations.find((q) => q.id === enq.quotationId);
            setQuotationToEdit(existingQ || null);
            setQuotationEnquiry(enq);
          }}
          onOpenPreviewQuotation={(q) => setPreviewQuotation(q)}
          onOpenDecision={(q, initial = 'Approved') => {
            setDecisionQuotation(q);
            setDecisionInitial(initial);
          }}
          onOpenCreateOrder={(q) => setOrderQuotation(q)}
          onOpenAssignTechnician={(ord) => setTechnicianOrder(ord)}
          onOpenWorkStatus={(ord) => setWorkStatusOrder(ord)}
          onOpenFollowUp={(enq) => setFollowUpEnquiry(enq)}
          onOpenCreateInvoice={(ord) => setInvoiceOrder(ord)}
          onOpenPreviewInvoice={(inv) => setPreviewInvoice(inv)}
        />
      </div>

      {/* --- Routine Centered Modals --- */}
      {/* 1. Base Dossier Details Modal (Rendered first so child action forms sit in front) */}
      {detailsEnquiryId && (
        <EnquiryDetailsModal
          isOpen={Boolean(detailsEnquiryId)}
          onClose={() => setDetailsEnquiryId(null)}
          enquiryId={detailsEnquiryId}
          onOpenSiteVisit={(enq) => setSiteVisitEnquiry(enq)}
          onOpenQuotation={(enq, qToEdit = null) => {
            const existingQ = qToEdit || quotations.find((q) => q.id === enq.quotationId);
            setQuotationToEdit(existingQ || null);
            setQuotationEnquiry(enq);
          }}
          onOpenPreviewQuotation={(q) => setPreviewQuotation(q)}
          onOpenDecision={(q, initial = 'Approved') => {
            setDecisionQuotation(q);
            setDecisionInitial(initial);
          }}
          onOpenCreateOrder={(q) => setOrderQuotation(q)}
          onOpenAssignTechnician={(ord) => setTechnicianOrder(ord)}
          onOpenWorkStatus={(ord) => setWorkStatusOrder(ord)}
          onOpenFollowUp={(enq) => setFollowUpEnquiry(enq)}
          onOpenCreateInvoice={(ord) => setInvoiceOrder(ord)}
          onOpenPreviewInvoice={(inv) => setPreviewInvoice(inv)}
        />
      )}

      {/* 2. Add Enquiry Modal */}
      <AddEnquiryModal
        isOpen={isAddEnquiryOpen}
        onClose={() => setIsAddEnquiryOpen(false)}
      />

      {/* 3. Site Visit Modal */}
      {siteVisitEnquiry && (
        <SiteVisitModal
          isOpen={Boolean(siteVisitEnquiry)}
          onClose={() => setSiteVisitEnquiry(null)}
          enquiry={siteVisitEnquiry}
        />
      )}

      {/* 4. Quotation Modal */}
      {quotationEnquiry && (
        <QuotationModal
          isOpen={Boolean(quotationEnquiry)}
          onClose={() => {
            setQuotationEnquiry(null);
            setQuotationToEdit(null);
          }}
          enquiry={quotationEnquiry}
          quotationToEdit={quotationToEdit}
          onOpenPreview={(q) => {
            setPreviewQuotation(q);
          }}
        />
      )}

      {/* 5. Quotation Preview Modal */}
      {previewQuotation && (
        <QuotationPreviewModal
          isOpen={Boolean(previewQuotation)}
          onClose={() => setPreviewQuotation(null)}
          quotation={previewQuotation}
          onBackToEdit={() => {
            const enq = enquiries.find((e) => e.id === previewQuotation.enquiryId);
            setQuotationEnquiry(enq);
            setQuotationToEdit(previewQuotation);
            setPreviewQuotation(null);
          }}
          onOpenCustomerDecision={(q, initial = 'Approved') => {
            setDecisionQuotation(q);
            setDecisionInitial(initial);
            setPreviewQuotation(null);
          }}
          onOpenCreateOrder={(q) => {
            setOrderQuotation(q);
            setPreviewQuotation(null);
          }}
        />
      )}

      {/* 6. Customer Decision Modal */}
      {decisionQuotation && (
        <CustomerDecisionModal
          isOpen={Boolean(decisionQuotation)}
          onClose={() => setDecisionQuotation(null)}
          quotation={decisionQuotation}
          initialDecision={decisionInitial}
        />
      )}

      {/* 7. Create Order Modal */}
      {orderQuotation && (
        <CreateOrderModal
          isOpen={Boolean(orderQuotation)}
          onClose={() => setOrderQuotation(null)}
          quotation={orderQuotation}
        />
      )}

      {/* 8. Assign Technician Modal */}
      {technicianOrder && (
        <AssignTechnicianModal
          isOpen={Boolean(technicianOrder)}
          onClose={() => setTechnicianOrder(null)}
          order={technicianOrder}
        />
      )}

      {/* 9. Work Status Modal */}
      {workStatusOrder && (
        <WorkStatusModal
          isOpen={Boolean(workStatusOrder)}
          onClose={() => setWorkStatusOrder(null)}
          order={workStatusOrder}
        />
      )}

      {/* 10. Follow-up Modal */}
      {followUpEnquiry && (
        <FollowUpModal
          isOpen={Boolean(followUpEnquiry)}
          onClose={() => setFollowUpEnquiry(null)}
          enquiry={followUpEnquiry}
        />
      )}

      {/* 11. Invoice Modal */}
      {invoiceOrder && (
        <InvoiceModal
          isOpen={Boolean(invoiceOrder)}
          onClose={() => setInvoiceOrder(null)}
          order={invoiceOrder}
          onOpenPreview={(draftInv) => {
            setPreviewInvoice(draftInv);
          }}
        />
      )}

      {/* 12. Invoice Preview Modal */}
      {previewInvoice && (
        <InvoicePreviewModal
          isOpen={Boolean(previewInvoice)}
          onClose={() => setPreviewInvoice(null)}
          invoice={previewInvoice}
        />
      )}
    </div>
  );
};

export default EnquiryWorkbench;

