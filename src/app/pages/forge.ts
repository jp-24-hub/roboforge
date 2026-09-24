import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ComponentLibrary } from '../components/forge/component-library';
import { RobotCanvas } from '../components/forge/robot-canvas';
import { Inspector } from '../components/forge/inspector';
import { RobotService } from '../services/robot.service';
import { AudioSynth } from '../services/audio-synth';

@Component({
  selector: 'app-forge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule, ComponentLibrary, RobotCanvas, Inspector],
  template: `
    <div class="relative z-10 w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden select-none">
      <!-- Mobile Sub-Toolbar Toggles for Panels -->
      <div class="xl:hidden h-10 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
        <button 
          (click)="toggleLeftDrawer()"
          class="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-slate-300"
        >
          <mat-icon class="text-xs text-cyan-400">category</mat-icon>
          <span>PARTS LIBRARY</span>
        </button>

        <span class="text-cyan-400 font-bold uppercase">{{ robotService.activeRobot().name }}</span>

        <button 
          (click)="toggleRightDrawer()"
          class="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-slate-300"
        >
          <mat-icon class="text-xs text-cyan-400">tune</mat-icon>
          <span>INSPECTOR</span>
        </button>
      </div>

      <!-- 3-Column Engineering Forge Layout -->
      <div class="flex-1 flex overflow-hidden relative">
        <!-- LEFT: Component Library (Fixed 300px on desktop) -->
        <div 
          class="w-72 xl:w-80 shrink-0 h-full z-20 transition-transform duration-300 xl:translate-x-0 absolute xl:relative"
          [class.-translate-x-full]="!leftDrawerOpen()"
          [class.translate-x-0]="leftDrawerOpen()"
        >
          <app-component-library class="h-full block shadow-2xl xl:shadow-none"></app-component-library>
        </div>

        <!-- CENTER: Robot Construction Canvas (Expands to fill center) -->
        <div class="flex-1 h-full min-w-0 relative">
          <app-robot-canvas class="h-full block"></app-robot-canvas>
        </div>

        <!-- RIGHT: Inspector / Robot Statistics (Fixed 320px on desktop) -->
        <div 
          class="w-80 xl:w-88 shrink-0 h-full z-20 transition-transform duration-300 xl:translate-x-0 absolute right-0 xl:relative"
          [class.translate-x-full]="!rightDrawerOpen()"
          [class.translate-x-0]="rightDrawerOpen()"
        >
          <app-inspector class="h-full block shadow-2xl xl:shadow-none"></app-inspector>
        </div>
      </div>
    </div>
  `
})
export class Forge {
  readonly robotService = inject(RobotService);
  private audio = inject(AudioSynth);

  readonly leftDrawerOpen = signal<boolean>(false);
  readonly rightDrawerOpen = signal<boolean>(false);

  toggleLeftDrawer() {
    this.leftDrawerOpen.update((v) => !v);
    this.rightDrawerOpen.set(false);
    this.audio.playClick();
  }

  toggleRightDrawer() {
    this.rightDrawerOpen.update((v) => !v);
    this.leftDrawerOpen.set(false);
    this.audio.playClick();
  }
}
