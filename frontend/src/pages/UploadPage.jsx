import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileAudio,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Sliders,
  Scissors,
  Play,
  RotateCcw
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { analyzeAudioApi } from '../utils/api';

export default function UploadPage({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Preprocessing options
  const [title, setTitle] = useState('');
  const [normalize, setNormalize] = useState(true);
  const [removeDc, setRemoveDc] = useState(true);
  const [windowType, setWindowType] = useState('hann');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [useSegment, setUseSegment] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const handleFileSelection = (selectedFile) => {
    setError(null);
    setSuccessMsg(null);

    if (!selectedFile) return;

    const allowed = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm', 'audio/x-wav'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    const validExts = ['wav', 'mp3', 'ogg', 'flac', 'webm', 'm4a', 'aac'];

    if (!validExts.includes(ext) && !allowed.includes(selectedFile.type)) {
      setError(`Unsupported file format (.${ext}). Please upload a WAV, MP3, FLAC, or OGG file.`);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setAudioUrl(url);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));

    // Probe duration using Audio object
    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      const dur = tempAudio.duration;
      setFileInfo({
        name: selectedFile.name,
        sizeMB: (selectedFile.size / (1024 * 1024)).toFixed(2),
        duration: dur.toFixed(2),
        type: selectedFile.type || ext.toUpperCase(),
      });
      setEndTime(Math.round(dur));
    };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', title || file.name);
      formData.append('normalize', normalize.toString());
      formData.append('remove_dc', removeDc.toString());
      formData.append('window_type', windowType);
      formData.append('save_to_db', 'true');

      if (useSegment) {
        if (startTime >= endTime) {
          throw new Error('Start time must be less than End time.');
        }
        formData.append('start_time', startTime.toString());
        formData.append('end_time', endTime.toString());
      }

      const res = await analyzeAudioApi(formData);
      setSuccessMsg('Audio processed & FFT analysis computed successfully!');
      if (onAnalysisComplete) {
        onAnalysisComplete(res);
      }
    } catch (err) {
      setError(err.message || 'Signal processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileInfo(null);
    setAudioUrl(null);
    setError(null);
    setSuccessMsg(null);
    setTitle('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Audio File Ingestion & Signal Preprocessing
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Upload high-fidelity environmental recordings (WAV or MP3), configure signal preprocessing, and segment intervals for Fourier analysis.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className="glass-card"
          style={{
            padding: '50px 30px',
            textAlign: 'center',
            cursor: 'pointer',
            border: isDragging ? '2px dashed #38bdf8' : '2px dashed rgba(255, 255, 255, 0.15)',
            background: isDragging ? 'rgba(56, 189, 248, 0.1)' : 'rgba(22, 30, 52, 0.45)',
            transition: 'all 0.25s ease'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelection(e.target.files?.[0])}
            accept=".wav,.mp3,.ogg,.flac,.webm"
            style={{ display: 'none' }}
          />

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(6, 182, 212, 0.25))',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.25)'
          }}>
            <UploadCloud size={32} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Drag and drop your audio file here
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
            Supports <strong>WAV</strong> and <strong>MP3</strong> audio up to 50 MB
          </p>

          <span className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>
            Browse Files
          </span>
        </div>
      ) : (
        /* File Info Card */
        <GlassCard title="Uploaded Audio File Information" icon={FileAudio}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              padding: '16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--card-border)'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>FILENAME</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {fileInfo?.name}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>FILE SIZE</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8' }}>
                  {fileInfo?.sizeMB} MB
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TOTAL DURATION</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#06b6d4' }}>
                  {fileInfo?.duration} seconds
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>FORMAT</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {fileInfo?.type}
                </div>
              </div>
            </div>

            {/* Audio Playback Controls */}
            {audioUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Audio Playback
                </span>
                <audio
                  ref={audioRef}
                  controls
                  src={audioUrl}
                  style={{ width: '100%', height: '42px', borderRadius: '10px' }}
                />
              </div>
            )}

            {/* Segment Trimming Option */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--card-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={useSegment}
                    onChange={(e) => setUseSegment(e.target.checked)}
                    style={{ accentColor: '#38bdf8' }}
                  />
                  <span>Select Specific Audio Segment (Trimming)</span>
                </label>
                <Scissors size={16} color="#38bdf8" />
              </div>

              {useSegment && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '6px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Start Time (seconds):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max={fileInfo?.duration || 100}
                      value={startTime}
                      onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      End Time (seconds):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={startTime + 0.1}
                      max={fileInfo?.duration || 100}
                      value={endTime}
                      onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)}
                      className="glass-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preprocessing Settings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Analysis Label / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input"
                  placeholder="e.g. Traffic Intersection Recording"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Windowing Function
                </label>
                <select
                  value={windowType}
                  onChange={(e) => setWindowType(e.target.value)}
                  className="glass-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="hann">Hanning Window (Standard recommended)</option>
                  <option value="hamming">Hamming Window (Narrow main lobe)</option>
                  <option value="blackman">Blackman Window (Maximum sidelobe suppression)</option>
                  <option value="bartlett">Bartlett Window (Triangular)</option>
                  <option value="rectangular">Rectangular Window (Uniform / None)</option>
                </select>
              </div>
            </div>

            {/* Checkbox Preprocessing Toggles */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              padding: '12px',
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
                <span>Remove DC Offset (x[n] - mean)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={normalize}
                  onChange={(e) => setNormalize(e.target.checked)}
                  style={{ accentColor: '#38bdf8' }}
                />
                <span>Normalize Amplitude (Unit Peak Normalization)</span>
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

            {/* Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <button onClick={handleReset} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
                <RotateCcw size={16} /> Choose Another File
              </button>

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-primary"
                style={{ padding: '12px 30px', fontSize: '0.98rem' }}
              >
                <Sparkles size={18} />
                {loading ? 'Executing NumPy/SciPy FFT...' : 'Run Fourier Transform Analysis'}
              </button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

