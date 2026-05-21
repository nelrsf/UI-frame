# Contract: Status Bar Mock Configuration

## JSON Configuration Contract

The status bar mock system reads a JSON configuration file at `src/assets/config/status-bar-mocks.json`.

### Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "StatusBarMockConfiguration",
  "type": "object",
  "required": ["items"],
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/StatusBarItem"
      }
    }
  },
  "definitions": {
    "StatusBarItem": {
      "type": "object",
      "required": ["id", "label", "clickable"],
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "description": "Unique identifier for the status bar item"
        },
        "label": {
          "type": "string",
          "minLength": 1,
          "description": "Display text for the item"
        },
        "icon": {
          "type": "string",
          "description": "Optional icon character or emoji prefix"
        },
        "tooltip": {
          "type": "string",
          "description": "Optional tooltip text shown on hover"
        },
        "color": {
          "type": "string",
          "enum": ["default", "warning", "error", "success"],
          "default": "default",
          "description": "Visual state indicator"
        },
        "clickable": {
          "type": "boolean",
          "description": "Whether the item responds to click events"
        },
        "commandId": {
          "type": "string",
          "minLength": 1,
          "description": "String identifier referencing a pre-registered callback"
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

### Validation Rules

1. `id` must be unique across all items in the array
2. `label` must be non-empty
3. If `clickable` is `true` and `commandId` is provided, the `commandId` must reference a registered callback
4. `color` defaults to `"default"` if not specified
5. Unknown properties are ignored (strict mode: `additionalProperties: false`)

### Error Behavior

- Invalid JSON: Configuration is skipped; status bar renders with no mock items. Error logged to console.
- Missing required fields: Item is skipped; error logged with item index and missing field name.
- Duplicate `id`: Second item with same `id` is skipped; warning logged.
- Invalid `color` value: Falls back to `"default"`; warning logged.

## Callback Registry Contract

The `CallbackRegistryService` provides a registry for callback functions referenced by `commandId`.

### Interface

```typescript
interface CallbackRegistry {
  register(id: string, callback: () => void | Promise<void>): void;
  execute(id: string): void;
  has(id: string): boolean;
  unregister(id: string): void;
}
```

### Behavior

- `register()`: Throws if `id` is already registered (duplicate registration not allowed).
- `execute()`: Throws `Error('Callback not found: {id}')` if `id` is not registered.
- `execute()`: Wraps callback execution in try/catch. On error, dispatches `statusBarCallbackError` action and re-throws for logging.
- `unregister()`: No-op if `id` is not registered.
