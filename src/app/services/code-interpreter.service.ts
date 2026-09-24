import { Injectable } from '@angular/core';

export interface CodeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  lineIssues: { line: number; message: string; severity: 'error' | 'warn' }[];
}

export interface RobotControlOutput {
  action: 'forward' | 'backward' | 'turn_left' | 'turn_right' | 'stop';
  speedPercent: number;
  turnDegrees?: number;
  waitMs?: number;
  logMessages: string[];
}

export interface SensorContext {
  distance: number; // Ultrasonic cm
  lineDetected: boolean;
  temperature: number; // Celsius
  batteryPercent: number;
  headingDeg: number;
  speedMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class CodeInterpreterService {
  validateCode(code: string, mode: 'dsl' | 'js'): CodeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const lineIssues: { line: number; message: string; severity: 'error' | 'warn' }[] = [];

    const trimmed = code.trim();
    if (!trimmed) {
      errors.push('Empty program: The robot has no programmed behavior.');
      return { isValid: false, errors, warnings, lineIssues };
    }

    const lines = code.split('\n');

    if (mode === 'dsl') {
      let hasStart = false;
      let hasMovement = false;
      let hasObstacleCheck = false;
      let inIfBlock = false;

      lines.forEach((rawLine, index) => {
        const lineNum = index + 1;
        const line = rawLine.trim().toUpperCase();

        if (!line || line.startsWith('//') || line.startsWith('#')) return;

        const tokens = line.split(/\s+/);
        const command = tokens[0];

        if (command === 'START') {
          hasStart = true;
        } else if (
          command === 'MOVE_FORWARD' ||
          command === 'MOVE_BACKWARD' ||
          command === 'TURN_LEFT' ||
          command === 'TURN_RIGHT' ||
          command === 'FORWARD' ||
          command === 'BACKWARD'
        ) {
          hasMovement = true;
        } else if (
          command === 'IF_DISTANCE_LESS_THAN' ||
          line.startsWith('IF DISTANCE <') ||
          line.startsWith('IF_DISTANCE <') ||
          command === 'IF_LINE_DETECTED' ||
          line.startsWith('IF LINE')
        ) {
          hasObstacleCheck = true;
          inIfBlock = true;
        } else if (command === 'END_IF' || command === 'ENDIF') {
          inIfBlock = false;
        } else if (command === 'STOP' || command === 'WAIT' || command === 'SET_SPEED' || command === 'ELSE') {
          // Valid secondary commands
        } else if (line.startsWith('SET SPEED')) {
          // Valid multi-word
        } else {
          errors.push(`Line ${lineNum}: Unrecognized command "${rawLine.trim()}".`);
          lineIssues.push({ line: lineNum, message: `Unknown command "${command}"`, severity: 'error' });
        }
      });

      if (!hasStart) {
        warnings.push('No "START" directive detected. Good practice is to begin with START.');
        lineIssues.push({ line: 1, message: 'Missing START directive', severity: 'warn' });
      }

      if (!hasMovement) {
        errors.push('Your robot has no movement instructions (e.g. MOVE_FORWARD). It will remain stationary.');
      }

      if (!hasObstacleCheck) {
        warnings.push('Robot has no obstacle detection condition. It may crash into barriers without reactive steering.');
      }

      if (inIfBlock) {
        warnings.push('Unclosed conditional block detected. Remember to add END_IF.');
      }
    } else {
      try {
        new Function('distance', 'lineDetected', 'temperature', 'battery', 'moveForward', 'turnRight', 'turnLeft', 'stop', 'setSpeed', 'log', code);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Syntax Error: ${msg}`);
        lineIssues.push({ line: 1, message: msg, severity: 'error' });
      }

      if (!code.includes('moveForward') && !code.includes('turnRight') && !code.includes('turnLeft') && !code.includes('moveBackward')) {
        warnings.push('Your JavaScript code does not invoke any locomotion methods (e.g., moveForward()).');
      }

      if (!code.includes('distance')) {
        warnings.push('No obstacle check against `distance` detected. The robot may collide into barriers.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      lineIssues
    };
  }

  executeStep(code: string, mode: 'dsl' | 'js', sensors: SensorContext): RobotControlOutput {
    if (mode === 'dsl') {
      return this.executeDslStep(code, sensors);
    } else {
      return this.executeJsStep(code, sensors);
    }
  }

  private executeDslStep(code: string, sensors: SensorContext): RobotControlOutput {
    let speedPercent = 70;
    let action: RobotControlOutput['action'] = 'forward';
    let turnDegrees: number | undefined = undefined;
    let waitMs: number | undefined = undefined;
    const logMessages: string[] = [];

    const lines = code.split('\n');
    let conditionActive = true;

    for (const rawLine of lines) {
      const line = rawLine.trim().toUpperCase();
      if (!line || line.startsWith('//') || line.startsWith('#')) continue;

      if (line.startsWith('IF_DISTANCE_LESS_THAN') || line.startsWith('IF DISTANCE <') || line.startsWith('IF_DISTANCE <')) {
        const parts = line.replace(/<|<=/g, ' ').split(/\s+/);
        const threshold = parseFloat(parts[parts.length - 1]) || 25;
        conditionActive = sensors.distance < threshold;
        if (conditionActive) {
          logMessages.push(`SONAR TRIGGER: obstacle at ${Math.round(sensors.distance)}cm < ${threshold}cm`);
        }
        continue;
      }

      if (line.startsWith('IF_LINE_DETECTED') || line.startsWith('IF LINE')) {
        conditionActive = sensors.lineDetected;
        continue;
      }

      if (line === 'ELSE') {
        conditionActive = !conditionActive;
        continue;
      }

      if (line === 'END_IF' || line === 'ENDIF') {
        conditionActive = true;
        continue;
      }

      if (conditionActive) {
        if (line.startsWith('SET_SPEED') || line.startsWith('SET SPEED')) {
          const parts = line.split(/\s+/);
          const val = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(val)) speedPercent = Math.max(10, Math.min(100, val));
        } else if (line === 'MOVE_FORWARD' || line === 'FORWARD') {
          action = 'forward';
        } else if (line === 'MOVE_BACKWARD' || line === 'BACKWARD') {
          action = 'backward';
        } else if (line.startsWith('TURN_LEFT') || line.startsWith('TURN LEFT')) {
          action = 'turn_left';
          const parts = line.split(/\s+/);
          const deg = parseInt(parts[parts.length - 1], 10);
          turnDegrees = !isNaN(deg) ? deg : 60;
        } else if (line.startsWith('TURN_RIGHT') || line.startsWith('TURN RIGHT')) {
          action = 'turn_right';
          const parts = line.split(/\s+/);
          const deg = parseInt(parts[parts.length - 1], 10);
          turnDegrees = !isNaN(deg) ? deg : 60;
        } else if (line === 'STOP') {
          action = 'stop';
        } else if (line.startsWith('WAIT')) {
          const parts = line.split(/\s+/);
          const ms = parseInt(parts[parts.length - 1], 10);
          waitMs = !isNaN(ms) ? ms : 200;
        }
      }
    }

    return { action, speedPercent, turnDegrees, waitMs, logMessages };
  }

  private executeJsStep(code: string, sensors: SensorContext): RobotControlOutput {
    let speedPercent = 70;
    let action: RobotControlOutput['action'] = 'forward';
    let turnDegrees: number | undefined = undefined;
    let waitMs: number | undefined = undefined;
    const logMessages: string[] = [];

    const sandbox = {
      distance: sensors.distance,
      lineDetected: sensors.lineDetected,
      temperature: sensors.temperature,
      battery: sensors.batteryPercent,
      heading: sensors.headingDeg,
      speed: sensors.speedMs,
      moveForward: () => { action = 'forward'; },
      moveBackward: () => { action = 'backward'; },
      turnLeft: (deg?: number) => { action = 'turn_left'; turnDegrees = deg || 60; },
      turnRight: (deg?: number) => { action = 'turn_right'; turnDegrees = deg || 60; },
      stop: () => { action = 'stop'; },
      wait: (ms: number) => { waitMs = ms; },
      setSpeed: (val: number) => { speedPercent = Math.max(10, Math.min(100, val)); },
      log: (msg: unknown) => { logMessages.push(String(msg)); }
    };

    try {
      const runner = new Function(
        'distance',
        'lineDetected',
        'temperature',
        'battery',
        'moveForward',
        'moveBackward',
        'turnLeft',
        'turnRight',
        'stop',
        'wait',
        'setSpeed',
        'log',
        code
      );
      runner(
        sandbox.distance,
        sandbox.lineDetected,
        sandbox.temperature,
        sandbox.battery,
        sandbox.moveForward,
        sandbox.moveBackward,
        sandbox.turnLeft,
        sandbox.turnRight,
        sandbox.stop,
        sandbox.wait,
        sandbox.setSpeed,
        sandbox.log
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      logMessages.push(`RUNTIME ERROR: ${msg}`);
    }

    return { action, speedPercent, turnDegrees, waitMs, logMessages };
  }
}
