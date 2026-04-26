import { Component } from '@angular/core';

@Component({
  selector: 'app-shell',
  standalone: true,
  template: `<div class="shell-root" data-testid="shell-root"></div>`,
  styleUrl: './shell.component.css'
})
export class ShellComponent {}
