---
description: Export the Ply token library from Figma to DTCG files in packages/tokens/src (values, aliases, descriptions, variable IDs, doc-table usage text). Read-only on Figma. Rebuilds CSS/TS and runs the contrast lint.
allowed-tools:
  - mcp__claude_ai_Figma__use_figma
  - Read
  - Write
  - Bash
  - Skill
---

# /ply-export-tokens

Pull the current state of the Ply Figma library (`3QugaiUHLUqTyqHhwCibOR`) and rebuild the token package. Idempotent and read-only on Figma.

## Critical rules

1. Load the `figma-use` skill before any `use_figma` call. Chunk ~55 variables per call (20KB cap). Resolve aliases to primitive **names**, never IDs.
2. **Capture variable IDs** for every semantic token — `diff-tokens.mjs` rename detection depends on them.
3. **Read usage text from the Token Usage table** (rows keyed by `sharedPluginData('ply','variableId')`, cells: where/how/do/don't, chunk ~40 rows/call) — the table is the source of truth for usage docs (ADR-0005). Template-dedupe if responses run large.
4. Never write to Figma. Value/description drift found here is `/ply-sync-tokens`' job.

## Steps

1. Chunked export via `use_figma`: (a) color primitives name→hex; (b) all scale collections name→value; (c) semantic in 3 batches: name, light alias, dark alias, description; (d) semantic name→variableId map; (e) doc-table usage cells per token.
2. Assemble the snapshot JSON: `{colorPrimitives, space, radius, font-size, font-weight, line-height, breakpoint, font-family, semantic, semanticIds, usage}` → save to the session scratchpad.
3. `node scripts/build-dtcg.mjs <snapshot>` → writes `packages/tokens/src/*.tokens.json`.
4. `pnpm --filter @ply/tokens build` → contrast lint + Style Dictionary (dist/css/ply.css, dist/ts/tokens.ts). Lint failures BLOCK: report them; fixes go through Figma (then re-export), never by editing dist.
5. Show `git diff --stat packages/tokens/` and remind: review + commit + `/ply-update-docs`.
