/**
 * RoamWise Frontend API Client (Hybrid Online + Resilient Fallback)
 * Works seamlessly whether connected to the live FastAPI backend or running statically on Vercel.
 */

import { clientNLPAnalyze, clientRecommend, clientGenerateItinerary, DESTINATIONS_DATA } from './nlpFallback';

const API_BASE = '/api';

export async function sendChatMessage(message, sessionId = 'default-session', preferences = null) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        preferences
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback to client-side NLP engine
  }

  // Client-Side Resilient NLP Execution
  const nlp = clientNLPAnalyze(message);
  let recs = [];
  let itinerary = null;
  let responseText = "";

  if (nlp.intent === "modify_plan" && /cheaper/i.test(message)) {
    recs = clientRecommend({ budget: 1200, days: 5 });
    responseText = `I've updated your preferences to optimize for value! Here are budget-friendly destinations where your money goes furthest with boutique stays and local transit.\n\nCheck out the updated options below!`;
  } else if (nlp.intent === "create_itinerary" || nlp.travel_entities.destination_match) {
    const destId = nlp.travel_entities.destination_match || "swiss-alps";
    itinerary = clientGenerateItinerary(destId, nlp.travel_entities.days || 5, /cheap|budget/i.test(message) ? "budget" : "moderate");
    responseText = `Here is your customized **${itinerary.days}-day itinerary** for **${itinerary.destination}**! Enjoy exploring the day-by-day activities, estimated expenses, and insider travel tips below.`;
  } else if (nlp.intent === "greeting") {
    responseText = `Hello! I'm **RoamWise**, your intelligent AI travel advisor. 🌍✈️\n\nTell me where you'd like to travel, your budget, or trip duration (e.g., *"5-day mountain trip for $2000"* or *"recommend romantic beaches in Bali"*)!`;
  } else {
    recs = clientRecommend({ budget: nlp.travel_entities.budget || 2500, days: nlp.travel_entities.days || 5, travel_styles: nlp.travel_entities.styles });
    responseText = `Based on your request, I've analyzed global destinations and selected top matches for you! Tap on any destination card to generate an instant day-by-day plan.`;
  }

  return {
    session_id: sessionId,
    bot_response: responseText,
    nlp_analysis: nlp,
    recommendations: recs,
    itinerary: itinerary,
    follow_up_chips: [
      "Make it cheaper",
      "Add two more days",
      "Suggest another destination",
      "Create itinerary for top match"
    ],
    session_state: {}
  };
}

export async function analyzeNLP(text) {
  try {
    const res = await fetch(`${API_BASE}/nlp/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }
  return clientNLPAnalyze(text);
}

export async function fetchDestinations(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.style && filters.style !== 'All') params.append('style', filters.style);
    if (filters.budget_tier && filters.budget_tier !== 'All') params.append('budget_tier', filters.budget_tier);
    if (filters.region && filters.region !== 'All') params.append('region', filters.region);

    const res = await fetch(`${API_BASE}/destinations?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }

  // Filter client-side
  let list = DESTINATIONS_DATA;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(d => d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
  }
  if (filters.style && filters.style !== 'All') {
    list = list.filter(d => d.styles.some(s => s.toLowerCase() === filters.style.toLowerCase()));
  }
  if (filters.budget_tier && filters.budget_tier !== 'All') {
    list = list.filter(d => d.budget_tier.toLowerCase() === filters.budget_tier.toLowerCase());
  }
  if (filters.region && filters.region !== 'All') {
    list = list.filter(d => d.region.toLowerCase().includes(filters.region.toLowerCase()) || d.continent.toLowerCase().includes(filters.region.toLowerCase()));
  }
  return { count: list.length, destinations: list };
}

export async function fetchDestinationDetail(destId) {
  try {
    const res = await fetch(`${API_BASE}/destinations/${destId}`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return DESTINATIONS_DATA.find(d => d.id === destId) || DESTINATIONS_DATA[0];
}

export async function getRecommendations(criteria) {
  try {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  const recs = clientRecommend(criteria);
  return { count: recs.length, recommendations: recs };
}

export async function generateItinerary(payload) {
  try {
    const res = await fetch(`${API_BASE}/itinerary/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return clientGenerateItinerary(payload.destination_id, payload.days, payload.budget_tier);
}

export async function modifyItinerary(currentItinerary, modificationType, extraParam = null) {
  try {
    const res = await fetch(`${API_BASE}/itinerary/modify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_itinerary: currentItinerary,
        modification_type: modificationType,
        extra_param: extraParam
      })
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  // Client-side modification
  const days = modificationType === "add_days" ? (currentItinerary.days + 2) : currentItinerary.days;
  const tier = modificationType === "make_cheaper" ? "budget" : currentItinerary.budget_tier;
  return clientGenerateItinerary(currentItinerary.destination_id, days, tier);
}

const STORAGE_KEY = 'roamwise_saved_itineraries';

export async function fetchSavedItineraries() {
  try {
    const res = await fetch(`${API_BASE}/itineraries/saved`);
    if (res.ok) return await res.json();
  } catch (e) {}
  const local = localStorage.getItem(STORAGE_KEY);
  return local ? JSON.parse(local) : [];
}

export async function saveItinerary(itinerary) {
  try {
    const res = await fetch(`${API_BASE}/itineraries/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itinerary)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  const existing = await fetchSavedItineraries();
  const updated = [itinerary, ...existing.filter(i => i.id !== itinerary.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return { status: "saved", id: itinerary.id };
}

export async function deleteSavedItinerary(id) {
  try {
    const res = await fetch(`${API_BASE}/itineraries/${id}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (e) {}
  const existing = await fetchSavedItineraries();
  const updated = existing.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return { status: "deleted", id };
}

export async function fetchNLPStats() {
  try {
    const res = await fetch(`${API_BASE}/nlp/stats`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    total_queries: 18,
    intent_distribution: {
      recommend_destination: 7,
      create_itinerary: 5,
      modify_plan: 4,
      greeting: 2
    },
    sentiment_distribution: {
      positive: 12,
      neutral: 4,
      negative: 2
    },
    recent_queries: [
      { user_query: "I want an adventurous 5-day trip to Switzerland with budget of $2500", intent: "provide_preferences" },
      { user_query: "Can you make it cheaper?", intent: "modify_plan" },
      { user_query: "Romantic beach honeymoon in Bali", intent: "recommend_destination" }
    ]
  };
}
