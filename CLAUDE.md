# Ply — Agentic Design System

A design system consumable by AI, designers, and engineers. Pipeline: Figma variables → DTCG JSON → Style Dictionary → CSS custom properties + TS tokens → React Aria components → Storybook + Starlight docs. One human (a designer), heavy Claude Code automation. Master plan: see `apps/docs/src/content/docs/map.mdx` once it exists.

## Repo map

- `apps/docs` — Astro Starlight site (decisions/ADRs, system map, token + component docs, changelog)
- `packages/tokens` — `src/ply.tokens.json` (DTCG, exported from Figma) + Style Dictionary build → `dist/` (committed for diffability)
- `packages/react` — React Aria Components-based library, plain CSS per component, Storybook 9
- `kb/` — knowledge base (`systems/` dossiers, `topics/` guides, `comparisons/` decision research)
- `audits/` — timestamped audit reports; committed, never deleted (they're project memory)
- `scripts/` — `build-dtcg.mjs`, `diff-tokens.mjs`, `gen-token-docs.mjs`, `gen-map.mjs`
- `.ds/docs-state.json` — last docs-sync SHA + token snapshot hash
- `.claude/commands/` — `/ply-*` runbooks; `.claude/agents/` — design-advisor, docs-writer

## Commands cheatsheet

`pnpm docs:dev` · `pnpm tokens:build` · `pnpm test` · `pnpm -r build`

## Figma constants

- **Ply token library (write target for tokens):** key `3QugaiUHLUqTyqHhwCibOR` — "Token Library v1 - Ply". 349 variables / 9 collections, 26 text styles, 5 effect styles, Foundations sticker sheet, Token Usage tables. Published as a team library (components consume it).
- **Ply core components (write target for components):** key `liXPUO87wtWFEKuRPoAV8C` — "Core Components - Ply". Consumes the token library via team-library variable/style imports (`importVariableByKeyAsync` — never bind by local ID across files).
- **Reference token library (READ-ONLY, never write):** key `zEiSF5kqk7a0buxqF9BcVp`. Contains the legacy library being superseded: 10 collections / 395 variables (color-primitives 119, color-semantic 189 with Light+Dark, colors-brand 11 with 2 brand modes, font-family 2 vars with 3 font modes, space/radius/font-size/weight/line-height/breakpoints), 27 text styles, 5 effect styles, sticker sheet on `Foundations`, doc tables on `Token Usage Documentation`.
- **Pages (by name, never by node ID).** Node IDs drift when Figma re-indexes; hardcoded IDs are a known bug class in the reference design system's commands.

## Figma MCP guardrails (ported from the reference design system — hard-won, do not relearn)

1. **~20 KB response cap on every Figma MCP call.** Chunk variable exports (~60 variables per call), use compact field shapes (`{n,l,d}` not full words), and template-dedupe narrative text (hash the where/how/do/don't cells into template IDs; store rows as `{d, t}` refs).
2. **Load the `figma-use` skill before any `use_figma` call.** Always.
3. **Auto-layout order trap:** set `layoutMode` + sizing modes FIRST, `resize()` LAST — reversed order locks height to FIXED. Re-assert `primaryAxisSizingMode = 'AUTO'` after any resize. Set `clipsContent = false` defensively.
4. **Renames, never delete/recreate.** Deleting a variable breaks every binding in the file. Rename in place via the `name` setter; renames preserve bindings. Stable variable IDs are the identity key for rename detection (doc-table rows, `diff-tokens.mjs`).
5. **Resolve aliases to source names, not IDs.** `{type:'VARIABLE_ALIAS', id}` → look up the target's `name`; the DTCG composer translates to alias paths.
6. **Read vs write commands are strictly separated.** Export/audit commands never call setters. Write commands always run preview → explicit `apply` gate.
7. **Idempotent.** Every command re-run on a clean state produces zero changes. Never overwrite human-written content (doc-table narrative cells are seeded once on row creation, then append-only/untouched). Deprecate rows, don't delete them.
8. **Figma Professional plan limits:** no Variables REST API, no official Code Connect publishing. Everything goes through `use_figma` plugin-API JS (requires the file open + MCP connected). Code mappings use `add_code_connect_map` + repo-local `.figma.md` files — AI-visible, not Dev-Mode-visible.

## Token rules

- Three tiers: primitives → semantic → component. Path grammar to be fixed by the token-taxonomy ADR (Phase 3) — until then, don't invent names.
- **No hardcoded values in components — tokens only.** In Figma: every fill/radius/spacing/text bound to a variable or style. In code: CSS consumes `var(--ply-*)` custom properties only.
- Sync policy (its own ADR, Phase 4): token **values** — Figma wins; **usage documentation** — the Token Usage table wins.
- Start any token-touching session with `/ply-sync-tokens` (once it exists) to surface drift first.

## Docs rules

- Generated pages/sections carry a `GENERATED — do not hand-edit` banner comment (`{/* … */}` in `.mdx` — HTML comments break MDX parsing; `<!-- … -->` in `.md`). Never hand-edit them; regenerate via scripts. Never machine-edit handwritten pages (except appending to `changelog.mdx` and updating component frontmatter status fields). This is the #1 anticipated failure mode — respect the banner.
- Every phase of work ends with `/ply-update-docs` + a commit. Commands never commit by themselves.
- Internal doc links are root-relative (`/decisions/...`) — Starlight prefixes the `/ply` Pages base automatically for markdown and sidebar links. Exception: hero `actions` in frontmatter need the `/ply/` prefix written manually (only `index.mdx` does this).
- Every non-trivial choice gets an ADR via `/ply-adr` **before** implementation. ADRs live in `apps/docs/src/content/docs/decisions/`.

## Process rules

- Before proposing a tool, pattern, or naming scheme: consult `kb/` first, or invoke the **design-advisor** agent (`/ply-recommend`) for anything with real trade-offs.
- Work in small steps; each session should end with something committed and the docs updated.
- Audit reports go to `audits/ply-<topic>-<YYYY-MM-DD-HHMM>.md` and are committed.
