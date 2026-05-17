# Data Model: Native Menu Refactoring

**Date**: 2026-05-17 | **Branch**: 006-refactor-native-menu

## Entities

### 1. Preference Store (Main Process)
**Location**: `src/electron/preferences/preference-store.ts`

**Purpose**: Centralized read/write for preferences JSON file with envelope schema validation.

**Fields**:
- `schemaVersion: 1` (const)
- `data: Record<string, unknown>` (preference key-value pairs)

**Methods**:
- `read(key: string): Promise<unknown>` - Read a preference
- `write(key: string, value: unknown): Promise<void>` - Write a preference
- `readAll(): Promise<Record<string, unknown>>` - Read all preferences
- `getTheme(): Promise<AppTheme>` - Convenience method for theme

**Validation**:
- Invalid/missing file returns safe defaults
- Unknown keys return undefined

---

### 2. Theme Initializer
**Location**: `src/electron/theme/theme-initializer.ts`

**Purpose**: Initialize and apply theme at startup; reusable by bootstrap and handlers.

**Methods**:
- `initialize(): Promise<AppTheme>` - Read stored theme, apply via nativeTheme, return theme
- `getStoredTheme(): AppTheme` - Synchronous read (for immediate use)

**Dependencies**: PreferenceStore, nativeTheme

**Safe Defaults**: Returns `'dark'` if preference missing or invalid

---

### 3. Menu Initializer
**Location**: `src/electron/menu/menu.initializer.ts`

**Purpose**: Orchestrate menu setup at application startup.

**Methods**:
- `initialize(window: BrowserWindow, theme: AppTheme, isDev: boolean): void` - Set up menu with context
- `getConfig(): IMenuConfig` - Get current menu configuration

**Dependencies**: MenuManager, MenuBuilder, MenuConfig (extension point)

---

### 4. Menu Extension Configuration
**Location**: `src/electron/menu/menu.config.ts`

**Purpose**: Stable extension point for integrators to customize menu.

**Interface**: `IMenuConfig` (from `src/contracts/menu.ts`)

**Usage**:
```ts
import { menuConfig } from './menu.config';

const initializer = new MenuInitializer(menuConfig);
initializer.initialize(window, theme, isDev);
```

---

### 5. Shell Handler Module
**Location**: `src/electron/ipc/handlers/shell.handlers.ts`

**Purpose**: Modular handler for shell operations (OPEN_EXTERNAL).

**Registration**:
```ts
import { registerShellHandlers } from './shell.handlers';
registerShellHandlers();
```

**IPC Channels**:
- `SHELL.OPEN_EXTERNAL` - Open external URLs (allowlist-based)

---

### 6. Lifecycle Signals Module
**Location**: `src/electron/lifecycle/signals.ts`

**Purpose**: Emit smoke and accessibility signals after shell loads.

**Functions**:
- `emitShellSignals(window: BrowserWindow): void` - Emit smoke, security, keyboard, secondary signals

---

## Relationships

```
main.ts (Bootstrap)
    │
    ├──► PreferenceStore
    │         │
    │         └──► preferences.json (file)
    │
    ├──► ThemeInitializer
    │         ├──► PreferenceStore
    │         └──► nativeTheme
    │
    ├──► MenuInitializer
    │         ├──► MenuManager
    │         ├──► MenuBuilder
    │         └──► MenuConfig (extension point)
    │
    ├──► registerWindowHandlers()
    ├──► registerPreferencesHandlers()
    ├──► registerShellHandlers()
    │
    └──► emitShellSignals()
```

---

## State Transitions

### Application Startup Flow
1. App ready → Read preferences
2. ThemeInitializer reads stored theme → applies to nativeTheme
3. Register IPC handlers (window, preferences, shell, menu)
4. Create window
5. Initialize menu with theme and context
6. Emit lifecycle signals after did-finish-load

---

## Validation Rules

- **PreferenceStore**: Schema version must be 1; data must be object
- **ThemeInitializer**: Only accepts 'dark' | 'light'; defaults to 'dark'
- **MenuConfig**: Must not hide 'file.exit'; 'themes.light' always disabled; 'view.devtools' only in dev

---

## Key Files Reference

| Entity | File Path | Responsibility |
|--------|-----------|----------------|
| PreferenceStore | `src/electron/preferences/preference-store.ts` | Read/write preferences JSON |
| ThemeInitializer | `src/electron/theme/theme-initializer.ts` | Apply theme at startup |
| MenuInitializer | `src/electron/menu/menu.initializer.ts` | Orchestrate menu setup |
| MenuConfig | `src/electron/menu/menu.config.ts` | Extension point for customization |
| ShellHandlers | `src/electron/ipc/handlers/shell.handlers.ts` | Shell IPC handlers |
| LifecycleSignals | `src/electron/lifecycle/signals.ts` | Emit smoke/accessibility signals |