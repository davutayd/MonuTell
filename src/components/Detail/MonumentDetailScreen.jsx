import React, { useEffect, useState } from "react";
import AudioControls from "./AudioControls";
import { useGlobalAudio } from "../../context/GlobalAudioContext";

const MonumentDetailScreen = ({ monument, language, setLanguage }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const { playAudio } = useGlobalAudio();

  const langCode = language === "tr" ? "tr-TR" : "en-US";
  const title = language === "tr" ? monument.name_tr : monument.name_en;
  const story = language === "tr" ? monument.story_tr : monument.story_en;

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCurrentCharIndex(0);
    setIsSpeaking(false);
  };

  const renderStory = () => {
    const words = story.split(/\s+/);
    return (
      <div
        style={{
          fontSize: "1.1rem",
          lineHeight: "1.8",
          whiteSpace: "pre-wrap",
          color: "#333",
          backgroundColor: "#fff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {words.map((word, index) => (
          <span
            key={index}
            style={{
              backgroundColor:
                index === currentCharIndex ? "#ffecb3" : "transparent",
              padding: "2px 0",
              borderRadius: "3px",
            }}
          >
            {word + " "}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        color: "#333",
        padding: "0 16px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      }}
    >
      <div style={{ padding: "16px", maxWidth: "500px" }}>
        {monument.image && (
          <img
            src={monument.image}
            alt={title}
            style={{
              width: "100%",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              objectFit: "cover",
              aspectRatio: "4/3",
            }}
            loading="lazy"
          />
        )}
      </div>

      <div style={{ flex: 1, maxWidth: "800px", padding: "0 16px" }}>
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            display: "flex",
            gap: "12px",
            backgroundColor: "#fff",
            padding: "8px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg"
            alt="Türkçe"
            style={{
              width: 32,
              height: 20,
              borderRadius: 4,
              cursor: "pointer",
              opacity: language === "tr" ? 1 : 0.6,
              boxShadow: language === "tr" ? "0 0 0 2px #4a6fa5" : "none",
            }}
            onClick={() => handleLanguageChange("tr")}
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_United_States.svg"
            alt="English"
            style={{
              width: 32,
              height: 20,
              borderRadius: 4,
              cursor: "pointer",
              opacity: language === "en" ? 1 : 0.6,
              boxShadow: language === "en" ? "0 0 0 2px #4a6fa5" : "none",
            }}
            onClick={() => handleLanguageChange("en")}
          />
        </div>

        <h1 style={{ fontSize: "2.2rem", fontWeight: "700", marginBottom: 24 }}>
          {title}
        </h1>

        <AudioControls
          monument={monument}
          story={story}
          currentCharIndex={currentCharIndex}
          setCurrentCharIndex={setCurrentCharIndex}
          isSpeaking={isSpeaking}
          setIsSpeaking={setIsSpeaking}
          volume={volume}
          setVolume={setVolume}
          langCode={langCode}
        />

        {renderStory()}
      </div>
    </div>
  );
};

export default MonumentDetailScreen;
