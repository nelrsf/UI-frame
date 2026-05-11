# Tasks: Native Menu Customization

**Input**: Design documents from `specs/005-native-menu-customization/`
**Prerequisites**: plan.md ✓ | spec.md ✓ | research.md ✓ | data-model.md ✓ | contracts/ ✓ | quickstart.md ✓

**Organization**: Tasks grouped by user story. Each phase is independently testable.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend the IPC channel registry and add the `AppTheme` model that all subsequent phases depend on.

- [ ] T001 Add `MENU` channel group to `src/electron/ipc/channels.ts` with constants `TOGGLE_BOTTOM_PANEL`, `TOGGLE_SECONDARY_PANEL`, `THEME_CHANGED`
- [ ] T002 [P] Create `src/app/core/models/theme.model.ts` with `AppTheme` type, `DEFAULT_THEME` constant and `THEME_PREFERENCE_KEY` constant (mirrors `specs/005-native-menu-customization/contracts/IThemePreference.ts`)
- [ ] T003 [P] Create `src/app/core/application/ports/theme.port.ts` exposing `IThemeAdapter` interface for future renderer theme engine

**Checkpoint**: IPC channels declared, `AppTheme` and `IThemeAdapter` available — no compilation errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the `MenuBuilder` class and wire menu construction into `main.ts`. All user stories depend on this working menu infrastructure.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Create folder `src/electron/menu/` and add `src/electron/menu/menu.defaults.ts` with the default Spanish entries map keyed by slot ID as defined in `data-model.md` (slot map section)
- [ ] T005 Create `src/electron/menu/menu.builder.ts` implementing `MenuBuilder` class with constructor `(config?: IMenuConfig)` and method `build(ctx: IMenuBuildContext): Menu` — applies overrides, injects `isDev` gate for devtools entry, sets `enabled: false` on `temas.claro`; does NOT call `Menu.setApplicationMenu()` (caller is responsible; see D1)
- [ ] T006 [P] Create `src/electron/menu/index.ts` re-exporting `MenuBuilder` and config types
- [ ] T007 Extend `src/electron/main.ts`: read `shell.theme` from `preferences.json` before `createWindow()`, set `nativeTheme.themeSource`, call `MenuBuilder.build()` and `Menu.setApplicationMenu()` at startup (I2 compliance: single owner of theme restoration)
- [ ] T008 Create `src/electron/ipc/handlers/menu.handlers.ts` registering the `ipcMain` handler for `MENU.THEME_CHANGED` direction (main writes pref to disk when theme changes via menu click callbacks wired in `MenuBuilder`; does not duplicate theme restoration — only handles async IPC side effects)

**Checkpoint**: App launches, menu bar shows "Archivo / Vista / Temas" in Spanish, devtools hidden in production, "Claro" is greyed out, theme preference is read from disk on startup.

---

## Phase 3: User Story 1 — Menu simple y utilizable en español (Priority: P1) 🎯 MVP

**Goal**: Native menu shows only the approved entries, all labelled in Spanish, with no legacy options.

**Independent Test**: Launch the app, open each menu and verify: only Archivo→Salir, Vista→(DevTools in dev / Panel inferior / Panel secundario), Temas→(Oscuro selected / Claro disabled). No other entries present.

### Implementation for User Story 1

- [ ] T009 [US1] Wire `app.quit()` as the `click` handler for slot `archivo.salir` in `menu.defaults.ts`
- [ ] T010 [US1] Wire panel toggle callbacks in `menu.defaults.ts` for `vista.bottomPanel` and `vista.secondaryPanel`: each dispatches a command through the central shell command registry (e.g., `shellCommandRegistry.execute('shell.panel.toggleBottom')`) rather than direct IPC send (C1 compliance: commands through registry, not direct dispatch)
- [ ] T011 [US1] Add `onCommandExecuted` listener to the `menu` namespace in `src/electron/preload.ts` using `ipcRenderer.on` with typed callbacks for listening to async command completion; expose via `contextBridge`
- [ ] T012 [US1] Extend `ElectronAPI` interface in `src/electron/preload.ts` with the `menu` namespace matching the contract shape in `quickstart.md` step 8
- [ ] T013 [US1] Register toggle panel commands (`shell.panel.toggleBottom`, `shell.panel.toggleSecondary`) in the shell command registry; their handlers dispatch NgRx layout actions

**Checkpoint**: US1 fully verifiable — menu shows only Spanish-labelled approved entries, Salir quits, panel toggles via command registry change panel visibility.

### Tests for User Story 1 (MANDATORY MVP GATE per C2 compliance)

- [ ] T025 [US1] Integration test for panel toggle commands: trigger command, confirm NgRx action dispatched and panel visibility changes in `src/app/shell/shell.component.spec.ts`

**MVP Release Gate**: T008 (unit test MenuBuilder) and T025 (integration test panel toggles) MUST pass before moving to Phase 4. Per constitution V (Quality Gates), no MVP release without automated test coverage.

---

## Phase 4: User Story 2 — Menu alineado con el tema activo (Priority: P2)

**Goal**: Selecting "Oscuro" from the menu updates `nativeTheme`, persists the preference, and notifies the renderer; menu is rebuilt with the correct radio-checked state.

**Independent Test**: Change theme via menu, confirm: native menu bar colour shifts, preference persists after app restart, renderer receives `onThemeChanged` callback, NgRx `preferences.data['shell.theme']` reflects new value.

### Implementation for User Story 2

- [ ] T014 [US2] Add theme `click` handlers inside `MenuBuilder.build()` for `temas.oscuro` (and stub for `temas.claro`): on click, set `nativeTheme.themeSource`, write `shell.theme` preference to disk via the existing `writeEnvelope` helper, rebuild and re-apply the menu via `Menu.setApplicationMenu()`, call `mainWindow.webContents.send(MENU.THEME_CHANGED, { theme })`
- [ ] T015 [P] [US2] Add `selectActiveTheme` selector to `src/app/core/state/preferences/preferences.selectors.ts` reading `preferences.data[THEME_PREFERENCE_KEY]` with fallback to `DEFAULT_THEME`
- [ ] T016 [US2] Subscribe to `window.electronAPI.menu.onThemeChanged` in `src/app/shell/shell.component.ts` and dispatch `setPreference({ key: THEME_PREFERENCE_KEY, value: theme })`
- [ ] T017 [US2] On `menu.handlers.ts` startup path, ensure the stored theme is applied via `nativeTheme.themeSource` before the first window frame (verify existing T007 covers this, otherwise add explicit call here)

**Checkpoint**: US2 fully verifiable — dark menu reflects theme, pref survives restart, renderer store updated on change.

### Performance Validation for User Story 2 (SC-002 compliance)

- [ ] T027 [US2] Instrument theme change latency: add performance markers in `MenuBuilder.build()` and measure elapsed time from click to visual update in native menu bar; confirm 95%+ of changes complete in < 1 second (test in `menu.builder.spec.ts`)

---

## Phase 5: User Story 3 — Personalizar menú sin tocar el núcleo (Priority: P3)

**Goal**: A developer can supply an `IMenuConfig` override to change labels, visibility, and callbacks without modifying core menu files.

**Independent Test**: Create a test config in `src/electron/main.ts` that renames "Salir" to "Exit" and adds an "Ayuda" submenu; verify both changes appear and the default behaviour of all other entries is unchanged.

### Implementation for User Story 3

- [ ] T018 [US3] Validate `MenuBuilder` enforces that `archivo.salir` cannot be hidden (silently ignores `visible: false` override for that slot); add guard in `menu.builder.ts`
- [ ] T019 [P] [US3] Ensure `extraEntries` from `IMenuConfig` are appended as top-level entries after built-in defaults in `MenuBuilder.build()`; verify ordering
- [ ] T020 [US3] Write `specs/005-native-menu-customization/quickstart.md` validation: create `src/electron/menu/menu.builder.spec.ts` (Jasmine) covering: default entries present, override label applied, `archivo.salir` hidden-override ignored, `extraEntries` appended, `temas.claro` always disabled

**Checkpoint**: US3 fully verifiable — `MenuBuilder` accepts config, applies overrides, blocks mandatory-entry removal, appends extra entries.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation inline with code, quick start validation, cleanup.

- [ ] T021 [P] Add JSDoc on `MenuBuilder` class and `build()` method referencing `quickstart.md` steps 3–6
- [ ] T022 [P] Add inline `// Future: enable when light theme spec ships` comment on the `temas.claro` disabled guard in `menu.builder.ts`
- [ ] T023 Run `npm test` and confirm the new `menu.builder.spec.ts` suite passes with no regressions in existing shell, preferences, and preload suites
- [ ] T024 Run the Electron smoke script (`node scripts/electron-smoke.mjs`) and confirm `[smoke] shell:visible` is emitted with the new menu wired

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1. Blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2. MVP deliverable.
- **Phase 4 (US2)**: Depends on Phase 2. Can start in parallel with Phase 3 once Phase 2 is done.
- **Phase 5 (US3)**: Depends on Phase 2. Can start in parallel with Phase 3 and 4.
- **Phase 6 (Polish)**: Depends on Phases 3, 4, 5.

### User Story Dependencies

- **US1 (P1)**: No dependency on US2 or US3.
- **US2 (P2)**: No dependency on US1 or US3; shares `MenuBuilder` from Phase 2.
- **US3 (P3)**: No dependency on US1 or US2; extends `MenuBuilder` behavior only.

### Within Each Phase

- `[P]` tasks within a phase may run in parallel.
- Non-`[P]` tasks within a phase run sequentially in listed order.

---

## Parallel Opportunities

```bash
# Phase 1 — run T002 and T003 in parallel with T001 (different files):
T001: src/electron/ipc/channels.ts
T002: src/app/core/models/theme.model.ts           [P]
T003: src/app/core/application/ports/theme.port.ts [P]

# Phase 2 — T004 and T005 sequential, then T006 and T008 in parallel:
T004 → T005 → T006 [P] + T008 [P] → T007

# Phase 4 — T015 can run in parallel with T014:
T014: menu.builder.ts theme click handlers
T015: preferences.selectors.ts selectActiveTheme [P]

# Phase 5 — T019 can run in parallel with T018:
T018: menu.builder.ts guard
T019: extraEntries append logic [P]

# Phase 6 — T021 and T022 can run in parallel:
T021: JSDoc [P]
T022: inline comment [P]
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (T001–T003).
2. Complete Phase 2 (T004–T008).
3. Complete Phase 3 (T009–T013).
4. **CRITICAL GATE** (C2 compliance): Add unit tests for MenuBuilder and integration tests for panel toggle commands. Run `npm test` and confirm no regressions. This gate is MANDATORY per constitution before MVP release.
5. **STOP and VALIDATE**: open app, confirm Spanish menu, panel toggles via command registry, Salir.
6. Ship / demo.

### Incremental Delivery

- **MVP**: Phase 1 + 2 + 3 → Spanish menu, panel toggles, Salir.
- **+Theme**: Phase 4 → dark theme persists, menu reacts.
- **+Customization**: Phase 5 → developer override API.
- **+Polish**: Phase 6 → docs, tests, smoke.

---

## Task Summary

| Phase | Tasks | User Story | [P] count |
|-------|-------|-----------|-----------|
| 1 Setup | T001–T003 | — | 2 |
| 2 Foundational | T004–T008 | — | 1 |
| 3 US1 Menu entries | T009–T013 | US1 | 0 |
| 3b US1 Tests (MVP Gate) | T025 | US1 | 0 |
| 4 US2 Theme | T014–T017 | US2 | 2 |
| 4a US2 Perf (SC-002) | T026 | US2 | 0 |
| 5 US3 Customization | T018–T020 | US3 | 1 |
| 6 Polish | T021–T024 | — | 2 |
| **Total** | **26** | | **8** |

**Suggested MVP scope**: Phases 1–3+3b (T001–T013+T025), 14 tasks (includes mandatory test gate).
