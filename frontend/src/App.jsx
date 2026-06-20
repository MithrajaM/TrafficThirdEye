import { useEffect, useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import Simulator, { ResultCards } from "./Simulator";
import MapView from "./Mapview";

const PRIORITY_COLOR = {
  high:   { color: "#EF4444", bg: "rgba(239,68,68,0.08)"   },
  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)"  },
  low:    { color: "#10B981", bg: "rgba(16,185,129,0.08)"  },
};

function App() {
  const [time,  setTime]  = useState(new Date());
  const [result, setResult] = useState(null);
  const [recos,  setRecos]  = useState([]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/recommendations")
      .then((r) => r.json())
      .then(setRecos)
      .catch(() => {});
  }, []);

  const fmt = time.toLocaleString("en-IN", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh" }}>

      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo-box" />
          <div className="header-titles">
            <h1>Traffic Third Eye</h1>
            <p>Bangalore AI Traffic Intelligence Platform</p>
          </div>
        </div>
        <div className="header-right">
          <span className="header-time">{fmt}</span>
          <div className="status-badge">
            <div className="status-dot" />
            Operational
          </div>
        </div>
      </header>

      {/* KPI Strip — real data */}
      <Dashboard />

      {/* Map + Simulator */}
      <div className="main-layout">
        <div className="card">
          <div className="card-header">
            <h3>Live Incident Map — Bengaluru</h3>
            <span className="card-tag live">LIVE</span>
          </div>
          <div className="map-wrap">
            <MapView />
          </div>
        </div>

        <Simulator onResult={setResult} />
      </div>

      {/* ML Prediction Results — only shown after predict */}
      {result && <ResultCards result={result} />}

      {/* Strategic Recommendations — real data from /recommendations */}
      {recos.length > 0 && (
        <>
          <div className="section-label">Strategic Recommendations</div>
          <div className="reco-strip">
            {recos.map((r) => {
              const pc = PRIORITY_COLOR[r.priority?.toLowerCase()] ?? PRIORITY_COLOR.low;
              return (
                <div className="reco-card" key={r.location}>
                  <div className="reco-title">{r.title}</div>
                  <div className="reco-location">{r.location}</div>
                  <div className="reco-meta">
                    {r.cause.replace(/_/g, " ")} · {r.incidents} incidents
                  </div>
                  <span className="reco-priority" style={{ background: pc.bg, color: pc.color }}>
                    {r.priority?.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}

export default App;
