import React from 'react';
import GlassCard from './GlassCard';
import { BookOpen, Sigma, Cpu, Award } from 'lucide-react';

export default function MathPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* CO4 Mathematical Blueprint Banner */}
      <GlassCard
        title="Course Outcome (CO4) – Mathematical Foundation"
        subtitle="Practical implementation of Fourier Transform in environmental acoustic signal analysis"
        icon={Award}
      >
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
          In environmental acoustics, sound is transmitted through time-varying pressure oscillations <em>x(t)</em>.
          While the human ear perceives loudness and pitch simultaneously, physical audio transducers record a composite superposition of many vibrating sources.
          Through <strong>Course Outcome 4 (CO4)</strong>, we apply the <strong>Fourier Transform</strong> to decompose these complex time-domain waveforms into their constituent orthogonal sinusoidal components, extracting quantitative frequency and energy insights.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginTop: '12px'
        }}>
          {/* Continuous Fourier Transform Box */}
          <div style={{
            padding: '18px',
            borderRadius: '16px',
            background: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px', fontWeight: 600, fontSize: '0.88rem' }}>
              <Sigma size={16} />
              Continuous Fourier Transform (CFT)
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.05rem',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.35)',
              textAlign: 'center',
              letterSpacing: '0.04em',
              marginBottom: '10px'
            }}>
              X(f) = ∫ x(t) · e^(-j2πft) dt
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Maps an infinite continuous acoustic signal x(t) to a continuous frequency spectrum X(f) via the complex exponential basis e^(-j2πft).
            </p>
          </div>

          {/* Discrete Fourier Transform Box */}
          <div style={{
            padding: '18px',
            borderRadius: '16px',
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22d3ee', marginBottom: '8px', fontWeight: 600, fontSize: '0.88rem' }}>
              <Cpu size={16} />
              Discrete Fourier Transform (DFT)
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.05rem',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.35)',
              textAlign: 'center',
              letterSpacing: '0.04em',
              marginBottom: '10px'
            }}>
              X[k] = ∑ x[n] · e^(-j 2πkn / N)
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Digital computers evaluate sampled sound at N discrete points n = 0 ... N-1, yielding discrete frequency bin outputs at indices k = 0 ... N/2.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Deep-Dive Theory Concepts */}
      <GlassCard title="Signal Processing & Mathematical Components" icon={BookOpen}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
          {/* Concept 1 */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)'
          }}>
            <h4 style={{ fontSize: '0.92rem', color: '#38bdf8', marginBottom: '6px' }}>
              1. Time-Domain vs. Frequency-Domain
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              The <strong>time-domain</strong> waveform plots instantaneous sound pressure amplitude x[n] as a function of time t.
              The <strong>frequency-domain</strong> displays the spectral decomposition, detailing the precise distribution of harmonic energies across frequencies.
            </p>
          </div>

          {/* Concept 2 */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)'
          }}>
            <h4 style={{ fontSize: '0.92rem', color: '#38bdf8', marginBottom: '6px' }}>
              2. Sampling Theorem & Nyquist Limit
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              According to the <strong>Nyquist-Shannon sampling theorem</strong>, to avoid aliasing artifacts, the audio sampling frequency fs must be at least twice the maximum audible frequency:
              f_max ≤ f_Nyq = fs / 2. For fs = 44,100 Hz, the audible upper boundary is 22,050 Hz.
            </p>
          </div>

          {/* Concept 3 */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)'
          }}>
            <h4 style={{ fontSize: '0.92rem', color: '#38bdf8', marginBottom: '6px' }}>
              3. Cooley-Tukey FFT Computational Optimization
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              A naive DFT requires O(N²) complex arithmetic operations. The <strong>Fast Fourier Transform (FFT)</strong> recursively divides the problem into even and odd indices (divide-and-conquer), reducing algorithmic complexity to O(N log N). For N = 65,536, FFT computes ~4,000× faster!
            </p>
          </div>

          {/* Concept 4 */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)'
          }}>
            <h4 style={{ fontSize: '0.92rem', color: '#38bdf8', marginBottom: '6px' }}>
              4. Magnitude Spectrum & Peak Extraction
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Each complex bin X[k] = Re[k] + j·Im[k] yields an absolute magnitude |X[k]| = √(Re² + Im²).
              We apply a normalization factor 2 / (N · Gw) where Gw is the window coherent gain, accurately mapping to real physical pressure magnitudes.
            </p>
          </div>

          {/* Concept 5 */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)'
          }}>
            <h4 style={{ fontSize: '0.92rem', color: '#38bdf8', marginBottom: '6px' }}>
              5. Windowing & Spectral Leakage Control
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Truncating a continuous wave into finite chunks introduces abrupt boundary discontinuities, causing energy to leak into neighboring frequency bins (spectral leakage). Applying a <strong>Hann</strong> or <strong>Hamming</strong> window tapers the boundaries gracefully to zero, ensuring razor-sharp spectral peaks.
            </p>
          </div>

          {/* Concept 6 */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)'
          }}>
            <h4 style={{ fontSize: '0.92rem', color: '#38bdf8', marginBottom: '6px' }}>
              6. Dominant Frequency Identification
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              The <strong>dominant frequency</strong> corresponds to the global peak index k_max = argmax |X[k]|, with physical frequency f_dom = k_max · (fs / N). This frequency signature determines the primary acoustical source (e.g. traffic tire rumble vs. turbine hum).
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
