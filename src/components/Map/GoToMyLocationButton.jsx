import React from "react";
import { useMap } from "react-leaflet";
import { MdMyLocation } from "react-icons/md";
import styles from "./GoToMyLocationButton.module.css";

const GoToMyLocationButton = ({ position, panelHeight, isMobile, shouldHide = false }) => {
  const map = useMap();

  const handleClick = () => {
    if (position) map.flyTo(position, 16, { duration: 1.2 });
  };

  const dynamicStyles = {
    bottom: `calc(${isMobile ? panelHeight + 20 : 20}px + env(safe-area-inset-bottom, 0px))`,
    right: "calc(10px + env(safe-area-inset-right, 0px))",
    transition: "all 0.3s ease-in-out",
    opacity: shouldHide ? 0 : 1,
    pointerEvents: shouldHide ? "none" : "auto",
  };

  return (
    <button
      onClick={handleClick}
      className={styles.locationButton}
      style={dynamicStyles}
    >
      <MdMyLocation size={28} color="#333" />
    </button>
  );
};

export default GoToMyLocationButton;
