import React from "react";
import styles from "./MapScreen.module.css";

const translations = {
  bannerText: {
    tr: "📍 Konum izni gerekiyor. Başlatmak için tıkla.",
    en: "📍 Location permission is required. Click to start.",
    de: "📍 Standortberechtigung erforderlich. Zum Starten klicken.",
  },
  buttonText: {
    tr: "Konumumu Göster",
    en: "Show My Location",
    de: "Meinen Standort anzeigen",
  },
};

const AllowLocationBanner = ({ onAllow }) => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langKey = browserLang.split("-")[0];
  const bannerText =
    translations.bannerText[langKey] || translations.bannerText.en;
  const buttonText =
    translations.buttonText[langKey] || translations.buttonText.en;

  return (
    <div className={styles.locationBanner}>
      <span className={styles.bannerText}>{bannerText}</span>
      <button onClick={onAllow} className={styles.allowButton}>
        {buttonText}
      </button>
    </div>
  );
};

export default AllowLocationBanner;
