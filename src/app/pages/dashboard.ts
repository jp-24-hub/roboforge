import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RobotService } from '../services/robot.service';
import { ProgressService } from '../services/progress.service';
import { SimulationEngineService } from '../services/simulation-engine.service';
import { AudioSynth } from '../services/audio-synth';
import { CHALLENGES } from '../data/challenges';
import { Challenge } from '../models/challenge.model';
import { RobotType } from '../models/robot.model';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      <!-- Hero Command Banner -->
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0d1424] to-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden">
        <div class="absolute -top-20 -right-20 w-52 h-52 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div class="space-y-2 max-w-xl">
            <div class="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>COMMAND CONSOLE ONLINE</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-extrabold text-white font-display">
              GOOD DAY, ENGINEER.
            </h1>
            <p class="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Build something intelligent. Design a robot, program its behavior, and test it inside a virtual physics environment.
            </p>
          </div>

          <!-- Quick Action: Build New Robot Button -->
          <button 
            (click)="openCreateModal()"
            class="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 shrink-0"
          >
            <mat-icon class="text-base">add</mat-icon>
            <span>+ BUILD NEW ROBOT</span>
          </button>
        </div>
      </div>

      <!-- Live Statistics (Real Local Application Data) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- ROBOTS BUILT -->
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div class="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>ROBOTS BUILT</span>
            <mat-icon class="text-cyan-400 text-base">precision_manufacturing</mat-icon>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
            0{{ robotService.robots().length }}
          </div>
          <span class="text-[11px] text-slate-500 font-mono mt-1 block">In local laboratory</span>
        </div>

        <!-- MISSIONS COMPLETE -->
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div class="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>MISSIONS COMPLETE</span>
            <mat-icon class="text-emerald-400 text-base">flag</mat-icon>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tabular-nums">
            0{{ completedMissionCount() }}
          </div>
          <span class="text-[11px] text-slate-500 font-mono mt-1 block">of 05 engineering challenges</span>
        </div>

        <!-- SIMULATIONS -->
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div class="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>SIMULATIONS</span>
            <mat-icon class="text-indigo-400 text-base">smart_toy</mat-icon>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-indigo-300 font-mono tabular-nums">
            {{ progressService.progress().totalSimulations }}
          </div>
          <span class="text-[11px] text-slate-500 font-mono mt-1 block">{{ progressService.progress().totalDistanceM }}m traveled</span>
        </div>

        <!-- ENGINEERING XP -->
        <div class="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div class="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>ENGINEERING XP</span>
            <mat-icon class="text-amber-400 text-base">military_tech</mat-icon>
          </div>
          <div class="text-2xl sm:text-3xl font-black text-amber-400 font-mono tabular-nums">
            {{ progressService.progress().xp }}
          </div>
          <span class="text-[11px] text-slate-500 font-mono mt-1 block">Level {{ progressService.progress().level }} {{ progressService.currentLevelInfo().title }}</span>
        </div>
      </div>

      <!-- Active Project Spotlight & Next Recommended Mission -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Active Project Card (2 Cols) -->
        <div class="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold">
                  ACTIVE PROJECT
                </span>
                <span class="text-xs font-mono text-slate-400">· {{ robotService.activeRobot().type }}</span>
              </div>

              <div class="flex items-center gap-1.5 text-xs font-mono">
                @if (robotService.activeRobotStats().isReadyForSimulation) {
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="text-emerald-400 font-bold">READY FOR SIMULATION</span>
                } @else {
                  <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span class="text-amber-400 font-bold">NEEDS COMPONENTS</span>
                }
              </div>
            </div>

            <!-- Active Robot Title & Description -->
            <h2 class="text-2xl sm:text-3xl font-black text-white font-display uppercase tracking-wide">
              {{ robotService.activeRobot().name }}
            </h2>
            <p class="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
              {{ robotService.activeRobot().description }}
            </p>

            <!-- Physical Metrics Grid -->
            @let stats = robotService.activeRobotStats();
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono">
              <div>
                <span class="text-slate-500 text-[10px] uppercase block">SPEED</span>
                <span class="text-cyan-400 font-bold text-sm">{{ stats.topSpeedMs }} m/s</span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] uppercase block">MASS</span>
                <span class="text-white font-bold text-sm">{{ stats.weightKg }} kg</span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] uppercase block">POWER DRAW</span>
                <span class="text-amber-400 font-bold text-sm">{{ stats.totalPowerW }} W</span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] uppercase block">ENDURANCE</span>
                <span class="text-emerald-400 font-bold text-sm">~{{ stats.batteryLifeMin }} min</span>
              </div>
            </div>

            <!-- Assembly Completion Bar -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-mono">
                <span class="text-slate-400">Assembly Status</span>
                <span class="text-cyan-400 font-bold">{{ stats.complexity }}% COMPLETE</span>
              </div>
              <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-cyan-500 to-indigo-500" 
                  [style.width.%]="stats.complexity"
                ></div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-4 border-t border-slate-800">
            <a 
              routerLink="/forge" 
              class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
            >
              <mat-icon class="text-base">hardware</mat-icon>
              <span>CONTINUE FORGE</span>
            </a>
            <a 
              routerLink="/simulation" 
              class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/80 transition-all"
            >
              <mat-icon class="text-base">play_arrow</mat-icon>
              <span>ENTER SIMULATION</span>
            </a>
          </div>
        </div>

        <!-- Recommended Mission Card (1 Col) -->
        <div class="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3 text-[10px] font-mono uppercase text-slate-400">
              <span>RECOMMENDED MISSION</span>
              <span class="text-cyan-400 font-bold">+{{ nextMission()?.xpReward }} XP</span>
            </div>

            <h3 class="text-lg font-black text-white font-display uppercase tracking-wide">
              {{ nextMission()?.title }}
            </h3>
            <p class="text-xs text-cyan-400 font-mono mt-0.5">
              {{ nextMission()?.subtitle }}
            </p>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              {{ nextMission()?.description }}
            </p>

            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 mt-4 text-xs font-mono">
              <span class="text-slate-500 text-[10px] uppercase block font-bold">GOAL</span>
              <span class="text-slate-200 mt-1 block">{{ nextMission()?.objective }}</span>
            </div>
          </div>

          <button 
            (click)="startMission(nextMission())"
            class="w-full mt-6 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/25"
          >
            <mat-icon class="text-base">flag</mat-icon>
            <span>DEPLOY TO MISSION</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Create New Robot Modal Flow -->
    @if (createModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <div class="w-full max-w-lg rounded-2xl bg-[#0b101d] border border-slate-700/80 p-6 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <mat-icon class="text-cyan-400">precision_manufacturing</mat-icon>
              <h3 class="text-base font-bold text-white font-display">FORGE NEW ROBOT</h3>
            </div>
            <button (click)="createModalOpen.set(false)" class="text-slate-400 hover:text-white">
              <mat-icon class="text-lg">close</mat-icon>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Name Input -->
            <div>
              <label for="new-robot-name" class="text-xs font-mono text-slate-300 block mb-1">ROBOT DESIGNATION / NAME</label>
              <input 
                id="new-robot-name"
                type="text" 
                [value]="newRobotName()" 
                (input)="onNameInput($event)"
                placeholder="e.g. VORTEX-MK1"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <!-- Type Selector -->
            <div>
              <span class="text-xs font-mono text-slate-300 block mb-1">ROBOT CLASS / ARCHITECTURE</span>
              <div class="grid grid-cols-3 gap-2">
                @for (type of robotTypes; track type.id) {
                  <button 
                    type="button"
                    (click)="selectedType.set(type.id)"
                    class="p-2.5 rounded-xl border text-xs font-mono text-left transition-all"
                    [class.bg-cyan-950]="selectedType() === type.id"
                    [class.border-cyan-500]="selectedType() === type.id"
                    [class.text-cyan-300]="selectedType() === type.id"
                    [class.bg-slate-900]="selectedType() !== type.id"
                    [class.border-slate-800]="selectedType() !== type.id"
                    [class.text-slate-400]="selectedType() !== type.id"
                  >
                    <div class="font-bold uppercase">{{ type.label }}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">{{ type.desc }}</div>
                  </button>
                }
              </div>
            </div>

            <!-- Chassis Selector -->
            <div>
              <label for="new-robot-chassis" class="text-xs font-mono text-slate-300 block mb-1">BASE CHASSIS FRAME</label>
              <select 
                id="new-robot-chassis"
                [value]="selectedChassis()"
                (change)="onChassisSelect($event)"
                class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
              >
                <option value="chassis-basic">Basic Chassis (Polycarbonate, 0.8kg)</option>
                <option value="chassis-compact">Compact Chassis (Carbon-Composite, 0.45kg)</option>
                <option value="chassis-heavy">Heavy Chassis (Extruded Aluminum, 1.9kg)</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button 
              (click)="createModalOpen.set(false)"
              class="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono font-bold hover:bg-slate-700"
            >
              CANCEL
            </button>
            <button 
              (click)="confirmCreateRobot()"
              class="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold shadow-lg shadow-cyan-500/20"
            >
              START BUILDING
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class Dashboard {
  readonly robotService = inject(RobotService);
  readonly progressService = inject(ProgressService);
  readonly simEngine = inject(SimulationEngineService);
  private router = inject(Router);
  private audio = inject(AudioSynth);

  readonly createModalOpen = signal<boolean>(false);
  readonly newRobotName = signal<string>('TITAN-MK2');
  readonly selectedType = signal<RobotType>('rover');
  readonly selectedChassis = signal<string>('chassis-basic');

  readonly robotTypes: { id: RobotType; label: string; desc: string }[] = [
    { id: 'rover', label: 'Rover', desc: 'All-terrain research' },
    { id: 'scout', label: 'Scout', desc: 'Fast agile navigation' },
    { id: 'racer', label: 'Racer', desc: 'Max linear speed' },
    { id: 'rescue', label: 'Rescue Bot', desc: 'Hazard response' },
    { id: 'warehouse', label: 'Warehouse Bot', desc: 'Logistics cargo' },
    { id: 'custom', label: 'Custom', desc: 'Blank prototype' }
  ];

  completedMissionCount(): number {
    return Object.keys(this.progressService.progress().completedChallenges).length;
  }

  nextMission() {
    const completed = this.progressService.progress().completedChallenges;
    const uncompleted = CHALLENGES.find((c) => !completed[c.id]);
    return uncompleted || CHALLENGES[0];
  }

  startMission(mission?: Challenge) {
    if (!mission) return;
    this.simEngine.setChallenge(mission);
    this.router.navigate(['/simulation']);
  }

  openCreateModal() {
    this.newRobotName.set(`ROBOT-${Math.floor(Math.random() * 899 + 100)}`);
    this.createModalOpen.set(true);
    this.audio.playClick();
  }

  onNameInput(e: Event) {
    this.newRobotName.set((e.target as HTMLInputElement).value);
  }

  onChassisSelect(e: Event) {
    this.selectedChassis.set((e.target as HTMLSelectElement).value);
  }

  confirmCreateRobot() {
    const name = this.newRobotName().trim() || 'UNTITLED-BOT';
    const type = this.selectedType();
    const chassis = this.selectedChassis();
    this.robotService.createRobot(name, type, chassis);
    this.createModalOpen.set(false);
    this.router.navigate(['/forge']);
  }
}
