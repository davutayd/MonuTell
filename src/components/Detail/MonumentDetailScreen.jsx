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

  const langCode = language === "tr" ? "tr-TR" : "en-US";
  const title = language === "tr" ? monument.name_tr : monument.name_en;
  const story = language === "tr" ? monument.story_tr : monument.story_en;

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

  const trFlagStyle = {
    opacity: language === "tr" ? 1 : 0.6,
    boxShadow: language === "tr" ? "0 0 0 2px #4a6fa5" : "none",
  };

  const enFlagStyle = {
    opacity: language === "en" ? 1 : 0.6,
    boxShadow: language === "en" ? "0 0 0 2px #4a6fa5" : "none",
  };

  return (
    <div className={styles.screenContainer}>
      {monument.image && !imageLoadFailed && (
        <div className={styles.imageWrapper}>
          <img
            src={monument.image}
            alt={title}
            className={styles.monumentImage}
            loading="lazy"
            onError={() => {
              console.warn("Resim yüklenemedi:", monument.image);
              setImageLoadFailed(true);
            }}
          />
        </div>
      )}

      <div className={styles.contentWrapper}>
        <div className={styles.languageSelector}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg"
            alt="Türkçe"
            className={styles.flagImage}
            style={trFlagStyle}
            onClick={() => handleLanguageChange("tr")}
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Flag_of_the_United_States.svg"
            alt="English"
            className={styles.flagImage}
            style={enFlagStyle}
            onClick={() => handleLanguageChange("en")}
          />
        </div>

        <h1 className={styles.monumentTitle}>{title}</h1>

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
