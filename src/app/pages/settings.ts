import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AudioSynth } from '../services/audio-synth';
import { ProgressService } from '../services/progress.service';
import { RobotService } from '../services/robot.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      <!-- Header -->
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <mat-icon class="text-sm">tune</mat-icon>
          <span>LABORATORY CONFIGURATION</span>
        </div>
        <h1 class="text-3xl font-black text-white font-display">
          Settings & Preferences
        </h1>
        <p class="text-xs sm:text-sm text-slate-400">
          Configure telemetry units, acoustic feedback, workbench snapping, and local data persistence.
        </p>
      </div>

      <!-- Settings Cards Container -->
      <div class="space-y-6">
        <!-- Audio & Acoustics Section -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
            <mat-icon class="text-cyan-400 text-lg">volume_up</mat-icon>
            <h3 class="text-sm font-bold text-white font-mono uppercase">Audio Feedback & Acoustics</h3>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-slate-200">Acoustic Telemetry & Mechanical Hums</div>
              <div class="text-[11px] text-slate-400">Pure Web Audio synthesized sensor clicks, crash sounds, and sonar pings.</div>
            </div>
            <button 
              (click)="audio.toggleMute()"
              class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all"
              [class.bg-emerald-500]="!audio.isMuted()"
              [class.text-slate-950]="!audio.isMuted()"
              [class.bg-slate-800]="audio.isMuted()"
              [class.text-slate-400]="audio.isMuted()"
            >
              {{ audio.isMuted() ? 'MUTED' : 'ENABLED' }}
            </button>
          </div>
        </div>

        <!-- Workbench Grid Settings -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
            <mat-icon class="text-cyan-400 text-lg">grid_4x4</mat-icon>
            <h3 class="text-sm font-bold text-white font-mono uppercase">Workbench Snapping Grid</h3>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-slate-200">Coordinate Snapping Precision</div>
              <div class="text-[11px] text-slate-400">Snap components to structural increments during assembly.</div>
            </div>
            <div class="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              @for (snap of [10, 20]; track snap) {
                <button 
                  (click)="selectedSnap.set(snap)"
                  class="px-3 py-1 rounded-lg font-bold transition-all"
                  [class.bg-cyan-500]="selectedSnap() === snap"
                  [class.text-slate-950]="selectedSnap() === snap"
                  [class.text-slate-400]="selectedSnap() !== snap"
                >
                  {{ snap }}px
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Telemetry Measurement Units -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
            <mat-icon class="text-cyan-400 text-lg">straighten</mat-icon>
            <h3 class="text-sm font-bold text-white font-mono uppercase">Measurement Calibration</h3>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-slate-200">Standard Dimensional Units</div>
              <div class="text-[11px] text-slate-400">Units utilized across speed (m/s), sonar (cm), and mass (kg).</div>
            </div>
            <span class="text-xs font-mono text-cyan-400 font-bold px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40">
              METRIC (SI)
            </span>
          </div>
        </div>

        <!-- Storage & Reset -->
        <div class="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
          <div class="flex items-center gap-2 border-b border-rose-500/30 pb-3">
            <mat-icon class="text-rose-400 text-lg">warning</mat-icon>
            <h3 class="text-sm font-bold text-rose-300 font-mono uppercase">Data Persistence Management</h3>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="text-xs font-bold text-slate-200">Reset Local Storage & Progress</div>
              <div class="text-[11px] text-slate-400">Clear saved custom robots, mission completions, and restore default presets.</div>
            </div>
            <button 
              (click)="resetAllData()"
              class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-mono text-xs font-bold transition-all shrink-0"
            >
              RESET LOCAL DATA
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class Settings {
  readonly audio = inject(AudioSynth);
  readonly progress = inject(ProgressService);
  readonly robotService = inject(RobotService);
  private toast = inject(ToastService);

  readonly selectedSnap = signal<number>(10);

  resetAllData() {
    if (confirm('Are you sure you want to reset all local robot blueprints and engineering progress?')) {
      this.progress.resetAllData();
      localStorage.removeItem('roboforge_saved_robots');
      localStorage.removeItem('roboforge_active_robot_id');
      window.location.reload();
    }
  }
}
