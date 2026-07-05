---
title: Primer (GitHub)
updated: 2026-07-05
---

## 1. Snapshot

- **Owner:** GitHub's internal Primer team; everything open source under MIT ([primer.style/about](https://primer.style/about/), retrieved 2026-07-05).
- **Scale:** powers github.com product UI plus GitHub marketing/brand surfaces.
  - Primer React v38.30.0 (June 2026), ~3.9k stars ([primer/react](https://github.com/primer/react), retrieved 2026-07-05).
  - `@primer/primitives` v11.9.0 (May 2026) ([primer/primitives](https://github.com/primer/primitives), retrieved 2026-07-05).
  - Primer CSS v22.3.0 (June 2026), ~13k stars ([primer/css](https://github.com/primer/css), retrieved 2026-07-05).
- **2025–26 direction — major consolidation around Primer React + CSS variables as the single supported implementation:**
  - **Primer ViewComponents (Rails)** entered maintenance mode Feb 2026: security/critical fixes only, "No new features or enhancements will be accepted"; new projects are told to adopt Primer React, existing users invited to fork ([discussion #3908](https://github.com/primer/view_components/discussions/3908), retrieved 2026-07-05).
  - **Primer CSS** is in "KTLO mode" (keep-the-lights-on): utility classes only; README redirects to primer/react ([primer/css README](https://github.com/primer/css), retrieved 2026-07-05).
  - **primer/design** (guidelines repo) archived July 7, 2025; **primer/react-toolchain** archived Aug 2025; guidance consolidated into a restructured primer.style ([primer/design](https://github.com/primer/design), retrieved 2026-07-05).
  - Marketing surfaces use a separate **Primer Brand** track ("Brand UI" on the site) with its own token prefix ([primer.style](https://primer.style/), retrieved 2026-07-05).
- **Shared foundations** span both tracks: Octicons (icon library), Primitives (tokens), and Accessibility guidelines ([primer.style](https://primer.style/), retrieved 2026-07-05).
- **Key links:** [primer.style](https://primer.style/) · [primer/react](https://github.com/primer/react) · [primer/primitives](https://github.com/primer/primitives) · [figma.com/@primer](https://www.figma.com/@primer)

## 2. Token architecture

- **Three tiers** ([token names](https://primer.style/product/primitives/token-names/), [color usage](https://primer.style/product/getting-started/foundations/color-usage/), retrieved 2026-07-05):
  1. **Base** — raw values, reference-only, never used directly in product code: `base-size-4`, `base-color-green-5`, `base-fontWeight-semibold`.
  2. **Functional** — global semantic decisions that respect color modes: `fgColor-muted`, `bgColor-inset`, `borderColor-default`, `boxShadow-inset-thick`. The workhorse tier.
  3. **Component/pattern** — reserved for component CSS when functional tokens don't suffice: `button-primary-bgColor-hover`, `control-danger-borderColor-rest`.
- **Authoring:** JSON5 token files in `src/tokens/`, compiled with **Style Dictionary ^5.0.0** (as of v11.9.0) ([package.json](https://raw.githubusercontent.com/primer/primitives/main/package.json), retrieved 2026-07-05).
- Custom build steps handle per-color-mode **extend/override**, alpha adjustment, and color mixing ([primer/primitives](https://github.com/primer/primitives), retrieved 2026-07-05).
- **Outputs:** one CSS custom-property file per theme in `dist/css/`, plus structured token JSON.
- **`$extensions` metadata** on tokens carries Figma **collection, mode, and scopes** "for our Figma export" — sync config lives inside the token source ([primer/primitives README](https://github.com/primer/primitives), retrieved 2026-07-05).
- **Hard rule** from their `DESIGN_TOKENS_GUIDE.md`: "Never use raw values (hex, px, etc.). Only use semantic tokens."
- The same guide defines a **color-pairing logic matrix**: `bgColor-*-emphasis` pairs with `fgColor-onEmphasis`, `bgColor-*-muted` with semantic fg colors, `bgColor-default` with `fgColor-default` ([guide](https://github.com/primer/primitives/blob/main/DESIGN_TOKENS_GUIDE.md), retrieved 2026-07-05).
- Control sizing follows a `--control-[size]-[property]` pattern (e.g. densities via `--controlStack-small-gap-condensed`) (same guide + [migration guide](https://primer.style/foundations/primitives/migrating/), retrieved 2026-07-05).

## 3. Naming

- **Grammar:** `[prefix]-[namespace]-[pattern]-[variant]-[property]-[variant]-[scale]` — only **property is mandatory**; multi-word segments are camelCase ([token names](https://primer.style/product/primitives/token-names/), retrieved 2026-07-05).
  - **prefix** = encapsulation (`brand-` for marketing tokens); **namespace** = scope (`base`); **pattern** = component/decision (`button`, `control`);
  - **property** ≈ CSS property or concept (`bgColor`, `borderWidth`, `fontStack`); **variant** = stylistic modifier; **scale** = ordinal/state (`hover`, `thick`, `4`).
- **Closed modifier vocabularies:**
  - color: `default | muted | emphasis` (+ `onEmphasis` for content sitting on emphasis backgrounds);
  - size: `xsmall … xxlarge`; density: `condensed | normal | spacious`; thickness: `thin | thick | thicker`.
- **Real examples by tier:**
  - base: `base-size-4` (spacing scale runs `--base-size-4 … --base-size-128`);
  - functional: `--fgColor-default`, `--bgColor-inset`, `--borderRadius-full`, `--fontStack-monospace`;
  - typography splits title vs body roles: `--text-title-size-medium`, `--text-body-size-large`;
  - component: `button-primary-bgColor-hover`, `control-danger-borderColor-rest`.
- **The v8 rename** (the `--fgColor-*`/`--bgColor-*` migration): old kebab, role-nested names became property-first camelCase —
  - `--color-fg-default` → `--fgColor-default`; `canvas.default` → `--bgColor-default`; spacing → `--base-size-4…128`; borders → `--borderWidth-thin|thick|thicker`, `--borderRadius-small|medium|large|full`.
  - Shipped with old→new mapping tables and staged fallback chains `var(--new, var(--legacy, #hex))` ([migration guide](https://primer.style/foundations/primitives/migrating/), [theme reference](https://primer.style/product/getting-started/react/theme-reference/), retrieved 2026-07-05).

## 4. Theming

- **Two color modes × nine themes:** `light`, `light-high-contrast`, `light-colorblind`, `light-tritanopia`, `dark`, `dark-dimmed`, `dark-high-contrast`, `dark-colorblind`, `dark-tritanopia` ([primer/primitives](https://github.com/primer/primitives), [color usage](https://primer.style/product/getting-started/foundations/color-usage/), retrieved 2026-07-05).
- Each theme is a full CSS file redefining the **same variable names** — components never know which theme is active.
- **Switching = HTML data attributes**, zero JS re-render:
  - `<html data-color-mode="auto|light|dark" data-light-theme="light" data-dark-theme="dark_dimmed">`;
  - `auto` follows `prefers-color-scheme`; the two theme attributes pick which named theme serves each mode ([Primitives docs](https://primer.style/product/primitives/), retrieved 2026-07-05).
- **JS theming is dead:** v38 (Oct 2025) removed styled-components, the `sx` prop, styled-system props, and theme-via-context; ThemeProvider's `colorMode/dayScheme/nightScheme` are deprecated in favor of CSS variables + CSS Modules ([v38 release](https://github.com/primer/react/discussions/7086), retrieved 2026-07-05).
- **Multi-brand:** not in the product token set — marketing gets separate `brand-` prefixed tokens and the Primer Brand library.
- **Density:** no global density mode; density is encoded per-token via the `condensed | normal | spacious` scale.

## 5. Component anatomy & API style

- **Props conventions** (Button as exemplar, [Button docs](https://primer.style/product/components/button), retrieved 2026-07-05):
  - `variant="default | primary | invisible | danger"`, `size="small | medium | large"`;
  - visual slots as props: `leadingVisual` / `trailingVisual` / `trailingAction`;
  - state/behavior: `block`, `count`, `loading` (auto-sets `aria-disabled`), `inactive`, `labelWrap`;
  - polymorphism via `as='a'` + required `href`.
- Composite components use dot-notation subcomponents (e.g. `ActionList.Item`) (unverified against current docs).
- **v38 API philosophy:** ESM-only package; styling via `className` + CSS Modules; utility/styling components removed outright (`Box`, `PointerBox`, `Caret`, `AvatarPair`, `CircleOcticon`, `AvatarToken`) — consumers are pushed toward plain HTML + tokens instead of prop-driven styling ([v38 release](https://github.com/primer/react/discussions/7086), retrieved 2026-07-05).
- **Docs style per component:** Overview / Guidelines / Accessibility tabs, then per-implementation links — React → Storybook + source, Rails → Lookbook, plus a Figma link — with lifecycle status badges (e.g. "ready") rather than duplicated prop tables ([Button docs](https://primer.style/product/components/button), retrieved 2026-07-05).
- **Formal component lifecycle** with six stages and gate criteria ([contribution guidelines](https://primer.github.io/contribute/component-lifecycle/), retrieved 2026-07-05):
  - `experimental → alpha → beta → stable → deprecated → removed`;
  - **alpha** gate: zero axe violations + manual a11y review, VRT + unit coverage, responsive validation;
  - **beta** gate: systems-designer design review, performance assessment, Storybook sandbox docs;
  - **stable** gate: complete docs, API stable ≥1 month, **Figma component published in Primer Web**, linters/codemods discouraging alternatives;
  - **deprecated/removed**: documented alternatives, one-month notice, migration docs.

## 6. Accessibility approach

- **Target:** WCAG 2.2 AA, plus Section 508 ([accessibility at GitHub](https://primer.style/guides/accessibility/accessibility-at-github/), retrieved 2026-07-05).
- **In the library:** "AVT" (Accessibility Verification Testing) — Playwright drives Storybook stories tagged `@avt` through **axe** checks; a dedicated `avt` CI job runs on every PR alongside visual regression (`vrt`) ([testing docs](https://github.com/primer/react/blob/main/contributor-docs/testing.md), retrieved 2026-07-05).
- **In the tokens:** colorblind, tritanopia, and high-contrast themes are first-class token modes, not component forks.
- **In design:** an **Annotation Toolkit** (Figma) captures a11y intent beyond visuals; a Scenarios Framework structures audits.
- **In the org:** embedded accessibility designers, an Accessibility Champions program, and feedback panels including users with disabilities ([accessibility guides](https://primer.style/guides/accessibility/accessibility-at-github/), retrieved 2026-07-05).
- **In the docs:** every component page has a dedicated Accessibility tab.
- **In governance:** a11y is a lifecycle gate, not an afterthought — a component cannot even reach *alpha* with axe violations, and manual accessibility review is required before preliminary use ([component lifecycle](https://primer.github.io/contribute/component-lifecycle/), retrieved 2026-07-05).

## 7. Docs & tooling

- **Site:** primer.style restructured (2025) into **Product UI / Brand UI / Brand Toolkit** with shared foundations (Octicons, Primitives, Accessibility); the old primer/design guidelines repo is archived ([primer.style](https://primer.style/), retrieved 2026-07-05).
- Docs are **hub-and-spoke**: guidance on primer.style; live API truth in Storybook (React) and Lookbook (Rails).
- **Figma libraries:** **Primer Web** (components), **Primer Primitives** (tokens), **Octicons**, internal-only **Primer Mobile**; community mirrors at [figma.com/@primer](https://www.figma.com/@primer) ([Figma libraries](https://primer.style/product/getting-started/figma/), retrieved 2026-07-05).
- Tokens surface in Figma as **variables** (color + size; aliasing, per-mode values, scoping) with legacy **styles** still covering text/shadows; the stated goal is to move everything to variables (same source).
- **Direction of sync: code → Figma.** Token JSON is the source of truth; `$extensions` (collection/mode/scopes) drives the Figma variables export ([primer/primitives](https://github.com/primer/primitives), retrieved 2026-07-05). Note: this is the **opposite** direction from Ply's Figma-as-source pipeline.
- Figma library contribution is employee-only, with `@username/change` branch conventions ([Figma libraries](https://primer.style/product/getting-started/figma/), retrieved 2026-07-05).
- **Migration tooling:** published old→new token mapping tables, `var(--new, var(--old, #hex))` fallback chains, and a **VS Code extension** automating React → CSS Modules conversion ([migration guide](https://primer.style/foundations/primitives/migrating/), retrieved 2026-07-05).

## 8. Steal / avoid for Ply

**Steal**
1. **Property-anchored camelCase grammar with closed modifier vocab** (`fgColor-muted`; `default|muted|emphasis`; `condensed|normal|spacious`). Small enumerable vocabularies are ideal for agentic linting and LLM token selection — encode Ply's grammar the same way and validate it in the Style Dictionary build.
2. **The fg/bg pairing matrix as data.** Primer documents which `fgColor` legally sits on which `bgColor`. Put a `pairsWith` field into Ply's DTCG `$extensions` next to the usage docs — an agent can then auto-check contrast pairings when generating UI.
3. **Themes as token modes + data-attribute switching.** Nine themes from one token source, switched by `data-color-mode` / `data-*-theme` attributes with zero JS. Ply's light/dark CSS output should use the same attribute pattern — it leaves room for high-contrast or colorblind modes later without touching components.
4. **Figma sync config inside token `$extensions`** (collection/mode/scopes). Ply already stores usage docs in `$extensions`; add Figma collection/mode/scope metadata there too so the MCP-plugin round-trip stays lossless.
5. **AVT: axe against tagged Storybook stories in CI.** Maps directly onto Ply's Storybook + axe stack — tag stories, run axe per story **per theme**, gate merges on it.
6. **Hub-and-spoke docs.** primer.style links to Storybook/source instead of duplicating prop tables. Have Starlight link to Storybook for live API truth; hand-write only guidance and rationale.
7. **Lifecycle stages with checkable gates.** "Zero axe violations to reach alpha; Figma component published to reach stable" is a rubric an agent can enforce. Ply should adopt a lightweight version (experimental → stable) with the same machine-checkable criteria per stage.

**Avoid**
1. **Multi-implementation sprawl.** Primer spent 2025–26 killing its own duplicates (ViewComponents → maintenance mode, CSS → KTLO, design repo archived). A solo designer should ship exactly one implementation: React Aria + plain CSS.
2. **Runtime JS theming and styling props.** Primer burned two major versions (v37–v38) removing styled-components, `sx`, and `Box`. Ply is already CSS-variables-first — never add a theme context or token-prop utility components.
3. **Renaming without a bridge.** The v8 `--fgColor-*` rename only worked because of mapping tables, fallback chains, and a VS Code migration extension. Lock Ply's grammar early; if a rename is ever needed, generate alias fallbacks from the old names in the SD build.
4. **Nine themes on day one.** That breadth is justified by GitHub's scale and a11y obligations. For Ply: ship light/dark, keep the mode architecture ready for a future high-contrast theme, and skip colorblind variants until there's a real user need.

## Sources

All retrieved 2026-07-05:
[primer.style](https://primer.style/) · [Component lifecycle](https://primer.github.io/contribute/component-lifecycle/) · [Token names](https://primer.style/product/primitives/token-names/) · [Color usage](https://primer.style/product/getting-started/foundations/color-usage/) · [Migrating to CSS variables](https://primer.style/foundations/primitives/migrating/) · [Theme reference](https://primer.style/product/getting-started/react/theme-reference/) · [Figma libraries](https://primer.style/product/getting-started/figma/) · [Button](https://primer.style/product/components/button) · [Accessibility at GitHub](https://primer.style/guides/accessibility/accessibility-at-github/) · [primer/primitives](https://github.com/primer/primitives) · [DESIGN_TOKENS_GUIDE.md](https://github.com/primer/primitives/blob/main/DESIGN_TOKENS_GUIDE.md) · [primitives package.json](https://raw.githubusercontent.com/primer/primitives/main/package.json) · [primer/react](https://github.com/primer/react) · [testing.md](https://github.com/primer/react/blob/main/contributor-docs/testing.md) · [Primer React v38 release](https://github.com/primer/react/discussions/7086) · [PVC maintenance mode #3908](https://github.com/primer/view_components/discussions/3908) · [primer/css](https://github.com/primer/css) · [primer/design (archived)](https://github.com/primer/design)
