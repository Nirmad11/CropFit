# utils/weather.py
import requests

def get_weather(city: str, api_key: str):
    """
    Returns (temp_c, humidity) for a city using OpenWeather.
    None, None if anything fails.
    """
    try:
        if not city or not api_key:
            return None, None
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {"q": city, "appid": api_key, "units": "metric"}
        r = requests.get(url, params=params, timeout=8)
        r.raise_for_status()
        j = r.json()
        main = j.get("main", {})
        temp = main.get("temp", None)
        hum = main.get("humidity", None)
        if temp is None or hum is None:
            return None, None
        return float(temp), float(hum)
    except Exception:
        return None, None
