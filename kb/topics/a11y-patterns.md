---
title: Accessibility patterns
updated: 2026-07-05
---

# Accessibility patterns

## 1. The question this answers

Where should accessibility live in a design system — headless library, styled component layer, tokens, docs, tests, or Figma specs? Ply inherits ARIA semantics, keyboard interaction, and focus *behavior* from React Aria Components, so the real question is: what remains Ply's responsibility, and how does a solo designer enforce it with automation instead of vigilance?

## 2. Current best practice (as of 2026)

- **Layered responsibility, not a single "a11y layer".** The mature split:
  - *Headless library* — semantics, keyboard interaction, focus behavior, per the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) (retrieved 2026-07-05). Never reimplement this.
  - *Tokens* — color contrast, focus-ring color/width, motion durations. Verifiable as pure data at build time.
  - *Component CSS* — focus-**visible** styling, minimum target sizes, `prefers-reduced-motion` handling. The headless layer renders unstyled; everything visual is the styled system's guarantee.
  - *Docs* — accessible-name and content guidance (what axe can't judge: label quality).
  - *Tests + specs* — CI verification and design-time annotation.
- **Contrast is enforced at the token level, once, not per screen.** Two proven mechanisms: (a) **pairing tokens** — `on-X` / `-foreground` names that encode "legal foreground for this background" into the grammar, checkable mechanically; (b) **contrast by construction** — Material generates palettes in HCT, where a tone difference of 40 guarantees ≥3:1 and 50 guarantees ≥4.5:1, so any generated scheme passes ([m3 science of color](https://m3.material.io/blog/science-of-color-design); [MaterialKolor HCT docs](https://docs.materialkolor.com/material-color-utilities/com.materialkolor.hct/-hct/index.html), retrieved 2026-07-05). Either way, declared pairs are tested programmatically in the token build.
- **WCAG 2.x ratios remain the normative gate; APCA is advisory.** WCAG 3 is still a Working Draft; visual contrast was moved *out* of the draft in July 2023 for further evaluation, APCA "was only ever exploratory," and Recommendation status is not expected before the late 2020s ([Eric Eggert](https://yatil.net/blog/wcag-3-is-not-ready-yet); [Adrian Roselli, Apr 2026](https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html), retrieved 2026-07-05). Gate on 2.x (4.5:1 body text, 3:1 large text and UI components per SC 1.4.11); report APCA Lc as a font-weight-aware second opinion.
- **The testing pyramid acknowledges what axe cannot do.** axe-core finds on average ~57% of WCAG issues ([Deque](https://www.deque.com/axe/), retrieved 2026-07-05) — static, per-rendered-state DOM checks. It cannot judge focus order, keyboard traps, focus management in overlays, or label *quality*. The pyramid:
  - *Bottom (cheap, hard gate)* — axe on every story, every theme. Storybook 9's a11y addon runs axe through the Vitest addon and test widget, across all stories at once ([Storybook a11y docs](https://storybook.js.org/docs/writing-tests/accessibility-testing), retrieved 2026-07-05); [vitest-axe](https://github.com/chaance/vitest-axe) (jest-axe fork) supplies the `toHaveNoViolations` matcher (retrieved 2026-07-05).
  - *Middle* — interaction tests for keyboard/focus behavior (the 43% axe misses that is still automatable per component).
  - *Top (episodic, human)* — screen-reader passes, zoom/reflow, judgment calls on names and copy.
- **A11y themes are token modes, not component forks** — high-contrast and colorblind themes re-point the same semantic names. Ship the *architecture* (mode-ready tokens) even when the extra themes are deferred.
- **WCAG 2.2 (Recommendation since Oct 2023) reaches into component design:**
  - *SC 2.5.8 Target Size (Minimum), AA* — a 24×24 CSS px square must fit inside each target, or a 24px circle centered on an undersized target must not intersect adjacent targets/circles; inline text links and unstyled native controls are exempt ([W3C Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), retrieved 2026-07-05). This is a *component-design* constraint: icon buttons, dense table actions, and chip close-buttons are the usual failures.
  - *SC 2.4.11 Focus Not Obscured (Minimum), AA* — sticky headers/footers must not fully cover the focused element.
  - *SC 2.4.13 Focus Appearance, AAA* — indicator area ≥ a 2px perimeter of the control, ≥3:1 contrast between focused/unfocused pixels ([W3C Understanding 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html), retrieved 2026-07-05). Nearly free at the token level (one ring color + one width token), so systems increasingly design to it even though it's AAA.
- **A11y intent is annotated in design specs**, not left to handoff folklore: Figma annotation kits capture focus order, accessible names, and keyboard behavior as reusable components ([Primer Annotation Toolkit](https://primer.style/accessibility/tools-and-resources/annotation-toolkit/); [GitHub Annotation Toolkit](https://www.figma.com/community/file/1552736256652388772/github-annotation-toolkit); Indeed's [A11y Annotation Kit](https://www.figma.com/community/file/953682768192596304/a11y-annotation-kit), retrieved 2026-07-05).

## 3. How the major systems do it

- **[Spectrum](../systems/spectrum.md)** — a11y lives in the library layer Ply already uses: React Aria hooks implement APG semantics, tested against real AT matrices (VoiceOver/JAWS/NVDA/TalkBack), exposing `data-focus-visible` etc. as styling hooks. This is the floor Ply inherits for free.
- **[Primer](../systems/primer.md)** — the governance model: WCAG 2.2 AA target; AVT (Playwright drives `@avt`-tagged Storybook stories through axe) as a merge-blocking CI job; *zero axe violations required to even reach alpha* in the component lifecycle; colorblind/tritanopia/high-contrast as first-class token modes; the fg/bg pairing matrix documented as data; Annotation Toolkit for Figma.
- **[Material](../systems/material.md)** — contrast by construction: HCT tone-distance guarantees make every generated scheme accessible; `on-X` pairing tokens; medium/high-contrast schemes generated alongside default; 48dp touch targets and a per-component Accessibility docs tab — but no public a11y CI; enforcement is architectural.
- **[Carbon](../systems/carbon.md)** — accountability: AVT via IBM Equal Access on every change, against a checklist stricter than WCAG (508 + EN 301 549); a public per-component accessibility status dashboard; a dedicated `$focus` token.
- **[Atlassian](../systems/atlassian.md)** — WCAG 2.1 AA with a 2.2 commitment; token pairings bake in contrast; increased-contrast themes built as modes behind flags; a11y guidelines exposed to agents via the ADS MCP server.
- **[Polaris](../systems/polaris.md)** — expertise concentrated in the library ("build it once"), with an explicit consumer-responsibility split documented per component; cautionary tale: high-contrast and dark modes sat "experimental" for years.
- **[shadcn/Radix](../systems/shadcn-radix.md)** — the anti-pattern: a11y delegated wholly to primitives with no downstream verification; once code is copied, regressions are nobody's job. Ply testing its *styled* layer is a genuine differentiator.

## 4. Recommendation for Ply

Adopt the four-layer split explicitly: **React Aria owns behavior; tokens own contrast; component CSS owns focus-visible, target size, and motion; docs + Figma specs own names and content.** Then automate each layer's check where it lives:

**The token build verifies automatically (build fails on violation):**
- Every color pair declared in `$extensions.ply.pairsWith` (Ply's `on-X`/`-foreground` grammar) meets WCAG 2.x in **every mode**: ≥4.5:1 for text pairs, ≥3:1 for large-text/non-text pairs (SC 1.4.11). Pure math over resolved DTCG values — no DOM needed.
- The focus-ring token (`--ply-color-border-focus`) hits ≥3:1 against every surface token it may sit on, and the ring-width token is ≥2px (banks WCAG 2.2 SC 2.4.13 AAA system-wide for the cost of two tokens).
- APCA Lc reported alongside each pair as a warning-only column in the build log — advisory until WCAG 3 stabilizes.
- Mode completeness: every semantic token resolves in both light and dark. Keep the mode axis ready for a future `high-contrast` theme (Primer proves it's just another value map), but don't ship it without a user need — and never as a lingering "experimental" (Polaris).

**Storybook CI gates on (merge-blocking, Primer-AVT style):**
- axe via `@storybook/addon-a11y` + vitest-axe on every story, **per theme** — zero violations; exemptions only via a documented, per-rule story parameter.
- Interaction tests (`play` functions) for what axe cannot see: tab/focus order, Escape closes and restores focus on overlays, arrow-key behavior in composite widgets, focus ring visible on keyboard focus but not mouse click (assert on React Aria's `data-focus-visible`).
- A `prefers-reduced-motion` check: motion tokens collapse to ~0ms under `@media (prefers-reduced-motion: reduce)`; one story per animated component asserts it.
- CI output regenerates a Carbon-style per-component a11y status page (axe ✓ / keyboard ✓ / SR-pass date) in the Starlight docs — honest, and free once the tests exist.

**The Figma spec template (Phase 5) must annotate, using Primer/GitHub Annotation Toolkit components:**
- Numbered focus/tab order; the accessible name for every interactive element (mandatory for icon-only controls); the React Aria component/role each element maps to; keyboard behavior notes for composite widgets.
- Minimum target size: 24×24 CSS px hard floor (SC 2.5.8) drawn as an overlay on dense areas, 44px comfortable target for touch-first surfaces.
- The token pair behind each text/surface combination — so every contrast decision in the spec traces to a build-verified pair rather than eyeballing.

**Stays manual (a per-component lifecycle gate, not continuous vigilance):**
- One VoiceOver pass, a 200% zoom/reflow check, a `forced-colors: active` spot-check, and a label/copy quality review before a component is marked stable. Solo-friendly because it happens once per component, and the status page records when.

**Trade-off accepted:** gating on WCAG 2.x rather than APCA means occasionally shipping pairs APCA scores as weak (thin light-weight text especially) and rejecting a few APCA would allow — but 2.x is the normative, audit-recognized standard until WCAG 3 arrives, and the advisory APCA column keeps the future migration visible.

## 5. Sources

- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html (retrieved 2026-07-05)
- https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html (retrieved 2026-07-05)
- https://www.w3.org/WAI/ARIA/apg/ (retrieved 2026-07-05)
- https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html (retrieved 2026-07-05)
- https://yatil.net/blog/wcag-3-is-not-ready-yet (retrieved 2026-07-05)
- https://m3.material.io/blog/science-of-color-design (retrieved 2026-07-05)
- https://docs.materialkolor.com/material-color-utilities/com.materialkolor.hct/-hct/index.html (retrieved 2026-07-05)
- https://www.deque.com/axe/ (retrieved 2026-07-05)
- https://storybook.js.org/docs/writing-tests/accessibility-testing (retrieved 2026-07-05)
- https://github.com/chaance/vitest-axe (retrieved 2026-07-05)
- https://primer.style/accessibility/tools-and-resources/annotation-toolkit/ (retrieved 2026-07-05)
- https://www.figma.com/community/file/1552736256652388772/github-annotation-toolkit (retrieved 2026-07-05)
- https://www.figma.com/community/file/953682768192596304/a11y-annotation-kit (retrieved 2026-07-05)
- System-specific claims: see the linked dossiers in `kb/systems/` (Primer AVT & lifecycle gates, Carbon Equal Access AVT & status dashboard, Atlassian increased-contrast themes, Spectrum AT matrices, Polaris responsibility split, Material HCT architecture).
