import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  ShieldCheck, 
  Cpu, 
  Camera, 
  RefreshCw, 
  CheckCircle2,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useInspection } from '../context/InspectionContext';

export const Settings: React.FC = () => {
  const { currentUser } = useInspection();

  const [ocrEngine, setOcrEngine] = useState('tesseract_local');
  const [fastApiEndpoint, setFastApiEndpoint] = useState('http://localhost:8000/api/v1');
  const [opticalCalibrationScale, setOpticalCalibrationScale] = useState('0.05');
  const [isSaved, setIsSaved] = useState(false);
  
  // Backend Connection Test State
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    online: boolean;
    message: string;
  }>({
    tested: false,
    online: true,
    message: 'Local Optical Engine Active (Embedded Deterministic Mode)',
  });

  const handleTestBackend = async () => {
    setIsTestingConnection(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${fastApiEndpoint}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        setConnectionStatus({
          tested: true,
          online: true,
          message: 'FastAPI Python Service Online & Responsive (Health Check OK)',
        });
      } else {
        setConnectionStatus({
          tested: true,
          online: false,
          message: 'Server responded with status ' + res.status + '. Fallback engine engaged.',
        });
      }
    } catch (e: any) {
      setConnectionStatus({
        tested: true,
        online: false,
        message: 'FastAPI Backend unreachable at ' + fastApiEndpoint + '. Operating in client mode.',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D9E1E8] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#12304A] text-white flex items-center justify-center">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#12304A]">Officer & System Settings</h1>
            <p className="text-[11px] text-[#52616F]">Hardware & engine configuration</p>
          </div>
        </div>

        {isSaved && (
          <div className="bg-[#E6F4F1] text-[#15803D] border border-[#A7F3D0] px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
            <span>Saved</span>
          </div>
        )}
      </div>

      {/* Officer Card */}
      <div className="bg-white p-3.5 border border-[#D9E1E8] rounded-xl shadow-card space-y-1.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#17212B]">
            Officer Profile
          </h3>
        </div>
        <div className="text-xs space-y-1 pt-1">
          <p><strong className="text-[#52616F]">Name:</strong> <span className="font-semibold text-[#17212B]">{currentUser.name}</span></p>
          <p><strong className="text-[#52616F]">Badge:</strong> <span className="font-mono text-[#12304A]">{currentUser.badgeNumber}</span></p>
          <p><strong className="text-[#52616F]">Zone:</strong> <span>{currentUser.zone}</span></p>
          <p><strong className="text-[#52616F]">Email:</strong> <span>{currentUser.email}</span></p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3.5">
        
        {/* Backend & OCR Engine Settings */}
        <div className="bg-white p-3.5 border border-[#D9E1E8] rounded-xl shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-[#D9E1E8] pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#17212B]">
                OCR & Engine Service
              </h3>
            </div>

            <button
              type="button"
              onClick={handleTestBackend}
              disabled={isTestingConnection}
              className="bg-[#F4F7FA] hover:bg-[#E6F4F1] text-[#12304A] text-[11px] font-semibold py-1 px-2 rounded border border-[#D9E1E8] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Activity className="w-3 h-3 text-[#0F766E]" />
              <span>{isTestingConnection ? 'Testing...' : 'Test'}</span>
            </button>
          </div>

          {/* Connection Status Banner */}
          {connectionStatus.tested && (
            <div className={`p-2 rounded border text-xs flex items-center gap-2 ${
              connectionStatus.online
                ? 'bg-[#E6F4F1] text-[#15803D] border-[#A7F3D0]'
                : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
            }`}>
              {connectionStatus.online ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
              )}
              <span className="text-[11px]">{connectionStatus.message}</span>
            </div>
          )}

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-semibold text-[#17212B] mb-1">OCR Analysis Engine Mode</label>
              <select
                value={ocrEngine}
                onChange={(e) => setOcrEngine(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] text-xs"
              >
                <option value="tesseract_local">Tesseract OCR Engine (Client / Offline)</option>
                <option value="fastapi_backend">FastAPI Python Backend (Tesseract + OpenCV)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#17212B] mb-1">FastAPI Backend Endpoint URL</label>
              <input
                type="text"
                value={fastApiEndpoint}
                onChange={(e) => setFastApiEndpoint(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Optical Calibrations */}
        <div className="bg-white p-3.5 border border-[#D9E1E8] rounded-xl shadow-card space-y-3">
          <div className="flex items-center gap-2 border-b border-[#D9E1E8] pb-2">
            <Camera className="w-4 h-4 text-[#0F766E]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17212B]">
              Optical Caliper & Scale Calibration
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-semibold text-[#17212B] mb-1">Optical Ratio (mm per pixel)</label>
              <input
                type="text"
                value={opticalCalibrationScale}
                onChange={(e) => setOpticalCalibrationScale(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F766E] text-xs"
              />
              <span className="text-[10px] text-[#52616F] mt-0.5 block">Standard 1080p optical sensor baseline: 0.05 mm/px.</span>
            </div>

            <div>
              <label className="block font-semibold text-[#17212B] mb-1">Active Camera Feed Device</label>
              <select className="w-full px-2.5 py-1.5 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg text-xs">
                <option>Integrated High-Resolution HD Camera (Primary)</option>
                <option>USB Document Scanner / Macro Lens</option>
                <option>Wireless Mobile Optical Probe</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="text-xs font-semibold text-[#B91C1C] hover:underline cursor-pointer"
          >
            Reset Session Data
          </button>

          <button
            type="submit"
            className="bg-[#12304A] hover:bg-[#0B2239] text-white font-semibold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
