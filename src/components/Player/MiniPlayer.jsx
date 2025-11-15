// src/components/Player/MiniPlayer.jsx (TAMAMEN GÜNCELLENMİŞ)

import React from "react";
import { useGlobalAudio } from "../../context/GlobalAudioContext";

// 1. 'isPanelOpen' prop'unu al
const MiniPlayer = ({ isPanelOpen }) => {
  // 2. Context'ten DOĞRU değişken adlarını çek
  const { currentTrack, isPlaying, togglePlay } = useGlobalAudio();

  // 3. Render mantığını güncelle:
  //    Eğer çalan bir parça yoksa VEYA ana panel zaten açıksa,
  //    bu mini oynatıcıyı GÖSTERME (null döndür).
  if (!currentTrack || isPanelOpen) {
    return null;
  }

  // 4. onClick'i 'togglePlay' kullanacak şekilde düzelt
  const handleToggle = (e) => {
    e.stopPropagation(); // Haritaya tıklamayı engelle
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
        zIndex: 9999, // Yüksek z-index
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
        {/* 5. 'currentAudio.title' yerine 'currentTrack.title' kullan */}
        {currentTrack.title}
      </strong>

      <button
        onClick={handleToggle} // 6. 'togglePlay' kullan
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
