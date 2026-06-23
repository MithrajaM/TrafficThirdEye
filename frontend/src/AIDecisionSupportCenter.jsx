import React, { useState } from 'react';
import './AIDecisionSupportCenter.css';

const locations = {
  hebbal: { label: "Hebbal Flyover", lat: "13.0359", lon: "77.5970", zone: "1", corridor: "6" },
  silkboard: { label: "Silk Board Junction", lat: "12.9176", lon: "77.6247", zone: "3", corridor: "5" },
  mgroad: { label: "MG Road", lat: "12.9757", lon: "77.6068", zone: "2", corridor: "2" },
  brigade: { label: "Brigade Road", lat: "12.9730", lon: "77.6082", zone: "2", corridor: "2" },
  whitefield: { label: "Whitefield", lat: "12.9698", lon: "77.7499", zone: "4", corridor: "4" },
  yelahanka: { label: "Yelahanka", lat: "13.1007", lon: "77.5963", zone: "1", corridor: "6" },
  electroniccity: { label: "Electronic City", lat: "12.8456", lon: "77.6603", zone: "4", corridor: "5" },
  marathahalli:   { label: "Marathahalli Junction", lat: "12.9591", lon: "77.6974", zone: "4", corridor: "4" },
  koramangala:    { label: "Koramangala", lat: "12.9352", lon: "77.6245", zone: "3", corridor: "3" },
  jayanagar:      { label: "Jayanagar", lat: "12.9250", lon: "77.5938", zone: "2", corridor: "2" },
  indiranagar:    { label: "Indiranagar", lat: "12.9784", lon: "77.6408", zone: "2", corridor: "3" },
  majestic:       { label: "Majestic Bus Stand", lat: "12.9767", lon: "77.5723", zone: "1", corridor: "1" },
  krmarket:       { label: "KR Market", lat: "12.9637", lon: "77.5767", zone: "1", corridor: "1" },
  banashankari:   { label: "Banashankari", lat: "12.9181", lon: "77.5736", zone: "2", corridor: "2" },
  bellandur:      { label: "Bellandur", lat: "12.9279", lon: "77.6762", zone: "4", corridor: "4" },
  hosurroad:      { label: "Hosur Road", lat: "12.9005", lon: "77.6391", zone: "3", corridor: "5" },
  outerringroad:  { label: "Outer Ring Road", lat: "12.9716", lon: "77.6412", zone: "4", corridor: "5" },
  airportroad:    { label: "Airport Road", lat: "13.0810", lon: "77.6412", zone: "1", corridor: "6" },
};

const eventTypes = [
  { value: "0", label: "Construction" },
  { value: "1", label: "Public Event" },
  { value: "2", label: "Procession" },
  { value: "3", label: "VIP Movement" },
  { value: "4", label: "Protest" },
  { value: "5", label: "Accident" },
  { value: "6", label: "Water Logging" },
  { value: "7", label: "Vehicle Breakdown" },
  { value: "8", label: "Road Maintenance" },
  { value: "9", label: "Signal Failure" },
  { value: "10", label: "Heavy Rainfall" },
  { value: "11", label: "Festival Crowd" },
  { value: "12", label: "Metro Construction" },
  { value: "13", label: "Sports Event" },
  { value: "14", label: "Emergency Vehicle Movement" },
];

function AIDecisionSupportCenter() {
  const [location, setLocation] = useState('hebbal');
  const [eventCause, setEventCause] = useState('1');
  const [risk, setRisk] = useState(82);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    setLoading(true);
    // Mock AI model response
    const mockPrediction = {
      future_throughput: 10,
      throughput_drop: -30,
      recovered_throughput: 35,
      factors: [`Congestion Risk Score: ${risk}/100`],
      confidence: 92,
      impact: {
        without_action: 10,
        with_intervention: 35,
        improvement: 250,
      },
      recommended_actions: {
        police: {
          required: '6 Officers',
          action: 'Deploy Police',
        },
        barricades: {
          required: '8 Barricades',
        },
        diversion: {
          route: 'Hosur Road → Electronic City',
        },
      },
    };
    setPrediction(mockPrediction);
    setLoading(false);
  };

  return (
    <div className="ai-decision-support-center">
      <div className="page-header">
        <h1>AI Decision Support Center</h1>
        <p>This page shows how AI helps authorities respond to congestion.</p>
      </div>

      <div className="main-grid">
        <div className="left-column">
          <div className="card">
            <div className="card-header">
              <h3>Incident Analysis</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Location</label>
                <select value={location} onChange={e => setLocation(e.target.value)}>
                  {Object.entries(locations).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Event Cause</label>
                <select value={eventCause} onChange={e => setEventCause(e.target.value)}>
                  {eventTypes.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Risk</label>
                <input type="number" value={risk} onChange={e => setRisk(parseInt(e.target.value, 10))} />
              </div>
              <button onClick={handlePredict} disabled={loading}>
                {loading ? 'Predicting...' : 'Get AI Recommendation'}
              </button>
            </div>
          </div>

          {prediction && (
            <div className="card">
              <div className="card-header">
                <h3>AI Recommended Actions</h3>
              </div>
              <div className="card-body">
                <div className="action-card">
                  <div className="action-icon">🚓</div>
                  <div className="action-details">
                    <div className="action-label">Police Required</div>
                    <div className="action-value">{prediction.recommended_actions.police.required}</div>
                  </div>
                </div>
                <div className="action-card">
                  <div className="action-icon">🚧</div>
                  <div className="action-details">
                    <div className="action-label">Barricades Required</div>
                    <div className="action-value">{prediction.recommended_actions.barricades.required}</div>
                  </div>
                </div>
                <div className="action-card">
                  <div className="action-icon">🛣️</div>
                  <div className="action-details">
                    <div className="action-label">Diversion Route</div>
                    <div className="action-value">{prediction.recommended_actions.diversion.route}</div>
                  </div>
                </div>
                <div className="action-card">
                  <div className="action-icon">⚠️</div>
                  <div className="action-details">
                    <div className="action-label">Traffic Action</div>
                    <div className="action-value">{prediction.recommended_actions.police.action}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="right-column">
          {prediction ? (
            <>
              <div className="kpi-grid">
                <div className="kpi-card red">
                  <h4>Future Throughput</h4>
                  <p>{prediction.future_throughput} veh/min</p>
                </div>
                <div className="kpi-card orange">
                  <h4>Throughput Drop</h4>
                  <p>{prediction.throughput_drop} veh/min</p>
                </div>
                <div className="kpi-card green">
                  <h4>Recovery</h4>
                  <p>{prediction.recovered_throughput} veh/min</p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Why AI Suggested This</h3>
                </div>
                <div className="card-body">
                  {prediction.factors.map((factor, index) => (
                    <div key={index} className="factor-badge">{factor}</div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>AI Confidence</h3>
                </div>
                <div className="card-body">
                  <div className="confidence-score">{prediction.confidence}%</div>
                  <div className="confidence-subtitle">Based on historical traffic patterns</div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Predicted Impact</h3>
                </div>
                <div className="card-body impact-summary">
                  <div>
                    <span>Without Action:</span>
                    <strong>{prediction.impact.without_action} veh/min</strong>
                  </div>
                  <div>
                    <span>With Intervention:</span>
                    <strong>{prediction.impact.with_intervention} veh/min</strong>
                  </div>
                  <div>
                    <span>Improvement:</span>
                    <strong className="improvement-value">+{prediction.impact.improvement}%</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Response Timeline</h3>
                </div>
                <div className="card-body">
                  <div className="timeline-steps">
                    <div className="timeline-step">
                      <div className="timeline-step-icon">1️⃣</div>
                      <div className="timeline-step-label">Deploy Officers</div>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className="timeline-step">
                      <div className="timeline-step-icon">2️⃣</div>
                      <div className="timeline-step-label">Install Barricades</div>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className="timeline-step">
                      <div className="timeline-step-icon">3️⃣</div>
                      <div className="timeline-step-label">Activate Diversion</div>
                    </div>
                    <div className="timeline-connector"></div>
                    <div className="timeline-step">
                      <div className="timeline-step-icon">4️⃣</div>
                      <div className="timeline-step-label">Monitor Recovery</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="placeholder-text">
              Click "Get AI Recommendation" to populate the dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIDecisionSupportCenter;