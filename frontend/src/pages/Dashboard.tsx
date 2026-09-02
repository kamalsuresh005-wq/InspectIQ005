import React from 'react';
import { Plus, ClipboardList, FileText, ChevronRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useInspection } from '../context/InspectionContext';

export const Dashboard: React.FC = () => {
  const { 
    currentUser, 
    inspections, 
    startNewInspection, 
    setActiveTab, 
    viewExistingInspection 
  } = useInspection();

  const recentInspections = inspections.slice(0, 3);
  const reportsCount = inspections.filter(i => i.officerDecision !== undefined || i.status === 'Compliant').length;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Header & Status */}
      <div className="space-y-4">
        
        {/* Officer Profile Badge */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-900 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              RS
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{currentUser.name}</h2>
              <p className="text-[11px] text-slate-500">{currentUser.designation}</p>
              <span className="text-[10px] text-blue-900 font-semibold">{currentUser.zone}</span>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online</span>
          </span>
        </div>

        {/* PRIMARY ACTION: + NEW INSPECTION */}
        <button
          type="button"
          onClick={() => startNewInspection('physical')}
          className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-base py-4 px-5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ New Inspection</span>
        </button>

        {/* Secondary Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('inspections')}
            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-xs text-left transition-colors flex flex-col justify-between h-20"
          >
            <div className="flex items-center justify-between text-blue-900">
              <ClipboardList className="w-5 h-5" />
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {inspections.length}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800">My Inspections</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspections')}
            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-xs text-left transition-colors flex flex-col justify-between h-20"
          >
            <div className="flex items-center justify-between text-blue-900">
              <FileText className="w-5 h-5" />
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {reportsCount}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800">Saved Reports</span>
          </button>
        </div>

        {/* Compact Recent Activity */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Recent Activity
          </span>

          <div className="space-y-1.5">
            {recentInspections.map((insp) => (
              <div
                key={insp.id}
                onClick={() => viewExistingInspection(insp.id, 'report')}
                className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between gap-2 hover:border-blue-800 transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] text-slate-400 block font-bold">
                    {insp.inspectionNumber}
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {insp.productName}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    insp.status === 'Compliant'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-amber-50 text-amber-900'
                  }`}>
                    {insp.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Tag */}
      <div className="pt-4 text-center">
        <p className="text-[10px] text-slate-400 font-medium">
          InspectIQ · Legal Metrology (PCR 2011) Field Assistant
        </p>
      </div>

    </div>
  );
};
