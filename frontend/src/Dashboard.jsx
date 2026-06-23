import { useEffect, useState } from "react";
import "./Dashboard.css";
import { 
  Activity, 
  MapPin, 
  ShieldAlert, 
  Car, 
  AlertTriangle, 
  Zap,
  TrendingUp, 
  TrendingDown 
} from "lucide-react";

function Sparkline({ points, color }) {
  const width = 110;
  const height = 32;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const path = `M ${coords.join(" L ")}`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div className="kpi-card loading" key={i}>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-value" />
            <div className="skeleton skeleton-sub" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Traffic Events",
      value: stats.total_events,
      sub: "City-wide active cases",
      icon: Activity,
      color: "#2563EB", // Blue
      bg: "rgba(37,99,235,0.06)",
    },
    {
      label: "Active Hotspots",
      value: stats.hotspot_count,
      sub: "High density junctions",
      icon: MapPin,
      color: "#F59E0B", // Amber
      bg: "rgba(245,158,11,0.06)",
    },
    {
      label: "High Risk Locations",
      value: stats.high_risk_count,
      sub: "Immediate review needed",
      icon: ShieldAlert,
      color: "#EF4444", // Red
      bg: "rgba(239,68,68,0.06)",
    },
    {
      label: "Vehicle Breakdowns",
      value: stats.vehicle_breakdown,
      sub: "Roadside assistance active",
      icon: Car,
      color: "#D97706", // Amber
      bg: "rgba(217,119,6,0.06)",
    },
    {
      label: "Accident Reports",
      value: stats.accident,
      sub: "Emergency protocols live",
      icon: AlertTriangle,
      color: "#E11D48", // Crimson Red
      bg: "rgba(225,29,72,0.06)",
    },
    {
      label: "Congestion Index",
      value: `${stats.congestion_index ?? 78}%`,
      sub: "City flow optimization rate",
      icon: Zap,
      color: "#10B981", // Green (or Blue-green)
      bg: "rgba(16,185,129,0.06)",
    }
  ];

  return (
    <div className="kpi-grid">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div className="kpi-card" key={c.label}>
            <div className="kpi-card-header">
              <span className="kpi-label">{c.label}</span>
              <div className="kpi-icon-wrapper" style={{ backgroundColor: c.bg, color: c.color }}>
                <Icon size={18} strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="kpi-value-row">
              <span className="kpi-value">{c.value}</span>
            </div>

            <div className="kpi-card-footer">
              <span className="kpi-sub">{c.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Dashboard;