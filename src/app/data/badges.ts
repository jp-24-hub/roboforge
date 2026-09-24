import { Badge } from '../models/challenge.model';

export const BADGES: Badge[] = [
  {
    id: 'badge-first-build',
    title: 'FIRST BUILD',
    description: 'Constructed your very first robot with core mechanical and electronic components.',
    icon: 'build',
    category: 'build'
  },
  {
    id: 'badge-first-program',
    title: 'FIRST PROGRAM',
    description: 'Composed and validated autonomous behavioral instructions in Code Lab.',
    icon: 'code',
    category: 'code'
  },
  {
    id: 'badge-first-sim',
    title: 'FIRST SIMULATION',
    description: 'Launched your creation into the physics simulation environment and gathered live telemetry.',
    icon: 'play_arrow',
    category: 'sim'
  },
  {
    id: 'badge-avoidance',
    title: 'AVOIDANCE PROTOCOL',
    description: 'Successfully detected and averted obstacles using real-time ultrasonic sonar feedback.',
    icon: 'radar',
    category: 'sim'
  },
  {
    id: 'badge-maze-master',
    title: 'MAZE MASTER',
    description: 'Conquered the labyrinth corridors and navigated safely to the extraction gateway.',
    icon: 'explore',
    category: 'mastery'
  },
  {
    id: 'badge-rescue-hero',
    title: 'RESCUE SPECIALIST',
    description: 'Located and reached the emergency transponder through active disaster hazard zones.',
    icon: 'health_and_safety',
    category: 'mastery'
  },
  {
    id: 'badge-efficient-engineer',
    title: 'EFFICIENT ENGINEER',
    description: 'Completed an operational mission with greater than 85% energy efficiency remaining.',
    icon: 'bolt',
    category: 'mastery'
  },
  {
    id: 'badge-autonomous-specialist',
    title: 'AUTONOMOUS SPECIALIST',
    description: 'Achieved flawless facility navigation with zero manual override interventions.',
    icon: 'psychology',
    category: 'mastery'
  }
];
