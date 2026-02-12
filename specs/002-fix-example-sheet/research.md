# Research: Example Sheet Stability and Testability

## Decision 1: Duplicate Open Handling

- Decision: Treat repeated `Open Sheet` actions as idempotent while the sheet is already opening/open (no-op).
- Rationale: Prevents double presentation race conditions and aligns with clarified requirement.
- Alternatives considered:
  - Close-and-reopen on repeated open: rejected due to visual jitter and state churn.
  - Queue delayed reopen requests: rejected as unnecessary complexity for this feature.

## Decision 2: Control Surface Placement

- Decision: Keep only global controls and summary information on the main screen; move behavior-testing controls into sheet content.
- Rationale: Ensures controls remain accessible during active sheet presentation and improves in-context testing.
- Alternatives considered:
  - Keep all controls on parent screen: rejected because controls are obstructed by the sheet.
  - Duplicate controls both inside and outside sheet: rejected due to inconsistency and maintenance overhead.

## Decision 3: Theme Strategy for Deterministic Testing

- Decision: Implement explicit app-level Light/Dark toggle for the example app session and apply theme consistently to both parent and in-sheet surfaces.
- Rationale: Produces deterministic behavior for Maestro scenarios and simplifies acceptance verification.
- Alternatives considered:
  - System-only theme following: rejected for inconsistent automation behavior across environments.
  - Three-state (System/Light/Dark): deferred to future scope; unnecessary for current acceptance goals.

## Decision 4: State Ownership and Sync Rules

- Decision: Keep sheet open state, detent selection, in-sheet route, and theme mode in top-level app state; pass state and actions down to in-sheet control components.
- Rationale: Single source of truth avoids drift between parent summary and in-sheet behavior.
- Alternatives considered:
  - Localized sheet-internal state ownership: rejected due to harder synchronization and test observability.

## Decision 5: Verification Strategy

- Decision: Use two-layer verification:
  1. Jest integration coverage for behavior contracts and callback/state sync.
  2. Maestro E2E flows as feature completion gate for affected user journeys.
- Rationale: Fast iteration from Jest plus realistic end-to-end coverage for final acceptance.
- Alternatives considered:
  - Maestro-only validation: rejected due to slow feedback for development loops.
  - Jest-only validation: rejected because it cannot prove full interactive behavior on device/simulator.

## Decision 6: Maestro Gating Timing

- Decision: Require Maestro pass before marking this feature complete, while allowing intermediate implementation commits before final gate.
- Rationale: Satisfies constitution completion gate without stalling iterative dev loops.
- Alternatives considered:
  - Gate every small iteration on full Maestro suite: rejected due to low iteration speed.
  - Make Maestro optional: rejected by constitution requirements.

## Decision 7: Documentation Sync Scope

- Decision: README update is not required unless implementation changes public API or externally documented usage behavior.
- Rationale: Feature is scoped to example-app architecture and validation behavior.
- Alternatives considered:
  - Mandatory README edit for every example change: rejected as noisy and not policy-aligned.
