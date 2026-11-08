import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Check,
  Wifi,
  WifiOff,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const THEMES = [
  {
    id: 'blue',
    name: 'Electric Blue',
    tag: 'Apple Dark Navy',
    primary: '#38bdf8',
    secondary: '#0284c7',
    bg: '#070a12',
    border: 'rgba(56, 189, 248, 0.4)'
  },
  {
    id: 'gold',
    name: 'Royal Gold',
    tag: 'Obsidian & Gold',
    primary: '#facc15',
    secondary: '#d97706',
    bg: '#0c0904',
    border: 'rgba(250, 204, 21, 0.4)'
  },
  {
    id: 'white',
    name: 'Pure White',
    tag: 'Apple White Glass',
    primary: '#0284c7',
    secondary: '#0ea5e9',
    bg: '#f8fafc',
    border: 'rgba(2, 132, 199, 0.3)'
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    tag: 'Bio-Acoustic Mint',
    primary: '#34d399',
    secondary: '#059669',
    bg: '#050e0b',
    border: 'rgba(52, 211, 153, 0.4)'
  },
  {
    id: 'purple',
    name: 'Midnight Amethyst',
    tag: 'Cosmic Violet',
    primary: '#c084fc',
    secondary: '#7c3aed',
    bg: '#0a0614',
    border: 'rgba(192, 132, 252, 0.4)'
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    tag: 'Ruby & Coral',
    primary: '#fb7185',
    secondary: '#e11d48',
    bg: '#0f0508',
    border: 'rgba(251, 113, 133, 0.4)'
  }
];

export default function Topbar({ currentPage, currentTheme = 'blue', onSelectTheme, backendStatus }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitles = {
    dashboard: 'Environmental Noise Dashboard',
    recording: 'Live Audio Recording & Signal Acquisition',
    upload: 'Audio File Ingestion & Preprocessing',
    frequency: 'Fourier Transform & Spectral Peak Analysis',
    noise: 'Noise Pollution Level & WHO Monitoring',
    history: 'Spectral Records & Analysis Archive',
    about: 'Applied Mathematics Project Documentation',
  };

  const isOnline = backendStatus?.status === 'healthy';
  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="glass-topbar"
      style={{
        height: '70px',
        position: 'sticky',
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        width: '100%'
      }}
    >
      {/* Page Title & Breadcrumb */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>AcuFourier</span>
          <span>/</span>
          <span style={{ color: activeThemeObj.primary, textTransform: 'capitalize' }}>{currentPage}</span>
        </div>
        <h1 style={{
          fontSize: '1.22rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          margin: '2px 0 0'
        }}>
          {pageTitles[currentPage] || 'Audio Frequency Analysis'}
        </h1>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Backend Health Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: isOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: isOnline ? '#34d399' : '#f87171'
          }}
          title={isOnline ? 'Flask Backend Connected: FFT Engine Active' : 'Backend Disconnected'}
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isOnline ? 'FFT Engine Online' : 'Backend Offline'}</span>
        </div>

        {/* Theme Picker Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activeThemeObj.border}`,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: `0 2px 10px ${activeThemeObj.border}`,
              transition: 'all 0.2s ease'
            }}
            title="Change Theme Color"
          >
            <Palette size={16} color={activeThemeObj.primary} />
            {/* Color Swatch Dot */}
            <span style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${activeThemeObj.primary}, ${activeThemeObj.secondary})`,
              boxShadow: `0 0 8px ${activeThemeObj.primary}`
            }} />
            <span>{activeThemeObj.name}</span>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </button>

          {dropdownOpen && (
            <div
              className="glass-card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '260px',
                padding: '10px',
                background: 'var(--card-bg)',
                backdropFilter: 'blur(24px)',
                border: '1px solid var(--card-border)',
                borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                padding: '6px 10px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Select Color Theme
              </div>

              {THEMES.map((t) => {
                const isSelected = t.id === currentTheme;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTheme(t.id);
                      setDropdownOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      border: isSelected ? `1px solid ${t.primary}` : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                        boxShadow: isSelected ? `0 0 10px ${t.primary}` : 'none',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {t.tag}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check size={16} color={t.primary} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User / Capstone Avatar Placeholder */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '5px 12px 5px 6px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--card-border)'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${activeThemeObj.primary}, ${activeThemeObj.secondary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.85rem',
            boxShadow: `0 2px 8px ${activeThemeObj.primary}`
          }}>
            CO4
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Capstone Student
          </span>
        </div>
      </div>
    </header>
  );
}
