import React from "react";
import styles from "./MapScreen.module.css";

const translations = {
  bannerText: {
    tr: "📍 Konum izni gerekiyor. Başlatmak için tıkla.",
    en: "📍 Location permission is required. Click to start.",
    de: "📍 Standortberechtigung erforderlich. Zum Starten klicken.",
    hu: "📍 Helyhozzáférés szükséges. Kattints az indításhoz.",
  },
  buttonText: {
    tr: "Konumumu Göster",
    en: "Show My Location",
    de: "Meinen Standort anzeigen",
    hu: "Helyzetem mutatása",
  },
};

const AllowLocationBanner = ({ onAllow, language }) => {
  const browserLang = (navigator.language || navigator.userLanguage).split(
    "-"
  )[0];
  const activeLang = language || browserLang;
  const langKey = translations.bannerText[activeLang] ? activeLang : "en";

  const bannerText = translations.bannerText[langKey];
  const buttonText = translations.buttonText[langKey];

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
