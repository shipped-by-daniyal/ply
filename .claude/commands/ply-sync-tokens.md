---
description: Detect and resolve drift between the Figma token library and packages/tokens — fresh export, DTCG diff, categorized report, gated pull/push per category. Run at the start of any token-touching session.
allowed-tools:
  - mcp__claude_ai_Figma__use_figma
  - Read
  - Write
  - Bash
  - Skill
---

# /ply-sync-tokens

Figma and the repo drift without webhooks (Professional plan). This command makes drift visible and resolution deliberate.

## Sync policy (ADR-0005)

- Token **values** (aliases/modes): **Figma wins** — repo pulls.
- **Usage documentation** (doc-table narrative): **the table wins** — repo pulls.
- **Descriptions**: table ↔ variable rules live in `/ply-doc-table`; the repo pulls whatever Figma+table agree on.
- Repo-side edits to `src/*.tokens.json` are NOT a sync source — the repo is downstream. To change a token, change Figma (or run the documented exception: a `push` that writes values to Figma via plugin API, preview-then-apply).

## Steps

1. Run the export steps of `/ply-export-tokens` into a scratch directory (NOT `packages/tokens/src`).
2. Extract the old side: `git show HEAD:packages/tokens/src/<file>` for each of the three token files into another scratch dir.
3. Compose fresh DTCG from the new snapshot (`build-dtcg.mjs` with output redirected to scratch), then:
   `node scripts/diff-tokens.mjs <oldDir> <newDir>`
4. Write the categorized drift report to `audits/ply-sync-<YYYY-MM-DD-HHMM>.md` (added / removed / renamed / value / description changes, with per-mode details).
5. Gate per category: for each non-empty category ask **pull** (accept Figma → repo), or **skip** (leave for later; drift stays visible). If the user explicitly wants repo→Figma (`push`), treat it as the exception: preview every setter, apply only after confirmation.
6. On any pull: copy the fresh DTCG into `packages/tokens/src/`, run `pnpm --filter @ply/tokens build` (lint gates), show `git diff --stat`.
7. Never commit. Suggest `/ply-update-docs` when changes were pulled.
