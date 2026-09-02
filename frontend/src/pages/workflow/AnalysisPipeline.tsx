import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  Scan, 
  FileText, 
  Scale, 
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

export const AnalysisPipeline: React.FC = () => {
  const { currentInspection, setFlowStep } = useInspection();
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const stages = [
    { title: '1. Image Preprocessing', desc: 'Orientation correction, contrast normalization and resolution enhancement' },
    { title: '2. Glyph & Text Region Bounding', desc: 'Optical detection of typography blocks and numeral glyphs' },
    { title: '3. Optical Character Recognition (OCR)', desc: 'Character segmentation and textual transcript extraction' },
    { title: '4. Legal Declaration Mapping', desc: 'Categorizing mandatory declarations under Rule 6(1) of PCR 2011' },
    { title: '5. Rule Matrix Evaluation', desc: 'Cross-verifying font height (Rule 5 Table I), MRP (Rule 6) and origin' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStageIndex((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const isFinished = activeStageIndex === stages.length - 1;
  const activeImage = currentInspection.images[0];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">
            Step 3 of 7
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] text-slate-500 font-medium">Optical Processing Pipeline</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 font-serif">
          Image Analysis & Declaration Extraction
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Processing uploaded package photographs through optical character recognition and legal metrology rule matrix.
        </p>
      </div>

      {/* Main Grid: Actual Image + Processing Stages */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Left 5 Cols: Actual Image Preview */}
        <div className="md:col-span-5 bg-white p-4 border border-slate-200 rounded space-y-2">
          <span className="text-xs font-bold text-slate-800 block border-b border-slate-100 pb-1">
            Analyzing Package Image ({currentInspection.productName}):
          </span>

          <div className="relative bg-slate-900 rounded p-2 flex items-center justify-center min-h-[260px] max-h-[320px] overflow-hidden">
            {activeImage && (
              <img 
                src={activeImage.url} 
                alt="Active Package Being Analyzed"
                className="max-h-[300px] max-w-full object-contain rounded"
              />
            )}
            
            {/* Scanning line animation */}
            {!isFinished && (
              <div className="absolute inset-x-0 h-1 bg-[#78350F] opacity-70 animate-bounce"></div>
            )}
          </div>
          
          <span className="text-[10.5px] text-slate-500 block text-center">
            {currentInspection.images.length} package image(s) indexed for tensor extraction
          </span>
        </div>

        {/* Right 7 Cols: Progress Stages */}
        <div className="md:col-span-7 bg-white p-4 border border-slate-200 rounded space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Processing Pipeline Stages
            </h3>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
              isFinished ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {isFinished ? 'Processing Complete' : 'Analyzing Image...'}
            </span>
          </div>

          <div className="space-y-2.5">
            {stages.map((stage, idx) => {
              const done = idx <= activeStageIndex;
              const current = idx === activeStageIndex;

              return (
                <div 
                  key={stage.title}
                  className={`p-2.5 rounded border text-xs transition-colors ${
                    current 
                      ? 'border-[#78350F] bg-amber-50/50' 
                      : done 
                      ? 'border-emerald-200 bg-emerald-50/30 text-slate-700' 
                      : 'border-slate-200 text-slate-400 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${done ? 'text-slate-900' : 'text-slate-500'}`}>
                      {stage.title}
                    </span>
                    {done && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {isFinished ? 'All declarations extracted from image.' : 'Please wait...'}
            </span>

            <button
              onClick={() => setFlowStep('declarations')}
              disabled={!isFinished}
              className={`font-semibold text-xs py-2 px-5 rounded transition-colors flex items-center gap-1.5 shadow-xs ${
                isFinished 
                  ? 'bg-[#78350F] hover:bg-[#582509] text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Proceed to Step 4 (Declaration Verification)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
