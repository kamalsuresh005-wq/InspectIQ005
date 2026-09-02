import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ComplianceCheck as ComplianceCheckType } from '../../types';

export const ComplianceCheck: React.FC = () => {
  const { currentInspection, setSelectedFinding, setFlowStep } = useInspection();

  const checks = currentInspection.complianceChecks;
  const reviewItems = checks.filter(c => c.result === 'REVIEW_REQUIRED' || c.result === 'POTENTIAL_NON_COMPLIANCE');
  const reviewCount = reviewItems.length;

  const handleSelectFinding = (check: ComplianceCheckType) => {
    setSelectedFinding(check);
    setFlowStep('finding_detail');
  };

  const handleProceed = () => {
    if (reviewCount > 0) {
      setSelectedFinding(reviewItems[0]);
      setFlowStep('finding_detail');
    } else {
      setFlowStep('officer_verification');
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Content */}
      <div className="space-y-3.5">
        <div>
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
            Step 9 of 12
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Compliance Check</h1>
          <p className="text-xs text-slate-500 mt-0.5">Verification against Legal Metrology (PCR 2011) requirements.</p>
        </div>

        {/* Compact Rule Assessment Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Statutory Evaluation
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {checks.length} Rules Evaluated
            </span>
          </div>

          <div className="space-y-1.5 max-h-[calc(100dvh-320px)] overflow-y-auto pr-0.5">
            {checks.slice(0, 7).map((chk) => {
              const isCompliant = chk.result === 'COMPLIANT';
              const isReview = chk.result === 'REVIEW_REQUIRED';
              const isViolation = chk.result === 'POTENTIAL_NON_COMPLIANCE';

              return (
                <div
                  key={chk.checkId}
                  onClick={() => handleSelectFinding(chk)}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50/50 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors border border-transparent hover:border-blue-200"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs">
                      {isCompliant && <span className="text-emerald-600 font-bold">✓</span>}
                      {isReview && <span className="text-amber-600 font-bold">⚠</span>}
                      {isViolation && <span className="text-red-600 font-bold">✕</span>}
                    </span>
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {chk.fieldChecked || chk.ruleTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isCompliant
                        ? 'text-emerald-700 bg-emerald-50'
                        : isReview
                        ? 'text-amber-800 bg-amber-50'
                        : 'text-red-700 bg-red-50'
                    }`}>
                      {isCompliant ? 'Appears Compliant' : isReview ? 'Requires Review' : 'Potential Non-Compliance'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highlight Summary Notice */}
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
          reviewCount > 0
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <span>
            {reviewCount > 0
              ? `${reviewCount} items require officer review`
              : 'All statutory rules appear compliant'}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            Rule Engine
          </span>
        </div>
      </div>

      {/* Primary Action */}
      <div className="pt-3 safe-bottom">
        <button
          type="button"
          onClick={handleProceed}
          className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>{reviewCount > 0 ? 'Review Findings' : 'Continue to Final Decision'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
