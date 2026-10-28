import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  initialEnquiries,
  initialQuotations,
  initialOrders,
  initialInvoices,
  initialTechnicians,
  initialProducts,
} from '../data/initialData';
import { generateNextId } from '../utils/formatters';

const AppContext = createContext(null);

const isDummyTestEntry = (item) => {
  if (!item) return false;
  const name = typeof item === 'string' ? item : (item.customerName || '');
  const id = typeof item === 'object' ? (item.id || item.enquiryId || '') : '';
  const n = (name || '').toLowerCase().trim();
  const i = (id || '').toUpperCase().trim();
  if (
    ['new', 'testing', 'hml', 'test', 'vijay', 'har', 'sunrise international school', 'hotel royal heritage'].includes(n) ||
    n.startsWith('test ') ||
    i === 'ENQ-2026-008' ||
    i === 'QT-2026-008' ||
    i === 'ORD-2026-008' ||
    i === 'ENQ-2026-009' ||
    i === 'QT-2026-009' ||
    i === 'ORD-2026-009' ||
    i === 'INV-2026-009'
  ) {
    return true;
  }
  if (typeof item === 'object') {
    if (item.workflowStatus === 'Completed' || item.workStatus === 'Completed') {
      return true;
    }
  }
  return false;
};

export const AppProvider = ({ children }) => {
  // Initialize state from LocalStorage or seed data (filtering out manual dummy test data)
  const [enquiries, setEnquiries] = useState(() => {
    try {
      const saved = localStorage.getItem('cctv_enquiries_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((e) => !isDummyTestEntry(e));
        return filtered.length > 0 ? filtered : initialEnquiries;
      }
      return initialEnquiries;
    } catch (e) {
      console.error('Error reading enquiries from localStorage', e);
      return initialEnquiries;
    }
  });

  const [quotations, setQuotations] = useState(() => {
    try {
      const saved = localStorage.getItem('cctv_quotations_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((q) => !isDummyTestEntry(q));
        return filtered.length > 0 ? filtered : initialQuotations;
      }
      return initialQuotations;
    } catch (e) {
      console.error('Error reading quotations from localStorage', e);
      return initialQuotations;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('cctv_orders_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((o) => !isDummyTestEntry(o));
        return filtered.length > 0 ? filtered : initialOrders;
      }
      return initialOrders;
    } catch (e) {
      console.error('Error reading orders from localStorage', e);
      return initialOrders;
    }
  });

  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('cctv_invoices');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((i) => !isDummyTestEntry(i));
        return filtered.length > 0 ? filtered : initialInvoices;
      }
      return initialInvoices;
    } catch (e) {
      console.error('Error reading invoices from localStorage', e);
      return initialInvoices;
    }
  });

  const [technicians, setTechnicians] = useState(() => {
    try {
      const saved = localStorage.getItem('cctv_technicians');
      return saved ? JSON.parse(saved) : initialTechnicians;
    } catch (e) {
      console.error('Error reading technicians from localStorage', e);
      return initialTechnicians;
    }
  });

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('cctv_products');
      if (!saved) return initialProducts;
      const parsed = JSON.parse(saved);
      return parsed.map((p) => {
        const matching = initialProducts.find((ip) => ip.id === p.id);
        return {
          ...p,
          hsnSac: p.hsnSac || matching?.hsnSac || (p.category === 'Installation & Services' ? '995469' : '85258900'),
          gstRate: p.gstRate !== undefined ? Number(p.gstRate) : (matching?.gstRate ?? 18),
        };
      });
    } catch (e) {
      console.error('Error reading products from localStorage', e);
      return initialProducts;
    }
  });

  // Current authenticated user (admin or technician)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cctv_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error reading auth user from localStorage', e);
      return null;
    }
  });

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Workflow workbench active tab and search query state (shared between Topbar and Workbench)
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('All');
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState('');

  // Products page active category filter and search query state (shared between Topbar and ProductsPage)
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');

  // Technicians page specialization filter and search query state (shared between Topbar and TechniciansPage)
  const [technicianSearchQuery, setTechnicianSearchQuery] = useState('');
  const [technicianSpecializationFilter, setTechnicianSpecializationFilter] = useState('');

  // Technician Tasks Portal state (shared between Topbar and TechnicianTasksPage)
  const [techTaskSelectedTechId, setTechTaskSelectedTechId] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('cctv_auth_user');
      const authUser = savedAuth ? JSON.parse(savedAuth) : null;
      if (authUser?.role === 'technician') {
        return authUser.id;
      }
    } catch (e) {}
    return 'TECH-001';
  });
  const [techTaskActiveTab, setTechTaskActiveTab] = useState('all');
  const [techTaskSearchQuery, setTechTaskSearchQuery] = useState('');

  // Persist to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('cctv_enquiries_v5', JSON.stringify(enquiries));
    } catch (e) {
      console.error(e);
    }
  }, [enquiries]);

  useEffect(() => {
    try {
      localStorage.setItem('cctv_quotations_v5', JSON.stringify(quotations));
    } catch (e) {
      console.error(e);
    }
  }, [quotations]);

  useEffect(() => {
    try {
      localStorage.setItem('cctv_orders_v5', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('cctv_invoices', JSON.stringify(invoices));
    } catch (e) {
      console.error(e);
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem('cctv_technicians', JSON.stringify(technicians));
    } catch (e) {
      console.error(e);
    }
  }, [technicians]);

  useEffect(() => {
    try {
      localStorage.setItem('cctv_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Toast helper
  const addToast = (title, message, type = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset to initial demo data
  const resetDemoData = () => {
    setEnquiries(initialEnquiries);
    setQuotations(initialQuotations);
    setOrders(initialOrders);
    setInvoices(initialInvoices);
    setTechnicians(initialTechnicians);
    setProducts(initialProducts);
    try {
      localStorage.setItem('cctv_enquiries_v3', JSON.stringify(initialEnquiries));
      localStorage.setItem('cctv_quotations_v3', JSON.stringify(initialQuotations));
      localStorage.setItem('cctv_orders_v3', JSON.stringify(initialOrders));
      localStorage.setItem('cctv_invoices', JSON.stringify(initialInvoices));
      localStorage.setItem('cctv_technicians', JSON.stringify(initialTechnicians));
      localStorage.setItem('cctv_products', JSON.stringify(initialProducts));
    } catch (e) {
      console.error(e);
    }
    addToast('Demo Data Reset', 'Application data has been restored to default sample state.', 'info');
  };

  // Authentication: Login for Admin and Technicians
  const login = (identifier, password) => {
    const rawId = (identifier || '').trim();
    const cleanId = rawId.toLowerCase();
    const rawPass = (password || '').trim();
    const cleanDigits = (str) => (str || '').replace(/\D/g, '');
    const passDigits = cleanDigits(rawPass);

    // 1. Check Admin login
    if (
      cleanId === 'admin' ||
      cleanId === 'admin@securevision.in' ||
      cleanId === 'oa' ||
      cleanId === 'admin@cctv.com'
    ) {
      if (
        rawPass === 'admin' ||
        rawPass === 'admin123' ||
        rawPass === 'admin@123' ||
        passDigits === '9810012345' ||
        rawPass === 'password'
      ) {
        const adminUser = {
          role: 'admin',
          id: 'ADMIN-01',
          name: 'Office Admin',
          email: 'admin@securevision.in',
          phone: '+91 98100 12345',
        };
        setCurrentUser(adminUser);
        try {
          localStorage.setItem('cctv_auth_user', JSON.stringify(adminUser));
        } catch (e) {
          console.error(e);
        }
        addToast('Welcome Back', 'Logged in successfully as Administrator.', 'success');
        return { success: true, user: adminUser };
      } else {
        return { success: false, message: 'Invalid Admin password. Use "admin123".' };
      }
    }

    // 2. Check Technician login (email as username, phone number as password)
    const tech = technicians.find((t) => {
      const tEmail = (t.email || '').toLowerCase();
      const tId = (t.id || '').toLowerCase();
      const tPhoneDigits = cleanDigits(t.phone);
      return tEmail === cleanId || tId === cleanId || (cleanDigits(rawId) && tPhoneDigits === cleanDigits(rawId));
    });

    if (tech) {
      const tPhoneDigits = cleanDigits(tech.phone);
      if (
        (passDigits && passDigits === tPhoneDigits) ||
        rawPass === tech.phone ||
        rawPass === 'admin123' ||
        rawPass === 'tech123'
      ) {
        const techUser = {
          role: 'technician',
          ...tech,
        };
        setCurrentUser(techUser);
        try {
          localStorage.setItem('cctv_auth_user', JSON.stringify(techUser));
        } catch (e) {
          console.error(e);
        }
        addToast('Welcome Back', `Logged in as Technician: ${tech.name}`, 'success');
        return { success: true, user: techUser };
      } else {
        return {
          success: false,
          message: `Incorrect password. For technicians, your default password is your phone number (${tech.phone}).`,
        };
      }
    }

    return {
      success: false,
      message: 'Account not found. For technicians, please enter your registered email address (e.g. ramesh.tech@securevision.in).',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('cctv_auth_user');
    } catch (e) {
      console.error(e);
    }
    addToast('Logged Out', 'You have been signed out successfully.', 'info');
  };

  const completeSiteSurvey = (enquiryId, surveyOutcome, notes = '') => {
    scheduleSiteVisit(enquiryId, {
      status: 'Completed',
      notes: notes || 'Physical survey completed.',
      outcome: surveyOutcome || 'Survey completed and requirements confirmed.',
    });
    addToast('Survey Completed', `Site visit report recorded for ${enquiryId}.`);
  };

  // 1. Add Enquiry
  const addEnquiry = (enquiryData) => {
    const newId = generateNextId('ENQ', enquiries);
    const requiresVisit = Boolean(enquiryData.requiresSiteVisit);

    // Selected technician for site visit
    let assignedTech = null;
    if (requiresVisit && enquiryData.staffOrTechId) {
      assignedTech = technicians.find((t) => t.id === enquiryData.staffOrTechId);
    } else if (requiresVisit) {
      assignedTech = technicians.find((t) => t.id === 'TECH-001') || technicians[0];
    }

    const techId = assignedTech ? assignedTech.id : (enquiryData.staffOrTechId || null);
    const techName = assignedTech ? assignedTech.name : (enquiryData.staffOrTechName || '');

    const newEnquiry = {
      ...enquiryData,
      id: newId,
      createdAt: new Date().toISOString(),
      workflowStatus: 'Pending',
      requiresSiteVisit: requiresVisit,
      technicianId: requiresVisit ? techId : null,
      technicianName: requiresVisit ? techName : '',
      siteVisit: requiresVisit
        ? {
            id: `SV-${newId.split('-')[2]}`,
            visitDate:
              enquiryData.visitDate ||
              enquiryData.expectedVisitDate ||
              new Date().toISOString().split('T')[0],
            visitTime: '11:00 AM',
            staffOrTechId: techId,
            staffOrTechName: techName,
            status: 'Scheduled',
            notes: enquiryData.notes || 'Site visit scheduled from initial enquiry.',
            outcome: '',
            completedAt: null,
          }
        : null,
      quotationId: null,
      orderId: null,
      followUps: [],
      workStatusHistory: [
        {
          id: `WSH-${Date.now()}`,
          status: requiresVisit ? 'Site Visit Scheduled' : 'Pending',
          timestamp:
            new Date().toLocaleDateString('en-IN') +
            ' ' +
            new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          updatedBy: 'Front Desk',
          notes: requiresVisit
            ? `Site survey scheduled for ${enquiryData.visitDate || 'upcoming date'} assigned to ${techName || 'Technician'}.`
            : `Enquiry registered. Direct quotation path selected (no site visit required).`,
        },
      ],
    };

    setEnquiries((prev) => [newEnquiry, ...prev]);
    addToast('Enquiry Created', `New enquiry ${newId} created for ${newEnquiry.customerName}.`);
    return newEnquiry;
  };

  // 2. Update Enquiry
  const updateEnquiry = (id, updatedFields) => {
    setEnquiries((prev) =>
      prev.map((enq) => {
        if (enq.id !== id) return enq;
        return {
          ...enq,
          ...updatedFields,
        };
      })
    );

    // Propagate customer updates to associated records if any customer fields changed
    const customerFields = {};
    if (updatedFields.customerName !== undefined) customerFields.customerName = updatedFields.customerName;
    if (updatedFields.phone !== undefined) {
      customerFields.phone = updatedFields.phone;
      customerFields.customerPhone = updatedFields.phone;
    }
    if (updatedFields.email !== undefined) {
      customerFields.email = updatedFields.email;
      customerFields.customerEmail = updatedFields.email;
    }
    if (updatedFields.siteAddress !== undefined) customerFields.siteAddress = updatedFields.siteAddress;

    if (Object.keys(customerFields).length > 0) {
      setQuotations((prev) =>
        prev.map((q) => (q.enquiryId === id ? { ...q, ...customerFields } : q))
      );
      setOrders((prev) =>
        prev.map((o) => (o.enquiryId === id ? { ...o, ...customerFields } : o))
      );
      setInvoices((prev) =>
        prev.map((i) =>
          i.enquiryId === id
            ? {
                ...i,
                customerName: customerFields.customerName ?? i.customerName,
                customerPhone: customerFields.phone ?? i.customerPhone,
                customerEmail: customerFields.email ?? i.customerEmail,
                siteAddress: customerFields.siteAddress ?? i.siteAddress,
              }
            : i
        )
      );
    }

    addToast('Customer Updated', `Customer information updated successfully.`);
  };

  // 3. Schedule or Update Site Visit
  const scheduleSiteVisit = (enquiryId, visitDetails) => {
    setEnquiries((prev) =>
      prev.map((enq) => {
        if (enq.id !== enquiryId) return enq;

        const isCompleted = visitDetails.status === 'Completed';
        const updatedVisit = {
          ...(enq.siteVisit || {}),
          id: enq.siteVisit?.id || `SV-${Date.now().toString().slice(-4)}`,
          ...visitDetails,
          completedAt: isCompleted ? (enq.siteVisit?.completedAt || new Date().toISOString()) : null,
        };

        const newHistory = [
          ...(enq.workStatusHistory || []),
          {
            id: `WSH-${Date.now()}`,
            status: isCompleted ? 'Site Visit Completed' : `Site Visit ${visitDetails.status}`,
            timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            updatedBy: visitDetails.staffOrTechName || 'Office Staff',
            notes: visitDetails.notes || `Site visit marked as ${visitDetails.status}.`,
          },
        ];

        return {
          ...enq,
          siteVisit: updatedVisit,
          technicianId: visitDetails.staffOrTechId || enq.technicianId,
          technicianName: visitDetails.staffOrTechName || enq.technicianName,
          workStatusHistory: newHistory,
        };
      })
    );
    addToast('Site Visit Saved', `Site visit for enquiry ${enquiryId} set to ${visitDetails.status}.`);
  };

  // 4. Create Quotation
  const createQuotation = (quotationData) => {
    const newId = generateNextId('QT', quotations);
    const newQuotation = {
      ...quotationData,
      id: newId,
      status: quotationData.status || 'Draft',
      isOrderCreated: false,
    };

    setQuotations((prev) => [newQuotation, ...prev]);

    // Update enquiry linking and status if sent
    setEnquiries((prev) =>
      prev.map((enq) => {
        if (enq.id !== quotationData.enquiryId) return enq;
        const newWorkflowStatus = newQuotation.status === 'Sent' ? 'Quotation Sent' : enq.workflowStatus;
        return {
          ...enq,
          quotationId: newId,
          workflowStatus: newWorkflowStatus,
          workStatusHistory: [
            ...(enq.workStatusHistory || []),
            {
              id: `WSH-${Date.now()}`,
              status: newQuotation.status === 'Sent' ? 'Quotation Sent' : 'Quotation Drafted',
              timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              updatedBy: 'Sales Team',
              notes: `Quotation ${newId} created for grand total ${newQuotation.grandTotal}.`,
            },
          ],
        };
      })
    );

    addToast('Quotation Created', `Quotation ${newId} has been saved.`);
    return newQuotation;
  };

  // 5. Update Quotation
  const updateQuotation = (quotationId, updatedFields) => {
    const existingQuote = quotations.find((q) => q.id === quotationId);
    const targetEnquiryId = updatedFields.enquiryId || existingQuote?.enquiryId;
    const newStatus = updatedFields.status;

    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== quotationId) return q;
        return {
          ...q,
          ...updatedFields,
        };
      })
    );

    if (targetEnquiryId && newStatus === 'Sent') {
      setEnquiries((prev) =>
        prev.map((enq) => {
          if (enq.id !== targetEnquiryId) return enq;
          return {
            ...enq,
            workflowStatus: 'Quotation Sent',
            workStatusHistory: [
              ...(enq.workStatusHistory || []),
              {
                id: `WSH-${Date.now()}`,
                status: 'Quotation Sent',
                timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                updatedBy: 'Sales Team',
                notes: `Quotation ${quotationId} sent to customer.`,
              },
            ],
          };
        })
      );
    }

    addToast('Quotation Updated', `Quotation ${quotationId} updated.`);
  };

  // 6. Record Customer Decision
  const recordCustomerDecision = (quotationId, decision, notes = '') => {
    const existingQuote = quotations.find((q) => q.id === quotationId);
    const targetEnquiryId = existingQuote?.enquiryId;

    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id !== quotationId) return q;
        return {
          ...q,
          status: decision,
          decisionNotes: notes,
          decisionDate: new Date().toISOString(),
        };
      })
    );

    if (targetEnquiryId) {
      setEnquiries((prev) =>
        prev.map((enq) => {
          if (enq.id !== targetEnquiryId && enq.quotationId !== quotationId) return enq;

          let newWorkflowStatus = enq.workflowStatus;
          if (decision === 'Approved') {
            newWorkflowStatus = 'Customer Approved';
          } else if (decision === 'Declined') {
            newWorkflowStatus = 'Pending';
          } else if (decision === 'Revision Requested') {
            newWorkflowStatus = 'Quotation Sent';
          }

          const newHistory = [
            ...(enq.workStatusHistory || []),
            {
              id: `WSH-${Date.now()}`,
              status: `Customer Decision: ${decision}`,
              timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              updatedBy: 'Sales Desk',
              notes: notes || `Customer recorded decision: ${decision}.`,
            },
          ];

          const newFollowUps = [
            ...(enq.followUps || []),
            {
              id: `FU-${Date.now().toString().slice(-4)}`,
              date: new Date().toISOString().split('T')[0],
              method: 'Decision Log',
              outcome: `Decision: ${decision}`,
              customerResponse: notes || `Decision recorded as ${decision}`,
              nextDate: decision === 'Approved' ? new Date().toISOString().split('T')[0] : null,
              notes: `Formal customer decision on Quotation ${quotationId}.`,
            },
          ];

          return {
            ...enq,
            workflowStatus: newWorkflowStatus,
            workStatusHistory: newHistory,
            followUps: newFollowUps,
          };
        })
      );
    }

    addToast('Decision Recorded', `Customer decision recorded as "${decision}".`);
  };

  // 7. Create Order from Approved Quotation
  const createOrderFromQuotation = (quotationId) => {
    const quot = quotations.find((q) => q.id === quotationId);
    if (!quot) {
      addToast('Error', 'Quotation not found', 'error');
      return null;
    }

    if (quot.status !== 'Approved') {
      addToast('Approval Required', 'Cannot create order until customer explicitly approves the quotation.', 'error');
      return null;
    }

    if (quot.isOrderCreated) {
      addToast('Duplicate Order Blocked', 'An order has already been created for this quotation.', 'error');
      return null;
    }

    const orderId = generateNextId('ORD', orders);
    const newOrder = {
      id: orderId,
      quotationId: quot.id,
      enquiryId: quot.enquiryId,
      customerName: quot.customerName,
      customerPhone: quot.customerPhone,
      siteAddress: quot.siteAddress,
      orderDate: new Date().toISOString().split('T')[0],
      grandTotal: quot.grandTotal,
      items: quot.items,
      assignedTechnicianId: null,
      assignedTechnicianName: '',
      technicianPhone: '',
      assignmentDate: '',
      workStatus: 'Assigned',
      startDate: '',
      completionDate: '',
      workNotes: 'Order created from approved quotation.',
      checklist: {
        cameraMounting: false,
        cablingConduit: false,
        nvrSetup: false,
        mobileAppConfig: false,
        customerTraining: false,
      },
      invoiceId: null,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Mark quotation as order created
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, isOrderCreated: true } : q))
    );

    // Update enquiry
    setEnquiries((prev) =>
      prev.map((enq) => {
        if (enq.id !== quot.enquiryId) return enq;
        return {
          ...enq,
          orderId: orderId,
          workflowStatus: 'Confirmed',
          workStatusHistory: [
            ...(enq.workStatusHistory || []),
            {
              id: `WSH-${Date.now()}`,
              status: 'Order Confirmed',
              timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              updatedBy: 'Operations',
              notes: `Order ${orderId} created from quotation ${quot.id}.`,
            },
          ],
        };
      })
    );

    addToast('Order Created', `Order ${orderId} created successfully. Workflow moved to Confirmed.`);
    return newOrder;
  };

  // 8. Assign Technician
  const assignTechnician = (orderId, technicianId, notes = '') => {
    const tech = technicians.find((t) => t.id === technicianId);
    if (!tech) {
      addToast('Error', 'Technician not found', 'error');
      return;
    }

    const existingOrder = orders.find((ord) => ord.id === orderId);
    const targetEnquiryId = existingOrder?.enquiryId;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const today = new Date().toISOString().split('T')[0];
        return {
          ...ord,
          assignedTechnicianId: tech.id,
          assignedTechnicianName: tech.name,
          technicianPhone: tech.phone,
          technicianEmail: tech.email || '',
          assignmentDate: ord.assignmentDate || today,
          startDate: ord.startDate || today,
          workStatus: ord.workStatus === 'Completed' ? 'Completed' : 'In Progress',
          workNotes: notes
            ? `${ord.workNotes || ''}\n${notes}`.trim()
            : (ord.workNotes || 'Technician assigned. Installation In Progress.'),
        };
      })
    );

    if (targetEnquiryId) {
      setEnquiries((prev) =>
        prev.map((enq) => {
          if (enq.id !== targetEnquiryId && enq.orderId !== orderId) return enq;
          return {
            ...enq,
            technicianId: tech.id,
            technicianName: tech.name,
            workflowStatus: enq.workflowStatus === 'Completed' ? 'Completed' : 'Ongoing',
            workStatusHistory: [
              ...(enq.workStatusHistory || []),
              {
                id: `WSH-${Date.now()}`,
                status: 'Technician Assigned (In Progress)',
                timestamp:
                  new Date().toLocaleDateString('en-IN') +
                  ' ' +
                  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                updatedBy: 'Dispatcher',
                notes: `Assigned lead technician ${tech.name} (${tech.id}). Work directly In Progress.`,
              },
            ],
          };
        })
      );
    }

    addToast('Technician Assigned', `${tech.name} assigned to Order ${orderId}. Job is directly In Progress.`);
  };

  // 9. Update Work Status
  const updateWorkStatus = (orderId, statusData) => {
    const { workStatus, startDate, completionDate, workNotes, checklist, enquiryId } = statusData;

    const existingOrder = orders.find(
      (ord) => ord.id === orderId || (enquiryId && ord.enquiryId === enquiryId)
    );
    const targetEnquiryId = enquiryId || existingOrder?.enquiryId;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId && (!targetEnquiryId || ord.enquiryId !== targetEnquiryId)) return ord;
        return {
          ...ord,
          workStatus,
          startDate: startDate !== undefined ? startDate : ord.startDate,
          completionDate: completionDate !== undefined ? completionDate : ord.completionDate,
          workNotes: workNotes !== undefined ? workNotes : ord.workNotes,
          checklist: checklist !== undefined ? checklist : ord.checklist,
        };
      })
    );

    if (targetEnquiryId || orderId) {
      setEnquiries((prev) =>
        prev.map((enq) => {
          if (enq.id !== targetEnquiryId && (!orderId || enq.orderId !== orderId)) return enq;

          let newWorkflowStatus = enq.workflowStatus;
          if (workStatus === 'In Progress') {
            newWorkflowStatus = 'Ongoing';
          } else if (workStatus === 'Completed') {
            newWorkflowStatus = 'Completed';
          } else if (workStatus === 'Assigned') {
            newWorkflowStatus = 'Confirmed';
          }

          return {
            ...enq,
            workflowStatus: newWorkflowStatus,
            workStatusHistory: [
              ...(enq.workStatusHistory || []),
              {
                id: `WSH-${Date.now()}`,
                status: `Work Status: ${workStatus}`,
                timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                updatedBy: enq.technicianName || 'Technician',
                notes: workNotes || `Status updated to ${workStatus}`,
              },
            ],
          };
        })
      );
    }

    addToast('Work Status Updated', `Job status updated to "${workStatus}".`);
  };

  // 10. Add Follow-up
  const addFollowUp = (enquiryId, followUpData) => {
    const newFollowUp = {
      ...followUpData,
      id: `FU-${Date.now().toString().slice(-4)}`,
    };

    setEnquiries((prev) =>
      prev.map((enq) => {
        if (enq.id !== enquiryId) return enq;
        return {
          ...enq,
          followUps: [...(enq.followUps || []), newFollowUp],
          workStatusHistory: [
            ...(enq.workStatusHistory || []),
            {
              id: `WSH-${Date.now()}`,
              status: `Follow-up via ${followUpData.method}`,
              timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              updatedBy: 'Staff',
              notes: followUpData.customerResponse || followUpData.notes || 'Follow-up logged.',
            },
          ],
        };
      })
    );

    addToast('Follow-up Logged', `Follow-up recorded for enquiry ${enquiryId}.`);
  };

  // 11. Create Invoice (Only from completed orders)
  const createInvoice = (invoiceData) => {
    const order = orders.find((o) => o.id === invoiceData.orderId);
    if (!order) {
      addToast('Error', 'Order not found.', 'error');
      return null;
    }

    if (order.workStatus !== 'Completed') {
      addToast('Invoicing Blocked', 'Invoices can only be created for completed jobs.', 'error');
      return null;
    }

    const newId = generateNextId('INV', invoices);
    const newInvoice = {
      ...invoiceData,
      id: newId,
      status: 'Draft', // Draft, Reviewed, Sent
      reviewedAt: null,
      sentAt: null,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Link invoice to order
    setOrders((prev) =>
      prev.map((o) => (o.id === invoiceData.orderId ? { ...o, invoiceId: newId } : o))
    );

    // Update enquiry history
    if (invoiceData.enquiryId) {
      setEnquiries((prev) =>
        prev.map((enq) => {
          if (enq.id !== invoiceData.enquiryId) return enq;
          return {
            ...enq,
            workStatusHistory: [
              ...(enq.workStatusHistory || []),
              {
                id: `WSH-${Date.now()}`,
                status: 'Invoice Drafted',
                timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                updatedBy: 'Billing Desk',
                notes: `Invoice ${newId} drafted for ₹${newInvoice.grandTotal.toLocaleString('en-IN')}.`,
              },
            ],
          };
        })
      );
    }

    addToast('Invoice Created', `Invoice ${newId} drafted in system.`);
    return newInvoice;
  };

  // 12. Review Invoice
  const reviewInvoice = (invoiceId) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        return {
          ...inv,
          status: 'Reviewed',
          reviewedAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );
    addToast('Invoice Reviewed', `Invoice ${invoiceId} marked as Reviewed by office staff.`);
  };

  // 13. Send Invoice
  const sendInvoice = (invoiceId) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    if (inv.status !== 'Reviewed') {
      addToast('Review Required', 'Invoice must be explicitly reviewed by office staff before sending.', 'error');
      return;
    }

    setInvoices((prev) =>
      prev.map((i) => {
        if (i.id !== invoiceId) return i;
        return {
          ...i,
          status: 'Sent',
          sentAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );

    if (inv.enquiryId) {
      setEnquiries((prev) =>
        prev.map((enq) => {
          if (enq.id !== inv.enquiryId) return enq;
          return {
            ...enq,
            workStatusHistory: [
              ...(enq.workStatusHistory || []),
              {
                id: `WSH-${Date.now()}`,
                status: 'Invoice Sent',
                timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                updatedBy: 'Office Admin',
                notes: `Invoice ${invoiceId} delivered to customer.`,
              },
            ],
          };
        })
      );
    }

    addToast('Invoice Sent', `Invoice ${invoiceId} has been sent to customer.`);
  };

  // Product CRUD
  const addProduct = (prodData) => {
    const newId = generateNextId('PRD', products);
    const newProd = { ...prodData, id: newId };
    setProducts((prev) => [newProd, ...prev]);
    addToast('Product Added', `${newProd.name} added to catalog.`);
    return newProd;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)));
    addToast('Product Updated', 'Item details updated.');
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('Product Removed', 'Item removed from catalog.', 'info');
  };

  // Technician CRUD
  const addTechnician = (techData) => {
    const newId = generateNextId('TECH', technicians);
    const newTech = {
      ...techData,
      id: newId,
      experienceYears: techData.experienceYears || 1,
      activeJobsCount: 0,
    };
    setTechnicians((prev) => [newTech, ...prev]);
    addToast('Technician Added', `${newTech.name} added to technicians team.`);
    return newTech;
  };

  const updateTechnician = (id, updatedFields) => {
    setTechnicians((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)));
    addToast('Technician Updated', 'Technician profile updated.');
  };

  const deleteTechnician = (id) => {
    setTechnicians((prev) => prev.filter((t) => t.id !== id));
    addToast('Technician Removed', 'Technician removed.', 'info');
  };

  // Derived dashboard and reporting metrics
  const totalEnquiries = enquiries.length;
  const pendingSiteVisits = enquiries.filter(
    (e) => !e.siteVisit || e.siteVisit.status === 'Scheduled' || e.siteVisit.status === 'Rescheduled'
  ).length;
  const quotationsAwaitingApproval = quotations.filter((q) => q.status === 'Sent').length;
  const activeJobs = orders.filter((o) => o.workStatus === 'In Progress' || o.workStatus === 'Assigned').length;
  const completedJobs = orders.filter((o) => o.workStatus === 'Completed').length;
  const invoicesPendingReview = invoices.filter((i) => i.status === 'Draft').length;

  const activeTechForPortal = useMemo(() => {
    if (currentUser?.role === 'technician') {
      return currentUser;
    }
    return technicians.find((t) => t.id === techTaskSelectedTechId) || technicians[0] || {};
  }, [currentUser, technicians, techTaskSelectedTechId]);

  const techTaskCounts = useMemo(() => {
    if (!activeTechForPortal?.id && !activeTechForPortal?.name) {
      return { total: 0, ordersCount: 0, surveysCount: 0, completedCount: 0 };
    }
    const techOrders = orders.filter(
      (o) =>
        (activeTechForPortal.id && o.assignedTechnicianId?.toLowerCase() === activeTechForPortal.id.toLowerCase()) ||
        (activeTechForPortal.name && o.assignedTechnicianName?.toLowerCase().trim() === activeTechForPortal.name.toLowerCase().trim()) ||
        (activeTechForPortal.phone && o.technicianPhone && o.technicianPhone.replace(/\D/g, '').endsWith(activeTechForPortal.phone.replace(/\D/g, '').slice(-10)))
    );

    const techSurveys = enquiries.filter((e) => {
      const sv = e.siteVisit;
      if (!sv) return false;
      const matchesTech =
        (sv.staffOrTechId && activeTechForPortal.id && sv.staffOrTechId.toLowerCase() === activeTechForPortal.id.toLowerCase()) ||
        (sv.staffOrTechName && activeTechForPortal.name && sv.staffOrTechName.toLowerCase().trim() === activeTechForPortal.name.toLowerCase().trim()) ||
        (e.technicianId && activeTechForPortal.id && e.technicianId.toLowerCase() === activeTechForPortal.id.toLowerCase()) ||
        (e.technicianName && activeTechForPortal.name && e.technicianName.toLowerCase().trim() === activeTechForPortal.name.toLowerCase().trim());
      return matchesTech;
    });

    const completedOrders = techOrders.filter((o) => o.workStatus === 'Completed').length;
    const completedSurveys = techSurveys.filter((e) => e.siteVisit?.status === 'Completed').length;
    const completedCount = completedOrders + completedSurveys;
    const total = techOrders.length + techSurveys.length;

    return {
      total,
      ordersCount: techOrders.length,
      surveysCount: techSurveys.length,
      completedCount,
    };
  }, [orders, enquiries, activeTechForPortal]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        completeSiteSurvey,
        enquiries,
        quotations,
        orders,
        invoices,
        technicians,
        products,
        toasts,
        addToast,
        removeToast,
        resetDemoData,
        // Enquiries & Workflow actions
        addEnquiry,
        updateEnquiry,
        scheduleSiteVisit,
        createQuotation,
        updateQuotation,
        recordCustomerDecision,
        createOrderFromQuotation,
        assignTechnician,
        updateWorkStatus,
        addFollowUp,
        createInvoice,
        reviewInvoice,
        sendInvoice,
        // Catalog actions
        addProduct,
        updateProduct,
        deleteProduct,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        // Workflow state
        activeWorkflowTab,
        setActiveWorkflowTab,
        workflowSearchQuery,
        setWorkflowSearchQuery,
        // Products state
        productSearchQuery,
        setProductSearchQuery,
        productCategoryFilter,
        setProductCategoryFilter,
        // Technicians state
        technicianSearchQuery,
        setTechnicianSearchQuery,
        technicianSpecializationFilter,
        setTechnicianSpecializationFilter,
        // Technician Portal state
        techTaskSelectedTechId,
        setTechTaskSelectedTechId,
        techTaskActiveTab,
        setTechTaskActiveTab,
        techTaskSearchQuery,
        setTechTaskSearchQuery,
        techTaskCounts,
        // Derived metrics
        metrics: {
          totalEnquiries,
          pendingSiteVisits,
          quotationsAwaitingApproval,
          activeJobs,
          completedJobs,
          invoicesPendingReview,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

