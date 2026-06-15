# Feature Specification: shell-split-panels

**Feature Branch**: `[013-shell-split-panels]`  
**Created**: 2026-05-29  
**Status**: Aligned  
**Input**: User description: "Implement split functionality in shell components (Central Region Tabs and Bottom Panel)."

```typescript
export class LayoutSplittablePanelComponent {
    @Input() direction: LayoutSplitDirection;
    @Input() zones: Array<DockZone[]>;
    @Input() visible: boolean;
    @Input() showVerticalSplitButton: boolean;
    @Input() showHorizontalSplitButton: boolean;
    @Input() showClose: boolean;
    @Output() closePanel: EventEmitter<boolean>;
}
```

---

## Clarifications

### Architectural Realignment (2026-06-15)
- **Grid-Based Visibility Control**: Rather than dynamically rendering cyclic elements on the fly, the component implements a predefined grid/matrix of `DockZone` panels controlled by a 2D state matrix (`panelStates: PanelState[][]`).
- **Split Behavior**: Splitting is achieved by toggling the `visible` state of the adjacent panel row or column within the predefined matrix.
- **Splitter Component**: Drag-to-resize split boundaries are handled by `ShellSplitterHandleComponent` (`app-shell-splitter-handle`) which is conditionally rendered between visible panels.
- **Tab Migration on Close**: When a split pane is closed, its tabs are automatically migrated back to the first active panel in the matrix to prevent tab loss.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Split Central Region Tabs (Priority: P1)
User can split the central region tabs component into resizable panes to organize workspace tabs.

**Why this priority**: Enables simultaneous side-by-side tab views and organized workspace divisions.

**Acceptance Scenarios**:
1. **Given** the shell interface with central region tabs, **When** user clicks the vertical split button, **Then** the adjacent column panel is set to visible and the space is divided vertically.
2. **Given** a split central region with two visible panels, **When** user drags a tab from one panel to another, **Then** the tab is migrated and registered within the target `DockZone` normally.

### User Story 2 - Split Bottom Panel (Priority: P1)
User can split the bottom panel component into resizable panes to organize panel content.

**Why this priority**: Enables simultaneous vertical stacked or side-by-side panel organization.

**Acceptance Scenarios**:
1. **Given** the bottom panel with initial content, **When** user clicks the horizontal split button, **Then** the adjacent row panel is set to visible and the space is divided horizontally.
2. **Given** multiple visible bottom panel rows/columns, **When** user drags components between panels, **Then** the components register within the target `DockZone` normally.

### User Story 3 - Split Limit Enforcement (Priority: P2)
Split buttons hide when all predefined panel regions in the grid are already visible.

**Why this priority**: Restricts splitting behavior to safe bounds governed by the static layout grid configuration.

**Acceptance Scenarios**:
1. **Given** a splittable region with a grid configuration, **When** all grid panels are set to `visible`, **Then** the split button hides.
2. **Given** a visible grid with split buttons hidden, **When** a pane is closed, **Then** the corresponding split button becomes visible again.

---

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide split buttons (horizontal and/or vertical) in `LayoutSplittablePanelComponent` controlled by boolean inputs (`showVerticalSplitButton`, `showHorizontalSplitButton`).
- **FR-002**: System MUST render panels using a 2D grid matrix of `DockZone` arrays (`zones: Array<DockZone[]>`).
- **FR-003**: System MUST manage individual panel visibility using a local state model (`panelStates: PanelState[][]`).
- **FR-004**: System MUST render `app-shell-splitter-handle` elements between adjacent visible rows and columns to handle resizing.
- **FR-005**: System MUST hide horizontal or vertical split buttons when all corresponding panels/rows in the grid are visible.
- **FR-006**: System MUST migrate all tabs from a closed panel to the first remaining active panel when a panel's visibility is set to false.
- **FR-007**: System MUST use NgRx actions (`moveTabToZone`, `selectTab`) to handle tab interactions and updates reactive to the store.

### Key Entities
- **LayoutSplitDirection**: Split direction type (`'horizontal' | 'vertical'`).
- **PanelState**: State tracking object for each grid cell:
  ```typescript
  interface PanelState {
      visible: boolean;
      zone: DockZone;
      row: number;
      column: number;
  }
  ```
- **ShellSplitterHandleComponent** (`app-shell-splitter-handle`): Component serving as resizable separator drag handle between panes.
- **DockZonePanelComponent** (`app-dock-zone-panel`): Embedded component displaying the tabs within each individual dock zone.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: Split operations display adjacent panels responsively with zero lag.
- **SC-002**: Closing a split panel correctly migrates 100% of its contained tabs to the target active panel without errors.
- **SC-003**: Split buttons dynamically hide and show based on grid capacity limits in 100% of cases.
- **SC-004**: Persistent drag-and-drop registration with `DragDropService` is maintained for all dynamically toggled panels.
