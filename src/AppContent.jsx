import React, { useState, useEffect, useRef } from "react";
import MapScreen from "./components/Map/MapScreen";
import MonumentDetailScreen from "./components/Detail/MonumentDetailScreen";
import { useGlobalAudio } from "./context/GlobalAudioContext";
import { useMonuments } from "./hooks/useMonuments";
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

const getStoredVisitedIds = () => {
  try {
    const stored = localStorage.getItem("visitedMonumentIds");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

function AppContent() {
  const [selectedMonument, setSelectedMonument] = useState(null);
  const [language, setLanguage] = useState(getInitialLanguage());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [pausedBySystem, setPausedBySystem] = useState(false);

  const [mobilePanelSize, setMobilePanelSize] = useState("peek");

  const [visitedIds, setVisitedIds] = useState(getStoredVisitedIds);

  const [legendHeight, setLegendHeight] = useState(0);

  const [flyToMonumentId, setFlyToMonumentId] = useState(null);
  const [flyToTrigger, setFlyToTrigger] = useState(0);

  const prevLanguageRef = useRef(language);

  const { currentTrack, isPlaying, stopAudio, pauseAudio, playAudio } =
    useGlobalAudio();
  
  const { monuments } = useMonuments();

  const toggleVisited = (id) => {
    setVisitedIds((prev) => {
      const newIds = prev.includes(id)
        ? prev.filter((visitedId) => visitedId !== id)
        : [...prev, id];
      localStorage.setItem("visitedMonumentIds", JSON.stringify(newIds));
      return newIds;
    });
  };

  useEffect(() => {
    localStorage.setItem("monutell_language", language);
    
    if (prevLanguageRef.current !== language) {
      stopAudio();
      prevLanguageRef.current = language;
    }
  }, [language, stopAudio]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectMonument = (monument, shouldZoom = false) => {
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
    
    if (shouldZoom) {
      setFlyToMonumentId(monument.id);
      setFlyToTrigger(prev => prev + 1);
    }
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    if (currentTrack && !isPlaying && pausedBySystem) {
      playAudio(currentTrack.url, currentTrack.title, currentTrack.id);
    }
    setPausedBySystem(false);
    
    if (currentTrack && currentTrack.id && monuments) {
      const playingMonument = monuments.find(m => m.id === currentTrack.id);
      if (playingMonument) {
        setSelectedMonument(playingMonument);
        return; 
      }
    }
    setSelectedMonument(null);
  };

  const handleMiniPlayerFocus = () => {
    if (currentTrack?.id) {
      setFlyToMonumentId(currentTrack.id);
      setFlyToTrigger(prev => prev + 1);
    }
  };

  const handleLegendToggle = (height) => {
    setLegendHeight(height);
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
              visitedIds={visitedIds}
              toggleVisited={toggleVisited}
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
          mobilePanelSize={mobilePanelSize}
          panelHeight={
            isMobile && isPanelOpen
              ? mobilePanelSize === "peek"
                ? 170
                : window.innerHeight * 0.55
              : 0
          }
          visitedIds={visitedIds}
          onLegendToggle={handleLegendToggle}
          flyToMonumentId={flyToMonumentId}
          flyToTrigger={flyToTrigger}
          selectedMonumentId={selectedMonument?.id}
        />
      </div>

      <MiniPlayer
        isPanelOpen={isPanelOpen}
        onFocus={handleMiniPlayerFocus}
        legendHeight={legendHeight}
        language={language}
      />
    </div>
  );
}

export default AppContent;
