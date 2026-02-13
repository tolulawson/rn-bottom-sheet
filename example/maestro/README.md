# Spec 002 Maestro Flows

This directory contains required Maestro acceptance flows for `specs/002-fix-example-sheet`.

## Required flows

- `sheet-single-open.yaml`: verifies duplicate-open prevention and clean reopen cycle.
- `sheet-internal-controls.yaml`: verifies in-sheet detent/toggle controls and route transitions.
- `sheet-theme-toggle.yaml`: verifies global theme switching while sheet interactions remain functional.

Run all flows:

```bash
maestro test example/maestro
```
