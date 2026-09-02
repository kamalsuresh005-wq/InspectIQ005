import React from 'react';
import { ChevronRight, ArrowLeft, X } from 'lucide-react';
import { useInspection, InspectionFlowStep } from '../context/InspectionContext';

// Import Mobile-First Step Components
import { InspectionSetup } from './workflow/InspectionSetup';
import { LocationPremises } from './workflow/LocationPremises';
import { ProductCapture } from './workflow/ProductCapture';
import { ImageQuality } from './workflow/ImageQuality';
import { AiProductIdentification } from './workflow/AiProductIdentification';
import { ProductSearchFallback } from './workflow/ProductSearchFallback';
import { ProductConfirmation } from './workflow/ProductConfirmation';
import { OcrDeclarations } from './workflow/OcrDeclarations';
import { ComplianceCheck } from './workflow/ComplianceCheck';
import { FindingDetail } from './workflow/FindingDetail';
import { OfficerFinalVerification } from './workflow/OfficerFinalVerification';
import { InspectionCompleted } from './workflow/InspectionCompleted';
import { ReportPreview } from './workflow/ReportPreview';

export const NewInspection: React.FC = () => {
  const { flowStep, setFlowStep, setActiveTab } = useInspection();

  // 6 Primary Milestones for Compact Progress Indicator
  const milestones: { label: string; steps: InspectionFlowStep[]; num: number }[] = [
    { label: 'Location', steps: ['new_inspection', 'location', 'create'], num: 1 },
    { label: 'Capture', steps: ['capture', 'quality_check', 'scan'], num: 2 },
    { label: 'Identify', steps: ['ai_identification', 'product_search', 'product_confirmation'], num: 3 },
    { label: 'Extract', steps: ['ocr_extraction', 'declarations', 'analysis'], num: 4 },
    { label: 'Check', steps: ['compliance_analysis', 'finding_detail', 'compliance'], num: 5 },
    { label: 'Verify', steps: ['officer_verification', 'completion', 'report', 'verification'], num: 6 },
  ];

  const activeMilestone = milestones.find(m => m.steps.includes(flowStep)) || milestones[0];

  return (
    <div className="w-full flex flex-col justify-start">
      
      {/* Compact Mobile Progress Indicator (Hidden on Report view) */}
      {flowStep !== 'report' && flowStep !== 'completion' && (
        <div className="max-w-md mx-auto w-full px-4 pt-2 pb-1 flex items-center justify-between">
          
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            title="Cancel Inspection"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Compact 6-Stage Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            {milestones.map((m, idx) => {
              const isCurrent = m.num === activeMilestone.num;
              const isDone = m.num < activeMilestone.num;

              return (
                <React.Fragment key={m.label}>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    isCurrent
                      ? 'bg-blue-900 text-white font-bold'
                      : isDone
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-400'
                  }`}>
                    {isDone ? '✓' : m.num} {m.label}
                  </span>
                  {idx < milestones.length - 1 && (
                    <span className="text-slate-300 text-[9px]">·</span>
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
        {(flowStep === 'capture' || flowStep === 'scan') && <ProductCapture />}
        {flowStep === 'quality_check' && <ImageQuality />}
        {flowStep === 'ai_identification' && <AiProductIdentification />}
        {flowStep === 'product_search' && <ProductSearchFallback />}
        {flowStep === 'product_confirmation' && <ProductConfirmation />}
        {(flowStep === 'ocr_extraction' || flowStep === 'declarations' || flowStep === 'analysis') && <OcrDeclarations />}
        {(flowStep === 'compliance_analysis' || flowStep === 'compliance') && <ComplianceCheck />}
        {flowStep === 'finding_detail' && <FindingDetail />}
        {(flowStep === 'officer_verification' || flowStep === 'verification') && <OfficerFinalVerification />}
        {flowStep === 'completion' && <InspectionCompleted />}
        {flowStep === 'report' && <ReportPreview />}
      </div>

    </div>
  );
};
