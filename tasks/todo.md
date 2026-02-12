# Implementation Todo

## Phase 0: Project Memory Bootstrap

- [x] Create `docs/` knowledge base structure
- [x] Add decision-complete implementation plan
- [x] Add reference summaries and source index
- [x] Add ADRs for primary architecture decisions
- [x] Add sync/check scripts for docs integrity

## Phase 1: API and Nitro Contract

- [ ] Finalize public TypeScript API and Nitro view contract
- [ ] Regenerate Nitrogen artifacts
- [ ] Validate typings and exports

## Phase 2: iOS Sheet Engine

- [ ] Implement presenter/controller architecture
- [ ] Map detent model and lifecycle events
- [ ] Implement dismissal reason mapping

## Phase 3: Content Hosting

- [ ] Implement arbitrary RN child hosting in presented sheet
- [ ] Add robust attach/detach/recycle cleanup

## Phase 4: Integrations

- [ ] Add optional React Navigation adapter utilities
- [ ] Add Reanimated compatibility surface and docs
- [ ] Add platform fallback behavior for non-iOS

## Phase 5: Verification and Release Readiness

- [ ] Add unit tests for API normalization and behavior
- [ ] Add iOS integration tests for presenter/detents/lifecycle
- [ ] Add Maestro happy-path E2E flows in example app
- [ ] Update CI gates as needed

## Verification Checklist

- [x] `yarn docs:check`
- [ ] `yarn lint`
- [ ] `yarn typecheck`
- [ ] `yarn test`

## Ralph Setup

- [x] Create Ralph scaffolding directories (`.specify`, `specs`, `logs`, `history`, command folders)
- [x] Install Ralph loop scripts for Claude and Codex
- [x] Install optional RLM/helper scripts and `scripts/lib` utilities
- [x] Create project constitution at `.specify/memory/constitution.md`
- [x] Create `AGENTS.md`, `CLAUDE.md`, `PROMPT_build.md`, and `PROMPT_plan.md`
- [x] Verify scripts execute with `--help`

## Review

- Date:
- Reviewer:
- Findings:
- Residual Risks:
- Follow-ups:
