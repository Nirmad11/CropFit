import os, joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score

DATA_PATH = os.path.join("data", "crop_recommendation.csv")
MODEL_PATH = os.path.join("models", "crop_model.pkl")
FEATURES_PATH = os.path.join("models", "feature_order.pkl")

df = pd.read_csv(DATA_PATH)

required = ["N","P","K","temperature","humidity","ph","rainfall","label"]
missing = [c for c in required if c not in df.columns]
if missing:
    raise ValueError(f"Missing columns: {missing}")

X = df[["N","P","K","temperature","humidity","ph","rainfall"]]
y = df["label"].astype(str)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

clf = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced_subsample",
)
clf.fit(X_train, y_train)
pred = clf.predict(X_test)
print("✅ F1 macro:", round(f1_score(y_test, pred, average="macro"), 4))

os.makedirs("models", exist_ok=True)
joblib.dump(clf, MODEL_PATH)
joblib.dump(list(X.columns), FEATURES_PATH)
print("✅ Saved:", MODEL_PATH, "and", FEATURES_PATH)
