import sqlite3
import json
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_path='water_quality.db'):
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        self.connect()
        self.init_tables()

    def connect(self):
        """Connect to SQLite database"""
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        print(f"Connected to database: {self.db_path}")

    def init_tables(self):
        """Initialize database tables"""
        # Villages table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS villages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                village_id TEXT UNIQUE NOT NULL,
                village_name TEXT NOT NULL,
                location TEXT,
                population INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Sensor data table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS sensor_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                village_id TEXT NOT NULL,
                ph REAL,
                tds REAL,
                chlorine REAL,
                temperature REAL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (village_id) REFERENCES villages(village_id)
            )
        ''')

        # Disease data table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS disease_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                village_id TEXT NOT NULL,
                disease_type TEXT,
                count INTEGER,
                score REAL,
                date DATE,
                FOREIGN KEY (village_id) REFERENCES villages(village_id)
            )
        ''')

        # Blockage predictions table
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS blockage_predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                village_id TEXT NOT NULL,
                location TEXT,
                risk_level INTEGER,
                confidence REAL,
                recommendation TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (village_id) REFERENCES villages(village_id)
            )
        ''')

        self.conn.commit()
        print("Database tables initialized")

    def insert_sensor_data(self, village_id, ph, tds, chlorine, temperature):
        """Insert sensor data"""
        self.cursor.execute('''
            INSERT INTO sensor_data (village_id, ph, tds, chlorine, temperature)
            VALUES (?, ?, ?, ?, ?)
        ''', (village_id, ph, tds, chlorine, temperature))
        self.conn.commit()
        return self.cursor.lastrowid

    def get_latest_sensor_data(self, village_id, limit=1):
        """Get latest sensor data for a village"""
        self.cursor.execute('''
            SELECT * FROM sensor_data 
            WHERE village_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (village_id, limit))
        return self.cursor.fetchall()

    def insert_blockage_prediction(self, village_id, location, risk_level, confidence, recommendation):
        """Insert blockage prediction"""
        self.cursor.execute('''
            INSERT INTO blockage_predictions (village_id, location, risk_level, confidence, recommendation)
            VALUES (?, ?, ?, ?, ?)
        ''', (village_id, location, risk_level, confidence, recommendation))
        self.conn.commit()
        return self.cursor.lastrowid

    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("Database connection closed")
