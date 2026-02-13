# Feature Specification: Native Sheet Content Routing

**Feature Branch**: `003-native-sheet-content-routing`  
**Created**: 2026-02-12  
**Status**: Draft  
**Input**: User description: "Render React Native views inside native UIKit sheet"

## User Scenarios & Testing

### User Story 1 - Sheet Displays RN Children on Present (Priority: P1)

A developer wraps arbitrary React Native components (Text, Button, ScrollView, custom components) as children of `<BottomSheet>`. When the sheet opens, those children appear inside the native UIKit sheet. When the sheet is closed, the children are not visible on the main screen.

**Why this priority**: This is the fundamental value proposition of the library. Without reliable content rendering, no other feature matters.

**Independent Test**: Open the example app, tap "Open Sheet", verify children (text, buttons) are visible inside the sheet. Close the sheet, verify children are not visible on the main screen.

**Acceptance Scenarios**:

1. **Given** a `<BottomSheet>` with Text and Button children and `isOpen={false}`, **When** the app renders, **Then** the children are not visible on the main screen.
2. **Given** a `<BottomSheet>` with children and `isOpen={false}`, **When** `isOpen` changes to `true`, **Then** the native sheet presents and children are visible inside it, interactive, and correctly laid out.
3. **Given** an open sheet with children, **When** `isOpen` changes to `false`, **Then** the sheet dismisses and children disappear from the screen entirely.

---

### User Story 2 - Reliable Open/Close/Reopen Cycle (Priority: P2)

A developer opens and closes the sheet multiple times in succession. Each cycle works identically -- the sheet never gets stuck in an intermediate state, and children always appear correctly on reopen.

**Why this priority**: If the sheet can only be opened once, the library is unusable for real applications. This directly addresses the known "stuck in opening" bug caused by post-dismiss view orphaning.

**Independent Test**: Open the sheet, close it (swipe or programmatic), open it again. Repeat 5 times. Verify each cycle completes successfully without hangs.

**Acceptance Scenarios**:

1. **Given** a closed sheet, **When** the user opens the sheet, closes it via swipe, and opens it again, **Then** the sheet presents with children visible on every cycle.
2. **Given** a closed sheet, **When** the user opens the sheet, closes it programmatically, and immediately opens it again, **Then** the sheet presents without getting stuck in a loading/opening state.
3. **Given** a rapid open/close/open sequence (close and reopen within 300ms), **When** the sequence completes, **Then** the sheet ends in the correct final state (open if last action was open, closed if last action was close).

---

### User Story 3 - Interactive Children Inside Sheet (Priority: P3)

Children rendered inside the sheet retain full interactivity: buttons respond to taps, text inputs accept keyboard input, scroll views scroll, and gesture handlers operate correctly within the sheet's bounds.

**Why this priority**: Content rendering without interactivity is only half the solution. Real apps need tappable buttons, scrollable lists, and form inputs inside sheets.

**Independent Test**: Open the sheet, tap a button inside it, verify the button's onPress fires. Type into a text input inside the sheet, verify text appears.

**Acceptance Scenarios**:

1. **Given** a sheet with a `<Button>` child, **When** the user taps the button inside the presented sheet, **Then** the button's `onPress` callback fires.
2. **Given** a sheet with a `<ScrollView>` containing a long list, **When** the user scrolls inside the sheet, **Then** the scroll view scrolls its content (respecting `expandsWhenScrolledToEdge` configuration).
3. **Given** a sheet with a `<TextInput>`, **When** the user taps the input and types, **Then** the keyboard appears and text is entered correctly.

---

### Edge Cases

- What happens when children change while the sheet is open (e.g., conditional rendering based on state)?
- How does Fabric reconciliation behave when React re-renders trigger child add/remove while the sheet is presented?
- What happens if the sheet is presented but the Fabric component is recycled before dismiss completes?
- What happens to children when the sheet is mid-animation (presenting or dismissing) and a state change triggers a re-render?

## Requirements

### Functional Requirements

- **FR-001**: The native component MUST route React Native children into the UIKit sheet's content view when the sheet is presented.
- **FR-002**: React Native children MUST NOT be visible on the main screen when the sheet is in a closed state.
- **FR-003**: The native component MUST maintain Fabric reconciliation compatibility -- child mount/unmount operations from Fabric MUST succeed regardless of whether the sheet is presented or closed.
- **FR-004**: The sheet MUST support reliable open/close/reopen cycles without entering a stuck state due to view lifecycle timing issues.
- **FR-005**: Children inside the presented sheet MUST retain full touch interactivity (tap, scroll, text input, gesture handlers).
- **FR-006**: Dynamic child changes (add/remove/update children while sheet is open) MUST be reflected inside the presented sheet.
- **FR-007**: The component MUST handle Fabric view recycling correctly -- `prepareForRecycle` MUST clean up all routing state without leaving orphaned views.
- **FR-008**: The existing public API (`<BottomSheet>` props, `BottomSheetMethods`, lifecycle callbacks) MUST NOT change. This is an internal implementation fix.

### Key Entities

- **SheetHostContainerView**: The UIView that serves as the Fabric content view and mounting point for React children.
- **SheetContentViewController**: The UIViewController whose view hierarchy appears inside the UIKit sheet.
- **HybridRnBottomSheetComponent**: The Nitro-generated Fabric component that bridges React props to the Swift implementation.
- **BottomSheet (TSX)**: The React wrapper component that renders `RnBottomSheetView` with children.

### Documentation Impact

- **README Update Required**: No
- **Why**: This is an internal implementation fix. No public API surface area or user-visible behavior changes beyond bug fixes. Consumers use the same `<BottomSheet>` component with the same props.

## Success Criteria

### Maestro E2E Coverage

- **Required Tooling**: Maestro (via Maestro MCP where available)
- **Required Flows**:
  - `sheet-open-content-visible.yaml`: Open sheet, assert children visible inside sheet, assert children not visible on main screen.
  - `sheet-reopen-cycle.yaml`: Open, close, reopen 3 times, assert each cycle succeeds.
  - `sheet-interactive-children.yaml`: Open sheet, tap a button inside it, verify callback fires (text changes on screen).
- **Pass Requirement**: All three flows pass 100% before feature completion.
- **Evidence Location**: `specs/003-native-sheet-content-routing/maestro-evidence/`

### Measurable Outcomes

- **SC-001**: Children of `<BottomSheet>` are never visible on the main screen when the sheet is closed (verified by Maestro assertion).
- **SC-002**: Children are visible and correctly laid out inside the native sheet within 500ms of `onDidPresent` firing.
- **SC-003**: Open/close/reopen cycles succeed 100% of the time over 5 consecutive cycles (verified by Maestro loop).
- **SC-004**: Interactive elements inside the sheet (buttons, inputs) respond to user interaction identically to elements outside the sheet.
- **SC-005**: All existing contract tests and integration tests continue to pass with zero regressions.
- **SC-006**: Maestro scenarios for all affected primary/critical flows pass 100% before completion.
