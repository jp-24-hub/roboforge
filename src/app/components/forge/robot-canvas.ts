import { ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RobotComponent } from '../../models/robot.model';
import { RobotService } from '../../services/robot.service';
import { AudioSynth } from '../../services/audio-synth';

@Component({
  selector: 'app-robot-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div 
      #workbenchContainer
      class="relative w-full h-full flex flex-col bg-[#070a12] overflow-hidden select-none cursor-crosshair"
      (mousedown)="onCanvasMouseDown($event)"
      (mousemove)="onCanvasMouseMove($event)"
      (mouseup)="onCanvasMouseUp()"
      (wheel)="onWheel($event)"
    >
      <!-- Workbench Floating Top Bar -->
      <div class="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-auto">
        <div class="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2 backdrop-blur-md">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>WORKBENCH:</span>
          <span class="text-cyan-400 font-bold uppercase">{{ robotService.activeRobot().name }}</span>
          <span class="text-slate-500">|</span>
          <span class="text-slate-400">{{ robotService.activeRobot().components.length }} COMPS</span>
        </div>
      </div>

      <!-- Workbench Controls (Zoom / Reset / Delete) -->
      <div class="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md pointer-events-auto">
        <button 
          (click)="zoomIn()" 
          title="Zoom In (+)"
          class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <mat-icon class="text-base">zoom_in</mat-icon>
        </button>
        <button 
          (click)="zoomOut()" 
          title="Zoom Out (-)"
          class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <mat-icon class="text-base">zoom_out</mat-icon>
        </button>
        <button 
          (click)="resetView()" 
          title="Reset View (100%)"
          class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <mat-icon class="text-base">center_focus_strong</mat-icon>
        </button>
        <div class="w-px h-4 bg-slate-800 mx-0.5"></div>
        <button 
          [disabled]="!robotService.selectedComponentId()"
          (click)="deleteSelected()" 
          title="Delete Selected Component"
          class="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <mat-icon class="text-base">delete</mat-icon>
        </button>
      </div>

      <!-- Workbench Interactive SVG Canvas -->
      <svg 
        #svgElement
        class="w-full h-full"
        viewBox="-250 -220 500 440"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <!-- Fine Blueprint Grid Pattern -->
          <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1" />
          </pattern>
          <pattern id="major-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#grid-pattern)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(56, 189, 248, 0.1)" stroke-width="1.5" />
          </pattern>

          <!-- Glow Filter -->
          <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Background grid applied inside scalable group -->
        <g [attr.transform]="transformString()">
          <rect x="-1000" y="-1000" width="2000" height="2000" fill="url(#major-grid)" />

          <!-- Center Crosshair Origin -->
          <line x1="-300" y1="0" x2="300" y2="0" stroke="rgba(56, 189, 248, 0.15)" stroke-dasharray="4 4" stroke-width="1" />
          <line x1="0" y1="-300" x2="0" y2="300" stroke="rgba(56, 189, 248, 0.15)" stroke-dasharray="4 4" stroke-width="1" />
          <circle cx="0" cy="0" r="4" fill="#0284c7" />

          <!-- Forward Direction Indicator (Robot Front) -->
          <g transform="translate(0, -160)">
            <path d="M 0 -12 L -6 0 L 6 0 Z" fill="#38bdf8" />
            <text x="0" y="16" text-anchor="middle" fill="#0284c7" font-size="9" font-family="monospace" letter-spacing="1.5">ROBOT FRONT</text>
          </g>

          <!-- System Wiring Connections Bus (Battery -> Controller -> Motors/Sensors) -->
          @if (controllerComp(); as mcu) {
            <!-- Battery to Controller Power Wire -->
            @if (batteryComp(); as bat) {
              <path 
                [attr.d]="createWirePath(bat.x, bat.y, mcu.x, mcu.y)" 
                fill="none" 
                stroke="#10b981" 
                stroke-width="2.5" 
                stroke-dasharray="4 2"
                opacity="0.6"
              />
            }

            <!-- Controller to Motors Bus -->
            @for (comp of motorComps(); track comp.id) {
              <path 
                [attr.d]="createWirePath(mcu.x, mcu.y, comp.x, comp.y)" 
                fill="none" 
                stroke="#06b6d4" 
                stroke-width="1.8" 
                stroke-dasharray="3 3"
                opacity="0.5"
              />
            }

            <!-- Controller to Sensors Bus -->
            @for (comp of sensorComps(); track comp.id) {
              <path 
                [attr.d]="createWirePath(comp.x, comp.y, mcu.x, mcu.y)" 
                fill="none" 
                stroke="#a855f7" 
                stroke-width="1.8" 
                stroke-dasharray="3 3"
                opacity="0.5"
              />
            }
          }

          <!-- RENDER COMPONENTS -->
          @for (comp of robotService.activeRobot().components; track comp.id) {
            <g 
              [attr.transform]="'translate(' + comp.x + ',' + comp.y + ') rotate(' + comp.rotation + ')'"
              class="cursor-grab active:cursor-grabbing group"
              (mousedown)="onComponentMouseDown(comp, $event)"
              [class.filter-selected]="comp.id === robotService.selectedComponentId()"
            >
              <!-- Highlight Selection Ring -->
              @if (comp.id === robotService.selectedComponentId()) {
                <rect 
                  x="-42" y="-36" width="84" height="72" rx="8"
                  fill="none" 
                  stroke="#38bdf8" 
                  stroke-width="2" 
                  stroke-dasharray="4 2"
                  class="animate-pulse"
                />
              }

              <!-- CHASSIS RENDERING -->
              @if (comp.category === 'chassis') {
                <rect 
                  x="-75" y="-95" width="150" height="190" rx="16" 
                  fill="#111827" 
                  stroke="#334155" 
                  stroke-width="3" 
                />
                <!-- Inner technical bevel -->
                <rect 
                  x="-65" y="-85" width="130" height="170" rx="12" 
                  fill="#0b101d" 
                  stroke="#1e293b" 
                  stroke-width="2" 
                />
                <!-- Mounting holes and chassis accents -->
                <circle cx="-50" cy="-70" r="3.5" fill="#475569" />
                <circle cx="50" cy="-70" r="3.5" fill="#475569" />
                <circle cx="-50" cy="70" r="3.5" fill="#475569" />
                <circle cx="50" cy="70" r="3.5" fill="#475569" />
                <circle cx="0" cy="0" r="18" fill="none" stroke="#1e293b" stroke-width="2" />
                <text x="0" y="3" text-anchor="middle" fill="#334155" font-size="8" font-family="monospace">CORE</text>
              }

              <!-- WHEELS / TRACKS RENDERING -->
              @else if (comp.category === 'movement' && comp.catalogId.includes('wheel')) {
                <g>
                  <!-- Rubber tire -->
                  <rect x="-16" y="-32" width="32" height="64" rx="6" fill="#0f172a" stroke="#475569" stroke-width="2" />
                  <!-- Tread grooves -->
                  <line x1="-16" y1="-20" x2="16" y2="-20" stroke="#334155" stroke-width="2" />
                  <line x1="-16" y1="-8" x2="16" y2="-8" stroke="#334155" stroke-width="2" />
                  <line x1="-16" y1="4" x2="16" y2="4" stroke="#334155" stroke-width="2" />
                  <line x1="-16" y1="16" x2="16" y2="16" stroke="#334155" stroke-width="2" />
                  <!-- Center Rim -->
                  <rect x="-8" y="-14" width="16" height="28" rx="3" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
                  <circle cx="0" cy="0" r="3" fill="#f8fafc" />
                </g>
              }
              @else if (comp.category === 'movement' && comp.catalogId.includes('track')) {
                <g>
                  <rect x="-22" y="-45" width="44" height="90" rx="10" fill="#090d16" stroke="#f59e0b" stroke-width="2" />
                  <circle cx="0" cy="-28" r="12" fill="#1e293b" stroke="#f59e0b" stroke-width="1" />
                  <circle cx="0" cy="28" r="12" fill="#1e293b" stroke="#f59e0b" stroke-width="1" />
                </g>
              }

              <!-- MOTORS RENDERING -->
              @else if (comp.category === 'movement' && comp.catalogId.includes('motor')) {
                <g>
                  <rect x="-18" y="-22" width="36" height="44" rx="4" fill="#1e293b" stroke="#06b6d4" stroke-width="2" />
                  <rect x="-12" y="-16" width="24" height="32" rx="2" fill="#0f172a" stroke="#0e7490" stroke-width="1" />
                  <!-- Motor shaft -->
                  <rect x="-4" y="-30" width="8" height="8" rx="1" fill="#cbd5e1" />
                  <text x="0" y="3" text-anchor="middle" fill="#06b6d4" font-size="8" font-family="monospace">MOTOR</text>
                </g>
              }

              <!-- CONTROLLER MCU RENDERING -->
              @else if (comp.category === 'control') {
                <g>
                  <!-- PCB substrate -->
                  <rect x="-35" y="-28" width="70" height="56" rx="6" fill="#1e1b4b" stroke="#818cf8" stroke-width="2" />
                  <!-- Processor Chip -->
                  <rect x="-18" y="-14" width="36" height="28" rx="2" fill="#0f172a" stroke="#c084fc" stroke-width="1.5" />
                  <!-- Heartbeat Pulse LED -->
                  <circle cx="24" cy="-18" r="3" fill="#38bdf8" class="animate-pulse" filter="url(#cyan-glow)" />
                  <!-- Pin Headers -->
                  <rect x="-32" y="-24" width="4" height="48" fill="#e2e8f0" rx="1" />
                  <rect x="28" y="-24" width="4" height="48" fill="#e2e8f0" rx="1" />
                  <text x="0" y="3" text-anchor="middle" fill="#e0e7ff" font-size="8" font-bold font-family="monospace">
                    {{ comp.properties['label'] || 'CORTEX' }}
                  </text>
                </g>
              }

              <!-- BATTERY PACK RENDERING -->
              @else if (comp.category === 'power') {
                <g>
                  <rect x="-32" y="-22" width="64" height="44" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="2" />
                  <!-- Terminal nodes -->
                  <rect x="-18" y="-26" width="10" height="5" rx="1" fill="#ef4444" />
                  <rect x="8" y="-26" width="10" height="5" rx="1" fill="#0f172a" />
                  <!-- Charge Level indicator bars -->
                  <rect x="-24" y="-6" width="10" height="14" rx="1" fill="#34d399" />
                  <rect x="-10" y="-6" width="10" height="14" rx="1" fill="#34d399" />
                  <rect x="4" y="-6" width="10" height="14" rx="1" fill="#34d399" />
                  <rect x="18" y="-6" width="10" height="14" rx="1" fill="#34d399" />
                  <text x="0" y="16" text-anchor="middle" fill="#ecfdf5" font-size="7" font-family="monospace">
                    {{ comp.properties['capacity'] || 5000 }}mAh
                  </text>
                </g>
              }

              <!-- ULTRASONIC SENSOR RENDERING -->
              @else if (comp.category === 'sensor' && comp.catalogId.includes('ultrasonic')) {
                <g>
                  <!-- Sonar board -->
                  <rect x="-36" y="-18" width="72" height="36" rx="4" fill="#0f172a" stroke="#10b981" stroke-width="2" />
                  <!-- Left transducer eye -->
                  <circle cx="-16" cy="0" r="11" fill="#1e293b" stroke="#34d399" stroke-width="2" />
                  <circle cx="-16" cy="0" r="5" fill="#090d16" />
                  <!-- Right transducer eye -->
                  <circle cx="16" cy="0" r="11" fill="#1e293b" stroke="#34d399" stroke-width="2" />
                  <circle cx="16" cy="0" r="5" fill="#090d16" />
                  <!-- Faint acoustic field forward cone -->
                  <path d="M -16 -12 L -35 -45 L 35 -45 L 16 -12 Z" fill="rgba(52, 211, 153, 0.08)" stroke="rgba(52, 211, 153, 0.3)" stroke-dasharray="2 2" />
                </g>
              }

              <!-- INFRARED / OTHER SENSORS -->
              @else if (comp.category === 'sensor') {
                <g>
                  <rect x="-20" y="-16" width="40" height="32" rx="4" fill="#0f172a" stroke="#34d399" stroke-width="2" />
                  <circle cx="-8" cy="0" r="5" fill="#991b1b" />
                  <circle cx="8" cy="0" r="5" fill="#047857" />
                  <text x="0" y="2" text-anchor="middle" fill="#a7f3d0" font-size="7" font-family="monospace">SENS</text>
                </g>
              }

              <!-- OUTPUTS (LED, BUZZER, DISPLAY) -->
              @else if (comp.category === 'output') {
                <g>
                  <rect x="-18" y="-18" width="36" height="36" rx="4" fill="#0f172a" stroke="#06b6d4" stroke-width="2" />
                  @if (comp.catalogId.includes('led')) {
                    <circle cx="0" cy="0" r="10" fill="#06b6d4" filter="url(#cyan-glow)" />
                  } @else {
                    <circle cx="0" cy="0" r="8" fill="#334155" />
                  }
                  <text x="0" y="2" text-anchor="middle" fill="#cffafe" font-size="7" font-family="monospace">OUT</text>
                </g>
              }

              <!-- Default Fallback Component Box -->
              @else {
                <rect x="-24" y="-20" width="48" height="40" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
                <text x="0" y="4" text-anchor="middle" fill="#e2e8f0" font-size="8" font-family="monospace">PART</text>
              }
            </g>
          }
        </g>
      </svg>

      <!-- Bottom Coordinate / Status Bar -->
      <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-500 pointer-events-none">
        <div class="flex items-center gap-3">
          <span>SNAP: 10px</span>
          <span>SCALE: {{ zoom() }}x</span>
          @if (robotService.selectedComponent(); as sel) {
            <span class="text-cyan-400 font-bold uppercase">SELECTED: {{ sel.name }} ({{ sel.x }}, {{ sel.y }})</span>
          }
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <span>DRAG TO POSITION</span>
          <span>·</span>
          <span>WHEEL TO ZOOM</span>
        </div>
      </div>
    </div>
  `
})
export class RobotCanvas {
  @ViewChild('workbenchContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('svgElement', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  readonly robotService = inject(RobotService);
  private audio = inject(AudioSynth);

  readonly zoom = signal<number>(1.1);
  readonly pan = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  private isPanning = false;
  private isDraggingComponent = false;
  private draggedComponent: RobotComponent | null = null;
  private dragStartMouse = { x: 0, y: 0 };
  private dragStartCompPos = { x: 0, y: 0 };
  private panStartMouse = { x: 0, y: 0 };
  private panStartOffset = { x: 0, y: 0 };

  // Helper getters for wiring diagram
  controllerComp() {
    return this.robotService.activeRobot().components.find((c) => c.category === 'control');
  }

  batteryComp() {
    return this.robotService.activeRobot().components.find((c) => c.category === 'power');
  }

  motorComps() {
    return this.robotService.activeRobot().components.filter((c) => c.category === 'movement');
  }

  sensorComps() {
    return this.robotService.activeRobot().components.filter((c) => c.category === 'sensor');
  }

  transformString(): string {
    const p = this.pan();
    const z = this.zoom();
    return `translate(${p.x}, ${p.y}) scale(${z})`;
  }

  createWirePath(x1: number, y1: number, x2: number, y2: number): string {
    // Orthogonal circuit tracing wire path
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  }

  zoomIn() {
    this.zoom.update((z) => Math.min(2.0, +(z + 0.15).toFixed(2)));
    this.audio.playClick();
  }

  zoomOut() {
    this.zoom.update((z) => Math.max(0.6, +(z - 0.15).toFixed(2)));
    this.audio.playClick();
  }

  resetView() {
    this.zoom.set(1.1);
    this.pan.set({ x: 0, y: 0 });
    this.audio.playClick();
  }

  deleteSelected() {
    const id = this.robotService.selectedComponentId();
    if (id) {
      this.robotService.removeComponent(id);
    }
  }

  onWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    this.zoom.update((z) => Math.min(2.0, Math.max(0.6, +(z + delta).toFixed(2))));
  }

  onComponentMouseDown(comp: RobotComponent, e: MouseEvent) {
    e.stopPropagation();
    this.robotService.selectedComponentId.set(comp.id);
    this.audio.playClick();

    this.isDraggingComponent = true;
    this.draggedComponent = comp;
    this.dragStartMouse = { x: e.clientX, y: e.clientY };
    this.dragStartCompPos = { x: comp.x, y: comp.y };
  }

  onCanvasMouseDown(e: MouseEvent) {
    // Clicking canvas background deselects component
    if (e.target === this.svgRef?.nativeElement || (e.target as HTMLElement).tagName === 'rect') {
      this.robotService.selectedComponentId.set(null);
    }

    this.isPanning = true;
    this.panStartMouse = { x: e.clientX, y: e.clientY };
    this.panStartOffset = { ...this.pan() };
  }

  onCanvasMouseMove(e: MouseEvent) {
    if (this.isDraggingComponent && this.draggedComponent) {
      const z = this.zoom();
      const dx = (e.clientX - this.dragStartMouse.x) / z;
      const dy = (e.clientY - this.dragStartMouse.y) / z;

      // Snap to 10px grid
      const rawX = this.dragStartCompPos.x + dx;
      const rawY = this.dragStartCompPos.y + dy;
      let snappedX = Math.round(rawX / 10) * 10;
      let snappedY = Math.round(rawY / 10) * 10;

      // Constrain within bounds
      snappedX = Math.max(-140, Math.min(140, snappedX));
      snappedY = Math.max(-140, Math.min(140, snappedY));

      this.robotService.updateComponentPosition(this.draggedComponent.id, snappedX, snappedY);
    } else if (this.isPanning) {
      const dx = e.clientX - this.panStartMouse.x;
      const dy = e.clientY - this.panStartMouse.y;
      this.pan.set({
        x: this.panStartOffset.x + dx,
        y: this.panStartOffset.y + dy
      });
    }
  }

  onCanvasMouseUp() {
    this.isDraggingComponent = false;
    this.draggedComponent = null;
    this.isPanning = false;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      this.deleteSelected();
    }
  }
}
