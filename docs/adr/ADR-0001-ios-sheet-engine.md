# ADR-0001: Use UISheetPresentationController as v1 Engine

- Status: Accepted
- Date: 2026-02-12

## Context

The library goal is native-feeling iOS sheet behavior from React Native with
deterministic control over open state, lifecycle callbacks, and detent changes.
The implementation must preserve New Architecture compatibility, support React
Native child content in-sheet, and keep unsupported behavior explicit.

## Decision

Use `UISheetPresentationController` as the primary presentation engine for v1.

The v1 architecture standardizes on:

1. `BottomSheet` wrapper component as the public control surface (controlled and
   uncontrolled open state + imperative ref methods).
2. Nitro host component (`BottomSheetNativeView`/`RnBottomSheetView`) as the JS
   to native bridge boundary.
3. Deterministic detent normalization and callback reason mapping
   (`programmatic`, `swipe`, `backdrop`, `system`) at the JS contract boundary.
4. Single active sheet session as the product constraint in v1 unless amended.
5. Explicit non-iOS fallback behavior (no crash, render children, warn in dev).

## Integration Boundaries

### Navigation

- Keep core implementation navigation-agnostic.
- Provide optional adapter utilities (`createBottomSheetNavigationAdapter`,
  `useBottomSheetNavigation`) for route-to-sheet synchronization.

### Animation

- Support `createAnimatedComponent` compatibility for public wrapper/native host
  surfaces.
- Limit claims to supported prop pathways and avoid promising frame-by-frame
  control of UIKit internal transition mechanics.

## Consequences

1. Native iOS behavior fidelity remains the primary quality bar.
2. Public integration contract is explicit and testable across JS/native layers.
3. Cross-platform safety is improved by deterministic non-iOS fallback behavior.
4. Some advanced transition-animation expectations are explicitly out of scope
   for v1 and must remain documented as such.

## Related Artifacts

- `docs/implementation-plan-v1.md`
- `docs/references/ios-sheet-apis.md`
- `docs/references/reanimated-interop.md`
- `specs/001-native-ios-sheet-bindings/spec.md`
