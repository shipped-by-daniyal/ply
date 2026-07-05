---
title: Polaris (Shopify)
updated: 2026-07-05
---

## 1. Snapshot

- **Owner:** Shopify's internal design system for the merchant admin and third-party apps/extensions. Two eras now coexist: **Polaris React** (2017–2025, deprecated) and **Polaris web components** (announced 2025-05-21, GA/stable 2025-10-01, pinned to Shopify API version `2025-10`). ([Announcement](https://www.shopify.com/partners/blog/polaris-unified-and-for-the-web), [GA post](https://www.shopify.com/partners/blog/polaris-goes-stable-the-future-of-shopify-app-development-is-here), retrieved 2026-07-05)
- **Status of React era:** polaris.shopify.com 301-redirects to [polaris-react.shopify.com](https://polaris-react.shopify.com/); the GitHub monorepo is renamed [Shopify/polaris-react](https://github.com/Shopify/polaris-react), **archived**, described as "React implementation (Deprecated)" (~6.2k stars; GitHub API, retrieved 2026-07-05).
- **Scale:** `@shopify/polaris` ~218k weekly downloads, `@shopify/polaris-tokens` ~208k weekly (npm API, week ending 2026-07-04); 400+ icons; docs cover foundations, patterns, content, tokens, components.
- **License:** custom MIT-derived — use is restricted to apps that "integrate or interoperate with Shopify"; standalone apps must be "dissimilar and visually distinct" from Shopify products ([LICENSE.md](https://github.com/Shopify/polaris-react/blob/main/LICENSE.md), retrieved 2026-07-05). Not a freely reusable system.
- **Key links:** [polaris-react.shopify.com](https://polaris-react.shopify.com/) (legacy docs + tokens), [shopify.dev/docs/api/polaris](https://shopify.dev/docs/api/polaris) (web components), [@shopify/polaris-tokens](https://www.npmjs.com/package/@shopify/polaris-tokens) (v9.4.2, 2025-03-17), [figma.com/@shopify](https://www.figma.com/@shopify).

## 2. Token architecture

Source of truth: TypeScript files in `polaris-tokens/src` (inspected via [GitHub](https://github.com/Shopify/polaris-react/tree/main/polaris-tokens), 2026-07-05). Not DTCG JSON, not Style Dictionary — a bespoke TS pipeline.

- **Tier 1 — primitives:** `colors.ts` defines hue scales with **16 numbered steps** per hue (`gray[1]`…`gray[16]`) plus alpha variants (`whiteAlpha[9]`). Primitives are never exported as CSS vars; they exist only to feed themes.
- **Tier 2 — semantic ("meta theme") tokens:** 11 token groups — `border, breakpoints, color, font, height, motion, shadow, space, text, width, zIndex` — each token an object `{value, description}` (`MetaTokenProperties`). Descriptions are data, not comments, and power the docs site and the published `metadata` export.
- **Tier 3 — component aliases: barely exists.** Only a handful, e.g. `space-card-padding`, `space-button-group-gap`, `space-table-cell-padding` (in `space.ts`). Component decisions mostly live in component CSS referencing tier 2.
- **Themes as partial overrides:** `createMetaThemePartial()` + deepmerge over `metaThemeBase`. `dark.ts` only re-points semantic tokens at different primitive steps (`'color-bg-surface': colors.gray[15]`, `'color-scheme': 'dark'`); primitives are immutable across themes.
- **Build outputs:** JS (`tokens` values + `metadata` with descriptions), per-group JSON (`json/spacing.json`), and CSS custom properties prefixed `--p` ("to signal these are Polaris variables"); px→rem conversion happens at build time (`tokenGroupToRems`). ([README](https://github.com/Shopify/polaris-react/blob/main/polaris-tokens/README.md), retrieved 2026-07-05)

## 3. Naming

Grammar: `--p-{group}-{element}-{role}-{prominence}-{state}`, group-first, kebab-case.

- **Color** tokens name the *element being painted* first: `bg` / `bg-surface` / `bg-fill` / `text` / `icon` / `border`, then tone/role, then state. Real examples from [the tokens site](https://polaris-react.shopify.com/tokens/color) (retrieved 2026-07-05): `--p-color-bg-surface`, `--p-color-bg-fill-brand-hover`, `--p-color-text-secondary`, `--p-color-icon-critical`, `--p-color-border-focus`, `--p-color-bg-surface-info-hover`, `--p-color-bg-fill-magic` (the `magic` tone = AI-suggested features).
- **Contrast pairing is explicit:** `--p-color-text-success-on-bg-fill`, `--p-color-text-brand-on-bg-fill` — "on" tokens guarantee legible foreground for each fill, no guessing.
- **Space** uses a base-4 percentage scale: `space-100` = 4px (100% of base), `space-400` = 16px, `space-025` = 1px; scale steps `0, 025, 050, 100…3200` leave numeric gaps so new steps can be inserted without renaming ([layout tokens](https://polaris-react.shopify.com/design/layout/layout-tokens), retrieved 2026-07-05).
- **States are suffixes** (`-hover`, `-active`, `-selected`, `-disabled`), prominence is an infix (`-secondary`, `-tertiary`, `-emphasis`, `-inverse`).

## 4. Theming

- **Registered themes** (`themes/constants.ts`): `light` (default), `light-mobile`, `light-high-contrast-experimental`, `dark-experimental`. Note two stayed "experimental" for years — dark mode never shipped GA for the admin in the React era.
- **Switching mechanism:** each theme's CSS is emitted under a class selector — `createThemeClassName()` → `.p-theme-{name}` — so switching = swapping a class on `<html>`; the `color-scheme` token flips native form controls. Density/platform variation is handled the same way (`light-mobile` is a theme, not a separate system).
- **No multi-brand, by design.** Polaris exists to make third-party apps look native to the Shopify admin. The 2025 web components go further: "Component styling is controlled by the merchant's branding settings and can't be overridden with custom CSS"; appearance is only adjustable via `tone` (critical/success/info), `color` (subdued/strong), and `variant` props ([using Polaris web components](https://shopify.dev/docs/api/polaris/using-polaris-web-components), retrieved 2026-07-05). Components render in a sandboxed remote-dom layer, delivered from Shopify's CDN, so Shopify can restyle every app centrally without app releases.

## 5. Component anatomy & API style

- **React era (v12+):** enum props over booleans — Button takes `variant: plain|primary|secondary|tertiary|monochromePlain`, `tone: success|critical`, `size: micro|slim|medium|large` ([Button docs](https://polaris-react.shopify.com/components/actions/button), retrieved 2026-07-05). Earlier boolean props (`primary`, `destructive`) were migrated to `variant`/`tone` in v12 — a deliberate, codemodded API consolidation.
- **Layout primitives** (`Box`, `BlockStack`, `InlineStack`) accept token-valued props (`gap="400"` maps to `space-400`), keeping raw values out of product code (unverified exact prop list — see components index).
- **Web components era:** `s-` prefixed custom elements (`<s-page>`, `<s-section>`, `<s-stack>`, `<s-box>`, `<s-button>`, `<s-text-field>`), slot-based composition, framework-agnostic (Preact is the default in extensions, with Signals). Built on remote-dom in an isolated sandbox; no custom CSS, no direct DOM access.
- **Docs page rubric per component:** live examples → generated props table (from TS types) → best practices → content guidelines → accessibility → related components. React pages now banner-link to the `s-*` equivalent.

## 6. Accessibility approach

- **Target:** WCAG 2.1 A + AA ([accessibility foundations](https://polaris-react.shopify.com/foundations/accessibility), retrieved 2026-07-05).
- **Where it lives:** primarily *in the library* — accessible markup, keyboard standards, automatic focus management for overlays (modals, popovers); components undergo "automated and manual accessibility testing" ("build it once, use it everywhere" concentration of expertise).
- **Explicit responsibility split in docs:** integrators must test full workflows, manage focus on navigation/form errors, avoid background focus shifts, and provide standard alternatives for any non-standard interaction. Every component page carries its own accessibility section (ARIA usage, keyboard support, labeling).
- Web components inherit this: sandboxed rendering means Shopify controls the semantics, so a11y patterns are "built in" and un-breakable by consumers (also un-fixable — a trade-off).

## 7. Docs & tooling

- **Legacy site** (polaris-react.shopify.com): Foundations / Design / Content / Patterns / Components / Tokens / Icons / Contributing. The tokens section is **generated from token metadata** — the `{value, description}` objects render directly as searchable reference pages.
- **New docs** live at [shopify.dev/docs/api/polaris](https://shopify.dev/docs/api/polaris) and [app-home/web-components](https://shopify.dev/docs/api/app-home/web-components), with a hosted **Storybook** environment for exploring App Home components (shopify.dev, retrieved 2026-07-05).
- **AI-native tooling:** the GA announcement pitches the **Shopify.dev MCP server** with "extensive patterns" for code generation via Cursor, Copilot, and Claude Code — docs designed to be consumed by agents, not just humans.
- **Figma:** official kits under [figma.com/@shopify](https://www.figma.com/@shopify). UI Kit **v12 replaced Figma color styles with Figma variables** and deprecated styles; the current [Polaris UI Kit](https://www.figma.com/community/file/1554895871000783188/polaris-ui-kit-community) is rebuilt to **match the web components 1:1**, with the React-era kit republished as [Polaris Components (Legacy)](https://www.figma.com/community/file/1571239587122046021/polaris-components-legacy) (Figma Community, retrieved 2026-07-05). Sync direction is code→Figma: the kit is manually rebuilt to mirror shipped components ([contributing guide](https://polaris-react.shopify.com/contributing/figma-ui-kit)); there is no automated token pipeline from Figma into `polaris-tokens` (unverified — no evidence of one in the repo or docs).

## 8. Steal / avoid for Ply

**Steal**

1. **Descriptions as token data.** Polaris ships `{value, description}` per token and generates docs + a `metadata` export from it. Ply's DTCG `$extensions` usage docs are the same idea — go further and emit them into the TypeScript build output too, so agents and IDEs see usage guidance at the point of use.
2. **Element-first color grammar with explicit `on-*` pairing tokens.** `color-{bg-fill|bg-surface|text|icon|border}-{tone}-{state}` plus `text-…-on-bg-fill` removes contrast guesswork. Adopt paired on-tokens in Ply's semantic tier; they're what make automated (axe) contrast checks pass by construction.
3. **Themes as partial deep-merged overrides.** Dark = ~100 semantic re-points over an immutable primitive palette. That is exactly Ply's Style Dictionary light/dark mode shape — enforce "modes may only remap semantic → primitive, never introduce raw values."
4. **Gapped numeric scales** (`space-100` = 4px base-multiple naming, steps 025–3200). Insertable without renames; friendlier to AI generation than `sm/md/lg` because the math is in the name.
5. **The per-component docs rubric** (examples → props → best practices → content → a11y → related) and enum `variant`/`tone`/`size` props instead of boolean soup. Both port directly to Ply's Starlight pages and React Aria wrappers; Polaris paid for a v12 codemod migration to get there — start there.
6. **Docs-for-agents posture.** Shopify ships an MCP server over its design-system docs. Ply's kb/ + Starlight content should stay structured (frontmatter, tables, stable headings) so it can be served the same way.

**Avoid**

1. **Bespoke token toolchain.** Polaris's TS-only, non-DTCG pipeline means zero interop with standard tooling (no Style Dictionary, no Figma variable import). Ply's DTCG + SD v4 stack is strictly better for a solo operator — don't hand-roll transforms Polaris had a team to maintain.
2. **Tokens coupled to one framework's release train.** When Polaris React was deprecated, its npm consumers were stranded mid-migration to a closed platform. Keep Ply tokens a standalone package that any renderer consumes.
3. **Fully closed theming.** "No custom CSS" is rational for Shopify's platform control but fatal for an adoptable system. Ply's plain-CSS components should keep documented escape hatches (public custom properties per component).
4. **"Experimental" modes that linger.** `dark-experimental` and `light-high-contrast-experimental` sat unshipped for years, signaling dark mode was untrustworthy. Ply ships light/dark as co-equal from day one or not at all.
5. **Afterthought component tier.** Polaris has ~4 component-alias space tokens; everything else hides in component CSS, invisible to Figma and to agents. Ply's tier 3 should be deliberate and exported, even if small.
6. **Restrictive custom licensing.** Polaris's "visually distinct" clause makes it legally unreusable and muddies community contribution. If Ply is ever public, use MIT/Apache-2.0 outright.

## Sources

- https://www.shopify.com/partners/blog/polaris-unified-and-for-the-web (2026-07-05)
- https://www.shopify.com/partners/blog/polaris-goes-stable-the-future-of-shopify-app-development-is-here (2026-07-05)
- https://polaris-react.shopify.com/ — home, /tokens/color, /components/actions/button, /foundations/accessibility, /contributing/figma-ui-kit (2026-07-05)
- https://shopify.dev/docs/api/polaris/using-polaris-web-components and /docs/api/app-home/web-components (2026-07-05)
- https://github.com/Shopify/polaris-react — repo metadata, LICENSE.md, polaris-tokens/README.md, polaris-tokens/src (colors.ts, themes/constants.ts, themes/utils.ts, themes/base/space.ts, themes/dark.ts) (2026-07-05)
- npm registry + api.npmjs.org — @shopify/polaris-tokens versions, weekly downloads (2026-07-05)
- Figma Community: Polaris UI Kit (1554895871000783188), Polaris Components Legacy (1571239587122046021) (2026-07-05)
