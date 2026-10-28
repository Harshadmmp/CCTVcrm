import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Workflow,
  Package,
  Users,
  BarChart3,
  Video,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wrench,
  ShieldCheck,
  User,
  Settings,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({ isOpen, onToggle, onClose }) => {
  const { currentUser, logout } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isTech = currentUser?.role === 'technician';

  const navItems = isTech
    ? [
        { name: 'My Assigned Tasks', path: '/technician-portal', icon: Wrench },
        { name: 'Change Password', path: '/settings', icon: KeyRound },
      ]
    : [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Enquiries & Workflow', path: '/workflow', icon: Workflow },
        { name: 'Products & Services', path: '/products', icon: Package },
        { name: 'Technicians', path: '/technicians', icon: Users },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
        { name: 'Technician Tasks', path: '/technician-portal', icon: Wrench },
        { name: 'Settings', path: '/settings', icon: Settings },
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
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#172554] text-slate-200 flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none ${
          isOpen
            ? 'w-60 translate-x-0'
            : '-translate-x-full lg:translate-x-0 lg:w-16'
        }`}
      >
        {/* Brand Header & Toggle Arrow */}
        <div
          className={`h-16 flex items-center border-b border-blue-900/60 ${
            isOpen ? 'justify-between px-4' : 'justify-center px-2'
          }`}
        >
          {isOpen ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 flex-shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                    SecureVision <span className="text-[10px] bg-blue-500/30 text-blue-300 font-semibold px-1.5 py-0.5 rounded">CCTV</span>
                  </h1>
                  <p className="text-[11px] text-blue-300/80 truncate">
                    {isTech ? 'Technician Portal' : 'Management System'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggle || onClose}
                className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-800/60 rounded-lg cursor-pointer transition-colors flex-shrink-0"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              className="w-10 h-10 rounded-lg bg-blue-900/50 hover:bg-blue-600 text-blue-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm group"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className={`flex-1 overflow-y-auto space-y-1.5 ${isOpen ? 'px-3 py-5' : 'px-2 py-4'}`}>
          {isOpen && (
            <div className="px-3 mb-2 text-[10px] font-semibold text-blue-300 uppercase tracking-wider">
              {isTech ? 'Field Operations' : 'Main Menu'}
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={!isOpen ? item.name : undefined}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center rounded-lg text-sm font-medium transition-all ${
                    isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-700/50'
                      : 'text-slate-300 hover:bg-blue-900/50 hover:text-white'
                  }`
                }
              >
                <Icon className={`${isOpen ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`} />
                {isOpen && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer: Unified User Profile & Log Out */}
        <div className={`border-t border-blue-900/60 bg-[#121d42] ${isOpen ? 'p-3' : 'p-2'}`}>
          {isOpen ? (
            <div className="flex items-center justify-between gap-2 px-2.5 py-2 bg-blue-950/70 rounded-lg border border-blue-900/50">
              <NavLink
                to="/settings"
                title={currentUser?.role === 'admin' ? 'Open Account Settings' : 'Change My Password'}
                className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {currentUser?.name || 'Office Admin'}
                  </p>
                  <span className="text-[10px] text-blue-300 capitalize block truncate">
                    {currentUser?.role === 'admin'
                      ? 'Administrator'
                      : currentUser?.specialization || 'Technician'}
                  </span>
                </div>
              </NavLink>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                title="Log Out"
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-600/30 border border-rose-500/25 rounded-md transition-colors cursor-pointer flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[11px]">Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              title={`Log Out (${currentUser?.name || 'User'})`}
              className="w-10 h-10 mx-auto flex items-center justify-center text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/30 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
            </button>
          )}
        </div>
      </aside>

      {/* Beautiful Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 text-center animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
              <LogOut className="w-7 h-7 text-rose-500 translate-x-0.5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Log Out</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to log out of your account? You will need to log back in to access the system.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

