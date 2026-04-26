import { Component } from '@angular/core';
import { ShellComponent } from './shell/shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShellComponent],
  template: '<app-shell></app-shell>',
  styleUrl: './app.component.css'
})
export class AppComponent {}
