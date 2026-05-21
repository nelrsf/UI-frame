# Research: Status Bar Mock Data

## Decision: JSON Configuration File Location and Loading Strategy

**Rationale**: The JSON configuration file (`status-bar-mocks.json`) will be placed in `src/assets/config/` and loaded during application initialization. This follows Angular's asset pipeline convention — files in `assets/` are copied to `dist/` during build and are accessible at runtime via HTTP fetch. Loading occurs through an Angular `APP_INITIALIZER` provider, ensuring the configuration is ready before the shell renders.

**Alternatives considered**:
- **Electron main process loading**: Would require IPC bridge, adding unnecessary complexity for a presentation-layer feature.
- **Hardcoded TypeScript constants**: Defeats the purpose of developer extensibility without code changes.
- **User home directory config**: Overkill for mock data; better suited for real user preferences.

## Decision: NgRx State Slice for Status Bar Items

**Rationale**: Per Constitution Principle III, all persistent state must flow through NgRx. A dedicated `status-bar` state slice will hold the loaded mock items. The JSON loader dispatches a `loadStatusBarItems` action on initialization. The status bar component selects items via NgRx selectors and passes them as `@Input()` bindings.

**Alternatives considered**:
- **Service-based state**: Would violate Principle III by bypassing NgRx for state management.
- **Component-local state**: Would make items non-reactive and unable to be updated by other parts of the system.

## Decision: Callback Registry Service

**Rationale**: A singleton `CallbackRegistryService` in the Angular root injector allows developers to register callbacks with string identifiers. The service provides `register(id, callback)` and `execute(id)` methods. When a clickable status bar item is clicked, the component dispatches a command via `CommandRegistryService`, which looks up the callback by ID and executes it. Error handling wraps the callback execution in a try/catch, dispatching an NgRx action on failure to trigger visual feedback.

**Alternatives considered**:
- **Direct function references in JSON**: Impossible since JSON cannot serialize functions.
- **Dynamic eval of code strings**: Security risk and violates Principle IV (Security).
- **NgRx Effects as callbacks**: Overly complex for simple click handlers; Effects are for side effects that affect state, not arbitrary developer callbacks.

## Decision: Visual Error Feedback Mechanism

**Rationale**: When a callback throws an error, the system dispatches a `statusBarCallbackError` action. The reducer sets an error state on the affected item (e.g., `color: 'error'` for a brief period). The status bar component renders this as a red color indicator. After 3 seconds, a cleanup action resets the color. This provides immediate, non-disruptive feedback to the user while logging the error for developers.

**Alternatives considered**:
- **Silent logging only**: Fails the spec requirement for user-visible feedback.
- **Toast notification**: Too disruptive for a status bar click error; toast system may not exist yet in the shell.
- **Modal dialog**: Excessive for a non-blocking error.

## Decision: Text Truncation Strategy

**Rationale**: Long text in status bar items will be truncated with CSS `text-overflow: ellipsis`. This is a presentation-only solution that requires no JavaScript logic. The CSS already supports this pattern in the existing status bar component styles. Maximum width per item is constrained by flex layout.

**Alternatives considered**:
- **JavaScript-based truncation**: Unnecessary complexity when CSS handles it natively.
- **Scrolling marquee**: Distracting and poor UX for a status bar.
