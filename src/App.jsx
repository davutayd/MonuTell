import React, { useState, useEffect } from "react";
import MapScreen from "./components/Map/MapScreen";
import MonumentDetailScreen from "./components/Detail/MonumentDetailScreen";

function App() {
  const [selectedMonument, setSelectedMonument] = useState(null);
  const [language, setLanguage] = useState("tr");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectMonument = (monument) => {
    setSelectedMonument(monument);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      setSelectedMonument(null);
    }, 300);
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
      {/* Side/Bottom Panel */}
      <div
        style={{
          width: isMobile ? "100%" : isPanelOpen ? "420px" : "0px",
          height: isMobile ? (isPanelOpen ? "60%" : "0px") : "100vh",
          opacity: isPanelOpen ? 1 : 0,
          transition: "all 0.3s ease",
          overflow: "hidden",
          backgroundColor: "#f8f9fa",
          boxShadow: isPanelOpen
            ? isMobile
              ? "0px -2px 6px rgba(0,0,0,0.1)"
              : "2px 0 6px rgba(0,0,0,0.1)"
            : "none",
          position: isMobile ? "absolute" : "relative",
          bottom: isMobile ? 0 : "auto",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close Button */}
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

        {/* Content */}
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
              onBack={handleClosePanel}
            />
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flexGrow: 1, position: "relative" }}>
        <MapScreen
          language={language}
          onSelectMonument={handleSelectMonument}
          isPanelOpen={isPanelOpen}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

export default App;
