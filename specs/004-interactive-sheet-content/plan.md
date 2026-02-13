# Implementation Plan: Interactive Sheet Content and Core Sheet Configuration

**Branch**: `004-interactive-sheet-content` | **Date**: 2026-02-12 | **Spec**: `/Users/tolu/Desktop/dev/rn-bottom-sheet/specs/004-interactive-sheet-content/spec.md`
**Input**: Feature specification from `/specs/004-interactive-sheet-content/spec.md`

## Summary

Strengthen the native content-host contract so sheet children are fully interactive and layout to full sheet width, while keeping navigation consumer-managed. Expand the TypeScript API to cover common iPhone UIKit sheet options and add in-scope styling controls (preferred color scheme + content background blur/clear/system), with explicit documentation for native limitations and deferred iPad/compact-height options.

## Technical Context

**Language/Version**: TypeScript 5.9, Swift 5
**Primary Dependencies**: React Native 0.81.5, react-native-nitro-modules 0.33.x, UIKit `UISheetPresentationController`
**Storage**: N/A (runtime UI state only)
**Testing**: Jest/React Native Testing Library for TS contracts and integration, Maestro for end-to-end flows
**Target Platform**: iOS-first behavior with safe non-iOS fallback
**Project Type**: Mobile library + example app
**Performance Goals**: In-sheet controls become interactable within 700ms of presented state in at least 95% of automated runs; no regressions in open/detent/touch handling
**Constraints**: Minimal-scope change set; preserve deterministic callback contracts; no package-owned navigation stack features; iPad/compact-height niche options deferred; verify non-iOS fallback remains deterministic and non-crashing for newly added styling/configuration props
**Scale/Scope**: Library-level API surface changes in `src/` + native iOS host changes in `ios/` + example and docs updates
**Maestro E2E Strategy**: Add/maintain required flows under `example/maestro/`; gate completion on all affected flows passing and record evidence under `specs/004-interactive-sheet-content/maestro-evidence/`
**README Impact**: Required; update API reference, support matrix, styling section, and explicit non-goals

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Native Fidelity: Design preserves native iOS sheet behavior as first-order requirement.
- [x] Verification Path: Test/build/validation approach is explicit for each major capability.
- [x] Scope Discipline: Out-of-scope items are explicitly deferred with no hidden expansion.
- [x] Knowledge Base Sync: Required `docs/` updates and ADR impact are identified.
- [x] Deterministic Contracts: Public API behavior and unsupported cases are explicit and testable.
- [x] Maestro E2E Discipline: Plan defines comprehensive Maestro scenarios and makes them completion-blocking.
- [x] README Sync Discipline: Public API or user-visible behavior changes include required README updates.

## Project Structure

### Documentation (this feature)

```text
specs/004-interactive-sheet-content/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sheet-config-surface.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── RnBottomSheet.nitro.ts
├── types/bottom-sheet.ts
├── components/
│   ├── BottomSheet.tsx
│   └── bottom-sheet-utils.ts
└── __tests__/
    ├── bottom-sheet.contract.test.ts
    ├── bottom-sheet.detents.test.ts
    └── bottom-sheet.presenter.integration.test.tsx

ios/
└── RnBottomSheet.swift

example/
├── src/
│   ├── App.tsx
│   ├── components/InSheetControls.tsx
│   └── __tests__/
└── maestro/
```

**Structure Decision**: Keep the existing library + native host + example layout; implement all feature work in-place without introducing new packages or runtime layers.

## Phase 0: Research Plan

1. Confirm branch/tooling alignment strategy so implementation scripts and artifacts target `004-interactive-sheet-content`.
1. Confirm UIKit-native capability boundaries (common options vs deferred iPad/compact-height options).
2. Confirm native limitations for styling (content blur available, backdrop blur not publicly configurable).
3. Confirm existing API coverage and identify missing common iPhone option mappings.
4. Confirm compatibility expectations for consumer-managed navigation/state inside sheet content.
5. Define verification approach for API surface guard (no package-owned navigation API expansion).

## Phase 1: Design Plan

1. Define and document the feature entities/config contracts in `data-model.md`.
2. Define a contract artifact for the TypeScript/native config surface in `contracts/sheet-config-surface.yaml` including implemented/pre-existing/deferred option matrix.
3. Draft `quickstart.md` with consumer-facing setup/verification steps for:
   - touch interactivity
   - width behavior
   - detent restriction patterns
   - styling options
   - non-iOS fallback expectations.
4. Add plan-level verification notes for performance threshold and fallback validation in feature evidence artifacts.
5. Update agent context using `.specify/scripts/bash/update-agent-context.sh codex`.

## Post-Design Constitution Check

- [x] Native Fidelity maintained (no JS-only replacement of native sheet semantics).
- [x] Verification approach remains comprehensive (unit/integration + Maestro).
- [x] Scope remains minimal and explicit (navigation in package is non-goal).
- [x] README/docs obligations are tracked for same-change-set completion.
- [x] API contracts remain deterministic and bounded to supported/native behavior.

## Complexity Tracking

No constitution violations requiring justification.
