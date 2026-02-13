# Quickstart: Example Sheet Stability and Testability

## 1. Prerequisites

1. Install dependencies at repo root: `yarn install`.
2. Ensure iOS tooling/simulator is available for the example app.
3. Ensure Maestro CLI (and Maestro MCP when used) is available in your environment.

## 2. Run Fast Local Validation (Jest)

1. Run library tests: `yarn test`.
2. Run example integration test file if split execution is needed:
   `yarn test example/src/__tests__/sheet-open-dismiss.integration.test.tsx`.
3. Confirm no regressions in open/close, detent, route, and toggle behavior logs/assertions.

## 3. Run Example App

1. Start example app on iOS:
   `yarn workspace rn-bottom-sheet-example ios`
2. Verify manually:
   - `Open Sheet` presents exactly one sheet.
   - In-sheet controls are accessible while the sheet is visible.
   - Route summary on parent screen tracks in-sheet route transitions.
   - Light/Dark toggle updates both parent and in-sheet surfaces.

## 4. Run Maestro E2E Acceptance Flows

Run all feature-required flows:

1. `maestro test example/maestro/sheet-single-open.yaml`
2. `maestro test example/maestro/sheet-internal-controls.yaml`
3. `maestro test example/maestro/sheet-theme-toggle.yaml`

Or run as a folder suite once available:

- `maestro test example/maestro`

## 5. Completion Evidence

1. Record Jest and Maestro run outcomes in `tasks/todo.md` review section.
2. Confirm all required Maestro flows pass before marking feature complete.
3. If implementation unexpectedly changes public API/user-facing library behavior, update `README.md` in the same change set.
