import { Robot } from '../models/robot.model';

export const DEFAULT_DSL_PROGRAM = `// TITAN-X AUTONOMOUS SCAN & CRUISE
START
SET_SPEED 65
MOVE_FORWARD

IF_DISTANCE_LESS_THAN 28
  STOP
  WAIT 200
  TURN_RIGHT 75
  MOVE_FORWARD
END_IF
`;

export const DEFAULT_JS_PROGRAM = `// TITAN-X JAVASCRIPT AUTONOMOUS LOOP
// Available: distance, lineDetected, temperature, battery
// Functions: moveForward(), moveBackward(), turnLeft(deg), turnRight(deg), stop(), setSpeed(val), log(msg)

if (distance < 28) {
  log("OBSTACLE DETECTED: " + distance + "cm");
  stop();
  turnRight(75);
  setSpeed(60);
  moveForward();
} else {
  setSpeed(70);
  moveForward();
}
`;

export const TITAN_X_DEFAULT: Robot = {
  id: 'robot-titan-x',
  name: 'TITAN-X',
  type: 'rover',
  description: 'Flagship dual-motor autonomous rover equipped with high-frequency ultrasonic sonar avoidance routines and robust Li-Ion cell bank.',
  chassisId: 'chassis-basic',
  components: [
    {
      id: 'comp-chassis-1',
      catalogId: 'chassis-basic',
      name: 'Basic Chassis',
      category: 'chassis',
      x: 0,
      y: 0,
      rotation: 0,
      properties: { weight: 0.8, power: 2, color: '#1e293b' }
    },
    {
      id: 'comp-motor-left',
      catalogId: 'motor-dc',
      name: 'Left DC Motor',
      category: 'movement',
      x: -60,
      y: -20,
      rotation: 0,
      properties: { speed: 120, torque: 0.8, power: 20, weight: 0.22, enabled: true, direction: 'forward' }
    },
    {
      id: 'comp-motor-right',
      catalogId: 'motor-dc',
      name: 'Right DC Motor',
      category: 'movement',
      x: 60,
      y: -20,
      rotation: 0,
      properties: { speed: 120, torque: 0.8, power: 20, weight: 0.22, enabled: true, direction: 'forward' }
    },
    {
      id: 'comp-wheel-left',
      catalogId: 'wheel-rubber',
      name: 'Left Traction Wheel',
      category: 'movement',
      x: -75,
      y: 20,
      rotation: 0,
      properties: { weight: 0.12, diameterMm: 65, traction: 0.95 }
    },
    {
      id: 'comp-wheel-right',
      catalogId: 'wheel-rubber',
      name: 'Right Traction Wheel',
      category: 'movement',
      x: 75,
      y: 20,
      rotation: 0,
      properties: { weight: 0.12, diameterMm: 65, traction: 0.95 }
    },
    {
      id: 'comp-mcu',
      catalogId: 'controller-micro',
      name: 'Microcontroller',
      category: 'control',
      x: 0,
      y: -10,
      rotation: 0,
      properties: { clockMhz: 16, power: 1.2, weight: 0.05, label: 'MCU-16' }
    },
    {
      id: 'comp-battery',
      catalogId: 'power-standard-battery',
      name: 'Standard Battery',
      category: 'power',
      x: 0,
      y: 25,
      rotation: 0,
      properties: { capacity: 5000, voltage: 11.1, weight: 0.38, power: 0 }
    },
    {
      id: 'comp-sonar',
      catalogId: 'sensor-ultrasonic',
      name: 'Ultrasonic Sensor',
      category: 'sensor',
      x: 0,
      y: -75,
      rotation: 0,
      properties: { range: 200, accuracy: 2, beamAngle: 35, power: 1.5, weight: 0.04, enabled: true }
    },
    {
      id: 'comp-led',
      catalogId: 'output-led',
      name: 'RGB LED Beacon',
      category: 'output',
      x: -25,
      y: 60,
      rotation: 0,
      properties: { power: 0.4, weight: 0.01, color: '#06b6d4', enabled: true }
    }
  ],
  programCode: DEFAULT_DSL_PROGRAM,
  programMode: 'dsl',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastSimulation: {
    environment: 'Test Track',
    date: 'Ready for simulation',
    score: 94,
    completed: true
  }
};

export const SPECTRE_SCOUT_DEFAULT: Robot = {
  id: 'robot-spectre-01',
  name: 'SPECTRE-01',
  type: 'scout',
  description: 'Agile lightweight reconnaissance bot designed for swift maze navigation and rapid proximity surveillance.',
  chassisId: 'chassis-compact',
  components: [
    {
      id: 'comp-scout-chassis',
      catalogId: 'chassis-compact',
      name: 'Compact Chassis',
      category: 'chassis',
      x: 0,
      y: 0,
      rotation: 0,
      properties: { weight: 0.45, power: 1.5, color: '#0f172a' }
    },
    {
      id: 'comp-scout-mcu',
      catalogId: 'controller-advanced',
      name: 'Advanced Controller',
      category: 'control',
      x: 0,
      y: -10,
      rotation: 0,
      properties: { clockMhz: 120, power: 3.5, weight: 0.09, label: 'CORTEX-32' }
    },
    {
      id: 'comp-scout-bat',
      catalogId: 'power-small-battery',
      name: 'Small Battery',
      category: 'power',
      x: 0,
      y: 20,
      rotation: 0,
      properties: { capacity: 2200, voltage: 7.4, weight: 0.16, power: 0 }
    },
    {
      id: 'comp-scout-m1',
      catalogId: 'motor-dc',
      name: 'Left Motor',
      category: 'movement',
      x: -55,
      y: 0,
      rotation: 0,
      properties: { speed: 140, torque: 0.7, power: 18, weight: 0.2, enabled: true, direction: 'forward' }
    },
    {
      id: 'comp-scout-m2',
      catalogId: 'motor-dc',
      name: 'Right Motor',
      category: 'movement',
      x: 55,
      y: 0,
      rotation: 0,
      properties: { speed: 140, torque: 0.7, power: 18, weight: 0.2, enabled: true, direction: 'forward' }
    },
    {
      id: 'comp-scout-w1',
      catalogId: 'wheel-rubber',
      name: 'Left Wheel',
      category: 'movement',
      x: -65,
      y: 25,
      rotation: 0,
      properties: { weight: 0.1, diameterMm: 60, traction: 0.9 }
    },
    {
      id: 'comp-scout-w2',
      catalogId: 'wheel-rubber',
      name: 'Right Wheel',
      category: 'movement',
      x: 65,
      y: 25,
      rotation: 0,
      properties: { weight: 0.1, diameterMm: 60, traction: 0.9 }
    },
    {
      id: 'comp-scout-sonar',
      catalogId: 'sensor-ultrasonic',
      name: 'Ultrasonic Sonar',
      category: 'sensor',
      x: 0,
      y: -65,
      rotation: 0,
      properties: { range: 180, accuracy: 2, beamAngle: 30, power: 1.5, weight: 0.04, enabled: true }
    },
    {
      id: 'comp-scout-ir',
      catalogId: 'sensor-infrared',
      name: 'IR Line Sensor',
      category: 'sensor',
      x: -20,
      y: -60,
      rotation: 0,
      properties: { range: 35, accuracy: 1, beamAngle: 15, power: 0.8, weight: 0.02, enabled: true }
    }
  ],
  programCode: `START
SET_SPEED 80
MOVE_FORWARD

IF_DISTANCE_LESS_THAN 22
  STOP
  TURN_LEFT 90
  MOVE_FORWARD
END_IF
`,
  programMode: 'dsl',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
