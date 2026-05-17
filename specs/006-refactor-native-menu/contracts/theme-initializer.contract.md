# Contract: Theme Initializer

**Contract Version**: 1.0.0 | **Date**: 2026-05-17

## Overview

The Theme Initializer reads the stored theme preference, validates it, applies it via Electron's nativeTheme, and returns the active theme. Designed to be reusable by the main process bootstrap and preference handlers.

## Interface

```typescript
interface IThemeInitializer {
  initialize(): Promise<AppTheme>;
  getStoredTheme(): AppTheme;
}
```

## Behavior

### initialize()
1. Reads stored theme from PreferenceStore
2. Validates theme value ('dark' | 'light')
3. Applies theme via `nativeTheme.themeSource`
4. Returns the validated theme

### getStoredTheme()
- Synchronous read of stored theme
- Returns `DEFAULT_THEME` ('dark') if missing or invalid

## Safe Defaults

- **Missing preference**: Returns `'dark'`
- **Invalid value**: Returns `'dark'`
- **Corrupt JSON**: Returns `'dark'`

## Usage

```typescript
import { ThemeInitializer } from '../../electron/theme/theme-initializer';

const themeInitializer = new ThemeInitializer(app);
const theme = await themeInitializer.initialize();
// theme is 'dark' | 'light'
nativeTheme.themeSource = theme === 'dark' ? 'dark' : 'light';
```

## Dependencies

- `PreferenceStore` - for reading stored theme
- `nativeTheme` - Electron API for theme application
- `AppTheme` type - from contracts
- `DEFAULT_THEME` - from contracts