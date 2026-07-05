---
title: Material Design 3
updated: 2026-07-05
---

# Material Design 3 (M3)

## 1. Snapshot

- **Owner**: Google's Material Design team. Docs at [m3.material.io](https://m3.material.io); described as "Google's open-source design system" (retrieved 2026-07-05). The largest-scale design system in existence: default UI language for Android, Wear OS, and most Google apps; the 2025 "M3 Expressive" refresh shipped to Pixel devices with Android 16 QPR1 in Sept 2025 and to Chrome in Oct 2025 ([Google blog](https://blog.google/products-and-platforms/platforms/android/material-3-expressive-android-wearos-launch/); [Sammy Fans](https://www.sammyfans.com/2025/10/27/google-chrome-material-3-expressive-design/), retrieved 2026-07-05).
- **Implementations**: Jetpack Compose (`androidx.compose.material3`, the flagship — stable 1.4.0, expressive APIs graduated to stable in 1.5.0 alphas Feb–Apr 2026, [release notes](https://developer.android.com/jetpack/androidx/releases/compose-material3), retrieved 2026-07-05); MDC-Android (Views); Flutter; Angular Material (separate Angular team); **Material Web (`@material/web`) is in maintenance mode** — engineers reassigned to Google's internal Wiz framework, "pending new maintainers" ([GitHub discussion #5642](https://github.com/material-components/material-web/discussions/5642), retrieved 2026-07-05).
- **Scale**: [material-components-android](https://github.com/material-components/material-components-android) ~17.3k stars (active, pushed 2026-06); [material-web](https://github.com/material-components/material-web) ~11.1k stars (maintenance mode); [material-color-utilities](https://github.com/material-foundation/material-color-utilities) ~2.2k stars — all Apache-2.0 (GitHub API, retrieved 2026-07-05). Effective install base is the Android ecosystem: billions of devices.
- **License**: code repos (material-components-*, material-color-utilities, material-theme-builder) are Apache 2.0 (GitHub API, retrieved 2026-07-05); Figma community kits are CC BY 4.0 (license verified for kit derivatives; official kit page blocked fetch — unverified) ([Figma community](https://www.figma.com/community/file/1035203688168086460/material-3-design-kit), retrieved 2026-07-05).
- **Key links**: [m3.material.io/foundations/design-tokens](https://m3.material.io/foundations/design-tokens/overview) · [material-web.dev/theming](https://material-web.dev/theming/material-theming/) · [material-color-utilities](https://github.com/material-foundation/material-color-utilities) · [Material Theme Builder](https://github.com/material-foundation/material-theme-builder).

## 2. Token architecture

- **The canonical public 3-tier system** ([design tokens overview](https://m3.material.io/foundations/design-tokens/overview), retrieved 2026-07-05):
  1. **Reference tokens** (`md.ref.*`) — "all available tokenized values," e.g. `md.ref.palette.secondary200`. Raw values only; mostly the 13-step tonal palettes (tones 0–100) per key color, generated in HCT space.
  2. **System tokens** (`md.sys.*`) — "the choices or roles that make the system," e.g. `md.sys.color.secondary-container`, `md.sys.typescale.body-medium`, `md.sys.shape.corner.large`. Context-aware: the same system token resolves to different reference tokens per mode.
  3. **Component tokens** (`md.comp.*`) — per-element design attributes, e.g. the color of a filled button's container. Component tokens **never hold raw values** — they point at system tokens, which point at reference tokens ([Denerz, Angular M3 theming](https://konstantin-denerz.com/angular-material-3-theming-design-tokens-and-system-variables/), retrieved 2026-07-05).
- **Resolution chain example**: `md.sys.color.primary-container` → `md.ref.palette.primary90` → `#FFD7F0` (Denerz, retrieved 2026-07-05).
- **Reference tier shape**: 6 key colors (`primary`, `secondary`, `tertiary`, `neutral`, `neutral-variant`, `error`) each expand into a 13-step tonal palette (tones 0, 10, 20 … 90, 95, 99, 100), so the entire color primitive layer is ~78 values, all derived from one seed ([MCU README](https://github.com/material-foundation/material-color-utilities), retrieved 2026-07-05).
- **System tier collections**: `md.sys.color.*` (~30 roles per scheme incl. `surface-container-lowest…highest`, `inverse-surface`, `outline-variant`), `md.sys.typescale.*` (15 roles), `md.sys.shape.corner.*` (7 steps), `md.sys.elevation.*` (levels 0–5), `md.sys.motion.*` (easing + duration), `md.sys.state.*` (state-layer opacities: hover 8%, focus/press 10%, drag 16%) ([m3.material.io/styles/color/roles](https://m3.material.io/styles/color/roles); state-layer opacities widely documented but page unfetchable — unverified exact values).
- **In code**, tiers become prefixed CSS custom properties ([material-web.dev/theming](https://material-web.dev/theming/material-theming/), retrieved 2026-07-05):

  ```css
  :root {
    /* reference */
    --md-ref-typeface-brand: 'Roboto';
    /* system */
    --md-sys-color-primary: #6750a4;
    --md-sys-typescale-body-medium-size: 0.875rem;
    --md-sys-shape-corner-medium: 12px;
  }
  .square-buttons {
    /* component — scoped override, aliases sys by default */
    --md-filled-button-container-shape: 0px;
  }
  ```

  Notably even Google's own web implementation ships the tiers **incompletely**: "MWC does not currently support `--md-ref-palette` tokens" or `--md-sys-motion` tokens (same source). Angular Material exposes system tokens as `--mat-sys-*` and **800+ component tokens** under `--mat-*`/`--mdc-*` prefixes (Denerz, retrieved 2026-07-05).
- **Modes** are alternate system→reference mappings, not separate token sets: light maps `primary` to tone 40, dark to tone 80, same role name everywhere. Theme Builder also generates medium/high-contrast scheme variants ([material-theme-builder README](https://github.com/material-foundation/material-theme-builder/blob/main/README.md), retrieved 2026-07-05).
- **How raw values become decisions**: the whole chain is algorithmic — seed color → material-color-utilities → tonal palettes (reference tier) → scheme-variant mapping rules (system tier) → generated per-component token tables (component tier). Humans pick the seed and the mapping rules; the values themselves are computed (MCU + Theme Builder READMEs, retrieved 2026-07-05).

## 3. Naming

- **Grammar**: `{namespace}.{tier}.{domain}.{role}[.{element}][.{property}][.{state}]` — dot-delimited in spec, kebab/dash-flattened per platform (`md.sys.color.on-primary-container` → CSS `--md-sys-color-on-primary-container`, Compose `MaterialTheme.colorScheme.onPrimaryContainer`).
- **Real examples across tiers**: `md.ref.palette.primary90` · `md.sys.color.on-secondary-container` · `md.sys.typescale.headline-small` · `md.sys.shape.corner.extra-large` · `md.comp.filled-button.container.color` ([design tokens docs](https://m3.material.io/foundations/design-tokens/overview); Denerz, retrieved 2026-07-05).
- **The `on-` prefix** is the system's best idea: every surface role has a paired foreground role (`primary`/`on-primary`, `surface`/`on-surface`, `error-container`/`on-error-container`) with contrast guaranteed by construction. Self-documenting: you never guess which text color goes on which background.
- **Typography** is a role × size grid: 5 roles (`display`, `headline`, `title`, `body`, `label`) × 3 sizes (`large`, `medium`, `small`) = 15 styles; each expands into sub-property tokens (`-size`, `-line-height`, `-weight`, `-font`). M3 Expressive added emphasized variants (retrieved 2026-07-05, [supercharge.design](https://supercharge.design/blog/material-3-expressive)).
- **Shape** is a T-shirt corner scale: `md.sys.shape.corner.{none|extra-small|small|medium|large|extra-large|full}`; Expressive expanded the library to 35 shapes with morphing between them ([Android Authority](https://www.androidauthority.com/google-material-3-expressive-features-changes-availability-supported-devices-3556392/), retrieved 2026-07-05).
- **Component-token grammar** adds element/property/state segments: `md.comp.filled-button.container.color`, `md.comp.filled-button.label-text.type`, and state variants like `md.comp.filled-button.hover.state-layer.opacity` — component, then anatomy element, then property, then interaction state (pattern per [design tokens docs](https://m3.material.io/foundations/design-tokens/overview); state example unverified against the live token table).
- **Platform translation is lossy by design**: one spec name becomes `--md-sys-color-primary` (MWC), `--mat-sys-primary` (Angular), `MaterialTheme.colorScheme.primary` (Compose), `Theme.colorScheme.primary` (Flutter). The dot-name is the interchange format; nobody ships it literally.

## 4. Theming

- **Light/dark** = re-pointing system color roles at different tonal steps of the *same* reference palettes (light `primary` = `primary40`, dark = `primary80`). No component changes needed — "enabling theme switching by reassigning reference tokens to system tokens without modifying component code" (Denerz, retrieved 2026-07-05).
- **Dynamic color (Material You)**: a single source color (user wallpaper, in-app content, or brand color) is run through [material-color-utilities](https://github.com/material-foundation/material-color-utilities) (TypeScript/Java/Dart/C++…) to generate tonal palettes in **HCT color space** (Hue 0–360, Chroma 0–~120, Tone 0–100). Tone is perceptual lightness, so contrast between two colors is a function of tone distance — this is how M3 makes *algorithmically generated* schemes accessible (MCU README, retrieved 2026-07-05).
- **Multi-brand**: same machinery — feed a brand seed color, optionally add harmonized "extended colors"; scheme variants (tonal spot, vibrant, neutral, fidelity…) tune chroma. [Material Theme Builder](https://github.com/material-foundation/material-theme-builder) (web app + Figma plugin) is the front end: HCT picker, theme swapping, brand-color harmonization, export to Compose (Kotlin), Android Views (XML), and DSP (retrieved 2026-07-05).
- **Fixed accent roles** (`primary-fixed`, `on-primary-fixed`, `…-fixed-dim`) hold the *same* tone in light and dark — an escape hatch for elements that must not flip with the mode, e.g. brand illustration surfaces (Theme Builder README, retrieved 2026-07-05).
- **Switching mechanics**: on Android, dynamic color applies system-wide from wallpaper (Android 12+); in Compose you pass a different `ColorScheme` to `MaterialTheme` ([developer.android.com](https://developer.android.com/develop/ui/compose/designsystems/material3), retrieved 2026-07-05). On web, MWC leaves the mechanism to the app — you re-declare `--md-sys-color-*` values under `@media (prefers-color-scheme: dark)` or a class; the library "does not explicitly address light/dark mode switching" ([material-web.dev/theming](https://material-web.dev/theming/material-theming/), retrieved 2026-07-05).
- **Elevation** in M3 is tonal, not shadow-first: since the 2023 color update, "elevated" components sit on `surface-container-low…highest` roles rather than tint overlays ([m3.material.io/styles/color/roles](https://m3.material.io/styles/color/roles); unverified detail — roles page unfetchable).
- **Motion theming (Expressive)**: two preset spring-physics motion schemes — `expressive` (low damping, bounce) and `standard` (subdued) — configured at the theme level via `MaterialExpressiveTheme(colorScheme, motionScheme, shapes, typography)`; stable in Compose material3 1.5.0-alpha15+ ([m3 blog](https://m3.material.io/blog/m3-expressive-motion-theming); [Compose releases](https://developer.android.com/jetpack/androidx/releases/compose-material3), retrieved 2026-07-05).
- **Density**: no first-class density mode in M3; Expressive instead ships explicit **size variants** (buttons XS–XL) as component props ([supercharge.design](https://supercharge.design/blog/material-3-expressive), retrieved 2026-07-05). Flutter retains legacy `VisualDensity` (unverified).

## 5. Component anatomy & API style

- **Docs structure**: every component page has four tabs — **Overview / Specs / Guidelines / Accessibility** (e.g. [tabs/accessibility](https://m3.material.io/components/tabs/accessibility), [toolbars/guidelines](https://m3.material.io/components/toolbars/guidelines), retrieved 2026-07-05). Specs pages show a numbered **anatomy diagram** plus exhaustive tables mapping every element attribute to its `md.comp.*` token — a machine-readable contract between design and code.
- **Anatomy vocabulary is consistent system-wide**: `container`, `label text`, `icon`, `state layer`, `supporting text`, `outline` — the same element names recur across components and inside token names, so learning one component's spec teaches the grammar for all of them.
- **Variants are enumerated, not free-form**: buttons come in exactly 5 color configurations (elevated, filled, filled tonal, outlined, text) × sizes (XS–XL in Expressive); each variant has its own token set. In Compose this becomes **one composable per variant** (`Button`, `FilledTonalButton`, `OutlinedButton`, `TextButton`) rather than a `variant` prop; slot APIs (`content: @Composable () -> Unit`) handle composition; `colors`/`shape`/`elevation` params default to theme-derived values so unstyled usage is on-theme by construction.
- **Web component API style** (MWC): one custom element per variant (`<md-filled-button>`, `<md-outlined-button>`), themed by scoping component CSS vars with plain selectors — e.g. `.square-buttons { --md-filled-button-container-shape: 0px; }` ([material-web.dev/theming](https://material-web.dev/theming/material-theming/), retrieved 2026-07-05).
- **M3 Expressive added 5 components** at I/O 2025: button groups, FAB menu (replacing speed dial), split button, loading indicator (replacing indeterminate circular progress in most uses), and toolbars (docked toolbar deprecates the bottom app bar) ([9to5google](https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/); [supercharge.design](https://supercharge.design/blog/material-3-expressive), retrieved 2026-07-05).
- Deprecation is handled in docs ("should replace X") rather than hard removal — old components linger for years.

## 6. Accessibility approach

- **A11y is embedded in the color architecture itself**: because Tone in HCT is perceptual lightness, role pairs are constructed at fixed tone distances so contrast holds for *any* generated scheme — "color algorithms … generate beautiful, accessible color schemes" (MCU README, retrieved 2026-07-05). Material's rule of thumb: a tone delta of ~40 yields ≥3:1 contrast, ~50 yields ≥4.5:1 (unverified exact thresholds — from MCU concept docs). Medium/high-contrast schemes are generated alongside the default (Theme Builder README, retrieved 2026-07-05).
- **Docs**: a dedicated Accessibility tab per component (behaviors, labels, focus order — e.g. "don't loop scrollable tab sets," descriptive labels for icon-only controls) plus foundations-level guidance: text resize to 200% minimum, 48dp touch targets, focus indicators ([m3.material.io foundations](https://m3.material.io/foundations/overview/principles); [tabs a11y](https://m3.material.io/components/tabs/accessibility), retrieved 2026-07-05).
- **Library**: platform components ship semantics baked in (Compose semantics tree, ARIA in MWC); a11y is not an add-on package. Research-validated: the Expressive redesign was tested across 46 studies / 18,000+ participants, including findings that expressive hierarchy let older users find targets as fast as younger ones ([design.google research article](https://design.google/library/expressive-material-design-google-research), retrieved 2026-07-05).
- **Testing**: no automated a11y test suite ships with the design system itself; enforcement lives in platform tooling — Android Accessibility Scanner, Compose semantics-based UI tests, browser devtools for MWC (unverified — no public M3-branded a11y CI tooling found).

## 7. Docs & tooling

- **m3.material.io** is the spec source of truth: foundations (tokens, a11y, layout), styles (color, type, shape, motion), and per-component 4-tab pages. Heavy on rationale and do/don't imagery; JS-rendered SPA (notably hostile to scraping/agents).
- **Figma**: official **Material 3 Design Kit** on Figma Community (CC BY 4.0), updated in a "Variables + Properties" edition — light/dark as variable modes, formerly-duplicate light/dark components merged into single components ([Figma community](https://www.figma.com/community/file/1349722805300238798/material-3-design-kit-variables-properties); [M3 blog](https://m3.material.io/blog/material-3-figma-design-kit), retrieved 2026-07-05). The **Material Theme Builder Figma plugin** generates Design-Kit-compatible tokens *as styles* from a seed color and swaps themes in place (Theme Builder README, retrieved 2026-07-05).
- **Design→code sync is name-based, not pipeline-based**: the shared `md.sys.*` vocabulary is the contract; Theme Builder exports platform code (Compose/XML/DSP) but there is no public DTCG JSON export from Google's tooling — DTCG export is arriving as a native Figma platform feature instead ([atomize.tools guide](https://atomize.tools/blog/figma-design-tokens-guide/), retrieved 2026-07-05).
- **Icons**: Material Symbols on Google Fonts — a variable font with weight, fill, grade, and optical-size axes, Apache 2.0 ([fonts.google.com/icons](https://fonts.google.com/icons); axis details unverified against current page).
- **Code generation**: component token tables are generated from an internal token database into each platform library (Compose's `tokens/` files are generated and internal, not public API) (unverified — inferred from library source structure). There is no public Style-Dictionary-style pipeline; each platform team consumes the database independently.
- **Docs style**: guideline pages lean on paired do/don't imagery with one-line rationale; spec pages are exhaustive token tables; blog posts ([m3.material.io/blog](https://m3.material.io/blog)) carry migration guidance (e.g. Expressive motion theming). The research-report-as-marketing move ([46 studies / 18k participants](https://design.google/library/expressive-material-design-google-research), retrieved 2026-07-05) is unique to Google's scale.

## 8. Steal / avoid for Ply

**Steal:**
- **The strict tier-resolution rule**: component tokens may only alias semantic tokens; semantic tokens may only alias primitives. M3 states component tokens "should not hold hardcoded values or have any knowledge of theming." Enforce this as a lint step in the Style Dictionary v4 build — it's what makes light/dark free and keeps agent-generated tokens sane.
- **`on-X` foreground pairing**: adopt `surface`/`on-surface`-style pairs in Ply's semantic tier. Self-documenting contrast pairs are ideal for an agentic system — an LLM (and axe) can verify "text on `surface` uses `on-surface`" mechanically, without design judgment.
- **Role × size typography grid** (`body-medium`, `headline-small`): finite, composable, predictable names beat numeric scales (`text-3`) for both AI generation and Figma variable organization.
- **Anatomy-numbered spec tables** mapping element → token: replicate in Storybook/Starlight docs and in DTCG `$extensions` usage notes. This is the single most agent-legible artifact M3 produces — a component becomes a checklist an agent can fill.
- **Tone-based palette generation**: `@material/material-color-utilities` is Apache-2.0 TypeScript — usable inside Ply's build to generate light/dark primitive ramps from brand seeds with contrast guaranteed by tone distance, instead of hand-picking 22 hex values per ramp.
- **Mode = re-mapping, not re-authoring**: M3's light/dark as alternate semantic→primitive bindings matches Figma variable modes and Style Dictionary's per-mode CSS output exactly. Validate that every semantic token resolves in *both* modes at build time.
- **Enumerated variants over open-ended props**: M3's "exactly 5 button configurations, each fully tokenized" is far easier for an agent to generate correctly than a free-form `className` surface. Define Ply variants as closed sets in component docs and `$extensions`.

**Avoid:**
- **Component-token explosion**: Angular Material carries 800+ component tokens; M3's full `md.comp.*` set runs into the thousands. Unmaintainable solo. Mint component tokens *only* where a component genuinely deviates from semantics; default components straight onto the semantic tier (even Google's MWC skipped parts of the tier system).
- **Multi-platform ambition**: Material Web went into maintenance mode because even Google couldn't staff web parity ([discussion #5642](https://github.com/material-components/material-web/discussions/5642)). Ply's single-stack bet (React Aria + plain CSS) is the correct inverse — don't add render targets.
- **Styles-first Figma tooling**: Theme Builder still emits Figma *styles*, and the kit's variables retrofit came years late — Google's Figma artifacts trail its code. Ply's Figma-variables-as-source via MCP is already ahead; don't mirror M3's split-brain where the plugin, the kit, and the code exporters are three unsynchronized truths. Keep one export path (Figma variables → DTCG JSON → Style Dictionary).
- **Theme-level motion/shape-morph machinery**: Expressive's spring schemes and 35-shape morphing require a runtime (Compose physics). For Ply, a small set of duration/easing tokens plus `prefers-reduced-motion` delivers 90% of the value at ~2% of the cost.
- **Dot-namespace verbosity** (`md.sys.color.on-primary-container`): the `md.sys` infix is platform-translation noise. Ply's DTCG group nesting already encodes tier; keep emitted names short (`--ply-color-on-primary`) and let the JSON structure carry the tier metadata.
- **JS-rendered SPA docs**: m3.material.io returns empty bodies to non-browser fetchers — the world's biggest design system is largely invisible to agents and scrapers. Astro Starlight's static HTML is the right call; treat "agent can read every docs page with curl" as a hard requirement.

## Sources

- https://m3.material.io/foundations/design-tokens/overview (retrieved 2026-07-05)
- https://material-web.dev/theming/material-theming/ (retrieved 2026-07-05)
- https://github.com/material-components/material-web/discussions/5642 (retrieved 2026-07-05)
- https://github.com/material-foundation/material-color-utilities (retrieved 2026-07-05)
- https://github.com/material-foundation/material-theme-builder/blob/main/README.md (retrieved 2026-07-05)
- https://konstantin-denerz.com/angular-material-3-theming-design-tokens-and-system-variables/ (retrieved 2026-07-05)
- https://design.google/library/expressive-material-design-google-research (retrieved 2026-07-05)
- https://developer.android.com/jetpack/androidx/releases/compose-material3 (retrieved 2026-07-05)
- https://blog.google/products-and-platforms/platforms/android/material-3-expressive-android-wearos-launch/ (retrieved 2026-07-05)
- https://supercharge.design/blog/material-3-expressive (retrieved 2026-07-05)
- https://www.androidauthority.com/google-material-3-expressive-features-changes-availability-supported-devices-3556392/ (retrieved 2026-07-05)
- https://www.figma.com/community/file/1349722805300238798/material-3-design-kit-variables-properties (retrieved 2026-07-05)
- https://m3.material.io/blog/material-3-figma-design-kit (retrieved 2026-07-05)
- https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/ (retrieved 2026-07-05)
- https://developer.android.com/develop/ui/compose/designsystems/material3 (retrieved 2026-07-05)
- https://atomize.tools/blog/figma-design-tokens-guide/ (retrieved 2026-07-05)
- GitHub REST API repo metadata for star counts/licenses (retrieved 2026-07-05)
