import { Challenge } from '../models/challenge.model';

export const CHALLENGES: Challenge[] = [
  {
    id: 'ch-01',
    level: 1,
    title: 'LEVEL 01 — FIRST MOTION',
    subtitle: 'Propulsion Calibration & Kinematic Verification',
    description: 'Assemble a functional robot with chassis, motors, wheels, controller, and battery. Write a program to propel your machine forward continuously for 5 seconds without colliding.',
    objective: 'Sustain forward motion for at least 5.0 seconds on the test track with zero boundary collisions.',
    environmentId: 'env-test-track',
    difficulty: 'easy',
    xpReward: 100,
    badgeRewardId: 'badge-first-sim',
    timeLimitSec: 25,
    targetCollisionsMax: 0,
    requiredComponents: ['chassis', 'movement', 'power', 'control']
  },
  {
    id: 'ch-02',
    level: 2,
    title: 'LEVEL 02 — AVOIDANCE PROTOCOL',
    subtitle: 'Ultrasonic Sonar & Reactive Steering',
    description: 'Equip an Ultrasonic Range Sensor to your machine. Program collision-avoidance logic: when an obstacle is detected closer than 25cm, stop and turn right before continuing forward.',
    objective: 'Successfully detect and navigate around at least 3 obstacles without exceeding 1 minor bumper touch.',
    environmentId: 'env-obstacle-course',
    difficulty: 'medium',
    xpReward: 200,
    badgeRewardId: 'badge-avoidance',
    timeLimitSec: 45,
    targetCollisionsMax: 1,
    requiredComponents: ['sensor']
  },
  {
    id: 'ch-03',
    level: 3,
    title: 'LEVEL 03 — MAZE RUNNER',
    subtitle: 'Labyrinth Traversal & Dead-End Recovery',
    description: 'Navigate the complex corridors of the Labyrinth Maze. Use your sensor suite to detect walls, navigate narrow junctions, and guide your autonomous unit to the target exit gateway.',
    objective: 'Reach the EXIT GATE extraction radius safely before battery depletion or timer expiration.',
    environmentId: 'env-maze',
    difficulty: 'medium',
    xpReward: 350,
    badgeRewardId: 'badge-maze-master',
    timeLimitSec: 60,
    targetCollisionsMax: 3,
    requiredComponents: ['sensor']
  },
  {
    id: 'ch-04',
    level: 4,
    title: 'LEVEL 04 — RESCUE BOT',
    subtitle: 'Hazard Mapping & Emergency Transponder Search',
    description: 'A critical emergency beacon is active in the hazard zone. Deploy a reinforced scout bot with high-capacity battery, maneuver through debris fields and extreme thermal zones, and lock onto the beacon.',
    objective: 'Traverse the disaster sector and reach the EMERGENCY BEACON target zone.',
    environmentId: 'env-rescue-mission',
    difficulty: 'hard',
    xpReward: 500,
    badgeRewardId: 'badge-rescue-hero',
    timeLimitSec: 75,
    targetCollisionsMax: 2,
    requiredComponents: ['power', 'sensor']
  },
  {
    id: 'ch-05',
    level: 5,
    title: 'LEVEL 05 — AUTONOMOUS ENGINEER',
    subtitle: 'End-to-End Automated Facility Logistics',
    description: 'Demonstrate master-level autonomous engineering. Navigate through warehouse aisle corridors, follow floor markers or avoid industrial storage racks, and dock cleanly into Loading Bay 04 with high battery efficiency.',
    objective: 'Dock safely in BAY 04 with less than 2 collisions and above 70% remaining battery efficiency.',
    environmentId: 'env-warehouse',
    difficulty: 'hard',
    xpReward: 1000,
    badgeRewardId: 'badge-autonomous-specialist',
    timeLimitSec: 90,
    targetCollisionsMax: 2,
    requiredComponents: ['control', 'movement', 'sensor']
  }
];
