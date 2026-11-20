/**
 * SoundSynthesizer — Spatial / UI Sound Synthesizer via Web Audio API (Phase 5)
 * 
 * Features:
 * - Mechanical rotary dial click with dual transient detent
 * - Generative ambient harmonic drone (triad chord oscillator bank)
 * - Velocity-driven biquad low-pass filter resonance sweep
 * - Real-time stereo spatial panning
 * - Persistent mute preference in localStorage
 */

export class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  public isMuted = false;

  // Generative Ambient Drone Nodes
  private droneInitialized = false;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private dronePanner: StereoPannerNode | null = null;
  private droneOscs: OscillatorNode[] = [];

  constructor() {
    // Restore saved user preference from localStorage
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('showcase3d_audio_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Initializes the generative ambient harmonic drone on first user interaction.
   */
  public initDrone(): void {
    if (this.droneInitialized) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Master Drone Gain
      this.droneGain = ctx.createGain();
      const targetGain = this.isMuted ? 0.0001 : 0.022;
      this.droneGain.gain.setValueAtTime(0.0001, now);
      this.droneGain.gain.exponentialRampToValueAtTime(targetGain, now + 1.2);

      // 2. Dynamic Resonant Low-Pass Filter
      this.droneFilter = ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(180, now);
      this.droneFilter.Q.setValueAtTime(2.2, now);

      // 3. Stereo Spatial Panner
      if (typeof ctx.createStereoPanner === 'function') {
        this.dronePanner = ctx.createStereoPanner();
        this.dronePanner.pan.setValueAtTime(0, now);
        this.droneGain.connect(this.droneFilter);
        this.droneFilter.connect(this.dronePanner);
        this.dronePanner.connect(ctx.destination);
      } else {
        this.droneGain.connect(this.droneFilter);
        this.droneFilter.connect(ctx.destination);
      }

      // 4. Harmonic Triad Bank: Root (55 Hz A1), Fifth (82.4 Hz E2), Octave (110 Hz A2)
      const freqs = [
        { freq: 55.0, type: 'sine' as OscillatorType, vol: 0.65 },
        { freq: 82.4, type: 'triangle' as OscillatorType, vol: 0.45 },
        { freq: 110.0, type: 'sine' as OscillatorType, vol: 0.35 }
      ];

      this.droneOscs = freqs.map(({ freq, type, vol }) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(vol, now);
        osc.connect(g);
        g.connect(this.droneGain!);
        osc.start(now);
        return osc;
      });

      this.droneInitialized = true;
    } catch {
      // Autoplay restrictions
    }
  }

  /**
   * Modulates ambient drone filter cutoff and stereo pan in response to carousel velocity and position.
   */
  public updateDrone(velocity: number, panRatio = 0): void {
    if (!this.droneInitialized || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    // Modulate filter cutoff frequency: idle 180 Hz swells up to 720 Hz under rapid rotation
    if (this.droneFilter) {
      const speed = Math.abs(velocity);
      const targetCutoff = 180 + Math.min(540, speed * 480);
      this.droneFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
    }

    // Modulate stereo panner smoothly (-0.6 to +0.6)
    if (this.dronePanner) {
      const targetPan = Math.max(-0.6, Math.min(0.6, panRatio * 0.45));
      this.dronePanner.pan.setTargetAtTime(targetPan, now, 0.12);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('showcase3d_audio_muted', String(this.isMuted));
    }

    const ctx = this.ensureContext();
    if (ctx && this.droneGain) {
      const now = ctx.currentTime;
      const target = this.isMuted ? 0.0001 : 0.022;
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.exponentialRampToValueAtTime(target, now + 0.35);
    }

    if (!this.isMuted) {
      this.initDrone();
      this.playTone(560, 'sine', 0.05, 0.08);
    }
    return this.isMuted;
  }

  public setMute(muted: boolean): void {
    if (this.isMuted === muted) return;
    this.toggleMute();
  }

  public playTone(
    freq: number,
    type: OscillatorType = 'sine',
    duration = 0.05,
    vol = 0.06
  ): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Autoplay fallback
    }
  }

  /**
   * Synthesizes an authentic mechanical rotary dial detent tick (precision encoder)
   */
  public playDialClick(speed = 1.0): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.initDrone();

    try {
      const now = ctx.currentTime;
      const baseVol = Math.min(0.09, 0.035 + speed * 0.015);

      // 1. High crisp mechanical transient (rotary tooth notch)
      const oscHigh = ctx.createOscillator();
      const gainHigh = ctx.createGain();
      oscHigh.type = 'triangle';
      oscHigh.frequency.setValueAtTime(1950 + Math.min(500, speed * 120), now);
      gainHigh.gain.setValueAtTime(baseVol * 0.85, now);
      gainHigh.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
      oscHigh.connect(gainHigh);
      gainHigh.connect(ctx.destination);
      oscHigh.start(now);
      oscHigh.stop(now + 0.016);

      // 2. Low tactile body detent
      const oscLow = ctx.createOscillator();
      const gainLow = ctx.createGain();
      oscLow.type = 'sine';
      oscLow.frequency.setValueAtTime(210, now);
      gainLow.gain.setValueAtTime(baseVol * 0.55, now);
      gainLow.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
      oscLow.connect(gainLow);
      gainLow.connect(ctx.destination);
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
        // Unsupported device
      }
    }
  }

  /**
   * Synthesizes an acoustic waypoint glide tone.
   */
  public playWaypointTransition(waypoint: string): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.initDrone();

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

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
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // Autoplay fallback
    }
  }

  public destroy(): void {
    this.droneOscs.forEach(o => {
      try { o.stop(); o.disconnect(); } catch {}
    });
    this.droneOscs = [];
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}
