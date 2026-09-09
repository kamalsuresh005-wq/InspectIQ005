import React, { useState } from 'react';
import { 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { activeOcrService, OcrProgressUpdate } from '../../services/ocrService';
import { OcrProcessingState } from '../../types';

export const OcrAnalysisScreen: React.FC = () => {
  const { currentInspection, updateRawOcrText, updateDeclarationsList, setFlowStep } = useInspection();

  const images = currentInspection.images;
  const [selectedImageId, setSelectedImageId] = useState<string>(
    images.find(img => img.side === 'declaration_area')?.id || images[0]?.id || ''
  );

  const activeImage = images.find(img => img.id === selectedImageId) || images[0];

  const [status, setStatus] = useState<OcrProcessingState>(
    currentInspection.ocrStatus === 'success' ? 'success' : 'ready'
  );
  const [progressPct, setProgressPct] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(() => {
    if (currentInspection.ocrStatus === 'success') return 'OCR completed successfully.';
    return 'Ready to extract printed declarations from the package image.';
  });
  const [rawText, setRawText] = useState<string>(currentInspection.rawOcrText || '');

  const handleRunOcr = async () => {
    if (!activeImage) {
      setStatus('requires_retake');
      setStatusMessage('Please capture a package image first.');
      return;
    }

    setStatus('processing');
    setProgressPct(5);
    setStatusMessage('Extracting text from package...');

    try {
      const result = await activeOcrService.extractText(
        activeImage.url,
        (update: OcrProgressUpdate) => {
          setStatusMessage(update.status);
          setProgressPct(update.progress);
        }
      );

      setStatus(result.status);
      setStatusMessage(result.message);

      if (result.status === 'success') {
        setProgressPct(100);
        setRawText(result.rawText);
        updateRawOcrText(result.rawText, 'success');
      } else {
        updateRawOcrText('', 'failed');
      }
    } catch (err: any) {
      setStatus('failed');
      setStatusMessage(
        err?.message || 'OCR could not extract readable text. Image may be blurry or poorly lit.'
      );
      updateRawOcrText('', 'failed');
    }
  };

  const handleContinue = () => {
    if (status !== 'success' || !rawText.trim()) {
      return;
    }

    // Structure declarations deterministically using real OCR text
    const declarations = activeOcrService.structureDeclarationsFromText(
      rawText,
      activeImage?.side,
      currentInspection.productDetails
    );

    updateDeclarationsList(declarations);
    updateRawOcrText(rawText, 'success');
    setFlowStep('declaration_verification');
  };

  const isOcrComplete = status === 'success' && rawText.trim().length > 0;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-115px)] max-w-md mx-auto p-4 select-none">
      
      {/* Content */}
      <div className="space-y-4">
        
        {/* Header Block */}
        <div className="border-b border-[#D9E1E8] pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
              STEP 5 · OPTICAL EXTRACTION
            </span>
            <span className="text-[10.5px] font-mono text-[#52616F]">
              Tesseract.js Engine
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#12304A] mt-1">OCR Text Extraction</h1>
          <p className="text-xs text-[#52616F] mt-0.5">
            Extract printed declarations from the captured package image.
          </p>
        </div>

        {/* Multi-image Selector if available */}
        {images.length > 1 && (
          <div>
            <label className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5">
              Select Package Image
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    setSelectedImageId(img.id);
                    if (status !== 'processing') {
                      setStatus('ready');
                      setStatusMessage('Image selected. Tap "Run OCR" to extract text.');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold shrink-0 border cursor-pointer ${
                    (activeImage && activeImage.id === img.id)
                      ? 'bg-[#12304A] text-white border-[#12304A]'
                      : 'bg-white text-[#52616F] border-[#D9E1E8]'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Package Image Card */}
        {activeImage ? (
          <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-card flex items-center gap-3">
            <div className="w-16 h-16 bg-slate-900 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              <img 
                src={activeImage.url} 
                alt={activeImage.label} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#17212B] block truncate">
                {activeImage.label}
              </span>
              <span className="text-[10.5px] text-[#52616F] block mt-0.5">
                Captured package image · {new Date(activeImage.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRunOcr}
              disabled={status === 'processing'}
              className="bg-[#0F766E] hover:bg-[#0d645e] active:scale-95 text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
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
                  ? 'Extracting...' 
                  : status === 'failed' 
                  ? 'Try Again' 
                  : 'Run OCR'}
              </span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-xs text-[#B91C1C]">
            No package images captured. Please return to Step 2 to capture a package.
          </div>
        )}

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
                  ? 'Extracting text from package...'
                  : status === 'success'
                  ? '✓ OCR completed'
                  : status === 'failed'
                  ? 'OCR could not extract readable text'
                  : status === 'requires_retake'
                  ? 'Retake Required'
                  : 'Ready for Extraction'}
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

            {status === 'failed' && (
              <div className="mt-2 text-[10.5px] text-[#7F1D1D] bg-white/60 p-2 rounded border border-[#FECACA] space-y-1">
                <span className="font-semibold block">Possible inspection issues:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Image is out of focus or blurred</li>
                  <li>Harsh glare or reflection on shiny packaging</li>
                  <li>Insufficient lighting or heavy shadows</li>
                  <li>Declaration text is obscured or cropped</li>
                </ul>
              </div>
            )}

            {/* Progress bar during extraction */}
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

        {/* Real Extracted Text Display (Read-Only) */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-4 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-[#17212B] uppercase tracking-wider text-[11px]">
              EXTRACTED TEXT
            </label>
            {rawText.length > 0 && (
              <span className="text-[10px] font-mono text-[#0F766E] bg-[#EBF8F7] px-2 py-0.5 rounded font-semibold">
                {rawText.length} characters extracted
              </span>
            )}
          </div>

          <div 
            className="w-full min-h-[110px] max-h-[180px] overflow-y-auto p-3 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg text-xs text-[#17212B] font-mono whitespace-pre-wrap leading-relaxed select-text"
          >
            {status === 'processing' ? (
              <span className="text-[#94A3B8] italic flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                Processing OCR worker and reading characters...
              </span>
            ) : isOcrComplete ? (
              rawText
            ) : status === 'failed' ? (
              <span className="text-[#B91C1C] italic">
                No readable text extracted. Please retake the photo or adjust lighting and tap "Try Again".
              </span>
            ) : (
              <span className="text-[#94A3B8] italic">
                No text extracted yet. Tap "Run OCR" above to extract statutory declarations directly from the package image.
              </span>
            )}
          </div>

          <p className="text-[10.5px] text-[#52616F] leading-relaxed">
            Extracted text will be structured into applicable Legal Metrology declarations in the next step.
          </p>
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
