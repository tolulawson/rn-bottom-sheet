# Implementation Todo

## Phase 0: Project Memory Bootstrap

- [x] Create `docs/` knowledge base structure
- [x] Add decision-complete implementation plan
- [x] Add reference summaries and source index
- [x] Add ADRs for primary architecture decisions
- [x] Add sync/check scripts for docs integrity

## Phase 1: API and Nitro Contract

- [x] Finalize public TypeScript API and Nitro view contract
- [x] Regenerate Nitrogen artifacts
- [x] Validate typings and exports

## Phase 2: iOS Sheet Engine

- [ ] Implement presenter/controller architecture
- [ ] Map detent model and lifecycle events
- [ ] Implement dismissal reason mapping

## Phase 3: Content Hosting

- [ ] Implement arbitrary RN child hosting in presented sheet
- [ ] Add robust attach/detach/recycle cleanup

## Phase 4: Integrations

- [ ] Add optional React Navigation adapter utilities
- [ ] Add Reanimated compatibility surface and docs
- [ ] Add platform fallback behavior for non-iOS

## Phase 5: Verification and Release Readiness

- [x] Add unit tests for API normalization and behavior
- [ ] Add iOS integration tests for presenter/detents/lifecycle
- [ ] Add Maestro happy-path E2E flows in example app
- [x] Add conditional Maestro MCP gate policy (deferred until stable, required at release gate)
- [ ] Update CI gates as needed

## Verification Checklist

- [x] `yarn docs:check`
- [x] `yarn lint`
- [x] `yarn typecheck`
- [x] `yarn test`

## Ralph Setup

- [x] Create Ralph scaffolding directories (`.specify`, `specs`, `logs`, `history`, command folders)
- [x] Install Ralph loop scripts for Claude and Codex
- [x] Install optional RLM/helper scripts and `scripts/lib` utilities
- [x] Create project constitution at `.specify/memory/constitution.md`
- [x] Create `AGENTS.md`, `CLAUDE.md`, `PROMPT_build.md`, and `PROMPT_plan.md`
- [x] Verify scripts execute with `--help`

## Review

- Date: 2026-02-12
- Reviewer: Codex (GPT-5)
- Findings:
  - Ralph iteration `Phase 3 Native Host Lifecycle + Recycle`: implemented a dedicated native sheet host container (`SheetHostContainerView`) with explicit attach/detach hooks, deferred presentation until attachment, and deterministic teardown on detach in `ios/RnBottomSheet.swift`.
  - Added `prepareForRecycle()` conformance in `ios/RnBottomSheet.swift` to clear stale callbacks/session state and reset sheet props for Nitro view reuse safety.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, `yarn test`, and successful `yarn workspace rn-bottom-sheet-example ios` build/run.
  - Maestro MCP gate check remains non-blocking because `specs/001-native-ios-sheet-bindings/spec.md` currently sets `E2E Gate State: deferred`.
  - Ralph iteration `Phase 2 Dismissal Reason Detection`: implemented native dismissal-reason classification in `ios/RnBottomSheet.swift` with deterministic mapping for `programmatic`, `backdrop`, `swipe`, and `system` (programmatic overrides, backdrop tap inference window, and non-interactive fallback to system), plus callback pass-through coverage for `backdrop`/`system` in `src/__tests__/bottom-sheet.navigation.test.ts`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, `yarn test`, and successful iOS simulator build via `xcodebuild -workspace example/ios/rnBottomSheetExample.xcworkspace -scheme RnBottomSheetExample -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' build`.
  - Ralph iteration `P2 iOS native conformance blocker`: fixed `ios/RnBottomSheet.swift` to conform to generated `HybridRnBottomSheetSpec` types/signatures (typed detents/background interaction/callbacks + throwing methods), replaced direct `UISheetPresentationControllerDelegate` conformance with an `NSObject` proxy, and normalized dismissal/detent callback routing.
  - Re-verified iOS/native integration with a successful `yarn workspace rn-bottom-sheet-example ios` build/run and passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Updated `IMPLEMENTATION_PLAN.md` completion status for Phase 2 presenter/present/dismiss/lifecycle items and Phase 5 iOS example build verification.
  - Ralph iteration `T038`: executed conditional Maestro gate evaluation; identified that US2/US3 tasks are complete and baseline JS checks pass, but iOS example build fails (`yarn workspace rn-bottom-sheet-example ios`) due `ios/RnBottomSheet.swift` Nitrogen protocol conformance errors, preventing app install/launch for deterministic Maestro flow execution.
  - Updated `specs/001-native-ios-sheet-bindings/spec.md` with dated gate-evaluation rationale and retained `E2E Gate State: deferred` until the iOS build blocker is fixed.
  - Marked `T038` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Marked `specs/001-native-ios-sheet-bindings/spec.md` as `## Status: COMPLETE` after all task items were closed.
  - Ralph iteration `T037`: extended `docs/implementation-plan-v1.md` with explicit Maestro MCP invocation expectations (source flow, required assertions, deferred vs required gate behavior, and failure handling policy).
  - Marked `T037` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T036`: created `example/.maestro/sheet-core-flows.yaml` with deterministic steps for open, detent interaction, in-sheet navigation, and dismiss flows; validated syntax with Maestro MCP (`valid: true`).
  - Marked `T036` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T035`: executed consolidated validation gate (`yarn lint`, `yarn typecheck`, `yarn test`, `yarn docs:check`) and confirmed all commands pass with the current implementation/docs state.
  - Marked `T035` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Captured explicit validation evidence in this Review section for release-readiness traceability.
  - Ralph iteration `T034`: added a concrete verification runbook to `docs/implementation-plan-v1.md` covering command gates, tracker update requirements, and targeted feature-surface verification steps for detents, navigation adapter behavior, animation compatibility, and non-iOS fallback behavior.
  - Marked `T034` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T033`: expanded `docs/adr/ADR-0001-ios-sheet-engine.md` to capture current architectural constraints and boundaries, including Nitro bridge surface, deterministic reason contract, optional navigation adapters, Reanimated compatibility scope, and explicit non-iOS fallback policy.
  - Marked `T033` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T032`: rewrote `README.md` to reflect the implemented API surface (wrapper/native exports, detent model, lifecycle callbacks, imperative methods, navigation adapter usage, Reanimated compatibility contract, and non-iOS fallback behavior).
  - Marked `T032` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T031`: updated `example/src/App.tsx` with navigation-driven open/close state via `useBottomSheetNavigation`, added in-sheet route transitions (`Summary`/`Details`), and added an optional Reanimated wrapper scenario with deterministic fallback when `react-native-reanimated` is not installed.
  - Updated `example/src/__tests__/sheet-open-dismiss.integration.test.tsx` to validate navigation-route transitions and animation-wrapper status in the example flow.
  - Marked `T031` complete in `specs/001-native-ios-sheet-bindings/tasks.md` and synchronized related integration progress in `IMPLEMENTATION_PLAN.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T030`: confirmed explicit non-iOS fallback behavior already existed in `src/platform/fallback.ts` and JS guard usage in `src/components/BottomSheet.tsx`; added `src/__tests__/bottom-sheet.fallback.test.ts` to verify support detection, deterministic fallback state, guard behavior, and warning behavior.
  - Marked `T030` complete in `specs/001-native-ios-sheet-bindings/tasks.md` and synchronized fallback progress in `IMPLEMENTATION_PLAN.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T029`: added `src/components/BottomSheetNativeView.tsx` as the documented Reanimated host compatibility surface (explicit supported animated prop pathways and non-goal boundary), and routed `BottomSheetView` through that component in `src/index.tsx`.
  - Marked `T029` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Maestro MCP gate remains non-blocking for this loop because `E2E Gate State` is still `deferred` in `specs/001-native-ios-sheet-bindings/spec.md`.
  - Ralph iteration `T027`: added `src/navigation/bottom-sheet-adapter.ts` with optional navigation sync helpers (`createBottomSheetNavigationAdapter` and `useBottomSheetNavigation`) that map route state to controlled sheet props and avoid circular open/close dispatch when state is already aligned.
  - Added `src/__tests__/bottom-sheet-adapter.test.ts` to verify route-state mapping, open/close callback propagation, and loop-prevention behavior for matching states.
  - Marked `T027` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T026`: added `src/__tests__/bottom-sheet.reanimated.test.ts` to lock the documented Reanimated compatibility contract for `createAnimatedComponent` wrapping of both `BottomSheet` and `BottomSheetView`, including ref-method continuity and animated prop pass-through behavior.
  - No production-code changes were required for `T026`; the existing wrapper/native export surface already satisfied the contract once coverage was added.
  - Marked `T026` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T025`: added `src/__tests__/bottom-sheet.navigation.test.ts` to verify navigation-style controlled state synchronization, native close-intent callback propagation, and callback-only controlled imperative flow to avoid circular present/dismiss loops.
  - Marked `T025` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T024`: expanded `example/src/App.tsx` with detent snap controls, behavior toggles (`grabberVisible`, `allowSwipeToDismiss`, `expandsWhenScrolledToEdge`, and cycled `backgroundInteraction`), and ref-driven snap usage in the example.
  - Updated `example/src/__tests__/sheet-open-dismiss.integration.test.tsx` to validate new controls with a ref-capable `BottomSheet` mock and assertions for toggles/detent transitions.
  - Marked `T024` complete in `specs/001-native-ios-sheet-bindings/tasks.md` and synchronized `IMPLEMENTATION_PLAN.md` completion tracking.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T019`: added `src/__tests__/bottom-sheet.methods.test.ts` with imperative `snapToDetent` forwarding coverage and native-to-JS detent callback mapping assertions.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T011`: added `example/src/__tests__/sheet-open-dismiss.integration.test.tsx` with integration assertions for open/dismiss transitions and lifecycle callback flow using a deterministic `rn-bottom-sheet` mock.
  - Synchronized stale task state by checking `T003` (test scaffold already existed at `src/__tests__/bottom-sheet.contract.test.ts`) and checking `T011` in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Added `react-test-renderer@19.1.0` dev dependency to support example integration rendering in Jest.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T002`: `docs/knowledge-index.md` now includes a direct feature contract pointer to `specs/001-native-ios-sheet-bindings/contracts/bottom-sheet-api.yaml`, and task state is synchronized by checking `T002` in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T001` verification: `docs/changelog-notes/README.md` already contains the feature README entry and scope note; task state was stale and has been synchronized by checking `T001` in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - `yarn nitrogen` initially failed due Nitro parser limitations in `src/RnBottomSheet.nitro.ts` (inline union type and mixed string-literal/number union). Resolved by extracting `NativeDetentType` and widening `NativeBackgroundInteraction` bridge type to `string | number`.
  - `yarn typecheck` initially failed in `example/src/App.tsx` because Nitro view callbacks were passed as plain functions. Resolved by wrapping callback props with `callback(...)` from `react-native-nitro-modules`.
  - `yarn lint`, `yarn typecheck`, and `yarn test` now pass.
  - Added `fit` detent support to public type model and deterministic JS/native detent normalization rules (sorted low-to-high, deduped resolved values, unique custom ids).
  - Added detent validation coverage and native mapping tests in `src/__tests__/bottom-sheet.detents.test.ts`.
  - Added `BottomSheet` public wrapper in `src/components/BottomSheet.tsx` with controlled/uncontrolled support, imperative refs, fallback-safe behavior, and native callback wiring.
  - Added wrapper validation + mapping tests in `src/__tests__/bottom-sheet.wrapper.test.ts` and switched the example app to the wrapper API.
  - Added lifecycle callback unit coverage in `src/__tests__/bottom-sheet.lifecycle.test.ts` and refactored lifecycle event mapping into `createLifecycleHandlers` in `src/components/bottom-sheet-utils.ts`, now used by `src/components/BottomSheet.tsx`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
  - Ralph iteration `T028`: exported optional navigation adapter APIs (`createBottomSheetNavigationAdapter`, `useBottomSheetNavigation`) and adapter types from the package root in `src/index.tsx`.
  - Marked `T028` complete in `specs/001-native-ios-sheet-bindings/tasks.md`.
  - Re-verified this iteration with passing `yarn lint`, `yarn typecheck`, and `yarn test`.
- Residual Risks:
  - `NativeBackgroundInteraction` bridge typing is wider (`string | number`) than intended semantic domain and depends on JS-side validation/documentation for stricter correctness.
  - Swift detent validation currently logs invalid configuration and falls back/defaults instead of surfacing explicit JS exceptions through the bridge.
- Follow-ups:
  - Add explicit JS-level validation around `backgroundInteraction` before sending values to native layer.
  - Add iOS integration coverage for wrapper-driven lifecycle transitions and dismissal reasons.

## Ralph Iteration 2026-02-12 (Phase 1 Verification Blocker)

- [x] Confirm highest-priority unfinished Phase 1 item and verify it is not already complete
- [x] Regenerate Nitro artifacts for current `src/RnBottomSheet.nitro.ts` contract
- [x] Fix callback wiring/type mismatches in `example/src/App.tsx` so `yarn typecheck` passes
- [x] Run and pass: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Record verification outcomes in Review section and update completed checkboxes

## Ralph Iteration 2026-02-12 (Phase 2 High-Priority Detent Gap)

- [x] Confirm highest-priority incomplete item and verify current code does not already satisfy it
- [x] Implement complete detent normalization coverage (`fit`, `medium`, `large`, `fraction`, `points`) in JS/native bridge types and helpers
- [x] Implement strict detent validation rules (ordering, uniqueness, range) and deterministic error messages
- [x] Add/extend unit tests for normalization + validation edge cases
- [x] Run and pass: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Update `IMPLEMENTATION_PLAN.md` progress and capture results in Review section

## Ralph Iteration 2026-02-12 (P1 Wrapper API Gap)

- [x] Confirm highest-priority incomplete item and verify `BottomSheet` wrapper is not already implemented
- [x] Implement public `BottomSheet` component supporting controlled/uncontrolled open state
- [x] Implement imperative ref API (`present`, `dismiss`, `snapToDetent`, `getCurrentDetentIndex`)
- [x] Wire lifecycle/open/detent callbacks through wrapper with deterministic behavior
- [x] Export wrapper in `src/index.tsx` and add/adjust wrapper tests
- [x] Run and pass: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in `tasks/todo.md` Review section

## Ralph Iteration 2026-02-12 (US1 Lifecycle Test Coverage T010)

- [x] Confirm `T010` is the highest-priority truly incomplete task and not already implemented
- [x] Add lifecycle callback unit tests in `src/__tests__/bottom-sheet.lifecycle.test.ts`
- [x] Mark `T010` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture results in the Review section

## Ralph Iteration 2026-02-12 (Phase 1 Task State Sync T001)

- [x] Confirm `T001` is the highest-priority incomplete item and verify implementation state in code/docs
- [x] Mark `T001` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture results in the Review section

## Ralph Iteration 2026-02-12 (Phase 1 Contract Pointer T002)

- [x] Confirm `T002` is the highest-priority truly incomplete task and verify `docs/knowledge-index.md` lacks a direct feature contract pointer
- [x] Add direct feature contract pointer in `docs/knowledge-index.md`
- [x] Mark `T002` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture results in the Review section

## Ralph Iteration 2026-02-12 (US1 iOS Integration Flow Assertions T011)

- [x] Confirm `T011` is the highest-priority truly incomplete task and verify `T003` is already implemented (stale checkbox only)
- [x] Add iOS integration flow assertions in `example/src/__tests__/sheet-open-dismiss.integration.test.tsx`
- [x] Mark `T011` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture results in the Review section

## Ralph Iteration 2026-02-12 (US2 Imperative Method Coverage T019)

- [x] Confirm `T019` is the highest-priority truly incomplete task and verify test coverage does not already exist
- [x] Add imperative `snapToDetent` and detent callback tests in `src/__tests__/bottom-sheet.methods.test.ts`
- [x] Mark `T019` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (US2 Example Detent Controls T024)

- [x] Confirm `T024` is the highest-priority truly incomplete item and verify `example/src/App.tsx` does not already provide detent controls + behavior toggles
- [x] Implement example detent controls in `example/src/App.tsx` (open/close, snap to each detent, current detent status)
- [x] Implement example behavior toggles in `example/src/App.tsx` (`grabberVisible`, `allowSwipeToDismiss`, `expandsWhenScrolledToEdge`, `backgroundInteraction`)
- [x] Update/extend example integration test coverage in `example/src/__tests__/sheet-open-dismiss.integration.test.tsx` for new controls
- [x] Mark `T024` complete in `specs/001-native-ios-sheet-bindings/tasks.md` and sync `IMPLEMENTATION_PLAN.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (US3 Navigation Sync Tests T025)

- [x] Confirm `T025` is the highest-priority truly incomplete item and verify `src/__tests__/bottom-sheet.navigation.test.ts` does not already exist
- [x] Add navigation-sync behavior tests in `src/__tests__/bottom-sheet.navigation.test.ts`
- [x] Mark `T025` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (US3 Reanimated Contract Tests T026)

- [x] Confirm `T026` is the highest-priority truly incomplete item and verify `src/__tests__/bottom-sheet.reanimated.test.ts` does not already exist
- [x] Add reanimated compatibility contract tests in `src/__tests__/bottom-sheet.reanimated.test.ts`
- [x] Implement minimal production changes only if test-driven gaps are found
- [x] Mark `T026` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (US3 Navigation Adapter Helper T027)

- [x] Confirm `T027` is the highest-priority truly incomplete item and verify `src/navigation/bottom-sheet-adapter.ts` does not already exist
- [x] Implement optional navigation adapter helpers in `src/navigation/bottom-sheet-adapter.ts`
- [x] Add adapter helper unit tests in `src/__tests__/bottom-sheet-adapter.test.ts`
- [x] Mark `T027` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (US3 Navigation Adapter Entry Export T028)

- [x] Confirm `T028` is the highest-priority truly incomplete item and verify `src/index.tsx` does not already export navigation adapter utilities
- [x] Export optional navigation adapter entry points from `src/index.tsx`
- [x] Mark `T028` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (US3 Animated Wrapper Surface T029)

- [x] Confirm `T029` is the highest-priority truly incomplete item and verify `src/components/BottomSheetNativeView.tsx` is not already implemented
- [x] Implement documented animated wrapper compatibility surface in `src/components/BottomSheetNativeView.tsx`
- [x] Update package exports/usages to use the new compatibility surface
- [x] Mark `T029` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (US3 Non-iOS Fallback Verification T030)

- [x] Confirm `T030` is the highest-priority truly incomplete item and verify current non-iOS fallback behavior/warnings state
- [x] Add focused fallback tests in `src/__tests__/bottom-sheet.fallback.test.ts`
- [x] Mark `T030` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (US3 Example Navigation + Animation Scenarios T031)

- [x] Confirm `T031` is the highest-priority truly incomplete item and verify current example app gaps
- [x] Implement navigation-driven sheet scenario and in-sheet route flow in `example/src/App.tsx`
- [x] Implement optional animated wrapper scenario with deterministic fallback in `example/src/App.tsx`
- [x] Update example integration assertions for navigation + animation scenario coverage in `example/src/__tests__/sheet-open-dismiss.integration.test.tsx`
- [x] Mark `T031` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (Polish Public API Docs T032)

- [x] Confirm `T032` is the highest-priority truly incomplete item and verify `README.md` API drift
- [x] Update installation, usage, API reference, and fallback/navigation/reanimated notes in `README.md`
- [x] Mark `T032` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (Polish ADR Constraint Sync T033)

- [x] Confirm `T033` is the highest-priority truly incomplete item and verify current ADR gaps
- [x] Update `docs/adr/ADR-0001-ios-sheet-engine.md` with integration constraints and supported behavior boundaries
- [x] Mark `T033` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (Polish Verification Runbook Notes T034)

- [x] Confirm `T034` is the highest-priority truly incomplete item and verify current runbook gaps
- [x] Add verification/runbook notes for feature workflows in `docs/implementation-plan-v1.md`
- [x] Mark `T034` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (Polish Validation Capture T035)

- [x] Confirm `T035` is the highest-priority truly incomplete item and verify missing explicit validation capture
- [x] Execute verification commands and record outcomes in `tasks/todo.md`
- [x] Mark `T035` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`, `yarn docs:check`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (Polish Maestro Flow Definitions T036)

- [x] Confirm `T036` is the highest-priority truly incomplete item and verify missing Maestro flow artifacts
- [x] Add core example app Maestro flow definitions in `example/.maestro/sheet-core-flows.yaml`
- [x] Validate Maestro flow YAML syntax
- [x] Mark `T036` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (Polish Maestro MCP Runbook Notes T037)

- [x] Confirm `T037` is the highest-priority truly incomplete item and verify missing Maestro invocation guidance
- [x] Add Maestro MCP runbook notes and invocation expectations in `docs/implementation-plan-v1.md`
- [x] Mark `T037` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (Polish Conditional Maestro Gate T038)

- [x] Confirm `T038` is the highest-priority truly incomplete item and evaluate promotion criteria
- [x] Execute conditional Maestro MCP gate flow for example app (or explicitly defer with rationale)
- [x] Update `E2E Gate State` decision in `specs/001-native-ios-sheet-bindings/spec.md`
- [x] Mark `T038` complete in `specs/001-native-ios-sheet-bindings/tasks.md`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`, `yarn docs:check`
- [x] Capture verification outcomes in the Review section

## Ralph Iteration 2026-02-12 (Phase 2 iOS Native Conformance Blocker)

- [x] Confirm highest-priority unchecked Phase 2 item and verify current implementation/build failure
- [x] Align `ios/RnBottomSheet.swift` with generated Nitro Swift contract types/signatures
- [x] Replace direct `UISheetPresentationControllerDelegate` conformance with an `NSObject` delegate proxy
- [x] Run and pass verification: `yarn workspace rn-bottom-sheet-example ios`, `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Update `IMPLEMENTATION_PLAN.md` and `tasks/todo.md` Review with results

## Ralph Iteration 2026-02-12 (Phase 2 Dismissal Reason Detection)

- [x] Confirm highest-priority unchecked item remains dismissal reason detection and verify current native mapping gaps
- [x] Implement deterministic iOS dismissal reason classification for `programmatic`, `swipe`, `backdrop`, and `system`
- [x] Add or extend automated tests to lock reason mapping behavior
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`
- [x] Update `IMPLEMENTATION_PLAN.md` progress and capture outcomes in `tasks/todo.md` Review

## Ralph Iteration 2026-02-12 (Phase 3 Native Host Lifecycle + Recycle)

- [x] Confirm the highest-priority truly incomplete item is Phase 3 content hosting lifecycle/recycle handling and verify it is not already implemented
- [x] Implement a native sheet host container view for RN children with explicit attach/detach lifecycle hooks in `ios/RnBottomSheet.swift`
- [x] Implement `prepareForRecycle()` cleanup to reset presenter/session state safely for Nitro view reuse in `ios/RnBottomSheet.swift`
- [x] Run and pass verification: `yarn lint`, `yarn typecheck`, `yarn test`, `yarn workspace rn-bottom-sheet-example ios`
- [x] Update `IMPLEMENTATION_PLAN.md` and `tasks/todo.md` Review with outcomes
