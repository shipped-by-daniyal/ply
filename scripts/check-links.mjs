#!/usr/bin/env node
// Link checker for the built docs site (apps/docs/dist).
// Crawls every HTML file, extracts href/src, and verifies:
//   - internal absolute links carry the /ply base AND resolve to a built file
//   - relative links resolve against the page directory
//   - fragment links (#id) point at an existing id on the target page
// External links are inventoried but not fetched (CI must stay offline-stable).
// Exit 1 on any broken internal link. Run after `pnpm --filter docs build`:
//   node scripts/check-links.mjs
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "apps/docs/dist");
const BASE = "/ply";

if (!existsSync(DIST)) {
  console.error("check-links: apps/docs/dist not found — run `pnpm --filter docs build` first");
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith(".html")) htmlFiles.push(p);
  }
})(DIST);

const pageIds = new Map(); // dist html path -> Set of element ids
const idsFor = (file) => {
  if (!pageIds.has(file)) {
    const html = readFileSync(file, "utf8");
    const ids = new Set();
    for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
    ids.add("_top"); // Starlight's back-to-top anchor target
    pageIds.set(file, ids);
  }
  return pageIds.get(file);
};

// resolve a site-absolute path (already base-stripped) to a dist file
const resolveInternal = (sitePath) => {
  const clean = decodeURIComponent(sitePath).replace(/\/+$/, "");
  const candidates = clean === ""
    ? [path.join(DIST, "index.html")]
    : [
        path.join(DIST, clean, "index.html"),
        path.join(DIST, clean),
        path.join(DIST, clean + ".html"),
      ];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
};

const broken = [];
const external = new Set();
let checked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const page = "/" + path.relative(DIST, file).replaceAll(path.sep, "/");
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|data:|javascript:)/.test(url)) { external.add(url); continue; }
    checked++;
    const [target, fragment] = url.split("#");
    let targetFile;
    if (target === "" || target === undefined) {
      targetFile = file; // same-page fragment
    } else if (target.startsWith("/")) {
      if (target !== BASE && !target.startsWith(BASE + "/")) {
        broken.push({ page, url, reason: `missing ${BASE} base prefix` });
        continue;
      }
      targetFile = resolveInternal(target.slice(BASE.length));
      if (!targetFile) { broken.push({ page, url, reason: "no built file at target" }); continue; }
    } else {
      const dir = path.dirname(file);
      const resolved = path.resolve(dir, target);
      targetFile = [resolved, path.join(resolved, "index.html")].find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
      if (!targetFile) { broken.push({ page, url, reason: "relative link unresolved" }); continue; }
    }
    if (fragment && targetFile.endsWith(".html") && !idsFor(targetFile).has(fragment)) {
      broken.push({ page, url, reason: `no id "${fragment}" on target page` });
    }
  }
}

console.log(`check-links: ${htmlFiles.length} pages · ${checked} internal refs checked · ${external.size} external refs (not fetched) · ${broken.length} broken`);
if (broken.length) {
  const byReason = {};
  for (const b of broken) (byReason[b.reason] ??= []).push(b);
  for (const [reason, items] of Object.entries(byReason)) {
    console.log(`\n  ${reason} (${items.length}):`);
    for (const b of items.slice(0, 40)) console.log(`    ${b.page}  →  ${b.url}`);
    if (items.length > 40) console.log(`    … and ${items.length - 40} more`);
  }
  process.exit(1);
}
console.log("check-links: PASS");
