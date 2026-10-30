import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { validateIndianPhone } from '../../utils/formatters';

export const TechnicianModal = ({ isOpen, onClose, technicianToEdit }) => {
  const { addTechnician, updateTechnician } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: 'CCTV Installation',
    address: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (technicianToEdit) {
      setFormData({
        name: technicianToEdit.name || '',
        phone: technicianToEdit.phone || '',
        email: technicianToEdit.email || '',
        specialization: technicianToEdit.specialization || 'CCTV Installation',
        address: technicianToEdit.address || '',
        status: technicianToEdit.status || 'Active',
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        specialization: 'CCTV Installation',
        address: '',
        status: 'Active',
      });
    }
    setErrors({});
  }, [technicianToEdit, isOpen]);

  const validate = () => {
    const errs = {};
    const phoneDigits = (formData.phone || '').replace(/\D/g, '');
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!phoneDigits) {
      errs.phone = 'Phone number is required';
    } else if (phoneDigits.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.specialization) errs.specialization = 'Specialization is required';
    if (!formData.address.trim()) {
      errs.address = 'Base location / residential address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (technicianToEdit) {
      updateTechnician(technicianToEdit.id, formData);
    } else {
      addTechnician(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[60]"
      title={technicianToEdit ? `Edit Technician: ${technicianToEdit.id}` : 'Add Field Technician'}
      maxWidth="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {technicianToEdit ? 'Save Changes' : 'Add Technician'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Full Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              value={formData.phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, phone: digits });
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
          </div>
        </div>

        {/* Email & Specialization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter Email Address"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Specialization <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CCTV Installation">CCTV Installation & Cabling</option>
              <option value="DVR / NVR Setup">DVR / NVR & Storage Setup</option>
              <option value="Networking">PoE & IP Networking</option>
              <option value="Maintenance">Maintenance & Repair</option>
            </select>
          </div>
        </div>

        {/* Deployment Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deployment Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="Active">Active (Available for Jobs)</option>
            <option value="Inactive">Inactive (On Leave / Suspended)</option>
          </select>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Base Location / Residential Address <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows="2"
            placeholder="Enter Base Location / Residential Address"
            value={formData.address}
            onChange={(e) => {
              setFormData({ ...formData, address: e.target.value });
              if (errors.address) setErrors({ ...errors, address: undefined });
            }}
            className={`w-full px-3 py-2 text-xs rounded-lg border ${
              errors.address ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.address && <p className="mt-1 text-xs text-rose-500">{errors.address}</p>}
        </div>
      </form>
    </Modal>
  );
};

export default TechnicianModal;
