#!/usr/bin/env python3
"""
Database initialization and demo data insertion script
"""

import sqlite3
from datetime import datetime
import os

DB_PATH = '../database/water_quality.db'

def init_database():
    """Initialize database with demo data"""
    
    # Create database directory if it doesn't exist
    os.makedirs(os.path.dirname(DB_PATH) or '.', exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Creating tables...")
    
    # Create tables
    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS villages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            village_id TEXT UNIQUE NOT NULL,
            village_name TEXT NOT NULL,
            location TEXT,
            population INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            village_id TEXT NOT NULL,
            ph REAL,
            tds REAL,
            chlorine REAL,
            temperature REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (village_id) REFERENCES villages(village_id)
        );

        CREATE TABLE IF NOT EXISTS disease_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            village_id TEXT NOT NULL,
            disease_type TEXT,
            count INTEGER,
            score REAL,
            date DATE,
            FOREIGN KEY (village_id) REFERENCES villages(village_id)
        );

        CREATE TABLE IF NOT EXISTS blockage_predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            village_id TEXT NOT NULL,
            location TEXT,
            risk_level INTEGER,
            confidence REAL,
            recommendation TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (village_id) REFERENCES villages(village_id)
        );
    ''')
    
    print("Inserting demo villages...")
    villages = [
        ('VILLAGE001', 'North Valley', 'District A', 5000),
        ('VILLAGE002', 'South Hills', 'District B', 3500),
        ('VILLAGE003', 'East Plains', 'District C', 4200),
    ]
    
    cursor.executemany(
        'INSERT OR IGNORE INTO villages (village_id, village_name, location, population) VALUES (?, ?, ?, ?)',
        villages
    )
    
    print("Inserting sample sensor data...")
    sensor_data = [
        ('VILLAGE001', 7.2, 350, 0.8, 22),
        ('VILLAGE002', 6.9, 420, 0.6, 24),
        ('VILLAGE003', 7.5, 280, 1.1, 21),
    ]
    
    cursor.executemany(
        'INSERT INTO sensor_data (village_id, ph, tds, chlorine, temperature) VALUES (?, ?, ?, ?, ?)',
        sensor_data
    )
    
    print("Inserting sample disease data...")
    disease_data = [
        ('VILLAGE001', 'Diarrhea', 5, 35.5, '2026-02-21'),
        ('VILLAGE002', 'Typhoid', 2, 28.3, '2026-02-21'),
        ('VILLAGE003', 'Cholera', 1, 15.7, '2026-02-21'),
    ]
    
    cursor.executemany(
        'INSERT INTO disease_data (village_id, disease_type, count, score, date) VALUES (?, ?, ?, ?, ?)',
        disease_data
    )
    
    print("Inserting sample blockage predictions...")
    blockage_data = [
        ('VILLAGE001', 'Main water pipe - Section A', 65, 0.78, 'Schedule pipe cleaning within 3 days'),
        ('VILLAGE002', 'Secondary pipe network', 35, 0.52, 'Monitor pressure regularly'),
    ]
    
    cursor.executemany(
        'INSERT INTO blockage_predictions (village_id, location, risk_level, confidence, recommendation) VALUES (?, ?, ?, ?, ?)',
        blockage_data
    )
    
    conn.commit()
    conn.close()
    
    print("\n✅ Database initialization complete!")
    print("Database location:", os.path.abspath(DB_PATH))
    print("\nSample data inserted:")
    print("- 3 villages")
    print("- 3 sensor readings")
    print("- 3 disease records")
    print("- 2 blockage predictions")

if __name__ == '__main__':
    init_database()
