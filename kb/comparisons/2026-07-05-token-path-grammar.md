---
title: Token path grammar for the three tiers
updated: 2026-07-05
---

**Proposal evaluated:** adopt `{category}/{step}` (tier 1), `{property}/{role}[/{emphasis}][/{state}]` (tier 2), `{component}/{property}[/{variant}][/{state}]` (tier 3) as Figma variable paths, with Atlassian-style closed vocabularies (emphasis ladder `subtlest…bolder`, states `hovered|pressed|focused|disabled|selected`). Asked by the maintainer ahead of the Phase 3 token-taxonomy ADR; evaluated by the design-advisor agent.

---

# Verdict

Adopt a modified version: the words, order, and closed vocabularies are right, but the grammar as written is structurally invalid DTCG (a rest token `bg/accent` and its child `bg/accent/hovered` cannot coexist as JSON keys), the emphasis ladder should ship trimmed to three rungs, and the on-* rule should be scoped to filled backgrounds with a contrast lint covering everything else.

# Recommendation

**Canonical grammar (one spelling, four projections, no segment ever dropped):**

```
Tier 1  {category}/{step}                          blue/500, gray/alpha/400, space/400
Tier 2  {property}/{role}[-{emphasis}][-{state}]   bg/accent, bg/danger-subtle, text/on-accent
Tier 3  {component}/{property}/{variant}[-{state}] button/bg/primary-hovered
```

The one structural change from the proposal: **modifiers (emphasis, state) join the leaf with hyphens instead of opening new path levels.** The proposal's `bg/accent` + `bg/accent/hovered` requires `accent` to be simultaneously a token and a group — impossible in DTCG JSON (an object can't have `$value` and child tokens under the same key; see the format constraints cited in `kb/topics/naming.md` §2). Every system that nests states deeper either has a bespoke non-DTCG pipeline (Atlassian, Polaris) or spells an explicit `default` leaf (Spectrum's `accent-background-color-default`, Primer's `fgColor-default`) — and an explicit `-default` suffix is a hallucination trap for Tailwind-conditioned agents, which will emit the bare name. Hyphenated leaves give you bare rest names (`--ply-bg-accent`), valid DTCG (`bg.accent-hovered`), and clean Figma grouping under one `bg/` folder. Add the missing invariant to the ADR: **no token path may be a path-prefix of another token path** (lintable in one JSON traversal). The KB's existing invariant already blesses multi-word hyphenated segments when every word comes from a closed vocabulary (`on-accent-bold`), so re-tokenization stays deterministic.

**Projection table:**

| Surface | `bg/accent-hovered` becomes | Rule |
|---|---|---|
| Figma variable | `bg/accent-hovered` (collection `color-semantic`) | authored, or derived — see below |
| DTCG | `bg.accent-hovered` in `tokens/semantic/color.*.json` | tier = file membership + `$extensions.ply.figma.{collection,mode}` |
| CSS | `--ply-bg-accent-hovered` | prefix + join all segments with `-` |
| TS | `token('bg.accent-hovered')` | typed literal over the DTCG path |

**The four sub-questions, decisively:**

**(1) `bg`/`text` — yes, and drop the `color/` category segment too (a deliberate departure from `kb/topics/naming.md` §4).** `bg` and `text` are the two most training-saturated property words in existence via Tailwind utilities (`bg-*`, `text-*`), and Polaris uses exactly this element-first set (`bg`, `text`, `icon`, `border`). Spectrum's abbreviation warning targets ambiguous size abbreviations (`xl`), not saturated unambiguous ones. But abbreviate nothing else: `border`, `icon`, `shadow`, `hovered`, `subtle` stay full words; never `txt`, never bare `fg` (Ply anchors on painted element, not CSS property). On the `color.` prefix: naming.md's own anti-pattern is Atlassian's *inconsistent* dropping of it (`color.background.selected.bold` → `--ds-background-selected-bold`); keeping it everywhere makes every CSS var a segment longer for zero decision information. Drop it everywhere, consistently. The price is a permanent namespace commitment: **typography lives under `font/*`** (Atlassian precedent: `font.heading.large`), never `text/*`; any future border-width scale gets its own `border-width/*` category. Bonus: the existing library (`background/accent`, `text/subtle`) already has no `color/` segment, so migration is `background/*` → `bg/*` plus vocabulary renames — the smallest possible diff.

**(2) Collection/file membership only — no `sys/` or tier prefix in any name.** This is settled in `kb/topics/tokens-3-tier.md` §4 ("keep tiers in the source, not in shipped names") and `kb/systems/material.md` §8 (the `md.sys` infix is "platform noise"). Concretely: tier-1 lives in the primitive collections (single-mode), tier-2 in `color-semantic` (Light/Dark — Figma Professional allows 10 modes per collection, verified today, so a contrast axis fits later), tier-3 in a `component` collection when first minted. In DTCG you don't even need tier wrapper groups: tier-1 top-level groups are hue/scale names (`blue`, `gray`, `space`), tier-2 are property names (`bg`, `text`, `icon`, `border`), tier-3 are component names (`button`) — three disjoint reserved namespaces, enforced by a lint (no semantic property may equal a component name), so `{blue.500}` aliases resolve without a `primitive.` prefix and no strip-transform ever runs. Primitives are never emitted to CSS at all.

**(3) Trimmed ladder: `subtle | (default, unsuffixed) | bold` — not the full six.** This is the incumbent naming.md recommendation and it's correct. Atlassian's six rungs serve 20+ products and 10 decorative accent hues; even their text roles use only three of the six. Primer runs all of GitHub on exactly three (`muted | default | emphasis`). Every extra rung costs 2 modes × states × contrast-lint pairings of hand-tuned values for one maintainer. The ladder grows *outward* (`subtler`, `subtlest`, `bolder` extend the ends), so adding rungs later is purely additive — no renames ever, unlike inserting into a T-shirt scale. Record the ladder order in `$extensions.ply.emphasisLadder` so agents know it's ordered and extensible. Also fix the semantics: unsuffixed `bg/accent` should be the solid brand fill (the thing you usually want — matching shadcn `--primary` usage), with `bg/accent-subtle` the tint; don't copy Atlassian's `.bold`-is-the-button convention.

**(4) Modified hard rule: every *solid/filled* background must mint `text/on-{role}`; every background of any kind must declare a legal foreground pairing that a contrast lint verifies in both modes.** Precedents converge on pairing fills: Material's `on-X`, shadcn's `X-foreground`, Polaris's `text-brand-on-bg-fill` (note: *on-bg-fill* — Polaris only pairs fills), and Primer's pairing matrix, which is the model to copy: `bgColor-*-emphasis` pairs with `fgColor-onEmphasis`, but `bgColor-*-muted` pairs with the ordinary semantic foregrounds (`kb/systems/primer.md` §2). Minting `text/on-danger-subtle` that resolves identically to `text/danger` creates agent ambiguity (two names, one value, no selection criterion) and token bloat. So: `bg/accent` → `text/on-accent` (mandatory, plus `icon/on-accent` as an alias when needed); `bg/danger-subtle` → `$extensions.ply.pairsWith: ["text.danger", "text.default"]`; build step runs WCAG 4.5:1/3:1 checks over every pairing in light *and* dark. That is the machine-verifiable contract the KB calls for, without the duplicates. (Honest nuance: shadcn pairs even muted surfaces — but `--muted-foreground` is a genuinely distinct value doing the job of `text/subtle`, which Ply already has.)

**Also fold in:** radius as spelled-out consumable sizes (`radius/small…full`), not the proposal's numbered `radius/200` — radius isn't a math scale, `full` breaks the arithmetic anyway, and naming.md/Spectrum both say spell sizes out. Space stays numbered/gapped (`space/400` = 16px, Polaris base-4) and is consumed directly — dimension scales are mode-independent, so the "never consume primitives" rule is relaxed here exactly as Atlassian and Polaris do. States should be **derived at build time by default** (Carbon math per mode) with Figma-authored `bg/accent-hovered` variables as optional overrides — the KB's stated synthesis ("enumerate Atlassian-style names, generate values with Carbon-style math," `kb/topics/tokens-3-tier.md` §2) — which also keeps state noise out of the Figma picker. Fold `colors-brand` into `color-primitives` (brand ramps are primitives; "Ply's accent is iris" is the semantic alias) — but only via a binding-preserving path; collection *renames* are free, collection *merges* are the risky operation to verify first.

# What the top systems do

- **Polaris** is the closest existing grammar to this proposal: element-first `bg | text | icon | border`, prominence infix, state suffix, `on-bg-fill` pairing *for fills only*, gapped base-4 space — but keeps a `color-` group prefix because its `text` group is typography; Ply avoids that by reserving `font/*` (`kb/systems/polaris.md` §3, §8).
- **Atlassian** proves the derivable-modifier thesis (emphasis ladder + paired `.hovered`/`.pressed`, 52% measured AI-accuracy gains from machine-readable token surfaces) and also the named anti-pattern: its CSS vars drop the `color.` segment its JS names keep — two grammars for one token (`kb/systems/atlassian.md` §3, §8).
- **Primer** ships a three-rung emphasis vocabulary and a fg/bg pairing *matrix* as data, spells `default` explicitly, and stores Figma collection/mode/scopes in `$extensions` — the sync-metadata pattern Ply should copy verbatim (`kb/systems/primer.md` §2–3).
- **Material and shadcn** bound the tier-prefix question: `md.sys.` infix is flagged platform noise even by Google's own web output, while shadcn's ~30 flat unprefixed names are the most reliably AI-generated convention alive — Ply's answer (tier in source structure, flat emitted names) takes both lessons (`kb/systems/material.md` §8, `kb/systems/shadcn-radix.md` §3).

# Alternatives considered

- **Keep the `color/` category segment everywhere (the current naming.md §4 position).** Self-consistent and future-proof against a `text/*` typography collision — but it lengthens every color var by a segment that carries no decision, drifts from the Tailwind-shaped names agents emit unprompted, and enlarges the Figma migration. Killed by: the collision it guards against is cheaply prevented by reserving `font/*`. This is the one place the advisor overrules the KB; naming.md should be updated to match the ADR.
- **Explicit `default` state leaf (`bg/accent/default` + `bg/accent/hovered`), Spectrum/Primer style.** Solves the DTCG prefix collision with deeper, prettier Figma grouping — killed by the agent failure mode: models conditioned on `bg-accent`-shaped names will emit the bare name, which wouldn't exist, producing silently-broken `var()` references. Bare rest names are the safer default; this is the documented fallback if leaf-hyphenation proves unpleasant in the Figma picker.
- **Full shadcn flat vocabulary (`--primary`, `--primary-foreground`) as the source grammar.** Maximum training saturation — killed by the two-tier trap: no primitive layer means rebranding is a regenerate-everything operation, and Ply's Figma-sourced, mode-mapped pipeline needs the tiers (`kb/systems/shadcn-radix.md` §8 warns Ply off explicitly). Mitigation already planned: an optional shadcn-compatible alias layer emitted at build.

# Risks & revisit triggers

- **`bg/accent-hovered` group/leaf split feels wrong in the Figma picker** (long flat lists under `bg/`). Mitigated by deriving states at build so Figma barely contains them; if designers end up authoring many state overrides, revisit the `default`-leaf alternative — before Phase 4, since it changes DTCG paths.
- **Typography arrives and someone reaches for `text/*`.** The `font/*` reservation must be written into the ADR and the reserved-namespace lint on day one, or the dropped `color` segment becomes a real ambiguity.
- **Figma's native DTCG variable export ships** (announced at Schema 2025 per the KB; could not re-verify today — search quota). If its exporter mangles or forbids certain path shapes, align Ply's leaf-hyphenation convention to whatever it round-trips losslessly; the `$extensions.ply.figma` metadata keeps the migration mechanical.
- **The DTCG Resolver Module leaves draft** — adopt its sets/contexts shape for the light/dark files then; the two-file layout already matches it.
- **Emphasis ladder pressure**: if more than ~2 roles need a fourth rung, grow outward (`subtlest`/`bolder`) — additive, no renames; that's the designed escape valve, not a failure.

# Confidence

**High** on all four sub-answers and the leaf-hyphenation fix (the DTCG prefix collision is a structural fact, not a judgment call). The one **medium**-confidence element is dropping the `color/` segment against the incumbent KB recommendation — it trades a small permanent namespace discipline for shorter, more agent-native names; if the ADR authors weigh the typography-collision risk more heavily, keeping `color/` everywhere is the only acceptable variant (never the drop-it-in-CSS hybrid).

# Sources

Beyond the KB (all KB files updated/retrieved 2026-07-05):

- [Figma plans & features (variable mode limits)](https://help.figma.com/hc/en-us/articles/360040328273) — Professional = 10 modes/collection, Organization = 20, Enterprise unlimited (retrieved 2026-07-05; confirms the claim in `kb/topics/tokens-3-tier.md`)
- [Figma: Modes for variables](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables) — mode mechanics, plan-dependence (retrieved 2026-07-05)
- All other claims: `kb/topics/naming.md`, `kb/topics/tokens-3-tier.md`, `kb/topics/theming.md`, `kb/topics/agentic-ds.md`, and `kb/systems/{atlassian,material,polaris,primer,shadcn-radix}.md`, each carrying primary citations retrieved 2026-07-05. Web re-verification beyond Figma limits was blocked by a search quota; given the KB's same-day freshness, no contradiction risk was left unchecked that the ADR needs to wait on.

**KB corrections to file with this decision** (when the Phase 3 taxonomy ADR is accepted): update `kb/topics/naming.md` §4 — canonical grammar loses the `color.` segment; projection table and "top-level segment = collection" rule reworked; add the "no token path is a prefix of another token path" invariant and the `font/*` reservation; note the Figma mode-limit claim is now verified.
