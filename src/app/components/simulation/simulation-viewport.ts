import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SimulationEngineService } from '../../services/simulation-engine.service';
import { RobotService } from '../../services/robot.service';
import { AudioSynth } from '../../services/audio-synth';

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
}

@Component({
  selector: 'app-simulation-viewport',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="relative w-full h-full flex flex-col bg-[#050811] overflow-hidden select-none">
      <!-- Simulation Canvas -->
      <canvas 
        #simCanvas
        class="w-full h-full block cursor-default"
      ></canvas>

      <!-- Viewport Floating Top Controls -->
      <div class="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <!-- Environment Indicator & Switcher -->
        <div class="pointer-events-auto flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl backdrop-blur-md shadow-lg text-xs font-mono">
          <mat-icon class="text-cyan-400 text-base ml-1">map</mat-icon>
          <span class="text-slate-400 text-[11px]">MAP:</span>
          <select 
            [value]="simEngine.currentEnvironmentId()"
            (change)="onEnvironmentChange($event)"
            class="bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-xs text-cyan-300 font-bold focus:outline-none"
          >
            @for (env of simEngine.environments(); track env.id) {
              <option [value]="env.id">{{ env.name }}</option>
            }
          </select>
        </div>

        <!-- Simulation State Badge -->
        <div class="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-xs font-mono">
          @let status = simEngine.telemetry().status;
          <span 
            class="w-2.5 h-2.5 rounded-full"
            [class.bg-slate-500]="status === 'idle'"
            [class.bg-emerald-400]="status === 'running'"
            [class.animate-pulse]="status === 'running'"
            [class.bg-amber-400]="status === 'paused'"
            [class.bg-cyan-400]="status === 'completed'"
            [class.bg-rose-500]="status === 'failed'"
          ></span>
          <span class="font-bold uppercase tracking-wider text-slate-200">
            {{ status }}
          </span>
          @if (simEngine.activeChallenge(); as ch) {
            <span class="text-slate-500">|</span>
            <span class="text-cyan-400 font-bold truncate max-w-[140px] sm:max-w-xs">{{ ch.title }}</span>
          }
        </div>
      </div>

      <!-- Viewport Floating Bottom Playback Deck -->
      <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-lg shadow-2xl z-10 pointer-events-auto">
        <!-- Reset Button -->
        <button 
          (click)="simEngine.resetSimulation()"
          title="Reset to Starting Grid"
          class="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all active:scale-95"
        >
          <mat-icon class="text-xl">replay</mat-icon>
        </button>

        <!-- Play / Pause Primary Button -->
        @if (simEngine.telemetry().status === 'running') {
          <button 
            (click)="simEngine.pauseSimulation()"
            title="Pause Simulation"
            class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <mat-icon class="text-xl">pause</mat-icon>
            <span>PAUSE</span>
          </button>
        } @else {
          <button 
            (click)="simEngine.startSimulation()"
            title="Start Engine & Simulation"
            class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
          >
            <mat-icon class="text-xl">play_arrow</mat-icon>
            <span>RUN SIMULATION</span>
          </button>
        }

        <!-- Single Step -->
        <button 
          (click)="simEngine.stepSimulation()"
          title="Single Step Forward"
          class="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all active:scale-95"
        >
          <mat-icon class="text-xl">skip_next</mat-icon>
        </button>

        <div class="w-px h-6 bg-slate-800 mx-1"></div>

        <!-- Speed Multipliers -->
        <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          @for (spd of [0.5, 1.0, 2.0]; track spd) {
            <button 
              (click)="simEngine.setTimeScale(spd)"
              class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all"
              [class.bg-cyan-500]="simEngine.timeScale() === spd"
              [class.text-slate-950]="simEngine.timeScale() === spd"
              [class.text-slate-400]="simEngine.timeScale() !== spd"
              [class.hover:text-white]="simEngine.timeScale() !== spd"
            >
              {{ spd }}x
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class SimulationViewport implements OnInit, OnDestroy {
  @ViewChild('simCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly simEngine = inject(SimulationEngineService);
  readonly robotService = inject(RobotService);
  private audio = inject(AudioSynth);

  private ctx: CanvasRenderingContext2D | null = null;
  private renderAnimId: number | null = null;
  private sparks: SparkParticle[] = [];
  private boundResize = this.onResize.bind(this);

  ngOnInit() {
    if (typeof window === 'undefined') return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.onResize();

    window.addEventListener('resize', this.boundResize);
    this.renderLoop();
  }

  ngOnDestroy() {
    if (this.renderAnimId) {
      cancelAnimationFrame(this.renderAnimId);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.boundResize);
    }
  }

  private onResize() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 600;
  }

  onEnvironmentChange(e: Event) {
    const envId = (e.target as HTMLSelectElement).value;
    this.simEngine.setEnvironment(envId);
    this.audio.playClick();
  }

  private renderLoop = () => {
    this.draw();
    this.renderAnimId = requestAnimationFrame(this.renderLoop);
  };

  private draw() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    const env = this.simEngine.currentEnvironment();
    const tele = this.simEngine.telemetry();

    // Scale canvas to fit env dimensions (800 x 600)
    const scaleX = canvas.width / env.width;
    const scaleY = canvas.height / env.height;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - env.width * scale) / 2;
    const offsetY = (canvas.height - env.height * scale) / 2;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark backdrop
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply environment coordinate space
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // 1. Environment Floor Background
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, env.width, env.height);

    // Technical grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= env.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, env.height);
      ctx.stroke();
    }
    for (let y = 0; y <= env.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(env.width, y);
      ctx.stroke();
    }

    // 2. Floor Line Paths (e.g. Test Track / Warehouse guide lanes)
    if (env.linePaths) {
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      for (const path of env.linePaths) {
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
          if (i === 0) ctx.moveTo(path[i].x, path[i].y);
          else ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    // 3. Thermal Hazard Zones (Rescue environment)
    if (env.heatZones) {
      for (const hz of env.heatZones) {
        const grad = ctx.createRadialGradient(hz.x, hz.y, 10, hz.x, hz.y, hz.radius);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.15)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Target Extraction Zone
    if (env.targetZone) {
      const tz = env.targetZone;
      const pulse = (Math.sin(Date.now() / 300) + 1) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(tz.x, tz.y, tz.radius + pulse * 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tz.x, tz.y, tz.radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#67e8f9';
      ctx.textAlign = 'center';
      ctx.fillText(tz.label, tz.x, tz.y + 3);
      ctx.restore();
    }

    // 5. Draw Obstacles
    for (const ob of env.obstacles) {
      ctx.save();
      ctx.fillStyle = ob.color || '#334155';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;

      if (ob.type === 'circle' && ob.radius) {
        ctx.beginPath();
        ctx.arc(ob.x, ob.y, ob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner marker
        ctx.beginPath();
        ctx.arc(ob.x, ob.y, ob.radius * 0.4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
      } else if (ob.width && ob.height) {
        const rx = ob.x - ob.width / 2;
        const ry = ob.y - ob.height / 2;
        ctx.fillRect(rx, ry, ob.width, ob.height);
        ctx.strokeRect(rx, ry, ob.width, ob.height);

        // Hazard stripes on walls
        if (ob.width > 200 || ob.height > 200) {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 12]);
          ctx.strokeRect(rx + 2, ry + 2, ob.width - 4, ob.height - 4);
        }
      }

      if (ob.label) {
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(ob.label, ob.x, ob.y + 3);
      }
      ctx.restore();
    }

    // 6. Draw Robot & Active Sensor Cones
    const rx = tele.robotX;
    const ry = tele.robotY;
    const angleRad = (tele.headingDeg * Math.PI) / 180;

    // ACTIVE SENSOR VISUALIZATION: Ultrasonic Radar Cone
    const distCm = tele.sensorReadings.ultrasonic?.distanceCm || 250;
    const beamAngleRad = (35 * Math.PI) / 180;
    const coneDistPx = distCm * 2.0;

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(angleRad);

    // Sonar Beam Cone
    const coneGrad = ctx.createRadialGradient(24, 0, 10, 24, 0, coneDistPx);
    const isClose = distCm < 30;
    coneGrad.addColorStop(0, isClose ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.25)');
    coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.arc(22, 0, coneDistPx, -beamAngleRad / 2, beamAngleRad / 2);
    ctx.closePath();
    ctx.fillStyle = coneGrad;
    ctx.fill();

    // Cone boundary lines
    ctx.strokeStyle = isClose ? '#ef4444' : 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Sonar hit point
    if (distCm < 240) {
      ctx.beginPath();
      ctx.arc(22 + coneDistPx, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = isClose ? '#ef4444' : '#38bdf8';
      ctx.fill();
    }

    // ROBOT SCHEMATIC CHASSIS & WHEELS
    // Left & Right Wheels
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.fillRect(-16, -26, 32, 10);
    ctx.fillRect(-16, 16, 32, 10);

    // Chassis Box
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-22, -18, 44, 36, 6);
    ctx.fill();
    ctx.stroke();

    // Central Controller Core
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-10, -10, 20, 20, 3);
    ctx.fill();

    // Pulsing heartbeat LED
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = tele.status === 'running' ? '#38bdf8' : '#64748b';
    ctx.fill();

    // Ultrasonic Sonar Transducers on Front
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(22, -7, 4, 0, Math.PI * 2);
    ctx.arc(22, 7, 4, 0, Math.PI * 2);
    ctx.fill();

    // Direction arrow
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(8, -4);
    ctx.lineTo(8, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.restore();
  }
}
