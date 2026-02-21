import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import UserManagement from '../components/UserManagement';
import ChlorinationReminder from '../components/ChlorinationReminder';
import SafetyAlerts from '../components/SafetyAlerts';
import ComplaintAnalysis from '../components/ComplaintAnalysis';
import AIBlockageAlert from '../components/AIBlockageAlert';
import axios from 'axios';

const GovDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalVillages: 0,
    activeAlerts: 0,
    registeredUsers: 0,
    complaintsPending: 0,
  });
  const [diseaseScores, setDiseaseScores] = useState({});
  const [safetyAlerts, setSafetyAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('govToken');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, diseaseRes, alertsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/gov/stats', { headers }),
        axios.get('http://localhost:5001/api/user/disease-score', { headers }),
        axios.get('http://localhost:5001/api/alerts', { headers }),
      ]);
      
      setStats(statsRes.data);
      setDiseaseScores(diseaseRes.data);
      setSafetyAlerts(alertsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <h2>🏛️ JAL RAKSHAK - Government</h2>
          <p>Water Quality Administration Portal</p>
        </div>
        <div className="navbar-user">
          <span>{user?.email}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <aside className="sidebar">
          <div className="sidebar-menu">
            <button
              className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`menu-item ${activeTab === 'blockage' ? 'active' : ''}`}
              onClick={() => setActiveTab('blockage')}
            >
              🚨 AI Blockage Alert
            </button>
            <button
              className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 User Management
            </button>
            <button
              className={`menu-item ${activeTab === 'chlorination' ? 'active' : ''}`}
              onClick={() => setActiveTab('chlorination')}
            >
              💧 Chlorination Reminder
            </button>
            <button
              className={`menu-item ${activeTab === 'safety' ? 'active' : ''}`}
              onClick={() => setActiveTab('safety')}
            >
              ⚠️ Safety Alerts
            </button>
            <button
              className={`menu-item ${activeTab === 'complaints' ? 'active' : ''}`}
              onClick={() => setActiveTab('complaints')}
            >
              📋 Complaint Analysis
            </button>
            <button
              className={`menu-item ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              ℹ️ Government Details
            </button>
          </div>
        </aside>

        <main className="main-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>🏛️ Government Dashboard Overview</h2>
              
              <div className="section-header">
                <h3>📊 Key Statistics</h3>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{stats.totalVillages}</h3>
                  <p>Total Villages</p>
                </div>
                <div className="stat-card alert">
                  <h3>{stats.activeAlerts}</h3>
                  <p>Active Alerts</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.registeredUsers}</h3>
                  <p>Registered Users</p>
                </div>
                <div className="stat-card warning">
                  <h3>{stats.complaintsPending}</h3>
                  <p>Pending Complaints</p>
                </div>
              </div>

              {/* Disease Data Section */}
              <div className="disease-section">
                <div className="section-header">
                  <h3>🏥 Disease Risk Scores by Village</h3>
                  <p>Lower scores indicate healthier water quality</p>
                </div>
                <div className="disease-grid">
                  {Object.entries(diseaseScores).length > 0 ? (
                    Object.entries(diseaseScores).map(([village, score]) => (
                      <div key={village} className={`disease-card ${score > 60 ? 'high-risk' : score > 30 ? 'medium-risk' : 'low-risk'}`}>
                        <h4>{village}</h4>
                        <div className="score-display">
                          <div className="score-bar">
                            <div className="score-fill" style={{ width: `${score}%` }}></div>
                          </div>
                          <p className="score-value">{score} Score</p>
                        </div>
                        <p className={`risk-label ${score > 60 ? 'high' : score > 30 ? 'medium' : 'low'}`}>
                          {score > 60 ? '🔴 High Risk' : score > 30 ? '🟡 Medium Risk' : '🟢 Low Risk'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>Loading disease scores...</p>
                  )}
                </div>
              </div>

              {/* Safety Alerts Summary Section */}
              <div className="alerts-summary-section">
                <div className="section-header">
                  <h3>🚨 Recent Safety Alerts ({safetyAlerts.length})</h3>
                </div>
                <div className="alerts-list">
                  {safetyAlerts.length > 0 ? (
                    safetyAlerts.slice(0, 5).map((alert, idx) => (
                      <div key={idx} className={`alert-item severity-${alert.severity || 'medium'}`}>
                        <div className="alert-icon">
                          {alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢'}
                        </div>
                        <div className="alert-content">
                          <h4>{alert.type?.toUpperCase() || 'Alert'}</h4>
                          <p>{alert.message}</p>
                          <small>Village: {alert.affectedVillage || 'All'} | Severity: {alert.severity?.toUpperCase() || 'MEDIUM'}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No safety alerts at this time</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blockage' && <AIBlockageAlert />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'chlorination' && <ChlorinationReminder />}
          {activeTab === 'safety' && <SafetyAlerts />}
          {activeTab === 'complaints' && <ComplaintAnalysis />}
          {activeTab === 'details' && (
            <div className="government-details-section">
              <h2>🏛️ JAL RAKSHAK - Government Administration Details</h2>
              
              <div className="details-grid">
                <div className="detail-card">
                  <h3>🌊 System Overview</h3>
                  <ul>
                    <li><strong>Total Villages Monitored:</strong> {stats.totalVillages}</li>
                    <li><strong>Total Registered Users:</strong> {stats.registeredUsers}</li>
                    <li><strong>Active Safety Alerts:</strong> {stats.activeAlerts}</li>
                    <li><strong>Pending Complaints:</strong> {stats.complaintsPending}</li>
                  </ul>
                </div>

                <div className="detail-card">
                  <h3>📊 Management Features</h3>
                  <ul>
                    <li>✅ Real-time water quality monitoring (pH, TDS, Hardness, Chlorine)</li>
                    <li>✅ Chlorination scheduling and reporting</li>
                    <li>✅ Safety alert creation and management</li>
                    <li>✅ Complaint review and approval workflow</li>
                    <li>✅ Disease risk assessment (Waterborne disease prediction)</li>
                  </ul>
                </div>

                <div className="detail-card">
                  <h3>🏘️ Village Information</h3>
                  <ul>
                    <li><strong>VILLAGE001:</strong> North Valley - 5,000 population</li>
                    <li><strong>VILLAGE002:</strong> South Hills - 3,500 population</li>
                    <li><strong>VILLAGE003:</strong> East Plains - 4,200 population</li>
                  </ul>
                </div>

                <div className="detail-card">
                  <h3>⚙️ System Health Status</h3>
                  <div className="health-indicator">
                    <p>🟢 <strong>Database Status:</strong> Connected</p>
                    <p>🟢 <strong>API Server:</strong> Running on port 5001</p>
                    <p>🟢 <strong>Frontend:</strong> Running on port 3000</p>
                    <p>🟢 <strong>Data Sync:</strong> Real-time</p>
                  </div>
                </div>

                <div className="detail-card">
                  <h3>📋 Disease Control Measures</h3>
                  <ul>
                    <li>Waterborne disease risk monitoring</li>
                    <li>Real-time disease score calculation</li>
                    <li>Health alerts for affected villages</li>
                    <li>Medical team coordination</li>
                    <li>Community health campaigns</li>
                  </ul>
                </div>

                <div className="detail-card">
                  <h3>📈 Key Indicators</h3>
                  <ul>
                    <li><strong>Water Quality:</strong> {Object.keys(diseaseScores).length > 0 ? '✅ Monitored' : '⏳ Loading'}</li>
                    <li><strong>Safety Coverage:</strong> All villages</li>
                    <li><strong>Complaint Resolution:</strong> {stats.complaintsPending > 0 ? 'In Progress' : 'None Pending'}</li>
                    <li><strong>Alert System:</strong> Active 24/7</li>
                  </ul>
                </div>
              </div>

              <div className="info-section">
                <h3>📞 Quick Actions</h3>
                <div className="action-buttons">
                  <button className="action-btn" onClick={() => setActiveTab('safety')}>
                    Create Safety Alert →
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab('chlorination')}>
                    Add Chlorination Report →
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab('complaints')}>
                    Review Complaints →
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab('users')}>
                    Manage Users →
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GovDashboard;
