# Baseline audit — reference token library

**Date:** 2026-07-05 · **Source (read-only):** Figma file `zEiSF5kqk7a0buxqF9BcVp` ("Token Library v1 - GDS") · **Build target:** `3QugaiUHLUqTyqHhwCibOR` ("Token Library v1 - Ply", empty) · **Method:** full variable export via Figma MCP plugin API (chunked, aliases resolved), assessed against `kb/comparisons/2026-07-05-token-path-grammar.md` and the `kb/topics/` guides.

## 1. Inventory

10 collections, 395 variables, 27 text styles, 5 effect styles.

| Collection | Vars | Modes | Notes |
|---|---|---|---|
| color-primitives | 119 | 1 | 9 hues × 10 steps (50–900) + Gray extended (0,25,75…1000) + Blue/950 + 3 alpha ramps (Gray 9, White 9, Blue 6) |
| color-semantic | 189 | Light, Dark | 100% alias-based (zero raw hex), 100% descriptions ✓ |
| colors-brand | 11 | Brand 1, Brand 2 | ramp 50–950; B1→Blue/*, B2→Pink/* |
| font-family | 2 | Inter, Geist, Die Grotesk A | brand-font axis; mono constant across modes |
| space-primitives | 21 | — | gapped base-4 (0–176px), names 0–1400 ✓ matches KB best practice |
| radius-primitives | 14 | — | numbered + `Full`; 250/450 added out of order ⚠ |
| font-size / weight / line-height | 12/7/15 | — | numbered 100–1200; line-heights are 15 hand-coupled px values |
| breakpoints | 5 | — | xs 360 … xl 1640 |

## 2. Strengths to carry forward

- **Every semantic token has a description** — the doc discipline Ply's `$description` pipeline needs is already cultural.
- **Zero raw hex in the semantic tier** — alias discipline is complete.
- **Gapped base-4 spacing** exactly matches the KB recommendation (Polaris-style).
- **Two real theming axes already in production**: Light/Dark on semantics, Brand 1/Brand 2 on the brand ramp, plus a 3-mode font axis — richer than the taxonomy dossier assumed.
- Well-shaped role set: surface elevation ramp (sunken/flat/raised/overlay), inverse, scrim, static, selected, disabled, focused, data-viz — a mature vocabulary worth keeping almost wholesale.

## 3. Grammar deltas vs the target taxonomy (dossier verdicts)

1. **`background/` → `bg/`** — 89 tokens renamed under the element-first abbreviation rule.
2. **Nested emphasis/state levels → hyphenated leaves.** Current `background/neutral/subtle/hovered` (4 levels) becomes `bg/neutral-subtle-hovered`-style leaves per the DTCG prefix-collision rule.
3. **Inconsistent depth is real and measurable** (predicted by the advisor): `background/neutral/hovered` coexists with `background/neutral/subtle/hovered`; some roles carry a `/default` leaf (`background/brand/default`), siblings don't (`text/neutral/default` leaf vs `border/brand/default` leaf vs `background/neutral/bold/default`). Two conventions in one collection — the new grammar eliminates the class.
4. **Six-rung emphasis ladder in use** (`subtlest…boldest` — note `boldest`, not Atlassian's `bolder`) vs the advisor's 3-rung recommendation. Actual usage is dense across neutral/brand backgrounds — trimming requires a mapping decision (see §6).
5. **`status/` sub-namespace** (`background/status/danger/…`) adds a level the target grammar doesn't have (`bg/danger`). Flatten or keep — decision needed.
6. **No contrast-pairing tokens exist** (`text/on-accent` etc.). `text/static/white` is used implicitly instead. The advisor's rule 4 (mandatory `on-*` for filled bgs + `pairsWith` lint) is entirely greenfield.
7. **`data-viz/categorical/1–8` and `effect/shadow/color/*`** — namespaces the taxonomy didn't cover; both are legitimate and need slots in the new grammar.

## 4. Bugs and drift found (value-level)

1. **`colors-brand/950` points to `Blue/950` in BOTH brand modes** — Brand 2 (Pink) inherits a blue token; `Pink/950` doesn't exist. Visible wherever `background/brand/subtlest` renders in dark mode under Brand 2.
2. **`background/neutral/boldest/default` ≡ `boldest/hovered`** (`Gray/800`→`Gray/300` in both modes) — hover state does nothing. Same-value collisions also in dark mode for all four `background/status/*/bold` pairs (`hovered` ≡ `pressed` at `X/100`).
3. **`text/link/*` aliases `Blue/*` directly, bypassing the brand ramp** — links stay blue under Brand 2 (Pink). Deliberate or drift? Needs a call.
4. **`text/status/*/subtle` and `border/focused` contrast risks**: `text/status/info/subtle` = `Teal/100` on light surfaces (~unreadable); focus border = brand `200` (3:1 against white is doubtful). The planned contrast lint would fail these today.
5. **Radius scale out-of-order additions** (250, 450 appended after `Full`) — the numbered-scale insertion pain the KB predicts; supports the advisor's spelled-sizes recommendation.
6. **Gray ramp shape differs from all other hues** (15 steps incl. 0/25/75 vs 10 steps) and only Blue has a 950 — scale asymmetries to normalize or document.

## 5. Strategy note — build fresh, not migrate

The original plan assumed rename-in-place in the reference file. The setup changed: the reference file stays untouched (read-only) and Ply's library is built clean in the empty target file. Consequences: no binding-preservation constraints; value provenance comes from this export; the reference file remains a working fallback; the sticker sheet and doc tables are built new in the target file against the new grammar.

## 6. Decisions needed before ADR-0005 (token taxonomy)

1. Emphasis ladder: trim to 3 rungs (advisor) vs keep more — and the mapping for existing subtlest/subtler/boldest values.
2. `status/` namespace: flatten `bg/danger` vs keep `bg/status/danger`.
3. Multi-brand + font axes: carry Brand 1/Brand 2 and the 3-font axis into Ply v1, or park them.
4. `data-viz/*`: carry into v1 or defer.
5. Link color: brand-following or deliberately blue-forever.
