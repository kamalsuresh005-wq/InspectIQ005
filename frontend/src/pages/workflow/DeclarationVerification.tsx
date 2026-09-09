import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Edit3, 
  Save, 
  X, 
  ArrowRight, 
  ArrowLeft,
  Eye,
  Layers,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Check,
  Ban,
  HelpCircle
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ExtractedDeclaration, ApplicabilityStatus, PackageSide } from '../../types';
import { activeOcrService } from '../../services/ocrService';

export const DeclarationVerification: React.FC = () => {
  const { 
    currentInspection, 
    updateDeclaration, 
    updateDeclarationApplicability, 
    setFlowStep, 
    updateInspectionMetadata,
    runComplianceValidation,
    isValidatingRules
  } = useInspection();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editingDeclId, setEditingDeclId] = useState<string | null>(null);
  const [editVerifiedValue, setEditVerifiedValue] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'detected' | 'review' | 'not_detected'>('detected');
  const [editApplicability, setEditApplicability] = useState<ApplicabilityStatus>('APPLICABLE');
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Auto-structure declarations if not yet populated
  useEffect(() => {
    if (currentInspection.declarations.length === 0) {
      const initialDeclarations = activeOcrService.structureDeclarationsFromText(
        currentInspection.rawOcrText || '',
        'declaration_area',
        currentInspection.productDetails
      );
      updateInspectionMetadata({ declarations: initialDeclarations });
    }
  }, []);

  const activeImage = currentInspection.images[selectedImageIndex] || currentInspection.images[0];

  const handleStartEdit = (decl: ExtractedDeclaration) => {
    setEditingDeclId(decl.id);
    setEditVerifiedValue(decl.officerVerifiedValue || decl.extractedValue || decl.detectedValue || '');
    setEditStatus(decl.status);
    setEditApplicability(decl.applicabilityStatus || 'APPLICABLE');
  };

  const handleSaveEdit = (declId: string) => {
    updateDeclaration(declId, editVerifiedValue.trim(), editStatus, editApplicability);
    setEditingDeclId(null);
  };

  const handleCancelEdit = () => {
    setEditingDeclId(null);
  };

  const handleQuickVerify = (decl: ExtractedDeclaration) => {
    const verifiedVal = decl.officerVerifiedValue || decl.extractedValue || decl.detectedValue || '';
    updateDeclaration(decl.id, verifiedVal, 'detected', 'APPLICABLE');
  };

  const handleQuickNotDetected = (decl: ExtractedDeclaration) => {
    updateDeclaration(decl.id, 'Not detected on package', 'not_detected', 'APPLICABLE');
  };

  const handleQuickNotApplicable = (decl: ExtractedDeclaration) => {
    updateDeclarationApplicability(decl.id, 'NOT_APPLICABLE');
  };

  const handleProceedToCompliance = async () => {
    await runComplianceValidation();
    setFlowStep('compliance_analysis');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none pb-24">
      
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider bg-[#E6F4F1] px-2 py-0.5 rounded">
              Step 6 of 8 · Inspection Flow
            </span>
            <h1 className="text-xl font-bold text-[#12304A] mt-1">Declaration Verification</h1>
            <p className="text-xs text-[#52616F] mt-0.5">
              Review and audit declarations under Legal Metrology (PCR 2011).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFlowStep('ocr_extraction')}
            className="text-xs font-semibold text-[#12304A] flex items-center gap-1 hover:text-[#0F766E]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>OCR Text</span>
          </button>
        </div>

        {/* Evidence Photo Strip & Switcher */}
        {currentInspection.images.length > 0 && (
          <div className="bg-white border border-[#D9E1E8] rounded-xl p-2.5 shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5 max-w-[280px]">
              {currentInspection.images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium border transition-colors shrink-0 ${
                    idx === selectedImageIndex
                      ? 'bg-[#12304A] text-white border-[#12304A]'
                      : 'bg-[#F4F7FA] text-[#52616F] border-[#D9E1E8] hover:bg-white'
                  }`}
                >
                  <span className="capitalize">{img.side.replace('_', ' ')}</span>
                </button>
              ))}
            </div>

            {activeImage && (
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="text-[11px] font-semibold text-[#0F766E] bg-[#E6F4F1] hover:bg-[#d5eee8] px-2 py-1 rounded flex items-center gap-1 shrink-0"
                title="Inspect Package Photo"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Evidence</span>
              </button>
            )}
          </div>
        )}

        {/* Auditability Banner */}
        <div className="bg-[#E6F4F1] border border-[#0F766E]/30 rounded-xl p-2.5 text-[11px] text-[#0F766E] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-[#0F766E]" />
          <span>
            <strong>Audit Protection Active:</strong> Raw OCR text is preserved. Officer edits update verified values without overwriting machine extraction.
          </span>
        </div>

        {/* Declarations List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-[#52616F] uppercase tracking-wider">
              Statutory Declarations ({currentInspection.declarations.length})
            </span>
            <span className="text-[10px] text-[#52616F]">
              Verify or correct each declaration
            </span>
          </div>

          {currentInspection.declarations.map((decl) => {
            const isEditing = editingDeclId === decl.id;
            const extractedVal = decl.extractedValue || decl.detectedValue || '';
            const verifiedVal = decl.officerVerifiedValue || extractedVal;
            const isApplicable = decl.applicabilityStatus !== 'NOT_APPLICABLE';
            const isDetected = decl.status === 'detected' && extractedVal && !extractedVal.toLowerCase().includes('not detected');

            return (
              <div
                key={decl.id}
                className={`bg-white border rounded-xl p-3 shadow-xs transition-colors ${
                  isEditing
                    ? 'border-[#12304A] ring-1 ring-[#12304A]'
                    : decl.isEdited
                    ? 'border-[#0F766E]/50 bg-[#F4F7FA]/30'
                    : 'border-[#D9E1E8]'
                }`}
              >
                {/* Header Row: Name + Rule + Status */}
                <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-[#D9E1E8]/60">
                  <div>
                    <span className="text-xs font-bold text-[#17212B] block">
                      {decl.fieldName}
                    </span>
                    <span className="text-[10px] font-mono text-[#52616F]">
                      {decl.ruleRef}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                      decl.applicabilityStatus === 'NOT_APPLICABLE'
                        ? 'bg-[#D9E1E8] text-[#52616F]'
                        : isDetected
                        ? 'bg-[#15803D]/10 text-[#15803D]'
                        : 'bg-[#B91C1C]/10 text-[#B91C1C]'
                    }`}>
                      {decl.applicabilityStatus === 'NOT_APPLICABLE'
                        ? 'Not Applicable'
                        : isDetected
                        ? 'Detected'
                        : 'Not Detected'}
                    </span>

                    {decl.isEdited && (
                      <span className="text-[9px] font-bold bg-[#E6F4F1] text-[#0F766E] px-1.5 py-0.5 rounded">
                        Officer Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Values Row (Audit trail: Extracted vs Verified) */}
                <div className="py-2 space-y-1 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10.5px] text-[#52616F] font-medium shrink-0">
                      OCR Extracted:
                    </span>
                    <span className="text-[11px] font-mono text-[#17212B] text-right break-all">
                      {extractedVal || <span className="italic text-[#52616F]">Not detected in OCR</span>}
                    </span>
                  </div>

                  {decl.officerVerifiedValue && decl.officerVerifiedValue !== extractedVal && (
                    <div className="flex items-start justify-between gap-2 pt-0.5">
                      <span className="text-[10.5px] text-[#0F766E] font-semibold shrink-0">
                        Officer Correction:
                      </span>
                      <span className="text-[11px] font-semibold text-[#0F766E] text-right break-all">
                        {decl.officerVerifiedValue}
                      </span>
                    </div>
                  )}
                </div>

                {/* Inline Edit Form */}
                {isEditing ? (
                  <div className="mt-2 pt-2 border-t border-[#D9E1E8] space-y-2 bg-[#F4F7FA] p-2.5 rounded-lg">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#52616F] block mb-1">
                        Correct / Verified Value
                      </label>
                      <input
                        type="text"
                        value={editVerifiedValue}
                        onChange={(e) => setEditVerifiedValue(e.target.value)}
                        placeholder="e.g. 1 kg, ₹ 60.00, Complete Address with PIN"
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#D9E1E8] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#12304A] text-[#17212B]"
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#52616F] block mb-1">
                          Applicability
                        </label>
                        <select
                          value={editApplicability}
                          onChange={(e) => setEditApplicability(e.target.value as ApplicabilityStatus)}
                          className="w-full text-xs px-2 py-1.5 bg-white border border-[#D9E1E8] rounded-lg focus:outline-none text-[#17212B]"
                        >
                          <option value="APPLICABLE">Applicable</option>
                          <option value="NOT_APPLICABLE">Not Applicable</option>
                          <option value="REQUIRES_OFFICER_REVIEW">Requires Officer Review</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#52616F] block mb-1">
                          Detection Status
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="w-full text-xs px-2 py-1.5 bg-white border border-[#D9E1E8] rounded-lg focus:outline-none text-[#17212B]"
                        >
                          <option value="detected">Detected</option>
                          <option value="review">Review Required</option>
                          <option value="not_detected">Not Detected</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-2.5 py-1 rounded text-xs font-semibold text-[#52616F] hover:bg-[#D9E1E8]/50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(decl.id)}
                        className="px-3 py-1 bg-[#12304A] text-white rounded text-xs font-semibold hover:bg-[#0B2239] flex items-center gap-1 shadow-xs"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save Correction</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Buttons Row */
                  <div className="pt-2 border-t border-[#D9E1E8]/60 flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickVerify(decl)}
                        className="px-2 py-1 bg-[#E6F4F1] hover:bg-[#d3ede7] text-[#0F766E] rounded font-semibold text-[10.5px] flex items-center gap-1 transition-colors"
                        title="Confirm extracted value as verified"
                      >
                        <Check className="w-3 h-3" />
                        <span>Verify</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(decl)}
                        className="px-2 py-1 bg-[#F4F7FA] hover:bg-[#D9E1E8] text-[#17212B] rounded font-semibold text-[10.5px] flex items-center gap-1 transition-colors border border-[#D9E1E8]"
                        title="Correct OCR errors or supply complete value"
                      >
                        <Edit3 className="w-3 h-3 text-[#52616F]" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickNotDetected(decl)}
                        className="px-1.5 py-1 text-[#B91C1C] hover:bg-[#B91C1C]/10 rounded font-medium text-[10px] transition-colors"
                        title="Mark as not detected on physical package"
                      >
                        Not Detected
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickNotApplicable(decl)}
                        className="px-1.5 py-1 text-[#52616F] hover:bg-[#D9E1E8] rounded font-medium text-[10px] transition-colors"
                        title="Mark declaration as not applicable"
                      >
                        Not Applicable
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9E1E8] p-3 max-w-md mx-auto z-10 safe-bottom">
        <button
          type="button"
          disabled={isValidatingRules}
          onClick={handleProceedToCompliance}
          className="w-full bg-[#12304A] hover:bg-[#0B2239] disabled:bg-[#52616F] active:scale-[0.99] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isValidatingRules ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Validating declarations...</span>
            </span>
          ) : (
            <>
              <span>Proceed to Compliance Validation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Image Inspection Modal */}
      {showImageModal && activeImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-white pb-2">
            <span className="text-xs font-semibold capitalize">
              Package Evidence · {activeImage.side.replace('_', ' ')}
            </span>
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="p-1 rounded-full bg-white/20 text-white hover:bg-white/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img
              src={activeImage.url}
              alt="Packaging Evidence"
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[75vh] max-w-full object-contain rounded transition-transform"
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 text-white">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="p-2 rounded bg-white/20 hover:bg-white/30 text-xs flex items-center gap-1"
            >
              <ZoomOut className="w-4 h-4" />
              <span>Zoom Out</span>
            </button>
            <span className="text-xs font-mono">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-2 rounded bg-white/20 hover:bg-white/30 text-xs flex items-center gap-1"
            >
              <ZoomIn className="w-4 h-4" />
              <span>Zoom In</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
