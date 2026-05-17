# Quick Start: Native Menu Refactoring

**Spec**: [spec.md](spec.md) | **Branch**: 006-refactor-native-menu
**Date**: 2026-05-17

---

## Goal

Understand the refactored menu architecture and customize the native menu without modifying `main.ts`.

---

## Architecture Overview

The refactoring extracts responsibilities from `main.ts` into focused modules:

| Module | File | Responsibility |
|--------|------|----------------|
| Bootstrap | `src/electron/main.ts` | Orchestrates startup; delegates to modules |
| PreferenceStore | `src/electron/preferences/preference-store.ts` | Read/write preferences JSON |
| ThemeInitializer | `src/electron/theme/theme-initializer.ts` | Apply theme at startup |
| MenuInitializer | `src/electron/menu/menu.initializer.ts` | Initialize and configure menu |
| MenuConfig | `src/electron/menu/menu.config.ts` | **Extension point** for customization |
| MenuBuilder | `src/electron/menu/menu.builder.ts` | Core stable menu construction |
| MenuManager | `src/electron/menu/menu.manager.ts` | Menu updates and state |

---

## 1. Customize the Menu (DO NOT edit main.ts)

The **extension point** is `src/electron/menu/menu.config.ts`.

### Change labels (e.g., to English)

```typescript
// src/electron/menu/menu.config.ts
import { IMenuConfig, MENU_SLOT_IDS } from '../../contracts';

export const menuConfig: IMenuConfig = {
  overrides: {
    [MENU_SLOT_IDS.FILE]: { label: 'File' },
    [MENU_SLOT_IDS.FILE_EXIT]: { label: 'Exit' },
    [MENU_SLOT_IDS.VIEW]: { label: 'View' },
    [MENU_SLOT_IDS.VIEW_DEVTOOLS]: { label: 'Toggle DevTools' },
    [MENU_SLOT_IDS.VIEW_BOTTOM_PANEL]: { label: 'Toggle Bottom Panel' },
    [MENU_SLOT_IDS.VIEW_SECONDARY_PANEL]: { label: 'Toggle Secondary Panel' },
    [MENU_SLOT_IDS.THEMES]: { label: 'Theme' },
    [MENU_SLOT_IDS.THEMES_DARK]: { label: 'Dark' },
    [MENU_SLOT_IDS.THEMES_LIGHT]: { label: 'Light' },
  },
};
```

### Add a custom submenu

```typescript
// src/electron/menu/menu.config.ts
export const menuConfig: IMenuConfig = {
  extraEntries: [
    {
      id: 'help',
      label: 'Help',
      submenu: [
        {
          id: 'help.docs',
          label: 'Documentation',
          click: () => shell.openExternal('https://example.com/docs'),
        },
      ],
    },
  ],
};
```

### Hide an optional entry

```typescript
export const menuConfig: IMenuConfig = {
  overrides: {
    'view.devtools': { visible: false },
  },
};
```

### Connect a custom action

```typescript
export const menuConfig: IMenuConfig = {
  overrides: {
    'file.exit': {
      click: () => {
        // Custom quit logic
        app.quit();
      },
    },
  },
};
```

> **Important**: `file.exit` cannot be hidden - it is mandatory. `themes.light` is always disabled until a future spec enables light theme.

---

## 2. What happens at startup

1. **PreferenceStore** reads preferences from `preferences.json`
2. **ThemeInitializer** retrieves stored theme, applies via `nativeTheme`
3. **IPC Handlers** register (window, preferences, shell, menu)
4. **Window** is created
5. **MenuInitializer** sets window reference in MenuManager, builds menu with config
6. **Lifecycle signals** emit smoke and accessibility events after load

---

## 3. Key Files Reference

| File | Role |
|------|------|
| `src/electron/main.ts` | **Bootstrap/composition root** - orchestrates modules |
| `src/electron/menu/menu.config.ts` | **Extension point** - customize menu here |
| `src/electron/menu/menu.builder.ts` | Core stable menu builder |
| `src/electron/menu/menu.manager.ts` | Menu state and updates |
| `src/electron/menu/menu.initializer.ts` | Menu setup orchestration |
| `src/electron/theme/theme-initializer.ts` | Theme initialization |
| `src/electron/preferences/preference-store.ts` | Preference read/write |
| `src/contracts/menu.ts` | IMenuConfig, IMenuBuildContext interfaces |

---

## 4. Updating Existing Quickstart

The quickstart in `specs/005-native-menu-customization/quickstart.md` should be updated to:
- Reference `menu.config.ts` as the extension point
- Remove references to editing `main.ts` for customization
- Add this new quickstart to the key files table

---

## 5. Constraints

- **DO NOT** edit `main.ts` to customize the menu - use `menu.config.ts`
- `file.exit` cannot be hidden (mandatory)
- `themes.light` always disabled
- `view.devtools` only in development (`isDev === true`)
- Custom actions must propagate errors to the handler (FR-015)