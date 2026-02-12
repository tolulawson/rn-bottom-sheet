<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- Native Fidelity First -> I. Native Fidelity First
- Verification Before Completion -> II. Verification Before Completion
- Simplicity -> III. Minimal, Intentional Scope
Added principles:
- IV. Living Knowledge Base
- V. Deterministic Integration Contracts
Added sections:
- Operational Constraints
- Workflow & Quality Gates
Removed sections:
- Ralph-specific loop mechanics as governing principle source
Templates/runtime sync status:
- ✅ .specify/templates/plan-template.md (Constitution Check gates aligned)
- ✅ .specify/templates/spec-template.md (reviewed, no change required)
- ✅ .specify/templates/tasks-template.md (reviewed, no change required)
- ✅ AGENTS.md (already points to constitution)
- ✅ CLAUDE.md (already points to constitution)
- ✅ .claude/commands/speckit.specify.md (reviewed, no change required)
- ✅ .cursor/commands/speckit.specify.md (reviewed, no change required)
- ✅ .codex/skills/speckit-*/SKILL.md (reviewed, no change required)
Deferred follow-ups:
- None
-->

# rn-bottom-sheet Constitution

## Core Principles

### I. Native Fidelity First
All core user-facing behavior MUST prioritize platform-native iOS sheet interaction quality. Any
API or implementation decision that degrades native sheet semantics MUST be rejected unless it is
explicitly documented as a temporary limitation with an exit plan.

### II. Verification Before Completion
No task, story, or release artifact MAY be marked complete without objective verification.
Verification MUST include reproducible checks (tests, build checks, or explicit runtime validation)
that demonstrate the intended behavior.

### III. Minimal, Intentional Scope
Changes MUST solve the stated feature goal with minimal surface area and clear boundaries.
Features outside accepted scope MUST be deferred and documented, not silently introduced.

### IV. Living Knowledge Base
Architecture decisions, external references, and implementation learnings MUST be persisted in-repo
under `docs/` and kept synchronized with delivered behavior. Decision records MUST be updated when
public API or architectural constraints materially change.

### V. Deterministic Integration Contracts
Public interfaces for sheet state, detents, navigation integration, and animation compatibility MUST
be explicit, deterministic, and testable. Unsupported behavior MUST be documented as explicit
non-goals rather than implied capability.

## Operational Constraints

- Target platform for v1 is iOS-first behavior with explicit, safe fallback behavior on non-iOS.
- New Architecture/Fabric-compatible integration paths MUST be preserved.
- Public API changes MUST include migration notes or compatibility rationale.
- One active sheet session at a time is the default product constraint unless superseded by a
  ratified amendment.

## Workflow & Quality Gates

1. Specification artifacts (`spec.md`, `plan.md`, `tasks.md`) MUST be produced for non-trivial work.
2. Clarifications SHOULD be resolved before planning unless explicitly waived.
3. Cross-artifact consistency analysis SHOULD run before implementation starts.
4. All code changes MUST pass applicable lint/type/test/build checks before merge.
5. Documentation and task tracking MUST be updated with behavior changes in the same change set.

## Governance

- This constitution supersedes ad-hoc local workflow preferences when conflicts occur.
- Amendments require:
  1. A documented rationale,
  2. Updated version using semantic versioning,
  3. A sync impact review across templates and runtime guidance files.
- Versioning policy:
  - MAJOR: incompatible governance changes or principle removal/redefinition
  - MINOR: new principle/section or materially expanded guidance
  - PATCH: clarifications or wording-only improvements
- Compliance reviews MUST confirm constitution alignment during planning and prior to merge.

**Version**: 1.1.0 | **Ratified**: 2026-02-12 | **Last Amended**: 2026-02-12
