<!--
Sync Impact Report
Version change: 2.0.0 -> 2.1.0
Modified principles:
- IV. Living Knowledge Base -> IV. Living Knowledge Base (README synchronization now mandatory for API/user-visible behavior changes)
- V. Deterministic Integration Contracts -> V. Deterministic Integration Contracts (public-surface changes require README updates)
Added sections:
- Documentation Synchronization Rules
Removed sections:
- None
Templates/runtime sync status:
- ✅ .specify/templates/spec-template.md (Maestro E2E coverage now mandatory)
- ✅ .specify/templates/plan-template.md (Maestro E2E strategy + gate checks)
- ✅ .specify/templates/tasks-template.md (test tasks mandatory; Maestro + README tasks required)
- ✅ PROMPT_build.md (completion now requires Maestro MCP pass for affected flows)
- ✅ PROMPT_plan.md (planning requires Maestro E2E tasks)
- ✅ scripts/ralph-loop.sh (generated prompt policy aligned)
- ✅ scripts/ralph-loop-codex.sh (generated prompt policy aligned)
- ✅ .codex/prompts/speckit.specify.md (spec generation includes mandatory Maestro E2E coverage)
- ✅ .codex/prompts/speckit.tasks.md (task generation enforces required tests + Maestro + README updates)
- ✅ .codex/prompts/speckit.plan.md (planning requires README impact handling)
- ✅ .claude/commands/speckit.specify.md (quick command includes Maestro acceptance criteria)
- ✅ .cursor/commands/speckit.specify.md (quick command includes Maestro acceptance criteria)
- ✅ README.md (documents README update policy for contributors)
- ℹ️ .gemini/commands/speckit.*.toml (not present in repository)
- ℹ️ .github/prompts/speckit.*.prompt.md (not present in repository)
- ℹ️ .github/agents/speckit.*.agent.md (not present in repository)
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
No task, story, feature, or release artifact MAY be marked complete without objective verification.
Verification MUST include reproducible automated tests and explicit runtime validation. For every
feature addition or update, verification MUST include comprehensive Maestro end-to-end coverage
for affected user flows before completion is declared.

### III. Minimal, Intentional Scope
Changes MUST solve the stated feature goal with minimal surface area and clear boundaries.
Features outside accepted scope MUST be deferred and documented, not silently introduced.
Required verification obligations (including Maestro E2E coverage) are in scope by default and
MUST NOT be omitted as scope reduction.

### IV. Living Knowledge Base
Architecture decisions, external references, and implementation learnings MUST be persisted in-repo
under `docs/` and kept synchronized with delivered behavior. Decision records MUST be updated when
public API or architectural constraints materially change. Any change to public API surface area or
externally observable library behavior MUST include corresponding README updates in the same change
set.

### V. Deterministic Integration Contracts
Public interfaces for sheet state, detents, navigation integration, and animation compatibility MUST
be explicit, deterministic, and testable. Unsupported behavior MUST be documented as explicit
non-goals rather than implied capability. If public interfaces or externally observable behavior
change, README contract documentation MUST be updated.

### VI. Comprehensive Maestro End-to-End Assurance
Every implemented or updated feature MUST include comprehensive Maestro end-to-end test scenarios
covering primary and critical alternate paths. A feature cannot be marked complete until applicable
Maestro scenarios pass and results are recorded in project tracking artifacts.

## Operational Constraints

- Target platform for v1 is iOS-first behavior with explicit, safe fallback behavior on non-iOS.
- New Architecture/Fabric-compatible integration paths MUST be preserved.
- Public API changes MUST include migration notes or compatibility rationale.
- One active sheet session at a time is the default product constraint unless superseded by a
  ratified amendment.

## Maestro E2E Compliance Rules

- Each feature spec MUST define Maestro E2E expectations for affected flows.
- Each implementation plan MUST define where Maestro scenarios live, how they run, and pass criteria.
- Each tasks list MUST include explicit Maestro authoring and execution tasks.
- Completion status (`DONE`, `COMPLETE`, merge-ready, release-ready) MUST be blocked on failing or
  missing required Maestro scenarios for the changed feature.
- Maestro evidence MUST be recorded in feature/task review notes.

## Documentation Synchronization Rules

- README updates are REQUIRED when public API signatures, exported symbols, behavior contracts,
  supported integrations, platform behavior, or user-visible usage expectations change.
- README updates MUST be part of the same branch/PR that introduces those changes.
- Plans and task lists MUST explicitly track README update tasks when this rule is triggered.
- Completion status MUST be blocked when required README updates are missing.

## Workflow & Quality Gates

1. Specification artifacts (`spec.md`, `plan.md`, `tasks.md`) MUST be produced for non-trivial work.
2. Clarifications SHOULD be resolved before planning unless explicitly waived.
3. Cross-artifact consistency analysis SHOULD run before implementation starts.
4. All code changes MUST pass applicable lint/type/unit/integration checks and required Maestro E2E
   scenarios before completion.
5. Documentation and task tracking MUST be updated with behavior changes in the same change set.
6. Required README updates for API/user-visible behavior changes MUST be completed before merge.

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

**Version**: 2.1.0 | **Ratified**: 2026-02-12 | **Last Amended**: 2026-02-12
