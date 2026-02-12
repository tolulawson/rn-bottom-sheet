# Tasks: Native iOS Sheet Bindings

**Input**: Design documents from `/Users/tolu/Desktop/dev/rn-bottom-sheet/specs/001-native-ios-sheet-bindings/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include tests because the specification requires automated verification coverage for API and integration behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature scaffolding, generated bindings workflow, and test harness entry points.

- [x] T001 Create feature README entry and scope note in docs/changelog-notes/README.md
- [x] T002 Add feature contract index pointer in docs/knowledge-index.md
- [x] T003 [P] Add test file scaffold in src/__tests__/bottom-sheet.contract.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define core cross-story contracts and validation baseline.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Expand public Nitro contract types and method signatures in src/RnBottomSheet.nitro.ts
- [x] T005 [P] Add shared TypeScript type definitions and validation utilities in src/types/bottom-sheet.ts
- [x] T006 [P] Add detent normalization and validation helpers in src/utils/detents.ts
- [x] T007 Add core wrapper export wiring in src/index.tsx
- [x] T008 Add baseline native state fields and callback bridge stubs in ios/RnBottomSheet.swift
- [x] T009 Add non-iOS fallback helper scaffold in src/platform/fallback.ts

**Checkpoint**: Contract and validation foundation complete; user story slices can proceed.

---

## Phase 3: User Story 1 - Present Native Sheet Content (Priority: P1) 🎯 MVP

**Goal**: Present/dismiss native iOS sheet and render arbitrary React Native child content.

**Independent Test**: Example app can open and close a sheet while rendering custom child controls and receiving lifecycle events.

### Tests for User Story 1

- [x] T010 [P] [US1] Add lifecycle callback unit tests in src/__tests__/bottom-sheet.lifecycle.test.ts
- [x] T011 [P] [US1] Add iOS integration flow assertions in example/src/__tests__/sheet-open-dismiss.integration.test.tsx

### Implementation for User Story 1

- [x] T012 [US1] Implement controlled/uncontrolled open state orchestration in src/components/BottomSheet.tsx
- [x] T013 [US1] Implement imperative ref methods (`present`, `dismiss`) in src/components/BottomSheet.tsx
- [x] T014 [US1] Implement native presentation and dismissal flow in ios/RnBottomSheet.swift
- [x] T015 [US1] Implement child content host container and mount behavior in ios/RnBottomSheet.swift
- [x] T016 [US1] Wire lifecycle event callbacks to JS layer in src/components/BottomSheet.tsx
- [x] T017 [US1] Replace example basic usage with open/dismiss child-content scenario in example/src/App.tsx

**Checkpoint**: User Story 1 is independently functional and demonstrable.

---

## Phase 4: User Story 2 - Configure Detents and Sheet Behavior (Priority: P1)

**Goal**: Support validated detent configuration, detent change reporting, and configurable interaction behavior.

**Independent Test**: Sheet supports semantic/numeric detents, initial selection, snapping, and deterministic validation errors.

### Tests for User Story 2

- [x] T018 [P] [US2] Add detent normalization/validation unit tests in src/__tests__/bottom-sheet.detents.test.ts
- [x] T019 [P] [US2] Add imperative snap and detent callback tests in src/__tests__/bottom-sheet.methods.test.ts

### Implementation for User Story 2

- [x] T020 [US2] Implement detent parsing and error surface in src/utils/detents.ts
- [x] T021 [US2] Add configurable behavior props wiring (`grabber`, swipe dismiss, background mode) in src/components/BottomSheet.tsx
- [x] T022 [US2] Implement detent mapping and selected-detent updates in ios/RnBottomSheet.swift
- [x] T023 [US2] Implement imperative `snapToDetent` and `getCurrentDetentIndex` bridge in ios/RnBottomSheet.swift
- [x] T024 [US2] Add example app detent controls and behavior toggles in example/src/App.tsx

**Checkpoint**: User Story 2 is independently testable with deterministic detent behavior.

---

## Phase 5: User Story 3 - Navigation and Animation Interop (Priority: P2)

**Goal**: Provide optional React Navigation integration support and documented Reanimated compatibility pathways.

**Independent Test**: Example app can drive a sheet from navigation state and run supported animated wrapper flow without state breakage.

### Tests for User Story 3

- [x] T025 [P] [US3] Add navigation-sync behavior tests in src/__tests__/bottom-sheet.navigation.test.ts
- [x] T026 [P] [US3] Add reanimated compatibility contract tests in src/__tests__/bottom-sheet.reanimated.test.ts

### Implementation for User Story 3

- [x] T027 [P] [US3] Create optional navigation adapter helpers in src/navigation/bottom-sheet-adapter.ts
- [x] T028 [US3] Export optional navigation adapter entry in src/index.tsx
- [x] T029 [US3] Add documented animated wrapper compatibility surface in src/components/BottomSheetNativeView.tsx
- [x] T030 [US3] Implement explicit non-iOS fallback behavior and warnings in src/platform/fallback.ts
- [ ] T031 [US3] Add example navigation + animation scenarios in example/src/App.tsx

**Checkpoint**: User Story 3 is independently functional and documented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Align docs, verification scripts, and release readiness.

- [ ] T032 [P] Update public usage documentation and API surface in README.md
- [ ] T033 [P] Record architecture decisions and constraints updates in docs/adr/ADR-0001-ios-sheet-engine.md
- [ ] T034 Add verification and runbook notes for this feature in docs/implementation-plan-v1.md
- [ ] T035 Execute validation commands and capture results in tasks/todo.md
- [ ] T036 [P] Add Maestro example-app E2E flow definitions in example/.maestro/sheet-core-flows.yaml
- [ ] T037 [P] Add Maestro MCP runbook notes and invocation expectations in docs/implementation-plan-v1.md
- [ ] T038 Execute conditional Maestro MCP gate and update `E2E Gate State` in specs/001-native-ios-sheet-bindings/spec.md (`deferred` -> `required` only when stability criteria are met)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: starts immediately.
- **Phase 2 (Foundational)**: depends on Phase 1 and blocks story phases.
- **Phases 3-5 (User Stories)**: depend on Phase 2; then can be worked in priority order (US1 -> US2 -> US3).
- **Phase 6 (Polish)**: depends on completion of intended story scope.
- **Maestro MCP Gate**: runs in Phase 6 as non-blocking while `E2E Gate State` is `deferred`, and becomes blocking only after it is switched to `required`.

### User Story Dependencies

- **US1 (P1)**: no story dependency after Phase 2.
- **US2 (P1)**: depends on foundational utilities and US1 presentation baseline.
- **US3 (P2)**: depends on stable US1 and US2 APIs.

### Within Each User Story

- Tests first when practical to validate expected behavior.
- JS contract/wrapper updates precede native bridge final wiring.
- Example updates follow feature completion for story demo validation.

### Parallel Opportunities

- Tasks marked `[P]` are parallel-safe by file independence.
- Test tasks within a story can run in parallel.
- Helper/type tasks in Phase 2 can run in parallel.

---

## Parallel Example: User Story 2

```bash
Task: "Add detent normalization/validation unit tests in src/__tests__/bottom-sheet.detents.test.ts"
Task: "Add imperative snap and detent callback tests in src/__tests__/bottom-sheet.methods.test.ts"
```

```bash
Task: "Implement detent parsing and error surface in src/utils/detents.ts"
Task: "Implement detent mapping and selected-detent updates in ios/RnBottomSheet.swift"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Complete User Story 1 end-to-end.
3. Validate independent open/dismiss + child rendering behavior.

### Incremental Delivery

1. Deliver US1 for baseline value.
2. Add US2 for full detent and behavior controls.
3. Add US3 for integration and compatibility pathways.
4. Finish with documentation and verification hardening.

### Parallel Team Strategy

1. One contributor owns JS contract/wrapper updates.
2. One contributor owns iOS bridge implementation.
3. Integration contributor covers example app and cross-layer validation.

---

## Notes

- `[P]` means no dependency on incomplete tasks in other files.
- Story labels maintain traceability to spec user stories.
- Keep unsupported behavior explicit and documented, not implied.
