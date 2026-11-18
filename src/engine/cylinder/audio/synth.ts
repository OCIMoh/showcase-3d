/**
 * Spatial / UI Sound Synthesizer via Web Audio API
 */

export class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  public isMuted = false;

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playTone(560, 'sine', 0.05, 0.08);
    }
    return this.isMuted;
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
  }

  public playTone(
    freq: number,
    type: OscillatorType = 'sine',
    duration = 0.05,
    vol = 0.06
  ): void {
    if (this.isMuted) return;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Fail silently if browser blocks autoplay or Web Audio is unavailable
    }
  }

  public destroy(): void {
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

