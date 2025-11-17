import React from "react";
import styles from "./MapScreen.module.css";

const AllowLocationBanner = ({ onAllow }) => {
  return (
    <div className={styles.locationBanner}>
      <span>📍 Konum izni gerekiyor. Başlatmak için tıkla.</span>
      <button onClick={onAllow} className={styles.allowButton}>
        Konumumu Göster
      </button>
    </div>
  );
};

export default AllowLocationBanner;
