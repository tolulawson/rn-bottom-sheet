# React Native: Patterns for Rendering RN Children Inside Native Modals/Sheets

## Problem Statement

React Native's Fabric reconciler owns the native view hierarchy. When a native component needs to present RN children inside a system modal (sheet, dialog, popover), the children must somehow appear inside the modal's view hierarchy, which is managed by UIKit -- not Fabric.

This is the **content routing problem**: how do you get React-managed views into a native container that exists outside the React view tree?

## Pattern 1: Reparenting (Move Host View)

**Used by:** rn-bottom-sheet (current implementation)

The Nitro host view (which contains React children as subviews) is physically moved from the React tree into the modal's view hierarchy via `addSubview`.

```
Mount:   React tree → HostView → [RN children]
Present: React tree → (empty)     Modal → HostView → [RN children]
Dismiss: React tree → HostView → [RN children]     Modal → (torn down)
```

### Pros
- Simplest to implement: one line of native code to move the view.
- Children are genuine React Native views with full interactivity (gesture responders, Reanimated nodes, text inputs all work).
- Zero performance overhead -- no copying, no proxy views.

### Cons
- Conflicts with Fabric's view ownership model. Fabric expects to manage the superview chain.
- Requires `HOST_HIDDEN_STYLE` workaround to hide children when the sheet is not open.
- Post-dismiss orphan window: the host view has no superview until Fabric reconciles.
- `didMoveToWindow` lifecycle events fire unexpectedly, triggering attach/detach state that can block reopening.

## Pattern 2: ViewGroupManager.addView Override (Route Children)

**Used by:** [Shopify RN native components](https://shopify.engineering/creating-native-components-accept-react-native-subviews) (Android)

The native `ViewGroupManager` overrides `addView()` to intercept Fabric's child mounting and route children to specific containers within a native layout -- instead of the default parent.

```java
@Override
public void addView(ViewGroup parent, View child, int index) {
    if (child instanceof MySpecialContent) {
        parent.getModalContainer().addView(child, index);
    } else {
        super.addView(parent, child, index);
    }
}
```

### Pros
- Works with Fabric's addView/removeView lifecycle -- no reparenting.
- Children are real RN views with full interactivity.
- Multiple routing targets (e.g., header slot, content slot, footer slot).

### Cons
- Android-only pattern (ViewGroupManager is an Android concept).
- Requires knowing at mount time which container to route to.
- On iOS, the equivalent would require overriding `mountChildComponentView:index:` on the Fabric component, which is possible but not well-documented.

### iOS Adaptation

For an iOS Fabric component, the equivalent pattern would override `mountChildComponentView:index:` to route children to the modal's content view instead of `self`:

```objc
- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol>*)childComponentView index:(NSInteger)index {
    if (self.isPresenting) {
        [self.contentVC.view insertSubview:childComponentView atIndex:index];
    } else {
        [super mountChildComponentView:childComponentView index:index];
    }
}
```

This avoids the reparenting issue because Fabric calls `mountChildComponentView` as part of its normal reconciliation, and we redirect the destination.

## Pattern 3: UIHostingController Wrapping (SwiftUI Bridge)

**Used by:** [react-native-ios-modal](https://github.com/dominicstop/react-native-ios-modal) (iOS)

A `UIHostingController` wraps the content for modal presentation. The RN views are placed inside a SwiftUI `UIViewRepresentable` wrapper, which is then hosted by the `UIHostingController` that is presented as the modal.

```swift
let content = UIHostingController(rootView: RNViewWrapper(rnView: hostView))
present(content, animated: true)
```

### Pros
- Uses standard SwiftUI presentation APIs.
- Compatible with SwiftUI navigation (NavigationStack inside the sheet).
- The hosting controller owns the content, aligning with UIKit's presentation model.

### Cons
- Adds a SwiftUI dependency and an extra hosting layer.
- Still requires moving or wrapping the RN view -- doesn't fully solve the ownership problem.
- Performance overhead from the SwiftUI hosting bridge.
- The RN view is still reparented into the hosting controller's view hierarchy.

## Pattern 4: JS-Only Sheet (No Native Modal)

**Used by:** [@gorhom/react-native-bottom-sheet](https://github.com/gorhom/react-native-bottom-sheet)

The sheet is implemented entirely in React Native using `react-native-gesture-handler` and `react-native-reanimated`. No native modal is used. The sheet is a React component rendered in the same React tree as the rest of the app.

```
React tree → App content
           → BottomSheet (animated View)
              → [children]
```

### Pros
- No content routing problem at all -- children are normal React children in the same tree.
- Full control over gestures, animations, detents via JS/Reanimated.
- Cross-platform by default.
- No Fabric reconciliation conflicts.

### Cons
- Does not use native `UISheetPresentationController` -- loses native sheet chrome (grabber, dimming, corner radius, detent snapping physics).
- Sheet overlay is in the React tree, not a system modal -- it can be obscured by other native views (keyboards, alerts, system sheets).
- Gesture conflict resolution with scroll views requires significant custom code.
- Performance can be worse for complex sheets with many animated values.

## Pattern 5: Portal / Separate React Root

**Used by:** react-native-modal (conceptually), various custom implementations

A separate React Native root is created inside the native modal's view hierarchy. The "children" are rendered into this separate root via a portal pattern.

```
React Root 1: App content → <SheetPortal children={...} />
React Root 2: (inside native modal) → [rendered children]
```

### Pros
- Clean separation: native modal owns its view hierarchy, React owns the content tree.
- No reparenting -- views are created fresh in the second root.
- Aligns with how SwiftUI's `.sheet()` creates content fresh for each presentation.

### Cons
- Two React roots means two reconcilers, two contexts. React context (providers, state) does not bridge across roots without explicit plumbing.
- Higher memory and startup cost for the second root.
- State synchronization between roots is complex and error-prone.
- Not supported by Fabric's single-tree model without workarounds.

## Comparison Matrix

| Pattern | Native Sheet? | Real RN Views? | Fabric Compatible? | Cross-Platform? | Complexity |
|---------|:---:|:---:|:---:|:---:|:---:|
| 1. Reparenting | Yes | Yes | Partial | iOS only | Low |
| 2. addView Override | Yes | Yes | Yes | Android (adaptable to iOS) | Medium |
| 3. UIHostingController | Yes | Yes | Partial | iOS only | Medium |
| 4. JS-Only | No | Yes | Yes | Yes | High |
| 5. Portal / Separate Root | Yes | Yes | No | Possible | Very High |

## Recommendation for rn-bottom-sheet

The current reparenting approach (Pattern 1) works but has documented issues (see ADR-0002). The most promising path forward for Fabric-compatible native sheets is **Pattern 2 adapted for iOS**: overriding `mountChildComponentView:index:` on the Fabric component to route children directly to the modal's content view. This keeps real RN views, uses the native sheet, and avoids the reparenting lifecycle issues.

Pattern 4 (JS-only) could serve as the Android fallback where `UISheetPresentationController` is unavailable, trading native sheet fidelity for cross-platform consistency.
