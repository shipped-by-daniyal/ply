---
title: Theming
updated: 2026-07-05
---

# Theming

## 1. The question this answers

How do modes (light/dark today; density, contrast, brand tomorrow) actually work — what a mode *is* at the token level, which switching mechanism to use in CSS, how "auto" and flash-of-wrong-theme are handled, which token tiers carry mode values, whether a subtree can run a different mode than the page, and how Figma variable modes survive the trip through DTCG into the CSS build.

## 2. Current best practice (as of 2026)

- **A mode is an alternate value set on the same semantic token names — never new names.** Every system in `systems/` converges here: the token name is the stable contract; only the value swaps per mode. Components must be mode-blind.
- **Modes live on the semantic tier only.** Primitives are immutable across modes (Polaris deep-merges dark over an untouched palette; Primer's `base-*` tokens are reference-only; M3's tonal palettes are identical in both schemes — light/dark just re-points roles at different tones). Component tokens inherit modes for free by aliasing semantics.
- **Switching mechanism: a data attribute on `<html>` is the 2026 default.** Compared:
  - **Data-attribute** — Primer's `data-color-mode`/`data-light-theme`/`data-dark-theme` (nine themes, zero JS re-render), Atlassian's `data-theme` + `data-color-mode` contract, Carbon's `[data-carbon-theme]` zones. Wins: manual override, SSR-safe, scopeable to subtrees, extensible to more modes.
  - **Class-based** — Polaris `.p-theme-{name}`, shadcn's `.dark`. Functionally equivalent to the attribute; the attribute is preferred because it's a single-valued slot (can't accumulate stale classes) and reads as configuration, not styling.
  - **Media-query-only** — re-declaring values under `@media (prefers-color-scheme: dark)` (Material Web's approach — it "does not explicitly address light/dark mode switching"). Fatal flaw: no manual override, so no three-state UX. Only acceptable for content sites with no toggle.
  - **CSS `light-dark()`** — inline both values per declaration, keyed off the `color-scheme` property. Baseline **Newly available** since May 2024; hits "widely available" only around **November 2026**, i.e. not yet safe unaudited ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark), retrieved 2026-07-05; [caniuse](https://caniuse.com/mdn-css_types_color_light-dark), retrieved 2026-07-05). Limits: effectively **color-only** in interoperable practice (MDN now documents image arguments, but cross-browser support for non-color values is unverified); hard-capped at exactly two states, so it can't grow into high-contrast or brand modes; and it moves mode values out of the token block into every call site. Useful trick it validates: `color-scheme` overrides on an element re-resolve the function locally — native scoped theming.
- **"Auto" is a three-state preference (light/dark/auto), not a third theme.** Store the *preference* in `localStorage`; resolve `auto` via `matchMedia('(prefers-color-scheme: dark)')` and stamp the *resolved* mode on the attribute; keep a change listener live while in auto ([Makeev, native light-dark](https://pepelsbey.dev/articles/native-light-dark/), retrieved 2026-07-05). Primer encodes exactly this: `data-color-mode="auto"` plus named themes per mode; Atlassian's `setGlobalTheme({colorMode: 'auto'})` wires the same listeners.
- **FOUC prevention: a render-blocking inline `<script>` in `<head>`** that reads localStorage, resolves auto, and sets the attribute before first paint. Astro's docs theme does this canonically — Starlight's `ThemeProvider.astro` inline script (`is:inline` so it isn't bundled/deferred) reads `starlight-theme` and stamps `document.documentElement.dataset.theme` pre-paint ([ThemeProvider.astro](https://github.com/withastro/starlight/blob/main/packages/starlight/components/ThemeProvider.astro), retrieved 2026-07-05).
- **Scoped/zone theming** (a dark hero inside a light page): works iff the switching selector matches any element, not just `:root`, and all component CSS consumes `var()` — then nesting the attribute re-resolves the cascade for that subtree. Carbon is the reference implementation (`<Theme theme="g90" as="section">` + zone stylesheet + `<Layer>` for nested surfaces).
- **Other axes are orthogonal mode dimensions, not more themes**: density/platform scale (Spectrum's `desktop`/`mobile` scale-sets on dimension tokens), contrast (Primer's high-contrast themes are token modes, not component forks), brand (a swap of the *primitive* layer, leaving semantic names untouched — M3's seed-color machinery; shadcn themes as installable `cssVars` blocks).
- **Modes are not in the DTCG core spec.** The first stable Format spec (2025.10, Oct 2025) has no mode concept ([DTCG announcement](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/), retrieved 2026-07-05). The **Resolver Module** (draft 2025.10, "do not implement" status) will standardize it via *sets* + *modifiers* with named *contexts* (`{"theme": "dark"}` selects alternate source files) ([resolver draft](https://www.designtokens.org/tr/drafts/resolver/), retrieved 2026-07-05). Until it stabilizes, systems encode modes as: **separate token files per mode** merged at build (Primer; the resolver draft's shape), **custom per-token value maps** (Spectrum's `sets: {light, dark}` — powerful but non-standard), or **`$extensions` metadata** naming the Figma collection/mode (Primer stores collection, mode, and scopes in `$extensions` to drive its Figma export). Figma itself announced native DTCG-compliant variable export/import at Schema 2025 ([atomize.tools guide](https://atomize.tools/blog/figma-design-tokens-guide/), retrieved 2026-07-05).

## 3. How the major systems do it

| System | Mechanism | Auto handling | Modes carried | Zone theming |
|---|---|---|---|---|
| **Primer** (`systems/primer.md`) | `data-color-mode` + `data-light-theme`/`data-dark-theme` on `<html>`; one CSS file per theme, same var names | `auto` value follows `prefers-color-scheme`; per-mode theme picks | 2 modes × 9 themes (high-contrast, colorblind, tritanopia as token modes) | Not a feature; attribute is root-level |
| **Atlassian** (`systems/atlassian.md`) | `data-theme` (internal) + `data-color-mode` (the *only* public attribute); theme CSS lazy-injected | `colorMode: 'auto'` wires matchMedia listeners | light/dark + legacy + spacing theme; hand-tuned dark values | `utility.elevation.surface.current` escape hatch only |
| **Carbon** (`systems/carbon.md`) | `[data-carbon-theme]` custom-property scopes; `<GlobalTheme>` + nested `<Theme as="section">` | Left to the app | 4 themes (White/G10/G90/G100) — deliberate zoning pairs | **Best in class**: nested Theme components + `<Layer>` auto-incrementing surface tokens |
| **Polaris** (`systems/polaris.md`) | Class-based `.p-theme-{name}`; `color-scheme` token flips native controls | n/a (dark stayed "experimental" for years — cautionary tale) | light, light-mobile, high-contrast/dark experimental | No |
| **Material 3** (`systems/material.md`) | Web: consumer's choice (media query or class re-declaring `--md-sys-*`); Compose: swap `ColorScheme` object | Platform-level on Android | light/dark as role→tone re-mapping; medium/high-contrast generated; `*-fixed` roles opt out of flipping | Via re-scoping sys vars on any selector |
| **Spectrum** (`systems/spectrum.md`) | Provider components: `<Provider colorScheme>` / `<sp-theme color scale>` | Provider-level | Color (light/dark/wireframe) **and** platform scale (desktop/mobile) as orthogonal per-token `sets` | `<sp-theme>` nests |
| **shadcn/ui** (`systems/shadcn-radix.md`) | `.dark` class re-declaring ~30 vars | Delegated to `next-themes` etc. | light/dark; density frozen as init-time "style" (Rhea) — explicitly *not* a mode | Works incidentally (class on any element) |

Cross-cutting: every system keeps token names constant across modes; none puts modes on primitives; the three that support subtree theming (Carbon, Spectrum, M3-web) all do it by scoping custom properties to a selector/provider rather than `:root` only.

## 4. Recommendation for Ply

**Mechanism — one attribute, `data-theme`, values `light | dark`, stamped on `<html>` with the *resolved* mode.** CSS ships as a single stylesheet — exactly the planned Style Dictionary output:

```css
:root {
  color-scheme: light;              /* native controls, scrollbars */
  --ply-color-surface: #ffffff;     /* light values = default + fallback */
  /* … all semantic tokens … */
}
[data-theme="dark"] {
  color-scheme: dark;
  --ply-color-surface: #16161a;     /* same names, dark values only */
}
```

Write the dark selector as `[data-theme="dark"]` — not `:root[data-theme="dark"]` — so the identical block scopes to any element (this is the whole cost of keeping zone theming possible). Adopt Atlassian's contract discipline: `data-theme` is the one documented public switching surface; everything else is internal. Do **not** build on `light-dark()` in v1 — not widely available until ~Nov 2026, color-only in practice, and capped at two states, which would foreclose a future high-contrast mode; revisit as an output *optimization* once Baseline-wide.

**Auto — the three-state pattern.** The stored preference (`localStorage`, key `ply-theme`) is `light | dark | auto`; the attribute only ever holds the resolved `light`/`dark`. An inline pre-paint script in `<head>` resolves and stamps before first paint (FOUC prevention), plus a listener that re-stamps live while the preference is `auto`:

```html
<script>
  (() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const pref = localStorage.getItem('ply-theme') ?? 'auto';
      const mode = pref === 'auto' ? (mq.matches ? 'dark' : 'light') : pref;
      document.documentElement.dataset.theme = mode;
    };
    apply();
    mq.addEventListener('change', apply);
  })();
</script>
```

On the docs site, don't reinvent this: Starlight's built-in `ThemeProvider`/`ThemeSelect` already implements the exact pattern — inline `is:inline` script, `data-theme` on `<html>`, auto option — so Ply's CSS keys off the same attribute and the docs toggle works with zero glue. In Storybook, add a global toolbar item whose decorator stamps `data-theme` on the preview `<html>`, and run the axe pass per mode (Primer's AVT-per-theme pattern).

**Tiers — modes on semantics only.** The Figma primitives collection stays single-mode; only the semantic collection carries Light + Dark (as it already does in the source file). Build-time lint: every semantic token must resolve in *both* modes (M3's re-mapping discipline), and mode values may only reference primitives — never introduce raw values in a mode override (Polaris's rule).

**Figma → DTCG → CSS.** Since DTCG core has no mode concept, export each mode of the semantic collection as its own DTCG file (`semantic.light.json`, `semantic.dark.json` — same token paths, different `$value`s), which is both Style Dictionary's natural multi-build input and the shape the DTCG Resolver Module draft standardizes (sets + `{"theme": "dark"}` contexts) — adopt the resolver document itself only when it leaves draft. Record `figma.collection` and `figma.mode` under `$extensions.ply` on each token (Primer's pattern) so the export stays lossless and reversible, and so the pipeline survives the switch to Figma's announced native DTCG export. Style Dictionary then runs two resolutions and emits the one CSS file described above.

**Zone theming — the selector ships in v1, the component doesn't.** Because the dark block is `[data-theme="dark"]` and all component CSS consumes `var()`, a dark hero inside a light page is just `<section data-theme="dark">` — document it with one nested-theme Storybook story (the Carbon steal). No `<Theme>` React component, no Carbon-style `Layer` machinery until a real consumer needs stacked surfaces.

**Other axes.** Density/platform scale: not in v1 — but keep it possible by never encoding "desktop" into token names and treating mode axes as orthogonal in the build config (Spectrum's scale-set lesson); if density ever ships it's a second attribute (`data-density`), not a fork of the theme. Multi-brand: out of scope for v1; the architecture already doesn't preclude it, because modes only remap semantic → primitive — a brand is a swap of primitive *values* (or a second primitives file), leaving every semantic name and both mode files untouched.

**Trade-off accepted:** the data-attribute + inline-script pattern costs a small render-blocking script and a nonstandard (non-media-query) mechanism, in exchange for manual override, three-state UX, subtree scoping, and headroom for contrast/density/brand axes — the same trade every major system above has made.

## 5. Sources

Beyond the `systems/` dossiers (all retrieved 2026-07-05):

- [MDN: `light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) — Baseline 2024 Newly available; `color-scheme` requirement; scoped re-resolution (retrieved 2026-07-05)
- [caniuse: `light-dark()`](https://caniuse.com/mdn-css_types_color_light-dark) — support since May 2024; widely available ~Nov 2026 (retrieved 2026-07-05)
- [Vadim Makeev, "Native light and dark color scheme switching"](https://pepelsbey.dev/articles/native-light-dark/) — three-state switcher, auto handling, localStorage caveat (retrieved 2026-07-05)
- [DTCG: first stable Format spec 2025.10](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) (retrieved 2026-07-05)
- [DTCG Resolver Module draft 2025.10](https://www.designtokens.org/tr/drafts/resolver/) — sets/modifiers/contexts; draft status (retrieved 2026-07-05)
- [Starlight `ThemeProvider.astro`](https://github.com/withastro/starlight/blob/main/packages/starlight/components/ThemeProvider.astro) — inline pre-paint script, `data-theme`, `starlight-theme` localStorage key (retrieved 2026-07-05)
- [atomize.tools: Figma design tokens guide](https://atomize.tools/blog/figma-design-tokens-guide/) — Figma Schema 2025 native DTCG variable export/import (retrieved 2026-07-05)
