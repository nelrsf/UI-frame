# Research: Native Menu Customization

**Phase**: 0 — Pre-design research  
**Date**: 2026-05-11  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

---

## 1. Electron `Menu` and `nativeTheme` API

**Decision**: Use `Menu.buildFromTemplate()` + `Menu.setApplicationMenu()` and rebuild the full menu object whenever the theme preference changes. Use `nativeTheme.themeSource` to apply the OS-level dark/light signal to native UI components, including the menu bar.

**Rationale**: Electron menus are immutable after creation — individual items cannot be updated in-place. A full rebuild from the current configuration is the canonical pattern. `nativeTheme.themeSource` accepts `'dark'`, `'light'`, or `'system'`; setting it to `'dark'` forces dark native chrome (menu bar, title bar, scrollbars) regardless of the OS setting, which is what the shell already configures today via `darkTheme: true` in `BrowserWindow`.

**Alternatives considered**:
- Mutating individual `MenuItem` objects after creation — rejected because Electron does not reflect post-creation mutations in the rendered menu on all platforms.
- Using CSS injection for menu colors — rejected because native menus do not accept CSS; `nativeTheme` is the only cross-platform mechanism.

**Key API surface**:
```ts
import { Menu, nativeTheme } from 'electron';

nativeTheme.themeSource = 'dark'; // | 'light' | 'system'
Menu.setApplicationMenu(Menu.buildFromTemplate(template));
```

---

## 2. Main-to-Renderer IPC for Panel Toggles

**Decision**: Use `mainWindow.webContents.send(channel, payload)` from the main process to notify the renderer of panel toggle requests originating from menu clicks. The preload exposes typed listener functions via `contextBridge`.

**Rationale**: Panel visibility is managed by NgRx actions in the renderer. The menu runs in the main process and cannot dispatch NgRx actions directly. The `webContents.send` + `ipcRenderer.on` pattern is the canonical Electron approach for main→renderer notifications and is already used by the `isMaximized` flow. Keeping the direction explicit (main sends an event; renderer handles it) avoids coupling the menu builder to Angular internals.

**Alternatives considered**:
- Renderer polling a shared flag — rejected as it adds unnecessary complexity and latency.
- IPC invoke (renderer-side handler) — rejected because menu clicks are fire-and-forget; `send` is sufficient and does not block the main process waiting for a reply.

**Channels to add to `channels.ts`**:
```ts
MENU: {
  TOGGLE_BOTTOM_PANEL: 'menu:toggleBottomPanel',
  TOGGLE_SECONDARY_PANEL: 'menu:toggleSecondaryPanel',
  THEME_CHANGED: 'menu:themeChanged',
  SET_THEME: 'menu:setTheme',   // renderer → main (future use; menus handle theme directly today)
}
```

**Preload additions**:
```ts
menu: {
  onToggleBottomPanel(callback: () => void): void;
  onToggleSecondaryPanel(callback: () => void): void;
  onThemeChanged(callback: (theme: 'dark' | 'light') => void): void;
}
```

---

## 3. Dev-Mode Detection for DevTools Entry

**Decision**: Reuse the existing `isDev` constant (`process.env['ELECTRON_ENV'] === 'development'`) defined in `main.ts` to conditionally include the DevTools menu entry.

**Rationale**: `isDev` is already the single source of truth for environment-specific behaviour in the main process (it controls DevTools auto-open and the load URL). Adding a conditional entry to the menu template behind the same flag is consistent and requires no new mechanism.

**Alternatives considered**:
- A separate `DEBUG_MENU` environment variable — rejected as unnecessary duplication.
- Disabling the item but keeping it visible in production — rejected per spec clarification (option A: show only in dev).

---

## 4. Theme Persistence at Main-Process Startup

**Decision**: Read the theme preference directly from `preferences.json` on disk at `createWindow()` time using the same `readEnvelope` logic already inside `preferences.handlers.ts`, before constructing the menu and window. This allows `nativeTheme.themeSource` to be set before the window renders.

**Rationale**: The NgRx preferences slice lives in the renderer and is not yet initialized when `createWindow()` runs in the main process. To restore the correct theme before the first frame, the main process must read the preference file directly. The key `'shell.theme'` will be used consistently by both main and renderer.

**Key reading pattern (main process)**:
```ts
// At startup, before Menu.setApplicationMenu():
const storedTheme = await readThemeFromPrefs(); // reads prefs.json, defaults to 'dark'
nativeTheme.themeSource = storedTheme;
```

**Preference key**: `shell.theme` — stored as `'dark' | 'light'`, default `'dark'`.

**Alternatives considered**:
- Waiting for renderer to send the theme via IPC — rejected because the window would flash with the wrong theme on first load.
- Storing theme in a separate file — rejected as it duplicates the existing preferences infrastructure.

---

## 5. Disabled Menu Items for Unimplemented Options

**Decision**: Set `enabled: false` on the "Claro" (light theme) menu item. The item remains visible and readable but is not interactive, satisfying the spec clarification (option A).

**Rationale**: Electron `MenuItem.enabled = false` greys out the item on all platforms without hiding it. This makes the roadmap visible to end users while preventing premature activation.

**Implementation**:
```ts
{ label: 'Claro', enabled: false, type: 'radio', checked: false }
```

---

## 6. MenuBuilder — Customization Architecture

**Decision**: Implement a `MenuBuilder` class that accepts an optional `Partial<MenuConfig>` to override labels, visibility, and click handlers for each named slot. The class exposes a single `build(): Menu` method and is the only entry point for menu construction.

**Rationale**: A builder with a config override layer lets integrators change any aspect of the menu without subclassing or monkey-patching. Named slots (e.g., `'archivo.salir'`) allow surgical replacement of individual entries. The class itself remains stable; only the config changes per integration.

**Alternatives considered**:
- A factory function (no class) — viable but a class is easier to extend via inheritance if integrators need that in the future.
- Merging menu templates as plain arrays — rejected because ordering and slot identity are harder to reason about than a keyed config map.

---

## 7. Resolved NEEDS CLARIFICATION Summary

| Item | Resolution |
|------|-----------|
| Light theme option visibility | Visible but disabled (`enabled: false`) until future spec |
| Customization timing | Developer-defined at app build/startup time |
| Theme persistence mechanism | NgRx `preferences` slice + existing `preferences.json` IPC; key `shell.theme` |
| DevTools menu visibility | Only in development mode (`isDev === true`) |
