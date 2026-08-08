/**
 * 错题本(/vocab/mistakes)—— 待清列表 + 错题闯关。
 *
 * ⚠️ **判定内核一行都不在这里**。隔天 3 连对自动移出、streak 清零、
 *    重新入册,全在 vocabMastery.ts 里。本页只负责"问和显示" ——
 *    和反馈层"只许有一个实现"同一个道理:错题的判定也只许有一个实现。
 *    这里做第二套判定的话,页面显示的"已清掉"和数据库认的会分家。
 *
 * 闯关规格(Aaron 封版):
 *   · 每轮 10 词,取"最久未清 + 错次多"优先,不足 10 个就有几个考几个
 *   · 达 6/10 解锁"关闭"(可以走人),没到就只能继续
 *   · 累计正确率 <60% 自动续轮
 *   · 连续 3 轮仍未达标 → 软保护,劝退不劝学("今天状态不佳,明天再战")
 *   · 题型优先 last_wrong_mode —— 在哪种题型上栽的,就在哪种题型上补
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Check, Printer, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { bankColor, CTA_SHADOW, FONT_SERIF, FONT_STAT, GRAD_CTA } from "@/lib/vocab/theme";
import { stopAudio } from "@/lib/vocab/audio";
import { startTracking } from "@/lib/vocab/timeTracker";
import { buildQuestions, optionText, type QuizQuestion } from "@/lib/vocab/quiz";
import { recordAnswer, type VocabMode } from "@/lib/vocab/vocabMastery";
import { AnonNote, Feedback, Progress, QuotaModal } from "@/components/vocab/SessionParts";
import { HardestWords } from "@/components/vocab/Incentive";
import {
  listMistakes, getWordsByIds, listBankWords, getBankByCode, currentUserId,
  type MistakeRow, type VocabWord,
} from "@/lib/vocab/data";

const ROUND = 10;
const PASS = 6;              // 达标线:10 题对 6 题
const KEEP_GOING = 0.6;      // 累计正确率低于此值自动续轮
const SOFT_STOP_ROUNDS = 3;  // 连续 3 轮未达标 → 软保护

/** streak 进度点:连对 3 天自动移出,所以画 3 个点。 */
function StreakDots({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`连对 ${n} 天,满 3 天自动移出`}>
      {[0, 1, 2].map(i => (
        <span key={i} className={cn("h-1.5 w-1.5 rounded-full", i < n ? "bg-emerald-500" : "bg-slate-200")} />
      ))}
    </span>
  );
}

export default function VocabMistakes() {
  const navigate = useNavigate();
  const color = bankColor("toefl");

  const [rows, setRows] = useState<MistakeRow[] | null>(null);
  const [pool, setPool] = useState<VocabWord[]>([]);
  const [anon, setAnon] = useState(false);
  const [failed, setFailed] = useState(false);

  // 闯关状态
  const [playing, setPlaying] = useState(false);
  const [qs, setQs] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [totalDone, setTotalDone] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [roundNo, setRoundNo] = useState(0);
  const [failStreak, setFailStreak] = useState(0);
  const [roundOver, setRoundOver] = useState(false);
  const [quotaHit, setQuotaHit] = useState(false);
  const topRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, uid] = await Promise.all([listMistakes(), currentUserId()]);
      setAnon(!uid);
      setRows(list);
      if (list.length) {
        /* 干扰项要从**整个词库**抽,不能只从错题里抽 ——
         * 只从错题抽的话,选项全是自己做错过的词,难度失真且很快就眼熟。 */
        const bank = await getBankByCode("toefl");
        const [words, bankPool] = await Promise.all([
          getWordsByIds(list.map(r => r.word_id)),
          bank ? listBankWords(bank.id) : Promise.resolve([] as VocabWord[]),
        ]);
        const byId = new Map(words.map(w => [w.id, w]));
        setPool(bankPool.length ? bankPool : words);
        // 保持 listMistakes 的排序(最久未清在前),getWordsByIds 不保证顺序
        setOrdered(list.map(r => byId.get(r.word_id)).filter(Boolean) as VocabWord[]);
      }
    } catch {
      setFailed(true);
    }
  }, []);
  const [ordered, setOrdered] = useState<VocabWord[]>([]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => stopAudio(), []);
  /* 学习时长:做题期间累计活跃时长,切后台/失焦/久不操作自动暂停。
   * 挂在页面级而不是每道题 —— 时长是这一段时间在学,不是答了几题。 */
  useEffect(() => startTracking(), []);

  const active = rows ?? [];
  const byWordId = useMemo(() => new Map(active.map(r => [r.word_id, r])), [active]);

  function startRound(nextRoundNo: number) {
    /* 本轮取词:沿用 listMistakes 的排序(最久未清 → 错次多)。
     * 不足 10 个就有几个考几个 —— 剩 3 个错题时不该硬凑到 10。 */
    const targets = ordered.slice(0, ROUND);
    if (!targets.length) return;
    /* 题型优先 last_wrong_mode:在哪种题型上栽的就在哪种上补。
     * ⚠️ 目前闯关只实现了选择型(zh/en),listen/spell/match 的交互不同,
     *    落到 zh_choice 兜底。这不是偷懒 —— 把四种交互塞进闯关会让
     *    "达 6 解锁"的口径在不同题型间不可比,先统一在选择型上跑通。 */
    const wrongMode = byWordId.get(targets[0].id)?.last_wrong_mode ?? "zh_choice";
    const defMode: "zh" | "en" = wrongMode === "en_choice" ? "en" : "zh";
    const built = buildQuestions(pool.length ? pool : ordered, targets, defMode);
    if (!built.length) return;
    setQs(built); setIdx(0); setPicked(null); setRoundCorrect(0);
    setRoundNo(nextRoundNo); setRoundOver(false); setPlaying(true);
    try { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { /* 老 webview 忽略 */ }
  }

  async function choose(i: number) {
    const q = qs[idx];
    if (picked !== null || !q) return;
    setPicked(i);
    const ok = i === q.answerIndex;
    if (ok) { setRoundCorrect(c => c + 1); setTotalCorrect(c => c + 1); }
    setTotalDone(n => n + 1);
    const mode: VocabMode = (byWordId.get(q.word.id)?.last_wrong_mode as VocabMode) ?? "zh_choice";
    // 判定内核在 vocabMastery,这里只喂一次作答;连对/移出由它算
    const r = await recordAnswer(q.word.id, ok, mode === "en_choice" ? "en_choice" : "zh_choice");
    if (r.quotaBlocked) setQuotaHit(true);
  }

  function next() {
    stopAudio();
    if (idx + 1 >= qs.length) { setRoundOver(true); return; }
    setIdx(idx + 1); setPicked(null);
    try { topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); } catch { /* 忽略 */ }
  }

  const passed = roundCorrect >= Math.min(PASS, qs.length);
  const overallRate = totalDone > 0 ? totalCorrect / totalDone : 1;
  const mustContinue = !passed || overallRate < KEEP_GOING;
  const softStop = failStreak + (passed ? 0 : 1) >= SOFT_STOP_ROUNDS;

  function endRound(goOn: boolean) {
    setFailStreak(s => (passed ? 0 : s + 1));
    if (goOn) { load().then(() => startRound(roundNo + 1)); return; }
    setPlaying(false); setQs([]);
    load();                                   // 回列表时刷新:清掉的词该消失
  }

  /* ── 列表态 ── */
  if (!playing) {
    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        <div className="h-[3px] w-full" style={{ background: color }} />
        <div className="mx-auto w-full max-w-[560px] px-4 pb-28 pt-4">
          <BackLink to="/vocab" className="mb-3 inline-flex items-center gap-1 text-[14px] text-slate-500">
            ← 词汇中心
          </BackLink>
          <h1 className="mb-1 text-[24px] font-bold tracking-tight text-slate-900">错题本</h1>
          <p className="text-[14px] text-slate-500">答错的词进这里,隔天连对 3 次自动移出</p>

          {/* 「和 environment 大战了 4 回合」——**把错误说成较量,不是缺陷**。
              原来挂在词汇中心的错题本入口卡上当第二行,那张卡单行化后没了位置;
              这里才是它的主场:错题本天生带挫败感,页顶正需要这句把它翻成正向叙事。
              ⚠️ 组件自己在无数据时 return null,不需要在这里再判一次空态。 */}
          <div className="mb-2"><HardestWords color={color} /></div>
          {/* PR-9 默写纸:错题本是它最自然的来源之一 —— 错过的词正该拿去默写 */}
          <Link to="/vocab/dictation?from=mistakes"
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[13px] text-slate-600">
            <Printer className="h-3.5 w-3.5" />把错题印成默写纸
          </Link>

          {rows === null && !failed && (
            <div className="space-y-2">
              {[0, 1, 2].map(i => <div key={i} className="h-[62px] animate-pulse rounded-2xl border border-black/[0.06] bg-white" />)}
            </div>
          )}

          {failed && (
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
              <p className="text-[15px] text-slate-600">加载失败</p>
              <button onClick={load} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
            </div>
          )}

          {rows !== null && active.length === 0 && (
            <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
              <Check className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-2 text-[16px] font-medium text-slate-800">错题本是空的</p>
              <p className="mt-1 text-[14px] leading-relaxed text-slate-500">
                答错的词会自动进来。清空不是目标,清得动才是。
              </p>
            </div>
          )}

          {active.length > 0 && (
            <>
              <button type="button" onClick={() => startRound(1)}
                className="mb-4 w-full rounded-2xl px-5 py-3.5 text-[16px] font-semibold text-white"
                style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}>
                开始闯关 · 本轮 {Math.min(ROUND, active.length)} 词
              </button>

              <div className="space-y-2">
                {active.map(r => {
                  const w = ordered.find(x => x.id === r.word_id);
                  return (
                    <div key={r.word_id}
                      className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[17px] font-semibold text-slate-900" style={{ fontFamily: FONT_SERIF }}>
                          {r.headword_snapshot ?? w?.headword ?? "—"}
                        </div>
                        <div className="truncate text-[13px] text-slate-500">{w ? optionText(w, "zh") : ""}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
                          错 {r.wrong_total} 次
                        </div>
                        <div className="mt-1 flex justify-end"><StreakDots n={r.streak_days ?? 0} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-[12px] text-slate-400">
                绿点 = 已连对天数,满 3 天自动移出
              </p>
            </>
          )}

          {anon && <AnonNote />}
        </div>
        {quotaHit && <QuotaModal onClose={() => setQuotaHit(false)} />}
      </div>
    );
  }

  /* ── 闯关态 ── */
  const q = qs[idx];
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: color }} />
      <div className="mx-auto w-full max-w-[560px] px-4 pb-28 pt-4">
        <div ref={topRef} className="scroll-mt-3" />
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[14px] text-slate-500">
            <AlertCircle className="h-4 w-4" />第 {roundNo} 轮
          </span>
          <span className="text-[13px] text-slate-400" style={{ fontVariantNumeric: "tabular-nums" }}>
            本轮答对 {roundCorrect} / 需 {Math.min(PASS, qs.length)}
          </span>
        </div>

        {!roundOver && q && (
          <>
            <Progress done={idx} total={qs.length} color={color} />
            <div className="rounded-2xl border border-black/[0.06] bg-white px-5 py-5 text-center">
              <h2 className="text-slate-900" style={{ fontFamily: FONT_SERIF, fontSize: "clamp(32px, 10vw, 40px)", fontWeight: 600, lineHeight: 1.1 }}>
                {q.word.headword}
              </h2>
            </div>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, i) => {
                const isAnswer = i === q.answerIndex;
                const isPicked = picked === i;
                const reveal = picked !== null;
                return (
                  <button key={i} type="button" onClick={() => choose(i)} disabled={reveal}
                    className={cn(
                      "flex min-h-[58px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[17px] leading-snug transition",
                      !reveal && "border-black/[0.08] bg-white active:bg-slate-50",
                      reveal && isAnswer && "border-emerald-300 bg-emerald-50 text-emerald-900",
                      reveal && isPicked && !isAnswer && "border-rose-300 bg-rose-50 text-rose-900",
                      reveal && !isAnswer && !isPicked && "border-black/[0.06] bg-white text-slate-400",
                    )}>
                    <span className="min-w-0 flex-1">{opt}</span>
                    {reveal && isAnswer && <Check className="h-5 w-5 shrink-0 text-emerald-600" />}
                    {reveal && isPicked && !isAnswer && <X className="h-5 w-5 shrink-0 text-rose-500" />}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <Feedback word={q.word} correct={picked === q.answerIndex} onNext={next}
                lastOne={idx + 1 >= qs.length}
                correctAnswer={picked === q.answerIndex ? undefined : q.options[q.answerIndex]} />
            )}
          </>
        )}

        {roundOver && (
          <div className="rounded-2xl border border-black/[0.06] bg-white p-7 text-center">
            <div className="text-[15px] text-slate-500">第 {roundNo} 轮结果</div>
            <div className="mt-2 flex items-baseline justify-center gap-1.5">
              <span className="text-slate-900" style={{ fontFamily: FONT_STAT, fontSize: "clamp(40px, 12vw, 52px)", fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {roundCorrect}
              </span>
              <span className="text-[16px] text-slate-400">/ {qs.length}</span>
            </div>

            {softStop && !passed ? (
              /* 软保护:劝退不劝学。连续三轮没过还硬推,只会把挫败感叠上去。 */
              <>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                  今天状态不佳,明天再战。
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
                  错题不会跑掉,它们等着你。休息也是学习的一部分。
                </p>
                <button onClick={() => endRound(false)}
                  className="mt-5 w-full rounded-2xl px-5 py-3.5 text-[16px] font-semibold text-white"
                  style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}>
                  今天到这儿
                </button>
              </>
            ) : (
              <>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-500">
                  {passed
                    ? (overallRate < KEEP_GOING
                      ? `本轮过了,但累计正确率 ${Math.round(overallRate * 100)}%,再来一轮更稳`
                      : "本轮达标,可以收工了")
                    : `还差 ${Math.min(PASS, qs.length) - roundCorrect} 题达标,再来一轮`}
                </p>
                <button onClick={() => endRound(true)}
                  className="mt-5 w-full rounded-2xl px-5 py-3.5 text-[16px] font-semibold text-white"
                  style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}>
                  再来一轮
                </button>
                {/* 达 6 才解锁"关闭" —— 没到只能继续,这是闯关的约束本身 */}
                <button onClick={() => endRound(false)} disabled={mustContinue}
                  className={cn("mt-2.5 w-full rounded-2xl border px-5 py-3 text-[15px]",
                    mustContinue
                      ? "cursor-not-allowed border-black/[0.06] text-slate-300"
                      : "border-black/[0.08] text-slate-700")}>
                  {mustContinue ? `答对 ${Math.min(PASS, qs.length)} 题后可结束` : "结束闯关"}
                </button>
              </>
            )}
            <button onClick={() => { setPlaying(false); load(); navigate("/vocab/mistakes"); }}
              className="mt-3 text-[13px] text-slate-400">返回错题本</button>
          </div>
        )}
      </div>
      {quotaHit && <QuotaModal onClose={() => setQuotaHit(false)} />}
    </div>
  );
}
