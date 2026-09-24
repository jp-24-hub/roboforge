import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface CommandSnippet {
  command: string;
  description: string;
  category: 'motion' | 'logic' | 'flow';
  snippet: string;
}

@Component({
  selector: 'app-command-reference',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="h-full flex flex-col bg-[#0b101d] border-r border-slate-800/80 select-none overflow-y-auto">
      <div class="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
          <mat-icon class="text-cyan-400 text-base">menu_book</mat-icon>
          <span>Command Library</span>
        </div>
        <span class="text-[10px] font-mono text-slate-500">CLICK TO INSERT</span>
      </div>

      <div class="p-3 space-y-4 flex-1">
        <!-- Locomotion Commands -->
        <div class="space-y-1.5">
          <div class="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-1 font-semibold">
            Locomotion & Speed
          </div>

          @for (cmd of motionCommands; track cmd.command) {
            <button 
              type="button"
              (click)="onInsert(cmd.snippet)"
              class="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer group"
            >
              <div class="flex items-center justify-between">
                <code class="text-xs font-bold text-cyan-400 font-mono">{{ cmd.command }}</code>
                <mat-icon class="text-xs text-slate-500 group-hover:text-cyan-400">add</mat-icon>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">{{ cmd.description }}</p>
            </button>
          }
        </div>

        <!-- Sensor & Conditional Commands -->
        <div class="space-y-1.5">
          <div class="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-1 font-semibold">
            Sensors & Avoidance Logic
          </div>

          @for (cmd of logicCommands; track cmd.command) {
            <button 
              type="button"
              (click)="onInsert(cmd.snippet)"
              class="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group"
            >
              <div class="flex items-center justify-between">
                <code class="text-xs font-bold text-emerald-400 font-mono">{{ cmd.command }}</code>
                <mat-icon class="text-xs text-slate-500 group-hover:text-emerald-400">add</mat-icon>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">{{ cmd.description }}</p>
            </button>
          }
        </div>

        <!-- Flow & Directives -->
        <div class="space-y-1.5">
          <div class="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-1 font-semibold">
            Program Directives
          </div>

          @for (cmd of flowCommands; track cmd.command) {
            <button 
              type="button"
              (click)="onInsert(cmd.snippet)"
              class="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/40 transition-all cursor-pointer group"
            >
              <div class="flex items-center justify-between">
                <code class="text-xs font-bold text-amber-400 font-mono">{{ cmd.command }}</code>
                <mat-icon class="text-xs text-slate-500 group-hover:text-amber-400">add</mat-icon>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">{{ cmd.description }}</p>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class CommandReference {
  insertSnippet = output<string>();

  readonly motionCommands: CommandSnippet[] = [
    { command: 'MOVE_FORWARD', description: 'Drive motors forward at set velocity', category: 'motion', snippet: 'MOVE_FORWARD\n' },
    { command: 'MOVE_BACKWARD', description: 'Reverse drive direction', category: 'motion', snippet: 'MOVE_BACKWARD\n' },
    { command: 'TURN_RIGHT 90', description: 'Rotate chassis clockwise by degrees', category: 'motion', snippet: 'TURN_RIGHT 90\n' },
    { command: 'TURN_LEFT 90', description: 'Rotate counter-clockwise by degrees', category: 'motion', snippet: 'TURN_LEFT 90\n' },
    { command: 'SET_SPEED 75', description: 'Set motor power throttle percentage (1-100)', category: 'motion', snippet: 'SET_SPEED 75\n' },
    { command: 'STOP', description: 'Brake all propulsion motors immediately', category: 'motion', snippet: 'STOP\n' }
  ];

  readonly logicCommands: CommandSnippet[] = [
    { command: 'IF_DISTANCE_LESS_THAN 25', description: 'Triggers when sonar detects obstacle within distance', category: 'logic', snippet: 'IF_DISTANCE_LESS_THAN 25\n  STOP\n  TURN_RIGHT 90\n  MOVE_FORWARD\nEND_IF\n' },
    { command: 'IF_LINE_DETECTED', description: 'Triggers when IR floor sensor locks onto floor track line', category: 'logic', snippet: 'IF_LINE_DETECTED\n  MOVE_FORWARD\nELSE\n  TURN_LEFT 30\nEND_IF\n' },
    { command: 'END_IF', description: 'Closes a conditional branch block', category: 'logic', snippet: 'END_IF\n' }
  ];

  readonly flowCommands: CommandSnippet[] = [
    { command: 'START', description: 'Initializes autonomous execution sequence', category: 'flow', snippet: 'START\n' },
    { command: 'WAIT 300', description: 'Pauses processor thread for milliseconds', category: 'flow', snippet: 'WAIT 300\n' }
  ];

  onInsert(code: string) {
    this.insertSnippet.emit(code);
  }
}
