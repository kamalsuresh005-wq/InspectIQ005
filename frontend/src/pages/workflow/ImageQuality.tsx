import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCw } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

export const ImageQuality: React.FC = () => {
  const { currentInspection, runQualityGate, setFlowStep } = useInspection();
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isGood, setIsGood] = useState<boolean>(true);
  const [reason, setReason] = useState<string>('');

  const primaryImage = currentInspection.images.find(img => img.side === 'front') || currentInspection.images[0];

  useEffect(() => {
    runQualityGate().then((res) => {
      setIsChecking(false);
      if (res.status === 'Ready') {
        setIsGood(true);
      } else {
        setIsGood(false);
        setReason(res.issue || 'Text is difficult to read.');
      }
    });
  }, []);

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Header & Content */}
      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
            Step 4 of 12
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Image Quality Check</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated quality gate before AI analysis.</p>
        </div>

        {/* Thumbnail of Captured Image */}
        {primaryImage && (
          <div className="bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center p-2 border border-slate-800 shadow-inner">
            <img
              src={primaryImage.url}
              alt="Inspected Package"
              className="max-h-full max-w-full object-contain rounded"
            />
          </div>
        )}

        {/* Evaluation State Card */}
        {isChecking ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center space-y-2 shadow-xs">
            <RotateCw className="w-5 h-5 text-blue-800 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-800">Checking image clarity & readability...</p>
          </div>
        ) : isGood ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Image ready for analysis</span>
            </div>
            <div className="space-y-1 text-emerald-900 pt-1 font-medium">
              <div className="flex items-center gap-1.5">
                <span>✓</span>
                <span>Image is clear</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>✓</span>
                <span>Text is readable</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <span>Image needs retake</span>
            </div>
            <div className="pt-1 text-slate-700">
              <span className="font-semibold block text-slate-900">Reason:</span>
              <p className="mt-0.5">{reason || 'Text is difficult to read.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Primary Actions */}
      <div className="pt-4 safe-bottom">
        {isGood ? (
          <button
            type="button"
            disabled={isChecking}
            onClick={() => setFlowStep('ai_identification')}
            className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setFlowStep('capture')}
            className="w-full bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            <span>Retake Image</span>
          </button>
        )}
      </div>

    </div>
  );
};
