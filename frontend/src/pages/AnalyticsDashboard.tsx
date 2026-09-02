import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Filter, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Layers,
  Scale
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState('all');
  const [timeRange, setTimeRange] = useState('month');

  const monthlyVolumeData = [
    { month: 'Jan', physical: 140, ecommerce: 65, total: 205, violations: 42 },
    { month: 'Feb', physical: 165, ecommerce: 80, total: 245, violations: 51 },
    { month: 'Mar', physical: 190, ecommerce: 110, total: 300, violations: 64 },
    { month: 'Apr', physical: 220, ecommerce: 145, total: 365, violations: 78 },
    { month: 'May', physical: 280, ecommerce: 190, total: 470, violations: 98 },
  ];

  const zoneComplianceData = [
    { zone: 'North Zone (Delhi, UP, PB)', compliance: 74, total: 420 },
    { zone: 'West Zone (MH, GJ, RJ)', compliance: 82, total: 380 },
    { zone: 'South Zone (KA, TN, TS)', compliance: 88, total: 350 },
    { zone: 'East Zone (WB, OR, BH)', compliance: 68, total: 290 },
    { zone: 'Central Zone (MP, CG)', compliance: 71, total: 220 },
  ];

  const topViolatedRulesData = [
    { rule: 'Rule 5 (Font Size)', count: 84, color: '#dc2626' },
    { rule: 'Rule 6(1)(e) (MRP Format)', count: 68, color: '#ea580c' },
    { rule: 'Rule 6(11) (Unit Price)', count: 52, color: '#d97706' },
    { rule: 'Rule 14 (Country of Origin)', count: 44, color: '#2563eb' },
    { rule: 'Rule 9 (Consumer Care)', count: 36, color: '#7c3aed' },
  ];

  const modalityData = [
    { name: 'Physical Retail Stores', value: 65, color: '#78350F' },
    { name: 'Quick Commerce (10-min)', value: 22, color: '#d97706' },
    { name: 'Marketplace E-Commerce', value: 13, color: '#2563eb' },
  ];

  return (
    <div className="space-y-4 pb-8 text-xs">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">Executive Analytics</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">National Enforcement Intelligence</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">Legal Metrology Enforcement Analytics</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Macro compliance trends, violation frequency distribution and zonal enforcement performance under <strong>PCR 2011</strong>.
          </p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 font-semibold text-xs shrink-0"
        >
          <option value="week">Past 7 Days</option>
          <option value="month">Current Month (May 2026)</option>
          <option value="quarter">Q1 2026</option>
          <option value="year">FY 2025-26</option>
        </select>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-slate-500 block">National Compliance Rate</span>
          <span className="text-xl font-bold text-emerald-800 font-mono mt-0.5 block">76.8%</span>
          <span className="text-[10px] text-slate-400">Across 1,660 audits this quarter</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-red-800 block">Statutory Notices Issued</span>
          <span className="text-xl font-bold text-red-700 font-mono mt-0.5 block">385 Notices</span>
          <span className="text-[10px] text-slate-400">82% resolved via compounding</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-slate-700 block">Compounding Recovery</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">₹ 96.2 Lakhs</span>
          <span className="text-[10px] text-slate-400">Section 48 treasury receipts</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-amber-800 block">E-Commerce Compliance</span>
          <span className="text-xl font-bold text-amber-800 font-mono mt-0.5 block">68.2%</span>
          <span className="text-[10px] text-slate-400">Rule 6(10) Origin & USP checks</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Monthly Inspection Growth Area Chart */}
        <div className="lg:col-span-8 bg-white p-4 border border-slate-200 rounded space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Monthly Inspection Volume & Violations Curve
              </h3>
              <p className="text-[11px] text-slate-500">Physical retail vs digital e-commerce audits (2026)</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200 font-mono">
              YTD Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="total" name="Total Inspections" stroke="#78350F" fill="#fdf4eb" strokeWidth={2} />
                <Area type="monotone" dataKey="violations" name="Violations Flagged" stroke="#dc2626" fill="#fef2f2" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modality Donut Chart */}
        <div className="lg:col-span-4 bg-white p-4 border border-slate-200 rounded flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-0.5">
              Inspections by Modality
            </h3>
            <p className="text-[11px] text-slate-500 mb-2">Channel distribution</p>

            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modalityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {modalityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
            {modalityData.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }}></span>
                  <span>{m.name}</span>
                </div>
                <span className="font-bold text-slate-800">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zonal Compliance Rate Horizontal Bars */}
        <div className="lg:col-span-6 bg-white p-4 border border-slate-200 rounded space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Zonal Compliance Rate Comparison
            </h3>
            <p className="text-[11px] text-slate-500">Statutory adherence across enforcement zones</p>
          </div>

          <div className="space-y-2.5">
            {zoneComplianceData.map((zone) => (
              <div key={zone.zone} className="space-y-0.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{zone.zone}</span>
                  <span className="font-mono font-bold text-slate-900">{zone.compliance}% ({zone.total} audits)</span>
                </div>
                <div className="w-full bg-slate-100 rounded h-1.5 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded ${
                      zone.compliance >= 80 ? 'bg-emerald-600' : zone.compliance >= 70 ? 'bg-amber-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${zone.compliance}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Violated Rules Bar Chart */}
        <div className="lg:col-span-6 bg-white p-4 border border-slate-200 rounded space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Top Statutory Non-Compliance Rules
            </h3>
            <p className="text-[11px] text-slate-500">Most frequent legal contraventions detected</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topViolatedRulesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="rule" type="category" width={130} tick={{ fontSize: 10, fill: '#1e293b' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#78350F" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
