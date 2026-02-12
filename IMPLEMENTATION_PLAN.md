# Implementation Plan

> Auto-generated breakdown of specs into tasks.
> Delete this file to return to working directly from specs.

## Priority Tasks

### Phase 1: API and Nitro Contract

- [x] [HIGH] Define complete TypeScript type model (BottomSheetDetent, BottomSheetChangeReason) - from IMPLEMENTATION_PLAN API Design
- [x] [HIGH] Update RnBottomSheet.nitro.ts with full public props interface - from IMPLEMENTATION_PLAN API Design
- [x] [HIGH] Update RnBottomSheet.nitro.ts with public methods (present, dismiss, snapToDetent, getCurrentDetentIndex) - from IMPLEMENTATION_PLAN API Design
- [x] [HIGH] Define callback prop types (onOpenChange, onDetentChange, lifecycle callbacks) - from IMPLEMENTATION_PLAN API Design
- [x] [HIGH] Regenerate Nitrogen artifacts after contract changes - from tasks/todo.md Phase 1
- [x] [HIGH] Validate typings compile and exports work correctly - from tasks/todo.md Phase 1
- [x] [HIGH] Update src/index.tsx to export all public types - from IMPLEMENTATION_PLAN API Design

### Phase 2: iOS Sheet Engine

- [x] [HIGH] Create SheetPresenterViewController using UISheetPresentationController - from ADR-0001
- [x] [HIGH] Implement detent normalization (fit/medium/large/fraction/points to native identifiers) - from ios-sheet-apis.md
- [x] [HIGH] Implement detent validation (order low-to-high, unique identifiers) - from ios-sheet-apis.md
- [x] [HIGH] Map selectedDetentIdentifier bidirectionally - from IMPLEMENTATION_PLAN API Design
- [x] [HIGH] Implement present() flow with completion callback - from IMPLEMENTATION_PLAN API Design
- [x] [HIGH] Implement dismiss() flow with reason mapping - from IMPLEMENTATION_PLAN API Design
- [x] [HIGH] Implement lifecycle event bridge (onWillPresent, onDidPresent, onWillDismiss, onDidDismiss) - from IMPLEMENTATION_PLAN API Design
- [x] [HIGH] Implement dismissal reason detection (swipe, backdrop, programmatic, system) - from IMPLEMENTATION_PLAN API Design
- [x] [MEDIUM] Implement grabberVisible prop mapping to prefersGrabberVisible - from IMPLEMENTATION_PLAN API Design
- [x] [MEDIUM] Implement allowSwipeToDismiss behavior - from IMPLEMENTATION_PLAN API Design
- [x] [MEDIUM] Implement expandsWhenScrolledToEdge mapping - from IMPLEMENTATION_PLAN API Design
- [x] [MEDIUM] Implement cornerRadius mapping - from IMPLEMENTATION_PLAN API Design
- [x] [MEDIUM] Implement largestUndimmedDetent mapping - from IMPLEMENTATION_PLAN API Design
- [x] [MEDIUM] Implement backgroundInteraction behavior - from IMPLEMENTATION_PLAN API Design
- [x] [MEDIUM] Implement snapToDetent() with animateChanges batching - from ios-sheet-apis.md
- [x] [LOW] Implement single active sheet enforcement (manager-level ownership) - from IMPLEMENTATION_PLAN Architecture

### Phase 3: Content Hosting

- [x] [HIGH] Create native container view for RN children inside sheet - from ADR-0002
- [x] [HIGH] Implement RN children mounting into native-hosted container - from ADR-0002
- [x] [HIGH] Implement attach lifecycle handling - from nitro-view-components.md
- [x] [HIGH] Implement detach lifecycle handling - from nitro-view-components.md
- [x] [HIGH] Implement prepareForRecycle() for recycled view cleanup - from nitro-view-components.md
- [x] [MEDIUM] Handle thread-safety for props arriving from different threads - from nitro-view-components.md
- [x] [MEDIUM] Implement beforeUpdate()/afterUpdate() for batched prop application - from nitro-view-components.md

### Phase 4: Integrations

- [x] [MEDIUM] Create navigation subpath structure (rn-bottom-sheet/navigation) - from ADR-0003
- [x] [MEDIUM] Implement useBottomSheetNavigation hook for nested navigators - from react-navigation-form-sheet.md
- [x] [MEDIUM] Add Reanimated createAnimatedComponent compatibility - from reanimated-interop.md
- [x] [MEDIUM] Document supported animated prop pathways - from reanimated-interop.md
- [x] [LOW] Document unsupported full-transition control expectations - from reanimated-interop.md
- [x] [LOW] Implement Android/Web safe fallback (no crash, explicit warning) - from IMPLEMENTATION_PLAN Platform Behavior
- [x] [LOW] Add platform check guards in JS layer - from IMPLEMENTATION_PLAN Platform Behavior

### Phase 5: Verification and Release Readiness

- [x] [HIGH] Add unit tests for detent normalization logic - from IMPLEMENTATION_PLAN Verification
- [x] [HIGH] Add unit tests for API prop validation - from IMPLEMENTATION_PLAN Verification
- [x] [HIGH] Add iOS integration tests for presenter lifecycle - from IMPLEMENTATION_PLAN Verification
- [x] [HIGH] Add iOS integration tests for detent behavior - from IMPLEMENTATION_PLAN Verification
- [x] [MEDIUM] Add Maestro E2E flow: open sheet, verify visible - from IMPLEMENTATION_PLAN Verification
- [x] [MEDIUM] Add Maestro E2E flow: change detents, verify positions - from IMPLEMENTATION_PLAN Verification
- [x] [MEDIUM] Add Maestro E2E flow: dismiss sheet, verify closed - from IMPLEMENTATION_PLAN Verification
- [x] [MEDIUM] Fix yarn lint to pass - from tasks/todo.md Verification Checklist
- [x] [MEDIUM] Fix yarn typecheck to pass - from tasks/todo.md Verification Checklist
- [x] [MEDIUM] Verify iOS example app builds successfully - from IMPLEMENTATION_PLAN Verification
- [x] [LOW] Update CI gates for new test coverage - from IMPLEMENTATION_PLAN Verification

## Completed

- [x] Create docs/ knowledge base structure - Phase 0
- [x] Add decision-complete implementation plan - Phase 0
- [x] Add reference summaries and source index - Phase 0
- [x] Add ADRs for primary architecture decisions - Phase 0
- [x] Add sync/check scripts for docs integrity - Phase 0
- [x] Create Ralph scaffolding directories - Ralph Setup
- [x] Install Ralph loop scripts - Ralph Setup
- [x] Create project constitution - Ralph Setup
- [x] Create AGENTS.md, CLAUDE.md, PROMPT files - Ralph Setup
- [x] yarn docs:check passes - Verification Checklist
- [x] Add example app detent controls and behavior toggles - from specs/001-native-ios-sheet-bindings/tasks.md T024

## Implementation Order

The tasks above are prioritized by:

1. **Dependencies**: Phase 1 (API contract) must come before Phase 2 (iOS implementation)
2. **Impact**: Core sheet functionality (Phase 2) before integrations (Phase 4)
3. **Complexity**: Type definitions and contract (easier) before native implementation (harder)

### Recommended Sequence

1. Complete all Phase 1 tasks first (API contract foundation)
2. Phase 2 core tasks (presenter, detents, lifecycle)
3. Phase 3 content hosting (RN children)
4. Phase 2 remaining tasks (secondary props)
5. Phase 5 verification tasks (tests)
6. Phase 4 integration tasks (navigation, reanimated)
7. Phase 5 remaining (CI, docs)

## Acceptance Criteria Summary

From IMPLEMENTATION_PLAN.md:
1. Consumers can present native-feeling iOS sheets with RN children
2. API supports controlled and imperative models without ambiguity
3. Detents are validated and predictable
4. Documentation in repo is sufficient to implement and maintain the system
5. The knowledge base is script-checkable and evolvable
