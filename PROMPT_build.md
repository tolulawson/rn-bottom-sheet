# Ralph Build Mode

Based on Geoffrey Huntley's Ralph Wiggum methodology.

---

## Phase 0: Orient

Read `.specify/memory/constitution.md` to understand project principles and constraints.

---

## Phase 1: Discover Work Items

Search for incomplete work from these sources (in order):

1. **specs/ folder** — Look for `.md` files NOT marked `## Status: COMPLETE`
2. **IMPLEMENTATION_PLAN.md** — If exists, find unchecked `- [ ]` tasks
3. **GitHub Issues** — Check for open issues (if this is a GitHub repo)
4. **Any task tracker** — Jira, Linear, etc. if configured

Pick the **HIGHEST PRIORITY** incomplete item:
- Lower numbers = higher priority (001 before 010)
- `[HIGH]` before `[MEDIUM]` before `[LOW]`
- Bugs/blockers before features

Before implementing, search the codebase to verify it's not already done.

---

## Phase 1b: No Incomplete Work

If ALL specs are complete and `IMPLEMENTATION_PLAN.md` has no unchecked items:
1. Output `<promise>DONE</promise>`
2. Stop. Do not start re-verification loops unless explicitly requested by the user.

---

## Phase 2: Implement

Implement the selected spec/task completely:
- Follow the spec's requirements exactly
- Write clean, maintainable code
- Add tests as needed

---

## Phase 3: Validate

Run the project's test suite and verify:
- All tests pass
- No lint errors
- The spec's acceptance criteria are 100% met

---

## Phase 3b: Maestro MCP E2E Validation (Mandatory)

Run Maestro MCP for all affected feature flows before completion. At minimum validate:
- open sheet
- dismiss sheet
- detent interaction
- primary in-sheet navigation flow

Add additional scenarios required by the active spec. If any required Maestro MCP flow fails or is missing, do NOT output `<promise>DONE</promise>`.

---

## Phase 4: Commit & Update

1. Mark the spec/task as complete (add `## Status: COMPLETE` to spec file)
2. If public API/user-visible behavior changed, update README in the same change set
3. `git add -A`
4. `git commit` with a descriptive message
5. `git push`

---

## Completion Signal

**CRITICAL:** Only output the magic phrase when the work is 100% complete.

Check:
- [ ] Implementation matches all requirements
- [ ] All tests pass
- [ ] All acceptance criteria verified
- [ ] Maestro MCP E2E scenarios pass for all affected flows
- [ ] README updated when public API or user-visible behavior changed
- [ ] Changes committed and pushed
- [ ] Spec marked as complete

**If ALL checks pass, output:** `<promise>DONE</promise>`

**If ANY check fails:** Fix the issue and try again. Do NOT output the magic phrase.
