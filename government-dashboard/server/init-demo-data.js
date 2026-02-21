const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'water_quality.db');

// Demo data
const demoData = {
  govUsers: [
    { email: 'admin@gov.com', password: 'admin123', name: 'Admin Officer' },
    { email: 'officer@gov.com', password: 'officer123', name: 'Water Quality Officer' },
  ],
  villages: [
    { villageId: 'VILLAGE001', villageName: 'North Valley', location: 'District A', population: 5000 },
    { villageId: 'VILLAGE002', villageName: 'South Hills', location: 'District B', population: 3500 },
    { villageId: 'VILLAGE003', villageName: 'East Plains', location: 'District C', population: 4200 },
  ],
  villageUsers: [
    { userId: 'USR1001', villageId: 'VILLAGE001', name: 'Rajesh Kumar', email: 'rajesh@village1.com', password: 'pass123' },
    { userId: 'USR1002', villageId: 'VILLAGE002', name: 'Priya Singh', email: 'priya@village2.com', password: 'pass123' },
    { userId: 'USR1003', villageId: 'VILLAGE003', name: 'Amit Sharma', email: 'amit@village3.com', password: 'pass123' },
  ],
  newsUpdates: [
    { title: 'New Water Treatment Plant Inaugurated', content: 'State-of-the-art water treatment facility installed with RO technology.' },
    { title: 'Monthly Water Quality Report Released', content: 'All villages show improved water quality metrics. Chlorine levels optimized.' },
    { title: 'Free Health Checkup Camp', content: 'Free health checks for waterborne diseases. Every Saturday 10 AM.' },
    { title: 'Water Conservation Campaign', content: 'JAL RAKSHAK initiative to save 30% water with smart usage.' },
    { title: 'Community Awareness Program', content: 'Learn about water quality testing and safety measures next week.' },
  ],
  alerts: [
    { type: 'water_quality', message: 'TDS level exceeded 500 mg/L. Water filtration initiated.', severity: 'high', affectedVillage: 'VILLAGE001' },
    { type: 'chlorination', message: 'Chlorine level below 0.5 mg/L. Treatment scheduled.', severity: 'medium', affectedVillage: 'VILLAGE002' },
    { type: 'health', message: 'Waterborne disease cases reported. Safe water advisory issued.', severity: 'high', affectedVillage: 'VILLAGE003' },
    { type: 'maintenance', message: 'Routine pipe maintenance in progress. Water supply may be interrupted.', severity: 'low', affectedVillage: 'VILLAGE002' },
  ],
  chlorinationReports: [
    { villageId: 'VILLAGE001', ph: 7.2, tds: 320, hardness: 140, chlorine: 0.8, temperature: 22.5, technician: 'Rajesh Kumar' },
    { villageId: 'VILLAGE002', ph: 6.8, tds: 450, hardness: 160, chlorine: 0.6, temperature: 23.0, technician: 'Priya Singh' },
    { villageId: 'VILLAGE003', ph: 7.5, tds: 280, hardness: 120, chlorine: 1.2, temperature: 21.8, technician: 'Amit Sharma' },
    { villageId: 'VILLAGE001', ph: 7.0, tds: 310, hardness: 135, chlorine: 0.9, temperature: 22.0, technician: 'Rajesh Kumar' },
  ],
  complaints: [
    { villageId: 'VILLAGE001', type: 'water_quality', description: 'Water color is murky with unusual smell. Unable to use for drinking.', contactNumber: '9876543210', latitude: 28.7041, longitude: 77.1025, imageUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23444%22 width=%22200%22 height=%22150%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2216%22 fill=%22white%22%3EWater Sample%3C/text%3E%3C/svg%3E', status: 'in_progress' },
    { villageId: 'VILLAGE001', type: 'equipment', description: 'Water pump is making strange noise. Needs immediate repair.', contactNumber: '9876543211', latitude: 28.7050, longitude: 77.1030, imageUrl: null, status: 'pending' },
    { villageId: 'VILLAGE002', type: 'health', description: 'Several people fallen sick. Possibly waterborne disease.', contactNumber: '9988776655', latitude: 28.5355, longitude: 77.3910, imageUrl: null, status: 'resolved', feedback: 'Water tested safe. Medical team dispatched for health checks.' },
    { villageId: 'VILLAGE002', type: 'contamination', description: 'Sewage water mixing with drinking water supply. Urgent action needed.', contactNumber: '9988776656', latitude: 28.5360, longitude: 77.3915, imageUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23666%22 width=%22200%22 height=%22150%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22white%22%3EPipe Damage%3C/text%3E%3C/svg%3E', status: 'in_progress' },
    { villageId: 'VILLAGE003', type: 'other', description: 'Water supply interrupted for 2 days. Need info on restoration timeline.', contactNumber: '9900112233', latitude: 28.6692, longitude: 77.4538, imageUrl: null, status: 'resolved', feedback: 'Water supply restored. Thanks for your patience.' },
    { villageId: 'VILLAGE003', type: 'water_quality', description: 'High hardness in water causing scaling in pipes and appliances.', contactNumber: '9900112234', latitude: 28.6700, longitude: 77.4545, imageUrl: null, status: 'pending' },
  ],
};

function initializeDemoData() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Database connection error:', err);
      return;
    }

    console.log('Connected to database. Creating tables...');

    db.serialize(() => {
      // Create all tables
      const createTableSql = [
        `CREATE TABLE IF NOT EXISTS gov_users (id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
        `CREATE TABLE IF NOT EXISTS villages (id INTEGER PRIMARY KEY, villageId TEXT UNIQUE NOT NULL, villageName TEXT NOT NULL, location TEXT, population INTEGER, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
        `CREATE TABLE IF NOT EXISTS village_users (id INTEGER PRIMARY KEY, userId TEXT UNIQUE NOT NULL, villageId TEXT NOT NULL, name TEXT NOT NULL, email TEXT, password TEXT NOT NULL, isActive BOOLEAN DEFAULT 1, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (villageId) REFERENCES villages(villageId))`,
        `CREATE TABLE IF NOT EXISTS news_updates (id INTEGER PRIMARY KEY, title TEXT NOT NULL, content TEXT, date DATETIME DEFAULT CURRENT_TIMESTAMP)`,
        `CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY, type TEXT NOT NULL, message TEXT NOT NULL, severity TEXT, affectedVillage TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, resolved BOOLEAN DEFAULT 0, feedback TEXT)`,
        `CREATE TABLE IF NOT EXISTS blockage_alerts (id INTEGER PRIMARY KEY, villageId TEXT NOT NULL, location TEXT NOT NULL, riskLevel INTEGER, severity TEXT, recommendation TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, acknowledged BOOLEAN DEFAULT 0, FOREIGN KEY (villageId) REFERENCES villages(villageId))`,
        `CREATE TABLE IF NOT EXISTS chlorination_reports (id INTEGER PRIMARY KEY, villageId TEXT NOT NULL, ph REAL, tds REAL, hardness REAL, chlorine REAL, temperature REAL, technician TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (villageId) REFERENCES villages(villageId))`,
        `CREATE TABLE IF NOT EXISTS complaints (id INTEGER PRIMARY KEY, villageId TEXT NOT NULL, type TEXT NOT NULL, description TEXT NOT NULL, status TEXT DEFAULT 'pending', feedback TEXT, approvedBy TEXT, latitude REAL, longitude REAL, imageUrl TEXT, contactNumber TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (villageId) REFERENCES villages(villageId))`,
        `CREATE TABLE IF NOT EXISTS disease_scores (id INTEGER PRIMARY KEY, villageId TEXT UNIQUE NOT NULL, score INTEGER, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (villageId) REFERENCES villages(villageId))`,
      ];

      createTableSql.forEach(sql => db.run(sql));
      console.log('✓ Tables created');

      // Insert government users
      demoData.govUsers.forEach(user => {
        db.run('INSERT OR IGNORE INTO gov_users (email, password, name) VALUES (?, ?, ?)', [user.email, user.password, user.name]);
      });
      console.log('✓ Government users added');

      // Insert villages
      demoData.villages.forEach(village => {
        db.run('INSERT OR IGNORE INTO villages (villageId, villageName, location, population) VALUES (?, ?, ?, ?)', [village.villageId, village.villageName, village.location, village.population]);
      });
      console.log('✓ Villages added');

      // Insert village users
      demoData.villageUsers.forEach(user => {
        db.run('INSERT OR IGNORE INTO village_users (userId, villageId, name, email, password) VALUES (?, ?, ?, ?, ?)', [user.userId, user.villageId, user.name, user.email, user.password]);
      });
      console.log('✓ Village users added');

      // Insert news
      demoData.newsUpdates.forEach(news => {
        db.run('INSERT INTO news_updates (title, content) VALUES (?, ?)', [news.title, news.content]);
      });
      console.log('✓ News updates added (5)');

      // Insert alerts
      demoData.alerts.forEach(alert => {
        db.run('INSERT INTO alerts (type, message, severity, affectedVillage) VALUES (?, ?, ?, ?)', [alert.type, alert.message, alert.severity, alert.affectedVillage]);
      });
      console.log('✓ Safety alerts added (4)');

      // Insert blockage alert
      db.run('INSERT INTO blockage_alerts (villageId, location, riskLevel, severity, recommendation) VALUES (?, ?, ?, ?, ?)', ['VILLAGE001', 'Main water pipe - Section A', 65, 'high', 'Schedule pipe cleaning within 3 days']);
      console.log('✓ Blockage alert added');

      // Insert chlorination reports
      demoData.chlorinationReports.forEach(report => {
        db.run('INSERT INTO chlorination_reports (villageId, ph, tds, hardness, chlorine, temperature, technician) VALUES (?, ?, ?, ?, ?, ?, ?)', [report.villageId, report.ph, report.tds, report.hardness, report.chlorine, report.temperature, report.technician]);
      });
      console.log('✓ Chlorination reports added (4)');

      // Insert complaints
      demoData.complaints.forEach(complaint => {
        db.run('INSERT INTO complaints (villageId, type, description, status, contactNumber, latitude, longitude, imageUrl, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [complaint.villageId, complaint.type, complaint.description, complaint.status, complaint.contactNumber, complaint.latitude, complaint.longitude, complaint.imageUrl, complaint.feedback || null]);
      });
      console.log('✓ Complaints added (6)');

      // Insert disease scores
      demoData.villages.forEach(village => {
        db.run('INSERT OR IGNORE INTO disease_scores (villageId, score) VALUES (?, ?)', [village.villageId, Math.floor(Math.random() * 80) + 10]);
      });
      console.log('✓ Disease scores added');

      console.log('\n✅ Demo data initialization complete!');
      console.log('\nLogin Credentials:');
      console.log('Government: admin@gov.com / admin123');
      console.log('Officer: officer@gov.com / officer123');
      console.log('Villages: VILLAGE001 / pass123, VILLAGE002 / pass123, VILLAGE003 / pass123');
      console.log('\n📊 Demo Data Summary:');
      console.log('✓ 6 Complaints with geolocation & images');
      console.log('✓ 4 Chlorination Reports (IoT sensor data)');
      console.log('✓ 4 Safety Alerts with severity levels');
      console.log('✓ 5 News Updates');
      console.log('✓ 3 Villages with 3 users');
      console.log('✓ Government & Officer accounts');
    });

    setTimeout(() => {
      db.close((err) => {
        if (err) console.error('Error closing database:', err);
        else process.exit(0);
      });
    }, 1500);
  });
}

initializeDemoData();
