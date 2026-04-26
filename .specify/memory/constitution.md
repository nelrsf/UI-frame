<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- [PRINCIPLE_1_NAME] -> I. Official Stack and Layer Boundaries
- [PRINCIPLE_2_NAME] -> II. Shell-First UX Contract
- [PRINCIPLE_3_NAME] -> III. State, Commands, and Events Discipline
- [PRINCIPLE_4_NAME] -> IV. Security and Least Privilege
- [PRINCIPLE_5_NAME] -> V. Quality Gates and Traceability
Added sections:
- Additional Constraints
- Delivery Workflow
Removed sections:
- Placeholder template sections only
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
Shell v1 MUST deliver a professional desktop shell composed of TopBar, Sidebar, Toolbar,
TabBar, ContentArea, BottomPanel, and StatusBar mounted from a single AppShell root.
The root shell MUST replace placeholder starter content before any new MVP work proceeds.
Layout regions MUST be responsive desktop-first, keyboard reachable, and persist enough
workspace state to restore the shell safely after restart.

### III. State, Commands, and Events Discipline
Global state MUST only contain transversal shell concerns such as layout, workspace,
session, UI context, and persisted preferences. Local interaction state SHOULD remain in the
owning component unless multiple shell regions depend on it. Commands MUST be registered and
executed through one central registry. Events MUST be typed, versioned, isolated from listener
failures, and traceable in development mode.

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

## Governance

This constitution is the canonical source of truth for UI Frame delivery. It supersedes legacy
documents, informal conventions, and lower-precedence planning artifacts. Amendments MUST include
an explicit rationale, a semantic version decision, and a sync impact note for downstream
artifacts. Compliance MUST be checked during specification, planning, task generation, and code
review. Exceptions are temporary by default and MUST identify an owner, a sunset condition, and a
follow-up correction path.

**Version**: 1.0.0 | **Ratified**: 2026-04-26 | **Last Amended**: 2026-04-26
