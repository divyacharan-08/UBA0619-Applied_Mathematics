import os
import math
import json
import numpy as np
import scipy.signal
import soundfile as sf
import scipy.io.wavfile as wavfile

try:
    import librosa
    HAS_LIBROSA = True
except ImportError:
    HAS_LIBROSA = False

ACOUSTIC_BANDS = [
    {"name": "Sub-Bass", "min": 20, "max": 60, "desc": "Deep rumbles, structural vibration, thunder"},
    {"name": "Bass", "min": 60, "max": 250, "desc": "Engines, heavy traffic, HVAC systems, bass rhythm"},
    {"name": "Low-Mid", "min": 250, "max": 500, "desc": "Lower human speech, tires on asphalt, vehicle hum"},
    {"name": "Midrange", "min": 500, "max": 2000, "desc": "Human speech, horns, household appliances"},
    {"name": "High-Mid", "min": 2000, "max": 4000, "desc": "Siren harmonics, mechanical whine, speech intelligibility"},
    {"name": "Treble", "min": 4000, "max": 20000, "desc": "Brake squeals, hissing steam, bird chirps, high harmonics"}
]

def classify_frequency_band(freq_hz):
    for band in ACOUSTIC_BANDS:
        if band["min"] <= freq_hz < band["max"]:
            return band["name"]
    if freq_hz < 20:
        return "Infrasound (<20 Hz)"
    return "Ultrasound (>20 kHz)"

def classify_noise_level(est_dba):
    """
    Environmental noise pollution classification based on WHO / OSHA guidelines.
    """
    if est_dba < 45.0:
        return {
            "category": "Quiet / Serene",
            "color": "#34d399", # Emerald green
            "status": "Safe",
            "desc": "Quiet natural or indoor environment (whisper, quiet library, calm bedroom)."
        }
    elif est_dba < 60.0:
        return {
            "category": "Moderate / Comfortable",
            "color": "#38bdf8", # Sky blue
            "status": "Normal",
            "desc": "Typical conversational speech, air conditioning, ambient residential area."
        }
    elif est_dba < 75.0:
        return {
            "category": "Elevated / Urban Noise",
            "color": "#facc15", # Amber yellow
            "status": "Elevated",
            "desc": "Busy street traffic, loud restaurant, vacuum cleaner. Noticeable distraction."
        }
    elif est_dba < 85.0:
        return {
            "category": "Loud / High Pollution",
            "color": "#fb923c", # Orange
            "status": "Warning",
            "desc": "Heavy city traffic, power lawnmower, construction noise. Potential stress factor."
        }
    else:
        return {
            "category": "Hazardous / Hearing Risk",
            "color": "#f87171", # Red
            "status": "Critical",
            "desc": "Factory machinery, sirens, heavy construction (>85 dBA). Prolonged exposure risks hearing impairment."
        }

def load_audio_file(file_path):
    """
    Loads an audio file into numpy array (samples, sr) with multiple fallback engines.
    """
    errors = []
    
    # 1. Try soundfile
    try:
        data, sr = sf.read(file_path)
        return data, sr
    except Exception as e:
        errors.append(f"soundfile: {e}")
        
    # 2. Try librosa if available
    if HAS_LIBROSA:
        try:
            data, sr = librosa.load(file_path, sr=None, mono=False)
            if data.ndim > 1:
                data = data.T  # Transpose to (samples, channels)
            return data, sr
        except Exception as e:
            errors.append(f"librosa: {e}")
            
    # 3. Try scipy.io.wavfile
    try:
        sr, data = wavfile.read(file_path)
        if data.dtype == np.int16:
            data = data.astype(np.float32) / 32768.0
        elif data.dtype == np.int32:
            data = data.astype(np.float32) / 2147483648.0
        elif data.dtype == np.uint8:
            data = (data.astype(np.float32) - 128.0) / 128.0
        return data, sr
    except Exception as e:
        errors.append(f"scipy.io.wavfile: {e}")
        
    raise RuntimeError(f"Could not load audio file {os.path.basename(file_path)}. Errors: {'; '.join(errors)}")

def preprocess_signal(data, sr, normalize=True, remove_dc=True, start_time=None, end_time=None):
    """
    Signal Preprocessing:
    - Multi-channel to Mono
    - Segment Trimming (start_time, end_time in seconds)
    - DC Offset Removal: x[n] = x[n] - mean(x)
    - Amplitude Normalization: x[n] = x[n] / max(|x|)
    """
    # 1. Convert to Mono
    if data.ndim > 1:
        mono_signal = np.mean(data, axis=1)
        channels = data.shape[1]
    else:
        mono_signal = data.copy()
        channels = 1
        
    mono_signal = mono_signal.astype(np.float64)
    total_samples = len(mono_signal)
    total_duration = total_samples / sr
    
    # 2. Segment selection
    start_idx = 0
    end_idx = total_samples
    if start_time is not None and start_time >= 0:
        start_idx = max(0, int(start_time * sr))
    if end_time is not None and end_time > 0:
        end_idx = min(total_samples, int(end_time * sr))
        
    if start_idx >= end_idx or end_idx - start_idx < 64:
        start_idx = 0
        end_idx = total_samples

    segment = mono_signal[start_idx:end_idx]
    
    # 3. Remove DC Offset
    dc_offset = float(np.mean(segment))
    if remove_dc:
        segment = segment - dc_offset
        
    # 4. Amplitude Normalization
    peak_val = float(np.max(np.abs(segment)))
    if normalize and peak_val > 1e-8:
        segment = segment / peak_val
        
    return segment, channels, total_duration, start_idx / sr, end_idx / sr

def compute_fft_analysis(signal, sr, window_type="hann", max_peaks=5):
    """
    Calculates Discrete Fourier Transform using NumPy's Cooley-Tukey Real FFT (rfft).
    Applies the chosen window function to mitigate spectral leakage.
    Identifies dominant peaks with exact frequencies and magnitudes.
    """
    N = len(signal)
    if N < 32:
        raise ValueError("Audio signal is too short for Fourier Transform analysis (minimum 32 samples).")

    # 1. Window Function Selection
    window_type = window_type.lower()
    if window_type == "hann":
        window = np.hanning(N)
        coherent_gain = 0.5
    elif window_type == "hamming":
        window = np.hamming(N)
        coherent_gain = 0.54
    elif window_type == "blackman":
        window = np.blackman(N)
        coherent_gain = 0.42
    elif window_type == "bartlett":
        window = np.bartlett(N)
        coherent_gain = 0.5
    else:
        window = np.ones(N) # Rectangular (no window)
        coherent_gain = 1.0

    windowed_signal = signal * window

    # 2. Real-valued FFT: X[k] = sum_{n=0}^{N-1} x[n] * exp(-j * 2*pi * k * n / N)
    fft_complex = np.fft.rfft(windowed_signal)
    freqs = np.fft.rfftfreq(N, d=1.0 / sr)

    # 3. Magnitude Spectrum calculation (normalized with window coherent gain)
    # Factor of 2 compensates for single-sided spectrum (frequencies > 0)
    magnitude = (2.0 / (N * coherent_gain)) * np.abs(fft_complex)
    magnitude[0] = magnitude[0] / 2.0  # DC bin is not doubled

    # Convert to decibels relative to full scale (dBFS)
    eps = 1e-9
    magnitude_db = 20.0 * np.log10(np.maximum(magnitude, eps))

    # 4. Dominant Frequency and Peak Detection using scipy.signal
    # Prominence prevents noise floor ripples from being misidentified as true harmonic peaks
    max_mag = float(np.max(magnitude))
    peak_indices = []
    
    if max_mag > eps:
        min_height = 0.02 * max_mag
        min_distance = max(1, int(N / sr * 5))  # Minimum 5 Hz apart
        peaks, properties = scipy.signal.find_peaks(
            magnitude,
            height=min_height,
            distance=min_distance,
            prominence=0.01 * max_mag
        )
        if len(peaks) > 0:
            # Sort peaks by magnitude descending
            sorted_indices = np.argsort(magnitude[peaks])[::-1]
            peak_indices = peaks[sorted_indices].tolist()

    # If peak detection missed or signal is pure tone, ensure argmax is included
    global_max_idx = int(np.argmax(magnitude[1:])) + 1 if len(magnitude) > 1 else 0
    if global_max_idx not in peak_indices:
        peak_indices.insert(0, global_max_idx)

    dominant_idx = peak_indices[0] if peak_indices else global_max_idx
    dominant_frequency = float(freqs[dominant_idx])
    dominant_magnitude = float(magnitude[dominant_idx])

    # Extract Top N Dominant Peaks with acoustic annotations
    top_peaks = []
    for rank, p_idx in enumerate(peak_indices[:max_peaks], 1):
        freq_val = float(freqs[p_idx])
        mag_val = float(magnitude[p_idx])
        mag_db_val = float(magnitude_db[p_idx])
        rel_strength = (mag_val / max_mag * 100.0) if max_mag > 0 else 0.0
        
        top_peaks.append({
            "rank": rank,
            "frequency_hz": round(freq_val, 2),
            "magnitude": round(mag_val, 5),
            "magnitude_db": round(mag_db_val, 2),
            "relative_percent": round(rel_strength, 1),
            "band": classify_frequency_band(freq_val)
        })

    # 5. Acoustic Band Energy Distribution
    band_distribution = []
    total_energy = float(np.sum(magnitude ** 2))
    for band in ACOUSTIC_BANDS:
        mask = (freqs >= band["min"]) & (freqs < band["max"])
        if np.any(mask):
            band_energy = float(np.sum(magnitude[mask] ** 2))
        else:
            band_energy = 0.0
            
        share = (band_energy / total_energy * 100.0) if total_energy > 0 else 0.0
        band_distribution.append({
            "name": band["name"],
            "range": f"{band['min']}-{band['max']} Hz",
            "energy": round(band_energy, 4),
            "percentage": round(share, 2),
            "desc": band["desc"]
        })

    # 6. Sound Level (RMS & Estimated SPL dBA)
    rms = float(np.sqrt(np.mean(signal ** 2)))
    db_fs = 20.0 * math.log10(max(rms, 1e-6))
    # Calibrated mapping from normalized digital full scale audio to dBA SPL
    # 0 dBFS corresponds to ~100 dBA (extremely loud sound at mic clipping threshold)
    est_dba = round(float(np.clip(db_fs + 100.0, 25.0, 115.0)), 1)
    noise_info = classify_noise_level(est_dba)

    # 7. Generate Downsampled Data for High-Performance UI Visualization
    # Downsample time-domain waveform to ~600 points
    target_wave_pts = 600
    if len(signal) > target_wave_pts:
        step = len(signal) / target_wave_pts
        wave_pts = []
        for i in range(target_wave_pts):
            chunk = signal[int(i * step):int((i + 1) * step)]
            if len(chunk) > 0:
                t = round((i * step) / sr, 3)
                wave_pts.append({
                    "time": t,
                    "amplitude": round(float(chunk[np.argmax(np.abs(chunk))]), 4)
                })
    else:
        wave_pts = [
            {"time": round(i / sr, 3), "amplitude": round(float(signal[i]), 4)}
            for i in range(len(signal))
        ]

    # Downsample Frequency Spectrum for Smooth UI Plotting (~600 points)
    # Ensure audible band 20 Hz to 20,000 Hz is well-represented
    target_spec_pts = 600
    spec_pts = []
    
    # We create non-linear or segmented sampling so low-mid frequencies have high resolution
    freq_limit = min(float(freqs[-1]), 20000.0)
    limit_idx = int(np.searchsorted(freqs, freq_limit))
    
    if limit_idx > target_spec_pts:
        indices = np.linspace(0, limit_idx - 1, target_spec_pts, dtype=int)
        # Always inject dominant peak indices so peaks are crisp and exact!
        for p in peak_indices[:max_peaks]:
            if p < limit_idx:
                indices = np.append(indices, p)
        indices = np.unique(indices)
        indices.sort()
    else:
        indices = np.arange(limit_idx)

    for idx in indices:
        f_val = float(freqs[idx])
        m_val = float(magnitude[idx])
        m_db_val = float(magnitude_db[idx])
        spec_pts.append({
            "frequency": round(f_val, 1),
            "magnitude": round(m_val, 5),
            "magnitude_db": round(m_db_val, 2),
            "is_peak": bool(idx in peak_indices[:max_peaks])
        })

    # 8. Short-Time Fourier Transform (STFT) Spectrogram Computation (Time vs Frequency vs Power)
    spectrogram_data = None
    try:
        nperseg = min(1024, max(128, N // 24))
        noverlap = nperseg // 2
        f_spec, t_spec, Sxx = scipy.signal.spectrogram(
            signal,
            fs=sr,
            window='hann',
            nperseg=nperseg,
            noverlap=noverlap
        )
        max_f_idx = int(np.searchsorted(f_spec, 8000.0))
        if max_f_idx > 0:
            f_sub = f_spec[:max_f_idx]
            Sxx_sub = Sxx[:max_f_idx, :]
            Sxx_db = 10.0 * np.log10(np.maximum(Sxx_sub, 1e-10))
            min_db = float(np.min(Sxx_db))
            max_db = float(np.max(Sxx_db))
            
            t_indices = np.linspace(0, len(t_spec) - 1, min(40, len(t_spec)), dtype=int)
            f_indices = np.linspace(0, len(f_sub) - 1, min(20, len(f_sub)), dtype=int)
            
            matrix = []
            for fi in f_indices:
                row = []
                f_val = round(float(f_sub[fi]), 1)
                for ti in t_indices:
                    val = float(Sxx_db[fi, ti])
                    norm_val = round((val - min_db) / (max_db - min_db + 1e-6), 2)
                    row.append(norm_val)
                matrix.append({"frequency": f_val, "powers": row})
                
            spectrogram_data = {
                "times": [round(float(t_spec[ti]), 2) for ti in t_indices],
                "frequencies": [round(float(f_sub[fi]), 1) for fi in f_indices],
                "matrix": matrix
            }
    except Exception as e:
        print(f"Spectrogram notice: {e}")

    return {
        "dominant_frequency": round(dominant_frequency, 2),
        "dominant_magnitude": round(dominant_magnitude, 5),
        "dominant_band": classify_frequency_band(dominant_frequency),
        "top_peaks": top_peaks,
        "peak_count": len(peak_indices),
        "rms": round(rms, 5),
        "db_fs": round(db_fs, 2),
        "est_dba": est_dba,
        "noise_info": noise_info,
        "band_distribution": band_distribution,
        "waveform": wave_pts,
        "spectrum": spec_pts,
        "spectrogram": spectrogram_data,
        "window_type": window_type,
        "nyquist_frequency": sr / 2.0,
        "frequency_resolution": round(sr / N, 3)
    }

def generate_custom_signal(sig_type="sine", freq1=440.0, freq2=880.0, harmonic_count=4, duration=2.0, noise_level=0.05, sr=44100):
    """
    Mathematical Tone Generator for testing Fourier Series, harmonics, and synthetic noise.
    """
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    if sig_type == "sine":
        sig = np.sin(2 * np.pi * freq1 * t)
    elif sig_type == "dual":
        sig = 0.6 * np.sin(2 * np.pi * freq1 * t) + 0.4 * np.sin(2 * np.pi * freq2 * t)
    elif sig_type == "harmonics":
        sig = np.zeros_like(t)
        for h in range(1, harmonic_count + 1):
            sig += (1.0 / h) * np.sin(2 * np.pi * (freq1 * h) * t)
    elif sig_type == "square_fourier":
        sig = np.zeros_like(t)
        for k in range(1, harmonic_count + 1):
            n_odd = 2 * k - 1
            sig += (1.0 / n_odd) * np.sin(2 * np.pi * (n_odd * freq1) * t)
    elif sig_type == "chirp":
        sig = scipy.signal.chirp(t, f0=freq1, t1=duration, f1=freq2, method='linear')
    elif sig_type == "noise":
        sig = np.random.normal(0, 1.0, len(t))
    else:
        sig = np.sin(2 * np.pi * freq1 * t)
        
    if noise_level > 0:
        sig += np.random.normal(0, noise_level, len(t))
        
    peak = np.max(np.abs(sig))
    if peak > 0:
        sig = (sig / peak) * 0.90
        
    return sig, sr

def process_audio_pipeline(file_path, options=None):
    """
    End-to-end execution of Module 1 & Module 2:
    Loading, preprocessing, and FFT analysis.
    """
    if options is None:
        options = {}
        
    normalize = options.get("normalize", True)
    remove_dc = options.get("remove_dc", True)
    start_time = options.get("start_time", None)
    end_time = options.get("end_time", None)
    window_type = options.get("window_type", "hann")
    
    # 1. Load Audio
    raw_data, sr = load_audio_file(file_path)
    
    # 2. Preprocess Signal
    signal, channels, raw_duration, sel_start, sel_end = preprocess_signal(
        raw_data, sr,
        normalize=normalize,
        remove_dc=remove_dc,
        start_time=start_time,
        end_time=end_time
    )
    
    processed_duration = len(signal) / sr
    sample_count = len(signal)
    
    # 3. Compute Fourier Transform & Frequency Analysis
    fft_results = compute_fft_analysis(signal, sr, window_type=window_type)
    
    return {
        "metadata": {
            "filename": os.path.basename(file_path),
            "sampling_rate": sr,
            "sample_count": sample_count,
            "channels": channels,
            "raw_duration": round(raw_duration, 3),
            "processed_duration": round(processed_duration, 3),
            "start_time": round(sel_start, 3),
            "end_time": round(sel_end, 3),
            "dc_removed": remove_dc,
            "normalized": normalize
        },
        "analysis": fft_results
    }

