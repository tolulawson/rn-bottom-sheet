# Lessons

## Template

- Date:
- Trigger:
- Mistake Pattern:
- Prevention Rule:
- Action Taken:

## Entries

- Date: 2026-02-12
- Trigger: User clarified "tax" meant "tasks" and requested direct execution.
- Mistake Pattern: Treating ambiguous phrasing as a blocking clarification point instead of acting on clear intent.
- Prevention Rule: When user intent is operationally clear, execute directly and interpret minor wording ambiguity in context.
- Action Taken: Added docs/tasks scaffolding and committed plan artifacts without further gating.

- Date: 2026-02-12
- Trigger: User redirected scope from Bun migration to fixing a specific CI workflow failure.
- Mistake Pattern: Continuing broad migration exploration after the user has narrowed scope to a concrete blocker.
- Prevention Rule: On explicit scope correction, immediately stop unrelated work and prioritize the stated blocker end-to-end.
- Action Taken: Stopped migration path and patched GitHub setup/CI caching to handle missing `yarn.lock` safely.

- Date: 2026-02-12
- Trigger: User requested constitution amendment for README synchronization on public API/user-visible behavior changes.
- Mistake Pattern: Updating the constitution text without fully propagating enforcement to generated loop prompts and runtime wrappers.
- Prevention Rule: For every governance amendment, run a propagation checklist across constitution, templates, runtime prompts, loop scripts, and README policy before reporting completion.
- Action Taken: Added README-sync gating across templates/prompts/scripts and documented contributor-level README update policy.

- Date: 2026-02-12
- Trigger: Prerequisite scripts reported duplicate `001-*` spec directories and ambiguous feature resolution.
- Mistake Pattern: Creating a second feature under an already-used numeric prefix, causing prefix-based directory lookup collisions.
- Prevention Rule: Always allocate a unique three-digit prefix per feature and keep branch name + spec directory prefix aligned before running spec/plan/tasks scripts.
- Action Taken: Renamed feature branch/spec from `001-fix-example-sheet` to `002-fix-example-sheet` and updated all references.
