# Implementation Plan: Status Bar Mock Data

**Branch**: `master` | **Date**: 2026-05-20 | **Spec**: [specs/010-status-bar-mocks/spec.md](spec.md)
**Input**: Feature specification from `/specs/010-status-bar-mocks/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add mock data support to the existing status bar component via a JSON configuration file (`status-bar-mocks.json`) and a callback registry mechanism. Developers can define status bar items with text, position, tooltip, and clickable behavior. Clickable items reference callbacks by string identifier mapped to pre-registered functions. The system provides visual error feedback when callbacks fail.

## Technical Context

**Language/Version**: TypeScript 5.7.3, Angular 19.2.21  
**Primary Dependencies**: Angular 19, NgRx 19.2.1, RxJS 7.8, Electron 41.3  
**Storage**: JSON configuration file (`status-bar-mocks.json`) loaded at startup  
**Testing**: Jasmine + Karma (`ng test`)  
**Target Platform**: Desktop (Windows, macOS, Linux) via Electron  
**Project Type**: Desktop application shell (Electron + Angular)  
**Performance Goals**: Status bar items render within 100ms of app launch; callbacks execute within 50ms of click  
**Constraints**: Must follow Clean Architecture boundaries; presentation code must not call Electron/Node APIs directly; must use NgRx for state changes; must use CommandRegistry for imperative orchestration  
**Scale/Scope**: Shell MVP feature; supports ~5-15 status bar items concurrently

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Official Stack and Layer Boundaries)**: PASS — Implementation uses Angular for presentation, follows Clean Architecture. JSON loading will occur through an infrastructure adapter, not directly in presentation code.
- **Principle II (Shell-First UX Contract)**: PASS — StatusBar is part of the Shell v1 scope per constitution. This feature enhances the existing status bar component.
- **Principle III (Single Reactive Paradigm)**: PASS — Status bar item state will flow through NgRx Actions → Reducers → Selectors. Callback execution uses CommandRegistry. No secondary EventBus will be introduced.
- **Principle IV (Security and Least Privilege)**: PASS — JSON configuration is loaded from the local filesystem; no external URL access or IPC required for mock data.
- **Principle V (Quality Gates and Traceability)**: PASS — Automated tests will be created for the mock configuration loader, callback registry, and status bar component behavior.

## Project Structure

### Documentation (this feature)

```text
specs/010-status-bar-mocks/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── core/
│   │   ├── infrastructure/
│   │   │   └── mock-config/
│   │   │       ├── mock-config.loader.ts        # Loads and parses status-bar-mocks.json
│   │   │       └── mock-config.loader.spec.ts
│   │   ├── services/
│   │   │   ├── callback-registry.service.ts      # Registry for callback functions
│   │   │   └── callback-registry.service.spec.ts
│   │   └── state/
│   │       └── status-bar/
│   │           ├── status-bar.actions.ts
│   │           ├── status-bar.reducer.ts
│   │           ├── status-bar.selectors.ts
│   │           └── index.ts
│   └── shell/
│       ├── components/
│       │   └── status-bar/
│       │       └── status-bar.component.ts       # Updated to dispatch command on click
│       └── models/
│           └── status-bar-item.model.ts          # Already exists, may need minor updates
├── assets/
│   └── config/
│       └── status-bar-mocks.json                 # Sample mock configuration file
└── electron/
    └── preload.ts                                # May need bridge for config loading (if needed)

tests/
└── unit/
    └── status-bar-mocks.spec.ts                  # Integration tests for mock system
```

**Structure Decision**: Single project layout. The feature adds an infrastructure adapter for JSON config loading, a callback registry service, NgRx state slice for status bar items, and updates the existing status bar component to wire click events to the CommandRegistry. A sample JSON configuration file is provided in `assets/config/` as the quick start reference.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | No constitution violations identified | N/A |
