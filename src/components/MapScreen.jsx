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
import { MdMyLocation } from "react-icons/md"; // 📌 Konuma git ikonu
import monuments from "../data/monuments";

// Leaflet default marker ikon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Kullanıcı ikon ayarı
const userLocationIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Butona basıldığında konuma uç
function RecenterOnDemand({ position, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (position && trigger > 0) {
      map.flyTo(position, 16, { duration: 1.2 });
    }
  }, [trigger, position, map]);
  return null;
}

const MapScreen = ({ language = "tr", onSelectMonument = () => {} }) => {
  const defaultCenter = [47.4979, 19.0402];
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum hizmetlerini desteklemiyor.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPosition([latitude, longitude]);
        setAccuracy(accuracy);
        setLastUpdate(new Date());
      },
      (err) => {
        console.error("Konum hatası:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 20000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleGoToLocation = () => {
    if (!position) return;
    setRecenterTrigger((n) => n + 1);
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
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
            <Marker position={position} icon={userLocationIcon}>
              <Popup>
                Şu anki konumunuz
                {accuracy != null && (
                  <div>Doğruluk: ~{Math.round(accuracy)} m</div>
                )}
              </Popup>
            </Marker>

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

      {/* Konuma git butonu (ikonlu) */}
      <button
        onClick={handleGoToLocation}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          padding: "12px",
          background: "white",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MdMyLocation size={24} color="#333" />
      </button>
    </div>
  );
};

export default MapScreen;
