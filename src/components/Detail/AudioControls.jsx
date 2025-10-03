import React, { useRef, useState, useEffect } from "react";

const CustomProgressBar = ({ length, currentIndex, onChange }) => {
  const progressBarRef = useRef(null);

  const getNewIndexFromPosition = (clientX) => {
    const bar = progressBarRef.current;
    if (!bar) return currentIndex;

    const rect = bar.getBoundingClientRect();
    let relativeX = clientX - rect.left;
    relativeX = Math.max(0, Math.min(relativeX, rect.width));
    const percentage = relativeX / rect.width;

    return Math.round(percentage * (length - 1));
  };

  const handleClick = (e) => {
    const newIndex = getNewIndexFromPosition(e.clientX);
    onChange(newIndex);
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
          width: `${(currentIndex / (length - 1)) * 100}%`,
          backgroundColor: "#4a6fa5",
          borderRadius: 4,
          transition: "width 0.2s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${(currentIndex / (length - 1)) * 100}%`,
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
  voices,
  langCode,
}) => {
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioKey = langCode.startsWith("tr") ? "tr" : "en";

  useEffect(() => {
    if (!monument?.audio) return;
    const audioKey = langCode.startsWith("tr") ? "tr" : "en";
    const url = monument.audio[audioKey];
    if (!url) return;

    const audio = new Audio(url);
    audioRef.current = audio;
    audio.volume = volume;

    const words = story.split(/\s+/);
    const totalWords = words.length;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      if (!audio.duration) return;
      const progress = audio.currentTime / audio.duration;
      const wordIndex = Math.floor(progress * totalWords);
      setCurrentCharIndex(wordIndex); // kelime bazlı
    };

    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsSpeaking(false);
      setCurrentTime(0);
      setCurrentCharIndex(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    setIsSpeaking(false);
    setCurrentTime(0);
    setCurrentCharIndex(0);

    try {
      audio.load();
    } catch {}

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [monument, langCode, story]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = typeof volume === "number" ? volume : 1;
    }
  }, [volume]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (!audio.paused) {
      audio.pause();
      setIsSpeaking(false);
      return;
    }

    try {
      const playPromise = audio.play();
      if (playPromise !== undefined) await playPromise;
      setIsSpeaking(true);
    } catch (err) {
      console.error("Audio play error:", err);
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsSpeaking(false);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  const handleProgressBarChange = (newIndex) => {
    if (!audioRef.current) return;
    const seekTime = Math.min(Math.max(newIndex, 0), Math.floor(duration || 0));
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    if (!audioRef.current.paused) audioRef.current.play().catch(() => {});
  };

  const progressLength = Math.max(2, Math.ceil(duration || 2));
  const progressIndex = Math.min(
    Math.floor(currentTime || 0),
    progressLength - 1
  );

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
        length={progressLength}
        currentIndex={progressIndex}
        onChange={handleProgressBarChange}
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
