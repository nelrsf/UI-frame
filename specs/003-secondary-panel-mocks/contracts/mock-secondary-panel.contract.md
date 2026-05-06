# Contract: Secondary Panel Mock Modules (Weather + Market)

## Purpose

Define acceptance contract for mock content rendered inside the shell secondary panel.

## Registration Contract

- Exactly two secondary entries are registered for this feature scope:
  - Weather
  - Market
- Both entries use fake-only datasets and no external integrations.

## Active Entry Contract

- On first open (when both entries are available), Weather is active by default.
- Selecting one entry deactivates the other; only one active view is rendered at a time.
- If active entry becomes invalid/unavailable, system auto-selects another valid entry.
- If no entries are available, secondary panel remains visible with controlled empty state.

## Rendering Contract

- Secondary panel content region renders active entry with dynamic component composition (`NgComponentOutlet`).
- No hardcoded template branching per entry id is allowed.

## Layout Contract

- Collapsing secondary panel releases width for adjacent shell regions.
- Re-expanding restores coherent layout without persistent gaps or overlaps.
- Collapse/expand does not corrupt active-entry validity rules.

## Data Contract

- Weather and Market values must be clearly fake/non-production.
- Content is local and deterministic enough for manual validation.

## Review Contract

A contribution is acceptable only if:

1. Exactly two entries (Weather/Market) are present.
2. Active-entry default/fallback behavior matches clarified rules.
3. Empty-state behavior is visible and controlled when no entries exist.
4. Shell layout behavior remains stable through collapse/expand cycles.
