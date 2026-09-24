import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CHALLENGES } from '../data/challenges';
import { Challenge } from '../models/challenge.model';
import { ChallengeCard } from '../components/challenges/challenge-card';
import { ProgressService } from '../services/progress.service';
import { SimulationEngineService } from '../services/simulation-engine.service';
import { AudioSynth } from '../services/audio-synth';

@Component({
  selector: 'app-challenges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconModule, ChallengeCard],
  template: `
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      <!-- Section Header -->
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <mat-icon class="text-sm">flag</mat-icon>
          <span>ROBOTICS MISSIONS DIRECTORY</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black text-white font-display">
          Engineering Challenges
        </h1>
        <p class="text-sm text-slate-400 max-w-2xl leading-relaxed">
          "Prove what your machine can do." Deploy your robot into progressively demanding physical scenarios to test obstacle avoidance, pathfinding, and thermal resilience.
        </p>
      </div>

      <!-- Missions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (ch of challenges; track ch.id) {
          <app-challenge-card 
            [challenge]="ch" 
            [isCompleted]="isCompleted(ch.id)"
            (startMission)="startMission($event)"
          ></app-challenge-card>
        }
      </div>
    </div>
  `
})
export class Challenges {
  readonly challenges = CHALLENGES;
  readonly progressService = inject(ProgressService);
  private simEngine = inject(SimulationEngineService);
  private router = inject(Router);
  private audio = inject(AudioSynth);

  isCompleted(challengeId: string): boolean {
    return !!this.progressService.progress().completedChallenges[challengeId];
  }

  startMission(challenge: Challenge) {
    this.audio.playConnect();
    this.simEngine.setChallenge(challenge);
    this.router.navigate(['/simulation']);
  }
}
