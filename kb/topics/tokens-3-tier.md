---
title: Three-tier token architecture
updated: 2026-07-05
---

# Three-tier token architecture

## 1. The question this answers

How should Ply layer its tokens — what belongs in the primitive, semantic, and component tiers (and what must not), how aliasing flows between tiers, when a component token is worth minting, how interaction states and light/dark modes fit into the tiers, and how the whole structure is expressed in DTCG JSON.

## 2. Current best practice (as of 2026)

The three-tier model is the settled consensus; only the labels vary — Material's *reference/system/component*, Spectrum's *global/alias/component-specific*, Primer's *base/functional/component*, Nathan Curtis's *generic/semantic/component* ([Naming Tokens in Design Systems](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676), retrieved 2026-07-05). What each tier is for:

- **Tier 1 — primitives.** Raw, context-free values: color ramps, spacing/type scales, duration steps (`gray-900`, `space-400`). Named by *what they are*, never by use. Must NOT contain: mode-dependent values, usage meaning, or aliases (primitives are the leaves of the graph). Product code never consumes them directly — Primer's hard rule is "Never use raw values… Only use semantic tokens" (see systems/primer.md §2).
- **Tier 2 — semantic.** Purpose-named decisions (`text-primary`, `surface-raised`, `border-focus`), each an alias onto a primitive *per mode*. This is the workhorse and the only sanctioned consumption layer — Spectrum literally documents alias tokens as "the recommended type to use when building your product" (systems/spectrum.md §2). Must NOT contain: raw values (modes may only re-point semantic → primitive; see systems/polaris.md §2 on themes as partial overrides) or value-based names (`text-gray` is a primitive wearing a costume).
- **Tier 3 — component.** Tokens scoped to one component's anatomy (`button-primary-bgColor-hover`), which "should never be reused elsewhere" (systems/carbon.md §2). Must NOT hold raw values or know about modes — Material's rule is that component tokens only point at system tokens, which point at reference tokens (systems/material.md §2).

**Aliasing rules.** The chain is component → semantic → primitive. Two clarifications on "skipping":
- Component *CSS* referencing semantic tokens directly — i.e., not minting a tier-3 token at all — is not skipping; it is the default posture. Atlassian ships no formal component tier at all, only documented "recipes" composed of semantic tokens (systems/atlassian.md §2).
- A component *token* aliasing a primitive directly is a defect: it bypasses mode remapping, so the component breaks in dark mode. If a value seems to have no semantic home, the semantic tier is missing a concept — add one. Semantic → semantic aliases are fine (Primer's per-mode extend/override does this; systems/primer.md §2).

**When to mint a component token** (the tier-3 explosion problem). The spectrum of outcomes:

- **Material** generates its exhaustive `md.comp.*` set into the thousands — Angular Material alone exposes 800+ component tokens — flagged "unmaintainable solo" (systems/material.md §2, §8).
- **Polaris** is the opposite failure: ~4 component aliases, so every component decision hides in CSS, invisible to Figma and to agents (systems/polaris.md §2, §8).
- **Primer** is the lean middle: tier 3 "reserved for component CSS when functional tokens don't suffice" (systems/primer.md §2).

Mint a component token only when (a) the value is a genuine per-component design decision no semantic token expresses, or (b) you deliberately want a public per-component override surface (Material Web's scoped `--md-filled-button-*` pattern). If the same decision recurs across two or more components, promote it to semantic instead — recurrence is evidence of a missing semantic concept, not a component quirk.

**States.** Interaction states are name suffixes on tier 2/3, never new primitives. Two schools: Carbon derives state values deterministically from the primitive scale (`-hover` = ½ step, `-active` = 2 steps, `-selected` = 1 step; systems/carbon.md §2); Atlassian enumerates paired names — every interactive appearance ships matching `.hovered`/`.pressed` tokens, so agents derive a hover token from a rest token without lookup (systems/atlassian.md §3). These compose: enumerate Atlassian-style names in the token set, generate their values with Carbon-style math at build time.

**Modes are orthogonal to tiers.** A mode (light/dark, contrast, density) does not add a tier; it swaps which primitive each semantic token resolves to, leaving names and structure untouched (systems/material.md §2 "mode = re-mapping, not re-authoring"; Spectrum encodes this as `sets: {light, dark}` on one token record, systems/spectrum.md §2). Primitives are immutable across modes.

**DTCG.** The Design Tokens format reached its first stable version, 2025.10, on 2025-10-28, covering groups, aliases, theming, and modern color spaces, with Figma, Style Dictionary, Tokens Studio, Penpot and others implementing it ([W3C DTCG announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/); [Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/), retrieved 2026-07-05). The spec has no "tier" concept — tiers are a convention you encode via group nesting plus `{curly.brace}` aliases:

```json
{
  "primitive": { "gray": { "900": { "$type": "color", "$value": "#171717" } } },
  "semantic":  { "text": { "primary": { "$value": "{primitive.gray.900}" } } },
  "component": { "button": { "label-color": { "$value": "{semantic.text.primary}" } } }
}
```

The alias graph *is* the tier structure, which means the component → semantic → primitive rule is mechanically lintable in a Style Dictionary build.

## 3. How the major systems do it

| System | Tiers | Component tier | States | Dossier |
|---|---|---|---|---|
| Material 3 | `md.ref` / `md.sys` / `md.comp`, strict alias chain | Thousands of generated tokens; 800+ in Angular alone | State-layer opacity tokens (`md.sys.state.*`) | systems/material.md §2 |
| Carbon | Raw palettes / ten core groups / component tokens | Present but scoped ("never be reused elsewhere") | Deterministic scale math (½/1/2 steps) | systems/carbon.md §2 |
| Primer | base / functional / component | Lean, "when functional tokens don't suffice" | Suffixes (`-hover`, `-rest`) on tiers 2–3 | systems/primer.md §2 |
| Atlassian | Private base palette / semantic only | None published — semantic "recipes" instead | Paired `.hovered`/`.pressed` for every appearance | systems/atlassian.md §2–3 |
| Spectrum | global / alias / component-specific, explicitly documented | ~73 color-component vs ~170 alias tokens | Suffixes incl. `-down`, `-key-focus`; modes as `sets` | systems/spectrum.md §2 |
| Polaris | 16-step primitives (never exported) / semantic / — | Barely exists (~4 space aliases) — an anti-pattern | Suffixes (`-hover`, `-active`) | systems/polaris.md §2, §8 |
| shadcn/ui | **Two tiers**: Tailwind palette as de facto primitives, ~30 flat semantic vars | Single `--sidebar-*` cluster | Handled in component classes, not tokens | systems/shadcn-radix.md §2 |

The instructive extremes: Material proves the model's correctness and its cost at full generality; shadcn proves a tiny flat semantic layer is what agents generate best, but its missing primitive tier makes rebranding a regenerate-everything operation (systems/shadcn-radix.md §8 explicitly warns Ply off the two-tier source model); Atlassian and Polaris show a system can thrive with *no* formal tier 3 — but Polaris shows the decisions then hide where no tool can see them.

## 4. Recommendation for Ply

**Default: three tiers in the DTCG source, semantic-first consumption, tier 3 starts empty.**

- **Tier 1** `primitive.*` — one Figma collection, no modes, reference-only (not part of the shipped CSS contract). In the Phase 3 migration, fold the existing library's "brand" collection into this tier: brand ramps are primitives; brand *choices* ("Ply's accent is iris") are semantic aliases. The current ~2.5-tier shape (primitives + brand + semantic) is really primitives × 2 + semantic — merging brand into tier 1 yields clean tiers without renaming the semantic layer.
- **Tier 2** `semantic.*` — the only layer component CSS may reference. Light/dark live here as Figma variable modes (Professional allows up to 10 modes per collection — room for a future contrast or density axis without restructuring; [Figma: Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables), retrieved 2026-07-05). States are suffixed names (`-hover`, `-pressed`) whose values a build script may derive Carbon-style.
- **Tier 3** — mint per the two criteria in §2 only, and export every one to DTCG/Figma when minted (Polaris's invisible component decisions are the failure mode). Heuristic budget: a component needing more than ~5 tokens signals a missing semantic concept, not a bigger tier 3.
- **Enforce the chain in the Style Dictionary v4 build**: component tokens may alias only semantic; semantic only primitive (or semantic); raw values only in tier 1; every semantic token resolves in both modes. All four checks are pure JSON traversal — cheap for a solo maintainer, and they keep agent-generated tokens sane.
- **Keep tiers in the source, not in shipped names.** Encode tier via DTCG group nesting; emit short, flat CSS names (`--ply-text-primary`, not `--ply-semantic-color-text-primary`). Material's `md.sys` infix is platform noise (systems/material.md §8), and shadcn shows compact flat vocabularies are what LLMs generate most reliably (systems/shadcn-radix.md §8). The JSON structure carries the tier; the emitted name carries the decision.

**Trade-off accepted:** with tier 3 nearly empty, Ply has no per-component theming surface out of the box — restyling one component means either editing its CSS or minting a token first, and some values take an extra alias hop that a flat system would hard-code. That is the right price for a token set one person can govern and an agent can hold in context; Material demonstrates where the opposite trade leads.

## 5. Sources

Beyond the `systems/` dossiers (all retrieved 2026-07-05):

- [Design Tokens specification reaches first stable version](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) — W3C DTCG, 2025-10-28 (retrieved 2026-07-05)
- [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/) — groups, aliases, types (retrieved 2026-07-05)
- [Nathan Curtis — Naming Tokens in Design Systems](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676) — generic/semantic/component taxonomy (retrieved 2026-07-05)
- [Nathan Curtis — Reimagining a Token Taxonomy](https://medium.com/eightshapes-llc/reimagining-a-token-taxonomy-462d35b2b033) — tier levels in practice (retrieved 2026-07-05)
- [Figma — Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables) — per-plan mode limits (retrieved 2026-07-05)
