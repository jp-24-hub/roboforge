import { Environment } from '../models/simulation.model';

export const ENVIRONMENTS: Environment[] = [
  {
    id: 'env-test-track',
    name: 'Test Track',
    type: 'track',
    description: 'Clean high-traction straightaway and perimeter boundary walls. Ideal for calibration and basic propulsion testing.',
    width: 800,
    height: 600,
    startPos: { x: 120, y: 300, angle: 0 },
    targetZone: { x: 680, y: 300, radius: 45, label: 'FINISH' },
    obstacles: [
      // Boundary walls
      { id: 'wall-top', type: 'box', x: 400, y: 15, width: 780, height: 20, color: '#334155' },
      { id: 'wall-bottom', type: 'box', x: 400, y: 585, width: 780, height: 20, color: '#334155' },
      { id: 'wall-left', type: 'box', x: 15, y: 300, width: 20, height: 560, color: '#334155' },
      { id: 'wall-right', type: 'box', x: 785, y: 300, width: 20, height: 560, color: '#334155' },
      // Inner test lane dividers
      { id: 'lane-1', type: 'box', x: 300, y: 160, width: 140, height: 16, color: '#1e293b' },
      { id: 'lane-2', type: 'box', x: 500, y: 440, width: 140, height: 16, color: '#1e293b' }
    ],
    linePaths: [
      [
        { x: 120, y: 300 },
        { x: 350, y: 300 },
        { x: 450, y: 300 },
        { x: 680, y: 300 }
      ]
    ]
  },
  {
    id: 'env-obstacle-course',
    name: 'Obstacle Course',
    type: 'obstacle',
    description: 'Scattered barriers, pylons, and containment blocks requiring active ultrasonic sonar avoidance routines.',
    width: 800,
    height: 600,
    startPos: { x: 100, y: 300, angle: 0 },
    targetZone: { x: 700, y: 300, radius: 45, label: 'EXTRACTION' },
    obstacles: [
      // Outer boundaries
      { id: 'ob-w-top', type: 'box', x: 400, y: 15, width: 780, height: 20, color: '#334155' },
      { id: 'ob-w-bot', type: 'box', x: 400, y: 585, width: 780, height: 20, color: '#334155' },
      { id: 'ob-w-left', type: 'box', x: 15, y: 300, width: 20, height: 560, color: '#334155' },
      { id: 'ob-w-right', type: 'box', x: 785, y: 300, width: 20, height: 560, color: '#334155' },
      // Course obstacles
      { id: 'pylon-1', type: 'circle', x: 260, y: 300, radius: 36, color: '#f59e0b', label: 'BARRIER 1' },
      { id: 'pylon-2', type: 'box', x: 380, y: 190, width: 50, height: 110, color: '#ef4444', label: 'BARRIER 2' },
      { id: 'pylon-3', type: 'box', x: 420, y: 410, width: 50, height: 120, color: '#ef4444', label: 'BARRIER 3' },
      { id: 'pylon-4', type: 'circle', x: 540, y: 280, radius: 38, color: '#f59e0b', label: 'BARRIER 4' },
      { id: 'pylon-5', type: 'box', x: 560, y: 480, width: 70, height: 50, color: '#64748b' },
      { id: 'pylon-6', type: 'box', x: 220, y: 150, width: 60, height: 60, color: '#64748b' }
    ]
  },
  {
    id: 'env-maze',
    name: 'Labyrinth Maze',
    type: 'maze',
    description: 'Precision navigational corridor puzzle with blind corners, dead ends, and a single secure exit gateway.',
    width: 800,
    height: 600,
    startPos: { x: 70, y: 90, angle: 0 },
    targetZone: { x: 720, y: 510, radius: 45, label: 'EXIT GATE' },
    obstacles: [
      // Outer boundaries
      { id: 'm-top', type: 'box', x: 400, y: 15, width: 780, height: 20, color: '#334155' },
      { id: 'm-bot', type: 'box', x: 400, y: 585, width: 780, height: 20, color: '#334155' },
      { id: 'm-left', type: 'box', x: 15, y: 300, width: 20, height: 560, color: '#334155' },
      { id: 'm-right', type: 'box', x: 785, y: 300, width: 20, height: 560, color: '#334155' },
      // Maze internal corridors
      { id: 'm-w1', type: 'box', x: 160, y: 160, width: 20, height: 260, color: '#475569' },
      { id: 'm-w2', type: 'box', x: 270, y: 300, width: 200, height: 20, color: '#475569' },
      { id: 'm-w3', type: 'box', x: 370, y: 150, width: 20, height: 250, color: '#475569' },
      { id: 'm-w4', type: 'box', x: 260, y: 460, width: 20, height: 230, color: '#475569' },
      { id: 'm-w5', type: 'box', x: 480, y: 430, width: 200, height: 20, color: '#475569' },
      { id: 'm-w6', type: 'box', x: 580, y: 260, width: 20, height: 320, color: '#475569' },
      { id: 'm-w7', type: 'box', x: 680, y: 170, width: 180, height: 20, color: '#475569' }
    ]
  },
  {
    id: 'env-rescue-mission',
    name: 'Rescue Mission',
    type: 'rescue',
    description: 'High-risk disaster response sector featuring thermal hazard zones, debris blocks, and a critical emergency transponder.',
    width: 800,
    height: 600,
    startPos: { x: 90, y: 510, angle: 270 },
    targetZone: { x: 690, y: 110, radius: 50, label: 'BEACON' },
    obstacles: [
      // Outer boundaries
      { id: 'r-top', type: 'box', x: 400, y: 15, width: 780, height: 20, color: '#334155' },
      { id: 'r-bot', type: 'box', x: 400, y: 585, width: 780, height: 20, color: '#334155' },
      { id: 'r-left', type: 'box', x: 15, y: 300, width: 20, height: 560, color: '#334155' },
      { id: 'r-right', type: 'box', x: 785, y: 300, width: 20, height: 560, color: '#334155' },
      // Debris
      { id: 'deb-1', type: 'box', x: 230, y: 420, width: 80, height: 80, color: '#78350f', label: 'DEBRIS' },
      { id: 'deb-2', type: 'circle', x: 450, y: 370, radius: 45, color: '#991b1b', label: 'HOT ZONE' },
      { id: 'deb-3', type: 'box', x: 340, y: 210, width: 140, height: 40, color: '#78350f', label: 'COLLAPSE' },
      { id: 'deb-4', type: 'circle', x: 580, y: 240, radius: 35, color: '#b45309' }
    ],
    heatZones: [
      { id: 'hz-1', x: 450, y: 370, radius: 110, intensity: 95 },
      { id: 'hz-2', x: 300, y: 120, radius: 75, intensity: 65 }
    ]
  },
  {
    id: 'env-warehouse',
    name: 'Autonomous Warehouse',
    type: 'warehouse',
    description: 'Modern logistics facility with storage racks, floor guide lanes, and cargo staging bays.',
    width: 800,
    height: 600,
    startPos: { x: 110, y: 120, angle: 0 },
    targetZone: { x: 690, y: 490, radius: 45, label: 'BAY 04' },
    obstacles: [
      // Outer boundaries
      { id: 'w-top', type: 'box', x: 400, y: 15, width: 780, height: 20, color: '#334155' },
      { id: 'w-bot', type: 'box', x: 400, y: 585, width: 780, height: 20, color: '#334155' },
      { id: 'w-left', type: 'box', x: 15, y: 300, width: 20, height: 560, color: '#334155' },
      { id: 'w-right', type: 'box', x: 785, y: 300, width: 20, height: 560, color: '#334155' },
      // Storage Racks
      { id: 'rack-1', type: 'box', x: 250, y: 140, width: 70, height: 160, color: '#1e3a8a', label: 'RACK A' },
      { id: 'rack-2', type: 'box', x: 450, y: 140, width: 70, height: 160, color: '#1e3a8a', label: 'RACK B' },
      { id: 'rack-3', type: 'box', x: 250, y: 430, width: 70, height: 170, color: '#1e3a8a', label: 'RACK C' },
      { id: 'rack-4', type: 'box', x: 450, y: 430, width: 70, height: 170, color: '#1e3a8a', label: 'RACK D' },
      { id: 'pallet-1', type: 'box', x: 600, y: 280, width: 50, height: 60, color: '#d97706', label: 'CARGO' }
    ],
    linePaths: [
      [
        { x: 110, y: 120 },
        { x: 110, y: 280 },
        { x: 350, y: 280 },
        { x: 350, y: 490 },
        { x: 690, y: 490 }
      ]
    ]
  }
];
