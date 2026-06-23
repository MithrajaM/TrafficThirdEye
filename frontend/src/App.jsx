import { useEffect, useState, useMemo } from "react";
import "./App.css";
import { 
  Activity, 
  Map, 
  BrainCircuit, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ShieldAlert, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  CornerDownRight, 
  TrafficCone,
  AlertTriangle,
  MapPin,
  CheckCircle,
  TrendingUp,
  X,
  RefreshCw
} from "lucide-react";
import Dashboard from "./Dashboard";
import MapView from "./Mapview";
import TrafficCommandCenter from "./TrafficCommandCenter";
import AIDecisionSupportCenter from "./AIDecisionSupportCenter";
import Simulator from "./Simulator";
import "./AIDecisionSupportCenter.css";

// Helper for cause styling
const getCauseBadgeStyles = (cause) => {
  switch (cause?.toLowerCase()) {
    case "accident":
      return { label: "Accident", color: "#EF4444", bg: "rgba(239, 68, 68, 0.08)" };
    case "vehicle_breakdown":
      return { label: "Breakdown", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" };
    case "construction":
      return { label: "Construction", color: "#EA580C", bg: "rgba(234, 88, 12, 0.08)" };
    case "public_event":
    case "procession":
    case "vip_movement":
    case "protest":
      return { label: "Special Event", color: "#2563EB", bg: "rgba(37, 99, 235, 0.08)" };
    case "tree_fall":
      return { label: "Tree Fall", color: "#16A34A", bg: "rgba(22, 163, 74, 0.08)" };
    case "water_logging":
      return { label: "Water Logging", color: "#0284C7", bg: "rgba(2, 132, 199, 0.08)" };
    case "pot_holes":
      return { label: "Potholes", color: "#A16207", bg: "rgba(161, 98, 7, 0.08)" };
    case "congestion":
        return { label: "Congestion", color: "#DC2626", bg: "rgba(220, 38, 38, 0.08)" };
    default:
      return { label: "Incident", color: "#64748B", bg: "rgba(100, 116, 139, 0.08)" };
  }
};

// Helper for status badge styling
const getStatusBadgeStyles = (status) => {
  switch (status) {
    case "Critical":
      return { color: "#EF4444", bg: "rgba(239, 68, 68, 0.08)" };
    case "Active":
      return { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" };
    case "Monitoring":
      return { color: "#2563EB", bg: "rgba(37, 99, 235, 0.08)" };
    case "Resolved":
      return { color: "#10B981", bg: "rgba(16, 185, 129, 0.08)" };
    default:
      return { color: "#64748B", bg: "rgba(100, 116, 139, 0.08)" };
  }
};

import OperationsControlPanel from "./OperationsControlPanel";
import SideNav from "./SideNav";
import Header from "./Header";

function App() {
  const [activeTab, setActiveTab] = useState("traffic_command_center");
  const [time, setTime] = useState(new Date());
  
  // Table state
  const [incidents, setIncidents] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCause, setFilterCause] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest, asc = oldest
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOpsPanel, setShowOpsPanel] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [sharedSimData, setSharedSimData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Live Time clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch table incidents from /events
  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/events")
      .then((r) => r.json())
      .then((data) => {
        setIncidents(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching incidents table:", err);
        setLoading(false);
      });
  }, [refreshKey]);

  // Fetch Hotspots for Ops Panel
  useEffect(() => {
    fetch("http://127.0.0.1:8000/hotspots")
      .then((r) => r.json())
      .then((data) => {
        setHotspots(data || []);
      })
      .catch((e) => console.error("Error fetching hotspots for ops panel:", e));
  }, []);

  // Fetch Recommendations
  useEffect(() => {
    fetch("http://127.0.0.1:8000/recommendations")
      .then(r => r.json())
      .then(data => {
        // Fake delay for loading effect
        setTimeout(() => setRecommendations(data || []), 500);
      })
      .catch(e => console.error("Error fetching recommendations:", e));
  }, []);

  // Format Time for Header
  const fmtTime = time.toLocaleString("en-IN", {
    weekday: "short", 
    day: "2-digit", 
    month: "short", 
    year: "numeric",
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit", 
    hour12: true,
  });

  // Filter and Sort incidents for table
  const filteredAndSortedIncidents = useMemo(() => {
    let result = [...incidents];

    // Search filter (ID or Location)
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (inc) =>
          inc.id.toLowerCase().includes(q) ||
          inc.location.toLowerCase().includes(q)
      );
    }

    // Cause/Event Type filter
    if (filterCause !== "all") {
      result = result.filter((inc) => {
        if (filterCause === "accident") return inc.event_cause === "accident";
        if (filterCause === "breakdown") return inc.event_cause === "vehicle_breakdown";
        if (filterCause === "construction") return inc.event_cause === "construction";
        if (filterCause === "special") return ["public_event", "procession", "vip_movement", "protest"].includes(inc.event_cause);
        if (filterCause === "tree_fall") return inc.event_cause === "tree_fall";
        if (filterCause === "water_logging") return inc.event_cause === "water_logging";
        if (filterCause === "pot_holes") return inc.event_cause === "pot_holes";
        if (filterCause === "congestion") return inc.event_cause === "congestion";
        return true;
      });
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((inc) => inc.status.toLowerCase() === filterStatus.toLowerCase());
    }

    // Sort by Timestamp
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [incidents, searchTerm, filterCause, filterStatus, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="app-grid-layout">
      <SideNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onToggleOpsPanel={() => setShowOpsPanel(p => !p)}
      />
      {showOpsPanel && (
        <OperationsControlPanel
          incidents={incidents}
          hotspots={hotspots}
          onClose={() => setShowOpsPanel(false)}
          onFocusCoord={() => setActiveTab("map")}
        />
      )}
      <div className="main-content-area">
        <Header time={fmtTime} />
        <main className="page-content">
          {activeTab === "traffic_command_center" && <TrafficCommandCenter />}

          {/* PAGE 2: Live Incident Map */}
          {activeTab === "map" && (
            <div className="page-view full-height animate-fade-in">
              <div className="card map-screen-card">
                <div className="card-header map-header">
                  <div>
                    <h3>Live Incident & Hotspot Map</h3>
                    <p className="card-subtitle">Real-time geospatial representation of traffic anomalies in Bengaluru</p>
                  </div>
                  <div className="map-legend-wrapper">
                    <button className="map-legend-toggle" onClick={() => setShowLegend(!showLegend)}>
                      <span>Event Type</span>
                      <ChevronDown size={16} style={{ transform: showLegend ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>
                    {showLegend && (
                      <div className="map-legend">
                        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#EF4444" }} /> Accident</div>
                        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#F59E0B" }} /> Breakdown</div>
                        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#EA580C" }} /> Construction</div>
                        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#3B82F6" }} /> Public Event</div>
                        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#16A34A" }} /> Tree Fall</div>
                        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#0284C7" }} /> Water Logging</div>
                        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#A16207" }} /> Potholes</div>
                        <div className="legend-item"><span className="legend-dot" style={{ backgroundColor: "#DC2626" }} /> Congestion</div>
                        <div className="legend-item"><span className="legend-glow" /> Hotspot Zone</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="map-view-container">
                  <MapView 
                    onSimulate={(data) => {
                      setSharedSimData(data);
                      setActiveTab("ai_center");
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* PAGE 3: AI Decision Support Center */}
          {activeTab === "ai_center" && (
            <div className="page-view full-height animate-fade-in">
              <AIDecisionSupportCenter />
            </div>
          )}

          {/* PAGE 3: AI Traffic Impact Simulator */}
          {activeTab === "simulator" && (
            <div className="page-view animate-fade-in">
              <Simulator 
                initialData={sharedSimData}
                clearInitialData={() => setSharedSimData(null)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;