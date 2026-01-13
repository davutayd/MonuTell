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

  const [mobilePanelSize, setMobilePanelSize] = useState("peek");

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
    if (selectedMonument?.id === monument.id) {
      if (isMobile) {
        setMobilePanelSize((prev) => (prev === "peek" ? "medium" : "peek"));
        setIsPanelOpen(true);
      }
      return;
    }

    if (currentTrack?.id === monument.id) {
      setPausedBySystem(false);
    } else {
      if (isPlaying) {
        pauseAudio();
        setPausedBySystem(true);
      } else {
        setPausedBySystem(false);
      }
    }

    setSelectedMonument(monument);
    setMobilePanelSize("peek");
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

  const mobileHeight = mobilePanelSize === "peek" ? "170px" : "55vh";

  const panelDynamicStyle = {
    width: isMobile ? "100%" : isPanelOpen ? "420px" : "0px",
    height: isMobile ? (isPanelOpen ? mobileHeight : "0px") : "100vh",

    opacity: isPanelOpen ? 1 : 0,
    pointerEvents: isPanelOpen ? "auto" : "none",
    boxShadow: isPanelOpen
      ? isMobile
        ? "0px -4px 10px rgba(0,0,0,0.15)"
        : "2px 0 6px rgba(0,0,0,0.1)"
      : "none",
    position: isMobile ? "absolute" : "relative",
    bottom: isMobile ? 0 : "auto",
    transition: "height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), width 0.3s ease",
    borderTopLeftRadius: isMobile ? "20px" : "0",
    borderTopRightRadius: isMobile ? "20px" : "0",
    overflow: "hidden",
  };

  const closeButtonDynamicStyle = {
    top: isMobile ? 15 : 10,
    right: isMobile ? 15 : 20,
    zIndex: 50,
  };

  const scrollPanelDynamicStyle = {
    opacity: isPanelOpen ? 1 : 0,
    height: "100%",
    overflowY: isMobile && mobilePanelSize === "peek" ? "hidden" : "auto",
    paddingTop: isMobile ? "30px" : "0",
  };

  return (
    <div className={styles.appContainer} style={appContainerDynamicStyle}>
      <div className={styles.detailPanel} style={panelDynamicStyle}>
        {isMobile && isPanelOpen && (
          <div
            onClick={() =>
              setMobilePanelSize((prev) =>
                prev === "peek" ? "medium" : "peek"
              )
            }
            style={{
              width: "100%",
              height: "30px",
              position: "absolute",
              top: 0,
              left: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              zIndex: 40,
              background: "#fff",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "5px",
                borderRadius: "10px",
                backgroundColor: "#e0e0e0",
              }}
            ></div>
          </div>
        )}

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
          panelHeight={
            isMobile && isPanelOpen
              ? mobilePanelSize === "peek"
                ? 170
                : window.innerHeight * 0.55
              : 0
          }
        />
      </div>

      <MiniPlayer isPanelOpen={isPanelOpen} />
    </div>
  );
}

export default AppContent;
