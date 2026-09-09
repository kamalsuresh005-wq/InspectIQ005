import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  RefreshCw,
  Image as ImageIcon,
  Layers,
  Sparkles
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { activeOcrService, OcrProgressUpdate } from '../../services/ocrService';
import { OcrProcessingState, ImageOcrResult, ExtractedDeclaration } from '../../types';

export const OcrAnalysisScreen: React.FC = () => {
  const { currentInspection, updateRawOcrText, updateDeclarationsList, setFlowStep } = useInspection();

  const images = currentInspection.images || [];
  const validImages = images.filter(img => img && img.url && img.url.trim() !== '');

  // Active view tab: 'all' or specific image id
  const [selectedTab, setSelectedTab] = useState<string>('all');

  const [ocrResults, setOcrResults] = useState<ImageOcrResult[]>(() => {
    return currentInspection.ocrResults || [];
  });

  const [status, setStatus] = useState<OcrProcessingState>(
    currentInspection.ocrStatus === 'success' ? 'success' : 'ready'
  );
  const [progressPct, setProgressPct] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(() => {
    if (currentInspection.ocrStatus === 'success') {
      return `✓ OCR completed across ${validImages.length} captured package view(s).`;
    }
    return `Ready to run OCR on all ${validImages.length} captured package view(s).`;
  });
  const [combinedText, setCombinedText] = useState<string>(
    currentInspection.combinedRawOcrText || currentInspection.rawOcrText || ''
  );
  const [extractedDeclarations, setExtractedDeclarations] = useState<ExtractedDeclaration[]>(
    currentInspection.declarations || []
  );

  const handleRunAllOcr = async () => {
    if (validImages.length === 0) {
      setStatus('requires_retake');
      setStatusMessage('Please capture at least one package image first.');
      return;
    }

    setStatus('processing');
    setProgressPct(5);
    setStatusMessage(`Initializing OCR for ${validImages.length} package view(s)...`);

    try {
      const result = await activeOcrService.extractTextFromMultipleImages(
        validImages,
        (update: OcrProgressUpdate) => {
          setStatusMessage(update.status);
          setProgressPct(update.progress);
        },
        currentInspection.productDetails
      );

      setStatus(result.status);
      setStatusMessage(result.message);

      if (result.status === 'success') {
        setProgressPct(100);
        setOcrResults(result.ocrResults);
        setCombinedText(result.combinedRawOcrText);
        setExtractedDeclarations(result.structuredDeclarations);

        // Update context with combined text and per-image provenance
        updateRawOcrText(
          result.combinedRawOcrText, 
          'success', 
          result.ocrResults, 
          result.combinedRawOcrText
        );
        updateDeclarationsList(result.structuredDeclarations);
      } else {
        updateRawOcrText('', 'failed');
      }
    } catch (err: any) {
      console.error('[OCR MULTI UI ERROR]', err);
      setStatus('failed');
      setStatusMessage(
        err?.message || 'OCR could not be completed across all images. Please check lighting and focus.'
      );
      updateRawOcrText('', 'failed');
    }
  };

  // Auto-run OCR on first screen mount if not yet processed
  useEffect(() => {
    if (status === 'ready' && validImages.length > 0 && !currentInspection.rawOcrText) {
      handleRunAllOcr();
    }
  }, []);

  const handleContinue = () => {
    if (status !== 'success' || !combinedText.trim()) {
      return;
    }

    if (extractedDeclarations.length > 0) {
      updateDeclarationsList(extractedDeclarations);
    }
    updateRawOcrText(combinedText, 'success', ocrResults, combinedText);
    setFlowStep('declaration_verification');
  };

  const isOcrComplete = status === 'success' && combinedText.trim().length > 0;

  // Find text for active tab
  const displayedText = selectedTab === 'all'
    ? combinedText
    : (ocrResults.find(r => r.imageId === selectedTab)?.text || '');

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-115px)] max-w-md mx-auto p-4 select-none">
      
      {/* Content */}
      <div className="space-y-4">
        
        {/* Header Block */}
        <div className="border-b border-[#D9E1E8] pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
              STEP 5 · MULTI-VIEW OCR
            </span>
            <span className="text-[10.5px] font-mono text-[#52616F]">
              All Views Engine
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#12304A] mt-1">OCR Text Extraction</h1>
          <p className="text-xs text-[#52616F] mt-0.5 leading-relaxed">
            Extract and combine printed statutory declarations across all captured package views (Front, Back, Side, Declaration Area).
          </p>
        </div>

        {/* Captured Views Summary Card */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3.5 shadow-card space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#17212B] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Captured Package Views ({validImages.length})</span>
            </span>
            
            <button
              type="button"
              onClick={handleRunAllOcr}
              disabled={status === 'processing'}
              className="bg-[#0F766E] hover:bg-[#0d645e] active:scale-95 text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {status === 'processing' ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : status === 'failed' ? (
                <RefreshCw className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>
                {status === 'processing' 
                  ? 'Processing...' 
                  : status === 'failed' 
                  ? 'Retry OCR' 
                  : isOcrComplete 
                  ? 'Re-run OCR' 
                  : 'Run OCR'}
              </span>
            </button>
          </div>

          {/* Grid of captured thumbnails */}
          {validImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 pt-1">
              {validImages.map((img) => {
                const imgRes = ocrResults.find(r => r.imageId === img.id);
                const hasText = !!(imgRes && imgRes.text.trim().length > 0);
                const isSelected = selectedTab === img.id;

                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedTab(img.id)}
                    className={`relative rounded-lg overflow-hidden border p-1 text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#0F766E] ring-2 ring-[#0F766E]/30 bg-teal-50/40' 
                        : 'border-[#D9E1E8] bg-[#F4F7FA]'
                    }`}
                  >
                    <div className="w-full h-14 bg-slate-900 rounded overflow-hidden flex items-center justify-center">
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-[#17212B] block truncate mt-1">
                      {img.label || img.side}
                    </span>
                    <span className="text-[9px] block text-[#52616F]">
                      {status === 'processing' ? 'Pending' : hasText ? '✓ Read' : 'Ready'}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C]">
              No package images captured. Return to Step 2 to capture images.
            </div>
          )}
        </div>

        {/* Status & Progress Notification Banner */}
        <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
          status === 'processing'
            ? 'bg-blue-50 border-blue-200 text-[#2563EB]'
            : status === 'success'
            ? 'bg-[#E6F4F1] border-[#A7F3D0] text-[#15803D]'
            : status === 'failed' || status === 'requires_retake'
            ? 'bg-[#FEE2E2] border-[#FECACA] text-[#B91C1C]'
            : 'bg-[#F4F7FA] border-[#D9E1E8] text-[#52616F]'
        }`}>
          {status === 'processing' && <RotateCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
          {status === 'success' && <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />}
          {(status === 'failed' || status === 'requires_retake') && <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />}
          {status === 'ready' && <FileText className="w-4 h-4 text-[#52616F] shrink-0 mt-0.5" />}
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold block text-[11px] uppercase tracking-wider">
                {status === 'processing'
                  ? 'Running OCR on Package Images...'
                  : status === 'success'
                  ? '✓ Multi-Image OCR Completed'
                  : status === 'failed'
                  ? 'OCR Incomplete'
                  : 'Ready for OCR'}
              </span>
              {status === 'processing' && progressPct > 0 && (
                <span className="text-[10px] font-mono font-bold text-[#2563EB]">
                  {progressPct}%
                </span>
              )}
            </div>

            <p className="text-[11px] mt-0.5 leading-relaxed">
              {statusMessage}
            </p>

            {/* Progress bar */}
            {status === 'processing' && (
              <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-[#2563EB] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(5, progressPct)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* View Tabs & OCR Output Card */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-4 shadow-card space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-[#17212B] uppercase tracking-wider text-[11px]">
              Extracted OCR Text
            </label>
            {displayedText.length > 0 && (
              <span className="text-[10px] font-mono text-[#0F766E] bg-[#EBF8F7] px-2 py-0.5 rounded font-semibold">
                {displayedText.length} chars
              </span>
            )}
          </div>

          {/* Tab selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedTab('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[10.5px] shrink-0 border cursor-pointer ${
                selectedTab === 'all'
                  ? 'bg-[#12304A] text-white border-[#12304A]'
                  : 'bg-[#F4F7FA] text-[#52616F] border-[#D9E1E8]'
              }`}
            >
              All Views (Combined)
            </button>
            {validImages.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedTab(img.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[10.5px] shrink-0 border cursor-pointer ${
                  selectedTab === img.id
                    ? 'bg-[#12304A] text-white border-[#12304A]'
                    : 'bg-[#F4F7FA] text-[#52616F] border-[#D9E1E8]'
                }`}
              >
                {img.label || img.side}
              </button>
            ))}
          </div>

          {/* Raw Text Box */}
          <div 
            className="w-full min-h-[110px] max-h-[170px] overflow-y-auto p-3 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg text-xs text-[#17212B] font-mono whitespace-pre-wrap leading-relaxed select-text"
          >
            {status === 'processing' ? (
              <span className="text-[#94A3B8] italic flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                Reading characters from package image views...
              </span>
            ) : isOcrComplete ? (
              displayedText || <span className="text-[#94A3B8] italic">No text recognized in this specific view.</span>
            ) : status === 'failed' ? (
              <span className="text-[#B91C1C] italic">
                No readable text extracted. Tap "Retry OCR" above to try again.
              </span>
            ) : (
              <span className="text-[#94A3B8] italic">
                Tap "Run OCR" above to extract statutory declarations from all package views.
              </span>
            )}
          </div>

          {/* Extracted Statutory Declarations Provenance Preview */}
          {isOcrComplete && extractedDeclarations.length > 0 && (
            <div className="pt-2 border-t border-[#D9E1E8]/60 space-y-1.5">
              <span className="text-[10.5px] font-bold text-[#17212B] uppercase tracking-wider block">
                Detected Statutory Declarations with Source View
              </span>
              <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1">
                {extractedDeclarations.map((decl) => {
                  const isDetected = decl.status === 'detected' && decl.detectedValue && !decl.detectedValue.includes('Not detected');
                  return (
                    <div 
                      key={decl.id}
                      className="p-1.5 bg-[#F4F7FA] rounded border border-[#D9E1E8] flex items-center justify-between text-[11px]"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-semibold text-[#12304A] block truncate">
                          {decl.fieldName}
                        </span>
                        <span className="text-[10px] text-[#52616F] truncate block">
                          {decl.detectedValue}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9.5px] font-bold bg-[#E6F4F1] text-[#0F766E] px-1.5 py-0.5 rounded capitalize">
                          {decl.sideFound ? decl.sideFound.replace(/_/g, ' ') : 'Package'}
                        </span>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                          isDetected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isDetected ? 'Detected' : 'Missing'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Primary Action Footer */}
      <div className="pt-4 safe-bottom space-y-2">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!isOcrComplete}
          className={`w-full font-bold text-xs py-3.5 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 ${
            isOcrComplete
              ? 'bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.98] text-white cursor-pointer'
              : 'bg-[#CBD5E1] text-[#64748B] cursor-not-allowed opacity-75'
          }`}
        >
          <span>Continue to Declaration Verification →</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setFlowStep('product_details')}
          className="w-full bg-white hover:bg-[#F4F7FA] text-[#52616F] border border-[#D9E1E8] font-semibold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Product Details</span>
        </button>
      </div>

    </div>
  );
};
