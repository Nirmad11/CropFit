# app.py — full backend (Auth + Obj1 + Obj2 + Obj3 + Obj4)

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3, os, traceback, joblib
import pandas as pd

# -------- Optional weather import (safe fallback if utils/weather.py not present) --------
try:
    # expects: get_weather(city, api_key) -> (temp_c, humidity)
    from utils.weather import get_weather  # type: ignore
except Exception:
    def get_weather(*args, **kwargs):
        return None, None

# -------- Cycle planning helpers (Objective 2) --------
from utils.cycle_data import (
    get_next_crop, ROTATION_ALTS, CROP_GUIDE, make_12_week_plan,
    YIELD_AVG_QTL_HA, NPK_BALANCE, get_crop_tips, get_season_info, normalize_state
)

# ======================== Paths & App ========================
BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "users.db")
MODEL_PATH = os.path.join(BASE_DIR, "models", "crop_model.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "models", "feature_order.pkl")

# Objective 3/4 datasets
DISTRICT_CSV_PATH = os.path.join(BASE_DIR, "data", "district_crop_yield.csv")
PRICE_COST_CSV_PATH = os.path.join(BASE_DIR, "data", "price_cost_reference.csv")

# Lazy caches
_DISTRICT_DF = None
_PRICE_DF = None

app = Flask(__name__)

# Allow your Vite dev origins, methods, and headers explicitly
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"],
        }
    },
)

@app.after_request
def add_cors_headers(resp):
    origin = request.headers.get("Origin", "")
    if origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return resp

print("✅ Loaded app.py from:", __file__)

# ======================== Load ML model for Obj1 ========================
CROP_MODEL = None
FEATURE_ORDER = None
if os.path.exists(MODEL_PATH) and os.path.exists(FEATURES_PATH):
    try:
        CROP_MODEL = joblib.load(MODEL_PATH)
        FEATURE_ORDER = joblib.load(FEATURES_PATH)
        print("✅ Loaded crop model with features:", FEATURE_ORDER)
    except Exception as e:
        print("⚠️ Could not load model:", e)
else:
    print("⚠️ Model or feature file not found. Using fallback rules for prediction.")

# ======================== DB (Auth) ========================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password_hash TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ======================== Helpers: Datasets (Obj3/Obj4) ========================
def _load_district_df():
    """Load & cache district crop yield dataset."""
    global _DISTRICT_DF
    if _DISTRICT_DF is not None:
        return _DISTRICT_DF
    if not os.path.exists(DISTRICT_CSV_PATH):
        print(f"⚠️ district_crop_yield.csv not found at {DISTRICT_CSV_PATH}")
        return None

    df = pd.read_csv(DISTRICT_CSV_PATH)
    # Normalize headers if needed
    df.columns = [c.strip() for c in df.columns]
    rename_map = {
        "Area": "Area_ha",
        "Production": "Production_q",
        "Yield": "Yield_q_per_ha",
        "state": "State",
        "district": "District",
        "year": "Year",
        "season": "Season",
        "crop": "Crop",
    }
    for k, v in rename_map.items():
        if k in df.columns and v not in df.columns:
            df = df.rename(columns={k: v})

    # enforce dtypes/clean
    df["State"] = df["State"].astype(str).str.strip().str.title()
    df["District"] = df["District"].astype(str).str.strip().str.title()
    df["Crop"] = df["Crop"].astype(str).str.strip().str.lower()
    df["Season"] = df["Season"].astype(str).str.strip().str.title()
    df["Year"] = pd.to_numeric(df.get("Year", None), errors="ignore")

    for col in ["Area_ha", "Production_q", "Yield_q_per_ha"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    if "Yield_q_per_ha" not in df.columns and {"Production_q","Area_ha"}.issubset(df.columns):
        df["Yield_q_per_ha"] = df["Production_q"] / df["Area_ha"]

    df = df[(df.get("Area_ha", 0) > 0)]
    df = df.dropna(subset=["Yield_q_per_ha"])
    _DISTRICT_DF = df
    print(f"✅ Loaded district data: {len(df)} rows, states={df['State'].nunique()}, districts={df['District'].nunique()}")
    return _DISTRICT_DF

def _load_price_df():
    """Load & cache price/cost references."""
    global _PRICE_DF
    if _PRICE_DF is not None:
        return _PRICE_DF
    if not os.path.exists(PRICE_COST_CSV_PATH):
        print(f"⚠️ price_cost_reference.csv not found at {PRICE_COST_CSV_PATH}. Will use internal fallbacks.")
        _PRICE_DF = None
        return None
    df = pd.read_csv(PRICE_COST_CSV_PATH)
    df.columns = [c.strip() for c in df.columns]
    # expected: Crop, price_rs_per_quintal, cost_rs_per_hectare
    # normalize crop
    if "Crop" in df.columns:
        df["Crop"] = df["Crop"].astype(str).str.strip().str.lower()
    # coerce numbers
    for col in ["price_rs_per_quintal", "cost_rs_per_hectare"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    _PRICE_DF = df
    print(f"✅ Loaded price/cost reference: {len(df)} crops")
    return _PRICE_DF

# simple internal fallbacks if CSV missing
_PRICE_FALLBACK = {
    # crop(lower): (price_rs_per_q, cost_rs_per_ha)
    "rice": (2200, 65000),
    "wheat": (2200, 55000),
    "maize": (1900, 48000),
    "sugarcane": (310, 140000),    # price per quintal is low; yield is huge
    "cotton": (6500, 80000),
    "chickpea": (4800, 45000),
    "mustard": (5400, 42000),
    "kidneybeans": (8500, 70000),
    "pigeonpeas": (6000, 50000),
    "tea": (15000, 120000),
    "millets": (2500, 38000),
    "groundnut": (5500, 60000),
}

def _lookup_price_cost(crop_lower: str):
    """Return (price_rs_per_quintal, cost_rs_per_hectare, note)"""
    df = _load_price_df()
    if df is not None and {"Crop", "price_rs_per_quintal", "cost_rs_per_hectare"}.issubset(df.columns):
        row = df[df["Crop"] == crop_lower].head(1)
        if not row.empty:
            p = row["price_rs_per_quintal"].iloc[0]
            c = row["cost_rs_per_hectare"].iloc[0]
            if pd.notna(p) and pd.notna(c):
                return float(p), float(c), "From price_cost_reference.csv"
    # fallback
    if crop_lower in _PRICE_FALLBACK:
        p, c = _PRICE_FALLBACK[crop_lower]
        return float(p), float(c), "Fallback internal reference (demo)"
    # last resort defaults
    return 2500.0, 50000.0, "Generic defaults (demo)"

# ======================== Health/Utils ========================
@app.route("/api/ping")
def ping():
    return jsonify({"ok": True, "message": "pong"})

@app.route("/api/routes")
def routes():
    return jsonify(sorted([r.rule for r in app.url_map.iter_rules()]))

# ======================== Auth APIs ========================
@app.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.get_json(force=True) or {}
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        if not name or not email or not password:
            return jsonify({"ok": False, "error": "name, email, password required"}), 400

        pwd_hash = generate_password_hash(password)
        conn = get_db()
        try:
            conn.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (name, email, pwd_hash),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            return jsonify({"ok": False, "error": "Email already registered"}), 409
        finally:
            conn.close()

        return jsonify({"ok": True, "user": {"name": name, "email": email}})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        if not email or not password:
            return jsonify({"ok": False, "error": "email and password required"}), 400

        conn = get_db()
        row = conn.execute(
            "SELECT id, name, email, password_hash FROM users WHERE email = ?",
            (email,),
        ).fetchone()
        conn.close()

        if not row:
            return jsonify({"ok": False, "error": "User not found"}), 404
        if not check_password_hash(row["password_hash"], password):
            return jsonify({"ok": False, "error": "Invalid password"}), 401

        return jsonify({"ok": True, "user": {"name": row["name"], "email": row["email"]}})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500

# ======================== Objective 1: Predict Crop ========================
@app.route("/api/predict-crop", methods=["POST"])
def predict_crop():
    def to_float(x, default=None):
        try:
            if x is None:
                return default
            if isinstance(x, (int, float)):
                return float(x)
            x = str(x).strip()
            if x == "":
                return default
            return float(x)
        except Exception:
            return default

    try:
        data = request.get_json(force=True) or {}

        # Safe parse
        N = to_float(data.get("N"), 0.0)
        P = to_float(data.get("P"), 0.0)
        K = to_float(data.get("K"), 0.0)
        ph = to_float(data.get("ph"), 7.0)
        rainfall = to_float(data.get("rainfall"), 0.0)
        city = (data.get("city") or "").strip()

        temperature = to_float(data.get("temperature"), None)
        humidity = to_float(data.get("humidity"), None)

        used_weather_api = False

        # Optional: weather fetch (never crash)
        try:
            api_key = os.environ.get("OPENWEATHER_API_KEY", "")
            if (temperature is None or humidity is None) and city and api_key:
                t, h = get_weather(city, api_key)
                if t is not None and h is not None:
                    temperature, humidity = float(t), float(h)
                    used_weather_api = True
        except Exception:
            pass

        if temperature is None: temperature = 25.0
        if humidity is None: humidity = 60.0

        # Predict: ML model (if loaded) else fallback rules
        if CROP_MODEL is not None and FEATURE_ORDER is not None:
            try:
                values = {
                    "N": N, "P": P, "K": K,
                    "temperature": float(temperature),
                    "humidity": float(humidity),
                    "ph": ph, "rainfall": rainfall
                }
                row = [[values[f] for f in FEATURE_ORDER]]
                pred = CROP_MODEL.predict(row)
                rec = str(pred[0])
                source = "ml"
            except Exception:
                source = "fallback"
                if rainfall > 200 and 6.0 <= ph <= 7.5:
                    rec = "rice"
                elif rainfall < 80 and 6.0 <= ph <= 7.8:
                    rec = "wheat"
                elif ph is not None and ph < 5.8:
                    rec = "tea"
                elif (ph is not None and ph > 7.8) and (N is not None and N < 50):
                    rec = "millets"
                else:
                    rec = "maize"
        else:
            source = "fallback"
            if rainfall > 200 and 6.0 <= ph <= 7.5:
                rec = "rice"
            elif rainfall < 80 and 6.0 <= ph <= 7.8:
                rec = "wheat"
            elif ph is not None and ph < 5.8:
                rec = "tea"
            elif (ph is not None and ph > 7.8) and (N is not None and N < 50):
                rec = "millets"
            else:
                rec = "maize"

        return jsonify({
            "ok": True,
            "recommendation": rec,
            "inputs": {
                "N": N, "P": P, "K": K, "ph": ph, "rainfall": rainfall,
                "temperature": float(temperature), "humidity": float(humidity),
                "city": city, "used_weather_api": used_weather_api
            },
            "source": source
        })
    except Exception as e:
        return jsonify({"ok": False, "error": f"Prediction failed: {str(e)}"}), 400

# ======================== Objective 2: Cycle Plan (state-aware) ========================
@app.route("/api/cycle-plan", methods=["POST"])
def cycle_plan():
    try:
        data = request.get_json(force=True) or {}
        curr = (data.get("current_crop") or "").strip().lower()
        soil_type = (data.get("soil_type") or "").strip()
        region_raw = (data.get("region") or "").strip()
        region = normalize_state(region_raw)  # Title Case normalization

        if not curr:
            return jsonify({"ok": False, "error": "current_crop is required"}), 400

        print(f"🌀 /api/cycle-plan: curr={curr} state_raw='{region_raw}' normalized='{region}'")

        nxt = get_next_crop(curr, region)

        alts = ROTATION_ALTS.get(curr, [])
        if nxt in alts:
            alts = [a for a in alts if a != nxt]
        alts = alts[:2]

        guide = CROP_GUIDE.get(nxt, CROP_GUIDE.get(curr, {"soil": "—", "fertilizer": "—", "water": "—"}))

        y_curr = YIELD_AVG_QTL_HA.get(curr, 15)
        y_next = YIELD_AVG_QTL_HA.get(nxt, 15)
        yield_compare = {"current": y_curr, "next": y_next, "unit": "quintal/ha"}

        npk = NPK_BALANCE.get(nxt, {"N": 33, "P": 33, "K": 34})
        season = get_season_info(region, nxt)
        tips = get_crop_tips(nxt)
        plan12w = make_12_week_plan(nxt)

        rationale = (
            f"Rotating from {curr.capitalize()} to {nxt.capitalize()} improves soil health and breaks pest/disease cycles. "
            f"Adopt the recommended nutrient & water schedule. "
            f"Recommended seasons: {', '.join(season.get('preferred', []))}."
        )

        return jsonify({
            "ok": True,
            "current_crop": curr,
            "next_crop": nxt,
            "alternatives": alts,
            "guide": guide,
            "yield_compare": yield_compare,
            "npk_balance": npk,
            "season": {"preferred": season.get("preferred", []), "window_text": season.get("window_text", "")},
            "tips": tips,
            "plan12w": plan12w,
            "rationale": rationale,
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 400

# ======================== Objective 3: Regions & District recommendations ========================
@app.route("/api/regions/states")
def list_states():
    df = _load_district_df()
    if df is None:
        return jsonify({"ok": False, "error": "district_crop_yield.csv missing"}), 500
    states = sorted(df["State"].unique().tolist())
    return jsonify({"ok": True, "states": states})

@app.route("/api/regions/districts")
def list_districts():
    state = (request.args.get("state") or "").strip().title()
    df = _load_district_df()
    if df is None:
        return jsonify({"ok": False, "error": "district_crop_yield.csv missing"}), 500
    if not state:
        return jsonify({"ok": False, "error": "state query parameter is required"}), 400
    sub = df[df["State"] == state]
    districts = sorted(sub["District"].unique().tolist())
    return jsonify({"ok": True, "state": state, "districts": districts})

@app.route("/api/regions/crops")
def list_crops():
    """
    Query params: state, district
    Returns all crops available in that district.
    """
    state = (request.args.get("state") or "").strip().title()
    district = (request.args.get("district") or "").strip().title()
    df = _load_district_df()
    if df is None:
        return jsonify({"ok": False, "error": "district_crop_yield.csv missing"}), 500
    if not state or not district:
        return jsonify({"ok": False, "error": "state and district are required"}), 400
    sub = df[(df["State"] == state) & (df["District"] == district)]
    if sub.empty:
        return jsonify({"ok": False, "error": f"No records for {district}, {state}"}), 404
    crops = sorted({c.title() for c in sub["Crop"].astype(str)})
    return jsonify({"ok": True, "state": state, "district": district, "crops": crops})

@app.route("/api/district-reco", methods=["POST"])
def district_reco():
    """
    Inputs:
      - state, district (required)
      - season (optional: 'Kharif' | 'Rabi' | 'Zaid' | 'Summer')
      - top_n (optional int, default 5)
    """
    try:
        data = request.get_json(force=True) or {}
        state_raw = (data.get("state") or "").strip()
        district_raw = (data.get("district") or "").strip()
        season_raw = (data.get("season") or "").strip()
        top_n = int(data.get("top_n") or 5)

        if not state_raw or not district_raw:
            return jsonify({"ok": False, "error": "state and district are required"}), 400

        state = " ".join(state_raw.lower().split()).title()
        district = " ".join(district_raw.lower().split()).title()
        season = season_raw.title() if season_raw else None

        df = _load_district_df()
        if df is None:
            return jsonify({"ok": False, "error": "district_crop_yield.csv not found"}), 500

        sub = df[(df["State"] == state) & (df["District"] == district)].copy()
        if season:
            sub = sub[sub["Season"] == season]
        if sub.empty:
            return jsonify({"ok": False, "error": f"No records for {district}, {state}"}), 404

        grp = (sub.groupby("Crop", as_index=False)["Yield_q_per_ha"].mean()
                 .rename(columns={"Yield_q_per_ha": "Yield"}))
        grp = grp.sort_values("Yield", ascending=False).head(top_n)

        results, chart = [], []
        for _, row in grp.iterrows():
            crop = str(row["Crop"])
            avg_yield = float(row["Yield"])
            season_info = get_season_info(state, crop)
            tips = get_crop_tips(crop)[:3]
            results.append({
                "crop": crop,
                "avg_yield": round(avg_yield, 2),
                "season_window": season_info.get("window_text", ""),
                "preferred_seasons": season_info.get("preferred", []),
                "tips": tips
            })
            chart.append({"name": crop.upper(), "yield": round(avg_yield, 2)})

        return jsonify({
            "ok": True,
            "district": district,
            "state": state,
            "season": season,
            "unit": "quintal/ha",
            "top": results,
            "chart": chart,
            "sources": ["district_crop_yield.csv"]
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500

# ======================== Objective 4: Profit Estimation ========================
@app.route("/api/profit-estimate", methods=["POST"])
def profit_estimate():
    """
    Inputs (JSON):
      - state (title case ok)
      - district (title case ok)
      - crop (any case; matched lower to dataset)
      - season (optional; if given, yield is filtered to that season average if available)
      - area_ha (float; default 1)
      - price_override (optional Rs/quintal)
      - cost_override (optional Rs/ha)

    Output:
      {
        ok: true,
        inputs: {... normalized inputs ...},
        yield: { yield_q_per_ha, total_yield_quintal },
        economics: {
          price_rs_per_quintal_used, cost_rs_per_hectare_used,
          revenue_rs, total_cost_rs, profit_rs,
          decision: "Grow"|"Avoid",
          price_note, cost_note
        }
      }
    """
    try:
        data = request.get_json(force=True) or {}

        state = " ".join((data.get("state") or "").strip().split()).title()
        district = " ".join((data.get("district") or "").strip().split()).title()
        crop_raw = (data.get("crop") or "").strip()
        crop_lower = crop_raw.lower()
        season = (data.get("season") or "").strip().title() or None
        area_ha = float(data.get("area_ha") or 1.0)

        if not state or not district or not crop_lower:
            return jsonify({"ok": False, "error": "state, district, crop are required"}), 400

        df = _load_district_df()
        if df is None:
            return jsonify({"ok": False, "error": "district_crop_yield.csv not found"}), 500

        sub = df[(df["State"] == state) & (df["District"] == district) & (df["Crop"] == crop_lower)]
        if season:
            sub_season = sub[sub["Season"] == season]
            if not sub_season.empty:
                sub = sub_season
        if sub.empty:
            return jsonify({"ok": False, "error": f"No records for {crop_lower} in {district}, {state}"}), 404

        # Average yield per hectare (quintal/ha)
        yph = float(sub["Yield_q_per_ha"].mean())
        total_yield_q = yph * area_ha

        # Price / Cost (overrides or defaults)
        price_used = data.get("price_override", None)
        cost_used = data.get("cost_override", None)
        price_note = ""
        cost_note = ""

        if price_used is None or str(price_used) == "":
            p, c, note = _lookup_price_cost(crop_lower)
            price_used = p
            price_note = note
        else:
            price_used = float(price_used)
            price_note = "User override"

        if cost_used is None or str(cost_used) == "":
            p, c, note = _lookup_price_cost(crop_lower)
            cost_used = c
            cost_note = note
        else:
            cost_used = float(cost_used)
            cost_note = "User override"

        # Economics
        revenue_rs = total_yield_q * price_used
        total_cost_rs = area_ha * cost_used
        profit_rs = revenue_rs - total_cost_rs
        decision = "Grow" if profit_rs >= 0 else "Avoid"

        def r2(x):  # round money cleanly
            return int(round(float(x)))

        return jsonify({
            "ok": True,
            "inputs": {
                "state": state,
                "district": district,
                "crop_input": crop_raw,
                "crop_dataset": crop_lower,
                "season": season,
                "area_ha": area_ha
            },
            "yield": {
                "yield_q_per_ha": round(yph, 2),
                "total_yield_quintal": round(total_yield_q, 2)
            },
            "economics": {
                "price_rs_per_quintal_used": r2(price_used),
                "cost_rs_per_hectare_used": r2(cost_used),
                "revenue_rs": r2(revenue_rs),
                "total_cost_rs": r2(total_cost_rs),
                "profit_rs": r2(profit_rs),
                "decision": decision,
                "price_note": price_note,
                "cost_note": cost_note
            }
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 400

# ======================== Run ========================
if __name__ == "__main__":
    # Keep 8080 to match your frontend calls (http://127.0.0.1:8080)
    app.run(host="0.0.0.0", port=8080, debug=True, use_reloader=False)
