# Menu Customization Contract

**Spec**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)
**Date**: 2026-05-11

---

## What this contract covers

This document describes the stable public surface for customizing the native Electron
application menu in UI Frame. It is the authoritative reference for developers and
integrators who want to:

- Change menu labels (e.g., translate to English).
- Add or remove optional menu entries.
- Connect custom callbacks or shell commands to menu items.
- Respond to theme changes from the menu in their own code.

---

## Stable types

| Export | File | Purpose |
|--------|------|---------|
| `IMenuConfig` | `IMenuConfig.ts` | Root customization object passed to `MenuBuilder` |
| `IMenuEntry` | `IMenuEntry.ts` | Shape of a single menu item |
| `IMenuBuildContext` | `IMenuEntry.ts` | Runtime context (theme, isDev, panel states) injected at build time |
| `MENU_SLOT_IDS` | `IMenuEntry.ts` | Enumeration of all built-in slot IDs |
| `AppTheme` | `IThemePreference.ts` | `'dark' \| 'light'` |
| `THEME_PREFERENCE_KEY` | `IThemePreference.ts` | `'shell.theme'` - the NgRx/IPC preference key |
| `IThemeChangedPayload` | `IThemePreference.ts` | IPC payload sent from main to renderer on theme change |

---

## Built-in menu structure

```
Archivo
  `- Salir                   (file.exit)

Vista
  |- Mostrar DevTools        (view.devtools)        - dev mode only
  |- Panel inferior          (view.bottomPanel)      - checkbox
  `- Panel secundario        (view.secondaryPanel)   - checkbox

Temas
  |- Oscuro checked                (themes.dark)           - radio, active
  `- Claro  (disabled)       (themes.light)            - radio, disabled until future spec
```

---

## What you can customize via `IMenuConfig`

### `overrides` - change individual entries

Provide a partial `IMenuEntry` keyed by the slot ID.
Only the fields you specify are changed; everything else keeps its default.

```ts
import { IMenuConfig, MENU_SLOT_IDS } from 'specs/005-native-menu-customization/contracts';

const myConfig: IMenuConfig = {
  overrides: {
    // Translate labels to English
    [MENU_SLOT_IDS.FILE_EXIT]: { label: 'Exit' },
    [MENU_SLOT_IDS.VIEW_BOTTOM_PANEL]: { label: 'Toggle Bottom Panel' },
    [MENU_SLOT_IDS.VIEW_SECONDARY_PANEL]: { label: 'Toggle Secondary Panel' },
    [MENU_SLOT_IDS.THEMES_DARK]: { label: 'Dark' },
    [MENU_SLOT_IDS.THEMES_LIGHT]: { label: 'Light' },
  },
};
```

### `overrides` - attach a custom click handler

```ts
const myConfig: IMenuConfig = {
  overrides: {
    [MENU_SLOT_IDS.FILE_EXIT]: {
      click: () => {
        // do cleanup before quitting
        myService.shutdown().then(() => app.quit());
      },
    },
  },
};
```

### `overrides` - hide an optional entry

```ts
const myConfig: IMenuConfig = {
  overrides: {
    [MENU_SLOT_IDS.VIEW_DEVTOOLS]: { visible: false },
  },
};
```

### `extraEntries` - add a new top-level submenu

```ts
const myConfig: IMenuConfig = {
  extraEntries: [
    {
      id: 'ayuda',
      label: 'Ayuda',
      type: 'submenu',
      submenu: [
        {
          id: 'ayuda.acerca',
          label: 'Acerca de UI Frame...',
          type: 'normal',
          click: () => showAboutDialog(),
        },
      ],
    },
  ],
};
```

---

## What cannot be overridden

- **`file.exit`** - its `visible` field cannot be set to `false`. The exit action is mandatory per spec FR-002. Attempting to set `visible: false` on this slot is silently ignored by `MenuBuilder`.
- **Entry `id` fields** - IDs are immutable slot identifiers; they cannot be changed via `overrides`.
- **`themes.light` enabled state** - this remains `false` until a future spec enables full light-theme support. Setting `enabled: true` in overrides will be honoured only after that spec ships the underlying implementation.

---

## Wiring the config to `MenuBuilder`

```ts
// src/electron/main.ts (or your entry point)
import { MenuBuilder } from './menu';
import { myConfig } from './my-menu.config';

// At app startup, after reading stored theme preference:
const menu = new MenuBuilder(myConfig).build(buildContext);
Menu.setApplicationMenu(menu);
```

---

## Reacting to theme changes in the renderer

The main process emits `MENU.THEME_CHANGED` whenever the user picks a theme.
Wire up a listener in your shell component or app initializer:

```ts
// Angular shell (renderer side)
// window.electronAPI.menu.onThemeChanged is exposed by preload.ts
window.electronAPI.menu.onThemeChanged((theme) => {
  store.dispatch(setPreference({ key: THEME_PREFERENCE_KEY, value: theme }));
  // future: also dispatch a shell theme-apply action here
});
```

---

## Future light theme adoption

When a future spec implements the full light theme:

1. Flip `enabled: true` on the `themes.light` entry (via `overrides` or by default in `MenuBuilder`).
2. Implement `IThemeAdapter` (defined in `src/app/core/application/ports/theme.port.ts`) to apply the theme to the Angular shell.
3. Connect the `selectActiveTheme` NgRx selector to the shell component and forward it to `IThemeAdapter`.

No changes to `IMenuConfig`, `IMenuEntry`, or `MenuBuilder` are needed for this upgrade.
