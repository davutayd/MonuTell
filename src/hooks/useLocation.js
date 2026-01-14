import { useState, useEffect, useCallback } from "react";

export const useLocation = () => {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  // Detect Mobile Safari specifically (iOS Safari only, not desktop Safari or Chrome/Android)
  const isMobileSafari =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    navigator.userAgent.includes("Safari") &&
    !navigator.userAgent.includes("CriOS") && // Not Chrome on iOS
    !navigator.userAgent.includes("FxiOS"); // Not Firefox on iOS

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
      },
      (err) => console.error("Konum izleme hatası:", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleAllowLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        setShowBanner(false);
        startWatchingLocation();
      },
      () => setShowBanner(true),
      { enableHighAccuracy: true, timeout: 20000 }
    );
  }, [startWatchingLocation]);

  useEffect(() => {
    if (isMobileSafari || !navigator.geolocation) {
      setShowBanner(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        startWatchingLocation();
      },
      () => setShowBanner(true),
      { enableHighAccuracy: true, timeout: 20000 }
    );
  }, [isMobileSafari, startWatchingLocation]);

  return { position, accuracy, showBanner, handleAllowLocation };
};
