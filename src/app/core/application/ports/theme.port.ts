/**
 * Theme adapter port for renderer-side theme engine.
 *
 * This interface enables the renderer to coordinate theme changes
 * with a dedicated theme service.
 */

import { AppTheme } from '../../models/theme.model';

/** Interface for renderer-side theme adaptation. */
export interface IThemeAdapter {
  /** Get the currently active theme. */
  getCurrentTheme(): AppTheme;

  /** Update the active theme and apply visual changes. */
  setTheme(theme: AppTheme): void;

  /** Get the native system theme preference (light/dark from OS settings). */
  getSystemTheme(): AppTheme;

  /** Listen for theme changes (e.g., OS-level dark mode toggle). */
  onThemeChange(callback: (theme: AppTheme) => void): void;
}

/** Default implementation using body data-theme attribute and NgRx. */
export class ThemeAdapter implements IThemeAdapter {
  private currentTheme: AppTheme = 'dark';
  private callbacks: Array<(theme: AppTheme) => void> = [];

  constructor() {
    this.initializeFromDOM();
  }

  private initializeFromDOM(): void {
    const stored = document.body.getAttribute('data-theme');
    if (stored === 'light' || stored === 'dark') {
      this.currentTheme = stored;
    }
  }

  getCurrentTheme(): AppTheme {
    return this.currentTheme;
  }

  setTheme(theme: AppTheme): void {
    if (theme !== this.currentTheme) {
      this.currentTheme = theme;
      document.body.setAttribute('data-theme', theme);
      this.callbacks.forEach(cb => cb(theme));
    }
  }

  getSystemTheme(): AppTheme {
    return 'dark';
  }

  onThemeChange(callback: (theme: AppTheme) => void): void {
    this.callbacks.push(callback);
  }
}