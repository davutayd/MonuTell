import { useEffect } from "react";
import { useMap } from "react-leaflet";

const LocationHandler = ({ position, shouldFly, setShouldFly }) => {
  const map = useMap();

  useEffect(() => {
    if (position && shouldFly) {
      map.flyTo(position, 16, { duration: 1.2 });
      setShouldFly(false);
    }
  }, [position, shouldFly, map, setShouldFly]);

  return null;
};

export default LocationHandler;
