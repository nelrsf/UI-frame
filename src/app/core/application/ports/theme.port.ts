/**
 * Theme adapter port for future renderer-side theme engine.
 *
 * This interface enables the renderer to coordinate theme changes
 * with a dedicated theme service (styling library, CSS variables, etc.).
 * Currently unused; reserved for future "light theme" feature development.
 */

import { AppTheme } from '../models/theme.model';

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
