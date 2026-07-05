#!/usr/bin/env node
// Composes the Figma export snapshot into DTCG token files:
//   packages/tokens/src/primitives.tokens.json         (tier 1 — single-mode)
//   packages/tokens/src/semantic.light.tokens.json     (tier 2 — Light values + full metadata)
//   packages/tokens/src/semantic.dark.tokens.json      (tier 2 — Dark values, lean)
// Usage: node scripts/build-dtcg.mjs <path-to-ply-export.json>
// The export snapshot is produced by /ply-export-tokens (chunked Figma MCP reads).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "packages/tokens/src");
const exportPath = process.argv[2];
if (!exportPath) throw new Error("usage: node scripts/build-dtcg.mjs <ply-export.json>");
const snap = JSON.parse(readFileSync(exportPath, "utf8"));

const set = (obj, tokenPath, token) => {
  const parts = tokenPath.split("/");
  let cur = obj;
  for (const p of parts.slice(0, -1)) cur = cur[p] ??= {};
  const leaf = parts[parts.length - 1];
  if (cur[leaf]) throw new Error(`duplicate or prefix-colliding path: ${tokenPath}`);
  cur[leaf] = token;
};

// Invariant: no token path may be a path-prefix of another token path.
const allPaths = [
  ...snap.colorPrimitives.map((r) => r[0]),
  ...["space", "radius", "font-size", "font-weight", "line-height", "breakpoint", "font-family"].flatMap((k) => snap[k].map((r) => r[0])),
  ...snap.semantic.map((r) => r[0]),
];
for (const a of allPaths) {
  for (const b of allPaths) {
    if (a !== b && b.startsWith(a + "/")) throw new Error(`prefix collision: "${a}" is a group-prefix of "${b}"`);
  }
}

// ---- Tier 1: primitives ----
const primitives = {};
for (const [name, hex] of snap.colorPrimitives) {
  set(primitives, name, {
    $type: "color",
    $value: hex,
    $description: "Tier-1 primitive. Never use directly — consume via a semantic token.",
    $extensions: { ply: { figma: { collection: "color-primitives" } } },
  });
}
const DIM = { space: "space", radius: "radius", "font-size": "font-size", "line-height": "line-height", breakpoint: "breakpoint" };
for (const [coll, _] of Object.entries(DIM)) {
  for (const [name, val] of snap[coll]) {
    set(primitives, name, {
      $type: "dimension",
      $value: `${val}px`,
      $extensions: { ply: { figma: { collection: coll } } },
    });
  }
}
for (const [name, val] of snap["font-weight"]) {
  set(primitives, name, { $type: "fontWeight", $value: val, $extensions: { ply: { figma: { collection: "font-weight" } } } });
}
for (const [name, val] of snap["font-family"]) {
  set(primitives, name, { $type: "fontFamily", $value: [val], $extensions: { ply: { figma: { collection: "font-family" } } } });
}

// ---- pairsWith rules (the contrast-lint contract, ADR-0005) ----
// bg token → foreground tokens that are legal on it. on-* pairs are hard 4.5:1; others lint at 4.5:1 too.
const pairsFor = (name) => {
  const isState = /-(hovered|pressed)$/.test(name);
  const base = name.replace(/-(hovered|pressed)$/, "");
  const isSolid =
    base === "bg/accent" || base === "bg/accent-bold" || base === "bg/neutral-bold" ||
    (base.startsWith("bg/status/") && !base.includes("-subtle"));
  // Transient states of tints/surfaces guarantee only the workhorse text color;
  // role-colored text is only contracted on resting values.
  if (isState && !isSolid) {
    if (base === "bg/accent-subtle" || base === "bg/selected" || base === "bg/neutral-subtle" ||
        base.startsWith("bg/surface") || (base.startsWith("bg/status/") && base.includes("-subtle")))
      return ["text/neutral"];
    return null;
  }
  if (name.startsWith("bg/status/")) {
    const role = name.split("/")[2].split("-")[0];
    if (base.includes("-subtle")) return [`text/status/${role}`, `text/status/${role}-bold`, "text/neutral"];
    // warning/info solids carry dark text, so their bold fills (dark in light mode) need dedicated on-*-bold pairs
    if (base.includes("-bold") && (role === "warning" || role === "info")) return [`text/on-status-${role}-bold`];
    return [`text/on-status-${role}`];
  }
  if (base === "bg/accent" || base === "bg/accent-bold") return ["text/on-accent", "icon/on-accent"];
  if (base === "bg/accent-subtle" || base === "bg/selected") return ["text/accent", "text/accent-bold", "text/neutral"];
  if (base === "bg/neutral-bold") return ["text/on-neutral-bold"];
  if (base === "bg/neutral-subtle" || base.startsWith("bg/surface")) return ["text/neutral", "text/neutral-subtle"];
  if (base === "bg/disabled") return ["text/disabled"];
  return null;
};

// ---- usage seeds: identical templates to the Token Usage table build.
// Future exports read the table itself (/ply-export-tokens); v1 regenerates because the table was just seeded.
const usageFor = (n) => {
  const st = n.endsWith("-hovered") ? "hovered" : n.endsWith("-pressed") ? "pressed" : null;
  const base = n.replace(/-(hovered|pressed)$/, "");
  if (n.startsWith("bg/") && st) return {
    where: `The ${st} state of elements filled with ${base}.`,
    how: `Bind to the ${st} interaction in component variants; never as a resting fill.`,
    do: "Keep state transitions quick (100–150ms) and consistent.",
    dont: `Don't use as a default fill — resting surfaces use ${base}.`,
  };
  return null; // narrative detail lives in the Token Usage table; description carries the essentials
};

// ---- Tier 2: semantic light + dark ----
const toRef = (primName) => `{${primName.replaceAll("/", ".")}}`;
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
write("semantic.light.tokens.json", light);
write("semantic.dark.tokens.json", dark);
console.log(`build-dtcg: ${snap.colorPrimitives.length} color primitives, ${snap.semantic.length} semantic tokens → ${OUT}`);
