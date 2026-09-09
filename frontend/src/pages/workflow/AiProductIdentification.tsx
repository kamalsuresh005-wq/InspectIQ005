import React, { useState, useEffect } from 'react';
import { Sparkles, Search, CheckCircle2, ArrowRight, RotateCw, AlertCircle } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { IdentifiedProduct } from '../../types';

export const AiProductIdentification: React.FC = () => {
  const { currentInspection, runAiIdentification, setConfirmedProduct, setFlowStep } = useInspection();

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [product, setProduct] = useState<IdentifiedProduct | null>(null);

  const primaryImage = currentInspection.images.find(img => img.side === 'front') || currentInspection.images[0];

  useEffect(() => {
    runAiIdentification().then((res) => {
      setProduct(res);
      setIsAnalyzing(false);
    });
  }, []);

  const handleConfirm = () => {
    if (product) {
      setConfirmedProduct(product);
      setFlowStep('product_confirmation');
    }
  };

  const handleOpenSearch = () => {
    setFlowStep('product_search');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Content */}
      <div className="space-y-3.5">
        <div>
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
            Step 5 of 12
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Product Identification</h1>
          <p className="text-xs text-slate-500 mt-0.5">Optical extraction and catalogue matching of packaging evidence.</p>
        </div>

        {/* Actual Captured Product Image */}
        {primaryImage && (
          <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center p-2 border border-slate-800 shadow-inner">
            <img
              src={primaryImage.url}
              alt="Actual Inspected Commodity"
              className="max-h-full max-w-full object-contain rounded"
            />
          </div>
        )}

        {/* Identification Result Card */}
        {isAnalyzing ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center space-y-2 shadow-xs">
            <RotateCw className="w-5 h-5 text-blue-800 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-800">Analyzing packaging layout & visible brand text...</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs divide-y divide-slate-100 text-xs">
            
            <div className="py-2 first:pt-0 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Product</span>
              <span className="font-bold text-slate-900 text-right">
                {product?.name || 'Not detected'}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Brand</span>
              <span className="font-bold text-slate-800 text-right">
                {product?.brand || 'Not detected'}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Category</span>
              <span className="text-slate-800 text-right">
                {product?.category || 'Not detected'}
              </span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Variant</span>
              <span className="text-slate-800 text-right">
                {product?.variant || 'Not detected'}
              </span>
            </div>

            <div className="py-2 last:pb-0 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Pack Size</span>
              <span className="font-mono font-bold text-blue-900 text-right">
                {product?.packSize || 'Not detected'}
              </span>
            </div>

          </div>
        )}

        {/* Assistive Notice */}
        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-blue-800 shrink-0 mt-0.5" />
          <span>
            Optical reading signal. If unverified or manual entry is needed, tap <strong>Search Product</strong>.
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="pt-3 space-y-2 safe-bottom">
        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleConfirm}
          className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirm Product</span>
        </button>

        <button
          type="button"
          onClick={handleOpenSearch}
          className="w-full bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 text-slate-600" />
          <span>Search Product (Catalogue Fallback)</span>
        </button>
      </div>

    </div>
  );
};
