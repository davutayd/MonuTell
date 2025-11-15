import React, { useState, useEffect } from "react";
import MapScreen from "./components/Map/MapScreen";
import MonumentDetailScreen from "./components/Detail/MonumentDetailScreen";
import { useGlobalAudio } from "./context/GlobalAudioContext";
import MiniPlayer from "./components/Player/MiniPlayer";

function AppContent() {
  const [selectedMonument, setSelectedMonument] = useState(null);
  const [language, setLanguage] = useState("tr");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 1. Context'ten 'isPlaying' ve 'pauseAudio'yu al
  const {
    currentTrack,
    isPlaying,
    stopAudio, // (Bunu dil değişimi için tutuyoruz)
    pauseAudio,
    playAudio,
  } = useGlobalAudio();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. GÜNCELLENMİŞ 'handleSelectMonument'
  const handleSelectMonument = (monument) => {
    // 1. SORUN ÇÖZÜMÜ:
    // Eğer tıklanan heykel, zaten MiniPlayer'da çalan heykelse,
    // Sadece paneli aç, sesi duraklatma.
    if (currentTrack?.id === monument.id) {
      setSelectedMonument(monument);
      setIsPanelOpen(true);
      return;
    }

    // Eğer tıklanan heykel, zaten açık olan paneldeki heykelse,
    // Hiçbir şey yapma.
    if (selectedMonument?.id === monument.id) {
      setIsPanelOpen(true);
      return;
    }

    // 2. SORUN ÇÖZÜMÜ (Başlangıç):
    // Eğer bu koşullara takılmadıysak, YENİ bir heykel seçilmiştir.
    // Çalan bir ses varsa, zamanı sıfırlamadan DURAKLAT.
    if (isPlaying) {
      pauseAudio();
    }

    // Yeni heykeli seç ve paneli aç.
    setSelectedMonument(monument);
    setIsPanelOpen(true);
  };

  // 3. GÜNCELLENMİŞ 'handleClosePanel'
  const handleClosePanel = () => {
    setIsPanelOpen(false);

    // 2. SORUN ÇÖZÜMÜ (Bitiş):
    // Panel kapandığında, context'te "duraklatılmış" (ama sıfırlanmamış)
    // bir parça var mı diye kontrol et.
    // (currentTrack var AMA isPlaying false)
    if (currentTrack && !isPlaying) {
      // Önceki parçayı kaldığı yerden devam ettir (MiniPlayer'da görünecek)
      playAudio(currentTrack.url, currentTrack.title, currentTrack.id);
    }

    // Animasyon için gecikme (Bu doğru)
    setTimeout(() => {
      setSelectedMonument(null);
    }, 300);
  };

  // ... (panelStyle stil nesnesi aynı)
  const panelStyle = {
    width: isMobile ? "100%" : isPanelOpen ? "420px" : "0px",
    height: isMobile ? (isPanelOpen ? "60%" : "0px") : "100vh",
    opacity: isPanelOpen ? 1 : 0,
    pointerEvents: isPanelOpen ? "auto" : "none",
    transition: "all 0.3s ease",
    boxShadow: isPanelOpen
      ? isMobile
        ? "0px -2px 6px rgba(0,0,0,0.1)"
        : "2px 0 6px rgba(0,0,0,0.1)"
      : "none",
    overflow: "hidden",
    backgroundColor: "#f8f9fa",
    position: isMobile ? "absolute" : "relative",
    bottom: isMobile ? 0 : "auto",
    zIndex: 999,
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={panelStyle}>
        {isPanelOpen && (
          <button
            onClick={handleClosePanel}
            style={{
              position: "absolute",
              top: 10,
              right: isMobile ? 14 : 20,
              background: "#4a7e5e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 10px",
              cursor: "pointer",
              zIndex: 1000,
            }}
          >
            ✕
          </button>
        )}

        {selectedMonument && (
          <div
            className="side-panel-scroll"
            style={{
              padding: "20px",
              opacity: isPanelOpen ? 1 : 0,
              transition: "opacity 0.3s ease",
              flexGrow: 1,
              overflowY: "auto",
            }}
          >
            <MonumentDetailScreen
              monument={selectedMonument}
              language={language}
              setLanguage={setLanguage}
            />
          </div>
        )}
      </div>

      <div style={{ flexGrow: 1, position: "relative" }}>
        <MapScreen
          language={language}
          onSelectMonument={handleSelectMonument}
          isPanelOpen={isPanelOpen}
          isMobile={isMobile}
        />
      </div>

      <MiniPlayer isPanelOpen={isPanelOpen} />
    </div>
  );
}

export default AppContent;
