#!/usr/bin/env node
// DTCG-aware token diff: compares two versions of packages/tokens/src.
//   node scripts/diff-tokens.mjs <oldDir> <newDir>
// (oldDir is typically produced via: git show <sha>:packages/tokens/src/<file> > tmp/<file>)
// Rename detection keys on $extensions.ply.figma.variableId; path-only matching is the fallback.
// Output: JSON to stdout — { added, removed, renamed, valueChanged, descriptionChanged }
import { readFileSync } from "node:fs";
import path from "node:path";

const [oldDir, newDir] = process.argv.slice(2);
if (!oldDir || !newDir) throw new Error("usage: diff-tokens.mjs <oldDir> <newDir>");

const FILES = [
  "primitives.tokens.json",
  "brand.brand-1.tokens.json",
  "brand.brand-2.tokens.json",
  "font.geist.tokens.json",
  "font.die-grotesk-a.tokens.json",
  "semantic.light.tokens.json",
  "semantic.dark.tokens.json",
];
const modeOf = (f) =>
  f.includes("semantic") ? (f.includes("dark") ? "dark" : "light")
  : f.includes("brand-") ? f.match(/brand-(\d)/)[0]
  : f.startsWith("font.") ? f.replace(/^font\.|\.tokens\.json$/g, "")
  : "value";
const flat = (obj, prefix = []) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && "$value" in v) out[[...prefix, k].join(".")] = v;
    else if (v && typeof v === "object") Object.assign(out, flat(v, [...prefix, k]));
  }
  return out;
};
const loadSet = (dir) => {
  const tokens = {};
  for (const f of FILES) {
    let doc;
    try { doc = JSON.parse(readFileSync(path.join(dir, f), "utf8")); } catch { continue; }
    const mode = modeOf(f);
    for (const [p, t] of Object.entries(flat(doc))) {
      tokens[p] ??= { modes: {} };
      tokens[p].modes[mode] = t.$value;
      if (t.$description) tokens[p].description = t.$description;
      const vid = t.$extensions?.ply?.figma?.variableId;
      if (vid) tokens[p].variableId = vid;
    }
  }
  return tokens;
};

const A = loadSet(oldDir), B = loadSet(newDir);
const byId = (set) => Object.fromEntries(Object.entries(set).filter(([, t]) => t.variableId).map(([p, t]) => [t.variableId, p]));
const aById = byId(A), bById = byId(B);

const result = { added: [], removed: [], renamed: [], valueChanged: [], descriptionChanged: [] };
for (const p of Object.keys(B)) {
  if (A[p]) continue;
  const vid = B[p].variableId;
  if (vid && aById[vid]) result.renamed.push({ from: aById[vid], to: p });
  else result.added.push(p);
}
for (const p of Object.keys(A)) {
  if (B[p]) continue;
  const vid = A[p].variableId;
  if (vid && bById[vid]) continue; // counted as rename
  result.removed.push(p);
}
const renamedTo = Object.fromEntries(result.renamed.map((r) => [r.to, r.from]));
for (const [p, tB] of Object.entries(B)) {
  const tA = A[renamedTo[p] ?? p];
  if (!tA) continue;
  for (const [mode, v] of Object.entries(tB.modes)) {
    if (tA.modes[mode] !== undefined && JSON.stringify(tA.modes[mode]) !== JSON.stringify(v))
      result.valueChanged.push({ token: p, mode, from: tA.modes[mode], to: v });
  }
  if (tA.description !== tB.description)
    result.descriptionChanged.push({ token: p, from: tA.description, to: tB.description });
}
console.log(JSON.stringify(result, null, 2));
const total = Object.values(result).reduce((n, a) => n + a.length, 0);
process.exitCode = 0;
console.error(`diff-tokens: ${result.added.length} added · ${result.removed.length} removed · ${result.renamed.length} renamed · ${result.valueChanged.length} value changes · ${result.descriptionChanged.length} description changes (${total} total)`);
