import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AudioSynth } from '../services/audio-synth';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 select-none">
      <!-- Hero Header Section -->
      <div class="text-center max-w-3xl mx-auto space-y-6">
        <!-- Technical Tagline Kicker -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-mono tracking-wider">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>VIRTUAL ROBOTICS LABORATORY</span>
        </div>

        <!-- Headline -->
        <h1 class="text-4xl sm:text-6xl font-extrabold text-white font-display tracking-tight leading-[1.1]">
          Build machines.<br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            Write intelligence.
          </span><br />
          Engineer the future.
        </h1>

        <!-- Subtitle -->
        <p class="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto">
          Design custom robots with real motors and sensors, program reactive behavioral logic, and test inside an authentic 2D physics simulation sandbox.
        </p>

        <!-- Primary & Secondary CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a 
            routerLink="/forge" 
            (click)="playClick()"
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all active:scale-95"
          >
            <mat-icon class="text-lg">hardware</mat-icon>
            <span>ENTER THE FORGE</span>
          </a>

          <a 
            routerLink="/simulation" 
            (click)="playClick()"
            class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2 border border-slate-700/80 transition-all active:scale-95"
          >
            <mat-icon class="text-lg">smart_toy</mat-icon>
            <span>EXPLORE SIMULATION</span>
          </a>
        </div>
      </div>

      <!-- Stylized Interactive Hero Schematic Visualization -->
      <div class="mt-14 lg:mt-20 max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-slate-900/90 to-[#070b15] border border-cyan-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
        <!-- Glowing radial backdrop -->
        <div class="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Schematic Frame Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 text-xs font-mono text-slate-400">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span class="text-white font-bold">SYSTEM SCHEMATIC: TITAN-X ROVER</span>
          </div>
          <div class="hidden sm:flex items-center gap-4">
            <span>CHASSIS: POLYCARBONATE</span>
            <span>SONAR: 200cm</span>
            <span class="text-emerald-400">STATUS: READY</span>
          </div>
        </div>

        <!-- Robot Blueprint Graphic -->
        <div class="h-64 sm:h-80 w-full flex items-center justify-center relative">
          <svg class="w-full h-full max-w-md" viewBox="-180 -140 360 280">
            <!-- Grid lines -->
            <line x1="-160" y1="0" x2="160" y2="0" stroke="rgba(56, 189, 248, 0.15)" stroke-dasharray="4 4" />
            <line x1="0" y1="-120" x2="0" y2="120" stroke="rgba(56, 189, 248, 0.15)" stroke-dasharray="4 4" />

            <!-- Sonar Acoustic Waves on Front -->
            <path d="M 0 -80 L -60 -130 L 60 -130 Z" fill="rgba(6, 182, 212, 0.08)" stroke="rgba(6, 182, 212, 0.3)" stroke-dasharray="3 3" />

            <!-- Wheels -->
            <rect x="-88" y="-55" width="24" height="110" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="2" />
            <rect x="64" y="-55" width="24" height="110" rx="8" fill="#0f172a" stroke="#0284c7" stroke-width="2" />

            <!-- Chassis Frame -->
            <rect x="-60" y="-75" width="120" height="150" rx="16" fill="#111827" stroke="#38bdf8" stroke-width="2.5" />

            <!-- Motors -->
            <rect x="-48" y="-20" width="28" height="40" rx="4" fill="#1e293b" stroke="#06b6d4" stroke-width="1.5" />
            <rect x="20" y="-20" width="28" height="40" rx="4" fill="#1e293b" stroke="#06b6d4" stroke-width="1.5" />

            <!-- Central Microcontroller -->
            <rect x="-24" y="-24" width="48" height="48" rx="6" fill="#1e1b4b" stroke="#818cf8" stroke-width="2" />
            <circle cx="0" cy="0" r="6" fill="#38bdf8" class="animate-ping" />

            <!-- Ultrasonic Sonar Transducer -->
            <rect x="-28" y="-85" width="56" height="22" rx="4" fill="#0f172a" stroke="#34d399" stroke-width="2" />
            <circle cx="-14" cy="-74" r="7" fill="#1e293b" stroke="#34d399" stroke-width="1.5" />
            <circle cx="14" cy="-74" r="7" fill="#1e293b" stroke="#34d399" stroke-width="1.5" />

            <!-- Battery Pack -->
            <rect x="-25" y="32" width="50" height="30" rx="4" fill="#064e3b" stroke="#10b981" stroke-width="2" />
            <text x="0" y="52" text-anchor="middle" fill="#a7f3d0" font-size="8" font-family="monospace">5000mAh</text>
          </svg>
        </div>

        <!-- Quick Spec Callout Grid below blueprint -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800 text-center font-mono">
          <div>
            <span class="text-[10px] text-slate-400 block uppercase">PROPULSION SPEED</span>
            <span class="text-sm font-bold text-cyan-400">4.2 m/s</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block uppercase">SONAR DETECTION</span>
            <span class="text-sm font-bold text-emerald-400">200 cm RANGE</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block uppercase">BATTERY BANK</span>
            <span class="text-sm font-bold text-amber-400">11.1V LI-ION</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 block uppercase">AUTONOMOUS CORTEX</span>
            <span class="text-sm font-bold text-indigo-400">16MHz MCU</span>
          </div>
        </div>
      </div>

      <!-- The Core Engineering Philosophy Breakdown -->
      <div class="mt-20 text-center max-w-4xl mx-auto">
        <h2 class="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-3">
          ENGINEERING LIFECYCLE
        </h2>
        <p class="text-2xl sm:text-3xl font-black text-white font-display">
          «BUILD IT. PROGRAM IT. TEST IT. BREAK IT. IMPROVE IT.»
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 text-left">
          <!-- Step 1 -->
          <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div class="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
              <mat-icon>hardware</mat-icon>
            </div>
            <h3 class="text-base font-bold text-white font-display">01. Construct Machine</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              Mount chassis frames, high-torque gearmotors, traction wheels, lithium battery cells, and ultrasonic sonar sensors to an interactive snap grid.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div class="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-4">
              <mat-icon>terminal</mat-icon>
            </div>
            <h3 class="text-base font-bold text-white font-display">02. Program Intelligence</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              Write autonomous instructions using intuitive Beginner Robot Commands (DSL) or standard JavaScript to react dynamically to distance thresholds and sensors.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div class="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
              <mat-icon>smart_toy</mat-icon>
            </div>
            <h3 class="text-base font-bold text-white font-display">03. Real 2D Physics Sim</h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              Deploy your machine into mazes, obstacle tracks, and emergency rescue arenas. Observe real sonar raycasting, battery depletion, and collision physics.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Landing {
  private audio = inject(AudioSynth);

  playClick() {
    this.audio.playClick();
  }
}
