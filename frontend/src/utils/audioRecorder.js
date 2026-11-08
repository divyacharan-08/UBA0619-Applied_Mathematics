// Audio recording utility using Web Audio API for live canvas visualization
// and standard 16-bit PCM WAV encoding for 100% cross-platform compatibility.

export class WavAudioRecorder {
  constructor(onVolumeUpdate = null) {
    this.audioContext = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.processorNode = null;
    this.onVolumeUpdate = onVolumeUpdate;

    this.recordedBuffers = [];
    this.recordingLength = 0;
    this.isRecording = false;
    this.isPaused = false;
    this.sampleRate = 44100;
  }

  async start() {
    this.recordedBuffers = [];
    this.recordingLength = 0;
    this.isPaused = false;

    // 1. Request microphone access
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    // 2. Initialize AudioContext
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();
    this.sampleRate = this.audioContext.sampleRate;

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // 3. Audio processor buffer collection (4096 buffer size, 1 channel mono)
    this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.processorNode.onaudioprocess = (e) => {
      if (!this.isRecording || this.isPaused) return;

      const channelData = e.inputBuffer.getChannelData(0);
      this.recordedBuffers.push(new Float32Array(channelData));
      this.recordingLength += channelData.length;

      // Optional volume calculation for UI meter
      if (this.onVolumeUpdate) {
        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += channelData[i] * channelData[i];
        }
        const rms = Math.sqrt(sum / channelData.length);
        this.onVolumeUpdate(rms);
      }
    };

    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.processorNode);
    this.processorNode.connect(this.audioContext.destination);

    this.isRecording = true;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    this.isRecording = false;
    this.isPaused = false;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }

    if (this.processorNode) {
      this.processorNode.disconnect();
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    // Merge buffers into a single Float32Array
    const merged = new Float32Array(this.recordingLength);
    let offset = 0;
    for (let i = 0; i < this.recordedBuffers.length; i++) {
      merged.set(this.recordedBuffers[i], offset);
      offset += this.recordedBuffers[i].length;
    }

    // Convert to 16-bit PCM WAV Blob
    const wavBlob = this.encodeWAV(merged, this.sampleRate);
    const audioUrl = URL.createObjectURL(wavBlob);
    const duration = this.recordingLength / this.sampleRate;

    return {
      blob: wavBlob,
      url: audioUrl,
      duration: duration,
      sampleRate: this.sampleRate,
      sampleCount: this.recordingLength,
    };
  }

  getAnalyserNode() {
    return this.analyserNode;
  }

  encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');

    // FMT sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)

    // DATA sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write PCM 16-bit samples
    let index = 44;
    for (let i = 0; i < samples.length; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(index, s, true);
      index += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

