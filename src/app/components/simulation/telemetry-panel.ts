import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SimulationEngineService } from '../../services/simulation-engine.service';
import { RobotService } from '../../services/robot.service';

@Component({
  selector: 'app-telemetry-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="h-full flex flex-col bg-[#0b101d] border-l border-slate-800/80 select-none overflow-y-auto font-mono">
      <!-- Telemetry Header -->
      <div class="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
          <mat-icon class="text-cyan-400 text-base">monitor_heart</mat-icon>
          <span>Live Telemetry Deck</span>
        </div>
        <div class="flex items-center gap-1.5 text-[10px] text-emerald-400">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>ONLINE</span>
        </div>
      </div>

      <!-- Telemetry Data Stream Grid -->
      <div class="p-3.5 space-y-4 flex-1">
        @let tele = simEngine.telemetry();
        @let stats = robotService.activeRobotStats();

        <!-- Primary Gauge Cluster: Speed & Battery -->
        <div class="grid grid-cols-2 gap-2">
          <!-- Velocity -->
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div class="text-[10px] text-slate-400 uppercase tracking-wider">PROPULSION</div>
            <div class="my-1">
              <span class="text-2xl font-bold text-cyan-400 tabular-nums">{{ tele.speed }}</span>
              <span class="text-xs text-slate-400 ml-1">m/s</span>
            </div>
            <div class="text-[10px] text-slate-500">MAX: {{ stats.topSpeedMs }} m/s</div>
          </div>

          <!-- Battery Life & Voltage -->
          <div 
            class="p-3 rounded-xl border flex flex-col justify-between"
            [class.bg-slate-900]="tele.batteryPercent > 20"
            [class.border-slate-800]="tele.batteryPercent > 20"
            [class.bg-amber-950/40]="tele.batteryPercent <= 20 && tele.batteryPercent > 0"
            [class.border-amber-500/60]="tele.batteryPercent <= 20 && tele.batteryPercent > 0"
            [class.bg-rose-950/40]="tele.batteryPercent <= 0"
            [class.border-rose-500/60]="tele.batteryPercent <= 0"
          >
            <div class="flex items-center justify-between text-[10px] uppercase tracking-wider">
              <span class="text-slate-400">BATTERY</span>
              <span class="text-slate-400">{{ tele.batteryVoltage }}V</span>
            </div>
            <div class="my-1 flex items-baseline gap-1">
              <span 
                class="text-2xl font-bold tabular-nums"
                [class.text-emerald-400]="tele.batteryPercent > 50"
                [class.text-amber-400]="tele.batteryPercent <= 50 && tele.batteryPercent > 20"
                [class.text-rose-400]="tele.batteryPercent <= 20"
              >
                {{ tele.batteryPercent }}%
              </span>
            </div>
            <!-- Battery bar -->
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                class="h-full transition-all duration-300"
                [class.bg-emerald-400]="tele.batteryPercent > 50"
                [class.bg-amber-400]="tele.batteryPercent <= 50 && tele.batteryPercent > 20"
                [class.bg-rose-500]="tele.batteryPercent <= 20"
                [style.width.%]="tele.batteryPercent"
              ></div>
            </div>
          </div>
        </div>

        <!-- Metric Cards: Distance & Collision & Compass -->
        <div class="grid grid-cols-3 gap-2">
          <!-- Distance -->
          <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div class="text-[9px] text-slate-400 uppercase">DISTANCE</div>
            <div class="text-sm font-bold text-white mt-0.5 tabular-nums">
              {{ tele.distance }} <span class="text-[10px] text-slate-500 font-normal">m</span>
            </div>
          </div>

          <!-- Collisions -->
          <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div class="text-[9px] text-slate-400 uppercase">IMPACTS</div>
            <div 
              class="text-sm font-bold mt-0.5 tabular-nums"
              [class.text-emerald-400]="tele.collisionCount === 0"
              [class.text-rose-400]="tele.collisionCount > 0"
            >
              0{{ tele.collisionCount }}
            </div>
          </div>

          <!-- Heading Compass -->
          <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div class="text-[9px] text-slate-400 uppercase">HEADING</div>
            <div class="text-sm font-bold text-cyan-300 mt-0.5 tabular-nums">
              {{ tele.headingDeg }}°
            </div>
          </div>
        </div>

        <!-- Sensor Array Readouts -->
        <div class="space-y-2">
          <div class="text-[10px] uppercase text-slate-400 tracking-wider font-semibold">
            Sensor Telemetry Feeds
          </div>

          <!-- Ultrasonic Distance -->
          <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <mat-icon class="text-sm text-emerald-400">wifi_tethering</mat-icon>
              <span class="text-xs text-slate-300">Ultrasonic Sonar</span>
            </div>
            <div class="text-xs font-bold font-mono">
              @if (tele.sensorReadings.ultrasonic?.distanceCm; as d) {
                <span [class.text-rose-400]="d < 30" [class.text-emerald-400]="d >= 30">
                  {{ d }} cm
                </span>
              } @else {
                <span class="text-slate-500">INACTIVE</span>
              }
            </div>
          </div>

          <!-- Infrared Line Sensor -->
          <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <mat-icon class="text-sm text-cyan-400">sensors</mat-icon>
              <span class="text-xs text-slate-300">IR Floor Track</span>
            </div>
            <span 
              class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
              [class.bg-cyan-950]="tele.sensorReadings.infrared?.lineDetected"
              [class.text-cyan-400]="tele.sensorReadings.infrared?.lineDetected"
              [class.bg-slate-800]="!tele.sensorReadings.infrared?.lineDetected"
              [class.text-slate-400]="!tele.sensorReadings.infrared?.lineDetected"
            >
              {{ tele.sensorReadings.infrared?.lineDetected ? 'LOCKED' : 'CLEAR' }}
            </span>
          </div>

          <!-- Environmental Thermistor -->
          <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <mat-icon class="text-sm text-rose-400">device_thermostat</mat-icon>
              <span class="text-xs text-slate-300">Thermal Probe</span>
            </div>
            <span class="text-xs font-bold text-rose-300 tabular-nums">
              {{ tele.sensorReadings.temperature?.currentC || 22 }}°C
            </span>
          </div>
        </div>

        <!-- Real-Time Speed Sparkline Graph -->
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between text-[10px] uppercase text-slate-400">
            <span>Velocity Graph (m/s)</span>
            <span class="text-cyan-400 tabular-nums">{{ tele.simTime }}s elapsed</span>
          </div>

          <!-- Mini Sparkline SVG -->
          <div class="h-16 w-full bg-slate-950/70 rounded border border-slate-800/80 p-1 flex items-end">
            <svg class="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
              <!-- Grid line -->
              <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255, 255, 255, 0.08)" stroke-dasharray="2 2" />
              @if (sparklinePoints(); as pts) {
                <polyline 
                  [attr.points]="pts" 
                  fill="none" 
                  stroke="#38bdf8" 
                  stroke-width="2" 
                />
              }
            </svg>
          </div>
        </div>

        <!-- System Alerts Banner -->
        @if (tele.powerDepleted) {
          <div class="p-3 rounded-lg bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs">
            <div class="font-bold flex items-center gap-1.5">
              <mat-icon class="text-base">error</mat-icon>
              <span>POWER DEPLETED</span>
            </div>
            <p class="text-[11px] text-rose-300/80 mt-1">Reset simulation to replenish power cells.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class TelemetryPanel {
  readonly simEngine = inject(SimulationEngineService);
  readonly robotService = inject(RobotService);

  sparklinePoints(): string {
    const history = this.simEngine.telemetryHistory();
    if (history.length < 2) return '0,45 100,45';

    const maxSpeed = Math.max(1, this.robotService.activeRobotStats().topSpeedMs);
    const stepX = 100 / (history.length - 1);

    return history
      .map((pt, idx) => {
        const x = idx * stepX;
        const normalized = Math.min(1, Math.max(0, pt.speed / maxSpeed));
        const y = 48 - normalized * 44;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }
}
