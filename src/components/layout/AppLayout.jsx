import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastContainer from '../common/Toast';
import AddEnquiryModal from '../enquiries/AddEnquiryModal';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddEnquiryOpen, setIsAddEnquiryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenAddEnquiry={() => setIsAddEnquiryOpen(true)}
        />

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

