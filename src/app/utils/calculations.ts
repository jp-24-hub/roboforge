import { Robot, RobotCalculatedStats } from '../models/robot.model';

export function calculateRobotStats(robot: Robot): RobotCalculatedStats {
  const components = robot.components || [];

  let totalWeightKg = 0;
  let totalPowerW = 0;
  let totalTorqueNm = 0;
  let maxRpm = 0;
  let wheelDiameterMm = 65; // Default wheel diameter
  let batteryCapacityMah = 0;
  let batteryVoltageV = 11.1; // Default
  let motorCount = 0;
  let sensorCount = 0;
  let hasChassis = false;
  let hasBattery = false;
  let hasController = false;
  let hasWheel = false;

  const warnings: string[] = [];

  for (const comp of components) {
    const p = comp.properties || {};

    // Weight
    if (typeof p['weight'] === 'number') {
      totalWeightKg += p['weight'];
    }

    // Power consumption
    if (typeof p['power'] === 'number' && p['enabled'] !== false) {
      totalPowerW += p['power'];
    }

    // Category tracking
    if (comp.category === 'chassis') {
      hasChassis = true;
    } else if (comp.category === 'power') {
      hasBattery = true;
      if (typeof p['capacity'] === 'number') batteryCapacityMah += p['capacity'];
      if (typeof p['voltage'] === 'number') batteryVoltageV = p['voltage'];
    } else if (comp.category === 'control') {
      hasController = true;
    } else if (comp.category === 'movement') {
      if (comp.catalogId.startsWith('motor') || p['speed'] !== undefined) {
        motorCount++;
        if (typeof p['speed'] === 'number' && p['speed'] > maxRpm) {
          maxRpm = p['speed'];
        }
        if (typeof p['torque'] === 'number') {
          totalTorqueNm += p['torque'];
        }
      }
      if (comp.catalogId.startsWith('wheel') || comp.catalogId.startsWith('movement-track')) {
        hasWheel = true;
        if (typeof p['diameterMm'] === 'number') {
          wheelDiameterMm = p['diameterMm'];
        }
      }
    } else if (comp.category === 'sensor') {
      sensorCount++;
    }
  }

  // Base physics calculation for top speed (m/s)
  // Linear velocity v = (RPM * pi * Diameter) / 60
  // Weight penalty factor: lighter robots reach closer to theoretical max
  const wheelCircumferenceM = (Math.PI * wheelDiameterMm) / 1000;
  const theoreticalSpeedMs = (maxRpm / 60) * wheelCircumferenceM;
  const weightFactor = totalWeightKg > 0 ? Math.min(1.2, Math.max(0.4, 2.0 / totalWeightKg)) : 1.0;
  const topSpeedMs = motorCount > 0 && hasWheel ? +(theoreticalSpeedMs * weightFactor).toFixed(1) : 0;

  // Battery life calculation in minutes
  // Wh = (mAh * V) / 1000
  // Hours = Wh / Power
  let batteryLifeMin = 0;
  if (batteryCapacityMah > 0 && totalPowerW > 0) {
    const wattHours = (batteryCapacityMah * batteryVoltageV) / 1000;
    batteryLifeMin = Math.round((wattHours / totalPowerW) * 60);
  }

  // Warnings check
  if (!hasChassis) warnings.push('Chassis missing. Add a chassis frame.');
  if (!hasBattery) warnings.push('No battery connected. Robot has no power source.');
  if (!hasController) warnings.push('No microcontroller or cortex onboard.');
  if (motorCount === 0) warnings.push('No motors detected. Robot cannot propel itself.');
  if (!hasWheel) warnings.push('No wheels or tracks attached.');

  const isReadyForSimulation = hasChassis && hasBattery && hasController && motorCount > 0 && hasWheel;

  // Complexity score (0-100)
  const complexity = Math.min(100, components.length * 9 + sensorCount * 6 + motorCount * 8);

  return {
    totalPowerW: +totalPowerW.toFixed(1),
    topSpeedMs,
    weightKg: +totalWeightKg.toFixed(2),
    sensorCount,
    motorCount,
    batteryLifeMin,
    batteryCapacityMah,
    complexity,
    torqueNm: +totalTorqueNm.toFixed(1),
    isReadyForSimulation,
    warnings
  };
}
