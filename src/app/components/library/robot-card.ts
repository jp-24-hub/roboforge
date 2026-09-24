import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Robot } from '../../models/robot.model';
import { calculateRobotStats } from '../../utils/calculations';

@Component({
  selector: 'app-robot-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div 
      class="p-4 rounded-2xl bg-slate-900/80 border transition-all flex flex-col justify-between group"
      [class.border-cyan-500]="isActive()"
      [class.border-slate-800]="!isActive()"
      [class.hover:border-slate-700]="!isActive()"
    >
      <div>
        <!-- Top Card Header -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold">
            {{ robot().type }}
          </span>
          @if (isActive()) {
            <span class="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ACTIVE</span>
            </span>
          } @else {
            <button 
              (click)="selectRobot.emit(robot().id)"
              class="text-[10px] font-mono text-slate-400 hover:text-cyan-400 transition-colors"
            >
              SET ACTIVE
            </button>
          }
        </div>

        <!-- Robot Miniature Visual Canvas -->
        <div class="h-32 w-full rounded-xl bg-[#060913] border border-slate-800/80 relative flex items-center justify-center overflow-hidden mb-3.5">
          <!-- Fine grid background -->
          <div class="absolute inset-0 bg-grid-pattern opacity-40"></div>

          <!-- Stylized Robot Miniature SVG -->
          <svg class="w-24 h-24 relative z-10" viewBox="-60 -60 120 120">
            <!-- Wheels -->
            <rect x="-38" y="-30" width="14" height="60" rx="3" fill="#0284c7" />
            <rect x="24" y="-30" width="14" height="60" rx="3" fill="#0284c7" />
            <!-- Chassis Plate -->
            <rect x="-24" y="-34" width="48" height="68" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
            <!-- Core Microcontroller -->
            <rect x="-12" y="-12" width="24" height="24" rx="3" fill="#0f172a" stroke="#818cf8" stroke-width="1.5" />
            <!-- Sonar sensor eyes on front -->
            <circle cx="-8" cy="-38" r="4" fill="#34d399" />
            <circle cx="8" cy="-38" r="4" fill="#34d399" />
            <!-- Battery Cell -->
            <rect x="-10" y="14" width="20" height="12" rx="2" fill="#10b981" />
          </svg>
        </div>

        <!-- Robot Name & Specs -->
        <h3 class="text-base font-black text-white font-display uppercase tracking-wide truncate">
          {{ robot().name }}
        </h3>
        <p class="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {{ robot().description }}
        </p>

        <!-- Component Count & Physical Specs -->
        @let stats = getStats();
        <div class="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono">
          <div>
            <span class="text-slate-500 text-[10px] block">SPEED</span>
            <span class="text-cyan-400 font-bold">{{ stats.topSpeedMs }} m/s</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] block">MASS</span>
            <span class="text-white font-bold">{{ stats.weightKg }} kg</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] block">COMPS</span>
            <span class="text-emerald-400 font-bold">0{{ robot().components.length }}</span>
          </div>
        </div>

        <!-- Last Simulation Performance -->
        @if (robot().lastSimulation; as last) {
          <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2">
            <span>Last Sim: {{ last.environment }}</span>
            <span class="text-cyan-300 font-bold">{{ last.score }}% Efficiency</span>
          </div>
        }
      </div>

      <!-- Action Buttons (Edit, Simulate, Duplicate, Delete) -->
      <div class="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-800/80">
        <a 
          routerLink="/forge" 
          (click)="selectRobot.emit(robot().id)"
          title="Open in Robot Forge"
          class="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-semibold flex items-center justify-center transition-colors"
        >
          <mat-icon class="text-base">hardware</mat-icon>
        </a>

        <a 
          routerLink="/simulation" 
          (click)="selectRobot.emit(robot().id)"
          title="Run in Simulation Lab"
          class="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-semibold flex items-center justify-center transition-colors"
        >
          <mat-icon class="text-base">play_arrow</mat-icon>
        </a>

        <button 
          (click)="duplicate.emit(robot().id)"
          title="Duplicate Blueprint"
          class="p-2 rounded-lg bg-slate-800 hover:bg-indigo-500 hover:text-white text-slate-300 text-xs font-semibold flex items-center justify-center transition-colors"
        >
          <mat-icon class="text-base">content_copy</mat-icon>
        </button>

        <button 
          (click)="delete.emit(robot().id)"
          title="Decommission Robot"
          class="p-2 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-300 text-xs font-semibold flex items-center justify-center transition-colors"
        >
          <mat-icon class="text-base">delete</mat-icon>
        </button>
      </div>
    </div>
  `
})
export class RobotCard {
  robot = input.required<Robot>();
  isActive = input<boolean>(false);

  selectRobot = output<string>();
  duplicate = output<string>();
  delete = output<string>();

  getStats() {
    return calculateRobotStats(this.robot());
  }
}
