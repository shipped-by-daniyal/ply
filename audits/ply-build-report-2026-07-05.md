# Build report — Ply token library v1

**Date:** 2026-07-05 · **Target:** Figma file `3QugaiUHLUqTyqHhwCibOR` · **Grammar:** ADR-0005 · **Source values:** the 2026-07-05 reference-library export (`audits/ply-baseline-audit-2026-07-05.md`).

## Result

347 variables, 9 collections, validated in-file with zero findings (dup names, missing descriptions, missing mode values, raw values in semantic tier, path-prefix collisions — all clean).

| Collection | Vars | Modes |
|---|---|---|
| color-primitives | 119 | Value |
| color-semantic | 160 | Light, Dark |
| space | 21 | Value |
| radius | 6 | Value |
| font-size / font-weight / line-height | 12 / 7 / 15 | Value |
| font-family | 2 | Value |
| breakpoint | 5 | Value |

Scopes: primitives are hidden from pickers (`scopes: []` — aliasable only); semantic tokens scoped by property (bg → frame/shape fill, text → text fill, icon → shape fill, border → stroke, shadow → effect color, space → gap/width-height, radius → corner radius, font-\* → their typography scopes).

## Mapping decisions (reference → Ply)

- **Ladder folds (6 rungs → 3):**
  - `bg neutral`: `subtle` ← old *subtler* values (alpha 100/200/300 ramp); old *subtlest* and *subtle* rungs dropped; `bold` ← old *bold*; old *boldest* dropped (its hover state was a same-value collision).
  - `bg accent` (ex-brand): `subtle` ← old *subtlest* values (50/100/200 — matches `bg/selected`); `bold` ← old *bold*.
  - `text/icon neutral`: `subtle` ← old *subtler* (gray/700 · gray/400); old *subtlest* (gray/500 placeholder color) dropped — `text/disabled` covers that need; revisit additively if placeholders need their own rung.
- **Brand → accent:** all ex-`brand` tokens alias the Blue ramp directly (single brand, ADR-0005); the `colors-brand` ramp collection was not carried, which also retires the Brand-2 `950` bug.
- **`flat` elevation renamed to unsuffixed:** `background/surface/flat/*` → `bg/surface[-state]`; sunken/raised/overlay stay as compound roles.
- **Status:** solid/default set + `subtle` + `bold` per status; the extra `status/` path level kept per maintainer decision.

## Fixes applied (not ported from reference)

1. **Dark-mode bold-pressed collisions** (`bg/status/*-bold`): pressed now steps to `X/50` instead of duplicating hovered's `X/100`.
2. **`border/neutral-subtle` state ramp made monotonic** (reference had hovered darker than pressed).
3. **`border/neutral-bold` hover collision resolved** (reference dark hover ≡ dark default).
4. **`border/focused` strengthened** `blue/200 → blue/400` (light) / `blue/300` (dark) for 3:1 non-text contrast.
5. **`text/status/*` dark values normalized to `X/300`** (reference text used `X/100` while icons used `X/300` for the same role).
6. **`text/status/*-subtle` dropped** — reference values (`X/100` on light) were unreadable; flagged in audit §4.4.
7. **Radius renumbered scale → spelled sizes**: none 0 · small 4 · medium 8 · large 16 · xlarge 24 · full 9999. Old steps 2/6/10/12/20/32/48/64 not carried; add by name if needed.

## New tokens with no reference ancestor

- `text/on-accent`, `text/on-neutral-bold`, `text/on-status-{danger,success,warning,info}`, `icon/on-accent` — the ADR-0005 contrast-pairing contract. Warning and info pair **dark** text (yellow/teal fills fail with white). All pairs need the Phase 4 contrast lint to verify programmatically.

## Styles and sticker sheet (added later on 2026-07-05)

- **26 text styles** built, replacing the reference's 27: `heading/1–4`, `body/{lg,md,sm,xs}/{regular,medium,bold}`, `label/{lg,md,sm}`, `link/{lg,md,sm}`, `mono/{lg,md,sm,xs}`. The reference's standalone `caption` was dropped (value-identical to `body/sm/regular`). Every style binds fontFamily, fontSize, lineHeight, AND fontWeight to tokens (zero bind failures).
- **5 effect styles** (`shadow/xs–xl`) with reference geometry and every layer's color bound to the semantic `shadow/close|middle|diffuse` tokens.
- **Foundations sticker sheet** built (1488×6653): 12 primitive ramps (119 swatches), 160 semantic rows (each swatch **variable-bound** — the audit's `unbound_swatch` check applies — with resolved Light · Dark values printed), spacing bars with width bound to `space/*` tokens, radius samples corner-bound to `radius/*`, breakpoints, 26 typography specimens on real styles, 5 shadow cards on real effect styles. Screenshot-verified, zero leftover placeholders.

## Not yet built (next steps in Phase 3)

- Token Usage documentation table — port `/ply-doc-table` machinery from the reference commands.
- The `component` collection intentionally does not exist yet (tier 3 mints on first genuine deviation).
