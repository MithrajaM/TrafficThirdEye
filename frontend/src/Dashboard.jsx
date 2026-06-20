import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return <div className="kpi-strip"><div className="kpi-card"><div className="kpi-value">—</div><div className="kpi-label">Loading...</div></div></div>;

  const cards = [
    { label: "Total Events",       value: stats.total_events,      sub: "All recorded incidents" },
    { label: "Unique Junctions",   value: stats.hotspot_count,     sub: "Affected junctions"     },
    { label: "High-Risk Junctions",value: stats.high_risk_count,   sub: "Priority: High"         },
    { label: "Vehicle Breakdowns", value: stats.vehicle_breakdown,  sub: "Event cause breakdown"  },
    { label: "Accidents",          value: stats.accident,          sub: "Reported accidents"     },
  ];

  return (
    <div className="kpi-strip">
      {cards.map((c) => (
        <div className="kpi-card" key={c.label}>
          <div className="kpi-value">{c.value ?? "—"}</div>
          <div className="kpi-label">{c.label}</div>
          <div className="kpi-sub">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
