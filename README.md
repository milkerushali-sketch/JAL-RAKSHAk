# Water Quality Management System

A comprehensive water quality monitoring and management solution with AI-powered disease prediction, blockage alerts, and governance dashboards for both government officials and village users.

## Project Structure

```
JAL RAKSHAk/
├── government-dashboard/          # Main web dashboard
│   ├── client/                     # React frontend
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/         # Reusable components
│   │   │   │   ├── UserManagement.js
│   │   │   │   ├── AIBlockageAlert.js
│   │   │   │   ├── ChlorinationReminder.js
│   │   │   │   ├── SafetyAlerts.js
│   │   │   │   └── ComplaintAnalysis.js
│   │   │   ├── pages/              # Page components
│   │   │   │   ├── GovLogin.js
│   │   │   │   ├── GovDashboard.js
│   │   │   │   ├── LocalUserLogin.js
│   │   │   │   ├── LocalUserDashboard.js
│   │   │   │   ├── Dashboard.css
│   │   │   │   └── Login.css
│   │   │   ├── App.js
│   │   │   ├── App.css
│   │   │   └── index.js
│   │   └── package.json
│   ├── server/                     # Node.js backend
│   │   ├── server.js
│   │   ├── package.json
│   │   └── routes/
│   └── database/
│       └── db_manager.py
├── backend-services/               # Python AI services
│   ├── disease-predictor/          # TensorFlow Disease Predictor
│   │   └── disease_predictor.py
│   ├── sensor-data/                # MQTT Sensor Data Processor
│   │   └── sensor_processor.py
│   └── requirements.txt
└── villagers-app/                  # React Native mobile app
    ├── src/
    │   ├── screens/
    │   │   ├── LoginScreen.js
    │   │   ├── DashboardScreen.js
    │   │   └── ComplaintStatusScreen.js
    │   └── App.js
    └── package.json
```

## Features

### Government Dashboard
- **AI Blockage Alerts**: Real-time pipeline blockage risk detection using machine learning
- **User Management**: Add/remove village users, generate unique IDs and passwords
- **Chlorination Reminder**: Set water chlorination schedules for different villages
- **Safety Alerts**: Monitor and manage water quality alerts for all villages
- **Complaint Analysis**: Track, filter, and manage user complaints with status updates

### Local User Dashboard
- **Government News**: Receive updates from government officials
- **Disease Risk Scores**: View disease risk scores for different villages
- **Safety Alerts**: Get real-time safety alerts for their village
- **File Complaints**: Submit water quality issues and concerns
- **Complaint Status**: Track the status of filed complaints

### Villagers App (React Native)
- **Mobile Access**: Complete mobile experience for village users
- **Water Quality Updates**: Real-time water quality monitoring
- **Disease Tracking**: Disease risk and health alerts
- **Offline Support**: Works with SQLite for offline functionality
- **Photo Upload**: Capture and send photos for complaints

### AI Services (Python)
- **Disease Prediction**: TensorFlow-based model for disease risk prediction
- **Blockage Detection**: Automated pipe blockage risk assessment
- **Sensor Processing**: MQTT-based real-time sensor data processing
- **Water Quality Analysis**: Analyze pH, TDS, Chlorine, and Temperature levels

## Technology Stack

### Frontend
- React.js 18.2
- React Native (Expo)
- Axios for API calls
- CSS3 for styling

### Backend
- Node.js with Express.js
- SQLite3 database
- JWT authentication
- CORS support

### AI/ML
- TensorFlow 2.13
- NumPy for data processing
- OpenCV for image processing
- MQTT for sensor data streaming
- Python 3.9+

### Infrastructure
- MQTT Broker for sensor data
- REST API architecture
- Secure token-based authentication

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Python 3.9+
- MQTT Broker (Mosquitto)
- SQLite

### 1. Clone & Navigate
```bash
cd JAL\ RAKSHAk
```

### 2. Install Government Dashboard

#### Client Setup
```bash
cd government-dashboard/client
npm install
npm start
```

#### Server Setup
```bash
cd government-dashboard/server
npm install
npm start
```

### 3. Install Backend Services

```bash
cd backend-services
pip install -r requirements.txt
python sensor-data/sensor_processor.py
```

### 4. Install Villagers App

```bash
cd villagers-app
npm install
npm start
```

Or for specific platforms:
```bash
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

## API Endpoints

### Government Authentication
- `POST /api/gov/login` - Government login

### Government Dashboard
- `GET /api/gov/stats` - Get dashboard statistics
- `GET /api/gov/users` - List all village users
- `POST /api/gov/users` - Create new village user
- `DELETE /api/gov/users/:id` - Remove user
- `GET /api/gov/blockage-alerts` - Get blockage alerts
- `POST /api/gov/blockage-alerts/:id/acknowledge` - Acknowledge alert
- `POST /api/gov/blockage-alerts/:id/dispatch` - Dispatch team
- `GET /api/gov/chlorination-reminders` - Get chlorination schedule
- `POST /api/gov/chlorination-reminders` - Add reminder
- `DELETE /api/gov/chlorination-reminders/:id` - Delete reminder
- `GET /api/gov/safety-alerts` - Get safety alerts
- `GET /api/gov/complaints` - Get all complaints
- `PATCH /api/gov/complaints/:id` - Update complaint status

### Local User Authentication
- `POST /api/user/login` - Village user login

### Local User Dashboard
- `GET /api/user/news` - Get news updates
- `GET /api/user/safety-alerts` - Get safety alerts
- `GET /api/user/disease-score` - Get disease scores
- `GET /api/user/complaints` - Get user complaints
- `POST /api/user/complaint` - File new complaint

### Sensor Data
- `POST /api/sensor/data` - Store sensor data
- `GET /api/sensor/latest/:villageId` - Get latest sensor data

## Database Schema

### Gov Users
```sql
id, email, password, name, createdAt
```

### Village Users
```sql
id, userId, villageId, name, email, password, isActive, createdAt
```

### Sensor Data
```sql
id, villageId, ph, tds, chlorine, temperature, timestamp
```

### Complaints
```sql
id, villageId, type, description, status, createdAt, updatedAt
```

### Blockage Alerts
```sql
id, villageId, location, riskLevel, severity, recommendation, acknowledged, dispatched, timestamp
```

## Configuration

### Environment Variables
Create `.env` file in server directory:
```
PORT=5000
JWT_SECRET=your_jwt_secret_key
MQTT_BROKER=localhost
MQTT_PORT=1883
DATABASE_PATH=../database/water_quality.db
```

## Usage

### For Government Officials
1. Login with government credentials
2. Navigate through dashboard tabs
3. Manage village users
4. Monitor AI blockage alerts
5. Set chlorination schedules
6. Review and manage complaints

### For Village Users
1. Login with village ID and password
2. View water quality updates from government
3. Check disease risk scores
4. Read safety alerts
5. File complaints about water quality
6. Track complaint status

### For Mobile App Users
1. Install on Android/iOS device
2. Login with credentials
3. Access all features on mobile
4. File complaints with photos
5. Get real-time notifications

## Disease Risk Prediction

The AI model analyzes:
- **pH Level**: 6.5-8.5 is optimal
- **TDS (Total Dissolved Solids)**: <500 mg/L is optimal
- **Chlorine**: 0.5-2 mg/L is optimal
- **Temperature**: 20-25°C is optimal

Risk Score Interpretation:
- 0-25%: Low risk
- 25-50%: Medium risk
- 50-75%: High risk
- 75-100%: Critical risk

## Blockage Detection

Uses machine learning to predict:
- Pipe blockage probability
- Risk levels
- Maintenance recommendations
- Required action priorities

## Testing

### API Testing with cURL
```bash
# Government Login
curl -X POST http://localhost:5000/api/gov/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gov@example.com","password":"password"}'

# Get Dashboard Stats
curl -X GET http://localhost:5000/api/gov/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Performance Optimization

- Caching at application level
- Database indexing on frequently queried columns
- Lazy loading for large lists
- Image compression for mobile app
- MQTT connection pooling

## Security

- JWT-based authentication
- Password hashing (implement bcrypt)
- HTTPS/TLS recommended for production
- Input validation on all endpoints
- CORS properly configured

## Troubleshooting

### Server Won't Connect
- Check if ports 5000, 3000, 1883 are available
- Verify MQTT broker is running
- Check database file permissions

### API Errors
- Verify JWT token is valid
- Check request payload format
- Ensure database is initialized

### ML Model Issues
- Verify TensorFlow installation
- Check sensor data format
- Validate input ranges

## Future Enhancements

1. Push notifications for alerts
2. Historical data analytics
3. Advanced ML models with real training data
4. Water treatment cost optimization
5. Integration with IoT devices
6. Multi-language support
7. Advanced reporting and analytics
8. Blockchain for complaints verification
9. Community forums
10. Video tutorials and guides

## Support & Documentation

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check database initialization
4. Verify all dependencies are installed

## License

This project is developed for water quality management and distribution.

## Contributors

- Government Water Quality Team
- Village Support Services
- AI & ML Development Team
- Mobile Development Team


**Last Updated**: February 21, 2026
**Version**: 1.0.0
