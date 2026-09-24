import { Injectable, signal, computed, inject } from '@angular/core';
import { COMPONENT_CATALOG, CatalogComponent } from '../data/components-library';
import { SPECTRE_SCOUT_DEFAULT, TITAN_X_DEFAULT } from '../data/robot-defaults';
import { Robot, RobotCalculatedStats, RobotComponent, RobotType } from '../models/robot.model';
import { calculateRobotStats } from '../utils/calculations';
import { AudioSynth } from './audio-synth';
import { ProgressService } from './progress.service';
import { ToastService } from './toast.service';

const ROBOTS_STORAGE_KEY = 'roboforge_saved_robots';
const ACTIVE_ROBOT_ID_KEY = 'roboforge_active_robot_id';

@Injectable({
  providedIn: 'root'
})
export class RobotService {
  private toast = inject(ToastService);
  private audio = inject(AudioSynth);
  private progress = inject(ProgressService);

  readonly robots = signal<Robot[]>(this.loadRobots());
  readonly activeRobotId = signal<string>(this.loadActiveRobotId());

  readonly activeRobot = computed<Robot>(() => {
    const list = this.robots();
    const id = this.activeRobotId();
    const found = list.find((r) => r.id === id);
    return found || list[0] || TITAN_X_DEFAULT;
  });

  readonly activeRobotStats = computed<RobotCalculatedStats>(() => {
    return calculateRobotStats(this.activeRobot());
  });

  readonly selectedComponentId = signal<string | null>(null);

  readonly selectedComponent = computed<RobotComponent | null>(() => {
    const id = this.selectedComponentId();
    if (!id) return null;
    const robot = this.activeRobot();
    return robot.components.find((c) => c.id === id) || null;
  });

  private loadRobots(): Robot[] {
    if (typeof window === 'undefined') return [TITAN_X_DEFAULT, SPECTRE_SCOUT_DEFAULT];
    try {
      const data = localStorage.getItem(ROBOTS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load robots from localStorage', e);
    }
    return [TITAN_X_DEFAULT, SPECTRE_SCOUT_DEFAULT];
  }

  private loadActiveRobotId(): string {
    if (typeof window === 'undefined') return TITAN_X_DEFAULT.id;
    try {
      const id = localStorage.getItem(ACTIVE_ROBOT_ID_KEY);
      if (id) return id;
    } catch {
      // Fallback
    }
    return TITAN_X_DEFAULT.id;
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ROBOTS_STORAGE_KEY, JSON.stringify(this.robots()));
      localStorage.setItem(ACTIVE_ROBOT_ID_KEY, this.activeRobotId());
    } catch (e) {
      console.error('Failed to persist robots', e);
    }
  }

  selectRobot(id: string) {
    const exists = this.robots().some((r) => r.id === id);
    if (exists) {
      this.activeRobotId.set(id);
      this.selectedComponentId.set(null);
      this.persist();
      this.audio.playClick();
    }
  }

  createRobot(name: string, type: RobotType, chassisCatalogId = 'chassis-basic'): Robot {
    const chassisCatalog = COMPONENT_CATALOG.find((c) => c.id === chassisCatalogId) || COMPONENT_CATALOG[0];

    const initialChassis: RobotComponent = {
      id: 'comp-' + Math.random().toString(36).substring(2, 9),
      catalogId: chassisCatalog.id,
      name: chassisCatalog.name,
      category: 'chassis',
      x: 0,
      y: 0,
      rotation: 0,
      properties: { ...chassisCatalog.defaultProperties }
    };

    const newRobot: Robot = {
      id: 'robot-' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || 'NEW-BOT',
      type,
      description: `Custom ${type.toUpperCase()} machine forged in the laboratory workbench.`,
      chassisId: chassisCatalog.id,
      components: [initialChassis],
      programCode: `START\nSET_SPEED 60\nMOVE_FORWARD\n`,
      programMode: 'dsl',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.robots.update((list) => [newRobot, ...list]);
    this.activeRobotId.set(newRobot.id);
    this.selectedComponentId.set(initialChassis.id);
    this.persist();

    this.progress.recordRobotBuilt();
    this.audio.playConnect();
    this.toast.show('ROBOT FORGED', `${newRobot.name} created and ready for assembly`, 'success');

    return newRobot;
  }

  duplicateRobot(id: string): Robot | null {
    const orig = this.robots().find((r) => r.id === id);
    if (!orig) return null;

    const copy: Robot = {
      ...orig,
      id: 'robot-' + Math.random().toString(36).substring(2, 9),
      name: `${orig.name} (MK-II)`,
      components: orig.components.map((c) => ({
        ...c,
        id: 'comp-' + Math.random().toString(36).substring(2, 9),
        properties: { ...c.properties }
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.robots.update((list) => [copy, ...list]);
    this.activeRobotId.set(copy.id);
    this.persist();

    this.audio.playConnect();
    this.toast.show('ROBOT DUPLICATED', `${copy.name} cloned to library`, 'info');
    return copy;
  }

  deleteRobot(id: string): boolean {
    const list = this.robots();
    if (list.length <= 1) {
      this.toast.show('CANNOT DELETE', 'At least one robot must remain in the library', 'warn');
      return false;
    }

    const target = list.find((r) => r.id === id);
    const updated = list.filter((r) => r.id !== id);
    this.robots.set(updated);

    if (this.activeRobotId() === id) {
      this.activeRobotId.set(updated[0].id);
      this.selectedComponentId.set(null);
    }

    this.persist();
    this.audio.playCrash();
    this.toast.show('ROBOT DECOMMISSIONED', `${target?.name || 'Robot'} removed from forge`, 'info');
    return true;
  }

  updateRobotMetadata(updates: Partial<Pick<Robot, 'name' | 'description' | 'type'>>) {
    this.robots.update((list) =>
      list.map((r) => {
        if (r.id === this.activeRobotId()) {
          return {
            ...r,
            ...updates,
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      })
    );
    this.persist();
    this.toast.show('ROBOT SAVED', 'Configuration synchronized', 'success');
  }

  addComponent(catalog: CatalogComponent, customX?: number, customY?: number): RobotComponent {
    const active = this.activeRobot();

    let comps = [...active.components];
    if (catalog.category === 'chassis') {
      comps = comps.filter((c) => c.category !== 'chassis');
    }

    const x = customX !== undefined ? customX : catalog.defaultX;
    const y = customY !== undefined ? customY : catalog.defaultY;

    const newComp: RobotComponent = {
      id: 'comp-' + Math.random().toString(36).substring(2, 9),
      catalogId: catalog.id,
      name: catalog.name,
      category: catalog.category,
      x,
      y,
      rotation: 0,
      properties: { ...catalog.defaultProperties }
    };

    comps.push(newComp);

    this.robots.update((list) =>
      list.map((r) => (r.id === active.id ? { ...r, components: comps, updatedAt: new Date().toISOString() } : r))
    );

    this.selectedComponentId.set(newComp.id);
    this.persist();

    this.audio.playConnect();
    this.toast.show(`${catalog.name.toUpperCase()} CONNECTED`, `Mounted to chassis coordinates (${x}, ${y})`, 'success');

    return newComp;
  }

  removeComponent(componentId: string) {
    const active = this.activeRobot();
    const comp = active.components.find((c) => c.id === componentId);
    if (!comp) return;

    if (comp.category === 'chassis' && active.components.filter((c) => c.category === 'chassis').length <= 1) {
      this.toast.show('CANNOT REMOVE CHASSIS', 'A robot requires a chassis frame as a structural base', 'warn');
      return;
    }

    const updated = active.components.filter((c) => c.id !== componentId);

    this.robots.update((list) =>
      list.map((r) => (r.id === active.id ? { ...r, components: updated, updatedAt: new Date().toISOString() } : r))
    );

    if (this.selectedComponentId() === componentId) {
      this.selectedComponentId.set(null);
    }

    this.persist();
    this.audio.playClick();
    this.toast.show('COMPONENT REMOVED', `${comp.name} unmounted`, 'info');
  }

  updateComponentPosition(componentId: string, x: number, y: number) {
    const active = this.activeRobot();
    const updated = active.components.map((c) => (c.id === componentId ? { ...c, x, y } : c));

    this.robots.update((list) =>
      list.map((r) => (r.id === active.id ? { ...r, components: updated, updatedAt: new Date().toISOString() } : r))
    );
    this.persist();
  }

  updateComponentProperties(componentId: string, props: Partial<RobotComponent['properties']>, rotation?: number) {
    const active = this.activeRobot();
    const updated = active.components.map((c) => {
      if (c.id === componentId) {
        return {
          ...c,
          rotation: rotation !== undefined ? rotation : c.rotation,
          properties: { ...c.properties, ...props }
        };
      }
      return c;
    });

    this.robots.update((list) =>
      list.map((r) => (r.id === active.id ? { ...r, components: updated, updatedAt: new Date().toISOString() } : r))
    );
    this.persist();
  }

  updateProgram(code: string, mode?: 'dsl' | 'js') {
    const active = this.activeRobot();
    this.robots.update((list) =>
      list.map((r) => {
        if (r.id === active.id) {
          return {
            ...r,
            programCode: code,
            programMode: mode || r.programMode,
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      })
    );
    this.persist();
  }

  recordSimulationResult(score: number, environmentName: string, completed: boolean) {
    const active = this.activeRobot();
    this.robots.update((list) =>
      list.map((r) => {
        if (r.id === active.id) {
          return {
            ...r,
            lastSimulation: {
              environment: environmentName,
              date: new Date().toLocaleDateString(),
              score,
              completed
            }
          };
        }
        return r;
      })
    );
    this.persist();
  }
}
