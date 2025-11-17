import React from "react";
import { useGlobalAudio } from "../../context/GlobalAudioContext";

import styles from "./MiniPlayer.module.css";

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
    <div className={styles.playerContainer}>
      <strong className={styles.trackTitle}>{currentTrack.title}</strong>

      <button onClick={handleToggle} className={styles.toggleButton}>
        {isPlaying ? "⏸️" : "▶️"}
      </button>
    </div>
  );
};

export default MiniPlayer;
