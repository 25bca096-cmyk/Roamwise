"""
RoamWise Dialogue Manager
Handles session state, sentiment-aware natural language generation,
multi-turn context resolution, follow-up messages, and missing-info probing.
"""

import random
from typing import Dict, Any, List, Optional, Tuple
from backend.nlp_engine.data import DESTINATIONS, get_destination_by_id
from backend.nlp_engine.recommendation import get_recommendations
from backend.nlp_engine.itinerary_generator import generate_itinerary, modify_existing_itinerary

# Conversational intros by sentiment
SENTIMENT_INTROS = {
    "positive": [
        "Fantastic choice! 🌟 Traveling there is always an unforgettable experience.",
        "That sounds like an amazing journey! I am thrilled to help you put this together.",
        "Wonderful! Get ready for an extraordinary adventure.",
        "I love this travel idea! Here is exactly what I have curated for you."
    ],
    "negative": [
        "I completely understand your concern. Let's make this trip smooth, relaxed, and worry-free for you.",
        "No problem at all! Travel planning can get tricky, but I am here to help you find the perfect stress-free option.",
        "I hear you loud and clear. Let's adjust the plan to be much more comfortable and budget-friendly.",
        "Don't worry — we can easily tailor every detail until it matches what you are comfortable with."
    ],
    "neutral": [
        "Here are the travel recommendations tailored to your preferences:",
        "Based on your requirements, here is the curated travel breakdown:",
        "Let's look into the optimal options for your upcoming trip:",
        "Here is what works best based on our destination analysis:"
    ]
}

def update_session_state(current_state: Dict[str, Any], nlp_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Merge newly extracted entities into ongoing session profile."""
    state = dict(current_state or {})
    travel_ents = nlp_analysis.get("travel_entities", {})
    
    # Update budget if found
    if travel_ents.get("budget"):
        state["budget"] = travel_ents["budget"]
        
    # Update days if found
    if travel_ents.get("days"):
        state["days"] = travel_ents["days"]
        
    # Update travellers if found
    if travel_ents.get("travellers"):
        state["travellers"] = travel_ents["travellers"]
        
    # Update styles if found
    extracted_styles = travel_ents.get("styles", [])
    if extracted_styles:
        existing_styles = state.get("travel_styles", [])
        combined = list(set(existing_styles + extracted_styles))
        state["travel_styles"] = combined
        
    # Update destination match
    if travel_ents.get("destination_match"):
        state["active_destination_id"] = travel_ents["destination_match"]
        
    # Check spaCy GPE entities for starting location or unmapped destinations
    for ent in nlp_analysis.get("entities", []):
        if ent["label"] == "GPE":
            loc_text = ent["text"].lower()
            # If user said "from New York" or "starting in London"
            orig_text = nlp_analysis.get("original_text", "").lower()
            if f"from {loc_text}" in orig_text or f"starting {loc_text}" in orig_text or f"leaving {loc_text}" in orig_text:
                state["starting_location"] = ent["text"]
            elif not state.get("active_destination_id") and not state.get("preferred_region"):
                # Could be a region or destination
                state["preferred_region"] = ent["text"]

    return state

def process_chat_message(
    user_message: str,
    session_id: str,
    session_state: Dict[str, Any],
    nlp_analysis: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Main dialogue router:
    Interprets intent, analyzes sentiment, handles context and follow-ups,
    and returns a structured response containing:
    - bot_response (markdown text)
    - updated_session_state
    - recommendations (if applicable)
    - itinerary (if applicable)
    - follow_up_suggestions (quick prompt chips)
    """
    state = update_session_state(session_state, nlp_analysis)
    intent = nlp_analysis.get("intent", "general_query")
    sentiment_label = nlp_analysis.get("sentiment", {}).get("label", "neutral")
    sentiment_intro = random.choice(SENTIMENT_INTROS.get(sentiment_label, SENTIMENT_INTROS["neutral"]))
    travel_ents = nlp_analysis.get("travel_entities", {})
    mod_requests = travel_ents.get("modification_requests", [])
    
    current_itinerary = state.get("current_itinerary")
    active_dest_id = state.get("active_destination_id")
    
    recommendations = []
    itinerary = None
    follow_up_chips = []
    bot_response = ""

    # =========================================================================
    # CASE 1: MODIFICATION FOLLOW-UPS ("make it cheaper", "add two days", etc.)
    # =========================================================================
    if intent == "modify_plan" or mod_requests:
        if "make_cheaper" in mod_requests or "cheaper" in user_message.lower():
            if current_itinerary:
                itinerary = modify_existing_itinerary(current_itinerary, "make_cheaper")
                state["current_itinerary"] = itinerary
                bot_response = (
                    f"{sentiment_intro}\n\n"
                    f"I have optimized your itinerary for **{itinerary['destination']}** to be significantly more budget-friendly!\n\n"
                    f"- **Revised Budget Tier:** Budget-Conscious / Value-Optimized\n"
                    f"- **Estimated Total Cost:** ~${int(itinerary['total_estimated_cost']):,} for {itinerary['days']} days\n"
                    f"- **Savings Strategy:** Replaced premium transfers with efficient local public transit, and shifted to highly-rated boutique guesthouses and authentic street food taverns.\n\n"
                    f"Check out the updated day-by-day itinerary below!"
                )
            else:
                # Find budget-friendly recommendations
                state["budget"] = min(state.get("budget", 1200), 1000)
                recs = get_recommendations(budget=state["budget"], days=state.get("days", 5), travellers=state.get("travellers", 1), limit=3)
                recommendations = recs
                bot_response = (
                    f"{sentiment_intro}\n\n"
                    f"Looking for maximum value? Here are our top budget-friendly destinations where your money stretches the furthest without compromising quality:\n\n"
                    + "\n".join([f"• **{r['destination']['name']}** (~${int(r['estimated_total_cost']):,} for {r['trip_days']} days)" for r in recs])
                )
            follow_up_chips = ["Add two more days", "Suggest another destination", "Save this itinerary"]
            return {
                "bot_response": bot_response,
                "session_state": state,
                "recommendations": recommendations,
                "itinerary": itinerary,
                "follow_up_chips": follow_up_chips
            }

        elif "add_days" in mod_requests or "add" in user_message.lower() and "day" in user_message.lower():
            current_days = state.get("days", 5)
            # detect if user said "add two days" or "add 3 days"
            add_days = 2
            if "three" in user_message.lower() or "3" in user_message:
                add_days = 3
            elif "one" in user_message.lower() or "1" in user_message:
                add_days = 1
                
            new_days = current_days + add_days
            state["days"] = new_days
            
            if current_itinerary:
                itinerary = modify_existing_itinerary(current_itinerary, "add_days", extra_param=add_days)
                state["current_itinerary"] = itinerary
                bot_response = (
                    f"{sentiment_intro}\n\n"
                    f"Done! I have extended your **{itinerary['destination']}** trip by {add_days} days (now **{new_days} days** total).\n\n"
                    f"I have added fresh cultural excursions, scenic excursions, and additional time to unwind without feeling rushed."
                )
            elif active_dest_id:
                itinerary = generate_itinerary(dest_id=active_dest_id, days=new_days, travellers=state.get("travellers", 1))
                state["current_itinerary"] = itinerary
                bot_response = (
                    f"{sentiment_intro}\n\n"
                    f"Here is your extended **{new_days}-day itinerary** for **{itinerary['destination']}**!"
                )
            else:
                recs = get_recommendations(days=new_days, travellers=state.get("travellers", 1), limit=3)
                recommendations = recs
                bot_response = (
                    f"{sentiment_intro}\n\n"
                    f"Updated your desired trip duration to **{new_days} days**. Here are prime destinations perfectly suited for a {new_days}-day journey:"
                )
            follow_up_chips = ["Make it cheaper", "Suggest another destination", "What is the best time to visit?"]
            return {
                "bot_response": bot_response,
                "session_state": state,
                "recommendations": recommendations,
                "itinerary": itinerary,
                "follow_up_chips": follow_up_chips
            }

        elif "change_destination" in mod_requests or "another destination" in user_message.lower():
            # Exclude current destination and suggest fresh ones
            current_id = active_dest_id or (current_itinerary.get("destination_id") if current_itinerary else None)
            all_recs = get_recommendations(
                budget=state.get("budget"),
                days=state.get("days", 5),
                travellers=state.get("travellers", 1),
                travel_styles=state.get("travel_styles"),
                limit=6
            )
            filtered = [r for r in all_recs if r["destination"]["id"] != current_id][:3]
            recommendations = filtered
            if filtered:
                state["active_destination_id"] = filtered[0]["destination"]["id"]
            bot_response = (
                f"{sentiment_intro}\n\n"
                f"No problem at all! Let's explore some captivating alternative destinations that match your travel style:\n\n"
                + "\n".join([f"• **{r['destination']['name']}** — {r['reasons'][0]}" for r in filtered])
                + "\n\nClick on any destination card below to view its full details or generate a custom itinerary!"
            )
            follow_up_chips = ["Create itinerary for top match", "Make it cheaper", "Show beach destinations"]
            return {
                "bot_response": bot_response,
                "session_state": state,
                "recommendations": recommendations,
                "itinerary": None,
                "follow_up_chips": follow_up_chips
            }

    # =========================================================================
    # CASE 2: EXPLICIT ITINERARY CREATION REQUEST
    # =========================================================================
    if intent == "create_itinerary" or (travel_ents.get("destination_match") and ("itinerary" in user_message.lower() or "plan" in user_message.lower())):
        target_dest_id = travel_ents.get("destination_match") or active_dest_id or "swiss-alps"
        dest_obj = get_destination_by_id(target_dest_id) or DESTINATIONS[0]
        trip_days = state.get("days") or travel_ents.get("days") or 5
        budget_tier = "moderate"
        if state.get("budget"):
            if state["budget"] / (trip_days * max(1, state.get("travellers", 1))) < 75:
                budget_tier = "budget"
            elif state["budget"] / (trip_days * max(1, state.get("travellers", 1))) > 200:
                budget_tier = "luxury"
                
        itinerary = generate_itinerary(
            dest_id=dest_obj["id"],
            days=trip_days,
            budget_tier=budget_tier,
            travellers=state.get("travellers", 1),
            travel_styles=state.get("travel_styles")
        )
        state["current_itinerary"] = itinerary
        state["active_destination_id"] = dest_obj["id"]
        
        missing_prompts = []
        if not state.get("starting_location"):
            missing_prompts.append("Where will you be traveling from?")
        if not state.get("budget"):
            missing_prompts.append("What approximate budget should we target?")
            
        follow_text = f"\n\n*Quick tip: {missing_prompts[0]}*" if missing_prompts else ""
        
        bot_response = (
            f"{sentiment_intro}\n\n"
            f"Here is your customized **{itinerary['days']}-day itinerary** for **{dest_obj['name']}**!\n\n"
            f"- **Estimated Budget:** ~${int(itinerary['total_estimated_cost']):,} USD ({itinerary['travellers']} traveller{'s' if itinerary['travellers'] > 1 else ''})\n"
            f"- **Travel Style:** {', '.join(dest_obj['styles'][:3])}\n"
            f"- **Top Highlights:** {', '.join(dest_obj['highlights'][:2])}\n\n"
            f"You can review the day-by-day plan in the itinerary section below, modify the duration, or save it to your trip planner.{follow_text}"
        )
        follow_up_chips = ["Make it cheaper", "Add two more days", "Save this itinerary", "Suggest another destination"]
        return {
            "bot_response": bot_response,
            "session_state": state,
            "recommendations": [],
            "itinerary": itinerary,
            "follow_up_chips": follow_up_chips
        }

    # =========================================================================
    # CASE 3: GREETINGS / INITIAL INTRO
    # =========================================================================
    if intent == "greeting":
        bot_response = (
            f"Hello! I'm **RoamWise**, your intelligent NLP travel advisor. 🌍✈️\n\n"
            f"I can understand your natural language requests, analyze your travel style, recommend perfect destinations across the globe, and generate custom day-by-day itineraries.\n\n"
            f"**To get started, tell me something like:**\n"
            f"• *\"I want an adventurous 5-day mountain trip for 2 people with a $2000 budget\"*\n"
            f"• *\"Recommend romantic beach destinations for our honeymoon in December\"*\n"
            f"• *\"Plan a 7-day cultural itinerary for Kyoto and Tokyo\"*\n\n"
            f"Where in the world are you dreaming of going?"
        )
        follow_up_chips = [
            "5-day mountain adventure under $2000",
            "Romantic beach getaway in Bali",
            "Explore cultural wonders in Japan",
            "Family trip to Europe"
        ]
        return {
            "bot_response": bot_response,
            "session_state": state,
            "recommendations": [],
            "itinerary": None,
            "follow_up_chips": follow_up_chips
        }

    # =========================================================================
    # CASE 4: DESTINATION RECOMMENDATIONS / GENERAL TRAVEL QUERIES
    # =========================================================================
    # User is asking for suggestions, giving preferences, or asking about a place
    recs = get_recommendations(
        budget=state.get("budget"),
        days=state.get("days", 5),
        travellers=state.get("travellers", 1),
        travel_styles=state.get("travel_styles"),
        preferred_region=state.get("preferred_region"),
        preferred_dest_id=travel_ents.get("destination_match") or state.get("active_destination_id"),
        limit=3
    )
    recommendations = recs
    
    # Check if a single destination was explicitly asked about
    if travel_ents.get("destination_match"):
        matched_dest = get_destination_by_id(travel_ents["destination_match"])
        state["active_destination_id"] = matched_dest["id"]
        bot_response = (
            f"{sentiment_intro}\n\n"
            f"**{matched_dest['name']}** is an extraordinary choice!\n\n"
            f"• **Why visit:** {matched_dest['description']}\n"
            f"• **Ideal Duration:** {matched_dest['ideal_duration_days'][0]} - {matched_dest['ideal_duration_days'][1]} days\n"
            f"• **Estimated Daily Cost:** ~${matched_dest['avg_daily_cost_usd']} USD/day\n"
            f"• **Best Season:** {', '.join(matched_dest['best_seasons'])} ({', '.join(matched_dest['best_months'][:3])})\n"
            f"• **Must-See Attractions:** {', '.join(matched_dest['major_attractions'][:3])}\n\n"
            f"Would you like me to build a personalized day-by-day itinerary for {matched_dest['name']}?"
        )
        follow_up_chips = [
            f"Create {state.get('days', 5)}-day itinerary for {matched_dest['name'].split()[0]}",
            "Make it cheaper",
            "Suggest another destination",
            "What food is famous here?"
        ]
        return {
            "bot_response": bot_response,
            "session_state": state,
            "recommendations": recommendations,
            "itinerary": None,
            "follow_up_chips": follow_up_chips
        }

    # General recommendations response
    top_dest = recs[0]["destination"]
    state["active_destination_id"] = top_dest["id"]
    
    # Missing information proactive inquiry
    missing_info = []
    if not state.get("budget"):
        missing_info.append("your preferred budget")
    if not state.get("days"):
        missing_info.append("how many days you plan to travel")
    if not state.get("starting_location"):
        missing_info.append("your departure city")
        
    probing_sentence = ""
    if missing_info:
        probing_sentence = f"\n\n💡 *To make recommendations even more precise, tell me {missing_info[0]}!*"

    bot_response = (
        f"{sentiment_intro}\n\n"
        f"Based on your language cues and preferences, I've analyzed our global travel index and selected these premier matches:\n\n"
        + "\n".join([
            f"🌟 **{r['destination']['name']}** (Match: {r['match_score']}%)\n"
            f"   • *Fit:* {r['reasons'][0]}\n"
            f"   • *Est. Total:* ~${int(r['estimated_total_cost']):,} for {r['trip_days']} days ({r['travellers']} traveller{'s' if r['travellers'] > 1 else ''})"
            for r in recs
        ])
        + f"{probing_sentence}\n\n"
        f"Click on any destination to inspect attractions, or tap below to generate an instant day-by-day plan!"
    )
    
    follow_up_chips = [
        f"Create itinerary for {top_dest['name'].split()[0]}",
        "Make it cheaper",
        "Add two more days",
        "Suggest another destination"
    ]
    
    return {
        "bot_response": bot_response,
        "session_state": state,
        "recommendations": recommendations,
        "itinerary": None,
        "follow_up_chips": follow_up_chips
    }
