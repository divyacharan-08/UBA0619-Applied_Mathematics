import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './pages/DashboardPage';
import RecordPage from './pages/RecordPage';
import UploadPage from './pages/UploadPage';
import FrequencyAnalysisPage from './pages/FrequencyAnalysisPage';
import NoiseMonitoringPage from './pages/NoiseMonitoringPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';

import {
  checkBackendHealth,
  fetchStatisticsApi,
  fetchHistoryApi,
  fetchHistoryDetailApi
} from './utils/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('acufourier_theme') || 'blue');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [backendStatus, setBackendStatus] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [recentRecordings, setRecentRecordings] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Synchronize Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSelectTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('acufourier_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Initial Data Load (Backend Health, History, Statistics, Default Seed Sample)
  const refreshAllData = async () => {
    try {
      const health = await checkBackendHealth();
      setBackendStatus(health);

      const stats = await fetchStatisticsApi();
      setStatistics(stats.statistics);

      const hist = await fetchHistoryApi('', '', 20);
      setRecentRecordings(hist.records || []);

      // If no analysis is active yet, load the first sample recording from DB
      if (!currentAnalysis && hist.records && hist.records.length > 0) {
        const detail = await fetchHistoryDetailApi(hist.records[0].id);
        if (detail && detail.record) {
          const rec = detail.record;
          setCurrentAnalysis({
            id: rec.id,
            audio_url: rec.audio_url,
            metadata: {
              filename: rec.filename,
              sampling_rate: rec.sample_rate,
              sample_count: rec.sample_count,
              channels: rec.channels,
              processed_duration: rec.duration,
              raw_duration: rec.duration
            },
            analysis: {
              dominant_frequency: rec.dominant_frequency,
              dominant_band: rec.dominant_band,
              est_dba: rec.est_dba,
              noise_info: {
                category: rec.noise_category,
                status: rec.noise_status
              },
              rms: rec.rms,
              window_type: rec.window_type,
              peak_count: rec.peak_count,
              top_peaks: rec.top_peaks,
              band_distribution: rec.band_distribution,
              waveform: rec.waveform,
              spectrum: rec.spectrum,
              nyquist_frequency: rec.sample_rate / 2,
              frequency_resolution: (rec.sample_rate / rec.sample_count).toFixed(2)
            }
          });
        }
      }
    } catch (err) {
      console.warn('Initial data load notice:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleNavigate = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (newAnalysisResult) => {
    setCurrentAnalysis(newAnalysisResult);
    refreshAllData();
    // Navigate straight to Frequency Analysis module to view results
    setCurrentPage('frequency');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAnalysis = async (recordId) => {
    try {
      const detail = await fetchHistoryDetailApi(recordId);
      if (detail && detail.record) {
        const rec = detail.record;
        setCurrentAnalysis({
          id: rec.id,
          audio_url: rec.audio_url,
          metadata: {
            filename: rec.filename,
            sampling_rate: rec.sample_rate,
            sample_count: rec.sample_count,
            channels: rec.channels,
            processed_duration: rec.duration,
            raw_duration: rec.duration
          },
          analysis: {
            dominant_frequency: rec.dominant_frequency,
            dominant_band: rec.dominant_band,
            est_dba: rec.est_dba,
            noise_info: {
              category: rec.noise_category,
              status: rec.noise_status
            },
            rms: rec.rms,
            window_type: rec.window_type,
            peak_count: rec.peak_count,
            top_peaks: rec.top_peaks,
            band_distribution: rec.band_distribution,
            waveform: rec.waveform,
            spectrum: rec.spectrum,
            nyquist_frequency: rec.sample_rate / 2,
            frequency_resolution: (rec.sample_rate / rec.sample_count).toFixed(2)
          }
        });
        setCurrentPage('frequency');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      alert(`Could not open recording: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      {/* Background Animated Gradient Mesh Orbs */}
      <div className="bg-ambient-orb orb-1" />
      <div className="bg-ambient-orb orb-2" />
      <div className="bg-ambient-orb orb-3" />

      {/* Collapsible Glass Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Topbar
          currentPage={currentPage}
          currentTheme={theme}
          onSelectTheme={handleSelectTheme}
          backendStatus={backendStatus}
        />

        <main className="page-wrapper">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              statistics={statistics}
              recentRecordings={recentRecordings}
              currentAnalysis={currentAnalysis}
              onOpenAnalysis={handleOpenAnalysis}
            />
          )}

          {currentPage === 'recording' && (
            <RecordPage onAnalysisComplete={handleAnalysisComplete} />
          )}

          {currentPage === 'upload' && (
            <UploadPage onAnalysisComplete={handleAnalysisComplete} />
          )}

          {currentPage === 'frequency' && (
            <FrequencyAnalysisPage
              analysisData={currentAnalysis}
              onNavigate={handleNavigate}
              onUpdateAnalysis={setCurrentAnalysis}
              availableRecordings={recentRecordings}
            />
          )}

          {currentPage === 'noise' && (
            <NoiseMonitoringPage
              analysisData={currentAnalysis}
              allRecords={recentRecordings}
              onOpenAnalysis={handleOpenAnalysis}
            />
          )}

          {currentPage === 'history' && (
            <HistoryPage
              onOpenAnalysis={handleOpenAnalysis}
              onRefreshRecords={refreshAllData}
            />
          )}

          {currentPage === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
}
