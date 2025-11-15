# utils/cycle_data.py
# -----------------------------------------------------------------------------
# State-aware crop rotation helpers for Objective 2
# -----------------------------------------------------------------------------

from typing import Dict, List, Tuple

# ----------------------------- Normalization ---------------------------------
# Normalize free-text state input to Title Case with a few common aliases.
_ALIASES = {
    "tamil nadu": "Tamil Nadu",
    "west bengal": "West Bengal",
    "uttar pradesh": "Uttar Pradesh",
    "andhra pradesh": "Andhra Pradesh",
    "madhya pradesh": "Madhya Pradesh",
    "delhi nct": "Delhi",
    "nct delhi": "Delhi",
}

def normalize_state(s: str) -> str:
    if not s:
        return ""
    key = " ".join(s.strip().lower().split())
    return _ALIASES.get(key, key.title())


# ------------------------- Default Rotation (fallback) ------------------------
# If a state override is missing, we use a sensible national default.
DEFAULT_ROTATION: Dict[str, str] = {
    "rice": "wheat",
    "wheat": "chickpea",
    "maize": "legumes",
    "millets": "pulses",
    "pulses": "maize",
    "legumes": "maize",
    "vegetables": "millets",
    "cotton": "pulses",
    "sugarcane": "pulses",
    "groundnut": "sorghum",
    "sorghum": "pulses",
    "mustard": "maize",
    "potato": "maize",
    "chickpea": "maize",
    "mungbean": "sorghum",
}

# ------------------------ State Rotation Overrides ---------------------------
# Make different states give different next crops for the SAME current crop.
# Keys are (current_crop_lower, State Title Case)
STATE_ROTATION_OVERRIDES: Dict[Tuple[str, str], str] = {
    # RICE as current crop
    ("rice", "Tamil Nadu"): "groundnut",
    ("rice", "West Bengal"): "potato",
    ("rice", "Punjab"): "wheat",
    ("rice", "Haryana"): "wheat",
    ("rice", "Uttar Pradesh"): "wheat",
    ("rice", "Bihar"): "wheat",
    ("rice", "Odisha"): "pulses",
    ("rice", "Andhra Pradesh"): "maize",
    ("rice", "Telangana"): "maize",
    ("rice", "Karnataka"): "millets",
    ("rice", "Kerala"): "vegetables",
    ("rice", "Maharashtra"): "pulses",
    ("rice", "Gujarat"): "cotton",
    ("rice", "Madhya Pradesh"): "gram",
    ("rice", "Rajasthan"): "mustard",
    ("rice", "Delhi"): "wheat",
    ("rice", "Chhattisgarh"): "pulses",
    ("rice", "Jharkhand"): "pulses",
    ("rice", "Assam"): "pulses",

    # WHEAT as current crop
    ("wheat", "Tamil Nadu"): "maize",
    ("wheat", "West Bengal"): "jute",
    ("wheat", "Punjab"): "rice",
    ("wheat", "Haryana"): "rice",
    ("wheat", "Uttar Pradesh"): "rice",
    ("wheat", "Rajasthan"): "millets",
    ("wheat", "Madhya Pradesh"): "soybean",
    ("wheat", "Gujarat"): "groundnut",
    ("wheat", "Bihar"): "maize",
    ("wheat", "Delhi"): "mungbean",

    # GROUNDNUT as current crop
    ("groundnut", "Tamil Nadu"): "sorghum",
    ("groundnut", "Andhra Pradesh"): "pulses",
    ("groundnut", "Gujarat"): "cotton",
    ("groundnut", "Karnataka"): "millets",

    # MAIZE as current crop
    ("maize", "Bihar"): "potato",
    ("maize", "Uttar Pradesh"): "potato",
    ("maize", "Maharashtra"): "chickpea",
    ("maize", "Karnataka"): "pulses",

    # POTATO as current crop
    ("potato", "West Bengal"): "jute",
    ("potato", "Uttar Pradesh"): "maize",
    ("potato", "Punjab"): "maize",

    # Add more pairs as needed…
}

# ---------------------- Alternatives for UI variety --------------------------
ROTATION_ALTS: Dict[str, List[str]] = {
    "rice": ["pulses", "potato", "mustard"],
    "wheat": ["mungbean", "maize", "mustard"],
    "maize": ["pulses", "groundnut", "vegetables"],
    "millets": ["pulses", "groundnut"],
    "pulses": ["maize", "sorghum", "vegetables"],
    "legumes": ["maize", "sorghum"],
    "vegetables": ["millets", "pulses"],
    "cotton": ["pulses", "wheat"],
    "sugarcane": ["pulses", "vegetables"],
    "groundnut": ["sorghum", "pulses"],
    "sorghum": ["pulses", "chickpea"],
    "mustard": ["maize", "pulses"],
    "potato": ["maize", "mustard"],
    "chickpea": ["maize", "sorghum"],
    "mungbean": ["sorghum", "maize"],
}

# -------------------------- Crop Quick Guide ---------------------------------
CROP_GUIDE: Dict[str, Dict[str, str]] = {
    "rice": {"soil": "Clayey/alluvial", "fertilizer": "NPK with split N", "water": "High; puddled fields"},
    "wheat": {"soil": "Loam/alluvial", "fertilizer": "NPK + micronutrients", "water": "Moderate; CRI critical"},
    "maize": {"soil": "Well-drained loam", "fertilizer": "N-rich basal + split", "water": "Moderate"},
    "millets": {"soil": "Light/sandy", "fertilizer": "Low–moderate NPK", "water": "Low"},
    "pulses": {"soil": "Sandy loam", "fertilizer": "Low; Rhizobium seed treatment", "water": "Low–moderate"},
    "legumes": {"soil": "Sandy loam", "fertilizer": "Organic + Rhizobium", "water": "Low"},
    "vegetables": {"soil": "Fertile loam", "fertilizer": "Compost + NPK", "water": "Moderate"},
    "cotton": {"soil": "Black soil", "fertilizer": "Balanced NPK + Zn", "water": "Moderate"},
    "sugarcane": {"soil": "Deep loam", "fertilizer": "High NPK in splits", "water": "High; frequent"},
    "groundnut": {"soil": "Sandy loam", "fertilizer": "Gypsum + balanced NPK", "water": "Low–moderate"},
    "sorghum": {"soil": "Light to medium", "fertilizer": "Moderate NPK", "water": "Low–moderate"},
    "mustard": {"soil": "Loam", "fertilizer": "S-rich + NPK", "water": "Low"},
    "potato": {"soil": "Loose loam", "fertilizer": "High K + balanced NPK", "water": "Moderate"},
    "chickpea": {"soil": "Sandy loam", "fertilizer": "Low input; Rhizobium", "water": "Low"},
    "mungbean": {"soil": "Light loam", "fertilizer": "Low; inoculation", "water": "Low"},
    # extras used in overrides:
    "jute": {"soil": "Alluvial", "fertilizer": "Balanced NPK", "water": "High in Kharif"},
    "gram": {"soil": "Sandy loam", "fertilizer": "Low input", "water": "Low"},
    "soybean": {"soil": "Well-drained", "fertilizer": "Balanced NPK", "water": "Moderate"},
}

# ---------------------------- Average Yields ---------------------------------
# Approximations (quintal/ha) for demo visuals
YIELD_AVG_QTL_HA: Dict[str, int] = {
    "rice": 35, "wheat": 45, "maize": 40, "millets": 18, "pulses": 12, "legumes": 12,
    "vegetables": 120, "cotton": 20, "sugarcane": 700, "groundnut": 20, "sorghum": 20,
    "mustard": 12, "potato": 200, "chickpea": 13, "mungbean": 10,
    "jute": 25, "gram": 14, "soybean": 20,
}

# ----------------------------- NPK Balance -----------------------------------
# “Balance” here is a relative target split (percentage)
NPK_BALANCE: Dict[str, Dict[str, int]] = {
    "rice": {"N": 45, "P": 25, "K": 30},
    "wheat": {"N": 40, "P": 30, "K": 30},
    "maize": {"N": 45, "P": 25, "K": 30},
    "millets": {"N": 35, "P": 25, "K": 40},
    "pulses": {"N": 20, "P": 40, "K": 40},
    "legumes": {"N": 20, "P": 40, "K": 40},
    "vegetables": {"N": 40, "P": 30, "K": 30},
    "cotton": {"N": 35, "P": 25, "K": 40},
    "sugarcane": {"N": 50, "P": 20, "K": 30},
    "groundnut": {"N": 25, "P": 35, "K": 40},
    "sorghum": {"N": 30, "P": 30, "K": 40},
    "mustard": {"N": 35, "P": 35, "K": 30},
    "potato": {"N": 30, "P": 25, "K": 45},
    "chickpea": {"N": 20, "P": 40, "K": 40},
    "mungbean": {"N": 20, "P": 40, "K": 40},
    "jute": {"N": 40, "P": 30, "K": 30},
    "gram": {"N": 20, "P": 40, "K": 40},
    "soybean": {"N": 25, "P": 35, "K": 40},
}

# ----------------------------- Season Windows --------------------------------
# Very simplified windows for demo; you can expand per state & crop
def get_season_info(state: str, crop: str) -> Dict[str, object]:
    crop = (crop or "").strip().lower()
    state = normalize_state(state)

    # default text
    seasons = {
        "kharif": "Kharif (Jun–Oct)",
        "rabi": "Rabi (Oct–Feb)",
        "zaid": "Zaid (Mar–Jun)",
    }

    if crop in ("rice", "jute"):
        preferred = ["Kharif"]
        window_text = seasons["kharif"]
    elif crop in ("wheat", "mustard", "chickpea", "gram", "potato"):
        preferred = ["Rabi"]
        window_text = seasons["rabi"]
    elif crop in ("maize", "millets", "sorghum", "groundnut", "soybean", "cotton"):
        preferred = ["Kharif", "Rabi"]
        window_text = f"{seasons['kharif']} / {seasons['rabi']}"
    elif crop in ("vegetables", "pulses", "legumes", "mungbean"):
        preferred = ["Kharif", "Rabi", "Zaid"]
        window_text = f"{seasons['kharif']} / {seasons['rabi']} / {seasons['zaid']}"
    else:
        preferred = ["Kharif", "Rabi"]
        window_text = f"{seasons['kharif']} / {seasons['rabi']}"

    # a couple of state-specific tweaks for flavor
    if crop == "groundnut" and state in ("Tamil Nadu", "Karnataka", "Andhra Pradesh"):
        window_text = "Kharif (Jun–Sep) — best in Peninsula"
    if crop == "potato" and state in ("West Bengal", "Uttar Pradesh", "Punjab", "Bihar"):
        window_text = "Rabi (Nov–Feb) — cooler plains favorable"

    return {"preferred": preferred, "window_text": window_text}


# ------------------------------ Crop Tips ------------------------------------
_CROP_TIPS: Dict[str, List[str]] = {
    "rice": [
        "Maintain 2–5 cm water depth during active tillering.",
        "Split nitrogen; avoid lodging by not over-applying.",
        "Use recommended-aged seedlings for transplanting.",
    ],
    "wheat": [
        "Irrigate at CRI stage; avoid stress at heading/flowering.",
        "Apply N in splits; consider Zn in deficient soils.",
        "Use herbicide timely for Phalaris minor where prevalent.",
    ],
    "groundnut": [
        "Use gypsum at pegging; ensure calcium availability.",
        "Avoid standing water; good drainage is critical.",
        "Early sowing with recommended spacing improves yields.",
    ],
    "potato": [
        "Maintain loose, friable soil for tuber bulking.",
        "Potassium is critical; avoid waterlogging.",
        "Use healthy, disease-free seed tubers.",
    ],
    "millets": [
        "Prefer light soils; low input and drought hardy.",
        "Manage weeds early; timely interculture.",
        "Conserve soil moisture; rainfed suited.",
    ],
    "maize": [
        "Ensure adequate N; side-dress around knee-high stage.",
        "Avoid water stress during tasseling/silking.",
        "Use recommended plant population and spacing.",
    ],
    "pulses": [
        "Treat seed with Rhizobium; avoid excess nitrogen.",
        "Irrigate sparingly; sensitive to waterlogging.",
        "Timely weeding critical for early vigor.",
    ],
    "mustard": [
        "Sulphur application boosts yield & oil content.",
        "Avoid water stress at flowering/pod filling.",
        "Manage aphids early with IPM practices.",
    ],
    "sorghum": [
        "Drought-hardy; ensure early weed control.",
        "Moderate N; avoid excessive vegetative growth.",
        "Harvest at physiological maturity.",
    ],
    "vegetables": [
        "Incorporate compost; maintain steady moisture.",
        "Follow crop-specific spacing and staking where needed.",
        "IPM scouting for sucking pests weekly.",
    ],
}
_DEFAULT_TIPS = [
    "Follow local package of practices for the variety.",
    "Soil test–based nutrient management increases efficiency.",
    "Adopt integrated weed and pest management.",
]
def get_crop_tips(crop: str) -> List[str]:
    return _CROP_TIPS.get((crop or "").strip().lower(), _DEFAULT_TIPS)


# -------------------------- 12-week Action Plan -------------------------------
# Slightly customized per crop family; otherwise use a sensible baseline.
_BASELINE_PLAN = [
    (1,  "Field prep; seed treatment; basal NPK"),
    (2,  "Sowing at recommended depth/spacing"),
    (3,  "Germination check; first irrigation"),
    (4,  "Weed management (pre/post-emergence)"),
    (5,  "Top-dress Nitrogen; micronutrient spray if needed"),
    (6,  "Irrigation as per crop stage; scout for pests"),
    (7,  "Interculture/earthing-up; address deficiencies"),
    (8,  "Second top-dress; prophylactic plant protection"),
    (9,  "Irrigate at critical stage; remove off-types"),
    (10, "Final N/K application if recommended"),
    (11, "Prepare for harvest: drain fields if required"),
    (12, "Harvest & post-harvest handling/storage"),
]

_PLAN_OVERRIDES: Dict[str, List[Tuple[int, str]]] = {
    "rice": [
        (1, "Puddling, nursery prep/transplanting setup"),
        (3, "Maintain water depth 2–5 cm"),
        (6, "Weed control/SRI where adopted"),
        (11, "Drain water before harvest; field drying"),
    ],
    "wheat": [
        (2, "Seed drill sowing at proper depth"),
        (4, "Herbicide at CRI stage if needed"),
        (6, "Irrigate at CRI; later at jointing/flowering"),
    ],
    "groundnut": [
        (4, "Weeding + gypsum application near pegging"),
        (6, "Irrigate lightly during pegging"),
    ],
    "potato": [
        (3, "Earthing-up; maintain loose soil"),
        (5, "Apply potash; maintain moisture"),
        (10, "Haulm killing if practiced"),
    ],
    "maize": [
        (5, "Side-dress N at knee-high stage"),
        (7, "Tasseling/silking — no water stress"),
    ],
    "pulses": [
        (1, "Rhizobium/PSB inoculation during seed treatment"),
        (6, "Irrigate sparingly; avoid waterlogging"),
    ],
    "millets": [
        (2, "Sow on moisture; maintain wider spacing"),
        (6, "Interculture; moisture conservation"),
    ],
}

def make_12_week_plan(next_crop: str) -> List[Dict[str, object]]:
    nxt = (next_crop or "").strip().lower()
    plan = _BASELINE_PLAN.copy()
    if nxt in _PLAN_OVERRIDES:
        # merge overrides by week number
        overrides = {w: t for (w, t) in _PLAN_OVERRIDES[nxt]}
        plan = [(w, overrides.get(w, t)) for (w, t) in plan]
    return [{"week": w, "task": t} for (w, t) in plan]


# ------------------------------ Core Selector --------------------------------
def get_next_crop(current_crop: str, state: str) -> str:
    """
    1) Try exact state-specific override
    2) Else return DEFAULT_ROTATION
    3) Else fall back to 'pulses'
    """
    curr = (current_crop or "").strip().lower()
    norm_state = normalize_state(state)

    # 1) state override
    nxt = STATE_ROTATION_OVERRIDES.get((curr, norm_state))
    if nxt:
        return nxt

    # 2) default rotation
    nxt = DEFAULT_ROTATION.get(curr)
    if nxt:
        return nxt

    # 3) last resort
    return "pulses"
