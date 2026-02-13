# iOS Sheet API Reference (UIKit + SwiftUI)

## Why It Matters

`UISheetPresentationController` is the v1 sheet engine for rn-bottom-sheet. Every behavior, limitation, and capability of the library maps directly to this API. Understanding the native model is essential for debugging content rendering issues and designing correct bridging code.

## Mental Model: View Controller Presentation, Not View Reparenting

The single most important concept: **UISheetPresentationController is a presentation controller that manages how a UIViewController is displayed -- it is not a view.** You do not add subviews to a sheet. You present a view controller, and its entire view hierarchy appears inside the sheet chrome (grabber, dimming backdrop, rounded corners).

```
┌─────────────────────────────────────────┐
│  Presenting VC (e.g. your app root)     │
│                                         │
│   presentingVC.present(contentVC, ...)  │
│         │                               │
│         ▼                               │
│  ┌──────────────────────────────────┐   │
│  │  UISheetPresentationController   │   │
│  │  (manages container + chrome)    │   │
│  │                                  │   │
│  │  ┌────────────────────────────┐  │   │
│  │  │  contentVC.view            │  │   │
│  │  │  (your content here)       │  │   │
│  │  │  ┌──────────────────────┐  │  │   │
│  │  │  │  subview: label      │  │  │   │
│  │  │  │  subview: button     │  │  │   │
│  │  │  │  subview: scrollView │  │  │   │
│  │  │  └──────────────────────┘  │  │   │
│  │  └────────────────────────────┘  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

In standard UIKit usage, **the content VC owns its own view hierarchy from creation**. Views are never moved from one parent to another. The presentation controller wraps the content VC's view inside a container view that it manages.

## Core API: UISheetPresentationController (iOS 15+)

### Access Pattern

Every `UIViewController` has a `sheetPresentationController` property. It returns a non-nil value when the VC's `modalPresentationStyle` is `.pageSheet` or `.formSheet` (the default).

```swift
let contentVC = MyContentViewController()

if let sheet = contentVC.sheetPresentationController {
    sheet.detents = [.medium(), .large()]
    sheet.prefersGrabberVisible = true
}

presentingVC.present(contentVC, animated: true)
```

### Detents (Resting Heights)

Detents define the heights where the sheet can rest. The user can drag between them.

| Detent | Availability | Description |
|--------|-------------|-------------|
| `.medium()` | iOS 15+ | Approximately half the screen height |
| `.large()` | iOS 15+ | Full screen minus safe area |
| `.custom(identifier:resolver:)` | iOS 16+ | Arbitrary height via closure receiving a `ResolutionContext` |

The resolver closure receives a `context` with `maximumDetentValue` (the largest possible height). Return a `CGFloat` for the desired height:

```swift
let fitDetent = UISheetPresentationController.Detent.custom(identifier: .init("fit")) { context in
    return min(300, context.maximumDetentValue)
}
sheet.detents = [fitDetent, .medium(), .large()]
```

Detents are applied in sorted order internally. The first detent in the array is the initial resting position.

### Key Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `detents` | `[Detent]` | `[.large()]` | Available resting heights. Order must be low-to-high. |
| `selectedDetentIdentifier` | `Detent.Identifier?` | `nil` | Currently active detent. Set to programmatically snap. |
| `largestUndimmedDetentIdentifier` | `Detent.Identifier?` | `nil` | Largest detent that does not dim the background. `nil` means all detents dim (modal). Set to `.large` for fully non-modal. |
| `prefersGrabberVisible` | `Bool` | `false` | Shows a drag affordance at the top of the sheet. |
| `prefersScrollingExpandsWhenScrolledToEdge` | `Bool` | `true` | When `true`, scrolling a scroll view at the top edge expands the sheet to the next detent instead of scrolling content. |
| `preferredCornerRadius` | `CGFloat` | system default | Corner radius of the sheet. Negative values use the system default. |

### Content Styling + Color Scheme (Hosted Content VC)

UIKit sheet APIs style the presented container indirectly through the presented view controller:

- `overrideUserInterfaceStyle` on the presented content VC controls `system`/`light`/`dark` appearance.
- Content background can be rendered as:
  - `system`: `view.backgroundColor = .systemBackground`
  - `clear`: `view.backgroundColor = .clear`
  - `blur`: background `UIVisualEffectView` using `UIBlurEffect.Style` (`regular`/`prominent`/`light`/`dark`)

Limitations:

- Standard `UISheetPresentationController` does not expose first-class API for configurable backdrop blur opacity/strength.
- Custom dimming/backdrop material tuning is outside common iPhone scope for this library iteration.

### animateChanges(_:)

Batched property mutations should be wrapped in `animateChanges` for smooth, coordinated transitions:

```swift
sheet.animateChanges {
    sheet.selectedDetentIdentifier = .large
    sheet.prefersGrabberVisible = false
}
```

### Delegate: UISheetPresentationControllerDelegate

```swift
func sheetPresentationControllerDidChangeSelectedDetentIdentifier(
    _ sheetPresentationController: UISheetPresentationController
)
```

Called when the user drags to a new detent. Not called for programmatic changes via `selectedDetentIdentifier`.

### Background Interaction (Non-Modal Sheets)

Setting `largestUndimmedDetentIdentifier` controls which detents allow interaction with content behind the sheet:

- `nil` (default): All detents are modal (background dimmed, no interaction).
- `.medium`: Background is interactive when sheet is at medium or smaller. Dimmed at large.
- `.large`: Background is always interactive (fully non-modal).
- Custom identifier: Background is interactive up through that detent.

## Navigation Inside a Sheet

You can embed a `UINavigationController` as the presented VC to get push/pop navigation inside the sheet:

```swift
let detailVC = DetailViewController()
let navController = UINavigationController(rootViewController: detailVC)

if let sheet = navController.sheetPresentationController {
    sheet.detents = [.medium(), .large()]
}

present(navController, animated: true)
```

The navigation stack operates entirely within the sheet. Pushing a new VC onto the stack replaces the visible content inside the same sheet container.

## Dismissal

### Dismiss Triggers

1. **Interactive (swipe)**: User drags the sheet down past the dismiss threshold. Controlled by `isModalInPresentation` on the content VC (`true` disables swipe dismiss).
2. **Programmatic**: Call `contentVC.dismiss(animated: true)`.
3. **Backdrop tap**: When the sheet is modal (dimmed), tapping the dimmed area dismisses. Non-modal sheets have no backdrop to tap.
4. **System**: iOS may dismiss for memory pressure or other system reasons.

### Lifecycle Callbacks

The `UIPresentationController` delegate provides:
- `presentationControllerWillDismiss(_:)` -- called before interactive dismiss begins
- `presentationControllerDidDismiss(_:)` -- called after dismiss completes
- `presentationControllerDidAttemptToDismiss(_:)` -- called when dismiss is blocked by `isModalInPresentation`

The presented VC receives standard `viewWillDisappear` / `viewDidDisappear` calls, with `isBeingDismissed` returning `true`.

## SwiftUI Equivalent

SwiftUI's `.sheet()` modifier wraps UIKit's presentation system:

```swift
.sheet(isPresented: $showSheet) {
    SheetContent()
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
}
```

Key difference from UIKit: **SwiftUI creates content fresh for each presentation** via the content closure. It does not move existing views.

SwiftUI detent types:
- `.medium`, `.large` -- semantic sizes
- `.fraction(CGFloat)` -- percentage of screen (0.0 to 1.0)
- `.height(CGFloat)` -- fixed point value

## Implications for rn-bottom-sheet

1. **The native sheet expects to own a content VC with its own view hierarchy.** It does not expect views to be moved from elsewhere.
2. **Detent mapping must be deterministic.** JS detent identifiers need stable mapping to native `Detent.Identifier` values.
3. **Events must distinguish dismiss reasons.** Interactive (swipe), programmatic, backdrop tap, and system dismissals have different delegate paths.
4. **Background interaction defaults to modal.** Non-modal requires explicit `largestUndimmedDetentIdentifier` configuration.
5. **`animateChanges` should batch property updates.** The library's `beforeUpdate`/`afterUpdate` pattern maps to this.
6. **Reparenting views into the modal conflicts with the standard UIKit pattern.** See ADR-0002 for the architectural implications.

## Common iPhone Option Parity Matrix

| Option | rn-bottom-sheet status | Scope note |
|---|---|---|
| Detents (`fit`/`medium`/`large`/custom fraction/custom points) | Implemented | Deterministic normalization and identifier mapping. |
| Initial/selected detent | Implemented | Controlled + uncontrolled detent flows. |
| Grabber visibility | Implemented | Maps to `prefersGrabberVisible`. |
| Swipe dismiss | Implemented | Mapped via modal-in-presentation control. |
| Scroll expansion behavior | Implemented | Maps to `prefersScrollingExpandsWhenScrolledToEdge`. |
| Background interaction | Implemented | Uses `largestUndimmedDetentIdentifier`. |
| Corner radius | Implemented | Uses `preferredCornerRadius`. |
| Preferred color scheme | Implemented | `system` / `light` / `dark` on hosted VC. |
| Content background style + blur style | Implemented | `system` / `blur` / `clear` + supported blur presets. |
| iPad/compact-height edge-attached width-following options | Deferred | Explicit non-goal for current feature scope. |

## Sources

- [Apple: UISheetPresentationController](https://developer.apple.com/documentation/uikit/uisheetpresentationcontroller)
- [Apple: Customize and resize sheets in UIKit (WWDC 2021)](https://developer.apple.com/videos/play/wwdc2021/10063/)
- [AppCoda: Displaying a Bottom Sheet in iOS 15](https://www.appcoda.com/bottom-sheet-uikit/)
- [SwiftLee: Presenting sheets with UIKit](https://avanderlee.com/swift/presenting-sheets-uikit-uisheetpresentationcontroller)
