# Quick Start: Status Bar Mock Data

## Overview

This feature allows developers to add mock items to the status bar using a JSON configuration file. Items can display text, icons, tooltips, and can be configured as clickable with custom callbacks.

## Step 1: Create the Configuration File

Create or edit `src/assets/config/status-bar-mocks.json`:

```json
{
  "items": [
    {
      "id": "mock-branch",
      "label": "main",
      "icon": "🔀",
      "tooltip": "Current Git branch",
      "color": "default",
      "clickable": false,
      "position": "left"
    },
    {
      "id": "mock-errors",
      "label": "0 Errors",
      "icon": "⚠️",
      "tooltip": "Click to view errors",
      "color": "success",
      "clickable": true,
      "commandId": "statusbar.showErrors",
      "position": "left"
    },
    {
      "id": "mock-position",
      "label": "Ln 12, Col 34",
      "tooltip": "Cursor position",
      "clickable": false,
      "position": "right"
    }
  ]
}
```

## Step 2: Register Callbacks (for Clickable Items)

In your Angular module or component, register callbacks using the `CallbackRegistryService`:

```typescript
import { inject } from '@angular/core';
import { CallbackRegistryService } from '../core/services/callback-registry.service';

// In your initialization code:
const callbackRegistry = inject(CallbackRegistryService);

callbackRegistry.register('statusbar.showErrors', () => {
  console.log('Show errors panel');
  // Your custom logic here
});
```

## Step 3: Run the Application

Start the application as usual:

```bash
npm run electron:dev
```

The status bar will load and display the mock items defined in the configuration file.

## Configuration Reference

### StatusBarItem Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `id` | `string` | Yes | — | Unique identifier |
| `label` | `string` | Yes | — | Display text |
| `icon` | `string` | No | — | Icon character or emoji |
| `tooltip` | `string` | No | — | Hover tooltip text |
| `color` | `'default' \| 'warning' \| 'error' \| 'success'` | No | `'default'` | Visual state color |
| `clickable` | `boolean` | Yes | — | Whether item responds to clicks |
| `commandId` | `string` | No | — | Callback registry identifier |
| `position` | `'left' \| 'right'` | Yes | `'left'` | Which section of the status bar |

### Color Values

- `default`: Standard appearance
- `warning`: Yellow/orange indicator
- `error`: Red indicator (also set automatically when a callback fails)
- `success`: Green indicator

## Error Handling

If a callback throws an error:
1. The item's color temporarily changes to `error` (red)
2. The error is logged to the console
3. After 3 seconds, the color resets to its original value

## Removing Items

To remove an item, simply delete its entry from the `items` array in the JSON file and restart the application.

## Adding Callbacks at Runtime

Callbacks can be registered at any time, but should be registered before the user clicks the item. Recommended registration points:
- `APP_INITIALIZER` factory
- Component `ngOnInit`
- Service constructor

## Troubleshooting

- **Items not appearing**: Check the browser console for warnings about missing/invalid JSON or duplicate IDs.
- **Callback not firing**: Ensure the `commandId` in JSON matches a registered callback ID exactly.
- **Error color stuck**: The 3-second reset is handled automatically. If it persists, check for unhandled async promise rejections in your callback.
