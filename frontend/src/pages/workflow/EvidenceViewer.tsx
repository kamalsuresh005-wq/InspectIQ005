import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MessageSquare, 
  Camera, 
  ArrowRight, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  ShieldCheck,
  Sun,
  Eye,
  Sliders
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { EvidenceItem } from '../../types';

export const EvidenceViewer: React.FC = () => {
  const { currentInspection, selectedEvidence, updateEvidenceStatus, setFlowStep } = useInspection();

  const [zoomLevel, setZoomLevel] = useState<number>(1.2);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'grayscale' | 'contrast' | 'invert'>('normal');
  const [officerNote, setOfficerNote] = useState<string>(
    selectedEvidence?.officerComments || 'Measured under digital optical grid. Font height confirmed at 1.4mm on secondary statutory block.'
  );

  const activeEvidence: EvidenceItem = selectedEvidence || currentInspection.evidenceList[0] || {
    evidenceId: `evid-${currentInspection.inspectionNumber}-01`,
    inspectionId: currentInspection.inspectionNumber,
    imageId: currentInspection.images[0]?.id || 'img-1',
    imageUrl: currentInspection.images[0]?.url || '',
    side: 'back',
    label: 'Statutory Declaration Region',
    detectedText: currentInspection.mrp,
    ruleRef: 'Rule 5 & Rule 6(1)(e)',
    confidence: 87,
    boundingBox: {
      id: 'box-evid-1',
      label: 'MRP Numeral Region',
      fieldKey: 'mrp',
      x: 8,
      y: 43,
      width: 84,
      height: 6,
      confidence: 86,
      detectedText: currentInspection.mrp,
      ruleRef: 'Rule 5',
      status: 'violation',
    },
    officerComments: 'Verified non-compliant font size.',
    status: 'Pending',
  };

  const handleDecision = (status: 'Accepted' | 'Rejected' | 'Needs Re-inspection') => {
    updateEvidenceStatus(activeEvidence.evidenceId, status, officerNote);
  };

  const getFilterStyle = () => {
    if (activeFilter === 'grayscale') return 'grayscale(100%)';
    if (activeFilter === 'contrast') return 'contrast(180%) brightness(110%)';
    if (activeFilter === 'invert') return 'invert(100%)';
    return 'none';
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gov-cardborder shadow-gov flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-gov-700 uppercase tracking-wider">Step 8 of 10</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Digital Optical Evidence Studio</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">Optical Evidence & Finding Verification</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Examine high-resolution optical evidence captures with digital filters, annotate findings, and record formal officer determinations.
          </p>
        </div>

        <button
          onClick={() => setFlowStep('verification')}
          className="bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Formal Officer Verification</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Split Evidence Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left 7 cols: High-Res Interactive Image Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gov-cardborder shadow-gov space-y-3">
            
            {/* Canvas Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Evidence Canvas
                </span>
                <span className="text-[9.5px] bg-gov-50 text-gov-800 font-bold px-2 py-0.5 rounded border border-gov-200 uppercase">
                  {activeEvidence.side} Side
                </span>
              </div>

              {/* Filter Controls (Rule 7 Contrast Audit) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setActiveFilter('normal')}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all ${
                    activeFilter === 'normal' ? 'bg-white text-gov-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  RGB
                </button>
                <button
                  onClick={() => setActiveFilter('grayscale')}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all ${
                    activeFilter === 'grayscale' ? 'bg-white text-gov-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Gray
                </button>
                <button
                  onClick={() => setActiveFilter('contrast')}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all ${
                    activeFilter === 'contrast' ? 'bg-white text-gov-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  High-Contrast
                </button>
                <button
                  onClick={() => setActiveFilter('invert')}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-all ${
                    activeFilter === 'invert' ? 'bg-white text-gov-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Invert
                </button>
              </div>

              {/* Zoom & Layer Controls */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.2))}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600 border border-slate-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700">
                  {(zoomLevel * 100).toFixed(0)}%
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.2))}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600 border border-slate-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowBoxes(!showBoxes)}
                  className={`px-2 py-1 text-[10.5px] font-bold rounded border transition-colors flex items-center gap-1 ${
                    showBoxes ? 'bg-gov-100 text-gov-900 border-gov-300' : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span className="hidden sm:inline">Boxes</span>
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center p-3 border border-slate-800 shadow-inner select-none">
              
              <div 
                className="relative transition-transform duration-200 flex items-center justify-center"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  filter: getFilterStyle()
                }}
              >
                <img
                  src={activeEvidence.imageUrl || currentInspection.images[0]?.url}
                  alt="Optical Evidence"
                  className="max-h-[340px] max-w-[340px] object-contain rounded shadow-2xl"
                />

                {/* Highlighted Bounding Box Target */}
                {showBoxes && activeEvidence.boundingBox && (
                  <div
                    className="absolute border-2 border-red-500 bg-red-500/20 rounded shadow-lg pointer-events-none animate-pulse"
                    style={{
                      left: `${activeEvidence.boundingBox.x}%`,
                      top: `${activeEvidence.boundingBox.y}%`,
                      width: `${activeEvidence.boundingBox.width}%`,
                      height: `${activeEvidence.boundingBox.height}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-red-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                      {activeEvidence.label}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Canvas Status */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[9.5px] sm:text-[10px] text-slate-200 flex items-center justify-between border border-white/10">
                <span className="font-mono text-amber-300">{activeEvidence.evidenceId}</span>
                <span className="text-slate-400">Section 18 Statutory Evidence Repository</span>
              </div>

            </div>

          </div>
        </div>

        {/* Right 5 cols: Finding Details & Officer Action Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gov-cardborder shadow-gov space-y-4">
            
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-slate-400">Evidence Record</span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-mono">{activeEvidence.evidenceId}</h3>
              </div>
              
              <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                activeEvidence.status === 'Accepted'
                  ? 'bg-emerald-100 text-emerald-800'
                  : activeEvidence.status === 'Rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {activeEvidence.status}
              </span>
            </div>

            {/* Parameters Matrix */}
            <div className="space-y-3 text-xs">
              
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Target Declaration</span>
                <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">{activeEvidence.label}</p>
                <p className="font-mono text-gov-800 text-[11px] mt-1 bg-white p-1.5 rounded border border-slate-200 break-words">
                  {activeEvidence.detectedText}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Rule Reference</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 block">{activeEvidence.ruleRef}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[9.5px] text-slate-400 font-bold uppercase block">AI Confidence</span>
                  <span className="font-mono font-bold text-emerald-700 text-[11px] mt-0.5 block">{activeEvidence.confidence}%</span>
                </div>
              </div>

              {activeEvidence.measuredFontHeightMm && (
                <div className="p-2.5 bg-red-50/70 border border-red-200 rounded-lg space-y-1">
                  <span className="text-[9.5px] text-red-800 font-bold uppercase block">Optical Measurements</span>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Measured: <strong className="text-red-700 font-mono">{activeEvidence.measuredFontHeightMm} mm</strong></span>
                    <span>Required: <strong className="text-slate-900 font-mono">{activeEvidence.requiredFontHeightMm} mm</strong></span>
                  </div>
                </div>
              )}

              {/* Officer Comments Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Officer Inspection Remarks / Evidence Notes
                </label>
                <textarea
                  rows={2}
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  placeholder="Record observations or retailer statements..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-600"
                />
              </div>

            </div>

            {/* Officer Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 block mb-1">
                Record Officer Determination for this Evidence
              </span>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => handleDecision('Accepted')}
                  className={`py-2 px-1 sm:px-2 text-[11px] sm:text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                    activeEvidence.status === 'Accepted'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('Rejected')}
                  className={`py-2 px-1 sm:px-2 text-[11px] sm:text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                    activeEvidence.status === 'Rejected'
                      ? 'bg-red-700 text-white border-red-700 shadow-xs'
                      : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('Needs Re-inspection')}
                  className={`py-2 px-1 sm:px-2 text-[11px] sm:text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                    activeEvidence.status === 'Needs Re-inspection'
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                      : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Review</span>
                </button>
              </div>
            </div>

            {/* Advance Button */}
            <div className="pt-2">
              <button
                onClick={() => setFlowStep('verification')}
                className="w-full bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Formal Officer Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
