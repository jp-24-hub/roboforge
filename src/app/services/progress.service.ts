import { Injectable, signal, computed, inject } from '@angular/core';
import { BADGES } from '../data/badges';
import { Badge, UserProgress } from '../models/challenge.model';
import { ToastService } from './toast.service';
import { AudioSynth } from './audio-synth';

const PROGRESS_STORAGE_KEY = 'roboforge_user_progress';

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextXp: number;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'APPRENTICE', minXp: 0, nextXp: 250 },
  { level: 2, title: 'BUILDER', minXp: 250, nextXp: 600 },
  { level: 3, title: 'PROGRAMMER', minXp: 600, nextXp: 1200 },
  { level: 4, title: 'ENGINEER', minXp: 1200, nextXp: 2200 },
  { level: 5, title: 'ROBOTICS ENGINEER', minXp: 2200, nextXp: 3600 },
  { level: 6, title: 'AUTONOMOUS SYSTEMS ENGINEER', minXp: 3600, nextXp: 5500 }
];

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private toast = inject(ToastService);
  private audio = inject(AudioSynth);

  private initialProgress: UserProgress = {
    xp: 350,
    level: 2,
    levelTitle: 'BUILDER',
    completedChallenges: {
      'ch-01': { score: 96, timeSec: 8.4, date: new Date().toISOString() }
    },
    unlockedBadges: ['badge-first-build'],
    totalSimulations: 3,
    totalRobotsBuilt: 1,
    totalDistanceM: 42.6,
    skillLevels: {
      mechanical: 65,
      programming: 45,
      simulation: 70,
      autonomy: 40,
      efficiency: 80
    }
  };

  readonly progress = signal<UserProgress>(this.loadProgress());

  readonly currentLevelInfo = computed(() => {
    const xp = this.progress().xp;
    let curr = LEVELS[0];
    for (const lvl of LEVELS) {
      if (xp >= lvl.minXp) {
        curr = lvl;
      }
    }
    return curr;
  });

  readonly nextLevelXp = computed(() => {
    return this.currentLevelInfo().nextXp;
  });

  readonly xpProgressPercent = computed(() => {
    const curr = this.currentLevelInfo();
    const xp = this.progress().xp;
    const range = curr.nextXp - curr.minXp;
    const progressIntoLevel = xp - curr.minXp;
    return Math.min(100, Math.max(0, Math.round((progressIntoLevel / range) * 100)));
  });

  readonly allBadges = signal<Badge[]>(BADGES);

  private loadProgress(): UserProgress {
    if (typeof window === 'undefined') return this.initialProgress;
    try {
      const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...this.initialProgress,
          ...parsed,
          skillLevels: { ...this.initialProgress.skillLevels, ...(parsed.skillLevels || {}) }
        };
      }
    } catch (e) {
      console.error('Failed to load progress from localStorage', e);
    }
    return this.initialProgress;
  }

  private saveProgress() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(this.progress()));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }

  addXp(amount: number, reason?: string): boolean {
    const prevLvl = this.currentLevelInfo().level;
    this.progress.update((curr) => {
      const newXp = curr.xp + amount;
      let newLevel = 1;
      let newTitle = LEVELS[0].title;
      for (const lvl of LEVELS) {
        if (newXp >= lvl.minXp) {
          newLevel = lvl.level;
          newTitle = lvl.title;
        }
      }
      return {
        ...curr,
        xp: newXp,
        level: newLevel,
        levelTitle: newTitle
      };
    });

    this.saveProgress();

    if (reason) {
      this.toast.show(`+${amount} XP EARNED`, reason, 'success');
    }

    const currentLvl = this.currentLevelInfo().level;
    if (currentLvl > prevLvl) {
      this.audio.playSuccess();
      this.toast.show('LEVEL UP!', `Promoted to ${this.currentLevelInfo().title}`, 'success');
      return true;
    }
    return false;
  }

  recordMissionCompleted(challengeId: string, score: number, timeSec: number, xpReward: number, badgeId?: string) {
    const alreadyCompleted = !!this.progress().completedChallenges[challengeId];

    this.progress.update((curr) => {
      const updated = { ...curr.completedChallenges };
      updated[challengeId] = {
        score: Math.max(score, updated[challengeId]?.score || 0),
        timeSec: updated[challengeId] ? Math.min(timeSec, updated[challengeId].timeSec) : timeSec,
        date: new Date().toISOString()
      };

      const skills = { ...curr.skillLevels };
      skills.simulation = Math.min(100, skills.simulation + 6);
      skills.programming = Math.min(100, skills.programming + 5);
      skills.autonomy = Math.min(100, skills.autonomy + 7);

      return {
        ...curr,
        completedChallenges: updated,
        skillLevels: skills
      };
    });

    if (!alreadyCompleted) {
      this.addXp(xpReward, 'Mission completed reward');
    } else {
      this.addXp(Math.round(xpReward * 0.25), 'Mission refined performance');
    }

    if (badgeId) {
      this.unlockBadge(badgeId);
    }

    this.saveProgress();
  }

  unlockBadge(badgeId: string) {
    if (this.progress().unlockedBadges.includes(badgeId)) return;

    this.progress.update((curr) => ({
      ...curr,
      unlockedBadges: [...curr.unlockedBadges, badgeId]
    }));

    const badge = BADGES.find((b) => b.id === badgeId);
    if (badge) {
      this.toast.show('BADGE UNLOCKED!', badge.title, 'success');
      this.audio.playSuccess();
    }
    this.saveProgress();
  }

  recordSimulationRun(distanceM = 0) {
    this.progress.update((curr) => ({
      ...curr,
      totalSimulations: curr.totalSimulations + 1,
      totalDistanceM: +(curr.totalDistanceM + distanceM).toFixed(1)
    }));
    this.saveProgress();
  }

  recordRobotBuilt() {
    this.progress.update((curr) => ({
      ...curr,
      totalRobotsBuilt: curr.totalRobotsBuilt + 1
    }));
    this.unlockBadge('badge-first-build');
    this.saveProgress();
  }

  resetAllData() {
    this.progress.set({ ...this.initialProgress, xp: 0, level: 1, levelTitle: 'APPRENTICE', completedChallenges: {}, unlockedBadges: [] });
    this.saveProgress();
    this.toast.show('PROGRESS RESET', 'All user data cleared', 'info');
  }
}
