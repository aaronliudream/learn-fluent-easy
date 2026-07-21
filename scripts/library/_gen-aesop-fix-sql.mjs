// 伊索 15 张旧全局卡修正(审定稿·全 B 多义并列主流义在前·IPA保留)。0 新建 A(want的Robinson覆盖已存在)。
import { readFileSync, writeFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const SUP = "https://degqpiiddkxcuzwombwp.supabase.co", KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// [normalized, pos, gloss_cn(多义·主流在前), gloss_en, sense_key, ex_en, ex_cn]  —— ipa 从现卡保留
const E = [
  ["race","n.","赛跑、比赛;(人种)种族","a running contest; also a people or ethnic group","race","They ran a race around the playground.","他们绕着操场赛跑。"],
  ["fast","adv.","快、迅速地;(fast asleep)酣睡地","quickly; (fast asleep) deeply","fast","The rabbit ran very fast.","兔子跑得非常快。"],
  ["want","v.","想要、希望","to wish for or desire","want","The children want a new ball.","孩子们想要一个新球。"],
  ["bit","v.","咬(bite 过去式);(a bit)一点点","bit (past of bite); also a small amount","bite","The dog bit the bone hard.","狗狠狠咬住骨头。"],
  ["passed","v.","经过、超过;(时间)流逝","passed by; (of time) went by","pass","We passed a small shop on the way.","我们路上经过一家小店。"],
  ["sweet","adj.","甜的;悦耳的、温柔的","sweet in taste; also pleasant or gentle","sweet","The ripe peach was very sweet.","熟透的桃子很甜。"],
  ["steady","adj.","稳健的、沉稳的;(v.)使稳定","steady, firm; to make steady","steady","Keep a steady pace and you'll finish.","保持稳健的步子,你就能走完。"],
  ["saved","v.","储存、留存;救、拯救","saved or stored up; also rescued","save","She saved some bread for later.","她留了些面包待会儿吃。"],
  ["tried","v.","尝试、试图;(try on)试穿","tried, attempted; also tried on","try","He tried to open the jar.","他试着打开罐子。"],
  ["hard","adj.","艰难的、艰苦的;(adv.)努力地、用力地","hard, difficult; also with effort","hard","The winter was long and hard.","那个冬天又长又苦。"],
  ["full","adj.","满的、充满的;(吃)饱的","full; also having eaten enough","full","The basket was full of apples.","篮子装满了苹果。"],
  ["look","v.","看、瞧;看起来、显得(look + adj.)","to look; also to seem or appear","look","The sky looks dark before the rain.","下雨前天色看起来很暗。"],
  ["missed","v.","没击中、没够到;错过","missed a target; also missed out on","miss","He threw the ball but missed.","他扔了球,却没投中。"],
  ["reach","v.","够到、触及;到达","to reach or touch; to arrive at","reach","She stretched to reach the top shelf.","她伸手去够最高一层的架子。"],
  ["get","v.","得到、获得;变得(get+形容词);挣脱、脱身(get free/out)","to get or obtain; to become; to break free","get","Water helps the plant get strong.","水帮助植物长壮。"],
];

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const jlit = (o) => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;

(async () => {
  const norms = E.map((e) => e[0]);
  const r = await (await fetch(`${SUP}/rest/v1/phrase_explanations?target_lang=eq.read-v1&normalized=in.(${norms.map(encodeURIComponent).join(",")})&select=normalized,explanation`, { headers: H })).json();
  const cur = {}; for (const c of r) cur[c.normalized] = c.explanation;
  const missing = norms.filter((n) => !cur[n]);
  if (missing.length) { console.error("✗ 现卡缺失:", missing.join(",")); process.exit(1); }

  const updates = E.map(([n, pos, gcn, gen, sk, exen, excn]) => {
    const old = cur[n];
    const expl = { ipa: old.ipa || "", pos, word: old.word || n, example: { en: exen, cn: excn }, gloss_cn: gcn, gloss_en: gen, sense_key: sk };
    if (old.proper) expl.proper = true;
    return `UPDATE public.phrase_explanations SET explanation = ${jlit(expl)}\n WHERE normalized = ${q(n)} AND target_lang = 'read-v1';`;
  });

  const sql = `-- ============================================================================
-- 伊索(aesop)15 张旧全局卡修正(网页版Claude审定·全B改全局主流义·多义并列·IPA保留不动)。
-- 起因:全局旧卡把罕见/次要义当默认(race=种族/fast=熟睡/bit=一点点/sweet=悦耳/want=缺乏…),读者读错整句。
-- 0 张新建A:want的Robinson覆盖(缺乏)已在library_word_senses,全局改想要后鲁滨逊自动仍读旧义。
-- 幂等 UPDATE 现卡。BEGIN/COMMIT + 前后核验。四本共享全局卡 → Oz/Robinson/Tom 同步受益。
-- ============================================================================
BEGIN;

SELECT 'before' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations WHERE target_lang='read-v1' AND normalized IN (${norms.map(q).join(",")}) ORDER BY normalized;

${updates.join("\n")}

SELECT 'after' AS phase, normalized, explanation->>'pos' AS pos, explanation->>'gloss_cn' AS gloss_cn
  FROM public.phrase_explanations WHERE target_lang='read-v1' AND normalized IN (${norms.map(q).join(",")}) ORDER BY normalized;

COMMIT;
`;
  writeFileSync("SQLAA/library-global-cards-fix-aesop-15.sql", sql);
  console.log(`✓ SQLAA/library-global-cards-fix-aesop-15.sql (15 global UPDATE·全B·0新A)`);
})();
