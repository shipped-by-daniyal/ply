---
title: Token naming
updated: 2026-07-05
---

# Token naming

## 1. The question this answers

What grammar should Ply's token names follow — which words, in which order, from which vocabularies — and how does one canonical name project onto every surface Ply ships (Figma variable paths, DTCG JSON, `--ply-*` CSS custom properties, TypeScript keys) without inventing a second grammar?

## 2. Current best practice (as of 2026)

- **Names encode decisions, not values.** Every major system converged on role-based names ("a design token's name describes how it should be used" — Atlassian; "a role-based identifier that assigns a value to a theme" — Carbon). Value-descriptive names (`blue-600`) belong only in the primitive tier.
- **Position-based grammar with closed vocabularies.** The state of the art is a fixed segment order — Nathan Curtis's canonical decomposition is namespace → object → base (category/concept/property) → modifiers (variant, state, scale, mode), with "no prevailing token level order" across systems but strong convergence on *base in the middle, modifiers last* ([Naming Tokens in Design Systems](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676), retrieved 2026-07-05). What makes a grammar work is that each slot draws from a small enumerated list (Primer's `default | muted | emphasis`; Atlassian's emphasis ladder `subtlest → subtler → subtle → (default) → bold → bolder`), so any name can be parsed — and generated — mechanically.
- **The property-anchored ↔ role-anchored spectrum.** Primer anchors on the CSS property (`--fgColor-default`); Atlassian and Polaris anchor on the painted element within a category namespace (`color.text.subtle`, `--p-color-bg-fill-brand-hover`); Carbon leads with the element/role (`$text-primary`); Material wraps roles in a namespace+tier prefix (`md.sys.color.on-surface`); shadcn strips everything to a flat role (`--primary`). Verbosity buys parseability; flatness buys memorability. Mid-spectrum (category + property + role) is the mainstream choice for multi-tier systems.
- **Contrast pairing in the name.** At least four systems converged independently on paired foreground tokens: Material's `on-X` (`on-primary`, `on-surface`), shadcn's `X`/`X-foreground`, Polaris's `text-…-on-bg-fill`, Primer's `fgColor-onEmphasis`. The name itself becomes a contrast contract that a linter or LLM can verify without design judgment.
- **States are name suffixes, derived not hand-picked.** Atlassian pairs every interactive appearance with `.hovered`/`.pressed`; Carbon goes further and defines the *math* (`-hover` = ½ step, `-active` = 2 steps on the primitive scale), making state tokens derivable.
- **Adjectives for roles, numbers only for ordered scales — and gap the numbers.** Carbon's v10→v11 rename of `$ui-01`/`$text-01` into role adjectives forced an ecosystem-wide migration; Polaris's gapped base-4 space scale (`space-025` = 1px … `space-100` = 4px … `space-3200`) leaves room to insert steps without renaming anything.
- **One grammar, projected per surface.** The DTCG format constrains names (no leading `$`, no `{`, `}`, or `.` inside a token name, since those are reserved for properties and references — [Design Tokens Format Module](https://www.designtokens.org/tr/drafts/format/), [issue #60](https://github.com/design-tokens/community-group/issues/60), retrieved 2026-07-05), and each surface has its own delimiter (Figma `/`, DTCG `.` between groups, CSS `-`). Best practice is a single canonical path plus purely mechanical, segment-preserving transforms — never a second hand-maintained spelling.
- **AI legibility: predictability beats cleverness.** shadcn's ~30-name vocabulary is generated correctly by every code model because it is tiny, flat, and training-saturated; Atlassian measured 52% accuracy gains from machine-readable token docs; Spectrum spells out sizes (`extra-large`, `2x-large`) because abbreviation collisions are an agent-parsing hazard. A name an agent can *derive* (rest token → hover token, bg token → on-token) is worth more than a name a human finds elegant.

## 3. How the major systems do it

Full grammars with decomposed examples live in each dossier's §3 (Naming); this table is the side-by-side.

| System | Anchor | Grammar | Example | Load-bearing lesson |
|---|---|---|---|---|
| [Atlassian](../systems/atlassian.md) | role, in category namespace | `[foundation].[property].[role].[emphasis].[state]` | `color.background.brand.bold.hovered` | Emphasis ladder + state suffixes = derivable names; **but** the CSS var drops the foundation segment (`--ds-background-brand-bold-hovered`) — the two-grammar trap Ply must not repeat |
| [Primer](../systems/primer.md) | CSS property | `[prefix]-[namespace]-[pattern]-[variant]-[property]-[variant]-[scale]`, camelCase segments | `--fgColor-muted`, `button-primary-bgColor-hover` | Closed modifier vocabularies (`default\|muted\|emphasis`); the v8 rename needed mapping tables + fallback chains + a VS Code extension |
| [Carbon](../systems/carbon.md) | element/role | `[element]-[role]-[order]-[state]` | `$text-primary`, `$layer-hover-01`, `$text-on-color` | Adjectives for roles, numbers only for layer order — bought with the costly v10→v11 rename of `$ui-01`-style numbered tokens |
| [Material](../systems/material.md) | role, tier-prefixed | `{ns}.{tier}.{domain}.{role}[.{property}][.{state}]` | `md.sys.color.on-surface` | `on-X` pairing guarantees contrast by construction; platform translation is lossy by design (four spellings of `primary`) |
| [Polaris](../systems/polaris.md) | painted element | `--p-{group}-{element}-{role}-{prominence}-{state}` | `--p-color-bg-fill-brand-hover`, `--p-color-text-brand-on-bg-fill` | Gapped numeric space scale (`space-100` = 4px); `on-bg-fill` pairing; descriptions shipped as token data |
| [Spectrum](../systems/spectrum.md) | flat kebab, no tier prefix | `[component-]concept-property[-state\|-size]` | `accent-background-color-default`, `-down`, `-key-focus` | Flat names needed a whole `token-names` taxonomy package to recover structure; sizes spelled out (`2x-large`) |
| [shadcn/ui](../systems/shadcn-radix.md) | bare role | `--{surface}` / `--{surface}-foreground` | `--primary` / `--primary-foreground` | ~30 flat names fit in an LLM's working memory — the most training-saturated convention alive |

## 4. Recommendation for Ply

**Adopt a position-based, role-anchored grammar with closed vocabularies per slot:**

```
color:      color.{property}.{role}[.{emphasis}][.{state}]
dimension:  {category}.{step}            # gapped numbers for math scales
            {category}.{size}            # spelled-out adjectives for T-shirt scales
```

- **property** ∈ `bg | text | icon | border | shadow` — element-first, per Polaris/Carbon.
- **role** ∈ `neutral | surface | accent | success | warning | danger | info` (+ `on-{role}[-emphasis]` paired foregrounds under `text`/`icon`, per Material/shadcn convergence).
- **emphasis** ∈ `subtle | (default, unsuffixed) | bold` — Atlassian's ladder, trimmed; grow toward `subtlest`/`bolder` only when needed.
- **state** ∈ `hovered | pressed | focused | selected | disabled` — past-tense, matching React Aria's `data-hovered`/`data-pressed` styling hooks (see [Spectrum §5](../systems/spectrum.md)).
- **space** uses Polaris-style gapped base-4 numbers (`100` = 4px); **radius** uses spelled-out sizes (never `xs`/`xl`), per Spectrum.

Example tokens spanning the tiers:

| Canonical (DTCG path) | Meaning |
|---|---|
| `color.bg.surface` | default page/card surface |
| `color.bg.accent.bold` | high-emphasis brand fill (buttons) |
| `color.bg.accent.bold.hovered` | its hover state — derivable by suffix |
| `color.bg.danger.subtle` | low-emphasis destructive background |
| `color.text.on-accent-bold` | guaranteed-contrast text on `bg.accent.bold` |
| `color.text.subtle` | secondary text |
| `color.border.focused` | focus ring color |
| `space.100` / `space.400` | 4px / 16px (gapped, insertable) |
| `radius.medium` / `radius.full` | corner radii |

**Deterministic projection — one grammar, four spellings, zero information loss:**

| Surface | Rule | `color.bg.accent.bold.hovered` becomes |
|---|---|---|
| DTCG path | segments joined with `.` (group nesting); segments never contain `.`, `{`, `}`, or a leading `$` | `color.bg.accent.bold.hovered` |
| Figma variable | replace `.` with `/`; top-level segment = collection | `color/bg/accent/bold/hovered` |
| CSS custom property | `--ply-` + segments joined with `-` | `--ply-color-bg-accent-bold-hovered` |
| TypeScript | typed `token('…')` over the literal DTCG path (Atlassian-style autocomplete), plus a generated camelCase constant | `token('color.bg.accent.bold.hovered')` / `colorBgAccentBoldHovered` |

Two invariants make this safe: **never drop or reorder a segment** in any projection (Atlassian's `color.background.selected.bold` → `--ds-background-selected-bold` segment-dropping is the named anti-pattern), and **multi-word segments (`on-accent-bold`) are only legal if every word comes from the closed vocabularies**, so a hyphen-joined CSS name re-tokenizes unambiguously against the enum lists.

**Trade-off accepted:** these names are longer and less training-saturated than shadcn's `--primary`. Ply accepts the verbosity because the tier structure, derivable states, and lossless four-surface projection are what the agentic pipeline needs; if generation accuracy suffers, emit an optional shadcn-compatible alias layer (`--ply-surface-foreground` → `color.text.on-surface`) at build time rather than flattening the source. The Phase 3 taxonomy ADR should take this grammar, its vocabularies, and the projection invariants as its starting position.

> **Adopted — ADR-0005 (2026-07-05), which modifies this section.** The accepted grammar departs from the above in three ways, per the advisor evaluation (`kb/comparisons/2026-07-05-token-path-grammar.md`) and maintainer decisions: (1) the `color.` category segment is **dropped everywhere** — properties are top-level (`bg/accent`, `text/on-accent`), with `font/*` permanently reserved for typography; (2) emphasis and state **join the leaf with hyphens** (`bg/accent-hovered`), never as child path levels — invariant: no token path may be a path-prefix of another; (3) status roles keep a sub-namespace (`bg/status/danger-subtle`). The ladder ships as `subtle | default (unsuffixed) | bold`. Example projection: `bg/status/danger-subtle-hovered` → `bg.status.danger-subtle-hovered` → `--ply-bg-status-danger-subtle-hovered`. ADR-0005 is canon wherever this section disagrees.

> **Superseded — ADR-0007 (2026-07-05).** After real use, the maintainer reversed ADR-0005: Ply mirrors the reference library's naming verbatim — nested semantic paths (`background/neutral/subtle/hovered`), six-rung ladder (`subtlest…boldest`), `/default` leaves where the reference has them, and the reference's collection set (incl. `colors-brand` and the 3-mode `font-family` axis). Contrast value fixes were kept; only names reverted. ADR-0007 is canon wherever ADR-0005 or this section disagrees.

## 5. Sources

- Nathan Curtis, [Naming Tokens in Design Systems](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676) — levels framework, ordering observations (retrieved 2026-07-05)
- [DTCG Design Tokens Format Module (2025.10 draft)](https://www.designtokens.org/tr/drafts/format/) and [design-tokens/community-group#60](https://github.com/design-tokens/community-group/issues/60) — name character restrictions (retrieved 2026-07-05)
- All per-system claims: dossiers in [`kb/systems/`](../systems/) §3 (Naming) and §8 (Steal/avoid), each with primary citations retrieved 2026-07-05
