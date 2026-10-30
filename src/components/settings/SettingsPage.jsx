import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Building2,
  SlidersHorizontal,
  Lock,
  Mail,
  Phone,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  Receipt,
  Sparkles,
  Wrench,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * TechnicianPasswordView
 * Strictly for logged-in field technicians:
 * - Allows ONLY changing their own password.
 * - Absolutely zero access to admin data, admin password, company data, or system settings.
 */
const TechnicianPasswordView = ({ currentUser, updateTechnicianPassword }) => {
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const newErrors = {};
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Enter a new password.';
    } else if (passwordForm.newPassword.length < 4) {
      newErrors.newPassword = 'Password must be at least 4 characters.';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your new password.';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const res = updateTechnicianPassword(currentUser?.id, passwordForm.newPassword);
    if (!res?.success) {
      setErrors({ newPassword: res?.message || 'Failed to update password.' });
      return;
    }

    setSuccessMessage('Your password has been changed successfully. On your next login, use this new password.');
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* 1. Technician Profile Identity (Read-only) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-600/20 flex-shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 truncate">{currentUser?.name}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Wrench className="w-3 h-3" />
                {currentUser?.id || 'Technician'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Field Technician • {currentUser?.specialization || 'CCTV Specialist'}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {currentUser?.phone || 'No phone'}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {currentUser?.email || 'No email'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Change Password Form (Only this technician's password) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Change My Password</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update only your personal technician password for login.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password (at least 4 characters)"
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                    if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
                  }}
                  className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border ${
                    errors.newPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border ${
                    errors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <Shield className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span>
              This password change affects <strong>only your personal technician login</strong> ({currentUser?.name}). You do not have permissions to modify admin or system settings.
            </span>
          </div>

          <div className="pt-3 flex items-center justify-end border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Update My Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Main SettingsPage:
 * - If current user is a technician, renders ONLY TechnicianPasswordView.
 * - If current user is admin, renders full Admin Settings & Preferences.
 */
export const SettingsPage = () => {
  const {
    adminSettings,
    updateAdminSettings,
    changeAdminPassword,
    updateTechnicianPassword,
    currentUser,
  } = useApp();

  // If logged-in user is a technician, show ONLY technician password change
  if (currentUser?.role === 'technician') {
    return (
      <TechnicianPasswordView
        currentUser={currentUser}
        updateTechnicianPassword={updateTechnicianPassword}
      />
    );
  }

  // Otherwise, render full Admin Settings:
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'company' | 'system'

  // Admin Profile / Username Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState('');

  // Admin Password Form State (No current password required)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Admin Company Form State
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    companyPhone: '',
    companyEmail: '',
    companyAddress: '',
    gstin: '',
    quotationTerms: '',
  });
  const [companySuccess, setCompanySuccess] = useState('');

  // Admin System Preferences Form State
  const [preferencesForm, setPreferencesForm] = useState({
    defaultGstRate: 18,
    quotationValidityDays: 30,
    enableSoundAlerts: true,
  });
  const [preferencesSuccess, setPreferencesSuccess] = useState('');

  // Load initial settings into local forms
  useEffect(() => {
    if (adminSettings) {
      setProfileForm({
        name: adminSettings.name || 'Office Admin',
        username: adminSettings.username || 'admin',
        email: adminSettings.email || 'akpatil7788@gmail.com',
        phone: adminSettings.phone || '7410108728',
      });

      setCompanyForm({
        companyName: adminSettings.companyName || 'AP SECURITY SYSTEM',
        companyPhone: adminSettings.companyPhone || '7410108728',
        companyEmail: adminSettings.companyEmail || 'akpatil7788@gmail.com',
        companyAddress:
          adminSettings.companyAddress ||
          'Co/off:- C.S. No 8265/4 KORE CLASSIC FRONT JAI HIND COLONY FRONT OF DR SAKEKAR VISHRAMBAG, SANGLI 416415',
        gstin: adminSettings.gstin || '27EUDPP0562H1ZJ',
        quotationTerms:
          adminSettings.quotationTerms ||
          '1. Prices are all-inclusive of applicable GST.\n2. 50% advance along with work order, remaining 50% upon installation sign-off.\n3. 1-Year on-site warranty on all cameras and recording equipment.\n4. Free mobile view app configuration and staff training included.',
      });

      setPreferencesForm({
        defaultGstRate: adminSettings.defaultGstRate || 18,
        quotationValidityDays: adminSettings.quotationValidityDays || 30,
        enableSoundAlerts: adminSettings.enableSoundAlerts ?? true,
      });
    }
  }, [adminSettings]);

  // Handle Profile & Username Submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileSuccess('');

    const errors = {};
    if (!profileForm.name.trim()) {
      errors.name = 'Admin display name is required.';
    }
    if (!profileForm.username.trim()) {
      errors.username = 'Admin username / login ID is required.';
    } else if (profileForm.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }
    if (!profileForm.email.trim()) {
      errors.email = 'Email address is required.';
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    updateAdminSettings({
      name: profileForm.name.trim(),
      username: profileForm.username.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
    });

    setProfileSuccess('Admin username and profile updated successfully.');
    setTimeout(() => setProfileSuccess(''), 4000);
  };

  // Handle Password Change Submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess('');

    const errors = {};
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Enter a new password.';
    } else if (passwordForm.newPassword.length < 4) {
      errors.newPassword = 'New password must be at least 4 characters.';
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Confirm your new password.';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'New passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    const res = changeAdminPassword(passwordForm.newPassword);
    if (!res?.success) {
      setPasswordErrors({ newPassword: res?.message || 'Failed to update admin password.' });
      return;
    }

    setPasswordSuccess('Admin password changed successfully. You can now use your new password on next login.');
    setPasswordForm({
      newPassword: '',
      confirmPassword: '',
    });
    setTimeout(() => setPasswordSuccess(''), 5000);
  };

  // Handle Company Settings Submission
  const handleCompanySubmit = (e) => {
    e.preventDefault();
    setCompanySuccess('');

    updateAdminSettings({
      companyName: companyForm.companyName.trim(),
      companyPhone: companyForm.companyPhone.trim(),
      companyEmail: companyForm.companyEmail.trim(),
      companyAddress: companyForm.companyAddress.trim(),
      gstin: companyForm.gstin.trim(),
      quotationTerms: companyForm.quotationTerms.trim(),
    });

    setCompanySuccess('Company & Invoicing details saved successfully.');
    setTimeout(() => setCompanySuccess(''), 4000);
  };

  // Handle System Preferences Submission
  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    setPreferencesSuccess('');

    updateAdminSettings({
      defaultGstRate: Number(preferencesForm.defaultGstRate) || 18,
      quotationValidityDays: Number(preferencesForm.quotationValidityDays) || 30,
      enableSoundAlerts: Boolean(preferencesForm.enableSoundAlerts),
    });

    setPreferencesSuccess('System preferences saved successfully.');
    setTimeout(() => setPreferencesSuccess(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Admin Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-blue-600/20 flex-shrink-0">
              {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {profileForm.name || 'Office Admin'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  <Shield className="w-3 h-3 text-blue-600" />
                  System Administrator
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>
                  Username: <strong className="text-slate-700 font-semibold">{profileForm.username || 'admin'}</strong>
                </span>
                <span>•</span>
                <span>{profileForm.email || 'akpatil7788@gmail.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active Admin Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'account'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Admin Account & Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'company'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company & Invoicing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'system'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>System Preferences</span>
        </button>
      </div>

      {/* 3. TAB 1: Admin Account & Password Change */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: Admin Profile & Username */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Admin Profile & Username</h3>
                    <p className="text-xs text-slate-500">Change your login username, display name, and contact details</p>
                  </div>
                </div>
              </div>

              {profileSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Office Admin"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      profileErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                  {profileErrors.name && (
                    <p className="text-rose-600 text-[11px] mt-1">{profileErrors.name}</p>
                  )}
                </div>

                {/* Username / Login ID */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Admin Username / Login ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      placeholder="admin"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs ${
                        profileErrors.username ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    You can log in to the admin panel using this username or your email address.
                  </p>
                  {profileErrors.username && (
                    <p className="text-rose-600 text-[11px] mt-1">{profileErrors.username}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Admin Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="akpatil7788@gmail.com"
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        profileErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="text-rose-600 text-[11px] mt-1">{profileErrors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98100 12345"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                form="profile-form"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile & Username</span>
              </button>
            </div>
          </div>

          {/* Card B: Change Admin Password */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
                    <p className="text-xs text-slate-500">Update your security password for admin portal login</p>
                  </div>
                </div>
              </div>

              {passwordSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                {/* New Password */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="Enter new strong password"
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        passwordErrors.newPassword ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-rose-600 text-[11px] mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      placeholder="Re-enter new password"
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        passwordErrors.confirmPassword
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-rose-600 text-[11px] mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Security Guidance:</p>
                  <p>• Password must be at least 4 characters long.</p>
                  <p>• Make sure to remember your new password before logging out.</p>
                </div>
              </form>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                form="password-form"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: Company & Invoice Settings */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Company & Invoicing Information</h3>
                <p className="text-xs text-slate-500">
                  These details appear automatically on generated PDF Quotations and Tax Invoices
                </p>
              </div>
            </div>
          </div>

          {companySuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{companySuccess}</span>
            </div>
          )}

          <form onSubmit={handleCompanySubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Company / Agency Legal Name
                </label>
                <input
                  type="text"
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  placeholder="AP SECURITY SYSTEM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  GSTIN / Tax Identification
                </label>
                <input
                  type="text"
                  value={companyForm.gstin}
                  onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value })}
                  placeholder="27EUDPP0562H1ZJ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              {/* Official Phone */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Company Official Phone
                </label>
                <input
                  type="tel"
                  value={companyForm.companyPhone}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyPhone: e.target.value })}
                  placeholder="7410108728"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Official Email */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Company Billing Email
                </label>
                <input
                  type="email"
                  value={companyForm.companyEmail}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyEmail: e.target.value })}
                  placeholder="akpatil7788@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Office Address */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Office & Billing Address
              </label>
              <textarea
                rows={2}
                value={companyForm.companyAddress}
                onChange={(e) => setCompanyForm({ ...companyForm, companyAddress: e.target.value })}
                placeholder="Co/off:- C.S. No 8265/4 KORE CLASSIC FRONT JAI HIND COLONY FRONT OF DR SAKEKAR VISHRAMBAG, SANGLI 416415"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Standard Quotation Terms & Conditions
              </label>
              <textarea
                rows={4}
                value={companyForm.quotationTerms}
                onChange={(e) => setCompanyForm({ ...companyForm, quotationTerms: e.target.value })}
                placeholder="Standard payment terms, warranty, and installation conditions..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px] leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Company Details</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. TAB 3: System Preferences */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">System Preferences & Workflow Defaults</h3>
                <p className="text-xs text-slate-500">
                  Global operational rules and tax settings for the application
                </p>
              </div>
            </div>
          </div>

          {preferencesSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{preferencesSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePreferencesSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Default GST Rate */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Default GST Rate (%)
                </label>
                <select
                  value={preferencesForm.defaultGstRate}
                  onChange={(e) =>
                    setPreferencesForm({
                      ...preferencesForm,
                      defaultGstRate: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>0% (Tax Exempted)</option>
                  <option value={5}>5% (Special Items)</option>
                  <option value={12}>12% (Telecom / Hardware)</option>
                  <option value={18}>18% (Standard CCTV Hardware & Services)</option>
                  <option value={28}>28% (Luxury Electronic Goods)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pre-selected tax rate when creating new quotations and tax invoices.
                </p>
              </div>

              {/* Quotation Validity */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Default Quotation Validity
                </label>
                <select
                  value={preferencesForm.quotationValidityDays}
                  onChange={(e) =>
                    setPreferencesForm({
                      ...preferencesForm,
                      quotationValidityDays: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 Days</option>
                  <option value={30}>30 Days (Standard 1 Month)</option>
                  <option value={45}>45 Days</option>
                  <option value={60}>60 Days</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
