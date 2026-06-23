
import React from "react";
import { X, MapPin, AlertTriangle, Gauge, Filter } from "lucide-react";
import "./OperationsControlPanel.css";

function OperationsControlPanel({ incidents, hotspots, onClose, onFocusCoord }) {
  const highCongestionHotspots = hotspots.filter(
    (h) => h.prediction === "high"
  );
  const moderateCongestionHotspots = hotspots.filter(
    (h) => h.prediction === "moderate"
  );

  const getSeverityColor = (severity) => {
    if (severity > 0.7) return "text-red-500";
    if (severity > 0.4) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <aside className="operations-control-panel">
      <div className="panel-header">
        <h3>Operations Control</h3>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="panel-content">
        <section className="quick-metrics">
          <h4>Quick Metrics</h4>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-value">{incidents.length}</span>
              <span className="metric-label">Active Incidents</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">{hotspots.length}</span>
              <span className="metric-label">Traffic Hotspots</span>
            </div>
            <div className="metric-item">
              <span className="metric-value text-red-500">
                {highCongestionHotspots.length}
              </span>
              <span className="metric-label">High Congestion</span>
            </div>
            <div className="metric-item">
              <span className="metric-value text-yellow-500">
                {moderateCongestionHotspots.length}
              </span>
              <span className="metric-label">Moderate Congestion</span>
            </div>
          </div>
        </section>

        <section className="severity-gauge">
          <h4>
            <Gauge size={16} /> Overall Severity
          </h4>
          <div className="gauge-container">
            {/* A simple representation of a gauge */}
            <div className="gauge-bar">
              <div
                className="gauge-level"
                style={{ width: `65%`, backgroundColor: "#F59E0B" }}
              ></div>
            </div>
            <span className="gauge-label">Moderate</span>
          </div>
        </section>

        <section className="filters">
          <h4>
            <Filter size={16} /> Filters
          </h4>
          <div className="filter-buttons">
            <button className="filter-btn active">All</button>
            <button className="filter-btn">Incidents</button>
            <button className="filter-btn">Congestion</button>
            <button className="filter-btn">Events</button>
          </div>
        </section>

        <section className="congested-areas">
          <h4>Most Congested Areas</h4>
          <div className="list-container">
            {highCongestionHotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="list-item"
                onClick={() => onFocusCoord(hotspot.lat, hotspot.lng, 15)}
              >
                <MapPin className="text-red-500" size={18} />
                <span className="item-name">{hotspot.name}</span>
                <span className="item-detail">High Traffic</span>
              </div>
            ))}
          </div>
        </section>

        <section className="high-risk-alerts">
          <h4>
            <AlertTriangle size={16} /> High-Risk Alerts
          </h4>
          <div className="list-container">
            {incidents
              .filter((inc) => inc.severity > 0.7)
              .map((inc) => (
                <div
                  key={inc.id}
                  className="list-item"
                  onClick={() => onFocusCoord(inc.lat, inc.lng, 16)}
                >
                  <AlertTriangle className="text-yellow-500" size={18} />
                  <span className="item-name">{inc.type}</span>
                  <span className="item-detail">{inc.location}</span>
                </div>
              ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

export default OperationsControlPanel;