import React, { useState } from 'react';
import {
  Gauge,
  Clock,
  Radio,
  Activity,
  Layers,
  FileDown,
  GitCompare,
  Volume2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import MetricCard from '../components/MetricCard';
import WaveformChart from '../components/WaveformChart';
import SpectrumChart from '../components/SpectrumChart';
import BandDistributionChart from '../components/BandDistributionChart';
import ComparisonModal from '../components/ComparisonModal';
import { generateAnalysisPDF } from '../utils/pdfExport';

export default function NoiseMonitoringPage({
  analysisData,
  allRecords = [],
  onOpenAnalysis
}) {
  const [showComparison, setShowComparison] = useState(false);

  const meta = analysisData?.metadata || {};
  const analysis = analysisData?.analysis || {};
  const noise = analysis.noise_info || {};

  const handleExportPDF = () => {
    if (!analysisData) return;
    generateAnalysisPDF(analysisData);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
            <Gauge size={14} />
            <span>MODULE 3 • ENVIRONMENTAL NOISE MONITORING & ANALYTICS</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0' }}>
            Acoustic Pollution Level & Spectral Distribution
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Active Target: <strong>{meta.filename || 'Audio Recording'}</strong>
          </p>
        </div>

        {/* Action Buttons: Compare & Export PDF */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowComparison(true)}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            <GitCompare size={16} />
            Compare Recordings
          </button>

          <button
            onClick={handleExportPDF}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.88rem' }}
          >
            <FileDown size={16} />
            Export PDF Report
          </button>
        </div>
      </div>

      {/* 5 Required Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* 1. Audio Duration */}
        <MetricCard
          title="Audio Duration"
          value={meta.processed_duration || 0}
          unit="sec"
          icon={Clock}
          color="#38bdf8"
          subtitle={`${(meta.sample_count || 0).toLocaleString()} samples`}
        />

        {/* 2. Sampling Rate */}
        <MetricCard
          title="Sampling Rate (f_s)"
          value={meta.sampling_rate || 44100}
          unit="Hz"
          icon={Radio}
          color="#06b6d4"
          subtitle={`Nyquist: ${meta.sampling_rate ? meta.sampling_rate / 2 : 22050} Hz`}
        />

        {/* 3. Dominant Frequency */}
        <MetricCard
          title="Dominant Frequency"
          value={analysis.dominant_frequency || 0}
          unit="Hz"
          icon={Activity}
          color="#6366f1"
          subtitle={`Band: ${analysis.dominant_band || 'Unknown'}`}
        />

        {/* 4. Number of Detected Peaks */}
        <MetricCard
          title="Detected Peaks"
          value={analysis.peak_count || analysis.top_peaks?.length || 0}
          unit="Harmonics"
          icon={Layers}
          color="#f59e0b"
          subtitle="Statistically verified modes"
        />

        {/* 5. Analysis Status / Noise Pollution Level */}
        <MetricCard
          title="Sound Level (SPL)"
          value={analysis.est_dba || 0}
          unit="dBA"
          icon={Volume2}
          color={noise.color || '#10b981'}
          subtitle={noise.category || 'Normal'}
        />
      </div>

      {/* Noise Pollution Health Assessment Banner */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          borderLeft: `5px solid ${noise.color || '#38bdf8'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: noise.color || '#38bdf8'
          }}>
            {analysis.est_dba > 75 ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {noise.category || 'Environmental Noise Status'}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: noise.color || '#38bdf8'
                }}
              >
                {noise.status || 'Verified'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              {noise.desc || 'Acoustic levels captured within regulatory standards.'}
            </p>
          </div>
        </div>

        <div style={{
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '8px 14px',
          borderRadius: '10px',
          border: '1px solid var(--card-border)'
        }}>
          WHO Environmental Limit: <strong>55 dBA Daytime / 45 dBA Nighttime</strong>
        </div>
      </div>

      {/* Graph A & Graph B: Waveform and Frequency Spectrum */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '20px'
      }}>
        {/* Graph A: Audio Waveform */}
        <GlassCard
          title="Graph A: Time-Domain Audio Waveform"
          subtitle="Instantaneous amplitude x[n] plotted over continuous recording duration"
          icon={Volume2}
        >
          <WaveformChart waveformData={analysis.waveform} height={260} />
        </GlassCard>

        {/* Graph B: Frequency Spectrum */}
        <GlassCard
          title="Graph B: Frequency Magnitude Spectrum |X(f)|"
          subtitle="Decomposed frequency amplitude with dominant peak detection"
          icon={Activity}
        >
          <SpectrumChart
            spectrumData={analysis.spectrum}
            topPeaks={analysis.top_peaks}
            dominantFreq={analysis.dominant_frequency}
            height={260}
          />
        </GlassCard>
      </div>

      {/* Graph C: Frequency Distribution Across Acoustic Bands */}
      <GlassCard
        title="Graph C: Acoustic Band Energy Distribution"
        subtitle="Spectral power allocation across standardized octave and acoustic ranges (Sub-bass to Treble)"
        icon={Layers}
      >
        <BandDistributionChart bandData={analysis.band_distribution} height={260} />
      </GlassCard>

      {/* Graph E / Section E: Comprehensive Analysis Report */}
      <GlassCard
        title="Section E: Environmental Noise & Signal Analysis Report"
        subtitle="Summary synthesis of audio signal preprocessing and mathematical Fourier Transform outputs"
        icon={Sparkles}
        action={
          <button
            onClick={handleExportPDF}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            <FileDown size={14} /> Download PDF
          </button>
        }
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          fontSize: '0.88rem'
        }}>
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)'
          }}>
            <h4 style={{ color: '#38bdf8', marginBottom: '8px', fontSize: '0.92rem' }}>
              Signal Preprocessing Summary
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li>• DC Offset: Removed (Mean centered at 0.0)</li>
              <li>• Channel Configuration: Converted to Mono (1-ch)</li>
              <li>• Amplitude Normalization: Scaled to 1.0 peak</li>
              <li>• Sampling Rate: {meta.sampling_rate} Hz (44.1k/48k audio standard)</li>
              <li>• Sample Window: {analysis.window_type || 'Hann'} window applied</li>
            </ul>
          </div>

          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)'
          }}>
            <h4 style={{ color: '#06b6d4', marginBottom: '8px', fontSize: '0.92rem' }}>
              Mathematical FFT Findings (CO4)
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li>• Dominant Fundamental Pitch: <strong>{analysis.dominant_frequency} Hz</strong></li>
              <li>• Primary Acoustic Band: <strong>{analysis.dominant_band}</strong></li>
              <li>• Total Discrete Bins: {analysis.spectrum?.length || 0} points computed</li>
              <li>• Effective Bin Width Δf: {analysis.frequency_resolution} Hz</li>
              <li>• Algorithmic Complexity: O(N log N) via Cooley-Tukey</li>
            </ul>
          </div>

          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)'
          }}>
            <h4 style={{ color: '#10b981', marginBottom: '8px', fontSize: '0.92rem' }}>
              Environmental & Health Implications
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
              <li>• Equivalent Sound Level: <strong>{analysis.est_dba} dBA SPL</strong></li>
              <li>• Noise Pollution Category: <strong>{noise.category}</strong></li>
              <li>• Status: {noise.status}</li>
              <li>• Recommendation: {analysis.est_dba > 75 ? 'Hearing protection advised for sustained exposure.' : 'Acceptable acoustic environment.'}</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonModal
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          records={allRecords}
          initialSelectedIds={analysisData?.id ? [analysisData.id] : []}
        />
      )}
    </div>
  );
}

