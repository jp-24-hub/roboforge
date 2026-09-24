import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { COMPONENT_CATALOG, CatalogComponent } from '../../data/components-library';
import { ComponentCategory } from '../../models/robot.model';
import { RobotService } from '../../services/robot.service';
import { AudioSynth } from '../../services/audio-synth';

@Component({
  selector: 'app-component-library',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="h-full flex flex-col bg-[#0b101d] border-r border-slate-800/80 select-none">
      <!-- Library Header -->
      <div class="p-4 border-b border-slate-800/80">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
            <mat-icon class="text-cyan-400 text-base">category</mat-icon>
            <span>Component Library</span>
          </div>
          <span class="text-[10px] font-mono text-slate-500">{{ filteredComponents().length }} items</span>
        </div>

        <!-- Category Tabs Filter -->
        <div class="flex flex-wrap gap-1 mt-3">
          @for (cat of categories; track cat.id) {
            <button
              (click)="selectCategory(cat.id)"
              class="px-2 py-1 rounded text-[11px] font-mono transition-all"
              [class.bg-cyan-500]="activeCategory() === cat.id"
              [class.text-slate-950]="activeCategory() === cat.id"
              [class.font-bold]="activeCategory() === cat.id"
              [class.bg-slate-900]="activeCategory() !== cat.id"
              [class.text-slate-400]="activeCategory() !== cat.id"
              [class.hover:text-slate-200]="activeCategory() !== cat.id"
            >
              {{ cat.label }}
            </button>
          }
        </div>
      </div>

      <!-- Component Catalog List -->
      <div class="flex-1 p-3 space-y-2 overflow-y-auto">
        @for (comp of filteredComponents(); track comp.id) {
          <div 
            class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-all group cursor-pointer relative"
            role="button"
            tabindex="0"
            (click)="mountComponent(comp)"
            (keydown.enter)="mountComponent(comp)"
          >
            <div class="flex items-start gap-3">
              <!-- Component Icon Tile -->
              <div 
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                [style.background-color]="comp.color + '15'"
                [style.border-color]="comp.color + '40'"
                [style.color]="comp.color"
              >
                <mat-icon class="text-xl">{{ comp.icon }}</mat-icon>
              </div>

              <!-- Component Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                    {{ comp.name }}
                  </h4>
                  <span class="text-[9px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-400">
                    {{ comp.category }}
                  </span>
                </div>

                <p class="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {{ comp.description }}
                </p>

                <!-- Spec pill tags -->
                <div class="flex flex-wrap items-center gap-1.5 mt-2 text-[10px] font-mono text-slate-400">
                  @if (comp.defaultProperties.speed) {
                    <span class="text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                      {{ comp.defaultProperties.speed }} RPM
                    </span>
                  }
                  @if (comp.defaultProperties.torque) {
                    <span class="text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded">
                      {{ comp.defaultProperties.torque }} Nm
                    </span>
                  }
                  @if (comp.defaultProperties.range) {
                    <span class="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      {{ comp.defaultProperties.range }} cm
                    </span>
                  }
                  @if (comp.defaultProperties.capacity) {
                    <span class="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                      {{ comp.defaultProperties.capacity }} mAh
                    </span>
                  }
                  @if (comp.defaultProperties.power) {
                    <span class="text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded">
                      {{ comp.defaultProperties.power }} W
                    </span>
                  }
                  @if (comp.defaultProperties.weight) {
                    <span class="text-slate-400">
                      {{ comp.defaultProperties.weight }} kg
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Quick Add Action Button -->
            <button 
              (click)="mountComponent(comp); $event.stopPropagation()"
              class="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <mat-icon class="text-sm">add_circle</mat-icon>
              <span>MOUNT TO CHASSIS</span>
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class ComponentLibrary {
  private robotService = inject(RobotService);
  private audio = inject(AudioSynth);

  readonly categories: { id: ComponentCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'ALL' },
    { id: 'chassis', label: 'CHASSIS' },
    { id: 'movement', label: 'MOVEMENT' },
    { id: 'sensor', label: 'SENSORS' },
    { id: 'power', label: 'POWER' },
    { id: 'control', label: 'CONTROL' },
    { id: 'output', label: 'OUTPUT' }
  ];

  readonly activeCategory = signal<ComponentCategory | 'all'>('all');

  readonly filteredComponents = signal<CatalogComponent[]>(COMPONENT_CATALOG);

  selectCategory(cat: ComponentCategory | 'all') {
    this.activeCategory.set(cat);
    this.audio.playClick();
    if (cat === 'all') {
      this.filteredComponents.set(COMPONENT_CATALOG);
    } else {
      this.filteredComponents.set(COMPONENT_CATALOG.filter((c) => c.category === cat));
    }
  }

  mountComponent(catalog: CatalogComponent) {
    this.robotService.addComponent(catalog);
  }
}
