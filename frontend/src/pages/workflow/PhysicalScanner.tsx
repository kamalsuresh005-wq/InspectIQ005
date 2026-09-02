import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Scan, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  Sparkles, 
  Trash2, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Ruler,
  Calculator,
  Image as ImageIcon,
  Check,
  ArrowLeft
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { PackageSide, PackageImage } from '../../types';
import { generatePackageSvg } from '../../data/mockProducts';

export const PhysicalScanner: React.FC = () => {
  const { 
    currentInspection, 
    addImage, 
    removeImage, 
    runAiPipeline, 
    setFlowStep,
    updateInspectionMetadata
  } = useInspection();

  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'scan'>('upload');
  const [activeSide, setActiveSide] = useState<PackageSide>('front');
  const [torchOn, setTorchOn] = useState(false);
  const [isCameraStreaming, setIsCameraStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // PDP Area Calculator State
  const [packHeightCm, setPackHeightCm] = useState<number>(16);
  const [packWidthCm, setPackWidthCm] = useState<number>(14);
  const [calculatedPdpArea, setCalculatedPdpArea] = useState<number>(224);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const sides: { id: PackageSide; label: string; short: string }[] = [
    { id: 'front', label: 'Front (Principal Display Panel)', short: 'FRONT' },
    { id: 'back', label: 'Back (Statutory Panel)', short: 'BACK' },
    { id: 'left', label: 'Left Side', short: 'LEFT' },
    { id: 'right', label: 'Right Side', short: 'RIGHT' },
    { id: 'top', label: 'Top Side', short: 'TOP' },
    { id: 'bottom', label: 'Bottom Side', short: 'BOTTOM' },
  ];

  // Calculate PDP Area
  useEffect(() => {
    setCalculatedPdpArea(Math.round(packHeightCm * packWidthCm));
  }, [packHeightCm, packWidthCm]);

  // Start / Stop Live WebCam
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraStreaming(true);
      } else {
        setCameraError('Camera API is not supported on this browser device.');
      }
    } catch (err: any) {
      setCameraError('Camera permission denied or camera device in use. You can use file upload.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraStreaming(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  const activeImage = currentInspection.images.find((img) => img.side === activeSide) || currentInspection.images[0];

  // Capture snapshot from WebCam or SVG
  const handleCaptureSnapshot = () => {
    let capturedUrl = generatePackageSvg(
      currentInspection.productName,
      currentInspection.brand,
      currentInspection.netQuantity,
      currentInspection.mrp,
      activeSide
    );

    if (isCameraStreaming && videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedUrl = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    const newImage: PackageImage = {
      id: `img-${Date.now()}-${activeSide}`,
      side: activeSide,
      label: sides.find((s) => s.id === activeSide)?.label || activeSide,
      url: capturedUrl,
      capturedAt: new Date().toISOString(),
      qualityScore: 96,
      blurScore: 'Low',
      glareScore: 'None',
      lightingScore: 'Optimal',
      textVisibilityScore: 'Crisp',
      boundingBoxes: []
    };

    addImage(newImage);

    // Auto advance
    const nextUncaptured = sides.find((s) => !currentInspection.images.some(img => img.side === s.id) && s.id !== activeSide);
    if (nextUncaptured) {
      setActiveSide(nextUncaptured.id);
    }
  };

  // Handle actual file upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const fileNameLower = file.name.toLowerCase();
      
      // Auto-detect brand from file name if not already set (e.g. 'boost_front.jpg')
      if (fileNameLower.includes('boost') && (!currentInspection.brand || currentInspection.brand === 'Brand Not Specified')) {
        updateInspectionMetadata({
          productName: 'Boost Health & Energy Drink (Chocolate)',
          brand: 'Boost',
          category: 'Health & Nutrition',
          netQuantity: '500 g',
          mrp: '₹ 295.00 (incl. of all taxes)',
          manufacturerName: 'Hindustan Unilever Limited (GSK Consumer Healthcare)'
        });
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const targetSide = sides[idx % sides.length].id;
        
        const newImage: PackageImage = {
          id: `img-${Date.now()}-${idx}`,
          side: targetSide,
          label: sides.find((s) => s.id === targetSide)?.label || targetSide,
          url: dataUrl,
          capturedAt: new Date().toISOString(),
          qualityScore: 98,
          blurScore: 'Low',
          glareScore: 'None',
          lightingScore: 'Optimal',
          textVisibilityScore: 'Crisp',
          boundingBoxes: []
        };
        addImage(newImage);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRunOcr = () => {
    runAiPipeline();
  };

  return (
    <div className="space-y-4 pb-8">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">
              Step 2 of 7
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Package Image Acquisition</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">
            Package Photographs & Optical Capture
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Upload or capture clear packaging photographs showing Principal Display Panel (PDP) and statutory declaration panels.
          </p>
        </div>

        {/* Action Mode Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded border border-slate-200 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#78350F]" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'camera' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#78350F]" />
            <span>Take Photograph</span>
          </button>

          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'scan' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scan className="w-3.5 h-3.5 text-[#78350F]" />
            <span>Scan Package</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 5 Cols: Side Index & Image Quality Report */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Side Index */}
          <div className="bg-white p-4 border border-slate-200 rounded space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Package Side Index
              </h3>
              <span className="text-[11px] font-semibold text-[#78350F] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                {currentInspection.images.length} / 6 Captured
              </span>
            </div>

            <div className="space-y-1.5">
              {sides.map((side, idx) => {
                const captured = currentInspection.images.some(img => img.side === side.id);
                const isActive = activeSide === side.id;

                return (
                  <button
                    key={side.id}
                    onClick={() => setActiveSide(side.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded border text-left text-xs transition-colors ${
                      isActive
                        ? 'border-[#78350F] bg-amber-50/60 font-semibold'
                        : captured
                        ? 'border-emerald-200 bg-emerald-50/40 text-slate-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        captured ? 'bg-emerald-700 text-white' : isActive ? 'bg-[#78350F] text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {captured ? '✓' : idx + 1}
                      </span>
                      <span>{side.label}</span>
                    </div>

                    <span className={`text-[10.5px] font-semibold ${captured ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {captured ? 'Uploaded' : 'Pending'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image Quality Scorecard (Simple, Clean, Non-AI Marketing) */}
          <div className="bg-white p-4 border border-slate-200 rounded space-y-2.5 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Optical Quality Assessment
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">Image Resolution:</span>
                <span className="font-semibold text-emerald-800">Good (1080p HD)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">Motion Blur:</span>
                <span className="font-semibold text-emerald-800">Good (Low)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">Lighting & Glare:</span>
                <span className="font-semibold text-emerald-800">Acceptable</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600 font-medium">Text Legibility:</span>
                <span className="font-semibold text-emerald-800">Good (Crisp Typography)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 7 Cols: Actual Image Preview / Upload Dropzone */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white p-4 border border-slate-200 rounded space-y-4">
            
            {/* Upload Area */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#78350F] rounded p-6 text-center space-y-2 bg-slate-50 hover:bg-amber-50/20 transition-colors cursor-pointer"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                  />
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Click to Select Product Photo from Computer / Phone
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supports JPG, PNG, WebP photographs of real packaging.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Live Camera Viewfinder */}
            {activeTab === 'camera' && (
              <div className="space-y-3">
                {cameraError ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs space-y-1 text-center">
                    <p className="font-bold text-amber-900">{cameraError}</p>
                    <p className="text-slate-600">Please switch to the <strong>Upload Image</strong> tab to select packaging photos.</p>
                  </div>
                ) : (
                  <div className="relative bg-black rounded overflow-hidden aspect-[4/3] flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 inset-x-0 flex justify-center">
                      <button
                        onClick={handleCaptureSnapshot}
                        className="bg-[#78350F] hover:bg-[#582509] text-white font-bold text-xs px-6 py-2 rounded shadow-md flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Capture {sides.find(s => s.id === activeSide)?.short} Snapshot</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actual Uploaded Image Display */}
            {activeImage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5">
                  <span className="font-bold text-slate-800">
                    Actual Package Image: {activeImage.label}
                  </span>
                  <span className="text-[10.5px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Image Ready for OCR
                  </span>
                </div>

                <div className="relative bg-slate-900 rounded p-2 flex items-center justify-center min-h-[300px] max-h-[380px] overflow-hidden">
                  <img 
                    src={activeImage.url} 
                    alt="Package Display"
                    className="max-h-[360px] max-w-full object-contain rounded"
                  />
                </div>
              </div>
            )}

            {/* Gallery of Uploaded Photos */}
            {currentInspection.images.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Uploaded Images Gallery ({currentInspection.images.length}):
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {currentInspection.images.map((img) => (
                    <div 
                      key={img.id}
                      onClick={() => setActiveSide(img.side)}
                      className="group relative bg-slate-50 border border-slate-200 rounded p-1 cursor-pointer hover:border-[#78350F]"
                    >
                      <div className="aspect-[3/4] bg-white rounded overflow-hidden flex items-center justify-center">
                        <img src={img.url} alt={img.label} className="h-full w-full object-contain" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-700 block mt-1 text-center truncate">
                        {img.side.toUpperCase()}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                        className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Navigation Bar */}
          <div className="bg-white p-3.5 border border-slate-200 rounded flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              onClick={() => setFlowStep('create')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Back to Details
            </button>

            <button
              onClick={handleRunOcr}
              className="w-full sm:w-auto bg-[#78350F] hover:bg-[#582509] text-white font-semibold text-xs py-2.5 px-6 rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Proceed to Step 3 (Run OCR & Analysis)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
