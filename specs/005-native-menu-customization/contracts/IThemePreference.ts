/**
 * AppTheme — the two visual themes supported by the application.
 *
 * 'dark'  — fully implemented in spec 005.
 * 'light' — contract only; menu entry is visible but disabled until a future spec
 *           implements full light-theme support across the Angular shell.
 */
export type AppTheme = 'dark' | 'light';

/**
 * Default theme applied when no persisted preference is found.
 */
export const DEFAULT_THEME: AppTheme = 'dark';

/**
 * Preference store key used by BOTH the main process (preferences.json) and
 * the renderer (NgRx preferences slice) to read and write the active theme.
 */
export const THEME_PREFERENCE_KEY = 'shell.theme' as const;

/**
 * Payload carried by the MENU.THEME_CHANGED IPC event from main → renderer.
 */
export interface IThemeChangedPayload {
  readonly theme: AppTheme;
}
