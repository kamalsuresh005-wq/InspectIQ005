import React, { useState } from 'react';
import { 
  Eye, 
  Ruler, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Maximize2,
  Layers,
  Sparkles,
  Info,
  Scale,
  SunMedium,
  Check
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

export const ReadabilityPlacement: React.FC = () => {
  const { currentInspection, setFlowStep } = useInspection();

  const [selectedDeclarationKey, setSelectedDeclarationKey] = useState<string>('mrp');
  const [showRulerOverlay, setShowRulerOverlay] = useState<boolean>(true);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);
  const [customMeasuredFont, setCustomMeasuredFont] = useState<number>(1.4);
  const [pdpArea, setPdpArea] = useState<number>(224);

  // Determine statutory required font height according to Rule 5 Table I
  const getRequiredFontMm = (area: number) => {
    if (area <= 50) return 1.0;
    if (area <= 200) return 2.0;
    if (area <= 1000) return 4.0;
    return 6.0;
  };

  const requiredFontMm = getRequiredFontMm(pdpArea);

  const declarationAnalysisMap: Record<string, {
    label: string;
    location: string;
    readabilityScore: number;
    measuredFontMm: number;
    contrastRatio: string;
    ruleReference: string;
    details: string;
  }> = {
    mrp: {
      label: 'Maximum Retail Price (MRP)',
      location: 'Secondary Statutory Panel (Center-Right)',
      readabilityScore: 84,
      measuredFontMm: customMeasuredFont,
      contrastRatio: '4.2:1 (Sufficient)',
      ruleReference: 'Rule 5 & Table I read with Rule 6(1)(e)',
      details: `Numeral font height measured at ${customMeasuredFont}mm against mandatory ${requiredFontMm}mm minimum threshold for packaging area ${pdpArea} cm².`,
    },
    net_quantity: {
      label: 'Net Quantity',
      location: 'Principal Display Panel (Bottom-Left)',
      readabilityScore: 96,
      measuredFontMm: 2.8,
      contrastRatio: '6.8:1 (Optimal)',
      ruleReference: 'Rule 5, Table I & Rule 6(1)(c)',
      details: 'Numeral font height is 2.8mm, comfortably exceeding statutory standard.',
    },
    manufacturer_name: {
      label: 'Manufacturer Legal Details',
      location: 'Statutory Declaration Box (Lower-Middle)',
      readabilityScore: 91,
      measuredFontMm: 1.6,
      contrastRatio: '5.1:1 (Optimal)',
      ruleReference: 'Rule 6(1)(a)',
      details: 'Text height complies with non-numeral mandatory declaration minimums.',
    },
    product_name: {
      label: 'Generic / Brand Commodity Name',
      location: 'Principal Display Panel (Top-Center)',
      readabilityScore: 99,
      measuredFontMm: 6.5,
      contrastRatio: '8.4:1 (Optimal)',
      ruleReference: 'Rule 6(1)(b)',
      details: 'Prominently visible in bold lettering on front facing side.',
    },
    consumer_care: {
      label: 'Consumer Care & Grievance Cell',
      location: 'Bottom Statutory Block',
      readabilityScore: 82,
      measuredFontMm: 1.2,
      contrastRatio: '3.8:1 (Borderline)',
      ruleReference: 'Rule 9',
      details: 'Text is legible but physical postal address is compressed into fine print.',
    }
  };

  const selectedItem = declarationAnalysisMap[selectedDeclarationKey] || declarationAnalysisMap.mrp;
  const isFontDeficient = selectedItem.measuredFontMm < requiredFontMm;
  const backImage = currentInspection.images.find((img) => img.side === 'back') || currentInspection.images[0];

  return (
    <div className="space-y-4 sm:space-y-6 pb-10">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gov-cardborder shadow-gov flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-gov-700 uppercase tracking-wider">Step 6 of 10</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Optical Millimeter Font Size & PDP Verification</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">Font Size & Readability Analysis (Rule 5 & 7)</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Digital millimeter optical measurement of numeral heights and contrast against Schedule Table I statutory thresholds.
          </p>
        </div>

        <button
          onClick={() => setFlowStep('violations')}
          className="bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>View Violations Triage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left 7 cols: Interactive Optical Ruler & Image Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gov-cardborder shadow-gov space-y-3">
            
            {/* View Controls Toolbar */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Optical Caliper Canvas
                </span>
                <span className="text-[9.5px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                  Scale: 1px = 0.05mm
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setShowRulerOverlay(!showRulerOverlay)}
                  className={`px-2 py-1 rounded text-[10.5px] font-bold border transition-colors flex items-center gap-1 ${
                    showRulerOverlay ? 'bg-gov-100 text-gov-900 border-gov-300' : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  <Ruler className="w-3 h-3" />
                  <span>Ruler</span>
                </button>
                <button
                  onClick={() => setShowGridOverlay(!showGridOverlay)}
                  className={`px-2 py-1 rounded text-[10.5px] font-bold border transition-colors flex items-center gap-1 ${
                    showGridOverlay ? 'bg-gov-100 text-gov-900 border-gov-300' : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Grid</span>
                </button>
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center p-3 border border-slate-700">
              
              {backImage && (
                <img 
                  src={backImage.url} 
                  alt="Package Measurement View"
                  className="max-h-full max-w-full object-contain rounded shadow-2xl"
                />
              )}

              {/* Millimeter Grid Overlay */}
              {showGridOverlay && (
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:16px_16px]"></div>
              )}

              {/* Optical Millimeter Caliper on MRP Box */}
              {showRulerOverlay && selectedDeclarationKey === 'mrp' && (
                <div className="absolute top-[42%] left-[12%] right-[12%] sm:left-[18%] sm:right-[18%] p-2.5 border-2 border-red-500 bg-red-500/20 rounded-lg shadow-2xl animate-pulse pointer-events-none">
                  <div className="flex items-center justify-between text-white text-[9px] sm:text-[10px] font-mono font-bold bg-black/85 px-2 py-1 rounded">
                    <span>Observed Height: {customMeasuredFont} mm</span>
                    <span className={customMeasuredFont < requiredFontMm ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {customMeasuredFont < requiredFontMm ? `Deficit: -${(requiredFontMm - customMeasuredFont).toFixed(1)} mm` : 'Compliant'}
                    </span>
                  </div>
                  <div className="h-1 bg-red-400 my-1 w-full relative">
                    <div className="absolute left-0 -top-1.5 w-0.5 h-4 bg-red-400"></div>
                    <div className="absolute right-0 -top-1.5 w-0.5 h-4 bg-red-400"></div>
                  </div>
                </div>
              )}

              {/* Bottom Canvas Notice */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[9.5px] sm:text-[10px] text-slate-200 flex items-center justify-between border border-white/10">
                <span>PDP Area: <strong className="text-amber-300">{pdpArea} cm²</strong></span>
                <span className="text-emerald-400 font-semibold">Schedule Table I (Min {requiredFontMm}mm)</span>
              </div>

            </div>

            {/* Interactive Measurement Caliper Slider */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-gov-700" />
                  <span>Optical Caliper Numeral Height Fine-Tune:</span>
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-300">
                  {customMeasuredFont.toFixed(1)} mm
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={customMeasuredFont}
                onChange={(e) => setCustomMeasuredFont(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gov-700"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5 mm</span>
                <span className="text-gov-800 font-bold">Standard 2.0 mm</span>
                <span>5.0 mm</span>
              </div>
            </div>

            {/* Selector Chips */}
            <div className="pt-2 border-t border-slate-100 flex gap-1.5 overflow-x-auto pb-1">
              {Object.entries(declarationAnalysisMap).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDeclarationKey(key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap shrink-0 ${
                    selectedDeclarationKey === key
                      ? 'bg-gov-700 text-white border-gov-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {data.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Right 5 cols: Readability & Measurement Scorecard */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gov-cardborder shadow-gov space-y-3 sm:space-y-4">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Selected Field</span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">{selectedItem.label}</h3>
              </div>

              <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                !isFontDeficient
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {!isFontDeficient ? 'PASS' : 'DEFICIT FLAGGED'}
              </span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Packaging Location:</span>
                <span className="font-bold text-slate-800 truncate max-w-[170px] text-right">{selectedItem.location}</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Readability Index:</span>
                <span className="font-bold text-emerald-700">{selectedItem.readabilityScore} / 100</span>
              </div>

              {/* Font Height Gauge */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Measured Numeral Height:</span>
                  <span className={`font-mono font-bold text-sm ${
                    isFontDeficient ? 'text-red-600' : 'text-emerald-700'
                  }`}>
                    {selectedItem.measuredFontMm} mm
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                  <span>Mandatory Schedule Table I Minimum:</span>
                  <span className="font-mono font-semibold text-slate-800">{requiredFontMm} mm</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isFontDeficient ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (selectedItem.measuredFontMm / requiredFontMm) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Contrast & Background Clutter Analysis (Rule 7) */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <SunMedium className="w-3.5 h-3.5 text-gov-700" />
                    <span>Rule 7 Background Contrast:</span>
                  </span>
                  <span className="font-bold text-emerald-700">{selectedItem.contrastRatio}</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  High optical contrast between typography and packaging substrate satisfies Rule 7 non-obstruction clause.
                </p>
              </div>

              <div className="p-2.5 bg-gov-50 rounded-lg border border-gov-200 space-y-0.5">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-gov-800">Rule Reference</span>
                <p className="font-semibold text-gov-950 font-mono text-[10.5px]">{selectedItem.ruleReference}</p>
                <p className="text-[10.5px] text-slate-700 mt-0.5 leading-snug">{selectedItem.details}</p>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setFlowStep('violations')}
                className="w-full bg-gov-700 hover:bg-gov-800 text-white font-bold text-xs py-3 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Violations Triage</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
