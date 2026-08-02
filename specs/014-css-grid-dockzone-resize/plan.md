# Implementation Plan: CSS Grid Dockzone Resize

**Branch**: `014-css-grid-dockzone-resize` | **Date**: 2026-08-02 | **Spec**: [spec.md](../014-css-grid-dockzone-resize/spec.md)

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Enable users to resize internal dockzones within the bottom panel and primary workspaces by dragging vertical/horizontal splitters using CSS grid methods, similar to how it currently works for the secondary panel and bottom panel.

## Technical Context

**Language/Version**: TypeScript/Angular  
**Primary Dependencies**: Angular, NgRx  
**Storage**: N/A (in-memory state)  
**Testing**: Jest, Angular Testing Library  
**Target Platform**: Electron desktop application  
**Project Type**: Desktop application  
**Performance Goals**: Smooth resize operations without visual stuttering or performance issues  
**Constraints**: Must use CSS grid methods for resizing, maintain existing splitter functionality, respect minimum size constraints (100px width/height)  
**Scale/Scope**: Internal UI components for bottom panel and primary workspaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Official Stack and Layer Boundaries**: Using Angular for presentation layer, NgRx for state management
- ✅ **Shell-First UX Contract**: Resizing internal dockzones within bottom panel and primary workspaces
- ✅ **Single Reactive Paradigm (NgRx)**: Using NgRx for state changes and component communication
- ✅ **Security and Least Privilege**: No Electron/Node.js/OS API integration for this feature
- ✅ **Quality Gates and Traceability**: Spec has measurable acceptance criteria and planned execution paths

## Project Structure

### Documentation (this feature)

```text
specs/014-css-grid-dockzone-resize/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/app/shell/components/
├── shell-splitter-handle/
├── bottom-panel/
└── primary-workspace/

src/app/shell/services/
└── layout-manager.service.ts
```

**Structure Decision**: The feature modifies existing shell components for bottom panel and primary workspaces, using CSS grid methods for resizing internal dockzones.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |