#!/bin/bash

# Water Quality Management System - Setup Script

echo "================================================"
echo "Water Quality Management System - Setup"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

echo ""
echo "Installing Government Dashboard..."

# Install client dependencies
cd government-dashboard/client
npm install
echo "✓ Client dependencies installed"

# Install server dependencies
cd ../server
npm install
echo "✓ Server dependencies installed"

cd ../..

echo ""
echo "Installing Backend Services..."

# Install Python dependencies
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend-services/requirements.txt
echo "✓ Python dependencies installed"

echo ""
echo "Installing Mobile App..."

# Install mobile app dependencies
cd villagers-app
npm install
echo "✓ Mobile app dependencies installed"

cd ..

echo ""
echo "================================================"
echo "Setup Complete!"
echo "================================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend server:"
echo "   cd government-dashboard/server && npm start"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd government-dashboard/client && npm start"
echo ""
echo "3. Start Python AI services (in another terminal):"
echo "   source venv/bin/activate  # or venv\Scripts\activate on Windows"
echo "   python backend-services/sensor-data/sensor_processor.py"
echo ""
echo "4. Start mobile app (in another terminal):"
echo "   cd villagers-app && npm start"
echo ""
echo "Make sure MQTT Broker is running on localhost:1883"
echo "================================================"
