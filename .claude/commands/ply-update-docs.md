---
description: Update the Ply docs site from everything that changed since the last docs sync — regenerate generated sections, append a changelog entry, flag handwritten pages needing review. Never commits.
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Agent
---

# /ply-update-docs

Bring `apps/docs` up to date with the repo. Run at the end of every phase/work session. **Never commit** — the user reviews `git diff` and commits.

## Critical rules

1. **Respect the banners.** Only rewrite content between `GENERATED:BEGIN <name>` / `GENERATED:END <name>` markers, the `changelog.mdx` entries (insert-only), and component-page frontmatter status fields. Never touch handwritten prose — flag it instead (step 6).
2. **Idempotent.** Running twice with no repo changes in between must produce zero diff and report "already in sync".
3. **Newest changelog entry on top**, inserted after the intro paragraph, before the previous newest `## ` heading. Never edit or delete existing entries.

## Steps

### 1 — Collect deltas
Read `.ds/docs-state.json` → `lastSyncedSha`. Then:

```bash
git log --oneline <lastSyncedSha>..HEAD
git diff --name-only <lastSyncedSha>..HEAD
```

If both are empty **and** the working tree has no changes beyond docs state: report "docs already in sync since <sha>" and stop.

Bucket changed paths: `packages/tokens/**` (tokens) · `packages/react/src/**` (components) · `apps/docs/src/content/docs/decisions/**` (decisions) · `audits/**` (audits) · `kb/**` (knowledge base) · `.claude/**` + `scripts/**` (automation) · everything else (infra).

### 2 — Token delta (only if any `packages/tokens/src/*.tokens.json` changed)
Run `node scripts/diff-tokens.mjs <oldDir> packages/tokens/src` — build `<oldDir>` in the scratchpad via `git show <lastSyncedSha>:packages/tokens/src/<file>` for each of the seven token files (primitives, brand.brand-1/2, font.geist, font.die-grotesk-a, semantic.light/dark; missing-at-old-SHA files are simply skipped by the script).

### 3 — Regenerate generated sections
```bash
node scripts/gen-map.mjs
```
(Regenerates the map inventory + ADR index. Additional generators join this list in later phases: `gen-token-docs.mjs` in Phase 4.)

### 4 — Changelog entry
Launch the **docs-writer** agent with: the bucketed delta summary from step 1, the token diff from step 2 (if any), and today's date. It appends one `## YYYY-MM-DD — <headline>` section to `apps/docs/src/content/docs/changelog.mdx` per rule 3. Keep entries short: 3–6 bullets, human-readable, linking to new ADRs/pages.

### 5 — Component frontmatter (Phase 5+)
For component docs pages whose implementation state changed (designed/built/mapped/documented), update the `componentStatus` frontmatter field only. Never touch the page body.

### 6 — Flag handwritten pages
Print a checklist (not edits!) of handwritten pages likely needing human review, based on the buckets — e.g. a component's usage prose when its props changed, `map.mdx` handwritten sections when the pipeline itself changed.

### 7 — Verify + persist state
```bash
pnpm --filter docs build
```
Must pass. Then write `.ds/docs-state.json`:
```json
{ "lastSyncedSha": "<current HEAD sha>", "tokensHash": "<sha256 over the concatenated src/*.tokens.json, or null>", "lastRun": "<ISO date>" }
```
Print a summary of what changed and remind the user to review `git diff` and commit.
