# Feature Specification: Shell v1 Remediation Alignment

**Feature Branch**: `001-remediate-shell-v1`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: User description: "Integral remediation specification to align project with constitution, spec, plan, and tasks for Shell v1"

## Context

UI Frame already contains partial core and Electron infrastructure, but the runtime shell remains
incomplete and inconsistent with the governing artifacts. The current codebase still ships the
Angular starter template at the application root, only exposes shell CSS without a mounted shell
component tree, invokes preference IPC calls from preload without matching handlers in the main
process, and declares centralized state expectations in planning artifacts without an implemented
state solution. This specification defines the single remediation path required to align the
repository with the canonical constitution, preserve the Shell v1 MVP scope, and remove the
blocking ambiguities detected in prior analysis.

## Scope

### In Scope

- Consolidate one canonical constitution in `.specify/memory/constitution.md` with no placeholders.
- Replace the Angular starter root with a real AppShell entry point.
- Deliver the Shell v1 structural regions and the state, command, event, preference, IPC, and
  security behaviors required to operate them consistently.
- Close the currently known architectural, IPC, state-management, UI, and testing gaps.
- Establish complete requirement traceability so the next `/speckit.plan` and `/speckit.tasks`
  output can be generated without reinterpreting the MVP.

### Out of Scope

- New product features outside Shell v1, including business workflows, authentication, plugins,
  command palette, multi-window management, and advanced workspace collaboration.
- Arbitrary floating panels, nested split trees, panel tear-off windows, or unrestricted docking.
- Full persistence of transient editor state beyond the MVP tab restoration rules defined here.
- Refactoring unrelated core utilities that do not block Shell v1 acceptance criteria.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Launch a Real Shell (Priority: P1)

As a product engineer, I can launch the desktop app and see a complete Shell v1 layout instead of
the Angular starter page, so the repository exposes the actual MVP surface described by the
project artifacts.

**Why this priority**: The project cannot validate any shell requirement, acceptance criterion, or
runtime quality gate while the root component still renders placeholder content.

**Independent Test**: Start the application and confirm that the root view renders AppShell with
TopBar, Sidebar, Toolbar, TabBar, ContentArea, BottomPanel, and StatusBar, and that no Angular
starter markup remains visible.

**Acceptance Scenarios**:

1. **Given** a clean app launch, **When** the first window becomes visible, **Then** the user sees
   the Shell v1 layout root and not the Angular starter template.
2. **Given** the shell is visible, **When** the window is resized within the supported desktop
   range, **Then** all shell regions preserve layout integrity without overlapping or disappearing.
3. **Given** the shell is visible, **When** the user navigates with keyboard only, **Then** each
   interactive shell region exposes visible focus and a reachable interaction path.

---

### User Story 2 - Restore a Safe Workspace Session (Priority: P2)

As a workspace user, I can reopen the app and recover my last valid shell layout, active tabs, and
preferences for the active workspace without corrupt state or broken IPC behavior.

**Why this priority**: The MVP promises a professional desktop shell, which requires reliable
workspace persistence and recovery before adding more interaction depth.

**Independent Test**: Change sidebar and panel dimensions, activate tabs across supported zones,
restart the app, and verify that only restorable workspace state returns while invalid or corrupt
data falls back safely to defaults.

**Acceptance Scenarios**:

1. **Given** a workspace with persisted layout preferences, **When** the app restarts, **Then** the
   shell restores the last valid sidebar, bottom-panel, and secondary-panel visibility and size.
2. **Given** stored workspace preferences are corrupt or schema-incompatible, **When** the app
   starts, **Then** the shell loads safe defaults and emits a recoverable trace entry instead of
   crashing.
3. **Given** preload requests a preferences operation, **When** the main process handles the IPC,
   **Then** the request is validated and returns a deterministic success or failure result.

---

### User Story 3 - Maintain a Traceable Shell Core (Priority: P3)

As a maintainer, I can evolve shell commands, events, state, and IPC behavior through one
consistent architecture with measurable tests and clear acceptance criteria.

**Why this priority**: The current mismatch between constitution, spec, plan, tasks, and code
creates rework risk. Traceable architecture is required to keep Shell v1 executable rather than
aspirational.

**Independent Test**: Review the generated plan and tasks from this specification, then run unit,
integration, and Electron smoke checks to confirm every requirement maps to an executable workstream.

**Acceptance Scenarios**:

1. **Given** a command is registered once in the central registry, **When** it is triggered from a
   menu, toolbar action, or shortcut, **Then** the same handler executes and emits a traceable
   command event.
2. **Given** a listener throws during event handling, **When** a typed event is published,
   **Then** other listeners still execute and the failure is recorded without breaking the shell.
3. **Given** a requirement in this specification, **When** the follow-up task list is generated,
   **Then** at least one task stream exists for implementing and verifying it.

---

### Closed Decisions

#### Workspace Identity

- The canonical `workspaceId` source of truth is the normalized absolute workspace root path when a
  workspace root is known.
- Normalization MUST: resolve symlinks when available, trim trailing separators, use forward
  slashes internally, and lowercase the drive letter on Windows.
- The canonical identifier algorithm is `ws-` plus the first 16 hexadecimal characters of the
  SHA-256 hash of the normalized workspace root string.
- If no workspace root exists yet, Shell v1 MUST use the sentinel root `app://default-workspace`
  and therefore the stable fallback identifier `ws-default` until a real root is supplied.

#### Docking Scope for MVP

- Docking v1 includes exactly three fixed zones: primary workspace, bottom panel, and secondary
  right-side panel.
- Users MUST be able to show or hide supported zones, resize bottom and secondary zones within
  configured limits, and move a whole tab group between the supported zones.
- Docking v1 explicitly excludes floating panels, arbitrary split trees, detached windows,
  free-form drag targets, and nested dock hierarchies.

#### Dirty Tab Close Experience

- If a tab is not dirty, closing it MUST be immediate.
- If a tab is dirty, the shell MUST call the hosted view's `beforeClose()` guard and wait for a
  synchronous or asynchronous result.
- The hosted view owns the decision UX when user input is required. The shell owns the close
  request lifecycle, disables duplicate close attempts during resolution, and keeps the tab open on
  any `false`, rejection, or timeout result.
- Asynchronous guards MUST resolve within 10 seconds. On timeout, the close action MUST be canceled
  and the user MUST receive non-blocking feedback that the tab remained open.

#### Cross-Platform Shortcut Strategy

- Command definitions MUST use a canonical `Mod` token for the primary modifier.
- `Mod` maps to `Ctrl` on Windows and Linux and to `Cmd` on macOS.
- Platform-specific overrides are allowed only when a shortcut would otherwise conflict with an
  operating-system convention or break parity with expected desktop behavior.
- Shortcut labels MUST render per-platform while preserving a single command identifier.

#### Tab Persistence Scope

- Shell v1 MUST persist and restore only restorable tabs whose view identifier and input payload
  are serializable.
- The persisted tab snapshot MUST include zone, group order, active tab per zone, pinned state,
  and the minimum view input needed to reopen the tab.
- Dirty state, transient in-memory editor state, modal state, and non-restorable tabs MUST NOT be
  silently recreated after restart.
- Tabs omitted during restoration MUST be logged in development traces so maintainers can diagnose
  lost session entries without exposing broken UI to the user.

### Edge Cases

- Corrupt or stale preferences data MUST fall back to safe defaults without blocking startup.
- Missing IPC handlers for any exposed preload capability MUST be treated as a release blocker.
- Layout resizing MUST clamp values to configured minimum and maximum bounds even when persisted
  values exceed valid limits.
- Event listeners that throw MUST not prevent later listeners from receiving the same event.
- Invalid or non-allowlisted external URLs MUST be denied and leave the shell responsive.
- A dirty tab whose `beforeClose()` promise never resolves MUST remain open and surface a recoverable
  timeout notification within 10 seconds.
- If a persisted tab payload cannot be restored, the shell MUST skip that tab and preserve the
  rest of the workspace session.
- Keyboard-only users MUST still be able to reach layout toggles when any optional zone is hidden.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-Governance**: The repository MUST maintain exactly one canonical constitution at
  `.specify/memory/constitution.md`, free of placeholders, with explicit MUST/SHOULD language and
  the precedence order `constitution > spec > plan > tasks`.
- **FR-AppShell**: The Angular starter root MUST be replaced with a mounted AppShell entry point so
  the first visible UI is the real Shell v1 layout.
- **FR-ShellComponents**: The shell MUST implement TopBar, Sidebar, Toolbar, TabBar, ContentArea,
  BottomPanel, and StatusBar as explicit regions with clear responsibilities.
- **FR-Layout**: The AppShell MUST use a desktop-first root grid, token-driven dimensions, and
  deterministic responsive behavior for supported desktop widths.
- **FR-Tabs**: The shell MUST support multi-group tabs with selection, reorder, close, dirty state,
  and `beforeClose()` handling for synchronous and asynchronous guards.
- **FR-Docking**: The shell MUST support docking within the primary workspace, bottom panel, and
  secondary right-side panel, including persistence of supported zone assignments per workspace.
- **FR-Commands**: Commands MUST be registered and executed centrally and remain reusable from menu,
  toolbar, and keyboard shortcuts without duplicate command logic.
- **FR-EventBus**: The shell MUST publish typed and versioned events, isolate listener errors, and
  provide development traceability for critical shell events.
- **FR-Preferences**: Workspace preferences MUST be persisted in a versioned envelope, validated on
  read, and restored with a safe fallback path when invalid.
- **FR-Platform**: Platform detection MUST be provided through application ports and infrastructure
  adapters so presentation code remains decoupled from Electron.
- **FR-Accessibility**: The shell MUST provide baseline ARIA semantics, visible focus treatment,
  and keyboard navigation for all interactive shell controls.
- **FR-Security**: The preload bridge MUST expose only minimum-privilege capabilities, and all IPC
  traffic MUST be validated at the sender and receiver boundary.
- **FR-Testing**: Shell v1 MUST ship with unit, integration, and Electron smoke coverage for the
  MVP acceptance path.

### Non-Functional Requirements

- **NFR-Perf-01**: Toggling any supported shell panel MUST complete in under 100 ms measured at the
  user-perceived interaction boundary on a standard development machine.
- **NFR-Perf-02**: Switching the active tab within a populated workspace MUST complete in under
  120 ms measured at the user-perceived interaction boundary on a standard development machine.
- **NFR-Perf-03**: Continuous resize interactions for supported shell regions MUST sustain more than
  30 FPS, with 60 FPS as the target when hardware allows.
- **NFR-Perf-04**: The shell frame MUST become visible in under 2 seconds from app launch in the
  standard environment defined in assumptions.
- **NFR-Reliability-01**: The app MUST start without blocking runtime errors in renderer, preload,
  or main process paths required by Shell v1.
- **NFR-Security-01**: The main window MUST run with `contextIsolation=true`,
  `nodeIntegration=false`, and `sandbox=true`.
- **NFR-Security-02**: External URL opening MUST enforce a strict allowlist and deny all other
  targets by default.
- **NFR-Quality-01**: Automated coverage for core shell services and global shell state MUST reach
  at least 80% statement coverage.

### Acceptance Criteria

#### Component Acceptance Criteria

- **AC-AppShell-01**: App startup renders AppShell as the root view, and no Angular starter content
  remains in the DOM.
- **AC-TopBar-01**: TopBar exposes brand, menu/actions, and platform-aware window controls without
  breaking drag versus non-drag interaction zones.
- **AC-Sidebar-01**: Sidebar keeps a fixed activity bar, supports collapse/expand of the content
  panel, and persists the active item and allowed width range.
- **AC-Toolbar-01**: Toolbar reflects context actions and layout toggles from centralized shell
  state without duplicated action wiring.
- **AC-TabBar-01**: TabBar supports multi-group selection, reorder within a group, close handling,
  dirty indicators, and guarded close behavior.
- **AC-ContentArea-01**: ContentArea always displays the active tab content or a defined empty
  state and never exposes broken placeholder markup.
- **AC-BottomPanel-01**: BottomPanel can be shown, hidden, resized within bounds, and restored per
  workspace.
- **AC-StatusBar-01**: StatusBar renders operational context items and remains keyboard reachable.

#### Global Definition of Done for Shell v1

- **DoD-01**: The canonical constitution is valid, current, and referenced as the highest
  precedence artifact.
- **DoD-02**: All FR and NFR identifiers in this specification map to at least one acceptance
  criterion and one future task stream.
- **DoD-03**: Presentation code reaches Electron and OS behavior only through ports and adapters.
- **DoD-04**: Preference IPC handlers exist for every preload-exposed preference operation, and all
  requests are validated.
- **DoD-05**: Startup, tab lifecycle, docking, commands, event bus, and preferences are covered by
  the required automated test layers.
- **DoD-06**: No blocking questions remain for workspace identity, docking scope, dirty-close UX,
  shortcut strategy, or tab persistence scope.

### Key Entities *(include if feature involves data)*

- **WorkspaceSession**: The restorable shell snapshot for one workspace, including `workspaceId`,
  visible zones, active tab per zone, tab ordering, and persisted layout dimensions.
- **DockZoneAssignment**: The association between a tab group and one supported dock zone,
  including visibility state and size constraints for that zone.
- **TabDescriptor**: The serializable metadata required to identify, order, and reopen a tab,
  including `tabId`, `viewId`, `resourceKey`, `zone`, `groupId`, `pinned`, and `closable`.
- **CommandDescriptor**: The command contract consumed by menu, toolbar, and shortcuts, including
  `id`, human label, platform-rendered shortcut, context, and execution handler reference.
- **VersionedPreferenceEnvelope**: The persisted preference container with `workspaceId`, schema
  version, validated data payload, and recovery behavior on invalid content.
- **AppEventEnvelope**: The typed event record carrying event name, version, origin, timestamp,
  payload, and listener-error isolation metadata.

## Risks and Mitigations

- **Risk-R1**: The existing partial implementation may encourage patching around the Angular
  starter root instead of replacing it cleanly. **Mitigation**: treat `FR-AppShell` as a blocking
  prerequisite for all shell UI work.
- **Risk-R2**: Preload and main-process IPC can drift again if the bridge surface expands without
  symmetric handlers. **Mitigation**: bind every exposed preload capability to explicit handler and
  validation requirements under `FR-Security` and `DoD-04`.
- **Risk-R3**: Introducing global state everywhere can create architectural drag. **Mitigation**:
  restrict global state to transversal shell concerns and keep local interaction state local.
- **Risk-R4**: Docking and tab persistence can expand beyond the MVP and destabilize delivery.
  **Mitigation**: lock docking to three fixed zones and tab restoration to serializable descriptors.
- **Risk-R5**: Performance targets may be missed during resize and tab transitions. **Mitigation**:
  treat the stated performance NFRs as release gates, not optimization backlog items.

## Traceability Matrix

| Requirement | Acceptance Criteria | Future Task Stream |
|-------------|---------------------|--------------------|
| FR-Governance | DoD-01, DoD-02 | TS-01 Governance Alignment |
| FR-AppShell | AC-AppShell-01, DoD-01 | TS-02 Root Shell Mount |
| FR-ShellComponents | AC-TopBar-01, AC-Sidebar-01, AC-Toolbar-01, AC-TabBar-01, AC-ContentArea-01, AC-BottomPanel-01, AC-StatusBar-01 | TS-03 Shell Regions |
| FR-Layout | AC-AppShell-01, AC-Sidebar-01, AC-BottomPanel-01 | TS-04 Layout and Tokens |
| FR-Tabs | AC-TabBar-01, DoD-06 | TS-05 Tabs Lifecycle |
| FR-Docking | AC-BottomPanel-01, DoD-06 | TS-06 Docking MVP |
| FR-Commands | AC-Toolbar-01, User Story 3 Scenario 1 | TS-07 Commands Unification |
| FR-EventBus | User Story 3 Scenario 2, DoD-05 | TS-08 Event Bus Hardening |
| FR-Preferences | User Story 2 Scenario 1, User Story 2 Scenario 2, DoD-04 | TS-09 Preferences and Workspace Persistence |
| FR-Platform | AC-TopBar-01, DoD-03 | TS-10 Platform Port Alignment |
| FR-Accessibility | User Story 1 Scenario 3, AC-StatusBar-01 | TS-11 Accessibility Baseline |
| FR-Security | User Story 2 Scenario 3, NFR-Security-01, NFR-Security-02, DoD-04 | TS-12 IPC and Preload Security |
| FR-Testing | DoD-05 | TS-13 Test Coverage |
| NFR-Perf-01 | DoD-05 | TS-14 Performance Budget |
| NFR-Perf-02 | DoD-05 | TS-14 Performance Budget |
| NFR-Perf-03 | DoD-05 | TS-14 Performance Budget |
| NFR-Perf-04 | DoD-05 | TS-14 Performance Budget |
| NFR-Reliability-01 | DoD-05 | TS-15 Startup Reliability |
| NFR-Security-01 | DoD-04 | TS-12 IPC and Preload Security |
| NFR-Security-02 | DoD-04 | TS-12 IPC and Preload Security |
| NFR-Quality-01 | DoD-05 | TS-13 Test Coverage |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In three consecutive cold starts on the standard environment, the shell becomes
  visible in under 2 seconds with no blocking startup errors.
- **SC-002**: 100% of Shell v1 launches render the real shell root instead of Angular starter
  content.
- **SC-003**: At least 95% of measured panel toggles complete in under 100 ms and at least 95% of
  measured tab switches complete in under 120 ms during the MVP smoke run.
- **SC-004**: 100% of dirty-tab close attempts end in an explicit keep-open or close result without
  freezing the shell.
- **SC-005**: Every FR and NFR in this specification maps to at least one acceptance criterion and
  at least one future task stream before implementation begins.
- **SC-006**: Core shell services and global shell state reach at least 80% automated statement
  coverage before Shell v1 is declared complete.

## Assumptions

- The standard environment for Shell v1 validation is a desktop-class machine with at least 8 GB
  RAM, SSD storage, and one primary display.
- Shell v1 targets one main window and one active workspace context at a time.
- When a real workspace root is not yet available at startup, the shell may operate against the
  deterministic fallback workspace `ws-default` until a root is provided.
- Restorable tab views expose a serializable descriptor and can reopen from that descriptor without
  requiring hidden in-memory state.
- The follow-up `/speckit.plan` and `/speckit.tasks` output will preserve the task-stream mapping
  introduced by this specification.