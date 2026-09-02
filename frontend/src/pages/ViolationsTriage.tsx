import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ArrowRight,
  ShieldAlert,
  Building2,
  Calendar,
  X,
  Send
} from 'lucide-react';
import { useInspection } from '../context/InspectionContext';
import { Violation } from '../types';

export const ViolationsTriage: React.FC = () => {
  const { inspections, viewExistingInspection, selectEvidence, setFlowStep } = useInspection();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedViolation, setSelectedViolation] = useState<{ violation: Violation; inspectionNumber: string; productName: string; manufacturer: string } | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Aggregate all violations across inspections
  const allViolations: { violation: Violation; inspectionNumber: string; productName: string; manufacturer: string }[] = [];
  inspections.forEach((insp) => {
    insp.violations.forEach((v) => {
      allViolations.push({
        violation: v,
        inspectionNumber: insp.inspectionNumber,
        productName: insp.productName,
        manufacturer: insp.manufacturerName,
      });
    });
  });

  const filteredViolations = allViolations.filter((item) => {
    const v = item.violation;
    const matchesSearch =
      v.violationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ruleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ruleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inspectionNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || v.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || v.status.toLowerCase().includes(statusFilter.toLowerCase());

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleInspectEvidence = (item: { violation: Violation; inspectionNumber: string }) => {
    const insp = inspections.find((i) => i.inspectionNumber === item.inspectionNumber);
    if (insp) {
      viewExistingInspection(insp.id, 'compliance');
    }
  };

  const handleTakeStatutoryAction = (actionType: string) => {
    if (!selectedViolation) return;
    setActionSuccessMessage(`Statutory order [${actionType}] recorded for ${selectedViolation.violation.violationId}. Notice dispatched to ${selectedViolation.manufacturer.split(',')[0]}.`);
    setTimeout(() => {
      setActionSuccessMessage(null);
      setSelectedViolation(null);
    }, 2800);
  };

  const exportViolationsCsv = () => {
    const headers = ['Violation ID', 'Inspection ID', 'Commodity', 'Manufacturer', 'Rule Violated', 'Severity', 'Finding', 'Observed Value', 'Mandatory Standard', 'Status'];
    const rows = filteredViolations.map((iv) => [
      iv.violation.violationId,
      iv.inspectionNumber,
      `"${iv.productName}"`,
      `"${iv.manufacturer}"`,
      `"${iv.violation.ruleNumber} - ${iv.violation.ruleTitle}"`,
      iv.violation.severity,
      `"${iv.violation.finding}"`,
      `"${iv.violation.observedValue}"`,
      `"${iv.violation.requiredStandard}"`,
      iv.violation.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Legal_Metrology_Violations_Register_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-8 text-xs">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">Statutory Non-Compliance Register</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Department of Legal Metrology</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">Violations Triage & Enforcement Adjudication</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Centralized repository of potential and confirmed statutory infractions under <strong>Legal Metrology Act, 2009 & PCR 2011</strong>.
          </p>
        </div>

        <button
          onClick={exportViolationsCsv}
          className="bg-white border border-slate-300 text-slate-700 font-semibold py-1.5 px-3 rounded hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-slate-500 block">Total Flagged Infractions</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">{allViolations.length} Active</span>
          <span className="text-[10px] text-slate-400">Across registered commodities</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-red-800 block">High Severity Deficits</span>
          <span className="text-xl font-bold text-red-700 font-mono mt-0.5 block">
            {allViolations.filter((v) => v.violation.severity === 'High').length} Cases
          </span>
          <span className="text-[10px] text-slate-400">Rule 5 Font & Rule 6 Net Qty</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-amber-800 block">Section 48 Compoundable</span>
          <span className="text-xl font-bold text-amber-800 font-mono mt-0.5 block">
            {allViolations.filter((v) => v.violation.severity === 'Medium' || v.violation.severity === 'High').length} Cases
          </span>
          <span className="text-[10px] text-slate-400">First-time statutory settlement</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10.5px] font-semibold text-slate-700 block">Section 36 Notices Served</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-0.5 block">
            {allViolations.filter((v) => v.violation.status.includes('Notice')).length || 2} Notices
          </span>
          <span className="text-[10px] text-slate-400">Show-cause proceedings</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 border border-slate-200 rounded flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search violation ID, product, rule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#78350F] text-xs"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs"
        >
          <option value="all">All Severities</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low Severity</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs"
        >
          <option value="all">All Enforcement Statuses</option>
          <option value="review">Officer Review Required</option>
          <option value="confirmed">Confirmed Violation</option>
          <option value="notice">Notice Issued</option>
        </select>
      </div>

      {/* Violations Formal Register Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-700 border-b border-slate-200 uppercase">
                <th className="py-2.5 px-3">Violation ID</th>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Commodity</th>
                <th className="py-2.5 px-3">Rule & Title</th>
                <th className="py-2.5 px-3">Observed Finding</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredViolations.map((item) => {
                const v = item.violation;
                const isHigh = v.severity === 'High';

                return (
                  <tr key={v.violationId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-red-800">
                      {v.violationId}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {item.inspectionNumber}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-900 truncate max-w-[160px]">
                      {item.productName}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#78350F] block font-mono text-[10.5px]">{v.ruleNumber}</span>
                      <span className="text-[10px] text-slate-500">{v.ruleTitle}</span>
                    </td>

                    <td className="py-2.5 px-3 max-w-[220px]">
                      <p className="text-[11px] text-slate-800 line-clamp-1">{v.finding}</p>
                      <span className="text-[9.5px] font-mono text-slate-500">Observed: {v.observedValue}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`inline-block text-[9.5px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isHigh ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {v.severity}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {v.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleInspectEvidence(item)}
                          className="text-xs font-semibold text-[#78350F] hover:underline"
                        >
                          Evidence
                        </button>
                        <button
                          onClick={() => setSelectedViolation(item)}
                          className="text-xs font-bold text-red-800 hover:underline"
                        >
                          Adjudicate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Adjudication Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded border border-slate-300 shadow-2xl overflow-hidden text-xs">
            <div className="bg-[#1E293B] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-xs">
                  Statutory Order: {selectedViolation.violation.violationId}
                </h3>
              </div>
              <button onClick={() => setSelectedViolation(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {actionSuccessMessage ? (
                <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto" />
                  <p className="font-bold">{actionSuccessMessage}</p>
                </div>
              ) : (
                <>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-0.5">
                    <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Commodity & Entity</span>
                    <p className="font-bold text-slate-900">{selectedViolation.productName}</p>
                    <p className="text-slate-600">{selectedViolation.manufacturer}</p>
                  </div>

                  <div className="p-2.5 bg-red-50 rounded border border-red-200 space-y-0.5">
                    <span className="text-[9.5px] uppercase font-bold text-red-800 block">Established Infraction</span>
                    <p className="font-semibold text-red-950">{selectedViolation.violation.finding}</p>
                    <p className="font-mono text-red-800 text-[10.5px]">Observed: {selectedViolation.violation.observedValue} | Standard: {selectedViolation.violation.requiredStandard}</p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="font-bold text-slate-800 block">Record Statutory Order:</span>
                    
                    <button
                      onClick={() => handleTakeStatutoryAction('Section 48 Compounding Order')}
                      className="w-full p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded text-left transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-amber-900">1. Issue Section 48 Compounding Order (₹25,000)</div>
                        <p className="text-[10px] text-amber-700">First-time departmental settlement fee without court prosecution.</p>
                      </div>
                      <Scale className="w-4 h-4 text-amber-700 shrink-0" />
                    </button>

                    <button
                      onClick={() => handleTakeStatutoryAction('Section 36(1) Show-Cause Notice')}
                      className="w-full p-2.5 bg-red-50 hover:bg-red-100 border border-red-300 rounded text-left transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-red-900">2. Issue Section 36(1) Show-Cause Notice</div>
                        <p className="text-[10px] text-red-700">Formal 15-day statutory notice served on manufacturer/retailer.</p>
                      </div>
                      <FileText className="w-4 h-4 text-red-700 shrink-0" />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedViolation(null)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
