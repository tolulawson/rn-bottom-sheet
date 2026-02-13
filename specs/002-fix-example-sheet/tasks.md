# Tasks: Example Sheet Stability and Testability

**Input**: Design documents from `/Users/tolu/Desktop/dev/rn-bottom-sheet/specs/002-fix-example-sheet/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/example-sheet-behavior.yaml, quickstart.md

**Tests**: Required. Each user story includes Jest and Maestro coverage.
**Documentation**: README updates are only required if implementation changes public API or user-visible library contracts.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared files and deterministic selectors used by all stories.

- [X] T001 Create shared example app test ID constants in `example/src/testids.ts`
- [X] T002 [P] Add Maestro scenario scaffold directory with feature README in `example/maestro/README.md`
- [X] T003 [P] Add feature verification section template in `tasks/todo.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish common wiring required by all user stories.

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [X] T004 Add stable `testID`/accessibility labels for sheet controls and status fields in `example/src/App.tsx`
- [X] T005 [P] Introduce centralized example view-state model types in `example/src/example-state.ts`
- [X] T006 [P] Add helper utilities for open idempotency and route reset rules in `example/src/example-state.ts`
- [X] T007 Wire foundational state helpers into the screen root in `example/src/App.tsx`

**Checkpoint**: Foundational state/selectors are ready; story work can begin.

---

## Phase 3: User Story 1 - Prevent Duplicate Sheet Presentation (Priority: P1) 🎯 MVP

**Goal**: Ensure one active sheet presentation with idempotent repeated open behavior.

**Independent Test**: From a fresh state, repeated Open actions during closed/opening/open never produce more than one visible sheet instance.

### Tests for User Story 1 (REQUIRED)

- [X] T008 [P] [US1] Add contract test for single-sheet-instance rule in `example/src/__tests__/sheet-single-open.contract.test.tsx`
- [X] T009 [P] [US1] Add integration test for rapid/repeated open actions in `example/src/__tests__/sheet-open-dismiss.integration.test.tsx`
- [X] T010 [P] [US1] Add Maestro flow for duplicate-open prevention in `example/maestro/sheet-single-open.yaml`

### Implementation for User Story 1

- [X] T011 [US1] Implement idempotent open-action guard in `example/src/App.tsx`
- [X] T012 [US1] Model explicit sheet phase transitions (`closed/opening/open/dismissing`) in `example/src/App.tsx`
- [X] T013 [US1] Ensure repeated open requests are no-op while opening/open in `example/src/App.tsx`
- [X] T014 [US1] Update status summary to expose phase and verify single-instance behavior in `example/src/App.tsx`

**Checkpoint**: Duplicate-open bug is fixed and independently validated.

---

## Phase 4: User Story 2 - Make Test Controls Usable While Sheet Is Open (Priority: P1)

**Goal**: Move behavior controls into the sheet while keeping global open trigger and route/state summary on the main page.

**Independent Test**: With sheet open, all required interaction controls are usable within the sheet; main page still shows open trigger and synchronized summary.

### Tests for User Story 2 (REQUIRED)

- [X] T015 [P] [US2] Add contract test for in-sheet control accessibility and route-summary sync in `example/src/__tests__/sheet-control-surface.contract.test.tsx`
- [X] T016 [P] [US2] Extend integration test for in-sheet snap/toggle/close/route flows in `example/src/__tests__/sheet-open-dismiss.integration.test.tsx`
- [X] T017 [P] [US2] Add Maestro flow for in-sheet controls and route transitions in `example/maestro/sheet-internal-controls.yaml`

### Implementation for User Story 2

- [X] T018 [US2] Create in-sheet behavior control panel component in `example/src/components/InSheetControls.tsx`
- [X] T019 [US2] Move snap/toggle/close controls from parent page into `InSheetControls` in `example/src/App.tsx`
- [X] T020 [US2] Keep only global open action and route/state summary on parent surface in `example/src/App.tsx`
- [X] T021 [US2] Ensure in-sheet route navigation (`summary/details`) updates parent summary consistently in `example/src/App.tsx`

**Checkpoint**: Sheet interaction controls are fully testable from within the open sheet.

---

## Phase 5: User Story 3 - Validate Global Dark Mode Behavior (Priority: P2)

**Goal**: Add app-wide light/dark toggle and verify sheet behavior/readability in both themes.

**Independent Test**: Theme toggle updates parent and sheet surfaces in one interaction cycle while open/close/snap/route flows continue to work.

### Tests for User Story 3 (REQUIRED)

- [X] T022 [P] [US3] Add contract test for theme-state propagation to parent and sheet surfaces in `example/src/__tests__/sheet-theme.contract.test.tsx`
- [X] T023 [P] [US3] Extend integration test for theme toggle with active sheet interactions in `example/src/__tests__/sheet-open-dismiss.integration.test.tsx`
- [X] T024 [P] [US3] Add Maestro flow for light/dark behavior validation in `example/maestro/sheet-theme-toggle.yaml`

### Implementation for User Story 3

- [X] T025 [US3] Add app-level theme mode state (`light|dark`) and toggle control in `example/src/App.tsx`
- [X] T026 [US3] Extract theme tokens/styles for parent and sheet content in `example/src/theme.ts`
- [X] T027 [US3] Apply theme-aware styles to all status text, controls, and sheet content in `example/src/App.tsx`
- [X] T028 [US3] Preserve sheet and route interaction continuity across theme toggles in `example/src/App.tsx`

**Checkpoint**: Global dark-mode behavior is stable and validated with active sheet interactions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, evidence capture, and documentation sync checks.

- [X] T029 [P] Run full Jest verification for example flow changes and record outcomes in `tasks/todo.md`
- [X] T030 [P] Run required Maestro feature flows and record outcomes in `tasks/todo.md`
- [X] T031 Validate quickstart steps against implemented behavior in `specs/002-fix-example-sheet/quickstart.md`
- [X] T032 Review public API/library behavior impact and update `README.md` only if required
- [X] T033 Finalize feature review notes and completion evidence in `tasks/todo.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): starts immediately.
- Foundational (Phase 2): depends on Setup; blocks all story work.
- User Stories (Phases 3-5): depend on Foundational completion.
- Polish (Phase 6): depends on completion of all targeted user stories.

### User Story Dependencies

- **US1 (P1)**: starts after Foundational; no dependency on other stories.
- **US2 (P1)**: starts after Foundational; should integrate with US1 state model but remain independently testable.
- **US3 (P2)**: starts after Foundational; depends on control layout from US2 for complete theme validation.

### Within Each User Story

- Add/extend tests first and confirm expected failure before implementation tasks.
- Implement state/behavior changes.
- Re-run story-specific Jest + Maestro flow before checkpoint.

---

## Parallel Opportunities

- T002 and T003 can run in parallel during Setup.
- T005 and T006 can run in parallel during Foundational.
- For each user story, the three test tasks are parallelizable.
- US1 and US2 can run in parallel after Foundational if separate engineers coordinate `example/src/App.tsx` changes.

---

## Parallel Example: User Story 2

```bash
Task: "T015 [US2] contract test in example/src/__tests__/sheet-control-surface.contract.test.tsx"
Task: "T016 [US2] integration test updates in example/src/__tests__/sheet-open-dismiss.integration.test.tsx"
Task: "T017 [US2] Maestro flow in example/maestro/sheet-internal-controls.yaml"
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phases 1-2.
2. Deliver US1 (Phase 3).
3. Validate single-sheet-instance behavior before expanding scope.

### Incremental Delivery

1. Deliver US1 (duplicate-open stability).
2. Deliver US2 (in-sheet testability architecture).
3. Deliver US3 (global dark-mode validation).
4. Run Phase 6 full verification and evidence capture.

