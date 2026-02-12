# React Navigation Form Sheet Notes

## Why It Matters

Consumers need navigation interoperability with native sheet presentation.

## Key Observations (Native Stack)

1. `presentation: 'formSheet'` exists in native stack docs and exposes sheet-related options.
2. Options include `sheetAllowedDetents`, `sheetGrabberVisible`, and related behavior controls.
3. Docs call out known platform integration limitations for some `flex: 1` and nested scenarios.

## Nesting Behavior

1. Navigation actions are handled by the current navigator first, then bubble to parents.
2. In nested sheet flows, `goBack()` behavior must be coordinated to avoid unexpected dismiss/pop ordering.

## Implications for rn-bottom-sheet

1. Keep core package navigation-agnostic.
2. Provide optional adapter utilities for open/dismiss synchronization with route state.
3. Document caveats for nested stack behavior inside sheet content.
