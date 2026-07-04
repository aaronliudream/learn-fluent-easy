/**
 * 逐题解释「填写模板」生成器 —— 现查 DB(非缓存)导出 qid+题干+答案,供 Aaron 填「解释：」。
 *
 * 【perq 管线铁律(防旧快照复发)】
 *  1. 每次生成必现查 DB 实时取 qid/payload,禁止复用缓存 md。
 *  2. 生成后前置跑 qid 存在性校验,把「命中 N/N + 生成时间」写进模板头(断言必附证据)。
 *  3. 关8 听力题带「听力原文」(american_sentences,即播放内容);关9 情景题题干=完整场景。
 *
 * 用法: node scripts/american/gen-perq-template.mjs <out.md> <stage,stage,...> <lesson_id> [lesson_id...]
 *   例: node scripts/american/gen-perq-template.mjs REVIEWAA/x.md 6,8,9 am1_l07 am1_l08 ...
 */
import { readFileSync, writeFileSync } from "node:fs";

const clean = (s) => (s || "").trim().replace(/^["']|["']$/g, "");
let env = ""; for (const f of [".env", ".env.local"]) { try { env += readFileSync(f, "utf8") + "\n"; } catch { /* */ } }
const URL = clean(process.env.VITE_SUPABASE_URL || (env.match(/VITE_SUPABASE_URL\s*=\s*(.+)/) || [])[1]);
const KEY = clean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || (env.match(/VITE_SUPABASE_(?:ANON|PUBLISHABLE)_KEY\s*=\s*(.+)/) || [])[1]);
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const get = async (p) => (await fetch(`${URL}/rest/v1/${p}`, { headers: H })).json();

const [out, stagesArg, ...lessons] = process.argv.slice(2);
if (!out || !stagesArg || !lessons.length) { console.error("用法: gen-perq-template.mjs <out.md> <stages> <lesson...>"); process.exit(1); }
const stages = stagesArg.split(",").map(Number);
const STAGE_NAME = { 5: "关5语法", 6: "关6小测", 7: "关7填空", 8: "关8听力", 9: "关9情景", 10: "关10通关" };

function answerOf(p) {
  if (p.answer_text != null) return p.answer_text;
  if (Array.isArray(p.options) && p.answer_index != null) return p.options[p.answer_index];
  return "(无)";
}

const now = new Date().toISOString();
const md = [];
let total = 0, hit = 0;

for (const lid of lessons) {
  const qs = await get(`american_questions?select=id,stage,seq,qtype,payload&lesson_id=eq.${lid}&stage=in.(${stages.join(",")})&order=stage,seq`);
  // 关8 听力原文(播放的是 american_sentences 整篇)
  let listenScript = "";
  if (stages.includes(8)) {
    const sents = await get(`american_sentences?select=seq,speaker,text_en&lesson_id=eq.${lid}&order=seq`);
    listenScript = sents.map((s) => `${s.speaker ? s.speaker + ": " : ""}${s.text_en}`).join("\n");
  }
  md.push(`\n# ${lid} 逐题解释填写模板`);
  const byStage = {};
  for (const q of qs) { (byStage[q.stage] = byStage[q.stage] || []).push(q); total++; if (q.id) hit++; }
  for (const st of stages) {
    const arr = byStage[st] || [];
    if (!arr.length) continue;
    md.push(`\n## ${STAGE_NAME[st] || "关" + st} (${arr.length}题)`);
    if (st === 8 && listenScript) md.push(`\n**🔊 听力原文(播放内容,写"意思+场合"型解释时参考)**\n\`\`\`\n${listenScript}\n\`\`\``);
    for (const q of arr) {
      md.push(`\n### [seq${q.seq} · ${q.qtype}]`);
      md.push(`- qid: \`${q.id}\``);
      md.push(`- 题干: ${q.payload.stem}`);
      if (Array.isArray(q.payload.options)) md.push(`- 选项: ${q.payload.options.join(" / ")}`);
      md.push(`- 答案: **${answerOf(q.payload)}**`);
      md.push(`- 解释：`);
    }
  }
}

const header = [
  `# am1 逐题解释填写模板 · 关${stages.join("/")}`,
  ``,
  `> ✅ 生成时现查 DB(非缓存)· qid 命中 **${hit}/${total}** · 生成时间 ${now}`,
  `> 填写:每题在「解释：」后写 2-3 行。语法题→规则+正例(✓)+易错;情景/套话题→这句话意思+什么场合用。`,
  `> 关8 每课顶部附「听力原文」= 播放内容;关9 题干即完整场景。qid 已锁定,别改。`,
].join("\n");

writeFileSync(out, header + "\n" + md.join("\n") + "\n", "utf8");
console.log(`✅ qid 命中 ${hit}/${total} · 生成时间 ${now}`);
console.log(`写出 ${out}(${lessons.length} 课 · 关${stages.join("/")})`);
if (hit !== total) { console.error("❌ 有 qid 未命中,停!"); process.exit(1); }
