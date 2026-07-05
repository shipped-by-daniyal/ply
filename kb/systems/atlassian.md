---
title: Atlassian Design System
updated: 2026-07-05
---

# Atlassian Design System (ADS)

## 1. Snapshot

- Owned by Atlassian's central Design System team (~35+ designers on the core team per Atlassian's own account); powers 20+ Atlassian apps (Jira, Confluence, Trello, Bitbucket, Loom, …) and the Forge/Connect ecosystem ([Inside Atlassian: "context engine" post](https://www.atlassian.com/blog/ai-at-work/atlassian-design-system-building-the-context-engine-for-the-ai-era), retrieved 2026-07-05).
- Ships as scoped npm packages under `@atlaskit/*`, **Apache-2.0**. `@atlaskit/tokens` is at **v15.3.1**, peer-depends on React 18.2/19 ([package.json in public mirror](https://bitbucket.org/atlassian/atlassian-frontend-mirror/raw/master/design-system/tokens/README.md), retrieved 2026-07-05). Source lives in an internal monorepo with a read-only public mirror at [bitbucket.org/atlassian/atlassian-frontend-mirror](https://bitbucket.org/atlassian/atlassian-frontend-mirror).
- Key links: docs [atlassian.design](https://atlassian.design); dev docs/changelogs [atlaskit.atlassian.com](https://atlaskit.atlassian.com); machine-readable [DESIGN.md](https://atlassian.design/DESIGN.md) and [llms.txt](https://atlassian.design/llms.txt); hosted ADS MCP server at `https://mcp.atlassian.com/v1/ads/public/mcp` + local [`@atlaskit/ads-mcp`](https://www.npmjs.com/package/@atlaskit/ads-mcp) (retrieved 2026-07-05).

## 2. Token architecture

- **Code is the source of truth.** Tokens are defined in `@atlaskit/tokens` and codegen'd with **Style Dictionary** (`codegen-tokens` script "runs style dictionary builds and generates token maps"; a `check-clean-git` step forbids hand-edited outputs) ([mirror package.json](https://bitbucket.org/atlassian/atlassian-frontend-mirror/raw/master/design-system/tokens/package.json), retrieved 2026-07-05).
- **Tiers**: a raw base palette (not part of the public API) feeds **semantic tokens**, which are the only sanctioned consumption layer. Color semantics split into four groups: neutrals/surfaces; meaning-carrying roles (`brand`, `danger`, `warning`, `success`, `information`, `discovery`); **decorative accent ramps** (10 hues × 4 emphasis steps, explicitly "no meaning tied to the color"); and chart tokens (`chart.categorical.1`–`8`) ([DESIGN.md](https://atlassian.design/DESIGN.md); [color foundations](https://atlassian.design/foundations/color), retrieved 2026-07-05). There is no formal third component-token tier in the published set; component "recipes" (e.g. `button-default` + `-hovered/-pressed/-disabled`) exist as documented compositions of semantic tokens in DESIGN.md.
- **Beyond color**: `space.0`–`space.1000` on an 8px rhythm (incl. negatives), `font.heading.*`/`font.body.*`/`font.code`, `border.radius.*` (2–16px + `full`), `border.width.*`, paired `elevation.surface.*`/`elevation.shadow.*` (raised/overlay/sunken), `opacity.*`, and motion `duration` (50–600ms) + `easing` tokens ([DESIGN.md](https://atlassian.design/DESIGN.md), retrieved 2026-07-05).
- **Delivery**: each theme is a set of CSS custom properties prefixed `--ds-`, injected as `<style data-theme="...">` blocks. In JS, a TypeScript-typed `token()` function (autocomplete over all token names) resolves to the CSS variable ([Forge design tokens & theming](https://developer.atlassian.com/platform/forge/design-tokens-and-theming/), retrieved 2026-07-05):

  ```ts
  import { token } from '@atlaskit/tokens';

  css({
    color: token('color.text.subtle'),
    backgroundColor: token('color.background.selected.bold'),
    padding: token('space.150'),
    boxShadow: token('elevation.shadow.raised'),
  });
  // → color: var(--ds-text-subtle); background-color: var(--ds-background-selected-bold); …
  ```

- Note the mapping quirk: the CSS variable **drops the foundation segment** of the dot name — `color.background.selected.bold` → `--ds-background-selected-bold`, `elevation.surface.raised` → `--ds-surface-raised`, `space.100` → `--ds-space-100`, `font.heading.large` → `--ds-font-heading-large`. Two spellings for every token.

## 3. Naming

- The grammar is **[foundation].[property].[role].[emphasis].[state]** — Atlassian phrases it as: *foundation* = visual attribute (`color`, `elevation`, `space`, `font`); *property* = the UI element it applies to (`background`, `text`, `border`, `icon`, `shadow`, `surface`); *modifiers* add role, emphasis, or interaction state ([design tokens overview](https://atlassian.design/foundations/tokens/design-tokens), retrieved 2026-07-05). "A design token's name describes how it should be used, and each part communicates one piece of its usage" — names encode decisions, not values.
- Decomposed examples:

  | Token | foundation | property | role | emphasis | state |
  |---|---|---|---|---|---|
  | `color.text.subtlest` | color | text | — | subtlest | — |
  | `color.background.danger.bold` | color | background | danger | bold | — |
  | `color.background.brand.bold.hovered` | color | background | brand | bold | hovered |
  | `color.background.accent.lime.subtlest` | color | background | accent.lime | subtlest | — |
  | `color.background.neutral.subtle.hovered` | color | background | neutral | subtle | hovered |
  | `color.border.focused` | color | border | — | — | focused |
  | `elevation.surface.raised` | elevation | surface | raised | — | — |
  | `space.100` | space | — | — | — | — |

- **Emphasis ladder**: `subtlest` → `subtler` → `subtle` → (default, unsuffixed) → `bold` → `bolder`. "Bolder colors have more contrast against the default surface, which adds more attention than subtle colors." Accent backgrounds use exactly four steps (`color.background.accent.lime.subtlest` … `.bolder`); text has `subtlest`/`subtle`/default plus `disabled` and `inverse` ([color foundations](https://atlassian.design/foundations/color); [all tokens](https://atlassian.design/components/tokens/all-tokens), retrieved 2026-07-05).
- **State suffixes** are part of the name, not a separate axis: `.hovered`, `.pressed` variants exist for every interactive appearance. DESIGN.md states the pairing rule: "Every appearance has matching `*-hovered` / `*-pressed` tokens" — never hand-author interaction states.
- `utility.elevation.surface.current` is a deliberate escape hatch that resolves to whatever surface the element sits on — the exception that proves how strict the rest of the grammar is.
- **Usage rules ride along with names**: semantic before decorative (use `color.background.danger.bold`, never `color.background.accent.red.bolder`, for destructive actions); pair `icon.danger` with `text.danger`; `elevation.surface.raised` pairs only with `elevation.shadow.raised` ([DESIGN.md](https://atlassian.design/DESIGN.md), retrieved 2026-07-05).
- Tokens have a lifecycle (active → deprecated → deleted); deprecations carry rename mappings that the ESLint plugin can auto-fix ([tokens changelog](https://atlaskit.atlassian.com/packages/design-system/tokens/changelog), retrieved 2026-07-05).

## 4. Theming

- Themes are alternate value sets for the same token names: `light`, `dark`, `legacy-light`/`legacy-dark` (migration aids), a single default typography theme (three older generations — `typography-adg3`, `typography-modernized`, `typography-refreshed` — were deprecated then removed), and a `spacing` theme ([tokens changelog](https://atlaskit.atlassian.com/packages/design-system/tokens/changelog), retrieved 2026-07-05). **Increased-contrast** color themes were built and tested behind feature flags keyed to OS contrast preference ([developer community announcement](https://community.developer.atlassian.com/t/introducing-design-tokens-new-colour-foundations-and-dark-mode/62258), retrieved 2026-07-05; current GA status unverified).
- Switching is explicit and deterministic — the `themeState` object maps each color mode to a named theme, so "the theme that renders when the system is in 'light' and 'dark' mode is deterministic" ([DC dark theme guide](https://developer.atlassian.com/platform/marketplace/dc-apps-preparing-for-dark-theme/), retrieved 2026-07-05):

  ```ts
  import { setGlobalTheme } from '@atlaskit/tokens';

  setGlobalTheme({ colorMode: 'auto', light: 'light', dark: 'dark' });
  // lazy-loads theme CSS, then stamps:
  // <html data-theme="light:light dark:dark spacing:spacing" data-color-mode="light">
  ```

  `colorMode: 'auto'` wires `prefers-color-scheme` listeners that flip `data-color-mode` live. The documented contract: **`data-color-mode` is the only attribute apps may read or modify**; `data-theme` internals may change ([Forge theming docs](https://developer.atlassian.com/platform/forge/design-tokens-and-theming/), retrieved 2026-07-05).
- Dark mode is not a mechanical inversion — dark values were hand-tuned (reduced saturation on subtle backgrounds, adjusted distinguishability) ([DC dark theme guide](https://developer.atlassian.com/platform/marketplace/dc-apps-preparing-for-dark-theme/), retrieved 2026-07-05).
- **Multi-brand: no.** Theming is mode-based (color/contrast/spacing/typography), not brand-based; third-party Forge/Connect apps inherit the host product's theme through the same tokens rather than re-skinning. No public density switch shipped beyond the spacing-theme groundwork (unverified).

## 5. Component anatomy & API style

- Components are individually versioned packages (`@atlaskit/button`, `@atlaskit/textfield`, …) with **props-based variants**: an `appearance` prop for semantic variants, `spacing` for size, and `is*` booleans (`isDisabled`, `isSelected`) — variant names deliberately mirror token roles, so the prop → token mapping is mechanical ([components overview](https://atlassian.design/components), retrieved 2026-07-05):

  ```tsx
  <Button appearance="danger" />   // → color.background.danger.bold (+ .hovered/.pressed)
  <Button appearance="subtle" />   // → color.background.neutral.subtle.*
  ```

- Component state matrices mirror token state suffixes 1:1 (`-hovered`, `-pressed`, `-selected`, `-disabled`, `-focused`, `-invalid` for text fields), per the recipes in [DESIGN.md](https://atlassian.design/DESIGN.md) (retrieved 2026-07-05).
- **Primitives** (`@atlaskit/primitives`): `Box`, `Stack`, `Inline`, `Grid`, `Flex`, `Text` are "token-backed low-level building blocks" — layout/spacing props only accept token values ([npm @atlaskit/primitives](https://www.npmjs.com/package/@atlaskit/primitives), retrieved 2026-07-05).
- **XCSS** is the constrained styling API: style objects where "the majority of style attributes will be restricted to Atlassian Design Token based values"; nested selectors are banned outright (pseudo-classes allowed) ([XCSS docs](https://developer.atlassian.com/platform/forge/ui-kit/components/xcss/), retrieved 2026-07-05). Runtime styling has migrated to build-time **Compiled CSS-in-JS**, policed by a "UI Styling Standard" ESLint ruleset ([llms.txt](https://atlassian.design/llms.txt), retrieved 2026-07-05).
- Docs style per component: live examples + code, usage do/don't guidance, and a dedicated accessibility tab; Atlaskit hosts prop tables and changelogs.

## 6. Accessibility approach

- Baseline: internal standards target **WCAG 2.1 AA**, with a stated commitment to WCAG 2.2 AA ([atlassian.com/trust WCAG page](https://www.atlassian.com/trust/compliance/resources/wcag), retrieved 2026-07-05).
- A11y lives in **all three places**: (1) the library — components ship keyboard support and ARIA semantics by default, and token pairings (text/background roles) bake in contrast; (2) the docs — a foundations [accessibility section](https://atlassian.design/foundations/accessibility) plus per-component accessibility guidance, including pattern-level guides like [Pragmatic drag and drop accessibility guidelines](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines); (3) tooling — the ADS MCP server exposes accessibility guidelines as agent-queryable tools ([npm @atlaskit/ads-mcp](https://www.npmjs.com/package/@atlaskit/ads-mcp), retrieved 2026-07-05).
- Increased-contrast themes (see §4) treat contrast as a theming concern, not a per-component patch.

## 7. Docs & tooling

- **Enforcement is the headline.** `@atlaskit/eslint-plugin-design-system` makes token usage a lint failure, not a convention ([ESLint plugin docs](https://atlassian.design/components/eslint-plugin-design-system/); [ensure-design-token-usage](https://atlassian.design/components/eslint-plugin-design-system/ensure-design-token-usage/), retrieved 2026-07-05):
  - `ensure-design-token-usage` — flags raw values per domain (`domains: ['color', 'spacing']`), forcing `token()` instead of hex/px;
  - `no-unsafe-design-token-usage` — bans unknown/experimental token names and polices fallbacks (`fallbackUsage: 'none'` forbids new fallbacks);
  - `no-deprecated-design-token-usage` — auto-fixes deprecated tokens to their renamed successors via the rename map;
  - teams just extend `plugin:@atlaskit/design-system/recommended` in `.eslintrc.js`.
- The **Babel plugin** (`@atlaskit/tokens/babel-plugin`) "replaces any calls to the token() function with the CSS value" at build time; with `shouldUseAutoFallback: true` it looks up the token's value in the default `atlassian-light` theme and inlines it as the CSS fallback, so UI degrades gracefully if theme CSS never loads ([tokens README](https://bitbucket.org/atlassian/atlassian-frontend-mirror/raw/master/design-system/tokens/README.md), retrieved 2026-07-05). A codemod CLI handles bulk migrations.
- **Figma story**: the current ADS Figma libraries were rebuilt to "match 1:1 with the React components," are built on **Figma Variables synced to the design tokens** (library v2.0.0+), and support dark-mode switching in-file; an official **"Atlassian Design Tokens" Figma plugin** applies tokens "faster than Figma's native style panel," previews designs in dark mode, and migrates legacy styles to tokens ([Figma libraries overview](https://atlassian.design/resources/figma-library); [figma.com/@atlassian](https://www.figma.com/@atlassian), retrieved 2026-07-05). Direction of sync is code → Figma: token releases propagate into the variable-backed libraries. An icon-contribution Figma plugin is used by 550+ designers ([context engine post](https://www.atlassian.com/blog/ai-at-work/atlassian-design-system-building-the-context-engine-for-the-ai-era), retrieved 2026-07-05).
- **AI-era surface (2025–26)**: machine-readable [DESIGN.md](https://atlassian.design/DESIGN.md) and llms.txt generated from the system, ADS MCP server (hosted + npm), and agent "skills." Atlassian reports 52% accuracy improvement in AI calls, 34% faster ADS tasks, 26% fewer tool calls, 16% lower token usage, and a Figma-mockup-to-production-React homepage redesign in ~20 minutes using Figma MCP + ADS MCP ([context engine post](https://www.atlassian.com/blog/ai-at-work/atlassian-design-system-building-the-context-engine-for-the-ai-era); [Rovo Dev homepage post](https://www.atlassian.com/blog/development/redesigning-homepage-20-minutes-with-rovo-dev), retrieved 2026-07-05).

## 8. Steal / avoid for Ply

**Steal**
- **The emphasis ladder + state suffixes as the semantic-tier grammar.** `subtlest/subtler/subtle/(default)/bold/bolder` plus `.hovered/.pressed` gives agents a *deterministic* naming pattern — an agent can derive a hover token from a rest token without lookup. Adopt for Ply's semantic tier and encode the ladder + pairing rule in DTCG `$extensions` usage docs so the MCP pipeline can enforce it.
- **Semantic vs decorative accent split.** Reserving `danger/success/warning/info/brand` for meaning and a separate accent namespace for "color with no meaning" prevents the classic "red accent on a delete button" drift. Ply's semantic tier should name meaning first; add accent ramps only when charts/tags demand them.
- **Lint-enforced token usage.** Atlassian's biggest lesson: tokens without enforcement decay. Ply's plain-CSS analog is cheap — a Stylelint/ESLint rule banning raw hex/px in component CSS, plus a deprecation-rename map in the token build so migrations are one `--fix` away. Critical for a solo maintainer.
- **Build-time fallback inlining.** The Babel plugin's `var(--token, fallback)` trick translates directly to Style Dictionary v4: emit light-mode values as fallbacks so Storybook embeds and copy-pasted snippets never render unstyled.
- **Publish the machine-readable layer.** DESIGN.md + llms.txt + MCP is precisely Ply's thesis, validated at scale with measured numbers. Generate a DESIGN.md-style artifact from Ply's DTCG JSON (the `$extensions` usage docs are the raw material) and serve it from Starlight.
- **One documented switching attribute.** Copy the `data-color-mode` contract: Ply's light/dark CSS should key off a single documented `data-theme` attribute and declare everything else internal — keeps the Figma-variables → Style Dictionary mode mapping stable.

**Avoid**
- **Divergent JS vs CSS token names** (`color.background.selected.bold` vs `--ds-background-selected-bold`). Two grammars for one token doubles what agents and docs must teach. Keep Ply's DTCG path identical to the CSS var name modulo a `--ply-` prefix.
- **Runtime theme-CSS injection machinery.** `setGlobalTheme` lazy-loading per-theme stylesheets solves a 20-app-scale problem. One stylesheet with `:root` + `[data-theme="dark"]` blocks is correct at Ply's scale.
- **Parallel theme-generation churn.** Three deprecated typography theme ids before consolidation shows the cost of shipping theme variants as separate ids. Version Ply's tokens semantically; never fork modes into named generations.
- **Custom compiler tooling.** Babel plugin, XCSS, Compiled, codemod CLI — a 35-person team's answer to CSS-in-JS at scale. Ply's React Aria + plain CSS stack already avoids the problem; don't re-import it.
- **Full accent-ramp surface area up front.** 10 hues × 4 emphasis × states is hundreds of tokens to maintain and sync to Figma. Start with semantic roles; grow accents on demand.

## Sources

Primary: [atlassian.design design tokens](https://atlassian.design/foundations/tokens/design-tokens) · [all tokens](https://atlassian.design/components/tokens/all-tokens) · [color foundations](https://atlassian.design/foundations/color) · [DESIGN.md](https://atlassian.design/DESIGN.md) · [llms.txt](https://atlassian.design/llms.txt) · [ESLint plugin](https://atlassian.design/components/eslint-plugin-design-system/) · [tokens README (mirror)](https://bitbucket.org/atlassian/atlassian-frontend-mirror/raw/master/design-system/tokens/README.md) · [tokens changelog](https://atlaskit.atlassian.com/packages/design-system/tokens/changelog) · [Forge tokens & theming](https://developer.atlassian.com/platform/forge/design-tokens-and-theming/) · [Figma libraries](https://atlassian.design/resources/figma-library) · [accessibility foundations](https://atlassian.design/foundations/accessibility) · [WCAG commitment](https://www.atlassian.com/trust/compliance/resources/wcag) · [context engine post](https://www.atlassian.com/blog/ai-at-work/atlassian-design-system-building-the-context-engine-for-the-ai-era) · [ads-mcp](https://www.npmjs.com/package/@atlaskit/ads-mcp). All retrieved 2026-07-05.
