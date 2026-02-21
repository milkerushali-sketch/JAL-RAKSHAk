# Configuration Files Guide

## Environment Variables & Configuration

### 1. Backend Server Configuration

Create `.env` file in `government-dashboard/server/`:

```env
# Server
PORT=5000
NODE_ENV=development

# JWT Secret (Change in production!)
JWT_SECRET=your_super_secret_key_change_this_in_production_12345

# Database
DATABASE_PATH=../database/water_quality.db

# MQTT Configuration
MQTT_BROKER=localhost
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=

# API Configuration
API_TIMEOUT=30000
CORS_ORIGIN=http://localhost:3000

# Session
SESSION_TIMEOUT=3600000

# Logging
LOG_LEVEL=info
```

### 2. Frontend Configuration

Create `.env` file in `government-dashboard/client/`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_DEMO_MODE=true
REACT_APP_ENABLE_ANALYTICS=false
```

### 3. Python Services Configuration

Create `.env` file in `backend-services/`:

```env
# MQTT Configuration
MQTT_BROKER=localhost
MQTT_PORT=1883
MQTT_USERNAME=
MQTT_PASSWORD=

# Server Configuration
BACKEND_SERVER_URL=http://localhost:5000

# Database
DATABASE_PATH=../government-dashboard/database/water_quality.db

# AI Model
MODEL_PATH=./disease-predictor/model.pkl

# Logging
LOG_LEVEL=INFO
```

### 4. React Native Configuration

Create `config.js` in `villagers-app/src/`:

```javascript
export const API_URL = 'http://localhost:5000';
export const APP_NAME = 'Water Quality Monitor';
export const APP_VERSION = '1.0.0';

export const API_ENDPOINTS = {
  LOGIN: '/api/user/login',
  NEWS: '/api/user/news',
  ALERTS: '/api/user/safety-alerts',
  DISEASE: '/api/user/disease-score',
  COMPLAINTS: '/api/user/complaints',
  FILE_COMPLAINT: '/api/user/complaint',
};

export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  VILLAGE_ID: 'villageId',
  USER_DATA: 'userData',
};
```

---

## Database Configuration

### SQLite Database Path

**Update in `government-dashboard/server/server.js`:**

```javascript
// Default path
const dbPath = path.join(__dirname, '..', 'database', 'water_quality.db');

// Or use environment variable
const dbPath = process.env.DATABASE_PATH || 
              path.join(__dirname, '..', 'database', 'water_quality.db');
```

### Update Database Location

If you want to use a different database location:

1. Update `server.js`:
```javascript
const dbPath = 'C:/path/to/your/database/water_quality.db';
```

2. Update Python db_manager.py:
```python
self.db_path = 'C:/path/to/your/database/water_quality.db'
```

---

## MQTT Broker Configuration

### Install MQTT (If not installed)

**Windows:**
1. Download from https://mosquitto.org/download/
2. Install with default settings
3. Start Mosquitto service

**Mac:**
```bash
brew install mosquitto
brew services start mosquitto
```

**Linux:**
```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
```

### Test MQTT Connection

```bash
# Subscribe to test topic
mosquitto_sub -h localhost -p 1883 -t "test"

# Publish test message (in another terminal)
mosquitto_pub -h localhost -p 1883 -t "test" -m "Hello MQTT"
```

### Configure Mosquitto

Edit `mosquitto.conf`:

**Windows:** `C:\Program Files\mosquitto\mosquitto.conf`

```conf
# Set port
port 1883

# Enable listeners
listener 1883
protocol mqtt

# Allow anonymous connections (development only)
allow_anonymous true

# Enable password file (production)
# password_file C:\path\to\passwd
```

---

## SSL/TLS Configuration (Production)

### Generate SSL Certificates

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate
openssl req -new -x509 -key server.key -out server.crt -days 365
```

### Update Server Configuration

In `server.js`:

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS Server running on ${PORT}`);
});
```

---

## Database Migration & Backup

### Backup Database

```bash
# Windows
copy government-dashboard\database\water_quality.db backup\water_quality.db.backup

# Mac/Linux
cp government-dashboard/database/water_quality.db backup/water_quality.db.backup
```

### Restore Database

```bash
# Windows
copy backup\water_quality.db.backup government-dashboard\database\water_quality.db

# Mac/Linux
cp backup/water_quality.db.backup government-dashboard/database/water_quality.db
```

---

## Performance Tuning

### Database Optimization

Add to `server.js` before running queries:

```javascript
// Enable WAL mode (faster)
db.run('PRAGMA journal_mode = WAL');

// Set cache size
db.run('PRAGMA cache_size = 10000');

// Enable synchronous off for faster writes (risky!)
// db.run('PRAGMA synchronous = OFF');
```

### MQTT Optimization

In `sensor_processor.py`:

```python
client = mqtt.Client()
client.max_inflight_messages_set(20)
client.max_queued_messages_set(0)
```

---

## Monitoring & Logging

### Enable Logging in Server

Update `server.js`:

```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

### Log API Requests to File

```javascript
const fs = require('fs');
const path = require('path');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));
```

---

## Security Configuration

### Change Default Credentials

**In database initialization:**

```javascript
// Do not use demo credentials in production
const demoData = {
  govUsers: [
    {
      email: 'your_new_email@gov.com',
      password: 'use_bcrypt_hashed_password',
      name: 'Your Name',
    }
  ]
};
```

### Implement Password Hashing

Install bcrypt:
```bash
npm install bcrypt
```

Use in server:
```javascript
const bcrypt = require('bcrypt');

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Compare password
const isValid = await bcrypt.compare(password, hashedPassword);
```

---

## Docker Configuration (Optional)

### Dockerfile for Server

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  server:
    build: ./government-dashboard/server
    ports:
      - "5000:5000"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - MQTT_BROKER=mqtt
    depends_on:
      - mqtt

  mqtt:
    image: eclipse-mosquitto:latest
    ports:
      - "1883:1883"
    volumes:
      - ./mosquitto.conf:/mosquitto/config/mosquitto.conf

  client:
    build: ./government-dashboard/client
    ports:
      - "3000:3000"
    depends_on:
      - server
```

---

## Advanced Configuration

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);
```

### API Versioning

```javascript
// v1 routes
app.use('/api/v1/', require('./routes/v1'));

// v2 routes
app.use('/api/v2/', require('./routes/v2'));
```

### Email Notifications

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

---

## Systemd Service (Linux)

Create `/etc/systemd/system/water-quality.service`:

```ini
[Unit]
Description=Water Quality Management System
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/home/app/JAL-RAKSHAk/government-dashboard/server
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable water-quality
sudo systemctl start water-quality
```

---

## Nginx Reverse Proxy (Production)

Create `nginx.conf`:

```nginx
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name example.com;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Checklist for Production Deployment

- [ ] Change all default passwords
- [ ] Implement bcrypt for password hashing
- [ ] Enable HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper JWT secret
- [ ] Set up database backups
- [ ] Enable logging
- [ ] Configure rate limiting
- [ ] Setup monitoring
- [ ] Configure firewall
- [ ] Use environment variables
- [ ] Enable CORS properly
- [ ] Setup automated tests
- [ ] Configure CI/CD pipeline
- [ ] Document all changes

---

**Configuration Last Updated:** February 21, 2026
