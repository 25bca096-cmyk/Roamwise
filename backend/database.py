import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "roamwise.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            title TEXT,
            profile_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,
            content TEXT,
            nlp_json TEXT,
            recommendations_json TEXT,
            itinerary_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (id)
        )
    ''')
    
    # Saved Itineraries table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS saved_itineraries (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            title TEXT,
            destination TEXT,
            days INTEGER,
            total_estimated_cost REAL,
            currency TEXT,
            itinerary_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Analytics logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_query TEXT,
            tokens_json TEXT,
            stems_json TEXT,
            lemmas_json TEXT,
            entities_json TEXT,
            sentiment_json TEXT,
            intent TEXT,
            keywords_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_or_create_session(session_id: str, title: str = "New Travel Chat") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    if not row:
        now = datetime.utcnow().isoformat()
        cursor.execute(
            "INSERT INTO sessions (id, title, profile_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (session_id, title, json.dumps({}), now, now)
        )
        conn.commit()
        cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        row = cursor.fetchone()
    
    session_data = dict(row)
    session_data["profile"] = json.loads(session_data.get("profile_json") or "{}")
    conn.close()
    return session_data

def update_session_profile(session_id: str, profile: Dict[str, Any], title: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    if title:
        cursor.execute(
            "UPDATE sessions SET profile_json = ?, title = ?, updated_at = ? WHERE id = ?",
            (json.dumps(profile), title, now, session_id)
        )
    else:
        cursor.execute(
            "UPDATE sessions SET profile_json = ?, updated_at = ? WHERE id = ?",
            (json.dumps(profile), now, session_id)
        )
    conn.commit()
    conn.close()

def save_message(
    session_id: str,
    role: str,
    content: str,
    nlp_data: Optional[Dict[str, Any]] = None,
    recommendations: Optional[List[Dict[str, Any]]] = None,
    itinerary: Optional[Dict[str, Any]] = None
) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        INSERT INTO messages (session_id, role, content, nlp_json, recommendations_json, itinerary_json)
        VALUES (?, ?, ?, ?, ?, ?)
        ''',
        (
            session_id,
            role,
            content,
            json.dumps(nlp_data) if nlp_data else None,
            json.dumps(recommendations) if recommendations else None,
            json.dumps(itinerary) if itinerary else None
        )
    )
    msg_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return msg_id

def get_session_messages(session_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
    rows = cursor.fetchall()
    messages = []
    for r in rows:
        d = dict(r)
        d["nlp_analysis"] = json.loads(d["nlp_json"]) if d.get("nlp_json") else None
        d["recommendations"] = json.loads(d["recommendations_json"]) if d.get("recommendations_json") else None
        d["itinerary"] = json.loads(d["itinerary_json"]) if d.get("itinerary_json") else None
        messages.append(d)
    conn.close()
    return messages

def save_itinerary(itinerary_data: Dict[str, Any]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        INSERT OR REPLACE INTO saved_itineraries (id, session_id, title, destination, days, total_estimated_cost, currency, itinerary_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        (
            itinerary_data["id"],
            itinerary_data.get("session_id", "default"),
            itinerary_data.get("title", "Trip Itinerary"),
            itinerary_data.get("destination", "Custom Trip"),
            itinerary_data.get("days", 3),
            itinerary_data.get("total_estimated_cost", 0.0),
            itinerary_data.get("currency", "USD"),
            json.dumps(itinerary_data)
        )
    )
    conn.commit()
    conn.close()
    return itinerary_data["id"]

def get_saved_itineraries() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM saved_itineraries ORDER BY created_at DESC")
    rows = cursor.fetchall()
    results = []
    for r in rows:
        d = dict(r)
        d["itinerary"] = json.loads(d["itinerary_json"]) if d.get("itinerary_json") else None
        results.append(d)
    conn.close()
    return results

def delete_saved_itinerary(itinerary_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM saved_itineraries WHERE id = ?", (itinerary_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def log_analytics(
    user_query: str,
    tokens: List[str],
    stems: List[str],
    lemmas: List[str],
    entities: List[Dict[str, str]],
    sentiment: Dict[str, Any],
    intent: str,
    keywords: List[str]
):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        INSERT INTO analytics_logs (user_query, tokens_json, stems_json, lemmas_json, entities_json, sentiment_json, intent, keywords_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        (
            user_query,
            json.dumps(tokens),
            json.dumps(stems),
            json.dumps(lemmas),
            json.dumps(entities),
            json.dumps(sentiment),
            intent,
            json.dumps(keywords)
        )
    )
    conn.commit()
    conn.close()

def get_analytics_summary() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as total_queries FROM analytics_logs")
    total_queries = cursor.fetchone()["total_queries"]
    
    cursor.execute("SELECT intent, COUNT(*) as cnt FROM analytics_logs GROUP BY intent ORDER BY cnt DESC LIMIT 8")
    intent_rows = cursor.fetchall()
    intents = {r["intent"]: r["cnt"] for r in intent_rows}
    
    cursor.execute("SELECT sentiment_json FROM analytics_logs ORDER BY id DESC LIMIT 50")
    sent_rows = cursor.fetchall()
    sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
    for r in sent_rows:
        try:
            s = json.loads(r["sentiment_json"])
            label = s.get("label", "neutral")
            sentiment_counts[label] = sentiment_counts.get(label, 0) + 1
        except Exception:
            pass
            
    cursor.execute("SELECT user_query, created_at, intent FROM analytics_logs ORDER BY id DESC LIMIT 10")
    recent_rows = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    return {
        "total_queries": total_queries,
        "intent_distribution": intents,
        "sentiment_distribution": sentiment_counts,
        "recent_queries": recent_rows
    }
