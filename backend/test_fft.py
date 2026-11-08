import numpy as np
import scipy.io.wavfile as wavfile
import os
from audio_processor import process_audio_pipeline, compute_fft_analysis

def test_known_signal():
    sr = 44100
    duration = 2.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    
    # Generate synthetic signal:
    # 440 Hz tone (amplitude 0.8) + 1200 Hz tone (amplitude 0.4) + small DC offset 0.1
    f1, f2 = 440.0, 1200.0
    signal = 0.7 * np.sin(2 * np.pi * f1 * t) + 0.3 * np.sin(2 * np.pi * f2 * t)
    # Ensure no clipping when converting to 16-bit PCM WAV
    signal = signal / np.max(np.abs(signal)) * 0.9
    
    # Save test wav
    test_file = "test_synth_440_1200.wav"
    wavfile.write(test_file, sr, (signal * 32767).astype(np.int16))
    
    try:
        result = process_audio_pipeline(test_file, {
            "normalize": True,
            "remove_dc": True,
            "window_type": "hann"
        })
        
        meta = result["metadata"]
        analysis = result["analysis"]
        dom_freq = analysis["dominant_frequency"]
        top_peaks = analysis["top_peaks"]
        
        print("=== TEST RESULTS ===")
        print(f"Sampling rate: {meta['sampling_rate']} Hz")
        print(f"Duration: {meta['processed_duration']} s")
        print(f"Sample count: {meta['sample_count']}")
        print(f"Dominant Frequency detected: {dom_freq} Hz (Expected ~440 Hz)")
        print("Top detected peaks:")
        for p in top_peaks:
            print(f"  Rank {p['rank']}: {p['frequency_hz']} Hz (Mag: {p['magnitude']}, Band: {p['band']})")
            
        assert abs(dom_freq - 440.0) < 1.0, f"Dominant frequency error too large: {dom_freq}"
        assert any(abs(p['frequency_hz'] - 1200.0) < 2.0 for p in top_peaks), "1200 Hz harmonic not found in top peaks!"
        print(">>> FFT MATHEMATICAL ACCURACY VERIFICATION PASSED! <<<")
        
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == "__main__":
    test_known_signal()
