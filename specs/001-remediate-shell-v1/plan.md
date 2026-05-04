# Implementation Plan: Shell v1 Remediation Alignment

**Branch**: `001-remediate-shell-v1` | **Date**: 2026-04-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-remediate-shell-v1/spec.md`
**Delivery Status**: All phases complete — Gate G4 passed 2026-05-03

## Summary

This plan closes the Shell v1 remediation path defined in the active specification by replacing the
Angular starter root with a real AppShell, completing the missing shell regions, formalizing
workspace state and persistence, hardening Electron preload and IPC boundaries, and restoring full
traceability from constitution to tests. The execution strategy is intentionally staged: first fix
governance and runtime blockers, then establish stable shell contracts and state, then mount the UI
shell, then deliver interaction depth, and finally lock the MVP with quality gates.

## Technical Context

**Language/Version**: TypeScript with Angular application code and Electron main/preload processes  
**Primary Dependencies**: Angular, Electron, RxJS, Jasmine/Karma test stack already present in the repository  
**Storage**: Local persistent preferences per workspace using a versioned local envelope plus validated IPC bridging where required  
**Testing**: Angular unit tests, integration-style shell tests, and Electron smoke validation for startup and bridge behavior  
**Target Platform**: Desktop app on Windows, macOS, and Linux with Shell v1 validated first on the standard development environment  
**Project Type**: Desktop application  
**Performance Goals**: Panel toggle under 100 ms, tab switch under 120 ms, resize above 30 FPS, shell visible under 2 seconds  
**Constraints**: Constitution precedence is mandatory, presentation cannot call Electron directly, no heavy UI libraries for shell core, Shell v1 scope only  
**Scale/Scope**: Single-window Shell v1 MVP with three docking zones, centralized commands, typed events, workspace persistence, and traceable automated tests

## Constitution Check

*GATE: Must pass before implementation tasks are generated. Re-check after each delivery phase.*

| Gate | Rule | Initial Status | Enforcement |
|------|------|----------------|-------------|
| CG-01 | Canonical precedence remains `constitution > spec > plan > tasks` | PASS | Any conflict found in later artifacts blocks progression to the next phase |
| CG-02 | Presentation reaches Electron and OS only through ports and adapters | PASS | Reject any task or implementation step that wires UI directly to `window`, `ipcRenderer`, or Electron APIs |
| CG-03 | Shell root replaces placeholder content before adjacent MVP expansion | PASS | No shell interaction phase may begin until AppShell is mounted as root |
| CG-04 | Global state is limited to transversal shell concerns | PASS | State design must separate transversal store slices from purely local component interaction |
| CG-05 | Least privilege applies to preload, IPC, and external URL opening | PASS | Missing validation or insecure BrowserWindow flags are release blockers |
| CG-06 | Every requirement must trace to a planned execution path and tests | PASS | `/speckit.tasks` must preserve full FR/NFR coverage or planning must be revised |

## Project Structure

### Documentation (this feature)

```text
specs/001-remediate-shell-v1/
├── spec.md
├── plan.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── electron/
│   ├── main.ts
│   └── preload.ts
└── app/
    ├── app.component.ts
    ├── app.component.html
    ├── app.component.css
    ├── core/
    │   ├── application/
    │   │   └── ports/
    │   ├── infrastructure/
    │   │   ├── electron/
    │   │   │   └── adapters/
    │   │   └── persistence/
    │   │       └── local-storage/
    │   ├── models/
    │   └── services/
    ├── shell/
    │   ├── shell.component.css
    │   ├── shell.component.ts                # to be created
    │   ├── shell.component.html              # to be created
    │   └── components/                       # to be created
    └── themes/

specs/
└── 001-remediate-shell-v1/
```

**Structure Decision**: Keep the existing single Angular/Electron project and extend it in place.
No new top-level application packages are introduced. Shell-specific UI moves under `src/app/shell/`,
cross-cutting contracts remain under `src/app/core/`, and Electron runtime concerns remain under
`src/electron/`. The currently missing `core/state/` and shell component folders are added as part
of this remediation rather than as a separate architectural rewrite.

## Phase Plan

### Phase 0 - Governance and Runtime Baseline

**Objective**: Remove artifact ambiguity and fix the runtime blockers that currently prevent Shell v1
from being a real executable surface.

**Scope**:

- Validate the canonical constitution and active spec as the only governing sources for Shell v1.
- Eliminate the Angular starter root as the conceptual entry point for future work.
- Close the preload/main IPC mismatch for preferences and align exposed bridge capabilities with
  actual handlers.
- Confirm secure BrowserWindow defaults and strict external URL policy remain intact.

**Primary Streams**:

- TS-01 Governance Alignment
- TS-02 Root Shell Mount
- TS-12 IPC and Preload Security
- TS-15 Startup Reliability

**Deliverables**:

- Canonical constitution free of placeholders and conflicting duplicate content.
- App bootstrap strategy centered on AppShell instead of placeholder starter markup.
- Validated IPC handler map for every preload-exposed preferences operation.
- Baseline startup path that completes without blocking renderer, preload, or main-process errors.

**Exit Gate G0**: ✅ Passed

- `FR-Governance`, `FR-AppShell`, `FR-Security`, and `NFR-Reliability-01` all have concrete
  implementation intent and no unresolved blockers.
- Startup path is testable end to end.
- No missing preference handler remains exposed through preload.

### Phase 1 - Shell Contracts and Global State Foundation

**Objective**: Establish the transversal contracts that the shell UI depends on before building the
interactive regions.

**Scope**:

- Add the shell state model for layout, workspace, session, preferences, and UI context.
- Normalize `workspaceId` generation and preference envelope validation rules.
- Formalize typed event envelopes and central command registration semantics.
- Preserve platform detection through ports and adapters only.

**Primary Streams**:

- TS-04 Layout and Tokens
- TS-07 Commands Unification
- TS-08 Event Bus Hardening
- TS-09 Preferences and Workspace Persistence
- TS-10 Platform Port Alignment

**Deliverables**:

- State slice design for transversal shell concerns with local-state boundaries documented.
- Workspace identity contract using the closed decision from the spec.
- Event catalog with typed/versioned names and isolated listener behavior.
- Command descriptor model with single-source command execution across menu, toolbar, and shortcuts.

**Dependencies**:

- Depends on G0.
- Must complete before shell interaction work that needs tabs, docking, or persistence semantics.

**Exit Gate G1**: ✅ Passed

- `FR-EventBus`, `FR-Commands`, `FR-Preferences`, `FR-Platform`, and the state-related parts of
  `DoD-03` and `DoD-05` have explicit design coverage.
- No global state slice contains component-local-only behavior.
- Workspace identity, preferences versioning, and event typing are stable enough for tasking.

### Phase 2 - Structural AppShell Delivery

**Objective**: Mount the real shell and render all mandated structural regions in a stable desktop
layout.

**Scope**:

- Replace the Angular starter markup in the root component with AppShell mounting.
- Create `shell.component.ts`, `shell.component.html`, and the Shell v1 region components.
- Implement the desktop-first layout grid and token-driven sizing behavior.
- Ensure keyboard reachability and baseline ARIA coverage are baked into the structural regions.

**Primary Streams**:

- TS-02 Root Shell Mount
- TS-03 Shell Regions
- TS-04 Layout and Tokens
- TS-11 Accessibility Baseline

**Deliverables**:

- Real AppShell root.
- Sidebar, Toolbar, TabBar, ContentArea, BottomPanel, and StatusBar region scaffolding (native OS title bar provides window controls; no custom TopBar component).
- Responsive desktop-first layout with preserved integrity at supported desktop sizes.
- Baseline focus management and ARIA roles for interactive shell chrome.

**Dependencies**:

- Depends on G1.
- Interaction-heavy tab/docking work cannot begin before this phase is stable.

**Exit Gate G2**: ✅ Passed

- `AC-AppShell-01`, `AC-TabBar-01`, `AC-Sidebar-01`, `AC-Toolbar-01`, `AC-ContentArea-01`,
  `AC-BottomPanel-01`, and `AC-StatusBar-01` are structurally satisfiable.
- No Angular starter content remains visible.
- Layout remains stable under supported resize conditions.

### Phase 3 - Interactive Shell Behavior

**Objective**: Deliver the operational shell behaviors that make Shell v1 usable as a workspace UI.

**Scope**:

- Implement tab groups, reorder, dirty state, and guarded close behavior.
- Implement fixed-zone docking for primary, bottom, and secondary right-side zones.
- Persist and restore supported layout and serializable tab session state per workspace.
- Wire layout controls through centralized commands and event flows.

**Primary Streams**:

- TS-05 Tabs Lifecycle
- TS-06 Docking MVP
- TS-07 Commands Unification
- TS-09 Preferences and Workspace Persistence
- TS-14 Performance Budget

**Deliverables**:

- Multi-group tab model with `beforeClose()` lifecycle and timeout protection.
- Docking behavior limited to the three approved MVP zones.
- Workspace session persistence and restoration of valid serializable tab descriptors.
- Centralized command reuse for shell toggles and tab-related actions.

**Dependencies**:

- Depends on G2.
- Performance tuning work may begin here but cannot close until Phase 4 validation.

**Exit Gate G3**: ✅ Passed

- `FR-Tabs`, `FR-Docking`, `FR-Commands`, and `FR-Preferences` are all executable without
  violating out-of-scope rules.
- All blocking decisions closed in the spec are visibly reflected in the implementation strategy.
- No docking behavior exceeds the fixed-zone MVP boundary.

### Phase 4 - Hardening, Quality, and Traceability Closure

**Objective**: Prove that the delivered shell meets its reliability, accessibility, security,
performance, and traceability obligations.

**Scope**:

- Validate startup, tab lifecycle, docking, commands, event bus, and preferences through the
  required test layers.
- Enforce performance budgets and startup visibility thresholds.
- Confirm security posture for preload, IPC validation, BrowserWindow settings, and external URL
  allowlist behavior.
- Prepare the requirement-to-task closure needed for `/speckit.tasks`.

**Primary Streams**:

- TS-11 Accessibility Baseline
- TS-12 IPC and Preload Security
- TS-13 Test Coverage
- TS-14 Performance Budget
- TS-15 Startup Reliability

**Deliverables**:

- Unit coverage over core services and global state at or above the target threshold.
- Integration coverage for shell state, command routing, and persistence flows.
- Electron smoke checks for launch, secure bridge behavior, and workspace restoration.
- Final traceability review confirming every FR/NFR maps to executable tasking.

**Dependencies**:

- Depends on G3.
- This is the release gate for Shell v1 remediation.

**Exit Gate G4**: ✅ Passed — 2026-05-03

- `DoD-01` through `DoD-06` are satisfied.
- `SC-001` through `SC-006` are measurable and test-ready.
- The feature is ready for `/speckit.tasks` with no blocking ambiguity.

## Dependency Graph

### Phase Dependencies

1. Phase 0 -> Phase 1: runtime and governance blockers must be closed before shell contracts are frozen.
2. Phase 1 -> Phase 2: shell state, command, event, and preference contracts must exist before UI assembly.
3. Phase 2 -> Phase 3: AppShell and shell regions must exist before tabs, docking, and persistence behaviors are layered on top.
4. Phase 3 -> Phase 4: hardening and test closure validate the implemented behavior, not placeholders.

### Cross-Stream Dependencies

1. TS-02 depends on TS-01 because the shell root cannot be mounted against an invalid governing artifact set.
2. TS-03 depends on TS-04 for stable token and layout contracts.
3. TS-05 depends on TS-09 for persistence semantics and on TS-07 for reusable tab actions.
4. TS-06 depends on TS-04 for zone layout constraints and on TS-09 for workspace restoration.
5. TS-12 depends on TS-15 because startup validation must include secure bridge behavior.
6. TS-13 depends on all prior streams because coverage is the proving layer, not the design layer.

## Quality Gates

### Gate Matrix

| Gate | Trigger | Pass Condition | Status |
|------|---------|----------------|--------|
| G0 | End of Phase 0 | Canonical governance is clean, AppShell is the target root, preload handlers match exposed preference calls, startup path has no known blockers | ✅ Passed |
| G1 | End of Phase 1 | State boundaries, workspace identity, command contract, event contract, and preference envelope are stable | ✅ Passed |
| G2 | End of Phase 2 | Structural shell renders as the real root and preserves layout integrity and baseline keyboard access | ✅ Passed |
| G3 | End of Phase 3 | Tabs, docking, commands, and persistence behave within the closed MVP scope | ✅ Passed |
| G4 | End of Phase 4 | DoD and success criteria are test-backed and the feature is ready for task generation | ✅ Passed 2026-05-03 |

### Continuous Quality Controls

- Any direct presentation-to-Electron dependency is a stop-ship defect.
- Any preload API without a validated main-process counterpart is a stop-ship defect.
- Any task proposal that introduces floating panels, arbitrary split trees, or extra MVP scope must
  be rejected as out of plan.
- Any requirement without at least one planned task stream must be resolved before `/speckit.tasks`.

## Requirement Coverage Strategy

| Requirement Group | Planned Coverage |
|-------------------|------------------|
| Governance and precedence | Phase 0 plus G0 validation |
| AppShell, shell regions, layout | Phase 2 plus G2 validation |
| Tabs, docking, commands, preferences | Phase 3 plus G3 validation |
| Platform, event bus, global state | Phase 1 with follow-through in Phases 2-4 |
| Accessibility, security, reliability, performance, testing | Phase 4 with continuous controls from earlier phases |

## Risks and Mitigations

1. **Root replacement stalls behind incremental UI patching**: mitigate by treating AppShell mount as a hard prerequisite in Phase 0 and G0.
2. **State solution drifts from the constitution again**: mitigate by freezing transversal slice boundaries in Phase 1 before UI assembly.
3. **Docking complexity expands beyond MVP**: mitigate by enforcing the fixed-zone scope in G3 and rejecting arbitrary panel movement patterns.
4. **IPC security regresses while adding preferences support**: mitigate by binding every exposed capability to sender and receiver validation in Phase 0 and Phase 4.
5. **Testing arrives too late**: mitigate by planning coverage as a first-class stream in Phase 4 with explicit dependency on every functional stream.

## Complexity Tracking

No constitution violations are required for this plan. The remediation stays within the existing
single-project Angular/Electron structure and preserves the Shell v1 MVP scope.