# Data Model: Example Sheet Stability and Testability

## Entity: ExampleSheetSessionState

- Purpose: Represents the presentation lifecycle and detent state for the example sheet.
- Fields:
  - `isRequestedOpen` (boolean)
  - `phase` (`closed` | `opening` | `open` | `dismissing`)
  - `selectedDetentIndex` (number)
  - `currentDetentIndex` (number)
  - `lastOpenChangeReason` (`programmatic` | `swipe` | `backdrop` | `system`)
- Validation Rules:
  - Repeated open requests while `phase` is `opening` or `open` are no-op.
  - Exactly one active sheet instance is allowed.
  - Detent indexes must map to configured detents.
- State Transitions:
  - `closed -> opening -> open`
  - `open -> dismissing -> closed`
  - `open -> open` on detent changes
  - `opening/open + openRequest -> opening/open` (no-op)

## Entity: ExampleRouteState

- Purpose: Tracks in-sheet route shown by the example app.
- Fields:
  - `inSheetRoute` (`summary` | `details`)
- Validation Rules:
  - Route resets to `summary` when sheet fully closes.
  - Parent-screen summary text must match current route value.

## Entity: ExampleThemeModeState

- Purpose: Controls app-wide visual mode for deterministic testing.
- Fields:
  - `themeMode` (`light` | `dark`)
- Validation Rules:
  - Mode applies to parent and sheet content in the same interaction cycle.
  - Theme changes must preserve active sheet interaction continuity.

## Entity: InSheetControlSurface

- Purpose: Defines controls exposed inside the sheet for behavior testing.
- Fields:
  - `actions` (close, snap-fit, snap-medium, snap-large, toggle-grabber, toggle-swipe-dismiss, toggle-expand-on-scroll, cycle-background-interaction, route-forward, route-back)
  - `visibility` (boolean; true only while sheet is visible)
- Validation Rules:
  - Required testing actions must be reachable while sheet is open.
  - Parent screen retains only global open trigger and state summary.

## Entity: VerificationEvidence

- Purpose: Captures completion evidence for constitution-required verification.
- Fields:
  - `jestIntegrationResult` (pass/fail + command)
  - `maestroFlowResults` (pass/fail per flow)
  - `notesLocation` (`tasks/todo.md` and feature review notes)
- Validation Rules:
  - Feature cannot be marked complete without passing Maestro flows.
