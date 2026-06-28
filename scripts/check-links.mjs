#!/usr/bin/env node
// Validates relative links in MDX files using Fumadocs/MDX link semantics.
//
// MDX `./foo` and `../foo` are resolved against the **section directory**
// of the current page. For example, for content/docs/ai-features/tools.mdx
// the base is content/docs/ai-features/ (URL: /docs/ai-features/).
//
// We resolve relative paths as filesystem paths against that base, then
// check that the resulting file exists (either as <name>.mdx or as a
// directory containing index.mdx).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const ROOT = process.cwd();
const DOCS = join(ROOT, 'content', 'docs');

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (e.endsWith('.mdx')) acc.push(p);
  }
  return acc;
}

function extractLinks(text) {
  const links = [];
  const re = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let m;
  while ((m = re.exec(text)) !== null) links.push(m[1]);
  return links;
}

function isInternal(link) {
  if (!link) return false;
  if (link.startsWith('http://') || link.startsWith('https://')) return false;
  if (link.startsWith('mailto:') || link.startsWith('#')) return false;
  return link.startsWith('./') || link.startsWith('../');
}

function sectionDir(file) {
  // The section directory in the file system, e.g. content/docs/ai-features
  return dirname(file);
}

const files = walk(DOCS);
const seen = new Set();
const results = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const base = sectionDir(file);
  for (const raw of extractLinks(text)) {
    if (!isInternal(raw)) continue;
    const key = `${file}::${raw}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // Resolve the relative path against the section directory.
    const resolved = resolve(base, raw.split('#')[0]);
    // Clamp to the docs root: if `..` popped past DOCS, clamp to DOCS itself.
    const relToDocs = relative(DOCS, resolved);
    let target;
    if (relToDocs.startsWith('..')) {
      target = DOCS;
    } else {
      target = resolved;
    }
    // Try as <name>.mdx, or as <dir>/index.mdx.
    const candidates = [target + '.mdx', join(target, 'index.mdx')];
    let ok = false;
    let actual = null;
    for (const c of candidates) {
      if (existsSync(c)) {
        ok = true;
        actual = c;
        break;
      }
    }
    results.push({ file, raw, ok, actual });
  }
}

let okCount = 0;
let badCount = 0;
for (const r of results) {
  if (r.ok) okCount++;
  else badCount++;
  const tag = r.ok ? 'OK ' : 'BAD';
  const fp = r.actual ? relative(ROOT, r.actual) : '(no target)';
  console.log(`${tag}  ${relative(ROOT, r.file)}: ${r.raw}  →  ${fp}`);
}

console.log(`\n=== Summary ===`);
console.log(`Total unique: ${results.length}`);
console.log(`OK: ${okCount}`);
console.log(`Broken: ${badCount}`);

if (badCount > 0) process.exit(1);
