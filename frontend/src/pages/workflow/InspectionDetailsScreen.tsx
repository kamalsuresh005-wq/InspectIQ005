import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Package, 
  Building, 
  MapPin, 
  ZoomIn, 
  X, 
  Download, 
  Printer 
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { PackageImage } from '../../types';

export const InspectionDetailsScreen: React.FC = () => {
  const { currentInspection, setFlowStep, setActiveTab } = useInspection();
  const [activeModalImage, setActiveModalImage] = useState<PackageImage | null>(null);

  const checks = currentInspection.complianceChecks || [];
  const declarations = currentInspection.declarations || [];
  const images = currentInspection.images || [];

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none pb-24">
      
      <div className="space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() => setActiveTab('inspections')}
              className="text-xs font-semibold text-[#0F766E] flex items-center gap-1 hover:underline cursor-pointer mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Inspections</span>
            </button>
            <h1 className="text-xl font-bold text-[#12304A]">{currentInspection.inspectionNumber}</h1>
            <p className="text-xs text-[#52616F]">
              Recorded {new Date(currentInspection.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            currentInspection.status === 'Compliant'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}>
            {currentInspection.status}
          </span>
        </div>

        {/* Product & Premises Card */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-[#D9E1E8] pb-1.5">
            <span className="font-bold text-[#12304A]">{currentInspection.productName}</span>
            <span className="text-[#52616F]">{currentInspection.brand}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11.5px]">
            <div>
              <span className="text-[10px] text-[#52616F] block">Premises</span>
              <span className="font-medium text-[#12304A]">{currentInspection.premisesName || 'Retail Facility'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Officer</span>
              <span className="font-medium text-[#12304A]">{currentInspection.officerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Declared Net Quantity</span>
              <span className="font-medium text-[#12304A]">{currentInspection.netQuantity || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#52616F] block">Declared MRP</span>
              <span className="font-medium text-[#12304A]">{currentInspection.mrp || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Declaration Audit Trail Summary */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2">
          <h2 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">
            Declarations Verified ({declarations.length})
          </h2>
          <div className="space-y-1.5">
            {declarations.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-1.5 bg-[#F4F7FA] rounded text-xs">
                <div>
                  <span className="font-medium text-[#12304A] block">{d.fieldName}</span>
                  <span className="text-[10px] text-[#52616F]">{d.officerVerifiedValue || d.detectedValue}</span>
                </div>
                <span className="text-[10px] font-bold text-[#0F766E] bg-[#E6F4F1] px-1.5 py-0.5 rounded">
                  {d.applicabilityStatus === 'NOT_APPLICABLE' ? 'Not Applicable' : 'Verified'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Findings Summary */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2">
          <h2 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">
            Statutory Findings ({checks.length})
          </h2>
          <div className="space-y-1.5">
            {checks.map((chk) => (
              <div key={chk.checkId} className="p-2 bg-[#F4F7FA] rounded text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#12304A]">{chk.ruleNumber}: {chk.ruleTitle}</span>
                  <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                    chk.result === 'POTENTIAL_NON_COMPLIANCE' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {chk.result}
                  </span>
                </div>
                <p className="text-[11px] text-[#52616F]">{chk.detectedValue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Photos */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2">
          <h2 className="text-xs font-bold text-[#12304A] uppercase tracking-wider">
            Photographic Evidence ({images.length})
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setActiveModalImage(img)}
                className="h-20 bg-slate-100 rounded-lg overflow-hidden border border-[#D9E1E8] cursor-pointer"
              >
                <img src={img.url} alt="Evidence" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Remarks & Determination */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-1 text-xs">
          <span className="font-bold text-[#12304A] uppercase tracking-wider block text-[10.5px]">
            Officer Determination & Remarks
          </span>
          <p className="text-[#17212B] bg-[#F4F7FA] p-2.5 rounded-lg">
            {currentInspection.officerRemarks || currentInspection.remarks || 'No remarks recorded.'}
          </p>
        </div>

      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9E1E8] p-3 max-w-md mx-auto z-10 safe-bottom">
        <button
          type="button"
          onClick={() => setFlowStep('report')}
          className="w-full bg-[#12304A] hover:bg-[#0B2239] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>View Formal Inspection Report</span>
        </button>
      </div>

      {/* Full Size Image Modal */}
      {activeModalImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-[#12304A] rounded-xl overflow-hidden p-2">
            <button
              type="button"
              onClick={() => setActiveModalImage(null)}
              className="absolute top-3 right-3 text-white p-1 rounded-full bg-black/50"
            >
              <X className="w-4 h-4" />
            </button>
            <img src={activeModalImage.url} alt="Full evidence" className="max-h-[70vh] w-full object-contain" />
          </div>
        </div>
      )}

    </div>
  );
};
