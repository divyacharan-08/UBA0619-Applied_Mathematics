import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "analysis_history.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            title TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            audio_url TEXT,
            file_path TEXT,
            duration REAL NOT NULL,
            sample_rate INTEGER NOT NULL,
            sample_count INTEGER NOT NULL,
            channels INTEGER NOT NULL,
            dominant_frequency REAL NOT NULL,
            dominant_band TEXT NOT NULL,
            est_dba REAL NOT NULL,
            noise_category TEXT NOT NULL,
            noise_status TEXT NOT NULL,
            rms REAL NOT NULL,
            window_type TEXT NOT NULL,
            peak_count INTEGER NOT NULL,
            top_peaks_json TEXT NOT NULL,
            band_distribution_json TEXT NOT NULL,
            waveform_json TEXT NOT NULL,
            spectrum_json TEXT NOT NULL,
            notes TEXT
        )
    """)
    conn.commit()
    conn.close()

def save_analysis(record):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    timestamp = record.get("timestamp") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    title = record.get("title") or record.get("filename", "Recorded Audio")
    
    cursor.execute("""
        INSERT INTO analyses (
            filename, title, timestamp, audio_url, file_path,
            duration, sample_rate, sample_count, channels,
            dominant_frequency, dominant_band, est_dba, noise_category, noise_status,
            rms, window_type, peak_count,
            top_peaks_json, band_distribution_json, waveform_json, spectrum_json, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record.get("filename", "audio.wav"),
        title,
        timestamp,
        record.get("audio_url", ""),
        record.get("file_path", ""),
        float(record.get("duration", 0.0)),
        int(record.get("sample_rate", 44100)),
        int(record.get("sample_count", 0)),
        int(record.get("channels", 1)),
        float(record.get("dominant_frequency", 0.0)),
        record.get("dominant_band", "Unknown"),
        float(record.get("est_dba", 0.0)),
        record.get("noise_category", "Normal"),
        record.get("noise_status", "Safe"),
        float(record.get("rms", 0.0)),
        record.get("window_type", "hann"),
        int(record.get("peak_count", 0)),
        json.dumps(record.get("top_peaks", [])),
        json.dumps(record.get("band_distribution", [])),
        json.dumps(record.get("waveform", [])),
        json.dumps(record.get("spectrum", [])),
        record.get("notes", "")
    ))
    
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def get_all_analyses(search=None, category=None, limit=100):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT id, filename, title, timestamp, audio_url, duration,
               sample_rate, dominant_frequency, dominant_band, est_dba,
               noise_category, noise_status, peak_count, window_type
        FROM analyses
    """
    params = []
    conditions = []
    
    if search:
        conditions.append("(title LIKE ? OR filename LIKE ? OR dominant_band LIKE ?)")
        s_term = f"%{search}%"
        params.extend([s_term, s_term, s_term])
        
    if category:
        conditions.append("noise_category = ?")
        params.append(category)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def get_analysis_by_id(record_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE id = ?", (record_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    data = dict(row)
    data["top_peaks"] = json.loads(data["top_peaks_json"])
    data["band_distribution"] = json.loads(data["band_distribution_json"])
    data["waveform"] = json.loads(data["waveform_json"])
    data["spectrum"] = json.loads(data["spectrum_json"])
    return data

def delete_analysis(record_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path FROM analyses WHERE id = ?", (record_id,))
    row = cursor.fetchone()
    
    if row and row["file_path"] and os.path.exists(row["file_path"]):
        try:
            os.remove(row["file_path"])
        except Exception:
            pass
            
    cursor.execute("DELETE FROM analyses WHERE id = ?", (record_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_system_statistics():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total_count FROM analyses")
    total_count = cursor.fetchone()["total_count"]
    
    if total_count == 0:
        conn.close()
        return {
            "total_analyses": 0,
            "avg_dominant_frequency": 0.0,
            "max_dba": 0.0,
            "avg_dba": 0.0,
            "recent_count": 0,
            "category_counts": {}
        }
        
    cursor.execute("""
        SELECT 
            AVG(dominant_frequency) as avg_freq,
            MAX(est_dba) as max_dba,
            AVG(est_dba) as avg_dba
        FROM analyses
    """)
    stats_row = cursor.fetchone()
    
    cursor.execute("""
        SELECT noise_category, COUNT(*) as cat_count
        FROM analyses
        GROUP BY noise_category
    """)
    cat_rows = cursor.fetchall()
    category_counts = {row["noise_category"]: row["cat_count"] for row in cat_rows}
    
    conn.close()
    return {
        "total_analyses": total_count,
        "avg_dominant_frequency": round(float(stats_row["avg_freq"] or 0), 2),
        "max_dba": round(float(stats_row["max_dba"] or 0), 1),
        "avg_dba": round(float(stats_row["avg_dba"] or 0), 1),
        "category_counts": category_counts
    }

