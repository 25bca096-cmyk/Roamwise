"""
RoamWise AI Itinerary Generator
Produces personalized, structured day-by-day itineraries complete with
morning/afternoon/evening activities, meals, transport, costs, and practical tips.
"""

import uuid
from typing import Dict, Any, List, Optional
from backend.nlp_engine.data import get_destination_by_id, DESTINATIONS

def generate_itinerary(
    dest_id: str,
    days: int = 5,
    budget_tier: str = "moderate",
    travellers: int = 1,
    travel_styles: Optional[List[str]] = None,
    user_budget: Optional[float] = None,
    pace: str = "balanced"  # "relaxed", "balanced", "intensive"
) -> Dict[str, Any]:
    """Generate a full day-by-day itinerary tailored to the requested parameters."""
    dest = get_destination_by_id(dest_id)
    if not dest:
        # Fallback to first destination if not found
        dest = DESTINATIONS[0]
        
    num_days = max(2, min(14, days))
    traveller_count = max(1, travellers)
    
    # Calculate costs based on budget tier and destination baseline
    base_daily = dest.get("avg_daily_cost_usd", 120)
    tier_multipliers = {"budget": 0.65, "moderate": 1.0, "luxury": 1.75}
    multiplier = tier_multipliers.get(budget_tier.lower(), 1.0)
    
    adj_daily = base_daily * multiplier
    acc_scale = 0.7 if traveller_count > 1 else 1.0
    total_estimated = round(adj_daily * num_days * traveller_count * acc_scale, 2)
    
    attractions = dest.get("major_attractions", ["City Center", "Historic District", "Scenic Viewpoint"])
    food = dest.get("food_specialties", ["Local Specialty", "Street Food", "Regional Delicacy"])
    
    daily_plans = []
    
    # Activity templates tailored by day phase
    for d in range(1, num_days + 1):
        attr_main = attractions[(d - 1) % len(attractions)]
        attr_second = attractions[(d) % len(attractions)]
        specialty = food[(d - 1) % len(food)]
        next_specialty = food[(d) % len(food)]
        
        if d == 1:
            day_title = f"Arrival, Settling In & First Impressions"
            morning_act = f"Arrive at destination, check into your accommodation, and unpack. Take a light walk through the local neighborhood to get your bearings."
            afternoon_act = f"Head to the iconic {attr_main} for a relaxed orientation stroll and breathtaking introductory views."
            evening_act = f"Enjoy a welcome dinner savoring authentic {specialty} at a celebrated local tavern or bistro."
        elif d == num_days:
            day_title = f"Final Souvenirs & Farewell Vistas"
            morning_act = f"Visit the local artisan markets or boutique streets for authentic handcrafted souvenirs and regional treats."
            afternoon_act = f"Take a tranquil scenic walk near {attr_second} to soak in final panoramic photo memories."
            evening_act = f"Celebratory farewell dinner enjoying {next_specialty} with sunset views before preparing for departure."
        else:
            day_title = f"Deep Dive into {attr_main} & Cultural Immersion"
            morning_act = f"Early start at {attr_main} before mid-day crowds arrive. Explore the historical architecture and scenic viewpoints."
            afternoon_act = f"Scenic excursion to {attr_second}. Enjoy an afternoon break at a nearby café tasting {specialty}."
            evening_act = f"Sunset exploration along the scenic promenade or vibrant evening night quarter, followed by local dining."
            
        daily_plans.append({
            "day_number": d,
            "title": day_title,
            "morning": {
                "time": "09:00 AM - 12:30 PM",
                "activity": morning_act,
                "location": attr_main,
                "tip": "Arrive 15 minutes before opening for best photo lighting and shortest lines."
            },
            "afternoon": {
                "time": "01:30 PM - 05:00 PM",
                "activity": afternoon_act,
                "location": attr_second,
                "tip": "Stay hydrated and carry local small change for transit or refreshments."
            },
            "evening": {
                "time": "06:30 PM - 09:30 PM",
                "activity": evening_act,
                "location": "Local Promenade & Dining Quarter",
                "tip": "Advance reservations recommended for popular evening spots."
            },
            "meals": {
                "breakfast": "Artisan café breakfast with fresh local pastries and hot brew",
                "lunch": f"Casual lunch stop featuring regional dishes",
                "dinner": f"Dinner featuring {specialty} and regional refreshments"
            },
            "estimated_day_cost": round(adj_daily * traveller_count * acc_scale, 2)
        })
        
    # Suggested Accommodation based on tier
    accommodation_options = {
        "budget": f"Comfortable Central Guesthouse / Highly-rated Hostel private room ($40-${int(adj_daily*0.4)}/night)",
        "moderate": f"4-Star Boutique Hotel in charming historic neighborhood ($110-${int(adj_daily*0.8)}/night)",
        "luxury": f"5-Star Luxury Resort / Panoramic Suite with private spa amenities ($250-${int(adj_daily*1.5)}/night)"
    }
    
    itinerary_id = str(uuid.uuid4())[:8]
    
    return {
        "id": itinerary_id,
        "title": f"{num_days}-Day Curated {dest['name']} Getaway",
        "destination": dest["name"],
        "destination_id": dest["id"],
        "country": dest["country"],
        "region": dest["region"],
        "image_url": dest["image_url"],
        "days": num_days,
        "travellers": traveller_count,
        "budget_tier": budget_tier.lower(),
        "total_estimated_cost": total_estimated,
        "currency": "USD",
        "pace": pace,
        "daily_itineraries": daily_plans,
        "transportation_summary": dest.get("transportation", ["Metro / Regional Trains", "Rental Vehicle"]),
        "accommodation_suggestion": accommodation_options.get(budget_tier.lower(), accommodation_options["moderate"]),
        "practical_tips": dest.get("practical_tips", ["Keep your passport and insurance handy.", "Pack appropriate adapters."]),
        "food_recommendations": dest.get("food_specialties", ["Local Specialty"])
    }

def modify_existing_itinerary(
    current_itinerary: Dict[str, Any],
    modification_type: str,
    extra_param: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Modify an existing itinerary in response to follow-up requests:
    - 'make_cheaper': downgrade budget tier or scale daily cost down
    - 'add_days': extend duration by N days
    - 'relax_pace': adjust activity density
    - 'change_destination': regenerate for a new destination
    """
    dest_id = current_itinerary.get("destination_id", "bali")
    current_days = current_itinerary.get("days", 5)
    current_tier = current_itinerary.get("budget_tier", "moderate")
    current_travellers = current_itinerary.get("travellers", 1)
    
    if modification_type == "make_cheaper":
        new_tier = "budget" if current_tier != "budget" else "budget"
        modified = generate_itinerary(
            dest_id=dest_id,
            days=current_days,
            budget_tier=new_tier,
            travellers=current_travellers,
            pace="relaxed"
        )
        modified["note"] = "Adjusted to budget-conscious accommodations and cost-effective local transit."
        return modified
        
    elif modification_type == "add_days":
        add_count = int(extra_param) if extra_param else 2
        new_days = min(14, current_days + add_count)
        modified = generate_itinerary(
            dest_id=dest_id,
            days=new_days,
            budget_tier=current_tier,
            travellers=current_travellers
        )
        modified["note"] = f"Extended itinerary by {add_count} days to explore deeper regional attractions."
        return modified
        
    elif modification_type == "change_destination":
        new_dest_id = str(extra_param) if extra_param else "kyoto"
        modified = generate_itinerary(
            dest_id=new_dest_id,
            days=current_days,
            budget_tier=current_tier,
            travellers=current_travellers
        )
        modified["note"] = f"Switched destination to {modified['destination']}."
        return modified
        
    # Default fallback regeneration
    return generate_itinerary(dest_id=dest_id, days=current_days, budget_tier=current_tier)
