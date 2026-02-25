from flask import Flask, render_template, request, jsonify
import requests, os

app = Flask(__name__)

# Use your key
API_KEY = "d8b7eef8269185d76381f33af143a80c"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/weather")
def get_weather():
    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    units = request.args.get("units", "metric")

    if city:
        url_current = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units={units}"
        url_forecast = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units={units}"
    elif lat and lon:
        url_current = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units={units}"
        url_forecast = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units={units}"
    else:
        return jsonify({"error": "No location provided"}), 400

    try:
        # We use https in the URLs above to stay secure
        res_c = requests.get(url_current).json()
        if res_c.get("cod") != 200:
            return jsonify({"error": res_c.get("message")}), 404

        res_f = requests.get(url_forecast).json()
        
        forecast_daily = []
        seen_dates = set()
        
        for item in res_f["list"]:
            date_str = item["dt_txt"].split(" ")[0]
            if "12:00:00" in item["dt_txt"] and date_str not in seen_dates:
                forecast_daily.append({
                    "date": item["dt"] * 1000,
                    "temp": item["main"]["temp"],
                    "description": item["weather"][0]["description"],
                    "icon": item["weather"][0]["icon"],
                    "humidity": item["main"]["humidity"],
                    "wind_speed": item["wind"]["speed"],
                    "sunrise": res_c["sys"].get("sunrise"),
                    "sunset": res_c["sys"].get("sunset")
                })
                seen_dates.add(date_str)

        hourly_temp = []
        for item in res_f["list"][:8]:
            hourly_temp.append({
                "time": item["dt_txt"].split(" ")[1][:5],
                "temp": item["main"]["temp"]
            })

        return jsonify({
            "current": {
                "city": res_c["name"],
                "temp": res_c["main"]["temp"],
                "feels_like": res_c["main"].get("feels_like"),
                "humidity": res_c["main"].get("humidity"),
                "wind_speed": res_c["wind"].get("speed"),
                "description": res_c["weather"][0]["description"],
                "icon": res_c["weather"][0]["icon"],
                "sunrise": res_c["sys"].get("sunrise"),
                "sunset": res_c["sys"].get("sunset")
            }, 
            "daily": forecast_daily, 
            "hourly": hourly_temp,
            "coord": res_c["coord"],
            "timezone": res_c["timezone"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- CRITICAL FOR HTTPS DEPLOYMENT ---
if __name__ == "__main__":
    # Render and other hosts use the PORT environment variable
    port = int(os.environ.get("PORT", 5000))
    # We set debug=False for production
    app.run(host='0.0.0.0', port=port, debug=False)