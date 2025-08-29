import React, { useEffect, useState, useRef } from "react";

const CustomProgressBar = ({ length, currentIndex, onChange }) => {
  const progressBarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newIndex = getNewIndexFromPosition(e.clientX);
      onChange(newIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

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
        userSelect: "none",
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
          transition: isDragging ? "none" : "width 0.2s ease",
        }}
      ></div>

      <div
        onMouseDown={handleMouseDown}
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
          transition: isDragging ? "none" : "left 0.2s ease",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      ></div>
    </div>
  );
};

const MonumentDetailScreen = ({ monument, language, setLanguage }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const langCode = language === "tr" ? "tr-TR" : "en-US";
  const title = language === "tr" ? monument.name_tr : monument.name_en;
  const story = language === "tr" ? monument.story_tr : monument.story_en;
  const volumeChangeTimeout = useRef(null);

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);

    if (isSpeaking) {
      // Önceki zamanlayıcıyı temizle
      if (volumeChangeTimeout.current) {
        clearTimeout(volumeChangeTimeout.current);
      }

      // 300ms sonra sesi yeni volume ile yeniden başlat
      volumeChangeTimeout.current = setTimeout(() => {
        synthRef.current.cancel();
        speakFrom(currentCharIndex); // aynı yerden devam et
      }, 300);
    }
  };
  useEffect(() => {
    if (isSpeaking) {
      speakFrom(currentCharIndex);
    }
    return () => {
      synthRef.current.cancel();
    };
  }, [isSpeaking]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCurrentCharIndex(0);
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
  };

  const speakFrom = (charIndex) => {
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(story.slice(charIndex));
    utterance.lang = langCode;
    utterance.rate = 0.8;
    utterance.volume = volume;
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        setCurrentCharIndex(charIndex + event.charIndex);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentCharIndex(story.length);
    };

    utteranceRef.current = utterance;
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

  const handleProgressBarChange = (newIndex) => {
    setCurrentCharIndex(newIndex);
    if (isSpeaking) {
      synthRef.current.cancel();
      setTimeout(() => {
        speakFrom(newIndex);
      }, 100);
    }
  };

  const renderStory = () => {
    const before = story.slice(0, currentCharIndex);
    const after = story.slice(currentCharIndex);
    const match = after.match(/^(\S+)/);
    const activeWord = match ? match[0] : "";
    const afterRest = after.slice(activeWord.length);

    return (
      <div
        style={{
          fontSize: "1.1rem",
          color: "#333",
          lineHeight: "1.8",
          whiteSpace: "pre-wrap",
          backgroundColor: "#fff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {before}
        <span
          style={{
            backgroundColor: "#ffecb3",
            padding: "2px 0",
            borderRadius: "3px",
            transition: "background-color 0.2s ease",
          }}
        >
          {activeWord}
        </span>
        {afterRest}
      </div>
    );
  };

  const styles = {
    
    container: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "0 16px",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      margin: "0 auto",
    },
    textContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: "0 16px ",
      maxWidth: "800px",
      boxSizing: "border-box",
    },
    imageContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "16px",
      width: "100%",
      maxWidth: "500px",
      boxSizing: "border-box",
    },
    image: {
      width: "100%",
      maxWidth: "500px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      objectFit: "cover",
      aspectRatio: "4/3",
    },
    title: {
      fontSize: "2.2rem",
      fontWeight: "700",
      color: "#2c3e50",
      marginBottom: "24px",
      lineHeight: "1.3",
    },
    controlsContainer: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "24px",
      flexDirection: "column",
      backgroundColor: "#fff",
      padding: "16px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      marginTop: "16px",
    },
    controlsRow: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "12px",
    },
    progressBarWrapper: {
      width: "100%",
    },
    controlButton: {
      backgroundColor: "#4a6fa5",
      border: "none",
      padding: "8px 12px",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "1rem",
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      minWidth: "48px",
      ":hover": {
        backgroundColor: "#3a5a80",
        transform: "translateY(-1px)",
      },
      ":active": {
        transform: "translateY(0)",
      },
    },

    languageSelector: {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: 10,
      display: "flex",
      gap: "12px",
      cursor: "pointer",
      userSelect: "none",
      backgroundColor: "#fff",
      padding: "8px",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    flag: {
      width: "32px",
      height: "20px",
      borderRadius: "4px",
      transition: "all 0.2s ease",
      objectFit: "cover",
      border: "1px solid #eee",
    },
    activeFlag: {
      transform: "scale(1.1)",
      boxShadow: "0 0 0 2px #4a6fa5",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.imageContainer}>
        {monument.image && (
          <img
            src={monument.image}
            alt={title}
            style={styles.image}
            loading="lazy"
          />
        )}
      </div>
      <div style={styles.textContainer}>
        <div style={styles.languageSelector}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/960px-Flag_of_Turkey.svg.png"
            alt="Türkçe"
            style={{
              ...styles.flag,
              ...(language === "tr" ? styles.activeFlag : {}),
              opacity: language === "tr" ? 1 : 0.7,
            }}
            onClick={() => handleLanguageChange("tr")}
          />

          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/250px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png"
            alt="English"
            style={{
              ...styles.flag,
              ...(language === "en" ? styles.activeFlag : {}),
              opacity: language === "en" ? 1 : 0.7,
            }}
            onClick={() => handleLanguageChange("en")}
          />
        </div>

        <h1 style={styles.title}>{title}</h1>

        <div style={styles.controlsContainer}>
          <div style={styles.progressBarWrapper}>
            <CustomProgressBar
              length={story.length}
              currentIndex={currentCharIndex}
              onChange={handleProgressBarChange}
            />
          </div>
          <div style={styles.controlsRow}>
            <button
              onClick={handlePlayPause}
              style={styles.controlButton}
              aria-label={isSpeaking ? "Pause" : "Play"}
            >
              {isSpeaking ? "⏸️" : "▶️"}
            </button>

            <button
              onClick={handleStop}
              style={styles.controlButton}
              aria-label="Stop"
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
              style={{
                width: 100,
                cursor: "pointer",
                accentColor: "#4a6fa5",
              }}
              aria-label="Ses seviyesi"
            />

            <span style={{ minWidth: 24, textAlign: "center", color: "#555" }}>
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {renderStory()}
      </div>
    </div>
  );
};

export default MonumentDetailScreen;
