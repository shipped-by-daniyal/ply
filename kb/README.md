# Ply Knowledge Base

Curated research that grounds every Ply decision. The **design-advisor** agent reads this before recommending anything; humans read it to understand why Ply is shaped the way it is.

## Structure

- `systems/` — one dossier per top-tier design system, all following the same rubric so they're comparable side by side.
- `topics/` — cross-cutting guides (token tiers, naming, a11y, theming…). Each ends with a **Recommendation for Ply** — the default position the advisor argues from.
- `comparisons/` — decision dossiers produced by `/ply-recommend`: a specific proposal, researched alternatives, and a verdict. Named `YYYY-MM-DD-<slug>.md`.

## Citation convention

Every claim that isn't common knowledge carries a source: a link plus retrieval date, either inline — `([source](https://…), retrieved 2026-07-05)` — or via a **Sources** list at the bottom of the file. If a claim can't be sourced, mark it `(unverified)`. Dossiers are living documents: when you touch one, update its `updated:` frontmatter date and re-verify anything load-bearing.

## System dossier rubric (`systems/`)

Every dossier uses exactly these sections:

1. **Snapshot** — who owns it, scale, license, key links
2. **Token architecture** — tiers, collections, modes; how raw values become decisions
3. **Naming** — the grammar (with real token examples)
4. **Theming** — light/dark, multi-brand, density; how switching works
5. **Component anatomy & API style** — variants/props conventions, composition, docs style
6. **Accessibility approach** — where a11y lives (library, docs, tests)
7. **Docs & tooling** — how they document, generate, and sync design↔code
8. **Steal / avoid for Ply** — concrete takeaways, each with a reason

## Topic guide rubric (`topics/`)

1. **The question this answers**
2. **Current best practice** (as of the `updated:` date)
3. **How the major systems do it** — cross-reference `systems/` dossiers rather than repeating them
4. **Recommendation for Ply** — a clear default, with the trade-off it accepts
5. **Sources**

## File frontmatter

```yaml
---
title: <name>
updated: YYYY-MM-DD
---
```
