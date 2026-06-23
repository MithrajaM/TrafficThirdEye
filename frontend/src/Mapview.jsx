import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from "react-leaflet";
import { 
  AlertTriangle, 
  MapPin, 
  Layers, 
  Radio, 
  Compass, 
  Flame, 
  TrendingUp, 
  X, 
  ChevronRight, 
  Sliders 
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Helper to get status colors
const getCauseStyles = (cause) => {
  switch (cause?.toLowerCase()) {
    case "accident":
      return { color: "#EF4444", fill: "#F87171", label: "Accident" };
    case "vehicle_breakdown":
      return { color: "#F59E0B", fill: "#FBBF24", label: "Breakdown" };
    case "construction":
      return { color: "#EA580C", fill: "#FB923C", label: "Construction" };
    case "public_event":
    case "procession":
    case "vip_movement":
      return { color: "#3B82F6", fill: "#60A5FA", label: "Special Event" };
    default:
      return { color: "#64748B", fill: "#94A3B8", label: "Incident" };
  }
};

const getRiskLabel = (score) => {
  if (score >= 85) return { text: "CRITICAL", color: "#EF4444" };
  if (score >= 70) return { text: "HIGH", color: "#F97316" };
  if (score >= 50) return { text: "MEDIUM", color: "#F59E0B" };
  return { text: "LOW", color: "#10B981" };
};

const getHotspotStyles = (prediction) => {
  switch (prediction) {
    case "high":
      return { color: "#EF4444", fill: "#F87171", label: "High" };
    case "moderate":
      return { color: "#F59E0B", fill: "#FBBF24", label: "Moderate" };
    case "free":
      return { color: "#10B981", fill: "#6EE7B7", label: "Free" };
    default:
      return { color: "#64748B", fill: "#94A3B8", label: "Unknown" };
  }
};


function MapView({ onSimulate }) {
  const [hotspots, setHotspots] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [trafficPredictions, setTrafficPredictions] = useState({});
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [filterCause, setFilterCause] = useState("all");

  useEffect(() => {
    // Fetch Hotspots
    fetch("http://127.0.0.1:8000/hotspots")
      .then((r) => r.json())
      .then((data) => setHotspots(data || []))
      .catch((e) => console.error("Error fetching hotspots:", e));

    // Fetch Enriched Incidents from /events
    fetch("http://127.0.0.1:8000/events")
      .then((r) => r.json())
      .then((data) => setIncidents(data || []))
      .catch((e) => console.error("Error fetching incidents:", e));

    // Fetch Traffic Predictions
    fetch("http://127.0.0.1:8000/traffic-predictions")
      .then((r) => r.json())
      .then((data) => setTrafficPredictions(data || {}))
      .catch((e) => console.error("Error fetching traffic predictions:", e));
  }, []);

  // Zoom to coordinate helper
  const focusOnCoord = (lat, lng, zoom = 14) => {
    if (mapRef) {
      mapRef.setView([lat, lng], zoom, { animate: true, duration: 1 });
    }
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    if (filterCause === "all") return true;
    if (filterCause === "accident") return inc.event_cause === "accident";
    if (filterCause === "breakdown") return inc.event_cause === "vehicle_breakdown";
    if (filterCause === "construction") return inc.event_cause === "construction";
    if (filterCause === "special") return ["public_event", "procession", "vip_movement", "protest"].includes(inc.event_cause);
    return true;
  });

  // Calculate stats for side panel
  const totalEvents = incidents.length;
  const criticalCount = incidents.filter(i => i.risk_score >= 80).length;
  const activeCount = incidents.filter(i => i.status === "Active" || i.status === "Critical").length;

  return (
    <div className="map-page-container">
      {/* Map Element */}
      <div className="map-view-wrapper">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          style={{ height: "100%", width: "100%", background: "#f0f0f0" }}
          ref={setMapRef}
        >
          {/* Light Voyager Theme (CartoDB) */}
          <TileLayer
            attribution="&copy; <a href='https://carto.com/'>CartoDB</a>"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Hotspot overlays: concentric circles representing glowing congestion zones */}
          {hotspots.map((spot) => {
            const risk = getRiskLabel(spot.risk_score);
            
            return (
              <CircleMarker
                key={spot.id}
                center={[spot.latitude, spot.longitude]}
                radius={8}
                pathOptions={{
                  color: risk.color,
                  fillColor: risk.color,
                  fillOpacity: 0.8,
                }}
              >
                <Popup>
                  <div className="map-popup-card">
                    <div className="popup-header">
                      <MapPin size={14} style={{ color: risk.color, marginRight: 6 }} />
                      <strong>{spot.name}</strong>
                    </div>
                    <div className="popup-body">
                      <div className="popup-row">
                        <span className="lbl">Incidents:</span>
                        <span className="val">{spot.incident_count}</span>
                      </div>
                      <div className="popup-row">
                        <span className="lbl">Event Cause:</span>
                        <span className="val">{spot.top_cause}</span>
                      </div>
                      <div className="popup-row">
                        <span className="lbl">Risk Level:</span>
                        <span className="val" style={{ color: risk.color }}>{risk.text}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Heatmap Layer */}
          {hotspots.map((spot) => (
            <Circle
              key={`heat-${spot.id}`}
              center={[spot.latitude, spot.longitude]}
              radius={500}
              pathOptions={{
                color: 'transparent',
                fillColor: getRiskLabel(spot.risk_score).color,
                fillOpacity: 0.2,
              }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapView;