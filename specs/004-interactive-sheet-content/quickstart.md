# Quickstart: Interactive Sheet Content and Core Configuration

## Prerequisites

- Dependencies installed (`yarn install`)
- iOS example app runnable
- Maestro available for E2E checks

## 1) Run baseline validation

```bash
yarn lint
yarn typecheck
yarn test
```

## 2) Verify interactive child content behavior

1. Open the example app.
2. Open the sheet.
3. Interact with in-sheet controls:
   - tap buttons
   - scroll content where applicable
   - focus/type in text input scenarios
4. Confirm callbacks and visual state updates occur from sheet content interactions.

Expected result:
- Touch and input behavior works reliably for sheet children.

## 3) Verify width contract behavior

1. Open the sheet with default content.
2. Confirm child root content fills available sheet width.
3. Change detents and confirm width remains correct without clipping.

Expected result:
- Full-width contract remains stable across detent changes.

## 4) Verify common detent restriction patterns

Use these configurations in the example to validate restrictions:

- Fit-only: `detents={['fit']}`
- Medium-only: `detents={['medium']}`
- Large-only: `detents={['large']}`

Expected result:
- User cannot move to unsupported detents when only one detent is configured.

## 5) Verify consumer-managed flow compatibility

1. Render a simple two-step internal flow in sheet children (local state or nested navigation library).
2. Move forward/back within that flow.
3. Dismiss/reopen sheet and confirm sheet lifecycle remains deterministic.

Expected result:
- Package-owned navigation is not required; consumer flow works inside hosted sheet content.

## 6) Verify styling controls

Test combinations for:

- `preferredColorScheme`: `system`, `light`, `dark`
- `contentBackgroundStyle`: `system`, `blur`, `clear`
- `contentBackgroundBlurStyle`: `regular`, `prominent`, `light`, `dark` (when style is `blur`)

Expected result:
- Content host appearance updates correctly.
- Native limitations (no configurable backdrop blur/opacity in standard UIKit sheet APIs) are documented and observed.

## 7) Execute required Maestro scenarios

```bash
maestro test example/maestro/sheet-interactive-controls.yaml
maestro test example/maestro/sheet-width-contract.yaml
maestro test example/maestro/sheet-consumer-flow-compat.yaml
```

Record outputs under:

- `specs/004-interactive-sheet-content/maestro-evidence/`

## 8) Documentation sync check

Ensure README updates include:

- API scope/non-goals (consumer-managed navigation)
- Common iPhone option support matrix
- Detent restriction patterns
- Styling controls and native limitations
