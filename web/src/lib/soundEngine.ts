// Web Audio API ambient sound and typewriter audio synthesizer
// 100% native browser audio synthesis, zero external mp3/asset dependencies.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private isRainPlaying: boolean = false;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // 1. Rain Ambience Generator (White/Pink noise through lowpass & bandpass filters)
  public startRain(volume: number = 0.15) {
    if (this.isRainPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter for muffled indoor rain sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);

      // Gain control
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(volume, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.ctx.destination);

      whiteNoise.start(0);
      this.rainNode = whiteNoise;
      this.isRainPlaying = true;
    } catch (e) {
      console.warn('Failed to start rain audio:', e);
    }
  }

  public stopRain() {
    if (!this.isRainPlaying) return;
    try {
      if (this.rainNode && 'stop' in this.rainNode) {
        (this.rainNode as AudioBufferSourceNode).stop();
        this.rainNode.disconnect();
      }
      this.rainNode = null;
      this.isRainPlaying = false;
    } catch (e) {}
  }

  public toggleRain(volume: number = 0.15): boolean {
    if (this.isRainPlaying) {
      this.stopRain();
      return false;
    } else {
      this.startRain(volume);
      return true;
    }
  }

  public isRainActive(): boolean {
    return this.isRainPlaying;
  }

  // 2. Subtle Typewriter Click (Tiny 15ms high frequency tap)
  public playTypewriterClick(volume: number = 0.04) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 1200 + (Math.random() * 300 - 150);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.018);
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
