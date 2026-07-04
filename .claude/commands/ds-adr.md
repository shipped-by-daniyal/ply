---
description: Scaffold and register an Architecture Decision Record in apps/docs/src/content/docs/decisions/. Usage — /ds-adr <short decision title>
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
---

# /ds-adr

Create a new ADR for: **$ARGUMENTS**

## Rules

1. **One decision per ADR.** If the argument bundles several decisions, split and confirm with the user first.
2. **ADRs are written BEFORE implementation.** If implementation already happened this session, note it honestly in Context.
3. **Never renumber or rewrite past ADRs.** A changed decision gets a NEW ADR that supersedes the old one (set the old one's `status: superseded` and cross-link both ways — that's the only permitted edit to an old ADR).
4. Status lifecycle: `proposed` → `accepted` → (`superseded`). Default new ADRs to `accepted` when the user has already made the call in conversation; use `proposed` when it still needs their sign-off.

## Steps

1. List `apps/docs/src/content/docs/decisions/adr-*.mdx` to find the next number `NNNN` (zero-padded, starts at 0001).
2. Derive a kebab-case slug from the title (max ~5 words).
3. If context/decision/alternatives are not already clear from the conversation, ask the user targeted questions — do not invent rationale.
4. Copy the structure of `apps/docs/src/content/docs/decisions/_template.mdx` into `adr-NNNN-<slug>.mdx`, filling every section. Keep it under ~60 lines: an ADR is a record, not an essay.
5. Add one line to the list in `apps/docs/src/content/docs/decisions/index.mdx` (keep numeric order; format: `- [ADR-NNNN: Title](/decisions/adr-NNNN-slug/) — one-line takeaway (status)`). If `index.mdx` carries a `GENERATED` banner (Phase 1+), skip this step — `/ds-update-docs` owns it.
6. Print the file path and a one-line summary. Do NOT commit — the user reviews and commits.
