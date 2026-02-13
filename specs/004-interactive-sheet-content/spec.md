# Feature Specification: Interactive Sheet Content and Core Sheet Configuration

**Feature Branch**: `004-interactive-sheet-content`
**Created**: 2026-02-12
**Status**: Complete
**Input**: User description: "Mount native views as children of the bottom sheet so children are touch-responsive, fill sheet width, expose core UIKit sheet configuration, and keep navigation consumer-managed."

## Status: COMPLETE

## Problem Statement

The current sheet content mounting path does not consistently deliver touch events to mounted children, and child content does not reliably fill the horizontal space of the sheet container. This blocks production use for interactive in-sheet controls and consumer-managed multi-step flows.

## Research Summary

### Current Observations

1. Child content is mounted inside the sheet hierarchy, but touch behavior indicates gestures are being consumed at the sheet layer before child handlers run.
2. Child width behavior is not constrained by a clear "sheet content width contract," resulting in content not naturally stretching to the available sheet width.
3. The example app currently demonstrates route toggling through local state; this aligns with the intended direction that multi-screen flow orchestration should remain consumer-managed rather than package-owned.

### Structural Direction

1. The library needs a single, explicit content-host boundary that guarantees:
   - touch routing to descendant interactive views first
   - predictable layout constraints for full-width child composition
2. In-sheet navigation should remain consumer-managed (for example via existing navigation/state libraries rendered as sheet children), while the package provides deterministic hosting primitives.
3. Public behavior changes here are user-visible and API-surface relevant, so README updates are mandatory in the same change set.

## Clarifications

### Session 2026-02-12

- Q: Should core in-sheet navigation remain in package scope? → A: No. Keep navigation consumer-managed; package remains a lean sheet wrapper.
- Q: Which sheet configuration scope should be exposed now? → A: Expose all common iPhone sheet options; defer iPad/compact-height niche options.
- Q: Should styling be included in this same feature scope? → A: Yes. Include styling (color-mode + content blur/background) in this spec.
- Q: Should this spec add explicit guardrails for API scope, measurable performance, and non-iOS fallback validation? → A: Yes. Add explicit requirements and measurable outcomes for these concerns.

## User Scenarios & Testing

### User Story 1 - Interactive Children Work Inside Sheet (Priority: P1)

A developer renders interactive React Native children (buttons, inputs, lists) inside the bottom sheet. When users tap or scroll inside sheet content, child interactions fire as expected rather than being swallowed by the sheet container.

**Why this priority**: If child views cannot receive touch/gesture events, the sheet cannot host real app UI.

**Independent Test**: Open sheet in example app, tap multiple in-sheet buttons, and verify state changes from those callbacks.

**Acceptance Scenarios**:

1. **Given** the sheet is open with tappable child controls, **When** the user taps a child button, **Then** the child `onPress` callback runs and the UI reflects the change.
2. **Given** the sheet is open with scrollable child content, **When** the user scrolls within child content, **Then** scrolling occurs in the child view according to configured sheet/scroll interaction behavior.
3. **Given** the sheet is open with a text input child, **When** the user focuses and types, **Then** text input receives focus and keyboard entry updates the field value.

---

### User Story 2 - Child Content Fills Sheet Width by Default (Priority: P1)

A developer places standard content containers inside the sheet without hand-tuning fixed widths. Content naturally expands to the full usable width of the sheet body.

**Why this priority**: Full-width layout is the expected default for form- and flow-driven sheet content.

**Independent Test**: Render a content container without fixed width and verify it matches sheet content width across detents.

**Acceptance Scenarios**:

1. **Given** a sheet child root container without explicit fixed width, **When** the sheet opens, **Then** the child root expands to the full width of the sheet content area.
2. **Given** the selected detent changes while sheet remains open, **When** layout recomputes, **Then** child width remains constrained to full sheet content width with no horizontal clipping.
3. **Given** content uses nested rows/columns, **When** layout is measured, **Then** descendants respect the full-width root contract unless explicitly overridden by consumer styles.

---

### User Story 3 - Consumer-Managed Flow Compatibility Inside Sheet (Priority: P2)

A developer renders a consumer-managed flow (for example local route state or a nested native-stack navigator) inside the sheet, while the package continues to provide stable sheet presentation and interaction primitives.

**Why this priority**: Multi-step user journeys are common in sheets, and package value depends on composing with existing flow libraries without adding navigation bloat.

**Independent Test**: Open sheet with consumer-managed flow content, navigate between at least 2 internal states, and verify sheet lifecycle remains stable.

**Acceptance Scenarios**:

1. **Given** the sheet is open with consumer-managed flow content, **When** internal flow state changes, **Then** sheet open state and detent behavior remain stable.
2. **Given** a nested navigation/state library is used inside sheet content, **When** the user moves forward/back in that flow, **Then** no package-owned navigation API is required.
3. **Given** the sheet is dismissed and reopened, **When** consumer flow state policy is applied, **Then** behavior follows consumer logic without package-imposed route resets.

---

### Edge Cases

- Rapid tap gestures while sheet is animating between detents.
- Touch handling for nested gesture responders (scroll + button + input) inside a single sheet view tree.
- Orientation changes while sheet is open and content should maintain full-width contract.
- Consumer-managed flow state changes triggered during `onWillDismiss` / `onDidDismiss` transitions.
- Runtime theme/style changes while sheet is already open (for example switching `preferredColorScheme` or `contentBackgroundStyle`).

## Requirements

### Functional Requirements

- **FR-001**: The system MUST deliver touch events to interactive child views mounted inside the sheet content area.
- **FR-002**: The system MUST preserve expected scroll and text-input interaction behavior for child views mounted inside the sheet.
- **FR-003**: The system MUST provide a default content layout contract where the mounted child root can fill the full available width of the sheet content area.
- **FR-004**: The full-width content contract MUST remain stable across detent changes and runtime re-layout.
- **FR-005**: The package MUST NOT introduce a package-owned navigation stack API for in-sheet flows in this feature.
- **FR-006**: The package MUST remain compatible with consumer-managed flow solutions rendered as sheet children.
- **FR-007**: Example app flows MUST demonstrate interactive child controls, full-width content, and compatibility with consumer-managed in-sheet state transitions.
- **FR-008**: Existing open/close/detent callbacks and controlled/imparative behavior MUST remain deterministic after styling and hosting updates.
- **FR-009**: Feature completion MUST include automated validation for touch interactivity, width behavior, and consumer-managed flow compatibility scenarios.
- **FR-010**: Delivery scope for this feature MUST be iOS-first; Android parity for new styling/hosting behavior is explicitly deferred.
- **FR-011**: The TypeScript API MUST expose all common iPhone sheet configuration options supported by the UIKit sheet engine and currently in package scope.
- **FR-012**: Detent restriction use cases MUST remain supported and documented (for example fit-only, medium-only, or large-only by providing a single detent).
- **FR-013**: iPad/compact-height niche options (for example edge-attached width-following behavior) MUST be deferred from this feature scope.
- **FR-014**: The TypeScript API MUST expose sheet content styling controls for preferred color scheme (`system`/`light`/`dark`) and content background style (including blur material option) in iOS scope.
- **FR-015**: Styling behavior MUST be documented with explicit native limitations (for example: no custom backdrop blur/opacity controls through standard UIKit sheet APIs).
- **FR-016**: The deliverable MUST include an explicit UIKit-to-TypeScript support matrix for common iPhone sheet options, including implemented, pre-existing, and deferred options.
- **FR-017**: The deliverable MUST include an API-surface guard (contract/type/export verification) proving no package-owned navigation API is introduced.
- **FR-018**: Non-iOS fallback behavior for newly introduced styling/configuration options MUST remain safe and deterministic (no crash, no unsupported-side effects, predictable no-op behavior where applicable).

### Proposed Public API Direction

- Keep core API focused on sheet primitives and content hosting.
- Treat in-sheet navigation and multi-step flow orchestration as consumer-managed concerns.
- Preserve backward compatibility for existing consumers and avoid navigation-surface expansion.
- Keep Android behavior unchanged for this feature iteration and document parity as deferred.
- Expose common iPhone sheet options comprehensively; defer iPad/compact-height-specific options.

### Key Entities

- **Sheet Content Host**: Native content boundary that owns touch-routing and layout guarantees for mounted sheet children.
- **Sheet Child Root Contract**: Default layout rule that defines how child roots expand to sheet width.
- **Consumer Flow Host**: Any consumer-managed navigation/state layer rendered within sheet children.

### Documentation Impact

- **README Update Required**: Yes
- **Why**: Public API/user-visible behavior changes are introduced for content layout/touch/styling guarantees and explicit non-goal scope on package-owned navigation.
- **README Sections to Update**:
  - Main usage examples for interactive in-sheet child content
  - API scope/non-goals (navigation remains consumer-managed)
  - API support matrix for common iPhone options and deferred options
  - Behavior notes for child width defaults and touch handling expectations
  - Styling options (blur/content background + color-mode behavior)

## Success Criteria

### Maestro E2E Coverage (Mandatory)

- **Required Tooling**: Maestro (via Maestro MCP where available)
- **Required Flows**:
  1. `sheet-interactive-controls.yaml`
     - Open sheet, tap at least 3 in-sheet controls, verify visible state mutations after each tap.
  2. `sheet-width-contract.yaml`
     - Open sheet, assert child root is rendered edge-to-edge within sheet content area at initial detent and after detent changes.
  3. `sheet-consumer-flow-compat.yaml`
     - Open sheet with consumer-managed flow content, transition across internal states, verify sheet lifecycle and touch behavior remain correct.
- **Pass Requirement**: All listed flows pass 100% before completion.
- **Evidence Location**: `specs/004-interactive-sheet-content/maestro-evidence/`

### Measurable Outcomes

- **SC-001**: 100% of defined in-sheet button tap assertions succeed across repeated open/close cycles in automated E2E runs.
- **SC-002**: Child root width matches available sheet content width in all tested detents (no fixed-width fallback required by default).
- **SC-003**: Consumer-managed in-sheet flow transitions execute without unintended sheet dismissal in 100% of automated compatibility runs.
- **SC-004**: README/API docs are updated in the same change set and accurately describe new usage, limitations, and non-goals.
- **SC-005**: A published API support matrix clearly identifies common iPhone options exposed now and deferred iPad/compact-height options.
- **SC-006**: In automated verification on the example app, in-sheet controls become interactable within 700ms of the sheet reaching presented state in at least 95% of runs.
- **SC-007**: For non-iOS platforms, 100% of styling/configuration fallback tests pass with deterministic, non-crashing behavior.

## Implementation Planning Notes

1. Confirm and codify the native content-host touch-routing behavior as a contract, not an incidental implementation detail.
2. Define a width contract at the sheet content host boundary and mirror it in example child styles.
3. Add styling configuration for content background blur and color-mode behavior while preserving existing APIs.
4. Add/adjust unit + integration tests and author required Maestro scenarios for affected flows.
5. Update README and related docs concurrently with API/behavior changes and scope non-goals.

## Confirmed Decisions

1. Package-owned in-sheet navigation is out of scope; consumer-managed flow is the chosen direction.
2. Core scope stays as a lean UIKit sheet wrapper with strong hosting/touch/layout guarantees.
3. Scope is **iOS-first** for this feature; Android parity is deferred.
4. Styling changes are included in this same feature scope.

**Output when complete:** `<promise>DONE</promise>`
