import { useState, useEffect } from 'react';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
  manualLocation: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
    manualLocation: '',
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Location access is disabled. Enter your location manually to find nearby services.'
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        }));
      },
      (err) => {
        let msg = 'Location access is disabled. Enter your location manually to find nearby services.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Enter your location manually to find nearby services.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Enter your location manually to find nearby services.';
        }
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: msg,
        }));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  const setManualLocation = (manualLocation: string) => {
    setLocation(prev => ({ ...prev, manualLocation }));
  };

  return {
    ...location,
    requestLocation,
    setManualLocation,
  };
}
