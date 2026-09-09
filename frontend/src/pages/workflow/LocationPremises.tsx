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
  AlertTriangle,
  Loader2,
  Check
} from 'lucide-react';
import { useInspection } from '../../context/InspectionContext';
import { activeLocationService, LocationCoordinates } from '../../services/locationService';

export const LocationPremises: React.FC = () => {
  const { currentInspection, updateLocationData, confirmLocation, setFlowStep } = useInspection();

  const loc = currentInspection.locationData;
  const [status, setStatus] = useState<'idle' | 'detecting' | 'captured' | 'unavailable' | 'permission_denied'>(() => {
    if (loc?.isConfirmed) return 'captured';
    if (loc?.status === 'Captured' || loc?.status === 'Acquired') return 'captured';
    if (loc?.status === 'Denied') return 'permission_denied';
    if (loc?.status === 'Unavailable') return 'unavailable';
    return 'idle';
  });

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(loc?.isConfirmed || false);

  const captureLocation = async () => {
    setStatus('detecting');
    setErrorMessage(null);

    try {
      // 1. Obtain GPS coordinates via Location Service
      const position = await activeLocationService.getCurrentCoordinates();
      setCoords(position);

      // 2. Perform Reverse Geocoding to get human-readable location
      const address = await activeLocationService.reverseGeocode(
        position.latitude, 
        position.longitude
      );

      setResolvedAddress(address);
      setStatus('captured');
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
      if (err.code === 1 || err.code === 'PERMISSION_DENIED') {
        setStatus('permission_denied');
        setErrorMessage('Location permission was denied. Please enable location access in your device or browser settings and try again.');
        updateLocationData({ status: 'Denied' });
      } else {
        setStatus('unavailable');
        setErrorMessage(
          err.message || 'GPS location is currently unavailable. Please ensure GPS/location services are turned on.'
        );
        updateLocationData({ status: 'Unavailable' });
      }
    }
  };

  // Automatically attempt capture on screen mount if not yet acquired
  useEffect(() => {
    if (!coords && status === 'idle') {
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
    if (!isConfirmed && !coords) {
      setErrorMessage('Please capture and confirm the inspection location before continuing.');
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
              Step 2 · Geospatial Verification
            </span>
            <span className="text-[10.5px] font-mono text-[#52616F]">
              {currentInspection.inspectionNumber}
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#12304A] mt-1">Location & Premises</h1>
          <p className="text-xs text-[#52616F] mt-0.5">
            Capture verified GPS coordinates and reverse-geocoded premises address.
          </p>
        </div>

        {/* Premises Summary Banner */}
        <div className="p-3 bg-white border border-[#D9E1E8] rounded-xl shadow-card flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E6F4F1] text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
            <Building className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17212B] truncate">
                {currentInspection.premisesName || 'Establishment (Unspecified)'}
              </span>
              <span className="text-[10px] text-[#0F766E] font-semibold bg-[#E6F4F1] px-1.5 py-0.2 rounded">
                {currentInspection.premisesType || 'Retail Store'}
              </span>
            </div>
            {currentInspection.premisesAddress && (
              <p className="text-[11px] text-[#52616F] truncate mt-0.5">
                {currentInspection.premisesAddress}
              </p>
            )}
          </div>
        </div>

        {/* Status Indicator Card */}
        <div className="bg-white border border-[#D9E1E8] rounded-xl p-4 shadow-card space-y-3">
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#52616F] uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Location Status</span>
            </span>

            {/* Status Badges */}
            {status === 'detecting' && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Detecting location...</span>
              </span>
            )}

            {status === 'captured' && (
              <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isConfirmed 
                  ? 'text-[#15803D] bg-[#E6F4F1] border-[#A7F3D0]' 
                  : 'text-[#0F766E] bg-teal-50 border-teal-200'
              }`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>{isConfirmed ? 'Location Confirmed' : 'Location Captured'}</span>
              </span>
            )}

            {status === 'unavailable' && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                <span>Location unavailable</span>
              </span>
            )}

            {status === 'permission_denied' && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#B91C1C] bg-[#FEE2E2] border border-[#FECACA] px-2.5 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3" />
                <span>Permission denied</span>
              </span>
            )}

            {status === 'idle' && (
              <span className="text-[11px] font-semibold text-[#52616F] bg-[#F4F7FA] border border-[#D9E1E8] px-2.5 py-0.5 rounded-full">
                Awaiting capture
              </span>
            )}
          </div>

          {/* Error Message with clear guidance */}
          {errorMessage && (
            <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Unable to obtain coordinates</p>
                <p className="text-[11px] text-[#17212B] leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* GPS Coordinates Section */}
          <div className="p-3 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#17212B] uppercase tracking-wider">GPS Coordinates</span>
              {coords && (
                <span className="text-[10px] text-[#52616F]">
                  Accuracy: ±{coords.accuracy}m
                </span>
              )}
            </div>

            {coords ? (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-white rounded border border-[#D9E1E8]">
                  <span className="text-[10px] text-[#52616F] block font-sans">Latitude</span>
                  <span className="font-bold text-[#12304A]">{coords.latitude.toFixed(6)}°</span>
                </div>
                <div className="p-2 bg-white rounded border border-[#D9E1E8]">
                  <span className="text-[10px] text-[#52616F] block font-sans">Longitude</span>
                  <span className="font-bold text-[#12304A]">{coords.longitude.toFixed(6)}°</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-[#52616F]">
                Coordinates not yet acquired from device GPS sensor.
              </div>
            )}
          </div>

          {/* Human-Readable Reverse-Geocoded Location */}
          <div className="space-y-1.5">
            <label 
              htmlFor="resolved-address"
              className="block font-bold text-[#17212B] uppercase tracking-wider text-[11px]"
            >
              Inspection Location (Resolved Address)
            </label>
            <textarea
              id="resolved-address"
              rows={3}
              value={resolvedAddress}
              onChange={(e) => {
                setResolvedAddress(e.target.value);
                setIsConfirmed(false);
              }}
              placeholder={status === 'detecting' ? 'Reverse-geocoding in progress...' : 'Human-readable location will appear here once GPS is captured...'}
              className="w-full px-3 py-2 bg-[#F4F7FA] border border-[#D9E1E8] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-xs text-[#17212B] font-medium resize-none leading-relaxed"
            />
            <p className="text-[10.5px] text-[#52616F]">
              Reverse-geocoded from GPS coordinates. You may adjust specific shop/room details before confirming.
            </p>
          </div>

          {/* Action Buttons: Capture & Confirm */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={captureLocation}
              disabled={status === 'detecting'}
              className="w-full bg-[#E6F4F1] hover:bg-teal-100 text-[#0F766E] border border-[#D9E1E8] font-bold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === 'detecting' ? 'animate-spin' : ''}`} />
              <span>{status === 'detecting' ? 'Detecting Location...' : 'Capture Current Location'}</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmLocation}
              disabled={!coords || status === 'detecting' || isConfirmed}
              className={`w-full font-bold text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isConfirmed
                  ? 'bg-[#E6F4F1] text-[#15803D] border border-[#A7F3D0] cursor-default'
                  : 'bg-[#0F766E] hover:bg-[#0d645e] text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isConfirmed ? (
                <>
                  <Check className="w-4 h-4 text-[#15803D]" />
                  <span>Location Confirmed</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Location</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Primary Action Footer */}
      <div className="pt-4 safe-bottom">
        <button
          type="button"
          onClick={handleProceed}
          className="w-full bg-[#12304A] hover:bg-[#0B2239] active:scale-[0.98] text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Package Capture</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
