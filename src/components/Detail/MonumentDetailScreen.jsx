import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaCheck } from "react-icons/fa";
import { FiCircle } from "react-icons/fi";
import AudioControls from "./AudioControls";
import AddPhotoModal from "./AddPhotoModal";
import { useGlobalAudio } from "../../context/GlobalAudioContext";
import styles from "./MonumentDetailScreen.module.css";

// LocalStorage helper functions for Like (visited is now lifted to parent)
const getStoredLikedIds = () => {
  try {
    const stored = localStorage.getItem("likedMonumentIds");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const toggleLikeInStorage = (id) => {
  const ids = getStoredLikedIds();
  const index = ids.indexOf(id);
  if (index > -1) {
    ids.splice(index, 1);
  } else {
    ids.push(id);
  }
  localStorage.setItem("likedMonumentIds", JSON.stringify(ids));
  return ids;
};

const MonumentDetailScreen = ({
  monument,
  language,
  setLanguage,
  setPausedBySystem,
  visitedIds = [],
  toggleVisited,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const { stopAudio } = useGlobalAudio();
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  
  // Like state (local) - Visited is now from props
  const [isLiked, setIsLiked] = useState(false);
  
  // Derive visited status from props
  const isVisited = visitedIds.includes(monument?.id);

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
  const hasNoImage = !displayImage || imageLoadFailed;

  const addPhotoText =
    language === "tr"
      ? "📷 Fotoğraf Ekle"
      : language === "hu"
      ? "📷 Fénykép Hozzáadása"
      : "📷 Add Photo";

  // Button labels
  const likeLabel = language === "tr" ? "Beğen" : language === "hu" ? "Kedvelés" : "Like";
  const visitedLabel = language === "tr" ? "Ziyaret Ettim" : language === "hu" ? "Meglátogattam" : "Visited";

  // Load initial like state from localStorage
  useEffect(() => {
    if (monument?.id) {
      const likedIds = getStoredLikedIds();
      setIsLiked(likedIds.includes(monument.id));
    }
  }, [monument?.id]);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [monument]);

  const handleToggleLike = () => {
    if (!monument?.id) return;
    toggleLikeInStorage(monument.id);
    setIsLiked(!isLiked);
  };

  const handleToggleVisited = () => {
    if (!monument?.id || !toggleVisited) return;
    toggleVisited(monument.id);
  };

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
      {/* TITLE FIRST */}
      <div className={styles.contentWrapper}>
        <h1 className={styles.monumentTitle}>{title}</h1>
        
        {monument.address && (
          <div className={styles.addressRow}>
            <span>{monument.address}</span>
          </div>
        )}
      </div>

      {/* IMAGE SECTION */}
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

      {hasNoImage && (
        <div className={styles.noImageContainer}>
          <button
            className={styles.addPhotoButton}
            onClick={() => setIsAddPhotoOpen(true)}
          >
            {addPhotoText}
          </button>
        </div>
      )}

      {/* ACTION BUTTONS & CONTROLS */}
      <div className={styles.contentWrapper}>
        {/* Like & Visited Buttons */}
        <div className={styles.actionButtonsRow}>
          <button
            className={`${styles.actionButton} ${isLiked ? styles.likeActive : ""}`}
            onClick={handleToggleLike}
            aria-label={likeLabel}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{likeLabel}</span>
          </button>
          <button
            className={`${styles.actionButton} ${isVisited ? styles.visitedActive : ""}`}
            onClick={handleToggleVisited}
            aria-label={visitedLabel}
          >
            {isVisited ? <FaCheck /> : <FiCircle />}
            <span>{visitedLabel}</span>
          </button>
        </div>

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

      <AddPhotoModal
        isOpen={isAddPhotoOpen}
        onClose={() => setIsAddPhotoOpen(false)}
        monumentId={monument.id}
        monumentName={title}
        language={language}
      />
    </div>
  );
};

export default MonumentDetailScreen;

