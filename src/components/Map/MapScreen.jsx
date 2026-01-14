import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";

import {
  FaChessRook,
  FaLandmark,
  FaArchway,
  FaPlaceOfWorship,
  FaStar,
  FaCog,
} from "react-icons/fa";
import { GiStoneBust } from "react-icons/gi";

import { useMonuments } from "../../hooks/useMonuments";
import { useLocation } from "../../hooks/useLocation";
import GoToMyLocationButton from "./GoToMyLocationButton";
import AllowLocationBanner from "./AllowLocationBanner";
import LocationHandler from "./LocationHandler";
import SearchBar from "./SearchBar";
import SuggestPlaceModal from "./SuggestPlaceModal";
import styles from "./MapScreen.module.css";
import SettingsModal from "./SettingsModal";
import settingsStyles from "./SettingsModal.module.css";
import { FaPlus } from "react-icons/fa";

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

const createCustomIcon = (IconComponent, color, zoom, isSelected) => {
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

  const containerClass = isSelected ? styles.selectedMarkerBorder : "";

  const iconHtml = renderToStaticMarkup(
    <div
      className={containerClass}
      style={{
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: zoom < 14 ? "none" : "0 3px 8px rgba(0,0,0,0.4)",
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

const getIconForCategory = (category, zoom, isSelected) => {
  const cat = category ? category.toLowerCase() : "landmark";
  const z = zoom || 14;
  switch (cat) {
    case "statue":
    case "monument":
      return createCustomIcon(GiStoneBust, "#D4AF37", z, isSelected);
    case "castle":
      return createCustomIcon(FaChessRook, "#E63946", z, isSelected);
    case "church":
    case "religious":
      return createCustomIcon(FaPlaceOfWorship, "#2A9D8F", z, isSelected);
    case "museum":
      return createCustomIcon(FaLandmark, "#7209B7", z, isSelected);
    case "bridge":
      return createCustomIcon(FaArchway, "#4361EE", z, isSelected);
    default:
      return createCustomIcon(FaStar, "#457B9D", z, isSelected);
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

// Component to track map center position - defined outside MapScreen to prevent re-creation
const MapCenterTracker = ({ onCenterChange }) => {
  const map = useMap();
  useEffect(() => {
    const updateCenter = () => {
      const center = map.getCenter();
      onCenterChange({ lat: center.lat, lng: center.lng });
    };
    map.on("moveend", updateCenter);
    updateCenter();
    return () => map.off("moveend", updateCenter);
  }, [map, onCenterChange]);
  return null;
};

const VisibleMarkers = ({
  monuments,
  onSelectMonument,
  setZoom,
  selectedId,
}) => {
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
      {visibleMonuments.map((monument) => {
        const isSelected = monument.id === selectedId;
        return (
          <Marker
            key={monument.id}
            position={[monument.latitude, monument.longitude]}
            eventHandlers={{ click: () => onSelectMonument(monument) }}
            icon={getIconForCategory(
              monument.category,
              currentZoom,
              isSelected
            )}
            zIndexOffset={isSelected ? 1000 : 0}
          ></Marker>
        );
      })}
    </>
  );
};

const MapScreen = ({
  language = "tr",
  onSelectMonument = () => {},
  isPanelOpen = false,
  isMobile = false,
  setLanguage,
  onClosePanel,
  panelHeight = 0,
}) => {
  const { monuments, loading, error } = useMonuments();
  const { position, accuracy, showBanner, handleAllowLocation } = useLocation();
  const [shouldFly, setShouldFly] = useState(false);
  const isFirstLoad = useRef(true);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [flyToPosition, setFlyToPosition] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSuggestPlaceOpen, setIsSuggestPlaceOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);

  useEffect(() => {
    if (position && isFirstLoad.current) {
      setShouldFly(true);
      isFirstLoad.current = false;
    }
  }, [position]);

  const handleSearchSelect = (monument) => {
    setSelectedId(monument.id);
    setFlyToPosition([monument.latitude, monument.longitude]);
    onSelectMonument(monument);
  };

  const handleManualSelect = (monument) => {
    setSelectedId(monument.id);
    onSelectMonument(monument);
  };
  const handleOpenSettings = () => {
    if (isPanelOpen && onClosePanel) {
      onClosePanel();
    }
    setIsSettingsOpen(true);
  };

  const handleOpenSuggestPlace = () => {
    if (isPanelOpen && onClosePanel) {
      onClosePanel();
    }
    setIsSuggestPlaceOpen(true);
  };

  // Stable callback for map center updates
  const handleMapCenterChange = React.useCallback((center) => {
    setMapCenter(center);
  }, []);

  const showMarker = accuracy != null && accuracy <= 100;

  if (loading) {
    const loadingText =
      language === "tr"
        ? "Budapeşte Rehberi Hazırlanıyor..."
        : language === "hu"
        ? "Budapest Útikalauz Készül..."
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
      hu: {
        title: "Hiba történt",
        message:
          "Nem sikerült betölteni az adatokat. Kérjük, ellenőrizze az internetkapcsolatot.",
        button: "Próbáld újra",
      },
      en: {
        title: "Something Went Wrong",
        message: "Could not load data. Please check your internet connection.",
        button: "Try Again",
      },
    };
    const content = texts[language] || texts.en;

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

  const buttonBottom = isMobile ? (isPanelOpen ? panelHeight + 80 : 80) : 90;

  return (
    <div className={styles.mapWrapper}>
      {showBanner && (
        <AllowLocationBanner
          onAllow={handleAllowLocation}
          language={language}
        />
      )}

      <SearchBar
        monuments={monuments}
        onSelectResult={handleSearchSelect}
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
        zoomControl={false}
      >
        <TileLayer
          maxZoom={22}
          maxNativeZoom={18}
          attribution="&copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <FlyToHandler target={flyToPosition} />

        <MapCenterTracker onCenterChange={handleMapCenterChange} />

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
          onSelectMonument={handleManualSelect}
          language={language}
          setZoom={setZoomLevel}
          selectedId={selectedId}
        />

        <GoToMyLocationButton
          position={position}
          panelHeight={panelHeight}
          isMobile={isMobile}
        />

        <button
          className={settingsStyles.settingsButton}
          onClick={handleOpenSettings}
          aria-label="Settings"
          style={{
            pointerEvents: "auto",
            position: "absolute",
            right: "calc(10px + env(safe-area-inset-right, 0px))",
            bottom: `calc(${buttonBottom}px + env(safe-area-inset-bottom, 0px))`,
            transition: "bottom 0.3s ease-in-out",
            zIndex: 1000,
          }}
        >
          <FaCog size={28} color="#333" />
        </button>

        <div className={styles.legendContainer}>
          <div className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: "#D4AF37" }}
            ></span>
            <span>
              {language === "tr"
                ? "Anıt/Heykel"
                : language === "hu"
                ? "Szobor"
                : "Monument"}
            </span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: "#E63946" }}
            ></span>
            <span>
              {language === "tr"
                ? "Kale"
                : language === "hu"
                ? "Vár"
                : "Castle"}
            </span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: "#7209B7" }}
            ></span>
            <span>
              {language === "tr"
                ? "Müze"
                : language === "hu"
                ? "Múzeum"
                : "Museum"}
            </span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: "#457B9D" }}
            ></span>
            <span>
              {language === "tr"
                ? "Simgesel Yapı"
                : language === "hu"
                ? "Látnivaló"
                : "Landmark"}
            </span>
          </div>
          <div className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: "#4361EE" }}
            ></span>
            <span>
              {language === "tr"
                ? "Köprü"
                : language === "hu"
                ? "Híd"
                : "Bridge"}
            </span>
          </div>
        </div>
      </MapContainer>
      <button
        className={styles.suggestPlaceButton}
        onClick={handleOpenSuggestPlace}
        aria-label="Suggest Place"
        style={{
          bottom: `calc(${isMobile ? panelHeight + 20 : 20}px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <FaPlus size={20} color="#fff" />
      </button>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentLang={language}
        setLanguage={setLanguage}
      />
      <SuggestPlaceModal
        isOpen={isSuggestPlaceOpen}
        onClose={() => setIsSuggestPlaceOpen(false)}
        language={language}
        mapCenter={mapCenter}
      />
    </div>
  );
};

export default MapScreen;
