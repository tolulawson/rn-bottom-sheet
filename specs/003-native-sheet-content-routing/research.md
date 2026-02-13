# Research: Native Sheet Content Routing

## Decision 1: Child Routing Strategy

**Decision**: Override `mountChildComponentView:index:` and `unmountChildComponentView:index:` on `HybridRnBottomSheetComponent` to route React children to the correct native container.

**Rationale**: This is the only approach that works WITH Fabric's reconciliation rather than against it. Fabric calls these methods as part of its normal commit phase. By overriding them, we control where children are placed without Fabric knowing or caring. The host view stays in the React tree, eliminating the `didMoveToWindow` lifecycle chaos.

**Alternatives considered**:
- **Keep reparenting with better lifecycle handling**: Rejected. The fundamental conflict between UIView's single-superview rule and Fabric's expectation of view tree ownership cannot be resolved with lifecycle patches. Every edge case fixed reveals another.
- **Portal / separate React root**: Rejected. Two React roots means two contexts, double memory, and complex state synchronization. Massive complexity for a problem that has a simpler solution.
- **JS-only sheet (no native modal)**: Rejected. Violates Constitution Principle I (Native Fidelity First). We specifically chose UISheetPresentationController for native interaction quality.

## Decision 2: Staging Area for Pre-Present Children

**Decision**: When the sheet is not presented, children mounted by Fabric are added to the `SheetHostContainerView` itself, which has zero layout size (handled by Fabric/Yoga, not a CSS workaround). On present, children are moved from the staging area to the `SheetContentContainerView`.

**Rationale**: Fabric will call `mountChildComponentView` as soon as the component mounts, which is before the sheet is presented. Children must exist somewhere in the native view hierarchy so Fabric doesn't lose track of them. The host view at zero size serves as this staging area without visual impact.

**Alternatives considered**:
- **Defer mounting until present**: Rejected. We cannot defer Fabric's mount calls -- they happen during the commit phase and must succeed synchronously.
- **Use a separate off-screen staging UIView**: Possible but unnecessary complexity. The host view already exists and already has zero layout.

## Decision 3: Communication Between Obj-C++ Component and Swift

**Decision**: Add a `routeChildView:atIndex:` and `unrouteChildView:atIndex:` method pair on `HybridRnBottomSheet` (Swift), called from the `mountChildComponentView:index:` and `unmountChildComponentView:index:` overrides in `HybridRnBottomSheetComponent.mm`.

**Rationale**: The Obj-C++ file is Nitro-generated and cannot hold significant logic. All routing decisions (is sheet presented? which container?) belong in the Swift class which owns the presentation state. The Obj-C++ layer is a thin bridge.

**Alternatives considered**:
- **Put routing logic entirely in Obj-C++**: Rejected. Presentation state lives in Swift. Duplicating or exposing it to Obj-C++ creates coupling.
- **Use Nitro's Swift/C++ interop directly**: The existing `HybridRnBottomSheetSpec_cxx` bridge is used. We add methods to the Swift spec protocol or use direct casting.

## Decision 4: Handling the HybridRnBottomSheetComponent.mm as Generated Code

**Decision**: Add a manual override section in `HybridRnBottomSheetComponent.mm` for `mountChildComponentView:index:` and `unmountChildComponentView:index:`. Mark it clearly as a manual addition that must survive regeneration.

**Rationale**: Nitro generates this file. The `// DO NOT MODIFY THIS FILE` header means re-running nitrogen will overwrite our changes. However, the alternative (creating a separate subclass) would require modifying Nitro's component registration, which is more invasive. The pragmatic approach is to add the overrides with clear markers and document the constraint.

**Alternatives considered**:
- **Subclass HybridRnBottomSheetComponent**: Requires changing Nitro's `[RCTComponentViewFactory registerComponentViewClass:]` call, which is also in generated code.
- **Patch nitrogen to support mount hooks**: Out of scope. Would require upstream contribution to react-native-nitro-modules.
