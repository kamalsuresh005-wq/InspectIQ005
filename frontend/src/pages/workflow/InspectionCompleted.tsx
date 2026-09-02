import React from 'react';
import { CheckCircle2, FileText, Download, Home, ArrowRight, ShieldCheck } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ReportService } from '../../services/reportService';

export const InspectionCompleted: React.FC = () => {
  const { currentInspection, setFlowStep, setActiveTab } = useInspection();

  const findingsCount = currentInspection.complianceChecks.filter(
    c => c.result === 'POTENTIAL_NON_COMPLIANCE' || c.result === 'REVIEW_REQUIRED'
  ).length;

  const handleGeneratePdf = () => {
    setFlowStep('report');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none text-center">
      
      {/* Top Completion Header & Card */}
      <div className="space-y-4 pt-2">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900">Inspection Completed</h1>
          <p className="text-xs text-slate-500 mt-0.5">Statutory inspection record successfully verified and sealed.</p>
        </div>

        {/* Compact Summary Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-left shadow-xs divide-y divide-slate-100 text-xs">
          
          <div className="py-2 first:pt-0 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Inspection ID</span>
            <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
              {currentInspection.inspectionNumber}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Product</span>
            <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">
              {currentInspection.productName}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Premises</span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
              {currentInspection.premisesName || currentInspection.retailerName || 'Retail Premises'}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Findings</span>
            <span className="font-bold text-amber-700">
              {findingsCount} flagged issues
            </span>
          </div>

          <div className="py-2 last:pb-0 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Final Decision</span>
            <span className="text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              {currentInspection.officerDecision?.decision || currentInspection.status}
            </span>
          </div>

        </div>
      </div>

      {/* Primary Actions */}
      <div className="pt-4 space-y-2 safe-bottom">
        <button
          type="button"
          onClick={() => setFlowStep('report')}
          className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>View Report</span>
        </button>

        <button
          type="button"
          onClick={handleGeneratePdf}
          className="w-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Generate PDF Document</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 flex items-center justify-center gap-1"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Home</span>
        </button>
      </div>

    </div>
  );
};
