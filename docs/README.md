# Project Knowledge Base

This folder is the canonical project memory for `rn-bottom-sheet`.

## Goals

- Keep implementation knowledge local to the repository.
- Make architectural decisions traceable.
- Keep external references version-pinned and easy to refresh.

## Structure

- `implementation-plan-v1.md`: decision-complete delivery plan.
- `knowledge-index.md`: high-level index of all references and local docs.
- `sources.yaml`: machine-readable source registry (URL, pin, retrieval date, local path).
- `references/`: curated technical summaries used to implement features.
- `adr/`: architecture decision records.
- `changelog-notes/`: incremental learnings during implementation.

## Maintenance Workflow

1. Add or update entries in `sources.yaml`.
2. Update or add files in `references/` and `adr/`.
3. Run `yarn docs:sync` to regenerate index artifacts.
4. Run `yarn docs:check` to validate consistency.
5. Include knowledge updates in the same PR as behavior changes.

## Core Links

- Plan: `docs/implementation-plan-v1.md`
- Index: `docs/knowledge-index.md`
- Tasks: `tasks/todo.md`
- Lessons: `tasks/lessons.md`
