import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SafetyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'health',
    message: '',
    severity: 'medium',
    affectedVillage: '',
  });

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('govToken');
      const response = await axios.get('http://localhost:5001/api/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(response.data);
    } catch (err) {
      console.error('Error fetching safety alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('govToken');
      await axios.post('http://localhost:5001/api/alerts', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Alert created successfully!');
      fetchAlerts();
      setShowCreateForm(false);
      setFormData({ type: 'health', message: '', severity: 'medium', affectedVillage: '' });
    } catch (err) {
      alert('Error creating alert');
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('govToken');
      await axios.put(`http://localhost:5001/api/alerts/${alertId}`, { resolved: true }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAlerts();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div className="safety-alerts-section">
      <div className="section-header">
        <div>
          <h2>⚠️ Safety Alerts</h2>
          <div className="filter-buttons">
            {['all', 'high', 'medium', 'low'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="create-alert-btn">
          {showCreateForm ? 'Cancel' : '+ Create Alert'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-alert-form">
          <h3>Create New Safety Alert</h3>
          <form onSubmit={handleCreateAlert}>
            <div className="form-group">
              <label>Alert Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="health">Health</option>
                <option value="water_quality">Water Quality</option>
                <option value="contamination">Contamination</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe the safety alert..."
                required
              />
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Affected Village (Optional)</label>
              <input
                type="text"
                value={formData.affectedVillage}
                onChange={(e) => setFormData({ ...formData, affectedVillage: e.target.value })}
              />
            </div>
            <button type="submit" className="submit-btn">Create Alert</button>
          </form>
        </div>
      )}

      {loading && <p>Loading alerts...</p>}

      <div className="alerts-list">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className={`alert-item severity-${alert.severity}`}>
            <div className="alert-header">
              <h3>{alert.type || alert.title}</h3>
              <span className={`severity-badge ${alert.severity}`}>{alert.severity.toUpperCase()}</span>
            </div>
            <p>{alert.message}</p>
            <div className="alert-meta">
              {alert.affectedVillage && <span>🏘️ {alert.affectedVillage}</span>}
              <span>⏰ {new Date(alert.createdAt || alert.timestamp).toLocaleString()}</span>
              {!alert.resolved && (
                <button 
                  onClick={() => handleResolveAlert(alert.id)}
                  className="resolve-btn"
                >
                  Mark Resolved
                </button>
              )}
              {alert.resolved && <span className="resolved-badge">✓ Resolved</span>}
            </div>
            {alert.recommendation && (
              <div className="recommendation">
                <strong>Recommendation:</strong> {alert.recommendation}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && !loading && (
        <p className="no-data">No safety alerts for the selected filter.</p>
      )}

      <style jsx>{`
        .safety-alerts-section {
          padding: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .section-header h2 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .filter-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .filter-btn:hover {
          border-color: #007bff;
        }

        .create-alert-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        }

        .create-alert-btn:hover {
          background: #218838;
        }

        .create-alert-form {
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .create-alert-form h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .submit-btn {
          width: 100%;
          padding: 10px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        }

        .submit-btn:hover {
          background: #218838;
        }

        .alerts-list {
          display: grid;
          gap: 15px;
        }

        .alert-item {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .alert-item.severity-high {
          border-left-color: #dc3545;
          background-color: #fff5f5;
        }

        .alert-item.severity-medium {
          border-left-color: #ffc107;
          background-color: #fffbf0;
        }

        .alert-item.severity-low {
          border-left-color: #28a745;
          background-color: #f5fff5;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }

        .alert-header h3 {
          margin: 0;
          color: #333;
        }

        .severity-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .severity-badge.high {
          background: #dc3545;
          color: white;
        }

        .severity-badge.medium {
          background: #ffc107;
          color: #333;
        }

        .severity-badge.low {
          background: #28a745;
          color: white;
        }

        .alert-item p {
          margin: 10px 0;
          color: #666;
          line-height: 1.5;
        }

        .alert-meta {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
          font-size: 14px;
          color: #666;
          margin-top: 10px;
        }

        .resolve-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .resolve-btn:hover {
          background: #0056b3;
        }

        .resolved-badge {
          color: #28a745;
          font-weight: 600;
        }

        .recommendation {
          background: #f0f0f0;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
          font-size: 14px;
          border-left: 3px solid #007bff;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 30px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default SafetyAlerts;
