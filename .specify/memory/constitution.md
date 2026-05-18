<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- III. State, Commands, and Events Discipline -> III. Single Reactive Paradigm (NgRx)
Added sections:
- Reactive Architecture Contract (new constraint under Additional Constraints)
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/memory/constitution.md
- ⚠ .specify/templates/*.md remain generic by design and do not encode project-specific rules
Deferred items:
- None
-->

# UI Frame Constitution

## Core Principles

### I. Official Stack and Layer Boundaries
UI Frame MUST remain an Electron desktop shell built with Angular in the presentation layer.
Clean Architecture boundaries MUST be preserved: presentation depends on application,
application depends on domain abstractions, and infrastructure implements ports.
Presentation code MUST NOT call Electron, Node.js, local storage, or operating-system APIs
directly. All operating-system capabilities MUST cross a port and adapter boundary.

### II. Shell-First UX Contract
Shell v1 MUST deliver a professional desktop shell composed of Sidebar, Toolbar,
TabBar, ContentArea, BottomPanel, and StatusBar mounted from a single AppShell root.
The native OS title bar (Electron default frame) provides window controls; no custom
TopBar component is required. The root shell MUST replace placeholder starter content
before any new MVP work proceeds. Layout regions MUST be responsive desktop-first,
keyboard reachable, and persist enough workspace state to restore the shell safely
after restart.

### III. Single Reactive Paradigm (NgRx)
NgRx (Actions, Reducers, Selectors, Effects) is the ONLY reactive system for
application state, cross-component communication, and system events. Angular Outputs
are the ONLY mechanism for parent-child component communication. CommandRegistry is
the ONLY mechanism for imperative orchestration.

No secondary pub/sub bus, event emitter, or message-passing abstraction MAY be
introduced to duplicate, wrap, or mirror NgRx Actions or Angular Outputs.

Specifically:
- State changes MUST flow through NgRx Actions → Reducers → Selectors.
- Component-to-component communication across shell regions MUST use NgRx Selectors.
- Parent-child communication MUST use Angular @Output() EventEmitter.
- Imperative orchestration MUST use CommandRegistry.
- Command execution telemetry (auditing, tracing) MUST use NgRx Actions or a
  dedicated telemetry stream, NOT a generic EventBus.
- Events that represent transient cross-cutting concerns (e.g., command execution
  audit logs) MUST be modeled as NgRx Actions with dedicated Effects, not as
  pub/sub events on a separate bus.

Rationale: Multiple overlapping reactive paradigms create "event spaghetti,"
implicit coupling, non-deterministic behavior, and debugging complexity. A single
source of truth for reactivity ensures traceability, testability, and architectural
simplicity.

### IV. Security and Least Privilege
Electron integration MUST follow least privilege. Browser windows MUST run with
contextIsolation=true, nodeIntegration=false, and sandbox=true. The preload bridge MUST expose
only explicitly approved capabilities. IPC messages MUST be validated at both the sender and
handler boundary. External URL opening MUST use an explicit allowlist and deny everything else.

### V. Quality Gates and Traceability
Every Shell v1 change MUST trace from constitution to specification to plan to tasks to tests.
Each requirement MUST have measurable acceptance criteria and at least one planned execution
path. Core services, state slices, IPC adapters, and shell smoke behavior MUST be covered by
automated tests before the MVP is declared done. Blocking architectural or security gaps MUST be
resolved before adjacent feature expansion.

## Additional Constraints

- The official stack for this project is Electron + Angular + Clean Architecture + SOLID.
- Shell v1 scope MUST remain limited to the desktop shell MVP; domain features outside the shell
  are out of scope until Shell v1 reaches Definition of Done.
- Heavy UI frameworks for core shell composition MUST NOT be introduced.
- Workspace preferences MUST be versioned, isolated per workspace, and recover safely from
  corrupt persisted data.
- Docking for Shell v1 MUST stay within fixed MVP zones rather than evolving into arbitrary
  floating or nested layouts.

### Reactive Architecture Contract

- **What belongs to NgRx**: All persistent state (layout, workspace, session, UI context,
  preferences), all system events that affect state, and all cross-component communication
  between shell regions.
- **What belongs to Commands**: Imperative orchestration triggered by menus, keyboard
  shortcuts, or IPC. Commands dispatch NgRx Actions; they do NOT emit pub/sub events.
- **What belongs to Angular Outputs**: Parent-child component communication only. Outputs
  signal user interactions; the parent decides whether to dispatch Actions or handle locally.
- **What is a true domain event**: An event that represents a meaningful business or system
  occurrence that multiple independent consumers need to observe WITHOUT modifying shared
  state. These MUST be modeled as NgRx Actions with Effects, not as pub/sub events.
- **When NOT to introduce an EventBus**: Never. If a use case appears to need a pub/sub bus,
  it should be modeled as: (a) an NgRx Action + Effect for state-affecting events, (b) an
  Angular Output for parent-child communication, or (c) a dedicated telemetry/logging service
  for cross-cutting audit concerns.

## Delivery Workflow

- Canonical precedence is: constitution > spec > plan > tasks.
- Any artifact that conflicts with a higher-precedence artifact MUST be corrected before
  implementation continues.
- Material architectural decisions and deviations MUST be documented in an ADR or equivalent
  design note before merge.
- Reviews MUST verify boundary compliance, security posture, acceptance criteria, and test
  coverage, not only visual output.
- A feature is not ready for `/speckit.implement` until its spec is unambiguous, its plan is
  aligned to this constitution, and its tasks provide full requirement coverage.

## Language and Code Conventions

### Code Language (Mandatory)
- ALL source code, variable names, function names, class names, method names, comments in code,
  and internal identifiers MUST use English.
- NO mixing of languages in code (e.g., variable named "panelInferior" is forbidden; use "bottomPanel").

### User-Facing Text (Allowed in Spanish)
- Menu labels, button text, alerts, error messages, success notifications, and any text visible
  to the end user MAY use Spanish (or the target language of the application).
- This includes: menu item labels, dialog titles, toast messages, validation errors.

### ID and Key Conventions
- Menu IDs and configuration keys MUST use English (e.g., "view.bottomPanel", NOT "vista.bottomPanel").
- Configuration overrides and slot identifiers MUST follow the same rule.

### Examples

| Allowed (Spanish) | Forbidden | Correct (English) |
|-------------------|-----------|-------------------|
| Menu label "Panel inferior" | variable "panelInferior" | variable "bottomPanel" |
| Alert "Error al guardar" | function "guardarDatos()" | function "saveData()" |
| Button "Cerrar" | id "vista.devtools" | id "view.devtools" |

## Governance

This constitution is the canonical source of truth for UI Frame delivery. It supersedes legacy
documents, informal conventions, and lower-precedence planning artifacts. Amendments MUST include
an explicit rationale, a semantic version decision, and a sync impact note for downstream
artifacts. Compliance MUST be checked during specification, planning, task generation, and code
review. Exceptions are temporary by default and MUST identify an owner, a sunset condition, and a
follow-up correction path.

**Version**: 1.1.0 | **Ratified**: 2026-04-26 | **Last Amended**: 2026-05-18
