import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SimulationEngineService } from '../../services/simulation-engine.service';
import { ProgressService } from '../../services/progress.service';
import { AudioSynth } from '../../services/audio-synth';

@Component({
  selector: 'app-mission-complete-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div class="w-full max-w-md rounded-2xl bg-[#0d1322] border border-cyan-500/40 p-6 shadow-2xl shadow-cyan-500/20 text-center relative overflow-hidden">
        <!-- Glowing background accent -->
        <div class="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Success Trophy Icon -->
        <div class="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 shadow-lg shadow-cyan-500/30 mb-4 ring-2 ring-cyan-400/30 animate-bounce">
          <div class="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400">
            <mat-icon class="text-3xl">emoji_events</mat-icon>
          </div>
        </div>

        <!-- Mission Completed Title -->
        <span class="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
          OPERATIONAL SUCCESS
        </span>
        <h2 class="text-2xl font-black text-white font-display mt-1">
          MISSION COMPLETE
        </h2>
        <p class="text-xs text-slate-300 font-mono mt-1">
          {{ simEngine.activeChallenge()?.title || 'AUTONOMOUS RUN FINISHED' }}
        </p>

        <!-- Metric Stat Cards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 my-6">
          <!-- Time -->
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-[10px] text-slate-400 font-mono uppercase">TIME</div>
            <div class="text-base font-bold text-white font-mono mt-0.5 tabular-nums">
              {{ simEngine.telemetry().simTime }}s
            </div>
          </div>

          <!-- Collisions -->
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-[10px] text-slate-400 font-mono uppercase">IMPACTS</div>
            <div class="text-base font-bold font-mono mt-0.5 tabular-nums" [class.text-emerald-400]="simEngine.telemetry().collisionCount === 0" [class.text-amber-400]="simEngine.telemetry().collisionCount > 0">
              0{{ simEngine.telemetry().collisionCount }}
            </div>
          </div>

          <!-- Battery Remaining -->
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-[10px] text-slate-400 font-mono uppercase">BATTERY</div>
            <div class="text-base font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">
              {{ simEngine.telemetry().batteryPercent }}%
            </div>
          </div>

          <!-- Efficiency -->
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-[10px] text-slate-400 font-mono uppercase">EFFICIENCY</div>
            <div class="text-base font-bold text-cyan-300 font-mono mt-0.5 tabular-nums">
              {{ calculatedEfficiency() }}%
            </div>
          </div>
        </div>

        <!-- XP Reward Banner -->
        <div class="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/50 flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <mat-icon class="text-cyan-400 text-lg">military_tech</mat-icon>
            <span class="text-xs font-mono text-cyan-200">ENGINEERING XP</span>
          </div>
          <span class="text-base font-black font-mono text-cyan-400 tabular-nums">
            +{{ simEngine.activeChallenge()?.xpReward || 100 }} XP
          </span>
        </div>

        <!-- Continue Action Buttons -->
        <div class="flex items-center gap-3">
          <button 
            (click)="onReplay()"
            class="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono transition-all"
          >
            RE-RUN MISSION
          </button>
          <button 
            (click)="onContinue()"
            class="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition-all shadow-lg shadow-cyan-500/30"
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  `
})
export class MissionCompleteModal {
  readonly simEngine = inject(SimulationEngineService);
  readonly progressService = inject(ProgressService);
  private audio = inject(AudioSynth);

  continue = output<void>();

  calculatedEfficiency(): number {
    const tele = this.simEngine.telemetry();
    const batteryScore = tele.batteryPercent * 0.7;
    const collisionPenalty = Math.min(30, tele.collisionCount * 8);
    return Math.max(45, Math.min(99, Math.round(batteryScore + (30 - collisionPenalty))));
  }

  onReplay() {
    this.audio.playClick();
    this.simEngine.resetSimulation();
  }

  onContinue() {
    this.audio.playClick();
    this.continue.emit();
  }
}
