import React, { useState } from 'react';
import {
  Activity,
  Sliders,
  TrendingUp,
  FileAudio,
  Award,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import MetricCard from '../components/MetricCard';
import SpectrumChart from '../components/SpectrumChart';
import MathPanel from '../components/MathPanel';
import { analyzeAudioApi } from '../utils/api';

export default function FrequencyAnalysisPage({
  analysisData,
  onNavigate,
  onUpdateAnalysis,
  availableRecordings = []
}) {
  const [selectedWindow, setSelectedWindow] = useState(analysisData?.analysis?.window_type || 'hann');
  const [recomputing, setRecomputing] = useState(false);

  const meta = analysisData?.metadata || {};
  const analysis = analysisData?.analysis || {};
  const peaks = analysis.top_peaks || [];

  const handleWindowChange = async (newWindow) => {
    setSelectedWindow(newWindow);
    // If we have an active audio recording, recompute FFT with the new window to demonstrate spectral leakage difference!
    if (analysisData?.audio_url) {
      try {
        setRecomputing(true);
        // Fetch audio blob from backend audio URL and re-analyze
        const audioRes = await fetch(analysisData.audio_url);
        const blob = await audioRes.blob();
        const formData = new FormData();
        formData.append('audio', blob, meta.filename || 'reanalyze.wav');
        formData.append('title', meta.filename || 'Recomputed FFT');
        formData.append('window_type', newWindow);
        formData.append('save_to_db', 'false');

        const result = await analyzeAudioApi(formData);
        if (onUpdateAnalysis) {
          onUpdateAnalysis(result);
        }
      } catch (err) {
        console.error('Failed to recompute FFT window:', err);
      } finally {
        setRecomputing(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
            <Award size={14} />
            <span>MODULE 2 • CO4 FOURIER TRANSFORM FREQUENCY ANALYSIS</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0' }}>
            Discrete Fourier Transform & Spectral Decomposition
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Active file: <strong>{meta.filename || 'Urban Traffic & Vehicle Rumbling'}</strong> ({meta.processed_duration || 0}s)
          </p>
        </div>

        {/* Window Function Interactive Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--card-border)'
        }}>
          <Sliders size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Window:</span>
          <select
            value={selectedWindow}
            onChange={(e) => handleWindowChange(e.target.value)}
            disabled={recomputing}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="hann" style={{ background: '#0f172a', color: '#fff' }}>Hann Window (Balanced)</option>
            <option value="hamming" style={{ background: '#0f172a', color: '#fff' }}>Hamming Window</option>
            <option value="blackman" style={{ background: '#0f172a', color: '#fff' }}>Blackman Window (Min Leakage)</option>
            <option value="rectangular" style={{ background: '#0f172a', color: '#fff' }}>Rectangular (No Window)</option>
          </select>
          {recomputing && <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>FFT...</span>}
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        <MetricCard
          title="Dominant Frequency"
          value={analysis.dominant_frequency || 0}
          unit="Hz"
          icon={Activity}
          color="#38bdf8"
          subtitle={`Primary Acoustic Peak (${analysis.dominant_band})`}
        />

        <MetricCard
          title="Nyquist Limit (f_Nyq)"
          value={analysis.nyquist_frequency || (meta.sampling_rate ? meta.sampling_rate / 2 : 22050)}
          unit="Hz"
          icon={Layers}
          color="#06b6d4"
          subtitle="Max theoretical audible frequency"
        />

        <MetricCard
          title="Frequency Resolution"
          value={analysis.frequency_resolution || 0.5}
          unit="Hz/bin"
          icon={TrendingUp}
          color="#10b981"
          subtitle="Spectral bin spacing (fs / N)"
        />

        <MetricCard
          title="Detected Peak Modes"
          value={analysis.peak_count || peaks.length}
          unit="Peaks"
          icon={Sparkles}
          color="#f59e0b"
          subtitle="Prominence-verified harmonics"
        />
      </div>

      {/* Frequency Spectrum Card (Main Visualization) */}
      <GlassCard
        title="Continuous & Discrete Frequency Spectrum |X(f)|"
        subtitle="Magnitude spectrum calculated using NumPy Cooley-Tukey Real FFT (np.fft.rfft)"
        icon={Activity}
      >
        <SpectrumChart
          spectrumData={analysis.spectrum}
          topPeaks={peaks}
          dominantFreq={analysis.dominant_frequency}
          height={320}
        />
      </GlassCard>

      {/* Top 5 Dominant Frequencies Table */}
      <GlassCard
        title="Top 5 Dominant Frequency Peaks (Harmonic Signature)"
        subtitle="Extracted via Scipy signal prominence detection across discrete Fourier frequency bins"
        icon={TrendingUp}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Rank</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Peak Frequency (Hz)</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Linear Magnitude</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Decibel Level</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Relative Strength</th>
                <th style={{ padding: '12px 14px', textAlign: 'left' }}>Acoustic Band Classification</th>
              </tr>
            </thead>
            <tbody>
              {peaks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No peaks detected. Analyze an audio track to compute dominant frequencies.
                  </td>
                </tr>
              ) : (
                peaks.slice(0, 5).map((peak) => (
                  <tr
                    key={peak.rank}
                    style={{
                      borderBottom: '1px solid var(--card-border)',
                      background: peak.rank === 1 ? 'rgba(56, 189, 248, 0.05)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: peak.rank === 1 ? '#38bdf8' : 'var(--text-primary)' }}>
                      #{peak.rank} {peak.rank === 1 && '★'}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>
                      {peak.frequency_hz} Hz
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>
                      {peak.magnitude}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {peak.magnitude_db} dBFS
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          borderRadius: '9999px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${peak.relative_percent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #0284c7, #38bdf8)'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: '40px' }}>
                          {peak.relative_percent}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-normal">
                        {peak.band}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Mathematical Theory & CO4 Explanation Panel */}
      <MathPanel />
    </div>
  );
}

