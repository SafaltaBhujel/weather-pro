<!DOCTYPE html>
<html>
<head>
  <title>WeatherPro</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    <h1>WeatherPro 🌤️</h1>
    <div class="search-bar">
      <input id="city" placeholder="Enter city">
      <button onclick="getWeather()">Search</button>
    </div>

    <div id="current-weather"></div>
    <div id="forecast"></div>

    <canvas id="hourlyChart" width="400" height="150"></canvas>
  </div>
  <script src="{{ url_for('static', filename='js/main.js') }}"></script>
</body>
</html>
