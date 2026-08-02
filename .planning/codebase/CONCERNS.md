# Technical Concerns

## Known Issues & Warnings

### 1. Duplicate ID Handling Warnings

Several services emit warnings when duplicate IDs are encountered:

- **Shell Manager**: Duplicate tab IDs, sidebar entries, and toolbar action IDs are ignored with warnings (`[ShellManager] Duplicate ... ignored.`)
- **Command Registry**: Unknown command IDs emit warnings (`[CommandRegistry] Unknown command id: ...`)
- **Workspace Reducer**: Duplicate workspace items emit warnings

**Concern**: Duplicate IDs could indicate race conditions or state corruption in the workspace management.

### 2. Layout Panel Validation Errors

The `LayoutSplittablePanelComponent` validates dock zone arrays:

- Invalid or empty dock zone arrays emit errors:
  - `console.error('Invalid or empty dock zone array, it must have at least one row')`
  - `console.error('Invalid or empty dock zone array, it must have at least one column')`

**Concern**: Invalid dock zone configurations could cause layout rendering failures.

### 3. Tab Close Guard Timeout

The shell component has a close guard mechanism:

- `console.warn(\`[Shell] Close guard timed out for tab '${tabId}'. Tab remains open.\`)`

**Concern**: Tabs may remain open if close operations fail or timeout, potentially leading to state inconsistency.

## Technical Debt

### 1. Mock Configuration Fallback

The `MockConfigLoader` handles missing or invalid mock configuration files:

- Emits warnings for missing files: `console.warn('[MockConfigLoader] Mock configuration file not found or inaccessible')`
- Emits errors for failed loads: `console.error('[MockConfigLoader] Failed to load mock configuration:', err)`
- Emits warnings for invalid items (missing 'id', 'label', or duplicate 'id')

**Concern**: Reliance on mock configuration for shell content suggests incomplete or placeholder UI implementations.

### 2. Deprecated API Usage

The `IElectronApiPort` interface and preload script include deprecated platform detection:

- `@deprecated Use system.getPlatform() instead.`
- The `platform` property is kept for backwards compatibility with adapters

**Concern**: Deprecated APIs should be removed in future versions to reduce technical debt.

### 3. NgRx Strict Immutability Workarounds

The `app.config.ts` disables strict state checks:

```typescript
provideStore({}, {
  runtimeChecks: {
    strictStateImmutability: false,
    strictActionImmutability: false,
    strictStateSerializability: false,
    strictActionSerializability: false,
  },
})
```

**Concern**: Disabling strict immutability checks may hide state mutation bugs and reduce type safety.

## Performance Considerations

### 1. NgRx DevTools Configuration

Store devtools is configured with:

- `maxAge: 50`
- `trace: true`
- `traceLimit: 25`

**Concern**: Trace enabled in development may impact performance; ensure disabled in production builds.

### 2. Component Re-rendering

Shell components use complex layout structures with splittable panels and dock zones.

**Concern**: Frequent state updates in layout/workspace state could cause unnecessary component re-renders. Monitor performance in production.

## Security & Data Privacy

### 1. Local Storage Preferences

Preferences are stored in local storage via `PreferencesRepository`:

- `src/app/core/infrastructure/persistence/local-storage/preferences.repository.ts`

**Concern**: Ensure sensitive user preferences are not stored in plain text. Review preference data types for PII or sensitive information.

### 2. External URL Handling

The `system.openExternal(url)` method opens external URLs in the system handler.

**Concern**: Ensure URL validation is performed before opening external links to prevent malicious URL execution.

## Fragile Areas

### 1. Dock Zone Configuration

The dock zone layout system (`layout-splittable-panel.component.ts`) is complex and handles:

- Row/column validation
- Panel finding and resizing
- Drag and drop operations

**Concern**: Changes to dock zone configuration or layout logic may have cascading effects on the shell UI.

### 2. Workspace State Management

The workspace reducer handles:

- Tab groups
- Active tabs
- Dirty/pinned state

**Concern**: State mutations or race conditions in workspace management could lead to tab state inconsistency.