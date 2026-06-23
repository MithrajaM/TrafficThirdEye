import React, { useState } from 'react';
import './AIDecisionSupportCenter.css';

function AIDecisionSupportCenter() {
  const [location, setLocation] = useState('Hebbal Flyover');
  const [eventCause, setEventCause] = useState('Public Event');
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
                  <option>Hebbal Flyover</option>
                  <option>Silk Board</option>
                  <option>KR Puram</option>
                </select>
              </div>
              <div className="form-group">
                <label>Event Cause</label>
                <select value={eventCause} onChange={e => setEventCause(e.target.value)}>
                  <option>Public Event</option>
                  <option>Accident</option>
                  <option>Vehicle Breakdown</option>
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