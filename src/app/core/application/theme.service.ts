/**
 * Theme service - coordinates theme changes across the application.
 * Uses the ThemeAdapter to apply visual changes to the DOM.
 */

import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, take } from 'rxjs';
import { AppTheme } from '../models/theme.model';
import { selectActiveTheme, selectPreferencesLoaded } from '../state/preferences/preferences.selectors';
import { setPreference } from '../state/preferences/preferences.actions';
import { ThemeAdapter } from '../application/ports/theme.port';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly store = inject(Store);
  private readonly adapter = new ThemeAdapter();

  initialize(): void {
    // Wait for preferences to load before applying the theme
    combineLatest([
      this.store.select(selectPreferencesLoaded),
      this.store.select(selectActiveTheme),
    ]).pipe(
      filter(([loaded]) => loaded),
      take(1)
    ).subscribe(([, theme]) => {
      this.adapter.setTheme(theme);
    });

    // Subscribe to future theme changes
    this.store.select(selectActiveTheme).subscribe((theme) => {
      this.adapter.setTheme(theme);
    });
  }

  getCurrentTheme(): AppTheme {
    return this.adapter.getCurrentTheme();
  }

  setTheme(theme: AppTheme): void {
    this.store.dispatch(setPreference({ key: 'shell.theme', value: theme }));
  }

  onThemeChange(callback: (theme: AppTheme) => void): void {
    this.adapter.onThemeChange(callback);
  }
}
