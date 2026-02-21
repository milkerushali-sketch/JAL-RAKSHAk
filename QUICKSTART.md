# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 16+ ([https://nodejs.org/](https://nodejs.org/))
- Python 3.9+ ([https://www.python.org/](https://www.python.org/))

### Step 1: Install Dependencies

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

### Step 2: Initialize Demo Data

#### For Government Dashboard Database:
```bash
cd government-dashboard/server
node init-demo-data.js
```

#### For Python Backend:
```bash
cd backend-services
python init_demo_data.py
```

### Step 3: Start All Services

Open 4 separate terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd government-dashboard/server
npm start
```
Server runs on: http://localhost:5000

**Terminal 2 - React Frontend:**
```bash
cd government-dashboard/client
npm start
```
Frontend runs on: http://localhost:3000

**Terminal 3 - Python AI Services:**
```bash
# Activate Python environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

python backend-services/sensor-data/sensor_processor.py
```

**Terminal 4 - Mobile App (Optional):**
```bash
cd villagers-app
npm start
```
Then select 'w' for web browser, 'a' for Android simulator, or 'i' for iOS simulator

### Step 4: Login to Dashboard

Open http://localhost:3000 in your browser

#### Government Portal Login:
- **Email:** admin@gov.com
- **Password:** admin123

Click **Government Portal** and enter credentials above.

#### Village User Portal:
- **Village ID:** VILLAGE001
- **Password:** pass123

Click **Village User Portal** and enter credentials above.

---

## 📊 Dashboard Features Guide

### Government Dashboard

#### Overview Tab
- View total villages, active alerts, registered users, pending complaints
- Real-time statistics

#### 🚨 AI Blockage Alert
- View AI-predicted pipe blockage risks
- Acknowledge alerts
- Dispatch maintenance teams
- See risk levels and recommendations

#### 👥 User Management
- List all village users
- Add new users (auto-generates ID and password)
- Delete users
- View user status

#### 💧 Chlorination Reminder
- Set chlorine treatment schedules
- Manage treatment locations and dosages
- Daily, weekly, or bi-weekly schedules

#### ⚠️ Safety Alerts
- View all safety alerts across villages
- Filter by severity (High, Medium, Low)
- Get recommendations

#### 📋 Complaint Management
- View all complaints from villages
- Filter by status (Pending, In Progress, Resolved)
- Update complaint status
- View complaint details

### Village User Dashboard

#### 📰 Government News
- Get official updates from government
- Stay informed about new policies

#### 🏥 Disease Scores
- View health risk scores for your village
- See risk percentage and trends

#### ⚠️ Safety Alerts
- Get real-time safety notifications
- View alert severity and details

#### 📝 File Complaint
- Submit water quality issues
- Report problems to government
- Get acknowledgment

#### 📍 Complaint Status
- Track your filed complaints
- View Status: Pending → In Progress → Resolved

---

## 🔧 Configuration

### Change MQTT Broker
Edit `backend-services/sensor-data/sensor_processor.py`:
```python
processor = SensorDataProcessor(
    mqtt_broker='your_broker_ip',
    mqtt_port=1883,
    server_url='http://localhost:5000'
)
```

### Change Database Location
Set in `government-dashboard/server/server.js`:
```javascript
const dbPath = path.join(__dirname, 'path/to/database', 'water_quality.db');
```

### Change JWT Secret
Edit `government-dashboard/server/server.js`:
```javascript
const JWT_SECRET = 'your_custom_secret_key';
```

---

## 📱 Mobile App

### Install Dependencies
```bash
cd villagers-app
npm install
```

### Run on Web
```bash
npm start
# Press 'w' for web browser
```

### Run on Android
```bash
npm run android
# Requires Android Studio and emulator
```

### Run on iOS
```bash
npm run ios
# Requires Xcode (Mac only)
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Database Error
```bash
# Delete and recreate database
rm government-dashboard/database/water_quality.db
cd government-dashboard/server
node init-demo-data.js
```

### Python Module Not Found
```bash
# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Reinstall dependencies
pip install -r backend-services/requirements.txt
```

### MQTT Connection Failed
```bash
# Install Mosquitto (MQTT Broker)
# Windows: Download from https://mosquitto.org/download/
# Mac: brew install mosquitto
# Linux: sudo apt install mosquitto

# Start MQTT broker
mosquitto
```

---

## 📚 API Testing

### Test Government Login
```bash
curl -X POST http://localhost:5000/api/gov/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gov.com","password":"admin123"}'
```

Response will include JWT token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "admin@gov.com",
  "message": "Login successful"
}
```

### Test Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/gov/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Next Steps

1. **Add More Villages:** Use User Management → Add User
2. **Create Complaints:** Login as village user and file complaint
3. **Test AI Alerts:** System will generate blockage alerts automatically
4. **Monitor Sensors:** Connect MQTT sensors for real water data
5. **Customize Designs:** Edit CSS in government-dashboard/client/src

---

## 📞 Support

For detailed documentation, see [README.md](README.md)

For issues:
1. Check terminal output for errors
2. Verify all services are running
3. Check database is initialized
4. Ensure ports are not in use

---

**Happy Testing! 🎉**
