# Feature Specification: Native Menu Customization

**Feature Branch**: `[005-native-menu-customization]`  
**Created**: 2026-05-09  
**Status**: Draft  
**Input**: User description: "La barra de menus nativa de electron debe reaccionar al cambio de tema (oscuro/claro), simplificarse en espanol, permitir toggle de bottom panel y secondary panel, y exponer una forma clara de personalizarla para futuros desarrollos."

## Clarifications

### Session 2026-05-09

- Q: Que debe hacer la opcion de tema claro mientras el resto de la aplicacion aun no lo soporta? -> A: Mostrar la opcion "Claro" en el menu pero deshabilitada hasta la futura spec.
- Q: Como debe aplicarse la personalizacion del menu? -> A: La personalizacion se define por desarrolladores o integradores y se aplica al iniciar la app o al construir el menu.
- Q: La preferencia de tema debe persistir entre reinicios? -> A: Persistir entre reinicios usando la herramienta NgRx ya implementada.
- Q: Como debe mostrarse devtools en el menu? -> A: Mostrar devtools solo en desarrollo o bajo una condicion de debugging explicita.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Menu simple y utilizable en espanol (Priority: P1)

Como usuario de escritorio, quiero ver un menu nativo simple, en espanol y sin opciones sobrantes, para acceder rapido a las acciones esenciales del shell sin distraerme con entradas que no aportan valor.

**Why this priority**: La simplificacion del menu es la base del cambio. Sin esta reduccion no existe la nueva experiencia solicitada.

**Independent Test**: Se valida abriendo la aplicacion y revisando el menu nativo para confirmar que solo quedan las opciones aprobadas y que estan rotuladas en espanol.

**Acceptance Scenarios**:

1. **Given** la aplicacion se abre por primera vez, **When** el usuario inspecciona el menu nativo, **Then** solo encuentra las opciones acordadas para Archivo, Temas y los toggles de paneles y devtools.
2. **Given** el usuario navega por el menu, **When** busca la accion de salir, **Then** la encuentra dentro de Archivo con un texto claro en espanol.
3. **Given** el usuario busca opciones heredadas que no forman parte del nuevo alcance, **When** revisa el menu, **Then** no aparecen entradas sobrantes del menu anterior.

---

### User Story 2 - Menu alineado con el tema activo (Priority: P2)

Como usuario de escritorio, quiero que la apariencia del menu nativo acompanhe el tema activo del sistema o de la aplicacion, para que la barra de menu se vea consistente con el estado visual actual.

**Why this priority**: La reaccion al tema es la motivacion principal del cambio visual y sienta la base para el soporte futuro de tema claro.

**Independent Test**: Se valida cambiando el tema activo y verificando que el menu nativo se presenta con colores coherentes con ese tema, sin modificar el resto del shell en esta entrega.

**Acceptance Scenarios**:

1. **Given** el tema oscuro esta activo, **When** el menu nativo se renderiza o se refresca, **Then** sus colores se muestran acordes al tema oscuro actual.
2. **Given** el tema cambia en la aplicacion, **When** el menu nativo recibe ese cambio, **Then** su presentacion visual se actualiza sin requerir una navegacion manual adicional.
3. **Given** el tema claro aun no esta habilitado para el resto de la aplicacion, **When** el sistema expone el selector claro/oscuro, **Then** existe el contrato necesario para activar tema claro en una futura spec sin romper el menu actual.

---

### User Story 3 - Personalizar menu sin tocar el nucleo (Priority: P3)

Como desarrollador que integra o extiende el shell, quiero una forma clara de personalizar el menu nativo, para poder agregar, quitar, renombrar o conectar acciones propias sin reescribir la logica central del menu.

**Why this priority**: La personalizacion es una necesidad de extensibilidad, pero depende de que primero exista un menu base simple y estable.

**Independent Test**: Se valida aplicando una configuracion de menu alternativa y comprobando que cambian textos, visibilidad y acciones sin afectar las opciones obligatorias del shell.

**Acceptance Scenarios**:

1. **Given** un desarrollador define un menu alternativo, **When** aporta nuevas entradas o elimina las opcionales, **Then** el menu final refleja esa configuracion sin cambiar el resto de la aplicacion.
2. **Given** un desarrollador reemplaza los textos del menu, **When** el menu se genera de nuevo, **Then** las etiquetas personalizadas aparecen en lugar de las predeterminadas.
3. **Given** un desarrollador conecta callbacks o comandos propios, **When** el usuario activa una entrada personalizada, **Then** se ejecuta la accion configurada.

---

### Edge Cases

- Que pasa si el cambio de tema ocurre mientras el menu esta abierto?
- Que pasa si una configuracion personalizada elimina una opcion obligatoria como Salir?
- Que pasa si una entrada personalizada apunta a una accion no disponible aun?
- Que pasa si el usuario intenta alternar devtools o paneles cuando la vista asociada no esta visible?
- Que pasa si una futura preferencia de tema claro existe en el contrato pero aun no tiene soporte visual completo en el resto de la app?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar el menu nativo con una version simplificada en espanol, manteniendo solo las acciones aprobadas para esta entrega.
- **FR-002**: El sistema MUST conservar la accion de Archivo -> Salir como ruta principal de cierre de la aplicacion.
- **FR-003**: El sistema MUST conservar una accion para mostrar u ocultar devtools solo en desarrollo o bajo una condicion de debugging explicita mientras siga siendo parte del alcance transitorio.
- **FR-004**: El sistema MUST exponer acciones en el menu para alternar bottom panel y secondary panel.
- **FR-005**: El sistema MUST ofrecer una opcion de temas con selecciones para oscuro y claro, con el tema oscuro como comportamiento activo de esta entrega y la opcion de tema claro visible pero deshabilitada hasta una entrega futura.
- **FR-006**: El sistema MUST ajustar la presentacion del menu nativo a la preferencia de tema activa cuando esa preferencia cambie.
- **FR-007**: El sistema MUST permitir que la personalizacion del menu agregue, elimine, renombre, reordene y asigne acciones o callbacks a entradas del menu.
- **FR-008**: El sistema MUST permitir que la personalizacion del menu sustituya textos por otros idiomas o por nomenclatura propia del producto.
- **FR-009**: El sistema MUST exponer un punto de extension documentado para construir configuraciones de menu reutilizables sin modificar el nucleo del menu en cada integracion.
- **FR-010**: El sistema MUST mantener estable el resto de la aplicacion cuando el menu cambie de tema o de configuracion, incluyendo: no se pierden datos de estado en NgRx, no se generan crashes o excepciones sin capturar, todas las suites de tests existentes (shell, preferences, layout) siguen pasando tras integrar menu (verificable con `npm test`).
- **FR-011**: El sistema MUST dejar contratos preparados para que la aplicacion pueda implementar tema claro completo en una futura spec sin romper la personalizacion actual del menu.
- **FR-012**: El sistema MUST incluir documentacion breve y clara que explique como personalizar el menu nativo para un desarrollador nuevo en el repositorio.
- **FR-013**: El sistema MUST recordar la preferencia de tema seleccionada por el usuario entre reinicios usando el estado y persistencia ya gestionados por NgRx.

### Key Entities *(include if feature involves data)*

- **Menu Configuration**: Definicion reutilizable que describe que entradas muestra el menu, como se llaman y que accion ejecutan.
- **Menu Entry**: Una opcion individual visible al usuario, con texto, estado de visibilidad y accion asociada.
- **Theme Preference**: Preferencia activa que determina la apariencia del menu y prepara la evolucion hacia el tema claro.
- **Panel Visibility State**: Estado de visibilidad de bottom panel y secondary panel controlado desde el menu.
- **Customization Contract**: Punto de extension documentado para crear, componer o sustituir menus sin tocar el nucleo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En pruebas funcionales basicas, el 100% de las revisiones del menu confirman que solo aparecen las opciones aprobadas y todas estan en espanol.
- **SC-002**: En al menos el 95% de los cambios de tema observados, el menu refleja la preferencia activa en menos de 1 segundo despues del cambio.
- **SC-003**: El 100% de las validaciones de personalizacion documentada permiten agregar, quitar o renombrar entradas sin perder la capacidad de ejecutar acciones configuradas.
- **SC-004**: El 100% de las pruebas de toggles desde menu logran cambiar la visibilidad de bottom panel y secondary panel cuando la accion esta disponible.
- **SC-005**: Un desarrollador nuevo puede completar un caso documentado de personalizacion del menu siguiendo solo el quick start, sin ayuda adicional, en menos de 10 minutos.

## Assumptions

- El alcance de esta spec es la aplicacion de escritorio y su menu nativo; no incluye apps web o mobile.
- El resto de la aplicacion seguira usando el tema oscuro actual hasta que una spec futura implemente el tema claro completo.
- La opcion de tema claro debe existir como contrato y punto de extension, pero permanecera deshabilitada hasta que una spec futura habilite su soporte completo.
- La accion de devtools sigue presente solo como transicion en entornos de desarrollo o debugging y podra eliminarse en una futura spec sin romper el contrato de personalizacion.
- La personalizacion del menu esta pensada para desarrolladores e integradores del repositorio, no para edicion libre por usuarios finales en tiempo de ejecucion.
- La personalizacion del menu se compone al iniciar la app o al construir el menu, no como edicion runtime por usuarios finales.
- La preferencia de tema debe restaurarse al iniciar a partir del estado persistido en NgRx.
- La estructura de menu puede refrescarse cuando cambia la preferencia de tema sin requerir reinicio de la aplicacion.

## Developer Quick Start

1. Defina una configuracion de menu con las entradas que quiere conservar, agregar o retirar.
2. Asigne textos, visibilidad y acciones o callbacks para cada entrada relevante.
3. Aplique esa configuracion mediante el punto de extension documentado para menu.
4. Conecte cualquier cambio de tema a un refresco del menu para mantener los colores sincronizados.
5. Use esta spec como referencia de alcance: el menu base debe seguir mostrando Salir, devtools, toggle de paneles y selector de temas.
