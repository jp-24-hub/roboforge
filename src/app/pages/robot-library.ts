import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RobotCard } from '../components/library/robot-card';
import { RobotService } from '../services/robot.service';
import { AudioSynth } from '../services/audio-synth';
import { RobotType } from '../models/robot.model';

@Component({
  selector: 'app-robot-library',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule, RobotCard],
  template: `
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <mat-icon class="text-sm">folder_special</mat-icon>
            <span>STORAGE HANGAR</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-white font-display">
            My Robots
          </h1>
          <p class="text-xs sm:text-sm text-slate-400">
            Manage your fleet of autonomous rovers, scouts, and custom machines.
          </p>
        </div>

        <button 
          (click)="createModalOpen.set(true)"
          class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
        >
          <mat-icon class="text-base">add</mat-icon>
          <span>BUILD NEW ROBOT</span>
        </button>
      </div>

      <!-- Robots Grid -->
      @if (robotService.robots().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (bot of robotService.robots(); track bot.id) {
            <app-robot-card 
              [robot]="bot"
              [isActive]="bot.id === robotService.activeRobotId()"
              (selectRobot)="onSelectRobot($event)"
              (duplicate)="onDuplicateRobot($event)"
              (delete)="onDeleteRobot($event)"
            ></app-robot-card>
          }
        </div>
      } @else {
        <!-- Empty State (Rule 53: Never show a blank page) -->
        <div class="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 max-w-md mx-auto my-12">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <mat-icon class="text-3xl">precision_manufacturing</mat-icon>
          </div>
          <h3 class="text-lg font-bold text-white font-display">NO ROBOTS YET</h3>
          <p class="text-xs text-slate-400">
            Your forge is waiting. Construct your first rover, equip motors, and program its intelligence.
          </p>
          <button 
            (click)="createModalOpen.set(true)"
            class="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold"
          >
            BUILD YOUR FIRST ROBOT
          </button>
        </div>
      }
    </div>

    <!-- Create Modal -->
    @if (createModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <div class="w-full max-w-md rounded-2xl bg-[#0b101d] border border-slate-700/80 p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-base font-bold text-white font-display">FORGE NEW BLUEPRINT</h3>
            <button (click)="createModalOpen.set(false)" class="text-slate-400 hover:text-white">
              <mat-icon class="text-lg">close</mat-icon>
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label for="lib-robot-name" class="text-xs font-mono text-slate-300 block mb-1">DESIGNATION</label>
              <input 
                id="lib-robot-name"
                type="text" 
                [value]="newBotName()" 
                (input)="onNameInput($event)"
                placeholder="e.g. AERO-01"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label for="lib-robot-type" class="text-xs font-mono text-slate-300 block mb-1">TYPE</label>
              <select 
                id="lib-robot-type"
                [value]="newBotType()"
                (change)="onTypeSelect($event)"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
              >
                <option value="rover">Rover (General Research)</option>
                <option value="scout">Scout (Agile Sonar)</option>
                <option value="racer">Racer (Speed Velocity)</option>
                <option value="rescue">Rescue Bot (Disaster Thermal)</option>
                <option value="warehouse">Warehouse Bot (Logistics)</option>
                <option value="custom">Custom Prototype</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button 
              (click)="createModalOpen.set(false)"
              class="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono font-bold"
            >
              CANCEL
            </button>
            <button 
              (click)="confirmCreate()"
              class="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold"
            >
              START BUILDING
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class RobotLibrary {
  readonly robotService = inject(RobotService);
  private router = inject(Router);
  private audio = inject(AudioSynth);

  readonly createModalOpen = signal<boolean>(false);
  readonly newBotName = signal<string>('SCOUT-MK1');
  readonly newBotType = signal<RobotType>('rover');

  onSelectRobot(id: string) {
    this.robotService.selectRobot(id);
  }

  onDuplicateRobot(id: string) {
    this.robotService.duplicateRobot(id);
  }

  onDeleteRobot(id: string) {
    this.robotService.deleteRobot(id);
  }

  onNameInput(e: Event) {
    this.newBotName.set((e.target as HTMLInputElement).value);
  }

  onTypeSelect(e: Event) {
    this.newBotType.set((e.target as HTMLSelectElement).value as RobotType);
  }

  confirmCreate() {
    const name = this.newBotName().trim() || 'UNTITLED-BOT';
    const type = this.newBotType();
    this.robotService.createRobot(name, type);
    this.createModalOpen.set(false);
    this.router.navigate(['/forge']);
  }
}
