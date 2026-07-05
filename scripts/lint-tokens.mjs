#!/usr/bin/env node
// Token lint (ADR-0007):
//  1. Path-prefix invariant (no token path is a group-prefix of another)
//  2. WCAG contrast over every $extensions.ply.pairsWith pair, light AND dark
//     - text pairs: 4.5:1 (pairs involving `disabled` are informational — WCAG exempts inactive UI)
//     - border/focused vs surfaces: 3:1 (non-text)
//  3. Coverage floor: the pair-check count must stay ≥ FLOOR so a pairsFor rewrite
//     can never silently pass by checking nothing.
// Brand aliases resolve under Brand 1 (Blue). Brand 2 is deliberately unlinted —
// the reference ships it without a contrast contract (rename manifest, known risks).
// Alpha values are composited over the mode's flat surface before measuring.
// Exit 1 on failures.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../packages/tokens/src");
const load = (f) => JSON.parse(readFileSync(path.join(SRC, f), "utf8"));
const primitives = load("primitives.tokens.json");
const brand1 = load("brand.brand-1.tokens.json");
const light = load("semantic.light.tokens.json");
const dark = load("semantic.dark.tokens.json");

const FLOOR = 100; // recalibrate deliberately (with a commit) if the pair contract shrinks
const SURFACE = "background.surface.flat.default";

const flat = (obj, prefix = []) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && "$value" in v) out[[...prefix, k].join(".")] = v;
    else if (v && typeof v === "object") Object.assign(out, flat(v, [...prefix, k]));
  }
  return out;
};
const P = { ...flat(primitives), ...flat(brand1) };
const L = flat(light), D = flat(dark);

// 1 — prefix invariant across all files
const paths = [...Object.keys(P), ...Object.keys(L)];
const problems = [];
for (const a of paths) for (const b of paths) if (a !== b && b.startsWith(a + ".")) problems.push(`prefix collision: ${a} ⊂ ${b}`);

const hexToRgba = (h) => {
  const n = h.replace("#", "");
  return {
    r: parseInt(n.slice(0, 2), 16) / 255,
    g: parseInt(n.slice(2, 4), 16) / 255,
    b: parseInt(n.slice(4, 6), 16) / 255,
    a: n.length === 8 ? parseInt(n.slice(6, 8), 16) / 255 : 1,
  };
};
const resolveHex = (modeMap, tokenPath) => {
  const t = modeMap[tokenPath] ?? P[tokenPath];
  if (!t) throw new Error("unknown token: " + tokenPath);
  let v = t.$value;
  while (typeof v === "string" && v.startsWith("{")) {
    const ref = v.slice(1, -1);
    const rt = P[ref] ?? modeMap[ref];
    if (!rt) throw new Error("unresolved ref " + v + " from " + tokenPath);
    v = rt.$value;
  }
  return v;
};
const over = (top, base) => ({
  r: top.r * top.a + base.r * (1 - top.a),
  g: top.g * top.a + base.g * (1 - top.a),
  b: top.b * top.a + base.b * (1 - top.a),
  a: 1,
});
const lum = (c) => {
  const f = (x) => (x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const measure = (modeMap, bgPath, fgPath) => {
  const surface = hexToRgba(resolveHex(modeMap, SURFACE));
  let bg = hexToRgba(resolveHex(modeMap, bgPath));
  if (bg.a < 1) bg = over(bg, surface);
  let fg = hexToRgba(resolveHex(modeMap, fgPath));
  if (fg.a < 1) fg = over(fg, bg);
  return contrast(fg, bg);
};

// 2 — pairsWith contrast, both modes
const results = [];
for (const [bgPath, tok] of Object.entries(L)) {
  const pairs = tok.$extensions?.ply?.pairsWith;
  if (!pairs) continue;
  for (const fgPath of pairs) {
    const info = bgPath.includes("disabled") || fgPath.includes("disabled");
    for (const [modeName, modeMap] of [["light", L], ["dark", D]]) {
      const ratio = measure(modeMap, bgPath, fgPath);
      const need = 4.5;
      const pass = ratio >= need;
      results.push({ bg: bgPath, fg: fgPath, mode: modeName, ratio: ratio.toFixed(2), need, pass, info });
      if (!pass && !info) problems.push(`contrast ${ratio.toFixed(2)} < ${need} (${modeName}): ${fgPath} on ${bgPath}`);
    }
  }
}
// focus ring: 3:1 non-text against default + sunken surfaces
for (const s of [SURFACE, "background.surface.sunken.default"]) {
  for (const [modeName, modeMap] of [["light", L], ["dark", D]]) {
    const ratio = measure(modeMap, s, "border.focused");
    results.push({ bg: s, fg: "border.focused", mode: modeName, ratio: ratio.toFixed(2), need: 3, pass: ratio >= 3, info: false });
    if (ratio < 3) problems.push(`focus ring ${ratio.toFixed(2)} < 3 (${modeName}) vs ${s}`);
  }
}

// 3 — coverage floor
if (results.length < FLOOR) problems.push(`coverage floor: only ${results.length} pair checks (< ${FLOOR}) — pairsFor is checking too little`);

const fails = results.filter((r) => !r.pass && !r.info);
const infos = results.filter((r) => !r.pass && r.info);
console.log(`lint-tokens: ${results.length} pair checks · ${fails.length} failures · ${infos.length} informational (disabled-exempt)`);
for (const r of fails) console.log(`  FAIL ${r.mode.padEnd(5)} ${r.ratio.padStart(5)} <${r.need}  ${r.fg}  on  ${r.bg}`);
for (const r of infos) console.log(`  info ${r.mode.padEnd(5)} ${r.ratio.padStart(5)}       ${r.fg}  on  ${r.bg}`);
const structural = problems.filter((p) => p.startsWith("prefix") || p.startsWith("coverage"));
if (structural.length) console.log(structural.join("\n"));
if (fails.length || structural.length) process.exit(1);
console.log("lint-tokens: PASS");
