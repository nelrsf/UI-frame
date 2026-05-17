# Quick Start: Native Menu Customization

**Spec**: [spec.md](spec.md) | **Contract reference**: [contracts/menu-customization.contract.md](contracts/menu-customization.contract.md)
**Date**: 2026-05-11

---

## Goal

Understand, use, and extend the native Electron application menu in under 10 minutes.

---

## 1. Run the app and confirm the default menu

```bash
npm run build:electron && npm start
```

Open the menu bar. You should see:

```
Archivo  Vista  Temas
```

- **Archivo -> Salir** - closes the application.
- **Vista -> Panel inferior / Panel secundario** - toggles each panel.
- **Vista -> Mostrar DevTools** - visible only when `ELECTRON_ENV=development`.
- **Temas -> Oscuro** - selected (active). **Claro** - visible but greyed out.

---

## 2. How the menu is built

The menu is built by `MenuBuilder` in `src/electron/menu/menu.builder.ts`, orchestrated by `MenuInitializer` at startup. The customization configuration is read from `menu.config.ts`.

> **Important**: DO NOT edit `main.ts` to customize the menu. Use `menu.config.ts` instead.

---

## 3. Customize labels (e.g., switch to English)

The **extension point** for menu customization is `src/electron/menu/menu.config.ts`.
DO NOT edit `main.ts` to customize the menu - use the menu config file instead.

Edit `menu.config.ts`:

```ts
// src/electron/menu/menu.config.ts
import { IMenuConfig, MENU_SLOT_IDS } from '../../contracts';

export const menuConfig: IMenuConfig = {
  overrides: {
    [MENU_SLOT_IDS.FILE]:               { label: 'File' },
    [MENU_SLOT_IDS.FILE_EXIT]:         { label: 'Exit' },
    [MENU_SLOT_IDS.VIEW]:                 { label: 'View' },
    [MENU_SLOT_IDS.VIEW_DEVTOOLS]:        { label: 'Toggle DevTools' },
    [MENU_SLOT_IDS.VIEW_BOTTOM_PANEL]:    { label: 'Toggle Bottom Panel' },
    [MENU_SLOT_IDS.VIEW_SECONDARY_PANEL]: { label: 'Toggle Secondary Panel' },
    [MENU_SLOT_IDS.THEMES]:                 { label: 'Theme' },
    [MENU_SLOT_IDS.THEMES_DARK]:          { label: 'Dark' },
    [MENU_SLOT_IDS.THEMES_LIGHT]:           { label: 'Light' },
  },
};
```

---

## 4. Add a custom submenu

Use the `extraEntries` field in `menu.config.ts` to append new top-level items:

```ts
// In src/electron/menu/menu.config.ts
export const menuConfig: IMenuConfig = {
  extraEntries: [
    {
      id: 'ayuda',
      label: 'Ayuda',
      type: 'submenu',
      submenu: [
        {
          id: 'ayuda.docs',
          label: 'Documentacion',
          type: 'normal',
          accelerator: 'F1',
          click: () => shell.openExternal('https://example.com/docs'),
        },
      ],
    },
  ],
};
```

---

## 5. Hide an optional built-in entry

Add overrides to `menu.config.ts`:

```ts
export const menuConfig: IMenuConfig = {
  overrides: {
    'view.devtools': { visible: false },
  },
};
```

> **Note**: `file.exit` cannot be hidden - it is a mandatory shell action.

---

## 6. Connect a custom action to an existing entry

Add overrides to `menu.config.ts`:

```ts
export const menuConfig: IMenuConfig = {
  overrides: {
    'file.exit': {
      click: () => {
        myApp.onBeforeQuit().then(() => app.quit());
      },
    },
  },
};
```

---

## 7. Theme changes - what happens automatically

When the user selects **Temas -> Oscuro**:

1. `nativeTheme.themeSource` is set to `'dark'` - the native menu bar and OS chrome update immediately.
2. The preference is written to disk (`shell.theme = 'dark'`).
3. The menu rebuilds with the correct radio `checked` state.
4. The main process sends `MENU.THEME_CHANGED` to the renderer.
5. The renderer's `setPreference` NgRx action is dispatched so the store reflects the change.

At the **next app start**, the stored theme is read before the menu is created, so no flash occurs.

---

## 8. Listen to theme changes in the renderer (Angular)

```ts
// In your shell component or app initializer
constructor(private store: Store) {
  window.electronAPI.menu.onThemeChanged((theme) => {
    this.store.dispatch(setPreference({ key: 'shell.theme', value: theme }));
  });
}
```

---

## 9. Selector for the active theme (NgRx)

```ts
import { selectActiveTheme } from '@core/state/preferences';

// In any Angular component
readonly activeTheme$ = this.store.select(selectActiveTheme); // Observable<'dark' | 'light'>
```

---

## 10. Preparing for the future light theme

When a future spec enables full light-theme support:

- Implement `IThemeAdapter` (`src/app/core/application/ports/theme.port.ts`).
- Inject it in your shell component and call `adapter.applyTheme(theme)` on theme changes.
- No changes to `MenuBuilder` or your existing config are required.

---

## Key files reference

| File | Role |
|------|------|
| `src/electron/menu/menu.config.ts` | **Extension point** - customize menu here (DO NOT edit main.ts) |
| `src/electron/menu/menu.builder.ts` | `MenuBuilder` class - core stable menu construction |
| `src/electron/menu/menu.initializer.ts` | Menu setup orchestration |
| `src/electron/menu/menu.manager.ts` | Menu state and updates |
| `src/electron/main.ts` | **Bootstrap/composition root** - orchestrates modules, do not modify for customization |
| `src/electron/menu/menu.defaults.ts` | Default Spanish menu entries and theme colour map |
| `src/electron/ipc/channels.ts` | `MENU.*` IPC channel constants |
| `src/app/core/models/theme.model.ts` | `AppTheme` type and `THEME_PREFERENCE_KEY` constant |
| `src/app/core/application/ports/theme.port.ts` | `IThemeAdapter` - future renderer theme integration point |
| `src/app/core/state/preferences/preferences.selectors.ts` | `selectActiveTheme` selector |
| `specs/005-native-menu-customization/contracts/` | Full contract types for this feature |
| `specs/006-refactor-native-menu/quickstart.md` | Refactored architecture overview and OCP guidance |
