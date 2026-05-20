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

The `TabGroupState` and `WorkspaceState` remain structurally unchanged. The difference is that `TabItem[]` within `TabGroupState.tabs` now carries `componentType` and `closeGuard` on each tab.

```typescript
export interface TabGroupState {
  readonly groupId: string;
  readonly tabs: readonly TabItem[];  // TabItem now includes componentType + closeGuard
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
- **Input**: `TabItem` (or just `{ tabId, groupId }` — see Decision 3 in research.md)
- **Effect**: If tab exists in group → set as activeTabId. If tab exists in state but not in group → add to group and activate. If tab not registered → no-op.
- **Active tab**: Set to the opened tab's ID.

### registerAndOpenTab (facade)
- **Input**: `TabItem` (with componentType and closeGuard)
- **Effect**: Dispatches `registerTab` then `openTab` in sequence.
- **Active tab**: Set to the registered tab's ID (via openTab).

### closeTab (unchanged)
- **Input**: `{ tabId, groupId }`
- **Effect**: Removes tab from group. Resolves next active tab. Removes group if empty.
- **Active tab**: Set to adjacent tab or null.

### selectTab (unchanged)
- **Input**: `{ tabId, groupId }`
- **Effect**: Sets activeTabId for the group.

## Selector Outputs

| Selector | Input | Output | Purpose |
|----------|-------|--------|---------|
| `selectShellTabs` | `groupId: string` | `TabItem[]` | Flat list of tabs for tab bar rendering |
| `selectActiveShellTabId` | `groupId: string` | `string \| null` | Active tab ID for tab bar highlighting |
| `selectActiveShellComponentType` | `groupId: string` | `Type<unknown> \| null` | Component type for ContentArea rendering |
| `selectCloseGuardsForGroup` | `groupId: string` | `Record<string, TabCloseGuard>` | Close guards map for TabBarComponent |
| `selectActiveShellTab` | `groupId: string` | `TabItem \| null` | Full active tab metadata for ContentArea |
