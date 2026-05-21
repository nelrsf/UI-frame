# Implementation Plan: Tab Drag-and-Drop Across Regions

**Branch**: `011-description-tab-drag` | **Date**: 2026-05-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-tab-drag-drop/spec.md`

## Summary

Implement a shell-level `DragDropService` that enables users to drag tabs from the central region tab bar and drop them onto other dock zones (bottom panel, secondary panel). The service validates that the dragged tab's component implements the target region's required interface before allowing the drop. On successful cross-region drop, the tab is unregistered from the source region and re-registered in the target region. Same-region tab reordering via drag is also supported. Visual feedback includes a drag ghost, drop zone highlighting for compatible regions, and rejection indicators for incompatible regions.

## Technical Context

**Language/Version**: TypeScript 5.7.3  
**Primary Dependencies**: Angular 19.2.21, NgRx 19.2.1, RxJS 7.8.0  
**Storage**: N/A (no persistence for drag state)  
**Testing**: Jasmine 5.1.0, Karma 6.4.0  
**Target Platform**: Electron 41.3.0 desktop application (Windows, macOS, Linux)  
**Project Type**: Desktop application (Electron + Angular shell)  
**Performance Goals**: Drag operations respond under 16ms frame delay; cross-region move completes in under 2 seconds  
**Constraints**: Uses native pointer events (not HTML5 Drag and Drop API) for consistency with existing splitter drag. Drag initiation scoped to central region tab bar only. No new pub/sub buses (Constitution Principle III).  
**Scale/Scope**: Single-shell desktop application; ~10-30 concurrent tabs typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Constitution Principle | Status | Notes |
|---|---|---|
| I. Official Stack and Layer Boundaries | PASS | Drag service lives in shell layer; state changes flow through NgRx |
| II. Shell-First UX Contract | PASS | Feature enhances shell composition (TabBar, BottomPanel, SecondaryPanel) |
| III. Single Reactive Paradigm (NgRx) | PASS | All state changes use NgRx Actions/Reducers/Selectors; no EventBus introduced |
| IV. Security and Least Privilege | PASS | No IPC or Electron APIs involved; pure UI interaction |
| V. Quality Gates and Traceability | PASS | Each FR has testable acceptance criteria; unit tests planned |
| Docking stays within fixed MVP zones | PASS | Uses existing `DockZone` enum; no floating/nested layouts |
| No heavy UI frameworks | PASS | Native pointer events + Angular; no third-party drag library |
| Language conventions (English code) | PASS | All identifiers, types, and comments in English |

## Project Structure

### Documentation (this feature)

```text
specs/011-tab-drag-drop/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/app/
├── core/
│   ├── models/
│   │   └── drag-drop.model.ts              # DraggableTab, DropZone, DragState models
│   └── state/
│       ├── workspace/
│       │   ├── workspace.actions.ts         # Add: moveTabToZone, removeTab actions
│       │   └── workspace.reducer.ts         # Add: moveTabToZone, removeTab handlers
│       └── shell-content/
│           ├── shell-content.actions.ts     # Add: removeBottomPanelEntry, removeSecondaryPanelEntry
│           └── shell-content.reducer.ts     # Add: remove handlers
├── shell/
│   ├── services/
│   │   └── drag-drop.service.ts            # Central DragDropService
│   ├── components/
│   │   ├── tab-bar/
│   │   │   ├── tab-bar.component.ts        # Add: drag initiation on pointerdown
│   │   │   └── tab-bar.component.html      # Add: drag event bindings
│   │   └── drag-ghost/
│   │       ├── drag-ghost.component.ts     # New: floating drag ghost overlay
│   │       ├── drag-ghost.component.html
│   │       └── drag-ghost.component.css
│   ├── shell-manager.service.ts            # Add: removeTab, removeBottomPanelEntry, removeSecondaryPanelEntry
│   ├── shell.component.ts                  # Add: drop zone registration, global pointer listeners
│   └── shell.component.html                # Add: drag ghost overlay, drop zone indicators
└── app/
    └── app.config.ts                       # Register DragDropService provider (if not providedIn: root)

tests/
├── unit/
│   ├── services/
│   │   └── drag-drop.service.spec.ts
│   └── components/
│       ├── tab-bar/
│       │   └── tab-bar.component.spec.ts
│       └── drag-ghost/
│           └── drag-ghost.component.spec.ts
└── integration/
    └── drag-drop.integration.spec.ts
```

**Structure Decision**: Single project layout. New files follow existing Angular + NgRx conventions. The `DragDropService` is a shell-level injectable service. New `DragGhostComponent` renders the floating drag overlay. State changes use existing workspace and shell-content reducers with new actions. The `ShellManager` gains remove methods to support the unregister-before-reregister lifecycle.

## Complexity Tracking

> No constitution violations. All design decisions align with existing architecture.

## Phase 0: Research

### Research Tasks

1. **Pointer event drag pattern**: Analyze existing splitter drag in `shell.component.ts` to extract reusable patterns for tab drag (pointer capture, rAF throttling, draft/commit state).
2. **Interface detection at runtime**: Determine the best approach to detect which region interfaces a component instance implements (`instanceof` checks vs. registration metadata map).
3. **Drag ghost rendering strategy**: Evaluate whether to use a fixed-position overlay component (Angular) vs. a dynamically created DOM element (document.body) for the drag ghost.
4. **Drop zone detection**: Determine how to detect when the pointer is over a valid drop zone (element bounding box intersection vs. CSS hover events vs. pointer position calculation).

### Research Findings

**Decision 1: Pointer event pattern** — Reuse the same pointer-event-based approach from `shell.component.ts` (pointerdown → setPointerCapture → pointermove → pointerup/pointercancel). This ensures consistency and avoids HTML5 Drag and Drop API limitations.

**Decision 2: Interface detection** — Use a registration metadata approach. When a tab is registered via `ShellManager.addTab`, the service already knows the component type. The `DragDropService` will maintain a map of `componentType -> Set<RegionInterface>` that is populated at registration time. This avoids runtime `instanceof` checks on component instances, which are unreliable with Angular's dynamic component creation.

**Decision 3: Drag ghost rendering** — Use a fixed-position overlay component (`DragGhostComponent`) rendered at the shell root level. This keeps the ghost within Angular's change detection and allows CSS styling consistent with the rest of the shell. The ghost is positioned using `position: fixed` with `pointer-events: none` so it doesn't interfere with drop zone detection.

**Decision 4: Drop zone detection** — Use element bounding box intersection via `getBoundingClientRect()`. On each `pointermove` event during drag, the `DragDropService` checks if the pointer coordinates fall within any registered drop zone's bounding box. This is the same approach used by the existing splitter drag for determining drag boundaries.

## Phase 1: Design & Contracts

### Data Model

See `data-model.md` for full entity definitions.

**Key entities**:
- `DraggableTab`: id, label, icon, componentType, implementedInterfaces (Set<RegionInterface>), sourceZone, sourceGroupId, pinned, dirty, closable
- `DragState`: active (boolean), draggedTab (DraggableTab | null), pointerX, pointerY, activeDropZone (DockZone | null), dragGhostElement (HTMLElement | null)
- `DropZoneRegistration`: zone (DockZone), elementRef (Element), requiredInterface (RegionInterface), boundingRect (DOMRect | null)

**RegionInterface enum**: `CentralRegionTab`, `BottomPanelEntry`, `SecondaryPanelEntry`

**State transitions**:
```
Idle → Dragging (on pointerdown on tab)
Dragging → Dropping (on pointerup over valid drop zone)
Dragging → Cancelled (on pointerup outside zones, Escape, or pointercancel)
Dropping → Idle (after state update complete)
Cancelled → Idle (immediate)
```

### Contracts

The feature does not expose new public APIs or IPC endpoints. The interfaces involved (`ICentralRegionTab`, `IBottomPanelEntry`, `ISecondaryPanelEntry`) already exist in `src/app/shell/contracts/`. The `DragDropService` is an internal shell service.

**New internal contract**: `ShellManager` gains three remove methods:
- `removeTab(tabId: string, groupId: string)`: Removes a tab from the central region registry and dispatches state update.
- `removeBottomPanelEntry(entryId: string)`: Removes an entry from the bottom panel registry and dispatches state update.
- `removeSecondaryPanelEntry(entryId: string)`: Removes an entry from the secondary panel registry and dispatches state update.

These require corresponding NgRx actions:
- `[Workspace] Remove Tab` — removes tab from both `tabs` and `registeredTabs` arrays
- `[ShellContent] Remove Bottom Panel Entry` — removes from `bottomPanelTabs` array
- `[ShellContent] Remove Secondary Panel Entry` — removes from `secondaryPanelEntries` array

### Quickstart

See `quickstart.md` for developer onboarding.
