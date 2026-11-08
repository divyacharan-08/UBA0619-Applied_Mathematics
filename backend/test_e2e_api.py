import sys
import os
import json
import io
import numpy as np
import scipy.io.wavfile as wavfile

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import app

def test_full_application():
    print(">>> Starting Comprehensive End-to-End API Test Suite <<<")
    client = app.test_client()

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    health_data = res.get_json()
    print("✓ Health Check Passed:", health_data["service"], f"(Records: {health_data['records_count']})")

    # 2. Statistics
    res = client.get("/api/statistics")
    assert res.status_code == 200
    stats = res.get_json()["statistics"]
    print("✓ Statistics Check Passed: Total Analyses =", stats["total_analyses"], f"Avg dBA = {stats['avg_dba']}")

    # 3. History List
    res = client.get("/api/history")
    assert res.status_code == 200
    records = res.get_json()["records"]
    assert len(records) > 0, "No records returned in history!"
    print(f"✓ History Check Passed: {len(records)} pre-seeded sample recordings available.")
    for r in records[:3]:
        print(f"   • [{r['id']}] {r['title']} - {r['dominant_frequency']} Hz ({r['dominant_band']}) - {r['est_dba']} dBA")

    # 4. History Detail
    first_id = records[0]["id"]
    res = client.get(f"/api/history/{first_id}")
    assert res.status_code == 200
    detail = res.get_json()["record"]
    assert "top_peaks" in detail and "waveform" in detail and "spectrum" in detail
    print(f"✓ History Detail Passed for #{first_id}: {len(detail['top_peaks'])} peaks, {len(detail['spectrum'])} spectral bins.")

    # 5. Multi-recording Comparison
    if len(records) >= 2:
        res = client.post("/api/compare", json={"ids": [records[0]["id"], records[1]["id"]]})
        assert res.status_code == 200
        comp = res.get_json()
        print(f"✓ Comparison Passed: Freq Delta = {comp['insights']['dominant_freq_diff']} Hz, dBA Delta = {comp['insights']['dba_diff']} dBA.")

    # 6. Audio Upload & Live Signal Preprocessing + FFT
    # Create test 1-second 500 Hz tone
    sr = 44100
    t = np.linspace(0, 1.0, sr, endpoint=False)
    test_wave = (0.85 * np.sin(2 * np.pi * 500.0 * t) * 32767).astype(np.int16)
    wav_bytes = io.BytesIO()
    wavfile.write(wav_bytes, sr, test_wave)
    wav_bytes.seek(0)

    data = {
        "title": "E2E Unit Test 500Hz Sine",
        "audio": (wav_bytes, "e2e_test_500hz.wav"),
        "normalize": "true",
        "remove_dc": "true",
        "window_type": "hann",
        "save_to_db": "true"
    }

    res = client.post("/api/analyze", data=data, content_type="multipart/form-data")
    assert res.status_code == 200, f"Analyze failed: {res.status_code} {res.get_data(as_text=True)}"
    analysis_res = res.get_json()
    dom_f = analysis_res["analysis"]["dominant_frequency"]
    print(f"✓ Analyze Endpoint Passed: Detected {dom_f} Hz (Expected 500.0 Hz).")
    assert abs(dom_f - 500.0) < 1.0, f"Detected frequency deviation: {dom_f}"

    # 7. Frontend Static Serving
    res = client.get("/")
    assert res.status_code == 200, f"Frontend root failed: {res.status_code}"
    html_text = res.get_data(as_text=True)
    assert "<!doctype html>" in html_text.lower() or "acufourier" in html_text.lower()
    print("✓ Frontend Static Serving Passed: React single-page app served from '/'")

    print("\n>>> ALL 7 END-TO-END TESTS COMPLETED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    test_full_application()

