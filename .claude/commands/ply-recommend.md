---
description: Check a proposal against the knowledge base and current best practice via the design-advisor agent; saves the resulting dossier to kb/comparisons/. Usage — /ply-recommend <the proposal or question>
allowed-tools:
  - Agent
  - Read
  - Write
  - Glob
  - Bash
---

# /ply-recommend

Evaluate this proposal: **$ARGUMENTS**

## Steps

1. If the proposal is vague (no concrete alternative can be imagined from it), ask the user to sharpen it first — one targeted question, then proceed.
2. Launch the **design-advisor** agent with the proposal verbatim plus any conversation context that constrains it (phase, prior ADRs touching the same area — check `apps/docs/src/content/docs/decisions/`).
3. Save the advisor's full output to `kb/comparisons/YYYY-MM-DD-<slug>.md` with frontmatter (`title`, `updated`), prepending a one-paragraph statement of the original proposal and who asked.
4. Relay the verdict + recommendation to the user in a few sentences (not the whole dossier — link the file).
5. If the user accepts a recommendation that changes or sets direction, prompt: "this should be an ADR — run `/ply-adr <title>`?" Do not create the ADR unprompted.
6. Do NOT commit — the user reviews and commits.
