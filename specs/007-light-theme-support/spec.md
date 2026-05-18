# Feature Specification: Light Theme Support

**Feature Branch**: `[007-light-theme-support]`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "Vamos a continuar con la spec del tema claro. Revisa la spec 005 y los contratos necesarios para añadir temas de colores. Que se añada igual que el tema oscuro. Ten en cuenta que ya hay una opcion implementada en el menu"

## Clarifications

### Session 2026-05-17

- Q: ¿Qué componentes específicos deben soportar tema claro? → A: Tema claro para el shell (menús, paneles, toolbar principal, etc.). Las librerías externas de terceros (dialogs, tooltips de libs) están fuera del alcance de esta spec.
- Q: ¿Qué aspectos están fuera del alcance? → A: Solo tema claro para el shell; librerías externas fuera de alcance. No se incluye accesibilidad WCAG ni más de dos temas.
- Q: ¿Por qué existen dos rutas de persistencia del tema (main process y renderer)? → A: Se necesitan ambas rutas porque sirven propósitos diferentes e incompatibles en tiempo. La ruta del main process lee preferences.json antes de crear la ventana para aplicar nativeTheme.themeSource y construir el menú nativo con el tema correcto. La ruta del renderer lee preferences.json via IPC después de cargar para aplicar los estilos CSS (data-theme attribute). Ambas rutas leen la misma fuente de verdad (preferences.json con estructura data['ws-default']['shell.theme']) y no hay riesgo de inconsistencia. La alternativa de que el main envíe el tema al renderer introduciría un race condition y posible flash de tema incorrecto.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cambiar a tema claro desde el menu (Priority: P1)

Como usuario de escritorio, quiero seleccionar el tema claro desde el menu para que la aplicacion se presente con colores claros y brillantes.

**Why this priority**: Es la funcionalidad principal de esta spec. El contrato para esta opcion ya existe en spec 005 (FR-005) y ahora se habilita.

**Independent Test**: Se valida abriendo el menu, seleccionando la opcion de tema claro y verificando que la interfaz cambia a colores claros.

**Acceptance Scenarios**:

1. **Given** la aplicacion esta en tema oscuro, **When** el usuario abre el menu y selecciona "Claro", **Then** la interfaz completa se muestra en tema claro.
2. **Given** el usuario selecciona tema claro, **When** cierra y vuelve a abrir la aplicacion, **Then** el tema claro se mantiene activo (persistencia).
3. **Given** el menu muestra las opciones de tema, **When** el usuario inspecciona el menu, **Then** la opcion "Claro" esta habilitada (ya no deshabilitada como en spec 005).

---

### User Story 2 - Menu nativo con tema claro (Priority: P2)

Como usuario de escritorio, quiero que el menu nativo acompanne el tema claro activo para que la experiencia visual sea consistente.

**Why this priority**: El menu ya reaccionaba al tema oscuro en spec 005; debehacer lo mismo con el tema claro.

**Independent Test**: Se valida seleccionando tema claro y verificando que el menu nativo muestra colores claros.

**Acceptance Scenarios**:

1. **Given** el tema claro esta activo, **When** el menu nativo se renderiza, **Then** sus colores se muestran acordes al tema claro.
2. **Given** el tema cambia de oscuro a claro, **When** el menu nativo se refresca, **Then** su presentacion visual se actualiza sin requerir accion adicional.

---

### User Story 3 - Persistencia de preferencia de tema (Priority: P3)

Como usuario de escritorio, quiero que mi eleccion de tema claro se recuerde entre sesiones para no tener que seleccionarla cada vez que uso la aplicacion.

**Why this priority**: La experiencia de usuario requiere consistencia entre sesiones.

**Independent Test**: Se valida seleccionando tema claro, cerrando la aplicacion y verificando al reabrir que el tema claro sigue activo.

**Acceptance Scenarios**:

1. **Given** el usuario selecciono tema claro, **When** cierra la aplicacion y la reabre, **Then** la interfaz se muestra en tema claro.
2. **Given** existe una preferencia de tema clara en el almacenamiento, **When** la aplicacion inicia, **Then** se restaura el tema claro desde NgRx.

---

### Edge Cases

- Que pasa si el cambio de tema ocurre mientras el menu esta abierto?
- Que pasa si hay un error al persistir la preferencia de tema?
- Que pasa si el usuario alterna rapidamente entre temas?
- Que pasa si el sistema tiene un tema claro por defecto que contradice la preferencia guardada?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST habilitar la opcion de tema claro en el menu nativo que estaba deshabilitada como contrato en spec 005.
- **FR-002**: El sistema MUST aplicar colores claros a todos los componentes visibles de la interfaz cuando el tema claro este activo, incluyendo dialogs, tooltips y dropdowns.
- **FR-002a**: El sistema MUST disponer de un archivo light.css equivalente a dark.css en src/app/themes/ con todas las variables CSS necesarias para tema claro.
- **FR-002b**: El sistema MUST exponer las variables CSS del tema claro para que componentes customizados o agregados por usuarios/devs puedan usarlas.
- **FR-002c**: El sistema MUST incluir documentacion tipo quickstart que explique como usar e implementar el tema claro.
- **FR-003**: El sistema MUST mantener el menu nativo con apariencia coherente al tema claro, igual que se hace con el tema oscuro.
- **FR-004**: El sistema MUST persistir la preferencia de tema claro entre reinicios usando NgRx (como indica FR-013 de spec 005).
- **FR-005**: El sistema MUST restaurar la preferencia de tema al inicio desde el estado persistido en NgRx.
- **FR-006**: El sistema MUST permitir alternar entre tema oscuro y tema claro desde el menu sin errores ni perdida de estado.
- **FR-007**: El sistema MUST mantener estable la experiencia del usuario durante el cambio de tema: sin parpadeos excesivos, sin perdida de datos, sin errores visuales.
- **FR-008**: El sistema MUST actualizar todos los componentes que responden a cambios de tema: paneles, menus, iconos, fondos, texto.

### Key Entities *(include if data involves)*

- **Theme Preference**: Preferencia activa que determina la apariencia (oscuro/claro) de la interfaz completa.
- **Theme State**: Estado en NgRx que gestiona el tema activo y su persistencia.
- **UI Components**: Componentes que necesitan responder al cambio de tema con estilos apropiados.
- **Light Theme CSS**: Archivo light.css en src/app/themes/ equivalente a dark.css, con variables CSS para tema claro reutilizables por componentes customizados.
- **Theme Quickstart**: Documentacion para que usuarios/devs puedan implementar el tema claro.

## Developer Quick Start

### Using Theme Variables in Components

Todos los componentes del shell deben usar variables CSS en lugar de colores hardcodeados. Las variables se definen en archivos de tema bajo `src/app/themes/`:

1. **Estructura de archivos de tema**:
   - `dark.css` — Define variables bajo `:root, body[data-theme="dark"]`
   - `light.css` — Define variables bajo `body[data-theme="light"]`
   - `variables.css` — Orquestador que importa ambos: `@import './dark.css'; @import './light.css';`

2. **Cómo funciona el switching**:
   - Sin atributo o `data-theme="dark"` → aplican variables de `dark.css` (default)
   - `data-theme="light"` → aplican variables de `light.css`
   - El `ThemeService` setea `document.body.setAttribute('data-theme', theme)` cuando el tema cambia

3. **Uso en componentes**:
   ```css
   .my-component {
     background-color: var(--color-bg-base);
     color: var(--color-text-primary);
     border: 1px solid var(--color-border-default);
   }
   ```
   Los componentes que usan `var(--color-*)` automáticamente cambian de color cuando el tema cambia.

4. **Variables disponibles**: Ver `src/app/themes/dark.css` para la lista completa (~50 variables). Todas las variables deben existir en ambos archivos de tema con los mismos nombres.

### Adding a New Theme

Para agregar un nuevo tema (ej: "classic"):

1. **Crear archivo de tema** en `src/app/themes/classic.css`:
   ```css
   body[data-theme="classic"] {
     --color-bg-base: #f5f5dc;
     --color-bg-elevated: #ebe8d8;
     /* ... todas las variables con los mismos nombres que dark.css ... */
   }
   ```

2. **Registrar el tema** en `src/app/themes/variables.css`:
   ```css
   @import './dark.css';
   @import './light.css';
   @import './classic.css';  /* ← agregar esta línea */
   ```

3. **Agregar al selector de temas** en `src/electron/menu/menu.builder.ts`:
   ```typescript
   {
     id: 'themes.classic',
     label: 'Clásico',
     type: 'radio',
     checked: context.activeTheme === 'classic',
     enabled: true,
     click: () => {
       this.applyTheme('classic', context);
     },
   },
   ```

4. **Actualizar el contrato** en `src/contracts/theme.ts`:
   ```typescript
   export type AppTheme = 'dark' | 'light' | 'classic';
   ```

5. **Listo**. El `ThemeAdapter` ya soporta cualquier valor de tema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las verificaciones de cambio a tema claro confirman que todos los componentes visibles cambian a colores claros.
- **SC-002**: En al menos el 95% de los cambios de tema observados, la interfaz completa refleja el nuevo tema en menos de 1 segundo despues de la seleccion.
- **SC-003**: El 100% de las pruebas de persistencia confirman que el tema claro se mantiene despues de cerrar y reabrir la aplicacion.
- **SC-004**: El 100% de las pruebas de toggles entre temas logran cambiar la apariencia sin errores y sin perdida de datos de estado.
- **SC-005**: El menu nativo muestra colores claros cuando el tema claro esta activo, igual que ocurre con el tema oscuro.

## Out of Scope

- Tema claro para librerías externas de terceros (dialogs, tooltips de libs externas)
- Requisitos de accesibilidad WCAG o contraste específico
- Más de dos temas (alto contraste, tema del sistema, etc.)

## Assumptions

- El tema oscuro esta completamente implementado y funciona correctamente como base (spec 005).
- Los contratos para tema claro ya estan preparados en el menu nativo (spec 005 FR-005).
- El sistema de persistencia de NgRx funciona correctamente y puede reuse.
- Los componentes de la interfaz ya tienen definidos los estilos para ambos temas o existe un mecanismo para definirlos.
- La alternancia entre temas no afecta otras funcionalidades de la aplicacion.
- Esta spec reutiliza y extiende el trabajo de spec 005 sin necesidad de reimplementar lo ya hecho.