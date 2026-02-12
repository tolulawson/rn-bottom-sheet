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
