import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle,
  AlertCircle,
  Radio
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import AudioVisualizer from '../components/AudioVisualizer';
import { WavAudioRecorder } from '../utils/audioRecorder';
import { analyzeAudioApi } from '../utils/api';

export default function RecordPage({ onAnalysisComplete }) {
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [analyserNode, setAnalyserNode] = useState(null);

  // Completed recording result
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [title, setTitle] = useState('');
  const [normalize, setNormalize] = useState(true);
  const [removeDc, setRemoveDc] = useState(true);
  const [windowType, setWindowType] = useState('hann');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const timerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    setError(null);
    setSuccessMsg(null);
    setRecordedAudio(null);

    try {
      const rec = new WavAudioRecorder();
      await rec.start();
      setRecorder(rec);
      setAnalyserNode(rec.getAnalyserNode());
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      startTimer();
    } catch (err) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser.'
          : `Failed to access microphone: ${err.message}`
      );
    }
  };

  const handlePauseResume = () => {
    if (!recorder) return;
    if (isPaused) {
      recorder.resume();
      setIsPaused(false);
      startTimer();
    } else {
      recorder.pause();
      setIsPaused(true);
      stopTimer();
    }
  };

  const handleStopRecording = () => {
    if (!recorder) return;
    stopTimer();
    const result = recorder.stop();
    setIsRecording(false);
    setIsPaused(false);
    setRecordedAudio(result);
    setTitle(`Mic_Recording_${new Date().toLocaleTimeString().replace(/:/g, '-')}`);
  };

  const handleReset = () => {
    stopTimer();
    if (recorder && isRecording) {
      recorder.stop();
    }
    setRecorder(null);
    setIsRecording(false);
    setIsPaused(false);
    setRecordedAudio(null);
    setDuration(0);
    setError(null);
    setSuccessMsg(null);
  };

  const handleAnalyze = async () => {
    if (!recordedAudio) return;
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('audio', recordedAudio.blob, `${title || 'recording'}.wav`);
      formData.append('title', title || 'Live Microphone Audio');
      formData.append('normalize', normalize.toString());
      formData.append('remove_dc', removeDc.toString());
      formData.append('window_type', windowType);
      formData.append('save_to_db', 'true');

      const res = await analyzeAudioApi(formData);
      setSuccessMsg('Analysis completed successfully!');
      if (onAnalysisComplete) {
        onAnalysisComplete(res);
      }
    } catch (err) {
      setError(err.message || 'Signal analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Live Audio Recording & Signal Acquisition
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Capture ambient sound pressure waves directly from your microphone and inspect the live oscilloscope waveform.
        </p>
      </div>

      {/* Recording Console Glass Card */}
      <GlassCard title="Acoustic Transducer Input Console" icon={Mic}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Live Oscilloscope Waveform Display */}
          <AudioVisualizer
            analyserNode={analyserNode}
            isRecording={isRecording}
            isPaused={isPaused}
            height={180}
          />

          {/* Recording Status & Timer Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '12px 18px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--card-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: isRecording ? (isPaused ? '#fbbf24' : '#ef4444') : '#94a3b8',
                boxShadow: isRecording && !isPaused ? '0 0 12px #ef4444' : 'none',
                animation: isRecording && !isPaused ? 'pulseGlow 1.5s infinite' : 'none'
              }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isRecording ? (isPaused ? 'Recording Paused' : 'Live Signal Acquiring...') : 'Ready to Record'}
              </span>
            </div>

            {/* Timer */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: isRecording ? '#38bdf8' : 'var(--text-secondary)',
              letterSpacing: '0.04em'
            }}>
              {formatTime(duration)}
            </div>

            {/* Sample Rate Indicator */}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Target: 44,100 Hz • 16-Bit Linear PCM
            </div>
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '1rem', background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
              >
                <Radio size={18} />
                Start Recording
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseResume}
                  className="btn-secondary"
                  style={{ padding: '12px 20px', fontSize: '0.92rem' }}
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>

                <button
                  onClick={handleStopRecording}
                  className="btn-danger"
                  style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                >
                  <Square size={16} />
                  Stop Recording
                </button>
              </>
            )}

            {(recordedAudio || isRecording) && (
              <button
                onClick={handleReset}
                className="btn-secondary"
                style={{ padding: '12px 18px', fontSize: '0.9rem' }}
              >
                <RotateCcw size={16} />
                Reset
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Recorded Audio Preview & Preprocessing Options */}
      {recordedAudio && (
        <GlassCard title="Recorded Signal Preprocessing & Verification" icon={Sliders}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Audio Playback Preview */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--card-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Audio Playback Preview
                </span>
                <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                  Duration: {recordedAudio.duration.toFixed(2)}s • {(recordedAudio.sampleCount || 0).toLocaleString()} samples
                </span>
              </div>
              <audio
                controls
                src={recordedAudio.url}
                style={{ width: '100%', height: '40px', borderRadius: '8px' }}
              />
            </div>

            {/* Metadata Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Recording Label / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input"
                  placeholder="e.g. Traffic Street Audio"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  FFT Windowing Function (Leakage Mitigation)
                </label>
                <select
                  value={windowType}
                  onChange={(e) => setWindowType(e.target.value)}
                  className="glass-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="hann">Hanning Window (Standard recommended)</option>
                  <option value="hamming">Hamming Window (High frequency selectivity)</option>
                  <option value="blackman">Blackman Window (Ultra-low sidelobes)</option>
                  <option value="bartlett">Bartlett Window (Triangular)</option>
                  <option value="rectangular">Rectangular Window (Uniform / None)</option>
                </select>
              </div>
            </div>

            {/* Signal Preprocessing Toggles */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--card-border)',
              flexWrap: 'wrap'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={removeDc}
                  onChange={(e) => setRemoveDc(e.target.checked)}
                  style={{ accentColor: '#38bdf8' }}
                />
                <span>Remove DC Bias (x[n] - μ)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={normalize}
                  onChange={(e) => setNormalize(e.target.checked)}
                  style={{ accentColor: '#38bdf8' }}
                />
                <span>Normalize Amplitude (Max |x| = 1.0)</span>
              </label>
            </div>

            {/* Error or Success notification */}
            {error && (
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Run FFT Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-primary"
                style={{ padding: '12px 30px', fontSize: '0.98rem' }}
              >
                <Sparkles size={18} />
                {loading ? 'Processing NumPy/SciPy FFT...' : 'Run Fourier Transform Analysis'}
              </button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

