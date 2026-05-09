# Feature Specification: Dock Region Resize

**Feature Branch**: `[004-dock-region-resize]`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "Vamos a crear una Spec para poder hacer resize en los dock regions de la aplicacion..."

## Clarifications

### Session 2026-05-07

- Q: Cual es la granularidad de emision del evento de resize en el EventBus? -> A: Emitir evento solo al finalizar el drag (on commit).
- Q: Cuando debe actualizarse el estado global NgRx durante resize? -> A: Mantener estado temporal local durante drag y despachar a NgRx solo al finalizar (commit).
- Q: Como deben definirse los limites de tamano para regiones redimensionables? -> A: Definir tamano minimo y maximo por cada region redimensionable.
- Q: En que unidad debe guardarse el tamano de region en estado y eventos? -> A: Guardar tamanos en pixeles enteros.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Redimensionar paneles internos (Priority: P1)

Como usuario de escritorio, quiero redimensionar Bottom Panel, Auxiliary Panel y Workspace principal para adaptar el espacio visible a mi tarea actual sin cambiar la estructura del shell.

**Why this priority**: Es el valor principal del feature; sin esta capacidad no existe mejora real de usabilidad en el layout de trabajo.

**Independent Test**: Se prueba iniciando la app, arrastrando cada separador permitido y verificando que cada region cambia su tamano sin afectar regiones fuera de alcance.

**Acceptance Scenarios**:

1. **Given** el shell esta cargado con regiones visibles, **When** el usuario arrastra el limite entre Workspace y Bottom Panel, **Then** ambas regiones ajustan su tamano dentro de limites validos.
2. **Given** el Auxiliary Panel esta visible, **When** el usuario arrastra su limite con el Workspace, **Then** el ancho del Auxiliary Panel cambia y el Workspace se ajusta en consecuencia.
3. **Given** el usuario intenta arrastrar un borde externo de la ventana para este feature, **When** realiza la accion dentro del area de layout interna, **Then** solo se aplican cambios en separadores internos permitidos y no se altera el comportamiento nativo de borde de ventana.

---

### User Story 2 - Feedback visual nativo de resize (Priority: P2)

Como usuario, quiero que el cursor cambie a la forma de resizer horizontal o vertical al pasar sobre limites redimensionables para entender de forma inmediata donde puedo arrastrar.

**Why this priority**: Reduce errores y friccion al descubrir la funcionalidad de resize.

**Independent Test**: Se prueba moviendo el cursor por todos los limites de regiones, verificando iconos de cursor correctos en zonas permitidas y ausencia de esos iconos en zonas no permitidas.

**Acceptance Scenarios**:

1. **Given** el cursor pasa sobre un separador vertical redimensionable, **When** entra en el area de hit del separador, **Then** el cursor muestra el estado visual de resize horizontal esperado.
2. **Given** el cursor pasa sobre un separador horizontal redimensionable, **When** entra en el area de hit del separador, **Then** el cursor muestra el estado visual de resize vertical esperado.
3. **Given** el cursor pasa por Sidebar, Activity Bar, Status Bar o Toolbar, **When** no esta sobre un separador permitido, **Then** no aparece icono de resize.

---

### User Story 3 - Integracion con estado y eventos del shell (Priority: P3)

Como desarrollador del shell, quiero que cada cambio de tamano de region se refleje en el estado global y se publique como evento en el bus de eventos para habilitar persistencia y futuras automatizaciones.

**Why this priority**: Asegura consistencia arquitectonica y extensibilidad del sistema para futuras mejoras.

**Independent Test**: Se prueba redimensionando regiones y verificando que el estado global se actualiza y que se emiten eventos de resize documentados con payload consistente.

**Acceptance Scenarios**:

1. **Given** un usuario completa un arrastre de resize, **When** termina la interaccion, **Then** el estado global del layout refleja el nuevo tamano de la region modificada.
2. **Given** ocurre un cambio de tamano valido, **When** el sistema procesa el cambio, **Then** se publica un evento de resize con identificador de region y valores de tamano.
3. **Given** un desarrollador consulta la documentacion interna del shell, **When** revisa eventos disponibles, **Then** encuentra contratos claros de eventos de resize y su uso esperado.

---

### Edge Cases

- Que sucede si el usuario intenta reducir una region por debajo del tamano minimo permitido?
- Como responde el layout si el usuario intenta expandir una region por encima del maximo permitido?
- Que sucede cuando una region redimensionable no esta visible temporalmente y el usuario mueve el cursor por su antigua posicion?
- Como se mantiene la estabilidad visual durante arrastres rapidos o repetidos?
- Como se recupera el layout si llega una actualizacion de tamano invalida o incompleta?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir redimensionar el Bottom Panel mediante su separador interno con la region adyacente.
- **FR-002**: El sistema MUST permitir redimensionar el Auxiliary Panel mediante su separador interno con la region adyacente.
- **FR-003**: El sistema MUST permitir redimensionar el Workspace principal mediante los separadores internos con Bottom Panel y/o Auxiliary Panel cuando aplique.
- **FR-004**: El sistema MUST impedir comportamiento de resize interno para Sidebar, Activity Bar, Status Bar y Toolbar.
- **FR-005**: El sistema MUST mantener sin cambios el comportamiento de resize en los bordes externos de la ventana, delegandolo al sistema nativo de ventana.
- **FR-006**: El sistema MUST mostrar feedback visual de cursor de resize horizontal o vertical al detectar hover sobre separadores internos permitidos.
- **FR-007**: El sistema MUST ocultar feedback visual de cursor de resize cuando el puntero no este en una zona redimensionable permitida.
- **FR-008**: El sistema MUST aplicar limites minimos y maximos configurables por cada region redimensionable para evitar layouts no utilizables.
- **FR-009**: El sistema MUST mantener estado temporal local durante el drag y actualizar el estado global de layout (NgRx) solo al finalizar un resize confirmado.
- **FR-010**: El sistema MUST publicar un evento de resize en el EventBus por cada cambio de tamano valido confirmado al finalizar la interaccion de drag.
- **FR-011**: El sistema MUST documentar el contrato funcional del evento de resize (cuando se emite, datos esperados y semantica) para consumidores futuros.
- **FR-012**: El sistema MUST aislar fallas de consumidores del EventBus para que un listener defectuoso no bloquee el resize ni el resto de listeners.
- **FR-013**: El sistema MUST almacenar y exponer los tamanos redimensionados en pixeles enteros dentro del estado global y del payload de eventos de resize.

### Key Entities *(include if feature involves data)*

- **Dock Region**: Region interna del shell susceptible o no de resize, identificada por tipo (Bottom Panel, Auxiliary Panel, Workspace, u otras no redimensionables).
- **Region Size State**: Representacion del tamano actual por region redimensionable en pixeles enteros, incluyendo restricciones min/max y ultimo valor confirmado.
- **Resize Interaction**: Registro de una interaccion de arrastre sobre separador interno, con inicio, actualizacion y cierre.
- **Resize Event**: Mensaje publicado al bus de eventos con metadatos del cambio de tamano en pixeles enteros para observabilidad y extensibilidad.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los separadores de Bottom Panel, Auxiliary Panel y Workspace principal permiten completar una accion de resize sin errores en pruebas funcionales.
- **SC-002**: El 100% de las regiones fuera de alcance (Sidebar, Activity Bar, Status Bar, Toolbar) mantienen tasa de resize interno en 0 intentos efectivos durante pruebas de validacion.
- **SC-003**: En al menos 95% de interacciones de usuario observadas en QA, el cursor correcto de resize aparece en menos de 100 ms al entrar en un limite redimensionable.
- **SC-004**: El 100% de cambios de tamano validos generan un evento de resize consumible por el EventBus con datos completos de region y dimensiones.
- **SC-005**: 100% de escenarios de resize definidos para este feature pasan sin regresiones en la suite baseline del shell (shell component specs, layout state specs y smoke de Electron).

## Assumptions

- El alcance es desktop shell en la aplicacion actual; no incluye redimensionamiento de componentes fuera de los dock regions indicados.
- El producto ya dispone de un mecanismo de estado global centralizado alineado con el paradigma Redux y esta capacidad debe reutilizarse.
- El EventBus existente del shell es el mecanismo oficial para publicacion/suscripcion de eventos transversales.
- Persistencia de tamanos por sesion/usuario queda habilitada por el modelo de estado resultante, aunque su entrega completa puede realizarse en una fase posterior.
- Los limites min/max por region seran definidos por reglas de usabilidad del shell y validados en pruebas de aceptacion.
- La baseline de no-regresion para este feature se compone de pruebas de shell, pruebas de estado layout y smoke de Electron.
