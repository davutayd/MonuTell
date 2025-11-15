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

  // 1. YENİ STATE: Sesin sistem tarafından mı (true) yoksa kullanıcı tarafından mı (false) duraklatıldığını takip et
  const [pausedBySystem, setPausedBySystem] = useState(false);

  const { currentTrack, isPlaying, stopAudio, pauseAudio, playAudio } =
    useGlobalAudio();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. GÜNCELLENMİŞ 'handleSelectMonument'
  const handleSelectMonument = (monument) => {
    if (
      currentTrack?.id === monument.id ||
      selectedMonument?.id === monument.id
    ) {
      // Zaten seçili olan heykele tıklanırsa (veya panel zaten açıksa)
      // Sadece paneli aç ve 'pausedBySystem' bayrağını temizle
      setPausedBySystem(false);
      setSelectedMonument(monument);
      setIsPanelOpen(true);
      return;
    }

    // Yeni bir heykel seçildi:
    if (isPlaying) {
      pauseAudio();
      setPausedBySystem(true); // Ses SİSTEM tarafından duraklatıldı
    } else {
      setPausedBySystem(false); // Ses zaten kullanıcı tarafından duraklatılmıştı
    }

    setSelectedMonument(monument);
    setIsPanelOpen(true);
  };

  // 3. GÜNCELLENMİŞ 'handleClosePanel'
  const handleClosePanel = () => {
    setIsPanelOpen(false);

    // SORUN 1 ÇÖZÜMÜ:
    // Sadece 'pausedBySystem' true ise (yani biz duraklattıysak) sesi devam ettir.
    // Kullanıcı kendi durdurduysa (pausedBySystem: false) devam ETME.
    if (currentTrack && !isPlaying && pausedBySystem) {
      playAudio(currentTrack.url, currentTrack.title, currentTrack.id);
    }
    // Bayrağı her zaman temizle
    setPausedBySystem(false);

    setTimeout(() => {
      setSelectedMonument(null);
    }, 300);
  };

  const panelStyle = {
    // ... (stil kodunuzda değişiklik yok)
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
              // 4. YENİ PROP: 'setPausedBySystem' fonksiyonunu aşağıya ilet
              setPausedBySystem={setPausedBySystem}
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
