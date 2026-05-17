# Contract: Menu Initializer

**Contract Version**: 1.0.0 | **Date**: 2026-05-17

## Overview

The Menu Initializer orchestrates menu setup at application startup. It receives the window reference and runtime context, uses the extension configuration, configures the MenuManager, and applies the native menu.

## Interface

```typescript
interface IMenuInitializer {
  initialize(window: BrowserWindow, theme: AppTheme, isDev: boolean): void;
  getConfig(): IMenuConfig;
}
```

## Behavior

### initialize(window, theme, isDev)
1. Store window reference in MenuManager via `setMainWindow()`
2. Build menu with theme context using MenuBuilder
3. Apply menu via `Menu.setApplicationMenu()`
4. Initialize panel visibility state

### getConfig()
- Returns the current `IMenuConfig` for inspection

## Dependencies

- `MenuManager` - for window reference and rebuild operations
- `MenuBuilder` - for building the native menu
- `MenuConfig` - extension point from `menu.config.ts`
- `IMenuBuildContext` - from contracts

## Usage

```typescript
import { MenuInitializer } from '../../electron/menu/menu.initializer';
import { menuConfig } from '../../electron/menu/menu.config';

const menuInitializer = new MenuInitializer(menuConfig);
menuInitializer.initialize(mainWindow, 'dark', isDev);
```

## Constraints

- Must be called after window is created
- `file.exit` cannot be hidden (enforced by MenuBuilder)
- `themes.light` always disabled until future spec
- `view.devtools` only visible when `isDev === true`

## Extension Point

Integrators customize the menu by modifying `src/electron/menu/menu.config.ts`:

```typescript
// menu.config.ts
import { IMenuConfig } from '../../contracts';

export const menuConfig: IMenuConfig = {
  overrides: {
    'file.exit': { label: 'Exit' },
  },
  extraEntries: [
    // custom submenus...
  ],
};
```

**DO NOT** modify `main.ts` to customize the menu. Use `menu.config.ts` instead.