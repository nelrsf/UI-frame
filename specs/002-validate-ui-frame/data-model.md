# Data Model: UI Frame Shell OCP — ShellManager & Region Contracts

**Feature**: 002-validate-ui-frame
**Date**: 2026-05-04

---

## Region Contracts (public interfaces — `src/app/shell/contracts/`)

### `ICentralRegionTab`

Contrato público para registrar contenido en la región de tabs central del shell.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Identificador único del tab. Usado como clave de deduplicación. |
| `label` | `string` | ✅ | Texto visible en la pestaña. |
| `component` | `Type<unknown>` | ✅ | Standalone Angular component a renderizar con `NgComponentOutlet`. |
| `icon` | `string` | ❌ | Icono opcional (clase CSS o ligature). |
| `closable` | `boolean` | ❌ | Si `false`, el tab no puede cerrarse. Default: `true`. |

**Translations to internal DTO** (`TabItem`):
- `id` → `TabItem.id`
- `label` → `TabItem.label`
- `icon` → `TabItem.icon`
- `closable` → `TabItem.closable`
- `component` → almacenado en `shellContent` NgRx slice por separado

---

### `ISidebarEntry`

Contrato público para registrar entradas en la barra de actividad del sidebar.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Identificador único de la entrada. |
| `label` | `string` | ✅ | Texto visible y accesible del ítem. |
| `icon` | `string` | ✅ | Icono (clase CSS o ligature). Requerido porque el sidebar es principalmente visual. |
| `tooltip` | `string` | ❌ | Texto de tooltip accesible. |

**Translations to internal DTO** (`SidebarItem`):
- `id` → `SidebarItem.id`
- `label` → `SidebarItem.label`
- `icon` → `SidebarItem.icon`
- `tooltip` → `SidebarItem.tooltip`
- `position`: fixed as `'top'` for all ShellManager-registered entries in v1

---

### `IToolbarAction`

Contrato público para registrar botones de acción en la región del toolbar.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Identificador único de la acción. |
| `label` | `string` | ✅ | Texto visible en el botón. |
| `icon` | `string` | ✅ | Icono del botón. |
| `handler` | `() => void` | ✅ | Función invocada al hacer click. ShellManager la registra en `CommandRegistry` con `commandId = 'shell.action.' + id`. |
| `tooltip` | `string` | ❌ | Texto de tooltip. |

**Translations to internal DTO** (`ToolbarAction`):
- `id` → `ToolbarAction.id`
- `label` → `ToolbarAction.label`
- `icon` → `ToolbarAction.icon`
- `tooltip` → `ToolbarAction.tooltip`
- `commandId` → `'shell.action.' + id` (auto-generated)
- `group` → fixed as `'primary'` for ShellManager-registered actions in v1
- `handler` → registered in `CommandRegistry` under `commandId`

---

### `IBottomPanelEntry`

Contrato público para registrar paneles en la región inferior del shell.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Identificador único del panel. |
| `label` | `string` | ✅ | Etiqueta visible en la pestaña del panel. |
| `icon` | `string` | ❌ | Icono opcional de la pestaña. |

**Translations to internal DTO** (`PanelTab`):
- `id` → `PanelTab.id`
- `label` → `PanelTab.label`
- `icon` → `PanelTab.icon`
- `closable` → fixed as `false` for ShellManager-registered panels in v1

---

## NgRx State Slice: `shellContent`

New slice in `src/app/core/state/shell-content/`.

| Field | Type | Description |
|-------|------|-------------|
| `tabs` | `ShellTab[]` | Tabs registrados. Includes `TabItem` data + `componentType`. |
| `activeTabId` | `string \| null` | ID del tab activo en la región central. |
| `sidebarItems` | `SidebarItem[]` | Items registrados en el sidebar. |
| `toolbarActions` | `ToolbarAction[]` | Acciones registradas en el toolbar. |
| `bottomPanelTabs` | `PanelTab[]` | Paneles registrados en el bottom panel. |
| `activePanelId` | `string \| null` | ID del panel activo en el bottom panel. |

### `ShellTab` (internal to `shellContent` slice)

| Field | Type | Description |
|-------|------|-------------|
| `tabItem` | `TabItem` | DTO interno del tab para TabBarComponent. |
| `componentType` | `Type<unknown>` | Tipo del standalone component a renderizar. |

---

## ShellManager Service

**Location**: `src/app/shell/shell-manager.service.ts`  
**Decorator**: `@Injectable({ providedIn: 'root' })`  
**Dependencies**: `Store<AppState>`, `CommandRegistryService`

### API

| Method | Signature | Description |
|--------|-----------|-------------|
| `addTab` | `(tab: ICentralRegionTab): void` | Traduce a `ShellTab` y despacha `shellContentActions.addTab`. Registra el componentType. |
| `addSidebarEntry` | `(entry: ISidebarEntry): void` | Traduce a `SidebarItem` y despacha `shellContentActions.addSidebarEntry`. |
| `addToolbarAction` | `(action: IToolbarAction): void` | Registra handler en CommandRegistry y despacha `shellContentActions.addToolbarAction`. |
| `addBottomPanelEntry` | `(panel: IBottomPanelEntry): void` | Traduce a `PanelTab` y despacha `shellContentActions.addBottomPanelEntry`. |

---

## Mock Implementations (reference implementations of region contracts)

### `MockDashboardTab` — implements `ICentralRegionTab`

| Field | Value |
|-------|-------|
| `id` | `'mock-dashboard'` |
| `label` | `'Dashboard'` |
| `component` | `MockDashboardComponent` (standalone) |
| `closable` | `false` |

### `MockReportsTab` — implements `ICentralRegionTab`

| Field | Value |
|-------|-------|
| `id` | `'mock-reports'` |
| `label` | `'Reports'` |
| `component` | `MockReportsComponent` (standalone) |
| `closable` | `false` |

### `MockAlertAction` × 4 — implements `IToolbarAction`

| id | label | handler behavior |
|----|-------|-----------------|
| `'mock-alert-info'` | `'Info Alert'` | `window.alert('INFO: Mock info message')` |
| `'mock-alert-warning'` | `'Warning Alert'` | `window.alert('WARNING: Mock warning message')` |
| `'mock-alert-error'` | `'Error Alert'` | `window.alert('ERROR: Mock error message')` |
| `'mock-alert-success'` | `'Success Alert'` | `window.alert('SUCCESS: Mock success message')` |

### `MockSidebarEntry` — implements `ISidebarEntry`

| Field | Value |
|-------|-------|
| `id` | `'mock-nav'` |
| `label` | `'Mock Navigation'` |
| `icon` | `'folder'` |
| `tooltip` | `'Mock sidebar entry'` |

### `MockResultsPanel` — implements `IBottomPanelEntry`

| Field | Value |
|-------|-------|
| `id` | `'mock-results'` |
| `label` | `'Results'` |
| `icon` | `'list'` |

---

## Entities to Delete

| Entity | Location | Reason |
|--------|----------|--------|
| `MockUiScreenComponent` | `src/app/shell/mock-ui/screen/` | FR-009: replaced by ShellManager registration |
| `MockUiScreenState` | `src/app/shell/mock-ui/models/mock-ui-screen-state.model.ts` | No longer needed |
| `showMockUi` toggle | `src/app/app.component.ts` | FR-009: AppComponent reverts to `<app-shell>` only |
