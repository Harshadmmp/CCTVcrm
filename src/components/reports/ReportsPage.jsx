import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  Receipt,
  TrendingUp,
  Filter,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/formatters';
import SummaryCard from '../common/SummaryCard';
import StatusBadge from '../common/StatusBadge';

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];

export const ReportsPage = () => {
  const { enquiries, quotations, orders, invoices, technicians } = useApp();

  // Filters
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [billingFilter, setBillingFilter] = useState('All'); // 'All', 'Invoiced', 'Pending Invoice'

  // Summary counts and financial metrics
  const totalEnquiriesCount = enquiries.length;
  const quotationPipelineTotal = quotations.reduce(
    (sum, q) => sum + (Number(q.grandTotal) || 0),
    0
  );
  const confirmedOrderRevenue = orders.reduce(
    (sum, o) => sum + (Number(o.grandTotal) || 0),
    0
  );
  const actualInvoicedRevenue = invoices.reduce(
    (sum, inv) => sum + (Number(inv.grandTotal) || 0),
    0
  );
  const completedJobsCount = orders.filter((o) => o.workStatus === 'Completed').length;

  // Breakdown by service category (from order items)
  const categoryBreakdown = useMemo(() => {
    const map = {};
    orders.forEach((ord) => {
      (ord.items || []).forEach((item) => {
        const cat = item.category || 'Hardware';
        map[cat] = (map[cat] || 0) + (Number(item.lineTotal) || 0);
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Monthly order value chart
  const monthlyRevenueData = [
    { month: 'Jun', confirmedOrders: 115000, invoiced: 85000 },
    { month: 'Jul', confirmedOrders: 145000, invoiced: 120000 },
    { month: 'Aug', confirmedOrders: 180000, invoiced: 160000 },
    { month: 'Sep', confirmedOrders: 210000, invoiced: 195000 },
    { month: 'Oct', confirmedOrders: confirmedOrderRevenue, invoiced: actualInvoicedRevenue },
  ];

  // Technician performance metrics table
  const technicianPerformance = useMemo(() => {
    return technicians.map((tech) => {
      const assignedOrders = orders.filter((o) => o.assignedTechnicianId === tech.id);
      const completedCount = assignedOrders.filter((o) => o.workStatus === 'Completed').length;
      const inProgressCount = assignedOrders.filter((o) => o.workStatus === 'In Progress').length;
      const totalJobValue = assignedOrders.reduce(
        (sum, o) => sum + (Number(o.grandTotal) || 0),
        0
      );

      return {
        ...tech,
        totalJobs: assignedOrders.length,
        completedCount,
        inProgressCount,
        totalJobValue,
      };
    });
  }, [technicians, orders]);

  // Export CSV function
  const handleExportCSV = () => {
    const headers = [
      'Enquiry ID',
      'Customer Name',
      'Phone',
      'Requirement',
      'Workflow Status',
      'Order ID',
      'Technician',
      'Job Value (INR)',
      'Created Date',
    ];

    const rows = enquiries.map((enq) => {
      const ord = orders.find((o) => o.id === enq.orderId);
      const quot = quotations.find((q) => q.id === enq.quotationId);
      const val = ord?.grandTotal || quot?.grandTotal || 0;
      return [
        `"${enq.id}"`,
        `"${enq.customerName.replace(/"/g, '""')}"`,
        `"${enq.phone}"`,
        `"${enq.requirement}"`,
        `"${enq.workflowStatus}"`,
        `"${enq.orderId || '—'}"`,
        `"${enq.technicianName || '—'}"`,
        val,
        `"${formatDate(enq.createdAt)}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CCTV_Operations_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Listen to Topbar Export and Print actions
  useEffect(() => {
    const onExport = () => handleExportCSV();
    const onPrint = () => handlePrint();
    window.addEventListener('app:export-csv', onExport);
    window.addEventListener('app:print-report', onPrint);
    return () => {
      window.removeEventListener('app:export-csv', onExport);
      window.removeEventListener('app:print-report', onPrint);
    };
  }, [enquiries, orders, quotations]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Enquiries"
          value={totalEnquiriesCount}
          icon={Layers}
          variant="blue"
          subtitle="Pipeline volume"
        />
        <SummaryCard
          title="Quotation Pipeline"
          value={formatINR(quotationPipelineTotal)}
          icon={TrendingUp}
          variant="indigo"
          subtitle="All issued quotes"
        />
        <SummaryCard
          title="Confirmed Order Value"
          value={formatINR(confirmedOrderRevenue)}
          icon={CheckCircle2}
          variant="purple"
          subtitle={`${orders.length} Confirmed orders`}
        />
        <SummaryCard
          title="Actual Invoiced Total"
          value={formatINR(actualInvoicedRevenue)}
          icon={Receipt}
          variant="emerald"
          subtitle={`${invoices.length} Tax invoices`}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Comparison Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Confirmed Order Value vs. Billed Invoices (₹)
              </h3>
              <p className="text-xs text-slate-500">Monthly progression</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-purple-600 font-medium">
                <span className="w-3 h-3 rounded-xs bg-purple-600 inline-block" /> Orders
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" /> Invoices
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatINR(value),
                    name === 'confirmedOrders' ? 'Confirmed Orders' : 'Billed Invoices',
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="confirmedOrders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="invoiced" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Revenue by Product / Service Category
            </h3>
            <p className="text-xs text-slate-500 mb-2">Based on confirmed order items</p>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cat-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatINR(val), 'Value']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      borderColor: '#e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
            {categoryBreakdown.map((item, idx) => (
              <div key={item.name} className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 ml-2">{formatINR(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technician Workload & Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Technician Performance & Workload Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Allocated jobs, completed installations, and total order execution value
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-3">Specialization</th>
                <th className="py-3 px-3 text-center">Total Allocated</th>
                <th className="py-3 px-3 text-center">In Progress</th>
                <th className="py-3 px-3 text-center">Completed</th>
                <th className="py-3 px-3 text-right">Job Execution Value</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {technicianPerformance.map((tech) => (
                <tr key={tech.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                        {tech.name.charAt(0)}
                      </div>
                      <span>{tech.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{tech.specialization}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {tech.totalJobs}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded font-bold bg-purple-50 text-purple-700">
                      {tech.inProgressCount}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700">
                      {tech.completedCount}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-blue-600">
                    {formatINR(tech.totalJobValue)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={tech.status} size="xs" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

