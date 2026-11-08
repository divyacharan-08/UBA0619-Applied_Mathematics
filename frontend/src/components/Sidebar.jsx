import React from 'react';
import {
  LayoutDashboard,
  Mic,
  UploadCloud,
  Activity,
  Gauge,
  History,
  Info,
  ChevronLeft,
  ChevronRight,
  Waves
} from 'lucide-react';

export default function Sidebar({ currentPage, onSelectPage, isCollapsed, onToggleCollapse }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'recording', label: 'Audio Recording', icon: Mic },
    { id: 'upload', label: 'Audio Upload', icon: UploadCloud },
    { id: 'frequency', label: 'Frequency Analysis', icon: Activity },
    { id: 'noise', label: 'Noise Monitoring', icon: Gauge },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  const sidebarWidth = isCollapsed ? '78px' : '260px';

  return (
    <aside
      className="glass-sidebar"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 14px',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflowX: 'hidden'
      }}
    >
      <div>
        {/* Brand / Logo Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '0 8px',
          marginBottom: '36px',
          cursor: 'pointer'
        }}
        onClick={() => onSelectPage('dashboard')}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--theme-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 6px 20px var(--theme-glow)',
            flexShrink: 0
          }}>
            <Waves size={24} />
          </div>

          {!isCollapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <h2 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                AcuFourier
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-electric)', fontWeight: 600, letterSpacing: '0.04em' }}>
                CO4 APPLIED MATH
              </span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                title={isCollapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  width: '100%',
                  padding: isCollapsed ? '12px 0' : '12px 14px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: '14px',
                  border: isActive ? '1px solid var(--card-border-glow)' : '1px solid transparent',
                  background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: isActive ? 'var(--accent-electric)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={20} style={{ flexShrink: 0, color: isActive ? 'var(--accent-electric)' : 'inherit' }} />
                
                {!isCollapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}

                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      right: isCollapsed ? '4px' : '10px',
                      width: '5px',
                      height: '18px',
                      borderRadius: '4px',
                      background: 'var(--accent-electric)',
                      boxShadow: '0 0 10px var(--accent-electric)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle Button */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--card-border)' }}>
        <button
          onClick={onToggleCollapse}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '12px',
            width: '100%',
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--card-border)',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
