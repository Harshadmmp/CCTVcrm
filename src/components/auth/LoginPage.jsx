import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Shield,
  User,
  Lock,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, technicians } = useApp();

  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'technician'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill or switch tab helper
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'admin') {
      setIdentifier('admin@securevision.in');
      setPassword('admin123');
    } else {
      const defaultTech = technicians[0] || {
        email: 'ramesh.tech@securevision.in',
        phone: '+91 98112 34567',
      };
      setIdentifier(defaultTech.email);
      setPassword(defaultTech.phone);
    }
  };

  // Quick 1-click login preset
  const handleQuickLogin = (role, email, pass) => {
    setError('');
    setActiveTab(role);
    setIdentifier(email);
    setPassword(pass);

    const res = login(email, pass);
    if (res.success) {
      if (res.user.role === 'technician') {
        navigate('/technician-portal');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your email or username.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password / phone number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);

      if (res.success) {
        if (res.user.role === 'technician') {
          navigate('/technician-portal');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3.5">
            <Video className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            SecureVision <span className="text-xs bg-blue-500/30 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">CCTV</span>
          </h1>
          <p className="text-xs text-blue-200/70 mt-1">
            Operations & Field Service Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleSelectTab('admin')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Admin Login</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab('technician')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                activeTab === 'technician'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Technician Login</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Header info badge */}
            <div className="mb-5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {activeTab === 'admin' ? 'Administrative Access' : 'Field Engineer Access'}
              </span>
              <span className="text-[11px] text-slate-400">
                {activeTab === 'admin' ? 'Full Operations Control' : 'Assigned Jobs & Surveys'}
              </span>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span className="flex-1 leading-snug">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username / Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {activeTab === 'admin' ? 'Admin Email / Username' : 'Technician Email Address'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      activeTab === 'admin'
                        ? 'admin@securevision.in'
                        : 'e.g. ramesh.tech@securevision.in'
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password / Phone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {activeTab === 'admin' ? 'Password' : 'Password (Phone Number)'}
                  </label>
                  {activeTab === 'technician' && (
                    <span className="text-[11px] text-indigo-600 font-medium">
                      Registered Phone
                    </span>
                  )}
                </div>
                <div className="relative">
                  {activeTab === 'admin' ? (
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  ) : (
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  )}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      activeTab === 'admin'
                        ? 'Enter password (admin123)'
                        : 'e.g. +91 98112 34567 or 9811234567'
                    }
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-900 font-mono"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to {activeTab === 'admin' ? 'Admin Portal' : 'Technician Tasks'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Pills */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Quick Demo 1-Click Login:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Admin button */}
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin('admin', 'admin@securevision.in', 'admin123')
                  }
                  className="p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-blue-700">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span>Office Admin</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    admin@securevision.in
                  </span>
                </button>

                {/* Tech 1 button */}
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin(
                      'technician',
                      technicians[0]?.email || 'ramesh.tech@securevision.in',
                      technicians[0]?.phone || '+91 98112 34567'
                    )
                  }
                  className="p-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/60 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-indigo-700">
                    <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{technicians[0]?.name || 'Ramesh Kumar (Tech)'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Pass: {technicians[0]?.phone || '9811234567'}
                  </span>
                </button>

                {/* Tech 2 button */}
                {technicians[1] && (
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin(
                        'technician',
                        technicians[1].email,
                        technicians[1].phone
                      )
                    }
                    className="p-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/60 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-indigo-700">
                      <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{technicians[1].name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Pass: {technicians[1].phone}
                    </span>
                  </button>
                )}

                {/* Tech 3 button */}
                {technicians[2] && (
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin(
                        'technician',
                        technicians[2].email,
                        technicians[2].phone
                      )
                    }
                    className="p-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/60 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-indigo-700">
                      <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{technicians[2].name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Pass: {technicians[2].phone}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          Default technician password is their registered phone number.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

