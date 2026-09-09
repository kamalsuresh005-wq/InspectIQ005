import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  Lock,
  Eye,
  Info
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { OfficerDecision } from '../../types';

export const OfficerFinalVerification: React.FC = () => {
  const { 
    currentInspection, 
    submitOfficerDecision, 
    completeCurrentInspection, 
    currentUser, 
    setFlowStep 
  } = useInspection();

  const nonComplianceCount = currentInspection.complianceChecks.filter(
    (c) => c.result === 'POTENTIAL_NON_COMPLIANCE' || c.controlledStatus === 'POTENTIAL_NON_COMPLIANCE'
  ).length;

  const reviewCount = currentInspection.complianceChecks.filter(
    (c) => c.result === 'REQUIRES_OFFICER_REVIEW' || c.result === 'REVIEW_REQUIRED' || c.controlledStatus === 'REQUIRES_OFFICER_REVIEW'
  ).length;

  // Set intelligent initial decision based on findings, but require explicit officer submission
  const initialDecision: 'Appears Compliant' | 'Requires Further Review' | 'Potential Non-Compliance' = 
    nonComplianceCount > 0
      ? 'Potential Non-Compliance'
      : reviewCount > 0
      ? 'Requires Further Review'
      : 'Appears Compliant';

  const [finalDecision, setFinalDecision] = useState<'Appears Compliant' | 'Requires Further Review' | 'Potential Non-Compliance'>(initialDecision);
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFinalize = () => {
    setIsSubmitting(true);

    const decisionRecord: OfficerDecision = {
      decision: finalDecision,
      finalDecision: finalDecision,
      remarks: remarks.trim() || `Inspection completed. Authoritative officer determination: ${finalDecision}.`,
      officerName: currentUser.name,
      designation: currentUser.designation,
      officerId: currentUser.id,
      decisionTimestamp: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      digitalSignatureRef: `LM-DSC-${currentUser.id}-${Date.now().toString(36).toUpperCase()}`,
    };

    submitOfficerDecision(decisionRecord);
    completeCurrentInspection();
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none pb-24">
      
      {/* Header & Inspection Summary */}
      <div className="space-y-3">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider bg-[#E6F4F1] px-2 py-0.5 rounded">
              Step 8 of 8 · Officer Determination
            </span>
            <h1 className="text-xl font-bold text-[#12304A] mt-1">Officer Review & Final Decision</h1>
            <p className="text-xs text-[#52616F] mt-0.5">
              Review statutory findings and record official inspection determination.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFlowStep('compliance_analysis')}
            className="text-xs font-semibold text-[#12304A] flex items-center gap-1 hover:text-[#0F766E]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Checks</span>
          </button>
        </div>

        {/* Mandatory Legal Authority Banner */}
        <div className="bg-[#12304A] text-white p-3 rounded-xl shadow-xs flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 shrink-0 text-[#0F766E]" />
          <div className="text-xs">
            <span className="font-bold block text-white">Statutory Authority Notice</span>
            <span className="text-[11px] text-[#D9E1E8] block mt-0.5">
              Final decision is made by the inspecting officer. System assists with rule validation; legal determination rests solely with the officer.
            </span>
          </div>
        </div>

        {/* Product & Premises Record Summary */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3.5 shadow-xs space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9E1E8]">
            <div>
              <span className="font-bold text-[#17212B] text-sm block">
                {currentInspection.productName}
              </span>
              <span className="text-[#52616F] text-[11px]">
                {currentInspection.brand} · {currentInspection.category}
              </span>
            </div>

            <span className="text-[10.5px] font-mono text-[#0F766E] font-bold bg-[#E6F4F1] px-2 py-0.5 rounded">
              {currentInspection.inspectionNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11.5px]">
            <div>
              <span className="text-[10px] text-[#52616F] block uppercase font-medium">Premises</span>
              <span className="font-semibold text-[#17212B] truncate block">
                {currentInspection.premisesName || 'Retail Premises'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#52616F] block uppercase font-medium">Location</span>
              <span className="font-semibold text-[#17212B] truncate block">
                {currentInspection.location || 'GPS Verified'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#52616F] block uppercase font-medium">Declared Net Qty</span>
              <span className="font-semibold text-[#17212B]">
                {currentInspection.netQuantity || '70 g'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#52616F] block uppercase font-medium">Declared MRP</span>
              <span className="font-semibold text-[#17212B]">
                {currentInspection.mrp || '₹ 14.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Inspection Stats Overview */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white border border-[#D9E1E8] rounded-xl p-2.5 shadow-xs">
            <span className="text-[10px] text-[#52616F] block font-medium">Declarations</span>
            <span className="font-bold text-[#17212B] text-sm">
              {currentInspection.declarations.length} Verified
            </span>
          </div>

          <div className="bg-white border border-[#D9E1E8] rounded-xl p-2.5 shadow-xs">
            <span className="text-[10px] text-[#52616F] block font-medium">Rule Flags</span>
            <span className={`font-bold text-sm ${nonComplianceCount > 0 ? 'text-[#B91C1C]' : 'text-[#15803D]'}`}>
              {nonComplianceCount} Flagged
            </span>
          </div>

          <div className="bg-white border border-[#D9E1E8] rounded-xl p-2.5 shadow-xs">
            <span className="text-[10px] text-[#52616F] block font-medium">Evidence</span>
            <span className="font-bold text-[#12304A] text-sm">
              {currentInspection.images.length} Photos
            </span>
          </div>
        </div>

        {/* Evidence Photos Reel */}
        {currentInspection.images.length > 0 && (
          <div className="bg-white border border-[#D9E1E8] rounded-xl p-2.5 shadow-xs space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52616F] block">
              Packaging Evidence Reel
            </span>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {currentInspection.images.map((img) => (
                <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#D9E1E8] shrink-0 bg-[#F4F7FA]">
                  <img src={img.url} alt="Evidence" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center font-mono py-0.2 capitalize truncate">
                    {img.side}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Decision Options */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3.5 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#12304A] block">
            Select Authoritative Legal Determination
          </span>

          <div className="space-y-2 text-xs">
            
            {/* Option 1: Appears Compliant */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              finalDecision === 'Appears Compliant'
                ? 'border-[#15803D] bg-[#15803D]/5 ring-1 ring-[#15803D]'
                : 'border-[#D9E1E8] hover:bg-[#F4F7FA]'
            }`}>
              <input
                type="radio"
                name="decision"
                checked={finalDecision === 'Appears Compliant'}
                onChange={() => setFinalDecision('Appears Compliant')}
                className="mt-0.5 text-[#15803D] focus:ring-[#15803D]"
              />
              <div>
                <span className="font-bold text-[#17212B] block">Appears Compliant</span>
                <span className="text-[11px] text-[#52616F] block mt-0.5">
                  Package declarations satisfy mandatory Legal Metrology (PCR 2011) standards.
                </span>
              </div>
            </label>

            {/* Option 2: Requires Further Review */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              finalDecision === 'Requires Further Review'
                ? 'border-[#B45309] bg-[#B45309]/5 ring-1 ring-[#B45309]'
                : 'border-[#D9E1E8] hover:bg-[#F4F7FA]'
            }`}>
              <input
                type="radio"
                name="decision"
                checked={finalDecision === 'Requires Further Review'}
                onChange={() => setFinalDecision('Requires Further Review')}
                className="mt-0.5 text-[#B45309] focus:ring-[#B45309]"
              />
              <div>
                <span className="font-bold text-[#17212B] block">Requires Further Review</span>
                <span className="text-[11px] text-[#52616F] block mt-0.5">
                  Packaging requires laboratory measure re-verification, trader invoice inquiry, or zonal officer clarification.
                </span>
              </div>
            </label>

            {/* Option 3: Potential Non-Compliance */}
            <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              finalDecision === 'Potential Non-Compliance'
                ? 'border-[#B91C1C] bg-[#B91C1C]/5 ring-1 ring-[#B91C1C]'
                : 'border-[#D9E1E8] hover:bg-[#F4F7FA]'
            }`}>
              <input
                type="radio"
                name="decision"
                checked={finalDecision === 'Potential Non-Compliance'}
                onChange={() => setFinalDecision('Potential Non-Compliance')}
                className="mt-0.5 text-[#B91C1C] focus:ring-[#B91C1C]"
              />
              <div>
                <span className="font-bold text-[#17212B] block">Potential Non-Compliance (Issue Notice)</span>
                <span className="text-[11px] text-[#52616F] block mt-0.5">
                  Contravention identified under Legal Metrology Act, 2009. Recommend issuing statutory compounding/show-cause notice.
                </span>
              </div>
            </label>

          </div>
        </div>

        {/* Officer Remarks / Directions */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-1.5">
          <label className="block text-xs font-bold text-[#17212B]">
            Officer Directions & Remarks
          </label>
          <textarea
            rows={3}
            placeholder="Record trader statements, specific statutory instructions, compounding notes, or inspection observations..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-[#D9E1E8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#12304A] text-[#17212B]"
          />
          <span className="text-[10px] text-[#52616F] block">
            Inspecting Officer: {currentUser.name} ({currentUser.designation}) · ID: {currentUser.id}
          </span>
        </div>

      </div>

      {/* Fixed Bottom Submit Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9E1E8] p-3 max-w-md mx-auto z-10 safe-bottom">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleFinalize}
          className="w-full bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.99] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Record Officer Final Decision & Complete</span>
        </button>
      </div>

    </div>
  );
};
