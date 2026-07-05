---
title: Spectrum (Adobe)
updated: 2026-07-05
---

# Spectrum (Adobe) — design-system dossier

## 1. Snapshot

- **Owner:** Adobe Design; serves Adobe's product ecosystem (Creative Cloud, Document Cloud, Experience Cloud). Code is open source under **Apache-2.0** across all repos ([spectrum-design-data](https://github.com/adobe/spectrum-design-data), retrieved 2026-07-05).
- **Spectrum 2 (S2) status:** S2 is now the production generation. `@react-spectrum/s2` hit **v1.0 on 2025-12-16** — first stable release, built on React Aria Components with build-time "style macros" ([release notes](https://react-spectrum.adobe.com/releases/v1-0-0), retrieved 2026-07-05). S2 token data has **graduated to `main`** in spectrum-design-data; S1 lives on the `s1-legacy` branch as `v12.x` npm releases ([repo README](https://github.com/adobe/spectrum-design-data), retrieved 2026-07-05). Spectrum Web Components 1.0 supports S2 via `<sp-theme system="spectrum-two">` ([SWC migration guide](https://opensource.adobe.com/spectrum-web-components/migrating-to-spectrum2/), retrieved 2026-07-05).
- **Key repos/sites:** guidelines [spectrum.adobe.com](https://spectrum.adobe.com) (still largely S1) + [s2.spectrum.adobe.com](https://s2.spectrum.adobe.com) (S2 vision/announcement site, not a full guidelines replacement — observed 2026-07-05); code docs [react-spectrum.adobe.com](https://react-spectrum.adobe.com) and [react-aria.adobe.com](https://react-aria.adobe.com) (React Aria got its own domain in the Dec 2025 docs overhaul); design data [github.com/adobe/spectrum-design-data](https://github.com/adobe/spectrum-design-data) (renamed from `spectrum-tokens`; npm names unchanged: `@adobe/spectrum-tokens`, `@adobe/spectrum-component-api-schemas`, `@adobe/spectrum-design-data-mcp`).
- **Implementations:** react-spectrum (S1 v3 + S2), spectrum-web-components (Lit), spectrum-css, plus UXP surfaces inside Creative Cloud apps.

## 2. Token architecture

- **Three tiers, explicitly documented:** *global tokens* (context-agnostic primitives: palette, dimensions, type), *alias tokens* (purpose-named, "the recommended type to use when building your product"), and *component-specific tokens* ("an exhaustive representation of every value associated with a component," usually inheriting from aliases) ([Design tokens](https://spectrum.adobe.com/page/design-tokens/), retrieved 2026-07-05).
- **Source of truth is versioned JSON** in `packages/tokens/src` (S2, main branch): `color-palette.json`, `semantic-color-palette.json`, `color-aliases.json` (~170 tokens), `color-component.json` (~73), `layout.json` (~359), `layout-component.json`, `typography.json`, `icons.json` (listed via GitHub API, 2026-07-05).
- **Not DTCG.** Each token carries a custom `$schema` URL (e.g. `…/schemas/token-types/color-set.json`), a **`uuid`** (on the token *and* on every per-mode value), optional `description`, a `component` field on component tokens, and lifecycle fields `deprecated` / `deprecated_comment` / `renamed` ([tokens README](https://github.com/adobe/spectrum-design-data/blob/main/packages/tokens/README.md), retrieved 2026-07-05).
- **Modes are encoded as `sets` inside one token record.** Color tokens are `color-set`s keyed `light` / `dark` / `wireframe`; dimension tokens that vary by platform are `scale-set`s keyed `desktop` / `mobile`. Aliasing uses `{token-name}` references. Observed example (retrieved 2026-07-05):

  ```json
  "accent-background-color-default": {
    "$schema": ".../token-types/color-set.json",
    "uuid": "e05251ac-...",
    "sets": {
      "light": { "value": "{accent-color-900}" },
      "dark":  { "value": "{accent-color-800}" }
    }
  }
  ```

- **Sibling packages** make the data machine-consumable: `component-schemas` (JSON Schemas validating component option APIs), `token-names` (a taxonomy package mapping token slugs to parsed metadata like `property`, `colorFamily`, `scaleIndex` — decoupled "so taxonomy changes don't bump `@adobe/spectrum-tokens`"), and `design-data` (canonical dataset: tokens, components, fields, mode-sets) (repo README + token-names README, retrieved 2026-07-05).

## 3. Naming

- **Flat kebab-case, no tier prefix.** The grammar is roughly `[component-]concept-property[-orientation][-state|-size]`:
  - Alias + state: `accent-background-color-default` / `-hover` / `-down` / `-key-focus` (note: `down` not "active/pressed"; `key-focus` singles out keyboard focus).
  - Scale-aware dimension: `base-padding-horizontal-2x-large` (desktop 18px / mobile 14px).
  - Component token: `action-bar-border-color`, `avatar-opacity-disabled` (component name leads).
  - Global palette: `blue-100`…`blue-1600`, `gray-400`, `transparent-white-25`.
- **T-shirt sizes are spelled out** in token names: `extra-small`, `medium`, `extra-large`, `2x-large` — no ambiguous `xs/xl` abbreviations in the data layer (observed in `layout.json`, 2026-07-05).
- Because names are flat, Spectrum needs the separate `token-names` taxonomy package to recover structure (which segment is the property, state, scale index) — the name alone doesn't encode tier.
- Renames are machine-traceable: `renamed` points old → new, and stable `uuid`s survive renames.

## 4. Theming

- **Color themes** ship as per-token `sets`: `light`, `dark`, plus a `wireframe` theme in the S2 data (observed 2026-07-05). Switching = resolving a different set; in React Spectrum via `<Provider colorScheme>`, in SWC via `<sp-theme color="light|dark">`.
- **Platform scale is a second, orthogonal mode axis.** Spectrum defines two global scales — **medium (desktop/cursor)** and **large (mobile/touch)** — that resize *every* component and are encoded as `desktop`/`mobile` sets on dimension tokens ([Platform scale](https://spectrum.adobe.com/page/platform-scale/), retrieved 2026-07-05). SWC exposes it as `<sp-theme scale="medium|large">`.
- **Scale ≠ t-shirt size:** "Scale refers to the overall size of all of the components on the page… t-shirt sizes represent the size of a specific component, set as a variant (e.g. `size="M"`); a component with t-shirt sizing is still affected by scale" (Platform scale page, retrieved 2026-07-05). Both compose: a `size="S"` button is still bigger on mobile scale.
- **Multi-brand:** not a goal — Spectrum themes are Adobe-internal contexts (light/dark/wireframe), not white-labeling. S2's pitch is adapting across desktop/web/mobile/mixed-reality contexts ([s2.spectrum.adobe.com](https://s2.spectrum.adobe.com), retrieved 2026-07-05).

## 5. Component anatomy & API style

- **Four-layer architecture** (the part Ply shares): `react-stately` (headless state hooks) → `react-aria` (behavior + a11y hooks) → **React Aria Components** (unstyled components with render props, slots, and state **data attributes** like `data-hovered`, `data-pressed`, `data-focus-visible`) → `@react-spectrum/s2` (Spectrum-styled layer **built on React Aria Components**) ([react-spectrum README](https://github.com/adobe/react-spectrum) + [v1.0 release](https://react-spectrum.adobe.com/releases/v1-0-0), retrieved 2026-07-05).
- **Prop conventions:** boolean props prefixed `is*` (`isDisabled`, `isQuiet`), press events (`onPress`, `onHoverStart`) instead of raw DOM events, `variant` for semantic emphasis (accent/primary/negative), `size` for t-shirt sizing ([react-aria.adobe.com/quality](https://react-aria.adobe.com/quality), retrieved 2026-07-05; prop grammar (unverified) beyond examples seen in docs).
- **S2 styling = the `style()` macro:** runs at **build time**, emits atomic CSS classes, and **only accepts Spectrum token values** for color/space/type. Conditional values key off breakpoints and runtime states: `style({ padding: { default: 8, lg: 32 }, backgroundColor: { isSelected: 'accent' } })`. Spectrum components accept a `styles` prop restricted to layout/spacing/position only — internal colors/padding are locked to protect design integrity ([Styling docs](https://react-spectrum.adobe.com/styling), retrieved 2026-07-05).
- **Docs style per component:** guidelines pages cover anatomy diagrams, options (variants, t-shirt sizes), behaviors, usage do/don'ts, and accessibility; code docs pair these with live interactive examples driven by prop controls (Dec 2025 docs overhaul, [v1.0 release](https://react-spectrum.adobe.com/releases/v1-0-0), retrieved 2026-07-05).

## 6. Accessibility approach

- **A11y lives in the library layer, not just docs.** React Aria implements WAI-ARIA / ARIA Authoring Practices semantics, focus management, and keyboard navigation in the hooks themselves; every consumer of the hooks inherits it ([react-aria.adobe.com/quality](https://react-aria.adobe.com/quality), retrieved 2026-07-05).
- **Tested against real AT matrices:** VoiceOver (macOS Safari/Chrome, iOS), JAWS (Windows Firefox/Chrome), NVDA (Windows Firefox/Chrome), TalkBack (Android Chrome) (same source).
- **Interaction normalization** across mouse/touch/keyboard/AT (e.g. no sticky hover on touch), exposed as data attributes for styling — a11y state and styling hooks are the same API.
- **Internationalization as part of quality:** localized strings for 30+ languages, RTL layouts, calendar/numbering systems, via the `internationalized` packages (same source).
- Guidelines site adds per-component a11y and keyboard-interaction documentation; "inclusive" is a named S2 design principle (s2.spectrum.adobe.com, retrieved 2026-07-05).

## 7. Docs & tooling

- **Docs overhaul (Dec 2025):** rewritten React Spectrum + React Aria sites with interactive prop-control examples, better search, **AI-friendly markdown for every page, MCP servers, and docs packaged as Agent Skills** for AI coding tools ([v1.0 release](https://react-spectrum.adobe.com/releases/v1-0-0), retrieved 2026-07-05).
- **Design data as a public API:** `@adobe/spectrum-design-data-mcp` is an MCP server giving agents structured access to tokens/components; the repo also ships a reusable "Design Data Skill" for Claude agents ([repo README](https://github.com/adobe/spectrum-design-data), retrieved 2026-07-05).
- **Token Diff Generator:** CLI + library reporting token changes between any two releases/branches — added/deleted/renamed/deprecated/updated — powering release notes and migration (same source).
- **Visualizers:** hosted S1 and S2 token visualizers + an S2 tokens viewer for browsing resolved values (same source).
- **Figma integration:** Adobe ships a **Component Options Editor Figma plugin** for authoring/editing component option schemas (visual UI + JSON validation) — i.e., Figma is used to author *API schemas*, not just visuals (repo README, retrieved 2026-07-05). Historically Spectrum distributed XD UI kits ([UI kits page](https://spectrum.adobe.com/page/ui-kits/)); official public S2 Figma libraries were not confirmed as of retrieval — community Figma recreations exist (unverified whether any official public kit exists).
- **Release engineering:** pnpm + Moon monorepo, Changesets versioning, validation snapshots for token data (repo README, retrieved 2026-07-05).

## 8. Steal / avoid for Ply

**Steal:**
- **"Alias tokens are the recommended type" as an explicit rule.** Write the same rule into Ply's docs and token `$extensions` usage notes: semantic tier is the default; primitives are for defining semantics, component tokens for component CSS. Spectrum proves the 3-tier model at scale — Ply's tiering is validated, but Spectrum shows the *policy* matters as much as the tiers.
- **Modes as sets on one token record.** Spectrum's `sets: {light, dark}` / `{desktop, mobile}` is exactly Figma variable modes → Style Dictionary output. Ply already does light/dark; **reserve a second mode axis for density/scale now** (even if unshipped) so token names never bake in "desktop" assumptions.
- **Scale vs t-shirt size orthogonality.** Keep component `size` props independent from any global density mode, and spell sizes out in token names (`extra-large`, `2x-large`) as Spectrum does — abbreviation collisions (`xl` vs `extra-large`) are a real agent-parsing hazard.
- **Machine-readable token lifecycle.** Stable `uuid` + `deprecated`/`renamed` fields let tooling auto-migrate usages across renames. Ply can put `uuid`, `deprecated`, and `renamedTo` under `$extensions.ply.*` in the DTCG export — cheap now, invaluable once agents refactor token usage.
- **Token diff reports per release.** A small script diffing DTCG JSON between builds → changelog input for `ply-update-docs`. Spectrum treats this as core release tooling, not an afterthought.
- **Docs as agent food.** Spectrum ships per-page markdown, MCP servers, and Agent Skills for both docs and design data. For an agentic system this is Ply's north star: expose Starlight pages as raw markdown (llms.txt), and consider a tiny MCP wrapper over Ply's token JSON — Adobe's `spectrum-design-data-mcp` is the reference implementation.
- **Style via RAC data attributes.** S2 sits on React Aria Components — the same foundation as Ply. Steal their CSS hooks: style states through `data-hovered`/`data-pressed`/`data-focus-visible` selectors in plain CSS, and inherit their AT-tested behavior for free.
- **Component-API-as-schema.** `@adobe/spectrum-component-api-schemas` validates that design options and code props agree. A lightweight version for Ply: one JSON schema per component (variants/sizes/booleans) that both Storybook stories and Figma component properties are checked against.

**Avoid:**
- **Custom token schema.** Spectrum's per-token `$schema`/`sets` format predates DTCG and now requires bespoke validators, visualizers, and a separate taxonomy package. Ply should stay strictly DTCG + `$extensions`; Style Dictionary v4 and third-party tools then work out of the box.
- **Flat, prefix-less token names.** Spectrum needs a whole `token-names` package to recover which segment of `accent-background-color-default` is what. Ply's tier-prefixed naming keeps names self-parsing for agents — keep it.
- **A bespoke styling compiler.** The `style()` macro is impressive but is team-scale infrastructure (build plugin, typed token unions, atomic CSS dedupe). Plain CSS + custom properties matches a solo maintainer; the constraint the macro enforces ("only token values") can be approximated with Stylelint rules instead.
- **Multi-site docs sprawl.** Guidelines (spectrum.adobe.com), S2 vision (s2.spectrum.adobe.com), React docs (react-spectrum.adobe.com), React Aria (react-aria.adobe.com), SWC (opensource.adobe.com) — five properties that visibly drift (the guidelines site still lags S2). One Starlight site, always.
- **Mode proliferation.** Spectrum carries a `wireframe` theme in every color token's sets. Each extra mode multiplies review cost across every token forever; add modes only with a consuming use case.
- **Multiple parallel implementations** (React, Web Components, CSS, UXP). Rational for Adobe, fatal for a solo system — one RAC-based implementation only.

## Sources

- https://github.com/adobe/spectrum-design-data (retrieved 2026-07-05)
- https://github.com/adobe/spectrum-design-data/blob/main/packages/tokens/README.md (retrieved 2026-07-05)
- Raw token data: `packages/tokens/src/{color-aliases,layout,color-component}.json` on `main` (retrieved 2026-07-05)
- https://spectrum.adobe.com/page/design-tokens/ (retrieved 2026-07-05)
- https://spectrum.adobe.com/page/platform-scale/ (retrieved 2026-07-05)
- https://react-spectrum.adobe.com/releases/v1-0-0 (retrieved 2026-07-05)
- https://react-spectrum.adobe.com/styling (retrieved 2026-07-05)
- https://react-aria.adobe.com/quality (retrieved 2026-07-05)
- https://opensource.adobe.com/spectrum-web-components/migrating-to-spectrum2/ (retrieved 2026-07-05)
- https://s2.spectrum.adobe.com/ (retrieved 2026-07-05)
- https://github.com/adobe/react-spectrum (retrieved 2026-07-05)
