# Contract: Preference Store (Main Process)

**Contract Version**: 1.0.0 | **Date**: 2026-05-17

## Overview

The Preference Store provides centralized read/write access to the preferences JSON file in the Electron userData directory. Used by the main process for theme initialization and preference handling.

## Interface

```typescript
interface IPreferenceStore {
  read(key: string): Promise<unknown>;
  write(key: string, value: unknown): Promise<void>;
  readAll(): Promise<Record<string, unknown>>;
  getTheme(): Promise<AppTheme>;
}
```

## File Format

**Location**: `{userData}/preferences.json`

```json
{
  "schemaVersion": 1,
  "data": {
    "shell.theme": "dark"
  }
}
```

## Error Handling

- **Missing file**: Returns safe defaults
- **Invalid JSON**: Returns safe defaults
- **Invalid schema version**: Returns safe defaults
- **Unknown key**: Returns `undefined`

## Usage

```typescript
import { PreferenceStore } from '../../electron/preferences/preference-store';

const store = new PreferenceStore();

// Read a preference
const theme = await store.getTheme();

// Write a preference
await store.write('shell.theme', 'dark');
```

## Constraints

- Only main process can use this store
- Renderer process must use IPC via preload bridge
- Schema version must be 1 for valid envelope