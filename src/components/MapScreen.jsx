import React, { useEffect, useState } from "react";
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


function GoToMyLocationButton({ position, panelHeight, isMobile }) {
  const map = useMap();

  const handleClick = () => {
    if (position) {
      map.flyTo(position, 16, { duration: 1.2 });
    }
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
}


function AllowLocationBanner({ onAllow }) {
  return (
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
        onClick={onAllow}
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
  );
}

function UserPulse({ position }) {
  const [radius, setRadius] = useState(20);
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    let growing = true;
    const interval = setInterval(() => {
      setRadius((r) => {
        if (r >= 60) growing = false;
        if (r <= 20) growing = true;
        return growing ? r + 2 : r - 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [position]);

  if (!position) return null;

  return (
    <Circle
      center={position}
      radius={radius}
      pathOptions={{ color: "#2a7", fillColor: "#2a7", fillOpacity: 0.2 }}
    />
  );
}

function LocationHandler({ position, shouldFly, setShouldFly }) {
  const map = useMap();

  useEffect(() => {
    if (position && shouldFly) {
      map.flyTo(position, 16, { duration: 1.2 });
      setShouldFly(false);
    }
  }, [position, shouldFly, map, setShouldFly]);

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
  const [showBanner, setShowBanner] = useState(false);
  const [shouldFly, setShouldFly] = useState(false);

  const isSafari =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("safari") &&
    !navigator.userAgent.toLowerCase().includes("chrome");

  const startWatchingLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.watchPosition(
      (pos) => {
        const newPosition = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPosition);
        setAccuracy(pos.coords.accuracy);
      },
      (err) => console.error("Konum hatası:", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
  };

  const handleAllowLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPosition);
        setAccuracy(pos.coords.accuracy);
        setShowBanner(false);
        setShouldFly(true);
        startWatchingLocation();
      },
      (err) => {
        console.error("Konum hatası:", err);
        setShowBanner(true);
      },
      { enableHighAccuracy: true, timeout: 20000 }
    );
  };

  useEffect(() => {
    if (!isSafari && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setAccuracy(pos.coords.accuracy);
          setShouldFly(true);
          startWatchingLocation();
        },
        () => setShowBanner(true),
        { enableHighAccuracy: true, timeout: 20000 }
      );
    } else {
      setShowBanner(true);
    }
  }, [isSafari]);

  const viewportHeight =
    typeof window !== "undefined" && window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

  const panelHeight = isMobile ? (isPanelOpen ? viewportHeight * 0.6 : 0) : 0;

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {showBanner && <AllowLocationBanner onAllow={handleAllowLocation} />}

      <MapContainer
        center={position || defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {position && (
          <>
            <Marker position={position} icon={userLocationIcon} />
            {accuracy != null && (
              <Circle
                center={position}
                radius={Math.min(accuracy || 2000, 2000)}
                pathOptions={{
                  color: "#2a7",
                  fillColor: "#2a7",
                  fillOpacity: 0.1,
                }}
              />
            )}
            <UserPulse position={position} />
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
