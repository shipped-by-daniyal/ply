---
title: shadcn/ui + Radix ecosystem
updated: 2026-07-05
---

# shadcn/ui + Radix ecosystem

## 1. Snapshot

- **shadcn/ui** — created by shadcn, a design engineer at Vercel since Aug 2023 ([announcement](https://x.com/shadcn/status/1688945578439499776), retrieved 2026-07-05) and co-creator of v0. MIT. ~118k stars, 9.3k forks, ~21.4k dependent projects, latest release 4.13.0 (2026-07-03) ([github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui), retrieved 2026-07-05). Self-described as "a set of beautifully-designed, accessible components and a **code distribution platform**" — not an npm component library. Docs: [ui.shadcn.com](https://ui.shadcn.com).
- **Radix Primitives** — ~28 unstyled React primitives, MIT, ~19k stars, maintained by WorkOS ([github.com/radix-ui/primitives](https://github.com/radix-ui/primitives), retrieved 2026-07-05). Not dead but slowed: a ~10-month release gap (Aug 2025 → June 2026), 253 open issues / 128 open PRs; original maintainers largely departed ([releases](https://www.radix-ui.com/primitives/docs/overview/releases); [analysis](https://dev.to/mashuktamim/is-your-shadcn-ui-project-at-risk-a-deep-dive-into-radixs-future-45ei), retrieved 2026-07-05). Radix also ships Themes, Colors, and Icons at [radix-ui.com](https://www.radix-ui.com).
- **Base UI** — unstyled React components "from the creators of Radix, Floating UI, and Material UI" (Colm Tuite ex-Radix, Michał Dudak & Marija Najdova ex-MUI Material UI, plus Floating UI's author); ~8-person full-time team funded by MUI ([base-ui.com/react/overview/about](https://base-ui.com/react/overview/about), retrieved 2026-07-05). v1.0 shipped 2025-12-11 with 35 components ([InfoQ](https://www.infoq.com/news/2026/02/baseui-v1-accessible/)); now v1.6.0 (2026-06-18), ~10.2k stars ([github.com/mui/base-ui](https://github.com/mui/base-ui), retrieved 2026-07-05).
- **The pivot**: as of **July 2026, Base UI is the default primitive layer in shadcn/ui**; Radix remains available via `npx shadcn init -b radix` ([changelog](https://ui.shadcn.com/docs/changelog), retrieved 2026-07-05).

## 2. Token architecture

- Effectively **two tiers**, not three: Tailwind's raw palette acts as primitives; a flat set of ~30 **semantic CSS custom properties** carries all design decisions. There is no formal component-token tier — the `--sidebar-*` group is the only component-scoped cluster ([theming docs](https://ui.shadcn.com/docs/theming), retrieved 2026-07-05).
- Raw values become decisions **at init time**: the CLI reads `tailwind.baseColor` in `components.json` (`neutral | stone | zinc | mauve | olive | mist | taupe`) and writes a full `:root` + `.dark` theme block of **OKLCH** values into your global CSS ([components.json docs](https://ui.shadcn.com/docs/components-json), retrieved 2026-07-05).
- Tailwind v4's `@theme inline` re-exposes each variable as a utility class: `--background` → `bg-background`, `--ring` → `ring-ring`. Tokens and utilities share one vocabulary. The generated block looks like:

  ```css
  :root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    --radius: 0.625rem;
  }
  .dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
  }
  ```

- Opt-out exists: `init --no-css-variables` bakes utility classes directly into component markup — tokens disappear entirely. The CSS-variable mode is the default and the norm.
- Note for a Figma-sourced pipeline: Figma variables cannot hold OKLCH natively, so replicating this format requires a color-space transform at build time (Style Dictionary handles this) (unverified against current Figma release notes).

## 3. Naming

- The grammar is a single convention: **`--{surface}` for the container color, `--{surface}-foreground` for text/icons on it**, with the `-background` suffix omitted. Pairs: `--background`/`--foreground`, `--card`/`--card-foreground`, `--popover`/`--popover-foreground`, `--primary`/`--primary-foreground`, `--secondary`/`--secondary-foreground`, `--muted`/`--muted-foreground`, `--accent`/`--accent-foreground` ([theming docs](https://ui.shadcn.com/docs/theming), retrieved 2026-07-05).
- Unpaired utilities: `--destructive`, `--border`, `--input` (form-control borders), `--ring` (focus), `--radius`; ordinal series `--chart-1`…`--chart-5`; component cluster `--sidebar`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring` (+foregrounds).
- Flat, unprefixed, memorizable. No `color-` category prefix, no tier encoding, no brand namespace — the whole vocabulary fits in an LLM's working memory, which is a large part of why models generate it correctly.

## 4. Theming

- **Light/dark**: identical token names, values overridden inside a `.dark` class selector; components never reference mode-specific values ([theming docs](https://ui.shadcn.com/docs/theming), retrieved 2026-07-05).
- **Multi-brand**: replace the ~30-variable block. Themes are distributable as registry items — `registry-item.json` has a first-class `cssVars` property, so a theme installs like a component ([registry-item schema](https://ui.shadcn.com/docs/registry/registry-item-json), retrieved 2026-07-05).
- **Styles** are a separate axis chosen at init and frozen: `new-york` is the default (the old `default` style is deprecated); 2026 added `Luma` and `Rhea` — Rhea being a compact, high-density style ("tighter spacing, smaller controls") ([changelog](https://ui.shadcn.com/docs/changelog), retrieved 2026-07-05). So **density is a style choice, not a runtime mode** — no density token axis exists.
- Switching = swapping CSS variable values; nothing re-renders through JS theme context. Cheap, SSR-safe, and trivially scriptable by an agent.

## 5. Component anatomy & API style

- **Distribution is the API**: `npx shadcn add button` copies TSX source into your repo at paths defined by `components.json` aliases. You own and edit the code; there is no library version to upgrade against ([components.json docs](https://ui.shadcn.com/docs/components-json), retrieved 2026-07-05).
- **`components.json` is the contract** between project and CLI: `style`, `rsc` (auto-inserts `"use client"`), `tsx`, `tailwind.{config,css,baseColor,cssVariables}`, `aliases.{components,ui,lib,hooks,utils}`, `iconLibrary`, and `registries`. `tailwind.config` stays blank for Tailwind v4.
- **Variants via CVA** (`class-variance-authority`): each component exports a `buttonVariants`-style function with `variant` (`default | secondary | destructive | outline | ghost | link`) and `size` props — a flat, enumerable prop grammar (unverified exact enum per current release; pattern confirmed in docs/source):

  ```tsx
  const buttonVariants = cva("inline-flex items-center ...", {
    variants: { variant: { default: "bg-primary text-primary-foreground", ... },
                size: { default: "h-9 px-4", sm: "...", lg: "...", icon: "..." } },
    defaultVariants: { variant: "default", size: "default" },
  })
  ```
- **Composition**: multi-part primitives re-exported as flat names (`Dialog`, `DialogTrigger`, `DialogContent`…). Polymorphism via Radix's `asChild`/Slot; Base UI uses a `render` prop and keeps "fully open" component APIs with direct node access ([base-ui.com about](https://base-ui.com/react/overview/about), retrieved 2026-07-05). Newer shadcn components stamp `data-slot` attributes for CSS targeting.
- 2026 additions: `@shadcn/react` unstyled headless package, `shadcn eject` to inline shadcn's Tailwind CSS and drop the dependency, and chat/AI components (Message, Bubble, Attachment) ([changelog](https://ui.shadcn.com/docs/changelog), retrieved 2026-07-05).
- Docs style: per-component page = live preview → CLI install command → usage snippet → link to the underlying primitive's API reference. Behavior docs live downstream at Radix/Base UI.

## 6. Accessibility approach

- **A11y lives almost entirely in the primitive layer.** Radix and Base UI implement WAI-ARIA patterns, focus management, and keyboard interaction; Base UI states components are "tested across browsers and screen readers" and adhere to WAI-ARIA ([base-ui.com about](https://base-ui.com/react/overview/about), retrieved 2026-07-05).
- shadcn/ui inherits this and adds visual styling on top; it publishes no a11y test suite of its own for the copied components (unverified — no public a11y CI found). Consequence: once code is copied, **a11y regressions become the consumer's responsibility** — edits to copied components aren't re-validated by anyone upstream.
- Radix's a11y reputation was its moat, but stalled maintenance means known issues (e.g. Toast ARIA fixes only landing Aug 2025) wait long for fixes ([Radix releases](https://www.radix-ui.com/primitives/docs/overview/releases), retrieved 2026-07-05). Base UI's full-time team is the ecosystem's answer.

## 7. Docs & tooling

- **CLI**: `init` (writes `components.json`, theme CSS), `add`, `build` (compiles a registry), `eject`, `mcp`. CLI 3.0 + MCP server shipped Aug 2025 ([changelog](https://ui.shadcn.com/docs/changelog), retrieved 2026-07-05).
- **Registry format**: `registry.json` (index) + `registry-item.json` per item, both with published JSON Schemas (`https://ui.shadcn.com/schema/registry-item.json`). An item declares `name`, `type` (`registry:ui`, `registry:block`, `registry:hook`, `registry:lib`…), `files` (with embedded content and target paths), npm `dependencies`, `registryDependencies` (other items by name, `@namespace/item`, or URL), and `cssVars` ([registry docs](https://ui.shadcn.com/docs/registry/registry-item-json), retrieved 2026-07-05). It's "a distribution system for code… not limited to React" ([registry intro](https://ui.shadcn.com/docs/registry)). "Universal registry items" (July 2025) extended this to arbitrary files — config, rules, docs — targeted anywhere in a project; since June 2026 **any public GitHub repo is a registry**: `shadcn add <user>/<repo>/<item>` ([changelog](https://ui.shadcn.com/docs/changelog), retrieved 2026-07-05). Skeleton:

  ```json
  { "$schema": "https://ui.shadcn.com/schema/registry-item.json",
    "name": "login-form", "type": "registry:block",
    "registryDependencies": ["button", "input", "@acme/card"],
    "files": [{ "path": "blocks/login-form.tsx", "type": "registry:component", "content": "..." }],
    "cssVars": { "light": { "brand": "oklch(0.6 0.2 250)" }, "dark": { "brand": "..." } } }
  ```
- **MCP server** (`npx shadcn@latest mcp`): lets AI assistants "browse available components, search for specific ones, and install them directly into your project using natural language," across public, namespaced, and authenticated private registries configured in `components.json` ([MCP docs](https://ui.shadcn.com/docs/mcp), retrieved 2026-07-05).
- **Design↔code sync**: none, by design — code is the single source of truth; no first-party Figma library (community kits exist, unofficial). v0 closes the loop from the generation side instead.
- **Why it's the AI default**: components are plain React+Tailwind visible in-repo (no opaque abstraction for a model to hallucinate against), the token vocabulary is tiny and stable, and its massive open-source footprint means it saturates training data — v0, Bolt, Lovable, and Cursor all emit it by default, creating a flywheel of more shadcn code → better generations ([vibecoder analysis](https://blog.vibecoder.me/shadcn-ui-component-library-ai-development); [certificates.dev overview](https://certificates.dev/blog/starting-a-react-project-shadcnui-radix-and-base-ui-explained), retrieved 2026-07-05). "Registry distribution" generalizes this: a component is a **self-describing JSON payload** (source + deps + tokens + install target) that an agent can fetch, reason about, and apply without a build step.

## 8. Steal / avoid for Ply

**Steal**
- **The `x`/`x-foreground` pairing grammar** for Ply's semantic tier. It encodes a contrast contract into the name, is the single most training-data-saturated token convention alive, and agents complete it from memory. Alias or mirror it (`--ply-surface` / `--ply-surface-foreground`) even if internal DTCG names differ.
- **Keep the semantic vocabulary small and flat** (~30 names). Ply's Style Dictionary output should emit a compact semantic CSS layer; sprawling three-tier names in shipped CSS hurt AI generation accuracy. Keep tiers in the DTCG source, flatten at build.
- **Publish a shadcn-compatible registry.** `registry-item.json` is a published JSON Schema; Ply components (React Aria + plain CSS) can be served as items with `files`, `cssVars`, and `registryDependencies`. Instantly consumable by the shadcn CLI and its MCP server — the cheapest possible AI-distribution channel for a solo designer. Pair with the "GitHub repo as registry" path: zero infra.
- **Ship theme deltas as installable artifacts** (`cssVars` per mode), not as docs prose. Matches Ply's Style Dictionary light/dark CSS output almost 1:1.
- **`data-slot` attributes as styling hooks** — aligns perfectly with React Aria Components' data-attribute styling and plain CSS; gives agents deterministic selectors.
- **Docs pages that open with the install command and full source** — Starlight pages per component should lead with a copyable command/snippet, not narrative.

**Avoid**
- **Copy-paste ownership without an update path.** Diffing 40 hand-edited copies against upstream is the ecosystem's loudest complaint. Ply should stay a versioned package with tokens as the customization surface — registry distribution for *consumers*, not as Ply's own source-of-truth model.
- **A two-tier token model.** shadcn's missing primitive tier means rebranding = regenerating the whole theme block via CLI. Ply's primitives → semantic → component chain with DTCG references is strictly better for a Figma-sourced pipeline; don't flatten the source.
- **Single-vendor primitive risk.** Radix's post-acquisition stagnation forced a whole ecosystem migration. Ply's React Aria bet (Adobe, actively staffed) is sound — but keep component wrappers thin so a primitive swap stays survivable.
- **Density as a frozen init-time "style"** (new-york/Luma/Rhea). Ply should express density as a token mode/axis so agents can switch it at runtime like dark mode.
- **A11y left implicitly to the primitive layer.** shadcn has no downstream a11y verification; Ply's Storybook+axe gate on the *styled* components is a genuine differentiator — keep it, and document it as a guarantee.

## Sources

- https://ui.shadcn.com/docs/theming (retrieved 2026-07-05)
- https://ui.shadcn.com/docs/components-json (retrieved 2026-07-05)
- https://ui.shadcn.com/docs/registry, /docs/registry/registry-item-json (retrieved 2026-07-05)
- https://ui.shadcn.com/docs/mcp (retrieved 2026-07-05)
- https://ui.shadcn.com/docs/changelog (retrieved 2026-07-05)
- https://github.com/shadcn-ui/ui (retrieved 2026-07-05)
- https://github.com/radix-ui/primitives (retrieved 2026-07-05)
- https://www.radix-ui.com/primitives/docs/overview/releases (retrieved 2026-07-05)
- https://github.com/mui/base-ui (retrieved 2026-07-05)
- https://base-ui.com/react/overview/about (retrieved 2026-07-05)
- https://www.infoq.com/news/2026/02/baseui-v1-accessible/ (retrieved 2026-07-05)
- https://x.com/shadcn/status/1688945578439499776 (retrieved 2026-07-05)
- https://blog.vibecoder.me/shadcn-ui-component-library-ai-development (retrieved 2026-07-05)
- https://certificates.dev/blog/starting-a-react-project-shadcnui-radix-and-base-ui-explained (retrieved 2026-07-05)
- https://dev.to/mashuktamim/is-your-shadcn-ui-project-at-risk-a-deep-dive-into-radixs-future-45ei (retrieved 2026-07-05)
