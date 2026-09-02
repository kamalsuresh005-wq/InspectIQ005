import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Camera, 
  HardDrive, 
  RefreshCw, 
  CheckCircle2,
  Key,
  Server,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useInspection } from '../context/InspectionContext';

export const Settings: React.FC = () => {
  const { currentUser } = useInspection();

  const [aiEngine, setAiEngine] = useState('heuristic_mock');
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
    message: 'Local Heuristic Engine Active (Embedded Deterministic Mode)',
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
        message: 'Backend server not responding on ' + fastApiEndpoint + '. Deterministic fallback engine active.',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8 text-xs">
      
      {/* Header */}
      <div className="bg-white p-4 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider">System Administration</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Department of Legal Metrology</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">System Settings & Node Infrastructure</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Configure backend OCR endpoints, optical scale calibrations, statutory rules database & offline storage adapters.
          </p>
        </div>

        {isSaved && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        
        {/* Backend & AI OCR Engine Settings */}
        <div className="bg-white p-4 border border-slate-200 rounded space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#78350F]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                OCR Engine & Service Configuration
              </h3>
            </div>

            <button
              type="button"
              onClick={handleTestBackend}
              disabled={isTestingConnection}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1 px-2.5 rounded border border-slate-300 transition-colors flex items-center gap-1"
            >
              <Activity className="w-3 h-3 text-[#78350F]" />
              <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Connection Status Banner */}
          {connectionStatus.tested && (
            <div className={`p-2.5 rounded border text-xs flex items-center gap-2 ${
              connectionStatus.online
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              {connectionStatus.online ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span>{connectionStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">OCR Analysis Engine Mode</label>
              <select
                value={aiEngine}
                onChange={(e) => setAiEngine(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#78350F]"
              >
                <option value="heuristic_mock">Deterministic Optical Engine (Offline PCR 2011 Baseline)</option>
                <option value="fastapi_backend">FastAPI Python Microservice (Port 8000)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">FastAPI Backend Endpoint URL</label>
              <input
                type="text"
                value={fastApiEndpoint}
                onChange={(e) => setFastApiEndpoint(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#78350F]"
              />
            </div>
          </div>
        </div>

        {/* Optical Calibrations */}
        <div className="bg-white p-4 border border-slate-200 rounded space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Camera className="w-4 h-4 text-[#78350F]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Optical Caliper & Scale Calibration
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Optical Ratio (mm per pixel)</label>
              <input
                type="text"
                value={opticalCalibrationScale}
                onChange={(e) => setOpticalCalibrationScale(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#78350F]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Standard 1080p optical sensor baseline: 0.05 mm/px.</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Camera Feed Device</label>
              <select className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded">
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
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Reset Application Data Cache
          </button>

          <button
            type="submit"
            className="bg-[#78350F] hover:bg-[#582509] text-white font-semibold text-xs py-2 px-6 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
};
