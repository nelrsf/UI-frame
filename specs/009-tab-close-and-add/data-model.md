# Data Model: Tab Close and Add

## Entities

### ShellTab (Extended)

Represents a registered shell tab in the `shellContent` NgRx state. Extended to include an optional close guard.

| Field | Type | Description |
|---|---|---|
| `tabItem` | `TabItem` | Tab metadata (id, label, icon, closable, dirty, pinned, groupId) |
| `componentType` | `Type<unknown>` | Angular component type to render when tab is active |
| `guard` | `TabCloseGuard \| undefined` | Optional close guard invoked before closing a dirty tab |

**State location**: `shellContent` NgRx slice (`ShellContentState.tabs`)

### TabCloseGuard (Existing, Unchanged)

Interface for intercepting tab close operations on dirty tabs.

| Method | Signature | Description |
|---|---|---|
| `beforeClose()` | `() => boolean \| Promise<boolean>` | Returns `true` to allow close, `false` to cancel |

### TabItem (Existing, Unchanged)

Serializable tab metadata used across the workspace and shell state.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique tab identifier |
| `label` | `string` | Display label shown in the tab bar |
| `icon` | `string \| undefined` | Optional icon (emoji or text string) |
| `dirty` | `boolean` | Whether the tab has unsaved changes |
| `closable` | `boolean` | Whether the close button is shown |
| `pinned` | `boolean` | Whether the tab is pinned (pinned tabs cannot be closed) |
| `groupId` | `string` | Tab group this tab belongs to |

### AvailableTabEntry (Derived)

Computed display entity for the modal picker. Not stored in state — derived at modal open time.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Tab ID (from `TabItem.id`) |
| `label` | `string` | Display label (from `TabItem.label`) |
| `icon` | `string \| undefined` | Optional icon (from `TabItem.icon`) |

**Derivation**: `AvailableTabEntry[] = RegisteredTabs[] - OpenTabIds[]`

## State Changes

### shellContent Slice

**Action**: `addShellTab` — extended to accept optional `guard?: TabCloseGuard`
**Reducer**: Stores guard alongside `tabItem` and `componentType` in `ShellTab`
**New Selector**: `selectShellCloseGuards` — returns `Record<string, TabCloseGuard>` map

### workspace Slice

**No changes required.** The `closeTab` action and reducer already exist and correctly handle tab removal from groups.

## Data Flow

### Close Flow

```
User clicks close button
  → TabBarComponent.onTabClose()
  → If dirty: consult TabCloseGuard (from closeGuards input)
    → Guard returns true: emit tabClosed
    → Guard returns false: cancel
  → If not dirty: emit tabClosed immediately
  → ShellComponent.onShellTabClosed(tabId)
  → dispatch closeTab({ tabId, groupId: 'main' })
  → workspace reducer removes tab from group
```

### Add Flow

```
User clicks "+" button
  → TabBarComponent.onNewTab()
  → emit newTabRequested
  → ShellComponent.onNewTabRequested()
  → showTabAddModal = true
  → Render TabAddModalComponent with availableTabs
  → User selects tab
  → emit tabSelected(tabId)
  → ShellComponent.onTabAddModalSelected(tabId)
  → Find TabItem from shellContent state
  → dispatch openTab({ tab: TabItem })
  → workspace reducer adds tab to group
  → showTabAddModal = false
```

## Validation Rules

- Tab IDs must be unique across registered tabs (enforced by `ShellManager` duplicate check)
- Guard `beforeClose()` must resolve within 10 seconds (timeout enforced by `TabBarComponent`)
- Modal shows only tabs not currently open in the active tab group
- Empty modal state shows "No additional tabs available to open" message
