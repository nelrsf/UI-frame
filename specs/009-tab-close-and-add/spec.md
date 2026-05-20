# Feature Specification: Tab Close and Add

**Feature Branch**: `009-tab-close-and-add`  
**Created**: 2026-05-19  
**Status**: Draft  
**Input**: User description: "Dar funcionalidad para cerrar una tab del workspace central dando click en el boton x cuando la tab tiene closable = true. Antes de cerrar debe exponer un callback 'beforeCloseTab' el cual debe retornar un booleano, true si desea cancelar el cierre de la tab. Dar funcionalidad al boton + del tabbar (boton que esta al final de todas la tabs). Al hacer click en el boton debe aparecer un cuadro modal con todas las tabs que fueron registradas, deben aparecer con su icono y con su label"

## Clarifications

### Session 2026-05-19

- Q: Should a new `beforeCloseTab` callback be created? → A: No. Use the existing `TabCloseGuard` interface with its `beforeClose()` method. The work is to wire up the existing close logic, not create new callbacks.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Close a Tab with Existing Guard (Priority: P1)

A user clicks the close (x) button on a tab in the central workspace tab bar. The existing `TabCloseGuard` mechanism (with its `beforeClose()` method) is consulted for dirty tabs. If the guard returns `true`, the tab closes. If it returns `false`, the close is cancelled and the tab remains open. Non-dirty tabs close immediately without consulting a guard. The close button is only visible when the tab's `closable` property is `true`.

**Why this priority**: This is the core tab management functionality. Without it, users cannot close tabs, which blocks basic workspace navigation and workflow.

**Independent Test**: Can be fully tested by registering a tab with `closable: true`, marking it dirty, registering a `TabCloseGuard` with `beforeClose()` that returns `false`, clicking the close button, and verifying the tab remains open. Then testing with a guard that returns `true` and verifying the tab closes.

**Acceptance Scenarios**:

1. **Given** a tab with `closable: true` that is not dirty, **When** the user clicks the close (x) button, **Then** the tab is closed and removed from the tab bar
2. **Given** a dirty tab with `closable: true` and no `TabCloseGuard` registered, **When** the user clicks the close (x) button, **Then** the tab is closed and removed from the tab bar
3. **Given** a dirty tab with `closable: true` and a `TabCloseGuard` whose `beforeClose()` returns `true`, **When** the user clicks the close (x) button, **Then** the tab is closed and removed from the tab bar
4. **Given** a dirty tab with `closable: true` and a `TabCloseGuard` whose `beforeClose()` returns `false`, **When** the user clicks the close (x) button, **Then** the close operation is cancelled and the tab remains open
5. **Given** a dirty tab with `closable: true` and a `TabCloseGuard` whose `beforeClose()` returns a Promise resolving to `true`, **When** the user clicks the close (x) button, **Then** the tab is closed after the promise resolves
6. **Given** a dirty tab with `closable: true` and a `TabCloseGuard` whose `beforeClose()` returns a Promise resolving to `false`, **When** the user clicks the close (x) button, **Then** the close operation is cancelled after the promise resolves and the tab remains open
7. **Given** a tab with `closable: false`, **When** the tab is displayed, **Then** the close (x) button is not visible

---

### User Story 2 - Add a New Tab via Modal Picker (Priority: P2)

A user clicks the "+" button at the end of the tab bar. A modal dialog appears showing all registered tabs that are not currently open in the workspace, each displayed with its icon and label. The user selects a tab from the list, and the selected tab opens in the workspace. The modal closes after selection.

**Why this priority**: This provides the primary mechanism for users to open new tabs. Without it, the "+" button has no function, limiting workspace customization.

**Independent Test**: Can be fully tested by clicking the "+" button, verifying a modal appears with a list of registered tabs showing icons and labels, selecting a tab, and verifying it opens in the workspace.

**Acceptance Scenarios**:

1. **Given** registered tabs exist that are not currently open, **When** the user clicks the "+" button, **Then** a modal appears listing all unopened tabs with their icons and labels
2. **Given** the modal is open, **When** the user clicks on a tab in the list, **Then** the selected tab opens in the workspace and the modal closes
3. **Given** all registered tabs are already open, **When** the user clicks the "+" button, **Then** a modal appears indicating no additional tabs are available to open
4. **Given** the modal is open, **When** the user clicks outside the modal or presses Escape, **Then** the modal closes without opening any tab
5. **Given** a registered tab has no icon defined, **When** the modal displays that tab, **Then** the tab appears with only its label (no icon shown)

---

### Edge Cases

- What happens when the `TabCloseGuard.beforeClose()` callback throws an error? The close operation should be cancelled and the tab remains open, with the error logged to the console.
- How does the system handle a `TabCloseGuard.beforeClose()` callback that takes longer than 10 seconds to resolve? The close button should be disabled during the wait, and after 10 seconds the operation should be cancelled with a timeout warning.
- What happens when the user rapidly clicks the close button while a `TabCloseGuard` is still resolving? Subsequent clicks should be ignored until the guard resolves.
- What happens if a tab component is unregistered while its `TabCloseGuard` callback is pending? The pending operation should be cancelled safely.
- How does the modal behave if a new tab is registered while the modal is open? The modal should reflect the current set of registered tabs (either update dynamically or snapshot at open time -- snapshot is acceptable).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST connect the tab bar's `tabClosed` output to the workspace store's `closeTab` action so that closing a tab actually removes it from the workspace
- **FR-002**: The system MUST pass the `closeGuards` input to the tab bar component, mapping each tab ID to its registered `TabCloseGuard`
- **FR-003**: The existing `TabCloseGuard.beforeClose()` callback MUST be invoked for dirty tabs before the close proceeds
- **FR-004**: The system MUST cancel the tab close operation when `TabCloseGuard.beforeClose()` returns or resolves to `false`
- **FR-005**: The system MUST proceed with closing the tab when `TabCloseGuard.beforeClose()` returns or resolves to `true`, or when no guard is registered for a dirty tab
- **FR-006**: Non-dirty tabs MUST close immediately without consulting any guard
- **FR-007**: The close (x) button MUST only be rendered for tabs where `closable` is `true` and the tab is not pinned
- **FR-008**: The close button MUST be disabled while a `TabCloseGuard` is pending resolution
- **FR-009**: The system MUST display a modal dialog when the user clicks the "+" button in the tab bar
- **FR-010**: The modal MUST display all registered tabs that are not currently open in the active tab group, each with its icon (if defined) and label
- **FR-011**: Selecting a tab from the modal MUST open that tab in the workspace and close the modal
- **FR-012**: The modal MUST be dismissible by clicking outside the modal content area or pressing the Escape key, without opening any tab
- **FR-013**: The system MUST handle errors thrown by `TabCloseGuard.beforeClose()` callbacks by cancelling the close and logging the error
- **FR-014**: The system MUST enforce a 10-second timeout on asynchronous `TabCloseGuard` callbacks, cancelling the close if exceeded

### Key Entities

- **TabItem**: Represents a tab in the workspace with properties including `id`, `label`, `icon`, `closable`, `dirty`, `pinned`, and `groupId`
- **TabCloseGuard**: An existing interface defining a `beforeClose()` method that returns `boolean | Promise<boolean>`, used to intercept tab close operations for dirty tabs
- **ICentralRegionTab**: The public contract for registering tabs, including `id`, `label`, `component`, `icon`, and `closable` properties
- **RegisteredTabEntry**: A display entity used in the modal picker, combining a tab's `id`, `label`, `icon`, and open/closed status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can close a non-dirty tab in a single click with no perceptible delay
- **SC-002**: The `TabCloseGuard.beforeClose()` callback correctly prevents tab closure 100% of the time when returning `false`
- **SC-003**: The tab addition modal appears within 200ms of clicking the "+" button
- **SC-004**: Users can successfully open a new tab from the modal in under 2 seconds (from click to tab rendered)
- **SC-005**: 95% of users can successfully close a tab and open a new tab on their first attempt without errors

## Assumptions

- The existing `TabCloseGuard` interface and `beforeClose()` method are sufficient for the close-guard requirement; no new callback interface is needed
- The modal will use Angular's existing component rendering infrastructure (no new UI library required)
- Tab registration is managed through the existing `ShellManager.addTab()` flow
- The workspace uses a single active tab group ("main") for the central region
- Registered tabs that are already open in the current tab group are excluded from the modal list
- The feature does not need to support tab closing from keyboard shortcuts in this iteration
- Icons are rendered as emoji or text strings, consistent with the existing tab bar implementation
