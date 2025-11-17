import React from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import styles from "./UserPulse.module.css";

const userPulseIcon = new L.divIcon({
  className: styles.pulseContainer,
  html: `<div class="${styles.pulseRing}"></div><div class="${styles.pulseDot}"></div>`,
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

const UserPulse = ({ position }) => {
  if (!position) return null;
  return (
    <Marker position={position} icon={userPulseIcon} interactive={false} />
  );
};

export default UserPulse;
