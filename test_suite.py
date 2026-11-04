import sys
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

print("Starting RoamWise Verification Suite...")

# 1. Health check
res = client.get('/api/health')
print('1. Health check status:', res.status_code, res.json())
assert res.status_code == 200

# 2. Direct NLP Analysis
res = client.post('/api/nlp/analyze', json={'text': 'I want an adventurous 5-day trip to Switzerland with a budget of $2500 in December! I am so excited!'})
print('2. NLP Analysis status:', res.status_code)
nlp_data = res.json()
print('   - Tokens:', nlp_data['tokens'][:5])
print('   - Stems:', nlp_data['stems'][:5])
print('   - Lemmas:', nlp_data['lemmas'][:5])
print('   - Entities:', nlp_data['entities'])
print('   - Sentiment:', nlp_data['sentiment'])
print('   - Intent:', nlp_data['intent'], 'Confidence:', nlp_data['intent_confidence'])
print('   - Extracted Travel Entities:', nlp_data['travel_entities'])
assert res.status_code == 200

# 3. Destinations
res = client.get('/api/destinations?style=Adventure')
print('3. Destinations count:', res.json()['count'])
assert res.status_code == 200

# 4. Recommendation Engine
res = client.post('/api/recommend', json={'budget': 2000, 'days': 5, 'travellers': 2, 'travel_styles': ['Mountains', 'Adventure']})
recs = res.json()['recommendations']
print('4. Top Recommendation:', recs[0]['destination']['name'], 'Score:', recs[0]['match_score'])
assert res.status_code == 200

# 5. Itinerary Generator
res = client.post('/api/itinerary/generate', json={'destination_id': 'swiss-alps', 'days': 5, 'budget_tier': 'moderate', 'travellers': 2})
itin = res.json()
print('5. Generated Itinerary:', itin['title'], 'Total Days:', len(itin['daily_itineraries']), 'Cost:', itin['total_estimated_cost'])
assert res.status_code == 200

# 6. Chat Interaction
res = client.post('/api/chat', json={'session_id': 'test-session-1', 'message': 'Hello RoamWise, recommend a romantic beach trip for $3000'})
chat_res = res.json()
print('6. Chat Response:')
print('   - Bot:', chat_res['bot_response'][:120], '...')
print('   - Recs returned:', len(chat_res['recommendations']))
assert res.status_code == 200

# 7. Chat Follow-up (Make it cheaper)
res = client.post('/api/chat', json={'session_id': 'test-session-1', 'message': 'Can you make it cheaper?'})
chat_followup = res.json()
print('7. Follow-up Response (make cheaper):')
print('   - Bot:', chat_followup['bot_response'][:120], '...')
assert res.status_code == 200

# 8. Save Itinerary
res = client.post('/api/itineraries/save', json=itin)
print('8. Save Itinerary status:', res.json())
assert res.status_code == 200

# 9. List Saved Itineraries
res = client.get('/api/itineraries/saved')
print('9. Saved count:', len(res.json()))
assert res.status_code == 200

# 10. NLP Stats
res = client.get('/api/nlp/stats')
print('10. NLP Stats:', res.json())
assert res.status_code == 200

# 11. Static Frontend SPA
res = client.get('/')
print('11. Frontend index.html served:', res.status_code, 'Content length:', len(res.text))
assert res.status_code == 200

print('\n=============================================')
print('*** ALL 11 ROAMWISE VERIFICATION TESTS PASSED! ***')
print('=============================================')
