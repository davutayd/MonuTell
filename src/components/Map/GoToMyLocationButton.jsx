import React from "react";
import { useMap } from "react-leaflet";
import { MdMyLocation } from "react-icons/md";
import styles from "./GoToMyLocationButton.module.css";

const GoToMyLocationButton = ({ position, panelHeight, isMobile }) => {
  const map = useMap();

  const handleClick = () => {
    if (position) map.flyTo(position, 16, { duration: 1.2 });
  };

  const dynamicStyles = {
    bottom: isMobile ? panelHeight + 10 : 20,
    right: 10,
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
