import React, { useRef, useState, useEffect } from "react";
import { useGlobalAudio } from "../../context/GlobalAudioContext";

const CustomProgressBar = ({ duration, currentTime, onChangeTime }) => {
  const progressBarRef = useRef(null);
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getNewTimeFromPosition = (clientX) => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return 0;
    const rect = bar.getBoundingClientRect();
    let relativeX = clientX - rect.left;
    relativeX = Math.max(0, Math.min(relativeX, rect.width));
    const clickPercentage = relativeX / rect.width;
    return Math.round(clickPercentage * duration);
  };

  const handleClick = (e) => {
    const newTime = getNewTimeFromPosition(e.clientX);
    onChangeTime(newTime);
  };

  return (
    <div
      ref={progressBarRef}
      onClick={handleClick}
      style={{
        position: "relative",
        height: 8,
        backgroundColor: "#e0e0e0",
        borderRadius: 4,
        cursor: "pointer",
        margin: "0 16px",
        flexGrow: 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: `${percentage}%`,
          backgroundColor: "#4a6fa5",
          borderRadius: 4,
          transition: "width 0.2s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${percentage}%`,
          transform: "translate(-50%, -50%)",
          width: 16,
          height: 16,
          backgroundColor: "#4a6fa5",
          borderRadius: "50%",
          cursor: "grab",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
};

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
    setLocalDuration(duration || 0);
  }, [duration]);

  useEffect(() => {
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
  }, [currentTime, duration, story, isPlaying]);

  const audioKey =
    langCode && langCode.toLowerCase().startsWith("tr") ? "tr" : "en";
  const audioUrl = monument?.audio?.[audioKey];

  const handlePlayPause = async () => {
    if (!audioUrl) {
      console.warn("Audio URL yok:", monument?.id, audioKey);
      return;
    }

    if (currentTrack?.url === audioUrl) {
      togglePlay();
      setIsSpeaking(!isPlaying);
    } else {
      const isTurkish = langCode && langCode.toLowerCase().startsWith("tr");

      const title =
        (isTurkish ? monument?.name_tr : monument?.name_en) ||
        monument?.name_en ||
        monument?.name_tr ||
        "MonuTell";

      playAudio(audioUrl, title, monument?.id || "");
      setIsSpeaking(true);
    }
  };

  const handleStop = () => {
    stopAudio();
    setIsSpeaking(false);
    setCurrentCharIndex(0);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    changeVolume(newVol);
  };

  const handleProgressBarChange = (newTime) => {
    const seekTime = Math.min(
      Math.max(newTime, 0),
      Math.floor(localDuration || 0)
    );
    seekTo(seekTime);
    setLocalCurrentTime(seekTime);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginBottom: 24,
        backgroundColor: "#fff",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <CustomProgressBar
        duration={localDuration}
        currentTime={localCurrentTime}
        onChangeTime={handleProgressBarChange}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={handlePlayPause}
          style={{
            backgroundColor: "#4a6fa5",
            border: "none",
            padding: "8px 12px",
            borderRadius: "8px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {!isSpeaking ? "▶️" : "⏸️"}
        </button>
        <button
          onClick={handleStop}
          style={{
            backgroundColor: "#4a6fa5",
            border: "none",
            padding: "8px 12px",
            borderRadius: "8px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ⏹️
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          style={{ width: 100, cursor: "pointer" }}
        />
        <span>{Math.round((volume || 0) * 100)}%</span>
      </div>
    </div>
  );
};

export default AudioControls;
