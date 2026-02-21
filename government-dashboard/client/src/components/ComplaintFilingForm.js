import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ComplaintFilingForm = ({ villageId, onComplaintSubmit }) => {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    contactNumber: '',
  });
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    loading: true,
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const cameraRef = useRef(null);

  // Get geolocation on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            loading: false,
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLocation({
            latitude: null,
            longitude: null,
            loading: false,
          });
        }
      );
    } else {
      setLocation({
        latitude: null,
        longitude: null,
        loading: false,
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('userToken');
      const complaintData = {
        villageId,
        type: formData.type,
        description: formData.description,
        contactNumber: formData.contactNumber,
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrl: imagePreview || null,
      };

      const response = await axios.post('http://localhost:5001/api/user/complaint', complaintData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('✅ Complaint filed successfully! Your complaint ID: #' + response.data.id);
      setFormData({ type: '', description: '', contactNumber: '' });
      setImage(null);
      setImagePreview(null);

      if (onComplaintSubmit) {
        onComplaintSubmit(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="complaint-form-container">
      <h2>📋 File a New Complaint</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Complaint Type */}
        <div className="form-group">
          <label>Complaint Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Select Type --</option>
            <option value="water_quality">💧 Water Quality Issue</option>
            <option value="health">🏥 Health Concern</option>
            <option value="equipment">⚙️ Equipment Problem</option>
            <option value="contamination">🚫 Contamination</option>
            <option value="other">📝 Other</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the issue in detail..."
            rows="5"
            required
          />
        </div>

        {/* Contact Number */}
        <div className="form-group">
          <label>Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            placeholder="Your contact number (optional)"
            pattern="[0-9\-\+\s]*"
          />
        </div>

        {/* Geolocation */}
        <div className="form-group">
          <label>📍 Location (Geotag)</label>
          {location.loading ? (
            <p className="info-text">Getting your location...</p>
          ) : location.latitude ? (
            <div className="location-info">
              <p>✅ Location captured successfully</p>
              <p className="coordinates">
                Latitude: {location.latitude.toFixed(4)}° | Longitude: {location.longitude.toFixed(4)}°
              </p>
              <p className="info-text">
                📍 <a 
                  href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Map
                </a>
              </p>
            </div>
          ) : (
            <p className="warning-text">⚠️ Unable to get location. Please enable GPS permissions.</p>
          )}
        </div>

        {/* Camera/Image Upload */}
        <div className="form-group">
          <label>📸 Attach Photo (Optional)</label>
          <div className="image-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageCapture}
              ref={cameraRef}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="upload-btn"
            >
              📷 Choose Photo
            </button>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <p>✅ Image selected:</p>
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-btn"
          disabled={submitting}
        >
          {submitting ? '⏳ Submitting...' : '✉️ Submit Complaint'}
        </button>
      </form>

      <style jsx>{`
        .complaint-form-container {
          background: white;
          padding: 25px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }

        .complaint-form-container h2 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .info-text {
          font-size: 13px;
          color: #666;
          margin: 0;
        }

        .location-info {
          background: #f0f9ff;
          padding: 12px;
          border-radius: 5px;
          border-left: 4px solid #0066ff;
        }

        .location-info p {
          margin: 5px 0;
          font-size: 13px;
          color: #333;
        }

        .coordinates {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #666;
          background: white;
          padding: 8px;
          border-radius: 3px;
          margin: 8px 0;
        }

        .location-info a {
          color: #0066ff;
          text-decoration: none;
          font-weight: 600;
        }

        .location-info a:hover {
          text-decoration: underline;
        }

        .warning-text {
          color: #ff6600;
          font-size: 13px;
          margin: 0;
        }

        .image-upload {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .upload-btn {
          padding: 10px 16px;
          background: #0066ff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          flex: 1;
        }

        .upload-btn:hover {
          background: #0052cc;
        }

        .upload-btn:active {
          transform: scale(0.98);
        }

        .image-preview {
          margin-top: 15px;
          padding: 10px;
          background: #f9f9f9;
          border-radius: 5px;
          border: 1px solid #e0e0e0;
        }

        .image-preview p {
          font-size: 13px;
          color: #666;
          margin: 0 0 10px 0;
        }

        .image-preview img {
          max-width: 100%;
          height: auto;
          max-height: 300px;
          border-radius: 5px;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
          margin-top: 10px;
          transition: background 0.3s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #218838;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fff5f5;
          color: #dc3545;
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 15px;
          border-left: 4px solid #dc3545;
          font-size: 14px;
        }

        .success-message {
          background: #f0fdf4;
          color: #22c55e;
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 15px;
          border-left: 4px solid #22c55e;
          font-size: 14px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ComplaintFilingForm;
