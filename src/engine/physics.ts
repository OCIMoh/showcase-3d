/**
 * FruitPhysics — 2D Rigid Body Fruit Physics Engine
 * Implements impulse kinematics, restitution, friction,
 * rotational torque, pointer throwing, and radial explosive blast dynamics.
 */

export interface FruitConfig {
  type: string;
  name: string;
  color: string;
  inner: string;
  radius: number;
  aspect: number;
}

export interface PhysicsBody extends FruitConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVel: number;
  mass: number;
}

export class FruitPhysics {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public bodies: PhysicsBody[] = [];
  private gravity = 0.55;
  private restitution = 0.32; // Low elasticity for organic fruit landing
  private friction = 0.94;    // High friction for natural fruit stacking
  private angularDrag = 0.97;

  private width = 0;
  private height = 0;
  private isRunning = true;
  private isDragging = false;
  private draggedBody: PhysicsBody | null = null;
  private dragOffset = { x: 0, y: 0 };
  private lastPointer = { x: 0, y: 0 };
  private pointerVel = { x: 0, y: 0 };

  private fruitPalettes: FruitConfig[] = [
    { type: 'orange', name: 'Arancia Rossa', color: '#e94e1b', inner: '#f39200', radius: 44, aspect: 1.0 },
    { type: 'lemon', name: 'Limone IGP', color: '#ffcc00', inner: '#fce368', radius: 40, aspect: 1.3 },
    { type: 'pear', name: 'Pera Coscia', color: '#d8b948', inner: '#e4c965', radius: 46, aspect: 1.4 },
    { type: 'strawberry', name: 'Fragola di Maletto', color: '#d42a3a', inner: '#eb4656', radius: 32, aspect: 1.15 },
    { type: 'mulberry', name: 'Gelso Nero', color: '#4a1525', inner: '#682438', radius: 30, aspect: 1.25 },
    { type: 'pistachio', name: 'Pistacchio Bronte', color: '#6a8d3b', inner: '#86ad49', radius: 26, aspect: 1.2 }
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context for physics canvas');
    this.ctx = ctx;

    this.resize();
    this.bindEvents();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  public resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private bindEvents(): void {
    window.addEventListener('resize', () => this.resize());

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const onStart = (e: MouseEvent | TouchEvent) => {
      const pos = getPos(e);
      this.lastPointer = { ...pos };
      this.pointerVel = { x: 0, y: 0 };

      // Find clicked fruit
      for (let i = this.bodies.length - 1; i >= 0; i--) {
        const b = this.bodies[i];
        const dx = pos.x - b.x;
        const dy = pos.y - b.y;
        if (Math.hypot(dx, dy) < b.radius * 1.25) {
          this.isDragging = true;
          this.draggedBody = b;
          this.dragOffset = { x: dx, y: dy };
          return;
        }
      }

      // If clicked empty space, trigger radial explosion blast!
      this.blast(pos.x, pos.y, 20);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      const pos = getPos(e);
      this.pointerVel = {
        x: (pos.x - this.lastPointer.x) * 0.75,
        y: (pos.y - this.lastPointer.y) * 0.75
      };
      this.lastPointer = { ...pos };

      if (this.isDragging && this.draggedBody) {
        this.draggedBody.x = pos.x - this.dragOffset.x;
        this.draggedBody.y = pos.y - this.dragOffset.y;
        this.draggedBody.vx = this.pointerVel.x;
        this.draggedBody.vy = this.pointerVel.y;
      }
    };

    const onEnd = () => {
      if (this.isDragging && this.draggedBody) {
        this.draggedBody.vx = this.pointerVel.x * 1.3;
        this.draggedBody.vy = this.pointerVel.y * 1.3;
        this.draggedBody.angularVel = (Math.random() - 0.5) * 0.25;
      }
      this.isDragging = false;
      this.draggedBody = null;
    };

    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  public spawnFruit(x?: number, y?: number, vx = 0, vy = 0): void {
    const config = this.fruitPalettes[Math.floor(Math.random() * this.fruitPalettes.length)];
    const responsiveScale = Math.min(Math.max(this.width / 1200, 0.75), 1.25);
    const body: PhysicsBody = {
      ...config,
      radius: config.radius * responsiveScale,
      x: x ?? Math.random() * (this.width - 200) + 100,
      y: y ?? -60,
      vx: vx || (Math.random() - 0.5) * 3,
      vy: vy || Math.random() * 2 + 1,
      angle: Math.random() * Math.PI * 2,
      angularVel: (Math.random() - 0.5) * 0.1,
      mass: (config.radius * responsiveScale) * 0.15
    };
    this.bodies.push(body);
  }

  public blast(originX: number, originY: number, force = 22): void {
    this.bodies.forEach(b => {
      const dx = b.x - originX;
      const dy = b.y - originY;
      const dist = Math.hypot(dx, dy) || 1;
      const power = Math.max(0, 1 - dist / 500) * force;
      b.vx += (dx / dist) * power;
      b.vy += (dy / dist) * power - 4; // slight upward pop
      b.angularVel += (Math.random() - 0.5) * 0.35;
    });
  }

  public update(): void {
    const floorY = this.height - 30;

    for (let i = 0; i < this.bodies.length; i++) {
      const b = this.bodies[i];
      if (b === this.draggedBody) continue;

      // Apply Gravity
      b.vy += this.gravity;
      b.vx *= 0.992;
      b.vy *= 0.995;
      b.angularVel *= this.angularDrag;

      // Update positions
      b.x += b.vx;
      b.y += b.vy;
      b.angle += b.angularVel;

      // Floor collision
      if (b.y + b.radius > floorY) {
        b.y = floorY - b.radius;
        b.vy = -b.vy * this.restitution;
        b.vx *= this.friction;
        b.angularVel *= 0.85;
      }

      // Walls collision
      if (b.x - b.radius < 20) {
        b.x = 20 + b.radius;
        b.vx = -b.vx * this.restitution;
      } else if (b.x + b.radius > this.width - 20) {
        b.x = this.width - 20 - b.radius;
        b.vx = -b.vx * this.restitution;
      }

      // Inter-body collision response
      for (let j = i + 1; j < this.bodies.length; j++) {
        const other = this.bodies[j];
        const dx = other.x - b.x;
        const dy = other.y - b.y;
        const dist = Math.hypot(dx, dy);
        const minDist = b.radius + other.radius;

        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          const separationRatio = 0.5;
          b.x -= nx * overlap * separationRatio;
          b.y -= ny * overlap * separationRatio;
          other.x += nx * overlap * separationRatio;
          other.y += ny * overlap * separationRatio;

          const kx = b.vx - other.vx;
          const ky = b.vy - other.vy;
          const p = 2 * (nx * kx + ny * ky) / (b.mass + other.mass);

          b.vx -= p * other.mass * nx * (1 + this.restitution);
          b.vy -= p * other.mass * ny * (1 + this.restitution);
          other.vx += p * b.mass * nx * (1 + this.restitution);
          other.vy += p * b.mass * ny * (1 + this.restitution);

          const tangentVelocity = -ny * kx + nx * ky;
          b.angularVel += tangentVelocity * 0.002;
          other.angularVel -= tangentVelocity * 0.002;
        }
      }
    }
  }

  private drawFruit(b: PhysicsBody): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);

    ctx.shadowColor = 'rgba(43, 27, 23, 0.16)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 10;

    ctx.beginPath();
    ctx.fillStyle = b.color;
    ctx.strokeStyle = '#762530';
    ctx.lineWidth = 2.5;

    if (b.type === 'orange') {
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.stroke();

      ctx.fillStyle = '#2f743e';
      ctx.beginPath();
      ctx.ellipse(0, -b.radius + 2, 8, 16, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.type === 'lemon') {
      ctx.ellipse(0, 0, b.radius * 1.25, b.radius * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(-b.radius * 1.2, 0, 5, 0, Math.PI * 2);
      ctx.arc(b.radius * 1.2, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
    } else if (b.type === 'pear') {
      ctx.beginPath();
      ctx.arc(0, b.radius * 0.35, b.radius * 0.85, 0, Math.PI * 2);
      ctx.arc(0, -b.radius * 0.5, b.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = '#5a3d28';
      ctx.lineWidth = 3;
      ctx.moveTo(0, -b.radius * 0.9);
      ctx.quadraticCurveTo(6, -b.radius * 1.3, 10, -b.radius * 1.4);
      ctx.stroke();
    } else {
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(-b.radius * 0.3, -b.radius * 0.3, b.radius * 0.45, Math.PI * 0.9, Math.PI * 1.6);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

  public loop(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.update();
    for (const body of this.bodies) {
      this.drawFruit(body);
    }
    if (this.isRunning) {
      requestAnimationFrame(this.loop);
    }
  }

  public destroy(): void {
    this.isRunning = false;
  }
}

