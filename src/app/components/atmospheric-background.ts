import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

@Component({
  selector: 'app-atmospheric-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
    <canvas 
      #bgCanvas 
      class="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
      [class.opacity-25]="isLowIntensityRoute()"
      [class.opacity-70]="!isLowIntensityRoute()"
    ></canvas>
    <div class="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-transparent via-[#070a12]/50 to-[#070a12]"></div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AtmosphericBackground implements OnInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private router = inject(Router);

  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  private particles: Particle[] = [];
  private mouse = { x: -1000, y: -1000, radius: 120 };
  private boundResize = this.onResize.bind(this);
  private boundMouseMove = this.onMouseMove.bind(this);

  isLowIntensityRoute(): boolean {
    const url = this.router.url;
    return url.includes('/forge') || url.includes('/simulation') || url.includes('/code');
  }

  ngOnInit() {
    if (typeof window === 'undefined') return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.onResize();

    window.addEventListener('resize', this.boundResize);
    window.addEventListener('mousemove', this.boundMouseMove);

    this.initParticles();
    this.loop();
  }

  ngOnDestroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.boundResize);
      window.removeEventListener('mousemove', this.boundMouseMove);
    }
  }

  private onResize() {
    if (typeof window === 'undefined') return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.initParticles();
  }

  private onMouseMove(e: MouseEvent) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  private initParticles() {
    const canvas = this.canvasRef.nativeElement;
    if (!canvas.width || !canvas.height) return;

    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 22000));
    this.particles = [];

    const colors = ['#38bdf8', '#818cf8', '#06b6d4', '#94a3b8'];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() < 0.2 ? Math.random() * 2 + 1.5 : Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  private loop = () => {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    const gridSize = 48;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Update & draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Mouse repulsion / shift
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < this.mouse.radius && dist > 0) {
        const force = (1 - dist / this.mouse.radius) * 0.8;
        p.x += (dx / dist) * force * 2.5;
        p.y += (dy / dist) * force * 2.5;
      }

      // Normal drift
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < 90) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = (1 - d / 90) * 0.12;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1.0;
    this.animId = requestAnimationFrame(this.loop);
  };
}
