# SwiftUI Sheet API Notes

## Why It Matters

The package targets native iOS sheet behavior and may host SwiftUI content. SwiftUI docs clarify presentation semantics and adaptation behavior.

## Key APIs

1. `sheet(item:onDismiss:content:)`: presents sheet based on optional identifiable item.
2. `presentationDetents(...)`: declares available detents and optional selected binding.
3. `presentationDragIndicator(...)`: controls drag indicator visibility.
4. `interactiveDismissDisabled(...)`: conditionally blocks gesture-based dismissal.
5. `presentationBackgroundInteraction(...)`: controls interaction with content behind the sheet.

## Behavioral Notes

1. Vertically compact environments can adapt to full-screen cover.
2. Programmatic dismissal semantics differ from gesture dismissal semantics.

## Implications for rn-bottom-sheet

1. Even with UIKit as the primary engine, API naming should align with expected SwiftUI semantics where practical.
2. Dismissal configuration should cleanly separate interactive vs programmatic control.
