import os
import uuid
import json
import numpy as np
import scipy.io.wavfile as wavfile
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from audio_processor import (
    process_audio_pipeline,
    compute_fft_analysis,
    preprocess_signal,
    load_audio_file,
    classify_frequency_band,
    classify_noise_level
)
from database import (
    init_db,
    save_analysis,
    get_all_analyses,
    get_analysis_by_id,
    delete_analysis,
    get_system_statistics
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
FRONTEND_DIST = os.path.join(PROJECT_DIR, "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")
else:
    app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 MB max audio upload

ALLOWED_EXTENSIONS = {"wav", "mp3", "ogg", "flac", "webm", "m4a", "aac"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_sample_environmental_audios():
    """
    Generates realistic environmental audio samples with mathematically precise
    frequency characteristics for instant exploration and benchmarking.
    """
    samples = [
        {
            "filename": "traffic_intersection.wav",
            "title": "Urban Traffic & Vehicle Rumbling",
            "notes": "Low-frequency engine hums (85 Hz, 160 Hz) and asphalt friction.",
            "generator": lambda sr, t: (
                0.55 * np.sin(2 * np.pi * 85 * t) +
                0.35 * np.sin(2 * np.pi * 165 * t) +
                0.25 * np.sin(2 * np.pi * 340 * t) +
                0.15 * np.random.normal(0, 0.2, len(t))
            )
        },
        {
            "filename": "industrial_compressor.wav",
            "title": "Industrial Compressor & Motor Whine",
            "notes": "Rotary harmonics at 120 Hz, 360 Hz, and high-frequency valve whine at 2400 Hz.",
            "generator": lambda sr, t: (
                0.60 * np.sin(2 * np.pi * 120 * t) +
                0.40 * np.sin(2 * np.pi * 360 * t) +
                0.30 * np.sin(2 * np.pi * 720 * t) +
                0.20 * np.sin(2 * np.pi * 2400 * t) +
                0.08 * np.random.normal(0, 0.1, len(t))
            )
        },
        {
            "filename": "morning_bird_chirp.wav",
            "title": "Morning Avian Song & Ambient Nature",
            "notes": "High-frequency melodic bird chirps centered at 2850 Hz and 4100 Hz.",
            "generator": lambda sr, t: (
                0.50 * np.sin(2 * np.pi * 2850 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 4 * t)) +
                0.35 * np.sin(2 * np.pi * 4100 * t) * (0.5 + 0.5 * np.cos(2 * np.pi * 3 * t)) +
                0.04 * np.random.normal(0, 0.05, len(t))
            )
        },
        {
            "filename": "pure_tone_a440.wav",
            "title": "Standard Acoustic Tuning Tone (A4 = 440 Hz)",
            "notes": "Laboratory benchmark tone at exactly 440.00 Hz for Fourier Transform calibration.",
            "generator": lambda sr, t: 0.90 * np.sin(2 * np.pi * 440.0 * t)
        }
    ]

    sr = 44100
    duration = 3.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)

    for item in samples:
        filepath = os.path.join(UPLOAD_FOLDER, item["filename"])
        if not os.path.exists(filepath):
            raw_signal = item["generator"](sr, t)
            # Normalize to avoid clipping
            peak = np.max(np.abs(raw_signal))
            if peak > 0:
                raw_signal = (raw_signal / peak) * 0.92
            int16_signal = (raw_signal * 32767).astype(np.int16)
            wavfile.write(filepath, sr, int16_signal)
            
            # Analyze and store in DB
            try:
                result = process_audio_pipeline(filepath, {"normalize": True, "remove_dc": True, "window_type": "hann"})
                analysis = result["analysis"]
                meta = result["metadata"]
                
                save_analysis({
                    "filename": item["filename"],
                    "title": item["title"],
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "audio_url": f"/api/audio/{item['filename']}",
                    "file_path": filepath,
                    "duration": meta["processed_duration"],
                    "sample_rate": meta["sampling_rate"],
                    "sample_count": meta["sample_count"],
                    "channels": meta["channels"],
                    "dominant_frequency": analysis["dominant_frequency"],
                    "dominant_band": analysis["dominant_band"],
                    "est_dba": analysis["est_dba"],
                    "noise_category": analysis["noise_info"]["category"],
                    "noise_status": analysis["noise_info"]["status"],
                    "rms": analysis["rms"],
                    "window_type": analysis["window_type"],
                    "peak_count": analysis["peak_count"],
                    "top_peaks": analysis["top_peaks"],
                    "band_distribution": analysis["band_distribution"],
                    "waveform": analysis["waveform"],
                    "spectrum": analysis["spectrum"],
                    "notes": item["notes"]
                })
            except Exception as e:
                print(f"Error seeding sample {item['filename']}: {e}")

# Initialize Database and seed samples
init_db()
generate_sample_environmental_audios()

@app.route("/api/health", methods=["GET"])
def health_check():
    stats = get_system_statistics()
    return jsonify({
        "status": "healthy",
        "service": "Noise Pollution & Fourier Transform Engine",
        "course_outcome": "CO4 - Fourier Transform",
        "math_engine": "NumPy / SciPy Cooley-Tukey Real FFT",
        "records_count": stats["total_analyses"]
    })

@app.route("/api/analyze", methods=["POST"])
def analyze_audio():
    """
    Primary endpoint for Module 1 & Module 2:
    Receives audio file (recorded blob or uploaded file),
    runs signal preprocessing and FFT analysis, and returns complete metrics.
    """
    if "audio" not in request.files and "file" not in request.files:
        return jsonify({"error": "No audio file provided in request."}), 400

    audio_file = request.files.get("audio") or request.files.get("file")
    if not audio_file or audio_file.filename == "":
        return jsonify({"error": "Empty audio file provided."}), 400

    orig_filename = secure_filename(audio_file.filename) or "recording.wav"
    ext = orig_filename.rsplit(".", 1)[-1].lower() if "." in orig_filename else "wav"
    unique_filename = f"{uuid.uuid4().hex[:10]}_{orig_filename}"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
    audio_file.save(file_path)

    # Parsing analysis options
    normalize = request.form.get("normalize", "true").lower() == "true"
    remove_dc = request.form.get("remove_dc", "true").lower() == "true"
    window_type = request.form.get("window_type", "hann")
    title = request.form.get("title", "").strip() or orig_filename
    
    start_time = request.form.get("start_time")
    end_time = request.form.get("end_time")
    start_time = float(start_time) if start_time not in (None, "", "null") else None
    end_time = float(end_time) if end_time not in (None, "", "null") else None
    
    save_to_db = request.form.get("save_to_db", "true").lower() == "true"

    try:
        pipeline_output = process_audio_pipeline(file_path, {
            "normalize": normalize,
            "remove_dc": remove_dc,
            "window_type": window_type,
            "start_time": start_time,
            "end_time": end_time
        })
        
        meta = pipeline_output["metadata"]
        analysis = pipeline_output["analysis"]
        audio_url = f"/api/audio/{unique_filename}"
        
        saved_id = None
        if save_to_db:
            saved_id = save_analysis({
                "filename": orig_filename,
                "title": title,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "audio_url": audio_url,
                "file_path": file_path,
                "duration": meta["processed_duration"],
                "sample_rate": meta["sampling_rate"],
                "sample_count": meta["sample_count"],
                "channels": meta["channels"],
                "dominant_frequency": analysis["dominant_frequency"],
                "dominant_band": analysis["dominant_band"],
                "est_dba": analysis["est_dba"],
                "noise_category": analysis["noise_info"]["category"],
                "noise_status": analysis["noise_info"]["status"],
                "rms": analysis["rms"],
                "window_type": analysis["window_type"],
                "peak_count": analysis["peak_count"],
                "top_peaks": analysis["top_peaks"],
                "band_distribution": analysis["band_distribution"],
                "waveform": analysis["waveform"],
                "spectrum": analysis["spectrum"],
                "notes": request.form.get("notes", "")
            })

        return jsonify({
            "success": True,
            "id": saved_id,
            "audio_url": audio_url,
            "metadata": meta,
            "analysis": analysis
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Signal processing failed: {str(e)}"}), 500

@app.route("/api/audio/<filename>", methods=["GET"])
def get_audio_file(filename):
    """
    Stream audio file for preview and playback in browser.
    """
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/api/history", methods=["GET"])
def list_history():
    search = request.args.get("search", "").strip() or None
    category = request.args.get("category", "").strip() or None
    limit = int(request.args.get("limit", 100))
    records = get_all_analyses(search=search, category=category, limit=limit)
    return jsonify({"success": True, "records": records, "count": len(records)})

@app.route("/api/history/<int:record_id>", methods=["GET"])
def get_history_detail(record_id):
    record = get_analysis_by_id(record_id)
    if not record:
        return jsonify({"error": "Analysis record not found."}), 404
    return jsonify({"success": True, "record": record})

@app.route("/api/history/<int:record_id>", methods=["DELETE"])
def delete_history_record(record_id):
    success = delete_analysis(record_id)
    if not success:
        return jsonify({"error": "Failed to delete record or record not found."}), 404
    return jsonify({"success": True, "message": f"Record {record_id} deleted."})

@app.route("/api/statistics", methods=["GET"])
def get_statistics():
    stats = get_system_statistics()
    return jsonify({"success": True, "statistics": stats})

@app.route("/api/compare", methods=["POST"])
def compare_recordings():
    """
    Comparison Module:
    Accepts list of IDs [id1, id2, ...] and returns comparative spectral and acoustic metrics.
    """
    data = request.get_json() or {}
    ids = data.get("ids", [])
    if len(ids) < 2:
        return jsonify({"error": "Please select at least two recordings to compare."}), 400

    comparisons = []
    for rec_id in ids:
        rec = get_analysis_by_id(rec_id)
        if rec:
            comparisons.append({
                "id": rec["id"],
                "title": rec["title"],
                "filename": rec["filename"],
                "dominant_frequency": rec["dominant_frequency"],
                "dominant_band": rec["dominant_band"],
                "est_dba": rec["est_dba"],
                "noise_category": rec["noise_category"],
                "sample_rate": rec["sample_rate"],
                "duration": rec["duration"],
                "top_peaks": rec["top_peaks"],
                "band_distribution": rec["band_distribution"],
                "spectrum": rec["spectrum"]
            })

    if len(comparisons) < 2:
        return jsonify({"error": "Could not find sufficient records for comparison."}), 404

    # Compute comparative insights
    dom_freqs = [c["dominant_frequency"] for c in comparisons]
    dbas = [c["est_dba"] for c in comparisons]

    insights = {
        "dominant_freq_diff": round(abs(dom_freqs[0] - dom_freqs[1]), 2),
        "dba_diff": round(abs(dbas[0] - dbas[1]), 1),
        "higher_freq_recording": comparisons[0]["title"] if dom_freqs[0] > dom_freqs[1] else comparisons[1]["title"],
        "louder_recording": comparisons[0]["title"] if dbas[0] > dbas[1] else comparisons[1]["title"]
    }

    return jsonify({
        "success": True,
        "comparisons": comparisons,
        "insights": insights
    })

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # Don't intercept API routes
    if path.startswith("api/"):
        return jsonify({"error": "API route not found"}), 404
        
    if os.path.exists(FRONTEND_DIST):
        target_file = os.path.join(FRONTEND_DIST, path)
        if path != "" and os.path.exists(target_file) and not os.path.isdir(target_file):
            return send_from_directory(FRONTEND_DIST, path)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return send_from_directory(FRONTEND_DIST, "index.html")
            
    return jsonify({
        "service": "AcuFourier API Server",
        "message": "Frontend build not detected. Please run 'cd frontend && npm run build' or start Vite dev server."
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
