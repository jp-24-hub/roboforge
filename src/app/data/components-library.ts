import { ComponentCategory } from '../models/robot.model';

export interface CatalogComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  defaultX: number;
  defaultY: number;
  defaultProperties: {
    speed?: number; // RPM
    torque?: number; // Nm
    power?: number; // W
    range?: number; // cm
    accuracy?: number; // cm
    capacity?: number; // mAh
    voltage?: number; // V
    weight?: number; // kg
    enabled?: boolean;
    direction?: 'forward' | 'reverse';
    beamAngle?: number; // deg
    sensitivity?: number;
    color?: string;
    label?: string;
    [key: string]: unknown;
  };
  icon: string;
  color: string;
  slotType: 'chassis' | 'wheel' | 'motor' | 'sensor' | 'battery' | 'controller' | 'output';
}

export const COMPONENT_CATALOG: CatalogComponent[] = [
  // --- CHASSIS ---
  {
    id: 'chassis-basic',
    name: 'Basic Chassis',
    category: 'chassis',
    description: 'Versatile lightweight polycarbonate base. Ideal for rovers and general learning projects.',
    defaultX: 0,
    defaultY: 0,
    defaultProperties: {
      weight: 0.8,
      power: 2,
      maxPayloadKg: 4.0,
      color: '#1e293b'
    },
    icon: 'crop_landscape',
    color: '#38bdf8',
    slotType: 'chassis'
  },
  {
    id: 'chassis-compact',
    name: 'Compact Chassis',
    category: 'chassis',
    description: 'High-agility carbon-composite frame designed for rapid steering and confined spaces.',
    defaultX: 0,
    defaultY: 0,
    defaultProperties: {
      weight: 0.45,
      power: 1.5,
      maxPayloadKg: 2.2,
      color: '#0f172a'
    },
    icon: 'aspect_ratio',
    color: '#818cf8',
    slotType: 'chassis'
  },
  {
    id: 'chassis-heavy',
    name: 'Heavy Chassis',
    category: 'chassis',
    description: 'Reinforced extruded aluminum frame with vibration dampening for demanding rescue operations.',
    defaultX: 0,
    defaultY: 0,
    defaultProperties: {
      weight: 1.9,
      power: 4,
      maxPayloadKg: 9.0,
      color: '#18181b'
    },
    icon: 'view_in_ar',
    color: '#fbbf24',
    slotType: 'chassis'
  },

  // --- MOVEMENT ---
  {
    id: 'motor-dc',
    name: 'DC Motor',
    category: 'movement',
    description: 'Standard 12V high-efficiency continuous DC gearmotor. Reliable linear propulsion.',
    defaultX: -55,
    defaultY: -35,
    defaultProperties: {
      speed: 120, // RPM
      torque: 0.8, // Nm
      power: 20, // W
      weight: 0.22,
      enabled: true,
      direction: 'forward'
    },
    icon: 'settings',
    color: '#06b6d4',
    slotType: 'motor'
  },
  {
    id: 'motor-servo',
    name: 'Servo Motor',
    category: 'movement',
    description: 'Precision angular servo with metal gearing for steerable assemblies and sensor turrets.',
    defaultX: 0,
    defaultY: -65,
    defaultProperties: {
      speed: 60, // RPM
      torque: 1.4, // Nm
      power: 12, // W
      weight: 0.14,
      enabled: true,
      direction: 'forward'
    },
    icon: 'sync_alt',
    color: '#22d3ee',
    slotType: 'motor'
  },
  {
    id: 'wheel-rubber',
    name: 'Traction Wheel',
    category: 'movement',
    description: '65mm high-grip vulcanized rubber wheel with deep tread for clean indoor surfaces and courses.',
    defaultX: -70,
    defaultY: 35,
    defaultProperties: {
      weight: 0.12,
      power: 0,
      diameterMm: 65,
      traction: 0.95
    },
    icon: 'album',
    color: '#64748b',
    slotType: 'wheel'
  },
  {
    id: 'movement-track',
    name: 'Track Module',
    category: 'movement',
    description: 'Continuous caterpillar tread mechanism for conquering loose terrain and uneven obstacle courses.',
    defaultX: 70,
    defaultY: 0,
    defaultProperties: {
      speed: 85,
      torque: 2.1,
      power: 32,
      weight: 0.65,
      traction: 0.98
    },
    icon: 'linear_scale',
    color: '#f59e0b',
    slotType: 'wheel'
  },

  // --- SENSORS ---
  {
    id: 'sensor-ultrasonic',
    name: 'Ultrasonic Sensor',
    category: 'sensor',
    description: 'Acoustic pulse sonar emitting high-frequency sound waves to detect distant obstacles.',
    defaultX: 0,
    defaultY: -80,
    defaultProperties: {
      range: 200, // cm
      accuracy: 2, // cm
      beamAngle: 35, // deg
      power: 1.5,
      weight: 0.04,
      enabled: true
    },
    icon: 'wifi_tethering',
    color: '#10b981',
    slotType: 'sensor'
  },
  {
    id: 'sensor-infrared',
    name: 'Infrared Sensor',
    category: 'sensor',
    description: 'Dual IR emitter-receiver pair calibrated to detect floor track contrast and short-range bounds.',
    defaultX: -25,
    defaultY: -75,
    defaultProperties: {
      range: 35, // cm
      accuracy: 1, // cm
      beamAngle: 15,
      power: 0.8,
      weight: 0.02,
      enabled: true
    },
    icon: 'sensors',
    color: '#34d399',
    slotType: 'sensor'
  },
  {
    id: 'sensor-light',
    name: 'Light Sensor',
    category: 'sensor',
    description: 'Cadmium-sulfide photodiode array measuring ambient luminance and emergency beacon flares.',
    defaultX: 25,
    defaultY: -75,
    defaultProperties: {
      range: 120,
      accuracy: 5,
      power: 0.5,
      weight: 0.02,
      enabled: true
    },
    icon: 'wb_incandescent',
    color: '#facc15',
    slotType: 'sensor'
  },
  {
    id: 'sensor-temperature',
    name: 'Temperature Sensor',
    category: 'sensor',
    description: 'Precision digital thermistor with -40°C to +125°C range for hazardous thermal zone mapping.',
    defaultX: 0,
    defaultY: -35,
    defaultProperties: {
      range: 80,
      accuracy: 1,
      power: 0.6,
      weight: 0.03,
      enabled: true
    },
    icon: 'device_thermostat',
    color: '#f87171',
    slotType: 'sensor'
  },
  {
    id: 'sensor-proximity',
    name: 'Proximity Sensor',
    category: 'sensor',
    description: 'Capacitive proximity trigger creating a continuous 360-degree close-proximity safety envelope.',
    defaultX: 0,
    defaultY: 45,
    defaultProperties: {
      range: 25,
      accuracy: 1,
      beamAngle: 360,
      power: 1.2,
      weight: 0.05,
      enabled: true
    },
    icon: 'adjust',
    color: '#a78bfa',
    slotType: 'sensor'
  },

  // --- POWER ---
  {
    id: 'power-small-battery',
    name: 'Small Battery',
    category: 'power',
    description: 'Lightweight 2S Lithium-Polymer battery pack. Great for small scouts where low weight is key.',
    defaultX: 0,
    defaultY: 20,
    defaultProperties: {
      capacity: 2200, // mAh
      voltage: 7.4, // V
      weight: 0.16, // kg
      power: 0
    },
    icon: 'battery_4_bar',
    color: '#38bdf8',
    slotType: 'battery'
  },
  {
    id: 'power-standard-battery',
    name: 'Standard Battery',
    category: 'power',
    description: 'Balanced 3S Li-Ion cell module delivering solid endurance and consistent discharge voltage.',
    defaultX: 0,
    defaultY: 20,
    defaultProperties: {
      capacity: 5000, // mAh
      voltage: 11.1, // V
      weight: 0.38, // kg
      power: 0
    },
    icon: 'battery_6_bar',
    color: '#10b981',
    slotType: 'battery'
  },
  {
    id: 'power-high-capacity-battery',
    name: 'High Capacity Battery',
    category: 'power',
    description: 'Heavy duty 4S industrial cell pack with high continuous discharge for multi-sensor rovers.',
    defaultX: 0,
    defaultY: 20,
    defaultProperties: {
      capacity: 8500, // mAh
      voltage: 14.8, // V
      weight: 0.72, // kg
      power: 0
    },
    icon: 'battery_full',
    color: '#f59e0b',
    slotType: 'battery'
  },

  // --- CONTROL ---
  {
    id: 'controller-micro',
    name: 'Microcontroller',
    category: 'control',
    description: '16MHz 8-bit RISC processor with 12 PWM motor channels and 6 analog sensor interfaces.',
    defaultX: 0,
    defaultY: -10,
    defaultProperties: {
      clockMhz: 16,
      power: 1.2,
      weight: 0.05,
      label: 'MCU-16'
    },
    icon: 'memory',
    color: '#a855f7',
    slotType: 'controller'
  },
  {
    id: 'controller-advanced',
    name: 'Advanced Controller',
    category: 'control',
    description: '32-bit Cortex-M4 @ 120MHz with hardware floating point and dual autonomous coprocessors.',
    defaultX: 0,
    defaultY: -10,
    defaultProperties: {
      clockMhz: 120,
      power: 3.5,
      weight: 0.09,
      label: 'CORTEX-32'
    },
    icon: 'developer_board',
    color: '#c084fc',
    slotType: 'controller'
  },

  // --- OUTPUT ---
  {
    id: 'output-led',
    name: 'RGB LED Beacon',
    category: 'output',
    description: 'Ultra-bright programmable triple-color LED beacon for status, hazard, and telemetry visual feedback.',
    defaultX: -30,
    defaultY: 60,
    defaultProperties: {
      power: 0.4,
      weight: 0.01,
      color: '#06b6d4',
      enabled: true
    },
    icon: 'highlight',
    color: '#06b6d4',
    slotType: 'output'
  },
  {
    id: 'output-buzzer',
    name: 'Piezo Buzzer',
    category: 'output',
    description: 'Acoustic transducer generating clear audible alert tones during obstacle detection or events.',
    defaultX: 30,
    defaultY: 60,
    defaultProperties: {
      power: 0.6,
      weight: 0.02,
      volume: 85, // dB
      enabled: true
    },
    icon: 'volume_up',
    color: '#f43f5e',
    slotType: 'output'
  },
  {
    id: 'output-display',
    name: 'Mini OLED Display',
    category: 'output',
    description: '0.96-inch 128x64 graphic OLED display mounted to chassis top for real-time onboard telemetry.',
    defaultX: 0,
    defaultY: 60,
    defaultProperties: {
      power: 1.1,
      weight: 0.03,
      enabled: true
    },
    icon: 'tv',
    color: '#38bdf8',
    slotType: 'output'
  }
];
