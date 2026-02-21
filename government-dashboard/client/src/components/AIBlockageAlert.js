import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIBlockageAlert = () => {
  const [blockageData, setBlockageData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockageAlerts();
    const interval = setInterval(fetchBlockageAlerts, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBlockageAlerts = async () => {
    try {
      const token = localStorage.getItem('govToken');
      const response = await axios.get('http://localhost:5001/api/gov/blockage-alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlockageData(response.data);
    } catch (err) {
      console.error('Error fetching blockage alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAlert = async (alertId, action) => {
    try {
      const token = localStorage.getItem('govToken');
      await axios.post(
        `http://localhost:5001/api/gov/blockage-alerts/${alertId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBlockageAlerts();
    } catch (err) {
      alert('Error handling alert');
    }
  };

  return (
    <div className="blockage-alerts">
      <div className="section-header">
        <h2>🚨 AI Blockage Alerts</h2>
        <button onClick={fetchBlockageAlerts} className="refresh-btn">Refresh</button>
      </div>

      {loading && <p>Loading alerts...</p>}

      <div className="alerts-grid">
        {blockageData.map((alert) => (
          <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
            <h3>{alert.location}</h3>
            <div className="alert-details">
              <p><strong>Risk Level:</strong> {alert.riskLevel}%</p>
              <p><strong>Detected:</strong> {new Date(alert.timestamp).toLocaleString()}</p>
              <p><strong>Recommendation:</strong> {alert.recommendation}</p>
            </div>
            <div className="alert-actions">
              <button
                onClick={() => handleAlert(alert.id, 'acknowledge')}
                className="action-btn acknowledge"
              >
                ✓ Acknowledge
              </button>
              <button
                onClick={() => handleAlert(alert.id, 'dispatch')}
                className="action-btn dispatch"
              >
                📍 Dispatch Team
              </button>
            </div>
          </div>
        ))}
      </div>

      {blockageData.length === 0 && !loading && (
        <p className="no-data">No blockage alerts detected. System operating normally.</p>
      )}
    </div>
  );
};

export default AIBlockageAlert;
