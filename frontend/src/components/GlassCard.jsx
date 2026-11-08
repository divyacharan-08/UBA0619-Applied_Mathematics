import React from 'react';

export default function GlassCard({ children, className = '', title, subtitle, icon: Icon, action, interactive = false }) {
  return (
    <div className={`glass-card ${interactive ? 'glass-card-interactive' : ''} ${className}`} style={{ padding: '24px' }}>
      {(title || Icon || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {Icon && (
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--card-border-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-electric)'
              }}>
                <Icon size={20} />
              </div>
            )}
            <div>
              {title && <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{title}</h3>}
              {subtitle && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

