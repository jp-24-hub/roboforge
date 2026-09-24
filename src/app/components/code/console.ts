import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SimulationEngineService } from '../../services/simulation-engine.service';
import { AudioSynth } from '../../services/audio-synth';

@Component({
  selector: 'app-console',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="h-full flex flex-col bg-[#080c16] border-t border-slate-800 select-none font-mono">
      <!-- Console Header Bar -->
      <div class="h-10 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 text-slate-300">
          <mat-icon class="text-sm text-cyan-400">terminal</mat-icon>
          <span class="font-bold tracking-wider uppercase text-[11px]">Telemetry & Execution Console</span>
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Filter buttons -->
          <div class="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
            <button 
              (click)="setFilter('all')" 
              class="px-2 py-0.5 rounded transition-colors"
              [class.bg-slate-800]="filter() === 'all'"
              [class.text-white]="filter() === 'all'"
              [class.text-slate-400]="filter() !== 'all'"
            >
              ALL
            </button>
            <button 
              (click)="setFilter('warn')" 
              class="px-2 py-0.5 rounded transition-colors"
              [class.bg-slate-800]="filter() === 'warn'"
              [class.text-amber-400]="filter() === 'warn'"
              [class.text-slate-400]="filter() !== 'warn'"
            >
              WARNS
            </button>
            <button 
              (click)="setFilter('error')" 
              class="px-2 py-0.5 rounded transition-colors"
              [class.bg-slate-800]="filter() === 'error'"
              [class.text-rose-400]="filter() === 'error'"
              [class.text-slate-400]="filter() !== 'error'"
            >
              ERRS
            </button>
          </div>

          <!-- Clear Console -->
          <button 
            (click)="simEngine.clearLogs()"
            class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Clear Console"
          >
            <mat-icon class="text-sm">delete_sweep</mat-icon>
          </button>
        </div>
      </div>

      <!-- Logs Output Area -->
      <div 
        #logsContainer
        class="flex-1 p-3 overflow-y-auto space-y-1 text-xs select-text font-mono"
      >
        @for (log of filteredLogs(); track $index) {
          <div 
            class="flex items-start gap-2.5 leading-relaxed py-0.5"
            [class.text-slate-300]="log.level === 'info'"
            [class.text-amber-300]="log.level === 'warn'"
            [class.text-rose-400]="log.level === 'error'"
            [class.text-emerald-400]="log.level === 'success'"
          >
            <!-- Timestamp -->
            <span class="text-slate-500 shrink-0 text-[11px]">[{{ log.time }}]</span>

            <!-- Level Glyph -->
            <span class="shrink-0 text-[10px] uppercase px-1 rounded font-bold"
              [class.bg-slate-800]="log.level === 'info'"
              [class.text-slate-400]="log.level === 'info'"
              [class.bg-amber-950]="log.level === 'warn'"
              [class.text-amber-400]="log.level === 'warn'"
              [class.bg-rose-950]="log.level === 'error'"
              [class.text-rose-400]="log.level === 'error'"
              [class.bg-emerald-950]="log.level === 'success'"
              [class.text-emerald-400]="log.level === 'success'"
            >
              {{ log.level }}
            </span>

            <!-- Log Message -->
            <span class="flex-1 break-all">{{ log.message }}</span>
          </div>
        }
      </div>
    </div>
  `
})
export class Console {
  @ViewChild('logsContainer') logsContainerRef!: ElementRef<HTMLDivElement>;

  readonly simEngine = inject(SimulationEngineService);
  private audio = inject(AudioSynth);

  readonly filter = signal<'all' | 'warn' | 'error'>('all');

  filteredLogs() {
    const logs = this.simEngine.telemetry().logs;
    const f = this.filter();
    if (f === 'all') return logs;
    return logs.filter((l) => l.level === f);
  }

  setFilter(f: 'all' | 'warn' | 'error') {
    this.filter.set(f);
    this.audio.playClick();
  }
}
