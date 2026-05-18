# Implementation Tasks: Light Theme Support

**Feature**: Light Theme Support  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Task Summary

- **Total Tasks**: 11
- **User Story 1 (P1)**: 4 tasks
- **User Story 2 (P2)**: 2 tasks
- **User Story 3 (P3)**: 2 tasks
- **Setup**: 1 task
- **Polish**: 1 task

## Dependencies & Execution Order

```
Setup (T001)
    ↓
Foundational (T002)
    ↓
┌──────────────────────────────────────────┐
│ User Story 1 (P1) - Cambiar a tema claro │
│ T003 → T004 → T005 → T006                │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ User Story 2 (P2) - Menu nativo claro    │
│ T007 → T008 (depends on T006)          │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ User Story 3 (P3) - Persistencia         │
│ T009 → T010 (depends on T006)           │
└──────────────────────────────────────────┘
    ↓
Polish (T011)
```

## Parallel Opportunities

- T003 (create light.css) and T004 (modify variables.css) can run in parallel [P]
- T007 (verify menu theming) can run after T006 completes

---

## Phase 1: Setup

- [ ] T001 Verify existing dark.css structure in src/app/themes/dark.css

---

## Phase 2: Foundational

- [ ] T002 Analyze existing theme system architecture in src/app/core/models/theme.model.ts and src/app/shell/shell.component.ts

---

## Phase 3: User Story 1 - Cambiar a tema claro desde el menu (P1)

**Goal**: Usuario puede seleccionar tema claro desde el menu y la interfaz cambia a colores claros.

**Independent Test**: Abrir menu, seleccionar "Claro", verificar que todos los componentes visibles cambian a colores claros.

- [ ] T003 [P] Create light.css in src/app/themes/light.css with light theme tokens equivalent to dark.css structure
- [ ] T004 [P] Modify src/app/themes/variables.css to support dynamic theme switching based on active theme
- [ ] T005 Enable themes.light option in src/electron/menu/menu.builder.ts (change enabled: false to enabled: true)
- [ ] T006 Verify theme application works by testing menu selection in development mode

---

## Phase 4: User Story 2 - Menu nativo con tema claro (P2)

**Goal**: Menu nativo muestra colores claros cuando el tema claro está activo.

**Independent Test**: Seleccionar tema claro, verificar que el menu nativo muestra colores claros.

**Dependency**: Requires T006 (theme selection working)

- [ ] T007 [US2] Verify menu.nativeTheme updates in src/electron/theme/theme-initializer.ts for light theme
- [ ] T008 [US2] Test menu appearance when light theme is active (verify colors match light.css)

---

## Phase 5: User Story 3 - Persistencia de preferencia de tema (P3)

**Goal**: Preferencia de tema claro se mantiene entre reinicios.

**Independent Test**: Seleccionar tema claro, cerrar app, reabrir, verificar tema claro sigue activo.

**Dependency**: Requires T006 (theme selection working)

- [ ] T009 [US3] Verify theme persistence in src/electron/preferences/preference-store.ts handles light theme correctly
- [ ] T010 [US3] Test theme restoration on app startup in src/electron/theme/theme-initializer.ts for light theme

---

## Phase 6: Polish & Cross-Cutting

- [ ] T011 Run full test suite (npm test) to verify no regressions and validate against SC criteria

---

## Implementation Strategy

**MVP Scope (User Story 1)**:
- T003, T004, T005, T006 constitute the minimum viable implementation
- Focus on getting light theme to display when selected from menu

**Incremental Delivery**:
1. First deliver: light.css + variables.css + enabled menu option
2. Then verify: theme applies to UI components
3. Then enhance: persistence and menu appearance

**Validation Against Success Criteria**:
- SC-001: All visible components change to light colors (T006)
- SC-002: Theme switch < 1 second (T006)
- SC-003: Theme persists after restart (T009, T010)
- SC-004: Toggle between themes works without errors (T006, T011)
- SC-005: Native menu shows light theme (T008)