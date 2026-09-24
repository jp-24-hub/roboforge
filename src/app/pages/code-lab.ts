import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommandReference } from '../components/code/command-reference';
import { Console } from '../components/code/console';
import { CodeInterpreterService, CodeValidationResult } from '../services/code-interpreter.service';
import { RobotService } from '../services/robot.service';
import { ProgressService } from '../services/progress.service';
import { ToastService } from '../services/toast.service';
import { AudioSynth } from '../services/audio-synth';
import { DEFAULT_DSL_PROGRAM, DEFAULT_JS_PROGRAM } from '../data/robot-defaults';

@Component({
  selector: 'app-code-lab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, MatIconModule, CommandReference, Console],
  template: `
    <div class="relative z-10 w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden select-none">
      <!-- Top Action Bar -->
      <div class="h-12 px-4 bg-[#090d16] border-b border-slate-800 flex items-center justify-between z-20">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-xs font-mono">
            <mat-icon class="text-cyan-400 text-sm">terminal</mat-icon>
            <span class="text-slate-400">PROGRAMMING:</span>
            <span class="text-white font-bold uppercase">{{ robotService.activeRobot().name }}</span>
          </div>

          <!-- Mode Switcher (DSL vs JavaScript) -->
          <div class="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <button 
              (click)="switchMode('dsl')"
              class="px-2.5 py-1 rounded-md transition-all font-semibold"
              [class.bg-cyan-500]="activeMode() === 'dsl'"
              [class.text-slate-950]="activeMode() === 'dsl'"
              [class.text-slate-400]="activeMode() !== 'dsl'"
            >
              ROBOT DSL
            </button>
            <button 
              (click)="switchMode('js')"
              class="px-2.5 py-1 rounded-md transition-all font-semibold"
              [class.bg-cyan-500]="activeMode() === 'js'"
              [class.text-slate-950]="activeMode() === 'js'"
              [class.text-slate-400]="activeMode() !== 'js'"
            >
              JAVASCRIPT
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Reset to Default Code Template -->
          <button 
            (click)="loadTemplate()"
            class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            TEMPLATES
          </button>

          <!-- Validate Code Button -->
          <button 
            (click)="validateCurrentCode()"
            class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <mat-icon class="text-sm">check_circle</mat-icon>
            <span>VALIDATE</span>
          </button>

          <!-- Save & Run in Simulation -->
          <button 
            (click)="saveAndSimulate()"
            class="px-3.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
          >
            <mat-icon class="text-sm">play_arrow</mat-icon>
            <span>DEPLOY TO SIM</span>
          </button>
        </div>
      </div>

      <!-- Main Split Area -->
      <div class="flex-1 flex overflow-hidden">
        <!-- LEFT: Command Reference / Snippets (260px) -->
        <div class="hidden lg:block w-64 xl:w-72 shrink-0 h-full">
          <app-command-reference (insertSnippet)="insertSnippetAtCursor($event)"></app-command-reference>
        </div>

        <!-- CENTER: Code Editor (Expands) -->
        <div class="flex-1 flex flex-col h-full min-w-0 bg-[#070a12] border-r border-slate-800">
          <!-- Editor Sub-Header / Linter Feedback Bar -->
          @if (validation(); as res) {
            @if (!res.isValid) {
              <div class="p-2.5 bg-rose-950/60 border-b border-rose-500/40 text-rose-300 text-xs font-mono flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-sm text-rose-400">error</mat-icon>
                  <span>{{ res.errors[0] }}</span>
                </div>
                <button (click)="validation.set(null)" class="text-rose-400 hover:text-white">
                  <mat-icon class="text-xs">close</mat-icon>
                </button>
              </div>
            } @else if (res.warnings.length > 0) {
              <div class="p-2 bg-amber-950/50 border-b border-amber-500/40 text-amber-300 text-xs font-mono flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-sm text-amber-400">warning</mat-icon>
                  <span>{{ res.warnings[0] }}</span>
                </div>
                <button (click)="validation.set(null)" class="text-amber-400 hover:text-white">
                  <mat-icon class="text-xs">close</mat-icon>
                </button>
              </div>
            } @else {
              <div class="p-2 bg-emerald-950/40 border-b border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-sm text-emerald-400">verified</mat-icon>
                  <span>CODE VALIDATED: Ready for execution</span>
                </div>
                <button (click)="validation.set(null)" class="text-emerald-400 hover:text-white">
                  <mat-icon class="text-xs">close</mat-icon>
                </button>
              </div>
            }
          }

          <!-- Code Textarea with Line Numbers -->
          <div class="flex-1 flex overflow-hidden relative font-mono text-xs leading-relaxed">
            <!-- Line Numbers Gutter -->
            <div class="w-12 shrink-0 bg-[#0a0f1d] border-r border-slate-800 text-slate-600 select-none py-3 px-2 text-right">
              @for (n of lineNumbers(); track n) {
                <div class="h-5">{{ n }}</div>
              }
            </div>

            <!-- Code Input Textarea -->
            <textarea 
              #codeArea
              [value]="currentCode()"
              (input)="onCodeChange($event)"
              spellcheck="false"
              class="flex-1 bg-transparent text-cyan-200 p-3 outline-none resize-none overflow-y-auto leading-5 font-mono selection:bg-cyan-500/30"
              placeholder="Write robot behavioral logic here..."
            ></textarea>
          </div>

          <!-- Bottom Half: Live Console -->
          <div class="h-48 shrink-0">
            <app-console class="h-full block"></app-console>
          </div>
        </div>

        <!-- RIGHT: Robot Preview & Quick Diagnostics (280px) -->
        <div class="hidden xl:flex flex-col w-72 shrink-0 h-full bg-[#0b101d] select-none p-4 space-y-4 overflow-y-auto">
          <div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            <mat-icon class="text-cyan-400 text-sm">visibility</mat-icon>
            <span>Robot Preview</span>
          </div>

          <!-- Schematic Miniature -->
          <div class="h-44 w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
            <div class="absolute inset-0 bg-grid-pattern opacity-30"></div>
            <svg class="w-32 h-32 relative z-10" viewBox="-60 -60 120 120">
              <rect x="-38" y="-30" width="14" height="60" rx="3" fill="#0284c7" />
              <rect x="24" y="-30" width="14" height="60" rx="3" fill="#0284c7" />
              <rect x="-24" y="-34" width="48" height="68" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
              <rect x="-12" y="-12" width="24" height="24" rx="3" fill="#0f172a" stroke="#818cf8" stroke-width="1.5" />
              <circle cx="-8" cy="-38" r="4" fill="#34d399" />
              <circle cx="8" cy="-38" r="4" fill="#34d399" />
            </svg>
          </div>

          <!-- Configured Sensors Readout -->
          <div class="space-y-2 text-xs font-mono">
            <div class="text-[10px] uppercase text-slate-500 font-bold">Onboard Sensors & Ports</div>
            @for (comp of robotService.activeRobot().components; track comp.id) {
              @if (comp.category === 'sensor') {
                <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span class="text-slate-300">{{ comp.name }}</span>
                  <span class="text-emerald-400 text-[10px] font-bold">PORT 01</span>
                </div>
              }
            }
          </div>

          <!-- Direct Run Shortcut -->
          <button 
            (click)="saveAndSimulate()"
            class="w-full py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all mt-auto"
          >
            <mat-icon class="text-base">play_arrow</mat-icon>
            <span>LAUNCH SIMULATION</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class CodeLab {
  readonly robotService = inject(RobotService);
  private interpreter = inject(CodeInterpreterService);
  private progress = inject(ProgressService);
  private toast = inject(ToastService);
  private audio = inject(AudioSynth);
  private router = inject(Router);

  readonly activeMode = signal<'dsl' | 'js'>(this.robotService.activeRobot().programMode || 'dsl');
  readonly currentCode = signal<string>(this.robotService.activeRobot().programCode || DEFAULT_DSL_PROGRAM);
  readonly validation = signal<CodeValidationResult | null>(null);

  lineNumbers(): number[] {
    const lines = this.currentCode().split('\n').length;
    return Array.from({ length: Math.max(15, lines) }, (_, i) => i + 1);
  }

  onCodeChange(e: Event) {
    const code = (e.target as HTMLTextAreaElement).value;
    this.currentCode.set(code);
    this.robotService.updateProgram(code, this.activeMode());
  }

  switchMode(mode: 'dsl' | 'js') {
    this.activeMode.set(mode);
    this.audio.playClick();
    if (mode === 'js' && !this.currentCode().includes('function') && !this.currentCode().includes('distance <')) {
      this.currentCode.set(DEFAULT_JS_PROGRAM);
    } else if (mode === 'dsl' && this.currentCode().includes('function')) {
      this.currentCode.set(DEFAULT_DSL_PROGRAM);
    }
    this.robotService.updateProgram(this.currentCode(), mode);
    this.validateCurrentCode();
  }

  loadTemplate() {
    this.audio.playClick();
    if (this.activeMode() === 'dsl') {
      this.currentCode.set(DEFAULT_DSL_PROGRAM);
    } else {
      this.currentCode.set(DEFAULT_JS_PROGRAM);
    }
    this.robotService.updateProgram(this.currentCode(), this.activeMode());
    this.toast.show('TEMPLATE LOADED', 'Obstacle avoidance cruise routine initialized', 'info');
  }

  insertSnippetAtCursor(snippet: string) {
    this.audio.playConnect();
    const current = this.currentCode();
    const updated = current + '\n' + snippet;
    this.currentCode.set(updated);
    this.robotService.updateProgram(updated, this.activeMode());
    this.toast.show('INSTRUCTION INSERTED', snippet.trim(), 'info');
  }

  validateCurrentCode(): boolean {
    const res = this.interpreter.validateCode(this.currentCode(), this.activeMode());
    this.validation.set(res);

    if (res.isValid) {
      this.audio.playSuccess();
      this.progress.unlockBadge('badge-first-program');
      this.toast.show('SYNTAX VERIFIED', 'Autonomous logic is structurally sound', 'success');
      return true;
    } else {
      this.audio.playAlert();
      this.toast.show('VALIDATION ERROR', res.errors[0] || 'Invalid instructions', 'error');
      return false;
    }
  }

  saveAndSimulate() {
    this.robotService.updateProgram(this.currentCode(), this.activeMode());
    if (this.validateCurrentCode()) {
      this.router.navigate(['/simulation']);
    }
  }
}
