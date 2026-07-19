// 把审定后的红档老式构式按章注入 chunk-data/chN.json(在 chunks 数组尾插入,保留原格式)。
import { readFileSync, writeFileSync } from "node:fs";

// 每章要追加的 chunk(head/gloss/ipa/note/literal/ex/occ)
const ADD = {
  1: [
    { head:"make out", gloss:"设法办到、勉强做成", ipa:"/meɪk aʊt/",
      note:"make out to do sth = 设法/得以做成(老式口语)。此处「make out to put me off」=设法把我岔开一会儿。非'辨认/看清'义,也非'进展如何'义。",
      literal:[{word:"make out",meaning_cn:"设法弄成",note_cn:"此处非'辨认'"}],
      ex_en:"He made out to finish the work before dark.", ex_cn:"他设法在天黑前把活儿干完了。",
      occ:[[44,"make out"]] },
    { head:"take and", gloss:"(方言)就…、干脆去…做", ipa:"/teɪk ənd/",
      note:"take and + 动词 = 美国地方话的强调说法,重点在'就这么去做/干脆去做',take 不表'拿'。此处「take and bounce a rock」=干脆拿石头砸。同族:up and + 动词。",
      literal:[{word:"take and",meaning_cn:"(方言)就…、径直…",note_cn:"take 非'拿',是强调式"}],
      ex_en:"I'll just take and tell him myself.", ex_cn:"我干脆自己去告诉他。",
      occ:[[161,"take and bounce"]] },
  ],
  2: [
    { head:"let on", gloss:"假装、佯装;(口语)走漏口风、说出去", ipa:"/lɛt ɑːn/",
      note:"let on = 假装(尤指假装不知道/不在乎);另有'走漏口风、说出去'义(视语境)。此处「let on that you like it」=装作你喜欢。on 非'在…上'。",
      literal:[{word:"let on",meaning_cn:"假装、佯装",note_cn:"on 非'在…上'"}],
      ex_en:"She was scared, but she didn't let on.", ex_cn:"她很害怕,却装作没事。",
      occ:[[328,"let on"]] },
  ],
  6: [
    { head:"take and", gloss:"(方言)就…、干脆去…做", ipa:"/teɪk ənd/",
      note:"take and + 动词 = 地方话强调式,'就这么去做/干脆去做',take 不表'拿'。此处「take and split the bean」=就把豆子劈开。同族:up and + 动词。",
      literal:[{word:"take and",meaning_cn:"(方言)就…、径直…",note_cn:"take 非'拿',是强调式"}],
      ex_en:"I'll just take and tell him myself.", ex_cn:"我干脆自己去告诉他。",
      occ:[[896,"take and split"]] },
  ],
  7: [
    { head:"let on", gloss:"假装、佯装;(口语)走漏口风、说出去", ipa:"/lɛt ɑːn/",
      note:"let on = 假装(尤指假装不知道/不在乎);另有'走漏口风、说出去'义(视语境)。此处「let on you're going home」=假装你要回家。on 非'在…上'。",
      literal:[{word:"let on",meaning_cn:"假装、佯装",note_cn:"on 非'在…上'"}],
      ex_en:"She was scared, but she didn't let on.", ex_cn:"她很害怕,却装作没事。",
      occ:[[1116,"let on"]] },
  ],
  10: [
    { head:"take and", gloss:"(方言)就…、干脆去…做", ipa:"/teɪk ənd/",
      note:"take and + 动词 = 地方话强调式,重点在'就这么去做',take 不表'拿'。此处「take and belt him」=干脆抽他一下、「take and swear」=(郑重)立誓(血誓保密的正式场面)。同族:up and + 动词。",
      literal:[{word:"take and",meaning_cn:"(方言)就…、径直…",note_cn:"take 非'拿',是强调式"}],
      ex_en:"I'll just take and tell him myself.", ex_cn:"我干脆自己去告诉他。",
      occ:[[1592,"take and belt"],[1601,"take and swear"]] },
  ],
  19: [
    { head:"a power of", gloss:"大量的、许多(老式/方言)", ipa:"/ə ˈpaʊər əv/",
      note:"a power of sth = a lot of sth(老式/方言)。此处「cover up a power of sins」=遮掉一大堆罪过。power 非'力量/权力'义。",
      literal:[{word:"a power of",meaning_cn:"大量、许多",note_cn:"power 非'力量'"}],
      ex_en:"That must have cost a power of money.", ex_cn:"那准花了一大笔钱。",
      occ:[[2830,"a power of"]] },
  ],
  23: [
    { head:"a power of", gloss:"大量的、许多(老式/方言)", ipa:"/ə ˈpaʊər əv/",
      note:"a power of sth = a lot of sth(老式/方言)。此处「heard a power of it」=听了好多。power 非'力量/权力'义。",
      literal:[{word:"a power of",meaning_cn:"大量、许多",note_cn:"power 非'力量'"}],
      ex_en:"That must have cost a power of money.", ex_cn:"那准花了一大笔钱。",
      occ:[[3162,"a power of"]] },
  ],
  28: [
    { head:"a power of", gloss:"大量的、许多(老式/方言)", ipa:"/ə ˈpaʊər əv/",
      note:"a power of sth = a lot of sth(老式/方言)。此处「such a power of racket」=好大的动静。power 非'力量/权力'义。",
      literal:[{word:"a power of",meaning_cn:"大量、许多",note_cn:"power 非'力量'"}],
      ex_en:"That must have cost a power of money.", ex_cn:"那准花了一大笔钱。",
      occ:[[3894,"a power of"]] },
  ],
  34: [
    { head:"let on", gloss:"假装、佯装;(口语)走漏口风、说出去", ipa:"/lɛt ɑːn/",
      note:"let on = 假装(尤指假装不知道/不在乎);另有'走漏口风、说出去'义(视语境)。此处「tries to let on she don't」=(她)假装不知道(原书中译亦作'假装')。on 非'在…上'。",
      literal:[{word:"let on",meaning_cn:"假装、佯装",note_cn:"on 非'在…上'"}],
      ex_en:"She was scared, but she didn't let on.", ex_cn:"她很害怕,却装作没事。",
      occ:[[4904,"let on"]] },
    { head:"allow", gloss:"(老式)承认、认定、断言", ipa:"/əˈlaʊ/",
      note:"老式/方言 allow = 承认、认定、断言(= admit / declare),非'允许'义。此处「I'm willing to allow」=我愿意承认。同族:allow as how = 认为。⚠️本书其余 allow 多为'允许'义(不收),索引按 seq 精确锁本处。",
      literal:[{word:"allow",meaning_cn:"(此处)承认、认定",note_cn:"非'允许'"}],
      ex_en:"He allowed that he might be wrong.", ex_cn:"他承认自己可能错了。",
      occ:[[4952,"allow"]] },
  ],
};

// 在 chunks 数组的闭合 ] 前插入新条目(括号计数定位 chunks 数组闭合处,保留原文件格式)
function inject(path, items) {
  let txt = readFileSync(path, "utf8");
  const key = '"chunks"';
  const ki = txt.indexOf(key);
  if (ki < 0) throw new Error(`${path}: 无 "chunks"`);
  const open = txt.indexOf("[", ki);
  let depth = 0, close = -1;
  for (let i = open; i < txt.length; i++) {
    if (txt[i] === "[") depth++;
    else if (txt[i] === "]") { depth--; if (depth === 0) { close = i; break; } }
  }
  if (close < 0) throw new Error(`${path}: chunks 数组未闭合`);
  // 新条目序列化(紧凑,一条一行)
  const blocks = items.map((c) => "    " + JSON.stringify(c)).join(",\n");
  // 在 close 前插入:先给上一条补 "," (若数组非空)
  const before = txt.slice(0, close).replace(/\s*$/, "");
  const needComma = /[}\]]/.test(before.slice(-1));
  const insert = (needComma ? ",\n" : "\n") + blocks + "\n  ";
  txt = before + insert + txt.slice(close);
  writeFileSync(path, txt);
  return items.length;
}

let total = 0;
for (const [ch, items] of Object.entries(ADD)) {
  const p = `scripts/library/books/chunk-data/ch${ch}.json`;
  // 幂等:若已含该 head+occ 则跳过(防重复注入)
  const cur = JSON.parse(readFileSync(p, "utf8"));
  const have = new Set((cur.chunks || []).map((c) => `${c.head}@${JSON.stringify(c.occ)}`));
  const fresh = items.filter((c) => !have.has(`${c.head}@${JSON.stringify(c.occ)}`));
  if (!fresh.length) { console.log(`ch${ch}: 已存在,跳过`); continue; }
  const n = inject(p, fresh);
  // 验证注入后仍是合法 JSON
  JSON.parse(readFileSync(p, "utf8"));
  total += n;
  console.log(`ch${ch}: +${n} (${fresh.map((c) => c.head).join(", ")})`);
}
console.log(`\n✓ 共注入 ${total} 条,JSON 全部合法`);
