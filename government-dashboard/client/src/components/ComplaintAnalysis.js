import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ComplaintAnalysis = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('govToken');
      const response = await axios.get('http://localhost:5001/api/complaints', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(response.data);
      calculateStats(response.data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (complaintsList) => {
    const stats = {
      total: complaintsList.length,
      pending: complaintsList.filter(c => c.status === 'pending').length,
      resolved: complaintsList.filter(c => c.status === 'resolved').length,
      inProgress: complaintsList.filter(c => c.status === 'in_progress').length,
    };
    setStats(stats);
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const token = localStorage.getItem('govToken');
      await axios.put(
        `http://localhost:5001/api/complaints/${complaintId}`,
        { 
          status: newStatus,
          feedback: feedback,
          approvedBy: localStorage.getItem('govEmail')
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComplaints();
      setSelectedComplaint(null);
      setFeedback('');
    } catch (err) {
      alert('Error updating complaint status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ffc107';
      case 'in_progress': return '#17a2b8';
      case 'resolved': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div className="complaint-analysis">
      <div className="section-header">
        <h2>📋 Complaint Management & Analysis</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Complaints</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card">
          <h3>{stats.resolved}</h3>
          <p>Resolved</p>
        </div>
      </div>

      {loading && <p>Loading complaints...</p>}

      <div className="complaints-list">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className={`complaint-item status-${complaint.status}`}
            onClick={() => setSelectedComplaint(complaint)}
          >
            <div className="complaint-header">
              <h3>Complaint #{complaint.id}</h3>
              <span className={`status-badge ${complaint.status}`}>
                {complaint.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p><strong>Type:</strong> {complaint.type}</p>
            <p><strong>Village:</strong> {complaint.village}</p>
            <p><strong>Filed:</strong> {new Date(complaint.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setSelectedComplaint(null)}>&times;</span>
            <h2>Complaint Details & Approval</h2>
            <div className="complaint-details">
              <div className="detail-row">
                <label>Complaint ID:</label>
                <p>{selectedComplaint.id}</p>
              </div>
              <div className="detail-row">
                <label>Type:</label>
                <p>{selectedComplaint.type}</p>
              </div>
              <div className="detail-row">
                <label>Village:</label>
                <p>{selectedComplaint.village || selectedComplaint.villageId}</p>
              </div>
              <div className="detail-row">
                <label>Description:</label>
                <p>{selectedComplaint.description}</p>
              </div>
              <div className="detail-row">
                <label>Current Status:</label>
                <span className={`status-badge ${selectedComplaint.status}`} style={{color: 'white'}}>
                  {selectedComplaint.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="detail-row">
                <label>Filed On:</label>
                <p>{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
              </div>
              {selectedComplaint.feedback && (
                <div className="detail-row">
                  <label>Previous Feedback:</label>
                  <p>{selectedComplaint.feedback}</p>
                </div>
              )}
            </div>

            <div className="feedback-section">
              <label>Government Feedback/Action:</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback or action taken..."
              />
            </div>

            <div className="action-buttons">
              <button 
                onClick={() => handleStatusUpdate(selectedComplaint.id, 'pending')} 
                className="action-btn pending"
              >
                Mark as Pending
              </button>
              <button 
                onClick={() => handleStatusUpdate(selectedComplaint.id, 'in_progress')} 
                className="action-btn in-progress"
              >
                Mark as In Progress
              </button>
              <button 
                onClick={() => handleStatusUpdate(selectedComplaint.id, 'resolved')} 
                className="action-btn resolved"
              >
                Approve & Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {complaints.length === 0 && !loading && (
        <p className="no-data">No complaints filed yet.</p>
      )}

      <style jsx>{`
        .complaint-analysis {
          padding: 20px;
        }

        .section-header {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }

        .section-header h2 {
          margin: 0;
          color: #333;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 32px;
          color: #007bff;
        }

        .stat-card p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .complaints-list {
          display: grid;
          gap: 15px;
          margin-bottom: 30px;
        }

        .complaint-item {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .complaint-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .complaint-item.status-pending {
          border-left-color: #ffc107;
        }

        .complaint-item.status-in_progress {
          border-left-color: #17a2b8;
        }

        .complaint-item.status-resolved {
          border-left-color: #28a745;
        }

        .complaint-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .complaint-header h3 {
          margin: 0;
          color: #333;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .status-badge.pending {
          background: #ffc107;
        }

        .status-badge.in_progress {
          background: #17a2b8;
        }

        .status-badge.resolved {
          background: #28a745;
        }

        .complaint-item p {
          margin: 8px 0;
          color: #666;
          font-size: 14px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 10px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .close-btn {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 28px;
          cursor: pointer;
          color: #999;
        }

        .close-btn:hover {
          color: #333;
        }

        .modal-content h2 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .complaint-details {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .detail-row {
          margin-bottom: 15px;
        }

        .detail-row label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .detail-row p {
          margin: 0;
          color: #666;
        }

        .feedback-section {
          margin-bottom: 20px;
        }

        .feedback-section label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .feedback-section textarea {
          width: 100%;
          min-height: 100px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .action-btn {
          flex: 1;
          min-width: 150px;
          padding: 10px 15px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .action-btn.pending {
          background: #ffc107;
          color: #333;
        }

        .action-btn.pending:hover {
          background: #e0a800;
        }

        .action-btn.in-progress {
          background: #17a2b8;
          color: white;
        }

        .action-btn.in-progress:hover {
          background: #0f7490;
        }

        .action-btn.resolved {
          background: #28a745;
          color: white;
        }

        .action-btn.resolved:hover {
          background: #1e7e34;
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

export default ComplaintAnalysis;
