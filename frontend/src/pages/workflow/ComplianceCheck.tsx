import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ComplianceCheck as ComplianceCheckType } from '../../types';

export const ComplianceCheck: React.FC = () => {
  const { 
    currentInspection, 
    setSelectedFinding, 
    setFlowStep, 
    runComplianceValidation, 
    isValidatingRules, 
    validationError 
  } = useInspection();

  const [validationCompletedNotice, setValidationCompletedNotice] = useState(false);

  useEffect(() => {
    // Run validation if checks have not been run or if triggered
    if (currentInspection.complianceChecks.length === 0) {
      runComplianceValidation().then(() => {
        setValidationCompletedNotice(true);
        setTimeout(() => setValidationCompletedNotice(false), 2500);
      });
    }
  }, []);

  const checks = currentInspection.complianceChecks;
  const nonComplianceCount = checks.filter(
    (c) => c.result === 'POTENTIAL_NON_COMPLIANCE' || c.controlledStatus === 'POTENTIAL_NON_COMPLIANCE'
  ).length;
  const reviewCount = checks.filter(
    (c) => c.result === 'REQUIRES_OFFICER_REVIEW' || c.result === 'REVIEW_REQUIRED' || c.controlledStatus === 'REQUIRES_OFFICER_REVIEW'
  ).length;
  const compliantCount = checks.filter(
    (c) => c.result === 'APPEARS_COMPLIANT' || c.result === 'COMPLIANT' || c.controlledStatus === 'APPEARS_COMPLIANT'
  ).length;

  const handleSelectFinding = (check: ComplianceCheckType) => {
    setSelectedFinding(check);
    setFlowStep('finding_detail');
  };

  const handleProceed = () => {
    setFlowStep('evidence');
  };

  const handleRevalidate = async () => {
    await runComplianceValidation();
    setValidationCompletedNotice(true);
    setTimeout(() => setValidationCompletedNotice(false), 2500);
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none pb-24">
      
      {/* Header & Status Section */}
      <div className="space-y-3">
        
        {/* Step Navigation & Title */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider bg-[#E6F4F1] px-2 py-0.5 rounded">
              Step 7 of 8 · Inspection Flow
            </span>
            <h1 className="text-xl font-bold text-[#12304A] mt-1">Compliance Validation</h1>
            <p className="text-xs text-[#52616F] mt-0.5">
              Deterministic rule evaluation under Legal Metrology Act 2009 & PCR 2011.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFlowStep('declaration_verification')}
            className="text-xs font-semibold text-[#12304A] flex items-center gap-1 hover:text-[#0F766E]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Declarations</span>
          </button>
        </div>

        {/* Loading / Validation Banner */}
        {isValidatingRules && (
          <div className="bg-[#E6F4F1] border border-[#0F766E]/40 rounded-xl p-3 flex items-center gap-3 text-xs text-[#0F766E] font-semibold">
            <span className="w-4 h-4 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin"></span>
            <span>Validating declarations...</span>
          </div>
        )}

        {validationCompletedNotice && !isValidatingRules && !validationError && (
          <div className="bg-[#15803D]/10 border border-[#15803D]/30 rounded-xl p-2.5 flex items-center gap-2 text-xs text-[#15803D] font-semibold transition-all">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15803D]" />
            <span>Validation complete</span>
          </div>
        )}

        {/* Error State Banner */}
        {validationError && !isValidatingRules && (
          <div className="bg-[#B91C1C]/10 border border-[#B91C1C]/30 rounded-xl p-3 text-xs text-[#B91C1C] space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
            <p className="text-[11px] text-[#52616F]">
              The compliance validation service could not complete the automated evaluation. Please inspect each statutory declaration manually.
            </p>
            <button
              type="button"
              onClick={handleRevalidate}
              className="px-3 py-1 bg-white border border-[#B91C1C] rounded text-xs font-semibold text-[#B91C1C] hover:bg-[#B91C1C]/5 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Validation</span>
            </button>
          </div>
        )}

        {/* Overall Status Card (Only shown when not errored) */}
        {!validationError && (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between shadow-xs ${
            nonComplianceCount > 0
              ? 'bg-[#B91C1C]/5 border-[#B91C1C]/30 text-[#B91C1C]'
              : reviewCount > 0
              ? 'bg-[#B45309]/5 border-[#B45309]/30 text-[#B45309]'
              : 'bg-[#15803D]/5 border-[#15803D]/30 text-[#15803D]'
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                Overall Validation Status
              </span>
              <span className="text-base font-bold mt-0.5 block">
                {nonComplianceCount > 0
                  ? 'Potential Non-Compliance'
                  : reviewCount > 0
                  ? 'Requires Officer Review'
                  : 'Appears Compliant'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold block text-[#52616F]">
                {checks.length} Rules Evaluated
              </span>
              <button
                type="button"
                onClick={handleRevalidate}
                disabled={isValidatingRules}
                className="text-[10.5px] font-semibold text-[#12304A] hover:underline flex items-center gap-1 justify-end mt-0.5"
              >
                <RefreshCw className={`w-3 h-3 ${isValidatingRules ? 'animate-spin' : ''}`} />
                <span>Re-run</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Count Mini Indicators */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white border border-[#D9E1E8] rounded-lg p-2">
            <span className="text-[10px] text-[#52616F] block font-medium">Compliant</span>
            <span className="font-bold text-[#15803D]">{compliantCount}</span>
          </div>
          <div className="bg-white border border-[#D9E1E8] rounded-lg p-2">
            <span className="text-[10px] text-[#52616F] block font-medium">Under Review</span>
            <span className="font-bold text-[#B45309]">{reviewCount}</span>
          </div>
          <div className="bg-white border border-[#D9E1E8] rounded-lg p-2">
            <span className="text-[10px] text-[#52616F] block font-medium">Flagged</span>
            <span className="font-bold text-[#B91C1C]">{nonComplianceCount}</span>
          </div>
        </div>

        {/* Compact Checklist: Declaration | Status | Finding */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl shadow-xs overflow-hidden">
          
          <div className="bg-[#F4F7FA] px-3.5 py-2 border-b border-[#D9E1E8] flex items-center justify-between text-[10px] font-bold text-[#52616F] uppercase tracking-wider">
            <span>Declaration & Rule</span>
            <span>Status / Finding</span>
          </div>

          <div className="divide-y divide-[#D9E1E8]">
            {checks.map((chk) => {
              const status = chk.controlledStatus || (chk.result as any);
              const isCompliant = status === 'APPEARS_COMPLIANT' || status === 'COMPLIANT';
              const isNonCompliance = status === 'POTENTIAL_NON_COMPLIANCE';
              const isReview = status === 'REQUIRES_OFFICER_REVIEW' || status === 'REVIEW_REQUIRED';
              const isNotApplicable = status === 'NOT_APPLICABLE';

              let statusLabel = 'Appears Compliant';
              let badgeColor = 'bg-[#15803D]/10 text-[#15803D] border-[#15803D]/20';
              let icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />;

              if (isNonCompliance) {
                statusLabel = 'Potential Non-Compliance';
                badgeColor = 'bg-[#B91C1C]/10 text-[#B91C1C] border-[#B91C1C]/20';
                icon = <XCircle className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" />;
              } else if (isReview) {
                statusLabel = 'Requires Officer Review';
                badgeColor = 'bg-[#B45309]/10 text-[#B45309] border-[#B45309]/20';
                icon = <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] shrink-0" />;
              } else if (isNotApplicable) {
                statusLabel = 'Not Applicable';
                badgeColor = 'bg-[#D9E1E8]/50 text-[#52616F] border-[#D9E1E8]';
                icon = <span className="text-[11px] text-[#52616F] font-bold">—</span>;
              }

              return (
                <div
                  key={chk.checkId}
                  onClick={() => handleSelectFinding(chk)}
                  className="p-3 hover:bg-[#F4F7FA] transition-colors cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5">{icon}</div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#17212B] truncate block">
                        {chk.fieldChecked || chk.ruleTitle}
                      </span>
                      <span className="text-[10px] font-mono text-[#52616F] block truncate">
                        {chk.ruleNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                      {statusLabel}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#52616F]" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Officer Notice */}
        <div className="p-2.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-xl text-[11px] text-[#52616F]">
          <span>
            Click any finding to inspect evidence photographs, read statutory grounds, or override system flags.
          </span>
        </div>

      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9E1E8] p-3 max-w-md mx-auto z-10 safe-bottom">
        <button
          type="button"
          onClick={handleProceed}
          className="w-full bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.99] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Evidence & Photographs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
