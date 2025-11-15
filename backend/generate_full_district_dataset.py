# generate_full_district_dataset.py
import csv, os, random
from pathlib import Path
random.seed(42)

BASE = Path(__file__).parent
DATA_DIR = BASE / "data"
DATA_DIR.mkdir(exist_ok=True)
OUT = DATA_DIR / "district_crop_yield.csv"

# --- STATES → DISTRICTS (curated list; add more anytime) ---
states_to_districts = {
    "Andhra Pradesh": ["Guntur","Krishna","Nellore","Prakasam","Chittoor","East Godavari","West Godavari","Kadapa","Anantapur","Kurnool","Srikakulam","Vizianagaram","Visakhapatnam"],
    "Arunachal Pradesh": ["Papum Pare","Changlang","Lohit","West Kameng","East Siang","Lower Subansiri"],
    "Assam": ["Kamrup","Nagaon","Cachar","Dibrugarh","Sonitpur","Jorhat","Golaghat","Barpeta","Dhubri"],
    "Bihar": ["Patna","Gaya","Muzaffarpur","Bhagalpur","Purnia","Darbhanga","Siwan","Nalanda","Aurangabad"],
    "Chhattisgarh": ["Raipur","Bilaspur","Durg","Rajnandgaon","Korba","Janjgir-Champa","Kanker"],
    "Delhi": ["North West Delhi","South Delhi","East Delhi","West Delhi","South West Delhi"],
    "Goa": ["North Goa","South Goa"],
    "Gujarat": ["Surat","Rajkot","Banaskantha","Mehsana","Bhavnagar","Junagadh","Ahmedabad","Vadodara","Kheda","Amreli","Jamnagar","Sabarkantha","Patan"],
    "Haryana": ["Karnal","Hisar","Sirsa","Sonipat","Kurukshetra","Ambala","Rohtak","Jind","Bhiwani","Yamunanagar"],
    "Himachal Pradesh": ["Kangra","Mandi","Shimla","Solan","Una","Hamirpur","Bilaspur","Kullu","Sirmaur"],
    "Jammu and Kashmir": ["Srinagar","Baramulla","Anantnag","Pulwama","Budgam","Jammu","Kathua","Udhampur"],
    "Jharkhand": ["Ranchi","Dhanbad","Hazaribagh","Giridih","Palamu","Bokaro","Deoghar","Dumka"],
    "Karnataka": ["Bengaluru Urban","Bengaluru Rural","Mysuru","Tumakuru","Davangere","Shivamogga","Belagavi","Ballari","Raichur","Kalaburagi","Vijayapura","Bagalkote","Mandya","Haveri","Koppal","Chitradurga"],
    "Kerala": ["Palakkad","Thrissur","Kottayam","Alappuzha","Ernakulam","Kollam","Thiruvananthapuram","Kozhikode","Malappuram"],
    "Madhya Pradesh": ["Indore","Bhopal","Ujjain","Dewas","Sagar","Chhindwara","Sehore","Ratlam","Vidisha","Hoshangabad"],
    "Maharashtra": ["Pune","Nashik","Nagpur","Aurangabad","Kolhapur","Sangli","Satara","Solapur","Ahmednagar","Akola","Amravati","Buldhana","Yavatmal","Wardha","Latur","Osmanabad","Beed"],
    "Manipur": ["Imphal East","Imphal West","Thoubal","Bishnupur","Churachandpur"],
    "Meghalaya": ["East Khasi Hills","West Garo Hills","West Jaintia Hills","Ri Bhoi"],
    "Mizoram": ["Aizawl","Lunglei","Champhai","Kolasib"],
    "Nagaland": ["Dimapur","Kohima","Mon","Mokokchung","Wokha"],
    "Odisha": ["Cuttack","Puri","Balasore","Mayurbhanj","Ganjam","Khurda","Kalahandi","Sambalpur","Bargarh","Jajpur"],
    "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Sangrur","Bathinda","Hoshiarpur","Gurdaspur","Ferozepur","Moga"],
    "Rajasthan": ["Jaipur","Alwar","Ajmer","Barmer","Bikaner","Jodhpur","Kota","Udaipur","Chittorgarh","Sikar","Jhunjhunu"],
    "Sikkim": ["East Sikkim","West Sikkim","North Sikkim","South Sikkim"],
    "Tamil Nadu": ["Thanjavur","Coimbatore","Erode","Salem","Tiruchirappalli","Madurai","Theni","Dindigul","Namakkal","Tirunelveli"],
    "Telangana": ["Nalgonda","Karimnagar","Warangal","Khammam","Nizamabad","Mahbubnagar","Medak","Adilabad","Rangareddy"],
    "Tripura": ["West Tripura","South Tripura","Dhalai","North Tripura"],
    "Uttar Pradesh": ["Lucknow","Kanpur Nagar","Varanasi","Gorakhpur","Agra","Meerut","Aligarh","Bareilly","Jhansi","Prayagraj","Sitapur","Lakhimpur Kheri"],
    "Uttarakhand": ["Dehradun","Haridwar","Udham Singh Nagar","Nainital","Pauri Garhwal","Tehri Garhwal"],
    "West Bengal": ["Hooghly","Bardhaman","Nadia","Howrah","Murshidabad","North 24 Parganas","South 24 Parganas","Bankura","Birbhum","Cooch Behar","Malda","Jalpaiguri"],
    # UTs & smaller: add as needed
}

# --- Crops and base yields (q/ha) by broad region logic ---
crops = [
    "Rice","Wheat","Maize","Chickpea","Pigeonpea","Groundnut",
    "Soybean","Mustard","Cotton","Sugarcane","Potato","Onion","Tomato","Bajra","Ragi","Jowar"
]

# Base yield by crop (national average-ish). Tweaked per state later.
crop_base = {
    "Rice": 35, "Wheat": 42, "Maize": 32, "Chickpea": 16, "Pigeonpea": 14,
    "Groundnut": 18, "Soybean": 20, "Mustard": 14, "Cotton": 20,
    "Sugarcane": 80, "Potato": 220, "Onion": 25, "Tomato": 22, "Bajra": 15, "Ragi": 18, "Jowar": 14
}

# Season per crop (dominant)
crop_seasons = {
    "Rice": ["Kharif","Rabi"],
    "Wheat": ["Rabi"],
    "Maize": ["Kharif","Rabi"],
    "Chickpea": ["Rabi"],
    "Pigeonpea": ["Kharif"],
    "Groundnut": ["Kharif"],
    "Soybean": ["Kharif"],
    "Mustard": ["Rabi"],
    "Cotton": ["Kharif"],
    "Sugarcane": ["Rabi","Annual","Kharif"],
    "Potato": ["Rabi"],
    "Onion": ["Rabi","Kharif"],
    "Tomato": ["Rabi","Kharif","Summer"],
    "Bajra": ["Kharif"],
    "Ragi": ["Kharif"],
    "Jowar": ["Kharif","Rabi"]
}

# State x crop yield adjustments (some agronomic realism)
state_bumps = {
    "Punjab": {"Wheat": +4, "Rice": +2, "Cotton": +1},
    "Haryana": {"Wheat": +3, "Rice": +1},
    "Uttar Pradesh": {"Wheat": +2, "Rice": +1, "Sugarcane": +8, "Potato": +10},
    "West Bengal": {"Rice": +2, "Potato": +20, "Jute": +5 if "Jute" in crop_base else 0},
    "Gujarat": {"Groundnut": +4, "Cotton": +3, "Onion": +3},
    "Maharashtra": {"Cotton": +2, "Soybean": +2, "Onion": +4, "Sugarcane": +6},
    "Madhya Pradesh": {"Soybean": +3, "Chickpea": +2, "Wheat": +1},
    "Karnataka": {"Ragi": +4, "Maize": +2, "Sugarcane": +4, "Tomato": +2},
    "Tamil Nadu": {"Rice": +2, "Groundnut": +2, "Sugarcane": +6, "Banana": +30 if "Banana" in crop_base else 0},
    "Bihar": {"Maize": +2, "Wheat": +1},
    "Rajasthan": {"Bajra": +3, "Mustard": +2, "Chickpea": +2},
    "Odisha": {"Rice": +1},
    "Assam": {"Rice": +2, "Tea": +5 if "Tea" in crop_base else 0},
    "Andhra Pradesh": {"Rice": +2, "Chillies": +5 if "Chillies" in crop_base else 0},
    "Telangana": {"Cotton": +2, "Maize": +1}
}

years = list(range(2015, 2023))  # 2015–2022

def yield_for(state, crop):
    base = crop_base.get(crop, 18)
    bump = state_bumps.get(state, {}).get(crop, 0)
    noise = random.uniform(-0.12, 0.12)  # ±12%
    y = max(5.0, (base + bump) * (1 + noise))
    return round(y, 1)

def area_for(state, district, crop):
    # heuristic area in ha
    base = random.randint(2000, 20000)
    if crop in ("Sugarcane","Cotton","Rice","Wheat"): base += 4000
    if crop in ("Potato","Onion","Tomato"): base -= 1000
    return max(800, base)

def production_from(area, y_q_ha):
    # yield is quintal/ha; production in quintal
    q = int(area * y_q_ha)
    return max(1000, q)

rows = []
for state, districts in states_to_districts.items():
    for district in districts:
        # choose a subset of crops per district to keep file size reasonable
        district_crops = random.sample(crops, k=min(8, len(crops)))
        for year in years:
            for crop in district_crops:
                seasons = crop_seasons.get(crop, ["Kharif"])
                season = random.choice(seasons)
                y = yield_for(state, crop)
                area = area_for(state, district, crop)
                prod = production_from(area, y)
                rows.append({
                    "State": state,
                    "District": district,
                    "Year": year,
                    "Season": season,
                    "Crop": crop,
                    "Area_ha": area,
                    "Production_q": prod,
                    "Yield_q_per_ha": y
                })

# Write CSV
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=[
        "State","District","Year","Season","Crop","Area_ha","Production_q","Yield_q_per_ha"
    ])
    w.writeheader()
    w.writerows(rows)

print(f"✅ Wrote {len(rows)} rows to {OUT}")
print("Example:", rows[0])
