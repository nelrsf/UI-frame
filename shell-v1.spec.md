# Spec: Shell v1 — Base Visual y Estructural

**Versión:** 1.0  
**Estado:** Aprobado para implementación  
**Constitución de referencia:** `speckit.constitution`  
**Objetivo:** Construir la base visual y estructural sobre la que crecerá toda la aplicación.

---

## 1. Alcance

Este spec cubre la v1 del shell de aplicación de escritorio profesional inspirada en VS Code. Define:

- Estructura de layout completa.
- Componentes primarios del shell.
- Contratos de datos e interfaces de cada componente.
- Tokens de diseño del tema oscuro.
- Criterios de aceptación verificables por componente.
- Estructura técnica de archivos que debe producir la implementación.

No cubre: lógica de negocio, contenido real de paneles, autenticación, IPC avanzado ni sistema de comandos completo (esos son incrementos posteriores).

---

## 2. Wireframe Estructural

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR  [Título / Menú / Acciones globales / Controles]   │  32px
├───────┬─────────────────────────────────────────────────────┤
│       │  TOOLBAR  [Acciones contextuales / Breadcrumb]      │  40px
│       ├──────────────────────────────────────────┬──────────┤
│  S    │  TAB BAR  [Tab1] [Tab2▸] [Tab3] [+]      │          │  36px
│  I    ├──────────────────────────────────────────┤          │
│  D    │                                          │ PANEL    │
│  E    │         CONTENT AREA                     │ LATERAL  │
│  B    │         (vista activa del tab)            │ (opt.)   │
│  A    │                                          │          │
│  R    ├──────────────────────────────────────────┴──────────┤
│       │  BOTTOM PANEL  [Terminal / Logs / Output]  [^]      │  variable
├───────┼─────────────────────────────────────────────────────┤
│       │  STATUS BAR  [Info contextual derecha/izquierda]    │  24px
└───────┴─────────────────────────────────────────────────────┘
 ← 240px →
```

---

## 3. Componentes del Shell

### 3.1 `AppShellComponent` (contenedor raíz)

**Responsabilidad única:** Montar todas las regiones del layout y coordinar su visibilidad y dimensiones.

**Comportamiento:**
- Aplica el layout principal mediante CSS Grid.
- Lee el estado inicial de layout desde `LayoutStateService`.
- Propaga cambios de visibilidad a cada región.
- No contiene lógica de negocio ni contenido de dominio.

**Inputs:** ninguno (es el componente raíz del shell).

**Emite eventos de UI (EventBus):**

| Evento | Payload | Descripción |
|---|---|---|
| `shell.ready` | `{ timestamp: number }` | Shell completamente renderizado |
| `shell.layout.changed` | `LayoutSnapshot` | Cambio de región o dimensión |

**Contrato CSS Grid:**
```
grid-template-areas:
  "topbar   topbar"
  "sidebar  workspace"
  "statusbar statusbar"
grid-template-columns: [sidebarWidth] 1fr
grid-template-rows: 32px 1fr 24px
```

---

### 3.2 `TopBarComponent`

**Responsabilidad única:** Barra superior con título de la app, controles nativos de ventana y acciones globales.

**Comportamiento:**
- Altura fija: 32px. No redimensionable.
- Región draggable para mover la ventana (usando `-webkit-app-region: drag`).
- Excluir botones del área draggable (`-webkit-app-region: no-drag`).
- En Windows/Linux: mostrar botones de control de ventana (minimize, maximize, close) propios si la titlebarra nativa está deshabilitada. En macOS: respetar traffic lights nativos.
- Detectar plataforma mediante `PlatformService` para ajustar comportamiento.

**Slots de contenido (ng-content proyectados):**
- `[slot="brand"]` — Nombre/icono de la app (izquierda).
- `[slot="menu"]` — Menú principal horizontal (centro-izquierda).
- `[slot="actions"]` — Acciones globales (centro-derecha).
- `[slot="window-controls"]` — Control nativo de ventana (extremo derecho).

**Interfaz de estado:**
```typescript
interface TopBarState {
  title: string;
  platform: 'win32' | 'darwin' | 'linux';
  windowMaximized: boolean;
}
```

**Criterio de aceptación:**
- [x] Arrastrar la barra mueve la ventana Electron.
- [x] Botones de ventana responden correctamente por plataforma.
- [x] Slots de contenido proyectan contenido externo sin romper layout.

---

### 3.3 `SidebarComponent`

**Responsabilidad única:** Sidebar lateral izquierda colapsable con iconos de actividad y panel de contenido.

**Comportamiento:**
- Dividida en dos sub-zonas:
  - **Activity Bar** (columna de iconos, 48px fija): lista de íconos de sección, tooltip al hover.
  - **Sidebar Panel** (panel de contenido, ancho variable): muestra la vista de la sección activa.
- Estado colapsado: oculta el Sidebar Panel, la Activity Bar permanece visible.
- Ancho del panel: configurable por el usuario mediante drag del borde derecho.
  - Mínimo: 160px. Máximo: 480px. Default: 240px.
- Persistir ancho y sección activa en `UserPreferencesService`.

**Inputs:**
```typescript
@Input() items: SidebarItem[];
@Input() activeItemId: string;
@Input() collapsed: boolean;
@Input() width: number;
```

**Outputs:**
```typescript
@Output() activeItemChange = new EventEmitter<string>();
@Output() collapsedChange  = new EventEmitter<boolean>();
@Output() widthChange      = new EventEmitter<number>();
```

**Modelo de dato:**
```typescript
interface SidebarItem {
  id: string;
  icon: string;          // clase de icono o SVG
  label: string;
  tooltip: string;
  badge?: number;        // indicador numérico opcional
  position: 'top' | 'bottom';
}
```

**Eventos emitidos al EventBus:**

| Evento | Payload |
|---|---|
| `sidebar.collapsed` | `{ collapsed: boolean }` |
| `sidebar.section.activated` | `{ itemId: string }` |
| `sidebar.resized` | `{ width: number }` |

**Criterio de aceptación:**
- [x] Toggle colapsa/expande el panel conservando la Activity Bar.
- [x] El arrastre del borde redimensiona el panel con snap al mínimo/máximo.
- [x] El ancho y la sección activa se restauran al reiniciar.
- [x] Badge numérico visible sobre el ícono cuando `badge > 0`.

---

### 3.4 `ToolbarComponent`

**Responsabilidad única:** Barra de herramientas secundaria contextual encima del área de trabajo.

**Comportamiento:**
- Altura fija: 40px.
- Contenido configurable por la vista activa (contribuciones dinámicas).
- Slot permanente izquierdo para breadcrumb de contexto.
- Slot permanente derecho para acciones fijas de layout (toggle paneles, sidebar).

**Inputs:**
```typescript
@Input() breadcrumbs: BreadcrumbItem[];
@Input() actions: ToolbarAction[];
```

**Modelos:**
```typescript
interface BreadcrumbItem {
  label: string;
  routeSegment?: string;
}

interface ToolbarAction {
  id: string;
  icon: string;
  label: string;
  tooltip: string;
  disabled?: boolean;
  active?: boolean;
  group: 'primary' | 'secondary' | 'layout';
}
```

**Criterio de aceptación:**
- [x] Breadcrumb refleja el contexto de la vista activa.
- [x] Botones de layout (toggle sidebar, toggle bottom panel) responden al estado actual.
- [x] Acciones deshabilitadas muestran feedback visual y son no interactuables.

---

### 3.5 `TabBarComponent`

**Responsabilidad única:** Gestionar y renderizar el conjunto de pestañas del área de trabajo.

**Comportamiento:**
- Tabs horizontales sobre el área de contenido.
- Una tab activa a la vez (por grupo de tabs).
- Overflow: cuando los tabs no caben, scroll horizontal suave con flechas de navegación.
- Drag para reordenar tabs (dentro del mismo grupo).
- Botón `+` al final para abrir nueva tab.
- Cerrar tab: botón `×` visible al hover. Confirmar si tab tiene cambios sin guardar.
- Estados visuales: activa, inactiva, con cambios sin guardar (indicador `·`), bloqueada.

**Inputs:**
```typescript
@Input() tabs: TabItem[];
@Input() activeTabId: string;
```

**Outputs:**
```typescript
@Output() tabSelected    = new EventEmitter<string>();
@Output() tabClosed      = new EventEmitter<string>();
@Output() tabReordered   = new EventEmitter<{ fromIndex: number; toIndex: number }>();
@Output() newTabRequested = new EventEmitter<void>();
```

**Modelo de dato:**
```typescript
interface TabItem {
  id: string;
  label: string;
  icon?: string;
  dirty: boolean;      // cambios sin guardar
  closable: boolean;
  pinned: boolean;
}
```

**Criterio de aceptación:**
- [x] Seleccionar tab activa la vista correspondiente en el content area.
- [x] Cerrar la tab activa activa la tab adyacente.
- [x] Drag and drop reordena los tabs correctamente.
- [x] El indicador `·` aparece cuando `dirty = true`.
- [x] Overflow activa navegación con flechas sin romper layout.

---

### 3.6 `ContentAreaComponent`

**Responsabilidad única:** Zona de trabajo principal que renderiza la vista correspondiente al tab activo.

**Comportamiento:**
- Ocupa todo el espacio disponible después del TabBar.
- Renderiza el componente de vista asociado al tab activo mediante `@ViewChild` + `NgComponentOutlet` o router outlet dedicado.
- Mantiene instancias de vistas cargadas en memoria para cambio de tab sin re-renderizado.
- Mostrar estado vacío (empty state) cuando no hay tabs abiertos.

**Inputs:**
```typescript
@Input() activeTab: TabItem | null;
```

**Estado vacío:**
- Icono central, texto "Selecciona o abre un elemento para comenzar", acceso rápido a acciones frecuentes.

**Criterio de aceptación:**
- [x] Cambiar de tab muestra la vista correcta sin parpadeo.
- [x] Empty state visible y bien compuesto cuando `activeTab` es `null`.
- [x] Scroll interno habilitado dentro del content area cuando el contenido lo requiere.

---

### 3.7 `BottomPanelComponent`

**Responsabilidad único:** Panel inferior opcional para vistas secundarias (terminal, logs, salida, problemas).

**Comportamiento:**
- Colapsable (oculto por defecto, toggle desde toolbar o atajo).
- Altura redimensionable desde su borde superior mediante drag.
  - Mínima: 80px. Máxima: 60% del viewport. Default al expandir: 220px.
- Propio sistema de tabs interno para múltiples vistas (Terminal, Output, Logs, etc.).
- Botones de acción en la cabecera del panel: maximizar, colapsar, cerrar.

**Inputs:**
```typescript
@Input() visible: boolean;
@Input() height: number;
@Input() panels: PanelTab[];
@Input() activePanelId: string;
```

**Outputs:**
```typescript
@Output() visibilityChange   = new EventEmitter<boolean>();
@Output() heightChange       = new EventEmitter<number>();
@Output() activePanelChange  = new EventEmitter<string>();
```

**Modelo:**
```typescript
interface PanelTab {
  id: string;
  label: string;
  icon?: string;
  closable: boolean;
}
```

**Eventos EventBus:**

| Evento | Payload |
|---|---|
| `bottomPanel.toggled` | `{ visible: boolean }` |
| `bottomPanel.resized` | `{ height: number }` |

**Criterio de aceptación:**
- [x] Panel colapsa/expande con animación suave.
- [x] Arrastre del borde superior redimensiona respetando min/max.
- [x] Altura se restaura al expandir después de colapsar.
- [x] Tabs internas funcionan independientemente de las tabs del área principal.

---

### 3.8 `StatusBarComponent`

**Responsabilidad única:** Barra de estado fija al fondo con información contextual.

**Comportamiento:**
- Altura fija: 24px.
- Dos zonas: izquierda (información de contexto activo) y derecha (estado global: conexión, notificaciones, etc.).
- Ítems configurables con click opcional para acción.
- Preparada para recibir contribuciones de módulos futuros.

**Inputs:**
```typescript
@Input() leftItems: StatusBarItem[];
@Input() rightItems: StatusBarItem[];
```

**Modelo:**
```typescript
interface StatusBarItem {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  color?: 'default' | 'warning' | 'error' | 'success';
  clickable: boolean;
  commandId?: string;
}
```

**Criterio de aceptación:**
- [x] Ítems izquierda/derecha se renderizan en sus zonas correctas.
- [x] Click en ítem clickable sin `commandId` no produce error.
- [x] Colores semánticos reflejan estado correcto.

---

## 4. Tokens de Diseño — Tema Oscuro

Todas las variables deben declararse en `:root` en `themes/dark.css` importado globalmente.

### 4.1 Colores Base

```css
:root {
  /* Superficie */
  --color-bg-base:          #1e1e1e;   /* fondo principal (content area) */
  --color-bg-elevated:      #252526;   /* sidebars, paneles */
  --color-bg-overlay:       #2d2d30;   /* dropdowns, tooltips, modales */
  --color-bg-input:         #3c3c3c;   /* campos de texto */
  --color-bg-hover:         #2a2d2e;   /* hover state */
  --color-bg-active:        #094771;   /* elemento seleccionado/activo */

  /* Bordes */
  --color-border-subtle:    #333333;
  --color-border-default:   #454545;
  --color-border-focus:     #007fd4;

  /* Texto */
  --color-text-primary:     #cccccc;
  --color-text-secondary:   #9d9d9d;
  --color-text-disabled:    #5a5a5a;
  --color-text-inverse:     #1e1e1e;
  --color-text-link:        #4fc1ff;

  /* Acento / Brand */
  --color-accent:           #007acc;
  --color-accent-hover:     #1a8ccc;
  --color-accent-active:    #005a9e;

  /* Semánticos */
  --color-success:          #4ec9b0;
  --color-warning:          #cca700;
  --color-error:            #f44747;
  --color-info:             #75beff;

  /* Sidebar */
  --color-activity-bar-bg:  #333333;
  --color-sidebar-bg:       #252526;

  /* TopBar */
  --color-topbar-bg:        #3c3c3c;

  /* StatusBar */
  --color-statusbar-bg:     #007acc;
  --color-statusbar-text:   #ffffff;

  /* Tab */
  --color-tab-active-bg:    #1e1e1e;
  --color-tab-inactive-bg:  #2d2d2d;
  --color-tab-border:       #007acc;
}
```

### 4.2 Tipografía

```css
:root {
  --font-family-ui:         "Segoe UI", system-ui, -apple-system, sans-serif;
  --font-family-mono:       "Cascadia Code", "Fira Code", "Consolas", monospace;

  --font-size-xs:           11px;
  --font-size-sm:           12px;
  --font-size-base:         13px;
  --font-size-md:           14px;
  --font-size-lg:           16px;

  --font-weight-normal:     400;
  --font-weight-medium:     500;
  --font-weight-semibold:   600;

  --line-height-tight:      1.2;
  --line-height-base:       1.4;
  --line-height-relaxed:    1.6;
}
```

### 4.3 Espaciado y Geometría

```css
:root {
  --spacing-1:   4px;
  --spacing-2:   8px;
  --spacing-3:   12px;
  --spacing-4:   16px;
  --spacing-6:   24px;
  --spacing-8:   32px;

  --radius-sm:   2px;
  --radius-md:   4px;
  --radius-lg:   6px;

  --shadow-sm:   0 1px 3px rgba(0,0,0,0.4);
  --shadow-md:   0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg:   0 8px 24px rgba(0,0,0,0.6);

  --transition-fast:    100ms ease;
  --transition-base:    200ms ease;
  --transition-slow:    300ms ease;
}
```

### 4.4 Dimensiones del Shell

```css
:root {
  --shell-topbar-height:       32px;
  --shell-toolbar-height:      40px;
  --shell-tabbar-height:       36px;
  --shell-statusbar-height:    24px;

  --shell-activity-bar-width:  48px;
  --shell-sidebar-width:       240px;
  --shell-sidebar-min-width:   160px;
  --shell-sidebar-max-width:   480px;

  --shell-bottom-panel-height: 220px;
  --shell-bottom-panel-min:    80px;
}
```

---

## 5. Estructura de Archivos Objetivo

La implementación debe producir la siguiente estructura dentro del proyecto Angular:

```
src/
├── app/
│   ├── shell/
│   │   ├── shell.module.ts
│   │   ├── shell.component.ts
│   │   ├── shell.component.html
│   │   ├── shell.component.css
│   │   ├── components/
│   │   │   ├── top-bar/
│   │   │   │   ├── top-bar.component.ts
│   │   │   │   ├── top-bar.component.html
│   │   │   │   └── top-bar.component.css
│   │   │   ├── sidebar/
│   │   │   │   ├── sidebar.component.ts
│   │   │   │   ├── sidebar.component.html
│   │   │   │   ├── sidebar.component.css
│   │   │   │   └── activity-bar/
│   │   │   │       ├── activity-bar.component.ts
│   │   │   │       ├── activity-bar.component.html
│   │   │   │       └── activity-bar.component.css
│   │   │   ├── toolbar/
│   │   │   │   ├── toolbar.component.ts
│   │   │   │   ├── toolbar.component.html
│   │   │   │   └── toolbar.component.css
│   │   │   ├── tab-bar/
│   │   │   │   ├── tab-bar.component.ts
│   │   │   │   ├── tab-bar.component.html
│   │   │   │   └── tab-bar.component.css
│   │   │   ├── content-area/
│   │   │   │   ├── content-area.component.ts
│   │   │   │   ├── content-area.component.html
│   │   │   │   └── content-area.component.css
│   │   │   ├── bottom-panel/
│   │   │   │   ├── bottom-panel.component.ts
│   │   │   │   ├── bottom-panel.component.html
│   │   │   │   └── bottom-panel.component.css
│   │   │   └── status-bar/
│   │   │       ├── status-bar.component.ts
│   │   │       ├── status-bar.component.html
│   │   │       └── status-bar.component.css
│   │   └── models/
│   │       ├── sidebar-item.model.ts
│   │       ├── tab-item.model.ts
│   │       ├── toolbar-action.model.ts
│   │       ├── status-bar-item.model.ts
│   │       └── layout-snapshot.model.ts
│   ├── core/
│   │   ├── services/
│   │   │   ├── event-bus.service.ts
│   │   │   ├── layout-state.service.ts
│   │   │   ├── user-preferences.service.ts
│   │   │   └── platform.service.ts
│   │   └── models/
│   │       └── app-event.model.ts
│   └── themes/
│       ├── dark.css
│       └── variables.css
└── electron/
    ├── main.ts
    └── preload.ts
```

---

## 6. Contratos de Servicios Core

### 6.1 `EventBusService`

```typescript
interface IEventBusService {
  emit<T>(eventName: string, payload: T): void;
  on<T>(eventName: string): Observable<T>;
  off(eventName: string, subscription: Subscription): void;
}
```

### 6.2 `LayoutStateService`

```typescript
interface ILayoutStateService {
  readonly state$: Observable<LayoutState>;
  toggleSidebar(): void;
  toggleBottomPanel(): void;
  setSidebarWidth(width: number): void;
  setBottomPanelHeight(height: number): void;
  getSnapshot(): LayoutSnapshot;
}

interface LayoutState {
  sidebarVisible: boolean;
  sidebarWidth: number;
  bottomPanelVisible: boolean;
  bottomPanelHeight: number;
  activeSidebarItemId: string | null;
}
```

### 6.3 `UserPreferencesService`

```typescript
interface IUserPreferencesService {
  get<T>(key: string, defaultValue: T): T;
  set<T>(key: string, value: T): void;
  reset(key?: string): void;
  preferences$: Observable<Record<string, unknown>>;
}
```

### 6.4 `PlatformService`

```typescript
interface IPlatformService {
  readonly platform: 'win32' | 'darwin' | 'linux';
  readonly isWindows: boolean;
  readonly isMac: boolean;
  readonly isLinux: boolean;
}
```

---

## 7. Comportamientos de Resize/Drag

### Sidebar resize (borde derecho)
- `mousedown` en el handle → capturar posición inicial.
- `mousemove` en `document` → calcular delta y actualizar `--shell-sidebar-width`.
- `mouseup` → confirmar y persistir en `UserPreferencesService`.
- Snap automático a `--shell-sidebar-min-width` si delta lleva por debajo del mínimo.
- Cursors: `col-resize` durante drag.

### Bottom Panel resize (borde superior)
- Idéntico al anterior con eje vertical.
- Snap a `--shell-bottom-panel-min`.
- Cursor: `row-resize`.

### Regla común
- No usar `setInterval` ni `requestAnimationFrame` manual; usar `fromEvent` de RxJS con `throttleTime` para rendimiento.
- Deshabilitar `user-select: none` en documento durante el drag activo.

---

## 8. Consideraciones de Accesibilidad (Baseline)

- Todos los botones con `aria-label` descriptivo.
- Tabs con rol `tablist` / `tab` / `tabpanel` correctos.
- Sidebar con `aria-expanded` en estado colapsado.
- StatusBar como `aria-live="polite"` para cambios de estado.
- Focus visible en todos los elementos interactivos (outline accesible).
- Navegación por teclado: `Tab` / `Shift+Tab` funcional en todos los componentes del shell.

---

## 9. Decisiones de Diseño y Restricciones

| Decisión | Razón |
|---|---|
| CSS Grid para layout raíz | Control directo sobre regiones, sin dependencia de librerías |
| `ChangeDetectionStrategy.OnPush` en todos los componentes shell | Rendimiento con múltiples paneles abiertos |
| RxJS `fromEvent` para resize/drag | Composición declarativa, facilita cleanup y throttle |
| No usar librerías de UI externas en el shell | Evitar deuda de dependencias en componentes críticos; libertad de personalización |
| Services inyectados en `root` para core services | Singleton garantizado; accesible desde cualquier módulo |
| CSS custom properties para tema | Permite theming sin recompilación y sin JS |

---

## 10. Criterios de Aceptación del Shell v1 (DoD)

- [ ] `AppShellComponent` renderiza sin errores, ocupando 100% de viewport Electron.
- [ ] `TopBarComponent` mueve la ventana al arrastrar y adapta controles por plataforma.
- [ ] `SidebarComponent` colapsa/expande y redimensiona, persistiendo estado.
- [ ] `ToolbarComponent` muestra breadcrumb y acciones de layout conectadas al estado.
- [ ] `TabBarComponent` abre, cierra, reordena y reactiva tabs correctamente.
- [ ] `ContentAreaComponent` muestra empty state y cambia vistas sin parpadeo.
- [ ] `BottomPanelComponent` aparece/desaparece con animación y es redimensionable.
- [ ] `StatusBarComponent` muestra ítems en zonas correctas con colores semánticos.
- [ ] Todos los tokens de tema oscuro aplicados globalmente vía CSS variables.
- [ ] `EventBusService` y `LayoutStateService` operativos y conectados al shell.
- [ ] `UserPreferencesService` persiste y restaura sidebar width, bottom panel height y sección activa.
- [ ] Sin errores de compilación ni errores en consola al iniciar.
- [ ] Navegación por teclado funcional en todos los elementos interactivos del shell.
