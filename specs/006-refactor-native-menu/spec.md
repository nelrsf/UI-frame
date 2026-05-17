# Feature Specification: Refactor Native Menu Integration

**Feature Branch**: `[006-refactor-native-menu]`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "Crear una nueva especificacion para refactorizar la integracion del menu nativo de Electron, con foco en SRP para `main.ts` y OCP para la personalizacion del menu."

## Clarifications

### Session 2026-05-17

- Q: Que politica debe aplicar `SHELL.OPEN_EXTERNAL` para URLs externas? -> A: Denegar por defecto y permitir solo origenes declarados en una allowlist configurable.
- Q: Que debe ocurrir si una accion custom del menu falla? -> A: Propagar el error para que Electron o el handler superior lo maneje.
- Q: Que alcance debe tener la actualizacion de documentacion/quickstart? -> A: Actualizar el quickstart existente y agregar la guia/contrato nuevo bajo `specs/006-refactor-native-menu`.
- Q: Que permiso explicito puede mostrar `view.devtools` fuera de desarrollo? -> A: Solo un flag runtime explicito puede permitir DevTools fuera de desarrollo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bootstrapper liviano para Electron (Priority: P1)

Como mantenedor del shell de escritorio, quiero que el arranque principal de Electron actue como composition root liviano, para poder entender y cambiar el ciclo de vida de la aplicacion sin mezclar persistencia, IPC concreto, senales de prueba ni reglas de menu en el mismo archivo.

**Why this priority**: Esta separacion es la base de la refactorizacion. Mientras el arranque conserve responsabilidades de dominio o infraestructura concreta, las demas mejoras seguiran dependiendo de cambios fragiles en el punto de entrada.

**Independent Test**: Se valida revisando el arranque principal y confirmando que solo orquesta flags runtime, registro modular de handlers, creacion de ventana, inicializacion de tema, inicializacion de menu y lifecycle de Electron.

**Acceptance Scenarios**:

1. **Given** la aplicacion inicia, **When** Electron ejecuta el bootstrap principal, **Then** el bootstrap solo coordina modulos de arranque y no contiene lectura directa de preferencias, handlers IPC inline ni personalizacion concreta del menu.
2. **Given** se necesita registrar IPC de menu, shell/sistema o preferencias, **When** se revisa el bootstrap principal, **Then** cada registro aparece delegado a modulos de handlers equivalentes al patron existente de ventanas y preferencias.
3. **Given** la ventana termina de cargar, **When** se disparan senales de smoke o accessibility, **Then** esas senales provienen de un modulo dedicado y no de logica inline mezclada con el evento de carga.

---

### User Story 2 - Personalizacion de menu por extension estable (Priority: P2)

Como integrador del shell, quiero un punto estable de configuracion del menu nativo, para cambiar labels, visibilidad, callbacks y submenus sin modificar el arranque principal de Electron ni el nucleo de construccion del menu.

**Why this priority**: La personalizacion es el comportamiento que debe quedar abierto a extension. Si cada integracion modifica el bootstrap, el menu incumple OCP y se vuelve costoso de mantener.

**Independent Test**: Se valida aplicando una personalizacion que cambia textos, agrega un submenu, oculta una entrada opcional y conecta una accion custom, confirmando que no se cambia `main.ts`.

**Acceptance Scenarios**:

1. **Given** un integrador necesita cambiar labels del menu, **When** edita el punto de configuracion/extensible documentado, **Then** los labels cambian sin tocar el bootstrap principal.
2. **Given** un integrador necesita agregar un submenu top-level, **When** lo declara en el punto de extension del menu, **Then** el submenu aparece sin modificar el constructor estable del menu ni el bootstrap principal.
3. **Given** un integrador oculta una entrada opcional, **When** el menu se aplica, **Then** la entrada no aparece y las reglas obligatorias del shell siguen protegidas.
4. **Given** un integrador conecta una accion custom, **When** el usuario activa la entrada asociada, **Then** la accion se ejecuta desde la configuracion permitida sin introducir handlers inline en el bootstrap.

---

### User Story 3 - Preferencias y tema inicial reutilizables (Priority: P3)

Como mantenedor del main process, quiero que la persistencia de preferencias y la restauracion inicial del tema vivan en modulos reutilizables, para compartir el mismo contrato entre handlers de preferencias y bootstrap de tema sin lecturas ad hoc de archivos.

**Why this priority**: El menu depende del tema inicial y de preferencias persistidas. Centralizar esa responsabilidad reduce duplicacion, mejora recuperacion ante datos invalidos y prepara pruebas mas enfocadas.

**Independent Test**: Se valida iniciando la aplicacion con preferencias existentes, ausentes o corruptas, y confirmando que el tema inicial se aplica mediante el inicializador dedicado sin lecturas directas desde el bootstrap principal.

**Acceptance Scenarios**:

1. **Given** existe una preferencia `shell.theme` valida, **When** inicia la aplicacion, **Then** el tema inicial se restaura antes de aplicar el menu.
2. **Given** las preferencias no existen o no contienen tema valido, **When** inicia la aplicacion, **Then** se aplica el comportamiento seguro predeterminado sin bloquear el arranque.
3. **Given** los handlers de preferencias y el bootstrap de tema necesitan acceso a preferencias, **When** se revisa la integracion, **Then** ambos usan el mismo modulo compartido de persistencia.

---

### User Story 4 - Documentacion que guia hacia OCP (Priority: P4)

Como desarrollador nuevo del repositorio, quiero que el quickstart de menu muestre el punto de extension correcto, para personalizar el menu sin instrucciones que me lleven a editar `main.ts`.

**Why this priority**: La documentacion actual induce a romper la separacion objetivo. Actualizarla evita regresiones futuras aunque la arquitectura quede correctamente refactorizada.

**Independent Test**: Se valida siguiendo el quickstart actualizado para completar ejemplos de labels, submenu, ocultamiento opcional y accion custom sin editar `main.ts`.

**Acceptance Scenarios**:

1. **Given** un desarrollador lee el quickstart de personalizacion, **When** busca donde modificar el menu, **Then** encuentra el punto de configuracion/extensible definido por esta feature.
2. **Given** el quickstart existente y la nueva guia de esta feature incluyen ejemplos, **When** se revisan las instrucciones, **Then** no aparece la frase "wire it up in main.ts" ni una instruccion equivalente que indique editar `main.ts`.
3. **Given** se consulta la tabla de archivos clave, **When** se revisan los roles, **Then** `main.ts` figura solo como bootstrap/composition root y la personalizacion aparece asociada al punto OCP dedicado.

### Edge Cases

- Que ocurre si una configuracion intenta ocultar `file.exit`, que es obligatorio?
- Que ocurre si una configuracion intenta habilitar `themes.light` antes de la futura spec de tema claro?
- Que ocurre si una configuracion pide mostrar `view.devtools` fuera de desarrollo sin el flag runtime explicito?
- Que ocurre si una accion custom falla o no esta disponible al construir el menu, considerando que el error debe propagarse al manejador superior?
- Que ocurre si las preferencias persistidas estan ausentes, corruptas o contienen un valor de tema desconocido?
- Que ocurre si el renderer aun no esta listo cuando se actualizan estados de panel o se emiten senales de smoke/accessibility?
- Que ocurre si `SHELL.OPEN_EXTERNAL` recibe una URL cuyo origen no esta declarado en la allowlist configurable?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `main.ts` MUST quedar limitado a orquestar lectura de flags runtime, registro modular de handlers, creacion de ventana, inicializacion de tema, inicializacion de menu y lifecycle de Electron.
- **FR-002**: `main.ts` MUST NOT contener lectura directa de archivos de preferencias ni parseo directo de `preferences.json`.
- **FR-003**: El sistema MUST proveer un modulo compartido de persistencia de preferencias reutilizable por los handlers de preferencias y por el bootstrap de tema del main process.
- **FR-004**: El sistema MUST restaurar y aplicar el tema inicial mediante un servicio o inicializador dedicado, separado del bootstrap principal.
- **FR-005**: `main.ts` MUST NOT registrar handlers IPC inline mediante `ipcMain.handle` o `ipcMain.on` para menu, shell/sistema o preferencias.
- **FR-006**: El handler modular de menu MUST registrar al menos la accion `MENU.UPDATE_PANEL_STATE`.
- **FR-007**: La accion `SHELL.OPEN_EXTERNAL` MUST registrarse desde un handler dedicado de shell/sistema, denegar URLs externas por defecto y permitir solo origenes declarados en una allowlist configurable.
- **FR-008**: El sistema MUST exponer un punto estable de configuracion/extensibilidad del menu, con un nombre definido durante el diseno, que exporte una configuracion `IMenuConfig` o contrato equivalente.
- **FR-009**: Los integradores MUST poder cambiar labels, visibilidad, callbacks y submenus editando solo el punto de configuracion/extensibilidad del menu, sin modificar `main.ts`.
- **FR-010**: El sistema MUST incluir un inicializador de menu que reciba ventana/contexto runtime, use la configuracion del menu, configure el gestor de menu y aplique el menu nativo.
- **FR-011**: El gestor de menu MUST aceptar configuracion, un constructor de menu inyectado o una factory equivalente, de forma que no dependa siempre de crear un constructor predeterminado sin configuracion.
- **FR-012**: `MenuBuilder` MUST seguir siendo el nucleo estable de construccion del menu.
- **FR-013**: Las reglas obligatorias existentes MUST conservarse: `file.exit` no puede ocultarse; `themes.light` permanece deshabilitado hasta una futura spec; `view.devtools` solo aparece en desarrollo o cuando un flag runtime explicito lo permite.
- **FR-014**: Las senales de smoke/accessibility asociadas a la carga de ventana MUST aislarse en un modulo dedicado invocado por el bootstrap principal.
- **FR-015**: Las acciones custom del menu MUST propagar sus errores al manejador superior en lugar de convertirlos dentro del menu en notificaciones, logs obligatorios o estados silenciosos.
- **FR-016**: La documentacion de personalizacion del menu MUST actualizar el quickstart existente de `specs/005-native-menu-customization` y agregar la guia/contrato nuevo bajo `specs/006-refactor-native-menu`.
- **FR-017**: La documentacion y quickstarts de personalizacion del menu MUST ensenar el punto de extension correcto y MUST NOT indicar que se modifique `main.ts` para personalizar el menu.
- **FR-020**: El quickstart existente y la nueva guia MUST incluir ejemplos para cambiar labels, agregar un submenu top-level, ocultar una entrada opcional, conectar una accion custom y explicar que `main.ts` no se modifica.
- **FR-018**: La tabla de archivos clave en la documentacion MUST reflejar estos roles: `main.ts` como bootstrap/composition root; configuracion/extensibilidad de menu como punto OCP; inicializador de menu como aplicador del menu; handlers de menu como IPC de menu; store/repositorio de preferencias como persistencia compartida.
- **FR-019**: Las pruebas existentes MUST seguir pasando o actualizarse para cubrir la separacion entre bootstrap, handlers, persistencia compartida, inicializacion de tema, inicializacion de menu y personalizacion OCP.

### Key Entities *(include if feature involves data)*

- **Bootstrap Composition Root**: Punto de arranque que coordina modulos de Electron sin contener reglas de dominio, persistencia concreta, handlers inline ni personalizacion de menu.
- **Menu Extension Configuration**: Punto estable editado por integradores para declarar labels, visibilidad, submenus y acciones personalizadas.
- **Menu Initializer**: Coordinador de runtime que recibe la ventana y contexto de ejecucion, compone la configuracion de menu, prepara el gestor y aplica el menu nativo.
- **Menu Manager**: Servicio responsable de administrar rebuilds y aplicacion del menu, configurable por contrato o factory.
- **Menu Builder**: Nucleo estable que transforma la configuracion y el contexto en el menu nativo final, conservando reglas obligatorias.
- **Preference Store/Repository**: Abstraccion compartida de persistencia del main process para leer y escribir preferencias de forma consistente.
- **Theme Initializer**: Servicio que obtiene la preferencia de tema, valida el valor y aplica el estado inicial antes de que el menu dependa de el.
- **Modular IPC Handlers**: Modulos dedicados para registrar responsabilidades de menu, preferencias y shell/sistema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las revisiones de arquitectura confirman que `main.ts` no contiene lectura directa de preferencias, handlers IPC inline de menu/shell/preferencias ni instanciacion directa de personalizaciones de menu.
- **SC-002**: El 100% de los casos documentados de personalizacion del menu se completan modificando solo el punto de extension definido y sin editar `main.ts`.
- **SC-003**: Un desarrollador nuevo puede seguir el quickstart actualizado y completar los cuatro ejemplos requeridos en menos de 15 minutos.
- **SC-004**: El 100% de las reglas obligatorias del menu se mantienen en pruebas o revisiones: `file.exit` visible, `themes.light` deshabilitado y `view.devtools` restringido por entorno o permiso explicito.
- **SC-005**: Las pruebas automatizadas relevantes para menu, preferencias, handlers IPC y arranque pasan, o sus actualizaciones cubren todas las responsabilidades extraidas.
- **SC-006**: En escenarios de preferencias ausentes o invalidas, el arranque completa sin error no capturado y el menu se aplica con un tema seguro predeterminado.

## Assumptions

- Esta feature refactoriza la integracion del menu nativo existente; no cambia el alcance funcional del menu aprobado en `005-native-menu-customization`.
- La opcion de tema claro sigue visible pero deshabilitada hasta una futura spec.
- La personalizacion del menu esta dirigida a desarrolladores e integradores del repositorio, no a usuarios finales editando el menu en runtime.
- El nombre final del punto de configuracion/extensibilidad y de los inicializadores se definira durante la fase de plan, manteniendo nombres de codigo en ingles segun la constitucion.
- La documentacion actual de menu bajo `specs/005-native-menu-customization/` debe corregirse, y `specs/006-refactor-native-menu/` debe agregar la nueva guia/contrato para el punto OCP.
- No se agregaran dependencias externas nuevas salvo que una fase posterior justifique una excepcion compatible con la constitucion.
