import React, { useState, useEffect } from 'react';
import './App.css';
import GovLogin from './pages/GovLogin';
import GovDashboard from './pages/GovDashboard';
import LocalUserLogin from './pages/LocalUserLogin';
import LocalUserDashboard from './pages/LocalUserDashboard';

function App() {
  const [currentView, setCurrentView] = useState('portal-select');
  const [govUser, setGovUser] = useState(null);
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const govToken = localStorage.getItem('govToken');
    const userToken = localStorage.getItem('userToken');
    const userRole = localStorage.getItem('userRole');

    if (govToken && userRole === 'government') {
      setCurrentView('gov-dashboard');
      setGovUser({ email: localStorage.getItem('govEmail') || 'Government Officer' });
    } else if (userToken && userRole === 'localuser') {
      setCurrentView('user-dashboard');
      setLocalUser({ villageId: localStorage.getItem('villageId') });
    }
  }, []);

  const handleGovLoginSuccess = (data) => {
    localStorage.setItem('govEmail', data.email);
    setGovUser(data);
    setCurrentView('gov-dashboard');
  };

  const handleLocalUserLoginSuccess = (data) => {
    setLocalUser(data);
    setCurrentView('user-dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setGovUser(null);
    setLocalUser(null);
    setCurrentView('portal-select');
  };

  return (
    <div className="App">
      {currentView === 'portal-select' && (
        <div className="portal-select">
          <div className="select-container">
            <h1>Water Quality Management System</h1>
            <p>Select your portal to continue</p>
            <div className="portal-options">
              <button
                onClick={() => setCurrentView('gov-login')}
                className="portal-button gov-portal"
              >
                <div className="icon">🏛️</div>
                <h2>Government Portal</h2>
                <p>Water Quality Administration</p>
              </button>
              <button
                onClick={() => setCurrentView('user-login')}
                className="portal-button user-portal"
              >
                <div className="icon">🏘️</div>
                <h2>Village User Portal</h2>
                <p>Local Community Updates</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'gov-login' && (
        <GovLogin onLoginSuccess={handleGovLoginSuccess} />
      )}

      {currentView === 'user-login' && (
        <LocalUserLogin onLoginSuccess={handleLocalUserLoginSuccess} />
      )}

      {currentView === 'gov-dashboard' && govUser && (
        <GovDashboard user={govUser} onLogout={handleLogout} />
      )}

      {currentView === 'user-dashboard' && localUser && (
        <LocalUserDashboard user={localUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
