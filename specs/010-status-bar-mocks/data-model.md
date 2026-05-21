# Data Model: Status Bar Mock Data

## Entities

### StatusBarItem

Represents a single piece of information displayed in the status bar.

**Fields**:
- `id: string` — Unique identifier for the item. Must be unique across all items.
- `label: string` — Display text for the item.
- `icon?: string` — Optional icon character or emoji prefix.
- `tooltip?: string` — Optional tooltip text shown on hover.
- `color?: 'default' | 'warning' | 'error' | 'success'` — Visual state indicator. Defaults to `'default'`.
- `clickable: boolean` — Whether the item responds to click events.
- `commandId?: string` — Optional string identifier referencing a pre-registered callback in the `CallbackRegistryService`.
- `position: 'left' | 'right'` — Which section of the status bar the item appears in. (Center section not implemented in current component; reserved for future.)

**Validation Rules**:
- `id` must be non-empty and unique
- `label` must be non-empty
- `commandId` must reference a registered callback if `clickable` is `true` and `commandId` is provided

**State Transitions**:
- `default` → `error` (when callback fails)
- `error` → `default` (after 3-second auto-reset)

### MockConfiguration

Represents the parsed JSON configuration file.

**Fields**:
- `items: StatusBarItem[]` — Array of status bar item definitions.

**JSON Schema** (informal):
```json
{
  "items": [
    {
      "id": "string",
      "label": "string",
      "icon": "string (optional)",
      "tooltip": "string (optional)",
      "color": "default | warning | error | success (optional, default: 'default')",
      "clickable": "boolean",
      "commandId": "string (optional)"
    }
  ]
}
```

### CallbackRegistry

In-memory registry mapping string identifiers to callback functions.

**Fields**:
- `registry: Map<string, () => void | Promise<void>>` — Internal map of ID to callback function.

**Operations**:
- `register(id: string, callback: () => void | Promise<void>): void` — Adds a callback to the registry.
- `execute(id: string): void` — Executes the callback by ID. Throws if ID not found.
- `has(id: string): boolean` — Checks if a callback is registered.
- `unregister(id: string): void` — Removes a callback from the registry.

### StatusBarState (NgRx Slice)

NgRx state slice holding the loaded status bar items.

**Fields**:
- `leftItems: StatusBarItem[]` — Items positioned on the left section.
- `rightItems: StatusBarItem[]` — Items positioned on the right section.
- `loaded: boolean` — Whether the configuration has been loaded.
- `error: string | null` — Error message if configuration loading failed.

**Actions**:
- `loadStatusBarItems({ items: StatusBarItem[] })` — Dispatched by the config loader on startup.
- `setCallbackError({ itemId: string })` — Dispatched when a callback throws an error.
- `clearCallbackError({ itemId: string })` — Dispatched after the error indicator timeout.
