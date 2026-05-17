"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THEME_PREFERENCE_KEY = exports.DEFAULT_THEME = void 0;
/**
 * Default theme applied when no persisted preference is found.
 */
exports.DEFAULT_THEME = 'dark';
/**
 * Preference store key used by BOTH the main process (preferences.json) and
 * the renderer (NgRx preferences slice) to read and write the active theme.
 */
exports.THEME_PREFERENCE_KEY = 'shell.theme';
//# sourceMappingURL=theme.js.map