import React from "react";
import { useGlobalAudio } from "../../context/GlobalAudioContext";
import { useMonuments } from "../../hooks/useMonuments";

import styles from "./MiniPlayer.module.css";

const MiniPlayer = ({ isPanelOpen, onFocus, legendHeight = 0, language = "tr" }) => {
  const { currentTrack, isPlaying, togglePlay } = useGlobalAudio();
  const { monuments } = useMonuments();

  if (!currentTrack || isPanelOpen) {
    return null;
  }

  const handleToggle = (e) => {
    e.stopPropagation(); 
    togglePlay();
  };

  const handleContainerClick = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const dynamicBottom = isMobile
    ? (legendHeight > 0 ? (40 + legendHeight + 30) : 50)  
    : (legendHeight > 0 ? (10 + legendHeight + 10) : 40); 

  const activeMonument = monuments?.find(m => m.id === currentTrack?.id);
  const displayTitle = activeMonument
    ? (language === "tr" ? activeMonument.name_tr : 
       language === "hu" ? activeMonument.name_hu : 
       activeMonument.name_en)
    : currentTrack.title;

  return (
    <div
      className={styles.playerContainer}
      onClick={handleContainerClick}
      style={{ bottom: `calc(${dynamicBottom}px + env(safe-area-inset-bottom, 0px))` }}
    >
      <strong className={styles.trackTitle}>{displayTitle}</strong>

      <button onClick={handleToggle} className={styles.toggleButton}>
        {isPlaying ? "⏸️" : "▶️"}
      </button>
    </div>
  );
};

export default MiniPlayer;

