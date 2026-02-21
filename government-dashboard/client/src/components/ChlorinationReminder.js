import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WaterQualityGraphs from './WaterQualityGraphs';

const ChlorinationReminder = () => {
  const [reminders, setReminders] = useState([]);
  const [lastReport, setLastReport] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    village: '',
    location: '',
    schedule: 'daily',
    time: '08:00',
    dosage: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState('');

  useEffect(() => {
    fetchReminders();
    fetchLastReport();
  }, []);

  const fetchLastReport = async () => {
    try {
      const token = localStorage.getItem('govToken');
      const response = await axios.get('http://localhost:5001/api/chlorination/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.length > 0) {
        setLastReport(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    }
  };

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('govToken');
      const response = await axios.get('http://localhost:5001/api/gov/chlorination-reminders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReminders(response.data);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('govToken');
      await axios.post('http://localhost:5001/api/gov/chlorination-reminders', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Reminder set successfully!');
      // Send email notification to local worker
      await sendWorkerNotification(formData);
      fetchReminders();
      setShowForm(false);
      setFormData({ village: '', location: '', schedule: 'daily', time: '08:00', dosage: '' });
    } catch (err) {
      alert('Error setting reminder');
    } finally {
      setLoading(false);
    }
  };

  const sendWorkerNotification = async (reminderData) => {
    try {
      const token = localStorage.getItem('govToken');
      await axios.post('http://localhost:5001/api/send-notification', {
        type: 'chlorination_reminder',
        village: reminderData.village,
        location: reminderData.location,
        schedule: reminderData.schedule,
        time: reminderData.time,
        dosage: reminderData.dosage,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (window.confirm('Delete this reminder?')) {
      try {
        const token = localStorage.getItem('govToken');
        await axios.delete(`http://localhost:5001/api/gov/chlorination-reminders/${reminderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchReminders();
      } catch (err) {
        alert('Error deleting reminder');
      }
    }
  };

  return (
    <div className="chlorination-section">
      {/* Water Quality Graphs */}
      <WaterQualityGraphs villageId={selectedVillage} />

      {/* Last Chlorination Report */}
      {lastReport && (
        <div className="last-report-container">
          <h2>📋 Last Chlorination Report</h2>
          <div className="report-card">
            <div className="report-grid">
              <div className="report-item">
                <label>Village ID</label>
                <p>{lastReport.villageId}</p>
              </div>
              <div className="report-item">
                <label>Date</label>
                <p>{new Date(lastReport.date).toLocaleDateString()}</p>
              </div>
              <div className="report-item">
                <label>pH Level</label>
                <p>{lastReport.ph}</p>
              </div>
              <div className="report-item">
                <label>TDS (mg/L)</label>
                <p>{lastReport.tds}</p>
              </div>
              <div className="report-item">
                <label>Hardness (mg/L)</label>
                <p>{lastReport.hardness}</p>
              </div>
              <div className="report-item">
                <label>Chlorine (mg/L)</label>
                <p>{lastReport.chlorine}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <h2>💧 Chlorination Schedule</h2>
        <button onClick={() => setShowForm(!showForm)} className="add-btn">
          {showForm ? 'Cancel' : '+ Set Reminder'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleAddReminder}>
            <div className="form-group">
              <label>Village</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Treatment Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Schedule</label>
              <select
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Chlorine Dosage (mg/L)</label>
              <input
                type="number"
                step="0.1"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Setting...' : 'Set Reminder'}
            </button>
          </form>
        </div>
      )}

      <div className="reminders-list">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="reminder-card">
            <h3>{reminder.village}</h3>
            <p><strong>Location:</strong> {reminder.location}</p>
            <p><strong>Schedule:</strong> {reminder.schedule}</p>
            <p><strong>Time:</strong> {reminder.time}</p>
            <p><strong>Dosage:</strong> {reminder.dosage} mg/L</p>
            <button
              onClick={() => handleDeleteReminder(reminder.id)}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {reminders.length === 0 && !showForm && (
        <p className="no-data">No reminders set yet. Create one to get started!</p>
      )}

      <style jsx>{`
        .chlorination-section {
          padding: 20px;
        }

        .last-report-container {
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .last-report-container h2 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .report-card {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
        }

        .report-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .report-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .report-item label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .report-item p {
          margin: 0;
          font-size: 16px;
          color: #333;
          font-weight: 500;
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
          margin: 0;
          color: #333;
        }

        .add-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .add-btn:hover {
          background: #0056b3;
        }

        .form-container {
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
        .form-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .submit-btn {
          background: #28a745;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          width: 100%;
        }

        .submit-btn:hover:not(:disabled) {
          background: #218838;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reminders-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .reminder-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .reminder-card h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .reminder-card p {
          margin: 8px 0;
          color: #666;
          font-size: 14px;
        }

        .delete-btn {
          width: 100%;
          padding: 8px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 10px;
        }

        .delete-btn:hover {
          background: #c82333;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default ChlorinationReminder;
