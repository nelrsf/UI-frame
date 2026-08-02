# Integrations

## Electron IPC & Preload Integration

The application uses Electron for desktop runtime with a strict IPC (Inter-Process Communication) pattern:

- **Preload Script**: `src/electron/preload.ts` - Exposes the `IElectronApiPort` interface via `window.electronAPI`
- **Main Process**: `src/electron/main.ts` - Electron main process handling window lifecycle, menu, and preferences
- **IPC Channels**: Defined in `src/electron/ipc/` - Communication channels between renderer and main process

### Window Controls Integration

- `window.minimize()`: Minimize the application window
- `window.maximize()`: Toggle maximize/unmaximize state
- `window.close()`: Close the application window
- `window.isMaximized()`: Query current window maximized state

### System Integration

- `system.getPlatform()`: Detect OS platform (Windows, macOS, Linux)
- `system.openExternal(url)`: Open external URLs in the default system handler

### Preferences Storage Integration

- `preferences.get<T>(key, defaultValue)`: Retrieve persisted preferences
- `preferences.set<T>(key, value)`: Persist preferences to disk

## Local Storage Persistence

- **Implementation**: `src/app/core/infrastructure/persistence/local-storage/preferences.repository.ts`
- **Purpose**: Fallback or local storage mechanism for user preferences
- **Pattern**: Repository pattern for preference persistence

## Platform-Specific Integrations

- **Windows**: NSIS installer target (`win.target: nsis`)
- **macOS**: DMG installer target (`mac.target: dmg`)
- **Linux**: AppImage target (`linux.target: AppImage`)

## No External API Integrations

The codebase does not include:
- External API services
- Authentication providers (OAuth, SSO)
- Webhooks or external event sources
- Database services (uses local storage/Electron preferences)

All integrations are local to the desktop environment via Electron APIs.