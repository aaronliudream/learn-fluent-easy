/**
 * 全库扫描"抽象元语法题"(am1 + am2)。
 * anon 只读 REST 拉 american_questions(stage 5 关5 + stage 10 语法型),
 * 命中"XX 用来说什么/是什么/表示什么/下列哪个是…/属于哪种/规则背诵"等纯概念辨认题。
 * 产出清单(课/关/seq/题干/选项/判定),不改库。
 * 用法: node scripts/american/scan-metagrammar.mjs [am1|am2|all]
 */
const URL = "https://degqpiiddkxcuzwombwp.supabase.co";
const KEY = "sb_publishable_0lZoKG2xKcwgDkpLUAZVFQ_mGEdCqHE";

const which = process.argv[2] || "all";
const likes = which === "am1" ? ["am1_l*"] : which === "am2" ? ["am2_l*"] : ["am1_l*", "am2_l*"];

async function fetchLike(like) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(
      `${URL}/rest/v1/american_questions?lesson_id=like.${like}&stage=in.(5,10)&select=id,lesson_id,stage,seq,qtype,payload&order=lesson_id,stage,seq`,
      { headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + 999}` } },
    );
    if (!r.ok) { console.error("HTTP", r.status, await r.text()); process.exit(1); }
    const batch = await r.json();
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

// ── 元语法题识别 ──────────────────────────────────────────────
// 关键区分:词义题(vocab, options 是词的中文释义) = 合法保留;元语法题 = 背概念/背规则。

// 语法术语/规则词(出现在 options 里 → 概念辨认)
const GRAMMAR_TERM = /时(态)?$|时[??]|句型|从句|词尾|原形|不定式|动名词|过去式|过去分词|将来时|进行时|完成时|现在时|祈使句|感叹句|被动|主动|情态|系动词|冠词|介词|连词|加\s*-|不加|变\s*y|直接加|双写|第三人称|单数|复数|可数|不可数/;

// 题干:纯概念/规则辨认的问法
const STEM_META = [
  /用来(说|表示|讲|表达)什么/,
  /表示什么[??]?\s*$/,
  /用来做什么/,
  /下列哪(个|种|类)(是|属于|表示|用)/,
  /下面哪(个|种|类)(动词|词|时态|句型|情况|结构)/,
  /属于哪(种|类)/,
  /(是|属于)哪(种|类)(时态|句型)/,
  /的(否定式|否定形式|疑问句|一般疑问句|过去式|构成|变化|形式)(是|用|要|:|:|\s*$)/,
  /一般在词尾/,
  /(的动词|动词)(要|应|需)(:|:|加|变)/,
  /时.*要(:|:)?\s*$/,
];

// 词义题(合法,排除):英文词/短语 + 的意思是 / 意思是……(且 options 为中文释义,不含语法术语)
const isVocabMeaning = (stem, opts) => {
  const meaningQ = /的意思是|意思是[::]?\s*$|什么意思/.test(stem);
  if (!meaningQ) return false;
  // options 里没有语法术语 → 是词义题
  return !opts.some((o) => GRAMMAR_TERM.test(o));
};

const isEnglishy = (o) => /[A-Za-z]/.test(o);

function classify(stem, opts) {
  if (isVocabMeaning(stem, opts)) return null; // 词义题,跳过
  const stemHit = STEM_META.some((re) => re.test(stem));
  // options 形态:≥3 项是"中文语法术语/规则"(不含英文)→ 概念辨认
  const cnTermOpts = opts.filter((o) => !isEnglishy(o) && GRAMMAR_TERM.test(o)).length;
  const optShapeHit = cnTermOpts >= 3;
  if (stemHit && optShapeHit) return "元语法-强";
  if (stemHit) return "元语法-题干";
  if (optShapeHit) return "元语法-选项";
  return null;
}

const byLesson = {};
let total = 0, hits = 0;
for (const like of likes) {
  const rows = await fetchLike(like);
  total += rows.length;
  for (const q of rows) {
    const p = q.payload || {};
    const stem = p.stem ?? "";
    const opts = p.options || [];
    // stage10 仅看语法型(有 stem_cn 或 kind=grammar 或 options 含英文动词形态)
    if (q.stage === 10) {
      const kind = p.kind || "";
      if (kind && kind !== "grammar") continue;
    }
    const verdict = classify(stem, opts);
    if (!verdict) continue;
    hits++;
    const correct = typeof p.answer_index === "number" ? opts[p.answer_index] : opts[0];
    (byLesson[q.lesson_id] ||= []).push({ stage: q.stage, seq: q.seq, qid: q.id, stem, opts, correct, verdict });
  }
}

// ── 输出清单 ──────────────────────────────────────────────
const lessons = Object.keys(byLesson).sort((a, b) => {
  const na = a.match(/am(\d)_l0*(\d+)/), nb = b.match(/am(\d)_l0*(\d+)/);
  return na[1] - nb[1] || na[2] - nb[2];
});
console.log(`# 元语法题扫描清单(${which})  拉取 stage5+10 共 ${total} 条,命中 ${hits} 条,涉及 ${lessons.length} 课\n`);
for (const L of lessons) {
  const items = byLesson[L];
  const over = items.length > 1 ? `  ⚠️超标(本课${items.length}道,铁律≤1)` : "";
  console.log(`## ${L}  —  ${items.length} 道${over}`);
  for (const it of items) {
    console.log(`- s${it.stage}#${it.seq} (qid ${it.qid}) [${it.verdict}]`);
    console.log(`    题干: ${it.stem}`);
    console.log(`    选项: ${it.opts.join(" / ")}   ✓${it.correct}`);
  }
  console.log("");
}
console.log(`\n合计:${hits} 道元语法题,${lessons.filter((L) => byLesson[L].length > 1).length} 课超标(>1)。`);
