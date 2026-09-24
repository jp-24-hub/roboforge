import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing').then((m) => m.Landing),
    title: 'RoboForge — Virtual Robotics Laboratory'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard — RoboForge'
  },
  {
    path: 'forge',
    loadComponent: () => import('./pages/forge').then((m) => m.Forge),
    title: 'Robot Forge — RoboForge'
  },
  {
    path: 'code',
    loadComponent: () => import('./pages/code-lab').then((m) => m.CodeLab),
    title: 'Code Lab — RoboForge'
  },
  {
    path: 'simulation',
    loadComponent: () => import('./pages/simulation').then((m) => m.Simulation),
    title: 'Simulation Lab — RoboForge'
  },
  {
    path: 'challenges',
    loadComponent: () => import('./pages/challenges').then((m) => m.Challenges),
    title: 'Challenges & Missions — RoboForge'
  },
  {
    path: 'library',
    loadComponent: () => import('./pages/robot-library').then((m) => m.RobotLibrary),
    title: 'Robot Library — RoboForge'
  },
  {
    path: 'progress',
    loadComponent: () => import('./pages/progress').then((m) => m.Progress),
    title: 'Progression & Badges — RoboForge'
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings').then((m) => m.Settings),
    title: 'Settings — RoboForge'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
