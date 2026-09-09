import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileCheck2, 
  Info,
  Scale
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

type ControlledDecision = 'APPEARS_COMPLIANT' | 'REQUIRES_FURTHER_REVIEW' | 'POTENTIAL_NON_COMPLIANCE';

export const FinalDecisionScreen: React.FC = () => {
  const { 
    currentInspection, 
    currentUser, 
    setFlowStep, 
    submitFinalDecision 
  } = useInspection();

  const checks = currentInspection.complianceChecks || [];
  const nonComplianceCount = checks.filter(
    (c) => c.result === 'POTENTIAL_NON_COMPLIANCE' || c.controlledStatus === 'POTENTIAL_NON_COMPLIANCE'
  ).length;
  const reviewCount = checks.filter(
    (c) => c.result === 'REQUIRES_OFFICER_REVIEW' || c.result === 'REVIEW_REQUIRED'
  ).length;

  const systemStatus = nonComplianceCount > 0
    ? 'Potential Non-Compliance'
    : reviewCount > 0
    ? 'Requires Officer Review'
    : 'Appears Compliant';

  const [selectedDecision, setSelectedDecision] = useState<ControlledDecision | null>(() => {
    if (currentInspection.finalDecision === 'Potential Non-Compliance') return 'POTENTIAL_NON_COMPLIANCE';
    if (currentInspection.finalDecision === 'Requires Further Review') return 'REQUIRES_FURTHER_REVIEW';
    if (currentInspection.finalDecision === 'Appears Compliant') return 'APPEARS_COMPLIANT';
    return null;
  });

  const [remarks, setRemarks] = useState<string>(currentInspection.officerRemarks || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRecordDecision = () => {
    if (!selectedDecision) {
      setErrorMsg('Please select an authoritative officer final decision to proceed.');
      return;
    }

    submitFinalDecision(selectedDecision, remarks);
    setFlowStep('report');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none pb-24">
      
      <div className="space-y-4">
        
        {/* Step Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider bg-[#E6F4F1] px-2 py-0.5 rounded">
              Step 9 of 10 · Final Decision
            </span>
            <h1 className="text-xl font-bold text-[#12304A] mt-1">Final Decision</h1>
            <p className="text-xs text-[#52616F] mt-0.5">
              Authoritative statutory determination by the inspecting officer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFlowStep('officer_review')}
            className="text-xs font-semibold text-[#12304A] flex items-center gap-1 hover:text-[#0F766E] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Review</span>
          </button>
        </div>

        {/* Statutory Notice Banner */}
        <div className="bg-[#12304A] text-white p-3.5 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0" />
            <span className="font-bold text-xs">Statutory Authority Notice</span>
          </div>
          <p className="text-[11px] text-[#D9E1E8] leading-relaxed">
            The final inspection decision is made solely by the inspecting officer. System assessments and compliance findings are advisory aids and do not constitute a legal determination.
          </p>
        </div>

        {/* Section 1: System Rule Engine Assessment (Advisory) */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[#D9E1E8] pb-1.5">
            <span className="text-[10px] font-bold text-[#52616F] uppercase tracking-wider">
              System Rule Engine Assessment (Advisory)
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              systemStatus === 'Potential Non-Compliance'
                ? 'bg-red-100 text-red-900 border border-red-200'
                : systemStatus === 'Requires Officer Review'
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}>
              {systemStatus}
            </span>
          </div>

          <p className="text-xs text-[#17212B]">
            {nonComplianceCount > 0 ? (
              <>Rule engine flagged <b>{nonComplianceCount} potential statutory non-compliance(s)</b> based on extracted packaging declarations.</>
            ) : reviewCount > 0 ? (
              <>Rule engine flagged <b>{reviewCount} item(s) requiring manual officer review</b>.</>
            ) : (
              <>All evaluated declarations meet basic rule requirements under Legal Metrology Rules 2011.</>
            )}
          </p>
        </div>

        {/* Section 2: Officer Final Decision (Selectable) */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 border-b border-[#D9E1E8] pb-1.5">
            <Scale className="w-4 h-4 text-[#0F766E]" />
            <span className="text-xs font-bold text-[#12304A] uppercase tracking-wider">
              Officer Final Determination (Authoritative)
            </span>
          </div>

          <div className="space-y-2">
            {/* Option 1: Appears Compliant */}
            <div
              onClick={() => {
                setSelectedDecision('APPEARS_COMPLIANT');
                setErrorMsg(null);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedDecision === 'APPEARS_COMPLIANT'
                  ? 'bg-emerald-50/70 border-[#15803D] ring-2 ring-[#15803D]/20'
                  : 'bg-white border-[#D9E1E8] hover:bg-[#F4F7FA]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                  selectedDecision === 'APPEARS_COMPLIANT'
                    ? 'border-[#15803D] bg-[#15803D] text-white'
                    : 'border-[#52616F]'
                }`}>
                  {selectedDecision === 'APPEARS_COMPLIANT' && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#12304A] block">Appears Compliant</span>
                  <p className="text-[11px] text-[#52616F] mt-0.5">
                    No violations observed, all declarations meet statutory requirements under PCR 2011.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Requires Further Review */}
            <div
              onClick={() => {
                setSelectedDecision('REQUIRES_FURTHER_REVIEW');
                setErrorMsg(null);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedDecision === 'REQUIRES_FURTHER_REVIEW'
                  ? 'bg-amber-50/70 border-[#B45309] ring-2 ring-[#B45309]/20'
                  : 'bg-white border-[#D9E1E8] hover:bg-[#F4F7FA]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                  selectedDecision === 'REQUIRES_FURTHER_REVIEW'
                    ? 'border-[#B45309] bg-[#B45309] text-white'
                    : 'border-[#52616F]'
                }`}>
                  {selectedDecision === 'REQUIRES_FURTHER_REVIEW' && <AlertTriangle className="w-3 h-3" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#12304A] block">Requires Further Review</span>
                  <p className="text-[11px] text-[#52616F] mt-0.5">
                    Ambiguities or borderline cases needing supervisory input, manufacturer clarification, or lab testing.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 3: Potential Non-Compliance */}
            <div
              onClick={() => {
                setSelectedDecision('POTENTIAL_NON_COMPLIANCE');
                setErrorMsg(null);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selectedDecision === 'POTENTIAL_NON_COMPLIANCE'
                  ? 'bg-red-50/70 border-[#B91C1C] ring-2 ring-[#B91C1C]/20'
                  : 'bg-white border-[#D9E1E8] hover:bg-[#F4F7FA]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                  selectedDecision === 'POTENTIAL_NON_COMPLIANCE'
                    ? 'border-[#B91C1C] bg-[#B91C1C] text-white'
                    : 'border-[#52616F]'
                }`}>
                  {selectedDecision === 'POTENTIAL_NON_COMPLIANCE' && <XCircle className="w-3 h-3" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#12304A] block">Potential Non-Compliance</span>
                  <p className="text-[11px] text-[#52616F] mt-0.5">
                    One or more statutory violations observed. Proceed with formal notice or legal action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Decision Summary Before Recording */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3.5 shadow-xs space-y-2">
          <span className="text-[10.5px] font-bold text-[#52616F] uppercase tracking-wider block">
            Record Summary Before Issuance
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-[#52616F] block">Inspection ID</span>
              <span className="font-mono font-bold text-[#12304A]">{currentInspection.inspectionNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Product</span>
              <span className="font-medium text-[#12304A] truncate block">{currentInspection.productName}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Total Findings / Flagged</span>
              <span className="font-medium text-[#12304A]">{checks.length} / {nonComplianceCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Evidence Photos</span>
              <span className="font-medium text-[#12304A]">{currentInspection.images.length} on file</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-[#52616F] block">Officer Determination</span>
              <span className="font-bold text-xs text-[#12304A]">
                {selectedDecision ? selectedDecision.replace(/_/g, ' ') : '— Awaiting Selection —'}
              </span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9E1E8] p-3 max-w-md mx-auto z-10 safe-bottom flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFlowStep('officer_review')}
          className="w-1/3 bg-[#F4F7FA] hover:bg-[#D9E1E8] text-[#17212B] font-semibold text-xs py-3 px-2 rounded-xl border border-[#D9E1E8] transition-colors cursor-pointer text-center"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleRecordDecision}
          className="w-2/3 bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.99] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Record Decision & Generate Report</span>
        </button>
      </div>

    </div>
  );
};
