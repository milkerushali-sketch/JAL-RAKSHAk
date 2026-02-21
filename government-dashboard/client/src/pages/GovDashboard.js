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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('govToken');
      const response = await axios.get('http://localhost:5001/api/gov/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
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
          </div>
        </aside>

        <main className="main-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Dashboard Overview</h2>
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
                <div className="stat-card">
                  <h3>{stats.complaintsPending}</h3>
                  <p>Pending Complaints</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blockage' && <AIBlockageAlert />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'chlorination' && <ChlorinationReminder />}
          {activeTab === 'safety' && <SafetyAlerts />}
          {activeTab === 'complaints' && <ComplaintAnalysis />}
        </main>
      </div>
    </div>
  );
};

export default GovDashboard;
