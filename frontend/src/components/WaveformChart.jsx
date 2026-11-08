import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function WaveformChart({ waveformData = [], height = 260 }) {
  if (!waveformData || waveformData.length === 0) {
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
        No waveform data available. Record or upload an audio file to visualize.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={waveformData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-electric, #38bdf8)" stopOpacity={0.65} />
              <stop offset="95%" stopColor="var(--accent-blue, #0284c7)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="var(--text-muted)"
            fontSize={11}
            tickFormatter={(val) => `${val}s`}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={11}
            domain={[-1, 1]}
            tickLine={false}
            tickFormatter={(val) => val.toFixed(1)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div style={{
                    background: 'var(--card-bg)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid var(--card-border-glow)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                  }}>
                    <div><strong>Time:</strong> {data.time} s</div>
                    <div style={{ color: 'var(--accent-electric)' }}><strong>Amplitude:</strong> {data.amplitude}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="amplitude"
            stroke="var(--accent-electric, #38bdf8)"
            strokeWidth={1.8}
            fillOpacity={1}
            fill="url(#waveGradient)"
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

