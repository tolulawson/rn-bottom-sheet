# Native iOS Sheet Library Plan (v1)

## Summary

Build an iOS-first React Native library that presents native iOS sheets using `UISheetPresentationController` via Nitro Views, supports arbitrary React Native children in sheet content, provides optional React Navigation adapters, defines a constrained Reanimated interop contract, and maintains a living in-repo knowledge base.

## Scope

1. Ship v1 for iOS 16+ on RN 0.81+ with New Architecture/Fabric.
2. Expose controlled + imperative API surface.
3. Support semantic and numeric detents with runtime changes.
4. Support arbitrary React Native child content in the sheet.
5. Support single active sheet globally in v1.
6. Provide optional React Navigation integration package.
7. Provide curated documentation and architecture records in `docs/`.
8. Enforce verification with unit, iOS integration, and Maestro happy-path E2E.

## Non-Goals

1. Android native parity in v1.
2. Multi-sheet stacking behavior.
3. Full Reanimated parity across all native sheet internals.
4. Full third-party documentation mirroring.

## API Design

### Public Props

- `isOpen?: boolean`
- `defaultOpen?: boolean`
- `onOpenChange?: (open: boolean, reason: BottomSheetChangeReason) => void`
- `detents?: BottomSheetDetent[]`
- `initialDetent?: number | 'last'`
- `selectedDetent?: number`
- `onDetentChange?: (index: number) => void`
- `grabberVisible?: boolean`
- `allowSwipeToDismiss?: boolean`
- `expandsWhenScrolledToEdge?: boolean`
- `cornerRadius?: number`
- `backgroundInteraction?: 'modal' | { enabledUpThroughDetent: number | 'last' }`
- `largestUndimmedDetent?: 'none' | 'last' | number`
- `onWillPresent?: () => void`
- `onDidPresent?: () => void`
- `onWillDismiss?: () => void`
- `onDidDismiss?: () => void`
- `children?: React.ReactNode`

### Public Methods

- `present(): Promise<void>`
- `dismiss(reason?: BottomSheetChangeReason): Promise<void>`
- `snapToDetent(index: number, animated?: boolean): Promise<void>`
- `getCurrentDetentIndex(): number`

### Type Model

- `BottomSheetDetent = 'fit' | 'medium' | 'large' | { type: 'fraction'; value: number; id?: string } | { type: 'points'; value: number; id?: string }`
- `BottomSheetChangeReason = 'programmatic' | 'swipe' | 'backdrop' | 'system'`

## Architecture

1. Native engine: `UISheetPresentationController`.
2. Nitro host view is the integration boundary between JS and native presenter.
3. RN children mounted into native-hosted container inside sheet view hierarchy.
4. Detents normalized and validated in JS and native layers.
5. Single active sheet enforced by manager-level ownership.
6. Controlled and imperative flows reconciled through explicit state machine rules.

## Integration

### React Navigation

- Keep core package navigation-agnostic.
- Provide optional adapter utilities in `rn-bottom-sheet/navigation`.
- Support nested navigators rendered inside sheet content.

### Reanimated

- Support `createAnimatedComponent` wrapping the host component.
- Support documented animated prop pathways for selected fields.
- Explicitly document unsupported full-transition control expectations.

## Platform Behavior

- iOS: full supported behavior.
- Android/Web: safe fallback + explicit warning; no crash.

## Knowledge Base Rules

1. All external references are pinned in `docs/sources.yaml` with retrieval date.
2. Local docs are curated summaries and API tables.
3. Major architecture/API decisions require ADR updates.
4. Use scripts to keep index and integrity checks current.

## Milestones

1. Knowledge base and process scaffolding.
2. Nitro API and TypeScript wrapper contract.
3. iOS presenter engine and event bridge.
4. RN children hosting and detent behavior.
5. Navigation adapter and examples.
6. Reanimated interop and fallback behavior.
7. Test matrix and CI updates.

## Verification

- `yarn lint`
- `yarn typecheck`
- `yarn test --coverage`
- iOS example build
- Maestro happy-path scenarios
- `yarn docs:check`

## Verification Runbook

Use this sequence for each implementation slice before changing task state:

1. Scope check:
   - Confirm the target task is still incomplete in
     `specs/001-native-ios-sheet-bindings/tasks.md`.
   - Verify the intended behavior is not already implemented.
2. Implementation + unit/integration coverage:
   - Add/adjust tests for behavior touched by the change.
   - Keep non-goals explicit when behavior is intentionally unsupported.
3. Baseline command gate:
   - `yarn lint`
   - `yarn typecheck`
   - `yarn test`
4. Documentation gate:
   - Update `README.md`/ADRs/runbooks when public behavior changes.
5. Tracking gate:
   - Mark completed task checkboxes in spec/tasks docs.
   - Capture outcomes in `tasks/todo.md` Review findings.

## Feature Runbook Notes

### Public Surface Verification

- Validate `BottomSheet` controlled and imperative flows after any prop/method
  changes.
- Validate detent normalization/validation behavior for both semantic and custom
  detents.
- Validate callback reason mapping remains deterministic (`programmatic`,
  `swipe`, `backdrop`, `system`).

### Integration Verification

- Validate navigation adapter behavior (`useBottomSheetNavigation` and
  `createBottomSheetNavigationAdapter`) for route-driven open/close sync.
- Validate animated wrapper compatibility for exported wrapper/native host
  surfaces using `createAnimatedComponent` contract tests.
- Validate non-iOS fallback remains no-crash and warning-based in development.

### Maestro MCP Invocation Expectations

- Source flow file: `example/.maestro/sheet-core-flows.yaml`
- Core flow assertions:
  - sheet opens from the example UI
  - detent interaction works (`Snap to Large`)
  - in-sheet navigation flow works (`Go to Details` -> `Back to Summary`)
  - sheet dismisses cleanly
- Gate behavior:
  - Maestro MCP execution is mandatory for affected feature flows.
  - Feature completion is blocked until required Maestro scenarios pass.
- Failure handling:
  - on Maestro failure in `required` mode, capture failing step context and keep
    the loop open until fixed and re-verified

## Acceptance Criteria

1. Consumers can present native-feeling iOS sheets with RN children.
2. API supports controlled and imperative models without ambiguity.
3. Detents are validated and predictable.
4. Documentation in repo is sufficient to implement and maintain the system.
5. The knowledge base is script-checkable and evolvable.
