import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck,
  Eye,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ComplianceControlledStatus } from '../../types';

export const FindingDetail: React.FC = () => {
  const { 
    currentInspection, 
    selectedFinding, 
    setFlowStep, 
    overrideComplianceCheck 
  } = useInspection();

  const finding = selectedFinding || currentInspection.complianceChecks.find(
    (c) => c.result === 'POTENTIAL_NON_COMPLIANCE' || c.result === 'REQUIRES_OFFICER_REVIEW'
  ) || currentInspection.complianceChecks[0];

  const [officerRemarks, setOfficerRemarks] = useState<string>(finding?.officerRemarks || '');
  const [overrideNotice, setOverrideNotice] = useState<string | null>(null);

  // Link to real packaging evidence image
  const evidenceSide = finding?.evidenceSide || 'declaration_area';
  const evidenceImage = currentInspection.images.find((img) => img.side === evidenceSide) 
    || currentInspection.images.find((img) => img.side === 'declaration_area')
    || currentInspection.images[0];

  const handleApplyOverride = (status: ComplianceControlledStatus) => {
    if (!finding) return;
    overrideComplianceCheck(finding.checkId, status, officerRemarks.trim());
    setOverrideNotice(`Finding updated to: ${status.replace(/_/g, ' ')}`);
    setTimeout(() => setOverrideNotice(null), 2500);
  };

  const status = finding?.controlledStatus || (finding?.result as any);
  const isCompliant = status === 'APPEARS_COMPLIANT' || status === 'COMPLIANT';
  const isNonCompliance = status === 'POTENTIAL_NON_COMPLIANCE';
  const isReview = status === 'REQUIRES_OFFICER_REVIEW' || status === 'REVIEW_REQUIRED';
  const isNotApplicable = status === 'NOT_APPLICABLE';

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none pb-24">
      
      {/* Top Header & Content */}
      <div className="space-y-3">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider bg-[#E6F4F1] px-2 py-0.5 rounded">
              Finding Inspection
            </span>
            <h1 className="text-xl font-bold text-[#12304A] mt-1">Finding Details</h1>
          </div>

          <button
            type="button"
            onClick={() => setFlowStep('compliance_analysis')}
            className="text-xs font-semibold text-[#12304A] flex items-center gap-1 hover:text-[#0F766E]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Compliance Checklist</span>
          </button>
        </div>

        {/* Override Notification */}
        {overrideNotice && (
          <div className="bg-[#15803D]/10 border border-[#15803D]/30 text-[#15803D] rounded-xl p-2.5 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{overrideNotice}</span>
          </div>
        )}

        {/* Structured Finding Card */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3.5 shadow-xs space-y-3 text-xs">
          
          {/* Title & Status */}
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#D9E1E8]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#52616F] block">
                Statutory Declaration
              </span>
              <p className="font-bold text-[#17212B] text-sm mt-0.5">
                {finding?.fieldChecked || finding?.ruleTitle}
              </p>
              <span className="text-[10.5px] font-mono text-[#0F766E] font-semibold block">
                {finding?.ruleNumber}
              </span>
            </div>

            <span className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 border ${
              isNonCompliance
                ? 'bg-[#B91C1C]/10 border-[#B91C1C]/30 text-[#B91C1C]'
                : isReview
                ? 'bg-[#B45309]/10 border-[#B45309]/30 text-[#B45309]'
                : isNotApplicable
                ? 'bg-[#D9E1E8]/50 border-[#D9E1E8] text-[#52616F]'
                : 'bg-[#15803D]/10 border-[#15803D]/30 text-[#15803D]'
            }`}>
              {isNonCompliance
                ? 'Potential Non-Compliance'
                : isReview
                ? 'Requires Officer Review'
                : isNotApplicable
                ? 'Not Applicable'
                : 'Appears Compliant'}
            </span>
          </div>

          {/* Audit Values Grid */}
          <div className="grid grid-cols-2 gap-2 bg-[#F4F7FA] p-2.5 rounded-lg border border-[#D9E1E8]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#52616F] block">
                OCR Extracted
              </span>
              <p className="font-mono text-[#17212B] text-[11px] mt-0.5 break-all">
                {finding?.extractedValue || finding?.detectedValue || 'Not detected'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] block">
                Officer Verified
              </span>
              <p className="font-semibold text-[#0F766E] text-[11px] mt-0.5 break-all">
                {finding?.officerVerifiedValue || finding?.detectedValue || 'Unverified'}
              </p>
            </div>
          </div>

          {/* Reason / Explanation */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52616F] block">
              Finding Reason & Explanation
            </span>
            <p className="text-[#17212B] text-xs mt-1 leading-relaxed">
              {finding?.explanation || 'Statutory declaration standard verification.'}
            </p>
          </div>

          {/* Legal Authority Citation */}
          <div className="pt-2 border-t border-[#D9E1E8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52616F] block">
              Legal Ground / Reference
            </span>
            <p className="text-[11px] text-[#12304A] font-semibold mt-0.5">
              {finding?.legalGround}
            </p>
          </div>

        </div>

        {/* Linked Evidence Photograph */}
        {evidenceImage ? (
          <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#52616F] flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Supporting Packaging Evidence</span>
              </span>
              <span className="text-[10px] font-mono text-[#12304A] bg-[#E6F4F1] px-1.5 py-0.5 rounded capitalize">
                {evidenceImage.side.replace('_', ' ')} View
              </span>
            </div>

            <div className="bg-[#12304A] rounded-lg overflow-hidden aspect-[16/10] flex items-center justify-center p-2 relative shadow-inner">
              <img
                src={evidenceImage.url}
                alt="Package Evidence"
                className="max-h-full max-w-full object-contain rounded"
              />
              <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                EVIDENCE · {evidenceImage.side.toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#F4F7FA] border border-dashed border-[#D9E1E8] rounded-xl p-3 text-center text-xs text-[#52616F]">
            No linked package photo found for this side.
          </div>
        )}

        {/* Officer Override & Remarks Section */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#12304A] block">
            Officer Determination & Override
          </span>

          <div className="space-y-1">
            <label className="text-[10px] text-[#52616F] block font-medium">
              Officer Notes / Ground for Override
            </label>
            <textarea
              rows={2}
              value={officerRemarks}
              onChange={(e) => setOfficerRemarks(e.target.value)}
              placeholder="Record physical inspection observations, trade explanations..."
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D9E1E8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#12304A] text-[#17212B]"
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleApplyOverride('APPEARS_COMPLIANT')}
              className="px-2 py-1.5 bg-[#15803D]/10 hover:bg-[#15803D]/20 text-[#15803D] border border-[#15803D]/30 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Compliant</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyOverride('REQUIRES_OFFICER_REVIEW')}
              className="px-2 py-1.5 bg-[#B45309]/10 hover:bg-[#B45309]/20 text-[#B45309] border border-[#B45309]/30 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Review</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyOverride('POTENTIAL_NON_COMPLIANCE')}
              className="px-2 py-1.5 bg-[#B91C1C]/10 hover:bg-[#B91C1C]/20 text-[#B91C1C] border border-[#B91C1C]/30 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Flag</span>
            </button>
          </div>
        </div>

      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9E1E8] p-3 max-w-md mx-auto z-10 safe-bottom flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFlowStep('compliance_analysis')}
          className="w-1/2 bg-[#F4F7FA] hover:bg-[#D9E1E8] text-[#17212B] font-semibold text-xs py-3 px-3 rounded-xl border border-[#D9E1E8] transition-colors cursor-pointer text-center"
        >
          Back to Checklist
        </button>

        <button
          type="button"
          onClick={() => setFlowStep('evidence')}
          className="w-1/2 bg-[#12304A] hover:bg-[#0B2239] text-white font-bold text-xs py-3 px-3 rounded-xl shadow-card transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Proceed to Evidence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
