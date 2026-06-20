import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const SEVERITY = (count) =>
  count >= 50 ? { color: "#EF4444", fill: "#EF4444", label: "Critical" }
: count >= 30 ? { color: "#F59E0B", fill: "#F59E0B", label: "High"     }
: count >= 15 ? { color: "#EAB308", fill: "#EAB308", label: "Medium"   }
:               { color: "#10B981", fill: "#10B981", label: "Low"      };

function MapView() {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/hotspots")
      .then((r) => r.json())
      .then(setHotspots)
      .catch(() => {});
  }, []);

  return (
    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hotspots.map((spot) => {
        const sev  = SEVERITY(spot.incident_count);
        const name = spot.name ?? `Junction ${spot.cluster_id + 1}`;
        return (
          <Circle
            key={spot.cluster_id}
            center={[spot.latitude, spot.longitude]}
            radius={5000}
            pathOptions={{ color: sev.color, fillColor: sev.fill, fillOpacity: 0.15, weight: 3 }}
          >
            <Popup>
              <div style={{ fontFamily: "'Poppins', sans-serif", minWidth: 210 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#0F172A", borderBottom: "1px solid #F1F5F9", paddingBottom: 8 }}>
                  {name}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                  <Row label="Risk Level"           value={sev.label}            valueColor={sev.color} />
                  <Row label="Historical Incidents"  value={spot.incident_count} />
                  <Row label="Lat / Lon"             value={`${spot.latitude.toFixed(4)}, ${spot.longitude.toFixed(4)}`} />
                </div>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </MapContainer>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "#64748B" }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor ?? "#0F172A" }}>{value}</span>
    </div>
  );
}

export default MapView;
