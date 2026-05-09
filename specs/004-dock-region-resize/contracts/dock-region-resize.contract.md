# Contract: Dock Region Resize

## Purpose

Define behavior, scope limits, and event contract for dock-region resize in Shell v1.

## Resizable Scope Contract

Allowed:
- Bottom Panel internal boundary.
- Secondary Panel internal boundary.
- Primary Workspace size as derived consequence of allowed boundary resize.

Forbidden:
- Sidebar resize behavior.
- Activity Bar, Toolbar, Status Bar resize behavior.
- External window-edge resize behavior (native Electron/OS only).

## Interaction Contract

- Resize interaction starts only from explicit internal splitter hit zones.
- Splitter hover shows native cursor state:
  - Horizontal splitter: `ns-resize`
  - Vertical splitter: `ew-resize`
- Outside allowed splitters, no resize cursor is shown.

## State Contract (NgRx)

- Drag-phase values are local/transient.
- Committed values are written to NgRx only at interaction end.
- Region dimensions are integer pixels.
- Min/max bounds are enforced per region.

## EventBus Contract

- Event name: `shell.region.resized.v1`
- Emission timing: commit only (on drag end with valid value).
- Payload must satisfy [IRegionResizeEvent.ts](./IRegionResizeEvent.ts).
- Listener failures are isolated and must not block resize flow or other listeners.

## Acceptance Contract

A contribution is acceptable only if:

1. Resize works for Bottom and Secondary dock boundaries and updates workspace space coherently.
2. Forbidden regions show no functional resize affordance.
3. NgRx is updated only on commit.
4. `shell.region.resized.v1` emits exactly once per committed interaction with valid integer-pixel payload.
5. Cursor behavior matches allowed splitter orientation and resets outside hit zones.

## Implementation Status (spec 004)

- `shell.region.resized.v1` added to `AppEventName` and `AppEventPayloads` in `app-event.model.ts`.
- `DockRegionId` type exported from `app-event.model.ts`.
- Integer normalization (`Math.round`) applied in `layout.reducer.ts` before clamping for `setBottomPanelHeight` and `setSecondaryPanelWidth`.
- Bottom and secondary splitter handles added to `shell.component.html` with pointer event wiring.
- Draft CSS vars during drag use `BehaviorSubject` in `ShellComponent`; NgRx dispatch and EventBus emit happen only on `pointerup` commit.
- Cursor styles: `ns-resize` on `.bottom-splitter-handle`, `ew-resize` on `.secondary-splitter-handle`.
- Non-resizable regions (toolbar, tabbar, statusbar, sidebar) retain `cursor: default`.
