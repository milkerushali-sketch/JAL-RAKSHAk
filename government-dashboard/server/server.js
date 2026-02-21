const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'your_jwt_secret_key_change_in_production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, '..', 'database', 'water_quality.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

// Initialize database tables
const initDatabase = () => {
  db.serialize(() => {
    // Government users table
    db.run(`CREATE TABLE IF NOT EXISTS gov_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Village users table
    db.run(`CREATE TABLE IF NOT EXISTS village_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT UNIQUE NOT NULL,
      villageId TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Village data table
    db.run(`CREATE TABLE IF NOT EXISTS villages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      villageId TEXT UNIQUE NOT NULL,
      villageName TEXT NOT NULL,
      location TEXT,
      population INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Sensor data table
    db.run(`CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      villageId TEXT NOT NULL,
      ph REAL,
      tds REAL,
      chlorine REAL,
      temperature REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (villageId) REFERENCES villages(villageId)
    )`);

    // Complaints table
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      villageId TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      feedback TEXT,
      approvedBy TEXT,
      latitude REAL,
      longitude REAL,
      imageUrl TEXT,
      contactNumber TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (villageId) REFERENCES villages(villageId)
    )`);

    // Alerts table
    db.run(`CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT,
      affectedVillage TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved BOOLEAN DEFAULT 0,
      feedback TEXT
    )`);

    // Blockage alerts table
    db.run(`CREATE TABLE IF NOT EXISTS blockage_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      villageId TEXT NOT NULL,
      location TEXT NOT NULL,
      riskLevel INTEGER,
      severity TEXT,
      recommendation TEXT,
      acknowledged BOOLEAN DEFAULT 0,
      dispatched BOOLEAN DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (villageId) REFERENCES villages(villageId)
    )`);

    // Chlorination reminders table
    db.run(`CREATE TABLE IF NOT EXISTS chlorination_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      village TEXT NOT NULL,
      location TEXT NOT NULL,
      schedule TEXT,
      time TEXT,
      dosage REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Chlorination reports table
    db.run(`CREATE TABLE IF NOT EXISTS chlorination_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      villageId TEXT NOT NULL,
      ph REAL,
      tds REAL,
      hardness REAL,
      chlorine REAL,
      temperature REAL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      technician TEXT,
      FOREIGN KEY (villageId) REFERENCES villages(villageId)
    )`);

    // News updates table
    db.run(`CREATE TABLE IF NOT EXISTS news_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Disease scores table
    db.run(`CREATE TABLE IF NOT EXISTS disease_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      villageId TEXT NOT NULL,
      score INTEGER,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (villageId) REFERENCES villages(villageId)
    )`);
  });
};

initDatabase();

// Middleware for JWT verification
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ================== GOVERNMENT ROUTES ================== //

// Government Login
app.post('/api/gov/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM gov_users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!row) return res.status(401).json({ message: 'Invalid credentials' });

    // Simple password check (use bcrypt in production)
    if (row.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: row.id, email: row.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, email: row.email, message: 'Login successful' });
  });
});

// Get government dashboard stats
app.get('/api/gov/stats', verifyToken, (req, res) => {
  db.all('SELECT COUNT(DISTINCT villageId) as totalVillages FROM villages', (err1, villages) => {
    db.all('SELECT COUNT(*) as count FROM village_users', (err2, users) => {
      db.all('SELECT COUNT(*) as count FROM complaints WHERE status = "pending"', (err3, complaints) => {
        db.all('SELECT COUNT(*) as count FROM blockage_alerts WHERE acknowledged = 0', (err4, alerts) => {
          res.json({
            totalVillages: villages?.[0]?.totalVillages || 0,
            registeredUsers: users?.[0]?.count || 0,
            complaintsPending: complaints?.[0]?.count || 0,
            activeAlerts: alerts?.[0]?.count || 0,
          });
        });
      });
    });
  });
});

// Get all village users
app.get('/api/gov/users', verifyToken, (req, res) => {
  db.all('SELECT id, userId, villageId, name, email, isActive FROM village_users', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows || []);
  });
});

// Add new village user
app.post('/api/gov/users', verifyToken, (req, res) => {
  const { villageId, name, email, userId, password } = req.body;

  db.run(
    'INSERT INTO village_users (userId, villageId, name, email, password) VALUES (?, ?, ?, ?, ?)',
    [userId, villageId, name, email, password],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error adding user' });
      res.json({ message: 'User added successfully', userId, password });
    }
  );
});

// Delete village user
app.delete('/api/gov/users/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM village_users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting user' });
    res.json({ message: 'User deleted successfully' });
  });
});

// Get blockage alerts
app.get('/api/gov/blockage-alerts', verifyToken, (req, res) => {
  db.all('SELECT * FROM blockage_alerts ORDER BY timestamp DESC LIMIT 20', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows || []);
  });
});

// Update blockage alert
app.post('/api/gov/blockage-alerts/:id/:action', verifyToken, (req, res) => {
  const { id, action } = req.params;

  if (action === 'acknowledge') {
    db.run('UPDATE blockage_alerts SET acknowledged = 1 WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ message: 'Error updating alert' });
      res.json({ message: 'Alert acknowledged' });
    });
  } else if (action === 'dispatch') {
    db.run('UPDATE blockage_alerts SET dispatched = 1 WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ message: 'Error updating alert' });
      res.json({ message: 'Team dispatched' });
    });
  }
});

// Get chlorination reminders
app.get('/api/gov/chlorination-reminders', verifyToken, (req, res) => {
  db.all('SELECT * FROM chlorination_reminders ORDER BY village ASC', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows || []);
  });
});

// Add chlorination reminder
app.post('/api/gov/chlorination-reminders', verifyToken, (req, res) => {
  const { village, location, schedule, time, dosage } = req.body;

  db.run(
    'INSERT INTO chlorination_reminders (village, location, schedule, time, dosage) VALUES (?, ?, ?, ?, ?)',
    [village, location, schedule, time, dosage],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error adding reminder' });
      res.json({ message: 'Reminder added successfully' });
    }
  );
});

// Delete chlorination reminder
app.delete('/api/gov/chlorination-reminders/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM chlorination_reminders WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting reminder' });
    res.json({ message: 'Reminder deleted successfully' });
  });
});

// Get safety alerts
app.get('/api/gov/safety-alerts', verifyToken, (req, res) => {
  db.all('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 30', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows || []);
  });
});

// Get complaints
app.get('/api/gov/complaints', verifyToken, (req, res) => {
  db.all('SELECT * FROM complaints ORDER BY createdAt DESC', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows || []);
  });
});

// Update complaint status
app.patch('/api/gov/complaints/:id', verifyToken, (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE complaints SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating complaint' });
      res.json({ message: 'Complaint updated successfully' });
    }
  );
});

// ================== LOCAL USER ROUTES ================== //

// Local user login
app.post('/api/user/login', (req, res) => {
  const { villageId, password } = req.body;

  db.get('SELECT * FROM village_users WHERE villageId = ?', [villageId], (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!row) return res.status(401).json({ message: 'Invalid credentials' });

    if (row.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: row.id, villageId: row.villageId }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, villageId: row.villageId, message: 'Login successful' });
  });
});

// Get news updates
app.get('/api/user/news', verifyToken, (req, res) => {
  db.all('SELECT * FROM news_updates ORDER BY date DESC LIMIT 10', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows || []);
  });
});

// Get safety alerts for user
app.get('/api/user/safety-alerts', verifyToken, (req, res) => {
  const villageId = req.user.villageId;
  db.all(
    'SELECT * FROM alerts WHERE villageId = ? ORDER BY timestamp DESC LIMIT 15',
    [villageId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(rows || []);
    }
  );
});

// Get disease scores
app.get('/api/user/disease-score', verifyToken, (req, res) => {
  db.all('SELECT villageId, score FROM disease_scores', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    const scoreMap = {};
    rows?.forEach(row => {
      scoreMap[row.villageId] = row.score;
    });
    res.json(scoreMap);
  });
});

// Get user complaints
app.get('/api/user/complaints', verifyToken, (req, res) => {
  const villageId = req.user.villageId;
  db.all(
    'SELECT * FROM complaints WHERE villageId = ? ORDER BY createdAt DESC',
    [villageId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(rows || []);
    }
  );
});

// Submit complaint
app.post('/api/user/complaint', verifyToken, (req, res) => {
  const { type, description } = req.body;
  const villageId = req.user.villageId;

  db.run(
    'INSERT INTO complaints (villageId, type, description) VALUES (?, ?, ?)',
    [villageId, type, description],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error submitting complaint' });
      res.json({ message: 'Complaint submitted successfully' });
    }
  );
});

// ================== SENSOR DATA ROUTES ================== //

// Add sensor data
app.post('/api/sensor/data', (req, res) => {
  const { villageId, ph, tds, chlorine, temperature } = req.body;

  db.run(
    'INSERT INTO sensor_data (villageId, ph, tds, chlorine, temperature) VALUES (?, ?, ?, ?, ?)',
    [villageId, ph, tds, chlorine, temperature],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error storing sensor data' });
      res.json({ message: 'Sensor data stored successfully' });
    }
  );
});

// Get latest sensor data
app.get('/api/sensor/latest/:villageId', (req, res) => {
  db.get(
    'SELECT * FROM sensor_data WHERE villageId = ? ORDER BY timestamp DESC LIMIT 1',
    [req.params.villageId],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(row || {});
    }
  );
});

// Get sensor data for all villages
app.get('/api/sensor/data/:villageId', (req, res) => {
  const villageId = req.params.villageId === 'all' ? '%' : req.params.villageId;
  db.all(
    'SELECT * FROM sensor_data WHERE villageId LIKE ? ORDER BY timestamp DESC LIMIT 100',
    [villageId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(rows || []);
    }
  );
});

// Update alerts with resolved status
app.put('/api/alerts/:id', verifyToken, (req, res) => {
  const { resolved, feedback } = req.body;
  db.run(
    'UPDATE alerts SET resolved = ?, feedback = ? WHERE id = ?',
    [resolved ? 1 : 0, feedback || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating alert' });
      res.json({ message: 'Alert updated successfully' });
    }
  );
});

// Get all complaints (for government dashboard)
app.get('/api/complaints', verifyToken, (req, res) => {
  db.all(
    'SELECT * FROM complaints ORDER BY createdAt DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(rows || []);
    }
  );
});

// Update complaint status and approval
app.put('/api/complaints/:id', verifyToken, (req, res) => {
  const { status, feedback, approvedBy } = req.body;
  db.run(
    'UPDATE complaints SET status = ?, feedback = ?, approvedBy = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [status, feedback || null, approvedBy || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Error updating complaint' });
      res.json({ message: 'Complaint updated successfully' });
    }
  );
});

// Send notification to workers (email/SMS)
app.post('/api/send-notification', verifyToken, (req, res) => {
  const { type, village, location, schedule, time, dosage } = req.body;
  
  // For now, log the notification
  console.log(`Notification sent to workers:`, {
    type,
    village,
    location,
    schedule,
    time,
    dosage,
  });

  // In a real application, this would send an email or SMS
  // Using services like Nodemailer, Twilio, etc.
  
  res.json({ message: 'Notification sent to local workers' });
});

// Get all alerts
app.get('/api/alerts', verifyToken, (req, res) => {
  db.all(
    'SELECT * FROM alerts ORDER BY timestamp DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(rows || []);
    }
  );
});

// Create new alert
app.post('/api/alerts', verifyToken, (req, res) => {
  const { type, message, severity, affectedVillage } = req.body;
  
  db.run(
    'INSERT INTO alerts (type, message, severity, affectedVillage, createdAt, resolved) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 0)',
    [type, message, severity, affectedVillage || null],
    function(err) {
      if (err) return res.status(500).json({ message: 'Error creating alert' });
      res.json({ message: 'Alert created successfully', id: this.lastID });
    }
  );
});

// Get sensor data for water quality monitoring
app.get('/api/sensor/data/:villageId', verifyToken, (req, res) => {
  const { villageId } = req.params;
  db.all(
    'SELECT ph, tds, hardness, chlorine, temperature FROM chlorination_reports WHERE villageId = ? ORDER BY date DESC LIMIT 30',
    [villageId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(rows || []);
    }
  );
});

// Send notification to workers (email/SMS)
app.post('/api/send-notification', verifyToken, (req, res) => {
  const { type, village, location, schedule, time, dosage } = req.body;
  
  // In production, integrate with nodemailer for email or Twilio for SMS
  // For now, just log the notification
  console.log(`[NOTIFICATION] Type: ${type}, Village: ${village}, Location: ${location}`);
  console.log(`Schedule: ${schedule} at ${time}, Dosage: ${dosage} mg/L`);
  
  res.json({ 
    message: 'Notification queued for worker',
    notifyType: type,
    village: village,
    sent: new Date().toISOString()
  });
});

// Update complaint status with feedback (government approval)
app.put('/api/complaints/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status, feedback, approvedBy } = req.body;
  
  db.run(
    'UPDATE complaints SET status = ?, feedback = ?, approvedBy = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [status, feedback || null, approvedBy || null, id],
    function(err) {
      if (err) return res.status(500).json({ message: 'Error updating complaint' });
      res.json({ message: 'Complaint updated successfully', id: id });
    }
  );
});

// Resolve/update an alert
app.put('/api/alerts/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { resolved } = req.body;
  
  db.run(
    'UPDATE alerts SET resolved = ? WHERE id = ?',
    [resolved ? 1 : 0, id],
    function(err) {
      if (err) return res.status(500).json({ message: 'Error updating alert' });
      res.json({ message: 'Alert updated successfully', id: id });
    }
  );
});

// Get all complaints with details
app.get('/api/complaints', verifyToken, (req, res) => {
  db.all(
    'SELECT * FROM complaints ORDER BY createdAt DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(rows || []);
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

