# iOS Sheet API Notes (UIKit)

## Why It Matters

`UISheetPresentationController` is the chosen v1 sheet engine, so all behavior maps to this API.

## Core API Surface

1. `detents`: set available resting heights; order must be low-to-high.
2. `selectedDetentIdentifier`: current selected detent.
3. `largestUndimmedDetentIdentifier`: largest undimmed detent for nonmodal interaction windows.
4. `prefersGrabberVisible`: toggles top grabber affordance.
5. `prefersScrollingExpandsWhenScrolledToEdge`: controls scroll-to-expand behavior.
6. `animateChanges(_:)`: atomic animated mutation of sheet properties.

## Behavioral Notes

1. Default interaction is modal unless undimmed behavior is configured.
2. Detent changes should be batched in `animateChanges` where possible.
3. Keyboard/system layout changes can affect effective presented size.

## Implications for rn-bottom-sheet

1. JS detent model needs deterministic mapping to native identifiers.
2. Event bridge should report detent transitions and dismiss reasons.
3. Background interaction defaults to modal in v1 for predictable UX.
