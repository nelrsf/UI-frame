# Feature Specification: Secondary Panel Mocks

**Feature Branch**: `003-add-secondary-panel-mocks`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "Empecemos creando una nueva especificacion para hacer los mock ui, pero para el secondary-panel. Debe crearse dos componentes mock de contenido libre (por ejemplo clima y bolsa, con datos fake). Debe renderizarse el contenido con ngComponentOutlet. Al colapsar el panel debe ajustar las shell regions"

## Clarifications

### Session 2026-05-05

- Q: Si la entrada activa queda invalida o no registrada, cual debe ser el comportamiento del secondary panel? → A: Cambiar automaticamente a la otra entrada valida disponible.
- Q: Al abrir el secondary panel por primera vez, cual debe ser la entrada inicial activa cuando ambas estan disponibles? → A: Clima.
- Q: Si ninguna entrada mock esta disponible al abrir el panel, cual debe ser el comportamiento? → A: Mantener el panel visible con estado vacio controlado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar mocks del secondary panel (Priority: P1)

Como evaluador del UI Frame, quiero abrir el secondary panel y encontrar dos vistas mock de contenido libre (por ejemplo clima y bolsa de valores), para validar que la region admite experiencias diferentes sin cambiar la estructura del shell.

**Why this priority**: Sin contenido mock real en el secondary panel no se puede validar visualmente la region ni comprobar que el shell soporta composicion dinamica en ese costado.

**Independent Test**: Iniciar la aplicacion con el shell existente, abrir el secondary panel y comprobar que aparecen dos entradas mock seleccionables y que cada una muestra su propio contenido al activarse.

**Acceptance Scenarios**:

1. **Given** que la aplicacion inicia con el secondary panel disponible, **When** el usuario abre la region, **Then** ve dos entradas mock identificables de contenido libre: una de clima y otra de bolsa de valores.
2. **Given** que ambas entradas mock estan registradas, **When** el usuario selecciona la entrada de clima, **Then** el secondary panel muestra el contenido de esa vista y oculta la otra.
3. **Given** que ambas entradas mock estan registradas, **When** el usuario selecciona la entrada de bolsa de valores, **Then** el secondary panel muestra su contenido correspondiente sin requerir una ruta o pantalla separada.
4. **Given** que es la primera apertura del secondary panel en la sesion actual y ambas entradas estan disponibles, **When** la region se muestra por primera vez, **Then** la entrada activa inicial es clima.

---

### User Story 2 - Cambiar contenido dinamico dentro de la region (Priority: P2)

Como desarrollador del shell, quiero que la region secondary panel resuelva el componente activo de forma dinamica, para poder agregar o intercambiar contenido sin codificar ramas especificas por cada mock.

**Why this priority**: La validacion del UI Frame depende de demostrar que la region puede hospedar componentes arbitrarios y no solo markup fijo.

**Independent Test**: Con las dos entradas mock registradas, alternar entre ellas varias veces y verificar que la region renderiza el componente activo correcto en el contenedor del panel sin duplicar contenido.

**Acceptance Scenarios**:

1. **Given** que el secondary panel tiene una entrada activa, **When** el usuario cambia a otra entrada, **Then** el contenedor de contenido desmonta la vista anterior y muestra solo la vista recien activada.
2. **Given** que el shell ya usa renderizado dinamico en otras regiones, **When** se habilita el secondary panel con mocks, **Then** esta region sigue el mismo patron de composicion dinamica para su contenido activo.

---

### User Story 3 - Reajustar el shell al colapsar la region (Priority: P1)

Como usuario del shell, quiero que al colapsar el secondary panel el resto de las regiones recupere el espacio disponible, para mantener una distribucion util y sin huecos visuales.

**Why this priority**: Si la region colapsa pero el layout no se reajusta, el shell pierde usabilidad y deja espacio muerto en el area principal.

**Independent Test**: Con el secondary panel visible y mostrando cualquiera de los mocks, colapsar la region y verificar que el area de contenido y las demas regiones adyacentes se expanden para ocupar el espacio liberado.

**Acceptance Scenarios**:

1. **Given** que el secondary panel esta visible, **When** el usuario lo colapsa, **Then** el shell elimina el espacio reservado para esa region y redistribuye el layout en la misma vista.
2. **Given** que el secondary panel fue colapsado con un mock activo, **When** el usuario lo vuelve a expandir, **Then** la region reaparece con una disposicion consistente y conserva una entrada activa valida.

---

### Edge Cases

- Que ocurre si solo una de las dos entradas mock esta disponible al iniciar: el secondary panel debe mostrar la entrada disponible sin dejar controles rotos hacia contenido ausente.
- Que ocurre si ninguna entrada mock esta disponible al iniciar: el secondary panel debe permanecer visible y mostrar un estado vacio controlado, sin colapsar automaticamente.
- Que ocurre si el secondary panel se colapsa mientras una vista mock tiene contenido de longitud variable: las regiones restantes deben reajustarse sin superposiciones ni barras vacias persistentes.
- Que ocurre si se intenta activar una entrada mock no registrada: el shell debe cambiar automaticamente a una entrada valida disponible; si no existe ninguna, debe mostrar un estado vacio controlado.
- Que ocurre si el usuario colapsa y expande la region repetidamente en la misma sesion: el layout debe permanecer estable y la region no debe duplicar contenido ni perder su estado valido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST proveer una capacidad de registro para el secondary panel dentro del shell existente, de modo que la region pueda recibir contenido desacoplado de su markup interno.
- **FR-002**: El sistema MUST crear y registrar exactamente dos componentes mock de contenido libre para el secondary panel en esta feature: uno orientado a clima y otro orientado a bolsa de valores.
- **FR-003**: El sistema MUST mostrar ambas entradas mock como opciones distinguibles dentro del secondary panel, permitiendo seleccionar cual contenido se visualiza en la region.
- **FR-004**: El sistema MUST renderizar en el secondary panel unicamente el componente correspondiente a la entrada activa usando el mecanismo de composicion dinamica estandar del shell, evitando ramas de renderizado hardcodeadas por mock.
- **FR-005**: El sistema MUST permitir cambiar entre el mock de clima y el mock de bolsa de valores dentro de la misma sesion sin navegar fuera del shell principal ni abrir una pantalla de prueba separada.
- **FR-006**: El sistema MUST reajustar las shell regions cuando el secondary panel se colapsa, recuperando para las regiones adyacentes el espacio visual que deja libre esa zona.
- **FR-007**: El sistema MUST restaurar una distribucion coherente de las shell regions cuando el secondary panel se vuelve a expandir, sin huecos persistentes ni solapamientos entre regiones.
- **FR-008**: El sistema MUST mantener una entrada activa valida para el secondary panel durante las transiciones de expandir, colapsar y reabrir, aun cuando el usuario haya interactuado previamente con cualquiera de los dos mocks.
- **FR-009**: El sistema MUST manejar de forma controlada la ausencia o invalidez de una entrada mock, cambiando automaticamente a otra entrada valida disponible y, solo si no existe ninguna, mostrando un estado vacio controlado con el secondary panel visible; todo esto preservando la estabilidad visual del shell y evitando controles interactivos que apunten a contenido inexistente.
- **FR-010**: El sistema MUST establecer la entrada de clima como activa por defecto en la primera apertura del secondary panel dentro de la sesion actual cuando ambas entradas mock esten disponibles.

### Key Entities *(include if feature involves data)*

- **Secondary Panel Entry**: Unidad registrable de contenido para la region lateral secundaria. Tiene identidad visible, representa una vista seleccionable y referencia el componente que debe mostrarse cuando esta activa.
- **Weather Mock View**: Mock de contenido libre orientado a simular informacion de clima con datos no productivos para validar composicion de la region.
- **Market Mock View**: Mock de contenido libre orientado a simular informacion de bolsa de valores con datos no productivos para validar composicion de la region.
- **Secondary Panel Layout State**: Estado de la region que determina si el secondary panel esta expandido o colapsado, cual entrada esta activa y cuanto espacio debe reservar el shell para esta zona.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una sesion de validacion, el usuario puede abrir el secondary panel y acceder a las dos vistas mock requeridas en no mas de 2 interacciones desde el shell principal.
- **SC-002**: El 100% de los cambios entre la vista de clima y la vista de bolsa de valores muestra un solo contenido activo visible por vez, sin duplicaciones visuales en el contenedor del secondary panel.
- **SC-003**: En el 100% de las pruebas manuales de colapsar y expandir la region dentro de una misma sesion, el shell recupera y vuelve a asignar el espacio del secondary panel sin dejar huecos visibles persistentes.
- **SC-004**: Un revisor puede completar la secuencia abrir panel, cambiar entre ambos mocks, colapsar y reexpandir la region en menos de 30 segundos sin encontrar errores visuales bloqueantes.

## Assumptions

- La validacion se realizara sobre el shell productivo existente y no sobre una pantalla separada de demostracion.
- El secondary panel ya dispone de chrome de region suficiente para alojar entradas seleccionables, acciones de colapso y un contenedor de contenido.
- La feature reutilizara el patron de composicion dinamica ya presente en otras regiones del shell para mostrar el componente activo del secondary panel.
- El contenido y la data de ambos mocks (clima y bolsa de valores) seran simulados y no estaran conectados a fuentes reales.
- La persistencia entre reinicios de la entrada activa o del estado expandido/colapsado no forma parte del alcance nuevo, salvo que ya exista en el shell actual.