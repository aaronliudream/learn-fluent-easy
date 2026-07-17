/**
 * 图书馆:批量给书 JSON 的英文句子配中文(复用 supabase/functions/translate;Gemini flash)。
 * 就地回填 cn 为空的句子,分批调用避免限流。人工抽查后再 build-seed。
 *
 * ⚠️ 只有 anon key,不写库;只改本地 JSON。AI 翻译须人工抽查(教学内容审核门)。
 * 用法:node scripts/library/translate.mjs <book_key>
 */
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);
const SUP = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TR_URL = `${SUP}/functions/v1/translate`;
const BATCH = 40;
const THROTTLE_MS = 1500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const key = process.argv[2];
if (!key) {
  console.error("用法: node scripts/library/translate.mjs <book_key>");
  process.exit(1);
}
const path = `scripts/library/books/${key}.json`;
const book = JSON.parse(readFileSync(path, "utf8"));

// 收集待翻译句子(cn 为空)
const todo = [];
book.chapters.forEach((ch, ci) =>
  ch.paragraphs.forEach((p, pi) =>
    p.forEach((s, si) => {
      if (!s.cn) todo.push({ key: `${ci}.${pi}.${si}`, text: s.en, ref: s });
    }),
  ),
);
if (!todo.length) {
  console.log("没有待翻译句子(cn 已全部填过)。");
  process.exit(0);
}
console.log(`待翻译 ${todo.length} 句,分 ${Math.ceil(todo.length / BATCH)} 批。`);

async function translateBatch(chunk) {
  const res = await fetch(TR_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({
      targetLanguage: "Chinese (Simplified)",
      sourceLanguage: "English",
      items: chunk.map(({ key, text }) => ({ key, text })),
    }),
  });
  if (!res.ok) {
    console.log(`  ❌ HTTP ${res.status}: ${(await res.text()).slice(0, 120)}`);
    return {};
  }
  const data = await res.json();
  if (data.fallback) console.log(`  ⚠️ 翻译降级(${data.reason}),该批未翻,保留原文待重跑`);
  return data.translations || {};
}

let done = 0;
for (let i = 0; i < todo.length; i += BATCH) {
  const chunk = todo.slice(i, i + BATCH);
  const tr = await translateBatch(chunk);
  for (const it of chunk) {
    const v = tr[it.key];
    if (v && v !== it.text) {
      it.ref.cn = v;
      done++;
    }
  }
  writeFileSync(path, JSON.stringify(book, null, 2)); // 每批落盘,断了可续
  console.log(`  ✓ ${Math.min(i + BATCH, todo.length)}/${todo.length}`);
  if (i + BATCH < todo.length) await sleep(THROTTLE_MS);
}
console.log(`完成:${done}/${todo.length} 句已配中文 → ${path}(请人工抽查后再 build-seed)`);
