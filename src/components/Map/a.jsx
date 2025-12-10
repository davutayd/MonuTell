import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";

import {
  FaChessRook,
  FaLandmark,
  FaArchway,
  FaPlaceOfWorship,
  FaStar,
} from "react-icons/fa";
import { GiStoneBust } from "react-icons/gi";

import { useMonuments } from "../../hooks/useMonuments";
import { useLocation } from "../../hooks/useLocation";
import GoToMyLocationButton from "./GoToMyLocationButton";
import AllowLocationBanner from "./AllowLocationBanner";
import LocationHandler from "./LocationHandler";
import SearchBar from "./SearchBar";
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
  html: `<div class="${styles.userMarkerContainer}"><div class="${styles.userPulse}"></div><div class="${styles.userDot}"></div></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const createCustomIcon = (IconComponent, color, zoom) => {
  let size = 36;
  let fontSize = 22;
  let showIcon = true;

  if (zoom < 14) {
    size = 10;
    showIcon = false;
  } else if (zoom < 16) {
    size = 28;
    fontSize = 16;
  } else if (zoom >= 18) {
    size = 42;
    fontSize = 28;
  }

  const iconHtml = renderToStaticMarkup(
    <div
      style={{
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: zoom < 14 ? `2px solid white` : `3px solid white`,
        boxShadow: zoom < 14 ? "none" : "0 2px 4px rgba(0,0,0,0.3)",
        position: "relative",
        color: "white",
        fontSize: `${fontSize}px`,
        paddingTop: "2px",
      }}
    >
      {showIcon && <IconComponent />}
      {showIcon && (
        <div
          style={{
            position: "absolute",
            bottom: zoom >= 18 ? "-8px" : "-6px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "0",
            height: "0",
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `8px solid ${color}`,
          }}
        ></div>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: "",
    iconSize: [size, size + (showIcon ? 10 : 0)],
    iconAnchor: [size / 2, size + (showIcon ? 10 : 0)],
    popupAnchor: [0, -size],
  });
};

const getIconForCategory = (category, zoom) => {
  const cat = category ? category.toLowerCase() : "landmark";
  const z = zoom || 14;
  switch (cat) {
    case "statue":
    case "monument":
      return createCustomIcon(GiStoneBust, "#D4AF37", z);
    case "castle":
      return createCustomIcon(FaChessRook, "#E63946", z);
    case "church":
    case "religious":
      return createCustomIcon(FaPlaceOfWorship, "#2A9D8F", z);
    case "museum":
      return createCustomIcon(FaLandmark, "#7209B7", z);
    case "bridge":
      return createCustomIcon(FaArchway, "#4361EE", z);
    default:
      return createCustomIcon(FaStar, "#457B9D", z);
  }
};

const defaultCenter = [47.4979, 19.0402];

const FlyToHandler = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 18, { animate: true, duration: 1.5 });
    }
  }, [target, map]);
  return null;
};
const VisibleMarkers = ({ monuments, onSelectMonument, language, setZoom }) => {
  const map = useMap();
  const [visibleMonuments, setVisibleMonuments] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(14);

  useEffect(() => {
    if (!map || !monuments) return;

    const updateVisible = () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      setCurrentZoom(zoom);
      setZoom(zoom);

      const visible = monuments.filter((m) => {
        if (!m.latitude || !m.longitude) return false;
        return bounds.contains([m.latitude, m.longitude]);
      });

      setVisibleMonuments(visible);
    };

    map.on("moveend", updateVisible);
    map.on("zoomend", updateVisible);

    updateVisible();

    return () => {
      map.off("moveend", updateVisible);
      map.off("zoomend", updateVisible);
    };
  }, [map, monuments, setZoom]);

  return (
    <>
      {visibleMonuments.map((monument) => (
        <Marker
          key={monument.id}
          position={[monument.latitude, monument.longitude]}
          eventHandlers={{ click: () => onSelectMonument(monument) }}
          icon={getIconForCategory(monument.category, currentZoom)}
        ></Marker>
      ))}
    </>
  );
};

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
  const [zoomLevel, setZoomLevel] = useState(14);
  const [flyToPosition, setFlyToPosition] = useState(null);

  useEffect(() => {
    if (position && isFirstLoad.current) {
      setShouldFly(true);
      isFirstLoad.current = false;
    }
  }, [position]);

  const handleSearchResult = (monument) => {
    setFlyToPosition([monument.latitude, monument.longitude]);
    onSelectMonument(monument);
  };

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
      <SearchBar
        monuments={monuments}
        onSelectResult={handleSearchResult}
        hasBanner={showBanner}
        isMobile={isMobile}
        language={language}
      />
      <MapContainer
        center={position || defaultCenter}
        zoom={14}
        className={styles.mapContainer}
        maxZoom={22}
        preferCanvas={true}
      >
        <TileLayer
          maxZoom={22}
          maxNativeZoom={18}
          attribution="&copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FlyToHandler target={flyToPosition} />
        {position && (
          <>
            {showMarker ? (
              <Marker position={position} icon={userLocationIcon} />
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

        <VisibleMarkers
          monuments={monuments}
          onSelectMonument={onSelectMonument}
          language={language}
          setZoom={setZoomLevel}
        />

        <GoToMyLocationButton
          position={position}
          panelHeight={panelHeight}
          isMobile={isMobile}
        />

        <div className={styles.legendContainer}>
          <div className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: "#D4AF37" }}
            ></span>
            <span>{language === "tr" ? "Anıt/Heykel" : "Monument"}</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: "#E63946" }}
            ></span>
            <span>{language === "tr" ? "Kale" : "Castle"}</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: "#7209B7" }}
            ></span>
            <span>{language === "tr" ? "Müze" : "Museum"}</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: "#457B9D" }}
            ></span>
            <span>{language === "tr" ? "Simgesel Yapı" : "Landmark"}</span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: "#4361EE" }}
            ></span>
            <span>{language === "tr" ? "Köprü" : "Bridge"}</span>
          </div>
        </div>
      </MapContainer>
    </div>
  );
};

export default MapScreen;
