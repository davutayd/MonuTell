import React, { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MdMyLocation } from "react-icons/md";
import monuments from "../data/monuments";

// Leaflet marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Kullanıcı konumu ikonu
const userLocationIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

function RecenterOnDemand({ position, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (position && trigger > 0) {
      map.flyTo(position, 16, { duration: 1.2 });
    }
  }, [trigger, position, map]);
  return null;
}

const MapScreen = ({
  language = "tr",
  onSelectMonument = () => {},
  isPanelOpen = false,
  isMobile = false,
}) => {
  const defaultCenter = [47.4979, 19.0402];
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [watchId, setWatchId] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  const isSafari =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("safari") &&
    !navigator.userAgent.toLowerCase().includes("chrome");

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    if (watchId != null) navigator.geolocation.clearWatch(watchId);

    const id = navigator.geolocation.watchPosition(
      (p) => {
        setPosition([p.coords.latitude, p.coords.longitude]);
        setAccuracy(p.coords.accuracy);
      },
      (err) => console.error("Konum hatası:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );

    setWatchId(id);
  }, [watchId]);

  useEffect(() => {
    if (!isSafari) {
      startWatchingLocation();
    } else {
      setShowBanner(true);
    }

    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSafari, startWatchingLocation, watchId]);

  const handleAllowLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPosition([latitude, longitude]);
        setAccuracy(accuracy);

        setShowBanner(false);
        startWatchingLocation();
      },
      (err) => {
        console.error("Konum hatası:", err);
        setShowBanner(true);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (position) {
      setShowBanner(false);
    }
  }, [position]);

  const handleGoToLocation = () => {
    if (!position) return;
    setRecenterTrigger((n) => n + 1);
  };

  const panelHeight = isMobile
    ? isPanelOpen
      ? window.innerHeight * 0.6
      : 0
    : 0;
  const goToLocationButtonStyle = {
    position: "fixed",
    bottom: isMobile ? panelHeight + 20 : 30,
    right: 20,
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
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {showBanner && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            background: "#fff8e1",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 2000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          <span>📍 Konum izni gerekiyor. Başlatmak için tıkla.</span>
          <button
            onClick={handleAllowLocation}
            style={{
              padding: "6px 12px",
              background: "#2a7",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Konumumu Göster
          </button>
        </div>
      )}

      <MapContainer
        key={position ? position.join(",") : "default"}
        center={position || defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterOnDemand position={position} trigger={recenterTrigger} />

        {position && (
          <>
            <Marker position={position} icon={userLocationIcon} />
            {accuracy != null && (
              <Circle
                center={position}
                radius={Math.min(accuracy, 2000)}
                pathOptions={{
                  color: "#2a7",
                  fillColor: "#2a7",
                  fillOpacity: 0.1,
                }}
              />
            )}
          </>
        )}

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
      </MapContainer>

      <button onClick={handleGoToLocation} style={goToLocationButtonStyle}>
        <MdMyLocation size={28} color="#333" />
      </button>
    </div>
  );
};

export default MapScreen;
