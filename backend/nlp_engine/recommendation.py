"""
RoamWise Recommendation Engine
Calculates multi-factor travel compatibility scores based on budget, duration,
styles, seasonality, and group dynamics.
"""

from typing import Dict, Any, List, Optional
from backend.nlp_engine.data import DESTINATIONS

def calculate_destination_match(
    destination: Dict[str, Any],
    budget: Optional[float] = None,
    days: Optional[int] = None,
    travellers: int = 1,
    travel_styles: Optional[List[str]] = None,
    travel_season: Optional[str] = None,
    preferred_region: Optional[str] = None,
    preferred_dest_id: Optional[str] = None
) -> Dict[str, Any]:
    """Calculate personalized compatibility score and reasons for a single destination."""
    score = 50.0  # Baseline score
    reasons = []
    
    # Direct destination ID match bonus
    if preferred_dest_id and destination["id"] == preferred_dest_id:
        score += 35.0
        reasons.append(f"Direct match for your requested destination '{destination['name']}'")

    # 1. Travel Style Alignment (Weight: 30)
    user_styles = [s.lower() for s in (travel_styles or [])]
    dest_styles = [s.lower() for s in destination["styles"]]
    if user_styles:
        common = set(user_styles).intersection(set(dest_styles))
        if common:
            match_ratio = len(common) / max(len(user_styles), 1)
            style_points = min(30.0, match_ratio * 30.0)
            score += style_points
            matched_names = ", ".join([s.title() for s in common])
            reasons.append(f"Excels in your preferred travel styles: {matched_names}")
        else:
            score -= 10.0
    else:
        # Default balance
        score += 15.0

    # 2. Budget Feasibility (Weight: 25)
    trip_days = days if (days and days > 0) else 5
    traveller_count = travellers if (travellers and travellers > 0) else 1
    daily_cost = destination.get("avg_daily_cost_usd", 120)
    
    # Estimated total cost formula: daily cost * days * travellers (with scale factor for shared accommodation)
    accommodation_factor = 0.7 if traveller_count > 1 else 1.0
    estimated_total = daily_cost * trip_days * traveller_count * accommodation_factor
    
    if budget and budget > 0:
        ratio = budget / max(estimated_total, 1)
        if 0.85 <= ratio <= 2.5:
            # Healthy comfortable budget
            score += 25.0
            reasons.append(f"Fits comfortably inside your ${int(budget):,} budget (Estimated: ~${int(estimated_total):,})")
        elif ratio > 2.5:
            # Luxury headroom
            score += 20.0
            reasons.append(f"Well under your budget (~${int(estimated_total):,}), allowing luxury upgrades")
        elif 0.65 <= ratio < 0.85:
            # Tight but doable
            score += 12.0
            reasons.append(f"Slightly tight budget (~${int(estimated_total):,}), but very feasible with budget stays")
        else:
            # Too expensive for budget
            score -= 15.0
            reasons.append(f"Estimated at ~${int(estimated_total):,}, which exceeds your current budget target")
    else:
        score += 15.0
        reasons.append(f"Estimated budget of ~${int(estimated_total):,} for {trip_days} days ({traveller_count} traveller{'s' if traveller_count > 1 else ''})")

    # 3. Duration Fit (Weight: 15)
    ideal_min, ideal_max = destination.get("ideal_duration_days", [3, 7])
    if days and days > 0:
        if ideal_min <= days <= ideal_max:
            score += 15.0
            reasons.append(f"{days} days is the ideal duration to experience {destination['name']}")
        elif days < ideal_min:
            score += 5.0
            reasons.append(f"{days} days is a bit brisk (ideal: {ideal_min}-{ideal_max} days), but great for highlights")
        else:
            score += 10.0
            reasons.append(f"{days} days allows a comprehensive, relaxed exploration of the region")
    else:
        score += 10.0

    # 4. Seasonality / Best Time to Visit (Weight: 15)
    if travel_season:
        season_str = str(travel_season).lower()
        dest_seasons = [s.lower() for s in destination.get("best_seasons", [])]
        dest_months = [m.lower() for m in destination.get("best_months", [])]
        
        season_matched = any(season_str in s for s in dest_seasons) or any(season_str in m for m in dest_months)
        if season_matched:
            score += 15.0
            reasons.append(f"Visiting in {travel_season.title()} aligns with the peak recommended travel season")
        else:
            score += 5.0
            reasons.append(f"Best experienced in {', '.join(destination.get('best_seasons', ['Spring']))}, but enjoyable year-round")
    else:
        score += 10.0

    # 5. Preferred Region / Continent Alignment
    if preferred_region:
        reg_str = preferred_region.lower()
        if reg_str in destination["region"].lower() or reg_str in destination["continent"].lower() or reg_str in destination["country"].lower():
            score += 10.0
            reasons.append(f"Located in your preferred region of {destination['region']}")

    # Final score clamping between 45% and 99%
    final_score = int(max(45, min(99, score)))
    
    return {
        "destination": destination,
        "match_score": final_score,
        "estimated_total_cost": round(estimated_total, 2),
        "reasons": reasons[:3],
        "trip_days": trip_days,
        "travellers": traveller_count
    }

def get_recommendations(
    budget: Optional[float] = None,
    days: Optional[int] = None,
    travellers: int = 1,
    travel_styles: Optional[List[str]] = None,
    travel_season: Optional[str] = None,
    preferred_region: Optional[str] = None,
    preferred_dest_id: Optional[str] = None,
    limit: int = 4
) -> List[Dict[str, Any]]:
    """Rank destinations by match score and return top recommendations."""
    evaluated = []
    for dest in DESTINATIONS:
        match_info = calculate_destination_match(
            destination=dest,
            budget=budget,
            days=days,
            travellers=travellers,
            travel_styles=travel_styles,
            travel_season=travel_season,
            preferred_region=preferred_region,
            preferred_dest_id=preferred_dest_id
        )
        evaluated.append(match_info)
        
    # Sort descending by match_score, then by rating
    evaluated.sort(key=lambda x: (x["match_score"], x["destination"]["rating"]), reverse=True)
    return evaluated[:limit]
