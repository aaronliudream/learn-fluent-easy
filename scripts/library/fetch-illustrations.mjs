/**
 * 图书馆插图离线管线(v1 · 每章一图章首)。照 prewarm-audio.mjs 骨架:下载 → 尺寸 → 本地 → (后续)传桶 + seed SQL。
 *
 * 降采样不装 sharp:直接取 Wikimedia 缩略图端点 Special:FilePath/<file>?width=1000 → ~1000px 宽。
 * 尺寸从图头解析(PNG IHDR / JPEG SOFn)→ 存表防 CLS。
 * 映射经 Wikisource 逐章核实(见 docs/reading/ILLUSTRATIONS.md);ch10 留空;ch12/ch21 下载后肉眼核。
 *
 * ⚠️ 只下载 + 本地存,不写库、不传桶(传桶另走)。公有领域 Denslow 1900,credit 标注。
 * 用法:node scripts/library/fetch-illustrations.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";

const BOOK_KEY = "wizard-of-oz";
const OUT = `scripts/library/illustrations-out/${BOOK_KEY}`;
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 定稿映射(23 章;ch10 留空)。caption = 原书图注(存 caption/alt)。
const MAP = [
  { ch: 1,  file: "The Wonderful Wizard of Oz, 014.png",        slug: "dorothy-toto",     caption: "She caught Toto by the ear." },
  { ch: 2,  file: "Wizoz munch.png",                            slug: "good-witch-north", caption: "\"I am the Witch of the North.\"" },
  { ch: 3,  file: "The Wonderful Wizard of Oz Book - p45.jpg",  slug: "scarecrow",        caption: "Dorothy gazed thoughtfully at the Scarecrow." },
  { ch: 4,  file: "The Wonderful Wizard of Oz Book - p55.jpg",  slug: "scarecrow-made",   caption: "\"I was only made yesterday,\" said the Scarecrow." },
  { ch: 5,  file: "The Wonderful Wizard of Oz Book - p69.jpg",  slug: "tin-woodman",      caption: "\"This is a great comfort,\" said the Tin Woodman." },
  { ch: 6,  file: "The Wonderful Wizard of Oz Book - p81.jpg",  slug: "cowardly-lion",    caption: "\"You ought to be ashamed of yourself!\"" },
  { ch: 7,  file: "The Wonderful Wizard of Oz Book - p97.jpg",  slug: "kalidahs",         caption: "The tree fell with a crash into the gulf." },
  { ch: 8,  file: "The Wonderful Wizard of Oz Book - p114.jpg", slug: "poppy-field",      caption: "The deadly poppy field." },
  { ch: 9,  file: "The Wonderful Wizard of Oz Book - p123.jpg", slug: "field-mice-queen", caption: "Permit me to introduce to you her Majesty, the Queen." },
  { ch: 11, file: "The Wonderful Wizard of Oz Book - p151.jpg", slug: "oz-the-head",      caption: "The Eyes looked at her thoughtfully." },
  { ch: 13, file: "The Wonderful Wizard of Oz Book - p191.jpg", slug: "tinsmiths",        caption: "The Tinsmiths worked for three days and four nights." },
  { ch: 14, file: "The Wonderful Wizard of Oz Book - p203.jpg", slug: "winged-monkeys",   caption: "The Monkeys caught Dorothy in their arms and flew away with her." },
  { ch: 15, file: "The Wonderful Wizard of Oz Book - p219.jpg", slug: "humbug",           caption: "Exactly so! I am a humbug." },
  { ch: 16, file: "The Wonderful Wizard of Oz Book - p235.jpg", slug: "brains",           caption: "\"I feel wise, indeed,\" said the Scarecrow." },
  { ch: 17, file: "The Wonderful Wizard of Oz Book - p245.jpg", slug: "balloon",          caption: "The balloon rose into the air (the Wizard departs)." },
  { ch: 18, file: "The Wonderful Wizard of Oz Book - p251.jpg", slug: "scarecrow-throne", caption: "The Scarecrow sat on the big throne." },
  { ch: 19, file: "Fighting tree.jpg",                          slug: "fighting-trees",   caption: "The branches bent down and twined around him." },
  { ch: 20, file: "The Wonderful Wizard of Oz Book - p271.jpg", slug: "china-country",    caption: "These people were all made of china." },
  { ch: 22, file: "The Wonderful Wizard of Oz Book - p291.jpg", slug: "hammer-heads",     caption: "The Head shot forward and struck the Scarecrow." },
  { ch: 23, file: "The Wonderful Wizard of Oz Book - p301.jpg", slug: "glinda",           caption: "You must give me the Golden Cap. (Glinda)" },
  { ch: 24, file: "The Wonderful Wizard of Oz Book - p309b.jpg", slug: "home-again",      caption: "Dorothy home again with Aunt Em." },
];
// ch12/ch21 候选(下载后肉眼核,选对的那张)
const CANDIDATES = [
  { file: "The Wonderful Wizard of Oz Book - p177.jpg", slug: "cand-ch12-p177" },
  { file: "The Wonderful Wizard of Oz Book - p185.jpg", slug: "cand-ch12-p185" },
  { file: "Wicked Witch of the West.png",               slug: "cand-ch12-witch" },
  { file: "The Wonderful Wizard of Oz Book - p283.jpg", slug: "cand-ch21-p283" },
  { file: "Cowardly Lion.png",                          slug: "cand-ch21-lion" },
];

const UA = "learn-fluent-easy/1.0 (educational; contact aaron)";

async function robustFetch(url, tries = 6) {
  for (let a = 1; ; a++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (r.status === 429 && a < tries) { await sleep(2500 * a); continue; }
      return r;
    } catch (e) {
      if (a >= tries) throw e;
      await sleep(1500 * a);
    }
  }
}

/** 批量 imageinfo:一次拿全部文件的 1000px 缩图 URL + 精确宽高(避开 Special:FilePath 的限流/不降采样)。 */
async function fetchThumbInfo(files) {
  const info = new Map(); // file → { thumburl, w, h }
  const titles = files.map((f) => "File:" + f).join("|");
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo` +
    `&iiprop=url%7Csize&iiurlwidth=1000&titles=${encodeURIComponent(titles)}`;
  const j = await (await robustFetch(api)).json();
  const pages = j?.query?.pages || {};
  for (const k of Object.keys(pages)) {
    const p = pages[k];
    const ii = p.imageinfo && p.imageinfo[0];
    if (!ii) continue;
    const file = String(p.title).replace(/^File:/, "");
    info.set(file, { thumburl: ii.thumburl || ii.url, w: ii.thumbwidth || ii.width, h: ii.thumbheight || ii.height });
  }
  return info;
}

async function dl(thumburl, w, h, outName) {
  const r = await robustFetch(thumburl);
  if (!r.ok) { console.log(`❌ ${outName}: HTTP ${r.status}`); return null; }
  const buf = Buffer.from(await r.arrayBuffer());
  const ext = thumburl.toLowerCase().endsWith(".png") ? "png" : "jpg";
  writeFileSync(`${OUT}/${outName}.${ext}`, buf);
  console.log(`✓ ${outName}.${ext}\t${w}x${h}\t${(buf.length / 1024).toFixed(0)}KB`);
  return { w, h, bytes: buf.length, ext };
}

(async () => {
  const allFiles = [...MAP.map((m) => m.file), ...CANDIDATES.map((c) => c.file)];
  const info = await fetchThumbInfo(allFiles);

  const meta = [];
  for (const m of MAP) {
    const i = info.get(m.file);
    if (!i) { console.log(`❌ ch${m.ch}: 无 imageinfo (${m.file})`); continue; }
    const r = await dl(i.thumburl, i.w, i.h, `ch${m.ch}-${m.slug}`);
    if (r) meta.push({ ...m, ...r });
    await sleep(700);
  }
  console.log("\n--- ch12/ch21 候选(待肉眼核) ---");
  for (const c of CANDIDATES) {
    const i = info.get(c.file);
    if (i) await dl(i.thumburl, i.w, i.h, c.slug);
    await sleep(700);
  }
  writeFileSync(`${OUT}/_meta.json`, JSON.stringify(meta, null, 2));
  const big = meta.filter((m) => m.bytes > 500 * 1024);
  console.log(`\n下载 ${meta.length}/23 章;元数据 → ${OUT}/_meta.json`);
  if (big.length) console.log(`⚠️ >500KB:${big.map((b) => `ch${b.ch}(${(b.bytes / 1024).toFixed(0)}KB)`).join(", ")}`);
})();
