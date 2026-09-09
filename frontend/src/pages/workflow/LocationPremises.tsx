import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Building, 
  ShieldCheck, 
  Loader2,
  Check
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { activeLocationService, LocationCoordinates } from '../../services/locationService';

export const LocationPremises: React.FC = () => {
  const { currentInspection, updateLocationData, confirmLocation, setFlowStep } = useInspection();

  const loc = currentInspection.locationData;
  const [coords, setCoords] = useState<LocationCoordinates | null>(() => {
    if (loc?.latitude && loc?.longitude) {
      return {
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy || 0,
        timestamp: loc.timestamp || new Date().toISOString()
      };
    }
    return null;
  });

  const [resolvedAddress, setResolvedAddress] = useState<string>(loc?.resolvedAddress || '');
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(loc?.isConfirmed || false);

  const formatCoordinates = (lat: number, lng: number) => {
    const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
    const lngStr = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
    return `${latStr}, ${lngStr}`;
  };

  const captureLocation = async () => {
    setErrorMessage(null);
    // Stage 1: Getting GPS coordinates
    setLoadingMessage('Getting your current location...');

    try {
      // 1. Obtain real GPS coordinates from device sensor
      const position = await activeLocationService.getCurrentCoordinates();
      setCoords(position);

      // Stage 2: Reverse geocoding
      setLoadingMessage('Resolving location...');

      // 2. Perform Reverse Geocoding to get human-readable location
      const address = await activeLocationService.reverseGeocode(
        position.latitude, 
        position.longitude
      );

      setResolvedAddress(address);
      setLoadingMessage(null);
      setIsConfirmed(false);

      // 3. Update Inspection context state
      updateLocationData({
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        timestamp: position.timestamp,
        status: 'Captured',
        resolvedAddress: address,
        isConfirmed: false
      });
    } catch (err: any) {
      console.warn('Location capture error:', err);
      setLoadingMessage(null);
      setErrorMessage('Unable to obtain your current location.');
      updateLocationData({ status: 'Unavailable' });
    }
  };

  // Automatically obtain device GPS on screen mount if not yet acquired
  useEffect(() => {
    if (!coords && !loadingMessage) {
      captureLocation();
    }
  }, []);

  const handleConfirmLocation = () => {
    if (!coords) {
      setErrorMessage('Please capture current GPS location before confirming.');
      return;
    }

    setIsConfirmed(true);
    confirmLocation();
    updateLocationData({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      resolvedAddress: resolvedAddress.trim(),
      status: 'Confirmed',
      isConfirmed: true
    });
  };

  const handleProceed = () => {
    if (!isConfirmed) {
      setErrorMessage('Please confirm the inspection location before continuing.');
      return;
    }
    setFlowStep('capture');
  };

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-115px)] max-w-md mx-auto p-4 select-none">
      
      {/* Content */}
      <div className="space-y-4">
        
        {/* Header Block */}
        <div className="border-b border-[#D9E1E8] pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
              STEP 1 · LOCATION
            </span>
            <span className="text-[10.5px] font-mono text-[#52616F]">
              {currentInspection.inspectionNumber}
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#12304A] mt-1">Inspection Location</h1>
          <p className="text-xs text-[#52616F] mt-0.5">
            Capture verified GPS coordinates and reverse-geocoded inspection location.
          </p>
        </div>

        {/* Separation: Premises / Establishment Name (Entered in Step 0) */}
        <div className="p-3.5 bg-white border border-[#D9E1E8] rounded-xl shadow-card flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
            <Building className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52616F] block">
              Premises / Establishment Name
            </span>
            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-xs font-bold text-[#17212B] truncate">
                {currentInspection.premisesName || 'Establishment (Unspecified)'}
              </span>
              <span className="text-[10px] text-[#0F766E] font-semibold bg-[#E6F4F1] px-2 py-0.5 rounded shrink-0">
                {currentInspection.premisesType || 'Retail Store'}
              </span>
            </div>
          </div>
        </div>

        {/* Inspection Location Card (Obtained from GPS) */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-4 shadow-card space-y-3.5">
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#52616F] uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Inspection Location</span>
            </span>

            {/* Status Badge */}
            {loadingMessage ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{loadingMessage}</span>
              </span>
            ) : isConfirmed ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#15803D] bg-[#E6F4F1] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Location Confirmed</span>
              </span>
            ) : coords ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                <span>GPS Acquired</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-[#52616F] bg-[#F4F7FA] border border-[#D9E1E8] px-2.5 py-0.5 rounded-full">
                Pending GPS
              </span>
            )}
          </div>

          {/* Error Message with [Try Again] button */}
          {errorMessage && (
            <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={captureLocation}
                className="bg-white hover:bg-red-50 text-[#B91C1C] border border-[#FECACA] font-bold text-[11px] py-1 px-2.5 rounded shadow-sm transition-all cursor-pointer shrink-0"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Active Loading State Banner */}
          {loadingMessage && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-lg flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#1E40AF] block">{loadingMessage}</span>
                <span className="text-[11px] text-[#3B82F6]">Querying device GPS and reverse-geocoding service...</span>
              </div>
            </div>
          )}

          {/* Reverse-Geocoded Location Display */}
          <div className="space-y-1.5">
            <span className="block font-bold text-[#17212B] uppercase tracking-wider text-[11px]">
              Resolved Address
            </span>
            <div className="p-3 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg min-h-[58px] flex items-center">
              {resolvedAddress ? (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                  <span className="text-xs text-[#17212B] font-medium leading-relaxed">
                    {resolvedAddress}
                  </span>
                </div>
              ) : loadingMessage ? (
                <span className="text-xs text-[#52616F] italic">
                  Resolving address...
                </span>
              ) : (
                <span className="text-xs text-[#52616F] italic">
                  Address will appear automatically when GPS is acquired.
                </span>
              )}
            </div>
          </div>

          {/* GPS Coordinates & Accuracy */}
          <div className="p-3 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#17212B] uppercase tracking-wider">GPS Coordinates</span>
              {coords && (
                <span className="text-[10.5px] font-semibold text-[#0F766E]">
                  Accuracy: ±{coords.accuracy || 8}m
                </span>
              )}
            </div>

            {coords ? (
              <div className="p-2 bg-white rounded border border-[#D9E1E8] flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-[#12304A]">
                  {formatCoordinates(coords.latitude, coords.longitude)}
                </span>
                <span className="text-[10px] font-sans text-[#52616F]">
                  Device Sensor
                </span>
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-[#52616F]">
                {loadingMessage ? 'Acquiring satellite lock...' : 'Coordinates not yet acquired.'}
              </div>
            )}
          </div>

          {/* Location Action Buttons */}
          <div className="pt-1 flex flex-col gap-2">
            {/* Confirm Location Button */}
            <button
              type="button"
              onClick={handleConfirmLocation}
              disabled={!coords || !!loadingMessage || isConfirmed}
              className={`w-full font-bold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isConfirmed
                  ? 'bg-[#E6F4F1] text-[#15803D] border border-[#A7F3D0] cursor-default'
                  : 'bg-[#0F766E] hover:bg-[#0d645e] text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
              }`}
            >
              {isConfirmed ? (
                <>
                  <Check className="w-4 h-4 text-[#15803D]" />
                  <span>✓ Location Confirmed</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>✓ Confirm Location</span>
                </>
              )}
            </button>

            {/* Re-detect if needed */}
            {!isConfirmed && (
              <button
                type="button"
                onClick={captureLocation}
                disabled={!!loadingMessage}
                className="w-full text-[#52616F] hover:text-[#17212B] text-[11px] font-semibold py-1.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loadingMessage ? 'animate-spin' : ''}`} />
                <span>Re-acquire Location</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Primary Action Footer */}
      <div className="pt-4 safe-bottom">
        <button
          type="button"
          onClick={handleProceed}
          disabled={!isConfirmed}
          className={`w-full font-bold text-xs py-3.5 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 ${
            isConfirmed
              ? 'bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.98] text-white cursor-pointer'
              : 'bg-[#D9E1E8] text-[#52616F] cursor-not-allowed opacity-75'
          }`}
        >
          <span>Continue to Package Capture →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

