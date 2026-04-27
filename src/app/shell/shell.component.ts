import { Component } from '@angular/core';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { StatusBarComponent } from './components/status-bar/status-bar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [TopBarComponent, StatusBarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {}
