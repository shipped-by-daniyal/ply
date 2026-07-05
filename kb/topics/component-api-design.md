---
title: Component API design
updated: 2026-07-05
---

# Component API design

## 1. The question this answers

What shape should Ply component props take — which prop names, which value vocabularies, when to configure via props vs compose via children, how state and styling are exposed — so that a solo designer can guess the API without reading source, Figma variant properties mirror code 1:1 (Phase 5 → Phase 6), and AI agents generate correct usage on the first try?

## 2. Current best practice (as of 2026)

- **Enums over booleans.** One `variant` enum beats N boolean props: booleans create impossible combinations (`primary` + `destructive` both true), can't be extended without a new prop, and don't map to Figma variant properties (which are inherently enum-shaped). Polaris paid for this lesson with a codemodded v12 migration from `primary`/`destructive` booleans to `variant`/`tone` enums (see `systems/polaris.md` §5). Booleans are reserved for genuinely binary state, conventionally `is*`-prefixed (`isDisabled`, `isSelected`) — the React Aria / Atlassian convention.
- **A small standard prop trio**, reused verbatim on every component: one axis for *semantic emphasis* (`variant`), one for *meaning/color* (`tone`), one for *size*. Keeping meaning (`tone="critical"`) orthogonal to emphasis (`variant="ghost"`) avoids combinatorial variant explosions (`dangerGhost`).
- **Closed, shared vocabularies.** The same `size` scale (`sm|md|lg`) must mean the same thing on every component — Carbon normalized exactly this in v11, deleting per-component booleans like `small` (see `systems/carbon.md` §5). Small enumerable vocabularies are also what LLMs complete correctly from memory (see `systems/shadcn-radix.md` §3).
- **Configuration for the closed set, composition for the open set.** Enum props for anything that is a finite design decision; compound/dot-notation components (`Menu.Item`) for anything list- or slot-like where consumers supply arbitrary children. Carbon rebuilt Tabs as composable parts in v11 partly to fix semantics; Primer uses `ActionList.Item`; Polaris web components went slot-based (dossiers §5). Named-slot *props* (`prefix`, `suffix`, Primer's `leadingVisual`) are the middle ground for single-element slots.
- **Polymorphism is out of fashion.** `asChild`/Slot (Radix) relies on `cloneElement`, which the React docs call fragile; Base UI replaced it with an explicit `render` prop ([Radix composition guide](https://www.radix-ui.com/primitives/docs/guides/composition); [Base UI useRender](https://base-ui.com/react/utils/use-render), both retrieved 2026-07-05). React Aria Components avoids generic `as=` entirely: a Button that navigates is a `Link`; components accept `href` where relevant. Typed `as=` props are a TypeScript tax with little payoff for a single-app-scale system.
- **Controlled/uncontrolled duality as a naming convention.** React Aria's pattern: uncontrolled by default, controlled via paired props — `value`/`defaultValue` + `onChange`, `isOpen`/`defaultOpen` + `onOpenChange`, `selectedKey`/`defaultSelectedKey` ([React Aria forms docs](https://react-aria.adobe.com/forms), retrieved 2026-07-05). The `default*` prefix *is* the API documentation.
- **Styling contract = data attributes + CSS variables, not style props.** React Aria Components expose state as `data-*` attributes (`data-hovered`, `data-pressed`, `data-focus-visible`, `data-selected`, `data-entering`/`data-exiting`) and accept `className`/`style`/`children` as functions of that state; components also publish CSS custom properties like Popover's `--trigger-width` ([RAC styling docs](https://react-aria.adobe.com/styling), retrieved 2026-07-05). This makes plain CSS a first-class styling API — no CSS-in-JS runtime needed. Primer's v38 removal of `sx`/styled-system props confirms the industry direction (see `systems/primer.md` §5).
- **AI predictability is now a design constraint.** shadcn's flat `variant`/`size` CVA grammar dominates AI codegen because it is obvious, tiny, and training-data-saturated; bespoke clever APIs (Spectrum's `style()` macro) stay team-internal (see `systems/shadcn-radix.md` §7, `systems/spectrum.md` §5). The guessable API and the AI-generatable API are the same API.
- **Deprecate props with a bridge, never a cliff.** Ship old + new in parallel with a dev-only warning and a documented mapping; remove one release later. Polaris shipped codemods; Primer's lifecycle mandates documented alternatives + notice before removal; Spectrum encodes `deprecated`/`renamed` as machine-readable data (dossiers §5/§8).

## 3. How the major systems do it

| System | Emphasis axis | Meaning axis | Size axis | Notes |
|---|---|---|---|---|
| Polaris (React v12) | `variant="plain\|primary\|secondary\|tertiary"` | `tone="success\|critical"` | `size="micro\|slim\|medium\|large"` | migrated from booleans via codemod (`systems/polaris.md` §5) |
| Atlassian | `appearance="danger\|subtle\|…"` | folded into `appearance` | `spacing` | `is*` booleans; appearance names mirror token roles 1:1 (`systems/atlassian.md` §5) |
| Carbon | `kind="primary\|ghost\|danger"` | folded into `kind` | `size="sm\|md\|lg"` normalized v11 | composable Tabs; `unstable_` prefix for experiments (`systems/carbon.md` §5) |
| Primer | `variant="default\|primary\|invisible\|danger"` | folded into `variant` | `size="small\|medium\|large"` | slot props `leadingVisual`/`trailingVisual`; `as='a'` polymorphism (`systems/primer.md` §5) |
| Spectrum / RAC | `variant` (accent/primary/negative) | folded into `variant` | `size` t-shirt, orthogonal to platform scale | `is*` booleans, `onPress`, data-attribute styling (`systems/spectrum.md` §5) |
| Material 3 | one component per variant (`FilledTonalButton`) | n/a | size variants XS–XL | enumerated variants, slot children (`systems/material.md` §5) |
| shadcn/ui | `variant="default\|secondary\|destructive\|outline\|ghost\|link"` | folded into `variant` | `size="sm\|default\|lg\|icon"` | CVA; `asChild`; `data-slot` hooks; the AI-adoption benchmark (`systems/shadcn-radix.md` §5) |

Convergence: every system settled on **one primary enum + one size enum + `is*` booleans**. They diverge on whether meaning is a separate axis (Polaris `tone` — yes) or folded into the main enum (everyone else), and on composition idiom (`asChild` vs `render` vs dot-notation vs slots). On Figma parity: Carbon's Code Connect maps Figma variant properties directly to React props with CI-published mappings (`systems/carbon.md` §7); Figma's own guidance is to use identical terminology in both worlds ([Code Connect React docs](https://www.figma.com/code-connect-docs/react/); [Design System Diaries on parity](https://designsystemdiaries.com/p/close-the-gap-how-to-boost-parity-between-figma-and-code), retrieved 2026-07-05).

## 4. Recommendation for Ply

**House rule 1 — the standard trio, closed vocab, everywhere.**
- `variant` = emphasis: `primary | secondary | ghost` (grow only by ADR).
- `tone` = meaning: `neutral | critical` to start (`success`/`warning` when a component needs them). Kept separate from `variant` à la Polaris so `variant="ghost" tone="critical"` composes instead of minting `dangerGhost`.
- `size` = `sm | md | lg`, same three values on every sized component; components that don't size don't take the prop. No component ever invents a private scale.
- Booleans only for true binary state, always `is*` (`isDisabled`, `isInvalid`, `isSelected`) — matching RAC's own props so wrappers pass through untranslated. Events follow RAC: `onPress`, `onChange`, `onOpenChange`.

**House rule 2 — composition idioms.** Configuration via the trio for closed sets; dot-notation compound components for open sets (`Menu.Item`, `Menu.Section`, `Menu.Separator` re-exporting RAC parts); named-slot props for single-element slots (`prefix`/`suffix` on inputs, `icon` on Button). No `asChild`, no `as=` — link-shaped things take `href` (RAC handles rendering `<a>`). Trade-off accepted: slightly more components (Button vs LinkButton) in exchange for zero polymorphism typing and no cloneElement fragility.

**House rule 3 — the RAC styling contract.** Every component ships one plain-CSS file that targets a stable class (`.ply-Button`) plus RAC data attributes (`[data-hovered]`, `[data-pressed]`, `[data-focus-visible]`, `[data-selected]`, `[data-disabled]`) — never `:hover` directly, so mouse/touch/keyboard normalization is inherited. All values come from `var(--ply-*)` tokens; each component additionally declares its overridable knobs as component-scoped custom properties (`--ply-button-radius: var(--ply-radius-md)`) — the documented escape hatch Polaris refused to give (see `systems/polaris.md` §8). `className` passthrough stays available, but Ply's own styling never depends on consumers using function-form `className`.

**House rule 4 — Figma variant ↔ prop, 1:1, lowercase.** Figma component properties in Phase 5 use the *exact code casing*: property names `variant`, `tone`, `size`, `isDisabled`; values `primary`, `critical`, `md`, `true`. Not Title Case — designer-side prettiness isn't worth a mapping table, and lowercase camelCase is the only casing that is simultaneously a legal JS identifier, a Figma property name, and greppable across `.figma.md` maps, the Phase 5 spec template, and Storybook. A Figma variant grid is then literally the component's prop table; `.figma.md` maps degenerate to "names are identical," which is the cheapest possible sync contract for a solo maintainer (and mirrors Carbon's Code Connect posture, minus the paid plan).

**Example sketches** (the Phase 5 spec template should read exactly like these):

```tsx
// Button — config-only, closed sets, slot prop for icon
<Button variant="primary" tone="critical" size="md" isDisabled icon={<TrashIcon />} onPress={del}>
  Delete
</Button>

// TextField — RAC controlled/uncontrolled duality passed through
<TextField label="Store name" description="Shown on receipts" defaultValue="Ply & Co"
  isRequired isInvalid={!valid} errorMessage="Required" prefix={<SearchIcon />} onChange={setName} />

// Menu — compound composition for the open set, config for the closed set
<Menu.Trigger>
  <Button variant="ghost" size="sm">Options</Button>
  <Menu onAction={handle}>
    <Menu.Item id="rename">Rename</Menu.Item>
    <Menu.Section title="Danger zone">
      <Menu.Item id="delete" tone="critical">Delete</Menu.Item>
    </Menu.Section>
  </Menu>
</Menu.Trigger>
```

**House rule 5 — prop deprecation.** Never repurpose a name. To retire a prop: keep it working, log a dev-only `console.warn` naming the replacement, mark it `@deprecated` in JSDoc (surfaces in IDEs and Storybook), record old→new in the component's docs page and changelog, and delete after one minor version. Mirror the same deprecation in the Figma component (rename via Figma's property rename, which preserves instances — per the CLAUDE.md "renames, never delete/recreate" guardrail). Trade-off accepted: the trio + closed vocab is less expressive than free-form styling props, and skipping `as=`/`asChild` costs some composition flexibility — in exchange every API is guessable from any other, and the Figma file, the code, the docs, and an LLM's prior all agree.

## 5. Sources

- System dossiers: `kb/systems/{polaris,atlassian,carbon,primer,spectrum,material,shadcn-radix}.md` (all updated 2026-07-05) — §5 of each for API style; polaris §5 (v12 enum migration), carbon §5/§7 (size normalization, Code Connect), primer §5 (slot props, v38), shadcn §3/§7 (flat vocab, AI adoption), material §5 (enumerated variants).
- https://react-aria.adobe.com/styling — className/style/children as functions, data-* state attributes, `--trigger-width` custom property (retrieved 2026-07-05)
- https://react-aria.adobe.com/forms — controlled/uncontrolled `value`/`defaultValue`, `onChange` convention (retrieved 2026-07-05)
- https://www.radix-ui.com/primitives/docs/guides/composition — `asChild`/Slot pattern (retrieved 2026-07-05)
- https://base-ui.com/react/utils/use-render — `render` prop as the post-Radix composition idiom (retrieved 2026-07-05)
- https://www.figma.com/code-connect-docs/react/ — mapping Figma variant properties to React props (retrieved 2026-07-05)
- https://www.figma.com/best-practices/creating-and-organizing-variants/ — variant property naming guidance (retrieved 2026-07-05)
- https://designsystemdiaries.com/p/close-the-gap-how-to-boost-parity-between-figma-and-code — same-terminology parity argument (retrieved 2026-07-05)
