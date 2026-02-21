import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import axios from 'axios';
import ComplaintFilingForm from '../components/ComplaintFilingForm';

const LocalUserDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [villages, setVillages] = useState([]);
  const [safetyAlerts, setSafetyAlerts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState([]);
  const [diseaseScores, setDiseaseScores] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [newsRes, alertsRes, complaintsRes, diseaseRes] = await Promise.all([
        axios.get('http://localhost:5001/api/user/news', { headers }),
        axios.get('http://localhost:5001/api/user/safety-alerts', { headers }),
        axios.get('http://localhost:5001/api/user/complaints', { headers }),
        axios.get('http://localhost:5001/api/user/disease-score', { headers }),
      ]);

      setNewsUpdates(newsRes.data);
      setSafetyAlerts(alertsRes.data);
      setComplaints(complaintsRes.data);
      setDiseaseScores(diseaseRes.data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintSubmit = async (complaintData) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post('http://localhost:5001/api/user/complaint', complaintData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Complaint submitted successfully!');
      fetchUserData();
    } catch (err) {
      alert('Error submitting complaint');
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <h2>🌾 JAL RAKSHAK - Community</h2>
          <p>Village Water Quality & Health Updates</p>
        </div>
        <div className="navbar-user">
          <span>{user?.villageId}</span>
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
              className={`menu-item ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              📰 Government News
            </button>
            <button
              className={`menu-item ${activeTab === 'disease' ? 'active' : ''}`}
              onClick={() => setActiveTab('disease')}
            >
              🏥 Disease Scores
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
              📝 File Complaint
            </button>
            <button
              className={`menu-item ${activeTab === 'status' ? 'active' : ''}`}
              onClick={() => setActiveTab('status')}
            >
              📍 Complaint Status
            </button>
          </div>
        </aside>

        <main className="main-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Welcome to Your Village Dashboard</h2>
              <p>Stay updated with water quality information and health alerts</p>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="news-section">
              <h2>Government Updates</h2>
              <div className="news-list">
                {newsUpdates.map((news) => (
                  <div key={news.id} className="news-card">
                    <h3>{news.title}</h3>
                    <p>{news.content}</p>
                    <small>{new Date(news.date).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'disease' && (
            <div className="disease-section">
              <h2>Disease Scores for Villages</h2>
              <div className="disease-grid">
                {Object.entries(diseaseScores).map(([village, score]) => (
                  <div key={village} className="disease-card">
                    <h3>{village}</h3>
                    <div className="score-indicator">
                      <div className="score" style={{ width: `${score}%`, backgroundColor: score > 70 ? '#ff4444' : score > 40 ? '#ffaa00' : '#44aa44' }}></div>
                    </div>
                    <p>Risk Score: {score}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="safety-section">
              <h2>Safety Alerts</h2>
              <div className="alerts-list">
                {safetyAlerts.map((alert) => (
                  <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
                    <h3>{alert.title}</h3>
                    <p>{alert.message}</p>
                    <small>{new Date(alert.timestamp).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="complaints-section">
              <ComplaintFilingForm
                villageId={user?.villageId}
                onComplaintSubmit={() => fetchUserData()}
              />
            </div>
          )}

          {activeTab === 'status' && (
            <div className="status-section">
              <h2>Your Complaints Status</h2>
              <div className="complaints-list">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className={`complaint-card status-${complaint.status}`}>
                    <div className="complaint-header">
                      <h3>Complaint #{complaint.id}</h3>
                      <span className={`status-badge ${complaint.status}`}>
                        {complaint.status.toUpperCase()}
                      </span>
                    </div>
                    <p><strong>Type:</strong> {complaint.type.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Description:</strong> {complaint.description}</p>
                    {complaint.contactNumber && (
                      <p><strong>Contact:</strong> {complaint.contactNumber}</p>
                    )}
                    {complaint.latitude && complaint.longitude && (
                      <p>
                        <strong>📍 Location:</strong>{' '}
                        <a 
                          href={`https://maps.google.com/?q=${complaint.latitude},${complaint.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Map ({complaint.latitude.toFixed(4)}°, {complaint.longitude.toFixed(4)}°)
                        </a>
                      </p>
                    )}
                    {complaint.imageUrl && (
                      <div className="complaint-image">
                        <img src={complaint.imageUrl} alt="Complaint" />
                      </div>
                    )}
                    {complaint.feedback && (
                      <div className="feedback-box">
                        <strong>Government Feedback:</strong> {complaint.feedback}
                      </div>
                    )}
                    <p className="filed-date">Filed: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LocalUserDashboard;
