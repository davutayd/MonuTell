import React, { useRef } from "react";
import styles from "./CustomProgressBar.module.css";

const CustomProgressBar = ({ duration, currentTime, onChangeTime }) => {
  const progressBarRef = useRef(null);
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getNewTimeFromPosition = (clientX) => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return 0;
    const rect = bar.getBoundingClientRect();
    let relativeX = clientX - rect.left;
    relativeX = Math.max(0, Math.min(relativeX, rect.width));
    const clickPercentage = relativeX / rect.width;
    return Math.round(clickPercentage * duration);
  };

  const handleClick = (e) => {
    const newTime = getNewTimeFromPosition(e.clientX);
    onChangeTime(newTime);
  };

  return (
    <div
      ref={progressBarRef}
      onClick={handleClick}
      className={styles.progressBar}
    >
      <div
        className={styles.progressFill}
        style={{ width: `${percentage}%` }}
      />
      <div
        className={styles.progressHandle}
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
};

export default CustomProgressBar;
