import React, { useState, useEffect } from "react";
import MapScreen from "./components/Map/MapScreen";
import MonumentDetailScreen from "./components/Detail/MonumentDetailScreen";
import { useGlobalAudio } from "./context/GlobalAudioContext";
import MiniPlayer from "./components/Player/MiniPlayer";
import styles from "./AppContent.module.css";

const getInitialLanguage = () => {
  const savedLang = localStorage.getItem("monutell_language");
  if (savedLang === "tr" || savedLang === "en" || savedLang === "hu") {
    return savedLang;
  }

  const browserLangCode = (navigator.language || navigator.userLanguage).split(
    "-"
  )[0];

  if (browserLangCode === "tr") return "tr";
  if (browserLangCode === "hu") return "hu";

  return "en";
};

function AppContent() {
  const [selectedMonument, setSelectedMonument] = useState(null);
  const [language, setLanguage] = useState(getInitialLanguage());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [pausedBySystem, setPausedBySystem] = useState(false);

  const { currentTrack, isPlaying, stopAudio, pauseAudio, playAudio } =
    useGlobalAudio();

  useEffect(() => {
    localStorage.setItem("monutell_language", language);
  }, [language]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectMonument = (monument) => {
    if (
      currentTrack?.id === monument.id ||
      selectedMonument?.id === monument.id
    ) {
      setPausedBySystem(false);
      setSelectedMonument(monument);
      setIsPanelOpen(true);
      return;
    }
    if (isPlaying) {
      pauseAudio();
      setPausedBySystem(true);
    } else {
      setPausedBySystem(false);
    }
    setSelectedMonument(monument);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    if (currentTrack && !isPlaying && pausedBySystem) {
      playAudio(currentTrack.url, currentTrack.title, currentTrack.id);
    }
    setPausedBySystem(false);
    setTimeout(() => {
      setSelectedMonument(null);
    }, 300);
  };

  const appContainerDynamicStyle = {
    flexDirection: isMobile ? "column" : "row",
  };

  const panelDynamicStyle = {
    width: isMobile ? "100%" : isPanelOpen ? "420px" : "0px",
    height: isMobile ? (isPanelOpen ? "60%" : "0px") : "100vh",
    opacity: isPanelOpen ? 1 : 0,
    pointerEvents: isPanelOpen ? "auto" : "none",
    boxShadow: isPanelOpen
      ? isMobile
        ? "0px -2px 6px rgba(0,0,0,0.1)"
        : "2px 0 6px rgba(0,0,0,0.1)"
      : "none",
    position: isMobile ? "absolute" : "relative",
    bottom: isMobile ? 0 : "auto",
  };

  const closeButtonDynamicStyle = {
    top: 10,
    right: isMobile ? 14 : 20,
  };

  const scrollPanelDynamicStyle = {
    opacity: isPanelOpen ? 1 : 0,
  };

  return (
    <div className={styles.appContainer} style={appContainerDynamicStyle}>
      <div className={styles.detailPanel} style={panelDynamicStyle}>
        {isPanelOpen && (
          <button
            onClick={handleClosePanel}
            className={styles.closeButton}
            style={closeButtonDynamicStyle}
          >
            ✕
          </button>
        )}

        {selectedMonument && (
          <div className={styles.scrollPanel} style={scrollPanelDynamicStyle}>
            <MonumentDetailScreen
              monument={selectedMonument}
              language={language}
              setLanguage={setLanguage}
              setPausedBySystem={setPausedBySystem}
            />
          </div>
        )}
      </div>
      <div className={styles.mapContainer}>
        <MapScreen
          language={language}
          onSelectMonument={handleSelectMonument}
          setLanguage={setLanguage}
          onClosePanel={handleClosePanel}
          isPanelOpen={isPanelOpen}
          isMobile={isMobile}
        />
      </div>
      <MiniPlayer isPanelOpen={isPanelOpen} />
    </div>
  );
}

export default AppContent;
