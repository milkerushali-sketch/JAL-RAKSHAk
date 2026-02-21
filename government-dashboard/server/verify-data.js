const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'water_quality.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('\n✅ Connected to database\n');
  verifyData();
});

const verifyData = () => {
  console.log('📊 DEMO DATA VERIFICATION REPORT');
  console.log('================================\n');

  // Check villages
  db.all('SELECT * FROM villages', (err, villages) => {
    console.log(`🏘️ VILLAGES: ${villages?.length || 0}`);
    villages?.forEach(v => console.log(`   - ${v.villageId}: ${v.villageName}`));
    console.log('');
  });

  // Check complaints
  db.all('SELECT * FROM complaints', (err, complaints) => {
    console.log(`📋 COMPLAINTS: ${complaints?.length || 0}`);
    complaints?.forEach(c => {
      console.log(`   - ID ${c.id}: ${c.type} (${c.status}) - Village: ${c.villageId}`);
    });
    console.log('');
  });

  // Check alerts
  db.all('SELECT * FROM alerts', (err, alerts) => {
    console.log(`🚨 SAFETY ALERTS: ${alerts?.length || 0}`);
    alerts?.forEach(a => {
      console.log(`   - ${a.type}: ${a.message} (${a.severity})`);
    });
    console.log('');
  });

  // Check chlorination reports
  db.all('SELECT * FROM chlorination_reports', (err, reports) => {
    if (err) {
      console.log(`💧 CHLORINATION REPORTS: Table not found or error`);
    } else {
      console.log(`💧 CHLORINATION REPORTS: ${reports?.length || 0}`);
      reports?.forEach(r => {
        console.log(`   - Village: ${r.villageId || r.village}, pH: ${r.ph}, TDS: ${r.tds}, Chlorine: ${r.chlorine}`);
      });
    }
    console.log('');
  });

  // Check news updates
  db.all('SELECT * FROM news_updates', (err, news) => {
    console.log(`📰 NEWS UPDATES: ${news?.length || 0}`);
    news?.forEach(n => {
      console.log(`   - ${n.title}`);
    });
    console.log('');
  });

  // Check sensor data
  db.all('SELECT COUNT(*) as count FROM sensor_data', (err, result) => {
    console.log(`📡 SENSOR DATA RECORDS: ${result?.[0]?.count || 0}`);
    console.log('');
    console.log('✅ Data verification complete!');
    db.close();
  });
};
