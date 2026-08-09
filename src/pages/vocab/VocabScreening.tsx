/**
 * 托福词表快筛(/vocab/screening)。
 *
 * ⚠️ 名字就是口径:测的是「**托福核心 4470 词里你认识哪些**」,不是绝对词汇量。
 *    为什么不敢叫「词汇量测试」、为什么不做跨考试对标,理由写在 screening.ts 文件头
 *    (一句话:库里只有托福一个库有词,且缺最常用的 650 个词,估不出绝对量;
 *     四级/六级/中考/高考词表在库里是 0 行,对标算不出来)。
 * ⚠️ 页面上的任何数字都不许写死 —— 一律来自 screening.ts 的 POOL_SIZE / estimate(),
 *    那两处的口径有测试钉着(screening.test.ts,23 条)。
 *
 * 流程:40 题(5 层 × 8) → 每题先「认识 / 不认识」;点了「认识」且这题是验真题的,
 * 追加一道四选一的中文释义题,用来校准自评的水分。最后一次性出结果。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Loader2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor, FONT_SERIF, FONT_STAT, readSelectedBank } from "@/lib/vocab/theme";
import { getBankByCode, type VocabBank } from "@/lib/vocab/data";
import { startTracking } from "@/lib/vocab/timeTracker";
import { ShareCard } from "@/components/vocab/Incentive";
import {
  buildScreening, estimate, saveScreening, POOL_SIZE, TOTAL_ITEMS, STRATA,
  type SaveOutcome, type ScreenAnswer, type ScreenItem, type ScreenResult,
} from "@/lib/vocab/screening";

export default function VocabScreening() {
  const navigate = useNavigate();
  const bankCode = readSelectedBank() || "toefl";
  const color = bankColor(bankCode);

  const [bank, setBank] = useState<VocabBank | null>(null);
  const [items, setItems] = useState<ScreenItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<number, ScreenAnswer>>(new Map());
  /** 当前题已点「认识」、正在追问验真的那一步 */
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<ScreenResult | null>(null);
  const [saved, setSaved] = useState<SaveOutcome | null>(null);
  const [share, setShare] = useState(false);

  useEffect(() => startTracking(), []);

  const load = useCallback(async () => {
    setFailed(false); setItems(null);
    try {
      const [b, list] = await Promise.all([getBankByCode(bankCode), buildScreening()]);
      setBank(b);
      if (!list.length) { setFailed(true); return; }
      setItems(list);
      setIdx(0); setAnswers(new Map()); setResult(null); setVerifying(false);
    } catch {
      setFailed(true);
    }
  }, [bankCode]);

  useEffect(() => { load(); }, [load]);

  const cur = items && items[idx] ? items[idx] : null;

  const finish = useCallback(async (final: Map<number, ScreenAnswer>) => {
    if (!items) return;
    const r = estimate(items, final);
    setResult(r);
    /* 落库失败(未登录 / 取不到词库 / RLS)**不拦结果显示** —— 结果是用户刚花两分钟挣来的。
       ⚠️ 不再写成 `bank ? save(...) : false`:bank 是异步 state,拿它当写库前提
          会让"词库还没加载完"直接变成"永远不写",而且一声不吭。
          bankId 传 null 时 saveScreening 会自己按 code 兜底查。 */
    const out = await saveScreening(bank?.id ?? null, bankCode, items, final)
      .catch((e): SaveOutcome => {
        console.log("[快筛] ✗ 落库抛异常", e);
        return { ok: false, reason: "db", detail: String(e) };
      });
    setSaved(out);
  }, [items, bank, bankCode]);

  const answer = useCallback((known: boolean) => {
    if (!items || !cur) return;
    // 认识 + 是验真题 → 先追问一道释义题,不立刻翻页
    if (known && cur.verify && cur.options) { setVerifying(true); return; }
    const next = new Map(answers).set(idx, { known });
    setAnswers(next);
    setVerifying(false);
    if (idx + 1 >= items.length) void finish(next); else setIdx(i => i + 1);
  }, [items, cur, answers, idx, finish]);

  const answerVerify = useCallback((choice: string) => {
    if (!items || !cur) return;
    const next = new Map(answers).set(idx, { known: true, verifiedCorrect: choice === cur.answer });
    setAnswers(next);
    setVerifying(false);
    if (idx + 1 >= items.length) void finish(next); else setIdx(i => i + 1);
  }, [items, cur, answers, idx, finish]);

  const doneCount = answers.size;

  /* ── 结果页 ── */
  if (result) return (
    <ResultView result={result} color={color} saved={saved}
      onRetry={load} onShare={() => setShare(true)} share={share} onCloseShare={() => setShare(false)}
      onGoLearn={() => navigate(`/vocab/${bankCode}`)} />
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[560px] px-4 pb-24 pt-2">
        <div className="mb-2 flex items-center justify-between">
          <BackLink to="/vocab" className="inline-flex items-center gap-1 text-[14px] text-slate-500">← 词汇</BackLink>
          <span className="text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
            {Math.min(doneCount + 1, TOTAL_ITEMS)} / {TOTAL_ITEMS}
          </span>
        </div>

        {/* 进度条 */}
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-black/[0.06]">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${(doneCount / TOTAL_ITEMS) * 100}%`, background: color }} />
        </div>

        {!items && !failed && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center text-[14px] text-slate-400">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />出题中…
          </div>
        )}
        {failed && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
            <p className="text-[15px] text-slate-600">题目加载失败</p>
            <button onClick={load} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
          </div>
        )}

        {cur && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="text-[36px] font-bold leading-tight tracking-tight text-slate-900" style={{ fontFamily: FONT_SERIF }}>
              {cur.word.headword}
            </div>
            {cur.word.ipa && (
              <div className="mt-1 text-[14px] text-slate-400" style={{ fontFamily: FONT_SERIF }}>
                /{cur.word.ipa.replace(/^\/+|\/+$/g, "")}/
              </div>
            )}

            {!verifying ? (
              <>
                {/* ⚠️ 这一屏**不显示中文释义** —— 显示了就没法问"你认识吗" */}
                <p className="mt-5 text-[13px] text-slate-400">这个词你认识吗?</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => answer(true)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-[15px] font-medium text-white"
                    style={{ backgroundColor: color }}>
                    <Check className="h-4 w-4" />认识
                  </button>
                  <button type="button" onClick={() => answer(false)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/[0.08] py-3 text-[15px] text-slate-600 active:bg-slate-50">
                    <X className="h-4 w-4" />不认识
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 验真:自称认识就要能选出释义,这一步专治"看着眼熟就点认识" */}
                <p className="mt-5 text-[13px] text-slate-400">那它是什么意思?</p>
                <div className="mt-3 space-y-2">
                  {cur.options?.map(o => (
                    <button key={o} type="button" onClick={() => answerVerify(o)}
                      className="w-full rounded-xl border border-black/[0.08] px-4 py-3 text-left text-[15px] text-slate-700 active:bg-slate-50">
                      {o}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {items && (
          <p className="mt-4 text-center text-[12px] leading-relaxed text-slate-400">
            共 {TOTAL_ITEMS} 题,测的是<b className="font-medium text-slate-500">托福核心 {POOL_SIZE} 词</b>里你认识哪些 ——
            不是绝对词汇量。凭第一反应答,不用查。
          </p>
        )}
      </div>
    </div>
  );
}

/* ── 结果页 ────────────────────────────────────────────────── */

function ResultView({ result, color, saved, onRetry, onShare, share, onCloseShare, onGoLearn }: {
  result: ScreenResult; color: string; saved: SaveOutcome | null;
  onRetry: () => void; onShare: () => void; share: boolean; onCloseShare: () => void; onGoLearn: () => void;
}) {
  const start = STRATA.find(s => s.id === result.startAt);
  const pct = Math.round((result.known / POOL_SIZE) * 100);
  const maxRate = useMemo(() => Math.max(...result.perStratum.map(s => s.rate), 0.01), [result]);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[560px] px-4 pb-24 pt-2">
        <BackLink to="/vocab" className="mb-2 inline-flex items-center gap-1 text-[14px] text-slate-500">← 词汇</BackLink>

        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <p className="text-[13px] text-slate-400">托福核心 {POOL_SIZE} 词中,你已认识约</p>
          <div className="mt-1 text-[52px] font-bold leading-none tracking-tight" style={{ color, fontVariantNumeric: "tabular-nums" }}>
            {result.known}
          </div>
          {/* ⚠️ 区间必须显示 —— 40 题估 4470 词,点估计本身就带不确定性,
                 只给一个数字会让人当成精确值。 */}
          <p className="mt-1.5 text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
            个(估算区间 {result.lo} – {result.hi} · 约占 {pct}%)
          </p>
        </div>

        {/* 各层认识率 —— "建议从第几档开始"的依据摆出来,不让用户只看一个结论 */}
        <div className="mt-3 rounded-2xl border border-black/[0.06] bg-white p-5">
          <div className="mb-3 text-[13px] font-medium text-slate-700">各难度档的认识率</div>
          <div className="space-y-2.5">
            {result.perStratum.map(s => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="w-[52px] shrink-0 text-[12px] text-slate-500">{s.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.05]">
                  <div className="h-full rounded-full"
                    style={{ width: `${(s.rate / maxRate) * 100}%`, background: color, opacity: 0.35 + 0.65 * s.rate }} />
                </div>
                <span className="w-[74px] shrink-0 text-right text-[12px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {Math.round(s.rate * 100)}% · {s.known}
                </span>
              </div>
            ))}
          </div>
          {result.inflation !== null && result.inflation < 1 && (
            <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-800">
              验真题里有 {Math.round((1 - result.inflation) * 100)}% 的「认识」没选对释义,
              上面的数字已按这个比例校准过。
            </p>
          )}
        </div>

        <div className="mt-3 rounded-2xl border border-black/[0.06] bg-white p-5">
          <div className="mb-1 text-[13px] font-medium text-slate-700">建议起点</div>
          <p className="text-[14px] leading-relaxed text-slate-600">
            从<b className="font-semibold" style={{ color }}>「{start?.label}」</b>这一档开始学 ——
            它是第一个你认识率低于六成的难度档,再往前的词大多已经会了。
          </p>
          <button type="button" onClick={onGoLearn}
            className="mt-3 w-full rounded-xl py-3 text-[15px] font-medium text-white" style={{ backgroundColor: color }}>
            去学这一档
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onShare}
            className="flex-1 rounded-xl border border-black/[0.08] bg-white py-2.5 text-[14px] text-slate-700 active:bg-slate-50">
            生成分享卡
          </button>
          <button type="button" onClick={onRetry}
            className="flex-1 rounded-xl border border-black/[0.08] bg-white py-2.5 text-[14px] text-slate-700 active:bg-slate-50">
            重新快筛
          </button>
        </div>

        {/* ⚠️ 三种失败说三种话 —— 笼统一句"保存失败"既帮不了用户,
               也帮不了排查(我自己就因此查了一轮)。 */}
        {saved?.ok === false && saved.reason === "anon" && (
          <p className="mt-3 text-center text-[12px] leading-relaxed text-slate-400">
            结果未保存 —— 你还没登录。<Link to="/auth" className="underline">登录</Link>后重筛即可留存记录。
          </p>
        )}
        {saved?.ok === false && saved.reason !== "anon" && (
          <p className="mt-3 text-center text-[12px] leading-relaxed text-rose-500">
            结果未能保存({saved.reason === "no-bank" ? "取不到词库" : "写入失败"})。
            控制台里有以 <code>[快筛]</code> 开头的详细日志。
          </p>
        )}

        <p className="mt-4 text-center text-[12px] leading-relaxed text-slate-400" style={{ fontFamily: FONT_STAT }}>
          口径:{TOTAL_ITEMS} 题分五个难度档抽样,按各档认识率推算全表。
          <br />测的是托福词表内部的掌握情况,<b className="font-medium text-slate-500">不等于你的总词汇量</b>。
        </p>
      </div>

      {share && (
        <ShareCard onClose={onCloseShare}
          data={{ mastered: result.known, streak: 0, points: 0, totalMs: 0, milestone: null }} />
      )}
    </div>
  );
}
