import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

const MapView = forwardRef((props, ref) => {
  const [map, setMap] = useState(null);

  // This effect is a crucial failsafe. It tells the map to re-check its size
  // after the component has loaded, which fixes a common issue where map tiles
  // don't appear on the initial render.
  useEffect(() => {
    if (map) {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [map]);

  // This exposes the 'focusOnCoord' function to the parent App component,
  // allowing it to control the map.
  useImperativeHandle(ref, () => ({
    focusOnCoord: (lat, lng, zoom = 14) => {
      if (map) {
        map.setView([lat, lng], zoom, { animate: true, duration: 1 });
      }
    },
  }));

  return (
    <div className="map-page-container">
      <div className="map-view-wrapper">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          ref={setMap}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    </div>
  );
});

export default MapView;