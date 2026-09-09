import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useInspection, InspectionFlowStep } from '../context/InspectionContext';

// Step Components
import { InspectionSetup } from './workflow/InspectionSetup';
import { LocationPremises } from './workflow/LocationPremises';
import { ProductCapture } from './workflow/ProductCapture';
import { ImageQuality } from './workflow/ImageQuality';
import { ProductDetailsScreen } from './workflow/ProductDetailsScreen';
import { OcrAnalysisScreen } from './workflow/OcrAnalysisScreen';
import { DeclarationVerification } from './workflow/DeclarationVerification';
import { ComplianceCheck } from './workflow/ComplianceCheck';
import { FindingDetail } from './workflow/FindingDetail';
import { EvidenceScreen } from './workflow/EvidenceScreen';
import { OfficerReviewScreen } from './workflow/OfficerReviewScreen';
import { FinalDecisionScreen } from './workflow/FinalDecisionScreen';
import { InspectionCompleted } from './workflow/InspectionCompleted';
import { ReportPreview } from './workflow/ReportPreview';
import { InspectionDetailsScreen } from './workflow/InspectionDetailsScreen';

export const NewInspection: React.FC = () => {
  const { flowStep, setFlowStep, setActiveTab } = useInspection();

  // Primary Milestones for Compact Progress Indicator
  const milestones: { label: string; steps: InspectionFlowStep[]; num: number }[] = [
    { label: 'Location', steps: ['new_inspection', 'location', 'create'], num: 1 },
    { label: 'Capture', steps: ['capture', 'scan', 'package_capture'], num: 2 },
    { label: 'Quality', steps: ['quality_check', 'image_quality'], num: 3 },
    { label: 'Product', steps: ['product_details', 'ai_identification', 'product_search', 'product_confirmation'], num: 4 },
    { label: 'OCR', steps: ['ocr_extraction', 'analysis'], num: 5 },
    { label: 'Declarations', steps: ['declaration_verification', 'declarations'], num: 6 },
    { label: 'Rules', steps: ['compliance_analysis', 'finding_detail', 'compliance'], num: 7 },
    { label: 'Evidence', steps: ['evidence', 'evidence_findings'], num: 8 },
    { label: 'Review', steps: ['officer_review'], num: 9 },
    { label: 'Decision', steps: ['final_decision', 'officer_verification', 'verification'], num: 10 },
  ];

  const activeMilestone = milestones.find(m => m.steps.includes(flowStep)) || milestones[0];

  return (
    <div className="w-full flex flex-col justify-start">
      
      {/* Compact Mobile Progress Indicator (Hidden on Report view) */}
      {flowStep !== 'report' && flowStep !== 'completion' && flowStep !== 'inspection_details' && (
        <div className="max-w-md mx-auto w-full px-4 pt-2.5 pb-1 flex items-center justify-between border-b border-[#D9E1E8] bg-white">
          
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="p-1 rounded-lg text-[#52616F] hover:text-[#17212B] hover:bg-[#F4F7FA] transition-colors cursor-pointer"
            title="Return to Dashboard"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Compact Milestone Indicator */}
          <div className="flex items-center gap-1 text-[10.5px] font-semibold text-[#52616F] overflow-x-auto py-0.5 no-scrollbar">
            {milestones.map((m, idx) => {
              const isCurrent = m.num === activeMilestone.num;
              const isDone = m.num < activeMilestone.num;

              return (
                <React.Fragment key={m.label}>
                  <span className={`px-1.5 py-0.5 rounded text-[9.5px] whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#12304A] text-white font-bold'
                      : isDone
                      ? 'text-[#15803D] font-bold bg-[#E6F4F1]'
                      : 'text-[#52616F]'
                  }`}>
                    {isDone ? '✓' : m.num} {m.label}
                  </span>
                  {idx < milestones.length - 1 && (
                    <span className="text-[#D9E1E8] text-[9px]">·</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="w-4"></div>
        </div>
      )}

      {/* Screen Router */}
      <div className="w-full">
        {(flowStep === 'new_inspection' || flowStep === 'create') && <InspectionSetup />}
        {flowStep === 'location' && <LocationPremises />}
        {(flowStep === 'capture' || flowStep === 'scan' || flowStep === 'package_capture') && <ProductCapture />}
        {(flowStep === 'quality_check' || flowStep === 'image_quality') && <ImageQuality />}
        {(flowStep === 'product_details' || flowStep === 'ai_identification' || flowStep === 'product_search' || flowStep === 'product_confirmation') && <ProductDetailsScreen />}
        {(flowStep === 'ocr_extraction' || flowStep === 'analysis') && <OcrAnalysisScreen />}
        {(flowStep === 'declaration_verification' || flowStep === 'declarations') && <DeclarationVerification />}
        {(flowStep === 'compliance_analysis' || flowStep === 'compliance') && <ComplianceCheck />}
        {flowStep === 'finding_detail' && <FindingDetail />}
        {(flowStep === 'evidence' || flowStep === 'evidence_findings') && <EvidenceScreen />}
        {flowStep === 'officer_review' && <OfficerReviewScreen />}
        {flowStep === 'final_decision' && <FinalDecisionScreen />}
        {(flowStep === 'officer_verification' || flowStep === 'verification') && <FinalDecisionScreen />}
        {flowStep === 'completion' && <InspectionCompleted />}
        {flowStep === 'report' && <ReportPreview />}
        {flowStep === 'inspection_details' && <InspectionDetailsScreen />}
      </div>

    </div>
  );
};
