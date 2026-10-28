import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastContainer from '../common/Toast';
import AddEnquiryModal from '../enquiries/AddEnquiryModal';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_open');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [isAddEnquiryOpen, setIsAddEnquiryOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar_open', String(next));
      }
      return next;
    });
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar_open', 'false');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        onClose={handleCloseSidebar}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:pl-60' : 'lg:pl-16 pl-0'
        }`}
      >
        <Topbar onOpenAddEnquiry={() => setIsAddEnquiryOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openAddEnquiry: () => setIsAddEnquiryOpen(true) }} />
        </main>
      </div>

      {/* Global Add Enquiry Centered Modal */}
      <AddEnquiryModal
        isOpen={isAddEnquiryOpen}
        onClose={() => setIsAddEnquiryOpen(false)}
      />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default AppLayout;

