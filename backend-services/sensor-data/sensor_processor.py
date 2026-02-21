import paho.mqtt.client as mqtt
import json
import requests
from database.db_manager import DatabaseManager
from disease_predictor.disease_predictor import DiseasePredictor, BlockagePredictor
import threading
import time

class SensorDataProcessor:
    def __init__(self, mqtt_broker='localhost', mqtt_port=1883, server_url='http://localhost:5000'):
        """
        Initialize sensor data processor
        
        Args:
            mqtt_broker: MQTT broker address
            mqtt_port: MQTT broker port
            server_url: Backend server URL
        """
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.server_url = server_url
        self.client = mqtt.Client()
        self.db = DatabaseManager()
        self.disease_predictor = DiseasePredictor()
        self.blockage_predictor = BlockagePredictor()
        self.running = False
        
        # Setup MQTT callbacks
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect

    def on_connect(self, client, userdata, flags, rc):
        """Handle MQTT connection"""
        if rc == 0:
            print(f"Connected to MQTT broker at {self.mqtt_broker}:{self.mqtt_port}")
            # Subscribe to all sensor topics
            self.client.subscribe("sensors/+/ph")
            self.client.subscribe("sensors/+/tds")
            self.client.subscribe("sensors/+/chlorine")
            self.client.subscribe("sensors/+/temperature")
        else:
            print(f"Failed to connect, return code {rc}")

    def on_disconnect(self, client, userdata, rc):
        """Handle MQTT disconnection"""
        if rc != 0:
            print(f"Unexpected disconnection, return code {rc}")
        self.running = False

    def on_message(self, client, userdata, msg):
        """Handle incoming MQTT messages"""
        try:
            topic_parts = msg.topic.split('/')
            village_id = topic_parts[1]
            sensor_type = topic_parts[2]
            value = float(msg.payload.decode())
            
            print(f"Received {sensor_type} data for {village_id}: {value}")
            
            # Store in database
            self.process_sensor_data(village_id, sensor_type, value)
            
        except Exception as e:
            print(f"Error processing message: {e}")

    def process_sensor_data(self, village_id, sensor_type, value):
        """Process sensor data and trigger alerts if needed"""
        # Get latest sensor data
        latest = self.db.get_latest_sensor_data(village_id, limit=1)
        
        if latest:
            ph = latest[0][2]
            tds = latest[0][3]
            chlorine = latest[0][4]
            temperature = latest[0][5]
            
            # Predict disease risk
            risk_score = self.disease_predictor.predict_risk(ph, tds, chlorine, temperature)
            risk_level = self.disease_predictor.get_risk_level(risk_score)
            
            # Predict blockage risk
            blockage_risk = self.blockage_predictor.predict_blockage(tds, chlorine, 0)
            
            # Send alerts if risk is high
            if risk_score > 50:
                self.send_alert(village_id, risk_level, risk_score)
            
            if blockage_risk > 60:
                self.send_blockage_alert(village_id, blockage_risk)

    def send_alert(self, village_id, risk_level, risk_score):
        """Send health alert to server"""
        try:
            alert_data = {
                'villageId': village_id,
                'title': f'{risk_level} Health Risk Alert',
                'message': f'Disease risk score: {risk_score}%',
                'severity': risk_level.lower(),
                'alertType': 'disease_risk'
            }
            response = requests.post(
                f'{self.server_url}/api/alerts',
                json=alert_data
            )
            print(f"Alert sent: {response.status_code}")
        except Exception as e:
            print(f"Error sending alert: {e}")

    def send_blockage_alert(self, village_id, risk_score):
        """Send blockage alert to server"""
        try:
            alert_data = {
                'villageId': village_id,
                'location': f'Water pipe network - {village_id}',
                'riskLevel': int(risk_score),
                'severity': 'high' if risk_score > 75 else 'medium',
                'recommendation': 'Schedule pipe cleaning and maintenance'
            }
            # This would be sent to the blockage alerts endpoint
            print(f"Blockage alert generated: {alert_data}")
        except Exception as e:
            print(f"Error sending blockage alert: {e}")

    def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client.connect(self.mqtt_broker, self.mqtt_port, keepalive=60)
            self.running = True
            self.client.loop_start()
            print("Sensor processor connected and listening...")
        except Exception as e:
            print(f"Error connecting to MQTT: {e}")

    def disconnect(self):
        """Disconnect from MQTT broker"""
        self.running = False
        self.client.loop_stop()
        self.client.disconnect()
        self.db.close()
        print("Sensor processor disconnected")

    def run(self):
        """Run the sensor processor"""
        self.connect()
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.disconnect()


if __name__ == '__main__':
    processor = SensorDataProcessor()
    processor.run()
