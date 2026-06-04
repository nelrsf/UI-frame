# Feature Specification: shell-split-panels

**Feature Branch**: `[013-shell-split-panels]`  
**Created**: 2026-05-29  
**Status**: Draft  
**Input**: User description: "Implementar la funcionalidad de split en los componentes del shell.

```
Dos componentes del shell podran hacer split central regiontabs y el bottomPanel.

Modelado de la feature:

Actualmente cada region tiene una estrucutura en el shell como

                    |             Toolbar                  |
                    |--------------------------------------|                 |
Sidebar             |            Central region tabs       |    Secondary    |
                    |            (dock-zone-panel.         |       Panel     |
                    |            component)                |                 |
                    | -------------------------------------------------------|
                    |                      Botom panel                       |
                    |         dock-zone-panel.component                      |


Cada dock zone de la region es un dock-zone-panel component, debe crearse un nuevo componente wrapper lógico que se llamará layout-splittable-panel component cuyo modelo será el siguiente:


export class LayoutSplittablePanelComponent {
            @Input() direction: Horizontal | Vertical
            @Input() zones: Array<DockZone>
            @Input() visible: boolean
}
```

## Clarifications

### Session 2026-05-30
- Q: Should `DockZonePanelComponent` be modified directly to support split layout behavior? → A: No; `layout-splittable-panel` should contain `DockZonePanelComponent` instances and manage split direction, subregions, and maxSubRegions behavior.

Casos de uso:

Cada splittable region tiene un botón de split; el ícono varía si la dirección es horizontal o vertical.
Inicialmente cada layout-splittable-panel solo renderiza un DockZonePanel; al hacer click en el botón de split el layout se divide en uno con todas las tabs y otro vacío, pero como tiene la naturaleza de un dockzone ya se puede arrastrar tabs hacia cualquier región.

Si el usuario vuelve a splitar la región y ya se igualó el maxregions, el botón de split debe deshabilitarse.

Cada splittable shell debe emitir un modelo y actualizarlo en el Store De NgRx existente

export class LayoutSplittableRegionModel{
    direction: Horizontal | Vertical
    regions: Array<{tabsIds: Array<string>}>
}

Cada layout-splittable-panel debe renderizarse de manera cíclica:

Dock-zone-panel
Separator
Dock-zone-panel
Separator
...y así




## User Scenarios & Testing *(mandatory)*

### User Story 1 - Split Central Region Tabs (Priority: P1)
User can split the central region tabs component into two resizable panes to organize workspace tabs side by side.

**Why this priority**: Enables better tab organization and multitasking by allowing users to view multiple tab groups simultaneously.

**Independent Test**: Can be fully tested by clicking the split button in the central region and verifying that it creates two panes where tabs can be dragged between them.

**Acceptance Scenarios**:
1. **Given** the shell interface with central region tabs containing multiple tabs, **When** user clicks the split button in the central region, **Then** the region splits into two vertical panes with all tabs in the left pane and an empty right pane ready to accept dragged tabs.
2. **Given** a split central region with tabs in the left pane, **When** user drags a tab from the left pane to the right pane, **Then** the tab moves to the right pane and can be interacted with normally.

### User Story 2 - Split Bottom Panel (Priority: P1)
User can split the bottom panel component into two resizable panes to organize panel content vertically.

**Why this priority**: Enables better vertical organization of panel content, allowing users to view multiple panel sections simultaneously.

**Independent Test**: Can be fully tested by clicking the split button in the bottom panel and verifying that it creates two panes where panel content can be arranged vertically.

**Acceptance Scenarios**:
1. **Given** the shell interface with a bottom panel containing components, **When** user clicks the split button in the bottom panel, **Then** the panel splits into two horizontal panes with the original content in the top pane and an empty bottom pane ready to accept dragged components.
2. **Given** a split bottom panel with components in the top pane, **When** user drags a component from the top pane to the bottom pane, **Then** the component moves to the bottom pane and can be interacted with normally.

### User Story 3 - Split Limit Enforcement (Priority: P2)
Split button disables when a region reaches its maximum allowed subregions to prevent exceeding layout constraints.

**Why this priority**: Prevents layout instability and ensures predictable behavior when users attempt to split beyond system limits.

**Independent Test**: Can be fully tested by repeatedly splitting a region until the split button becomes disabled, then verifying no further splits are possible.

**Acceptance Scenarios**:
1. **Given** a splittable region configured with maxSubRegions of 2, **When** user splits the region twice, **Then** the split button becomes disabled.
2. **Given** a splittable region with the split button disabled due to reaching maxSubRegions, **When** user attempts to click the split button, **Then** no action occurs and the button remains disabled.

### Edge Cases
- What happens when a user tries to split a region that's already at maximum subregions?
- How does the system handle dragging tabs between newly created split panes and existing dock zones?
- What occurs when the NgRx store fails to save or retrieve layout state?
- How are split configurations restored when the application restarts?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide a split button in both central region tabs and bottom panel components.
- **FR-002**: System MUST allow users to split the central region tabs into two vertical panes with tab dragging capability between panes.
- **FR-003**: System MUST allow users to split the bottom panel into two horizontal panes with component dragging capability between panes.
- **FR-004**: System MUST visually indicate split direction (horizontal/vertical) through the split button icon.
- **FR-005**: System MUST disable the split button when a region reaches its configured maxSubRegions limit.
- **FR-006**: System MUST emit LayoutSplittableRegionModel updates to the NgRx store when split operations occur.
- **FR-007**: `layout-splittable-panel` MUST render splittable regions in a cyclic pattern: `DockZonePanelComponent`, separator, `DockZonePanelComponent`, separator...
- **FR-008**: System MUST maintain dock zone functionality in all split panes for accepting dragged tabs/components.

### Key Entities *(include if feature involves data)*
- **LayoutSplittableRegionModel**: Represents the state of a splittable region containing direction and array of regions with their tab IDs.
- **DockZonePanelComponent**: Base dock zone component that remains unchanged; it is instantiated by `layout-splittable-panel` to represent each dock zone pane within a split layout.
- **layout-splittable-panel**: Wrapper component that manages the split layout, renders the cyclic panel-separator pattern, and handles split button logic.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: Users can successfully split and resize both central region tabs and bottom panel components in under 5 seconds.
- **SC-002**: 90% of users can drag and drop tabs between split panes and existing dock zones without errors.
- **SC-003**: Split button correctly disables when maxSubRegions limit is reached in 100% of test cases.
- **SC-004**: Split configurations persist and restore correctly through NgRx store in 95% of application sessions.

## Assumptions
- The maximum subregions per splittable region is configurable via the maxSubRegions input parameter on `layout-splittable-panel`.
- Split direction (horizontal/vertical) is determined by the specific usage context of each splittable region.
- Existing drag-and-drop infrastructure in the shell supports new split panes without requiring modifications.
- NgRx store already implements necessary actions and reducers for managing layout state.
- Separator components between panes provide visual indication and are draggable for resizing adjacent panes.