# Feature Specification: Example Sheet Stability and Testability

**Feature Branch**: `002-fix-example-sheet`
**Created**: 2026-02-12
**Status**: Complete
**Input**: User description:

## Status: COMPLETE "The example application has several bugs and functional issues that need improvement: duplicate sheet open bug, inaccessible testing functions behind the sheet, and app-wide dark-mode toggle with bottom-sheet verification."

## Clarifications

### Session 2026-02-12

- Q: How should repeated Open actions behave while the sheet is already opening/open? → A: Ignore additional open actions (no-op).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Prevent Duplicate Sheet Presentation (Priority: P1)

As a developer evaluating the example app, I can open the sheet once per open action so the behavior is stable and trustworthy.

**Why this priority**: Duplicate presentation breaks core correctness and undermines confidence in the package.

**Independent Test**: From a fresh app state, repeatedly triggering open only results in one visible sheet instance at any moment.

**Acceptance Scenarios**:

1. **Given** the sheet is closed, **When** the user triggers open, **Then** exactly one sheet is presented.
2. **Given** the sheet is already open, **When** the user triggers open again, **Then** no second sheet is created and state remains consistent.
3. **Given** the sheet is closed after interaction, **When** the user opens it again, **Then** the next presentation is still a single sheet instance.

---

### User Story 2 - Make Test Controls Usable While Sheet Is Open (Priority: P1)

As a developer validating sheet behavior, I can access behavior controls from within the open sheet while keeping top-level state visibility on the main page.

**Why this priority**: The example app must support realistic interaction testing while the sheet is visible.

**Independent Test**: With the sheet open, all behavior controls needed for interaction testing are available inside the sheet content, while open trigger and route/state summary remain visible on the parent screen.

**Acceptance Scenarios**:

1. **Given** the sheet is open, **When** the user needs to test snap, dismiss, swipe, or toggle interactions, **Then** those controls are accessible within the sheet content.
2. **Given** the sheet is open, **When** the user views the parent screen, **Then** only global context information (open action and state/route summary) remains on the main page.
3. **Given** in-sheet controls are used, **When** the user performs each action, **Then** the sheet state and displayed route/state information update consistently.

---

### User Story 3 - Validate Global Dark Mode Behavior (Priority: P2)

As a developer testing visual behavior, I can toggle dark mode for the full example app and confirm sheet behavior remains correct in both themes.

**Why this priority**: Theme support is required for realistic application validation and presentation quality.

**Independent Test**: Toggling dark mode updates the full example surface and the sheet remains readable and functional in both light and dark states.

**Acceptance Scenarios**:

1. **Given** the app is running in light mode, **When** the user enables dark mode, **Then** the entire app switches theme including visible sheet content.
2. **Given** the app is in dark mode, **When** the user interacts with open, snap, dismiss, and navigation actions, **Then** behavior remains correct and controls remain legible.
3. **Given** the app is in dark mode, **When** the user switches back to light mode, **Then** both main page and sheet return to light styling without losing state continuity.

### Edge Cases

- Repeated taps on open while the sheet is opening/open are treated as no-op and MUST NOT create additional sheet instances.
- How does the app behave if dark mode is toggled while the sheet is actively moving between states?
- What happens when the user closes the sheet while an in-sheet toggle action is mid-interaction?
- How does the app recover if theme or route state changes while the sheet is already dismissed?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ensure a single active sheet presentation per open action in the example app.
- **FR-002**: System MUST treat open actions as idempotent while the sheet is open or opening (additional open actions are ignored as no-op).
- **FR-003**: System MUST keep the open trigger and current state/route summary visible on the main page.
- **FR-004**: System MUST place interaction testing controls for sheet behavior inside sheet content while the sheet is open.
- **FR-005**: System MUST support in-sheet controls for close, snap/position changes, swipe-related behavior toggles, and interaction toggles needed for behavior validation.
- **FR-006**: System MUST keep route/state information synchronized between main-page summary and in-sheet actions.
- **FR-007**: System MUST provide a global theme toggle that applies consistently across the full example application surface.
- **FR-008**: System MUST preserve functional sheet behavior in both light and dark themes.
- **FR-009**: System MUST maintain readable and operable controls for both the main page and in-sheet content in both themes.
- **FR-010**: System MUST include updated example-app verification coverage for the duplicate-open bug fix, in-sheet control accessibility, and theme behavior.

### Key Entities *(include if feature involves data)*

- **Example App UI State**: Represents top-level state displayed on the main page, including whether the sheet is open and current route summary.
- **Sheet Interaction Controls**: Represents the set of controls available inside sheet content for closing, snapping, toggling behaviors, and route transitions.
- **Theme Mode State**: Represents current global visual mode and drives consistent light/dark rendering across app and sheet.

## Success Criteria *(mandatory)*

### Maestro E2E Coverage *(mandatory)*

- **Required Tooling**: Maestro (via Maestro MCP where available)
- **Required Flows**:
  - open sheet without duplicate presentation
  - use in-sheet controls for snap/toggle/close while sheet remains interactive
  - switch in-sheet route (`Go to Details` -> `Back to Summary`)
  - toggle app-wide dark mode and verify behavior in both light and dark themes
- **Pass Requirement**: Feature completion requires all defined Maestro scenarios to pass.
- **Evidence Location**: `tasks/todo.md` review findings and feature verification notes.

### Measurable Outcomes

- **SC-001**: In repeated manual validation of 50 open attempts, no action results in more than one visible sheet instance.
- **SC-002**: While the sheet is open, 100% of required interaction controls are accessible from within the sheet content without needing to dismiss it.
- **SC-003**: In both light and dark modes, core example flows (open, close, snap, route switch) complete successfully in at least 95% of validation runs.
- **SC-004**: Theme toggling updates the full example application surface (main screen and sheet content) within one interaction cycle and preserves interaction continuity.
- **SC-005**: Updated verification artifacts cover duplicate-open prevention, in-sheet control accessibility, and light/dark mode behavior for the example app.

## Assumptions

- This feature scope is limited to example-app behavior and validation usability, not a redesign of the library’s external API.
- Existing sheet capabilities remain available; this work reorganizes control placement and correctness in the example app.
- Dark mode behavior is expected to be validated for both the main page and sheet content in the same application session.
