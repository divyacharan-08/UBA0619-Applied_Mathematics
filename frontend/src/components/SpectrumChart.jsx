import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot
} from 'recharts';
import { ZoomIn } from 'lucide-react';

export default function SpectrumChart({
  spectrumData = [],
  topPeaks = [],
  dominantFreq = 0,
  height = 320
}) {
  const [zoomRange, setZoomRange] = useState('full'); // 'full', 'bass', 'mid', 'high'
  const [unit, setUnit] = useState('linear'); // 'linear' or 'db'

  const filteredData = useMemo(() => {
    if (!spectrumData || spectrumData.length === 0) return [];

    let minF = 0;
    let maxF = 20000;

    if (zoomRange === 'bass') {
      minF = 20;
      maxF = 300;
    } else if (zoomRange === 'mid') {
      minF = 250;
      maxF = 4000;
    } else if (zoomRange === 'high') {
      minF = 4000;
      maxF = 20000;
    }

    return spectrumData.filter((pt) => pt.frequency >= minF && pt.frequency <= maxF);
  }, [spectrumData, zoomRange]);

  if (!spectrumData || spectrumData.length === 0) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        borderRadius: '16px',
        background: 'rgba(0, 0, 0, 0.1)',
        border: '1px dashed var(--card-border)'
      }}>
        No frequency spectrum available. Analyze an audio track to compute FFT.
      </div>
    );
  }

  const yDataKey = unit === 'db' ? 'magnitude_db' : 'magnitude';

  return (
    <div>
      {/* Zoom and Unit Controls Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Zoom Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ZoomIn size={14} /> Zoom:
          </span>
          {[
            { id: 'full', label: 'Full Spectrum (0-20kHz)' },
            { id: 'bass', label: 'Bass (20-300Hz)' },
            { id: 'mid', label: 'Midrange (250-4kHz)' },
            { id: 'high', label: 'Treble (4k-20kHz)' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => setZoomRange(preset.id)}
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: zoomRange === preset.id ? '#38bdf8' : 'var(--card-border)',
                background: zoomRange === preset.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: zoomRange === preset.id ? '#38bdf8' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: zoomRange === preset.id ? 600 : 400,
                transition: 'all 0.15s ease'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Magnitude Scale Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scale:</span>
          <button
            onClick={() => setUnit('linear')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: unit === 'linear' ? '#06b6d4' : 'var(--card-border)',
              background: unit === 'linear' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: unit === 'linear' ? '#06b6d4' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: unit === 'linear' ? 600 : 400
            }}
          >
            Linear |X(f)|
          </button>
          <button
            onClick={() => setUnit('db')}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: unit === 'db' ? '#06b6d4' : 'var(--card-border)',
              background: unit === 'db' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              color: unit === 'db' ? '#06b6d4' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: unit === 'db' ? 600 : 400
            }}
          >
            Decibels (dBFS)
          </button>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div style={{ width: '100%', height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="spectrumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-electric, #06b6d4)" stopOpacity={0.7} />
                <stop offset="60%" stopColor="var(--accent-blue, #0284c7)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--accent-blue, #0284c7)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
            <XAxis
              dataKey="frequency"
              stroke="var(--text-muted)"
              fontSize={11}
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`)}
              tickLine={false}
              unit="Hz"
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              unit={unit === 'db' ? 'dB' : ''}
              domain={unit === 'db' ? [-80, 0] : [0, 'auto']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const isTopPeak = topPeaks.some((p) => Math.abs(p.frequency_hz - data.frequency) < 2);
                  return (
                    <div style={{
                      background: 'var(--card-bg)',
                      backdropFilter: 'blur(12px)',
                      border: isTopPeak ? '1px solid var(--accent-electric)' : '1px solid var(--card-border)',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--accent-electric)', marginBottom: '4px' }}>
                        Frequency: {data.frequency} Hz
                      </div>
                      <div>Magnitude: {data.magnitude}</div>
                      <div>Level: {data.magnitude_db} dBFS</div>
                      {isTopPeak && (
                        <div style={{
                          marginTop: '6px',
                          display: 'inline-block',
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'var(--accent-electric)',
                          fontWeight: 600
                        }}>
                          ★ Dominant Peak
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={yDataKey}
              stroke="var(--accent-electric, #06b6d4)"
              strokeWidth={1.8}
              fillOpacity={1}
              fill="url(#spectrumGradient)"
              isAnimationActive={true}
            />

            {/* Reference Highlight Dot for Dominant Peak */}
            {dominantFreq > 0 && filteredData.length > 0 && (
              <ReferenceDot
                x={dominantFreq}
                y={filteredData.find((d) => Math.abs(d.frequency - dominantFreq) < 5)?.[yDataKey] || 0}
                r={6}
                fill="var(--accent-electric, #38bdf8)"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

