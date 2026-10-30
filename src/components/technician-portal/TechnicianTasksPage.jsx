import React, { useState, useMemo } from 'react';
import {
  Wrench,
  CheckCircle2,
  Calendar,
  Phone,
  MapPin,
  Package,
  Search,
  ChevronRight,
  Clock,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate, cleanPhoneForDisplay } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';
import EmptyState from '../common/EmptyState';
import Modal from '../common/Modal';

export const TechnicianTasksPage = () => {
  const {
    currentUser,
    technicians,
    orders,
    enquiries,
    updateWorkStatus,
    completeSiteSurvey,
    addToast,
    techTaskSelectedTechId,
    setTechTaskSelectedTechId,
    techTaskActiveTab,
    setTechTaskActiveTab,
    techTaskSearchQuery,
    setTechTaskSearchQuery,
  } = useApp();

  const selectedTechId = techTaskSelectedTechId;
  const setSelectedTechId = setTechTaskSelectedTechId;
  const activeTab = techTaskActiveTab;
  const setActiveTab = setTechTaskActiveTab;
  const searchQuery = techTaskSearchQuery;
  const setSearchQuery = setTechTaskSearchQuery;

  const activeTech = useMemo(() => {
    if (currentUser?.role === 'technician') {
      return currentUser;
    }
    return technicians.find((t) => t.id === selectedTechId) || technicians[0] || {};
  }, [currentUser, technicians, selectedTechId]);

  // Selected task for modal view & actions
  const [activeTask, setActiveTask] = useState(null);

  // In-progress job completion notes
  const [jobNotes, setJobNotes] = useState('');

  // Survey completion findings
  const [surveyFindings, setSurveyFindings] = useState('');
  const [surveyOutcome, setSurveyOutcome] = useState(
    'Site surveyed. Camera angles and cable routes verified.'
  );

  // 1. Get assigned orders for this technician
  const assignedOrders = useMemo(() => {
    if (!activeTech?.id && !activeTech?.name) return [];
    return orders.filter(
      (o) =>
        (activeTech.id && o.assignedTechnicianId?.toLowerCase() === activeTech.id.toLowerCase()) ||
        (activeTech.name && o.assignedTechnicianName?.toLowerCase().trim() === activeTech.name.toLowerCase().trim()) ||
        (activeTech.phone && o.technicianPhone && o.technicianPhone.replace(/\D/g, '').endsWith(activeTech.phone.replace(/\D/g, '').slice(-10)))
    );
  }, [orders, activeTech]);

  // 2. Get assigned site visits for this technician (strictly matches site visit technician)
  const assignedSurveys = useMemo(() => {
    if (!activeTech?.id && !activeTech?.name) return [];
    return enquiries.filter((e) => {
      const sv = e.siteVisit;
      if (!sv) return false;
      const matchesTech =
        (sv.staffOrTechId && activeTech.id && sv.staffOrTechId.toLowerCase() === activeTech.id.toLowerCase()) ||
        (sv.staffOrTechName && activeTech.name && sv.staffOrTechName.toLowerCase().trim() === activeTech.name.toLowerCase().trim());
      return matchesTech;
    });
  }, [enquiries, activeTech]);

  // Real-time counter calculations matching dashboard summary
  const activeInstallationsCount = useMemo(() => {
    return assignedOrders.filter((o) => o.workStatus !== 'Completed').length;
  }, [assignedOrders]);

  const pendingSurveysCount = useMemo(() => {
    return assignedSurveys.filter((e) => e.siteVisit?.status !== 'Completed').length;
  }, [assignedSurveys]);

  const completedTasksCount = useMemo(() => {
    const completedOrders = assignedOrders.filter((o) => o.workStatus === 'Completed').length;
    const completedSurveys = assignedSurveys.filter((e) => e.siteVisit?.status === 'Completed').length;
    return completedOrders + completedSurveys;
  }, [assignedOrders, assignedSurveys]);

  const totalAssignedTasksCount = activeInstallationsCount + pendingSurveysCount + completedTasksCount;

  // Unified list of tasks
  const unifiedTasks = useMemo(() => {
    const list = [];

    // Map orders
    assignedOrders.forEach((o) => {
      list.push({
        type: 'ORDER',
        id: o.id,
        refId: o.enquiryId,
        customerName: o.customerName,
        phone: o.customerPhone,
        siteAddress: o.siteAddress,
        date: o.assignmentDate || o.startDate || '—',
        status: o.workStatus, // 'Assigned', 'In Progress', 'Completed'
        amount: o.grandTotal,
        items: o.items || [],
        notes: o.workNotes || '',
        startDate: o.startDate || '',
        completionDate: o.completionDate || '',
        raw: o,
      });
    });

    // Map site visits
    assignedSurveys.forEach((e) => {
      const sv = e.siteVisit;
      list.push({
        type: 'SURVEY',
        id: sv.id || `SV-${e.id}`,
        refId: e.id,
        customerName: e.customerName,
        phone: e.phone,
        siteAddress: e.siteAddress,
        date: sv.visitDate || '—',
        time: sv.visitTime || '11:00 AM',
        status: sv.status === 'Completed' ? 'Completed' : 'Scheduled',
        notes: sv.notes || e.notes || '',
        outcome: sv.outcome || '',
        raw: e,
      });
    });

    return list;
  }, [assignedOrders, assignedSurveys]);

  // Filtered tasks based on tab & search
  const filteredTasks = useMemo(() => {
    return unifiedTasks.filter((task) => {
      // Tab filter
      if (activeTab === 'orders' && task.type !== 'ORDER') return false;
      if (activeTab === 'surveys' && task.type !== 'SURVEY') return false;
      if (activeTab === 'completed' && task.status !== 'Completed') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = task.customerName?.toLowerCase().includes(q);
        const matchPhone = task.phone?.includes(q);
        const matchId = task.id?.toLowerCase().includes(q);
        const matchRef = task.refId?.toLowerCase().includes(q);
        const matchAddr = task.siteAddress?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchId && !matchRef && !matchAddr) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedTasks, activeTab, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    const total = unifiedTasks.length;
    const ordersCount = assignedOrders.length;
    const surveysCount = assignedSurveys.length;
    const completedCount = unifiedTasks.filter((t) => t.status === 'Completed').length;
    return {
      total,
      ordersCount,
      surveysCount,
      completedCount,
    };
  }, [unifiedTasks, assignedOrders, assignedSurveys]);

  // Handler: Start Job
  const handleStartJob = (orderId) => {
    const today = new Date().toISOString().split('T')[0];
    updateWorkStatus(orderId, {
      workStatus: 'In Progress',
      startDate: today,
      workNotes: `Started on-site installation by ${activeTech.name} on ${today}.`,
    });
    addToast('Work Started', `Order ${orderId} marked as In Progress.`);
    setActiveTask(null);
  };

  // Handler: Submit Completed Job
  const handleConfirmJobCompletion = (orderId) => {
    const today = new Date().toISOString().split('T')[0];

    updateWorkStatus(orderId, {
      enquiryId: activeTask?.refId,
      workStatus: 'Completed',
      completionDate: today,
      workNotes: jobNotes || 'Installation completed and camera feeds verified by client.',
      checklist: {
        camerasMounted: true,
        cablingTested: true,
        recordingActive: true,
        clientDemoGiven: true,
      },
    });

    addToast('Job Completed', `Order ${orderId} marked as Completed.`);
    setActiveTask(null);
    setJobNotes('');
  };

  // Handler: Submit Completed Survey
  const handleConfirmSurveyCompletion = (enquiryId) => {
    completeSiteSurvey(
      enquiryId,
      surveyOutcome,
      surveyFindings || 'Physical survey completed. Location ready for installation.'
    );

    setActiveTask(null);
    setSurveyFindings('');
  };

  return (
    <div className="space-y-5">
      {/* Main Task Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table View: Clickable rows showing only necessary details */}
        <div className="overflow-x-auto">
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No assigned tasks found"
              description="There are currently no tasks matching your selected filter for this technician."
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200 select-none">
                <tr>
                  <th className="py-3 px-4 w-28 font-bold text-slate-800">Task ID</th>
                  <th className="py-3 px-4 min-w-[130px] font-bold text-slate-800">Type</th>
                  <th className="py-3 px-4 min-w-[200px] font-bold text-slate-800">Customer</th>
                  <th className="py-3 px-4 min-w-[240px] font-bold text-slate-800">Site Address</th>
                  <th className="py-3 px-3 min-w-[140px] font-bold text-slate-800">Schedule / Date</th>
                  <th className="py-3 px-3 min-w-[120px] font-bold text-slate-800">Status</th>
                  <th className="py-3 px-4 w-10 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTasks.map((task) => {
                  const isOrder = task.type === 'ORDER';

                  return (
                    <tr
                      key={`${task.type}-${task.id}`}
                      onClick={() => setActiveTask(task)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      title="Click anywhere to open task details & actions"
                    >
                      {/* 1. Task ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        <span className="font-semibold block text-xs">{task.id}</span>
                        {task.refId && task.refId !== task.id && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {task.refId}
                          </span>
                        )}
                      </td>

                      {/* 2. Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                            isOrder
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {isOrder ? 'Installation' : 'Site Survey'}
                        </span>
                      </td>

                      {/* 3. Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 text-xs block leading-snug">
                          {task.customerName}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{cleanPhoneForDisplay(task.phone)}</span>
                        </div>
                      </td>

                      {/* 4. Site Address */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-1.5 text-xs text-slate-600 w-[200px] max-w-[210px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span
                            className="line-clamp-2 break-words leading-tight text-slate-700"
                            title={task.siteAddress}
                          >
                            {task.siteAddress}
                          </span>
                        </div>
                      </td>

                      {/* 5. Schedule / Date */}
                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-800 block text-xs">
                          {formatDate(task.date)}
                        </span>
                        {task.time && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {task.time}
                          </span>
                        )}
                      </td>

                      {/* 6. Status */}
                      <td className="py-3.5 px-3">
                        <StatusBadge status={task.status} size="xs" />
                      </td>

                      {/* 7. Action Chevron */}
                      <td className="py-3.5 px-4 text-right">
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

      {/* Task Details & Action Modal (Opened upon row click) */}
      {activeTask && (
        <Modal
          isOpen={Boolean(activeTask)}
          onClose={() => setActiveTask(null)}
          title={`Task Dossier: ${activeTask.id}`}
          subtitle={`${
            activeTask.type === 'ORDER' ? 'Installation Order' : 'Physical Site Survey'
          } • ${activeTask.customerName}`}
          maxWidth="max-w-lg"
          footer={
            <div className="flex items-center justify-between w-full">
              {/* Direct Actions inside Modal */}
              <div className="flex items-center gap-2">
                {activeTask.type === 'ORDER' && activeTask.status === 'Assigned' && (
                  <button
                    type="button"
                    onClick={() => handleStartJob(activeTask.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Start Installation</span>
                  </button>
                )}

                {activeTask.type === 'ORDER' && activeTask.status === 'In Progress' && (
                  <button
                    type="button"
                    onClick={() => handleConfirmJobCompletion(activeTask.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Job</span>
                  </button>
                )}

                {activeTask.type === 'SURVEY' && activeTask.status === 'Scheduled' && (
                  <button
                    type="button"
                    onClick={() => handleConfirmSurveyCompletion(activeTask.refId)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Submit Survey Report</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Customer Box */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-slate-400 font-medium block">Customer:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {activeTask.customerName}
                  </p>
                </div>
                <StatusBadge status={activeTask.status} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                <a
                  href={`tel:${activeTask.phone}`}
                  className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{cleanPhoneForDisplay(activeTask.phone)} (Call)</span>
                </a>
                <div className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeTask.siteAddress}</span>
                </div>
              </div>
            </div>

            {/* If Order: Items & Scope */}
            {activeTask.type === 'ORDER' && (
              <>
                <div>
                  <span className="font-semibold text-slate-800 block mb-1.5">
                    Equipment Scope & Quantity:
                  </span>
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-40 overflow-y-auto">
                    {activeTask.items && activeTask.items.length > 0 ? (
                      activeTask.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-1 border-b border-slate-200 last:border-b-0"
                        >
                          <span className="text-slate-800 font-medium">
                            {it.name}{' '}
                            <span className="text-slate-500 font-normal">x{it.quantity}</span>
                          </span>
                          <span className="font-mono text-slate-700">
                            {formatINR(it.lineTotal || 0)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">Standard surveillance package.</p>
                    )}
                  </div>
                  {activeTask.amount && (
                    <div className="text-right mt-1 text-xs font-bold text-slate-900">
                      Total Order Value: {formatINR(activeTask.amount)}
                    </div>
                  )}
                </div>

                {/* If Order is In Progress: completion notes */}
                {activeTask.status === 'In Progress' && (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Technician Completion Notes:
                      </label>
                      <textarea
                        rows={3}
                        value={jobNotes}
                        onChange={(e) => setJobNotes(e.target.value)}
                        placeholder="e.g. All cameras operational. Night vision tested. Handover completed."
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* If Order is Completed */}
                {activeTask.status === 'Completed' && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-800 space-y-1">
                    <span className="font-semibold block text-xs">Work Completed:</span>
                    <p className="text-[11px]">
                      {activeTask.notes || 'Installation completed and camera feeds verified by client.'}
                    </p>
                    {activeTask.completionDate && (
                      <p className="text-[10px] text-emerald-600">
                        Date: {formatDate(activeTask.completionDate)}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* If Survey: Scheduled details & survey report input */}
            {activeTask.type === 'SURVEY' && (
              <>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Visit Date: <strong>{formatDate(activeTask.date)}</strong> at{' '}
                      <strong>{activeTask.time}</strong>
                    </span>
                  </div>
                  {activeTask.notes && (
                    <p className="text-slate-600 mt-2 text-[11px] leading-relaxed">
                      <strong>Client Note:</strong> {activeTask.notes}
                    </p>
                  )}
                </div>

                {activeTask.status === 'Scheduled' && (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Survey Recommendation:
                      </label>
                      <input
                        type="text"
                        value={surveyOutcome}
                        onChange={(e) => setSurveyOutcome(e.target.value)}
                        placeholder="e.g. Site surveyed. 12 camera positions tagged and feasible."
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Field Inspection Notes:
                      </label>
                      <textarea
                        rows={2}
                        value={surveyFindings}
                        onChange={(e) => setSurveyFindings(e.target.value)}
                        placeholder="e.g. Power outlet verified in server room. 40m extra conduit pipe needed."
                        className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {activeTask.status === 'Completed' && activeTask.outcome && (
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-800">
                    <span className="font-semibold block mb-0.5">Survey Outcome:</span>
                    <p>{activeTask.outcome}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TechnicianTasksPage;
