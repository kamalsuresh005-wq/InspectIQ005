import React from 'react';
import { Plus, ClipboardList, UserCheck, ChevronRight, MapPin, Building, Shield } from 'lucide-react';
import { useInspection } from '../context/InspectionContext';

export const Dashboard: React.FC = () => {
  const { 
    currentUser, 
    inspections, 
    startNewInspection, 
    setActiveTab, 
    viewExistingInspection 
  } = useInspection();

  const completedCount = inspections.filter(i => i.status === 'Compliant' || i.officerDecision !== undefined).length;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-115px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Header & Actions */}
      <div className="space-y-4">
        
        {/* App Title Header */}
        <div className="border-b border-[#D9E1E8] pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#12304A]">
                Inspect<span className="text-[#0F766E]">IQ</span>
              </h1>
              <p className="text-xs text-[#52616F] font-medium mt-0.5">
                Packaged Commodity Inspection
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#E6F4F1] border border-[#D9E1E8] px-2.5 py-1 rounded-full text-[11px] text-[#0F766E] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
              <span>Enforcement Active</span>
            </div>
          </div>
        </div>

        {/* Officer Profile Card */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3.5 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#12304A] text-white font-bold text-sm flex items-center justify-center shrink-0">
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'LM'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-[#17212B] truncate">{currentUser.name}</h2>
                <span className="text-[10px] font-mono font-semibold bg-[#F4F7FA] text-[#52616F] px-1.5 py-0.2 rounded border border-[#D9E1E8]">
                  {currentUser.id}
                </span>
              </div>
              <p className="text-[11px] text-[#52616F] truncate">{currentUser.designation}</p>
              <p className="text-[10px] text-[#0F766E] font-semibold">{currentUser.zone}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="text-[11px] text-[#52616F] hover:text-[#12304A] font-semibold p-1"
            title="View Profile"
          >
            Settings
          </button>
        </div>

        {/* PRIMARY ACTION: + START NEW INSPECTION */}
        <button
          type="button"
          onClick={() => startNewInspection('physical')}
          className="w-full bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ Start New Inspection</span>
        </button>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* INSPECTION HISTORY CARD */}
          <button
            type="button"
            onClick={() => setActiveTab('inspections')}
            className="bg-white hover:bg-[#F4F7FA] active:bg-[#F4F7FA] border border-[#D9E1E8] rounded-xl p-3.5 text-left transition-colors flex flex-col justify-between h-24 shadow-card"
          >
            <div className="flex items-center justify-between text-[#12304A]">
              <ClipboardList className="w-5 h-5 text-[#0F766E]" />
              <span className="text-xs font-mono font-bold bg-[#F4F7FA] text-[#12304A] px-2 py-0.5 rounded border border-[#D9E1E8]">
                {inspections.length}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#17212B] block">Inspection History</span>
              <span className="text-[10.5px] text-[#52616F]">View completed inspections</span>
            </div>
          </button>

          {/* PROFILE / SETTINGS CARD */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="bg-white hover:bg-[#F4F7FA] active:bg-[#F4F7FA] border border-[#D9E1E8] rounded-xl p-3.5 text-left transition-colors flex flex-col justify-between h-24 shadow-card"
          >
            <div className="flex items-center justify-between text-[#12304A]">
              <UserCheck className="w-5 h-5 text-[#0F766E]" />
              <span className="text-[10px] font-semibold text-[#0F766E] bg-[#E6F4F1] px-1.5 py-0.5 rounded">
                Verified
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#17212B] block">Profile</span>
              <span className="text-[10.5px] text-[#52616F]">Officer account / settings</span>
            </div>
          </button>
        </div>

        {/* Real Inspection Activity / Saved Records */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#52616F] uppercase tracking-wider">
              Recent Inspections ({inspections.length})
            </span>
            {inspections.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('inspections')}
                className="text-[11px] font-semibold text-[#0F766E] hover:underline"
              >
                View all
              </button>
            )}
          </div>

          {inspections.length === 0 ? (
            <div className="p-4 bg-white border border-[#D9E1E8] rounded-xl text-center space-y-1.5 shadow-card">
              <ClipboardList className="w-8 h-8 text-[#52616F] mx-auto opacity-50" />
              <p className="text-xs font-semibold text-[#17212B]">No inspections recorded yet</p>
              <p className="text-[11px] text-[#52616F]">
                Tap <strong>+ Start New Inspection</strong> to capture premises and begin checking packaged commodities.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {inspections.slice(0, 3).map((insp) => (
                <div
                  key={insp.id}
                  onClick={() => viewExistingInspection(insp.id, 'report')}
                  className="p-3 bg-white border border-[#D9E1E8] rounded-xl shadow-card flex items-center justify-between gap-2 hover:border-[#0F766E] transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[#52616F] font-bold">
                        {insp.inspectionNumber}
                      </span>
                      {insp.premisesName && (
                        <span className="text-[10px] text-[#12304A] font-semibold truncate max-w-[140px]">
                          · {insp.premisesName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#17212B] truncate mt-0.5">
                      {insp.productName || 'Packaged Commodity'}
                    </p>
                    <p className="text-[10px] text-[#52616F]">
                      {new Date(insp.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      insp.status === 'Compliant'
                        ? 'bg-[#E6F4F1] text-[#15803D]'
                        : insp.status === 'Pending'
                        ? 'bg-[#F4F7FA] text-[#52616F]'
                        : 'bg-[#FEF3C7] text-[#B45309]'
                    }`}>
                      {insp.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#52616F]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Compact Officer Footer */}
      <div className="pt-4 text-center">
        <p className="text-[10px] text-[#52616F] font-medium">
          InspectIQ · Legal Metrology Packaged Commodities (PCR 2011)
        </p>
      </div>

    </div>
  );
};
