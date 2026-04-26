# Speckit Tasks - Shell v1 (Angular + Electron)

Fuente oficial aplicada:
1. speckit.constitution
2. shell-v1.spec.md
3. speckit.plan.md
4. Decisiones de Clarify ya incorporadas

Objetivo de este documento:
Backlog tecnico ejecutable, ordenado por camino critico, con prioridad MVP primero y mejoras despues.

Convenciones:
- [Critical]: bloqueante para continuar camino critico.
- [Parallel]: se puede ejecutar en paralelo sin romper dependencias.
- Cada Task incluye: objetivo, archivos probables, dependencias previas, criterio de terminado.

---

## Epic 1 - Foundation [Critical]

### Feature 1.1 - Bootstrap Angular + Electron

#### Task 1.1.1 - Inicializar runtime dual Angular/Electron [Critical]
- Objetivo: lograr arranque de Angular dentro de Electron en entorno dev y build base.
- Archivos probables a tocar:
  - src/electron/main.ts
  - src/electron/preload.ts
  - angular.json
  - package.json
  - tsconfig.json
- Dependencias previas: ninguna.
- Criterio de terminado: Electron abre ventana y renderiza Angular sin errores bloqueantes en consola.
- Subtasks:
  - Definir proceso de arranque de Electron apuntando a host Angular en dev.
  - Definir arranque empaquetable para build local.

#### Task 1.1.2 - Definir pipeline de scripts y entorno [Critical]
- Objetivo: dejar scripts reproducibles para run/test/build de shell v1.
- Archivos probables a tocar:
  - package.json
  - README.md
- Dependencias previas: Task 1.1.1.
- Criterio de terminado: existen scripts documentados para iniciar y validar shell en local.
- Subtasks:
  - Definir script de desarrollo Electron + Angular.
  - Definir script de smoke local para apertura de ventana.

### Feature 1.2 - Theme tokens globales (base)

#### Task 1.2.1 - Crear tokens de tema oscuro y dimensiones shell [Critical]
- Objetivo: implementar variables globales requeridas por spec para colores, tipografia y medidas.
- Archivos probables a tocar:
  - src/app/themes/variables.css
  - src/app/themes/dark.css
  - src/styles.css
- Dependencias previas: Task 1.1.1.
- Criterio de terminado: variables globales cargadas y aplicables desde cualquier componente shell.
- Subtasks:
  - Declarar tokens de color y semanticos.
  - Declarar tokens de tipografia, spacing, radios, sombras y alturas.

#### Task 1.2.2 - Definir contrato de layout responsive del shell [Critical]
- Objetivo: fijar reglas base responsive desktop-first para evitar quiebres de layout.
- Archivos probables a tocar:
  - src/app/themes/variables.css
  - src/app/shell/shell.component.css
- Dependencias previas: Task 1.2.1.
- Criterio de terminado: layout mantiene integridad visual en resoluciones minimas objetivo de escritorio.
- Subtasks:
  - Definir breakpoints minimos para shell desktop.
  - Definir politicas de overflow/scroll por region.

---

## Epic 2 - Core Services [Critical]

### Feature 2.1 - EventBus tipado

#### Task 2.1.1 - Implementar AppEvent y contrato de nombres versionados [Critical]
- Objetivo: normalizar eventos internos con convencion boundedContext.entity.action.v1.
- Archivos probables a tocar:
  - src/app/core/models/app-event.model.ts
  - src/app/core/services/event-bus.service.ts
- Dependencias previas: Epic 1 completado.
- Criterio de terminado: se pueden emitir y consumir eventos tipados con metadata minima.
- Subtasks:
  - Definir tipo base AppEvent<TPayload>.
  - Definir catalogo inicial de eventos v1 de shell/layout/tabs/comandos.

#### Task 2.1.2 - Aislamiento de errores y trazabilidad dev [Critical]
- Objetivo: evitar cascada de fallos en listeners y habilitar debugging de eventos.
- Archivos probables a tocar:
  - src/app/core/services/event-bus.service.ts
- Dependencias previas: Task 2.1.1.
- Criterio de terminado: error en listener no rompe otros listeners y eventos criticos quedan trazados en modo dev.
- Subtasks:
  - Encapsular ejecucion de listeners con manejo de error aislado.
  - Incluir log estructurado (timestamp, origin, eventName) en modo desarrollo.

### Feature 2.2 - Servicios base de plataforma y preferencias

#### Task 2.2.1 - Implementar PlatformService desacoplado [Critical]
- Objetivo: exponer plataforma y banderas isWindows/isMac/isLinux a capa de presentacion.
- Archivos probables a tocar:
  - src/app/core/services/platform.service.ts
  - src/app/core/application/ports/platform.port.ts
  - src/app/core/infrastructure/electron/adapters/platform.adapter.ts
- Dependencias previas: Epic 1, Task 3.1.1.
- Criterio de terminado: componentes consumen plataforma via servicio/puerto sin acceso directo a Electron.
- Subtasks:
  - Definir puerto de plataforma en capa application.
  - Implementar adapter Electron para resolver plataforma.

#### Task 2.2.2 - Implementar UserPreferencesService por workspace [Critical]
- Objetivo: persistir preferencias por workspace/proyecto con version de esquema y defaults seguros.
- Archivos probables a tocar:
  - src/app/core/services/user-preferences.service.ts
  - src/app/core/infrastructure/persistence/local-storage/preferences.repository.ts
  - src/app/core/models/preferences.model.ts
- Dependencias previas: Task 3.2.2 (IPC tipado de preferencias).
- Criterio de terminado: get/set/reset funcional por workspace y fallback seguro ante dato corrupto.
- Subtasks:
  - Definir clave compuesta por workspaceId + schemaVersion.
  - Implementar validacion minima de payload antes de hidratar estado.

### Feature 2.3 - CommandRegistryService minimo

#### Task 2.3.1 - Crear registro central de comandos [Critical]
- Objetivo: registrar/ejecutar comandos por id para menu, toolbar y atajos.
- Archivos probables a tocar:
  - src/app/core/services/command-registry.service.ts
  - src/app/core/models/command-registration.model.ts
- Dependencias previas: Task 2.1.1.
- Criterio de terminado: comandos se registran, listan y ejecutan con manejo de error.
- Subtasks:
  - Definir metadatos minimos (id, label, shortcut, context).
  - Implementar execute(id) asincrono con resultado trazable.

#### Task 2.3.2 - Integrar emision command.executed.v1 [Parallel]
- Objetivo: unificar auditoria minima de ejecucion de comandos en EventBus.
- Archivos probables a tocar:
  - src/app/core/services/command-registry.service.ts
  - src/app/core/services/event-bus.service.ts
- Dependencias previas: Task 2.3.1, Task 2.1.1.
- Criterio de terminado: cada comando ejecutado emite evento tipado con id y contexto.
- Subtasks:
  - Publicar evento en success/failure.
  - Incluir commandId y timestamp en payload.

---

## Epic 3 - State (NgRx) [Critical]

### Feature 3.1 - Store setup global

#### Task 3.1.1 - Configurar NgRx Store raiz y efectos [Critical]
- Objetivo: habilitar arquitectura oficial de estado global desde v1.
- Archivos probables a tocar:
  - src/app/app.module.ts
  - src/app/core/state/index.ts
  - src/app/core/state/app.state.ts
- Dependencias previas: Epic 1.
- Criterio de terminado: store raiz operativo con estructura de slices y efectos registrados.
- Subtasks:
  - Registrar StoreModule/EffectsModule.
  - Definir interfaz AppState con slices iniciales.

### Feature 3.2 - Slices de estado MVP

#### Task 3.2.1 - Implementar slice layout [Critical]
- Objetivo: controlar sidebar, bottom panel, right panel, dimensiones y visibilidad.
- Archivos probables a tocar:
  - src/app/core/state/layout/layout.actions.ts
  - src/app/core/state/layout/layout.reducer.ts
  - src/app/core/state/layout/layout.selectors.ts
  - src/app/core/models/layout-state.model.ts
- Dependencias previas: Task 3.1.1.
- Criterio de terminado: acciones toggle/resize aplican estado consistente y selectores devuelven snapshot valido.
- Subtasks:
  - Crear acciones de toggle y setDimension con limites.
  - Crear selector de snapshot para shell.layout.changed.v1.

#### Task 3.2.2 - Implementar slice preferences por workspace [Critical]
- Objetivo: hidratar y persistir estado de preferencias por workspace/proyecto.
- Archivos probables a tocar:
  - src/app/core/state/preferences/preferences.actions.ts
  - src/app/core/state/preferences/preferences.reducer.ts
  - src/app/core/state/preferences/preferences.effects.ts
  - src/app/core/state/preferences/preferences.selectors.ts
- Dependencias previas: Task 3.1.1, Epic 4 Feature 4.2.
- Criterio de terminado: preferencias cargan al iniciar y se guardan incrementalmente por workspace.
- Subtasks:
  - Efecto de hydrate inicial por workspaceId.
  - Efecto de persist incremental ante cambios relevantes.

#### Task 3.2.3 - Implementar slice workspace/tabs multi-group [Critical]
- Objetivo: modelar tabs por grupos con activa, dirty, pinned, reorder y close guard.
- Archivos probables a tocar:
  - src/app/core/state/workspace/workspace.actions.ts
  - src/app/core/state/workspace/workspace.reducer.ts
  - src/app/core/state/workspace/workspace.selectors.ts
  - src/app/shell/models/tab-item.model.ts
- Dependencias previas: Task 3.1.1.
- Criterio de terminado: operaciones de tabs multi-group actualizan estado correctamente.
- Subtasks:
  - Definir entidad TabItem con groupId.
  - Definir transiciones de cierre con adyacencia correcta.

#### Task 3.2.4 - Implementar slices ui-context y session [Parallel]
- Objetivo: centralizar breadcrumbs, toolbar actions, statusbar items y estado de plataforma/ventana.
- Archivos probables a tocar:
  - src/app/core/state/ui-context/*
  - src/app/core/state/session/*
- Dependencias previas: Task 3.1.1.
- Criterio de terminado: vistas consumen selectores sin estado duplicado en componentes.
- Subtasks:
  - Crear acciones para actualizar breadcrumbs y status items.
  - Crear selectors para windowMaximized y shellReady.

---

## Epic 4 - Electron Bridge [Critical]

### Feature 4.1 - Preload seguro

#### Task 4.1.1 - Definir API minima de preload con minimo privilegio [Critical]
- Objetivo: exponer solo capacidades necesarias (window/system/preferences) a Angular.
- Archivos probables a tocar:
  - src/electron/preload.ts
  - src/electron/ipc/channels.ts
  - src/app/core/application/ports/electron-api.port.ts
- Dependencias previas: Task 1.1.1.
- Criterio de terminado: API de preload tipada, minima y sin exponer objetos nativos directos.
- Subtasks:
  - Exponer window.minimize/maximize/close/isMaximized.
  - Exponer system.getPlatform/openExternal con whitelist.

#### Task 4.1.2 - Hardening de contexto y seguridad Electron [Critical]
- Objetivo: asegurar contexto aislado y politica de permisos acorde constitucion.
- Archivos probables a tocar:
  - src/electron/main.ts
  - src/electron/preload.ts
- Dependencias previas: Task 4.1.1.
- Criterio de terminado: contextIsolation activo, nodeIntegration deshabilitado, API bridged validada.
- Subtasks:
  - Configurar BrowserWindow con flags seguras.
  - Bloquear acceso no autorizado a APIs del sistema.

### Feature 4.2 - IPC tipado

#### Task 4.2.1 - Implementar contrato de canales IPC tipados [Critical]
- Objetivo: formalizar mensajes entre renderer y main para window controls y preferencias.
- Archivos probables a tocar:
  - src/electron/ipc/channels.ts
  - src/electron/ipc/handlers/window.handlers.ts
  - src/electron/ipc/handlers/preferences.handlers.ts
- Dependencias previas: Task 4.1.1.
- Criterio de terminado: canales declarados y validados en origen/destino.
- Subtasks:
  - Definir enums o literales de canales autorizados.
  - Implementar validacion de payload minima por handler.

#### Task 4.2.2 - Adaptadores Angular para consumo de IPC [Critical]
- Objetivo: consumir IPC solo via adaptadores de infraestructura.
- Archivos probables a tocar:
  - src/app/core/infrastructure/electron/adapters/window-controls.adapter.ts
  - src/app/core/infrastructure/electron/adapters/preferences.adapter.ts
  - src/app/core/application/ports/preferences.port.ts
- Dependencias previas: Task 4.2.1.
- Criterio de terminado: servicios de app no dependen de electron directo ni de window global sin typing.
- Subtasks:
  - Implementar adapter de controles de ventana.
  - Implementar adapter de preferencias por workspace.

---

## Epic 5 - Shell UI [Critical]

### Feature 5.1 - AppShell + regiones estructurales

#### Task 5.1.1 - Construir AppShellComponent con grid base [Critical]
- Objetivo: montar layout raiz con topbar/workspace/statusbar y zonas dockeables.
- Archivos probables a tocar:
  - src/app/shell/shell.component.ts
  - src/app/shell/shell.component.html
  - src/app/shell/shell.component.css
- Dependencias previas: Epic 2, Epic 3.
- Criterio de terminado: shell renderiza 100% viewport y emite shell.ready.v1 una sola vez.
- Subtasks:
  - Definir grid-template-areas conforme spec.
  - Conectar snapshot de layout desde store.

#### Task 5.1.2 - Integrar StatusBarComponent y ToolbarComponent [Parallel]
- Objetivo: habilitar barra contextual superior e inferior conectadas a estado global.
- Archivos probables a tocar:
  - src/app/shell/components/toolbar/*
  - src/app/shell/components/status-bar/*
- Dependencias previas: Task 5.1.1, Task 3.2.4.
- Criterio de terminado: toolbar y statusbar reflejan estado y acciones de layout basicas.
- Subtasks:
  - Renderizar breadcrumbs y acciones de toolbar.
  - Renderizar leftItems/rightItems en statusbar.

### Feature 5.2 - TopBar y window controls

#### Task 5.2.1 - Implementar TopBar con drag region y slots [Critical]
- Objetivo: soportar arrastre de ventana y slots brand/menu/actions/window-controls.
- Archivos probables a tocar:
  - src/app/shell/components/top-bar/*
- Dependencias previas: Task 2.2.1, Task 4.2.2.
- Criterio de terminado: topbar draggable funcional y controles no-drag operativos.
- Subtasks:
  - Aplicar webkit-app-region drag/no-drag correctamente.
  - Conectar estado de maximizacion.

#### Task 5.2.2 - Implementar adaptacion de controles por plataforma [Critical]
- Objetivo: ajustar rendering y comportamiento win/linux/macos.
- Archivos probables a tocar:
  - src/app/shell/components/top-bar/*
  - src/app/core/services/platform.service.ts
- Dependencias previas: Task 5.2.1.
- Criterio de terminado: controles de ventana se comportan segun plataforma detectada.
- Subtasks:
  - Mostrar controles custom en win/linux si aplica.
  - Respetar paradigma macOS cuando corresponda.

### Feature 5.3 - Sidebar + Activity Bar

#### Task 5.3.1 - Implementar SidebarComponent colapsable [Critical]
- Objetivo: separar activity bar fija y panel lateral variable.
- Archivos probables a tocar:
  - src/app/shell/components/sidebar/sidebar.component.ts
  - src/app/shell/components/sidebar/sidebar.component.html
  - src/app/shell/components/sidebar/sidebar.component.css
  - src/app/shell/components/sidebar/activity-bar/*
- Dependencias previas: Task 3.2.1.
- Criterio de terminado: toggle collapse mantiene activity bar visible y actualiza store.
- Subtasks:
  - Renderizar items top/bottom con badge opcional.
  - Emitir sidebar.section.activated.v1.

#### Task 5.3.2 - Implementar resize horizontal con limites y persistencia [Critical]
- Objetivo: redimensionar sidebar con snap min/max y persistencia por workspace.
- Archivos probables a tocar:
  - src/app/shell/components/sidebar/*
  - src/app/core/state/layout/*
  - src/app/core/state/preferences/*
- Dependencias previas: Task 5.3.1, Task 3.2.2.
- Criterio de terminado: drag horizontal estable, limites aplicados, valor restaurado al reiniciar.
- Subtasks:
  - Implementar stream fromEvent mousedown/mousemove/mouseup.
  - Persistir width en preferencias por workspace.

### Feature 5.4 - TabBar + ContentArea basica

#### Task 5.4.1 - Implementar TabBarComponent base con overflow natural [Critical]
- Objetivo: soportar abrir/seleccionar/cerrar/reordenar tabs y scroll horizontal natural.
- Archivos probables a tocar:
  - src/app/shell/components/tab-bar/*
  - src/app/core/state/workspace/*
- Dependencias previas: Task 3.2.3.
- Criterio de terminado: TabBar funcional en flujo MVP de un grupo inicial.
- Subtasks:
  - Renderizar estados active/inactive/dirty/pinned.
  - Implementar accion newTabRequested.

#### Task 5.4.2 - Implementar ContentAreaComponent con empty state [Critical]
- Objetivo: mostrar vista activa por tab y estado vacio cuando no hay tabs.
- Archivos probables a tocar:
  - src/app/shell/components/content-area/*
- Dependencias previas: Task 5.4.1.
- Criterio de terminado: cambio de tab sin parpadeo y empty state correcto.
- Subtasks:
  - Integrar outlet dinamico de vista activa.
  - Mantener cache de vistas para cambio rapido.

### Feature 5.5 - BottomPanel basico

#### Task 5.5.1 - Implementar BottomPanelComponent visible/oculto [Critical]
- Objetivo: habilitar panel inferior con tabs internas y toggle desde estado.
- Archivos probables a tocar:
  - src/app/shell/components/bottom-panel/*
  - src/app/core/state/layout/*
- Dependencias previas: Task 3.2.1, Task 5.1.1.
- Criterio de terminado: bottom panel abre/cierra con animacion y respeta estado global.
- Subtasks:
  - Implementar cabecera de panel con acciones basicas.
  - Emitir bottomPanel.toggled.v1.

#### Task 5.5.2 - Implementar resize vertical con limites [Critical]
- Objetivo: redimensionar bottom panel con min y max de viewport.
- Archivos probables a tocar:
  - src/app/shell/components/bottom-panel/*
  - src/app/core/state/layout/*
- Dependencias previas: Task 5.5.1.
- Criterio de terminado: resize vertical estable, snap de min y restauracion de altura.
- Subtasks:
  - Aplicar stream de drag vertical con throttle.
  - Emitir bottomPanel.resized.v1 y persistir.

---

## Epic 6 - Docking Engine [Critical]

### Feature 6.1 - Modelo de docking dinamico

#### Task 6.1.1 - Definir modelo de zonas dockeables y snapshot [Critical]
- Objetivo: representar zonas principal, bottom y lateral secundaria en estado.
- Archivos probables a tocar:
  - src/app/core/models/layout-snapshot.model.ts
  - src/app/core/state/layout/layout.reducer.ts
  - src/app/core/state/layout/layout.selectors.ts
- Dependencias previas: Task 3.2.1.
- Criterio de terminado: layout snapshot soporta docking y serializacion por workspace.
- Subtasks:
  - Definir entidades DockZone y DockedPanel.
  - Actualizar snapshot para rightPanel y grupos activos.

### Feature 6.2 - Interaccion de docking

#### Task 6.2.1 - Implementar docking entre zonas con validaciones [Critical]
- Objetivo: permitir mover paneles entre zonas permitidas sin romper layout.
- Archivos probables a tocar:
  - src/app/shell/shell.component.ts
  - src/app/shell/components/bottom-panel/*
  - src/app/core/state/layout/*
- Dependencias previas: Task 6.1.1, Task 5.5.1.
- Criterio de terminado: panel se puede dockear a zona valida y estado queda consistente.
- Subtasks:
  - Implementar acciones movePanelToZone.
  - Validar restricciones de zonas permitidas.

#### Task 6.2.2 - Implementar panel lateral secundaria [Critical]
- Objetivo: habilitar right panel opcional con ancho configurable.
- Archivos probables a tocar:
  - src/app/shell/shell.component.html
  - src/app/shell/shell.component.css
  - src/app/core/state/layout/*
- Dependencias previas: Task 6.2.1.
- Criterio de terminado: zona lateral secundaria visible/oculta y redimensionable.
- Subtasks:
  - Definir control de visibilidad rightPanelVisible.
  - Definir limites de ancho y persistencia.

---

## Epic 7 - Tabs Multi-group [Critical]

### Feature 7.1 - Grupos reales de tabs

#### Task 7.1.1 - Implementar estructura de tab groups en store [Critical]
- Objetivo: soportar multiples grupos con tab activa por grupo y grupo activo global.
- Archivos probables a tocar:
  - src/app/core/state/workspace/*
  - src/app/shell/models/tab-item.model.ts
- Dependencias previas: Task 3.2.3.
- Criterio de terminado: store maneja add/remove/switch group y tabs por groupId.
- Subtasks:
  - Definir entidad TabGroupState.
  - Definir reglas de grupo activo y foco.

#### Task 7.1.2 - Renderizado multi-group en shell [Critical]
- Objetivo: visualizar y operar mas de un grupo de tabs en layout.
- Archivos probables a tocar:
  - src/app/shell/components/tab-bar/*
  - src/app/shell/components/content-area/*
  - src/app/shell/shell.component.*
- Dependencias previas: Task 7.1.1, Task 5.4.1.
- Criterio de terminado: usuario cambia entre grupos y mantiene tab activa por grupo.
- Subtasks:
  - Instanciar tab bar por grupo.
  - Sincronizar content area con grupo activo.

### Feature 7.2 - beforeClose() en tabs dirty

#### Task 7.2.1 - Implementar hook beforeClose sync/async [Critical]
- Objetivo: resolver cierre de tabs dirty delegando al contenido de la vista.
- Archivos probables a tocar:
  - src/app/shell/models/tab-close-guard.model.ts
  - src/app/core/state/workspace/workspace.effects.ts
  - src/app/shell/components/tab-bar/tab-bar.component.ts
- Dependencias previas: Task 7.1.1.
- Criterio de terminado: cierre respeta respuesta boolean/promise y evita perdida de cambios.
- Subtasks:
  - Definir contrato TabCloseGuard.beforeClose().
  - Encadenar cierre solo cuando guard confirma.

#### Task 7.2.2 - Resolver adyacencia al cerrar tab activa [Critical]
- Objetivo: seleccionar tab adyacente correcta por grupo al cerrar activa.
- Archivos probables a tocar:
  - src/app/core/state/workspace/workspace.reducer.ts
  - src/app/core/state/workspace/workspace.selectors.ts
- Dependencias previas: Task 7.1.1.
- Criterio de terminado: al cerrar activa, foco pasa a adyacente valida segun reglas definidas.
- Subtasks:
  - Definir regla preferente (derecha y fallback izquierda).
  - Cubrir casos pinned/bloqueada.

---

## Epic 8 - Persistence [Critical]

### Feature 8.1 - Persistencia de layout por workspace/proyecto

#### Task 8.1.1 - Guardado incremental de layout snapshot [Critical]
- Objetivo: persistir cambios de layout sin sobrecargar escritura.
- Archivos probables a tocar:
  - src/app/core/state/layout/layout.effects.ts
  - src/app/core/state/preferences/preferences.effects.ts
  - src/app/core/services/user-preferences.service.ts
- Dependencias previas: Task 3.2.2, Task 6.1.1.
- Criterio de terminado: cambios relevantes guardados incrementalmente por workspace.
- Subtasks:
  - Definir debounce/agrupacion de escrituras.
  - Persistir snapshot versionado y validado.

#### Task 8.1.2 - Restauracion segura al iniciar [Critical]
- Objetivo: hidratar layout y tabs con defaults seguros ante corrupcion.
- Archivos probables a tocar:
  - src/app/core/state/preferences/preferences.effects.ts
  - src/app/core/state/layout/layout.reducer.ts
  - src/app/core/state/workspace/workspace.reducer.ts
- Dependencias previas: Task 8.1.1.
- Criterio de terminado: app restaura estado valido; si falla, cae a defaults sin romper UI.
- Subtasks:
  - Validar schemaVersion y llaves requeridas.
  - Aplicar estrategia fallback sin crash.

### Feature 8.2 - Persistencia de contexto de workspace

#### Task 8.2.1 - Resolver workspaceId estable [Critical]
- Objetivo: derivar identificador estable del workspace/proyecto para namespacing de preferencias.
- Archivos probables a tocar:
  - src/app/core/services/workspace-context.service.ts
  - src/app/core/state/session/session.effects.ts
  - src/electron/ipc/handlers/preferences.handlers.ts
- Dependencias previas: Task 4.2.1.
- Criterio de terminado: cada workspace tiene namespace de persistencia independiente.
- Subtasks:
  - Definir algoritmo de derivacion estable.
  - Exponer workspaceId al renderer de forma tipada.

---

## Epic 9 - Commands System [Critical]

### Feature 9.1 - Integracion menu + toolbar + atajos basicos

#### Task 9.1.1 - Conectar comandos de layout al toolbar [Critical]
- Objetivo: ejecutar toggle sidebar/bottom panel desde acciones de toolbar.
- Archivos probables a tocar:
  - src/app/shell/components/toolbar/*
  - src/app/core/services/command-registry.service.ts
  - src/app/core/state/layout/*
- Dependencias previas: Task 2.3.1, Task 5.1.2.
- Criterio de terminado: acciones toolbar ejecutan comandos y reflejan estado activo.
- Subtasks:
  - Registrar comandos shell.layout.toggleSidebar y shell.layout.toggleBottomPanel.
  - Sincronizar estado active/disabled en botones.

#### Task 9.1.2 - Integrar menu superior con CommandRegistry [Critical]
- Objetivo: disparar comandos desde menu contextual superior.
- Archivos probables a tocar:
  - src/electron/main.ts
  - src/app/shell/components/top-bar/*
  - src/app/core/services/command-registry.service.ts
- Dependencias previas: Task 9.1.1, Task 4.2.1.
- Criterio de terminado: menu ejecuta comandos registrados con trazabilidad de evento.
- Subtasks:
  - Mapear entries de menu a commandId.
  - Manejar comando inexistente con fallback seguro.

#### Task 9.1.3 - Atajos basicos v1 [Parallel]
- Objetivo: habilitar shortcuts minimos para operaciones shell frecuentes.
- Archivos probables a tocar:
  - src/app/core/services/shortcut.service.ts
  - src/app/core/services/command-registry.service.ts
- Dependencias previas: Task 2.3.1.
- Criterio de terminado: shortcuts definidos ejecutan comandos sin conflicto grave.
- Subtasks:
  - Registrar listeners de teclado en renderer.
  - Filtrar por contexto para evitar colisiones.

---

## Epic 10 - Accessibility [Critical]

### Feature 10.1 - Semantica y navegacion teclado

#### Task 10.1.1 - Aplicar roles/aria en shell components [Critical]
- Objetivo: cumplir baseline de accesibilidad del spec en topbar/sidebar/tabbar/statusbar.
- Archivos probables a tocar:
  - src/app/shell/components/top-bar/*.html
  - src/app/shell/components/sidebar/*.html
  - src/app/shell/components/tab-bar/*.html
  - src/app/shell/components/status-bar/*.html
- Dependencias previas: Epic 5.
- Criterio de terminado: roles tablist/tab/tabpanel, aria-label y aria-expanded presentes y validos.
- Subtasks:
  - Etiquetar controles interactivos con aria-label descriptivo.
  - Ajustar statusbar con aria-live polite.

#### Task 10.1.2 - Implementar foco visible y recorrido Tab/Shift+Tab [Critical]
- Objetivo: garantizar navegacion teclado continua y feedback de foco.
- Archivos probables a tocar:
  - src/app/themes/dark.css
  - src/app/shell/components/**/*.css
- Dependencias previas: Task 10.1.1.
- Criterio de terminado: todos los elementos interactivos son alcanzables y muestran foco visible.
- Subtasks:
  - Definir estilos de focus-visible accesibles.
  - Verificar orden de tabulacion sin trampas de foco.

---

## Epic 11 - Testing [Critical]

### Feature 11.1 - Unit tests (core y store)

#### Task 11.1.1 - Probar EventBus y CommandRegistry [Critical]
- Objetivo: validar contrato emit/on/off, aislamiento de errores y ejecucion de comandos.
- Archivos probables a tocar:
  - src/app/core/services/event-bus.service.spec.ts
  - src/app/core/services/command-registry.service.spec.ts
- Dependencias previas: Epic 2.
- Criterio de terminado: cobertura de casos felices y fallos principales en ambos servicios.
- Subtasks:
  - Caso de aislamiento de errores entre listeners.
  - Caso command.executed.v1 en success/failure.

#### Task 11.1.2 - Probar reducers/selectors NgRx [Critical]
- Objetivo: validar transiciones de estado en layout, workspace, preferences y session.
- Archivos probables a tocar:
  - src/app/core/state/layout/*.spec.ts
  - src/app/core/state/workspace/*.spec.ts
  - src/app/core/state/preferences/*.spec.ts
  - src/app/core/state/session/*.spec.ts
- Dependencias previas: Epic 3, Epic 7, Epic 8.
- Criterio de terminado: reglas de toggle/resize/reorder/close/persist cubiertas.
- Subtasks:
  - Validar adyacencia al cerrar tab activa.
  - Validar hidratacion/fallback por schemaVersion.

### Feature 11.2 - Integracion y smoke Electron

#### Task 11.2.1 - Pruebas de integracion shell + store + servicios [Critical]
- Objetivo: validar flujo end-to-end de UI shell contra estado global.
- Archivos probables a tocar:
  - test/integration/shell-layout.integration.spec.ts
  - test/integration/tabs.integration.spec.ts
- Dependencias previas: Epic 5 a Epic 10.
- Criterio de terminado: flujos criticos de shell pasan sin mocks frágiles.
- Subtasks:
  - Toggle sidebar/bottom desde toolbar actualiza UI y store.
  - shell.ready.v1 se emite una vez por arranque.

#### Task 11.2.2 - Smoke tests Electron v1 [Critical]
- Objetivo: validar apertura app, render shell y operaciones minimas en entorno Linux v1.
- Archivos probables a tocar:
  - test/e2e/smoke-electron.e2e.spec.ts
  - package.json
- Dependencias previas: Epic 4, Epic 5.
- Criterio de terminado: smoke automatizado ejecuta abrir shell, toggle paneles, cambio de tabs y cierre limpio.
- Subtasks:
  - Escenario arranque + shell visible < 2s objetivo.
  - Escenario resize basico y persistencia al reinicio.

---

## Epic 12 - Performance Hardening

### Feature 12.1 - Optimizaciones de render

#### Task 12.1.1 - Aplicar OnPush y verificacion de mutabilidad [Critical]
- Objetivo: asegurar estrategia de deteccion de cambios eficiente en shell.
- Archivos probables a tocar:
  - src/app/shell/components/**/*.ts
  - src/app/shell/shell.component.ts
- Dependencias previas: Epic 5.
- Criterio de terminado: componentes shell usan OnPush y no dependen de mutaciones silenciosas.
- Subtasks:
  - Revisar Input contracts para inmutabilidad.
  - Ajustar deteccion manual solo donde aplique.

#### Task 12.1.2 - Optimizar drag/resize para presupuesto FPS [Critical]
- Objetivo: cumplir resize > 30 FPS minimo y evitar jank.
- Archivos probables a tocar:
  - src/app/shell/components/sidebar/*
  - src/app/shell/components/bottom-panel/*
  - src/app/shell/shell.component.css
- Dependencias previas: Task 5.3.2, Task 5.5.2.
- Criterio de terminado: operaciones drag/resize cumplen presupuesto v1 en entorno estandar.
- Subtasks:
  - Reducir writes al DOM usando CSS vars.
  - Ajustar throttleTime y cleanup de listeners.

### Feature 12.2 - Presupuesto y observabilidad

#### Task 12.2.1 - Medicion de KPIs de shell v1 [Parallel]
- Objetivo: medir toggle paneles, cambio de tabs, tiempo de shell visible.
- Archivos probables a tocar:
  - test/integration/perf-shell.integration.spec.ts
  - docs/adr/ADR-Perf-Budget-Shell-v1.md
- Dependencias previas: Epic 11.
- Criterio de terminado: reporte de metricas compara resultados vs presupuesto oficial.
- Subtasks:
  - Instrumentar timestamps de eventos clave.
  - Publicar resultado y gaps en ADR.

#### Task 12.2.2 - Hardening final de memory leaks [Parallel]
- Objetivo: eliminar suscripciones sin cleanup y listeners colgantes.
- Archivos probables a tocar:
  - src/app/shell/components/**/*.ts
  - src/app/core/services/event-bus.service.ts
- Dependencias previas: Epic 5, Epic 6, Epic 7.
- Criterio de terminado: no hay listeners huerfanos detectados en prueba de sesion larga.
- Subtasks:
  - Aplicar estrategia unificada takeUntil/DestroyRef.
  - Validar cleanup en destroy para drag streams.

---

## Camino critico resumido (MVP primero)

1. Epic 1 Foundation
2. Epic 3 State (NgRx) + Epic 4 Electron Bridge
3. Epic 2 Core Services
4. Epic 5 Shell UI
5. Epic 6 Docking Engine
6. Epic 7 Tabs Multi-group
7. Epic 8 Persistence
8. Epic 9 Commands System
9. Epic 10 Accessibility
10. Epic 11 Testing (incluye smoke Electron)
11. Epic 12 Performance Hardening

Nota de prioridad:
- MVP funcional se considera completo al cerrar Epics 1 a 11 con criterios criticos en verde.
- Epic 12 cierra hardening y cumplimiento de presupuesto.

---

## OPEN QUESTIONS BEFORE IMPLEMENTATION

1. Workspace ID canonico:
- Se tomara path absoluto, hash del path o identificador provisto por Electron main?

2. Alcance exacto de docking avanzado v1:
- Incluye solo mover paneles entre zonas o tambien split proporcional y tabs de panel por zona?

3. beforeClose() UX:
- Confirmacion sera modal nativa, modal custom Angular o callback de cada vista?

4. Atajos cross-platform:
- Se define mapa unico o por plataforma (Ctrl/Cmd) desde v1?

5. Persistencia de tabs:
- En MVP se restaura solo layout y tab metadata, o tambien contenido de vistas rehidratable?

6. Smoke Electron toolchain:
- Se estandariza framework e2e ahora (Playwright/Spectron replacement) o se usa harness minimo propio v1?
