---
description: Sync the Token Usage documentation table in the Ply Figma file with the color-semantic variables — add rows for new tokens, detect renames, flag deprecated rows, push/pull descriptions. Idempotent; never deletes rows or overwrites human-edited narrative cells.
allowed-tools:
  - mcp__claude_ai_Figma__use_figma
  - Read
  - Write
  - Bash
  - Skill
---

# /ply-doc-table

Keep the `Token Usage` page in sync with the `color-semantic` collection. Build happened 2026-07-05; this command maintains it.

## Constants

- **File:** Ply build file `3QugaiUHLUqTyqHhwCibOR` (never the reference file)
- **Page:** `Token Usage` (by name) → container `Token Documentation Tables` → tables `Background · Status backgrounds · Text · Icon · Border · Data-viz & shadow`
- **Row identity:** `getSharedPluginData('ply','variableId')` — NEVER match rows by token name (names change; IDs don't)
- **Columns:** Sample (bound swatch) · Token · Description · Where to apply · How to use · Do · Don't

## Critical rules (ported from the reference design system's doc-table commands)

1. **Load the `figma-use` skill before any `use_figma` call.** Chunk table scans ~40 rows per call (20KB cap).
2. **Idempotent.** Clean state → `+0 added · 0 renamed · 0 deprecated · 0 pushed · 0 pulled`.
3. **Never overwrite human content.** Auto-rewritten cells: **Token** (rename via ID match) and **Sample** (binding refresh) only. Where/How/Do/Don't are seeded ONCE at row creation and never touched again.
4. **Deprecation, not deletion.** Variable gone → prefix row name `DEPRECATED:`, tint row red, keep the narrative as institutional memory.
5. **Description sync is bidirectional with rules** (ADR-0005 policy — table wins usage text):
   - table cell non-empty + variable description differs → **push table → variable**
   - table cell empty + variable has description → **pull variable → table**
   - both empty → seed from the role template and push to both
6. **Preview then apply.** First pass computes the change list and prints it; writes happen only after the user approves (skip the gate only for `+N added` when N ≤ 5).

## Steps

1. Inventory variables: id → {name, description} for all of `color-semantic` (chunked).
2. Inventory rows: walk each table's children with a `variableId` shared-plugin-data key → {rowNodeId, variableId, tokenCellText, descCellText}.
3. Diff: new variables (no row) · renamed (ID matches, name differs) · orphaned rows (ID matches nothing) · description drift (rule 5).
4. Print the preview report. On approval:
   - new rows: append to the correct table (route by name prefix), seed narrative from the templates in the build scripts, set shared plugin data, bind swatch
   - renames: rewrite Token cell + row name
   - orphans: apply DEPRECATED treatment
   - descriptions: push/pull per rule 5
5. Re-run steps 1–3 to confirm zero remaining drift; report final counts.
6. Never commit; suggest `/ply-update-docs` if anything changed.
