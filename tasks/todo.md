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
