import React, { useState, useEffect } from 'react';
import { X, GitCompare, Check, AlertCircle } from 'lucide-react';
import { compareRecordingsApi } from '../utils/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function ComparisonModal({ isOpen, onClose, records = [], initialSelectedIds = [] }) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialSelectedIds && initialSelectedIds.length >= 2) {
      setSelectedIds(initialSelectedIds);
      runComparison(initialSelectedIds);
    } else if (records.length >= 2 && selectedIds.length < 2) {
      // Default select first two records
      const defaultTwo = [records[0].id, records[1].id];
      setSelectedIds(defaultTwo);
      runComparison(defaultTwo);
    }
  }, [isOpen, initialSelectedIds, records]);

  const toggleSelect = (id) => {
    let next;
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) return; // Keep at least 2
      next = selectedIds.filter((item) => item !== id);
    } else {
      if (selectedIds.length >= 4) return; // Limit to max 4
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    if (next.length >= 2) {
      runComparison(next);
    }
  };

  const runComparison = async (ids) => {
    try {
      setLoading(true);
      setError(null);
      const res = await compareRecordingsApi(ids);
      setComparisonData(res);
    } catch (err) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Build merged spectrum array for chart
  const mergedSpectrum = [];
  if (comparisonData && comparisonData.comparisons) {
    const comp1 = comparisonData.comparisons[0]?.spectrum || [];
    const comp2 = comparisonData.comparisons[1]?.spectrum || [];

    // Sample ~300 points
    for (let i = 0; i < Math.min(comp1.length, comp2.length); i += 2) {
      const pt1 = comp1[i];
      const pt2 = comp2[i];
      if (pt1) {
        mergedSpectrum.push({
          frequency: pt1.frequency,
          [comparisonData.comparisons[0].title]: pt1.magnitude,
          [comparisonData.comparisons[1].title]: pt2?.magnitude || 0,
        });
      }
    }
  }

  const colors = ['#38bdf8', '#06b6d4', '#f59e0b', '#10b981'];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(7, 10, 18, 0.8)',
      backdropFilter: 'blur(16px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <GitCompare size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Multi-Recording Acoustic Comparison
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Side-by-side Fourier spectrum contrast and dominant frequency differential
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--card-border)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Record Selection Chips */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Select 2 to 4 Recordings to Compare:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {records.map((rec) => {
              const isSelected = selectedIds.includes(rec.id);
              return (
                <button
                  key={rec.id}
                  onClick={() => toggleSelect(rec.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid var(--card-border)',
                    color: isSelected ? '#38bdf8' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 600 : 400
                  }}
                >
                  {isSelected && <Check size={14} />}
                  <span>{rec.title}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>({rec.dominant_frequency} Hz)</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Comparing spectra using Fast Fourier Transform...
          </div>
        )}

        {error && (
          <div style={{
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!loading && comparisonData && (
          <div>
            {/* Comparative Insight Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)'
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>DOMINANT FREQ DELTA (Δf)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                  {comparisonData.insights?.dominant_freq_diff} Hz
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Higher pitch: {comparisonData.insights?.higher_freq_recording}
                </div>
              </div>

              <div style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>SOUND LEVEL DELTA (ΔdBA)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#22d3ee', marginTop: '4px' }}>
                  {comparisonData.insights?.dba_diff} dBA
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Louder source: {comparisonData.insights?.louder_recording}
                </div>
              </div>
            </div>

            {/* Side by Side Specs Table */}
            <div style={{
              borderRadius: '14px',
              border: '1px solid var(--card-border)',
              overflow: 'hidden',
              marginBottom: '20px'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--card-border)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)' }}>Audio Sample</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)' }}>Dominant Freq</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)' }}>Band</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)' }}>Sound Level</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-secondary)' }}>WHO Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.comparisons.map((c, idx) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: colors[idx % colors.length] }}>
                        {c.title}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>
                        {c.dominant_frequency} Hz
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                        {c.dominant_band}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-primary)' }}>
                        {c.est_dba} dBA
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge badge-${c.noise_category?.toLowerCase()?.includes('safe') ? 'safe' : 'elevated'}`}>
                          {c.noise_category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Overlaid Spectral Graph */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Overlaid Frequency Spectrum Comparison (|X(f)| vs Hz)
              </div>
              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mergedSpectrum} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                    <XAxis
                      dataKey="frequency"
                      stroke="var(--text-muted)"
                      fontSize={11}
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`)}
                      unit="Hz"
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #38bdf8', borderRadius: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                    {comparisonData.comparisons.slice(0, 2).map((c, idx) => (
                      <Line
                        key={c.id}
                        type="monotone"
                        dataKey={c.title}
                        stroke={colors[idx]}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

