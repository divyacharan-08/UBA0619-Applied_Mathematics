import jsPDF from 'jspdf';

export function generateAnalysisPDF(data) {
  if (!data) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const meta = data.metadata || {};
  const analysis = data.analysis || {};
  const peaks = analysis.top_peaks || [];
  const bands = analysis.band_distribution || [];
  const noise = analysis.noise_info || {};

  // Color palette
  const darkNavy = [13, 18, 32];
  const electricBlue = [2, 132, 199];
  const textGray = [100, 116, 139];
  const textDark = [30, 41, 59];

  // Header Background Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line
  doc.setFillColor(...electricBlue);
  doc.rect(0, 41, pageWidth, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Smart Noise Pollution Monitoring System', 16, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(56, 189, 248);
  doc.text('Applied Mathematics Capstone Project | CO4 – Fourier Transform', 16, 24);

  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated on: ${new Date().toLocaleString()} | Audio: ${meta.filename || 'Audio Recording'}`, 16, 32);

  // Section 1: Executive Summary & Signal Metadata
  let y = 52;
  doc.setTextColor(...darkNavy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Audio Acquisition & Signal Preprocessing (Module 1)', 16, y);
  y += 7;

  // Metadata Grid Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(16, y, pageWidth - 32, 24, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);

  const col1 = 20;
  const col2 = 80;
  const col3 = 140;

  doc.text(`Sampling Rate: ${meta.sampling_rate || 44100} Hz`, col1, y + 7);
  doc.text(`Duration: ${meta.processed_duration || meta.raw_duration || 0} s`, col2, y + 7);
  doc.text(`Total Samples: ${(meta.sample_count || 0).toLocaleString()}`, col3, y + 7);

  doc.text(`DC Offset: Removed`, col1, y + 16);
  doc.text(`Channels: ${meta.channels || 1} (Mono)`, col2, y + 16);
  doc.text(`Window: ${analysis.window_type || 'Hann'} (Leakage Control)`, col3, y + 16);

  y += 33;

  // Section 2: Fourier Transform Frequency Analysis (CO4)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkNavy);
  doc.text('2. Fourier Transform Spectral Analysis (Module 2 - CO4)', 16, y);
  y += 7;

  // Dominant Highlight Card
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(16, y, pageWidth - 32, 22, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(67, 56, 202);
  doc.setFont('helvetica', 'bold');
  doc.text(`Dominant Frequency: ${analysis.dominant_frequency || 0} Hz`, 20, y + 9);
  doc.text(`Band Category: ${analysis.dominant_band || 'Unknown'}`, 110, y + 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text(
    `Frequency Resolution Δf = ${analysis.frequency_resolution || 0} Hz  |  Nyquist Frequency f_Nyq = ${analysis.nyquist_frequency || 0} Hz`,
    20,
    y + 16
  );

  y += 28;

  // Top 5 Dominant Frequency Peaks Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text('Top Detected Frequency Peaks:', 16, y);
  y += 5;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(16, y, pageWidth - 32, 7, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Rank', 20, y + 5);
  doc.text('Frequency (Hz)', 45, y + 5);
  doc.text('Magnitude', 90, y + 5);
  doc.text('Level (dBFS)', 125, y + 5);
  doc.text('Acoustic Band', 160, y + 5);
  y += 7;

  // Table Rows
  peaks.slice(0, 5).forEach((p, idx) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textDark);
    doc.text(`#${p.rank || idx + 1}`, 20, y + 5);
    doc.text(`${p.frequency_hz} Hz`, 45, y + 5);
    doc.text(`${p.magnitude}`, 90, y + 5);
    doc.text(`${p.magnitude_db} dB`, 125, y + 5);
    doc.text(`${p.band}`, 160, y + 5);
    y += 6;
  });

  y += 8;

  // Section 3: Noise Pollution Assessment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...darkNavy);
  doc.text('3. Environmental Noise Monitoring & WHO Classification (Module 3)', 16, y);
  y += 7;

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(16, y, pageWidth - 32, 22, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(`Sound Level: ${analysis.est_dba || 0} dBA SPL`, 20, y + 8);
  doc.text(`Classification: ${noise.category || 'Normal'} (${noise.status || 'Safe'})`, 100, y + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text(noise.desc || 'Acoustic measurement within standard guidelines.', 20, y + 16);

  y += 28;

  // Acoustic Energy Distribution
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkNavy);
  doc.text('Acoustic Band Energy Distribution:', 16, y);
  y += 5;

  bands.forEach((b) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    doc.text(`${b.name} (${b.range}):`, 20, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(`${b.percentage}%`, 75, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textGray);
    doc.text(b.desc, 95, y + 4);
    y += 5;
  });

  // Footer / Mathematical Sign-off
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 275, pageWidth, 22, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...textGray);
  doc.text(
    'Applied Mathematics Capstone: DFT Formula: X[k] = Σ x[n] exp(-j 2π k n / N) | Cooley-Tukey O(N log N)',
    pageWidth / 2,
    283,
    { align: 'center' }
  );
  doc.text('AcuFourier Smart Noise Pollution Monitoring System', pageWidth / 2, 288, { align: 'center' });

  // Save PDF
  const filename = `AcuFourier_Analysis_${meta.filename || 'recording'}.pdf`;
  doc.save(filename);
}

