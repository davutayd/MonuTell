import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FaChurch,
  FaMonument,
  FaChessRook,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useMonuments } from "../../hooks/useMonuments";
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

const userLocationIcon = L.divIcon({
  className: "",
  html: `
    <div class="${styles.userMarkerContainer}">
      <div class="${styles.userPulse}"></div>
      <div class="${styles.userDot}"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});
const createCustomIcon = (IconComponent, color) => {
  const iconHtml = renderToStaticMarkup(
    <div
      style={{
        backgroundColor: color,
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid white",
        boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
        position: "relative",
        color: "white",
        fontSize: "18px",
      }}
    >
      <IconComponent />
      <div
        style={{
          position: "absolute",
          bottom: "-6px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "0",
          height: "0",
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `8px solid ${color}`,
        }}
      ></div>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: "",
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
  });
};

const getIconForCategory = (category) => {
  switch (category) {
    case "statue":
      return createCustomIcon(FaMonument, "#D4AF37");
    case "castle":
      return createCustomIcon(FaChessRook, "#E63946");
    case "church":
      return createCustomIcon(FaChurch, "#2A9D8F");
    default:
      return createCustomIcon(FaMapMarkerAlt, "#457B9D");
  }
};

const defaultCenter = [47.4979, 19.0402];

const MapScreen = ({
  language = "tr",
  onSelectMonument = () => {},
  isPanelOpen = false,
  isMobile = false,
}) => {
  const { monuments, loading, error } = useMonuments();

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

  if (loading) {
    const loadingText =
      language === "tr"
        ? "Budapeşte Rehberi Hazırlanıyor..."
        : "Preparing Budapest Guide...";

    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <div className={styles.loadingText}>{loadingText}</div>
      </div>
    );
  }
  if (error) {
    const texts = {
      tr: {
        title: "Bir Hata Oluştu",
        message:
          "Veriler yüklenemedi. Lütfen internet bağlantınızı kontrol edin.",
        button: "Tekrar Dene",
      },
      en: {
        title: "Something Went Wrong",
        message: "Could not load data. Please check your internet connection.",
        button: "Try Again",
      },
    };

    const content = language === "tr" ? texts.tr : texts.en;

    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorTitle}>{content.title}</div>
        <div className={styles.errorMessage}>{content.message}</div>
        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          {content.button}
        </button>
      </div>
    );
  }

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
            icon={getIconForCategory(monument.category)}
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
