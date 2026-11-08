import React, { useRef, useEffect } from 'react';

export default function AudioVisualizer({ analyserNode, isRecording, isPaused, height = 160 }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let phase = 0;

    const render = () => {
      const width = rect.width;
      const h = height;

      ctx.clearRect(0, 0, width, h);

      if (isRecording && analyserNode && !isPaused) {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(dataArray);

        // Draw Live Oscilloscope Waveform
        ctx.lineWidth = 2.5;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#0284c7');
        gradient.addColorStop(0.5, '#38bdf8');
        gradient.addColorStop(1, '#06b6d4');
        ctx.strokeStyle = gradient;

        // Shadow glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, h / 2);
        ctx.stroke();
      } else {
        // Idle / paused subtle ambient sine wave
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.3)';

        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = h / 2 + Math.sin(x * 0.02 + phase) * (isPaused ? 4 : 10);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += 0.04;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isRecording, isPaused, height]);

  return (
    <div style={{
      width: '100%',
      height: `${height}px`,
      borderRadius: '16px',
      background: 'rgba(7, 11, 20, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {!isRecording && (
        <div style={{
          position: 'absolute',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          background: 'rgba(15, 23, 42, 0.75)',
          padding: '4px 12px',
          borderRadius: '9999px',
          border: '1px solid var(--card-border)',
          pointerEvents: 'none'
        }}>
          Microphone Standby • Press Record to capture
        </div>
      )}
    </div>
  );
}

