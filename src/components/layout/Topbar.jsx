import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Plus, FileSpreadsheet, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Topbar = ({ onToggleSidebar, onOpenAddEnquiry }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { products, technicians, currentUser, logout } = useApp();

  // Page header titles, counts, and contextual topbar actions
  const getHeaderContent = () => {
    switch (location.pathname) {
      case '/technician-portal':
        return {
          title: 'Technician Assigned Tasks',
          badge: currentUser?.role === 'technician' ? currentUser.name : 'Field Tasks',
          actions: null,
        };
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
        {/* Mobile toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

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
