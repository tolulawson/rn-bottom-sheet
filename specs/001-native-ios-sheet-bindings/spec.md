# Feature Specification: Native iOS Sheet Bindings

**Feature Branch**: `001-native-ios-sheet-bindings`  
**Created**: 2026-02-12  
**Status**: Complete  
**Input**: User description: "Build a React Native library that provides native iOS sheet bindings using Nitro Views with React Native children, dynamic detents, React Navigation integration, in-sheet navigation, and Reanimated-compatible APIs."

## Status: COMPLETE

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Present Native Sheet Content (Priority: P1)

As a React Native developer, I can present and dismiss a native-feeling iOS sheet that renders arbitrary React Native child content so that product experiences match Apple sheet behavior.

**Why this priority**: This is the core product value and the minimum viable capability for the package.

**Independent Test**: In an example app, the developer can open/close a sheet and see custom React Native children rendered correctly without writing custom native code.

**Acceptance Scenarios**:

1. **Given** a screen using the library, **When** the developer triggers open state, **Then** a native iOS sheet appears and displays provided child content.
2. **Given** a visible sheet, **When** the developer triggers dismiss state, **Then** the sheet closes and emits dismissal callbacks.
3. **Given** sheet content includes interactive controls, **When** the user interacts with controls, **Then** interactions are handled normally inside the sheet.

---

### User Story 2 - Configure Detents and Sheet Behavior (Priority: P1)

As a developer, I can configure sheet sizing and interaction behavior (including dynamic detents) so that sheet motion and resting states match product requirements.

**Why this priority**: Detent and behavior configuration is essential to achieve native quality and practical adoption.

**Independent Test**: In isolation, the developer can set multiple detents and observe deterministic initial/resting behavior and state change callbacks.

**Acceptance Scenarios**:

1. **Given** a sheet configured with multiple detents, **When** the sheet is opened, **Then** it starts at the configured initial detent.
2. **Given** a visible sheet with multiple detents, **When** user drag or programmatic snap occurs, **Then** the sheet moves to a valid detent and reports the new detent.
3. **Given** invalid detent input, **When** configuration is parsed, **Then** the system rejects configuration with a clear developer-facing error.

---

### User Story 3 - Navigation and Animation Interop (Priority: P2)

As a developer, I can integrate sheet flows with React Navigation and use supported Reanimated patterns so that sheet-based journeys fit existing app architecture.

**Why this priority**: Integration determines production usefulness across real apps, but depends on core sheet behavior being complete first.

**Independent Test**: In a sample flow, a nested navigation journey inside the sheet works, and supported animation wrappers run without breaking sheet state.

**Acceptance Scenarios**:

1. **Given** an app route triggers a sheet flow, **When** route state changes, **Then** sheet open/close state can be synchronized with navigation behavior.
2. **Given** nested navigation content inside the sheet, **When** the user navigates between internal screens, **Then** the sheet remains stable and navigation actions resolve predictably.
3. **Given** a supported animated wrapper usage, **When** animation-driven updates run, **Then** sheet rendering and interaction remain correct.

---

### Edge Cases

- What happens when a detent list is empty, unsorted, duplicated, or out of valid range?
- How does the system handle rapid open/close toggles in short succession?
- How does the system behave when content height changes while the sheet is visible?
- How is behavior defined when keyboard appearance changes available vertical space?
- What happens when a route change attempts to dismiss an already dismissed sheet?
- How does fallback behavior work on non-iOS platforms?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a component interface that supports both controlled and uncontrolled sheet open state.
- **FR-002**: System MUST allow imperative sheet control through a stable reference API (including present, dismiss, and detent snap actions).
- **FR-003**: System MUST render arbitrary React Native child content inside the sheet.
- **FR-004**: System MUST support configurable sheet detents including semantic options (`fit`, `medium`, `large`) and numeric sizing variants (`fraction`, `points`).
- **FR-005**: System MUST validate sheet configuration input and surface clear developer-facing errors for invalid values, including empty detent lists, out-of-range numeric values, duplicate resolved detents, unsorted detents, and invalid selected-detent indices.
- **FR-006**: System MUST emit lifecycle callbacks for present/dismiss transitions with deterministic, once-per-transition ordering (`onWillPresent` -> `onDidPresent` -> `onWillDismiss` -> `onDidDismiss`) for a successful open/close cycle.
- **FR-007**: System MUST emit detent change callbacks when detent selection changes.
- **FR-008**: System MUST provide configurable interaction behavior including swipe dismissal, grabber visibility, and background interaction mode.
- **FR-009**: System MUST support one active sheet session at a time in v1 and define deterministic behavior for concurrent open requests and rapid open/close toggles (latest intent wins without duplicate active sessions).
- **FR-010**: System MUST provide optional integration utilities that allow synchronization with React Navigation state.
- **FR-011**: System MUST allow navigation content within the sheet without forcing a custom navigation stack API.
- **FR-012**: System MUST provide a documented compatibility contract for supported Reanimated integration patterns.
- **FR-013**: System MUST provide deterministic non-iOS fallback behavior that avoids runtime crashes.
- **FR-014**: System MUST include an example app demonstrating core usage, detent configuration, navigation integration, and animation interoperability.
- **FR-015**: System MUST provide in-repository knowledge artifacts that document design decisions, references, and maintenance workflow for the feature.
- **FR-016**: System MUST define comprehensive Maestro MCP E2E coverage for the example app and require passing results before feature completion.
- **FR-017**: System MUST provide diagnosable developer-facing observability for integration failures through deterministic validation errors and development warnings, while explicitly deferring production telemetry integration beyond these diagnostics for v1.
- **FR-018**: System MUST handle content-size and keyboard-driven vertical-space changes while visible without crashes, preserving the current detent when valid and otherwise moving to the nearest valid configured detent.

### Key Entities *(include if feature involves data)*

- **Sheet Configuration**: Represents declared sheet behavior inputs such as detents, interaction modes, lifecycle callbacks, and control mode.
- **Sheet Session**: Represents a concrete runtime presentation instance, including open/closed state, active detent index, and lifecycle event state.
- **Detent Definition**: Represents a single allowable resting height option and its validation rules.
- **Integration Binding**: Represents optional synchronization mapping between navigation state, sheet state, and callbacks.

## Success Criteria *(mandatory)*

### Maestro E2E Coverage *(mandatory)*

- **Required Tooling**: Maestro (via Maestro MCP where available)
- **Required Flows**:
  - sheet open from example UI
  - sheet dismiss flow
  - detent interaction and selection updates
  - in-sheet navigation journey (`Go to Details` -> `Back to Summary`)
- **Pass Requirement**: Feature completion requires all defined Maestro scenarios to pass.
- **Evidence Location**: Feature task/review artifacts in `tasks/todo.md` and related verification notes.

### Measurable Outcomes

- **SC-001**: Developers can integrate and present a native iOS sheet with custom child content in a new screen using documented examples in under 30 minutes.
- **SC-002**: In validation scenarios, 100% of configured valid detents resolve predictably, and 100% of invalid detent configurations fail with explicit errors.
- **SC-003**: In example app test runs, primary user flows (open, dismiss, detent change, in-sheet navigation) complete successfully in at least 95% of runs without manual recovery.
- **SC-004**: The package provides and passes an automated verification set covering unit-level API behavior plus at least one integration-level sheet lifecycle flow.
- **SC-005**: Non-iOS execution paths complete without crashes and produce documented, deterministic fallback behavior in 100% of tested runs.
- **SC-006**: Maestro MCP flows for open, dismiss, detent interaction, and in-sheet navigation pass in 100% of completion-gate runs.
- **SC-007**: In automated lifecycle verification, callback ordering for successful open/close cycles is deterministic (`onWillPresent` -> `onDidPresent` -> `onWillDismiss` -> `onDidDismiss`) in 100% of tested runs.

## Assumptions

- v1 focuses on iOS-native fidelity; equivalent Android native parity is out of scope.
- The package targets New Architecture React Native projects that can host Nitro Views; acceptance outcomes are defined for this path and do not guarantee compatibility with legacy architecture.
- iOS-native behavior scope and acceptance outcomes target iOS 15.1+ environments (matching the current example-app deployment target and `UISheetPresentationController` usage).
- Integration with navigation and animation is scoped to documented supported pathways rather than unlimited interoperability guarantees.
- Production telemetry and analytics plumbing is intentionally deferred for v1; observability scope is limited to deterministic validation errors, lifecycle callbacks, and documented development warnings.
