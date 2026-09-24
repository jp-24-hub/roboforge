import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RobotService } from '../services/robot.service';
import { ProgressService } from '../services/progress.service';
import { AudioSynth } from '../services/audio-synth';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <aside 
      class="hidden lg:flex flex-col w-64 shrink-0 bg-[#0b101d] border-r border-slate-800/80 z-20 h-screen select-none"
    >
      <!-- Brand Logo Header -->
      <div class="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
          <mat-icon class="text-xl">precision_manufacturing</mat-icon>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-display font-extrabold text-lg tracking-wider text-white">ROBOFORGE</span>
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
          <p class="text-[10px] tracking-widest uppercase font-mono text-slate-400">Virtual Lab v2.4</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div class="px-3 pb-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
          Engineering Core
        </div>

        <a 
          routerLink="/dashboard" 
          routerLinkActive="bg-cyan-950/40 text-cyan-400 border-cyan-500/60 font-medium"
          (click)="playClick()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent transition-all group"
        >
          <mat-icon class="text-lg text-slate-400 group-hover:text-cyan-400 transition-colors">space_dashboard</mat-icon>
          <span>Dashboard</span>
        </a>

        <a 
          routerLink="/forge" 
          routerLinkActive="bg-cyan-950/40 text-cyan-400 border-cyan-500/60 font-medium"
          (click)="playClick()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent transition-all group"
        >
          <mat-icon class="text-lg text-slate-400 group-hover:text-cyan-400 transition-colors">hardware</mat-icon>
          <span>Robot Forge</span>
        </a>

        <a 
          routerLink="/code" 
          routerLinkActive="bg-cyan-950/40 text-cyan-400 border-cyan-500/60 font-medium"
          (click)="playClick()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent transition-all group"
        >
          <mat-icon class="text-lg text-slate-400 group-hover:text-cyan-400 transition-colors">terminal</mat-icon>
          <span>Code Lab</span>
        </a>

        <a 
          routerLink="/simulation" 
          routerLinkActive="bg-cyan-950/40 text-cyan-400 border-cyan-500/60 font-medium"
          (click)="playClick()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent transition-all group"
        >
          <mat-icon class="text-lg text-slate-400 group-hover:text-cyan-400 transition-colors">smart_toy</mat-icon>
          <span>Simulation Lab</span>
        </a>

        <div class="pt-4 px-3 pb-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
          Missions & Intel
        </div>

        <a 
          routerLink="/challenges" 
          routerLinkActive="bg-cyan-950/40 text-cyan-400 border-cyan-500/60 font-medium"
          (click)="playClick()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent transition-all group"
        >
          <mat-icon class="text-lg text-slate-400 group-hover:text-cyan-400 transition-colors">flag</mat-icon>
          <span>Challenges</span>
        </a>

        <a 
          routerLink="/library" 
          routerLinkActive="bg-cyan-950/40 text-cyan-400 border-cyan-500/60 font-medium"
          (click)="playClick()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent transition-all group"
        >
          <mat-icon class="text-lg text-slate-400 group-hover:text-cyan-400 transition-colors">folder_special</mat-icon>
          <span>Robot Library</span>
        </a>

        <a 
          routerLink="/progress" 
          routerLinkActive="bg-cyan-950/40 text-cyan-400 border-cyan-500/60 font-medium"
          (click)="playClick()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent transition-all group"
        >
          <mat-icon class="text-lg text-slate-400 group-hover:text-cyan-400 transition-colors">military_tech</mat-icon>
          <span>Progression & Badges</span>
        </a>

        <a 
          routerLink="/settings" 
          routerLinkActive="bg-cyan-950/40 text-cyan-400 border-cyan-500/60 font-medium"
          (click)="playClick()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent transition-all group"
        >
          <mat-icon class="text-lg text-slate-400 group-hover:text-cyan-400 transition-colors">tune</mat-icon>
          <span>Settings</span>
        </a>
      </div>

      <!-- Active Robot Quick Footer Widget -->
      <div class="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div class="p-3 rounded-lg bg-[#0f172a] border border-slate-800 text-xs">
          <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
            <span>ACTIVE MACHINE</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div class="font-bold text-slate-100 flex items-center justify-between truncate">
            <span class="truncate">{{ robotService.activeRobot().name }}</span>
            <span class="text-[10px] px-1.5 py-0.2 bg-cyan-950 text-cyan-400 rounded uppercase font-mono">{{ robotService.activeRobot().type }}</span>
          </div>
          <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{{ robotService.activeRobot().components.length }} comps</span>
            <span>{{ robotService.activeRobotStats().topSpeedMs }} m/s</span>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class Sidebar {
  readonly robotService = inject(RobotService);
  readonly progressService = inject(ProgressService);
  private audio = inject(AudioSynth);

  playClick() {
    this.audio.playClick();
  }
}
