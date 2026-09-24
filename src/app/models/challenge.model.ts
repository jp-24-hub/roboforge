export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export interface Challenge {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  description: string;
  objective: string;
  environmentId: string;
  difficulty: ChallengeDifficulty;
  xpReward: number;
  badgeRewardId?: string;
  timeLimitSec: number;
  targetCollisionsMax: number;
  requiredComponents?: string[];
  isCompleted?: boolean;
  bestScore?: number;
  bestTime?: number;
}

export interface MissionResult {
  challengeId: string;
  completed: boolean;
  timeTakenSec: number;
  collisions: number;
  distanceTraveledM: number;
  batteryRemainingPercent: number;
  efficiencyScore: number;
  xpEarned: number;
  unlockedBadgeId?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'build' | 'code' | 'sim' | 'mastery';
  unlockedAt?: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  levelTitle: string;
  completedChallenges: Record<string, { score: number; timeSec: number; date: string }>;
  unlockedBadges: string[];
  totalSimulations: number;
  totalRobotsBuilt: number;
  totalDistanceM: number;
  skillLevels: {
    mechanical: number;
    programming: number;
    simulation: number;
    autonomy: number;
    efficiency: number;
  };
}
