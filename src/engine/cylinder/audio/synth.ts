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

  /**
   * Synthesizes an authentic mechanical rotary dial detent tick (Leica dial / precision encoder)
   * with dual-component transient click and low-frequency tactile body.
   */
  public playDialClick(speed = 1.0): void {
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

      const now = this.audioCtx.currentTime;
      const baseVol = Math.min(0.09, 0.035 + speed * 0.015);

      // 1. High crisp mechanical transient (rotary tooth notch)
      const oscHigh = this.audioCtx.createOscillator();
      const gainHigh = this.audioCtx.createGain();
      oscHigh.type = 'triangle';
      oscHigh.frequency.setValueAtTime(1950 + Math.min(500, speed * 120), now);
      gainHigh.gain.setValueAtTime(baseVol * 0.85, now);
      gainHigh.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
      oscHigh.connect(gainHigh);
      gainHigh.connect(this.audioCtx.destination);
      oscHigh.start(now);
      oscHigh.stop(now + 0.016);

      // 2. Low tactile body detent
      const oscLow = this.audioCtx.createOscillator();
      const gainLow = this.audioCtx.createGain();
      oscLow.type = 'sine';
      oscLow.frequency.setValueAtTime(210, now);
      gainLow.gain.setValueAtTime(baseVol * 0.55, now);
      gainLow.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
      oscLow.connect(gainLow);
      gainLow.connect(this.audioCtx.destination);
      oscLow.start(now);
      oscLow.stop(now + 0.024);
    } catch {
      // Autoplay fallback
    }
  }

  /**
   * Fires a subtle physical micro-vibration pulse on touch/mobile devices.
   */
  public triggerHaptic(duration = 10): void {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(duration);
      } catch {
        // Unsupported device or restricted context
      }
    }
  }

  /**
   * Synthesizes an acoustic waypoint glide tone.
   */
  public playWaypointTransition(waypoint: string): void {
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

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      switch (waypoint) {
        case 'STUDIO': {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
          gain.gain.setValueAtTime(0.045, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
          break;
        }
        case 'DRAWER': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
          break;
        }
        case 'STAGE': {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
          break;
        }
        default: {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(330, now);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
          break;
        }
      }

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // Autoplay fallback
    }
  }

  public destroy(): void {
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

