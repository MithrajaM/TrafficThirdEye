from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os

# Create FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Read CSV
df = pd.read_csv("dataset.csv")

# Load ML models
regression_model = joblib.load("../ai-service/traffic_regression_model.pkl")
action_model     = joblib.load("../ai-service/traffic_action_model.pkl")

def calculate_impact(cause):

    weights = {
        "vehicle_breakdown":40,
        "accident":60,
        "construction":75,
        "public_event":90,
        "procession":95,
        "vip_movement":85,
        "protest":95,
        "water_logging":80,
        "tree_fall":70
    }

    return weights.get(cause,50)

def recommend(score):

    if score >= 90:
        return {
            "officers":8,
            "barricades":12,
            "diversions":2
        }

    elif score >= 70:
        return {
            "officers":5,
            "barricades":8,
            "diversions":1
        }

    else:
        return {
            "officers":2,
            "barricades":3,
            "diversions":0
        }


@app.get("/")
def home():
    return {"message": "Traffic Third Eye Running"}

@app.get("/top-junctions")
def top_junctions():

    top = (
        df["junction"]
        .fillna("Unknown")
        .value_counts()
        .head(10)
    )

    return top.to_dict()
@app.get("/events")
def get_events():
    events_list = []
    # Take first 150 rows for performance and quality of rendering
    sub_df = df.head(150)
    for i, (_, row) in enumerate(sub_df.iterrows()):
        cause = str(row.get("event_cause", "vehicle_breakdown")).lower()
        base_score = calculate_impact(cause)
        priority = str(row.get("priority", "Low")).lower()
        
        if priority == "high":
            risk_score = min(100, base_score + 15)
        else:
            risk_score = max(10, base_score - 10)
            
        raw_status = str(row.get("status", "active")).lower()
        if raw_status == "closed":
            status = "Resolved"
        elif raw_status == "resolved":
            status = "Monitoring"
        elif risk_score >= 80:
            status = "Critical"
        else:
            status = "Active"
            
        if risk_score >= 85:
            action_req = "Emergency Protocol"
            action_taken = "Diversion Activated" if row.get("requires_road_closure") else "Officers Deployed"
        elif risk_score >= 70:
            action_req = "Activate Diversion" if row.get("requires_road_closure") else "Deploy Police"
            action_taken = "Diversion Activated" if row.get("requires_road_closure") else "Officers Deployed"
        elif risk_score >= 50:
            action_req = "Barricade Placement"
            action_taken = "Monitoring Active"
        else:
            action_req = "Deploy Police"
            action_taken = "Monitoring Active"
            
        if status == "Resolved":
            action_taken = "Route Cleared"
            
        location = row.get("address")
        if pd.isna(location) or location == "nan" or not location:
            location = row.get("junction")
        if pd.isna(location) or location == "nan" or not location:
            location = row.get("corridor")
        if pd.isna(location) or location == "nan" or not location:
            location = "Bengaluru City Center"
        else:
            location = str(location)
            
        start_dt = str(row.get("start_datetime", ""))
        if start_dt and start_dt != "nan":
            timestamp = start_dt[:16].replace("T", " ")
        else:
            timestamp = "2026-06-23 12:00"
            
        events_list.append({
            "id": row.get("id", f"FKID{i:06d}"),
            "location": location,
            "event_cause": cause,
            "event_type": str(row.get("event_type", "unplanned")),
            "timestamp": timestamp,
            "risk_score": int(risk_score),
            "action_required": action_req,
            "action_taken": action_taken,
            "status": status,
            "latitude": float(row.get("latitude")) if not pd.isna(row.get("latitude")) else 12.9716,
            "longitude": float(row.get("longitude")) if not pd.isna(row.get("longitude")) else 77.5946,
            "requires_road_closure": bool(row.get("requires_road_closure")) if not pd.isna(row.get("requires_road_closure")) else False
        })
    return events_list

@app.get("/hotspots")
def hotspots():

    top = (
        df.groupby("junction")
        .agg(
            incident_count=("junction", "size"),
            latitude=("latitude", "mean"),
            longitude=("longitude", "mean")
        )
        .sort_values("incident_count", ascending=False)
        .head(10)
        .reset_index()
    )

    return [
        {
            "cluster_id": i,
            "name": row["junction"],
            "incident_count": int(row["incident_count"]),
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"])
        }
        for i, row in top.iterrows()
    ]
@app.get("/impact-score")
def impact_score(cause: str):

    score = calculate_impact(cause)

    recommendation = recommend(score)

    return {
        "cause": cause,
        "impact_score": score,
        "officers": recommendation["officers"],
        "barricades": recommendation["barricades"],
        "diversions": recommendation["diversions"]
    }
@app.get("/dashboard")
def dashboard():
    unique_junctions = int(df["junction"].nunique())
    high_risk = int(
        df[df["priority"].str.lower() == "high"]["junction"]
        .nunique()
    ) if "priority" in df.columns else 0

    event_weights = {
        "vehicle_breakdown": 40,
        "accident": 60,
        "construction": 75,
        "public_event": 90,
        "procession": 95,
        "vip_movement": 85,
        "protest": 95,
        "water_logging": 80,
        "tree_fall": 70
    }
    
    # Calculate dataset-driven average congestion index
    causes = df["event_cause"].fillna("vehicle_breakdown").str.lower()
    priorities = df["priority"].fillna("Low").str.lower()
    
    base_scores = causes.map(event_weights).fillna(50)
    adjustments = priorities.map({"high": 15, "low": -10, "medium": 0}).fillna(0)
    scores = (base_scores + adjustments).clip(10, 100)
    avg_congestion = int(scores.mean()) if not scores.empty else 50

    return {
        "total_events":      len(df),
        "vehicle_breakdown": int((df["event_cause"] == "vehicle_breakdown").sum()),
        "accident":          int((df["event_cause"] == "accident").sum()),
        "public_event":      int((df["event_cause"] == "public_event").sum()),
        "construction":      int((df["event_cause"] == "construction").sum()),
        "hotspot_count":     unique_junctions,
        "high_risk_count":   high_risk,
        "congestion_index":  avg_congestion,
    }

@app.get("/event-stats")
def get_event_stats():
    return {"total_events": len(df)}

@app.get("/event-causes")
def event_causes():

    counts = df["event_cause"].value_counts()

    return counts.to_dict()


@app.get("/recommendations")
def recommendations():
    top = (
        df.groupby("junction")
        .agg(
            incident_count=("junction", "size"),
            top_cause=("event_cause", lambda x: x.value_counts().index[0]),
            top_priority=("priority", lambda x: x.value_counts().index[0])
        )
        .sort_values("incident_count", ascending=False)
        .head(4)
        .reset_index()
    )
    result = []
    actions = ["Deploy Officers", "Activate Diversion", "Adjust Signal Timing", "Monitor & Standby"]
    for i, row in top.iterrows():
        result.append({
            "title":    actions[i % len(actions)],
            "location": row["junction"],
            "cause":    row["top_cause"],
            "incidents": int(row["incident_count"]),
            "priority": str(row["top_priority"]),
        })
    return result


class PredictionInput(BaseModel):
    event_type: int
    event_cause: int
    priority: int
    latitude: float
    longitude: float
    zone: int
    corridor: int
    is_peak_hour: int
    event_duration_minutes: int
    requires_road_closure: int
    congestion_risk_score: int


def get_police(risk_score: int) -> int:
    if risk_score > 85:  return 8
    if risk_score > 60:  return 6
    if risk_score > 40:  return 4
    return 2


def get_barricades(event_cause: int) -> int:
    # event_cause encoding: 0=construction, 1=public_event (adjust to match your encoder)
    if event_cause == 0:   return 6   # construction
    if event_cause == 1:   return 8   # public_event
    return 3


DIVERSION_ROUTES = [
    "Mysore Road → Magadi Road",
    "Hosur Road → Electronic City",
    "Tumkur Road → Nelamangala Bypass",
    "Bellary Road → Hebbal Route",
]

ACTION_MAP = {
    0: "no_action",
    1: "deploy_police",
    2: "diversion_required",
    3: "emergency_protocol",
}


@app.post("/predict")
def predict(data: PredictionInput):

    # Step 1 — Regression model predicts future throughput
    regression_input = np.array([[
        data.event_type,
        data.event_cause,
        data.priority,
        data.latitude,
        data.longitude,
        data.zone,
        data.corridor,
        data.is_peak_hour,
        data.event_duration_minutes,
        data.requires_road_closure,
        data.congestion_risk_score,
    ]])

    future_throughput = float(regression_model.predict(regression_input)[0])
    throughput_drop   = 40.0 - future_throughput

    # Step 2 — Action model predicts intervention
    action_input = np.array([[
        data.event_type,
        data.event_cause,
        data.priority,
        data.latitude,
        data.longitude,
        data.zone,
        data.corridor,
        data.is_peak_hour,
        data.event_duration_minutes,
        data.requires_road_closure,
        data.congestion_risk_score,
        future_throughput,
        throughput_drop,
    ]])

    action_prediction = int(action_model.predict(action_input)[0])
    traffic_action    = ACTION_MAP.get(action_prediction, "no_action")

    # Step 3 — Recommendation engine
    police_required    = get_police(data.congestion_risk_score)
    barricades_required = get_barricades(data.event_cause)
    diversion_route    = DIVERSION_ROUTES[action_prediction % len(DIVERSION_ROUTES)]
    recovered_throughput = round(min(40.0, future_throughput + (throughput_drop * 0.85)), 2)

    return {
        "future_throughput":    round(future_throughput, 2),
        "throughput_drop":      round(throughput_drop, 2),
        "traffic_action":       traffic_action,
        "police_required":      police_required,
        "barricades_required":  barricades_required,
        "diversion_route":      diversion_route,
        "recovered_throughput": recovered_throughput,
    }