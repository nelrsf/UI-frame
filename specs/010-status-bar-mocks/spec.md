# Feature Specification: Status Bar Mock Data

**Feature Branch**: `[010-status-bar-mocks]`  
**Created**: 2026-05-20  
**Status**: Draft  
**Input**: User description: "Vamos a hacer una spec para probar el status bar (la barra inferior), vamos a colocarle informacion mock a la barra de estado. Tambien dajar un quick start para qyue el usuario dev pueda añadir informacion, El usuario puede seleccionar si la info es clickeable y lanza un callback"

## Clarifications

### Session 2026-05-20

- Q: What configuration format should developers use to add custom status bar items? → A: JSON configuration file (e.g., `status-bar-mocks.json`)
- Q: How should clickable items reference their callbacks in JSON configuration? → A: String identifier in JSON mapped to pre-registered callback functions in code
- Q: What user feedback should occur when a callback fails? → A: Show a subtle visual indicator (e.g., icon color change or brief toast) in the status bar

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Mock Status Bar Items (Priority: P1)

As a developer testing the UI frame, I want to see mock information displayed in the status bar so that I can verify the status bar renders correctly with different types of content.

**Why this priority**: This is the core functionality — without mock data display, there is no way to test or validate the status bar behavior.

**Independent Test**: Can be fully tested by launching the application and observing that mock items appear in the status bar with correct formatting and positioning.

**Acceptance Scenarios**:

1. **Given** the application is running with mock data enabled, **When** the status bar is rendered, **Then** mock items are displayed with their configured text and position
2. **Given** multiple mock items are configured, **When** the status bar renders, **Then** items are displayed in their designated sections (left, center, right)

---

### User Story 2 - Add Custom Status Bar Items via Quick Start (Priority: P2)

As a developer, I want a quick start guide that shows me how to add my own status bar items so that I can extend the status bar with custom information relevant to my use case.

**Why this priority**: Enables extensibility and developer adoption — the mock system is only useful if developers can easily add their own items.

**Independent Test**: Can be fully tested by following the quick start guide to add a new status bar item and verifying it appears correctly.

**Acceptance Scenarios**:

1. **Given** the quick start documentation is available, **When** a developer follows the steps to add a custom item, **Then** the item appears in the status bar without requiring code changes to the core system
2. **Given** a developer wants to remove a custom item, **When** they follow the removal steps, **Then** the item is no longer displayed

---

### User Story 3 - Configure Clickable Status Bar Items (Priority: P3)

As a developer, I want to configure status bar items as clickable with custom callbacks so that users can interact with status bar items to trigger actions.

**Why this priority**: Adds interactivity to the status bar, enabling richer user experiences and quick access to commands or information.

**Independent Test**: Can be fully tested by clicking a configured clickable item and verifying the associated callback is executed.

**Acceptance Scenarios**:

1. **Given** a status bar item is configured as clickable with a callback, **When** the user clicks the item, **Then** the callback is executed
2. **Given** a status bar item is configured as non-clickable, **When** the user hovers over the item, **Then** no click cursor is shown and clicking has no effect
3. **Given** a clickable item has a tooltip configured, **When** the user hovers over the item, **Then** the tooltip is displayed

---

### Edge Cases

- What happens when a mock item has text that is too long to fit in its designated section?
- How does the system handle callbacks that throw errors when a clickable item is clicked?
- What happens when the status bar is resized and items need to be repositioned?
- How does the system handle duplicate item IDs?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display mock status bar items with configurable text content
- **FR-002**: System MUST support positioning items in left, center, and right sections of the status bar
- **FR-003**: System MUST provide a JSON configuration file mechanism for developers to add custom status bar items without modifying core code
- **FR-004**: System MUST allow developers to configure items as clickable or non-clickable
- **FR-005**: System MUST execute a developer-provided callback when a clickable item is activated, using a string identifier in the JSON configuration that maps to a pre-registered callback function
- **FR-006**: System MUST visually distinguish clickable items from non-clickable items (e.g., cursor change on hover)
- **FR-007**: System MUST support tooltips for status bar items
- **FR-008**: System MUST handle long text gracefully by truncating or ellipsizing overflow
- **FR-009**: System MUST handle callback errors without crashing the application and display a subtle visual indicator in the status bar when a callback fails
- **FR-010**: System MUST provide a callback registry mechanism for developers to associate string identifiers with callback functions

### Key Entities

- **Status Bar Item**: Represents a single piece of information displayed in the status bar. Has properties: text content, position (left/center/right), clickable flag, callback function, tooltip text, and unique identifier
- **Status Bar**: The container that holds and renders status bar items in their designated positions
- **Mock Configuration File**: A JSON file (`status-bar-mocks.json`) that defines the array of status bar items with their properties and callback string identifiers
- **Callback Registry**: A mechanism for developers to register callback functions with string identifiers that can be referenced by the JSON configuration

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can add a new status bar item in under 2 minutes following the quick start guide
- **SC-002**: Mock status bar items render within 100ms of application launch
- **SC-003**: Clickable items trigger their callbacks within 50ms of user click
- **SC-004**: 100% of callback errors are caught, logged, and trigger a visual indicator within 200ms without crashing the application
- **SC-005**: Developers can successfully configure at least 3 different types of status bar items (text-only, clickable, with tooltip) using the quick start

## Assumptions

- The status bar UI component already exists and this feature only adds mock data and configuration capabilities
- Developers have basic familiarity with the project's configuration format
- The quick start will be provided as a sample JSON configuration file with documentation
- Callbacks are executed in the same process context as the UI frame
- The status bar supports at least three positioning sections (left, center, right)
