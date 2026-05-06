# Implementation Plan: Secondary Panel Mock Modules (Weather + Market)

**Branch**: `003-add-secondary-panel-mocks` | **Date**: 2026-05-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-secondary-panel-mocks/spec.md`

## Summary

Deliver two free-content mock entries in the shell secondary panel (Weather and
Market), rendered dynamically with Angular component composition, while preserving
Shell v1 layout behavior when the panel is collapsed/expanded. The implementation
extends existing shell content registration patterns (`ShellManager` + NgRx
`shellContent` slice), adds deterministic active-entry rules (default Weather,
fallback to other valid entry), and defines controlled empty-state behavior when
no valid entry exists.

## Technical Context

| Attribute | Value |
|-----------|-------|
| **Language/Version** | TypeScript 5.7, Angular 19 |
| **Primary Dependencies** | `@angular/core`, `@angular/common`, `@ngrx/store`, existing `ShellManager`/shell-content state |
| **Storage** | In-memory shell state only (no new persistence introduced) |
| **Testing** | Jasmine + Karma (`npm test`, `npm run test:shell`) |
| **Target Platform** | Electron desktop renderer (Angular shell) |
| **Project Type** | Desktop shell application |
| **Performance Goals** | Preserve current shell interaction responsiveness; no regression in collapse/expand responsiveness |
| **Constraints** | Respect shell region boundaries, keep composition dynamic, fake data only, no external APIs |
| **Scale/Scope** | 2 secondary-panel mock components, secondary registration path, active-selection + fallback rules, empty-state behavior |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Principle | Status | Notes |
|------|-----------|--------|-------|
| C1 | I. Official Stack and Layer Boundaries | PASS | Uses existing Angular + NgRx shell architecture; no boundary violations required. |
| C2 | II. Shell-First UX Contract | PASS | Enhances existing SecondaryPanel region without adding/removing shell regions. |
| C3 | III. State, Commands, and Events Discipline | PASS | Active entry and panel content routing remain in centralized shell state and shell orchestration. |
| C4 | IV. Security and Least Privilege | PASS | Renderer-only fake content; no IPC/Electron privilege expansion. |
| C5 | V. Quality Gates and Traceability | PASS | Spec clarifications are complete and mapped to plan artifacts and testable behavior. |

**Post-design re-check (Phase 1)**: PASS. Data model and contracts maintain clean boundaries and do not introduce constitutional conflicts.

Quality gate enforcement note: tasks for this feature include explicit automated
coverage for shell-content reducer/selectors, ShellManager secondary registration,
secondary panel component behavior, layout integration behavior, and smoke validation.

## Project Structure

### Documentation (this feature)

```text
specs/003-secondary-panel-mocks/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ISecondaryPanelEntry.ts
│   ├── index.ts
│   └── mock-secondary-panel.contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/app/
├── shell/
│   ├── shell-manager.service.ts                         # extend with secondary panel registration API
│   ├── contracts/                                       # add/extend secondary-panel registration contract(s)
│   ├── components/
│   │   └── secondary-panel/
│   │       ├── secondary-panel.component.ts             # wire active secondary entry + empty state
│   │       └── secondary-panel.component.html           # render ngComponentOutlet for active entry
│   ├── mock-ui/
│   │   └── components/
│   │       └── mock-secondary-panel/                    # weather + market fake modules
│   └── mock-ui/mock-content.initializer.ts              # register secondary entries
└── core/state/shell-content/
    ├── shell-content.actions.ts                         # secondary entry actions + active selection
    ├── shell-content.reducer.ts                         # deterministic default/fallback behavior
    └── shell-content.selectors.ts                       # selectors for active secondary entry/component
```

**Structure Decision**: Single Angular/Electron shell project. Reuse existing shell-content and ShellManager composition patterns for secondary panel instead of introducing a parallel state subsystem.

## Phase 0: Research (Complete)

Research outcomes are documented in [research.md](research.md), covering:

1. Reuse of shell-content state for secondary panel entries instead of creating a separate slice.
2. Active-entry rules for first open, fallback, and empty-state behavior.
3. Dynamic rendering strategy in `SecondaryPanelComponent` using `NgComponentOutlet`.
4. Registration and fake-data isolation strategy for weather/market mocks.

## Phase 1: Design & Contracts (Complete)

Artifacts produced:

1. [data-model.md](data-model.md) with secondary-entry entities, state transitions, and validation rules.
2. [contracts/ISecondaryPanelEntry.ts](contracts/ISecondaryPanelEntry.ts) and [contracts/mock-secondary-panel.contract.md](contracts/mock-secondary-panel.contract.md).
3. [quickstart.md](quickstart.md) with implementation/validation flow for local execution.

## Requirement Coverage Map

| Requirement | Design Element |
|-------------|----------------|
| FR-001 | Secondary registration capability through ShellManager + shell-content extension |
| FR-002 | Exactly two mock entries (Weather, Market) with fake data fixtures |
| FR-003 | Distinct selectable entries in secondary panel tab/header area |
| FR-004 | Active entry rendered via dynamic composition in SecondaryPanel content zone |
| FR-005 | Session-level switching between Weather and Market without route changes |
| FR-006 | Layout redistributes space when secondary panel collapses |
| FR-007 | Layout restores coherently on re-expand |
| FR-008 | Active entry remains valid through collapse/expand cycles |
| FR-009 | Invalid/missing active entry falls back to other valid entry, else visible empty state |
| FR-010 | First open default active entry is Weather when both entries are available |

## Complexity Tracking

No constitutional violations or special complexity exemptions are required for this feature.
