# Implementation Plan: Extend Panel Drag Initiation

**Branch**: `012-extend-panel-drag-initiation` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-extend-panel-drag-initiation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Extend drag-and-drop initiation from the central region tab bar to include bottom panel and secondary panel tab bars. Users will be able to drag tabs from any panel to compatible drop zones with same-region reorder support. The implementation adds pointer event handlers to `BottomPanelComponent` and `SecondaryPanelComponent`, constructs `DraggableTab` objects with appropriate source zones, and registers reorder callbacks for same-region drag operations. Cross-region drop handling and interface validation are already implemented in the existing `DragDropService`.

## Technical Context

**Language/Version**: TypeScript 5.x, Angular 18.x  
**Primary Dependencies**: Angular CDK (pointer events), NgRx (state management), existing DragDropService  
**Storage**: N/A (in-memory state, persisted via existing workspace state management)  
**Testing**: Jasmine/Karma (unit), component tests with Angular TestBed  
**Target Platform**: Windows/macOS/Linux desktop via Electron  
**Project Type**: Desktop application (Electron + Angular shell)  
**Performance Goals**: Drag feedback within 50ms, drop processing within 100ms  
**Constraints**: Must not introduce circular DI; must use pointer events (not HTML5 Drag API); must preserve existing drag behavior for central region  
**Scale/Scope**: 2 components modified (BottomPanelComponent, SecondaryPanelComponent), 2 new NgRx actions for reorder, 1 new spec feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Official Stack and Layer Boundaries)**: PASS — Changes are scoped to Angular presentation components (BottomPanelComponent, SecondaryPanelComponent). All state changes flow through NgRx Actions. No direct Electron/Node.js API calls introduced.
- **Principle II (Shell-First UX Contract)**: PASS — Feature extends existing shell layout regions (bottom panel, secondary panel) with drag initiation. Maintains responsive, keyboard-reachable design.
- **Principle III (Single Reactive Paradigm)**: PASS — State changes use NgRx Actions (new reorder actions). Component communication uses existing DragDropService (pointer events, not pub/sub). No new event bus introduced.
- **Principle IV (Security and Least Privilege)**: PASS — No new IPC or Electron capabilities exposed. Drag-and-drop is purely within the Angular presentation layer.
- **Principle V (Quality Gates and Traceability)**: PASS — Feature has clear acceptance criteria in spec, measurable success criteria, and will have unit/component tests.

## Project Structure

### Documentation (this feature)

```text
specs/012-extend-panel-drag-initiation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/app/shell/
├── components/
│   ├── bottom-panel/
│   │   ├── bottom-panel.component.ts      # Add drag initiation handler
│   │   └── bottom-panel.component.html    # Add pointerdown binding
│   └── secondary-panel/
│       ├── secondary-panel.component.ts   # Add drag initiation handler
│       └── secondary-panel.component.html # Add pointerdown binding
├── services/
│   └── drag-drop.service.ts               # Already exists, no changes needed
├── state/
│   ├── shell-content.actions.ts           # Add reorder actions for bottom/secondary panels
│   └── shell-content.reducer.ts           # Add reorder handlers for bottom/secondary panels
└── shell.component.ts                     # Already handles crossRegionDrop$, no changes needed
```

**Structure Decision**: Single project structure. Changes are scoped to existing Angular components and NgRx state management files within the `src/app/shell/` directory. No new modules or services are created; the existing `DragDropService` is reused.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
