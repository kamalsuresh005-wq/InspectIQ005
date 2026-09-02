import React from 'react';
import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

export const FindingDetail: React.FC = () => {
  const { currentInspection, selectedFinding, setFlowStep } = useInspection();

  const finding = selectedFinding || currentInspection.complianceChecks.find(
    c => c.result === 'POTENTIAL_NON_COMPLIANCE' || c.result === 'REVIEW_REQUIRED'
  ) || currentInspection.complianceChecks[0];

  const primaryImage = currentInspection.images.find(img => img.side === 'back') || currentInspection.images[0];

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Header & Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
              Step 10 of 12
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Finding Detail</h1>
          </div>
          <button
            type="button"
            onClick={() => setFlowStep('compliance_analysis')}
            className="text-xs font-semibold text-blue-900 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Checks</span>
          </button>
        </div>

        {/* Compact Finding Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5 text-xs">
          
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Requirement
            </span>
            <p className="font-bold text-slate-900 text-xs mt-0.5">
              {finding?.expectedCondition || finding?.ruleTitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Detected
              </span>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">
                {finding?.detectedValue || 'Not detected'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Status
              </span>
              <span className={`inline-block font-bold text-[10.5px] px-2 py-0.5 rounded mt-0.5 ${
                finding?.result === 'COMPLIANT'
                  ? 'bg-emerald-50 text-emerald-800'
                  : finding?.result === 'REVIEW_REQUIRED'
                  ? 'bg-amber-50 text-amber-900'
                  : 'bg-red-50 text-red-800'
              }`}>
                {finding?.result === 'COMPLIANT' ? 'Appears Compliant' : finding?.result === 'REVIEW_REQUIRED' ? 'Requires Review' : 'Potential Non-Compliance'}
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Reason & Legal Rule
            </span>
            <p className="text-slate-700 text-xs mt-0.5">
              {finding?.explanation || 'Verification of statutory declaration standard.'}
            </p>
            <span className="text-[10px] font-mono text-blue-900 font-bold block mt-1">
              {finding?.ruleNumber} ({finding?.legalGround})
            </span>
          </div>

        </div>

        {/* Evidence Photo Container */}
        {primaryImage && (
          <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[16/10] flex items-center justify-center p-2 border border-slate-800 relative shadow-inner">
            <img
              src={primaryImage.url}
              alt="Packaging Evidence Region"
              className="max-h-full max-w-full object-contain rounded"
            />
            <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[9.5px] font-mono px-2 py-0.5 rounded">
              EVIDENCE · {primaryImage.side.toUpperCase()} VIEW
            </div>
          </div>
        )}
      </div>

      {/* Primary Action */}
      <div className="pt-3 safe-bottom">
        <button
          type="button"
          onClick={() => setFlowStep('officer_verification')}
          className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Continue to Final Decision</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
