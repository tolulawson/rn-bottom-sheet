# Research: Native iOS Sheet Bindings

## Decision 1: Primary Native Presentation Engine

- Decision: Use UIKit sheet presentation semantics as the runtime behavior source for v1.
- Rationale: Deterministic detent control, lifecycle callbacks, and native interaction fidelity are critical.
- Alternatives considered:
  - Pure declarative sheet presentation abstraction: rejected due to weaker deterministic control for required API contract.

## Decision 2: Public API State Model

- Decision: Support both controlled (`isOpen`) and imperative (`present`, `dismiss`, `snapToDetent`) access.
- Rationale: Consumers need declarative state for app architecture and imperative controls for orchestration edge cases.
- Alternatives considered:
  - Controlled-only API: rejected due to practical orchestration limits.
  - Imperative-only API: rejected due to reduced integration with declarative app state.

## Decision 3: Content Hosting Strategy

- Decision: Support arbitrary React Native child content within the presented sheet.
- Rationale: This is required product behavior and the primary differentiation goal.
- Alternatives considered:
  - Native-only content: rejected as insufficient for consumer use cases.

## Decision 4: Navigation Integration Boundary

- Decision: Keep core package navigation-agnostic and provide optional integration helpers.
- Rationale: Reduces coupling while preserving integration support.
- Alternatives considered:
  - Hard dependency in core: rejected due to upgrade and compatibility risk.

## Decision 5: Reanimated Scope

- Decision: Document supported compatibility pathways only; avoid broad parity claims.
- Rationale: Prevents over-promising unsupported transition control.
- Alternatives considered:
  - Full parity target: rejected for v1 scope and predictability risks.

## Decision 6: Non-iOS Behavior

- Decision: Provide explicit deterministic fallback on non-iOS and document unsupported parity.
- Rationale: Ensures cross-platform safety without pretending feature parity.
- Alternatives considered:
  - Hard runtime error: rejected due to poor developer ergonomics.
