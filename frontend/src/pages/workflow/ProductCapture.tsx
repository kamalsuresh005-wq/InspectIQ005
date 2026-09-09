import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  ArrowRight, 
  CheckCircle2, 
  RotateCw, 
  Trash2, 
  AlertCircle, 
  Image as ImageIcon,
  Shield,
  Layers,
  X
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { PackageSide, PackageImage } from '../../types';

interface ImageCategoryConfig {
  id: PackageSide;
  label: string;
}

const CATEGORIES: ImageCategoryConfig[] = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'side', label: 'Side' },
  { id: 'declaration_area', label: 'Declaration Area' },
  { id: 'additional_evidence', label: 'Additional Evidence' },
];

export const ProductCapture: React.FC = () => {
  const { currentInspection, addImage, removeImage, setFlowStep } = useInspection();

  const [activeCategory, setActiveCategory] = useState<PackageSide>('front');
  const [useLiveCamera, setUseLiveCamera] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<PackageImage | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useLiveCamera) {
      setCameraError(null);
      navigator.mediaDevices?.getUserMedia({
        video: { 
          facingMode: cameraFacing, 
          width: { ideal: 1280 }, 
          height: { ideal: 960 } 
        }
      }).then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      }).catch((err) => {
        setUseLiveCamera(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera permission is required to capture package images.');
        } else {
          setCameraError('Unable to access device camera. You may select an image from gallery/device instead.');
        }
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [useLiveCamera, cameraFacing]);

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        saveCapturedImage(dataUrl, 'camera');
        setUseLiveCamera(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, method: 'camera' | 'upload') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          saveCapturedImage(dataUrl, method);
        }
      };
      reader.readAsDataURL(file);
    }
    // reset input value so re-selecting same file triggers change
    e.target.value = '';
  };

  const saveCapturedImage = (dataUrl: string, method: 'camera' | 'upload') => {
    const categoryConfig = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
    const newImage: PackageImage = {
      id: `img-${Date.now()}-${activeCategory}`,
      side: activeCategory,
      label: categoryConfig.label,
      url: dataUrl,
      capturedAt: new Date().toISOString(),
      captureMethod: method,
      qualityScore: 90,
      blurScore: 'Low',
      glareScore: 'None',
      lightingScore: 'Optimal',
      textVisibilityScore: 'Crisp',
      boundingBoxes: []
    };

    addImage(newImage);

    // Auto-advance category to next uncaptured one if available
    const capturedSides = new Set(currentInspection.images.map(img => img.side));
    capturedSides.add(activeCategory);
    const nextUncaptured = CATEGORIES.find(c => !capturedSides.has(c.id));
    if (nextUncaptured) {
      setActiveCategory(nextUncaptured.id);
    }
  };

  const currentCategoryImages = currentInspection.images.filter(img => img.side === activeCategory);
  const totalImagesCount = currentInspection.images.length;

  const handleContinue = () => {
    if (totalImagesCount === 0) {
      setCameraError('Please capture at least one package image before continuing.');
      return;
    }
    setFlowStep('image_quality');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-115px)] max-w-md mx-auto p-4 select-none">
      
      <div className="space-y-4">
        
        {/* Header Block */}
        <div className="border-b border-[#D9E1E8] pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
              Step 2 · Evidence Capture
            </span>
            <span className="text-[10.5px] font-mono text-[#52616F]">
              {totalImagesCount} {totalImagesCount === 1 ? 'image' : 'images'} recorded
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#12304A] mt-1">Capture Package</h1>
          <p className="text-xs text-[#52616F] mt-0.5">
            Capture clear images of the packaged commodity and its declarations.
          </p>
        </div>

        {/* Guidance Box */}
        <div className="p-3 bg-[#E6F4F1] border border-[#D9E1E8] rounded-xl text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#0F766E] text-[11px]">
            <Shield className="w-3.5 h-3.5" />
            <span>Inspection Capture Guidance</span>
          </div>
          <ul className="text-[10.5px] text-[#17212B] space-y-0.5 list-disc list-inside font-medium">
            <li>Keep the package steady</li>
            <li>Ensure declarations are visible</li>
            <li>Avoid glare and shadows</li>
            <li>Capture front, back and declaration areas when required</li>
          </ul>
        </div>

        {/* Error / Permission Alert */}
        {cameraError && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">{cameraError}</span>
              <button
                type="button"
                onClick={() => {
                  setCameraError(null);
                  setUseLiveCamera(true);
                }}
                className="text-[11px] font-bold text-[#B91C1C] underline mt-1 block"
              >
                Retry Camera Permission
              </button>
            </div>
          </div>
        )}

        {/* Category Selector Tabs */}
        <div>
          <label className="block font-semibold text-[#17212B] uppercase tracking-wider text-[11px] mb-1.5">
            Image Category
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const count = currentInspection.images.filter(i => i.side === cat.id).length;
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 transition-colors flex items-center gap-1 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#12304A] text-white border-[#12304A]'
                      : count > 0
                      ? 'bg-white text-[#0F766E] border-[#0F766E]'
                      : 'bg-white text-[#52616F] border-[#D9E1E8] hover:bg-[#F4F7FA]'
                  }`}
                >
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                      isSelected ? 'bg-[#0F766E] text-white' : 'bg-[#E6F4F1] text-[#0F766E]'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Capture Box */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-4 shadow-card space-y-3">
          
          {useLiveCamera ? (
            /* Live Camera Stream View */
            <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              <video 
                ref={videoRef} 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              
              {/* Overlay Grid */}
              <div className="absolute inset-0 pointer-events-none border-2 border-white/30 m-4 rounded-lg"></div>

              {/* Controls */}
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setUseLiveCamera(false)}
                  className="bg-black/60 text-white p-2 rounded-full hover:bg-black"
                  title="Cancel Camera"
                >
                  <X className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="w-14 h-14 rounded-full bg-white border-4 border-slate-300 shadow-lg active:scale-95 flex items-center justify-center"
                  title="Capture Photo"
                >
                  <div className="w-11 h-11 rounded-full bg-[#12304A]"></div>
                </button>

                <button
                  type="button"
                  onClick={() => setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="bg-black/60 text-white p-2 rounded-full hover:bg-black"
                  title="Switch Camera"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Standard Trigger Area */
            <div className="space-y-3">
              <div className="text-center py-4 border-2 border-dashed border-[#D9E1E8] rounded-xl bg-[#F4F7FA]">
                <Camera className="w-10 h-10 text-[#0F766E] mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-[#17212B]">
                  Ready to capture: {CATEGORIES.find(c => c.id === activeCategory)?.label}
                </p>
                <p className="text-[10.5px] text-[#52616F] mt-0.5">
                  Use hardware camera or select an image from your device.
                </p>

                <div className="pt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseLiveCamera(true)}
                    className="bg-[#12304A] hover:bg-[#0B2239] text-white font-semibold text-xs py-2 px-3 rounded-lg shadow-card flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="bg-white hover:bg-[#F4F7FA] text-[#17212B] border border-[#D9E1E8] font-semibold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#52616F]" />
                    <span>Device Gallery</span>
                  </button>
                </div>
              </div>

              {/* Hidden file inputs for direct camera and gallery */}
              <input 
                ref={cameraInputRef} 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={(e) => handleFileUpload(e, 'camera')} 
                className="hidden" 
              />
              <input 
                ref={galleryInputRef} 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, 'upload')} 
                className="hidden" 
              />
            </div>
          )}

        </div>

        {/* Captured Images List for current inspection */}
        {totalImagesCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#17212B] uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Captured Packaging Evidence ({totalImagesCount})</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {currentInspection.images.map((img) => (
                <div 
                  key={img.id}
                  className="relative group bg-white border border-[#D9E1E8] rounded-lg overflow-hidden shadow-card"
                >
                  <img 
                    src={img.url} 
                    alt={img.label}
                    onClick={() => setSelectedPreviewImage(img)}
                    className="w-full h-20 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  />
                  <div className="p-1.5 bg-white flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-[#12304A] truncate">
                      {img.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                      title="Delete image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Image Preview Modal */}
      {selectedPreviewImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-2xl space-y-3">
            <div className="p-3 border-b border-[#D9E1E8] flex items-center justify-between">
              <span className="font-bold text-xs text-[#12304A]">
                {selectedPreviewImage.label}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPreviewImage(null)}
                className="text-[#52616F] hover:text-[#17212B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-950">
              <img 
                src={selectedPreviewImage.url} 
                alt={selectedPreviewImage.label}
                className="max-h-[55vh] object-contain rounded"
              />
            </div>

            <div className="p-3 border-t border-[#D9E1E8] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  removeImage(selectedPreviewImage.id);
                  setSelectedPreviewImage(null);
                }}
                className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPreviewImage(null)}
                className="bg-[#12304A] text-white text-xs font-bold py-1.5 px-3 rounded-lg cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Action Footer */}
      <div className="pt-4 safe-bottom">
        <button
          type="button"
          onClick={handleContinue}
          disabled={totalImagesCount === 0}
          className="w-full bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.98] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue with Captured Packaging ({totalImagesCount})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
