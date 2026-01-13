import React from "react";
import { FaTimes, FaGlobe, FaCheck, FaCog } from "react-icons/fa";
import styles from "./SettingsModal.module.css";

const LANGUAGES = [
  { code: "tr", label: "Türkçe", flag: "/flags/tr.svg" },
  { code: "en", label: "English", flag: "/flags/en.svg" },
  { code: "hu", label: "Magyar", flag: "/flags/hu.svg" },
];

const SettingsModal = ({ isOpen, onClose, currentLang, setLanguage }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <FaGlobe style={{ color: "#4a6fa5" }} />
            {currentLang === "tr"
              ? "Dil Seçimi"
              : currentLang === "hu"
              ? "Nyelvválasztás"
              : "Language"}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.languageList}>
          {LANGUAGES.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                className={`${styles.langOption} ${
                  isActive ? styles.active : ""
                }`}
                onClick={() => {
                  setLanguage(lang.code);
                  onClose();
                }}
              >
                <img src={lang.flag} alt={lang.label} className={styles.flag} />
                <span className={styles.langName}>{lang.label}</span>
                {isActive && <FaCheck className={styles.checkIcon} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
