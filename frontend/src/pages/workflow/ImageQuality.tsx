import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCw, 
  Eye, 
  Camera, 
  ShieldAlert, 
  Maximize2, 
  SunMedium, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { activeImageQualityService } from '../../services/imageQualityService';
import { ImageQualityAnalysis, PackageImage } from '../../types';

export const ImageQuality: React.FC = () => {
  const { currentInspection, setFlowStep } = useInspection();

  const images = currentInspection.images;
  const [selectedImageId, setSelectedImageId] = useState<string>(images[0]?.id || '');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<ImageQualityAnalysis | null>(null);

  const activeImage = images.find(img => img.id === selectedImageId) || images[0];

  const runAnalysis = async (img: PackageImage) => {
    if (!img) return;
    setIsAnalyzing(true);
    const result = await activeImageQualityService.analyzeImage(img.url);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (activeImage) {
      runAnalysis(activeImage);
    } else {
      setIsAnalyzing(false);
    }
  }, [selectedImageId]);

  const handleRetake = () => {
    setFlowStep('package_capture');
  };

  const handleContinue = () => {
    setFlowStep('product_details');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-115px)] max-w-md mx-auto p-4 select-none">
      
      {/* Content */}
      <div className="space-y-4">
        
        {/* Header Block */}
        <div className="border-b border-[#D9E1E8] pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
              Step 3 · Quality Verification
            </span>
            <span className="text-[10.5px] font-mono text-[#52616F]">
              {images.length} {images.length === 1 ? 'image' : 'images'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#12304A] mt-1">Image Quality Check</h1>
          <p className="text-xs text-[#52616F] mt-0.5">
            Technical validation of captured packaging clarity and illumination.
          </p>
        </div>

        {/* Multi-image selector if more than 1 image */}
        {images.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImageId(img.id)}
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
        )}

        {/* Thumbnail View */}
        {activeImage ? (
          <div className="bg-slate-950 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center p-2 border border-[#D9E1E8] shadow-inner relative">
            <img
              src={activeImage.url}
              alt={activeImage.label}
              className="max-h-full max-w-full object-contain rounded"
            />
            <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              {activeImage.label}
            </span>
          </div>
        ) : (
          <div className="p-8 text-center bg-white border border-[#D9E1E8] rounded-xl text-xs text-[#52616F]">
            No image available. Please return to package capture.
          </div>
        )}

        {/* Analysis Card */}
        {isAnalyzing ? (
          <div className="bg-white border border-[#D9E1E8] rounded-xl p-5 text-center space-y-2 shadow-card">
            <RefreshCw className="w-5 h-5 text-[#0F766E] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#17212B]">Analyzing image clarity & illumination...</p>
          </div>
        ) : analysis ? (
          <div className="bg-white border border-[#D9E1E8] rounded-xl p-4 shadow-card space-y-3">
            
            {/* Status Header Badge */}
            <div className="flex items-center justify-between pb-2 border-b border-[#D9E1E8]">
              <span className="text-[11px] font-bold text-[#52616F] uppercase tracking-wider">
                OCR Readiness
              </span>

              {analysis.usabilityStatus === 'ready' ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#15803D] bg-[#E6F4F1] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                  <span>Image ready for processing</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3 text-[#B45309]" />
                  <span>Retake recommended</span>
                </span>
              )}
            </div>

            {/* Metric Readouts */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-[#F4F7FA] rounded border border-[#D9E1E8]">
                <span className="text-[10px] text-[#52616F] block">Dimensions</span>
                <span className="font-mono font-bold text-[#12304A] text-[11px]">
                  {analysis.width} × {analysis.height}
                </span>
              </div>

              <div className="p-2 bg-[#F4F7FA] rounded border border-[#D9E1E8]">
                <span className="text-[10px] text-[#52616F] block">Sharpness</span>
                <span className={`font-semibold text-[11px] ${
                  analysis.blurStatus === 'clear' ? 'text-[#15803D]' : 'text-[#B45309]'
                }`}>
                  {analysis.blurStatus === 'clear' ? 'Clear' : 'May be blurry'}
                </span>
              </div>

              <div className="p-2 bg-[#F4F7FA] rounded border border-[#D9E1E8]">
                <span className="text-[10px] text-[#52616F] block">Exposure</span>
                <span className={`font-semibold text-[11px] ${
                  analysis.brightnessStatus === 'optimal' ? 'text-[#15803D]' : 'text-[#B45309]'
                }`}>
                  {analysis.brightnessStatus === 'optimal' 
                    ? 'Optimal' 
                    : analysis.brightnessStatus === 'too_dark' 
                    ? 'Too dark' 
                    : 'Too bright'}
                </span>
              </div>
            </div>

            {/* Guidance Text */}
            <p className="text-[11px] text-[#17212B] leading-relaxed">
              {analysis.message}
            </p>

            {/* Legal Notice */}
            <div className="pt-1 text-[10px] text-[#52616F] border-t border-[#D9E1E8]">
              Basic technical quality check for OCR readability. Exact font size and legal declaration compliance are determined in subsequent stages.
            </div>

          </div>
        ) : null}

      </div>

      {/* Primary Actions Footer */}
      <div className="pt-4 safe-bottom space-y-2">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.98] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Product Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleRetake}
          className="w-full bg-white hover:bg-[#F4F7FA] text-[#52616F] border border-[#D9E1E8] font-semibold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Retake / Add More Images</span>
        </button>
      </div>

    </div>
  );
};
