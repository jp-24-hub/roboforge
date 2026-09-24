import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SimulationViewport } from '../components/simulation/simulation-viewport';
import { TelemetryPanel } from '../components/simulation/telemetry-panel';
import { MissionCompleteModal } from '../components/simulation/mission-complete-modal';
import { SimulationEngineService } from '../services/simulation-engine.service';
import { RobotService } from '../services/robot.service';

@Component({
  selector: 'app-simulation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule, SimulationViewport, TelemetryPanel, MissionCompleteModal],
  template: `
    <div class="relative z-10 w-full h-[calc(100vh-4rem)] flex flex-col xl:flex-row overflow-hidden select-none">
      <!-- Large Viewport: Visually dominates the screen (70-75% width on desktop) -->
      <div class="flex-1 h-full min-w-0 relative">
        <app-simulation-viewport class="h-full block"></app-simulation-viewport>
      </div>

      <!-- Right: Live Telemetry Deck (320px) -->
      <div class="w-full xl:w-80 shrink-0 h-72 xl:h-full z-20">
        <app-telemetry-panel class="h-full block"></app-telemetry-panel>
      </div>

      <!-- Mission Complete Modal Overlay -->
      @if (simEngine.telemetry().status === 'completed' && simEngine.telemetry().targetReached) {
        <app-mission-complete-modal (continue)="onMissionContinue()"></app-mission-complete-modal>
      }
    </div>
  `
})
export class Simulation {
  readonly simEngine = inject(SimulationEngineService);
  readonly robotService = inject(RobotService);
  private router = inject(Router);

  onMissionContinue() {
    this.simEngine.resetSimulation();
    this.router.navigate(['/challenges']);
  }
}
