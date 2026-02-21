@echo off
REM Water Quality Management System - Setup Script for Windows

echo ================================================
echo Water Quality Management System - Setup
echo ================================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ErrorLevel% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js 16 or higher.
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ErrorLevel% NEQ 0 (
    echo Error: Python 3 is not installed. Please install Python 3.9 or higher.
    exit /b 1
)

echo.
echo Installing Government Dashboard...

REM Install client dependencies
cd government-dashboard\client
call npm install
echo ✓ Client dependencies installed

REM Install server dependencies
cd ..\server
call npm install
echo ✓ Server dependencies installed

cd ..\..

echo.
echo Installing Backend Services...

REM Install Python dependencies
python -m venv venv
call venv\Scripts\activate.bat
pip install -r backend-services\requirements.txt
echo ✓ Python dependencies installed

echo.
echo Installing Mobile App...

REM Install mobile app dependencies
cd villagers-app
call npm install
echo ✓ Mobile app dependencies installed

cd ..

echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo To start the application:
echo.
echo 1. Start the backend server:
echo    cd government-dashboard\server && npm start
echo.
echo 2. Start the frontend (in another terminal):
echo    cd government-dashboard\client && npm start
echo.
echo 3. Start Python AI services (in another terminal):
echo    venv\Scripts\activate
echo    python backend-services\sensor-data\sensor_processor.py
echo.
echo 4. Start mobile app (in another terminal):
echo    cd villagers-app && npm start
echo.
echo Make sure MQTT Broker is running on localhost:1883
echo ================================================
