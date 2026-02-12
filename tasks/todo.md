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
