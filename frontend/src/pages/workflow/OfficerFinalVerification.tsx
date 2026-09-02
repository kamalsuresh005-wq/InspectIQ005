import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { OfficerDecision } from '../../types';

export const OfficerFinalVerification: React.FC = () => {
  const { currentInspection, submitOfficerDecision, completeCurrentInspection, currentUser, setFlowStep } = useInspection();

  const [decision, setDecision] = useState<'Compliant' | 'Requires Further Review' | 'Potential Non-Compliance'>('Potential Non-Compliance');
  const [remarks, setRemarks] = useState<string>('');

  const declarationsCount = currentInspection.declarations.length;
  const nonComplianceCount = currentInspection.complianceChecks.filter(c => c.result === 'POTENTIAL_NON_COMPLIANCE').length;
  const reviewCount = currentInspection.complianceChecks.filter(c => c.result === 'REVIEW_REQUIRED').length;
  const imagesCount = currentInspection.images.length;

  const handleComplete = () => {
    const officerDec: OfficerDecision = {
      decision: decision as any,
      remarks: remarks.trim() || `Inspection completed. Final officer determination: ${decision}.`,
      officerName: currentUser.name,
      designation: currentUser.designation,
      officerId: currentUser.id,
      decisionTimestamp: new Date().toISOString(),
      digitalSignatureRef: `DSC-INSP-${Date.now().toString(36).toUpperCase()}`
    };

    submitOfficerDecision(officerDec);
    completeCurrentInspection();
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Header & Summary */}
      <div className="space-y-3">
        <div>
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
            Step 11 of 12
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Officer Final Decision</h1>
          <p className="text-xs text-slate-500 mt-0.5">Authoritative statutory order recorded by enforcement officer.</p>
        </div>

        {/* Concise Inspection Summary Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-900">
              {currentInspection.productName}
            </span>
            <span className="text-slate-500 font-medium">
              {currentInspection.brand}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block font-medium">Declarations</span>
              <span className="font-bold text-slate-800">{declarationsCount} Checked</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block font-medium">Findings</span>
              <span className="font-bold text-amber-700">{nonComplianceCount + reviewCount} Flagged</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block font-medium">Evidence</span>
              <span className="font-bold text-blue-900">{imagesCount} Photos</span>
            </div>
          </div>
        </div>

        {/* Final Decision Options */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
            Select Final Statutory Order
          </span>

          <div className="space-y-1.5 text-xs">
            <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
              decision === 'Compliant'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}>
              <input
                type="radio"
                name="decision"
                checked={decision === 'Compliant'}
                onChange={() => setDecision('Compliant')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>Appears Compliant</span>
            </label>

            <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
              decision === 'Requires Further Review'
                ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}>
              <input
                type="radio"
                name="decision"
                checked={decision === 'Requires Further Review'}
                onChange={() => setDecision('Requires Further Review')}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span>Requires Further Review</span>
            </label>

            <label className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
              decision === 'Potential Non-Compliance'
                ? 'border-red-600 bg-red-50 text-red-900 font-semibold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}>
              <input
                type="radio"
                name="decision"
                checked={decision === 'Potential Non-Compliance'}
                onChange={() => setDecision('Potential Non-Compliance')}
                className="text-red-600 focus:ring-red-500"
              />
              <span>Potential Non-Compliance (Issue Notice)</span>
            </label>
          </div>
        </div>

        {/* Optional Remarks */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Officer Remarks / Directions (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Record specific directions, trader explanations, or compounding notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 text-slate-900"
          />
        </div>
      </div>

      {/* Primary Action */}
      <div className="pt-3 safe-bottom">
        <button
          type="button"
          onClick={handleComplete}
          className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Complete Inspection</span>
        </button>
      </div>

    </div>
  );
};
