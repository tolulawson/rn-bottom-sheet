# Changelog Notes

Use this folder to capture short implementation learnings that are too granular for ADRs but valuable for future work.

Each note should include:

- Date
- Area touched
- What changed
- Why
- Follow-up risk or TODO

---

## Feature: Native iOS Sheet Bindings (001)

**Branch**: `001-native-ios-sheet-bindings`
**Started**: 2026-02-12
**Scope**: iOS-first native sheet bindings via Nitro Views with React Native children, detent support, navigation integration, and Reanimated compatibility.

### Implementation Artifacts

- Spec: `specs/001-native-ios-sheet-bindings/spec.md`
- Plan: `specs/001-native-ios-sheet-bindings/plan.md`
- Tasks: `specs/001-native-ios-sheet-bindings/tasks.md`
- ADRs: `docs/adr/ADR-0001-ios-sheet-engine.md`, `docs/adr/ADR-0002-content-hosting-model.md`, `docs/adr/ADR-0003-navigation-adapter-boundary.md`

### Key Decisions

1. Using `UISheetPresentationController` as the native iOS sheet engine
2. Single active sheet session constraint in v1
3. Non-iOS platforms get explicit fallback behavior (no crash)
4. Navigation adapter is optional and decoupled from core sheet

### Notes

*(Add implementation learnings below as work progresses)*
