#!/usr/bin/env node
// Composes the Figma export snapshot into DTCG token files (ADR-0007 reference naming):
//   packages/tokens/src/primitives.tokens.json         (tier 1 — single-mode: color ramps + scales)
//   packages/tokens/src/brand.brand-1.tokens.json      (colors-brand ramp, Brand 1 aliases)
//   packages/tokens/src/brand.brand-2.tokens.json      (colors-brand ramp, Brand 2 aliases)
//   packages/tokens/src/font.geist.tokens.json         (font-family Geist mode)
//   packages/tokens/src/font.die-grotesk-a.tokens.json (font-family Die Grotesk A mode)
//   packages/tokens/src/semantic.light.tokens.json     (tier 2 — Light values + full metadata)
//   packages/tokens/src/semantic.dark.tokens.json      (tier 2 — Dark values, lean)
// Usage: node scripts/build-dtcg.mjs <path-to-ply-export.json>
// The export snapshot is produced by /ply-export-tokens (chunked Figma MCP reads).
// Figma names are copied verbatim (ADR-0007); the ONLY code-side projection is that
// bare scale names gain a group prefix (space/0, radius/Full, breakpoint/xs) so DTCG
// paths stay collision-free — recorded in $extensions.ply.figma.collection.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "packages/tokens/src");
const exportPath = process.argv[2];
if (!exportPath) throw new Error("usage: node scripts/build-dtcg.mjs <ply-export.json>");
const snap = JSON.parse(readFileSync(exportPath, "utf8"));

// deprecated/* tokens exist in Figma for binding stability but never reach code (ADR-0007)
snap.semantic = snap.semantic.filter(([name]) => !name.startsWith("deprecated/"));

const set = (obj, tokenPath, token) => {
  const parts = tokenPath.split("/");
  let cur = obj;
  for (const p of parts.slice(0, -1)) cur = cur[p] ??= {};
  const leaf = parts[parts.length - 1];
  if (cur[leaf]) throw new Error(`duplicate or prefix-colliding path: ${tokenPath}`);
  cur[leaf] = token;
};

// scale collections → DTCG group prefix (code-side projection, see header note)
const SCALES = [
  ["space-primitives", "space", "dimension"],
  ["radius-primitives", "radius", "dimension"],
  ["font-size", "", "dimension"],
  ["font-line-height", "", "dimension"],
  ["breakpoints", "breakpoint", "dimension"],
  ["font-weight", "", "fontWeight"],
];

// Invariant: no token path may be a path-prefix of another token path.
const allPaths = [
  ...snap.colorPrimitives.map((r) => r[0]),
  ...SCALES.flatMap(([coll, prefix]) => (snap[coll] ?? []).map((r) => (prefix ? `${prefix}/${r[0]}` : r[0]))),
  ...(snap["font-family"] ?? []).map((r) => r[0]),
  ...(snap["colors-brand"] ?? []).map((r) => `colors-brand/${r[0]}`),
  ...snap.semantic.map((r) => r[0]),
];
for (const a of allPaths) {
  for (const b of allPaths) {
    if (a !== b && b.startsWith(a + "/")) throw new Error(`prefix collision: "${a}" is a group-prefix of "${b}"`);
  }
}

const toRef = (name) => `{${name.replaceAll("/", ".")}}`;

// ---- Tier 1: primitives (color ramps + scales + default-mode font families) ----
const primitives = {};
for (const [name, hex] of snap.colorPrimitives) {
  set(primitives, name, {
    $type: "color",
    $value: hex,
    $description: "Tier-1 primitive. Never use directly — consume via a semantic token.",
    $extensions: { ply: { figma: { collection: "color-primitives" } } },
  });
}
for (const [coll, prefix, type] of SCALES) {
  for (const [name, val] of snap[coll] ?? []) {
    set(primitives, prefix ? `${prefix}/${name}` : name, {
      $type: type,
      $value: type === "dimension" ? `${val}px` : val,
      $extensions: { ply: { figma: { collection: coll } } },
    });
  }
}
// font-family: multi-mode — Inter (default) lands in primitives, other modes in their own files
const fontModes = { Geist: {}, "Die Grotesk A": {} };
for (const [name, byMode] of snap["font-family"] ?? []) {
  set(primitives, name, {
    $type: "fontFamily",
    $value: [byMode["Inter"]],
    $extensions: { ply: { figma: { collection: "font-family", mode: "Inter" } } },
  });
  for (const mode of ["Geist", "Die Grotesk A"]) {
    set(fontModes[mode], name, {
      $type: "fontFamily",
      $value: [byMode[mode]],
      $extensions: { ply: { figma: { collection: "font-family", mode } } },
    });
  }
}

// ---- colors-brand ramp: two mode files (aliases into the primitive ramps) ----
const brand1 = {};
const brand2 = {};
for (const [step, b1, b2] of snap["colors-brand"] ?? []) {
  const ext = (mode) => ({ ply: { figma: { collection: "colors-brand", mode } } });
  set(brand1, `colors-brand/${step}`, { $type: "color", $value: toRef(b1), $extensions: ext("Brand 1") });
  set(brand2, `colors-brand/${step}`, { $type: "color", $value: toRef(b2), $extensions: ext("Brand 2") });
}

// ---- pairsWith rules (contrast-lint contract rebuilt on reference vocabulary, ADR-0007) ----
// The deprecated on-* pairing tokens are gone; pairs use only reference-native tokens.
// Reference-verbatim tokens with no safe cross-mode partner (status solids, boldest rungs,
// inverse, data-viz) carry NO contract — flagged as known risks in the rename manifest.
const pairsFor = (name) => {
  const seg = name.split("/");
  const state = ["hovered", "pressed"].includes(seg[seg.length - 1]) ? seg.pop() : null;
  if (seg[seg.length - 1] === "default") seg.pop(); // /default leaves share their base's contract
  const base = seg.join("/");
  // brand solids (default + bold): white text holds in both modes (dark steps were
  // deliberately darkened — the kept fixes)
  if (base === "background/brand" || base === "background/brand/bold")
    return ["text/static/white"];
  // brand tints + selected: brand-colored or neutral text when resting; workhorse text in states
  if (base === "background/brand/subtlest" || base === "background/selected")
    return state ? ["text/neutral/default"] : ["text/brand/default", "text/brand/bold", "text/neutral/default"];
  // neutral bold fills: text/neutral/inverse is designed for them and flips with the fill
  if (base === "background/neutral/bold") return ["text/neutral/inverse"];
  // neutral subtler overlay (the workhorse tint)
  if (base === "background/neutral/subtler")
    return state ? ["text/neutral/default"] : ["text/neutral/default", "text/neutral/subtler"];
  // surfaces
  if (/^background\/surface\/(flat|sunken|raised|overlay)$/.test(base))
    return state ? ["text/neutral/default"] : ["text/neutral/default", "text/neutral/subtler"];
  // status subtle tints
  const mStatus = base.match(/^background\/status\/(danger|success|warning|info)\/subtle$/);
  if (mStatus) {
    const role = mStatus[1];
    return state
      ? ["text/neutral/default"]
      : [`text/status/${role}/default`, `text/status/${role}/bold`, "text/neutral/default"];
  }
  if (base === "background/disabled") return ["text/disabled"]; // informational (WCAG-exempt)
  return null;
};

// ---- usage seeds: state variants get a generic seed; narrative lives in the Token Usage table ----
const usageFor = (n) => {
  const seg = n.split("/");
  const st = ["hovered", "pressed"].includes(seg[seg.length - 1]) ? seg[seg.length - 1] : null;
  if (!st || !n.startsWith("background/")) return null;
  const base = seg.slice(0, -1).join("/");
  return {
    where: `The ${st} state of elements filled with ${base}.`,
    how: `Bind to the ${st} interaction in component variants; never as a resting fill.`,
    do: "Keep state transitions quick (100–150ms) and consistent.",
    dont: `Don't use as a default fill — resting surfaces use ${base}/default.`,
  };
};

// ---- Tier 2: semantic light + dark ----
const light = {};
const dark = {};
for (const [name, l, d, desc] of snap.semantic) {
  const pairs = pairsFor(name);
  const usage = usageFor(name);
  const variableId = snap.semanticIds?.[name];
  const ext = { ply: { figma: { collection: "color-semantic", mode: "Light", variableId } } };
  if (pairs) ext.ply.pairsWith = pairs.map((p) => p.replaceAll("/", "."));
  if (usage) ext.ply.usage = usage;
  set(light, name, { $type: "color", $value: toRef(l), $description: desc, $extensions: ext });
  set(dark, name, {
    $type: "color",
    $value: toRef(d),
    $extensions: { ply: { figma: { collection: "color-semantic", mode: "Dark", variableId } } },
  });
}

mkdirSync(OUT, { recursive: true });
const write = (file, obj) => writeFileSync(path.join(OUT, file), JSON.stringify(obj, null, 2) + "\n");
write("primitives.tokens.json", primitives);
write("brand.brand-1.tokens.json", brand1);
write("brand.brand-2.tokens.json", brand2);
write("font.geist.tokens.json", fontModes["Geist"]);
write("font.die-grotesk-a.tokens.json", fontModes["Die Grotesk A"]);
write("semantic.light.tokens.json", light);
write("semantic.dark.tokens.json", dark);
console.log(
  `build-dtcg: ${snap.colorPrimitives.length} color primitives, ${snap["colors-brand"]?.length ?? 0} brand steps, ${snap.semantic.length} semantic tokens → ${OUT}`
);
