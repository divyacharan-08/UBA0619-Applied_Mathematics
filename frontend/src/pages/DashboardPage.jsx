import React from 'react';
import {
  Mic,
  UploadCloud,
  Activity,
  Gauge,
  History,
  ArrowRight,
  TrendingUp,
  Volume2,
  Sparkles,
  Play
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import MetricCard from '../components/MetricCard';
import WaveformChart from '../components/WaveformChart';
import SpectrumChart from '../components/SpectrumChart';

export default function DashboardPage({
  onNavigate,
  statistics,
  recentRecordings = [],
  currentAnalysis,
  onOpenAnalysis
}) {
  const stats = statistics || {
    total_analyses: 0,
    avg_dominant_frequency: 0,
    max_dba: 0,
    avg_dba: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Section */}
      <div
        className="glass-card"
        style={{
          padding: '40px 48px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid var(--card-border-glow)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Glowing backdrop circle */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '5%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-cyan-glow) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--card-border-glow)',
            fontSize: '0.8rem',
            color: 'var(--accent-electric)',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            <Sparkles size={14} />
            <span>APPLIED MATHEMATICS CAPSTONE • CO4 FOURIER TRANSFORM</span>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            margin: '0 0 12px'
          }}>
            Understand the Sound Around You.
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            margin: '0 0 28px'
          }}>
            Transform environmental audio into meaningful frequency insights with high-precision Discrete Fourier Transform (DFT) signal processing.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('recording')}
              className="btn-primary"
              style={{ padding: '12px 26px', fontSize: '1rem' }}
            >
              <Mic size={18} />
              Start Recording
            </button>

            <button
              onClick={() => onNavigate('upload')}
              className="btn-secondary"
              style={{ padding: '12px 26px', fontSize: '1rem' }}
            >
              <UploadCloud size={18} />
              Upload Audio
            </button>

            <button
              onClick={() => onNavigate('frequency')}
              className="btn-secondary"
              style={{ padding: '12px 20px', fontSize: '0.92rem' }}
            >
              <Activity size={18} color="#38bdf8" />
              Spectral Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px'
      }}>
        <MetricCard
          title="Total Analyses"
          value={stats.total_analyses}
          unit="Records"
          icon={Activity}
          color="#38bdf8"
          subtitle="Processed through FFT engine"
        />

        <MetricCard
          title="Avg Dominant Frequency"
          value={stats.avg_dominant_frequency || '0'}
          unit="Hz"
          icon={TrendingUp}
          color="#06b6d4"
          subtitle="Mean peak pitch across corpus"
        />

        <MetricCard
          title="Peak Noise Level"
          value={stats.max_dba || '0'}
          unit="dBA"
          icon={Volume2}
          color="#fb923c"
          subtitle="Maximum SPL registered"
        />

        <MetricCard
          title="Average Sound Level"
          value={stats.avg_dba || '0'}
          unit="dBA"
          icon={Gauge}
          color="#10b981"
          subtitle="WHO environmental baseline"
        />
      </div>

      {/* Active Analysis Preview or Quick Glance */}
      {currentAnalysis && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '20px'
        }}>
          <GlassCard
            title={`Active Spectrum: ${currentAnalysis.metadata?.filename || 'Current Audio'}`}
            subtitle={`Dominant: ${currentAnalysis.analysis?.dominant_frequency} Hz (${currentAnalysis.analysis?.dominant_band})`}
            icon={Activity}
            action={
              <button
                onClick={() => onNavigate('frequency')}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Full Analysis <ArrowRight size={14} />
              </button>
            }
          >
            <SpectrumChart
              spectrumData={currentAnalysis.analysis?.spectrum}
              topPeaks={currentAnalysis.analysis?.top_peaks}
              dominantFreq={currentAnalysis.analysis?.dominant_frequency}
              height={220}
            />
          </GlassCard>

          <GlassCard
            title="Time-Domain Waveform"
            subtitle={`Duration: ${currentAnalysis.metadata?.processed_duration}s | Samples: ${currentAnalysis.metadata?.sample_count?.toLocaleString()}`}
            icon={Volume2}
            action={
              <button
                onClick={() => onNavigate('noise')}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Noise Level <ArrowRight size={14} />
              </button>
            }
          >
            <WaveformChart waveformData={currentAnalysis.analysis?.waveform} height={220} />
          </GlassCard>
        </div>
      )}

      {/* Recent Recordings Table */}
      <GlassCard
        title="Recent Environmental Audio Recordings"
        subtitle="Saved acoustic captures with pre-computed FFT frequencies and noise classifications"
        icon={History}
        action={
          <button
            onClick={() => onNavigate('history')}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          >
            View All ({recentRecordings.length})
          </button>
        }
      >
        {recentRecordings.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No recordings found yet. Click <strong>Start Recording</strong> or <strong>Upload Audio</strong> to begin.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Recording Title</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Date & Time</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Dominant Frequency</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Band</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Sound Level</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRecordings.slice(0, 5).map((rec) => (
                  <tr
                    key={rec.id}
                    style={{
                      borderBottom: '1px solid var(--card-border)',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rec.title}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {rec.timestamp}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#38bdf8', fontWeight: 600 }}>
                      {rec.dominant_frequency} Hz
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {rec.dominant_band}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge badge-${rec.noise_category?.toLowerCase()?.includes('safe') ? 'safe' : 'elevated'}`}>
                        {rec.est_dba} dBA
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => onOpenAnalysis(rec.id)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        <Play size={12} /> Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Quick Navigation Cards to all Modules */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-primary)' }}>
          Quick Navigation
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          {[
            {
              id: 'recording',
              title: 'Module 1: Audio Recording',
              desc: 'Live microphone capture with real-time waveform oscilloscope.',
              icon: Mic,
              color: '#38bdf8'
            },
            {
              id: 'upload',
              title: 'Module 1: Audio Upload',
              desc: 'Ingest WAV/MP3 files, inspect sample rate, trim segments, and normalize.',
              icon: UploadCloud,
              color: '#06b6d4'
            },
            {
              id: 'frequency',
              title: 'Module 2: Fourier Transform',
              desc: 'Cooley-Tukey FFT, dominant harmonic peaks, and math theory.',
              icon: Activity,
              color: '#6366f1'
            },
            {
              id: 'noise',
              title: 'Module 3: Noise Monitoring',
              desc: 'WHO decibel classification, band energy, and PDF report export.',
              icon: Gauge,
              color: '#10b981'
            },
          ].map((mod) => {
            const ModIcon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="glass-card glass-card-interactive"
                style={{ padding: '20px', cursor: 'pointer' }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: mod.color,
                  marginBottom: '12px'
                }}>
                  <ModIcon size={20} />
                </div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {mod.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  {mod.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

