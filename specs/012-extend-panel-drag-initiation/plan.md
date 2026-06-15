# Implementation Plan: Extend Panel Drag Initiation

**Branch**: `012-extend-panel-drag-initiation` | **Date**: 2026-05-21 | **Updated**: 2026-06-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-extend-panel-drag-initiation/spec.md`

## Summary

Extend drag-and-drop initiation from the original central tab bar model to every shell dock zone that renders tabs. The implementation uses the current generic `DockZonePanelComponent`, existing pointer-event drag lifecycle in `DragDropService`, and NgRx workspace state keyed by `DockZone`. Cross-zone moves dispatch `moveTabToZone`; same-zone reorders dispatch `reorderTab`. The remaining feature work is to connect those runtime NgRx updates to workspace-session persistence so moved and reordered restorable tabs survive shell reload.

## Technical Context

**Language/Version**: TypeScript 5.7.x, Angular 19.x
**Primary Dependencies**: Angular pointer events, NgRx 19.x, RxJS, existing DragDropService, WorkspaceSessionService
**Storage**: Existing workspace session persistence, versioned and scoped by workspace ID
**Testing**: Jasmine/Karma unit and integration tests with Angular TestBed
**Target Platform**: Windows/macOS/Linux desktop via Electron  
**Project Type**: Desktop application (Electron + Angular shell)  
**Performance Goals**: Drag feedback within 50ms, drop processing within 100ms, persistence restore without degrading shell startup
**Constraints**: Must not introduce circular DI; must use pointer events rather than HTML5 Drag API; all persistent tab membership/order changes must flow through NgRx; must preserve existing central-region drag behavior
**Scale/Scope**: Generic dock-zone tab component, drag-drop service, workspace NgRx state, workspace session persistence, tests and docs

## Constitution Check

*GATE: Must pass before implementation updates. Re-check after persistence tasks.*

- **Principle I (Official Stack and Layer Boundaries)**: PASS - Changes remain in Angular presentation, NgRx state, and existing persistence service boundaries. No direct Electron/Node APIs are introduced by presentation components.
- **Principle II (Shell-First UX Contract)**: PASS - Feature extends existing shell layout regions and keeps dock zones responsive and keyboard reachable.
- **Principle III (Single Reactive Paradigm)**: PASS - Runtime state changes flow through NgRx Actions, Reducers, and Selectors. No new event bus is introduced.
- **Principle IV (Security and Least Privilege)**: PASS - Drag-and-drop and persistence use existing local workspace-session mechanisms; no new IPC or privilege surface is added.
- **Principle V (Quality Gates and Traceability)**: PASS WITH FOLLOW-UP - Requirements now trace to current implementation, but persistence tests must be added/updated before this feature is done.

## Project Structure

### Documentation (this feature)

```text
specs/012-extend-panel-drag-initiation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/app/
├── core/
│   ├── models/
│   │   ├── dock-zone-assignment.model.ts     # Current DockZone enum and bottom/primary groupings
│   │   ├── tab-descriptor.model.ts           # Serializable restorable tab metadata
│   │   └── workspace-session.model.ts        # Persisted workspace session snapshot
│   ├── services/
│   │   └── workspace-session.service.ts      # Versioned save/restore boundary
│   └── state/
│       └── workspace/
│           ├── workspace.actions.ts          # moveTabToZone, reorderTab, restore/open actions
│           ├── workspace.reducer.ts          # tabsByZone and activeTabIdsByZone updates
│           └── workspace.selectors.ts        # Runtime tab-state selectors
└── shell/
    ├── components/
    │   └── dock-zone-panel/
    │       ├── dock-zone-panel.component.ts  # Generic tab pointerdown initiation
    │       └── dock-zone-panel.component.html
    ├── services/
    │   └── drag-drop.service.ts              # Drag lifecycle, compatibility, move/reorder dispatch
    └── shell.component.ts                    # Drop-zone registration and session restore wiring
```

**Structure Decision**: Use the current generic dock-zone architecture. Do not reintroduce separate bottom/secondary tab state or zone-specific reorder actions. Persist and restore the runtime NgRx workspace model through the existing workspace-session boundary.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
