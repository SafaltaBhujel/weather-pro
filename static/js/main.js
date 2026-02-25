const API_KEY = "d8b7eef8269185d76381f33af143a80c";
let myChart = null, map = null;
let currentUnits = 'metric', lastWeatherData = null;

window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            fetchWeather(pos.coords.latitude, pos.coords.longitude, true);
        }, () => fetchWeather("London", null, false));
    } else { fetchWeather("London", null, false); }
};

async function fetchWeather(query, lon = null, isCoords = false) {
    const url = isCoords ? `/weather?lat=${query}&lon=${lon}&units=${currentUnits}` : `/weather?city=${encodeURIComponent(query)}&units=${currentUnits}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) return alert("City not found");
        lastWeatherData = data;
        displayData(data);
        applyDynamicTheme(data.current.temp);
        initMap(data.coord.lat, data.coord.lon);
        fetchEnvData(data.coord.lat, data.coord.lon, data.current.temp, data.current.description, data.current.pressure);
        updateLocalTime(data.timezone);
    } catch (err) { console.error("Fetch failed", err); }
}

/* --- EYE-CATCHING ALGORITHMS --- */

function updateLaundryLogic(temp, hum, wind, clouds) {
    const statusEl = document.getElementById("laundry-status");
    const timeEl = document.getElementById("drying-time");
    
    if (hum > 75 || clouds > 85) {
        statusEl.innerText = "Bad Day 🧺";
        timeEl.innerText = "Drying: 12+ hours";
    } else if (temp > 20 && hum < 50 && wind > 3) {
        statusEl.innerText = "Excellent! ✅";
        timeEl.innerText = "Drying: ~2-3 hours";
    } else {
        statusEl.innerText = "Fair 🌤️";
        timeEl.innerText = "Drying: ~5-7 hours";
    }
}

// FIXED: Now recognizes High Pressure (like Ein Bokek)
function updateHealthAlert(pressure) {
    const statusEl = document.getElementById("health-status");
    const descEl = document.getElementById("health-desc");
    
    if (pressure < 1000) {
        statusEl.innerText = "Caution ⚠️";
        statusEl.style.color = "#ff9800";
        descEl.innerText = "Low pressure: Migraine risk.";
    } else if (pressure > 1025) {
        statusEl.innerText = "High Pressure ✨";
        statusEl.style.color = "#00e5ff";
        descEl.innerText = "Dense air: Great for breathing!";
    } else {
        statusEl.innerText = "Optimal ✨";
        statusEl.style.color = "#fff";
        descEl.innerText = "Pressure is stable.";
    }
}

// NEW FEATURE: Heart Health Tip
function updateHeartHealth(temp, pressure) {
    // Note: Ensure you added <div id="heart-tip-box"><p id="heart-tip-text"></p></div> to your HTML
    const tipBox = document.getElementById("heart-tip-box");
    const tipText = document.getElementById("heart-tip-text");
    if (!tipBox) return; // Safety check

    const tempC = currentUnits === 'metric' ? temp : (temp - 32) * 5/9;
    let message = "";

    if (tempC >= 35) {
        message = "❤️ Heart Alert: Extreme heat! Your heart is working harder to cool you down. Stay hydrated.";
    } else if (pressure < 1000 || pressure > 1030) {
        message = "💓 Pressure Alert: Sudden changes can affect your pulse. Take it easy today.";
    }

    if (message) {
        tipBox.style.display = "block";
        tipText.innerText = message;
    } else {
        tipBox.style.display = "none";
    }
}

function updateActivityScore(temp, wind, rain) {
    const actEl = document.getElementById("best-activity");
    if (rain > 0) actEl.innerText = "🍿 Best for: Movie Night / Reading";
    else if (temp > 15 && temp < 26 && wind < 8) actEl.innerText = "🎾 Best for: Tennis / Cycling";
    else if (temp > 26) actEl.innerText = "🍦 Best for: Swimming / Ice Cream";
    else if (temp < 5) actEl.innerText = "☕ Best for: Hot Cocoa / Indoor Gym";
    else actEl.innerText = "🚵 Best for: Hiking / Exploring";
}

async function fetchEnvData(lat, lon, temp, desc, pressure) {
    try {
        const [aqiRes, uviRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
            fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        ]);
        const aqiD = await aqiRes.json();
        const uviD = await uviRes.json();
        const aqi = aqiD.list[0].main.aqi;
        const uvi = uviD.value;

        const levels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
        const colors = ["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#7e0023"];
        document.getElementById("aqi-value").innerText = levels[aqi-1];
        document.getElementById("aqi-value").style.color = colors[aqi-1];

        const t = currentUnits === 'metric' ? temp : (temp - 32) * 5/9;
        let advice = [];
        if (t <= 0) advice.push("🧥 Heavy coat & scarf.");
        else if (t <= 18) advice.push("🧥 Jacket recommended.");
        else advice.push("👕 Light T-shirt.");

        if (uvi >= 3) advice.push("🧴 Apply Sunscreen.");
        if (aqi >= 4) advice.push("😷 Air is poor, wear mask.");

        document.getElementById("suggestion-text").innerText = advice.join(" | ");
        
        // Trigger All Features
        updateHealthAlert(pressure);
        updateHeartHealth(temp, pressure);
        updateActivityScore(temp, 0, desc.toLowerCase().includes("rain") ? 1 : 0);
    } catch (e) { console.warn("Env Data Error"); }
}

function displayData(data) {
    const cur = data.current;
    const unit = currentUnits === 'metric' ? '°C' : '°F';
    document.getElementById("current-weather").innerHTML = `
        <div style="text-align: center;">
            <h2>${cur.city}</h2>
            <img src="https://openweathermap.org/img/wn/${cur.icon}@4x.png" width="100">
            <p style="font-size: 4.5rem; font-weight: 800; margin-top: -10px;">${Math.round(cur.temp)}${unit}</p>
            <div style="display: flex; justify-content: center; gap: 15px; font-size: 0.8rem; opacity: 0.8;">
                <span>🌡️ Feels: ${Math.round(cur.feels_like)}°</span>
                <span>💧 Hum: ${cur.humidity}%</span>
                <span>🍃 Wind: ${cur.wind_speed}</span>
            </div>
        </div>`;

    updateLaundryLogic(cur.temp, cur.humidity, cur.wind_speed, cur.clouds || 0);
    renderChart(data.hourly);
    createForecast(data.daily, data.timezone);
    document.getElementById("weatherCard").style.display = "block";
}

/* --- UI HELPERS --- */
function toggleTheme() {
    const btn = document.getElementById('theme-toggle-btn');
    btn.classList.toggle('active');
    document.body.style.filter = btn.classList.contains('active') ? "brightness(1.1) contrast(0.9) saturate(1.2)" : "none";
}

function initMap(lat, lon) {
    if (!map) {
        map = L.map('map', { attributionControl: false }).setView([lat, lon], 9);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
        L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`).addTo(map);
    } else { map.setView([lat, lon], 9); }
    L.circleMarker([lat, lon], { color: '#00e5ff', radius: 8 }).addTo(map);
}

function renderChart(hourly) {
    const ctx = document.getElementById('hourlyChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hourly.map(i => i.time),
            datasets: [{ data: hourly.map(i => i.temp), borderColor: '#fff', tension: 0.4, fill: true, backgroundColor: 'rgba(255,255,255,0.1)' }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } } }
    });
}

function createForecast(daily, offset) {
    let html = '<div>';
    daily.forEach(day => {
        const d = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
        html += `<div class="forecast-card">
            <p>${d}</p>
            <img src="https://openweathermap.org/img/wn/${day.icon}.png" width="30">
            <p><strong>${Math.round(day.temp)}°</strong></p>
        </div>`;
    });
    document.getElementById("forecast").innerHTML = html + '</div>';
}

function updateLocalTime(offset) {
    const d = new Date();
    const local = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + (offset * 1000));
    document.getElementById("local-time").innerText = local.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function applyDynamicTheme(temp) {
    const t = currentUnits === 'metric' ? temp : (temp - 32) * 5/9;
    document.body.style.background = t > 20 ? "linear-gradient(135deg, #f12711, #f5af19)" : "linear-gradient(135deg, #1e3c72, #2a5298)";
}

function getWeather() { const city = document.getElementById("city").value.trim(); if (city) fetchWeather(city, null, false); }
function getLocation() { if (navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, true)); }
function toggleUnits() { currentUnits = currentUnits === 'metric' ? 'imperial' : 'metric'; if (lastWeatherData) fetchWeather(lastWeatherData.current.city, null, false); }
function closeModal() { document.getElementById("forecastModal").style.display = "none"; }