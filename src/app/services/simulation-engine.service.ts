import { Injectable, signal, computed, inject } from '@angular/core';
import { ENVIRONMENTS } from '../data/environments';
import { Challenge } from '../models/challenge.model';
import { Environment, Obstacle, Point, TelemetryData } from '../models/simulation.model';
import { AudioSynth } from './audio-synth';
import { CodeInterpreterService, SensorContext } from './code-interpreter.service';
import { ProgressService } from './progress.service';
import { RobotService } from './robot.service';
import { ToastService } from './toast.service';

export interface TelemetryHistoryPoint {
  time: number;
  speed: number;
  battery: number;
  distance: number;
}

@Injectable({
  providedIn: 'root'
})
export class SimulationEngineService {
  private robotService = inject(RobotService);
  private interpreter = inject(CodeInterpreterService);
  private progress = inject(ProgressService);
  private toast = inject(ToastService);
  private audio = inject(AudioSynth);

  readonly environments = signal<Environment[]>(ENVIRONMENTS);
  readonly currentEnvironmentId = signal<string>(ENVIRONMENTS[0].id);

  readonly currentEnvironment = computed<Environment>(() => {
    const id = this.currentEnvironmentId();
    return this.environments().find((e) => e.id === id) || this.environments()[0];
  });

  readonly activeChallenge = signal<Challenge | null>(null);
  readonly timeScale = signal<number>(1.0); // 0.5x, 1x, 2x

  readonly telemetry = signal<TelemetryData>({
    speed: 0,
    distance: 0,
    batteryPercent: 100,
    batteryVoltage: 11.1,
    collisionCount: 0,
    simTime: 0,
    headingDeg: 0,
    angularSpeed: 0,
    sensorReadings: {
      ultrasonic: { distanceCm: 250, detected: false },
      infrared: { lineDetected: false, value: 0 },
      temperature: { currentC: 22 },
      proximity: { detected: false, distanceCm: 99 }
    },
    robotX: 120,
    robotY: 300,
    logs: [{ time: '00:00.00', level: 'info', message: 'ROBOFORGE SIMULATION CORE INITIALIZED' }],
    status: 'idle',
    targetReached: false,
    powerDepleted: false
  });

  readonly telemetryHistory = signal<TelemetryHistoryPoint[]>([]);

  // Simulation physics state
  private animFrameId: number | null = null;
  private lastTimestamp = 0;
  private robotX = 120;
  private robotY = 300;
  private robotAngleDeg = 0; // 0 = pointing right (positive X)
  private currentLinearSpeed = 0;
  private targetLinearSpeed = 0;
  private currentTurnRateDegSec = 0;
  private turnDegreesRemaining = 0;
  private waitTimerMs = 0;
  private lowPowerWarned = false;
  private lastObstaclePingTime = 0;

  constructor() {
    this.resetSimulation();
  }

  setEnvironment(envId: string) {
    this.currentEnvironmentId.set(envId);
    this.resetSimulation();
  }

  setChallenge(challenge: Challenge | null) {
    this.activeChallenge.set(challenge);
    if (challenge) {
      this.currentEnvironmentId.set(challenge.environmentId);
      this.resetSimulation();
      this.addLog('info', `MISSION ASSIGNED: ${challenge.title}`);
    }
  }

  setTimeScale(scale: number) {
    this.timeScale.set(scale);
    this.audio.playClick();
  }

  startSimulation() {
    const stats = this.robotService.activeRobotStats();
    if (!stats.isReadyForSimulation) {
      this.toast.show(
        'CANNOT START SIMULATION',
        stats.warnings[0] || 'Robot is missing essential components',
        'error'
      );
      this.audio.playAlert();
      return;
    }

    const state = this.telemetry();
    if (state.status === 'running') return;

    if (state.powerDepleted) {
      this.toast.show('BATTERY DEPLETED', 'Please reset the simulation to recharge battery', 'warn');
      return;
    }

    this.telemetry.update((t) => ({ ...t, status: 'running' }));
    this.addLog('info', `PROPULSION ENGAGED: Target speed ${stats.topSpeedMs} m/s`);
    this.toast.show('SIMULATION STARTED', 'Sensors and motors active', 'info');
    this.audio.playConnect();

    this.lastTimestamp = performance.now();
    this.loop(performance.now());
  }

  pauseSimulation() {
    if (this.telemetry().status !== 'running') return;
    this.telemetry.update((t) => ({ ...t, status: 'paused' }));
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.addLog('info', 'SIMULATION PAUSED');
    this.audio.playClick();
  }

  stepSimulation() {
    this.pauseSimulation();
    this.updatePhysics(0.1);
    this.audio.playClick();
  }

  resetSimulation() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const env = this.currentEnvironment();
    this.robotX = env.startPos.x;
    this.robotY = env.startPos.y;
    this.robotAngleDeg = env.startPos.angle;
    this.currentLinearSpeed = 0;
    this.targetLinearSpeed = 0;
    this.currentTurnRateDegSec = 0;
    this.turnDegreesRemaining = 0;
    this.waitTimerMs = 0;
    this.lowPowerWarned = false;

    this.telemetry.set({
      speed: 0,
      distance: 0,
      batteryPercent: 100,
      batteryVoltage: 11.1,
      collisionCount: 0,
      simTime: 0,
      headingDeg: Math.round(env.startPos.angle),
      angularSpeed: 0,
      sensorReadings: {
        ultrasonic: { distanceCm: 250, detected: false },
        infrared: { lineDetected: false, value: 0 },
        temperature: { currentC: 22 },
        proximity: { detected: false, distanceCm: 99 }
      },
      robotX: this.robotX,
      robotY: this.robotY,
      logs: [{ time: '00:00.00', level: 'info', message: 'SIMULATION RESET: Robot in starting coordinates' }],
      status: 'idle',
      targetReached: false,
      powerDepleted: false
    });

    this.telemetryHistory.set([]);
  }

  private loop = (timestamp: number) => {
    if (this.telemetry().status !== 'running') return;

    const deltaMs = Math.min(64, timestamp - this.lastTimestamp);
    this.lastTimestamp = timestamp;

    const dt = (deltaMs / 1000) * this.timeScale();
    this.updatePhysics(dt);

    if (this.telemetry().status === 'running') {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  };

  private updatePhysics(dt: number) {
    if (dt <= 0) return;

    const env = this.currentEnvironment();
    const robot = this.robotService.activeRobot();
    const stats = this.robotService.activeRobotStats();

    const state = this.telemetry();

    // 1. Gather Sensor Data at current position
    const sensors = this.sampleSensors(env, this.robotX, this.robotY, this.robotAngleDeg);

    // Audio cue when sonar finds close obstacle
    if (sensors.distance < 30 && performance.now() - this.lastObstaclePingTime > 900) {
      this.audio.playSensorPing();
      this.lastObstaclePingTime = performance.now();
    }

    // 2. Execute Code Step via Interpreter
    if (this.waitTimerMs > 0) {
      this.waitTimerMs -= dt * 1000;
      this.targetLinearSpeed = 0;
      this.currentTurnRateDegSec = 0;
    } else if (this.turnDegreesRemaining > 0) {
      const turnStep = 180 * dt;
      const actualTurn = Math.min(turnStep, this.turnDegreesRemaining);
      this.robotAngleDeg = (this.robotAngleDeg + actualTurn * Math.sign(this.currentTurnRateDegSec) + 360) % 360;
      this.turnDegreesRemaining -= actualTurn;
      this.targetLinearSpeed = 0;
      if (this.turnDegreesRemaining <= 0) {
        this.currentTurnRateDegSec = 0;
      }
    } else {
      const sensorContext: SensorContext = {
        distance: sensors.distance,
        lineDetected: sensors.lineDetected,
        temperature: sensors.temperature,
        batteryPercent: state.batteryPercent,
        headingDeg: this.robotAngleDeg,
        speedMs: this.currentLinearSpeed
      };

      const control = this.interpreter.executeStep(robot.programCode, robot.programMode, sensorContext);

      for (const msg of control.logMessages) {
        this.addLog('info', msg);
      }

      const maxTopSpeed = Math.max(0.5, stats.topSpeedMs);
      const commandedSpeed = (control.speedPercent / 100) * maxTopSpeed;

      if (control.action === 'forward') {
        this.targetLinearSpeed = commandedSpeed;
        this.currentTurnRateDegSec = 0;
      } else if (control.action === 'backward') {
        this.targetLinearSpeed = -commandedSpeed * 0.6;
        this.currentTurnRateDegSec = 0;
      } else if (control.action === 'turn_left') {
        this.targetLinearSpeed = 0;
        this.currentTurnRateDegSec = -1;
        this.turnDegreesRemaining = control.turnDegrees || 60;
      } else if (control.action === 'turn_right') {
        this.targetLinearSpeed = 0;
        this.currentTurnRateDegSec = 1;
        this.turnDegreesRemaining = control.turnDegrees || 60;
      } else if (control.action === 'stop') {
        this.targetLinearSpeed = 0;
        this.currentTurnRateDegSec = 0;
      }

      if (control.waitMs) {
        this.waitTimerMs = control.waitMs;
      }
    }

    // 3. Smooth acceleration
    const accel = 3.5;
    if (this.currentLinearSpeed < this.targetLinearSpeed) {
      this.currentLinearSpeed = Math.min(this.targetLinearSpeed, this.currentLinearSpeed + accel * dt);
    } else if (this.currentLinearSpeed > this.targetLinearSpeed) {
      this.currentLinearSpeed = Math.max(this.targetLinearSpeed, this.currentLinearSpeed - accel * 2 * dt);
    }

    // 4. Kinematic displacement
    const pixelsPerMeter = 50;
    const rad = (this.robotAngleDeg * Math.PI) / 180;
    const dx = Math.cos(rad) * this.currentLinearSpeed * pixelsPerMeter * dt;
    const dy = Math.sin(rad) * this.currentLinearSpeed * pixelsPerMeter * dt;

    const nextX = this.robotX + dx;
    const nextY = this.robotY + dy;

    // 5. Collision Detection
    const robotRadius = 24;
    let collisionOccurred = false;

    for (const ob of env.obstacles) {
      if (this.checkCollision(nextX, nextY, robotRadius, ob)) {
        collisionOccurred = true;
        break;
      }
    }

    if (nextX - robotRadius <= 25 || nextX + robotRadius >= env.width - 25 ||
        nextY - robotRadius <= 25 || nextY + robotRadius >= env.height - 25) {
      collisionOccurred = true;
    }

    let updatedCollisions = state.collisionCount;

    if (collisionOccurred) {
      this.currentLinearSpeed = -0.3;
      updatedCollisions++;
      this.audio.playCrash();
      this.addLog('warn', `BUMPER IMPACT DETECTED! Obstacle contact at (${Math.round(nextX)}, ${Math.round(nextY)})`);
    } else {
      this.robotX = nextX;
      this.robotY = nextY;
    }

    // 6. Distance traveled & Time
    const distanceInc = Math.abs(this.currentLinearSpeed) * dt;
    const newDistance = +(state.distance + distanceInc).toFixed(2);
    const newSimTime = +(state.simTime + dt).toFixed(2);

    // 7. Battery Drain
    const motorLoadFactor = Math.abs(this.currentLinearSpeed) / (stats.topSpeedMs || 1);
    const activeWatts = (stats.totalPowerW * 0.3) + (stats.totalPowerW * 0.7 * motorLoadFactor);
    const wattHours = Math.max(15, (stats.batteryCapacityMah * 11.1) / 1000);
    const drainPercent = (activeWatts / wattHours / 3600) * 100 * dt * 4.5;
    const newBattery = Math.max(0, +(state.batteryPercent - drainPercent).toFixed(2));

    let powerDepleted = false;
    if (newBattery <= 20 && !this.lowPowerWarned && newBattery > 0) {
      this.lowPowerWarned = true;
      this.audio.playAlert();
      this.toast.show('LOW POWER ALERT', 'Battery reserve below 20%', 'warn');
      this.addLog('warn', 'LOW VOLTAGE: Battery power at critical threshold (19%)');
    }

    if (newBattery <= 0) {
      powerDepleted = true;
      this.currentLinearSpeed = 0;
      this.addLog('error', 'POWER DEPLETED: Simulation stopped due to complete cell exhaustion');
      this.audio.playAlert();
      this.toast.show('POWER DEPLETED', 'Machine halted', 'error');
    }

    // 8. Target Zone Reached Check
    let targetReached = state.targetReached;
    if (env.targetZone && !targetReached) {
      const distToTarget = Math.hypot(this.robotX - env.targetZone.x, this.robotY - env.targetZone.y);
      if (distToTarget <= env.targetZone.radius + robotRadius * 0.6) {
        targetReached = true;
        this.audio.playSuccess();
        this.addLog('success', `TARGET REACHED: Entered ${env.targetZone.label} zone safely!`);
        this.toast.show('OBJECTIVE ACCOMPLISHED', `Arrived at ${env.targetZone.label}`, 'success');
      }
    }

    // 9. Challenge Evaluation Check
    const challenge = this.activeChallenge();
    let simStatus: TelemetryData['status'] = powerDepleted ? 'failed' : (targetReached ? 'completed' : 'running');

    if (challenge && simStatus === 'running') {
      if (challenge.id === 'ch-01' && newSimTime >= 5.0 && updatedCollisions === 0) {
        simStatus = 'completed';
        targetReached = true;
      } else if (newSimTime > challenge.timeLimitSec) {
        simStatus = 'failed';
        this.addLog('error', 'MISSION FAILED: Time limit exceeded');
        this.toast.show('MISSION FAILED', 'Operational time limit exceeded', 'error');
      }
    }

    this.telemetry.set({
      speed: +this.currentLinearSpeed.toFixed(2),
      distance: newDistance,
      batteryPercent: newBattery,
      batteryVoltage: +(9.0 + (newBattery / 100) * 3.6).toFixed(1),
      collisionCount: updatedCollisions,
      simTime: newSimTime,
      headingDeg: Math.round(this.robotAngleDeg),
      angularSpeed: Math.round(this.currentTurnRateDegSec * 60),
      sensorReadings: {
        ultrasonic: {
          distanceCm: Math.round(sensors.distance),
          detected: sensors.distance < 200
        },
        infrared: {
          lineDetected: sensors.lineDetected,
          value: sensors.lineDetected ? 98 : 12
        },
        temperature: {
          currentC: Math.round(sensors.temperature)
        },
        proximity: {
          detected: sensors.distance < 30,
          distanceCm: Math.round(sensors.distance)
        }
      },
      robotX: Math.round(this.robotX),
      robotY: Math.round(this.robotY),
      logs: this.telemetry().logs,
      status: simStatus,
      targetReached,
      powerDepleted
    });

    if (Math.round(newSimTime * 10) % 5 === 0) {
      this.telemetryHistory.update((hist) => [
        ...hist.slice(-25),
        { time: newSimTime, speed: +this.currentLinearSpeed.toFixed(1), battery: Math.round(newBattery), distance: newDistance }
      ]);
    }

    if (simStatus === 'completed' && !state.targetReached) {
      const efficiency = Math.max(40, Math.round(newBattery * 0.7 + Math.max(0, 30 - updatedCollisions * 10)));
      this.progress.recordSimulationRun(newDistance);
      if (challenge) {
        this.progress.recordMissionCompleted(challenge.id, efficiency, newSimTime, challenge.xpReward, challenge.badgeRewardId);
      } else {
        this.progress.addXp(40, 'Simulation run completed');
        this.progress.unlockBadge('badge-first-sim');
      }
      this.robotService.recordSimulationResult(efficiency, env.name, true);
    }
  }

  private sampleSensors(env: Environment, rx: number, ry: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    const maxRangePx = 250 * 2.0;
    let minDistancePx = maxRangePx;

    const rayStart = {
      x: rx + Math.cos(rad) * 22,
      y: ry + Math.sin(rad) * 22
    };

    const testAngles = [rad - 0.25, rad, rad + 0.25];

    for (const testRad of testAngles) {
      const rayDir = { x: Math.cos(testRad), y: Math.sin(testRad) };

      for (const ob of env.obstacles) {
        const d = this.rayIntersectObstacle(rayStart, rayDir, ob);
        if (d !== null && d < minDistancePx) {
          minDistancePx = d;
        }
      }

      const dWall = this.rayIntersectBoundaries(rayStart, rayDir, env.width, env.height);
      if (dWall !== null && dWall < minDistancePx) {
        minDistancePx = dWall;
      }
    }

    const distanceCm = Math.min(250, +(minDistancePx / 2.0).toFixed(1));

    let lineDetected = false;
    if (env.linePaths) {
      for (const path of env.linePaths) {
        for (let i = 0; i < path.length - 1; i++) {
          const d = this.distToSegment({ x: rx, y: ry }, path[i], path[i + 1]);
          if (d < 24) {
            lineDetected = true;
            break;
          }
        }
      }
    }

    let temperature = 22;
    if (env.heatZones) {
      for (const hz of env.heatZones) {
        const dist = Math.hypot(rx - hz.x, ry - hz.y);
        if (dist < hz.radius) {
          const factor = (1 - dist / hz.radius);
          temperature += hz.intensity * factor;
        }
      }
    }

    return { distance: distanceCm, lineDetected, temperature };
  }

  private rayIntersectObstacle(start: Point, dir: Point, ob: Obstacle): number | null {
    if (ob.type === 'circle' && ob.radius) {
      const ocX = start.x - ob.x;
      const ocY = start.y - ob.y;
      const a = dir.x * dir.x + dir.y * dir.y;
      const b = 2 * (ocX * dir.x + ocY * dir.y);
      const c = ocX * ocX + ocY * ocY - ob.radius * ob.radius;
      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const t = (-b - Math.sqrt(disc)) / (2 * a);
        if (t > 0) return t;
      }
      return null;
    }

    if (ob.width && ob.height) {
      const left = ob.x - ob.width / 2;
      const right = ob.x + ob.width / 2;
      const top = ob.y - ob.height / 2;
      const bottom = ob.y + ob.height / 2;

      let tMin = 0;
      let tMax = 10000;

      if (Math.abs(dir.x) > 0.0001) {
        let t1 = (left - start.x) / dir.x;
        let t2 = (right - start.x) / dir.x;
        if (t1 > t2) [t1, t2] = [t2, t1];
        tMin = Math.max(tMin, t1);
        tMax = Math.min(tMax, t2);
        if (tMin > tMax) return null;
      } else if (start.x < left || start.x > right) {
        return null;
      }

      if (Math.abs(dir.y) > 0.0001) {
        let t1 = (top - start.y) / dir.y;
        let t2 = (bottom - start.y) / dir.y;
        if (t1 > t2) [t1, t2] = [t2, t1];
        tMin = Math.max(tMin, t1);
        tMax = Math.min(tMax, t2);
        if (tMin > tMax) return null;
      } else if (start.y < top || start.y > bottom) {
        return null;
      }

      return tMin > 0 ? tMin : null;
    }

    return null;
  }

  private rayIntersectBoundaries(start: Point, dir: Point, width: number, height: number): number | null {
    let tMin = 10000;
    if (dir.x < 0) {
      const t = (25 - start.x) / dir.x;
      if (t > 0 && t < tMin) tMin = t;
    } else if (dir.x > 0) {
      const t = (width - 25 - start.x) / dir.x;
      if (t > 0 && t < tMin) tMin = t;
    }
    if (dir.y < 0) {
      const t = (25 - start.y) / dir.y;
      if (t > 0 && t < tMin) tMin = t;
    } else if (dir.y > 0) {
      const t = (height - 25 - start.y) / dir.y;
      if (t > 0 && t < tMin) tMin = t;
    }
    return tMin < 10000 ? tMin : null;
  }

  private checkCollision(rx: number, ry: number, r: number, ob: Obstacle): boolean {
    if (ob.type === 'circle' && ob.radius) {
      return Math.hypot(rx - ob.x, ry - ob.y) < r + ob.radius;
    }
    if (ob.width && ob.height) {
      const closestX = Math.max(ob.x - ob.width / 2, Math.min(rx, ob.x + ob.width / 2));
      const closestY = Math.max(ob.y - ob.height / 2, Math.min(ry, ob.y + ob.height / 2));
      const distX = rx - closestX;
      const distY = ry - closestY;
      return distX * distX + distY * distY < r * r;
    }
    return false;
  }

  private distToSegment(p: Point, v: Point, w: Point): number {
    const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  addLog(level: 'info' | 'warn' | 'error' | 'success', message: string) {
    const totalSec = this.telemetry().simTime;
    const mins = Math.floor(totalSec / 60);
    const secs = (totalSec % 60).toFixed(2);
    const timestamp = `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;

    this.telemetry.update((t) => ({
      ...t,
      logs: [...t.logs.slice(-90), { time: timestamp, level, message }]
    }));
  }

  clearLogs() {
    this.telemetry.update((t) => ({
      ...t,
      logs: [{ time: '00:00.00', level: 'info', message: 'CONSOLE PURGED' }]
    }));
    this.audio.playClick();
  }
}
