import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import monuments from "../../data/monuments";

import { useLocation } from "../../hooks/useLocation";
import GoToMyLocationButton from "./GoToMyLocationButton";
import AllowLocationBanner from "./AllowLocationBanner";
import LocationHandler from "./LocationHandler";

import styles from "./MapScreen.module.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const userLocationIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const defaultCenter = [47.4979, 19.0402];

const MapScreen = ({
  language = "tr",
  onSelectMonument = () => {},
  isPanelOpen = false,
  isMobile = false,
}) => {
  const { position, accuracy, showBanner, handleAllowLocation } = useLocation();
  const [shouldFly, setShouldFly] = useState(false);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (position && isFirstLoad.current) {
      setShouldFly(true);
      isFirstLoad.current = false;
    }
  }, [position]);

  const viewportHeight =
    typeof window !== "undefined" && window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

  const panelHeight = isMobile ? (isPanelOpen ? viewportHeight * 0.6 : 0) : 0;
  const showMarker = accuracy != null && accuracy <= 100;

  return (
    <div className={styles.mapWrapper}>
      {showBanner && <AllowLocationBanner onAllow={handleAllowLocation} />}

      <MapContainer
        center={position || defaultCenter}
        zoom={12}
        className={styles.mapContainer}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {position && (
          <>
            {showMarker ? (
              <>
                <Marker position={position} icon={userLocationIcon} />
              </>
            ) : (
              <Circle
                center={position}
                radius={Math.min(accuracy || 1000, 1000)}
                pathOptions={{
                  color: "#2a7",
                  fillColor: "#2a7",
                  fillOpacity: 0.1,
                }}
              />
            )}
          </>
        )}

        <LocationHandler
          position={position}
          shouldFly={shouldFly}
          setShouldFly={setShouldFly}
        />

        {monuments.map((monument) => (
          <Marker
            key={monument.id}
            position={[monument.latitude, monument.longitude]}
            eventHandlers={{ click: () => onSelectMonument(monument) }}
          >
            <Popup>
              {language === "tr" ? monument.name_tr : monument.name_en}
            </Popup>
          </Marker>
        ))}

        <GoToMyLocationButton
          position={position}
          panelHeight={panelHeight}
          isMobile={isMobile}
        />
      </MapContainer>
    </div>
  );
};

export default MapScreen;
