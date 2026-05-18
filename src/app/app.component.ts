import { Component, OnInit, inject } from '@angular/core';
import { ShellComponent } from './shell/shell.component';
import { ThemeService } from './core/application/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShellComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.initialize();
  }
}