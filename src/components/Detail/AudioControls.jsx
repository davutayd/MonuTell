import React, { useRef } from "react";

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
  const synthRef = useRef(window.speechSynthesis);

  const speakFrom = (charIndex) => {
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(story.slice(charIndex));
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.volume = volume;

    const selectedVoice = voices.find((v) => v.lang === langCode);
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        setCurrentCharIndex(charIndex + event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentCharIndex(story.length);
    };

    synthRef.current.speak(utterance);
  };

  const handlePlayPause = () => {
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    } else {
      speakFrom(currentCharIndex);
      setIsSpeaking(true);
    }
  };

  const handleStop = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
    setCurrentCharIndex(0);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
  };

  const handleProgressBarChange = (newIndex) => {
    setCurrentCharIndex(newIndex);
    if (isSpeaking) {
      synthRef.current.cancel();
      setTimeout(() => speakFrom(newIndex), 100);
    }
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
        length={story.length}
        currentIndex={currentCharIndex}
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
          {isSpeaking ? "⏸️" : "▶️"}
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
        <span>{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
};

export default AudioControls;
