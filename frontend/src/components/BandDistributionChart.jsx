import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export default function BandDistributionChart({ bandData = [], height = 240 }) {
  if (!bandData || bandData.length === 0) {
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
        No band energy distribution data available.
      </div>
    );
  }

  const bandColors = [
    '#6366f1', // Sub-bass (Indigo)
    '#3b82f6', // Bass (Blue)
    '#0ea5e9', // Low-Mid (Sky)
    '#06b6d4', // Midrange (Cyan)
    '#10b981', // High-Mid (Emerald)
    '#f59e0b', // Treble (Amber)
  ];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.92)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      color: '#f8fafc',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                    }}>
                      <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '2px' }}>
                        {data.name} ({data.range})
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, margin: '4px 0' }}>
                        {data.percentage}% Spectral Energy
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {data.desc}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[8, 8, 0, 0]} isAnimationActive={true}>
              {bandData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={bandColors[index % bandColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Acoustic Band Info Tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '10px',
        marginTop: '16px'
      }}>
        {bandData.map((band, idx) => (
          <div
            key={band.name}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--card-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: bandColors[idx % bandColors.length] }}>
                {band.name}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {band.percentage}%
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{band.range}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>{band.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

