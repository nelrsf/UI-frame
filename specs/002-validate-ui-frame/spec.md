# Feature Specification: UI Frame Shell OCP — ShellManager & Region Contracts

**Feature Branch**: `002-remediate-shell-v1`
**Created**: 2026-05-04
**Revised**: 2026-05-04
**Status**: Active
**Input**: "Quiero un enfoque direccionado a cumplir con OCP. Actualmente ya existe el componente shell quien renderiza las regiones. Para probar la UI quiero tener una clase ShellManager que construya y gestione todo el shell. Las regiones del shell deben aceptar componentes mediante interfaces (ICentralRegionTab, ISidebarEntry, IToolbarAction, IBottomPanelEntry). Eliminar el mock shell pero mantener los componentes mock internos. Documentar contratos e interfaces. El UI Frame debe servir para una app de clima, reportes, bolsa de valores, etc."

## Clarifications

### Session 2026-05-04

- Q: ¿Dónde debe mostrarse la UI mock para validar el UI Frame? → A: Directamente en el shell productivo existente, registrando los componentes mock a través de ShellManager. No existe pantalla separada de prueba.
- Q: ¿Qué organización deben tener los contratos de región? → A: Interfaces TypeScript bajo `src/app/shell/contracts/` para que sean independientes de las implementaciones concretas.
- Q: ¿Dónde debe vivir la documentación del patrón ShellManager? → A: En `specs/002-validate-ui-frame/quickstart.md`, referenciada desde README.
- Q: ¿Qué estructura e interacción tiene la región de toolbar? → A: Botones interactivos, uno por acción registrada; cada botón al hacer click invoca el `handler` definido en `IToolbarAction`.
- Q: ¿Cómo integra `ShellManager` sus datos con el shell existente que consume NgRx store? → A: `ShellManager` despacha NgRx actions (`addTab`, `addSidebarEntry`, etc.) hacia los slices existentes del store.
- Q: ¿Cómo renderiza el shell el `component` registrado en `ICentralRegionTab` dentro del área de contenido? → A: `ContentAreaComponent` usa `NgComponentOutlet` con el `Type<>` del componente activo; el `Type<>` se almacena en el estado del store junto al `TabItem`.
- Q: ¿El `handler` de `IToolbarAction` se invoca directamente o se adapta al `CommandRegistry` existente? → A: `ShellManager` registra el `handler` en `CommandRegistry` con un `commandId` auto-generado (`'shell.action.' + id`); el `ToolbarAction` resultante usa ese `commandId`.
- Q: ¿`ShellManager` debe ser un Angular injectable service o una clase instanciada manualmente? → A: `@Injectable({ providedIn: 'root' })` — inyectado donde sea necesario; recibe `Store` y `CommandRegistry` por DI.
- Q: ¿Dónde se inicializa `ShellManager` y se registran los mocks en el bootstrap? → A: `APP_INITIALIZER` en `app.config.ts` — garantiza que los mocks estén registrados antes del primer render.

---

## Contexto técnico

El shell actual (`ShellComponent`) ya renderiza seis regiones físicas:

| Región | Componente Angular | Modelo interno actual |
|--------|-------------------|-----------------------|
| Sidebar | `SidebarComponent` | `SidebarItem` |
| Toolbar | `ToolbarComponent` | `ToolbarAction` |
| Tab bar + Content | `TabBarComponent` + `ContentAreaComponent` | `TabItem` |
| Bottom panel | `BottomPanelComponent` | `PanelTab` |
| Secondary panel | `SecondaryPanelComponent` | — |
| Status bar | `StatusBarComponent` | — |

**El problema**: Para poblar cualquier región, el código de dominio (negocio) debe conocer y construir los DTOs internos del shell (`TabItem`, `SidebarItem`, etc.). Esto viola OCP: agregar una nueva app (clima, bolsa) obliga a que esa app acople su lógica a los detalles internos del shell.

**La solución**: Introducir `ShellManager` como la única puerta de entrada al shell. `ShellManager` traduce contratos públicos (`ICentralRegionTab`, `ISidebarEntry`, `IToolbarAction`, `IBottomPanelEntry`) a los DTOs internos, manteniendo el shell `ShellComponent` cerrado para modificación y las apps de dominio abiertas para extensión sin tocar el shell.

---

## User Scenarios & Testing

### User Story 1 — Registrar contenido en el shell mediante ShellManager (Priority: P1)

Como desarrollador de una app de dominio (reportes, clima, bolsa, etc.), quiero poder registrar mis componentes en las regiones del shell usando contratos bien definidos, sin necesidad de conocer o modificar el código fuente del shell.

**Why this priority**: Sin esta capa de contratos, cualquier nueva app debe acoplarse a los internos del shell, violando OCP y forzando modificaciones cada vez que el shell cambia.

**Independent Test**: Verificar que registrar un `ICentralRegionTab`, un `ISidebarEntry`, un `IToolbarAction` y un `IBottomPanelEntry` a través de `ShellManager` produce los elementos correspondientes en el shell sin modificar ningún archivo bajo `src/app/shell/components/` ni `src/app/shell/shell.component.ts`.

**Acceptance Scenarios**:

1. **Given** que el código de arranque crea un `ShellManager` y llama a `addTab(mockDashboardTab)`, **When** la app carga, **Then** el tab "Dashboard" aparece en la barra de tabs del shell con su contenido.
2. **Given** que `ShellManager` tiene una acción registrada via `addToolbarAction(alert)`, **When** el usuario hace click en ese botón del toolbar, **Then** se ejecuta el `handler` de la acción.
3. **Given** que `ShellManager` registra una entrada via `addSidebarEntry(entry)`, **When** el sidebar renderiza, **Then** ese ítem aparece en la barra de actividad.
4. **Given** que `ShellManager` registra un panel via `addBottomPanelEntry(panel)`, **When** el usuario abre el bottom panel, **Then** ese panel está disponible en la lista de paneles.

---

### User Story 2 — Validar que los mock internos implementan los contratos (Priority: P2)

Como desarrollador, quiero que los componentes mock existentes en `src/app/shell/mock-ui/` sirvan como implementaciones de referencia de cada interfaz de región, para demostrar que el patrón funciona y que los contratos son suficientes para cubrir los casos de uso reales.

**Why this priority**: Sin implementaciones concretas de referencia es imposible validar si los contratos son correctos o suficientemente expresivos.

**Independent Test**: Verificar que las clases mock implementan las interfaces (`implements ICentralRegionTab`, etc.) y que TypeScript no reporta errores de contrato en tiempo de compilación.

**Acceptance Scenarios**:

1. **Given** que existe la constante `MOCK_DASHBOARD_TAB: ICentralRegionTab`, **When** se compila el proyecto, **Then** TypeScript no reporta errores de contrato.
2. **Given** que los 4 mock alerts implementan `IToolbarAction`, **When** se registran en `ShellManager`, **Then** cada uno aparece como botón en el toolbar y su `handler` se invoca al hacer click.
3. **Given** que `MockResultsPanel implements IBottomPanelEntry`, **When** se registra, **Then** aparece como panel disponible en el bottom panel del shell.

---

### User Story 3 — Documentar el patrón para que cualquier app de dominio pueda usarlo (Priority: P3)

Como miembro del equipo incorporando una nueva funcionalidad al UI Frame (p.ej. una app de clima), quiero una guía clara que documente los contratos de región y el uso de `ShellManager`, para poder construir mi app sin consultar el código fuente del shell.

**Why this priority**: El valor principal del UI Frame es ser reutilizable en cualquier dominio; sin documentación del patrón ese valor no es accionable.

**Independent Test**: Un desarrollador que no conoce el codebase puede seguir el quickstart y registrar un nuevo tab con su propio componente en menos de 15 minutos.

**Acceptance Scenarios**:

1. **Given** que existe el quickstart con la API de `ShellManager` documentada, **When** el desarrollador lo sigue, **Then** puede agregar un nuevo `ICentralRegionTab` personalizado sin abrir ningún archivo del shell.
2. **Given** que el quickstart incluye ejemplos de dominio diferentes (clima, bolsa), **When** el desarrollador los lee, **Then** comprende que la misma API sirve para cualquier dominio.

---

### Edge Cases

- ¿Qué ocurre si se registra un tab con un `id` duplicado? `ShellManager` MUST ignorar la segunda solicitud o lanzar un error de configuración; no deben aparecer tabs duplicadas.
- ¿Qué ocurre si el `handler` de un `IToolbarAction` lanza una excepción? El shell no debe colapsar; la excepción MUST quedar contenida en el handler.
- ¿Qué ocurre si no se registra ninguna entrada en una región? La región se muestra vacía con su estado por defecto (sin romper el layout).
- ¿Qué ocurre si se intenta registrar contenido directamente en `SidebarComponent` o `TabBarComponent` sin usar `ShellManager`? Está permitido a nivel técnico pero va en contra del contrato documentado y MUST ser marcado en revisión de código.

---

## Requirements

### Functional Requirements

- **FR-001**: El sistema MUST proveer `ShellManager` como un Angular service (`@Injectable({ providedIn: 'root' })`) que actúe como composición root del shell, reciba `Store` y `CommandRegistry` por DI, y exponga métodos tipados para cada región: `addTab(tab: ICentralRegionTab)`, `addSidebarEntry(entry: ISidebarEntry)`, `addToolbarAction(action: IToolbarAction)`, `addBottomPanelEntry(panel: IBottomPanelEntry)`.
- **FR-002**: El sistema MUST definir la interfaz `ICentralRegionTab` con al menos los campos: `id: string`, `label: string`, `component: Type<unknown>`, `closable?: boolean`, `icon?: string`. El `Type<unknown>` MUST almacenarse en el estado NgRx junto al `TabItem` correspondiente y renderizarse en `ContentAreaComponent` mediante `NgComponentOutlet`.
- **FR-003**: El sistema MUST definir la interfaz `ISidebarEntry` con al menos los campos: `id: string`, `label: string`, `icon: string`, `tooltip?: string`.
- **FR-004**: El sistema MUST definir la interfaz `IToolbarAction` con al menos los campos: `id: string`, `label: string`, `icon: string`, `handler: () => void`, `tooltip?: string`. `ShellManager` MUST registrar automáticamente el `handler` en `CommandRegistry` con `commandId = 'shell.action.' + id` al procesar cada `IToolbarAction`, sin requerir que el consumidor de dominio conozca `CommandRegistry`.
- **FR-005**: El sistema MUST definir la interfaz `IBottomPanelEntry` con al menos los campos: `id: string`, `label: string`, `icon?: string`.
- **FR-006**: `ShellManager` MUST traducir cada contrato de región al DTO interno del shell correspondiente (`TabItem`, `SidebarItem`, `ToolbarAction`, `PanelTab`) y MUST despachar las NgRx actions correspondientes en los slices existentes del store (`layout`, `workspace`, o el slice pertinente) sin exponer esos DTOs ni las actions a los consumidores de dominio.
- **FR-007**: El código fuente bajo `src/app/shell/components/` y `src/app/shell/shell.component.ts` NO MUST referenciar ninguna clase concreta de dominio ni de mock; solo puede conocer sus propios DTOs internos.
- **FR-008**: Los componentes mock existentes en `src/app/shell/mock-ui/` MUST ser refactorizados para implementar los contratos de región (`ICentralRegionTab`, `IToolbarAction`, `IBottomPanelEntry`, `ISidebarEntry`) y registrarse en el shell a través de `ShellManager` mediante un `APP_INITIALIZER` declarado en `app.config.ts`, que se ejecuta antes del primer render.
- **FR-009**: El `MockUiScreenComponent` (pantalla mock separada) MUST ser eliminado; la validación de la UI mock MUST realizarse registrando los mocks directamente en el shell productivo via `ShellManager`.
- **FR-010**: Los contratos de región MUST residir en `src/app/shell/contracts/` como archivos TypeScript independientes de cualquier implementación.
- **FR-011**: El sistema MUST mantener la documentación de contratos e instrucciones de uso de `ShellManager` en `specs/002-validate-ui-frame/quickstart.md`, referenciada desde `README.md`.

### Key Entities

- **ShellManager**: Angular service (`@Injectable({ providedIn: 'root' })`) que actúa como única puerta de entrada para registrar contenido en las regiones del shell. Recibe `Store` y `CommandRegistry` por DI. Traduce contratos públicos a DTOs internos y despacha NgRx actions a los slices existentes del store. No modifica `ShellComponent`.
- **ICentralRegionTab**: Contrato público para contenido registrable en la región de tabs central. Incluye `component: Type<unknown>` que el shell almacena en el store y renderiza dinámicamente con `NgComponentOutlet`. Cualquier standalone component Angular puede implementar este contrato sin conocer `TabItem`.
- **ISidebarEntry**: Contrato público para entradas de la barra de actividad del sidebar. Desacopla la lógica de dominio de `SidebarItem`.
- **IToolbarAction**: Contrato público para botones del toolbar. Define un `handler: () => void`. `ShellManager` registra el handler en `CommandRegistry` con `commandId = 'shell.action.' + id` y produce el `ToolbarAction` interno con ese `commandId`. `ToolbarComponent` no requiere modificación.
- **IBottomPanelEntry**: Contrato público para paneles del área inferior. Desacopla la lógica de dominio de `PanelTab`.
- **MockDashboardTab**: Implementación de `ICentralRegionTab` con datos fake de dashboard. Referencia de cómo una app de dominio registraría un tab.
- **MockReportsTab**: Implementación de `ICentralRegionTab` con datos fake de reportes.
- **MockAlertAction**: Implementación de `IToolbarAction` con handler que dispara `window.alert`. Uno por cada nivel (info, warning, error, success).
- **MockSidebarEntry**: Implementación de `ISidebarEntry` con entradas fake de navegación.
- **MockResultsPanel**: Implementación de `IBottomPanelEntry` con datos fake de resultados.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Un desarrollador puede agregar un nuevo `ICentralRegionTab` al shell llamando únicamente a `shellManager.addTab(myTab)` — cero archivos bajo `src/app/shell/components/` o `src/app/shell/shell.component.ts` modificados para ese fin.
- **SC-002**: Los cinco mock registrados (MockDashboardTab, MockReportsTab, 4 MockAlertActions, MockSidebarEntry, MockResultsPanel) se visualizan correctamente en el shell productivo en una misma sesión sin dependencias externas.
- **SC-003**: `npx tsc --noEmit` no reporta ningún error de contrato en los archivos bajo `src/app/shell/contracts/` ni en las implementaciones mock.
- **SC-004**: Un desarrollador nuevo puede seguir el quickstart y registrar un nuevo `ICentralRegionTab` con un componente propio en menos de 15 minutos.

---

## Assumptions

- Los DTOs internos del shell (`TabItem`, `SidebarItem`, `ToolbarAction`, `PanelTab`) siguen siendo los que consumen los componentes Angular del shell; `ShellManager` los genera a partir de los contratos.
- El `MockUiScreenComponent` actual y el toggle `showMockUi` en `AppComponent` son artefactos del enfoque anterior y MUST ser eliminados en esta feature.
- `ShellManager` en esta fase no necesita persistir el estado entre recargas; solo gestiona el estado en memoria durante la sesión.
- Los mocks se registran vía `APP_INITIALIZER` en `app.config.ts`; esto garantiza que el store tenga datos antes del primer render sin modificar `AppComponent`.
- Los componentes Angular registrados como `ICentralRegionTab` son standalone components que el shell renderiza dinámicamente mediante `NgComponentOutlet`; el `Type<>` se almacena en el estado NgRx junto al `TabItem`.
- El UI Frame es agnóstico de dominio: la misma API de `ShellManager` debe poder usarse para una app de clima, de reportes, de bolsa de valores o cualquier otra, sin modificar el shell.

