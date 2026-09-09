import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, RotateCw, Edit3, ShieldCheck } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

export const ProductConfirmation: React.FC = () => {
  const { currentInspection, runOcrExtraction, setFlowStep } = useInspection();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const primaryImage = currentInspection.images.find(img => img.side === 'front') || currentInspection.images[0];
  const prod = currentInspection.identifiedProduct;

  const handleConfirmAndProceed = async () => {
    setIsProcessing(true);
    await runOcrExtraction();
    setIsProcessing(false);
    setFlowStep('ocr_extraction');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Content */}
      <div className="space-y-3.5">
        <div>
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
            Step 7 of 12
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Officer Product Confirmation</h1>
          <p className="text-xs text-slate-500 mt-0.5">Authoritative confirmation of target commodity identity.</p>
        </div>

        {/* Actual Product Image */}
        {primaryImage && (
          <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center p-2 border border-slate-800 shadow-inner">
            <img
              src={primaryImage.url}
              alt="Actual Product Evidence"
              className="max-h-full max-w-full object-contain rounded"
            />
          </div>
        )}

        {/* Confirmation Details Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs divide-y divide-slate-100 text-xs">
          
          <div className="py-2 first:pt-0 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Product</span>
            <span className="font-bold text-slate-900 text-right">
              {prod?.name || currentInspection.productName || 'Unspecified Commodity'}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Brand</span>
            <span className="font-bold text-slate-800 text-right">
              {prod?.brand || currentInspection.brand || 'Unbranded'}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Category</span>
            <span className="text-slate-800 text-right">
              {prod?.category || currentInspection.category}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Pack Size</span>
            <span className="font-mono font-bold text-blue-900 text-right">
              {prod?.packSize || currentInspection.netQuantity || 'Not detected'}
            </span>
          </div>

          <div className="py-2 last:pb-0 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Source</span>
            <span className="text-[11px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              {prod?.source || 'Package Inspection'}
            </span>
          </div>

        </div>
      </div>

      {/* Primary Actions */}
      <div className="pt-3 space-y-2 safe-bottom">
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleConfirmAndProceed}
          className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Processing OCR & Declarations...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Product & Proceed to OCR</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={isProcessing}
          onClick={() => setFlowStep('product_search')}
          className="w-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Choose Different Product</span>
        </button>
      </div>

    </div>
  );
};
