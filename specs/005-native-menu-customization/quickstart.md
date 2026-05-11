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

- **Archivo → Salir** — closes the application.
- **Vista → Panel inferior / Panel secundario** — toggles each panel.
- **Vista → Mostrar DevTools** — visible only when `ELECTRON_ENV=development`.
- **Temas → Oscuro** — selected (active). **Claro** — visible but greyed out.

---

## 2. How the menu is built

The entry point is `MenuBuilder` in `src/electron/menu/menu.builder.ts`.

```ts
// src/electron/main.ts (simplified)
import { MenuBuilder } from './menu';

const menu = new MenuBuilder().build({
  activeTheme: storedTheme,   // 'dark' | 'light'
  isDev,                      // from process.env['ELECTRON_ENV']
});
Menu.setApplicationMenu(menu);
```

`MenuBuilder` reads the current build context and the optional `IMenuConfig` you supply,
then returns a native Electron `Menu` object.

---

## 3. Customize labels (e.g., switch to English)

Create a config object and pass it to `MenuBuilder`:

```ts
// src/electron/my-menu.config.ts
import { IMenuConfig, MENU_SLOT_IDS } from '../../specs/005-native-menu-customization/contracts';

export const englishMenuConfig: IMenuConfig = {
  overrides: {
    [MENU_SLOT_IDS.ARCHIVO]:               { label: 'File' },
    [MENU_SLOT_IDS.ARCHIVO_SALIR]:         { label: 'Exit' },
    [MENU_SLOT_IDS.VISTA]:                 { label: 'View' },
    [MENU_SLOT_IDS.VISTA_DEVTOOLS]:        { label: 'Toggle DevTools' },
    [MENU_SLOT_IDS.VISTA_BOTTOM_PANEL]:    { label: 'Toggle Bottom Panel' },
    [MENU_SLOT_IDS.VISTA_SECONDARY_PANEL]: { label: 'Toggle Secondary Panel' },
    [MENU_SLOT_IDS.TEMAS]:                 { label: 'Theme' },
    [MENU_SLOT_IDS.TEMAS_OSCURO]:          { label: 'Dark' },
    [MENU_SLOT_IDS.TEMAS_CLARO]:           { label: 'Light' },
  },
};
```

Then wire it up in `main.ts`:

```ts
import { englishMenuConfig } from './my-menu.config';

const menu = new MenuBuilder(englishMenuConfig).build(buildContext);
Menu.setApplicationMenu(menu);
```

---

## 4. Add a custom submenu

Use the `extraEntries` field to append new top-level items:

```ts
import { IMenuConfig } from '../../specs/005-native-menu-customization/contracts';

const myConfig: IMenuConfig = {
  extraEntries: [
    {
      id: 'ayuda',
      label: 'Ayuda',
      type: 'submenu',
      submenu: [
        {
          id: 'ayuda.docs',
          label: 'Documentación',
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

```ts
const myConfig: IMenuConfig = {
  overrides: {
    'vista.devtools': { visible: false },
  },
};
```

> **Note**: `archivo.salir` cannot be hidden — it is a mandatory shell action.

---

## 6. Connect a custom action to an existing entry

```ts
const myConfig: IMenuConfig = {
  overrides: {
    'archivo.salir': {
      click: () => {
        myApp.onBeforeQuit().then(() => app.quit());
      },
    },
  },
};
```

---

## 7. Theme changes — what happens automatically

When the user selects **Temas → Oscuro**:

1. `nativeTheme.themeSource` is set to `'dark'` — the native menu bar and OS chrome update immediately.
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
| `src/electron/menu/menu.builder.ts` | `MenuBuilder` class — the customization entry point |
| `src/electron/menu/menu.defaults.ts` | Default Spanish menu entries and theme colour map |
| `src/electron/ipc/channels.ts` | `MENU.*` IPC channel constants |
| `src/electron/main.ts` | Wires `MenuBuilder` at startup; restores theme from prefs |
| `src/app/core/models/theme.model.ts` | `AppTheme` type and `THEME_PREFERENCE_KEY` constant |
| `src/app/core/application/ports/theme.port.ts` | `IThemeAdapter` — future renderer theme integration point |
| `src/app/core/state/preferences/preferences.selectors.ts` | `selectActiveTheme` selector |
| `specs/005-native-menu-customization/contracts/` | Full contract types for this feature |
