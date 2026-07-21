/**
 * 预生成关7语篇听力音频:对 junior_listening_exercises 的 transcript 调 tts edge 合成,
 * 拿 CDN URL 回填 audio_url → 关7 首播秒播(new Audio(audio_url),跳过现合成)。
 *
 * voice/speed 对齐关7现状: nova / 0.85(JuniorListeningPlay 的 speak 默认 settings)。
 * ⚠️捕获 edge 返回的实际 audioUrl(storage直链),不自己猜 hash(edge 按地区选 provider)。
 * host-swap → Cloudflare 香港: https://www.bigmooneducation.com/<path>
 *
 * 用法:
 *   node scripts/pregenerate-listening-audio.mjs            # 验证模式:只跑1条(U8 The Fox),打印 storageUrl+cfUrl,不写UPDATE
 *   node scripts/pregenerate-listening-audio.mjs --all      # 全量:7B 所有 audio_url IS NULL 行,合成+生成 UPDATE SQL
 *
 * ⚠️ 不直接写 DB(junior_listening_exercises 无写策略);生成 UPDATE SQL 由 Aaron 跑。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const SUP = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const sb = createClient(SUP, ANON);

const TTS_URL = `${SUP}/functions/v1/tts`;
const VOICE = 'nova', SPEED = 0.85;       // 对齐关7现状
const THROTTLE_MS = 1500;                 // 每条间隔,避免 429

const e = s => String(s).replace(/'/g, "''");
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ⚠️ 必须与 src/lib/ttsClean.ts 完全一致(去对话说话人标签,保题号/停顿)。
// 前端 speak.ts 走 cleanForTTS 后再合成;本脚本直连 edge,故也要 clean,音频才无标签。
const SPEAKER_LABEL = /(^|[\r\n]+|[.?!]["'’)\]]?[ \t]+|\b\d{1,2}\.[ \t]+)([A-Z][a-zA-Z]{0,5}):[ \t]+(?=["'“‘A-Z])/g;
const cleanForTTS = (t) => (!t ? t : String(t).replace(SPEAKER_LABEL, '$1').replace(SPEAKER_LABEL, '$1'));

/** 调 tts edge(format:url),返回 {audioUrl, provider} 或 null。
 *  ⚠️ 线上 edge 已直接返回 CF URL(https://audio.bigmooneducation.com/<path>),无需 host-swap,原样填即可。
 *  ⚠️ 合成前 cleanForTTS 剥离说话人标签(与 speak.ts 同口径),音频不念 "A/M/W"。 */
async function synth(text) {
  const res = await fetch(TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ text: cleanForTTS(text), voiceId: VOICE, speed: SPEED, format: 'url' }),
  });
  if (!res.ok) { console.log(`  ❌ edge HTTP ${res.status}: ${(await res.text()).slice(0, 120)}`); return null; }
  const data = await res.json();
  return data?.audioUrl ? { audioUrl: data.audioUrl, provider: data.provider, cached: data.cached } : null;
}

const ALL = process.argv.includes('--all');
// 册:--volume=7A / 7B / 8A …(默认 7B)。grade 从册首位数字推断。
const VOLUME = (process.argv.find(a => a.startsWith('--volume='))?.split('=')[1]) || '7B';
// 'g9'/'G9' 等以字母 g 开头的"全一册"卷:grade 取 g 后的数字;否则取首字符数字。
// --grade= 显式覆盖(高中册 required1/elective1 等首字符非数字,无法从册名推 grade,须显式传)
const GRADE_ARG = process.argv.find(a => a.startsWith('--grade='))?.split('=')[1];
const GRADE = GRADE_ARG
  ? Number(GRADE_ARG)
  : (VOLUME[0] === 'g' || VOLUME[0] === 'G')
    ? (Number(VOLUME.slice(1).replace(/[^0-9]/g, '')) || 9)
    : (Number(VOLUME[0]) || 7);

// 拉目标册且 audio_url IS NULL(增量)
const { data: rows, error } = await sb
  .from('junior_listening_exercises')
  .select('id,unit,title,difficulty,transcript,audio_url')
  .eq('grade', GRADE).eq('volume', VOLUME).is('audio_url', null)
  .order('unit').order('difficulty');
if (error) { console.log('拉取失败:', error.message); process.exit(1); }
console.log(`${VOLUME} 待预生成(audio_url IS NULL): ${rows.length} 条`);

if (!ALL) {
  // ── 验证模式:只跑 U8 The Fox 1 条 ──
  const fox = rows.find(r => r.id === 'b8e00001-0b1c-4d2e-8f3a-000000000801') || rows[0];
  if (!fox) { console.log('没有待处理行(可能已全部填过)。'); process.exit(0); }
  console.log(`\n【验证模式·只跑1条】${fox.unit} "${fox.title}"`);
  console.log(`transcript(前80): ${String(fox.transcript).slice(0, 80)}…`);
  const r = await synth(fox.transcript);
  if (!r) { console.log('合成失败。'); process.exit(1); }
  console.log(`\nprovider: ${r.provider} | cached: ${r.cached}`);
  console.log(`edge返回 audioUrl(直接填这个): ${r.audioUrl}`);
  console.log('\n⚠️ 请在生产浏览器打开上面 URL 确认能放音,确认后 --all 批量(audio_url 原样填 edge 返回值)。');
  console.log('(本次未生成 UPDATE、未写库)');
  process.exit(0);
}

// ── 全量模式:合成所有 + 生成 UPDATE SQL(audio_url = edge 返回的 CF URL 原样) ──
let sql = '-- ============================================================\n';
sql += `-- 关7听力音频预生成回填 audio_url(${VOLUME}); voice=${VOICE} speed=${SPEED}; 填 edge 返回的 CF URL\n`;
sql += '-- 幂等:仅 audio_url IS NULL 才更新\n';
sql += '-- ============================================================\n\n';
let ok = 0, fail = 0;
for (const row of rows) {
  const r = await synth(row.transcript);
  if (!r) { fail++; console.log(`  ❌ ${row.unit} "${row.title}"`); await sleep(THROTTLE_MS); continue; }
  const fillUrl = r.audioUrl; // edge 已返回最终 CF URL,原样填
  sql += `-- ${row.unit} d${row.difficulty} "${row.title}" (provider:${r.provider})\n`;
  sql += `UPDATE junior_listening_exercises SET audio_url = '${e(fillUrl)}' WHERE id = '${row.id}' AND audio_url IS NULL;\n\n`;
  ok++;
  console.log(`  ✓ ${row.unit} "${row.title}" → ${fillUrl}`);
  await sleep(THROTTLE_MS);
}
sql += `-- 校验(单独跑): ${VOLUME} 已填 audio_url 的条数\n`;
sql += `SELECT unit, count(*) FROM junior_listening_exercises WHERE grade=${GRADE} AND volume='${VOLUME}' AND audio_url IS NOT NULL GROUP BY unit ORDER BY unit;\n`;
sql += `-- END OF FILE listening-audio-url-${VOLUME.toLowerCase()}.sql\n`;
const outFile = `scripts/listening-audio-url-${VOLUME.toLowerCase()}.sql`;
writeFileSync(outFile, sql);
console.log(`\n完成: 成功 ${ok} / 失败 ${fail} | 已生成 ${outFile}`);
process.exit(0);
