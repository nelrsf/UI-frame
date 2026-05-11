"use strict";
/**
 * Public contract surface for the menu and theme modules.
 *
 * Import from this barrel in both main-process and renderer code:
 *   import { IMenuConfig, MenuBuilder, AppTheme } from '../contracts';
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MENU_SLOT_IDS = exports.THEME_PREFERENCE_KEY = exports.DEFAULT_THEME = void 0;
var theme_1 = require("./theme");
Object.defineProperty(exports, "DEFAULT_THEME", { enumerable: true, get: function () { return theme_1.DEFAULT_THEME; } });
Object.defineProperty(exports, "THEME_PREFERENCE_KEY", { enumerable: true, get: function () { return theme_1.THEME_PREFERENCE_KEY; } });
var menu_1 = require("./menu");
Object.defineProperty(exports, "MENU_SLOT_IDS", { enumerable: true, get: function () { return menu_1.MENU_SLOT_IDS; } });
//# sourceMappingURL=index.js.map