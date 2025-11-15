import React from "react";
import { useGlobalAudio } from "../../context/GlobalAudioContext";

const MiniPlayer = ({ isPanelOpen }) => {
  const { currentTrack, isPlaying, togglePlay } = useGlobalAudio();

  if (!currentTrack || isPanelOpen) {
    return null;
  }

  const handleToggle = (e) => {
    e.stopPropagation();
    togglePlay();
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#fff",
        padding: "12px 20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 9999,
        minWidth: "260px",
      }}
    >
      <strong
        style={{
          fontSize: "1rem",
          color: "#333",
          flexGrow: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {currentTrack.title}
      </strong>

      <button
        onClick={handleToggle}
        style={{
          backgroundColor: "#4a6fa5",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "6px 12px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        {isPlaying ? "⏸️" : "▶️"}
      </button>
    </div>
  );
};

export default MiniPlayer;
