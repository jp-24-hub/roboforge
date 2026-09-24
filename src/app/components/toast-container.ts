import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-2"
          [class.bg-slate-900/95]="toast.type === 'info'"
          [class.border-cyan-500/40]="toast.type === 'info'"
          [class.text-cyan-400]="toast.type === 'info'"
          [class.bg-emerald-950/95]="toast.type === 'success'"
          [class.border-emerald-500/50]="toast.type === 'success'"
          [class.text-emerald-400]="toast.type === 'success'"
          [class.bg-amber-950/95]="toast.type === 'warn'"
          [class.border-amber-500/50]="toast.type === 'warn'"
          [class.text-amber-400]="toast.type === 'warn'"
          [class.bg-rose-950/95]="toast.type === 'error'"
          [class.border-rose-500/50]="toast.type === 'error'"
          [class.text-rose-400]="toast.type === 'error'"
        >
          <mat-icon class="text-xl shrink-0 mt-0.5">
            @switch (toast.type) {
              @case ('success') { check_circle }
              @case ('warn') { warning }
              @case ('error') { error }
              @default { info }
            }
          </mat-icon>
          <div class="flex-1 pr-1">
            <div class="text-xs font-bold font-mono tracking-wide text-slate-100 uppercase">
              {{ toast.title }}
            </div>
            @if (toast.description) {
              <div class="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {{ toast.description }}
              </div>
            }
          </div>
          <button 
            (click)="toastService.dismiss(toast.id)"
            class="text-slate-400 hover:text-white p-0.5"
            aria-label="Close notification"
          >
            <mat-icon class="text-sm">close</mat-icon>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainer {
  readonly toastService = inject(ToastService);
}
