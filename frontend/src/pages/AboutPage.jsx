import React from 'react';
import {
  BookOpen,
  Award,
  Layers,
  Cpu,
  Activity,
  Mic,
  Gauge,
  CheckCircle2,
  ExternalLink,
  Code2,
  Workflow
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function AboutPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title & Banner */}
      <div
        className="glass-card"
        style={{
          padding: '36px 40px',
          background: 'linear-gradient(135deg, rgba(13, 18, 36, 0.8) 0%, rgba(22, 33, 62, 0.6) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)'
        }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          fontSize: '0.8rem',
          color: '#38bdf8',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          <Award size={14} />
          <span>COURSE OUTCOME CO4 • APPLIED MATHEMATICS</span>
        </div>

        <h1 style={{
          fontSize: '2.1rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          lineHeight: 1.25,
          margin: '0 0 14px'
        }}>
          Smart Noise Pollution Monitoring and Frequency Analysis System Using Fourier Transform
        </h1>

        <p style={{
          fontSize: '1.05rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '920px',
          margin: 0
        }}>
          This capstone project investigates and analyzes environmental acoustic pollution through <strong>Discrete Fourier Transform (DFT)</strong> techniques.
          By transforming physical sound pressure waves from the continuous time domain into the discrete frequency domain, the system enables high-precision identification of dominant harmonic peaks, spectral leakage mitigation, and quantitative noise level classification.
        </p>
      </div>

      {/* The 3 Core Modules Breakdown */}
      <GlassCard title="Three Main Engineering & Mathematical Modules" icon={Workflow}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Module 1 */}
          <div style={{
            padding: '22px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mic size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Module 1: Audio Data Collection & Preprocessing
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Captures live acoustic pressure waves via the browser's Web Audio API / MediaDevices or processes uploaded WAV and MP3 recordings.
              Applies multi-channel to mono averaging, removes DC bias offset \(x[n] - \mu\), performs amplitude peak normalization, and extracts sampling parameters (\(f_s\), \(N\)).
            </p>
          </div>

          {/* Module 2 */}
          <div style={{
            padding: '22px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Module 2: Fourier Transform Frequency Analysis (CO4)
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Executes Fast Fourier Transform (FFT) algorithms using NumPy and SciPy. Computes the complex spectrum \(X[k]\), linear and decibel magnitude spectra \(|X[k]|\), applies Hann/Hamming window functions to curtail spectral leakage, and detects the top 5 dominant harmonic peaks with sub-Hertz accuracy.
            </p>
          </div>

          {/* Module 3 */}
          <div style={{
            padding: '22px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Gauge size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Module 3: Noise Monitoring & Visualization
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Calculates equivalent continuous sound pressure levels (\(L_{eq}\) in dBA) based on calibrated RMS energy, evaluates environmental compliance with WHO guidelines, graphs band energy distributions, supports multi-recording spectral comparisons, and generates downloadable PDF reports.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Real-World Practical Applications */}
      <GlassCard title="Real-World Practical Applications" icon={Layers}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            {
              title: 'Environmental Noise Monitoring',
              desc: 'Tracking ambient acoustic levels in residential zones, parks, and hospital surroundings against city municipal bylaws.'
            },
            {
              title: 'Traffic & Vehicle Noise Analysis',
              desc: 'Isolating low-frequency exhaust rumblings (80-200 Hz) vs. high-frequency brake squeals (3-8 kHz) in smart traffic intersections.'
            },
            {
              title: 'Industrial Sound & Machine Health',
              desc: 'Detecting bearing wear, turbine imbalance, and motor friction via harmonic peak displacement in manufacturing plants.'
            },
            {
              title: 'Educational Signal Processing',
              desc: 'Interactive mathematical testbed for engineering students exploring windowing, Nyquist limits, and spectral leakage.'
            },
            {
              title: 'Urban Acoustic Zoning',
              desc: 'Evaluating noise contours for architecture, highway acoustic barrier design, and residential development planning.'
            },
            {
              title: 'Workplace Occupational Safety',
              desc: 'Monitoring sustained worker exposure to noise hazards above OSHA 85 dBA thresholds to prevent hearing damage.'
            }
          ].map((app) => (
            <div
              key={app.title}
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--card-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 600, fontSize: '0.92rem' }}>
                <CheckCircle2 size={16} />
                <span>{app.title}</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                {app.desc}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Technology Architecture & Mathematics Overview */}
      <GlassCard title="System Architecture & Technology Stack" icon={Code2}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.88rem' }}>
          <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--card-border)' }}>
            <h4 style={{ color: '#38bdf8', marginBottom: '8px' }}>Frontend Layer</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li>• React.js 19 Single Page Application</li>
              <li>• Apple-inspired Glassmorphism UI & Blurred Mesh Orbs</li>
              <li>• Recharts & HTML5 Canvas Oscilloscope Visualizer</li>
              <li>• Web Audio API & MediaDevices Microphone Stream</li>
              <li>• jsPDF Dynamic Technical Report Engine</li>
            </ul>
          </div>

          <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--card-border)' }}>
            <h4 style={{ color: '#06b6d4', marginBottom: '8px' }}>Backend & Math Engine</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li>• Python Flask REST API with Flask-CORS</li>
              <li>• NumPy Cooley-Tukey Real FFT (rfft, rfftfreq)</li>
              <li>• SciPy Signal Processing (find_peaks, windowing)</li>
              <li>• SoundFile & Librosa Multi-format Audio Ingestion</li>
              <li>• Decibel Full Scale (dBFS) & dBA SPL Modeling</li>
            </ul>
          </div>

          <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--card-border)' }}>
            <h4 style={{ color: '#10b981', marginBottom: '8px' }}>Database & Storage</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li>• SQLite Embedded Relational Database</li>
              <li>• Persistent Spectral & Waveform JSON Serialization</li>
              <li>• Audio File Storage with Streaming Endpoints</li>
              <li>• Multi-recording Comparative Metric Delta Engine</li>
              <li>• 100% Deterministic Mathematical Computations</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

