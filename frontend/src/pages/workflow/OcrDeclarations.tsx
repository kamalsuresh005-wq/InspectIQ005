import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Eye, X, Image as ImageIcon } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { ExtractedDeclaration } from '../../types';

export const OcrDeclarations: React.FC = () => {
  const { currentInspection, setFlowStep } = useInspection();

  const [activeEvidenceDecl, setActiveEvidenceDecl] = useState<ExtractedDeclaration | null>(null);

  const declarations = currentInspection.declarations;

  // Find source image for evidence view
  const getSourceImage = (decl: ExtractedDeclaration) => {
    return (
      currentInspection.images.find(img => img.id === decl.evidenceImageId) ||
      currentInspection.images.find(img => img.side === decl.sideFound) ||
      currentInspection.images[0]
    );
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
              Step 8 of 12
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Structured Declarations</h1>
          </div>
          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            PCR 2011 Rule 6
          </span>
        </div>

        {/* Compact Declarations List */}
        <div className="space-y-2 max-h-[calc(100dvh-260px)] overflow-y-auto pr-0.5">
          {declarations.map((decl) => {
            const isDetected = decl.status === 'detected';
            const isReview = decl.status === 'review';

            return (
              <div
                key={decl.id}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-2.5 hover:border-blue-700 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {decl.fieldName}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                      isDetected
                        ? 'bg-emerald-50 text-emerald-700'
                        : isReview
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {isDetected ? '✓ Detected' : isReview ? '⚠ Needs Review' : '— Not Detected'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                    {decl.detectedValue}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveEvidenceDecl(decl)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] py-1.5 px-2.5 rounded-lg flex items-center gap-1 shrink-0 border border-slate-200 transition-colors"
                >
                  <Eye className="w-3 h-3 text-blue-800" />
                  <span>Evidence</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Action */}
      <div className="pt-3 safe-bottom">
        <button
          type="button"
          onClick={() => setFlowStep('compliance_analysis')}
          className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Check Compliance Rules</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Evidence Bottom Sheet / Modal */}
      {activeEvidenceDecl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900">{activeEvidenceDecl.fieldName}</h3>
                <span className="text-[10px] text-blue-800 font-mono font-semibold">{activeEvidenceDecl.ruleRef}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveEvidenceDecl(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source Image Display */}
            {getSourceImage(activeEvidenceDecl) && (
              <div className="bg-slate-950 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center p-2 border border-slate-800">
                <img
                  src={getSourceImage(activeEvidenceDecl)?.url}
                  alt="Packaging Evidence"
                  className="max-h-full max-w-full object-contain rounded"
                />
              </div>
            )}

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Detected Value:</span>
              <p className="font-semibold text-slate-900">{activeEvidenceDecl.detectedValue}</p>
            </div>

            <button
              type="button"
              onClick={() => setActiveEvidenceDecl(null)}
              className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl"
            >
              Done Viewing
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
