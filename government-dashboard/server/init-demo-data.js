const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'water_quality.db');

// Sample demo data
const demoData = {
  govUsers: [
    {
      email: 'admin@gov.com',
      password: 'admin123',
      name: 'Admin Officer',
    },
    {
      email: 'officer@gov.com',
      password: 'officer123',
      name: 'Water Quality Officer',
    },
  ],
  villages: [
    {
      villageId: 'VILLAGE001',
      villageName: 'North Valley',
      location: 'District A',
      population: 5000,
    },
    {
      villageId: 'VILLAGE002',
      villageName: 'South Hills',
      location: 'District B',
      population: 3500,
    },
    {
      villageId: 'VILLAGE003',
      villageName: 'East Plains',
      location: 'District C',
      population: 4200,
    },
  ],
  villageUsers: [
    {
      userId: 'USR1001',
      villageId: 'VILLAGE001',
      name: 'Rajesh Kumar',
      email: 'rajesh@village1.com',
      password: 'pass123',
    },
    {
      userId: 'USR1002',
      villageId: 'VILLAGE002',
      name: 'Priya Singh',
      email: 'priya@village2.com',
      password: 'pass123',
    },
    {
      userId: 'USR1003',
      villageId: 'VILLAGE003',
      name: 'Amit Sharma',
      email: 'amit@village3.com',
      password: 'pass123',
    },
  ],
  newsUpdates: [
    {
      title: 'New Water Treatment Plant Inaugurated',
      content: 'A new water treatment facility has been installed in North Valley village with latest RO technology. Expected to improve water quality by 40%.',
    },
    {
      title: 'Monthly Water Quality Report Released',
      content: 'All villages show improved water quality metrics this month. Chlorine levels optimized. TDS within acceptable range.',
    },
    {
      title: 'Free Health Checkup Camp',
      content: 'Government organizing free health checkups for waterborne diseases in all villages. Every Saturday 10 AM.',
    },
    {
      title: 'Water Conservation Campaign Launched',
      content: 'JAL RAKSHAK initiative to promote water conservation. Save 30% water with smart usage.',
    },
    {
      title: 'Community Awareness Program',
      content: 'Learn about water quality testing and safety measures. Join next week!',
    },
  ],
  alerts: [
    {
      type: 'water_quality',
      message: 'TDS level exceeded 500 mg/L. Increase in dissolved solids detected. Action: Water filtration initiated.',
      severity: 'high',
      affectedVillage: 'VILLAGE001',
    },
    {
      type: 'chlorination',
      message: 'Chlorine level below 0.5 mg/L. Disinfection recommended. Urgent treatment scheduled.',
      severity: 'medium',
      affectedVillage: 'VILLAGE002',
    },
    {
      type: 'health',
      message: 'Waterborne disease cases reported. Safe drinking water advisory issued.',
      severity: 'high',
      affectedVillage: 'VILLAGE003',
    },
    {
      type: 'maintenance',
      message: 'Routine pipe maintenance in South Hills area. Water supply may be interrupted 8-10 AM.',
      severity: 'low',
      affectedVillage: 'VILLAGE002',
    },
  ],
  chlorinationReports: [
    {
      villageId: 'VILLAGE001',
      ph: 7.2,
      tds: 320,
      hardness: 140,
      chlorine: 0.8,
      temperature: 22.5,
      technician: 'Rajesh Kumar',
    },
    {
      villageId: 'VILLAGE002',
      ph: 6.8,
      tds: 450,
      hardness: 160,
      chlorine: 0.6,
      temperature: 23.0,
      technician: 'Priya Singh',
    },
    {
      villageId: 'VILLAGE003',
      ph: 7.5,
      tds: 280,
      hardness: 120,
      chlorine: 1.2,
      temperature: 21.8,
      technician: 'Amit Sharma',
    },
    {
      villageId: 'VILLAGE001',
      ph: 7.0,
      tds: 310,
      hardness: 135,
      chlorine: 0.9,
      temperature: 22.0,
      technician: 'Rajesh Kumar',
    },
  ],
  complaints: [
    {
      villageId: 'VILLAGE001',
      type: 'water_quality',
      description: 'Water color is murky and has unusual smell. Unable to use for drinking.',
      contactNumber: '9876543210',
      latitude: 28.7041,
      longitude: 77.1025,
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23444" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="white"%3EWater Sample%3C/text%3E%3C/svg%3E',
      status: 'in_progress',
    },
    {
      villageId: 'VILLAGE001',
      type: 'equipment',
      description: 'Water pump is making strange noise. Needs immediate repair.',
      contactNumber: '9876543211',
      latitude: 28.7050,
      longitude: 77.1030,
      imageUrl: null,
      status: 'pending',
    },
    {
      villageId: 'VILLAGE002',
      type: 'health',
      description: 'Several people in the village have fallen sick. Possibly waterborne disease.',
      contactNumber: '9988776655',
      latitude: 28.5355,
      longitude: 77.3910,
      imageUrl: null,
      status: 'resolved',
      feedback: 'Water tested and found safe. Medical team dispatched for health checks.',
    },
    {
      villageId: 'VILLAGE002',
      type: 'contamination',
      description: 'Sewage water mixing with drinking water supply. Urgent action needed.',
      contactNumber: '9988776656',
      latitude: 28.5360,
      longitude: 77.3915,
      imageUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23666" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="white"%3EPipe Damage Area%3C/text%3E%3C/svg%3E',
      status: 'in_progress',
    },
    {
      villageId: 'VILLAGE003',
      type: 'other',
      description: 'Water supply interrupted for 2 days. Need information about restoration timeline.',
      contactNumber: '9900112233',
      latitude: 28.6692,
      longitude: 77.4538,
      imageUrl: null,
      status: 'resolved',
      feedback: 'Water supply restored. Thanks for your patience.',
    },
    {
      villageId: 'VILLAGE003',
      type: 'water_quality',
      description: 'High hardness in water. Causing scaling in pipes and appliances.',
      contactNumber: '9900112234',
      latitude: 28.6700,
      longitude: 77.4545,
      imageUrl: null,
      status: 'pending',
    },
  ],
};

function initializeDemoData() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Database connection error:', err);
      return;
    }

    console.log('Connected to database. Initializing demo data...');

    db.serialize(() => {
      // Insert government users
      const insertGovUser = db.prepare(
        'INSERT INTO gov_users (email, password, name) VALUES (?, ?, ?)'
      );
      demoData.govUsers.forEach((user) => {
        insertGovUser.run(user.email, user.password, user.name);
      });
      insertGovUser.finalize(() => {
        console.log('✓ Government users added');
      });

      // Insert villages
      const insertVillage = db.prepare(
        'INSERT INTO villages (villageId, villageName, location, population) VALUES (?, ?, ?, ?)'
      );
      demoData.villages.forEach((village) => {
        insertVillage.run(
          village.villageId,
          village.villageName,
          village.location,
          village.population
        );
      });
      insertVillage.finalize(() => {
        console.log('✓ Villages added');
      });

      // Insert village users
      const insertVillageUser = db.prepare(
        'INSERT INTO village_users (userId, villageId, name, email, password) VALUES (?, ?, ?, ?, ?)'
      );
      demoData.villageUsers.forEach((user) => {
        insertVillageUser.run(
          user.userId,
          user.villageId,
          user.name,
          user.email,
          user.password
        );
      });
      insertVillageUser.finalize(() => {
        console.log('✓ Village users added');
      });

      // Insert news updates
      const insertNews = db.prepare(
        'INSERT INTO news_updates (title, content) VALUES (?, ?)'
      );
      demoData.newsUpdates.forEach((news) => {
        insertNews.run(news.title, news.content);
      });
      insertNews.finalize(() => {
        console.log('✓ News updates added');
      });

      // Insert alerts
      const insertAlert = db.prepare(
        'INSERT INTO alerts (type, message, severity, affectedVillage) VALUES (?, ?, ?, ?)'
      );
      demoData.alerts.forEach((alert) => {
        insertAlert.run(
          alert.type,
          alert.message,
          alert.severity,
          alert.affectedVillage
        );
      });
      insertAlert.finalize(() => {
        console.log('✓ Alerts added');
      });

      // Insert sample blockage alert
      db.run(
        `INSERT INTO blockage_alerts 
         (villageId, location, riskLevel, severity, recommendation) 
         VALUES (?, ?, ?, ?, ?)`,
        ['VILLAGE001', 'Main water pipe - Section A', 65, 'high', 'Schedule pipe cleaning within 3 days'],
        () => {
          console.log('✓ Sample blockage alert added');
        }
      );

      // Insert chlorination reports
      const insertChlorinationReport = db.prepare(
        'INSERT INTO chlorination_reports (villageId, ph, tds, hardness, chlorine, temperature, technician) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      demoData.chlorinationReports.forEach((report) => {
        insertChlorinationReport.run(
          report.villageId,
          report.ph,
          report.tds,
          report.hardness,
          report.chlorine,
          report.temperature,
          report.technician
        );
      });
      insertChlorinationReport.finalize(() => {
        console.log('✓ Chlorination reports added');
      });

      // Insert complaints
      const insertComplaint = db.prepare(
        'INSERT INTO complaints (villageId, type, description, status, contactNumber, latitude, longitude, imageUrl, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      demoData.complaints.forEach((complaint) => {
        insertComplaint.run(
          complaint.villageId,
          complaint.type,
          complaint.description,
          complaint.status,
          complaint.contactNumber,
          complaint.latitude,
          complaint.longitude,
          complaint.imageUrl,
          complaint.feedback || null
        );
      });
      insertComplaint.finalize(() => {
        console.log('✓ Complaints added');
      });

      // Insert sample disease scores
      demoData.villages.forEach((village) => {
        db.run(
          'INSERT INTO disease_scores (villageId, score) VALUES (?, ?)',
          [village.villageId, Math.floor(Math.random() * 80) + 10]
        );
      });
      console.log('✓ Disease scores added');

      console.log('\n✅ Demo data initialization complete!');
      console.log('\nYou can now login with:');
      console.log('Government: admin@gov.com / admin123');
      console.log('Officer: officer@gov.com / officer123');
      console.log('Village Users: VILLAGE001 / pass123, VILLAGE002 / pass123, VILLAGE003 / pass123');
      console.log('\n📊 Demo data includes:');
      console.log('✓ 6 Complaints (pending, in-progress, resolved)');
      console.log('✓ 4 Chlorination Reports with water quality data');
      console.log('✓ 4 Safety Alerts with different severity levels');
      console.log('✓ 5 News Updates');
      console.log('✓ Geolocation tags on complaints');
      console.log('✓ Sample images for complaint visualization');

      db.close((err) => {
        if (err) console.error('Error closing database:', err);
      });
    });
  });
}

// Run the initialization
initializeDemoData();
