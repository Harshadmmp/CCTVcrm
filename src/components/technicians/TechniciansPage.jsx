import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cleanPhoneForDisplay } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import TechnicianModal from './TechnicianModal';
import Modal from '../common/Modal';

export const TechniciansPage = () => {
  const navigate = useNavigate();
  const {
    technicians,
    deleteTechnician,
    orders,
    technicianSearchQuery,
    setTechnicianSearchQuery,
    technicianSpecializationFilter,
    setTechnicianSpecializationFilter,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [technicianToEdit, setTechnicianToEdit] = useState(null);
  const [viewTech, setViewTech] = useState(null);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      if (technicianSearchQuery && technicianSearchQuery.trim()) {
        const q = technicianSearchQuery.toLowerCase().trim();
        const matchesName = tech.name.toLowerCase().includes(q);
        const matchesPhone = tech.phone.toLowerCase().includes(q);
        const matchesId = tech.id.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesId) return false;
      }
      if (technicianSpecializationFilter && tech.specialization !== technicianSpecializationFilter) return false;
      return true;
    });
  }, [technicians, technicianSearchQuery, technicianSpecializationFilter]);

  const clearFilters = () => {
    setTechnicianSearchQuery('');
    setTechnicianSpecializationFilter('');
  };

  // Listen to Topbar Add Technician action
  useEffect(() => {
    const handleAddTech = () => {
      setTechnicianToEdit(null);
      setIsModalOpen(true);
    };
    window.addEventListener('app:add-technician', handleAddTech);
    return () => window.removeEventListener('app:add-technician', handleAddTech);
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          {filteredTechnicians.length === 0 ? (
            <EmptyState
              title="No technicians found"
              description={
                technicianSearchQuery || technicianSpecializationFilter
                  ? "Try adjusting your specialization filter or search keywords."
                  : "Start by adding your first technician."
              }
              actionLabel={technicianSearchQuery || technicianSpecializationFilter ? "Clear Filters" : "Add Technician"}
              onAction={() => {
                if (technicianSearchQuery || technicianSpecializationFilter) {
                  clearFilters();
                } else {
                  setTechnicianToEdit(null);
                  setIsModalOpen(true);
                }
              }}
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-28">ID</th>
                  <th className="py-3 px-4">Technician Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Specialization</th>
                  <th className="py-3 px-3">Location / Address</th>
                  <th className="py-3 px-3 text-center w-24">Status</th>
                  <th className="py-3 px-4 w-10 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTechnicians.map((t) => {
                  const activeAssignedCount = orders.filter(
                    (o) =>
                      o.assignedTechnicianId === t.id &&
                      (o.workStatus === 'Assigned' || o.workStatus === 'In Progress')
                  ).length;

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setViewTech(t)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      title="Click anywhere to view technician profile"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">{t.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs">{t.name}</span>
                            <span className="text-[11px] text-slate-400">
                              {t.experienceYears ? `${t.experienceYears} yrs exp • ` : ''}{activeAssignedCount} active jobs
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800">{cleanPhoneForDisplay(t.phone)}</p>
                        {t.email && <p className="text-[11px] text-slate-400">{t.email}</p>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                          {t.specialization}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={t.address}>
                        {t.address || '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={t.status} size="xs" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all ml-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <TechnicianModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTechnicianToEdit(null);
        }}
        technicianToEdit={technicianToEdit}
      />

      {/* View Modal */}
      {viewTech && (
        <Modal
          isOpen={Boolean(viewTech)}
          onClose={() => setViewTech(null)}
          title={`Technician Profile: ${viewTech.name}`}
          subtitle={`${viewTech.id} • ${viewTech.specialization}`}
          maxWidth="max-w-lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete technician ${viewTech.name}?`)) {
                    deleteTechnician(viewTech.id);
                    setViewTech(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewTech(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tech = viewTech;
                    setViewTech(null);
                    setTechnicianToEdit(tech);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Technician</span>
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-base flex items-center justify-center flex-shrink-0">
                {viewTech.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">{viewTech.name}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {cleanPhoneForDisplay(viewTech.phone)}
                  </span>
                  {viewTech.email && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {viewTech.email}
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge status={viewTech.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium block">Specialization:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{viewTech.specialization}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Experience:</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{viewTech.experienceYears ? `${viewTech.experienceYears} Years` : '—'}</p>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-medium block mb-1">Base Address / Location:</span>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {viewTech.address || 'Address not listed.'}
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setViewTech(null);
                  navigate('/technician-portal');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>View Assigned Tasks in Technician Portal</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TechniciansPage;

