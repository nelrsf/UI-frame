# Implementation Plan: Refactor Native Menu Integration

**Branch**: `006-refactor-native-menu` | **Date**: 2026-05-17 | **Spec**: `spec.md`
**Input**: Feature specification from `/specs/006-refactor-native-menu/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Refactorizar la integracion del menu nativo de Electron para aplicar SRP al bootstrap (main.ts) y OCP para la personalizacion del menu. Extraer responsabilidades de main.ts en modulos dedicados: PreferenceStore, ThemeInitializer, MenuInitializer, ShellHandlers, LifecycleSignals. Establecer menu.config.ts como punto de extension estable para integradores.

## Technical Context

**Language/Version**: TypeScript 5.7.3, Node.js 20.x (via @types/node 20.19.39)  
**Primary Dependencies**: Electron 41.3.0, Angular 19.2.21, NgRx 19.2.1  
**Storage**: JSON file-based preferences (preferences.json in app.getPath('userData'))  
**Testing**: Karma + Jasmine (karma 6.4.0, jasmine-core 5.1.0)  
**Target Platform**: Desktop (Windows, Mac, Linux via Electron)  
**Project Type**: Desktop application shell (Electron + Angular)  
**Performance Goals**: N/A - refactoring task, no performance changes expected  
**Constraints**: Maintain security settings (contextIsolation, nodeIntegration, sandbox); backward compatibility for existing menu customization; preserve existing IPC channels  
**Scale/Scope**: Refactoring existing main.ts (241 lines), menu module, and IPC handlers. No new features.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Official Stack and Layer Boundaries | ✅ PASS | Electron + Angular + Clean Architecture maintained; refactoring preserves boundaries |
| II. Shell-First UX Contract | ✅ PASS | No changes to shell components; menu refactoring is internal to main process |
| III. State, Commands, and Events Discipline | ✅ PASS | Commands registered through existing IPC channels; events use typed channels |
| IV. Security and Least Privilege | ✅ PASS | All security settings preserved: contextIsolation=true, nodeIntegration=false, sandbox=true, allowlist for external URLs |
| V. Quality Gates and Traceability | ✅ PASS | Traceability: spec→plan→tasks; tests will be updated to cover separation |

**GATE RESULT**: All gates pass. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/006-refactor-native-menu/
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
├── electron/
│   ├── main.ts                    # Bootstrap/composition root (TO BE REFACTORED)
│   ├── preload.ts                # Preload bridge
│   ├── ipc/
│   │   ├── channels.ts           # IPC channel constants
│   │   └── handlers/
│   │       ├── window.handlers.ts
│   │       ├── preferences.handlers.ts
│   │       └── menu.handlers.ts   # (placeholder, to be implemented)
│   └── menu/
│       ├── menu.builder.ts        # Core stable menu builder
│       ├── menu.manager.ts        # Menu update manager
│       ├── menu.config.ts         # Extension point for customization
│       ├── menu.initializer.ts    # Menu setup orchestration
│       ├── menu.defaults.ts      # Default Spanish menu entries
│       └── index.ts
├── contracts/
│   ├── menu.ts                    # IMenuConfig, IMenuBuildContext
│   ├── theme.ts                   # AppTheme, THEME_PREFERENCE_KEY
│   └── index.ts
└── app/
    ├── core/
    │   ├── models/
    │   ├── state/
    │   ├── application/ports/
    │   └── infrastructure/persistence/
    └── shell/

tests/                              # Existing test structure
├── *.spec.ts                       # Unit tests
```

**Structure Decision**: Single Electron + Angular project. Refactoring extracts responsibilities from main.ts into modular services/handlers following Clean Architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations requiring justification. This is a refactoring task that simplifies the architecture by extracting responsibilities from main.ts into focused modules.
