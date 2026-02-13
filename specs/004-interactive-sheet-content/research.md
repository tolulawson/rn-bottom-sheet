# Research: Interactive Sheet Content and Core Sheet Configuration

## Decision 1: Keep package navigation-free

**Decision**: Do not add package-owned navigation stack APIs; keep navigation/state flow consumer-managed inside sheet children.

**Rationale**: `UISheetPresentationController` is a presentation/container API, not a navigation-stack API. Keeping navigation consumer-managed preserves minimal scope and avoids coupling the library to route semantics.

**Alternatives considered**:
- Add package-owned stack navigation API (`push/pop/replace`) — rejected as scope expansion and maintenance burden.
- Add optional native nav layer in package — rejected for v1 due to complexity and non-core responsibility.

## Decision 2: Expose all common iPhone sheet options now, defer iPad/compact-height niche options

**Decision**: API work for this feature targets common iPhone sheet configuration options; iPad/compact-height niche options remain deferred and documented.

**Rationale**: This matches clarified scope and delivers high-value coverage without widening platform-specific complexity.

**Alternatives considered**:
- Expose every UIKit option now — rejected as unnecessary expansion for current feature goals.
- Keep current API only — rejected because users requested broader common-option coverage and clearer support boundaries.

## Decision 3: Detent movement limits remain configuration-driven

**Decision**: Restrict movement between detents by using single-detent configurations (e.g., `['fit']`, `['medium']`, `['large']`) and document this pattern.

**Rationale**: UIKit does not provide a separate first-class “allow/disallow transition between supported detents” toggle beyond configured detent set and related scrolling behavior.

**Alternatives considered**:
- Introduce custom transition-blocking layer in package — rejected as brittle and non-native.
- Add synthetic lock APIs divorced from UIKit behavior — rejected due to contract ambiguity.

## Decision 4: Add styling controls through content host, not sheet backdrop internals

**Decision**: Expose styling options for content background mode (`system`, `blur`, `clear`) and preferred color scheme override (`system`, `light`, `dark`) in iOS scope.

**Rationale**: Content host styling is public and reliable via UIKit view APIs; this achieves native-looking appearance control while staying within supported APIs.

**Alternatives considered**:
- Backdrop blur/opacity customization — rejected; standard UIKit sheet API does not expose configurable backdrop blur controls.
- JS-only simulated blur layer over sheet — rejected for native-fidelity concerns.

## Decision 5: Maintain deterministic integration contract and docs obligations

**Decision**: Any API/user-visible behavior changes in this feature require README support matrix updates and completion-blocking Maestro validation.

**Rationale**: Constitution requires deterministic public contracts, explicit non-goals, and README synchronization in same change set.

**Alternatives considered**:
- Defer README updates — rejected by constitution.
- Reduce Maestro coverage to only one flow — rejected by mandatory affected-flow coverage rule.
