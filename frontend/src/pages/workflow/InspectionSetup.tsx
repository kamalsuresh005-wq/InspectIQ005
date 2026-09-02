import React from 'react';
import { ArrowRight, ShieldCheck, Calendar, User, FileText } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

export const InspectionSetup: React.FC = () => {
  const { currentInspection, setFlowStep } = useInspection();

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Header & Details */}
      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
            Step 1 of 12
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">New Inspection</h1>
          <p className="text-xs text-slate-500 mt-0.5">Session initialized under Legal Metrology Rules.</p>
        </div>

        {/* Compact Details Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs divide-y divide-slate-100">
          
          <div className="py-2.5 first:pt-0 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Inspection ID</span>
            <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
              {currentInspection.inspectionNumber}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Date / Time</span>
            <span className="text-xs font-semibold text-slate-800">
              {new Date(currentInspection.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Officer</span>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 block">{currentInspection.officerName}</span>
              <span className="text-[10px] text-slate-500">{currentInspection.officerDesignation}</span>
            </div>
          </div>

          <div className="py-2.5 last:pb-0 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Status</span>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Initiated
            </span>
          </div>

        </div>

        {/* Note */}
        <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600">
          Ready to record premises and begin multi-view packaging evidence capture.
        </div>
      </div>

      {/* Primary Action */}
      <div className="pt-4 safe-bottom">
        <button
          type="button"
          onClick={() => setFlowStep('location')}
          className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Start Inspection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
