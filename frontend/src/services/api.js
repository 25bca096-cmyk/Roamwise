/**
 * RoamWise Frontend API Client
 */

const API_BASE = '/api';

export async function sendChatMessage(message, sessionId = 'default-session', preferences = null) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      preferences
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to send message');
  }
  return res.json();
}

export async function analyzeNLP(text) {
  const res = await fetch(`${API_BASE}/nlp/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to analyze text');
  }
  return res.json();
}

export async function fetchDestinations(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.style && filters.style !== 'All') params.append('style', filters.style);
  if (filters.budget_tier && filters.budget_tier !== 'All') params.append('budget_tier', filters.budget_tier);
  if (filters.region && filters.region !== 'All') params.append('region', filters.region);
  if (filters.season && filters.season !== 'All') params.append('season', filters.season);

  const res = await fetch(`${API_BASE}/destinations?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch destinations');
  return res.json();
}

export async function fetchDestinationDetail(destId) {
  const res = await fetch(`${API_BASE}/destinations/${destId}`);
  if (!res.ok) throw new Error('Failed to fetch destination details');
  return res.json();
}

export async function getRecommendations(criteria) {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(criteria)
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function generateItinerary(payload) {
  const res = await fetch(`${API_BASE}/itinerary/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate itinerary');
  return res.json();
}

export async function modifyItinerary(currentItinerary, modificationType, extraParam = null) {
  const res = await fetch(`${API_BASE}/itinerary/modify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_itinerary: currentItinerary,
      modification_type: modificationType,
      extra_param: extraParam
    })
  });
  if (!res.ok) throw new Error('Failed to modify itinerary');
  return res.json();
}

export async function fetchSavedItineraries() {
  const res = await fetch(`${API_BASE}/itineraries/saved`);
  if (!res.ok) throw new Error('Failed to fetch saved itineraries');
  return res.json();
}

export async function saveItinerary(itinerary) {
  const res = await fetch(`${API_BASE}/itineraries/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itinerary)
  });
  if (!res.ok) throw new Error('Failed to save itinerary');
  return res.json();
}

export async function deleteSavedItinerary(id) {
  const res = await fetch(`${API_BASE}/itineraries/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete itinerary');
  return res.json();
}

export async function fetchNLPStats() {
  const res = await fetch(`${API_BASE}/nlp/stats`);
  if (!res.ok) throw new Error('Failed to fetch NLP stats');
  return res.json();
}
