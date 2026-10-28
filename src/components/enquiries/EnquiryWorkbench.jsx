import React, { useState, useMemo } from 'react';
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
  const {
    enquiries,
    metrics,
    technicians,
    quotations,
    orders,
    invoices,
    activeWorkflowTab,
    workflowSearchQuery,
  } = useApp();

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

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      // 1. Workflow Tab Filter
      if (activeWorkflowTab === 'Pending' && item.workflowStatus !== 'Pending') return false;
      if (activeWorkflowTab === 'Quotation Sent' && item.workflowStatus !== 'Quotation Sent') return false;
      if (
        activeWorkflowTab === 'Confirmed' &&
        item.workflowStatus !== 'Confirmed' &&
        item.workflowStatus !== 'Customer Approved'
      )
        return false;
      if (activeWorkflowTab === 'Ongoing' && item.workflowStatus !== 'Ongoing') return false;
      if (activeWorkflowTab === 'Completed' && item.workflowStatus !== 'Completed') return false;

      // 2. Search (Phone Number, Customer Name, Enquiry ID, Address)
      if (workflowSearchQuery.trim()) {
        const query = workflowSearchQuery.toLowerCase().trim();
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
  }, [enquiries, activeWorkflowTab, workflowSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Enquiries Table */}
        <EnquiryTable
          activeTab={activeWorkflowTab}
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

