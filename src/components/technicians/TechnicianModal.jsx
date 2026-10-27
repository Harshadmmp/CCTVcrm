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
    experienceYears: 3,
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
        experienceYears: technicianToEdit.experienceYears || 3,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        specialization: 'CCTV Installation',
        address: '',
        status: 'Active',
        experienceYears: 3,
      });
    }
    setErrors({});
  }, [technicianToEdit, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Technician full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!validateIndianPhone(formData.phone)) {
      errs.phone = 'Enter a valid Indian mobile number';
    }
    if (!formData.specialization) errs.specialization = 'Specialization is required';
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
      title={technicianToEdit ? `Edit Technician: ${technicianToEdit.id}` : 'Add Field Technician'}
      subtitle="Register technician profile for job assignment and site dispatch."
      maxWidth="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
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
              placeholder="Enter Phone Number"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
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
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

        {/* Experience & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Experience (Years)
            </label>
            <input
              type="number"
              min="1"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value, 10) || 1 })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Base Location / Residential Address
          </label>
          <textarea
            rows="2"
            placeholder="Enter Base Location / Residential Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
};

export default TechnicianModal;

