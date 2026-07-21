// 通用旧全局卡修正 SQL 生成器:读 global-fix-data/<key>.json(74条合并义)→ 现卡UPDATE(IPA保留·只换pos/gloss/例句/sense_key)。
// 用法:node scripts/library/_gen-global-fix-from-json.mjs <key>   (key=oz/robinson/tom…,输出 SQLAA/library-global-cards-fix-<key>.sql)
// 数据契约:[{normalized, pos, gloss_cn(合并·主流义在前), gloss_en, sense_key, ex_en, ex_cn}]  —— ipa/word 从现卡保留。
import { readFileSync, writeFileSync } from "node:fs";
const KEY = process.argv[2];
if (!KEY) { console.error("用法: node scripts/library/_gen-global-fix-from-json.mjs <key>"); process.exit(1); }
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const SUP = "https://degqpiiddkxcuzwombwp.supabase.co", API = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: API, Authorization: `Bearer ${API}` };
const E = JSON.parse(readFileSync(`scripts/library/books/global-fix-data/${KEY}.json`, "utf8"));
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const jlit = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;

(async () => {
  const norms = E.map((e) => e.normalized);
  // 硬校验:重复 normalized
  const dup = norms.filter((n, i) => norms.indexOf(n) !== i);
  if (dup.length) { console.error("✗ 重复 normalized:", [...new Set(dup)].join(",")); process.exit(1); }
  const r = await (await fetch(`${SUP}/rest/v1/phrase_explanations?target_lang=eq.read-v1&normalized=in.(${norms.map(encodeURIComponent).join(",")})&select=normalized,explanation`, { headers: H })).json();
  const cur = {}; for (const c of r) cur[c.normalized] = c.explanation;
  const missing = norms.filter((n) => !cur[n]);
  if (missing.length) { console.error("✗ 现卡缺失:", missing.join(",")); process.exit(1); }
  // 硬校验:senses[] / chunk 卡不应进平铺批(防 desync)
  const bad = E.filter((e) => cur[e.normalized].senses || cur[e.normalized].kind === "chunk" || cur[e.normalized].pos === "词块");
  if (bad.length) { console.error("✗ 含 senses[]/chunk 卡(不能平铺UPDATE):", bad.map((e) => e.normalized).join(",")); process.exit(1); }

  const updates = E.map((e) => {
    const old = cur[e.normalized];
    const expl = { ipa: old.ipa || "", pos: e.pos, word: old.word || e.normalized, example: { en: e.ex_en, cn: e.ex_cn }, gloss_cn: e.gloss_cn, gloss_en: e.gloss_en, sense_key: e.sense_key };
    if (old.proper) expl.proper = true;
    return `UPDATE public.phrase_explanations SET explanation = ${jlit(expl)}\n WHERE normalized = ${q(e.normalized)} AND target_lang = 'read-v1';`;
  });
  const sql = `-- ============================================================================
-- ${KEY} 回读扫描·${E.length}张旧全局卡修正(网页版Claude审定·B为主·多义并列主流义在前·IPA原样保留)。
-- 起因:全局旧卡把次要义/罕见义/错词性当默认义,读者读错整句。四本共享全局卡→改完全部书受益。
-- 已剔出单独处理:senses[]卡(desync风险)+chunk卡。幂等UPDATE现卡。BEGIN/COMMIT+前后核验。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations WHERE target_lang='read-v1' AND normalized IN (${norms.map(q).join(",")}) ORDER BY normalized;

${updates.join("\n")}

SELECT 'after' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations WHERE target_lang='read-v1' AND normalized IN (${norms.map(q).join(",")}) ORDER BY normalized;

COMMIT;
`;
  writeFileSync(`SQLAA/library-global-cards-fix-${KEY}.sql`, sql);
  console.log(`✓ SQLAA/library-global-cards-fix-${KEY}.sql (${E.length} 张平铺UPDATE·IPA保留)`);
})();
