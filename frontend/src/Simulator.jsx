import { useState } from "react";

const RISK = (s) =>
  s >= 85 ? { label: "CRITICAL", color: "#EF4444", bg: "rgba(239,68,68,0.1)"  }
: s >= 60 ? { label: "HIGH",     color: "#F59E0B", bg: "rgba(245,158,11,0.1)" }
: s >= 40 ? { label: "MEDIUM",   color: "#F59E0B", bg: "rgba(245,158,11,0.1)" }
:           { label: "LOW",      color: "#10B981", bg: "rgba(16,185,129,0.1)" };

const ACTION_LABEL = {
  no_action:          { text: "No Action Required", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  deploy_police:      { text: "Deploy Police",       color: "#2563EB", bg: "rgba(37,99,235,0.1)"  },
  diversion_required: { text: "Diversion Required",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  emergency_protocol: { text: "Emergency Protocol",  color: "#EF4444", bg: "rgba(239,68,68,0.1)"  },
};

const LOCS = {
  hebbal:     { lat: "13.0358", lon: "77.5970", zone: "1", corridor: "1" },
  silkboard:  { lat: "12.9170", lon: "77.6229", zone: "3", corridor: "2" },
  mgroad:     { lat: "12.9757", lon: "77.6011", zone: "2", corridor: "3" },
  brigade:    { lat: "12.9719", lon: "77.6060", zone: "2", corridor: "3" },
  whitefield: { lat: "12.9698", lon: "77.7499", zone: "4", corridor: "4" },
  yelahanka:  { lat: "13.1007", lon: "77.5963", zone: "1", corridor: "1" },
};

function Simulator({ onResult }) {
  const [form, setForm] = useState({
    location: "hebbal", event_cause: "1", congestion_risk_score: "82",
    event_type: "1", priority: "1", is_peak_hour: "1",
    event_duration_minutes: "90", requires_road_closure: "1",
    latitude: "13.0358", longitude: "77.5970", zone: "1", corridor: "1",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const predict = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type:             parseInt(form.event_type),
          event_cause:            parseInt(form.event_cause),
          priority:               parseInt(form.priority),
          latitude:               parseFloat(form.latitude),
          longitude:              parseFloat(form.longitude),
          zone:                   parseInt(form.zone),
          corridor:               parseInt(form.corridor),
          is_peak_hour:           parseInt(form.is_peak_hour),
          event_duration_minutes: parseInt(form.event_duration_minutes),
          requires_road_closure:  parseInt(form.requires_road_closure),
          congestion_risk_score:  parseInt(form.congestion_risk_score),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onResult({ ...data, congestion_risk_score: parseInt(form.congestion_risk_score) });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>AI Event Simulator</h3>
        <span className="card-tag">ML Model</span>
      </div>
      <div className="card-body">
        <div className="sim-form">

          <div className="sim-field">
            <label>Location</label>
            <select value={form.location} onChange={(e) => {
              const l = LOCS[e.target.value] ?? {};
              setForm((f) => ({ ...f, location: e.target.value, latitude: l.lat, longitude: l.lon, zone: l.zone, corridor: l.corridor }));
            }}>
              <option value="hebbal">Hebbal Flyover</option>
              <option value="silkboard">Silk Board Junction</option>
              <option value="mgroad">MG Road</option>
              <option value="brigade">Brigade Road</option>
              <option value="whitefield">Whitefield</option>
              <option value="yelahanka">Yelahanka</option>
            </select>
          </div>

          <div className="sim-field">
            <label>Event</label>
            <select value={form.event_cause} onChange={(e) => set("event_cause", e.target.value)}>
              <option value="0">Construction</option>
              <option value="1">Public Event</option>
              <option value="2">Procession</option>
              <option value="3">VIP Movement</option>
              <option value="4">Protest</option>
              <option value="5">Accident</option>
              <option value="6">Water Logging</option>
              <option value="7">Vehicle Breakdown</option>
            </select>
          </div>

          <div className="sim-field">
            <label>Congestion Risk Score (0 – 100)</label>
            <input
              type="number" min="0" max="100"
              value={form.congestion_risk_score}
              onChange={(e) => set("congestion_risk_score", e.target.value)}
            />
          </div>

          <div className="sim-divider" />

          <button className="predict-btn" onClick={predict} disabled={loading}>
            {loading ? "Analyzing..." : "Predict Traffic Impact"}
          </button>

          {error && <div className="err-box">{error}</div>}

        </div>
      </div>
    </div>
  );
}

export function ResultCards({ result }) {
  const risk   = RISK(result.congestion_risk_score);
  const action = ACTION_LABEL[result.traffic_action] ?? ACTION_LABEL.no_action;

  return (
    <>
      {/* 3 Big Throughput Cards */}
      <div className="throughput-section">
        <div className="throughput-title">ML Prediction Results</div>
        <div className="throughput-grid">
          <div className="tp-card green">
            <div className="tp-number" style={{ color: "#10B981" }}>40</div>
            <div className="tp-unit">vehicles / min</div>
            <div className="tp-label">Normal Throughput Baseline</div>
          </div>
          <div className="tp-card red">
            <div className="tp-number" style={{ color: "#EF4444" }}>{result.future_throughput}</div>
            <div className="tp-unit">vehicles / min</div>
            <div className="tp-label">Predicted — Without Intervention</div>
          </div>
          <div className="tp-card blue">
            <div className="tp-number" style={{ color: "#2563EB" }}>{result.recovered_throughput}</div>
            <div className="tp-unit">vehicles / min</div>
            <div className="tp-label">Recovered — With AI Plan</div>
          </div>
        </div>
      </div>

      {/* Risk + Action */}
      <div style={{ padding: "0 36px 24px" }}>
        <div className="card">
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span className="risk-badge" style={{ background: risk.bg, color: risk.color }}>
              {risk.label} RISK
            </span>
            <span className="risk-badge" style={{ background: action.bg, color: action.color }}>
              {action.text}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748B" }}>
              Throughput drop:&nbsp;
              <strong style={{ color: "#EF4444" }}>{result.throughput_drop} veh/min</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Intervention Cards */}
      <div className="action-section">
        <div className="throughput-title">Recommended Interventions</div>
        <div className="action-grid">
          <div className="action-card">
            <div className="action-val" style={{ color: "#2563EB" }}>{result.police_required}</div>
            <div className="action-lbl">Police Officers</div>
          </div>
          <div className="action-card">
            <div className="action-val" style={{ color: "#F59E0B" }}>{result.barricades_required}</div>
            <div className="action-lbl">Barricades</div>
          </div>
          <div className="action-card">
            <div className="action-val" style={{ color: "#10B981", fontSize: 15, letterSpacing: 0 }}>
              {result.diversion_route}
            </div>
            <div className="action-lbl">Diversion Route</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Simulator;
