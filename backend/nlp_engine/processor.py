"""
RoamWise NLP Processor
Performs real tokenization, Porter stemming, WordNet lemmatization,
spaCy Named Entity Recognition, VADER sentiment analysis, keyword extraction,
and semantic intent classification.
"""

import re
import difflib
from typing import Dict, Any, List, Optional, Tuple

import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer, WordNetLemmatizer
from nltk.corpus import stopwords, wordnet
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Ensure required NLTK data is loaded
try:
    _ = stopwords.words('english')
except Exception:
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('vader_lexicon', quiet=True)

# Load spaCy NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = spacy.blank("en")

# Initialize NLTK components
stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()
sia = SentimentIntensityAnalyzer()
stop_words = set(stopwords.words('english'))

# Intent Prototypes for TF-IDF Semantic Intent Matching
INTENT_PROTOTYPES = {
    "recommend_destination": [
        "Where should I travel for vacation?",
        "Recommend some cool places to visit",
        "Suggest destinations for an adventure trip",
        "Looking for beach holiday recommendations",
        "What are the best romantic honeymoon spots?",
        "I need suggestions for a family vacation",
        "Where can I go with my friends for 5 days?",
        "Help me choose where to go on holiday",
        "Give me some travel ideas for mountains",
        "Suggest another destination please",
        "Any other places like this?",
        "Can you suggest a different country?"
    ],
    "create_itinerary": [
        "Create an itinerary for 5 days in Switzerland",
        "Can you plan my 7 day trip to Bali?",
        "Make a day by day schedule for Paris",
        "Give me an itinerary for Kyoto",
        "Plan my vacation day by day",
        "Generate a travel itinerary with morning and evening activities",
        "Build a trip plan for my family",
        "Can you organize a 4 day schedule?",
        "Show me an itinerary for Rome"
    ],
    "modify_plan": [
        "Make it cheaper please",
        "Can we reduce the budget or make it more affordable?",
        "Add two more days to the trip",
        "Extend the itinerary by 3 days",
        "Make the schedule less packed and more relaxed",
        "Suggest another destination instead",
        "Change destination to something closer",
        "Cut one day off the trip",
        "Can you upgrade to luxury hotels?"
    ],
    "ask_cost_or_budget": [
        "How much will this trip cost?",
        "What is the estimated budget for 5 days in Paris?",
        "Is Bali expensive to travel?",
        "Give me a breakdown of travel expenses",
        "How much money do I need per day?",
        "Can I travel there with 1000 dollars?"
    ],
    "ask_attractions_or_info": [
        "What are the best attractions to see in Tokyo?",
        "What is the best time to visit Santorini?",
        "Is it safe to travel alone there?",
        "What kind of food is famous in Italy?",
        "What clothes should I pack for Switzerland?",
        "Tell me more about this place"
    ],
    "greeting": [
        "Hello RoamWise",
        "Hi there, how are you?",
        "Hey, can you help me plan a trip?",
        "Good morning travel bot",
        "Greetings, I need travel assistance"
    ],
    "provide_preferences": [
        "My budget is 2000 dollars for 2 people",
        "Starting from New York with 5 days",
        "We prefer beaches and luxury hotels",
        "I want an adventure mountain trip for solo travel",
        "Traveling with family and 2 kids in December"
    ]
}

# Pre-fit TF-IDF Vectorizer across prototype corpora
corpus_texts = []
corpus_intents = []
for intent_name, examples in INTENT_PROTOTYPES.items():
    for text in examples:
        corpus_texts.append(text)
        corpus_intents.append(intent_name)

tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
tfidf_matrix = tfidf_vectorizer.fit_transform(corpus_texts)

# Travel Knowledge Entities & Dictionaries
TRAVEL_STYLES = [
    "Adventure", "Nature", "Beaches", "Mountains", "Luxury",
    "Family", "Romantic", "Historical", "Culinary", "Urban"
]

TRANSPORT_MODES = ["Flight", "Train", "Rental Car", "Bus", "Cruise", "Ferry"]
ACCOMMODATION_TYPES = ["Boutique Hotel", "Luxury Resort", "Budget Hostel", "Villa", "Chalet", "Apartment"]

KNOWN_DESTINATION_KEYWORDS = {
    "swiss": "swiss-alps", "switzerland": "swiss-alps", "alps": "swiss-alps", "zermatt": "swiss-alps", "interlaken": "swiss-alps",
    "bali": "bali", "ubud": "bali", "seminyak": "bali", "indonesia": "bali",
    "kyoto": "kyoto", "japan": "kyoto", "nara": "kyoto",
    "paris": "paris", "france": "paris", "eiffel": "paris",
    "santorini": "santorini", "greece": "santorini", "oia": "santorini",
    "costa rica": "costa-rica", "arenal": "costa-rica",
    "rome": "rome", "italy": "rome", "vatican": "rome", "colosseum": "rome",
    "queenstown": "queenstown", "new zealand": "queenstown", "milford": "queenstown",
    "dubai": "dubai", "uae": "dubai", "emirates": "dubai",
    "banff": "banff", "canada": "banff", "louise": "banff",
    "phuket": "phuket", "thailand": "phuket", "phi phi": "phuket",
    "cape town": "cape-town", "south africa": "cape-town",
    "tokyo": "tokyo", "shibuya": "tokyo", "shinjuku": "tokyo",
    "iceland": "iceland", "reykjavik": "iceland", "aurora": "iceland",
    "machu picchu": "machu-picchu", "peru": "machu-picchu", "cusco": "machu-picchu",
    "rajasthan": "rajasthan", "jaipur": "rajasthan", "udaipur": "rajasthan", "india": "rajasthan",
    "amalfi": "amalfi-coast", "positano": "amalfi-coast", "capri": "amalfi-coast",
    "new york": "new-york", "nyc": "new-york", "manhattan": "new-york",
    "maldives": "maldives", "male": "maldives",
    "barcelona": "barcelona", "spain": "barcelona", "catalonia": "barcelona"
}

def clean_and_normalize_text(text: str) -> str:
    """Normalize text spacing and basic punctuation."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def get_wordnet_pos(treebank_tag: str) -> str:
    """Map POS tag to first character lemmatize() accepts."""
    if treebank_tag.startswith('J'):
        return wordnet.ADJ
    elif treebank_tag.startswith('V'):
        return wordnet.VERB
    elif treebank_tag.startswith('N'):
        return wordnet.NOUN
    elif treebank_tag.startswith('R'):
        return wordnet.ADV
    else:
        return wordnet.NOUN

def perform_spelling_correction(text: str) -> Tuple[str, List[Dict[str, str]]]:
    """Correct frequent travel-related typos using fuzzy matching."""
    corrections = []
    tokens = text.split()
    corrected_tokens = []
    
    # Common travel vocabulary targets
    target_vocab = list(KNOWN_DESTINATION_KEYWORDS.keys()) + [
        "budget", "itinerary", "recommend", "destination", "travel", "vacation",
        "holiday", "flight", "hotel", "beach", "mountain", "adventure", "romantic",
        "cheaper", "expensive", "family", "resort", "explore", "tomorrow", "december"
    ]
    
    for tok in tokens:
        clean_tok = re.sub(r'[^\w\s]', '', tok).lower()
        if len(clean_tok) > 3 and clean_tok not in target_vocab:
            matches = difflib.get_close_matches(clean_tok, target_vocab, n=1, cutoff=0.78)
            if matches and matches[0] != clean_tok:
                corrected_tokens.append(matches[0])
                corrections.append({"original": clean_tok, "corrected": matches[0]})
                continue
        corrected_tokens.append(tok)
        
    return " ".join(corrected_tokens), corrections

def extract_custom_travel_entities(text: str) -> Dict[str, Any]:
    """Rule-based extractor for travel attributes (budget, duration, companions, styles)."""
    text_lower = text.lower()
    entities = {
        "budget": None,
        "days": None,
        "travellers": None,
        "styles": [],
        "destination_match": None,
        "modification_requests": []
    }
    
    # Budget extraction: e.g. "$2500", "2000 usd", "budget of 1500", "under 3000"
    budget_match = re.search(r'(?:\$|usd|inr|eur|budget\s*(?:of|is|:)?\s*)\s*(\d{2,6})', text_lower)
    if not budget_match:
        budget_match = re.search(r'(\d{2,6})\s*(?:\$|usd|dollars|bucks|euro)', text_lower)
    if budget_match:
        try:
            entities["budget"] = float(budget_match.group(1))
        except Exception:
            pass

    # Duration / Days extraction: e.g. "5 days", "a week", "10-day", "3 nights"
    days_match = re.search(r'(\d{1,2})\s*(?:-| )*(?:days?|nights?|day)', text_lower)
    if days_match:
        try:
            entities["days"] = int(days_match.group(1))
        except Exception:
            pass
    elif "weekend" in text_lower:
        entities["days"] = 3
    elif "a week" in text_lower or "one week" in text_lower:
        entities["days"] = 7
    elif "two weeks" in text_lower or "2 weeks" in text_lower:
        entities["days"] = 14

    # Travellers extraction: e.g. "2 people", "family of 4", "solo", "my wife and i", "3 friends"
    traveller_match = re.search(r'(\d{1,2})\s*(?:people|persons?|travellers?|adults?|friends?|guests?)', text_lower)
    if traveller_match:
        try:
            entities["travellers"] = int(traveller_match.group(1))
        except Exception:
            pass
    elif "solo" in text_lower or "alone" in text_lower or "myself" in text_lower:
        entities["travellers"] = 1
    elif "couple" in text_lower or "my partner" in text_lower or "my wife" in text_lower or "my husband" in text_lower:
        entities["travellers"] = 2
    elif "family" in text_lower:
        entities["travellers"] = 4

    # Travel styles detection
    for style in TRAVEL_STYLES:
        s_lower = style.lower()
        if s_lower in text_lower:
            entities["styles"].append(style)
    # Synonym expansions
    if "trek" in text_lower or "hiking" in text_lower or "extreme" in text_lower:
        if "Adventure" not in entities["styles"]: entities["styles"].append("Adventure")
    if "ocean" in text_lower or "sea" in text_lower or "coastal" in text_lower or "island" in text_lower:
        if "Beaches" not in entities["styles"]: entities["styles"].append("Beaches")
    if "honeymoon" in text_lower or "anniversary" in text_lower or "couples" in text_lower:
        if "Romantic" not in entities["styles"]: entities["styles"].append("Romantic")
    if "cheap" in text_lower or "backpack" in text_lower or "hostel" in text_lower:
        if "budget" not in entities["styles"]: entities["styles"].append("Budget")

    # Destination detection in text
    for keyword, dest_id in KNOWN_DESTINATION_KEYWORDS.items():
        if re.search(rf'\b{re.escape(keyword)}\b', text_lower):
            entities["destination_match"] = dest_id
            break

    # Follow-up modification requests detection
    if "cheaper" in text_lower or "reduce budget" in text_lower or "less expensive" in text_lower or "cost down" in text_lower:
        entities["modification_requests"].append("make_cheaper")
    if re.search(r'add\s+(\d+|two|three|one)\s+(?:more\s+)?days?', text_lower):
        entities["modification_requests"].append("add_days")
    if "another destination" in text_lower or "different place" in text_lower or "suggest another" in text_lower:
        entities["modification_requests"].append("change_destination")
    if "relax" in text_lower or "slower" in text_lower or "chill" in text_lower:
        entities["modification_requests"].append("relax_pace")

    return entities

def classify_intent_semantic(text: str) -> Tuple[str, float]:
    """Classify user intent using TF-IDF and Cosine Similarity."""
    clean_text = clean_and_normalize_text(text)
    if not clean_text:
        return "greeting", 0.0

    # Rule-based priority shortcuts for clear follow-ups
    text_lower = clean_text.lower()
    if any(q in text_lower for q in ["make it cheaper", "make cheaper", "cheaper please", "cut budget"]):
        return "modify_plan", 0.96
    if any(q in text_lower for q in ["add two more days", "add days", "extend trip", "suggest another destination", "different place"]):
        return "modify_plan", 0.94
    if any(q in text_lower for q in ["create itinerary", "generate itinerary", "make an itinerary", "day by day plan", "plan my trip"]):
        return "create_itinerary", 0.92

    # Vectorize incoming query
    vec = tfidf_vectorizer.transform([clean_text])
    sims = cosine_similarity(vec, tfidf_matrix)[0]
    best_idx = sims.argmax()
    best_score = float(sims[best_idx])
    
    if best_score > 0.15:
        return corpus_intents[best_idx], round(best_score, 3)
    
    # Fallback heuristic
    if any(tok in text_lower for tok in ["hi", "hello", "hey", "hola"]):
        return "greeting", 0.75
    if any(tok in text_lower for tok in ["recommend", "where to", "suggest", "places", "holiday", "visit", "vacation"]):
        return "recommend_destination", 0.60
    if any(tok in text_lower for tok in ["itinerary", "plan", "schedule", "days"]):
        return "create_itinerary", 0.60

    return "general_query", 0.40

def analyze_text(text: str) -> Dict[str, Any]:
    """
    Complete NLP processing pipeline:
    - Tokenization
    - Stemming (Porter)
    - Lemmatization (WordNet)
    - Named Entity Recognition (spaCy)
    - Sentiment Analysis (VADER)
    - Semantic Intent Classification
    - Keyword & Custom entity extraction
    """
    raw_text = text or ""
    normalized_text, corrections = perform_spelling_correction(raw_text)
    
    # 1. Tokenization (NLTK)
    tokens = word_tokenize(normalized_text)
    
    # 2. POS Tagging for accurate Lemmatization
    pos_tags = nltk.pos_tag(tokens)
    
    # 3. Stemming (Porter Stemmer)
    stems = [stemmer.stem(t.lower()) for t in tokens if t.isalnum()]
    
    # 4. Lemmatization (WordNet Lemmatizer with POS)
    lemmas = []
    for token, tag in pos_tags:
        if token.isalnum():
            wn_tag = get_wordnet_pos(tag)
            lemma = lemmatizer.lemmatize(token.lower(), wn_tag)
            lemmas.append(lemma)
            
    # 5. Named Entity Recognition (spaCy)
    doc = nlp(normalized_text)
    spacy_entities = []
    for ent in doc.ents:
        spacy_entities.append({
            "text": ent.text,
            "label": ent.label_,
            "start": ent.start_char,
            "end": ent.end_char
        })
        
    # 6. Sentiment Analysis (VADER)
    sentiment_scores = sia.polarity_scores(raw_text)
    compound = sentiment_scores['compound']
    if compound >= 0.05:
        sentiment_label = "positive"
    elif compound <= -0.05:
        sentiment_label = "negative"
    else:
        sentiment_label = "neutral"
        
    # 7. Semantic Intent Classification
    intent, intent_confidence = classify_intent_semantic(normalized_text)
    
    # 8. Custom Travel Entities Extraction
    travel_entities = extract_custom_travel_entities(normalized_text)
    
    # 9. Key Travel Keywords (nouns & adjectives filtering stopwords)
    keywords = []
    for token, tag in pos_tags:
        clean_tok = token.lower()
        if clean_tok.isalnum() and clean_tok not in stop_words and len(clean_tok) > 2:
            if tag.startswith(('N', 'J', 'V')):
                if clean_tok not in keywords:
                    keywords.append(clean_tok)
                    
    return {
        "original_text": raw_text,
        "normalized_text": normalized_text,
        "corrections": corrections,
        "tokens": tokens,
        "tokens_count": len(tokens),
        "stems": stems[:25],
        "lemmas": lemmas[:25],
        "pos_tags": [{"token": t, "tag": p} for t, p in pos_tags[:20]],
        "entities": spacy_entities,
        "sentiment": {
            "label": sentiment_label,
            "compound": round(compound, 4),
            "positive": round(sentiment_scores['pos'], 3),
            "neutral": round(sentiment_scores['neu'], 3),
            "negative": round(sentiment_scores['neg'], 3)
        },
        "intent": intent,
        "intent_confidence": intent_confidence,
        "keywords": keywords[:15],
        "travel_entities": travel_entities
    }
