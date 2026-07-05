# Rename manifest — reverse migration to reference naming (ADR-0007)

**Date:** 2026-07-05 · **Target file:** `3QugaiUHLUqTyqHhwCibOR` (Token Library v1 - Ply) · **Source of names:** `zEiSF5kqk7a0buxqF9BcVp` (reference library, read-only) · **Method:** value-verified programmatic matching (scratchpad `build-manifest.mjs`), gated on injectivity + zero DTCG path-prefix collisions + zero Figma↔repo drift (checksum-verified).

This file is the rollback map: every rename is keyed by the stable Figma variable ID, so the migration (and its reversal) is mechanical.

## Counts

| Bucket | n |
|---|---|
| primitiveRenames | 119 |
| scaleRenames | 68 |
| scaleAdditions | 8 |
| semanticRenames | 138 |
| semanticSame | 15 |
| deprecations | 9 |
| additions | 36 |
| retargets | 25 |
| valueDiffs | 32 |
| problems | 0 |

Books balance: 138 renamed + 15 unchanged + 9 deprecated = 162 current semantic vars; 138 + 15 + 36 additions = 189 reference semantic names. All 32 value diffs trace to the contrast fixes recorded in `audits/ply-build-report-2026-07-05.md` (kept per ADR-0007).

## Collection renames

- `space` → `space-primitives`
- `radius` → `radius-primitives`
- `line-height` → `font-line-height`
- `breakpoint` → `breakpoints`

## Semantic renames (by variable ID)

| Variable ID | From (ADR-0005) | To (reference) |
|---|---|---|
| VariableID:13:2 | `bg/surface-sunken` | `background/surface/sunken/default` |
| VariableID:13:3 | `bg/surface` | `background/surface/flat/default` |
| VariableID:13:4 | `bg/surface-hovered` | `background/surface/flat/hovered` |
| VariableID:13:5 | `bg/surface-pressed` | `background/surface/flat/pressed` |
| VariableID:13:6 | `bg/surface-raised` | `background/surface/raised/default` |
| VariableID:13:7 | `bg/surface-raised-hovered` | `background/surface/raised/hovered` |
| VariableID:13:8 | `bg/surface-raised-pressed` | `background/surface/raised/pressed` |
| VariableID:13:9 | `bg/surface-overlay` | `background/surface/overlay/default` |
| VariableID:13:10 | `bg/surface-overlay-hovered` | `background/surface/overlay/hovered` |
| VariableID:13:11 | `bg/surface-overlay-pressed` | `background/surface/overlay/pressed` |
| VariableID:13:12 | `bg/neutral-hovered` | `background/neutral/hovered` |
| VariableID:13:13 | `bg/neutral-pressed` | `background/neutral/pressed` |
| VariableID:13:14 | `bg/neutral-subtle` | `background/neutral/subtler/default` |
| VariableID:13:15 | `bg/neutral-subtle-hovered` | `background/neutral/subtler/hovered` |
| VariableID:13:16 | `bg/neutral-subtle-pressed` | `background/neutral/subtler/pressed` |
| VariableID:13:17 | `bg/neutral-bold` | `background/neutral/bold/default` |
| VariableID:13:18 | `bg/neutral-bold-hovered` | `background/neutral/bold/hovered` |
| VariableID:13:19 | `bg/neutral-bold-pressed` | `background/neutral/bold/pressed` |
| VariableID:13:20 | `bg/accent` | `background/brand/default` |
| VariableID:13:21 | `bg/accent-hovered` | `background/brand/hovered` |
| VariableID:13:22 | `bg/accent-pressed` | `background/brand/pressed` |
| VariableID:13:23 | `bg/accent-subtle` | `background/brand/subtlest/default` |
| VariableID:13:24 | `bg/accent-subtle-hovered` | `background/brand/subtlest/hovered` |
| VariableID:13:25 | `bg/accent-subtle-pressed` | `background/brand/subtlest/pressed` |
| VariableID:13:26 | `bg/accent-bold` | `background/brand/bold/default` |
| VariableID:13:27 | `bg/accent-bold-hovered` | `background/brand/bold/hovered` |
| VariableID:13:28 | `bg/accent-bold-pressed` | `background/brand/bold/pressed` |
| VariableID:13:29 | `bg/selected` | `background/selected/default` |
| VariableID:13:30 | `bg/selected-hovered` | `background/selected/hovered` |
| VariableID:13:31 | `bg/selected-pressed` | `background/selected/pressed` |
| VariableID:13:32 | `bg/inverse` | `background/inverse/default` |
| VariableID:13:33 | `bg/inverse-hovered` | `background/inverse/hovered` |
| VariableID:13:34 | `bg/inverse-pressed` | `background/inverse/pressed` |
| VariableID:13:35 | `bg/disabled` | `background/disabled` |
| VariableID:13:36 | `bg/scrim` | `background/scrim` |
| VariableID:13:37 | `bg/static-white` | `background/static/white/default` |
| VariableID:13:38 | `bg/static-black` | `background/static/black/default` |
| VariableID:13:39 | `bg/status/danger` | `background/status/danger/default` |
| VariableID:13:40 | `bg/status/danger-hovered` | `background/status/danger/hovered` |
| VariableID:13:41 | `bg/status/danger-pressed` | `background/status/danger/pressed` |
| VariableID:13:42 | `bg/status/danger-subtle` | `background/status/danger/subtle/default` |
| VariableID:13:43 | `bg/status/danger-subtle-hovered` | `background/status/danger/subtle/hovered` |
| VariableID:13:44 | `bg/status/danger-subtle-pressed` | `background/status/danger/subtle/pressed` |
| VariableID:13:45 | `bg/status/danger-bold` | `background/status/danger/bold/default` |
| VariableID:13:46 | `bg/status/danger-bold-hovered` | `background/status/danger/bold/hovered` |
| VariableID:13:47 | `bg/status/danger-bold-pressed` | `background/status/danger/bold/pressed` |
| VariableID:13:48 | `bg/status/success` | `background/status/success/default` |
| VariableID:13:49 | `bg/status/success-hovered` | `background/status/success/hovered` |
| VariableID:13:50 | `bg/status/success-pressed` | `background/status/success/pressed` |
| VariableID:13:51 | `bg/status/success-subtle` | `background/status/success/subtle/default` |
| VariableID:13:52 | `bg/status/success-subtle-hovered` | `background/status/success/subtle/hovered` |
| VariableID:13:53 | `bg/status/success-subtle-pressed` | `background/status/success/subtle/pressed` |
| VariableID:13:54 | `bg/status/success-bold` | `background/status/success/bold/default` |
| VariableID:13:55 | `bg/status/success-bold-hovered` | `background/status/success/bold/hovered` |
| VariableID:13:56 | `bg/status/success-bold-pressed` | `background/status/success/bold/pressed` |
| VariableID:13:57 | `bg/status/warning` | `background/status/warning/default` |
| VariableID:13:58 | `bg/status/warning-hovered` | `background/status/warning/hovered` |
| VariableID:13:59 | `bg/status/warning-pressed` | `background/status/warning/pressed` |
| VariableID:13:60 | `bg/status/warning-subtle` | `background/status/warning/subtle/default` |
| VariableID:13:61 | `bg/status/warning-subtle-hovered` | `background/status/warning/subtle/hovered` |
| VariableID:13:62 | `bg/status/warning-subtle-pressed` | `background/status/warning/subtle/pressed` |
| VariableID:13:63 | `bg/status/warning-bold` | `background/status/warning/bold/default` |
| VariableID:13:64 | `bg/status/warning-bold-hovered` | `background/status/warning/bold/hovered` |
| VariableID:13:65 | `bg/status/warning-bold-pressed` | `background/status/warning/bold/pressed` |
| VariableID:13:66 | `bg/status/info` | `background/status/info/default` |
| VariableID:13:67 | `bg/status/info-hovered` | `background/status/info/hovered` |
| VariableID:13:68 | `bg/status/info-pressed` | `background/status/info/pressed` |
| VariableID:13:69 | `bg/status/info-subtle` | `background/status/info/subtle/default` |
| VariableID:13:70 | `bg/status/info-subtle-hovered` | `background/status/info/subtle/hovered` |
| VariableID:13:71 | `bg/status/info-subtle-pressed` | `background/status/info/subtle/pressed` |
| VariableID:13:72 | `bg/status/info-bold` | `background/status/info/bold/default` |
| VariableID:13:73 | `bg/status/info-bold-hovered` | `background/status/info/bold/hovered` |
| VariableID:13:74 | `bg/status/info-bold-pressed` | `background/status/info/bold/pressed` |
| VariableID:13:75 | `text/neutral` | `text/neutral/default` |
| VariableID:13:76 | `text/neutral-subtle` | `text/neutral/subtler` |
| VariableID:13:77 | `text/inverse` | `text/neutral/inverse` |
| VariableID:13:80 | `text/accent` | `text/brand/default` |
| VariableID:13:81 | `text/accent-subtle` | `text/brand/subtle` |
| VariableID:13:82 | `text/accent-bold` | `text/brand/bold` |
| VariableID:13:83 | `text/link` | `text/link/default` |
| VariableID:13:84 | `text/link-hovered` | `text/link/hovered` |
| VariableID:13:85 | `text/link-pressed` | `text/link/pressed` |
| VariableID:13:86 | `text/link-visited` | `text/link/visited` |
| VariableID:13:87 | `text/static-white` | `text/static/white` |
| VariableID:13:88 | `text/static-black` | `text/static/black` |
| VariableID:13:89 | `text/status/danger` | `text/status/danger/default` |
| VariableID:13:90 | `text/status/danger-bold` | `text/status/danger/bold` |
| VariableID:13:91 | `text/status/success` | `text/status/success/default` |
| VariableID:13:92 | `text/status/success-bold` | `text/status/success/bold` |
| VariableID:13:93 | `text/status/warning` | `text/status/warning/default` |
| VariableID:13:94 | `text/status/warning-bold` | `text/status/warning/bold` |
| VariableID:13:95 | `text/status/info` | `text/status/info/default` |
| VariableID:13:96 | `text/status/info-bold` | `text/status/info/bold` |
| VariableID:13:103 | `icon/neutral` | `icon/neutral/default` |
| VariableID:13:104 | `icon/neutral-subtle` | `icon/neutral/subtler` |
| VariableID:13:105 | `icon/inverse` | `icon/neutral/inverse` |
| VariableID:13:108 | `icon/accent` | `icon/brand/default` |
| VariableID:13:109 | `icon/accent-subtle` | `icon/brand/subtle` |
| VariableID:13:110 | `icon/accent-bold` | `icon/brand/bold` |
| VariableID:13:111 | `icon/static-white` | `icon/static/white` |
| VariableID:13:112 | `icon/static-black` | `icon/static/black` |
| VariableID:13:113 | `icon/status/danger` | `icon/status/danger/default` |
| VariableID:13:114 | `icon/status/danger-bold` | `icon/status/danger/bold` |
| VariableID:13:115 | `icon/status/success` | `icon/status/success/default` |
| VariableID:13:116 | `icon/status/success-bold` | `icon/status/success/bold` |
| VariableID:13:117 | `icon/status/warning` | `icon/status/warning/default` |
| VariableID:13:118 | `icon/status/warning-bold` | `icon/status/warning/bold` |
| VariableID:13:119 | `icon/status/info` | `icon/status/info/default` |
| VariableID:13:120 | `icon/status/info-bold` | `icon/status/info/bold` |
| VariableID:13:122 | `border/neutral` | `border/neutral/default` |
| VariableID:13:123 | `border/neutral-hovered` | `border/neutral/hovered` |
| VariableID:13:124 | `border/neutral-pressed` | `border/neutral/pressed` |
| VariableID:13:125 | `border/neutral-subtle` | `border/neutral/subtle/default` |
| VariableID:13:126 | `border/neutral-subtle-hovered` | `border/neutral/subtle/hovered` |
| VariableID:13:127 | `border/neutral-subtle-pressed` | `border/neutral/subtle/pressed` |
| VariableID:13:128 | `border/neutral-bold` | `border/neutral/bold/default` |
| VariableID:13:129 | `border/neutral-bold-hovered` | `border/neutral/bold/hovered` |
| VariableID:13:130 | `border/neutral-bold-pressed` | `border/neutral/bold/pressed` |
| VariableID:13:131 | `border/accent` | `border/brand/default` |
| VariableID:13:132 | `border/accent-subtle` | `border/brand/subtle` |
| VariableID:13:133 | `border/accent-bold` | `border/brand/bold` |
| VariableID:13:137 | `border/static-white` | `border/static/white` |
| VariableID:13:138 | `border/static-black` | `border/static/black` |
| VariableID:13:139 | `border/status/danger` | `border/status/danger/default` |
| VariableID:13:140 | `border/status/danger-subtle` | `border/status/danger/subtle` |
| VariableID:13:141 | `border/status/danger-bold` | `border/status/danger/bold` |
| VariableID:13:142 | `border/status/success` | `border/status/success/default` |
| VariableID:13:143 | `border/status/success-subtle` | `border/status/success/subtle` |
| VariableID:13:144 | `border/status/success-bold` | `border/status/success/bold` |
| VariableID:13:145 | `border/status/warning` | `border/status/warning/default` |
| VariableID:13:146 | `border/status/warning-subtle` | `border/status/warning/subtle` |
| VariableID:13:147 | `border/status/warning-bold` | `border/status/warning/bold` |
| VariableID:13:148 | `border/status/info` | `border/status/info/default` |
| VariableID:13:149 | `border/status/info-subtle` | `border/status/info/subtle` |
| VariableID:13:150 | `border/status/info-bold` | `border/status/info/bold` |
| VariableID:13:159 | `shadow/close` | `effect/shadow/color/close` |
| VariableID:13:160 | `shadow/middle` | `effect/shadow/color/middle` |
| VariableID:13:161 | `shadow/diffuse` | `effect/shadow/color/diffuse` |

## Unchanged names

`text/disabled`, `text/selected`, `icon/disabled`, `icon/selected`, `border/focused`, `border/selected`, `border/disabled`, `data-viz/categorical/1`, `data-viz/categorical/2`, `data-viz/categorical/3`, `data-viz/categorical/4`, `data-viz/categorical/5`, `data-viz/categorical/6`, `data-viz/categorical/7`, `data-viz/categorical/8`

## Deprecations (Ply-only pairing tokens, ADR-0007)

| Variable ID | From | To |
|---|---|---|
| VariableID:13:97 | `text/on-accent` | `deprecated/text/on-accent` |
| VariableID:13:98 | `text/on-neutral-bold` | `deprecated/text/on-neutral-bold` |
| VariableID:13:99 | `text/on-status-danger` | `deprecated/text/on-status-danger` |
| VariableID:13:100 | `text/on-status-success` | `deprecated/text/on-status-success` |
| VariableID:13:101 | `text/on-status-warning` | `deprecated/text/on-status-warning` |
| VariableID:13:102 | `text/on-status-info` | `deprecated/text/on-status-info` |
| VariableID:13:121 | `icon/on-accent` | `deprecated/icon/on-accent` |
| VariableID:26:2 | `text/on-status-warning-bold` | `deprecated/text/on-status-warning-bold` |
| VariableID:26:3 | `text/on-status-info-bold` | `deprecated/text/on-status-info-bold` |

## Additions (reference names with no Ply ancestor — created with reference values, descriptions, scopes)

| Name | Light | Dark |
|---|---|---|
| `background/neutral/subtlest/default` | Gray/Alpha/050 | White/Alpha/050 |
| `background/neutral/subtle/default` | Gray/Alpha/200 | White/Alpha/200 |
| `background/neutral/subtle/hovered` | Gray/Alpha/300 | White/Alpha/300 |
| `background/neutral/subtle/pressed` | Gray/Alpha/400 | White/Alpha/400 |
| `background/neutral/subtlest/hovered` | Gray/Alpha/100 | White/Alpha/100 |
| `background/neutral/subtlest/pressed` | Gray/Alpha/200 | White/Alpha/200 |
| `background/neutral/boldest/default` | Gray/800 | Gray/300 |
| `background/neutral/boldest/hovered` | Gray/800 | Gray/300 |
| `background/neutral/boldest/pressed` | Gray/1000 | Gray/50 |
| `background/brand/subtler/default` | colors-brand/100 | colors-brand/900 |
| `background/brand/subtler/hovered` | colors-brand/200 | colors-brand/800 |
| `background/brand/subtler/pressed` | colors-brand/300 | colors-brand/700 |
| `background/brand/subtle/default` | colors-brand/200 | colors-brand/800 |
| `background/brand/subtle/hovered` | colors-brand/300 | colors-brand/700 |
| `background/brand/subtle/pressed` | colors-brand/400 | colors-brand/600 |
| `background/brand/boldest/default` | colors-brand/700 | colors-brand/200 |
| `background/brand/boldest/hovered` | colors-brand/800 | colors-brand/100 |
| `background/brand/boldest/pressed` | colors-brand/900 | colors-brand/100 |
| `text/neutral/subtlest` | Gray/500 | Gray/500 |
| `text/neutral/subtle` | Gray/800 | Gray/300 |
| `text/brand/subtlest` | colors-brand/50 | colors-brand/950 |
| `text/brand/boldest` | colors-brand/700 | colors-brand/200 |
| `text/brand/inverse` | colors-brand/100 | Gray/900 |
| `text/status/info/subtle` | Teal/100 | Teal/900 |
| `text/status/success/subtle` | Green/100 | Green/900 |
| `text/status/warning/subtle` | Yellow/100 | Yellow/900 |
| `text/status/danger/subtle` | Red/100 | Red/900 |
| `icon/neutral/subtlest` | Gray/500 | Gray/500 |
| `icon/neutral/subtle` | Gray/800 | Gray/300 |
| `icon/brand/subtlest` | colors-brand/50 | colors-brand/950 |
| `icon/brand/boldest` | colors-brand/700 | colors-brand/200 |
| `icon/brand/inverse` | colors-brand/100 | Gray/900 |
| `icon/status/info/subtle` | Teal/100 | Teal/900 |
| `icon/status/success/subtle` | Green/100 | Green/900 |
| `icon/status/warning/subtle` | Yellow/100 | Yellow/900 |
| `icon/status/danger/subtle` | Red/100 | Red/900 |

Known carried contrast risks (reference bugs copied verbatim, excluded from lint pairs, flagged for a future fix ADR): `text/status/*/subtle` and `icon/status/*/subtle` (X/100 on light surfaces), `background/neutral/boldest` hover≡default collision.

## Alias retargets (ex-accent tokens move from Blue/* to the restored colors-brand/* ramp; Ply step numbers — i.e. the contrast fixes — are kept)

| Variable ID | Token (new name) | Light alias | Dark alias |
|---|---|---|---|
| VariableID:13:20 | `background/brand/default` | colors-brand/500 | colors-brand/500 |
| VariableID:13:21 | `background/brand/hovered` | colors-brand/600 | colors-brand/600 |
| VariableID:13:22 | `background/brand/pressed` | colors-brand/700 | colors-brand/700 |
| VariableID:13:23 | `background/brand/subtlest/default` | colors-brand/50 | colors-brand/950 |
| VariableID:13:24 | `background/brand/subtlest/hovered` | colors-brand/100 | colors-brand/900 |
| VariableID:13:25 | `background/brand/subtlest/pressed` | colors-brand/200 | colors-brand/800 |
| VariableID:13:26 | `background/brand/bold/default` | colors-brand/600 | colors-brand/600 |
| VariableID:13:27 | `background/brand/bold/hovered` | colors-brand/700 | colors-brand/700 |
| VariableID:13:28 | `background/brand/bold/pressed` | colors-brand/800 | colors-brand/800 |
| VariableID:13:29 | `background/selected/default` | colors-brand/50 | colors-brand/950 |
| VariableID:13:30 | `background/selected/hovered` | colors-brand/100 | colors-brand/900 |
| VariableID:13:31 | `background/selected/pressed` | colors-brand/200 | colors-brand/800 |
| VariableID:13:79 | `text/selected` | colors-brand/500 | colors-brand/400 |
| VariableID:13:80 | `text/brand/default` | colors-brand/500 | colors-brand/400 |
| VariableID:13:81 | `text/brand/subtle` | colors-brand/200 | colors-brand/800 |
| VariableID:13:82 | `text/brand/bold` | colors-brand/600 | colors-brand/300 |
| VariableID:13:107 | `icon/selected` | colors-brand/500 | colors-brand/400 |
| VariableID:13:108 | `icon/brand/default` | colors-brand/500 | colors-brand/400 |
| VariableID:13:109 | `icon/brand/subtle` | colors-brand/200 | colors-brand/800 |
| VariableID:13:110 | `icon/brand/bold` | colors-brand/600 | colors-brand/300 |
| VariableID:13:131 | `border/brand/default` | colors-brand/400 | colors-brand/800 |
| VariableID:13:132 | `border/brand/subtle` | colors-brand/100 | colors-brand/900 |
| VariableID:13:133 | `border/brand/bold` | colors-brand/400 | colors-brand/400 |
| VariableID:13:134 | `border/focused` | colors-brand/400 | colors-brand/300 |
| VariableID:13:135 | `border/selected` | colors-brand/500 | colors-brand/400 |

## Value diffs vs reference (deliberate — the kept fixes)

| Token (reference name) | Ply values (kept) | Reference values (not restored) |
|---|---|---|
| `background/brand/hovered` | blue/600 · blue/600 | colors-brand/600 · colors-brand/300 |
| `background/brand/pressed` | blue/700 · blue/700 | colors-brand/700 · colors-brand/200 |
| `background/brand/bold/default` | blue/600 · blue/600 | colors-brand/600 · colors-brand/300 |
| `background/brand/bold/hovered` | blue/700 · blue/700 | colors-brand/700 · colors-brand/200 |
| `background/brand/bold/pressed` | blue/800 · blue/800 | colors-brand/800 · colors-brand/100 |
| `background/status/danger/default` | red/600 · red/400 | Red/500 · Red/400 |
| `background/status/danger/hovered` | red/700 · red/300 | Red/600 · Red/300 |
| `background/status/danger/pressed` | red/800 · red/200 | Red/700 · Red/200 |
| `background/status/danger/bold/pressed` | red/900 · red/50 | Red/900 · Red/100 |
| `background/status/success/default` | green/600 · green/400 | Green/500 · Green/400 |
| `background/status/success/hovered` | green/700 · green/300 | Green/600 · Green/300 |
| `background/status/success/pressed` | green/800 · green/200 | Green/700 · Green/200 |
| `background/status/success/bold/pressed` | green/900 · green/50 | Green/900 · Green/100 |
| `background/status/warning/hovered` | yellow/400 · yellow/300 | Yellow/600 · Yellow/300 |
| `background/status/warning/pressed` | yellow/300 · yellow/200 | Yellow/700 · Yellow/200 |
| `background/status/warning/bold/pressed` | yellow/900 · yellow/50 | Yellow/900 · Yellow/100 |
| `background/status/info/hovered` | teal/400 · teal/300 | Teal/600 · Teal/300 |
| `background/status/info/pressed` | teal/300 · teal/200 | Teal/700 · Teal/200 |
| `background/status/info/bold/pressed` | teal/900 · teal/50 | Teal/900 · Teal/100 |
| `text/neutral/subtler` | gray/700 · gray/200 | Gray/700 · Gray/400 |
| `text/status/danger/default` | red/600 · red/300 | Red/600 · Red/100 |
| `text/status/success/default` | green/600 · green/300 | Green/600 · Green/100 |
| `text/status/warning/default` | yellow/700 · yellow/300 | Yellow/600 · Yellow/100 |
| `text/status/info/default` | teal/700 · teal/300 | Teal/600 · Teal/100 |
| `icon/neutral/subtler` | gray/700 · gray/200 | Gray/700 · Gray/400 |
| `icon/status/warning/default` | yellow/700 · yellow/300 | Yellow/600 · Yellow/300 |
| `icon/status/info/default` | teal/700 · teal/300 | Teal/600 · Teal/300 |
| `border/neutral/subtle/hovered` | gray/200 · gray/700 | Gray/300 · Gray/600 |
| `border/neutral/subtle/pressed` | gray/300 · gray/600 | Gray/200 · Gray/700 |
| `border/neutral/bold/hovered` | gray/500 · gray/400 | Gray/500 · Gray/500 |
| `border/neutral/bold/pressed` | gray/600 · gray/300 | Gray/600 · Gray/400 |
| `border/focused` | blue/400 · blue/300 | colors-brand/200 · colors-brand/800 |

## Scale renames

| Collection | From | To |
|---|---|---|
| space | `space/0` | `0` |
| space | `space/25` | `25` |
| space | `space/50` | `50` |
| space | `space/75` | `75` |
| space | `space/100` | `100` |
| space | `space/150` | `150` |
| space | `space/200` | `200` |
| space | `space/250` | `250` |
| space | `space/300` | `300` |
| space | `space/350` | `350` |
| space | `space/400` | `400` |
| space | `space/500` | `500` |
| space | `space/600` | `600` |
| space | `space/700` | `700` |
| space | `space/800` | `800` |
| space | `space/900` | `900` |
| space | `space/1000` | `1000` |
| space | `space/1100` | `1100` |
| space | `space/1200` | `1200` |
| space | `space/1300` | `1300` |
| space | `space/1400` | `1400` |
| radius | `radius/none` | `0` |
| radius | `radius/small` | `100` |
| radius | `radius/medium` | `200` |
| radius | `radius/large` | `400` |
| radius | `radius/xlarge` | `500` |
| radius | `radius/full` | `Full` |
| font-size | `font-size/100` | `font-size-100` |
| font-size | `font-size/200` | `font-size-200` |
| font-size | `font-size/300` | `font-size-300` |
| font-size | `font-size/400` | `font-size-400` |
| font-size | `font-size/500` | `font-size-500` |
| font-size | `font-size/600` | `font-size-600` |
| font-size | `font-size/700` | `font-size-700` |
| font-size | `font-size/800` | `font-size-800` |
| font-size | `font-size/900` | `font-size-900` |
| font-size | `font-size/1000` | `font-size-1000` |
| font-size | `font-size/1100` | `font-size-1100` |
| font-size | `font-size/1200` | `font-size-1200` |
| font-weight | `font-weight/100` | `weight-100` |
| font-weight | `font-weight/200` | `weight-200` |
| font-weight | `font-weight/300` | `weight-300` |
| font-weight | `font-weight/400` | `weight-400` |
| font-weight | `font-weight/500` | `weight-500` |
| font-weight | `font-weight/600` | `weight-600` |
| font-weight | `font-weight/700` | `weight-700` |
| line-height | `line-height/100` | `line-height-100` |
| line-height | `line-height/200` | `line-height-200` |
| line-height | `line-height/300` | `line-height-300` |
| line-height | `line-height/400` | `line-height-400` |
| line-height | `line-height/500` | `line-height-500` |
| line-height | `line-height/550` | `line-height-550` |
| line-height | `line-height/600` | `line-height-600` |
| line-height | `line-height/650` | `line-height-650` |
| line-height | `line-height/700` | `line-height-700` |
| line-height | `line-height/800` | `line-height-800` |
| line-height | `line-height/900` | `line-height-900` |
| line-height | `line-height/1000` | `line-height-1000` |
| line-height | `line-height/1100` | `line-height-1100` |
| line-height | `line-height/1200` | `line-height-1200` |
| line-height | `line-height/1300` | `line-height-1300` |
| breakpoint | `breakpoint/xs` | `xs` |
| breakpoint | `breakpoint/sm` | `sm` |
| breakpoint | `breakpoint/md` | `md` |
| breakpoint | `breakpoint/lg` | `lg` |
| breakpoint | `breakpoint/xl` | `xl` |
| font-family | `font-family/sans` | `font-sans` |
| font-family | `font-family/mono` | `font-mono` |

## Scale additions (radius steps the spelled scale dropped)

- `radius-primitives/50` = 2
- `radius-primitives/150` = 6
- `radius-primitives/300` = 12
- `radius-primitives/600` = 32
- `radius-primitives/700` = 48
- `radius-primitives/800` = 64
- `radius-primitives/250` = 10
- `radius-primitives/450` = 20

## Primitive renames (case restoration, hex-verified)

All 119 primitives rename from lowercase to the reference capitalization (`gray/500` → `Gray/500`, `white/alpha/100` → `White/Alpha/100`, …). Full list in the machine manifest; every pair was hex-verified identical.

## New collections/modes

- `colors-brand` (11 vars, modes Brand 1 / Brand 2) restored. Fix #22: `950` under Brand 2 aliases `Pink/900` (deepest Pink) instead of inheriting `Blue/950` (reference bug, baseline audit §4.1).
- `font-family` gains modes Geist and Die Grotesk A (font-sans varies; font-mono stays IBM Plex Mono).

