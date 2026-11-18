/**
 * Frame-rate independent exponential damping helper.
 * c += (t - c) * (1 - Math.exp(-lambda * dt))
 */

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1.0 - Math.exp(-lambda * dt));
}

/**
 * Encapsulated damped scalar value with automatic velocity tracking.
 */
export class DampedValue {
  public current: number;
  public target: number;
  public lambda: number;
  public velocity = 0;

  constructor(initial = 0, lambda = 5.33) {
    this.current = initial;
    this.target = initial;
    this.lambda = lambda;
  }

  public set(value: number): void {
    this.current = value;
    this.target = value;
    this.velocity = 0;
  }

  public update(dt: number, normalizeTo60 = true): number {
    const prev = this.current;
    this.current = damp(this.current, this.target, this.lambda, dt);
    if (normalizeTo60) {
      this.velocity = (this.current - prev) * (1.0 / (dt * 60.0));
    } else {
      this.velocity = (this.current - prev) / dt;
    }
    return this.current;
  }
}

