import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, X, FileSpreadsheet, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Topbar = ({ onOpenAddEnquiry }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    enquiries,
    activeWorkflowTab,
    setActiveWorkflowTab,
    workflowSearchQuery,
    setWorkflowSearchQuery,
    productSearchQuery,
    setProductSearchQuery,
    productCategoryFilter,
    setProductCategoryFilter,
    technicianSearchQuery,
    setTechnicianSearchQuery,
    technicianSpecializationFilter,
    setTechnicianSpecializationFilter,
    techTaskSelectedTechId,
    setTechTaskSelectedTechId,
    techTaskActiveTab,
    setTechTaskActiveTab,
    techTaskSearchQuery,
    setTechTaskSearchQuery,
    techTaskCounts,
    products,
    technicians,
    currentUser,
    logout,
  } = useApp();

  const isWorkflow = location.pathname === '/workflow';
  const isProducts = location.pathname === '/products';
  const isTechnicians = location.pathname === '/technicians';
  const isTechnicianPortal = location.pathname === '/technician-portal';

  const productCategories = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const technicianSpecializations = useMemo(() => {
    if (!technicians) return [];
    const set = new Set(technicians.map((t) => t.specialization).filter(Boolean));
    ['CCTV Installation', 'DVR / NVR Setup', 'Networking', 'Maintenance'].forEach((s) => set.add(s));
    return Array.from(set);
  }, [technicians]);

  const tabCounts = useMemo(() => {
    if (!enquiries) return {};
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

  // If on /workflow: Replace standard title header with the workflow tabs and search bar
  if (isWorkflow) {
    return (
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 gap-3">
        {/* Workflow Tabs on Left */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none min-w-0">
          {[
            { id: 'All', label: 'All' },
            { id: 'Pending', label: 'Pending' },
            { id: 'Quotation Sent', label: 'Quotation' },
            { id: 'Confirmed', label: 'Confirmed' },
            { id: 'Ongoing', label: 'Ongoing' },
            { id: 'Completed', label: 'Completed' },
          ].map((tab) => {
            const isSelected = activeWorkflowTab === tab.id;
            const count = tabCounts[tab.id] || 0;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveWorkflowTab(tab.id)}
                style={{ fontSize: '0.85rem' }}
                className={`inline-flex items-center gap-1.5 py-1.5 px-2.5 text-[0.85rem] font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
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

        {/* Search Bar + Add Enquiry on Right */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-44 sm:w-56 flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by phone, name, ID"
              value={workflowSearchQuery}
              onChange={(e) => setWorkflowSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem' }}
              className="w-full pl-9 pr-8 py-1.5 text-[0.85rem] rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400 font-medium"
            />
            {workflowSearchQuery && (
              <button
                type="button"
                onClick={() => setWorkflowSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenAddEnquiry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Enquiry</span>
          </button>
        </div>
      </header>
    );
  }

  // If on /products: Search bar, Category Filter, and Add Product action directly in topbar
  if (isProducts) {
    return (
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 gap-3">
        {/* Title & Count Badge on Left */}
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
            Products & Services
          </h1>
          <span className="hidden sm:inline-block text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
            {products?.length || 0} Items
          </span>
        </div>

        {/* Filter + Search Bar + Add Product on Right */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Category Filter */}
          <select
            value={productCategoryFilter}
            onChange={(e) => setProductCategoryFilter(e.target.value)}
            style={{ fontSize: '0.85rem' }}
            className="px-2.5 py-1.5 text-[0.85rem] rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">Category: All</option>
            {productCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Search Bar */}
          <div className="relative w-40 sm:w-56 flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, HSN..."
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem' }}
              className="w-full pl-9 pr-8 py-1.5 text-[0.85rem] rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400 font-medium"
            />
            {productSearchQuery && (
              <button
                type="button"
                onClick={() => setProductSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Clear Button if active filters */}
          {(productSearchQuery || productCategoryFilter) && (
            <button
              type="button"
              onClick={() => {
                setProductSearchQuery('');
                setProductCategoryFilter('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              title="Clear search and filters"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {/* Add Product / Service Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('app:add-product'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product / Service</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>
    );
  }

  // If on /technicians: Search bar, Specialization filter, and Add Technician action directly in topbar
  if (isTechnicians) {
    return (
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 gap-3">
        {/* Title & Count Badge on Left */}
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
            Technicians & Field Engineers
          </h1>
          <span className="hidden sm:inline-block text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
            {technicians?.length || 0} Staff
          </span>
        </div>

        {/* Filter + Search Bar + Add Technician on Right */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Specialization Filter */}
          <select
            value={technicianSpecializationFilter}
            onChange={(e) => setTechnicianSpecializationFilter(e.target.value)}
            style={{ fontSize: '0.85rem' }}
            className="px-2.5 py-1.5 text-[0.85rem] rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">Specialization: All</option>
            {technicianSpecializations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Search Bar */}
          <div className="relative w-40 sm:w-56 flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, ID..."
              value={technicianSearchQuery}
              onChange={(e) => setTechnicianSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem' }}
              className="w-full pl-9 pr-8 py-1.5 text-[0.85rem] rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400 font-medium"
            />
            {technicianSearchQuery && (
              <button
                type="button"
                onClick={() => setTechnicianSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Clear Button if active filters */}
          {(technicianSearchQuery || technicianSpecializationFilter) && (
            <button
              type="button"
              onClick={() => {
                setTechnicianSearchQuery('');
                setTechnicianSpecializationFilter('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              title="Clear search and filters"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {/* Add Technician Button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('app:add-technician'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Technician</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </header>
    );
  }

  // If on /technician-portal: Tabs, Technician Switcher, and Search Bar directly in topbar
  if (isTechnicianPortal) {
    const counts = techTaskCounts || { total: 0, ordersCount: 0, surveysCount: 0, completedCount: 0 };
    const portalTabs = [
      { id: 'all', label: 'All Tasks', count: counts.total || 0 },
      { id: 'orders', label: 'Installation Jobs', count: counts.ordersCount || 0 },
      { id: 'surveys', label: 'Site Surveys', count: counts.surveysCount || 0 },
      { id: 'completed', label: 'Completed', count: counts.completedCount || 0 },
    ];

    return (
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 gap-3">
        {/* Filter Tabs on Left */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none min-w-0">
          {portalTabs.map((tab) => {
            const isSelected = techTaskActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTechTaskActiveTab(tab.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* Right: Technician Switcher & Search Bar */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {currentUser?.role === 'admin' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold whitespace-nowrap hidden md:inline">Technician:</span>
              <select
                value={techTaskSelectedTechId}
                onChange={(e) => setTechTaskSelectedTechId(e.target.value)}
                style={{ fontSize: '0.85rem' }}
                className="px-2.5 py-1.5 text-[0.85rem] rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className="relative w-40 sm:w-56 flex-shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, phone, ID..."
              value={techTaskSearchQuery}
              onChange={(e) => setTechTaskSearchQuery(e.target.value)}
              style={{ fontSize: '0.85rem' }}
              className="w-full pl-9 pr-8 py-1.5 text-[0.85rem] rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-slate-400 font-medium"
            />
            {techTaskSearchQuery && (
              <button
                type="button"
                onClick={() => setTechTaskSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Page header titles, counts, and contextual topbar actions
  const getHeaderContent = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'CCTV Operations Dashboard',
          actions: (
            <button
              type="button"
              onClick={onOpenAddEnquiry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add Enquiry</span>
            </button>
          ),
        };
      case '/workflow':
        return {
          title: 'Enquiries & Workflow',
          badge: 'Workbench',
          actions: (
            <button
              type="button"
              onClick={onOpenAddEnquiry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add Enquiry</span>
            </button>
          ),
        };
      case '/products':
        return {
          title: 'Products & Services',
          badge: `${products?.length || 0} Items`,
          actions: (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('app:add-product'))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product / Service</span>
            </button>
          ),
        };
      case '/technicians':
        return {
          title: 'Technicians & Field Engineers',
          badge: `${technicians?.length || 0} Staff`,
          actions: (
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('app:add-technician'))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add Technician</span>
            </button>
          ),
        };
      case '/reports':
        return {
          title: 'Operational & Business Reports',
          actions: (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('app:export-csv'))}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('app:print-report'))}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          ),
        };
      case '/settings':
        return {
          title: currentUser?.role === 'technician' ? 'Technician Account & Password' : 'Admin Settings & Preferences',
          badge: currentUser?.role === 'technician' ? 'Technician Security' : 'Security & Profile',
          actions: null,
        };
      default:
        return {
          title: 'CCTV Management System',
          actions: null,
        };
    }
  };

  const header = getHeaderContent();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
            {header.title}
          </h1>
          {header.badge && (
            <span className="hidden sm:inline-block text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
              {header.badge}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {header.actions}
      </div>
    </header>
  );
};

export default Topbar;
