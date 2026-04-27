import { Component } from '@angular/core';
import { StatusBarComponent } from './components/status-bar/status-bar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [StatusBarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {}
