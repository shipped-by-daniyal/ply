---
title: Carbon (IBM)
updated: 2026-07-05
---

## 1. Snapshot

- **Owner:** IBM. Open source, Apache-2.0. Monorepo [carbon-design-system/carbon](https://github.com/carbon-design-system/carbon) — 9,260 stars, actively pushed (last push 2026-07-04). [GitHub API](https://api.github.com/repos/carbon-design-system/carbon) (2026-07-05)
- **Scale:** Powers IBM products + ibm.com; `@carbon/react` at v1.110.0, ~138k weekly npm downloads (week of 2026-06-28). [npm](https://www.npmjs.com/package/@carbon/react), [npm API](https://api.npmjs.org/downloads/point/last-week/@carbon/react) (2026-07-05)
- **Current major:** v11 (since 2022). v10's `carbon-components-react` hit end-of-support 2024-09-30; everything (styles, components, icons) now consolidates into `@carbon/react`. [Migration FAQ](https://carbondesignsystem.com/migrating/faq/) (2026-07-05)
- **Frameworks:** React and Web Components officially supported; Angular, Vue, Svelte, vanilla JS, Lightning WC are community-maintained. [Frameworks](https://carbondesignsystem.com/developing/frameworks/react/) (2026-07-05)
- **Key links:** [carbondesignsystem.com](https://carbondesignsystem.com) · [Storybook](https://react.carbondesignsystem.com) · [(v11) Figma library](https://www.figma.com/community/file/1157761560874207208/v11-carbon-design-system)
- **2024–26 direction:** "Carbon for AI" extension — `AILabel` component (né Slug) + `decorator`/`aiLabel` props that apply AI-presence styling across components. [Guidelines](https://carbondesignsystem.com/guidelines/carbon-for-ai/), [Medium](https://medium.com/carbondesign/carbon-for-ai-scaling-new-ways-of-working-fc6913624667) (2026-07-05)

## 2. Token architecture

Three effective tiers, though Carbon doesn't market them that way:

1. **Raw palettes** — `@carbon/colors` (IBM palette, 10-step scales per hue, e.g. Blue 60), plus `@carbon/layout`, `@carbon/type`, `@carbon/motion` element packages shipped as Sass + JS (not DTCG).
2. **Core (theme) tokens** — role-based, in **ten groups**: background, layer, field, border, text, link, icon, support, focus, skeleton. A *token* is "a role-based identifier that assigns a value to a theme"; the name stays constant, the value swaps per theme ($text-primary = Gray 100 in White theme, Gray 10 in g100). [Color overview](https://carbondesignsystem.com/elements/color/overview/), [Themes](https://carbondesignsystem.com/elements/themes/overview/) (2026-07-05)
3. **Component tokens** — e.g. `$button-primary`; explicitly scoped to one component and "should never be reused elsewhere." (same source)

**The layering model** (Carbon's signature): surfaces stack as `$background` → `$layer-01` → `$layer-02` → `$layer-03`, with matching `$field-*` and `$border-subtle-*` sets per layer. Light themes alternate White/Gray 10 as you nest; dark themes step one gray *lighter* per layer (G100 → G90 → G80). The model is "built directly into themes, tokens, and components." [Color overview](https://carbondesignsystem.com/elements/color/overview/) (2026-07-05)

**Interactive states are tokens, with defined math:** `-hover` = half-step on the color scale, `-active` = two full steps, `-selected` = one full step; `$focus` = Blue 60 (light) / White (dark). So state colors are derived deterministically, not hand-picked. (same source)

**Spacing:** 13 tokens on an 8px mini-unit / multiples-of-2-4-8 basis. Tokens don't change per breakpoint — you swap tokens at breakpoints. Layout spacing is delegated to a `Stack` component so children "not use margin and instead delegate … positioning to parent components." [Spacing](https://carbondesignsystem.com/elements/spacing/overview/) (2026-07-05)

| Token | px | Token | px |
|---|---|---|---|
| `$spacing-01` | 2 | `$spacing-08` | 40 |
| `$spacing-02` | 4 | `$spacing-09` | 48 |
| `$spacing-03` | 8 | `$spacing-10` | 64 |
| `$spacing-04` | 12 | `$spacing-11` | 80 |
| `$spacing-05` | 16 | `$spacing-12` | 96 |
| `$spacing-06` | 24 | `$spacing-13` | 160 |
| `$spacing-07` | 32 | | |

**Type:** tokens are preset configurations (size/weight/leading) of IBM Plex, in two sets — productive (`-01` suffix, product UI) and expressive (`-02`, editorial): `$body-compact-01`, `$heading-03`. Scale derived by formula from 12px base. [Typography](https://carbondesignsystem.com/elements/typography/overview/) (2026-07-05)

## 3. Naming

v11 grammar: **`[element]-[role]-[order]-[state]`**, with the explicit rule that "only layering tokens will have this [numeral] distinction. All other tokens have been given an adjective descriptor in place of the number ending." [Migration guide: design](https://carbondesignsystem.com/migrating/guide/design/) (2026-07-05)

Real examples:
- `$text-primary`, `$text-secondary`, `$text-on-color` (element + role; `-on-color` = inverse/on-brand)
- `$border-subtle-01`, `$border-strong` (adjective role, number only where layer-dependent)
- `$layer-01`, `$layer-hover-01`, `$layer-selected-01` (order + state suffixes)
- `$support-error`, `$link-primary`, `$field-02`, `$focus`, `$skeleton-element`
- `$button-primary` (component tier); `$spacing-05`; `$heading-03` / `$body-compact-01`

The v10→v11 rename replaced numbered roles (`$ui-01`, `$text-01`, `$interactive-01`) with this role grammar — layer tokens "replace what were the `ui` color tokens in v10." That rename forced an ecosystem-wide migration. [Migration guide: design](https://carbondesignsystem.com/migrating/guide/design/), [v11.md](https://github.com/carbon-design-system/carbon/blob/main/docs/migration/v11.md) (2026-07-05)

## 4. Theming

- **Four built-in themes:** White (default), Gray 10 (light); Gray 90, Gray 100 (dark). Same token names, different value maps. [Themes](https://carbondesignsystem.com/elements/themes/overview/) (2026-07-05)
- **Compile-time customization:** Sass module config — `@use '@carbon/react/scss/theme' with ($theme: (background: #e2e2e2, custom-token-01: #000000))`; custom tokens allowed. (same source)
- **Runtime/inline theming (v11):** tokens emit as CSS custom properties. `<GlobalTheme theme="g100">` provides React context only — you wire it up by stamping `document.documentElement.dataset.carbonTheme` and mapping theme mixins to `:root`/`[data-carbon-theme]` custom properties. `<Theme theme="g90" as="section">` re-themes a subtree (zone stylesheet `@carbon/react/scss/zone` required); `useTheme()` reads current theme. [Theme.mdx](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/Theme/Theme.mdx) (2026-07-05)
- A `<Layer>` component auto-increments contextual layer tokens for nested surfaces so children pick up `$layer-02` inside `$layer-01` (unverified detail; layering-in-components is confirmed in the color overview).
- **Multi-brand:** not really a goal — theming = IBM light/dark zones plus Sass overrides. Downstream layers (Carbon for IBM.com, Carbon for IBM Products) extend rather than rebrand.
- **Density:** no density axis/theme. Density is handled per-component via normalized `size` props (`sm`/`md`/`lg`, DataTable `xs`–`xl`) and grid modes. [v11.md](https://github.com/carbon-design-system/carbon/blob/main/docs/migration/v11.md) (2026-07-05)

**2x Grid:** everything is a multiple of the 8px mini unit; the "2x" philosophy is divide/multiply by two (fluid grids divide, fixed boxes multiply, and "on breakpoint boundaries, these sizes match"). v11 default is real CSS Grid with 16 columns (flexbox kept as `FlexGrid`); fluid / fixed / hybrid sizing modes. [2x Grid](https://carbondesignsystem.com/elements/2x-grid/overview/), [v11.md](https://github.com/carbon-design-system/carbon/blob/main/docs/migration/v11.md) (2026-07-05)

| Breakpoint | Width | Columns | Margin |
|---|---|---|---|
| sm | 320px | 4 | 0 |
| md | 672px | 8 | 16px |
| lg | 1056px | 16 | 16px |
| xlg | 1312px | 16 | 16px |
| max | 1584px | 16 | 24px |

## 5. Component anatomy & API style

- **Variant grammar:** `kind` for semantic variants (Button: primary/secondary/tertiary/ghost/danger), `size` normalized to `sm/md/lg` tokens in v11 (booleans like `small` removed). [v11.md](https://github.com/carbon-design-system/carbon/blob/main/docs/migration/v11.md) (2026-07-05)
- **Composition over config:** v11 rebuilt Tabs as composable `TabList`/`Tab`/`TabPanels`/`TabPanel`; components moved to function components; event signatures standardized to `(event, { checked, id })`; Toggle became a real `<button role="switch">` — API changes used to fix semantics. (same source)
- **Experimental surface:** unstable APIs ship behind `unstable_` prefixes and a `@carbon/feature-flags` package (unverified).
- **Cross-cutting props:** AI presence via `aiLabel`/`decorator` props that trigger a styling mix-in on any supporting component. [AI label](https://carbondesignsystem.com/components/ai-label/usage/) (2026-07-05)
- **Docs style:** every component page has Usage / Style / Code / Accessibility tabs; Code tab links Storybook + StackBlitz sandboxes. [Frameworks/react](https://carbondesignsystem.com/developing/frameworks/react/) (2026-07-05)

## 6. Accessibility approach

- **Standard:** IBM Accessibility Checklist (WCAG AA + Section 508 + EN 301 549), stricter than plain WCAG. [A11y overview](https://carbondesignsystem.com/guidelines/accessibility/overview/) (2026-07-05)
- **In the library:** semantics baked into components (e.g. Toggle's switch role); focus/keyboard behavior specified per component in a dedicated docs tab (Keyboard, Color/contrast, Developer notes).
- **In tests:** automated accessibility verification tests (AVT) run "for each change proposed to the Carbon codebase" using IBM Equal Access `accessibility-checker` (works with Playwright/Puppeteer in CI). [Accessibility status](https://carbondesignsystem.com/components/overview/accessibility-status/), [IBMa/equal-access](https://github.com/IBMa/equal-access) (2026-07-05)
- **Public accountability:** a per-component **accessibility status dashboard** shows what's verified (AVT, screen reader, keyboard) per component. (same source)
- Design-side tooling recommended: Equal Access toolkit, Stark plugin for contrast in Figma.

## 7. Docs & tooling

- **Site:** Gatsby-based (`gatsby-theme-carbon` is reusable so IBM teams spin up Carbon-styled doc sites); tabbed component pages; live previews; migration guides are first-class content.
- **Figma:** one "(v11) Carbon Design System" library contains components **and all four themes**; color tokens surface as **Figma variables**, typography as text styles (separate Type Sets library), plus IBM icon/pictogram libraries. External users pull from Figma Community. [Design kits](https://carbondesignsystem.com/designing/kits/figma/) (2026-07-05)
- **Code Connect (the headline):** `@carbon/react` is fully integrated with Figma Code Connect — real React snippets in Dev Mode, Figma variant properties map to React props, nested instances (Button inside Accordion) compose correct code, 2,000+ icons mapped, and a **GitHub Actions CI pipeline auto-publishes Code Connect mappings from the repo to Figma** so design and code never drift. [Medium: Carbon and Figma Code Connect](https://medium.com/carbondesign/carbon-and-figma-code-connect-redefining-the-design-to-code-experience-836eb3f454fc) (2026-07-05)
- **Token distribution:** own Sass/JS packages (`@carbon/themes`, `@carbon/colors`, …) — no DTCG, no Style Dictionary; theming pipeline is Sass-module-first with CSS custom properties as the runtime layer.

## 8. Steal / avoid for Ply

**Steal**
1. **The layer-set model.** Add `layer-01/02/03` (+ matching `field-*`, `border-subtle-*`) to Ply's semantic tier instead of a single `surface` token. It's the cleanest known fix for nested-surface contrast in dark mode, and it maps 1:1 onto Style Dictionary light/dark modes as CSS custom properties.
2. **Deterministic state math.** Carbon defines `-hover` = ½ step, `-active` = 2 steps, `-selected` = 1 step on the primitive scale. Encode that rule in Ply's token build (or an MCP generation script) so an agent can derive every state color from the base token — no hand-picking, perfect for AI automation.
3. **Adjectives for roles, numbers only for order.** `$text-primary`/`$border-subtle`, never `$text-01`. Carbon paid for numbered roles with a breaking v10→v11 rename across every product. Bake the grammar (`element-role-order-state`) into Ply's DTCG naming lint from day one.
4. **Zone theming via data attributes.** Their `Theme`/zone pattern (`[data-carbon-theme='g100']` scopes custom properties) is exactly how Ply's Style Dictionary CSS output should work — any subtree can flip mode. Add a nested-theme Storybook story to test it.
5. **Per-component accessibility status.** A tiny Starlight page listing each component's axe/keyboard/SR verification state makes a11y visible and honest — Carbon's dashboard is the model; Ply's Storybook+axe run can generate it.
6. **CI-synced Figma mapping.** Carbon auto-publishes Code Connect from GitHub Actions. Ply's equivalent: a pipeline step that pushes token/description updates through the Figma MCC plugin API on merge, so Figma variables and DTCG JSON can't drift.
7. **"Token = role" definitions as docs template.** Carbon's one-line role statements per token are ideal content for Ply's `$extensions` usage docs — short, prescriptive, agent-readable.

**Avoid**
1. **Ten core groups + per-component tokens everywhere.** Carbon's theme surface is huge (plus `$button-primary`-style tokens per component) and needs a team to govern. Keep Ply's component tier thin — only mint a component token where the semantic tier is genuinely ambiguous.
2. **Sass-first theming.** `@use … with ($theme: …)` couples consumers to a compiler and forced Carbon's 90%-faster-Dart-Sass migration saga. Ply's CSS-custom-properties + TS pipeline is already the better architecture; don't import Sass-map idioms.
3. **Four themes.** g10/g90 exist for IBM's product zoning needs. Two modes (light/dark) are enough for a solo system; every extra theme multiplies Figma variable modes and QA.
4. **Multi-framework output.** Officially maintaining React + Web Components (plus blessing community forks) is a staffing model, not a design decision. Stay React Aria-only.
5. **Big-bang renames.** When a rename is unavoidable, ship alias tokens + deprecation metadata in DTCG `$extensions` rather than a v10→v11-style migration cliff.

### Sources

All retrieved 2026-07-05. Site pages verified against their [carbon-website](https://github.com/carbon-design-system/carbon-website) MDX sources (the live Gatsby site truncates in fetch tools).

- [Color overview / tokens](https://carbondesignsystem.com/elements/color/overview/) — layering model, ten core groups, state math
- [Themes overview](https://carbondesignsystem.com/elements/themes/overview/) — token vs role, Sass `with` customization
- [Spacing overview](https://carbondesignsystem.com/elements/spacing/overview/) — 13-token scale, Stack component
- [2x Grid overview](https://carbondesignsystem.com/elements/2x-grid/overview/) — mini unit, breakpoints
- [Typography overview](https://carbondesignsystem.com/elements/typography/overview/) — IBM Plex, productive/expressive sets
- [Accessibility overview](https://carbondesignsystem.com/guidelines/accessibility/overview/) — IBM checklist, tooling
- [Accessibility status dashboard](https://carbondesignsystem.com/components/overview/accessibility-status/) — AVT per component
- [Design kits: Figma](https://carbondesignsystem.com/designing/kits/figma/) — libraries, Figma variables
- [Frameworks: React](https://carbondesignsystem.com/developing/frameworks/react/) — official vs community support
- [Migration guide: design](https://carbondesignsystem.com/migrating/guide/design/) — naming grammar, v10→v11 renames
- [v11 migration doc](https://github.com/carbon-design-system/carbon/blob/main/docs/migration/v11.md) — package/Sass/prop changes
- [v11 release notes](https://v10.carbondesignsystem.com/whats-happening/v11-release/) — inline theming, token renaming
- [Theme.mdx](https://github.com/carbon-design-system/carbon/blob/main/packages/react/src/components/Theme/Theme.mdx) — GlobalTheme/Theme/useTheme
- [Carbon + Figma Code Connect (Medium, official)](https://medium.com/carbondesign/carbon-and-figma-code-connect-redefining-the-design-to-code-experience-836eb3f454fc) — CI-published mappings
- [Carbon for AI](https://carbondesignsystem.com/guidelines/carbon-for-ai/) · [AI label usage](https://carbondesignsystem.com/components/ai-label/usage/)
- [GitHub repo API](https://api.github.com/repos/carbon-design-system/carbon) — stars, license, activity
- [@carbon/react on npm](https://www.npmjs.com/package/@carbon/react) · [npm downloads API](https://api.npmjs.org/downloads/point/last-week/@carbon/react)
- [IBMa/equal-access](https://github.com/IBMa/equal-access) — accessibility-checker used for AVT
