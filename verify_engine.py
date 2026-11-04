import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("--- Testing Database ---")
from backend.database import init_db, get_or_create_session, save_message, get_session_messages, save_itinerary, get_saved_itineraries, get_analytics_summary
init_db()
session = get_or_create_session("verify-sess")
print("Session created:", session["id"])

print("\n--- Testing NLP Processor ---")
from backend.nlp_engine.processor import analyze_text
nlp_res = analyze_text("I want an adventurous 5-day trip to Switzerland with budget of $2500 in December! I am so excited!")
print("Tokens:", nlp_res["tokens"][:6])
print("Stems:", nlp_res["stems"][:6])
print("Lemmas:", nlp_res["lemmas"][:6])
print("Entities:", nlp_res["entities"])
print("Sentiment:", nlp_res["sentiment"])
print("Intent:", nlp_res["intent"], "Confidence:", nlp_res["intent_confidence"])
print("Travel Entities:", nlp_res["travel_entities"])

print("\n--- Testing Recommendations ---")
from backend.nlp_engine.recommendation import get_recommendations
recs = get_recommendations(budget=2500, days=5, travellers=2, travel_styles=["Adventure", "Mountains"])
print("Top Recommendation:", recs[0]["destination"]["name"], "Match Score:", recs[0]["match_score"], "%")

print("\n--- Testing Itinerary Generator ---")
from backend.nlp_engine.itinerary_generator import generate_itinerary, modify_existing_itinerary
itin = generate_itinerary(dest_id="swiss-alps", days=5, budget_tier="moderate", travellers=2)
print("Itinerary Title:", itin["title"])
print("Days count:", len(itin["daily_itineraries"]))
print("Total Cost:", itin["total_estimated_cost"])

print("\n--- Testing Itinerary Modification (make cheaper) ---")
mod_itin = modify_existing_itinerary(itin, "make_cheaper")
print("Modified Title:", mod_itin["title"])
print("Modified Cost:", mod_itin["total_estimated_cost"], "(Tier:", mod_itin["budget_tier"], ")")

print("\n--- Testing Dialogue Manager ---")
from backend.nlp_engine.dialogue_manager import process_chat_message
chat_res = process_chat_message(
    user_message="I want an adventurous 5-day trip to Switzerland with budget of $2500 in December!",
    session_id="verify-sess",
    session_state=session["profile"],
    nlp_analysis=nlp_res
)
print("Bot Response Summary:\n", chat_res["bot_response"][:160], "...")
print("Recs provided in chat:", len(chat_res["recommendations"]))

print("\n--- Testing Follow-up Dialogue ---")
nlp_followup = analyze_text("Can you make it cheaper?")
chat_res2 = process_chat_message(
    user_message="Can you make it cheaper?",
    session_id="verify-sess",
    session_state=chat_res["session_state"],
    nlp_analysis=nlp_followup
)
print("Follow-up Bot Response:\n", chat_res2["bot_response"][:160], "...")

print("\n--- Testing Save Itinerary ---")
saved_id = save_itinerary(itin)
saved_list = get_saved_itineraries()
print("Saved Itinerary ID:", saved_id, "Total Saved Count:", len(saved_list))

print("\n--- Testing Analytics Summary ---")
summary = get_analytics_summary()
print("Total Queries:", summary["total_queries"])

print("\n===========================================")
print(">>> ALL ROAMWISE ENGINE MODULES VERIFIED! <<<")
print("===========================================")
