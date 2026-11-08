import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Trash2,
  Play,
  GitCompare,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Volume2
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ComparisonModal from '../components/ComparisonModal';
import { fetchHistoryApi, deleteHistoryApi } from '../utils/api';

export default function HistoryPage({ onOpenAnalysis, onRefreshRecords }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await fetchHistoryApi(searchTerm, categoryFilter);
      setRecords(res.records || []);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [searchTerm, categoryFilter]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteHistoryApi(id);
      setFeedbackMsg(`Record "${title}" deleted.`);
      loadHistory();
      if (onRefreshRecords) onRefreshRecords();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const toggleSelectForComparison = (id) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((i) => i !== id));
    } else {
      if (selectedForComparison.length >= 4) {
        alert('You can compare a maximum of 4 recordings simultaneously.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Analysis History & Database Archive
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            SQLite-backed persistent repository of environmental audio recordings and Fourier analysis results.
          </p>
        </div>

        {/* Multi-record compare button */}
        {selectedForComparison.length >= 2 && (
          <button
            onClick={() => setShowComparisonModal(true)}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.88rem' }}
          >
            <GitCompare size={16} />
            Compare Selected ({selectedForComparison.length})
          </button>
        )}
      </div>

      {feedbackMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <GlassCard>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, filename, or band..."
              className="glass-input"
              style={{ paddingLeft: '42px' }}
            />
          </div>

          {/* Noise Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="var(--text-muted)" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="glass-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="">All Noise Categories</option>
              <option value="Quiet / Serene">Quiet / Serene (&lt;45 dBA)</option>
              <option value="Moderate / Comfortable">Moderate / Comfortable (45-60 dBA)</option>
              <option value="Elevated / Urban Noise">Elevated / Urban Noise (60-75 dBA)</option>
              <option value="Loud / High Pollution">Loud / High Pollution (75-85 dBA)</option>
              <option value="Hazardous / Hearing Risk">Hazardous / Hearing Risk (&gt;85 dBA)</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* History Table Card */}
      <GlassCard title={`Saved Records Archive (${records.length})`} icon={History}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading SQLite analysis records...
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No records matched your search or filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 14px', textAlign: 'center', width: '40px' }}>Compare</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Title / Filename</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Date & Time</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Duration</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Dominant Frequency</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Sound Level</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const isChecked = selectedForComparison.includes(rec.id);
                  return (
                    <tr
                      key={rec.id}
                      style={{
                        borderBottom: '1px solid var(--card-border)',
                        background: isChecked ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectForComparison(rec.id)}
                          style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.filename}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {rec.timestamp}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {rec.duration}s
                      </td>
                      <td style={{ padding: '12px 14px', color: '#38bdf8', fontWeight: 600 }}>
                        {rec.dominant_frequency} Hz
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                          {rec.dominant_band}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                        {rec.est_dba} dBA
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge badge-${rec.noise_category?.toLowerCase()?.includes('safe') ? 'safe' : 'elevated'}`}>
                          {rec.noise_category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => onOpenAnalysis(rec.id)}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            title="Open detailed FFT analysis"
                          >
                            <Play size={13} />
                            Open
                          </button>

                          <button
                            onClick={() => handleDelete(rec.id, rec.title)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              color: '#f87171',
                              borderRadius: '8px',
                              padding: '6px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Delete record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <ComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          records={records}
          initialSelectedIds={selectedForComparison}
        />
      )}
    </div>
  );
}

