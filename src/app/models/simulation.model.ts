export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export interface Point {
  x: number;
  y: number;
}

export interface Obstacle {
  id: string;
  type: 'box' | 'circle' | 'polygon';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: Point[];
  label?: string;
  color?: string;
}

export interface HeatZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number; // 0 to 100
}

export interface Environment {
  id: string;
  name: string;
  type: 'track' | 'obstacle' | 'maze' | 'rescue' | 'warehouse';
  description: string;
  width: number;
  height: number;
  startPos: { x: number; y: number; angle: number };
  targetZone?: { x: number; y: number; radius: number; label: string };
  obstacles: Obstacle[];
  linePaths?: Point[][];
  heatZones?: HeatZone[];
  waypoints?: Point[];
}

export interface TelemetryData {
  speed: number; // m/s
  distance: number; // m
  batteryPercent: number; // %
  batteryVoltage: number; // V
  collisionCount: number;
  simTime: number; // seconds
  headingDeg: number; // 0-360
  angularSpeed: number; // deg/s
  sensorReadings: {
    ultrasonic?: { distanceCm: number; detected: boolean };
    infrared?: { lineDetected: boolean; value: number };
    temperature?: { currentC: number };
    proximity?: { detected: boolean; distanceCm: number };
    light?: { lux: number };
  };
  robotX: number;
  robotY: number;
  logs: { time: string; level: 'info' | 'warn' | 'error' | 'success'; message: string }[];
  status: SimulationStatus;
  targetReached: boolean;
  powerDepleted: boolean;
}
