import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';

export const LocationPremises: React.FC = () => {
  const { currentInspection, updateLocationData, updatePremises, setFlowStep } = useInspection();

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string>(currentInspection.premisesName || '');

  const requestGps = () => {
    setIsLocating(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your device.');
      updateLocationData({ status: 'Unavailable' });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const timestamp = new Date(pos.timestamp).toISOString();

        updateLocationData({
          latitude,
          longitude,
          accuracy,
          timestamp,
          status: 'Acquired',
          resolvedAddress: `Lat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)}`
        });
        setIsLocating(false);
      },
      (err) => {
        let msg = 'Unable to acquire location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location access not permitted. Enter premises name below.';
          updateLocationData({ status: 'Denied' });
        } else {
          msg = 'GPS signal unavailable. Please enter premises manually.';
          updateLocationData({ status: 'Unavailable' });
        }
        setGpsError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (!currentInspection.locationData?.latitude && currentInspection.locationData?.status === 'Awaiting Capture') {
      requestGps();
    }
  }, []);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    updatePremises(shopName.trim() || 'Retail Premises (Unspecified)');
    setFlowStep('capture');
  };

  const loc = currentInspection.locationData;
  const isAcquired = loc?.status === 'Acquired' && loc.latitude !== undefined;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-120px)] max-w-md mx-auto p-4 select-none">
      
      {/* Top Header & Inputs */}
      <form id="location-form" onSubmit={handleContinue} className="space-y-4">
        <div>
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
            Step 2 of 12
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Location / Premises</h1>
          <p className="text-xs text-slate-500 mt-0.5">Record inspection site and GPS coordinates.</p>
        </div>

        {/* GPS Status Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-800" />
              <span>GPS Coordinates</span>
            </span>

            <button
              type="button"
              onClick={requestGps}
              disabled={isLocating}
              className="text-[11px] font-semibold text-blue-800 hover:text-blue-900 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded"
            >
              <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring...' : 'Refresh'}</span>
            </button>
          </div>

          {isAcquired ? (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>GPS Acquired (±{loc.accuracy?.toFixed(0)}m accuracy)</span>
              </div>
              <div className="font-mono text-slate-800 text-[11px]">
                {loc.latitude?.toFixed(5)}° N, {loc.longitude?.toFixed(5)}° E
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{gpsError || 'GPS Location: ' + (loc?.status || 'Pending')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Premises / Shop Name Input */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Shop / Premises Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Enter Shop or Premises Name..."
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 text-slate-900 font-medium"
          />
          <p className="text-[10.5px] text-slate-500">
            Stored separately from GPS device coordinates.
          </p>
        </div>
      </form>

      {/* Primary Action */}
      <div className="pt-4 safe-bottom">
        <button
          form="location-form"
          type="submit"
          className="w-full bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
