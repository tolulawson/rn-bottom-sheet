# ADR-0001: Use UISheetPresentationController as v1 Engine

- Status: Accepted
- Date: 2026-02-12

## Context

The library goal is native-feeling iOS sheet behavior from React Native with tight control over detents and lifecycle.

## Decision

Use `UISheetPresentationController` as the primary presentation engine for v1.

## Consequences

1. Strong native behavior parity for iOS sheet UX.
2. Clear mapping to iOS detent and dimming APIs.
3. Requires explicit handling of RN child-content hosting in native view hierarchy.
