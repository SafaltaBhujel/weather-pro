# WeatherPro 🌦️
A real-time weather dashboard built with Flask and the OpenWeatherMap API. This application provides live meteorological insights and forecasts based on city search or precise GPS geolocation.

## 🚀 Live Demo
[View the App Here](https://weather-pro-zvsb.onrender.com)

## ✨ Features
Live Data: Instant temperature, humidity, wind speed, and sunrise/sunset tracking.

Smart Location: Supports city-based search and browser geolocation for "Weather at my spot."

Predictive Planning: 8-hour granular temperature charts and a 5-day daily outlook.

Responsive Design: Optimized for seamless use on both mobile and desktop devices.

Cloud Optimized: Configured with Gunicorn and dynamic port binding for high performance on Render.

🏗️ **Tech Stack**
Backend: Python / Flask

API: OpenWeatherMap (JSON)

Deployment: Render (CI/CD via GitHub)

Server: Gunicorn

⚙️ **Local Setup**
Clone the repository.

Install dependencies: pip install -r requirements.txt

Run the application: python app.py

📝 **Project Note**
This project demonstrates a complete deployment pipeline, transitioning from a local development environment to a live, production-ready cloud service. It handles asynchronous API requests and displays data through a clean, user-centric interface.
