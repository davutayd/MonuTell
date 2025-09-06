import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import monuments from "../../data/monuments";

import GoToMyLocationButton from "./GoToMyLocationButton";
import AllowLocationBanner from "./AllowLocationBanner";
import UserPulse from "./UserPulse";
import LocationHandler from "./LocationHandler";

// Leaflet default marker fix
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
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [shouldFly, setShouldFly] = useState(false);

  const isSafari =
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("safari") &&
    !navigator.userAgent.toLowerCase().includes("chrome");

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
      },
      (err) => console.error("Konum hatası:", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleAllowLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy);
        setShowBanner(false);
        setShouldFly(true);
        startWatchingLocation();
      },
      () => setShowBanner(true),
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
  }, [isSafari, startWatchingLocation]);

  const viewportHeight =
    typeof window !== "undefined" && window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

  const panelHeight = isMobile ? (isPanelOpen ? viewportHeight * 0.6 : 0) : 0;
  const showMarker = accuracy != null && accuracy <= 100;

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
            {showMarker ? (
              <>
                <Marker position={position} icon={userLocationIcon} />
                <UserPulse position={position} />
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
