---
description: Create a feature specification
---

Create a specification for:

$ARGUMENTS

## Steps

1. Generate short name (2-4 words, kebab-case)
2. Find next spec number from `specs/`
3. Create `specs/NNN-short-name.md`
4. Include clear acceptance criteria
5. Include comprehensive Maestro E2E acceptance criteria for affected flows
6. Include explicit README update requirements when public API/user-visible behavior changes
7. Add completion signal:
   ```
   **Output when complete:** `<promise>DONE</promise>`
   ```
