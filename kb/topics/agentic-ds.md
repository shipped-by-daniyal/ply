---
title: Agentic design systems
updated: 2026-07-05
---

# Agentic design systems

*This is Ply's signature topic — the thesis the whole project tests: a design system is only as good as the worst of its three consumers, and in 2026 the third consumer is an AI agent.*

## 1. The question this answers

What makes a design system **consumable and maintainable by AI agents** — and which of those properties Ply must build deliberately rather than hope to inherit? "Consumable" means an agent can pick the right token, generate a correct component call, and check its own work without hallucinating. "Maintainable" means agents can also *update* the system — sync tokens, regenerate docs, refactor usages — without corrupting it.

## 2. Current best practice (as of 2026)

### The evidence base

This stopped being speculation in 2025–26; it now has measured numbers:

- **Atlassian** shipped DESIGN.md, llms.txt, an ADS MCP server, and agent skills, and reported **52% accuracy improvement in AI calls, 34% faster ADS tasks, 26% fewer tool calls, 16% lower token usage** — plus a Figma-mockup-to-production-React redesign in ~20 minutes ([context engine post](https://www.atlassian.com/blog/ai-at-work/atlassian-design-system-building-the-context-engine-for-the-ai-era), retrieved 2026-07-05; see `systems/atlassian.md` §7).
- Atlassian then **benchmarked delivery formats against each other**: static DESIGN.md (a portable Markdown format originated by Google for Stitch) consumed ~92% more tokens than their MCP server with 2.7× higher run variance, because all-at-once context loading loses to on-demand retrieval; static files also teach agents to *re-implement* the system instead of reusing components ([DESIGN.md analysis](https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice), retrieved 2026-07-05). Lesson: ship the cheap static layer *and* a queryable layer; don't stop at the static one.
- **Adobe** publishes `@adobe/spectrum-design-data-mcp` plus per-page markdown and Agent Skills (see `systems/spectrum.md` §7); **Shopify** pitched the Shopify.dev MCP server as the way to build with Polaris web components at GA (see `systems/polaris.md` §7); **Meta** shipped Astryx, a design system built for AI coding agents with its own MCP server, in June 2026 ([TechTimes](https://www.techtimes.com/articles/319202/20260627/metas-astryx-gives-ai-coding-agents-design-system-they-can-actually-read.htm), retrieved 2026-07-05, paywalled — headline claim only).
- **shadcn's registry became the de-facto AI distribution format**: published JSON Schemas per item, an MCP server that browses/installs from any registry, and since June 2026 *any public GitHub repo is a registry* — v0, Bolt, Lovable, and Cursor all emit shadcn conventions by default (see `systems/shadcn-radix.md` §7).
- **Figma's MCP server + Code Connect** closed the design-side loop: agents read variables, component structure, and code mappings directly, and write designs back ([Figma MCP docs](https://developers.figma.com/docs/figma-mcp-server/), retrieved 2026-07-05). Teams with well-structured files see dramatic gains; disorganized files see marginal ones ([2026 field guide](https://baeseokjae.github.io/posts/figma-mcp-design-to-code-2026/), retrieved 2026-07-05) — the leverage is in the system, not the tool.
- Format matters measurably: Indeed's benchmarking found markdown docs cost ~30k tokens per query at 82% coverage *with hallucinations*, while structured JSON delivered ~80% fewer tokens at higher accuracy ([Into Design Systems](https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents), retrieved 2026-07-05).

### The five layers of AI consumability

**(a) Data — tokens as structured, self-describing JSON.** The DTCG format reached its first stable version in Oct 2025 ([Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/); [announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/), retrieved 2026-07-05), so there is now exactly one right answer for the source format. Best practice embeds *usage* in the data:

- `$description` carries the one-line role ("token = role" statements, Carbon-style);
- `$extensions` carries machine-checkable rules — pairing constraints (Primer's fg/bg matrix), deterministic state math (Carbon's hover = ½ step on the scale), deprecation/rename maps and stable IDs (Spectrum's `uuid` + `renamed`);
- a rule an agent can *check* is worth ten paragraphs an agent must *interpret*.

Acceptance test: an agent given only the token JSON can pick the right token for "destructive button background, hovered" — and a script can prove it picked legally.

**(b) Docs — docs-as-data over docs-as-prose.** llms.txt went from proposal to near-mainstream in developer-facing tooling by 2026, with the frontier moving toward per-page machine-readable context ([State of llms.txt 2026](https://presenc.ai/research/state-of-llms-txt-2026), retrieved 2026-07-05). Best practice:

- every docs page also available as raw markdown (llms.txt as the index);
- predictable per-page structure — same headings on every component page, so agents learn the schema once and navigate by convention;
- reference content (props, tokens, statuses) *generated* from source data; prose reserved for rationale humans actually wrote.

Acceptance test: `curl` any docs URL and get usable content. The anti-pattern is Material's JS-rendered SPA — the world's largest design system returns empty bodies to non-browser fetchers (`systems/material.md` §8).

**(c) Distribution — registries, MCP servers, design↔code maps.** Three complementary channels, not alternatives:

- a **schema'd registry** makes a component a self-describing payload (source + deps + tokens + install target) an agent can fetch, reason about, and apply without a build step — shadcn's `registry-item.json` is the de-facto schema;
- an **MCP server** provides on-demand retrieval, which beats static context on token cost, accuracy, and variance (Atlassian's measurement above);
- **Code-Connect-style mappings** tie design components to code components so design context arrives as *your* component call, not regenerated divs — Carbon auto-publishes its mappings from CI so they cannot drift (`systems/carbon.md` §7).

**(d) Conventions — training-data-familiar beats novel.** Agents complete shadcn's `--primary`/`--primary-foreground` pairing and CVA `variant`/`size` grammar from memory because millions of repos use them; a bespoke grammar forces per-token lookup and invites hallucination. Familiarity is a measurable asset:

- prefer conventions that saturate training data: small flat vocabularies, `on-X`/`-foreground` contrast pairs, enum props (`variant`/`tone`/`size`) over boolean soup;
- when diverging, make the novel grammar *deterministic*, so an agent can derive names instead of recalling them — Atlassian's emphasis ladder + state suffixes let an agent construct the hover token from the rest token with zero lookups (`systems/atlassian.md` §8).

**(e) Maintenance — the system must survive its agents.** Five practices recur across the systems that work:

- **idempotent update commands** — re-run on a clean state produces zero changes, so automation is safe to re-fire;
- **drift detection as a scheduled audit**, not an incident — design tool vs token source vs docs compared mechanically;
- **hard generated/handwritten separation** — banners plus a `check-clean-git`-style build step that *fails* if generated output was hand-edited, as Atlassian's token codegen does;
- **lint enforcement** so token rules are build failures, not conventions (Atlassian's biggest lesson: unenforced tokens decay);
- **deprecate-don't-delete** with machine-readable rename maps, so agent-driven migrations are a `--fix`, not archaeology.

### The failure modes

- **Hallucinated props.** Agents scrape prose or recall stale training data and emit props that don't exist. The fix is structural: prop tables and component manifests **generated from the TypeScript source** (as Polaris generates props docs from TS types, `systems/polaris.md` §5), never hand-written — a hand-written prop table is a hallucination with a byline.
- **Stale AI caches of old APIs.** Models trained on v10 emit v10 names forever (Carbon's `$ui-01` era still haunts generations; Primer's pre-v8 names likewise). Mitigations: never big-bang rename (alias fallbacks + deprecation metadata), and give agents a freshness channel that outranks memory — MCP/llms.txt/manifests they are instructed to consult first.
- **Agents editing generated files.** The #1 anticipated failure mode in Ply's own CLAUDE.md. Banners help; enforcement helps more — CI fails if `dist/` or generated doc sections differ from a clean regeneration.
- **All-at-once context dumps.** One giant DESIGN.md truncates context and raises variance (Atlassian's data). Chunk by component/page and serve on demand.

## 3. How the major systems do it

| System | Data | Docs for agents | Distribution | Verdict |
|---|---|---|---|---|
| **Atlassian** | Typed `token()`, deterministic grammar, ESLint-enforced | DESIGN.md + llms.txt, generated from the system | Hosted + npm MCP server, agent skills | The full stack, with the only published measurements (§7 of dossier) |
| **Spectrum** | Versioned JSON w/ `uuid`, `deprecated`, `renamed`; component API schemas | Per-page markdown, Agent Skills (Dec 2025 overhaul) | `spectrum-design-data-mcp`; token diff tooling | Design-data-as-public-API; the reference for token lifecycle |
| **Polaris** | `{value, description}` per token → docs + `metadata` export | Generated props tables from TS types | Shopify.dev MCP server | Docs-as-data pioneer; closed platform limits reuse |
| **shadcn** | Tiny flat CSS-var vocabulary, saturates training data | Pages open with install command + full source | Registry JSON Schema + MCP + GitHub-repo-as-registry | Owns the distribution layer; the convention agents already speak |
| **Carbon** | Deterministic state math; layer model | A11y status dashboard as checkable data | Code Connect published from CI | The drift-proof design↔code mapping model |
| **Primer** | Figma sync config *inside* `$extensions`; pairing matrix as data | Hub-and-spoke; lifecycle gates machine-checkable | Storybook as API truth | Sync-config-in-token-source is the move to copy |
| **Material** | Algorithmic tiers; anatomy→token spec tables | JS-rendered SPA — largely invisible to agents | Name-based contract only, no pipeline | Best spec tables, worst delivery; the cautionary tale |

Cross-cutting: every system that invested in the **data and distribution layers** (Atlassian, Spectrum, shadcn) is cited as an AI success; the one that invested only in **human-readable excellence** (Material) is the one agents can't read.

## 4. Recommendation for Ply

Ply's plan already covers more of the stack than most shipping systems — the honest gaps are in layers (b) and (c).

**Already covered (keep, don't gold-plate):**

- **(a) Data — covered.** DTCG source with `$description` + usage `$extensions` (Phase 4), stable Figma variable IDs as rename keys, three tiers with a Phase 3 naming ADR. *Additions that are cheap now:* put `pairsWith`, `deprecated`/`renamedTo`, and state-derivation rules into `$extensions.ply.*` while the schema is young (per Spectrum/Primer/Carbon steals).
- **(c, design side) — covered.** MCP-based Figma sync and repo-local `.figma.md` component maps give agents the design→code mapping Code Connect provides elsewhere, within Figma Professional-plan limits.
- **(b, partially) — covered.** Generated token/component doc sections from token metadata (docs-as-data), Starlight static HTML (curl-readable — already ahead of m3.material.io).
- **(e) Maintenance — covered, and it's the differentiator.** Idempotent `/ply-*` commands, drift audits in `audits/`, `GENERATED` banners, `.ds/docs-state.json`. *Addition:* a Stylelint rule banning raw hex/px in component CSS (Atlassian's lesson: unenforced token rules decay) — ~half a day, permanent payoff.

**Should add — in this order:**

1. **llms.txt + per-page markdown on the docs site** (Phase 4–5). Effort: **low** — [`starlight-llms-txt`](https://github.com/delucis/starlight-llms-txt) generates `llms.txt`/`llms-full.txt`/`llms-small.txt` from the existing Starlight content (retrieved 2026-07-05). Payoff: **high** — it's the industry-standard static entry point, and Ply's generated-from-data pages make its llms.txt unusually trustworthy. Do this the moment real token/component docs exist.
2. **Component manifest JSON** (Phase 6, alongside the first coded component). One generated JSON per component — props/variants/sizes extracted from the TS source, plus token dependencies and a11y status — the lightweight version of Spectrum's `component-api-schemas`. Effort: **medium** (a `gen-manifest.mjs` over `react-docgen-typescript` output). Payoff: **high** — it is the single artifact that kills hallucinated props, and it becomes the data source for docs prop tables, Storybook argTypes checks, and Figma component-property audits. Manifests are the contract; everything else renders it.
3. **shadcn-compatible registry** (Phase 6, after 3–5 components exist). Emit `registry.json` + `registry-item.json` per component (files + `cssVars` + `registryDependencies`) from the same manifests; serve via the GitHub-repo-as-registry path — zero infra. Effort: **medium**. Payoff: **high** — instant consumability by the shadcn CLI, its MCP server, and every AI tool that speaks the format; the cheapest distribution channel a solo system can buy.
4. **A Ply MCP server — defer.** Atlassian's data says on-demand retrieval wins, but at Ply's scale llms.txt + manifests + the shadcn MCP (which serves Ply's registry for free via #3) cover the query patterns. Revisit when there's a consumer whose agent needs live token queries; the DTCG JSON + manifests are already exactly the data such a server would wrap (Adobe's `spectrum-design-data-mcp` is the reference implementation). Effort now: medium; payoff now: low.

**The trade-off this accepts:** Ply optimizes for *machine-verifiable structure* over training-data familiarity where they conflict (a tiered DTCG source instead of shadcn's flat two-tier vocabulary), betting that the registry/manifest layer can translate — emitting a compact, familiar-shaped CSS variable surface at build time — while the source stays honest. If that translation layer is neglected, Ply gets the worst of both: a grammar agents don't know and no cheap channel to teach it. The registry and llms.txt items above are therefore not nice-to-haves; they are the thesis.

## 5. Sources

Beyond the `systems/` dossiers (all cross-references above point at their §7/§8 sections):

- Atlassian, ["Building the context engine for the AI era"](https://www.atlassian.com/blog/ai-at-work/atlassian-design-system-building-the-context-engine-for-the-ai-era) — 52%/34%/26%/16% metrics (retrieved 2026-07-05)
- Atlassian, ["Atlassian's DESIGN.md is here"](https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice) — DESIGN.md vs MCP benchmark, static-context limitations (retrieved 2026-07-05)
- DTCG, [Format Module 2025.10](https://www.designtokens.org/tr/drafts/format/) and [first stable version announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) (retrieved 2026-07-05)
- Presenc, [State of llms.txt 2026](https://presenc.ai/research/state-of-llms-txt-2026) — adoption trajectory, per-page context trend (retrieved 2026-07-05)
- Figma, [MCP server developer docs](https://developers.figma.com/docs/figma-mcp-server/) and [help-center guide](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server) (retrieved 2026-07-05)
- RockB, [Figma MCP design-to-code field guide 2026](https://baeseokjae.github.io/posts/figma-mcp-design-to-code-2026/) — structured-files-win observation (retrieved 2026-07-05)
- Into Design Systems, ["Your design system is not ready for AI agents"](https://www.intodesignsystems.com/blog/design-system-not-ready-for-ai-agents) — Indeed JSON-vs-markdown benchmark, five failure modes (retrieved 2026-07-05)
- TechTimes, [Meta's Astryx](https://www.techtimes.com/articles/319202/20260627/metas-astryx-gives-ai-coding-agents-design-system-they-can-actually-read.htm) — headline claim only, full text paywalled (retrieved 2026-07-05)
- shadcn/ui, [registry docs](https://ui.shadcn.com/docs/registry), [registry-item schema](https://ui.shadcn.com/docs/registry/registry-item-json), [MCP](https://ui.shadcn.com/docs/mcp), [changelog](https://ui.shadcn.com/docs/changelog) (retrieved 2026-07-05; details in `systems/shadcn-radix.md`)
- delucis, [starlight-llms-txt plugin](https://github.com/delucis/starlight-llms-txt) (retrieved 2026-07-05)
