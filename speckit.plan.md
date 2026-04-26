# Speckit Plan - Angular + Electron (Shell v1)

Estado: Propuesta tecnica lista para ejecucion
Base: shell-v1.spec.md (aprobado) + speckit.constitution
Alcance: Plan de implementacion sin escritura de codigo funcional

## 1) Orden de construccion por fases

### Fase 0 - Fundacion de proyecto
Objetivo: dejar lista la base de runtime y build para Electron + Angular.

Entregables:
- Estructura base de proyecto con entrypoints Electron (`main.ts`, `preload.ts`) y bootstrap Angular.
- Configuracion de entornos (dev/prod) para levantar Angular dentro de ventana Electron.
- Contrato minimo de preload API tipado y seguro (ventana, plataforma, preferencias locales, openExternal permitido).
- Definicion de variables globales de tema y dimensiones del shell.

Criterios de salida:
- La app abre en Electron y renderiza Angular sin errores de consola.
- Se identifica plataforma (`win32`, `darwin`, `linux`) desde frontend via servicio.

---

### Fase 1 - Core transversal (sin UI compleja)
Objetivo: crear cimientos de estado y comunicacion desacoplada.

Entregables:
- `EventBusService` con contrato `emit/on/off`, nombres de eventos versionados.
- `LayoutStateService` para estado global de layout.
- `UserPreferencesService` para persistencia local con version de esquema.
- `PlatformService` para reglas de titlebar por SO.
- `CommandRegistryService` minimo para registro/ejecucion por `id`.
- Modelos core (`AppEvent`, `LayoutState`, `LayoutSnapshot`).
- Store global con NgRx desde inicio para layout, workspace, tabs, paneles, sesion y preferencias.

Criterios de salida:
- Eventos de layout trazables en desarrollo.
- Persistencia y restauracion basica de preferencias.

---

### Fase 2 - Shell estructural (layout raiz)
Objetivo: montar regiones principales y pipeline de estado.

Entregables:
- `AppShellComponent` con CSS Grid de 3 filas (top/workspace/status).
- Integracion de `TopBar`, `Sidebar`, `Toolbar`, `TabBar`, `ContentArea`, `BottomPanel`, `StatusBar`.
- Emision de `shell.ready` y `shell.layout.changed`.

Criterios de salida:
- Layout estable al redimensionar ventana.
- Regiones visibles/ocultas por estado global.

---

### Fase 3 - Interaccion de shell (resize, drag, tabs, toggles)
Objetivo: entregar experiencia operativa del shell.

Entregables:
- Resize de sidebar y bottom panel con RxJS `fromEvent` + `throttleTime`.
- Toggle de sidebar y bottom panel conectado a toolbar/atajos.
- Flujo de tabs: seleccionar, cerrar, reordenar, overflow horizontal natural y soporte multi-grupo.
- Cierre de tabs dirty delegando a hook `beforeClose()` sync/async de la vista alojada.
- Docking avanzado por etapas en v1 (movimiento entre zonas, lateral secundaria, persistencia de layout).
- Empty state en content area.

Criterios de salida:
- Persistencia de ancho/alto y restauracion en relanzamiento.
- Sin jitter visual ni bloqueos en drag/resize.

---

### Fase 4 - Integracion de comandos, accesibilidad y hardening
Objetivo: cerrar v1 con calidad operativa.

Entregables:
- Registro central de comandos (menu + toolbar + shortcuts basicos).
- Accesibilidad baseline: roles ARIA, foco visible, navegacion por teclado.
- Logging de errores recuperables y fallback de defaults.
- Ajustes de performance (OnPush, memoizacion visual, reduccion de repaint).

Criterios de salida:
- Cumplimiento completo de DoD Shell v1.
- Suite de pruebas minima pasando en CI local.

## 2) Dependencias entre componentes

### Dependencias funcionales (alto nivel)
1. Core services (`EventBus`, `LayoutState`, `Preferences`, `Platform`) dependen solo de infraestructura minima.
2. `AppShellComponent` depende de `LayoutStateService` y `EventBusService`.
3. `TopBarComponent` depende de `PlatformService` + comandos de ventana (adapter Electron).
4. `SidebarComponent` depende de `LayoutStateService` y `UserPreferencesService`.
5. `ToolbarComponent` depende de estado global para toggles + registro de comandos.
6. `TabBarComponent` depende de estado de tabs (store de workspace).
7. `ContentAreaComponent` depende de tab activa y registro de vistas.
8. `BottomPanelComponent` depende de `LayoutStateService` y `UserPreferencesService`.
9. `StatusBarComponent` depende de contribuciones de estado global/eventos.

### Grafo de precedencia recomendado
- Core services -> AppShell -> TopBar/Sidebar/Toolbar/StatusBar -> TabBar/ContentArea/BottomPanel -> Comandos y atajos.

### Restriccion de arquitectura
- Presentacion nunca accede directo a Electron API.
- Toda llamada al sistema pasa por puertos/adapters de infraestructura.

## 3) Estrategia de estado global

### Principio
- Global solo para estado transversal.
- Local para interaccion propia de componente.

### Estado global inicial (MVP)
- `layout`: sidebar visible/ancho, bottom panel visible/alto, item activo.
- `workspace`: tabs abiertas, tab activa, metadata de dirty/pinned.
- `uiContext`: breadcrumbs, acciones disponibles, status items.
- `session`: plataforma, ventana maximizada, readiness del shell.
- `preferences`: snapshot persistible por workspace/proyecto.

### Enfoque tecnico recomendado
- NgRx como arquitectura oficial desde v1 para estado transversal (`layout`, `workspace`, `uiContext`, `session`, `preferences`).
- Feature stores por dominio con acciones/eventos tipados y reducers puros.
- Selectores memoizados para evitar renders innecesarios.
- Effects solo para IO (persistencia local, preload/IPC, side effects de comandos).

### Persistencia
- Persistir solo claves necesarias (`sidebarWidth`, `bottomPanelHeight`, `activeSidebarItemId`, visibilidad paneles, ultimo layout valido).
- Versionar esquema de preferencias de forma basica (`preferencesSchemaVersion`).
- Fallback automatico a defaults ante corrupcion; sin rollback/migracion formal avanzada en v1.

## 4) Estrategia de eventos internos

### Patron
- Event Bus tipado con nombres `{boundedContext}.{entity}.{action}.v1`.

### Eventos base v1
- `shell.ready.v1`
- `shell.layout.changed.v1`
- `sidebar.collapsed.v1`
- `sidebar.section.activated.v1`
- `sidebar.resized.v1`
- `bottomPanel.toggled.v1`
- `bottomPanel.resized.v1`
- `tabs.active.changed.v1`
- `tabs.reordered.v1`
- `command.executed.v1`

### Reglas
- Eventos de dominio UI deben ser inmutables y con payload minimo.
- No encadenar logica critica en listeners anonimos de componentes.
- Listeners se suscriben con lifecycle claro y cleanup obligatorio.
- Habilitar trazabilidad en dev (log estructurado por evento + timestamp + origin).

### Integracion Electron
- Eventos UI internos no cruzan IPC salvo necesidad real.
- IPC reservado a: controles de ventana, acceso OS y persistencia avanzada.

## 5) Arquitectura de carpetas definitiva

```text
src/
  app/
    core/
      domain/
        entities/
        value-objects/
      application/
        use-cases/
        ports/
      infrastructure/
        electron/
          adapters/
          ipc/
        persistence/
          local-storage/
      services/
        event-bus.service.ts
        layout-state.service.ts
        user-preferences.service.ts
        platform.service.ts
      state/
        layout/
        workspace/
        ui-context/
        session/
      models/
        app-event.model.ts
        layout-state.model.ts
        layout-snapshot.model.ts
    shell/
      shell.module.ts
      shell.component.ts
      shell.component.html
      shell.component.css
      components/
        top-bar/
        sidebar/
          activity-bar/
        toolbar/
        tab-bar/
        content-area/
        bottom-panel/
        status-bar/
      models/
        sidebar-item.model.ts
        tab-item.model.ts
        toolbar-action.model.ts
        status-bar-item.model.ts
    shared/
      ui/
      directives/
      pipes/
      utils/
    themes/
      variables.css
      dark.css
  electron/
    main.ts
    preload.ts
    ipc/
      channels.ts
      handlers/
  test/
    unit/
    integration/
    e2e/
  docs/
    adr/
```

Nota: esta estructura conserva la del spec y la amplia para Clean Architecture sin romper el alcance Shell v1.

## 6) Riesgos tecnicos

1. Acoplamiento Angular-Electron en componentes UI.
Mitigacion: adapters de infraestructura + puertos de aplicacion.

2. Degradacion de performance por drag/resize continuo.
Mitigacion: `throttleTime`, OnPush, updates por CSS vars, minimizar writes al DOM.

3. Estado inconsistente entre store global y preferencias persistidas.
Mitigacion: estrategia de snapshot atomico y validacion de esquema antes de hidratar.

4. Complejidad de tabs (overflow + reorder + dirty state) en v1.
Mitigacion: implementar modelo multi-grupo minimo desde inicio y entregar capacidades por etapas.

5. Divergencias cross-platform en titlebar y window controls.
Mitigacion: abstracciones por plataforma + checklist manual por SO en v1; automatizacion CI cross-platform en fase posterior.

6. Riesgo de memory leaks por listeners de eventos y drag.
Mitigacion: cleanup estricto (`takeUntil`/DestroyRef) y pruebas de larga sesion.

7. Sobrecarga temprana por arquitectura excesiva.
Mitigacion: aplicar Clean Architecture solo en fronteras criticas del shell, no sobreingenieria de casos triviales.

## 7) Decisiones de performance

- `ChangeDetectionStrategy.OnPush` en todos los componentes del shell.
- Estado derivado por selectores; evitar binding a objetos mutables grandes.
- Resize y drag con streams RxJS y frecuencia limitada.
- Uso intensivo de CSS variables para layout dinamico sin recalculo de templates.
- Lazy loading para modulos no criticos fuera del shell base.
- Evitar librerias UI pesadas en componentes nucleares.
- Payload IPC minimo, serializable, tipado y con validacion de entrada.
- Presupuesto v1: toggle de paneles < 100 ms, cambio de tab < 120 ms, resize > 30 FPS (60 ideal), shell visible < 2 s en entorno estandar.

## 8) Estrategia de testing

### Piramide de pruebas
1. Unitarias (mayoria): servicios core, reducers/selectores, utilidades de layout.
2. Integracion (media): shell + servicios + flujo de eventos.
3. E2E (minimo critico): arranque Electron, toggles, resize, tabs, persistencia al reiniciar.

### Cobertura objetivo v1
- Unit: >= 80% en `core/services` y `core/state`.
- Integracion: casos clave de sincronizacion layout/eventos.
- E2E: smoke en Linux para v1; cross-platform automatizado diferido a incrementos posteriores.

### Casos obligatorios MVP
- Restauracion de `sidebarWidth` y `bottomPanelHeight` tras reinicio.
- `shell.ready` emitido una sola vez por inicio.
- Toggle sidebar y bottom panel desde toolbar actualiza estado global.
- Cierre de tab activa selecciona adyacente correcta.
- Controles de ventana respetan plataforma.

## 9) Definicion de MVP funcional

El MVP se considera funcional cuando:

1. Electron abre una ventana con Angular embebido y shell completo renderizado.
2. Existen TopBar, Sidebar, Toolbar, TabBar, ContentArea, BottomPanel y StatusBar operativos.
3. Sidebar y BottomPanel se pueden mostrar/ocultar y redimensionar con persistencia.
4. TabBar permite abrir, seleccionar, cerrar y reordenar tabs en esquema multi-grupo.
5. ContentArea muestra vista activa y empty state sin tabs.
6. EventBus publica eventos de shell/layout/sidebar/bottom-panel/tabs.
7. Estado global de layout y workspace funciona y se restaura.
8. Tema oscuro por tokens globales aplicado en todas las regiones.
9. Navegacion por teclado base y atributos ARIA esenciales estan activos.
10. No hay errores de compilacion ni errores bloqueantes en consola al iniciar.

## 11) Decisiones cerradas incorporadas (resumen)

1. Comandos minimos en MVP: registro central + menu + toolbar + atajos basicos.
2. Docking avanzado incluido en v1 con entrega por etapas.
3. Preload API minima, tipada y segura (minimo privilegio).
4. Persistencia por workspace/proyecto, solo local.
5. Contrato minimo de extensibilidad interna en v1.
6. Cierre dirty mediante `beforeClose()` definido por la vista de tab.
7. Event Bus tipado con orden natural, aislamiento de errores y trazabilidad dev.
8. Tabs multi-grupo reales desde v1.
9. NgRx oficial desde inicio.
10. Preferencias con versionado basico y defaults (sin rollback avanzado).
11. Overflow tabs con scroll horizontal natural.
12. Frontera publica estable para APIs de extensibilidad.
13. Presupuestos de performance formalizados para v1.
14. Accesibilidad baseline basica como criterio de aprobacion.
15. Sin testing cross-platform automatizado en v1.

## 10) Secuencia sugerida de ejecucion (resumen operativo)

1. Fundacion Electron + Angular + tema global.
2. Core services + estado + persistencia.
3. Shell layout estatico (sin interacciones complejas).
4. Interacciones: toggles, resize, tabs.
5. Comandos + accesibilidad + hardening.
6. Pruebas de regresion y cierre de DoD Shell v1.
