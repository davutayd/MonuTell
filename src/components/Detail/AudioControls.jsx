import React, { useState, useEffect } from "react";
import { useGlobalAudio } from "../../context/GlobalAudioContext";
import CustomProgressBar from "./CustomProgressBar";
import styles from "./AudioControls.module.css";

const AudioControls = ({
  monument,
  story,
  currentCharIndex,
  setCurrentCharIndex,
  isSpeaking,
  setIsSpeaking,
  volume,
  setVolume,
  langCode,
  setPausedBySystem,
}) => {
  const {
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    playAudio,
    togglePlay,
    stopAudio,
    seekTo,
    changeVolume,
  } = useGlobalAudio();

  const [localDuration, setLocalDuration] = useState(0);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);

  useEffect(() => {
    if (currentTrack?.id !== monument?.id) {
      setLocalDuration(0);
      setLocalCurrentTime(0);
      setCurrentCharIndex(0);
      setIsSpeaking(false);
      return;
    }
    setLocalDuration(duration || 0);
    setLocalCurrentTime(currentTime || 0);
    if (story) {
      const words = story.split(/\s+/);
      const totalWords = Math.max(1, words.length);
      const wordIndex =
        localDuration > 0
          ? Math.floor(((currentTime || 0) / localDuration) * totalWords)
          : 0;
      setCurrentCharIndex(Math.min(totalWords - 1, Math.max(0, wordIndex)));
    }
    setIsSpeaking(Boolean(isPlaying));
  }, [
    currentTime,
    duration,
    story,
    isPlaying,
    currentTrack,
    monument,
    setCurrentCharIndex,
    setIsSpeaking,
  ]);

  const isTurkish = langCode && langCode.toLowerCase().startsWith("tr");
  const isHungarian = langCode && langCode.toLowerCase().startsWith("hu");

  let audioUrl = null;
  let trackTitle = "";

  if (isTurkish) {
    audioUrl = monument?.audio_tr;
    trackTitle = monument?.name_tr;
  } else if (isHungarian) {
    audioUrl = monument?.audio_hu;
    trackTitle = monument?.name_hu;
  } else {
    audioUrl = monument?.audio_en;
    trackTitle = monument?.name_en;
  }

  if (!audioUrl && monument?.audio) {
    if (isTurkish) audioUrl = monument.audio.tr || monument.audio["tr-TR"];
    else if (isHungarian)
      audioUrl = monument.audio.hu || monument.audio["hu-HU"];
    else audioUrl = monument.audio.en || monument.audio["en-US"];
  }

  const handlePlayPause = async () => {
    if (!audioUrl) {
      console.warn("❌ Ses dosyası bulunamadı. Dil:", langCode);
      return;
    }

    if (currentTrack?.url === audioUrl) {
      togglePlay();
      if (isPlaying) {
        setPausedBySystem(false);
      }
    } else {
      playAudio(audioUrl, trackTitle || "MonuTell Story", monument?.id || "");
      setPausedBySystem(false);
    }
  };

  const handleStop = () => {
    stopAudio();
    setIsSpeaking(false);
    setCurrentCharIndex(0);
    setPausedBySystem(false);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    changeVolume(newVol);
  };

  const handleProgressBarChange = (newTime) => {
    if (currentTrack?.id !== monument?.id) return;
    const seekTime = Math.min(
      Math.max(newTime, 0),
      Math.floor(localDuration || 0)
    );
    seekTo(seekTime);
    setLocalCurrentTime(seekTime);
  };

  return (
    <div className={styles.controlsContainer}>
      <CustomProgressBar
        duration={localDuration}
        currentTime={localCurrentTime}
        onChangeTime={handleProgressBarChange}
      />

      <div className={styles.buttonsContainer}>
        <button
          onClick={handlePlayPause}
          className={styles.controlButton}
          style={{ cursor: "pointer" }}
        >
          {!isSpeaking ? "▶️" : "⏸️"}
        </button>
        <button onClick={handleStop} className={styles.controlButton}>
          ⏹️
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className={styles.volumeSlider}
        />
        <span style={{ fontSize: "12px", minWidth: "35px" }}>
          {Math.round((volume || 0) * 100)}%
        </span>
      </div>
    </div>
  );
};

export default AudioControls;
