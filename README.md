# Smart Noise Pollution Monitoring and Frequency Analysis System Using Fourier Transform
**Applied Mathematics Capstone Project • Course Outcome: CO4 (Fourier Transform)**

![AcuFourier UI](https://img.shields.io/badge/Design-Apple_Glassmorphism-38bdf8?style=flat-square)
![Fourier Transform](https://img.shields.io/badge/Mathematics-CO4_Fourier_Transform-06b6d4?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React_19_+_Flask_+_NumPy-10b981?style=flat-square)
![License](https://img.shields.io/badge/Project-Capstone_Evaluation-f59e0b?style=flat-square)

---

## 1. Project Overview & Course Outcome (CO4)

**AcuFourier** is a full-stack, mathematical web application designed to demonstrate the practical implementation of the **Fourier Transform (CO4)** through environmental audio analysis and noise pollution monitoring.

Sound in the environment consists of complex, multi-source acoustic pressure waves $x(t)$. While the human ear perceives loudness and pitch simultaneously, mathematical analysis requires decomposing these superpositions into their constituent orthogonal harmonic frequencies. 

This application bridges continuous mathematical theory with digital signal processing:
- **Continuous Fourier Transform (CFT):**
  $$X(f) = \int_{-\infty}^{\infty} x(t) e^{-j 2\pi f t} \, dt$$
- **Discrete Fourier Transform (DFT):**
  $$X[k] = \sum_{n=0}^{N-1} x[n] e^{-j \frac{2\pi k n}{N}}$$
- **Fast Fourier Transform (Cooley-Tukey FFT):**
  Reduces computational complexity from $O(N^2)$ to $O(N \log N)$, enabling real-time environmental noise diagnostics.

---

## 2. System Architecture & The Three Core Modules

```
                      ┌────────────────────────────────────────┐
                      │    Microphone Stream / Audio Upload    │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │   MODULE 1: Signal Preprocessing       │
                      │  • Multi-channel to Mono averaging     │
                      │  • DC Bias Offset Removal (x[n] - μ)   │
                      │  • Peak Amplitude Normalization        │
                      │  • Window Function (Hann / Hamming)    │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │   MODULE 2: Fourier Analysis (CO4)     │
                      │  • NumPy Cooley-Tukey Real FFT (rfft)  │
                      │  • Magnitude Spectrum |X[k]| & dBFS    │
                      │  • SciPy Prominence Peak Detection     │
                      │  • Top 5 Dominant Frequencies & Bands  │
                      └───────────────────┬────────────────────┘
                                          │
                                          ▼
                      ┌────────────────────────────────────────┐
                      │   MODULE 3: Noise Monitoring & UI      │
                      │  • Equivalent Sound Level (Leq / dBA)  │
                      │  • WHO / OSHA Noise Hazard Category    │
                      │  • Acoustic Band Energy Distribution   │
                      │  • Multi-Recording Spectral Comparison │
                      │  • PDF Technical Report Generation     │
                      │  • SQLite Persistent History Archive   │
                      └────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
- **Framework:** React.js 19 (Vite 8.3 build tool)
- **Design System:** Apple-inspired Glassmorphism with `backdrop-filter: blur(20px)`, dark navy palette, electric blue/cyan accents, and floating blurred gradient orbs
- **Visualization:** Recharts & HTML5 Canvas Oscilloscope Visualizer
- **Icons:** Lucide React
- **Audio Capture:** Web Audio API (`AudioContext`, `AnalyserNode`, `ScriptProcessorNode`) with 16-bit PCM WAV encoding
- **Report Generation:** jsPDF technical report builder

### Backend
- **Framework:** Python Flask with Flask-CORS
- **Mathematical Signal Engine:** NumPy & SciPy (`np.fft.rfft`, `np.fft.rfftfreq`, `scipy.signal.find_peaks`)
- **Audio Codecs:** SoundFile, Librosa, and SciPy WAV
- **Database:** SQLite (`analysis_history.db`)

---

## 4. Application Pages & Features

1. **Dashboard:**
   - Hero: *"Understand the Sound Around You. Transform environmental audio into meaningful frequency insights."*
   - Real-time statistics: Total analyses, average dominant frequency, maximum dBA, average sound level.
   - Quick navigation cards to all modules.
   - Recent recordings list with quick-open.
2. **Audio Recording (Module 1):**
   - Accesses microphone via MediaDevices API.
   - Live oscilloscope waveform rendering on HTML5 Canvas.
   - Recording timer (MM:SS), pause, resume, and stop controls.
   - Audio playback preview.
   - Configurable preprocessing: DC offset removal, amplitude normalization, window selection.
3. **Audio Upload (Module 1):**
   - Drag-and-drop file upload for WAV, MP3, FLAC, and OGG files.
   - Displays filename, file size, duration, format, and channel count.
   - Audio playback controls.
   - Interactive segment selection and trimming (start/end seconds).
4. **Frequency Analysis (Module 2 - CO4 Core):**
   - NumPy/SciPy FFT calculated magnitude spectrum.
   - Top 5 Dominant Frequencies table with exact Hz, linear magnitude, dBFS level, relative strength, and acoustic band.
   - Zoom presets: Full (0-20kHz), Bass (20-300Hz), Midrange (250-4kHz), Treble (4k-20kHz).
   - Magnitude scale toggle: Linear $|X(f)|$ vs Decibels (dBFS).
   - Window selector (Hann, Hamming, Blackman, Rectangular) to observe spectral leakage mitigation in real time.
   - Comprehensive Mathematical Information Panel with continuous and discrete FT formulas and CO4 explanations.
5. **Noise Monitoring (Module 3):**
   - 5 Required Metric Cards: Duration, Sampling Rate ($f_s$), Dominant Frequency, Detected Peaks, and Sound Level (dBA).
   - WHO Environmental Noise Health Assessment Banner.
   - **Graph A:** Time-Domain Audio Waveform (Amplitude vs Time).
   - **Graph B:** Frequency Spectrum ($|X(f)|$ vs Hz) with dominant peaks.
   - **Graph C:** Acoustic Band Energy Distribution across standardized acoustic bands (Sub-bass, Bass, Low-Mid, Midrange, High-Mid, Treble).
   - **Section E:** Comprehensive Analysis Report with one-click PDF export.
   - Recording comparison trigger.
6. **Analysis History:**
   - Persistent SQLite database archive.
   - Search by title, filename, or band; filter by WHO noise category.
   - Multi-record selection and comparative spectral analysis.
   - Open previous records or delete records.
7. **About Project:**
   - Academic documentation of CO4 (Fourier Transform).
   - Description of the 3 modules, mathematical equations, and real-world applications (environmental noise, traffic, industrial diagnostics).

---

## 5. Installation & Setup Instructions

### Prerequisites
- **Python 3.10+** (tested on Python 3.12)
- **Node.js v18+** (for frontend development/builds)

### Quick Start (Single Command)

1. Clone or navigate to the project directory:
   ```bash
   cd e:\Capstone\Applied
   ```

2. Run the application:
   ```bash
   python run.py
   ```
   *The script automatically launches the Flask server on `http://127.0.0.1:5000` and opens your default web browser.*

---

## 6. Development Mode (Optional)

If you wish to run the backend and frontend separately in development mode:

### Terminal 1: Backend API
```bash
python -m pip install -r backend/requirements.txt
python backend/app.py
```
*Backend runs on `http://127.0.0.1:5000`.*

### Terminal 2: Frontend Vite Dev Server
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000` with automated API proxying to `http://127.0.0.1:5000`.*

---

## 7. Verification & Automated Test Suites

The project includes two automated test suites to verify mathematical correctness and end-to-end API integrity:

### 1. Mathematical FFT Accuracy Test
Verifies that pure synthetic frequencies (440 Hz standard concert A4 + 1200 Hz harmonic) are resolved by the Fourier Transform pipeline with sub-Hertz precision:
```bash
python backend/test_fft.py
```
**Expected Output:**
```
=== TEST RESULTS ===
Sampling rate: 44100 Hz
Duration: 2.0 s
Dominant Frequency detected: 440.0 Hz (Expected ~440 Hz)
Top detected peaks:
  Rank 1: 440.0 Hz (Mag: 0.70072, Band: Low-Mid)
  Rank 2: 1200.0 Hz (Mag: 0.30031, Band: Midrange)
>>> FFT MATHEMATICAL ACCURACY VERIFICATION PASSED! <<<
```

### 2. End-to-End API Test Suite
Tests health check, statistics, SQLite database operations, multi-recording comparison, and live audio analysis upload:
```bash
python backend/test_e2e_api.py
```
**Expected Output:**
```
>>> ALL 7 END-TO-END TESTS COMPLETED WITH 100% SUCCESS! <<<
```

