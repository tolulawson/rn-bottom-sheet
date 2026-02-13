# ADR-0002: Support Arbitrary RN Children in Sheet Content

- Status: Accepted (child routing implemented, reparenting replaced)
- Date: 2026-02-12
- Updated: 2026-02-12

## Context

A primary requirement is rendering arbitrary React Native views inside the native sheet. The library must bridge the gap between React Native's Fabric view management and UIKit's view controller presentation model.

### How UIKit sheets work

UIKit's `UISheetPresentationController` presents a **UIViewController**. The content VC owns its view hierarchy; views are never moved from one parent to another. The presentation controller wraps the content VC's view in a container it manages. See `docs/references/ios-sheet-apis.md` for the full reference.

### How Nitro host views work

Nitro's `HybridRnBottomSheetComponent` (an `RCTViewComponentView` subclass) creates a `HybridRnBottomSheet` on init. The Swift class exposes a `SheetHostContainerView` as its `view` property. Fabric mounts React Native children as subviews of this host view via `setContentView:` on the RCT component. See `docs/references/nitro-view-components.md`.

## Decision

Implement a native-presented sheet container that hosts RN children through the Nitro host boundary using a **child routing** pattern. React children are routed to the correct native container based on presentation state, rather than moving the host view itself.

## Implementation: Child Routing (Current)

The implementation uses three key components:

1. **`SheetHostContainerView`** (staging area): Stays in the React tree permanently. When the sheet is not presented, React children are held here. Has zero layout size, so children are invisible.

2. **`SheetContentContainerView`** (modal content): Lives inside the `SheetContentViewController`. Receives React children when the sheet is presented. Not part of the React tree.

3. **`mountChildComponentView:index:` override** in `HybridRnBottomSheetComponent.mm`: Intercepts Fabric's child mount calls and routes them to the correct container.

### Child routing flow

```
1. Mount:      Fabric calls mountChildComponentView on the RCT component
               → Override calls routeChildView on HybridRnBottomSheet
               → If sheet is closed: child added to SheetHostContainerView (staging)
               → If sheet is open: child added to SheetContentContainerView (modal)

2. Present:    presentSheet() moves staged children from host to content container
               → Content container (not host view) passed to SheetContentViewController
               → Host view stays in React tree, never reparented

3. Dismiss:    sheetDidDismiss moves children back from content container to host
               → Host view stays in React tree with zero size
               → No didMoveToWindow lifecycle disruption

4. Unmount:    Fabric calls unmountChildComponentView
               → Override calls unrouteChildView which removes from current parent
```

### How this solves the original problems

1. **Children invisible when closed.** Children are in the staging host view which has zero layout size. No CSS workaround needed.

2. **No Fabric reconciliation conflict.** The host view is never moved. Fabric's mount/unmount calls are intercepted and routed, working WITH Fabric rather than against it.

3. **No post-dismiss orphaning.** The host view never changes superview, so `didMoveToWindow` only fires for genuine window lifecycle events (app background, component unmount). The "stuck in opening" reopen bug is eliminated.

### Key files

- `ios/RnBottomSheet.swift`: `routeChildView`, `unrouteChildView`, `moveChildrenFromStagingToContent`, `moveChildrenFromContentToStaging`
- `nitrogen/generated/ios/c++/views/HybridRnBottomSheetComponent.mm`: `mountChildComponentView:index:` and `unmountChildComponentView:index:` overrides (manual addition, must survive nitrogen regeneration)
- `src/components/BottomSheet.tsx`: Simplified -- no `HOST_HIDDEN_STYLE` wrapper needed

## Historical: The Reparenting Approach (Replaced)

The original implementation reparented the `SheetHostContainerView` from the React tree into the modal via `contentVC.contentView = view` followed by `view.addSubview(content)`. This caused three problems documented above. A `HOST_HIDDEN_STYLE` CSS workaround was used to hide children when the sheet was closed, but it did not solve the underlying lifecycle issues. See `docs/references/rn-native-sheet-content-patterns.md` for the pattern comparison that informed the child routing solution.

## Consequences

1. High flexibility for consumer content and composition -- any React Native view tree can be rendered inside the sheet.
2. Additional lifecycle complexity for attach/detach/recycle handling due to the reparenting approach.
3. Requires the `HOST_HIDDEN_STYLE` workaround to prevent content leaking onto the main screen.
4. Requires robust cleanup in `prepareForRecycle` to avoid stale view reuse artifacts.
5. The post-dismiss orphan window creates a timing vulnerability for rapid open/close cycles.
