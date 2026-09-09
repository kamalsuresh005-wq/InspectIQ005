/**
 * Location Service Abstraction for InspectIQ
 * 
 * Flow:
 * GPS -> Coordinates (Lat/Long) -> Reverse Geocoding Provider -> Human-Readable Location -> Officer Confirmation
 * 
 * Provider is decoupled so it can be swapped to Expo Location, OpenStreetMap,
 * backend proxy, or government geospatial providers without changing UI components.
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export type LocationStatus = 
  | 'idle'
  | 'detecting'
  | 'captured'
  | 'unavailable'
  | 'permission_denied';

export interface LocationResult {
  coordinates?: LocationCoordinates;
  humanReadableAddress?: string;
  status: LocationStatus;
  errorMessage?: string;
}

export interface ILocationService {
  getCurrentCoordinates(): Promise<LocationCoordinates>;
  reverseGeocode(latitude: number, longitude: number): Promise<string>;
}

/**
 * Standard Browser Geolocation and OpenStreetMap/Nominatim Reverse Geocoding implementation
 */
export class BrowserLocationService implements ILocationService {
  private timeoutMs: number;

  constructor(timeoutMs = 10000) {
    this.timeoutMs = timeoutMs;
  }

  public getCurrentCoordinates(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        const error = new Error('Geolocation is not supported by your device or browser.');
        (error as any).code = 'UNSUPPORTED';
        return reject(error);
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            timestamp: new Date(position.timestamp).toISOString(),
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: this.timeoutMs,
          maximumAge: 0,
        }
      );
    });
  }

  public async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'InspectIQ-Inspection-System/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocode HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.display_name) {
        // Construct clean, human-readable address from components if available
        const addr = data.address;
        if (addr) {
          const parts = [
            addr.amenity || addr.shop || addr.building || addr.road,
            addr.suburb || addr.neighbourhood || addr.locality,
            addr.city || addr.town || addr.county || addr.state_district,
            addr.state,
            addr.postcode,
          ].filter(Boolean);

          if (parts.length >= 2) {
            return parts.join(', ');
          }
        }
        return data.display_name;
      }
      return `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E`;
    } catch (err) {
      // Graceful network or timeout fallback without faking data
      return `Coordinates: ${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E (Address unresolved - please verify manually)`;
    }
  }
}

// Default singleton instance, easily replaceable
export let activeLocationService: ILocationService = new BrowserLocationService();

export const setLocationService = (service: ILocationService) => {
  activeLocationService = service;
};
