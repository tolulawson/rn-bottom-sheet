# Spec 004 Performance Summary (SC-006)

Date: 2026-02-13

## Target

- SC-006: in-sheet controls are interactable within `700ms` of presented state in at least `95%` of runs.

## Measurement approach

- Executed a Maestro MCP stress flow with 5 consecutive open/close cycles.
- For each cycle:
  - `tapOn id: open-sheet-button`
  - `extendedWaitUntil visible id: sheet-content timeout: 700`
  - `tapOn id: route-toggle-button`
  - assert Details route text visible
  - close sheet and wait for dismissal

## Result

- Passes: 5/5 cycles
- Failures: 0/5 cycles
- Success rate: 100%

## Conclusion

- SC-006 threshold is met in this validation sample (100% >= 95%).
