import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProgressService, LEVELS } from '../services/progress.service';
import { RobotService } from '../services/robot.service';

@Component({
  selector: 'app-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      <!-- Section Header -->
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <mat-icon class="text-sm">military_tech</mat-icon>
          <span>CAREER PROGRESSION</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black text-white font-display">
          Engineering Rank & Badges
        </h1>
        <p class="text-xs sm:text-sm text-slate-400">
          Advance your engineering credentials through simulation accuracy, mission completions, and innovative hardware assemblies.
        </p>
      </div>

      <!-- Level & XP Hero Card -->
      <div class="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/25">
              <div class="w-full h-full bg-slate-950 rounded-2xl flex flex-col items-center justify-center font-mono">
                <span class="text-[10px] text-cyan-400 font-bold">LVL</span>
                <span class="text-2xl font-black text-white">{{ progressService.progress().level }}</span>
              </div>
            </div>

            <div>
              <span class="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                CURRENT RATING
              </span>
              <h2 class="text-2xl sm:text-3xl font-black text-white font-display">
                {{ progressService.currentLevelInfo().title }}
              </h2>
              <p class="text-xs text-slate-400 font-mono mt-0.5">
                Next Rank: {{ nextRankTitle() }} ({{ progressService.nextLevelXp() }} XP)
              </p>
            </div>
          </div>

          <!-- XP Readout -->
          <div class="text-right sm:border-l sm:border-slate-800 sm:pl-6">
            <span class="text-[10px] font-mono text-slate-500 uppercase block">ACCUMULATED XP</span>
            <span class="text-3xl font-black font-mono text-cyan-400 tabular-nums">
              {{ progressService.progress().xp }}
            </span>
          </div>
        </div>

        <!-- Progress Bar toward Next Level -->
        <div class="mt-6 space-y-2">
          <div class="flex justify-between text-xs font-mono">
            <span class="text-slate-400">Level Progression</span>
            <span class="text-cyan-400 font-bold">{{ progressService.xpProgressPercent() }}%</span>
          </div>
          <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              class="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-500"
              [style.width.%]="progressService.xpProgressPercent()"
            ></div>
          </div>
        </div>
      </div>

      <!-- Skill Competencies Breakdown -->
      <div class="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 class="text-base font-bold text-white font-display">Engineering Competencies</h3>

        @let skills = progressService.progress().skillLevels;

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Mechanical Assembly -->
          <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-300">MECHANICAL CHASSIS ASSEMBLY</span>
              <span class="text-cyan-400 font-bold">{{ skills.mechanical }}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-cyan-400" [style.width.%]="skills.mechanical"></div>
            </div>
          </div>

          <!-- Programming & Algorithms -->
          <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-300">AUTONOMOUS LOGIC PROGRAMMING</span>
              <span class="text-indigo-400 font-bold">{{ skills.programming }}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-400" [style.width.%]="skills.programming"></div>
            </div>
          </div>

          <!-- Simulation & Telemetry -->
          <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-300">KINEMATICS & SENSOR SIMULATION</span>
              <span class="text-emerald-400 font-bold">{{ skills.simulation }}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-400" [style.width.%]="skills.simulation"></div>
            </div>
          </div>

          <!-- Autonomy & Efficiency -->
          <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-300">SYSTEM AUTONOMY & ENERGY EFFICIENCY</span>
              <span class="text-amber-400 font-bold">{{ skills.autonomy }}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-amber-400" [style.width.%]="skills.autonomy"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Engineering Badges Showcase Grid -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-white font-display">Specialist Badges</h3>
          <span class="text-xs font-mono text-cyan-400">
            {{ unlockedBadgeCount() }} of {{ progressService.allBadges().length }} UNLOCKED
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (badge of progressService.allBadges(); track badge.id) {
            @let unlocked = isBadgeUnlocked(badge.id);
            <div 
              class="p-4 rounded-2xl border transition-all flex flex-col justify-between"
              [class.bg-slate-900]="unlocked"
              [class.border-cyan-500/50]="unlocked"
              [class.bg-slate-950/40]="!unlocked"
              [class.border-slate-800/80]="!unlocked"
              [class.opacity-60]="!unlocked"
            >
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div 
                    class="w-10 h-10 rounded-xl flex items-center justify-center border"
                    [class.bg-cyan-950]="unlocked"
                    [class.border-cyan-400/40]="unlocked"
                    [class.text-cyan-400]="unlocked"
                    [class.bg-slate-900]="!unlocked"
                    [class.border-slate-800]="!unlocked"
                    [class.text-slate-600]="!unlocked"
                  >
                    <mat-icon>{{ badge.icon }}</mat-icon>
                  </div>

                  <span 
                    class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold"
                    [class.bg-emerald-950]="unlocked"
                    [class.text-emerald-400]="unlocked"
                    [class.bg-slate-900]="!unlocked"
                    [class.text-slate-600]="!unlocked"
                  >
                    {{ unlocked ? 'ACQUIRED' : 'LOCKED' }}
                  </span>
                </div>

                <h4 class="text-xs font-black uppercase font-display tracking-wider" [class.text-white]="unlocked" [class.text-slate-400]="!unlocked">
                  {{ badge.title }}
                </h4>
                <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {{ badge.description }}
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class Progress {
  readonly progressService = inject(ProgressService);
  readonly robotService = inject(RobotService);

  nextRankTitle(): string {
    const nextLvl = this.progressService.progress().level + 1;
    const found = LEVELS.find((l) => l.level === nextLvl);
    return found ? found.title : 'MAXIMUM RANK';
  }

  isBadgeUnlocked(id: string): boolean {
    return this.progressService.progress().unlockedBadges.includes(id);
  }

  unlockedBadgeCount(): number {
    return this.progressService.progress().unlockedBadges.length;
  }
}
