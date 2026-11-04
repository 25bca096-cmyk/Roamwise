"""
RoamWise Backend Main Server
FastAPI REST API connecting NLP engine, recommendation algorithms,
itinerary generators, and SQLite persistence.
"""

import os
import sys
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Add root folder to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import (
    init_db,
    get_or_create_session,
    update_session_profile,
    save_message,
    get_session_messages,
    save_itinerary as db_save_itinerary,
    get_saved_itineraries,
    delete_saved_itinerary,
    log_analytics,
    get_analytics_summary
)
from backend.nlp_engine.data import DESTINATIONS, get_all_destinations, get_destination_by_id
from backend.nlp_engine.processor import analyze_text
from backend.nlp_engine.recommendation import get_recommendations
from backend.nlp_engine.itinerary_generator import generate_itinerary, modify_existing_itinerary
from backend.nlp_engine.dialogue_manager import process_chat_message

# Initialize database tables on startup
init_db()

app = FastAPI(
    title="RoamWise AI NLP Travel API",
    description="Intelligent travel recommendation and itinerary generation powered by Python NLP",
    version="1.0.0"
)

# CORS middleware for local frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# Pydantic Request Models
# =============================================================================

class ChatRequest(BaseModel):
    session_id: str = "default-session"
    message: str
    preferences: Optional[Dict[str, Any]] = None

class NLPAnalyzeRequest(BaseModel):
    text: str

class RecommendationRequest(BaseModel):
    budget: Optional[float] = None
    days: Optional[int] = None
    travellers: Optional[int] = 1
    travel_styles: Optional[List[str]] = None
    travel_season: Optional[str] = None
    preferred_region: Optional[str] = None
    preferred_dest_id: Optional[str] = None
    limit: Optional[int] = 6

class ItineraryGenerateRequest(BaseModel):
    destination_id: str
    days: Optional[int] = 5
    budget_tier: Optional[str] = "moderate"
    travellers: Optional[int] = 1
    travel_styles: Optional[List[str]] = None
    pace: Optional[str] = "balanced"

class ItineraryModifyRequest(BaseModel):
    current_itinerary: Dict[str, Any]
    modification_type: str
    extra_param: Optional[Any] = None

# =============================================================================
# API Endpoints
# =============================================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RoamWise NLP Travel Engine",
        "destinations_indexed": len(DESTINATIONS),
        "nlp_ready": True
    }

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    """
    Primary chat endpoint:
    Processes user utterance with NLP, updates context state, synthesizes
    sentiment-aware responses, and yields live recommendations / itineraries.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session = get_or_create_session(req.session_id)
    session_profile = session.get("profile", {})
    
    # Merge any explicit preferences passed from the UI planner form
    if req.preferences:
        session_profile.update(req.preferences)

    # 1. Execute full real NLP pipeline
    nlp_results = analyze_text(req.message)

    # 2. Persist NLP analytics log in SQLite
    log_analytics(
        user_query=req.message,
        tokens=nlp_results["tokens"],
        stems=nlp_results["stems"],
        lemmas=nlp_results["lemmas"],
        entities=nlp_results["entities"],
        sentiment=nlp_results["sentiment"],
        intent=nlp_results["intent"],
        keywords=nlp_results["keywords"]
    )

    # 3. Save incoming user message in DB
    save_message(
        session_id=req.session_id,
        role="user",
        content=req.message,
        nlp_data=nlp_results
    )

    # 4. Process dialogue logic & conversational state
    dialogue_result = process_chat_message(
        user_message=req.message,
        session_id=req.session_id,
        session_state=session_profile,
        nlp_analysis=nlp_results
    )

    updated_state = dialogue_result["session_state"]
    update_session_profile(req.session_id, updated_state)

    # 5. Save assistant response in DB
    save_message(
        session_id=req.session_id,
        role="assistant",
        content=dialogue_result["bot_response"],
        nlp_data=None,
        recommendations=dialogue_result.get("recommendations"),
        itinerary=dialogue_result.get("itinerary")
    )

    return {
        "session_id": req.session_id,
        "bot_response": dialogue_result["bot_response"],
        "nlp_analysis": nlp_results,
        "recommendations": dialogue_result.get("recommendations", []),
        "itinerary": dialogue_result.get("itinerary"),
        "follow_up_chips": dialogue_result.get("follow_up_chips", []),
        "session_state": updated_state
    }

@app.post("/api/nlp/analyze")
def analyze_nlp_endpoint(req: NLPAnalyzeRequest):
    """
    Direct NLP inspection endpoint:
    Performs real tokenization, Porter stemming, WordNet lemmatization,
    spaCy NER, and VADER sentiment analysis on arbitrary text.
    """
    if not req.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    return analyze_text(req.text)

@app.get("/api/destinations")
def list_destinations(
    search: Optional[str] = Query(None),
    style: Optional[str] = Query(None),
    budget_tier: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    season: Optional[str] = Query(None)
):
    """Filterable destination catalog."""
    all_dests = get_all_destinations()
    filtered = all_dests

    if search:
        q = search.lower()
        filtered = [
            d for d in filtered
            if q in d["name"].lower()
            or q in d["country"].lower()
            or q in d["description"].lower()
            or any(q in a.lower() for a in d["major_attractions"])
        ]

    if style and style != "All":
        s_lower = style.lower()
        filtered = [d for d in filtered if any(s_lower == s.lower() for s in d["styles"])]

    if budget_tier and budget_tier != "All":
        filtered = [d for d in filtered if d["budget_tier"].lower() == budget_tier.lower()]

    if region and region != "All":
        filtered = [d for d in filtered if region.lower() in d["region"].lower() or region.lower() in d["continent"].lower()]

    if season and season != "All":
        season_lower = season.lower()
        filtered = [
            d for d in filtered
            if any(season_lower in s.lower() for s in d.get("best_seasons", []))
            or any(season_lower in m.lower() for m in d.get("best_months", []))
        ]

    return {"count": len(filtered), "destinations": filtered}

@app.get("/api/destinations/{dest_id}")
def get_destination_detail(dest_id: str):
    """Retrieve complete metadata for a specific destination."""
    dest = get_destination_by_id(dest_id)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return dest

@app.post("/api/recommend")
def recommend_endpoint(req: RecommendationRequest):
    """Direct multi-factor destination recommendation engine."""
    recs = get_recommendations(
        budget=req.budget,
        days=req.days,
        travellers=req.travellers or 1,
        travel_styles=req.travel_styles,
        travel_season=req.travel_season,
        preferred_region=req.preferred_region,
        preferred_dest_id=req.preferred_dest_id,
        limit=req.limit or 6
    )
    return {"count": len(recs), "recommendations": recs}

@app.post("/api/itinerary/generate")
def generate_itinerary_endpoint(req: ItineraryGenerateRequest):
    """Generate structured day-by-day travel itinerary."""
    itin = generate_itinerary(
        dest_id=req.destination_id,
        days=req.days or 5,
        budget_tier=req.budget_tier or "moderate",
        travellers=req.travellers or 1,
        travel_styles=req.travel_styles,
        pace=req.pace or "balanced"
    )
    return itin

@app.post("/api/itinerary/modify")
def modify_itinerary_endpoint(req: ItineraryModifyRequest):
    """Modify existing itinerary (make cheaper, add days, relax pace)."""
    modified = modify_existing_itinerary(
        current_itinerary=req.current_itinerary,
        modification_type=req.modification_type,
        extra_param=req.extra_param
    )
    return modified

@app.get("/api/itineraries/saved")
def get_saved_itineraries_endpoint():
    """List all user-saved itineraries."""
    return get_saved_itineraries()

@app.post("/api/itineraries/save")
def save_itinerary_endpoint(itinerary: Dict[str, Any] = Body(...)):
    """Save an itinerary to the database."""
    if not itinerary or "id" not in itinerary:
        raise HTTPException(status_code=400, detail="Invalid itinerary data")
    saved_id = db_save_itinerary(itinerary)
    return {"status": "saved", "id": saved_id}

@app.delete("/api/itineraries/{itinerary_id}")
def delete_itinerary_endpoint(itinerary_id: str):
    """Delete a saved itinerary."""
    success = delete_saved_itinerary(itinerary_id)
    if not success:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return {"status": "deleted", "id": itinerary_id}

@app.get("/api/chat/history/{session_id}")
def get_chat_history_endpoint(session_id: str):
    """Fetch past chat messages for a session."""
    messages = get_session_messages(session_id)
    return {"session_id": session_id, "messages": messages}

@app.get("/api/nlp/stats")
def get_nlp_stats_endpoint():
    """Retrieve aggregate NLP telemetry and analytics."""
    return get_analytics_summary()

# Mount frontend production build if available
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
