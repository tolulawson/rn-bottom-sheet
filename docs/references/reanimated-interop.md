# Reanimated Interop Notes

## Why It Matters

The library should work with Reanimated where feasible without overpromising unsupported native transition control.

## Key APIs

1. `createAnimatedComponent` can wrap custom host components.
2. Function components wrapped this way require `React.forwardRef()`.
3. `useAnimatedProps` supports prop animation pathways and adapters for mismatched prop surfaces.

## Constraints

1. Not every native behavior maps cleanly to fully controlled frame-by-frame animation.
2. Some prop types require native-side compatibility or adapter logic.

## Implications for rn-bottom-sheet

1. Officially support animated wrapping of host component.
2. Explicitly document which props/methods are animation-safe.
3. Avoid claiming full control over native sheet transition internals in v1.
