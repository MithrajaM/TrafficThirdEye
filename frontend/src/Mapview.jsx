import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

// Custom icon creation logic
const createIcon = (color) => {
  return new L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const icons = {
  high: createIcon("#EF4444"), // Red
  medium: createIcon("#F59E0B"), // Orange
  low: createIcon("#10B981"), // Green
};

const MapView = () => {
  const [incidents, setIncidents] = useState([]);
  const [hotspots, setHotspots] = useState([]);

  // Fetch incidents and hotspots
  useEffect(() => {
    fetch("http://127.0.0.1:8000/events")
      .then((r) => r.json())
      .then((data) => {
        console.log("EVENTS:", data);
        setIncidents(data || []);
      })
      .catch((err) => console.error("Error fetching incidents for map:", err));

    fetch("http://127.0.0.1:8000/hotspots")
      .then((r) => r.json())
      .then((data) => {
        console.log("HOTSPOTS:", data);
        setHotspots(data || []);
      })
      .catch((err) => console.error("Error fetching hotspots for map:", err));
  }, []);

  return (
    <div className="map-page-container">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hardcoded Test Marker */}
        <Marker position={[12.9716, 77.5946]}>
          <Popup>Bengaluru Test Marker</Popup>
        </Marker>

        {/* Plot Incidents */}
        {incidents.map((incident, index) => (
          <Marker
            key={index}
            position={[Number(incident.latitude), Number(incident.longitude)]}
            icon={icons.medium}
          >
            <Popup>
              <div className="map-popup">
                <strong>Junction:</strong> {incident.junction}<br />
                <strong>Cause:</strong> {incident.event_cause}<br />
                <strong>Zone:</strong> {incident.zone}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Plot Hotspots */}
        {hotspots.map((hotspot, index) => (
          <Circle
            key={index}
            center={[
              Number(hotspot.latitude),
              Number(hotspot.longitude),
            ]}
            radius={hotspot.incident_count * 25}
            pathOptions={{
              color: "#EF4444",
              fillColor: "#EF4444",
              fillOpacity: 0.25,
              weight: 1,
            }}
          >
            <Popup>
              <strong>{hotspot.name}</strong><br />
              Incidents: {hotspot.incident_count}
            </Popup>
          </Circle>
        ))}
      </MapContainer>
      <div className="map-legend-bottom">
        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#10B981" }} /> Low Risk</div>
        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#F59E0B" }} /> Medium Risk</div>
        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#EF4444" }} /> High Risk</div>
      </div>
    </div>
  );
};

export default MapView;