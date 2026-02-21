import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WaterQualityGraphs = ({ villageId }) => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSensorData();
  }, [villageId]);

  const fetchSensorData = async () => {
    try {
      const token = localStorage.getItem('govToken');
      const response = await axios.get(`http://localhost:5001/api/sensor/data/${villageId || 'all'}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSensorData(response.data);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getParameterStatus = (value, min, max, param) => {
    if (value < min || value > max) {
      return { status: 'warning', color: '#ff6b6b' };
    }
    return { status: 'normal', color: '#51cf66' };
  };

  return (
    <div className="water-quality-section">
      <h2>💧 Water Quality Analysis</h2>
      <p className="subtitle">Real-time sensor readings and trends</p>

      {loading && <p>Loading sensor data...</p>}

      {!loading && sensorData.length > 0 && (
        <div className="graphs-container">
          {/* pH Graph */}
          <div className="graph-card">
            <h3>pH Level</h3>
            <div className="graph-placeholder">
              <div className="gauge">
                <div className="gauge-value">{sensorData[0]?.ph || '-'}</div>
                <div className="gauge-unit">Normal: 6.5 - 8.5</div>
                {sensorData[0]?.ph && (
                  <div className="gauge-bar">
                    <div
                      className="gauge-progress"
                      style={{
                        width: `${(sensorData[0].ph / 14) * 100}%`,
                        backgroundColor: getParameterStatus(sensorData[0].ph, 6.5, 8.5, 'pH').color,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TDS Graph */}
          <div className="graph-card">
            <h3>TDS (Total Dissolved Solids)</h3>
            <div className="graph-placeholder">
              <div className="gauge">
                <div className="gauge-value">{sensorData[0]?.tds || '-'}</div>
                <div className="gauge-unit">Optimal: &lt; 500 mg/L</div>
                {sensorData[0]?.tds && (
                  <div className="gauge-bar">
                    <div
                      className="gauge-progress"
                      style={{
                        width: `${Math.min((sensorData[0].tds / 500) * 100, 100)}%`,
                        backgroundColor: getParameterStatus(sensorData[0].tds, 0, 500, 'TDS').color,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chlorine Graph */}
          <div className="graph-card">
            <h3>Chlorine Level</h3>
            <div className="graph-placeholder">
              <div className="gauge">
                <div className="gauge-value">{sensorData[0]?.chlorine || '-'}</div>
                <div className="gauge-unit">Optimal: 0.5 - 2 mg/L</div>
                {sensorData[0]?.chlorine && (
                  <div className="gauge-bar">
                    <div
                      className="gauge-progress"
                      style={{
                        width: `${(sensorData[0].chlorine / 2) * 100}%`,
                        backgroundColor: getParameterStatus(sensorData[0].chlorine, 0.5, 2, 'Chlorine').color,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hardness Graph */}
          <div className="graph-card">
            <h3>Water Hardness</h3>
            <div className="graph-placeholder">
              <div className="gauge">
                <div className="gauge-value">{sensorData[0]?.hardness || '-'}</div>
                <div className="gauge-unit">Soft: &lt; 60 mg/L</div>
                {sensorData[0]?.hardness && (
                  <div className="gauge-bar">
                    <div
                      className="gauge-progress"
                      style={{
                        width: `${Math.min((sensorData[0].hardness / 100) * 100, 100)}%`,
                        backgroundColor: getParameterStatus(sensorData[0].hardness, 0, 60, 'Hardness').color,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Temperature */}
          <div className="graph-card">
            <h3>Temperature</h3>
            <div className="graph-placeholder">
              <div className="gauge">
                <div className="gauge-value">{sensorData[0]?.temperature || '-'}°C</div>
                <div className="gauge-unit">Optimal: 20 - 25°C</div>
                {sensorData[0]?.temperature && (
                  <div className="gauge-bar">
                    <div
                      className="gauge-progress"
                      style={{
                        width: `${Math.min((sensorData[0].temperature / 40) * 100, 100)}%`,
                        backgroundColor: getParameterStatus(sensorData[0].temperature, 20, 25, 'Temp').color,
                      }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && sensorData.length === 0 && (
        <p className="no-data">No sensor data available for this village</p>
      )}

      <style jsx>{`
        .water-quality-section {
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .water-quality-section h2 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .subtitle {
          color: #666;
          font-size: 14px;
          margin: 0 0 20px 0;
        }

        .graphs-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .graph-card {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .graph-card h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 14px;
          font-weight: 600;
        }

        .graph-placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 120px;
        }

        .gauge {
          text-align: center;
          width: 100%;
        }

        .gauge-value {
          font-size: 20px;
          font-weight: 600;
          color: #333;
        }

        .gauge-unit {
          font-size: 11px;
          color: #999;
          margin: 5px 0;
        }

        .gauge-bar {
          width: 100%;
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 8px;
        }

        .gauge-progress {
          height: 100%;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default WaterQualityGraphs;
