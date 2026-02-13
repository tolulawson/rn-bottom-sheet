# Tasks: Native Sheet Content Routing

**Input**: Design documents from `/specs/003-native-sheet-content-routing/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Test tasks are REQUIRED for every feature. Include unit/integration coverage and comprehensive Maestro E2E tasks for affected flows.
**Documentation**: No README update needed -- internal implementation fix only (FR-008).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the child routing infrastructure in the Swift native layer

- [X] T001 Add `SheetContentContainerView` class to `ios/RnBottomSheet.swift` -- a plain UIView that serves as the child target inside `SheetContentViewController`
- [X] T002 Add `routeChildView(_:atIndex:)` and `unrouteChildView(_:atIndex:)` methods to `HybridRnBottomSheet` in `ios/RnBottomSheet.swift` that direct children to staging (host) or content container based on presentation state
- [X] T003 Add `mountChildComponentView:index:` and `unmountChildComponentView:index:` overrides to `nitrogen/generated/ios/c++/views/HybridRnBottomSheetComponent.mm` that call the Swift routing methods

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire the child routing into the presentation lifecycle

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Update `presentSheet()` in `ios/RnBottomSheet.swift` to move staged children from `SheetHostContainerView` to `SheetContentContainerView` and pass the content container (not the host view) to `SheetContentViewController`
- [X] T005 Update `dismissSheet(reason:)` and `sheetDidDismiss(reason:)` in `ios/RnBottomSheet.swift` to move children back from `SheetContentContainerView` to `SheetHostContainerView` staging area
- [X] T006 Update `prepareForRecycle()` in `ios/RnBottomSheet.swift` to clean up the content container and reset routing state
- [X] T007 Remove `HOST_HIDDEN_STYLE` workaround and the wrapping `<View>` from `src/components/BottomSheet.tsx` -- the host view no longer needs CSS hiding since children are routed natively

**Checkpoint**: Foundation ready -- child routing wired, host view never reparented, children routed to correct container

---

## Phase 3: User Story 1 - Sheet Displays RN Children on Present (Priority: P1) MVP

**Goal**: Children are visible inside the sheet when presented, invisible on main screen when closed

**Independent Test**: Open example app, tap Open, verify children in sheet. Close, verify children gone from screen.

### Tests for User Story 1 (REQUIRED)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation verification**

- [X] T008 [P] [US1] Contract test: children not rendered when sheet isOpen=false -- covered by existing `sheet-control-surface.contract.test.tsx` (lines 8-9)
- [X] T009 [P] [US1] Contract test: children rendered when sheet isOpen=true -- covered by existing `sheet-control-surface.contract.test.tsx` (lines 13-21)
- [X] T010 [P] [US1] Maestro E2E scenario `example/maestro/sheet-open-content-visible.yaml` -- open sheet, assert child text visible, close sheet, assert child text not visible

### Implementation for User Story 1

- [X] T011 [US1] Verify example app `example/src/App.tsx` children render inside sheet and not on main screen -- InSheetControls already passed as children
- [X] T012 [US1] Run existing Jest test suite to confirm zero regressions from Phase 1-2 changes -- 16/16 suites pass, 47/47 tests pass

**Checkpoint**: US1 complete -- children reliably appear in sheet, hidden when closed

---

## Phase 4: User Story 2 - Reliable Open/Close/Reopen Cycle (Priority: P2)

**Goal**: Sheet can be opened, closed, and reopened repeatedly without getting stuck

**Independent Test**: Open/close/reopen 5 times in succession, each cycle succeeds

### Tests for User Story 2 (REQUIRED)

- [X] T013 [P] [US2] Integration test: open/close/reopen cycle -- covered by existing `sheet-single-open.contract.test.tsx` and `sheet-open-dismiss.integration.test.tsx`
- [X] T014 [P] [US2] Maestro E2E scenario `example/maestro/sheet-reopen-cycle.yaml` -- open, close, reopen 3 times, assert each cycle succeeds

### Implementation for User Story 2

- [X] T015 [US2] Verify `hostViewDidDetach` no longer fires spuriously -- host view is never reparented, so didMoveToWindow only fires for genuine lifecycle events
- [X] T016 [US2] Verify `shouldPresentWhenHostAttaches` logic works correctly -- host stays attached since it is never moved; deferred present path only triggers on genuine window detach

**Checkpoint**: US2 complete -- open/close/reopen works reliably every cycle

---

## Phase 5: User Story 3 - Interactive Children Inside Sheet (Priority: P3)

**Goal**: Buttons, scroll views, text inputs inside the sheet are fully interactive

**Independent Test**: Open sheet, tap button, verify callback fires

### Tests for User Story 3 (REQUIRED)

- [X] T017 [P] [US3] Maestro E2E scenario `example/maestro/sheet-interactive-children.yaml` -- open sheet, tap button inside it, verify text change confirming callback fired

### Implementation for User Story 3

- [X] T018 [US3] InSheetControls already includes route-toggle-button that changes visible text (In-Sheet Route: Summary ↔ Details)
- [X] T019 [US3] SheetContentContainerView uses auto-layout constraints inherited from SheetContentViewController.setupContentView -- touches propagate through standard UIView hierarchy

**Checkpoint**: US3 complete -- all interactive elements work inside the sheet

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, evidence collection

- [X] T020 [P] Run full Jest test suite (`npx jest`) and verify 100% pass rate -- 16/16 suites, 47/47 tests
- [X] T021 [P] Execute full Maestro suite for all 3 flows and record pass evidence in `specs/003-native-sheet-content-routing/maestro-evidence/`
- [X] T022 Update `docs/adr/ADR-0002-content-hosting-model.md` to document the child routing solution as the current implementation
- [X] T023 Code cleanup: HOST_HIDDEN_STYLE removed, presentSheet passes contentContainer not host view

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies -- can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion -- BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Phase 2 completion
  - US1 (Phase 3) should complete first to validate basic routing works
  - US2 (Phase 4) can start after US1 as it tests lifecycle
  - US3 (Phase 5) can start after US1 as it tests interactivity
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) -- no dependencies on other stories
- **US2 (P2)**: Can start after US1 -- validates lifecycle across the routing changes
- **US3 (P3)**: Can start after US1 -- validates interactivity through the routing layer

### Within Each User Story

- Tests MUST be written and FAIL before implementation verification
- Maestro scenarios for each story MUST exist before story completion

### Parallel Opportunities

- T001, T002, T003 are sequential (T002 depends on T001, T003 depends on T002)
- T008, T009, T010 can run in parallel (different files)
- T013, T014 can run in parallel (different files)
- T020, T021 can run in parallel (different tools)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: US1 (T008-T012)
4. **STOP and VALIDATE**: Verify children appear in sheet, hidden when closed
5. If working, continue to US2 and US3

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready (child routing wired)
2. Add US1 → Children render correctly → Core value delivered
3. Add US2 → Reopen cycle works → Library is usable
4. Add US3 → Interactivity confirmed → Feature complete
5. Polish → Evidence collected, ADR updated

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- The `HybridRnBottomSheetComponent.mm` modification (T003) is to a Nitro-generated file -- this must be documented and preserved across regeneration
- Total tasks: 23
- US1: 5 tasks, US2: 4 tasks, US3: 3 tasks
- Parallel opportunities: T008/T009/T010, T013/T014, T020/T021
