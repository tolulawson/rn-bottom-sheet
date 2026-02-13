# Tasks: Interactive Sheet Content and Core Sheet Configuration

**Input**: Design documents from `/specs/004-interactive-sheet-content/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/sheet-config-surface.yaml`, `quickstart.md`

**Tests**: Test tasks are REQUIRED for this feature (unit/integration + Maestro E2E).
**Documentation**: README update tasks are REQUIRED (public API/user-visible behavior changes).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align test/documentation scaffolding and ensure scenario paths exist.

- [x] T001 Confirm branch/tooling alignment to `004-interactive-sheet-content` and record preflight in `specs/004-interactive-sheet-content/maestro-evidence/preflight.md`
- [x] T002 [P] Create Maestro evidence directory at `specs/004-interactive-sheet-content/maestro-evidence/.gitkeep`
- [x] T003 [P] Add/refresh test IDs needed for new style controls and assertions in `example/src/testids.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API contract and native bridge plumbing that all stories depend on.

**⚠️ CRITICAL**: No user story work begins before this phase is complete.

- [x] T004 Build explicit common-iPhone option parity matrix (implemented/pre-existing/deferred) in `docs/references/ios-sheet-apis.md`
- [x] T005 Extend Nitro prop contract for styling options and missing common iPhone options in `src/RnBottomSheet.nitro.ts`
- [x] T006 [P] Extend public TypeScript API types for common iPhone options and styling in `src/types/bottom-sheet.ts`
- [x] T007 [P] Add prop normalization/validation helpers for styling and common option mappings in `src/components/bottom-sheet-utils.ts`
- [x] T008 Wire new/confirmed props through wrapper component into native host in `src/components/BottomSheet.tsx`
- [x] T009 Add native Swift prop storage + queued update handling for styling/config parity in `ios/RnBottomSheet.swift`
- [x] T010 Add API-surface guard tests to prevent package-owned navigation API expansion in `src/__tests__/bottom-sheet.contract.test.ts`
- [x] T011 [P] Add non-iOS fallback safety tests for new styling/config props in `src/__tests__/bottom-sheet.fallback.test.ts`

**Checkpoint**: Core configuration and bridge layer are ready for story-level behavior work.

---

## Phase 3: User Story 1 - Interactive Children Work Inside Sheet (Priority: P1) 🎯 MVP

**Goal**: Ensure child touch/scroll/input interactions work reliably inside the presented sheet.

**Independent Test**: Open sheet, tap/scroll/type in in-sheet controls, and verify state updates/events fire correctly.

### Tests for User Story 1 (REQUIRED)

- [x] T012 [P] [US1] Add interaction behavior integration tests in `src/__tests__/bottom-sheet.presenter.integration.test.tsx`
- [x] T013 [P] [US1] Add example contract coverage for in-sheet controls interaction in `example/src/__tests__/sheet-control-surface.contract.test.tsx`
- [x] T014 [P] [US1] Author Maestro flow for interactive in-sheet controls in `example/maestro/sheet-interactive-controls.yaml`

### Implementation for User Story 1

- [x] T015 [US1] Update native content-host interaction routing behavior in `ios/RnBottomSheet.swift`
- [x] T016 [US1] Ensure wrapper lifecycle callbacks remain deterministic under interactive child updates in `src/components/BottomSheet.tsx`
- [x] T017 [US1] Update example control surface to exercise touch/scroll/input behavior in `example/src/components/InSheetControls.tsx`
- [x] T018 [US1] Align example app state assertions/logging for interaction outcomes in `example/src/App.tsx`

**Checkpoint**: US1 is independently functional and testable.

---

## Phase 4: User Story 2 - Child Content Fills Sheet Width by Default (Priority: P1)

**Goal**: Ensure child root content fills sheet width consistently across detents.

**Independent Test**: Open sheet, verify full-width child root, change detents, confirm no horizontal clipping.

### Tests for User Story 2 (REQUIRED)

- [x] T019 [P] [US2] Add width-contract integration assertions in `src/__tests__/bottom-sheet.detent.integration.test.tsx`
- [x] T020 [P] [US2] Add detent restriction validation coverage (`fit`/`medium`/`large` single-detent patterns) in `src/__tests__/bottom-sheet.detents.test.ts`
- [x] T021 [P] [US2] Author Maestro width-contract flow in `example/maestro/sheet-width-contract.yaml`

### Implementation for User Story 2

- [x] T022 [US2] Implement/adjust native width-hosting contract for sheet child root in `ios/RnBottomSheet.swift`
- [x] T023 [US2] Remove conflicting fixed-width assumptions in example content styles in `example/src/components/InSheetControls.tsx`
- [x] T024 [US2] Add example detent restriction controls and assertions in `example/src/App.tsx`

**Checkpoint**: US2 is independently functional and testable.

---

## Phase 5: User Story 3 - Consumer-Managed Flow Compatibility + Styling Controls (Priority: P2)

**Goal**: Keep navigation consumer-managed while adding in-scope styling controls (`preferredColorScheme`, `contentBackgroundStyle`, blur style).

**Independent Test**: Run a two-state consumer-managed flow in sheet content and verify sheet lifecycle remains stable while styling toggles apply correctly.

### Tests for User Story 3 (REQUIRED)

- [x] T025 [P] [US3] Add wrapper behavior tests for styling props and lifecycle stability in `src/__tests__/bottom-sheet.wrapper.test.ts`
- [x] T026 [P] [US3] Add presenter integration tests for preferred color scheme and background style updates in `src/__tests__/bottom-sheet.presenter.integration.test.tsx`
- [x] T027 [P] [US3] Add example flow compatibility contract tests in `example/src/__tests__/sheet-single-open.contract.test.tsx`
- [x] T028 [P] [US3] Add example styling contract tests in `example/src/__tests__/sheet-theme.contract.test.tsx`
- [x] T029 [P] [US3] Author Maestro flow for consumer-managed flow compatibility in `example/maestro/sheet-consumer-flow-compat.yaml`
- [x] T030 [P] [US3] Add runtime open-sheet theme/style toggle edge-case test in `example/src/__tests__/sheet-theme.contract.test.tsx`

### Implementation for User Story 3

- [x] T031 [US3] Implement native styling application (`system`/`blur`/`clear`, blur style, color scheme override) in `ios/RnBottomSheet.swift`
- [x] T032 [US3] Wire styling props through TS wrapper and fallback-safe behavior in `src/components/BottomSheet.tsx`
- [x] T033 [US3] Update public type exports and docs comments for styling + common iPhone option scope in `src/types/bottom-sheet.ts`
- [x] T034 [US3] Update example controls for style toggles and consumer-managed flow demo in `example/src/components/InSheetControls.tsx`
- [x] T035 [US3] Update example app state wiring for style and flow compatibility scenarios in `example/src/App.tsx`

**Checkpoint**: US3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize docs, validate support matrix/non-goals, and run full verification.

- [x] T036 [P] Update README API support matrix and non-goals in `README.md`
- [x] T037 [P] Update iOS sheet reference docs for styling limits and common iPhone scope in `docs/references/ios-sheet-apis.md`
- [x] T038 [P] Update ADR/architecture notes to reflect consumer-managed navigation non-goal and styling scope in `docs/adr/ADR-0002-content-hosting-model.md`
- [x] T039 Add measurable performance validation notes for SC-006 (95% within 700ms) in `specs/004-interactive-sheet-content/maestro-evidence/performance-summary.md`
- [x] T040 Run full validation commands and capture outputs (`yarn lint`, `yarn typecheck`, `yarn test`) with notes in `specs/004-interactive-sheet-content/maestro-evidence/validation-summary.md`
- [x] T041 [P] Execute all required Maestro flows and store evidence in `specs/004-interactive-sheet-content/maestro-evidence/`
- [x] T042 Run quickstart validation checklist from `specs/004-interactive-sheet-content/quickstart.md` and record completion in `specs/004-interactive-sheet-content/maestro-evidence/quickstart-validation.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: starts immediately.
- **Phase 2 (Foundational)**: depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: depends on Phase 2.
- **Phase 4 (US2)**: depends on Phase 2 (can run in parallel with US1 once foundation is complete).
- **Phase 5 (US3)**: depends on Phase 2; should begin after US1 baseline interaction stability.
- **Phase 6 (Polish)**: depends on completion of all selected stories.

### User Story Dependencies

- **US1 (P1)**: first MVP increment.
- **US2 (P1)**: can run after foundation; may reuse US1 host updates.
- **US3 (P2)**: depends on foundational API plumbing and stable host behavior from US1.

### Within Each User Story

- Write tests first, verify failures, then implement.
- Complete implementation before story-level Maestro pass.
- Story must be independently testable before moving on.

### Parallel Opportunities

- Phase 1 tasks marked `[P]` can run concurrently.
- Foundational TS/Nitro tasks (`T006`, `T007`) can run in parallel with planning of native task `T009`.
- In each story, contract/integration/Maestro authoring tasks marked `[P]` can run concurrently.
- Docs update tasks in Phase 6 marked `[P]` can run in parallel.

---

## Parallel Example: User Story 3

```bash
# Parallel test authoring
Task: "Add wrapper behavior tests in src/__tests__/bottom-sheet.wrapper.test.ts"
Task: "Add presenter integration tests in src/__tests__/bottom-sheet.presenter.integration.test.tsx"
Task: "Author Maestro flow in example/maestro/sheet-consumer-flow-compat.yaml"

# Parallel implementation slices
Task: "Implement native styling application in ios/RnBottomSheet.swift"
Task: "Update example style toggles in example/src/components/InSheetControls.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Setup + Foundational phases.
2. Deliver US1 touch interactivity reliability.
3. Validate independently and gate with story tests + Maestro.

### Incremental Delivery

1. Add US2 width contract and detent restriction guarantees.
2. Add US3 consumer-flow compatibility + styling controls.
3. Finish with docs/support matrix and full validation.

### Team Parallelization

1. One stream handles native host (`ios/RnBottomSheet.swift`).
2. One stream handles TS contract/wrapper/tests (`src/**`).
3. One stream handles example + Maestro + docs (`example/**`, `README.md`, `docs/**`).

---

## Notes

- `[P]` means different files and no dependency on incomplete sibling tasks.
- Story labels map directly to spec user stories for traceability.
- Navigation remains consumer-managed by design; no package-owned nav API tasks should be added.
- README updates and Maestro evidence are completion-blocking for this feature.
- Explicitly close analyzer gaps: branch preflight (I1), API parity audit (C1), nav-surface guard (U1), measurable performance verification (A1), non-iOS fallback verification (C2), and duplicate-task cleanup (D1).
