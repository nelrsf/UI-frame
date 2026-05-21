# Data Model: Unify Workspace Tab Management

## Extended TabItem Model

The `TabItem` interface is extended with two optional properties. All existing properties remain unchanged.

```typescript
import { Type } from '@angular/core';

export interface TabItem {
  // Existing properties (unchanged)
  id: string;
  label: string;
  icon?: string;
  dirty: boolean;
  closable: boolean;
  pinned: boolean;
  groupId: string;

  // New properties (optional)
  /** Angular component type for dynamic rendering via NgComponentOutlet. */
  componentType?: Type<unknown>;
  /** Close guard for dirty-tab protection. Consulted before closing a dirty tab. */
  closeGuard?: TabCloseGuard;
}

export interface TabCloseGuard {
  beforeClose: () => boolean | Promise<boolean>;
}
```

### Validation Rules

| Property | Type | Required | Default | Notes |
|----------|------|----------|---------|-------|
| `id` | `string` | Yes | — | Unique within the application |
| `label` | `string` | Yes | — | Displayed in tab strip |
| `icon` | `string` | No | `undefined` | Icon class or ligature |
| `dirty` | `boolean` | Yes | `false` | Triggers close guard evaluation |
| `closable` | `boolean` | Yes | `true` | User can close via close button |
| `pinned` | `boolean` | Yes | `false` | Pinned tabs cannot be closed |
| `groupId` | `string` | Yes | `'main'` | Identifies the tab group |
| `componentType` | `Type<unknown>` | No | `undefined` | Angular standalone component class |
| `closeGuard` | `TabCloseGuard` | No | `undefined` | Only consulted when `dirty === true` |

## Workspace State Shape (Modified)

The `TabGroupState` and `WorkspaceState` are extended with a `registeredTabs` array that persists all tabs ever registered in a group. This array is never modified by `closeTab`, enabling the tab-add modal to show closed tabs that can be reopened.

```typescript
export interface TabGroupState {
  readonly groupId: string;
  readonly registeredTabs: readonly TabItem[];  // All tabs ever registered (never removed by closeTab)
  readonly tabs: readonly TabItem[];            // Currently open tabs (modified by closeTab)
  readonly activeTabId: string | null;
  readonly zone: DockZone;
}

export interface WorkspaceState {
  readonly tabGroups: readonly TabGroupState[];
}
```

## State Transitions

### registerTab
- **Input**: `TabItem` (with componentType and closeGuard)
- **Effect**: If groupId doesn't exist → create new group with this tab (zone: PrimaryWorkspace). If groupId exists but tab not in group → append tab to group. If tab already in group → no-op.
- **Active tab**: NOT changed by this action.

### openTab
- **Input**: `TabItem` (must already be in `registeredTabs`)
- **Effect**: If tab exists in `tabs` → set as activeTabId. If tab exists in `registeredTabs` but not in `tabs` (was closed) → add to `tabs` and activate. If tab not registered → no-op.
- **Active tab**: Set to the opened tab's ID.

### registerAndOpenTab (facade)
- **Input**: `TabItem` (with componentType and closeGuard)
- **Effect**: Dispatches `registerTab` then `openTab` in sequence.
- **Active tab**: Set to the registered tab's ID (via openTab).

### closeTab
- **Input**: `{ tabId, groupId }`
- **Effect**: Removes tab from `tabs` array only. The tab remains in `registeredTabs` so it can be reopened via the tab-add modal. Resolves next active tab. Removes group if empty.
- **Active tab**: Set to adjacent tab or null.

### selectTab (unchanged)
- **Input**: `{ tabId, groupId }`
- **Effect**: Sets activeTabId for the group.

## Selector Outputs

| Selector | Input | Output | Purpose |
|----------|-------|--------|---------|
| `selectShellTabs` | `groupId: string` | `TabItem[]` | Flat list of currently open tabs for tab bar rendering |
| `selectRegisteredTabsForGroup` | `groupId: string` | `TabItem[]` | All registered tabs (including closed) for the tab-add modal |
| `selectActiveShellTabId` | `groupId: string` | `string \| null` | Active tab ID for tab bar highlighting |
| `selectActiveShellComponentType` | `groupId: string` | `Type<unknown> \| null` | Component type for ContentArea rendering |
| `selectCloseGuardsForGroup` | `groupId: string` | `Record<string, TabCloseGuard>` | Close guards map for TabBarComponent |
| `selectActiveShellTab` | `groupId: string` | `TabItem \| null` | Full active tab metadata for ContentArea |
