import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RobotComponent, RobotType } from '../../models/robot.model';
import { RobotService } from '../../services/robot.service';
import { AudioSynth } from '../../services/audio-synth';

@Component({
  selector: 'app-inspector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="h-full flex flex-col bg-[#0b101d] border-l border-slate-800/80 select-none overflow-y-auto">
      <!-- Top Title -->
      <div class="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
          <mat-icon class="text-cyan-400 text-base">tune</mat-icon>
          <span>{{ robotService.selectedComponentId() ? 'Component Inspector' : 'Machine Diagnostics' }}</span>
        </div>
        @if (robotService.selectedComponentId()) {
          <button 
            (click)="robotService.selectedComponentId.set(null)"
            class="text-[10px] font-mono text-cyan-400 hover:underline"
          >
            VIEW ROBOT
          </button>
        }
      </div>

      <!-- Content Area -->
      <div class="p-4 space-y-5 flex-1">
        <!-- MODE A: COMPONENT SELECTED -->
        @if (robotService.selectedComponent(); as comp) {
          <div class="space-y-4">
            <!-- Component Identity Card -->
            <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-semibold">
                  {{ comp.category }}
                </span>
                <span class="text-[10px] font-mono text-slate-400">ID: {{ comp.catalogId }}</span>
              </div>
              <h3 class="text-sm font-bold text-white">{{ comp.name }}</h3>
              <p class="text-[11px] text-slate-400 font-mono mt-1">Mounted at X: {{ comp.x }}px, Y: {{ comp.y }}px</p>
            </div>

            <!-- CONTROLS & PROPERTIES -->
            <div class="space-y-3.5">
              <h4 class="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Operational Parameters
              </h4>

              <!-- Enable / Disable Toggle -->
              <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-xs text-slate-300">Power State</span>
                <button 
                  (click)="toggleEnabled(comp)"
                  class="px-2.5 py-1 rounded text-xs font-mono font-bold transition-all"
                  [class.bg-emerald-500]="comp.properties['enabled'] !== false"
                  [class.text-slate-950]="comp.properties['enabled'] !== false"
                  [class.bg-slate-800]="comp.properties['enabled'] === false"
                  [class.text-slate-400]="comp.properties['enabled'] === false"
                >
                  {{ comp.properties['enabled'] !== false ? 'ONLINE' : 'OFFLINE' }}
                </button>
              </div>

              <!-- Speed RPM Slider (For Motors) -->
              @if (comp.properties['speed'] !== undefined) {
                <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div class="flex justify-between text-xs font-mono">
                    <span class="text-slate-300">Velocity Output</span>
                    <span class="text-cyan-400 font-bold">{{ comp.properties['speed'] }} RPM</span>
                  </div>
                  <input 
                    type="range" 
                    min="30" 
                    max="240" 
                    step="5"
                    [value]="comp.properties['speed']"
                    (input)="onSliderChange(comp, 'speed', $event)"
                    class="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>30 RPM (Torque)</span>
                    <span>240 RPM (Speed)</span>
                  </div>
                </div>
              }

              <!-- Motor Direction -->
              @if (comp.properties['direction'] !== undefined) {
                <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                  <div class="text-xs font-mono text-slate-300">Phase Polarity / Direction</div>
                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      (click)="updateProperty(comp, { direction: 'forward' })"
                      class="py-1.5 rounded text-xs font-mono font-semibold transition-all"
                      [class.bg-cyan-500]="comp.properties['direction'] === 'forward'"
                      [class.text-slate-950]="comp.properties['direction'] === 'forward'"
                      [class.bg-slate-800]="comp.properties['direction'] !== 'forward'"
                      [class.text-slate-400]="comp.properties['direction'] !== 'forward'"
                    >
                      FORWARD
                    </button>
                    <button 
                      (click)="updateProperty(comp, { direction: 'reverse' })"
                      class="py-1.5 rounded text-xs font-mono font-semibold transition-all"
                      [class.bg-cyan-500]="comp.properties['direction'] === 'reverse'"
                      [class.text-slate-950]="comp.properties['direction'] === 'reverse'"
                      [class.bg-slate-800]="comp.properties['direction'] !== 'reverse'"
                      [class.text-slate-400]="comp.properties['direction'] !== 'reverse'"
                    >
                      REVERSE
                    </button>
                  </div>
                </div>
              }

              <!-- Sensor Detection Range (For Ultrasonic / Proximity) -->
              @if (comp.properties['range'] !== undefined) {
                <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div class="flex justify-between text-xs font-mono">
                    <span class="text-slate-300">Detection Range</span>
                    <span class="text-emerald-400 font-bold">{{ comp.properties['range'] }} cm</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="300" 
                    step="5"
                    [value]="comp.properties['range']"
                    (input)="onSliderChange(comp, 'range', $event)"
                    class="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>15 cm</span>
                    <span>300 cm</span>
                  </div>
                </div>
              }

              <!-- Rotation Control -->
              <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                <div class="flex justify-between text-xs font-mono text-slate-300">
                  <span>Mount Orientation</span>
                  <span class="text-cyan-400 font-bold">{{ comp.rotation }}°</span>
                </div>
                <div class="grid grid-cols-4 gap-1.5">
                  @for (deg of [0, 90, 180, 270]; track deg) {
                    <button 
                      (click)="setRotation(comp, deg)"
                      class="py-1 rounded text-xs font-mono font-semibold transition-all"
                      [class.bg-cyan-500]="comp.rotation === deg"
                      [class.text-slate-950]="comp.rotation === deg"
                      [class.bg-slate-800]="comp.rotation !== deg"
                      [class.text-slate-400]="comp.rotation !== deg"
                    >
                      {{ deg }}°
                    </button>
                  }
                </div>
              </div>

              <!-- Action: Remove Component -->
              <button 
                (click)="removeComponent(comp.id)"
                class="w-full py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/80 text-rose-400 hover:text-white border border-rose-800/50 text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all mt-4"
              >
                <mat-icon class="text-base">delete</mat-icon>
                <span>REMOVE FROM WORKBENCH</span>
              </button>
            </div>
          </div>
        }

        <!-- MODE B: OVERALL ROBOT SPECIFICATIONS & METRICS -->
        @else {
          <div class="space-y-4">
            <!-- Machine Profile Header -->
            <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-mono text-slate-400 uppercase tracking-widest">MACHINE ARCHITECTURE</span>
                <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              </div>
              <input 
                type="text" 
                [value]="robotService.activeRobot().name"
                (change)="onNameChange($event)"
                class="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm font-bold text-white uppercase font-display focus:border-cyan-500 focus:outline-none"
              />
              
              <!-- Robot Type Selector -->
              <div class="mt-2 flex items-center gap-2">
                <span class="text-[11px] font-mono text-slate-400">Class:</span>
                <select 
                  [value]="robotService.activeRobot().type"
                  (change)="onTypeChange($event)"
                  class="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs font-mono text-cyan-400 focus:outline-none"
                >
                  <option value="rover">Rover</option>
                  <option value="scout">Scout</option>
                  <option value="racer">Racer</option>
                  <option value="rescue">Rescue Bot</option>
                  <option value="warehouse">Warehouse Bot</option>
                  <option value="custom">Custom Prototype</option>
                </select>
              </div>
            </div>

            <!-- KEY ROBOT STATISTICS -->
            <div class="space-y-2.5">
              <h4 class="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Physical Specifications
              </h4>

              @let stats = robotService.activeRobotStats();

              <div class="grid grid-cols-2 gap-2">
                <!-- Speed -->
                <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div class="text-[10px] font-mono text-slate-400 uppercase">TOP SPEED</div>
                  <div class="text-base font-bold font-mono text-cyan-400 mt-0.5 tabular-nums">
                    {{ stats.topSpeedMs }} <span class="text-xs font-normal text-slate-400">m/s</span>
                  </div>
                </div>

                <!-- Weight -->
                <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div class="text-[10px] font-mono text-slate-400 uppercase">MASS</div>
                  <div class="text-base font-bold font-mono text-white mt-0.5 tabular-nums">
                    {{ stats.weightKg }} <span class="text-xs font-normal text-slate-400">kg</span>
                  </div>
                </div>

                <!-- Total Power -->
                <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div class="text-[10px] font-mono text-slate-400 uppercase">LOAD POWER</div>
                  <div class="text-base font-bold font-mono text-amber-400 mt-0.5 tabular-nums">
                    {{ stats.totalPowerW }} <span class="text-xs font-normal text-slate-400">W</span>
                  </div>
                </div>

                <!-- Est Battery Endurance -->
                <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div class="text-[10px] font-mono text-slate-400 uppercase">ENDURANCE</div>
                  <div class="text-base font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
                    ~{{ stats.batteryLifeMin }} <span class="text-xs font-normal text-slate-400">min</span>
                  </div>
                </div>

                <!-- Motors -->
                <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div class="text-[10px] font-mono text-slate-400 uppercase">MOTORS</div>
                  <div class="text-base font-bold font-mono text-slate-200 mt-0.5 tabular-nums">
                    0{{ stats.motorCount }}
                  </div>
                </div>

                <!-- Sensors -->
                <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div class="text-[10px] font-mono text-slate-400 uppercase">SENSORS</div>
                  <div class="text-base font-bold font-mono text-slate-200 mt-0.5 tabular-nums">
                    0{{ stats.sensorCount }}
                  </div>
                </div>
              </div>

              <!-- Complexity Meter -->
              <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div class="flex justify-between text-xs font-mono">
                  <span class="text-slate-300">Engineering Complexity</span>
                  <span class="text-cyan-400 font-bold tabular-nums">{{ stats.complexity }}%</span>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500" 
                    [style.width.%]="stats.complexity"
                  ></div>
                </div>
              </div>

              <!-- Readiness & Warnings Box -->
              <div 
                class="p-3.5 rounded-xl border"
                [class.bg-emerald-950/30]="stats.isReadyForSimulation"
                [class.border-emerald-500/40]="stats.isReadyForSimulation"
                [class.bg-amber-950/30]="!stats.isReadyForSimulation"
                [class.border-amber-500/40]="!stats.isReadyForSimulation"
              >
                <div class="flex items-center gap-2 mb-1">
                  <mat-icon 
                    class="text-base"
                    [class.text-emerald-400]="stats.isReadyForSimulation"
                    [class.text-amber-400]="!stats.isReadyForSimulation"
                  >
                    {{ stats.isReadyForSimulation ? 'verified' : 'warning' }}
                  </mat-icon>
                  <span 
                    class="text-xs font-bold font-mono uppercase"
                    [class.text-emerald-300]="stats.isReadyForSimulation"
                    [class.text-amber-300]="!stats.isReadyForSimulation"
                  >
                    {{ stats.isReadyForSimulation ? 'READY FOR SIMULATION' : 'ASSEMBLY INCOMPLETE' }}
                  </span>
                </div>

                @if (!stats.isReadyForSimulation && stats.warnings.length > 0) {
                  <ul class="text-[11px] text-amber-200/90 space-y-1 pl-5 list-disc mt-2 font-mono">
                    @for (warn of stats.warnings; track warn) {
                      <li>{{ warn }}</li>
                    }
                  </ul>
                } @else {
                  <p class="text-[11px] text-emerald-300/80 font-mono mt-1">
                    Chassis, drivetrain, power bank, and cortex operational. Ready to enter simulation or code behavioral routines.
                  </p>
                }
              </div>

              <!-- Action Link to Simulate -->
              <div class="pt-2 flex flex-col gap-2">
                <a 
                  routerLink="/simulation" 
                  class="w-full py-2.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-98"
                >
                  <mat-icon class="text-base">play_arrow</mat-icon>
                  <span>TEST IN SIMULATION LAB</span>
                </a>
                <a 
                  routerLink="/code" 
                  class="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700/60 transition-all"
                >
                  <mat-icon class="text-base">code</mat-icon>
                  <span>OPEN IN CODE LAB</span>
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class Inspector {
  readonly robotService = inject(RobotService);
  private audio = inject(AudioSynth);

  onNameChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.value.trim()) {
      this.robotService.updateRobotMetadata({ name: target.value.trim() });
    }
  }

  onTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.robotService.updateRobotMetadata({ type: target.value as RobotType });
  }

  toggleEnabled(comp: RobotComponent) {
    const current = comp.properties['enabled'] !== false;
    this.robotService.updateComponentProperties(comp.id, { enabled: !current });
    this.audio.playClick();
  }

  onSliderChange(comp: RobotComponent, propKey: string, e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.robotService.updateComponentProperties(comp.id, { [propKey]: val });
  }

  updateProperty(comp: RobotComponent, props: Partial<RobotComponent['properties']>) {
    this.robotService.updateComponentProperties(comp.id, props);
    this.audio.playClick();
  }

  setRotation(comp: RobotComponent, deg: number) {
    this.robotService.updateComponentProperties(comp.id, {}, deg);
    this.audio.playClick();
  }

  removeComponent(id: string) {
    this.robotService.removeComponent(id);
  }
}
