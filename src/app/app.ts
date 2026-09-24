import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AtmosphericBackground } from './components/atmospheric-background';
import { Sidebar } from './components/sidebar';
import { TopBar } from './components/topbar';
import { ToastContainer } from './components/toast-container';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    RouterOutlet,
    AtmosphericBackground,
    Sidebar,
    TopBar,
    ToastContainer
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
