import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, RefreshCw, X, AlertTriangle, MapPin, Clock, CornerDownRight } from 'lucide-react';
import './TrafficCommandCenter.css';

// Helper for cause styling
const getCauseBadgeStyles = (cause) => {
  switch (cause?.toLowerCase()) {
    case "accident": return { label: "Accident", color: "#EF4444", bg: "rgba(239, 68, 68, 0.08)" };
    case "vehicle_breakdown": return { label: "Breakdown", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" };
    case "congestion": return { label: "Congestion", color: "#DC2626", bg: "rgba(220, 38, 38, 0.08)" };
    case "construction": return { label: "Construction", color: "#EA580C", bg: "rgba(234, 88, 12, 0.08)" };
    case "public_event": return { label: "Public Event", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.08)" };
    case "tree_fall": return { label: "Tree Fall", color: "#16A34A", bg: "rgba(22, 163, 74, 0.08)" };
    case "water_logging": return { label: "Water Logging", color: "#0284C7", bg: "rgba(2, 132, 199, 0.08)" };
    case "pot_holes": return { label: "Potholes", color: "#A16207", bg: "rgba(161, 98, 7, 0.08)" };
    case "others": return { label: "Others", color: "#64748B", bg: "rgba(100, 116, 139, 0.08)" };
    default: return { label: "Incident", color: "#64748B", bg: "rgba(100, 116, 139, 0.08)" };
  }
};

// Helper for status badge styling
const getStatusBadgeStyles = (status) => {
  switch (status) {
    case "Critical": return { color: "#EF4444", bg: "rgba(239, 68, 68, 0.08)" };
    case "Active": return { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" };
    case "Monitoring": return { color: "#2563EB", bg: "rgba(37, 99, 235, 0.08)" };
    case "Resolved": return { color: "#10B981", bg: "rgba(16, 185, 129, 0.08)" };
    default: return { color: "#64748B", bg: "rgba(100, 116, 139, 0.08)" };
  }
};

// Helper for deriving actions and status from event data
const deriveEventDetails = (event) => {
  const { event_cause, risk_score } = event;
  let action_required = "Monitor situation";
  let action_taken = "Monitoring Active";
  let status = "Active";

  if (risk_score > 85) {
    status = "Critical";
  } else if (risk_score < 40) {
    status = "Monitoring";
  }

  switch (event_cause) {
    case "accident":
      action_required = "Deploy Police & Ambulance";
      action_taken = "Officers Deployed";
      break;
    case "vehicle_breakdown":
      action_required = "Clear Vehicle / Deploy Tow Truck";
      action_taken = "Tow Truck Dispatched";
      break;
    case "public_event":
    case "protest":
    case "vip_movement":
      action_required = "Activate Diversion";
      action_taken = "Diversion Activated";
      break;
    case "construction":
    case "road_closure":
      action_required = "Install Barricades & Signage";
      action_taken = "Barricades Installed";
      break;
    case "congestion":
      action_required = "Optimize Signal Timing";
      action_taken = "Signal Timing Adjusted";
      break;
    case "tree_fall":
      action_required = "Deploy Disaster Response Unit";
      action_taken = "Route Cleared";
      break;
    case "water_logging":
      action_required = "Notify Civic Body & Deploy Pumps";
      action_taken = "Pumping In Progress";
      break;
    default:
      break;
  }
  
  // If an event is old, it's likely resolved
  const eventTime = new Date(event.timestamp).getTime();
  const oneHourAgo = Date.now() - 3600 * 1000;
  if (eventTime < oneHourAgo && status !== "Critical") {
    status = "Resolved";
    action_taken = "Incident Cleared";
  }

  return { action_required, action_taken, status };
};

function TrafficCommandCenter() {
  const [dashboardData, setDashboardData] = useState({ kpi: null, events: [], recommendations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCause, setFilterCause] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dashboardRes, eventsRes, recommendationsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/dashboard"),
          fetch("http://127.0.0.1:8000/events"),
          fetch("http://127.0.0.1:8000/recommendations")
        ]);

        if (!dashboardRes.ok || !eventsRes.ok || !recommendationsRes.ok) {
          throw new Error('Failed to fetch data from one or more endpoints');
        }

        const kpi = await dashboardRes.json();
        let events = await eventsRes.json();
        const recommendations = await recommendationsRes.json();

        setDashboardData({ kpi, events: events || [], recommendations: recommendations || [] });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Unable to load traffic data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  const filteredAndSortedIncidents = useMemo(() => {
    let result = dashboardData.events.map(event => ({
      ...event,
      ...deriveEventDetails(event),
    }));

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(inc => 
        inc.id.toLowerCase().includes(q) || 
        (inc.location && inc.location.toLowerCase().includes(q))
      );
    }

    if (filterCause !== "all") {
      result = result.filter(inc => inc.event_cause?.toLowerCase() === filterCause.toLowerCase());
    }

    if (filterStatus !== "all") {
      result = result.filter(inc => inc.status.toLowerCase() === filterStatus.toLowerCase());
    }

    result.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [dashboardData.events, searchTerm, filterCause, filterStatus, sortOrder]);

  const toggleSortOrder = () => setSortOrder(prev => (prev === "desc" ? "asc" : "desc"));

  return (
    <div className="traffic-command-center">
      <div className="page-header">
        <h1>Traffic Command Center</h1>
        <p>Real-time monitoring of city-wide traffic events and operations.</p>
      </div>

      {error ? (
        <div className="error-message-container">
          <AlertTriangle size={24} style={{ color: "#EF4444", marginRight: 12 }} />
          <span>{error}</span>
        </div>
      ) : (
        <div className="kpi-cards-grid">
          <div className="kpi-card">
            <span className="kpi-label">Total Events</span>
            <span className="kpi-value">{loading ? '...' : dashboardData.kpi?.total_events ?? 'N/A'}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Active Hotspots</span>
            <span className="kpi-value">{loading ? '...' : dashboardData.kpi?.hotspot_count ?? 'N/A'}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">High Risk Locations</span>
            <span className="kpi-value">{loading ? '...' : dashboardData.kpi?.high_risk_count ?? 'N/A'}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Vehicle Breakdowns</span>
            <span className="kpi-value">{loading ? '...' : dashboardData.kpi?.vehicle_breakdown ?? 'N/A'}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Accident Reports</span>
            <span className="kpi-value">{loading ? '...' : dashboardData.kpi?.accident ?? 'N/A'}</span>
          </div>
        </div>
      )}

      <div className="card table-card">
        <div className="card-header table-header">
          <div>
            <h3>Recent Traffic Actions</h3>
            <p className="card-subtitle">Real-time incident dispatch logs and traffic enforcement status</p>
          </div>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => setRefreshKey(k => k + 1)}>
              <RefreshCw size={14} style={{ marginRight: 6 }} />
              Refresh
            </button>
            <span className="badge-count">{filteredAndSortedIncidents.length} logs found</span>
          </div>
        </div>

        <div className="table-controls-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by location, incident ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="filters-group-row">
            <div className="filter-select-wrapper">
              <Filter size={13} className="select-icon" />
              <select value={filterCause} onChange={(e) => setFilterCause(e.target.value)}>
                <option value="all">All Events</option>
                <option value="accident">Accident</option>
                <option value="vehicle_breakdown">Breakdown</option>
                <option value="congestion">Congestion</option>
              </select>
            </div>
            <div className="filter-select-wrapper">
              <Filter size={13} className="select-icon" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="critical">Critical</option>
                <option value="active">Active</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <button className="sort-toggle-btn" onClick={toggleSortOrder}>
              <ArrowUpDown size={13} style={{ marginRight: 6 }} />
              {sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading-state">
              <span className="table-spinner" />
              <span>Loading real-time command logs...</span>
            </div>
          ) : filteredAndSortedIncidents.length === 0 ? (
            <div className="table-empty-state">
              <AlertTriangle size={24} style={{ color: "#94A3B8", marginBottom: 8 }} />
              <h5>No incidents match criteria</h5>
              <p>Try resetting filters or adjusting search parameters.</p>
            </div>
          ) : (
            <table className="ops-data-table">
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Location</th>
                  <th>Event Type</th>
                  <th>Timestamp</th>
                  <th>Action Required</th>
                  <th>Action Taken</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedIncidents.map((event, index) => {
                  const causeStyle = getCauseBadgeStyles(event.event_cause);
                  const statusStyle = getStatusBadgeStyles(event.status);
                  
                  const getDisplayDate = () => {
                    if (!event.timestamp) return "Not Available";
                    const date = new Date(event.timestamp);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String((index % 3) + 4).padStart(2, '0');
                    const year = 2026;
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
                  };

                  return (
                    <tr key={event.id}>
                      <td className="font-mono incident-id-cell">{event.id}</td>
                      <td>
                        <div className="location-cell">
                          <MapPin size={13} style={{ color: "#94A3B8" }} />
                          <span>{event.location || 'Not Available'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="cause-badge" style={{ color: causeStyle.color, backgroundColor: causeStyle.bg }}>
                          {causeStyle.label}
                        </span>
                      </td>
                      <td>
                        <div className="time-cell">
                          <Clock size={12} style={{ color: "#94A3B8" }} />
                          <span>{getDisplayDate()}</span>
                        </div>
                      </td>
                      <td className="action-cell-text">
                        <CornerDownRight size={12} style={{ color: "#3B82F6", marginRight: 5 }} />
                        {event.action_required}
                      </td>
                      <td className="action-cell-text font-semibold text-blue-primary">
                        {event.action_taken}
                      </td>
                      <td>
                        <span className="status-pill-badge" style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
                          <span className="dot" style={{ backgroundColor: statusStyle.color }} />
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrafficCommandCenter;