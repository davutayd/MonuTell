import { useState, useEffect, useCallback } from "react";

export const useLocation = () => {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  const isSafari =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("safari") &&
    !navigator.userAgent.toLowerCase().includes("chrome");

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
    if (isSafari || !navigator.geolocation) {
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
  }, [isSafari, startWatchingLocation]);

  return { position, accuracy, showBanner, handleAllowLocation };
};
