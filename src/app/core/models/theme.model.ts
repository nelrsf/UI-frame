/**
 * Application theme model and constants.
 *
 * Represents the active visual theme for the application.
 * Synchronized between NgRx preferences state and Electron nativeTheme API.
 */

/** The active visual theme for the application. */
export type AppTheme = 'dark' | 'light';

/** Default theme on first launch. */
export const DEFAULT_THEME: AppTheme = 'dark';

/** NgRx preferences key for theme storage. */
export const THEME_PREFERENCE_KEY = 'shell.theme';
