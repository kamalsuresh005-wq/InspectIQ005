import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  ZoomIn, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Plus
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { PackageImage } from '../../types';

export const EvidenceScreen: React.FC = () => {
  const { 
    currentInspection, 
    setFlowStep, 
    deleteEvidenceImage, 
    updateEvidenceDescription, 
    linkEvidenceToFinding, 
    addAdditionalEvidenceImage 
  } = useInspection();

  const [activeModalImage, setActiveModalImage] = useState<PackageImage | null>(null);
  const [modalZoom, setModalZoom] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('MRP area');
  const [showAddSection, setShowAddSection] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const images = currentInspection.images || [];
  const checks = currentInspection.complianceChecks || [];

  const categoryOptions = [
    'MRP area',
    'Mfg address',
    'Net quantity',
    'Expiry/Best before',
    'Consumer care',
    'Full package',
    'Other'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const newImg: PackageImage = {
          id: `evid-img-${Date.now()}`,
          url: dataUrl,
          side: 'other',
          label: `Evidence: ${selectedCategory}`,
          capturedAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          resolution: `${img.naturalWidth}x${img.naturalHeight}`,
          qualityStatus: 'Ready',
          qualityScore: 90,
          blurScore: 'Low',
          glareScore: 'None',
          lightingScore: 'Optimal',
          textVisibilityScore: 'Adequate',
          boundingBoxes: [],
          description: `Evidence capture: ${selectedCategory}`,
          linkedFindingIds: [],
        };
        addAdditionalEvidenceImage(newImg);
        setShowAddSection(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const formatSideLabel = (side: string): string => {
    switch (side) {
      case 'front': return 'Front Panel';
      case 'back': return 'Back Panel';
      case 'side': return 'Side Panel';
      case 'declaration_area': return 'Declaration Area';
      default: return 'Additional Evidence';
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none pb-24">
      
      <div className="space-y-4">
        
        {/* Step Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider bg-[#E6F4F1] px-2 py-0.5 rounded">
              Step 7 of 10 · Statutory Evidence
            </span>
            <h1 className="text-xl font-bold text-[#12304A] mt-1">Evidence & Photographs</h1>
            <p className="text-xs text-[#52616F] mt-0.5">
              Inspect photographic records, annotate findings, and link statutory evidence.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFlowStep('compliance_analysis')}
            className="text-xs font-semibold text-[#12304A] flex items-center gap-1 hover:text-[#0F766E] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Checks</span>
          </button>
        </div>

        {/* Action: Add Additional Evidence */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#12304A] flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#0F766E]" />
              Photographs Captured ({images.length})
            </span>
            <button
              type="button"
              onClick={() => setShowAddSection(!showAddSection)}
              className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddSection ? 'Cancel' : 'Add Photo'}</span>
            </button>
          </div>

          {showAddSection && (
            <div className="pt-2 border-t border-[#D9E1E8] space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-[#52616F] block mb-1">
                  Evidence Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg px-2.5 py-1.5 text-xs text-[#12304A] font-medium focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-[#12304A] hover:bg-[#0B2239] text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Use Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#F4F7FA] hover:bg-[#D9E1E8] text-[#12304A] font-bold text-xs py-2 px-3 rounded-lg border border-[#D9E1E8] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          )}
        </div>

        {/* Photos List */}
        {images.length === 0 ? (
          <div className="bg-white border border-dashed border-[#D9E1E8] rounded-xl p-8 text-center space-y-2">
            <ImageIcon className="w-8 h-8 text-[#52616F] mx-auto opacity-50" />
            <p className="text-xs font-semibold text-[#52616F]">No package photographs available</p>
            <p className="text-[11px] text-[#52616F]">
              Capture or upload package photographs to support statutory inspection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="bg-white border border-[#D9E1E8] rounded-xl p-3 shadow-xs space-y-2.5"
              >
                {/* Photo Header & Thumbnail */}
                <div className="flex gap-3">
                  <div 
                    onClick={() => {
                      setActiveModalImage(img);
                      setModalZoom(1);
                    }}
                    className="relative w-20 h-20 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-[#D9E1E8] cursor-pointer group"
                  >
                    <img
                      src={img.url}
                      alt={`Evidence ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-bold text-[#12304A] bg-[#F4F7FA] px-2 py-0.5 rounded border border-[#D9E1E8]">
                        {formatSideLabel(img.side)}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteEvidenceImage(img.id)}
                        className="text-[#52616F] hover:text-[#B91C1C] p-1 rounded transition-colors cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-[#52616F]">
                      Captured: {img.timestamp ? new Date(img.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Ready'} · {img.resolution || 'Standard'}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveModalImage(img);
                        setModalZoom(1);
                      }}
                      className="text-[10.5px] font-semibold text-[#0F766E] hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>View Full Size</span>
                    </button>
                  </div>
                </div>

                {/* Finding Linkage Dropdown */}
                <div className="bg-[#F4F7FA] p-2 rounded-lg border border-[#D9E1E8] space-y-1">
                  <label className="text-[10px] font-bold text-[#52616F] flex items-center gap-1 uppercase tracking-wider">
                    <LinkIcon className="w-3 h-3 text-[#0F766E]" />
                    Linked Compliance Finding
                  </label>
                  <select
                    value={img.linkedFindingIds?.[0] || ''}
                    onChange={(e) => linkEvidenceToFinding(img.id, e.target.value)}
                    className="w-full bg-white border border-[#D9E1E8] rounded-md px-2 py-1 text-[11px] text-[#12304A] font-medium focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="">-- Unlinked / General Packaging Evidence --</option>
                    {checks.map((chk) => (
                      <option key={chk.checkId} value={chk.checkId}>
                        {chk.ruleNumber}: {chk.ruleTitle} ({chk.result})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Officer Description Note */}
                <div>
                  <input
                    type="text"
                    placeholder="Add description (e.g. MRP font height, declaration panel)..."
                    value={img.description || ''}
                    onChange={(e) => updateEvidenceDescription(img.id, e.target.value)}
                    className="w-full bg-white border border-[#D9E1E8] rounded-lg px-2.5 py-1.5 text-xs text-[#12304A] placeholder:text-[#52616F]/60 focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9E1E8] p-3 max-w-md mx-auto z-10 safe-bottom flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFlowStep('compliance_analysis')}
          className="w-1/3 bg-[#F4F7FA] hover:bg-[#D9E1E8] text-[#17212B] font-semibold text-xs py-3 px-2 rounded-xl border border-[#D9E1E8] transition-colors cursor-pointer text-center"
        >
          Back
        </button>

        <button
          type="button"
          onClick={() => setFlowStep('officer_review')}
          className="w-2/3 bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.99] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Officer Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Full Size Zoom Modal */}
      {activeModalImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[#12304A] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-3 border-b border-white/10 text-white">
              <span className="text-xs font-bold">
                {formatSideLabel(activeModalImage.side)} · {activeModalImage.resolution || 'Evidence'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalZoom((z) => Math.min(z + 0.25, 3))}
                  className="p-1 text-white hover:text-[#0F766E] text-xs font-bold cursor-pointer"
                  title="Zoom in"
                >
                  +
                </button>
                <span className="text-[10px] text-white/70">{Math.round(modalZoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setModalZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="p-1 text-white hover:text-[#0F766E] text-xs font-bold cursor-pointer"
                  title="Zoom out"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalImage(null)}
                  className="p-1 rounded text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-black/40">
              <img
                src={activeModalImage.url}
                alt="Enlarged evidence"
                style={{ transform: `scale(${modalZoom})`, transformOrigin: 'center center' }}
                className="max-h-[70vh] max-w-full object-contain transition-transform duration-150"
              />
            </div>

            {activeModalImage.description && (
              <div className="p-2.5 bg-[#0B2239] text-white/90 text-xs border-t border-white/10">
                {activeModalImage.description}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
