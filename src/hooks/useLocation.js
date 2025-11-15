// src/hooks/useLocation.js

import { useState, useEffect, useCallback } from "react";

export const useLocation = () => {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  // Safari'yi kontrol et
  const isSafari =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("safari") &&
    !navigator.userAgent.toLowerCase().includes("chrome");

  // Konumu izlemeyi başlatan fonksiyon
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

  // Kullanıcı "İzin Ver" butonuna bastığındaki fonksiyon
  const handleAllowLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        setShowBanner(false);
        startWatchingLocation(); // İzlemeyi başlat
      },
      () => setShowBanner(true), // İzin alamazsa banner'ı göster
      { enableHighAccuracy: true, timeout: 20000 }
    );
  }, [startWatchingLocation]);

  // Bileşen yüklendiğinde konumu almak için ilk deneme
  useEffect(() => {
    // Safari'de, kullanıcı etkileşimi (buton tıklaması) olmadan
    // konum istemek genellikle başarısız olur, bu yüzden banner göster.
    if (isSafari || !navigator.geolocation) {
      setShowBanner(true);
      return;
    }

    // Diğer tarayıcılar için
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        startWatchingLocation(); // İlk konum başarılıysa izlemeye başla
      },
      () => setShowBanner(true), // İlk deneme başarısızsa banner göster
      { enableHighAccuracy: true, timeout: 20000 }
    );
  }, [isSafari, startWatchingLocation]);

  // Hook'un dış dünyaya sağladığı değerler
  return { position, accuracy, showBanner, handleAllowLocation };
};
