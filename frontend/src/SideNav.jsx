import { Activity, Map, BrainCircuit, Sliders } from "lucide-react";
import "./SideNav.css";

function SideNav({ activeTab, setActiveTab, onToggleOpsPanel }) {
  return (
    <aside className="side-nav">
      <div className="logo-container">
        <svg viewBox="0 0 44 44" className="shield-logo">
          <path d="M22 2C12 2 4 6 4 16C4 28 22 42 22 42C22 42 40 28 40 16C40 6 32 2 22 2Z" fill="none" stroke="#2563EB" strokeWidth="3" />
          <circle cx="22" cy="18" r="7" fill="none" stroke="#2563EB" strokeWidth="2.5" />
          <circle cx="22" cy="18" r="2.5" fill="#EF4444" className="pulsing-eye-core" />
          <line x1="22" y1="25" x2="22" y2="35" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="logo-titles">
          <h1>Traffic Third Eye</h1>
          <p>Bengaluru Traffic Intelligence Center</p>
        </div>
      </div>
      <nav className="side-nav-links">
        <button
          className={`nav-link-btn ${activeTab === "traffic_command_center" ? "active" : ""}`}
          onClick={() => setActiveTab("traffic_command_center")}
        >
          <Activity size={18} />
          <span>Traffic Command Center</span>
        </button>
        <button
          className={`nav-link-btn ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          <Map size={18} />
          <span>Live Incident Map</span>
        </button>
        <button
          className={`nav-link-btn ${activeTab === "ai_center" ? "active" : ""}`}
          onClick={() => setActiveTab("ai_center")}
        >
          <BrainCircuit size={18} />
          <span>AI Decision Support Center</span>
        </button>
      </nav>
      <div className="side-nav-footer">
        <button className="nav-link-btn" onClick={onToggleOpsPanel}>
          <Sliders size={18} />
          <span>Operations Control</span>
        </button>
      </div>
    </aside>
  );
}

export default SideNav;