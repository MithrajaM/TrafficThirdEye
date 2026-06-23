import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, RefreshCw, X, AlertTriangle, MapPin, Clock, CornerDownRight } from 'lucide-react';
import './TrafficCommandCenter.css';

// Helper for cause styling
const getCauseBadgeStyles = (cause) => {
  switch (cause?.toLowerCase()) {
    case "accident": return { label: "Accident", color: "#EF4444", bg: "rgba(239, 68, 68, 0.08)" };
    case "vehicle_breakdown": return { label: "Breakdown", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.08)" };
    case "congestion": return { label: "Congestion", color: "#DC2626", bg: "rgba(220, 38, 38, 0.08)" };
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

function TrafficCommandCenter() {
  const [kpiData, setKpiData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
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

        const dashboardData = await dashboardRes.json();
        const eventsData = await eventsRes.json();
        const recommendationsData = await recommendationsRes.json();

        setKpiData(dashboardData);
        setEventsData(eventsData || []);
        setRecommendations(recommendationsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Unable to load traffic data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  const combinedAndFilteredIncidents = useMemo(() => {
    const recommendationsMap = new Map(recommendations.map(rec => [rec.event_id, rec]));

    let result = eventsData.map(event => ({
      ...event,
      recommendation: recommendationsMap.get(event.id) || {},
    }));

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(inc => 
        inc.id.toLowerCase().includes(q) || 
        (inc.junction && inc.junction.toLowerCase().includes(q))
      );
    }

    if (filterCause !== "all") {
      result = result.filter(inc => inc.event_cause?.toLowerCase() === filterCause.toLowerCase());
    }

    if (filterStatus !== "all") {
      result = result.filter(inc => {
        const status = inc.recommendation?.status?.toLowerCase();
        return status === filterStatus.toLowerCase();
      });
    }

    result.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [eventsData, recommendations, searchTerm, filterCause, filterStatus, sortOrder]);

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
            <span className="kpi-value">{loading ? '...' : kpiData?.total_events ?? 'N/A'}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Active Hotspots</span>
            <span className="kpi-value">{loading ? '...' : kpiData?.hotspot_count ?? 'N/A'}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">High Risk Locations</span>
            <span className="kpi-value">{loading ? '...' : kpiData?.high_risk_count ?? 'N/A'}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Vehicle Breakdowns</span>
            <span className="kpi-value">{loading ? '...' : kpiData?.vehicle_breakdown ?? 'N/A'}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Accident Reports</span>
            <span className="kpi-value">{loading ? '...' : kpiData?.accident ?? 'N/A'}</span>
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
            <span className="badge-count">{combinedAndFilteredIncidents.length} logs found</span>
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
          ) : combinedAndFilteredIncidents.length === 0 ? (
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
                {combinedAndFilteredIncidents.map((event) => {
                  const causeStyle = getCauseBadgeStyles(event.event_cause);
                  const statusStyle = getStatusBadgeStyles(event.recommendation?.status);
                  return (
                    <tr key={event.id}>
                      <td className="font-mono incident-id-cell">{event.id}</td>
                      <td>
                        <div className="location-cell">
                          <MapPin size={13} style={{ color: "#94A3B8" }} />
                          <span>{event.junction || 'N/A'}</span>
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
                          <span>{event.timestamp ? new Date(event.timestamp).toLocaleString() : "Timestamp Not Available"}</span>
                        </div>
                      </td>
                      <td className="action-cell-text">
                        <CornerDownRight size={12} style={{ color: "#3B82F6", marginRight: 5 }} />
                        {event.recommendation?.action_required || 'No action specified'}
                      </td>
                      <td className="action-cell-text font-semibold text-blue-primary">
                        {event.recommendation?.action_taken || 'Pending'}
                      </td>
                      <td>
                        <span className="status-pill-badge" style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
                          <span className="dot" style={{ backgroundColor: statusStyle.color }} />
                          {event.recommendation?.status || 'Unknown'}
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