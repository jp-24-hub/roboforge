import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProgressService } from '../services/progress.service';
import { RobotService } from '../services/robot.service';
import { AudioSynth } from '../services/audio-synth';

@Component({
  selector: 'app-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <header class="h-16 px-4 lg:px-6 bg-[#0b101d]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-30 sticky top-0">
      <!-- Left: Mobile Brand & Toggle / Desktop Breadcrumb -->
      <div class="flex items-center gap-3">
        <!-- Mobile Menu Toggle Button -->
        <button 
          (click)="toggleMobileMenu()"
          class="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          aria-label="Toggle navigation menu"
        >
          <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>

        <!-- Brand Wordmark (Mobile & Fallback) -->
        <a routerLink="/dashboard" class="flex items-center gap-2 lg:hidden">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
            <mat-icon class="text-base">precision_manufacturing</mat-icon>
          </div>
          <span class="font-display font-extrabold text-base tracking-wider text-white">ROBOFORGE</span>
        </a>

        <!-- Desktop Quick Robot Selector & Indicator -->
        <div class="hidden lg:flex items-center gap-2 text-xs">
          <span class="text-slate-500 font-mono uppercase text-[11px]">PROJECT:</span>
          <a 
            routerLink="/forge"
            class="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-colors"
          >
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span class="font-bold tracking-wide">{{ robotService.activeRobot().name }}</span>
            <span class="text-[10px] text-slate-400 font-mono">({{ robotService.activeRobot().type }})</span>
          </a>
        </div>
      </div>

      <!-- Right Action Hub: XP / Level Pill + Audio + Quick Build -->
      <div class="flex items-center gap-3">
        <!-- Engineering Level & XP pill -->
        <a 
          routerLink="/progress"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-cyan-500/50 transition-colors group cursor-pointer"
          title="View Engineering Progress"
        >
          <div class="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 text-[10px] font-bold font-mono">
            {{ progressService.progress().level }}
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-1.5 text-[11px] font-mono leading-none">
              <span class="text-slate-400 font-semibold uppercase">{{ progressService.currentLevelInfo().title }}</span>
              <span class="text-cyan-400 font-bold tabular-nums">{{ progressService.progress().xp }} XP</span>
            </div>
            <!-- Mini progress bar -->
            <div class="w-24 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                [style.width.%]="progressService.xpProgressPercent()"
              ></div>
            </div>
          </div>
        </a>

        <!-- Sound FX Mute Toggle -->
        <button 
          (click)="toggleAudio()"
          [title]="audio.isMuted() ? 'Unmute Laboratory Audio' : 'Mute Laboratory Audio'"
          class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
          aria-label="Toggle Sound Effects"
        >
          <mat-icon class="text-lg">{{ audio.isMuted() ? 'volume_off' : 'volume_up' }}</mat-icon>
        </button>

        <!-- Quick "Forge Robot" Primary CTA -->
        <a 
          routerLink="/forge"
          class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <mat-icon class="text-base">add</mat-icon>
          <span>BUILD ROBOT</span>
        </a>
      </div>
    </header>

    <!-- Mobile Navigation Drawer Overlay -->
    @if (mobileMenuOpen()) {
      <button 
        type="button"
        class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden cursor-default w-full h-full border-none p-0"
        (click)="toggleMobileMenu()"
        aria-label="Close navigation menu"
      ></button>
      <div class="fixed top-16 left-0 bottom-0 w-64 bg-[#0b101d] border-r border-slate-800 z-50 p-4 space-y-2 lg:hidden overflow-y-auto">
        <a 
          routerLink="/dashboard" 
          (click)="toggleMobileMenu()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
        >
          <mat-icon class="text-cyan-400">space_dashboard</mat-icon>
          <span>Dashboard</span>
        </a>
        <a 
          routerLink="/forge" 
          (click)="toggleMobileMenu()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
        >
          <mat-icon class="text-cyan-400">hardware</mat-icon>
          <span>Robot Forge</span>
        </a>
        <a 
          routerLink="/code" 
          (click)="toggleMobileMenu()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
        >
          <mat-icon class="text-cyan-400">terminal</mat-icon>
          <span>Code Lab</span>
        </a>
        <a 
          routerLink="/simulation" 
          (click)="toggleMobileMenu()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
        >
          <mat-icon class="text-cyan-400">smart_toy</mat-icon>
          <span>Simulation Lab</span>
        </a>
        <a 
          routerLink="/challenges" 
          (click)="toggleMobileMenu()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
        >
          <mat-icon class="text-cyan-400">flag</mat-icon>
          <span>Challenges</span>
        </a>
        <a 
          routerLink="/library" 
          (click)="toggleMobileMenu()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
        >
          <mat-icon class="text-cyan-400">folder_special</mat-icon>
          <span>Robot Library</span>
        </a>
        <a 
          routerLink="/progress" 
          (click)="toggleMobileMenu()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
        >
          <mat-icon class="text-cyan-400">military_tech</mat-icon>
          <span>Progress & Badges</span>
        </a>
        <a 
          routerLink="/settings" 
          (click)="toggleMobileMenu()"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
        >
          <mat-icon class="text-cyan-400">tune</mat-icon>
          <span>Settings</span>
        </a>
      </div>
    }
  `
})
export class TopBar {
  readonly progressService = inject(ProgressService);
  readonly robotService = inject(RobotService);
  readonly audio = inject(AudioSynth);

  readonly mobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update((v) => !v);
  }

  toggleAudio() {
    this.audio.toggleMute();
    this.audio.playClick();
  }
}
