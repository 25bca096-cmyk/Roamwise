# RoamWise - AI-Powered NLP Travel Recommendation Platform

**RoamWise** is an advanced, genuinely functional Natural Language Processing (NLP) travel advisory and itinerary platform. Designed with a modern, high-polish UI inspired by leading travel services like MakeMyTrip, RoamWise understands natural conversational language, evaluates multi-turn dialogue context, extracts key travel constraints, scores destination compatibility, and synthesizes structured day-by-day itineraries.

---

## 🌟 Key Features

### 1. Mandatory NLP Engine (Python)
- **Tokenization:** Sentence and word segmentation powered by NLTK Punkt tokenizer.
- **Stemming:** Morpheme-level root reduction via Martin Porter's algorithm (Porter Stemmer).
- **Lemmatization:** Linguistic canonical base reduction via WordNet Lemmatizer using contextual Part-Of-Speech (POS) mapping.
- **Named Entity Recognition (NER):** High-precision extraction of geopolitical entities (`GPE`), locations (`LOC`), calendar dates (`DATE`), monetary quantities (`MONEY`), persons (`PERSON`), and organizations (`ORG`) using spaCy (`en_core_web_sm`).
- **Sentiment & Tone Analysis:** Compound polarity and multi-dimensional valence (positive, neutral, negative) scored with VADER.
- **Semantic Intent Classification:** Vectorized TF-IDF N-Grams and Cosine Similarity mapping across intent prototypes, handling phrasing variations and typos.

### 2. Intelligent Context-Aware Travel Chatbot
- Multi-turn conversational memory tracking session state across turns.
- Understands follow-up commands such as *"make it cheaper"*, *"add two more days"*, and *"suggest another destination"*.
- Resilient to typographical and grammatical errors with fuzzy Levenshtein vocabulary alignment.
- Sentiment-aware response styling (enthusiastic for positive sentiment, empathetic & solution-oriented for negative sentiment, structured & crisp for neutral sentiment).
- Proactive inquiry prompts when essential travel variables are missing.

### 3. Personalized Trip Planner & Recommendation Engine
- Optional multi-factor planner inputs (starting location, destination region, budget slider, trip duration, group size, travel season, transport preferences, accommodation styles).
- Destination compatibility scoring factoring in travel style Jaccard overlap, daily cost headroom, duration constraints, and seasonal meteorological windows.
- Clear explanations for every recommendation detailing why it matches your preferences.

### 4. AI Itinerary Generator & Modifier
- Comprehensive day-by-day itineraries with morning, afternoon, and evening breakdowns.
- Detailed activity descriptions, recommended visiting hours, dining suggestions, transportation modes, and insider tips.
- Instant modifications: one-click to make cheaper, add days, or adjust pace.
- Save to local SQLite database and export/print ready.

### 5. Live NLP Analytics Dashboard
- Dedicated telemetry panel displaying live results for the latest message:
  - Original utterance & typo corrections
  - Token stream & POS tags
  - Side-by-side Stemming vs Lemmatization table
  - spaCy Named Entity pills with category tags
  - VADER sentiment compound gauge and distribution bars
  - Classified intent and confidence percentage
  - Extracted travel attributes & salient keywords

---

## 🛠️ Technology Stack

- **Backend:** Python 3.11, FastAPI, Uvicorn, Pydantic
- **NLP Libraries:** NLTK (`punkt`, `wordnet`, `vader_lexicon`, `stopwords`), spaCy (`en_core_web_sm`), Scikit-Learn (TF-IDF & Cosine Similarity)
- **Database:** SQLite with automated migration & schema management
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React icons
- **Package Managers:** `uv` for fast Python environments, `npm` for Node.js

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone or Open the Workspace
```bash
cd C:\Users\kumar\.gemini\antigravity\scratch\roamwise
```

### 2. Backend Setup
Create virtual environment and install dependencies:
```bash
# Using uv (recommended)
uv venv .venv --python 3.11
uv pip install --python .venv\Scripts\python.exe -r requirements.txt
uv pip install --python .venv\Scripts\python.exe https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl

# Or using standard python
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Download required NLTK corpora:
```bash
.venv\Scripts\python.exe -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('wordnet'); nltk.download('vader_lexicon'); nltk.download('stopwords'); nltk.download('omw-1.4'); nltk.download('averaged_perceptron_tagger_eng'); nltk.download('averaged_perceptron_tagger')"
```

### 3. Frontend Setup & Build
```bash
cd frontend
npm install
npm run build
cd ..
```

---

## 💻 Running the Application

### Option A: Unified Production Mode (FastAPI serves both API + Built React App)
```bash
.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open your browser at: **`http://127.0.0.1:8000`**

### Option B: Separate Development Servers
Terminal 1 (Backend API):
```bash
.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Terminal 2 (Vite Frontend):
```bash
cd frontend
npm run dev
```
Open your browser at: **`http://localhost:5173`** (Vite proxies `/api` calls to port 8000).

---

## 🧪 Verification & Testing

To execute the automated end-to-end engine verification suite:
```bash
.venv\Scripts\python.exe -u verify_engine.py
```

This verifies:
1. SQLite session creation & message history persistence
2. Real-time NLTK tokenization, stemming, lemmatization, spaCy NER, and VADER sentiment
3. Multi-factor destination recommendation engine
4. Day-by-day itinerary synthesis & dynamic cost recalculation
5. Context-aware conversational follow-up logic ("make it cheaper")
6. Itinerary save/retrieve/delete workflows
7. Telemetry & aggregate query logging
