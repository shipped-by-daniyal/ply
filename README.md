# Agentic Design System (ADS)

A design system built to be efficiently consumable by **AI, designers, and engineers** — from token architecture in Figma through coded, accessible React components, with Claude Code automation doing the heavy lifting at every stage.

## Pipeline

```
Figma (variables + sticker sheet + Token Usage table)
  → /ds-export-tokens → DTCG JSON (with $description + usage $extensions)
  → Style Dictionary → CSS custom properties (light/dark) + TypeScript tokens
  → React Aria Components (plain CSS consuming tokens)
  → Storybook (a11y-tested) + Astro Starlight docs
```

## Repo map

| Path | What lives there |
|---|---|
| `apps/docs` | Astro Starlight docs site — decisions (ADRs), system map, token & component docs |
| `packages/tokens` | DTCG token source (exported from Figma) + Style Dictionary build |
| `packages/react` | React Aria-based component library + Storybook |
| `kb/` | Knowledge base: top-tier design system dossiers, topic guides, decision research |
| `audits/` | Timestamped drift-audit reports (committed — they're project memory) |
| `scripts/` | Token build/diff/docs-generation scripts |
| `.claude/` | Claude Code commands (`/ds-*`) and subagents (design-advisor, docs-writer) |

## Working on this repo

Read `CLAUDE.md` first — it encodes the Figma MCP guardrails, token rules, and docs conventions every session must follow. Key habits:

- Every non-trivial choice gets an ADR (`/ds-adr`) **before** implementation.
- Every phase of work ends with `/ds-update-docs` + a commit.
- Token work starts with `/ds-sync-tokens` to catch Figma↔repo drift.
