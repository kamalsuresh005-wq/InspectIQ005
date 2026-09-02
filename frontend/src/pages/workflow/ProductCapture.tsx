import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ArrowRight, CheckCircle2, RotateCw, Trash2, Zap, Image as ImageIcon } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { PackageSide, PackageImage } from '../../types';

export const ProductCapture: React.FC = () => {
  const { currentInspection, addImage, removeImage, setFlowStep } = useInspection();

  const [activeSide, setActiveSide] = useState<PackageSide>('front');
  const [useLiveCamera, setUseLiveCamera] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sides: { id: PackageSide; label: string }[] = [
    { id: 'front', label: 'Front' },
    { id: 'back', label: 'Back' },
    { id: 'left', label: 'Left' },
    { id: 'right', label: 'Right' },
    { id: 'top', label: 'Top' },
    { id: 'bottom', label: 'Bottom' },
  ];

  const currentImage = currentInspection.images.find(img => img.side === activeSide);

  // Initialize camera when enabled
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useLiveCamera) {
      navigator.mediaDevices?.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 960 } }
      }).then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      }).catch(() => {
        setUseLiveCamera(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          saveCapturedImage(dataUrl, 'upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCapturedImage = (dataUrl: string, method: 'camera' | 'upload') => {
    const newImage: PackageImage = {
      id: `img-${Date.now()}-${activeSide}`,
      side: activeSide,
      label: `${activeSide.toUpperCase()} Side`,
      url: dataUrl,
      capturedAt: new Date().toISOString(),
      captureMethod: method,
      qualityScore: 94,
      blurScore: 'Low',
      glareScore: 'None',
      lightingScore: 'Optimal',
      textVisibilityScore: 'Crisp',
      boundingBoxes: []
    };

    addImage(newImage);

    // Auto-advance to next uncaptured view
    const nextUncaptured = sides.find(s => !currentInspection.images.some(img => img.side === s.id && img.side !== activeSide));
    if (nextUncaptured && nextUncaptured.id !== activeSide) {
      setActiveSide(nextUncaptured.id);
    }
  };

  const capturedCount = currentInspection.images.length;
  const canContinue = capturedCount > 0;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
              Step 3 of 12
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Product Capture</h1>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            {capturedCount} / 6 Captured
          </span>
        </div>

        {/* Viewfinder / Preview Box */}
        <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-slate-800 shadow-inner">
          {useLiveCamera ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : currentImage ? (
            <div className="relative w-full h-full flex items-center justify-center p-2 bg-slate-950">
              <img
                src={currentImage.url}
                alt={currentImage.label}
                className="max-h-full max-w-full object-contain rounded"
              />
              <button
                type="button"
                onClick={() => removeImage(currentImage.id)}
                className="absolute top-2 right-2 bg-red-600/90 text-white p-1.5 rounded-full hover:bg-red-700 shadow"
                title="Delete Photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                {activeSide.toUpperCase()} · CAPTURED
              </div>
            </div>
          ) : (
            <div className="text-center p-4 space-y-2 text-slate-400">
              <Camera className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-xs font-medium">Awaiting {activeSide.toUpperCase()} view capture</p>
              <p className="text-[10px] text-slate-500">Use device camera or upload photo from gallery</p>
            </div>
          )}

          {/* Alignment Reticle Overlay */}
          <div className="absolute inset-3 pointer-events-none border border-white/20 rounded-lg">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400"></div>
          </div>
        </div>

        {/* Capture Buttons */}
        <div className="flex gap-2">
          {useLiveCamera ? (
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="flex-1 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-900 font-bold text-xs py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Snap Photo</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setUseLiveCamera(true)}
              className="flex-1 bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-xs py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Open Camera</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 font-bold text-xs py-2.5 px-3 rounded-lg border border-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Compact 6-Side View Chips */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
          <div className="grid grid-cols-3 gap-1.5">
            {sides.map((side) => {
              const isCaptured = currentInspection.images.some(img => img.side === side.id);
              const isActive = activeSide === side.id;

              return (
                <button
                  key={side.id}
                  type="button"
                  onClick={() => {
                    setActiveSide(side.id);
                    setUseLiveCamera(false);
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between border ${
                    isActive
                      ? 'border-blue-900 bg-blue-50 text-blue-900 ring-1 ring-blue-900'
                      : isCaptured
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>{side.label}</span>
                  <span className="text-[10px] font-bold">
                    {isCaptured ? '✓' : '○'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="pt-4 safe-bottom">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => setFlowStep('quality_check')}
          className={`w-full font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
            canContinue
              ? 'bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Continue to Quality Check</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
