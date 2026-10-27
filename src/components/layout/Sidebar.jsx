import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Workflow,
  Package,
  Users,
  BarChart3,
  Video,
  X,
  LogOut,
  Wrench,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useApp();

  const isTech = currentUser?.role === 'technician';

  const navItems = isTech
    ? [
        { name: 'My Assigned Tasks', path: '/technician-portal', icon: Wrench },
      ]
    : [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Enquiries & Workflow', path: '/workflow', icon: Workflow },
        { name: 'Products & Services', path: '/products', icon: Package },
        { name: 'Technicians', path: '/technicians', icon: Users },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
        { name: 'Technician Tasks', path: '/technician-portal', icon: Wrench },
      ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#172554] text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl lg:shadow-none`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                SecureVision <span className="text-[10px] bg-blue-500/30 text-blue-300 font-semibold px-1.5 py-0.5 rounded">CCTV</span>
              </h1>
              <p className="text-[11px] text-blue-300/80">
                {isTech ? 'Technician Portal' : 'Management System'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
          <div className="px-3 mb-2 text-[10px] font-semibold text-blue-300 uppercase tracking-wider">
            {isTech ? 'Field Operations' : 'Main Menu'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-700/50'
                      : 'text-slate-300 hover:bg-blue-900/50 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer: User profile & Log Out */}
        <div className="p-3 border-t border-blue-900/60 bg-[#121d42] space-y-2">
          {currentUser && (
            <div className="flex items-center gap-2.5 px-2 py-1.5 bg-blue-950/60 rounded-lg border border-blue-900/40">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser.name}
                </p>
                <span className="text-[10px] text-blue-300 capitalize block truncate">
                  {currentUser.role === 'admin' ? 'Administrator' : currentUser.specialization || 'Technician'}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                logout();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/30 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

