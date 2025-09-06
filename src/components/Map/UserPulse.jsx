import React, { useEffect, useState } from "react";
import { Circle } from "react-leaflet";

const UserPulse = ({ position }) => {
  const [radius, setRadius] = useState(20);

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
};

export default UserPulse;
