# Data Model: Native Menu Customization

**Phase**: 1 — Design  
**Date**: 2026-05-11  
**Feature**: [spec.md](spec.md) | [plan.md](plan.md) | [research.md](research.md)

---

## Entities

### `AppTheme`

The active visual theme for the application. Only `'dark'` is fully implemented in this delivery; `'light'` exists as a contract for a future spec.

| Field | Type | Notes |
|-------|------|-------|
| value | `'dark' \| 'light'` | Persisted under preference key `shell.theme` |

**Default**: `'dark'`  
**Persistence key**: `shell.theme`  
**State location**: NgRx `preferences.data['shell.theme']` in renderer; `nativeTheme.themeSource` in main process.

---

### `MenuEntry`

A single interactive item within the native application menu.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | `string` | Yes | Unique slot identifier (e.g., `'archivo.salir'`). Used to address an entry in `MenuConfig`. |
| label | `string` | Yes | Display text shown to the user. |
| type | `'normal' \| 'separator' \| 'submenu' \| 'checkbox' \| 'radio'` | Yes | Maps to Electron `MenuItemConstructorOptions.type`. |
| enabled | `boolean` | No | `true` by default. Set to `false` to render disabled (greyed-out) without hiding. |
| visible | `boolean` | No | `true` by default. Set to `false` to hide from menu entirely. |
| checked | `boolean` | No | Only meaningful for `checkbox` and `radio` types. |
| accelerator | `string` | No | Optional keyboard shortcut (Electron accelerator format, e.g., `'CmdOrCtrl+Q'`). |
| click | `() => void` | No | Callback invoked when the user activates this entry. |
| submenu | `MenuEntry[]` | No | Child entries for `submenu` type. |

**Validation rules**:
- `id` must be non-empty and unique within the menu configuration.
- `submenu` must not be empty when `type === 'submenu'`.
- `click` is ignored when `type === 'submenu'` or `type === 'separator'`.
- `enabled = false` does not remove the entry; use `visible = false` to hide it.

---

### `MenuConfig`

A complete configuration describing the entire application menu. Passed to `MenuBuilder`
to produce or override the default menu.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| entries | `MenuEntry[]` | No | Top-level menu entries. When omitted, the builder uses its built-in defaults. |
| overrides | `Record<string, Partial<MenuEntry>>` | No | Keyed by `MenuEntry.id`. Values are merged (shallow) onto matching entries, letting integrators change only specific fields (e.g., label or click) without replacing the full entry. |

**State transitions**:

```
Default config (built-in)
  → apply integrator overrides (merged by id)
  → apply runtime context (isDev flag, active theme)
  → Electron MenuTemplate[]
  → Menu.buildFromTemplate()
  → Menu.setApplicationMenu()
```

---

### `PanelToggleTarget`

Identifies which shell panel a menu action addresses.

| Value | Meaning |
|-------|---------|
| `'bottomPanel'` | Toggle the Bottom Panel region. Maps to `toggleBottomPanel` NgRx action. |
| `'secondaryPanel'` | Toggle the Secondary Panel region. Maps to `toggleSecondaryPanel` NgRx action. |

This type is used as the payload of `MENU.TOGGLE_BOTTOM_PANEL` and `MENU.TOGGLE_SECONDARY_PANEL` IPC events.

---

### `ThemeChangedPayload`

Payload sent from the main process to the renderer via `MENU.THEME_CHANGED` when the user selects a new theme from the menu.

| Field | Type | Notes |
|-------|------|-------|
| theme | `AppTheme` | The new active theme value. |

---

## Menu Slot Map (Default Configuration)

The built-in default menu uses the following named slots, all addressable via `MenuConfig.overrides`:

| Slot ID | Label (default) | Type | Notes |
|---------|----------------|------|-------|
| `archivo` | Archivo | submenu | |
| `archivo.salir` | Salir | normal | Calls `app.quit()`. Mandatory; cannot be removed. |
| `vista` | Vista | submenu | |
| `vista.devtools` | Mostrar DevTools | normal | Visible only when `isDev === true`. |
| `vista.bottomPanel` | Panel inferior | checkbox | Dispatches `MENU.TOGGLE_BOTTOM_PANEL` to renderer. |
| `vista.secondaryPanel` | Panel secundario | checkbox | Dispatches `MENU.TOGGLE_SECONDARY_PANEL` to renderer. |
| `temas` | Temas | submenu | |
| `temas.oscuro` | Oscuro | radio | Active in this delivery. Sets theme to `'dark'`. |
| `temas.claro` | Claro | radio | Visible but `enabled: false` until future spec. |

---

## State Flows

### Theme selection
```
User clicks "Oscuro" in menu
  → menu.builder click handler
  → nativeTheme.themeSource = 'dark'
  → write preference: preferences.json { shell.theme: 'dark' }
  → Menu.setApplicationMenu(rebuild with checked='dark')
  → mainWindow.webContents.send(MENU.THEME_CHANGED, { theme: 'dark' })
  → renderer: dispatch setPreference({ key: 'shell.theme', value: 'dark' })
  → NgRx preferences slice updated
```

### App startup
```
main.ts createWindow()
  → read preferences.json → shell.theme (default: 'dark')
  → nativeTheme.themeSource = storedTheme
  → MenuBuilder.build(config, { activeTheme: storedTheme, isDev })
  → Menu.setApplicationMenu(menu)
```

### Panel toggle
```
User clicks "Panel inferior" in menu
  → menu.builder click handler
  → mainWindow.webContents.send(MENU.TOGGLE_BOTTOM_PANEL)
  → renderer (via preload listener): store.dispatch(toggleBottomPanel())
```

---

## IPC Channel Additions

| Constant | Direction | Payload | Purpose |
|----------|-----------|---------|---------|
| `MENU.TOGGLE_BOTTOM_PANEL` | main → renderer | none | Request renderer to toggle bottom panel |
| `MENU.TOGGLE_SECONDARY_PANEL` | main → renderer | none | Request renderer to toggle secondary panel |
| `MENU.THEME_CHANGED` | main → renderer | `{ theme: AppTheme }` | Notify renderer of new active theme |

---

## Future Light Theme Integration Points

The following contracts are produced now but left unimplemented until a future spec:

- `IThemeAdapter` port in `src/app/core/application/ports/theme.port.ts` — interface for applying a theme to the Angular shell.
- `selectActiveTheme` selector — reads `preferences.data['shell.theme']` from NgRx store.
- `MENU.THEME_CHANGED` listener in the shell component — dispatches theme preference update to NgRx.
- `temas.claro` menu entry — slot ID exists in `MenuConfig.overrides`; enabling it requires only flipping `enabled: true` and providing a light theme implementation.
