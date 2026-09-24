export type ComponentCategory = 'chassis' | 'movement' | 'sensor' | 'power' | 'control' | 'output';

export interface ComponentProperty {
  key: string;
  label: string;
  value: number | string | boolean;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  type: 'number' | 'string' | 'boolean' | 'select';
  options?: string[];
}

export interface RobotComponent {
  id: string;
  catalogId: string;
  name: string;
  category: ComponentCategory;
  x: number; // Grid coordinate x (-150 to 150)
  y: number; // Grid coordinate y (-150 to 150)
  rotation: number; // 0, 90, 180, 270
  properties: {
    speed?: number; // RPM
    torque?: number; // Nm
    power?: number; // Watts
    range?: number; // cm
    accuracy?: number; // cm
    capacity?: number; // mAh
    voltage?: number; // V
    weight?: number; // kg
    enabled?: boolean;
    direction?: 'forward' | 'reverse';
    color?: string;
    label?: string;
    beamAngle?: number; // deg
    sensitivity?: number; // %
    [key: string]: unknown;
  };
}

export type RobotType = 'rover' | 'scout' | 'racer' | 'rescue' | 'warehouse' | 'custom';

export interface RobotCalculatedStats {
  totalPowerW: number;
  topSpeedMs: number;
  weightKg: number;
  sensorCount: number;
  motorCount: number;
  batteryLifeMin: number;
  batteryCapacityMah: number;
  complexity: number;
  torqueNm: number;
  isReadyForSimulation: boolean;
  warnings: string[];
}

export interface Robot {
  id: string;
  name: string;
  type: RobotType;
  description: string;
  chassisId: string;
  components: RobotComponent[];
  programCode: string;
  programMode: 'dsl' | 'js';
  createdAt: string;
  updatedAt: string;
  lastSimulation?: {
    environment: string;
    date: string;
    score: number;
    completed: boolean;
  };
}
