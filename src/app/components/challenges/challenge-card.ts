import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Challenge } from '../../models/challenge.model';

@Component({
  selector: 'app-challenge-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div 
      class="p-5 rounded-2xl bg-slate-900/80 border transition-all flex flex-col justify-between group relative overflow-hidden"
      [class.border-emerald-500/50]="isCompleted()"
      [class.border-slate-800]="!isCompleted()"
      [class.hover:border-cyan-500/50]="!isCompleted()"
    >
      <!-- Completed Watermark / Glow -->
      @if (isCompleted()) {
        <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
      }

      <div>
        <!-- Level & Difficulty Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold">
              LEVEL 0{{ challenge().level }}
            </span>
            <span 
              class="text-[10px] font-mono uppercase font-bold"
              [class.text-emerald-400]="challenge().difficulty === 'easy'"
              [class.text-amber-400]="challenge().difficulty === 'medium'"
              [class.text-rose-400]="challenge().difficulty === 'hard'"
            >
              {{ challenge().difficulty }}
            </span>
          </div>

          @if (isCompleted()) {
            <span class="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
              <mat-icon class="text-sm">check_circle</mat-icon>
              <span>CLEARED</span>
            </span>
          } @else {
            <span class="text-[11px] font-mono text-cyan-400 font-bold">
              +{{ challenge().xpReward }} XP
            </span>
          }
        </div>

        <!-- Mission Title -->
        <h3 class="text-base font-black text-white font-display uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
          {{ challenge().title }}
        </h3>
        <p class="text-xs font-mono text-cyan-400/90 mt-0.5">
          {{ challenge().subtitle }}
        </p>
        <p class="text-xs text-slate-400 mt-2.5 leading-relaxed">
          {{ challenge().description }}
        </p>

        <!-- Objective Callout -->
        <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 my-3.5 space-y-1">
          <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
            OBJECTIVE
          </span>
          <p class="text-xs font-mono text-slate-200 leading-snug">
            {{ challenge().objective }}
          </p>
        </div>

        <!-- Mission Parameters -->
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 pb-3">
          <span>Max Time: {{ challenge().timeLimitSec }}s</span>
          <span>Allowed Impacts: {{ challenge().targetCollisionsMax }}</span>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        (click)="startMission.emit(challenge())"
        class="w-full py-2.5 px-4 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
        [class.bg-emerald-500]="isCompleted()"
        [class.hover:bg-emerald-400]="isCompleted()"
        [class.text-slate-950]="isCompleted()"
        [class.bg-cyan-500]="!isCompleted()"
        [class.hover:bg-cyan-400]="!isCompleted()"
        [class.text-slate-950]="!isCompleted()"
        [class.shadow-cyan-500/20]="!isCompleted()"
      >
        <mat-icon class="text-base">play_arrow</mat-icon>
        <span>{{ isCompleted() ? 'RE-DEPLOY MISSION' : 'START MISSION' }}</span>
      </button>
    </div>
  `
})
export class ChallengeCard {
  challenge = input.required<Challenge>();
  isCompleted = input<boolean>(false);

  startMission = output<Challenge>();
}
