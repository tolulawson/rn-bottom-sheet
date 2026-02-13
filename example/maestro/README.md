# Maestro Flows

## Spec 004 Required Flows

- `sheet-interactive-controls.yaml`: validates open sheet + in-sheet interactive controls.
- `sheet-width-contract.yaml`: validates width-contract behavior proxy across detent transitions.
- `sheet-consumer-flow-compat.yaml`: validates consumer-managed route flow compatibility.

## Legacy Flows (Spec 002/003)

- `sheet-single-open.yaml`
- `sheet-internal-controls.yaml`
- `sheet-theme-toggle.yaml`
- `sheet-open-content-visible.yaml`
- `sheet-reopen-cycle.yaml`
- `sheet-interactive-children.yaml`

Run all flows:

```bash
maestro test example/maestro
```
