import React from "react";
import { useMap } from "react-leaflet";
import { MdMyLocation } from "react-icons/md";

const GoToMyLocationButton = ({ position, panelHeight, isMobile }) => {
  const map = useMap();

  const handleClick = () => {
    if (position) map.flyTo(position, 16, { duration: 1.2 });
  };

  const style = {
    position: "fixed",
    bottom: isMobile ? panelHeight + 10 : 20,
    right: 10,
    padding: "14px",
    background: "white",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
  };

  return (
    <button onClick={handleClick} style={style}>
      <MdMyLocation size={28} color="#333" />
    </button>
  );
};

export default GoToMyLocationButton;
