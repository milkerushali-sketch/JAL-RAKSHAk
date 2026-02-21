import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';

const LocalUserLogin = ({ onLoginSuccess }) => {
  const [villageId, setVillageId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/api/user/login', {
        villageId,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userRole', 'localuser');
        localStorage.setItem('villageId', villageId);
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">🌾 JAL RAKSHAK</h1>
        <p className="login-subtitle">Village Portal - Community Water Updates</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="villageId">Village ID</label>
            <input
              type="text"
              id="villageId"
              value={villageId}
              onChange={(e) => setVillageId(e.target.value)}
              placeholder="Enter your village ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LocalUserLogin;
