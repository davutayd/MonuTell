import React, { useEffect, useState } from "react";
import AudioControls from "./AudioControls";
import { useGlobalAudio } from "../../context/GlobalAudioContext";
import styles from "./MonumentDetailScreen.module.css";

const MonumentDetailScreen = ({
  monument,
  language,
  setLanguage,
  setPausedBySystem,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const { stopAudio } = useGlobalAudio();
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const langCode =
    language === "tr" ? "tr-TR" : language === "hu" ? "hu-HU" : "en-US";

  const title =
    language === "tr"
      ? monument.name_tr
      : language === "hu"
      ? monument.name_hu
      : monument.name_en;

  const story =
    language === "tr"
      ? monument.story_tr
      : language === "hu"
      ? monument.story_hu
      : monument.story_en;

  const displayImage = monument.image_url || monument.image;

  useEffect(() => {
    setImageLoadFailed(false);
  }, [monument]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCurrentCharIndex(0);
    setIsSpeaking(false);
    stopAudio();
    setPausedBySystem(false);
  };

  const renderStory = () => {
    if (!story) return null;

    const words = story.split(/\s+/);
    return (
      <div className={styles.storyContainer}>
        {words.map((word, index) => (
          <span
            key={index}
            className={
              index === currentCharIndex
                ? styles.highlightedWord
                : styles.normalWord
            }
          >
            {word + " "}
          </span>
        ))}
      </div>
    );
  };

  const getFlagStyle = (targetLang) => ({
    opacity: language === targetLang ? 1 : 0.6,
    boxShadow: language === targetLang ? "0 0 0 2px #4a6fa5" : "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
  });

  return (
    <div className={styles.screenContainer}>
      {displayImage && !imageLoadFailed && (
        <div className={styles.imageWrapper}>
          <img
            src={displayImage}
            alt={title}
            className={styles.monumentImage}
            loading="lazy"
            onError={() => {
              console.warn("Resim yüklenemedi:", displayImage);
              setImageLoadFailed(true);
            }}
          />
        </div>
      )}

      <div className={styles.contentWrapper}>
        <h1 className={styles.monumentTitle}>{title}</h1>
        {monument.address && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              color: "#666",
              fontSize: "0.9rem",
              marginTop: "4px",
              marginBottom: "16px",
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            <span>{monument.address}</span>
          </div>
        )}

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
          setPausedBySystem={setPausedBySystem}
        />

        {renderStory()}
      </div>
    </div>
  );
};

export default MonumentDetailScreen;
