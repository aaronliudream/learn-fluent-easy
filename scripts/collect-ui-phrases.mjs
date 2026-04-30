#!/usr/bin/env node
// Scan src/ for <T>中文字面量</T> literals and write them to
// src/i18n/uiPhrases.generated.ts. The I18nProvider uses this list to
// pre-warm the dynamic-translation cache right after the user picks a
// language, so subsequent page navigation feels instant.
//
// Run:  node scripts/collect-ui-phrases.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const OUT = "src/i18n/uiPhrases.generated.ts";
const RE = /<T>\s*([^<{]+?)\s*<\/T>/g;
const HAN = /[\u3400-\u9fff]/;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx?|jsx?)$/.test(name)) acc.push(p);
  }
  return acc;
}

const seen = new Set();
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(RE)) {
    const t = m[1].trim();
    if (!t || t.includes("{") || t.includes("}")) continue;
    if (!HAN.test(t)) continue;
    seen.add(t);
  }
}

const out = [...seen].sort();
const body =
  "// AUTO-GENERATED: high-frequency UI phrases wrapped in <T>...</T>.\n" +
  "// Used by I18nProvider to warm the dynamic-translation cache right after\n" +
  "// the user picks a language, so subsequent navigation feels instant.\n" +
  "// Re-generate with: node scripts/collect-ui-phrases.mjs\n\n" +
  "export const UI_PHRASES: readonly string[] = [\n" +
  out.map((s) => "  " + JSON.stringify(s) + ",").join("\n") +
  "\n] as const;\n";
writeFileSync(OUT, body);
console.log(`Wrote ${OUT} (${out.length} phrases)`);