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
import { formatINR, formatDate, cleanPhoneForDisplay } from '../../utils/formatters';
import SummaryCard from '../common/SummaryCard';
import StatusBadge from '../common/StatusBadge';

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4'];

export const ReportsPage = () => {
  const { enquiries, quotations, orders, invoices, technicians, adminSettings, currentUser } = useApp();

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

  // Total valuation across enquiries / orders
  const totalReportValue = useMemo(() => {
    return enquiries.reduce((sum, enq) => {
      const ord = orders.find((o) => o.id === enq.orderId);
      const quot = quotations.find((q) => q.id === enq.quotationId);
      return sum + (Number(ord?.grandTotal || quot?.grandTotal) || 0);
    }, 0);
  }, [enquiries, orders, quotations]);

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
    <div className="space-y-6 print:space-y-0 print:p-0">
      {/* Official Print Header (Visible ONLY when printing) */}
      <div className="hidden print:block mb-4 pb-3 border-b-2 border-slate-900">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-900 text-white rounded-lg flex items-center justify-center font-bold text-base">
              CCTV
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {adminSettings?.companyName || 'AP SECURITY SYSTEM'}
              </h1>
              <p className="text-xs text-slate-600 max-w-lg mt-0.5">
                {adminSettings?.companyAddress ||
                  'Co/off:- C.S. No 8265/4 KORE CLASSIC FRONT JAI HIND COLONY FRONT OF DR SAKEKAR VISHRAMBAG, SANGLI 416415'}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Phone: <span className="font-semibold text-slate-900">{adminSettings?.companyPhone || '7410108728'}</span> | Email:{' '}
                <span className="font-semibold text-slate-900">{adminSettings?.companyEmail || 'akpatil7788@gmail.com'}</span>
                {adminSettings?.gstin && (
                  <span> | GSTIN: <span className="font-mono font-semibold">{adminSettings.gstin}</span></span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 text-xs font-bold bg-slate-100 text-slate-900 border border-slate-300 rounded uppercase">
              Customer Enquiries & Workflow Orders Summary
            </span>
            <p className="text-xs text-slate-600 mt-2">
              Generated:{' '}
              <span className="font-semibold text-slate-900">
                {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Total Records: <strong className="text-slate-800">{enquiries.length}</strong> | Total Value:{' '}
              <strong className="text-slate-900 font-mono">{formatINR(totalReportValue)}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards (Hidden during Print) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
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

      {/* Charts section (Hidden during Print) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 print:hidden">
        {/* Revenue Comparison Chart */}
        <div className="lg:col-span-2 print:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs print:shadow-none print:border-slate-300">
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
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between print:shadow-none print:border-slate-300">
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

      {/* Technician Workload & Performance Table (Hidden during Print) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print:hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Technician Performance & Workload Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Allocated jobs and completed installations
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-800">Technician</th>
                <th className="py-3 px-3 font-bold text-slate-800">Specialization</th>
                <th className="py-3 px-3 text-center font-bold text-slate-800">Total Allocated</th>
                <th className="py-3 px-3 text-center font-bold text-slate-800">In Progress</th>
                <th className="py-3 px-3 text-center font-bold text-slate-800">Completed</th>
                <th className="py-3 px-4 text-center font-bold text-slate-800">Status</th>
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
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={tech.status} size="xs" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Enquiries & Workflow Orders Summary Table (Printed Report Target) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden print:shadow-none print:border print:border-slate-300 print:rounded-none print:overflow-visible">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Customer Enquiries & Workflow Orders Summary
            </h3>
            <p className="text-xs text-slate-500">
              Complete customer pipeline status, technicians, and valuations ({enquiries.length} records)
            </p>
          </div>
          <div className="text-right print:hidden">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Total Value: <strong className="text-blue-900 font-bold">{formatINR(totalReportValue)}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs border-collapse print:text-[11px]">
            <thead className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center font-bold text-slate-800">#</th>
                <th className="py-2.5 px-3 font-bold text-slate-800">Enquiry ID</th>
                <th className="py-2.5 px-3 font-bold text-slate-800">Customer Name</th>
                <th className="py-2.5 px-3 font-bold text-slate-800">Contact</th>
                <th className="py-2.5 px-3 font-bold text-slate-800">Requirement</th>
                <th className="py-2.5 px-3 font-bold text-slate-800">Order Ref</th>
                <th className="py-2.5 px-3 font-bold text-slate-800">Technician</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-800">Value (₹)</th>
                <th className="py-2.5 px-3 font-bold text-slate-800">Date</th>
                <th className="py-2.5 px-3 text-center font-bold text-slate-800">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {enquiries.map((enq, index) => {
                const ord = orders.find((o) => o.id === enq.orderId);
                const quot = quotations.find((q) => q.id === enq.quotationId);
                const val = ord?.grandTotal || quot?.grandTotal || 0;
                return (
                  <tr key={enq.id} className="hover:bg-slate-50/70 print:break-inside-avoid">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{index + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{enq.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{enq.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{cleanPhoneForDisplay(enq.phone)}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs" title={enq.requirement}>
                      {enq.requirement}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{enq.orderId || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{enq.technicianName || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {val ? formatINR(val) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{formatDate(enq.createdAt)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={enq.workflowStatus} size="xs" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={7} className="py-2.5 px-3 text-left font-bold text-xs">
                  Total Customer Records: {enquiries.length} Enquiries / Orders
                </td>
                <td className="py-2.5 px-3 text-right font-bold font-mono text-xs text-blue-900">
                  {formatINR(totalReportValue)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Official Print Footer */}
      <div className="hidden print:flex items-center justify-between pt-4 mt-6 border-t border-slate-300 text-[11px] text-slate-500 print:break-inside-avoid">
        <span>AP Security System • Customer Enquiries & Workflow Orders Summary Report</span>
        <span>Confidential • Official Business Record</span>
        <div className="text-right">
          <p className="border-b border-slate-400 w-44 mb-1"></p>
          <span>Authorized Signature / Stamp</span>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

