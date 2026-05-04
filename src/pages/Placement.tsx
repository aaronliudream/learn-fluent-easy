import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Ear,
  FileText,
  Headphones,
  Languages,
  Info,
  Sparkles,
  Target,
  TrendingUp,
  Volume2,
  XCircle,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/speak";
import { T, useT } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";
import {
  buildSectionPool,
  pickAdaptive,
  scoreTest,
  CEFR_DESC,
  type PlacementQuestion,
  type PlacementResult,
  type Section,
  type SectionPool,
} from "@/lib/placement";

const SECTIONS: Section[] = ["vocab", "grammar", "reading", "listening"];
const QS_PER_SECTION = 6; // adaptive: shorter but more accurate
const TOTAL_QS = SECTIONS.length * QS_PER_SECTION; // 24
const NEEDS_NATIVE_TRANSLATION_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
const SECTION_META: Record<Section, { cn: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  vocab: { cn: "Vocabulary", icon: BookOpen, color: "bg-pink-500/15 text-pink-500" },
  grammar: { cn: "Grammar", icon: FileText, color: "bg-sky-500/15 text-sky-500" },
  reading: { cn: "Reading", icon: Languages, color: "bg-violet-500/15 text-violet-500" },
  listening: { cn: "Listening", icon: Headphones, color: "bg-indigo-500/15 text-indigo-500" },
};

type Stage = "intro" | "test" | "result";

const fmtTime = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

/**
 * Compute a per-question time limit (in seconds), based on:
 *   - section type (reading > listening > grammar > vocab)
 *   - CEFR difficulty level (1=A1 .. 6=C2): higher level → more thinking time
 *   - text length (prompt + context + options): longer → more reading time
 *
 * Returns a clamped integer in a reasonable range so easy items don't drag and
 * hard items don't feel impossible.
 */
const computeTimeLimit = (q: PlacementQuestion): number => {
  // Base seconds by section
  const sectionBase: Record<Section, number> = {
    vocab: 20,
    grammar: 30,
    listening: 35,
    reading: 45,
  };
  let t = sectionBase[q.section];

  // Level adjustment: +5s per level above A1 (B2 +15s, C2 +25s)
  t += Math.max(0, (q.level - 1)) * 5;

  // Reading-length adjustment: ~1s per 10 chars of context, ~1s per 5 words of prompt
  const ctxLen = (q.context ?? "").length;
  const promptLen = (q.prompt ?? "").length;
  const optsLen = q.options.reduce((a, o) => a + o.length, 0);
  if (q.section === "reading" && ctxLen > 0) {
    t += Math.min(60, Math.floor(ctxLen / 8));
  } else if (ctxLen > 0) {
    t += Math.min(20, Math.floor(ctxLen / 12));
  }
  t += Math.min(15, Math.floor(promptLen / 25));
  t += Math.min(10, Math.floor(optsLen / 40));

  // Listening: add buffer for replays
  if (q.section === "listening") t += 10;

  // Clamp 15s … 120s
  return Math.max(15, Math.min(120, t));
};

const Placement = () => {
  const tt = useT();
  const { tDynamic } = useI18n();
  const nativeText = (text: string) => NEEDS_NATIVE_TRANSLATION_RE.test(text) ? tDynamic(text) : text;
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("intro");
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState(0);
  const poolRef = useRef<SectionPool | null>(null);
  const usedRef = useRef<Set<string>>(new Set());
  // Track current adaptive level per section. Start everyone at L2 (A2).
  const sectionLevelRef = useRef<Record<Section, number>>({
    vocab: 2, grammar: 2, reading: 2, listening: 2,
  });
  // Per-question countdown
  const [qSecondsLeft, setQSecondsLeft] = useState(0);
  const [qTimeLimit, setQTimeLimit] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<PlacementResult | null>(null);
  const finishedRef = useRef(false);

  const start = () => {
    const pool = buildSectionPool();
    poolRef.current = pool;
    usedRef.current = new Set();
    sectionLevelRef.current = { vocab: 2, grammar: 2, reading: 2, listening: 2 };

    // Pre-seed: pick the FIRST question of each section at starting level so the
    // header shows progress smoothly. Subsequent questions are picked just-in-time
    // after each answer so the chosen level can adapt.
    const firstQs: PlacementQuestion[] = [];
    for (const sec of SECTIONS) {
      const q = pickAdaptive(pool, sec, 2, usedRef.current);
      if (q) {
        firstQs.push(q);
        usedRef.current.add(q.id);
      }
    }
    setQuestions(firstQs);
    setPicks({});
    setRevealed({});
    setIdx(0);
    setResult(null);
    finishedRef.current = false;
    setStage("test");
    window.scrollTo({ top: 0 });
  };

  // Record visit once when test starts
  useEffect(() => {
    if (stage !== "test") return;
    import("@/lib/guestProgress").then(m => m.recordVisit("placement"));
    import("@/lib/funnel").then(m => m.trackFunnel("placement", "started"));
  }, [stage]);

  // Per-question timer: resets whenever the current question changes; stops as
  // soon as the user picks an answer (revealed). When time runs out without an
  // answer, the question is auto-revealed (counted as wrong) and frozen until
  // the user clicks Next.
  useEffect(() => {
    if (stage !== "test") return;
    const q = questions[idx];
    if (!q) return;
    const limit = computeTimeLimit(q);
    setQTimeLimit(limit);
    setQSecondsLeft(limit);
    const t = setInterval(() => {
      setQSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          // Auto-reveal as time-out (no answer recorded)
          setRevealed((r) => ({ ...r, [q.id]: true }));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, stage, questions.length]);

  // Stop the timer immediately when an answer is revealed
  const isRevealed = (qid: string) => !!revealed[qid];

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const r = scoreTest(questions, picks);
    setResult(r);
    setStage("result");
    window.scrollTo({ top: 0 });
    import("@/lib/funnel").then(m =>
      m.trackFunnel("placement", "completed", {
        cefr: r.cefr,
        overall: r.overall,
        sectionScores: r.sectionScores,
      })
    );
  };

  const sectionGroups = useMemo(() => {
    const groups: Record<Section, PlacementQuestion[]> = {
      vocab: [], grammar: [], reading: [], listening: [],
    };
    questions.forEach((q) => groups[q.section].push(q));
    return groups;
  }, [questions]);

  /**
   * Advance to the next question. Adapts the difficulty of the NEXT question in
   * the current section based on whether the user just answered correctly.
   */
  const goNext = () => {
    const pool = poolRef.current;
    if (!pool) return;
    const cur = questions[idx];
    const pick = picks[cur.id];
    const correct = pick === cur.answer;

    // Adapt section level: ±1 step, clamped to 1..6 (A1..C2)
    const sec = cur.section;
    const prev = sectionLevelRef.current[sec];
    const nextLv = Math.max(1, Math.min(6, prev + (correct ? 1 : -1)));
    sectionLevelRef.current[sec] = nextLv;

    // Count answered per section
    const answeredInSec = questions.filter(
      (q) => q.section === sec && picks[q.id] !== undefined,
    ).length;

    // Decide which section the NEXT question belongs to.
    // Round-robin through sections so all four advance evenly.
    const sectionCounts: Record<Section, number> = { vocab: 0, grammar: 0, reading: 0, listening: 0 };
    for (const q of questions) sectionCounts[q.section]++;
    // Include the just-answered question's section having "answeredInSec" answers.
    // We want next section to be the one with the FEWEST scheduled questions
    // that hasn't reached QS_PER_SECTION.
    let nextSec: Section | null = null;
    let minCount = Infinity;
    for (const s of SECTIONS) {
      if (sectionCounts[s] >= QS_PER_SECTION) continue;
      if (sectionCounts[s] < minCount) {
        minCount = sectionCounts[s];
        nextSec = s;
      }
    }

    if (!nextSec) {
      // All sections full → finish
      finish();
      return;
    }

    const desiredLv = sectionLevelRef.current[nextSec];
    const nextQ = pickAdaptive(pool, nextSec, desiredLv, usedRef.current);
    if (!nextQ) {
      finish();
      return;
    }
    usedRef.current.add(nextQ.id);
    setQuestions((qs) => [...qs, nextQ]);
    setIdx(idx + 1);
    // Suppress unused warning in dev builds
    void answeredInSec;
  };

  const handlePick = (qid: string, optIdx: number) => {
    if (isRevealed(qid)) return;
    setPicks((p) => ({ ...p, [qid]: optIdx }));
    setRevealed((r) => ({ ...r, [qid]: true }));
  };

  // ---------------- INTRO ----------------
  if (stage === "intro") {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <PageHeader title="English Placement Test" subtitle="Adaptive · find your real level" back="/" />

        <div className="overflow-hidden rounded-3xl bg-grad-title p-7 text-white shadow-tile md:p-9">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <TrendingUp className="size-3.5" /> <T>自适应难度 · 参照 CEFR 标准</T>
          </div>
          <h2 className="text-2xl font-extrabold md:text-3xl"><T>英语水平定级测试</T></h2>
          <p className="mt-2 text-sm text-white/90 md:text-base">
            <T>参照欧洲共同语言参考框架 (CEFR) 的 A1–C1 等级标准，通过自适应算法判断你的真实水平：答对升级，答错降级，用最少的题目得到最准确的结果。</T>
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <Timer className="mb-1 size-5" />
              <div className="text-lg font-bold">15–120s</div>
              <div className="text-[11px] text-white/80"><T>每题限时</T></div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <Target className="mb-1 size-5" />
              <div className="text-lg font-bold">{TOTAL_QS} Q</div>
              <div className="text-[11px] text-white/80"><T>四模块自适应</T></div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <Award className="mb-1 size-5" />
              <div className="text-lg font-bold">A1–C2</div>
              <div className="text-[11px] text-white/80"><T>CEFR 全六级</T></div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-3xl bg-card p-6 shadow-card md:p-8">
          <h3 className="text-lg font-bold"><T>测试包含 4 个模块</T></h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(["vocab", "grammar", "reading", "listening"] as Section[]).map((s) => {
              const m = SECTION_META[s];
              const Icon = m.icon;
              return (
                <div key={s} className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/30 p-4">
                  <div className={`grid size-11 place-items-center rounded-2xl ${m.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <div className="font-bold"><T>{m.cn}</T></div>
                    <div className="text-xs text-muted-foreground">{QS_PER_SECTION} · <T>难度自动调节</T></div>
                  </div>
                </div>
              );
            })}
          </div>

          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> <T>独立题库 · 覆盖 A1 → C2 全六级，全部题目唯一不重复</T></li>
            <li className="flex items-start gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> <T>自适应难度：答对升一级，答错降一级，快速锁定真实水平</T></li>
            <li className="flex items-start gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> <T>每题独立限时（按模块、难度、题目长度科学计算），答完立即显示正确答案</T></li>
            <li className="flex items-start gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> <T>完成后给出 CEFR 等级 + 推荐 LEVEL 1–6 的具体学习起点</T></li>
          </ul>

          <Button size="lg" className="mt-6 w-full" onClick={start}>
            <T>开始测试</T> →
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            <T>建议在安静环境中一次性完成，途中关闭页面会丢失进度</T>
          </p>
        </section>
      </main>
    );
  }

  // ---------------- TEST ----------------
  if (stage === "test") {
    const q = questions[idx];
    if (!q) return null;
    const meta = SECTION_META[q.section];
    const Icon = meta.icon;
    const picked = picks[q.id];
    const revealedNow = isRevealed(q.id);
    const answered = Object.keys(picks).length;
    const lowTime = qSecondsLeft <= 5;
    const isLast = questions.length >= TOTAL_QS && idx === questions.length - 1;
    const timedOut = revealedNow && picked === undefined;
    const isCorrect = revealedNow && picked === q.answer;
    const timePct = qTimeLimit > 0 ? (qSecondsLeft / qTimeLimit) * 100 : 0;

    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
        {/* Top bar */}
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm(tt("确定要退出测试吗？当前进度将丢失。"))) {
                  navigate("/");
                }
              }}
              className="grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label={tt("退出测试")}
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className={`grid size-9 place-items-center rounded-xl ${meta.color}`}>
              <Icon className="size-4" />
            </div>
            <div>
              <div className="text-sm font-bold"><T>{meta.cn}</T> <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">L{q.level}</span></div>
              <div className="text-[11px] text-muted-foreground">{idx + 1} / {TOTAL_QS}</div>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-sm font-bold ${
            revealedNow ? "bg-secondary text-muted-foreground" : lowTime ? "bg-rose-500/15 text-rose-600 animate-pulse" : "bg-secondary text-foreground"
          }`}>
            <Clock className="size-4" /> {fmtTime(qSecondsLeft)}
          </div>
        </div>

        {/* Overall progress */}
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-grad-title transition-all"
            style={{ width: `${((idx + 1) / TOTAL_QS) * 100}%` }}
          />
        </div>
        {/* Per-question time bar */}
        <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-secondary/60">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              revealedNow ? "bg-muted-foreground/30" : lowTime ? "bg-rose-500" : "bg-primary"
            }`}
            style={{ width: `${timePct}%` }}
          />
        </div>

        {/* Question card */}
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          {q.section === "listening" && q.context && (
            <button
              onClick={() => speak(q.context!)}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-grad-title py-3 font-semibold text-white shadow-tile"
            >
              <Volume2 className="size-5" /> <T>播放音频</T>
            </button>
          )}
          {q.section === "reading" && q.context && (
            <div className="mb-5 rounded-2xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed">
              {nativeText(q.context)}
            </div>
          )}

          <div className="mb-5">
              <p className="text-lg font-semibold">{nativeText(q.prompt)}</p>
            {q.section === "grammar" && q.context && (
              <p className="mt-1 text-xs text-muted-foreground">{nativeText(q.context)}</p>
            )}
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {q.options.map((opt, oi) => {
              const active = picked === oi;
              const isCorrectOpt = oi === q.answer;
              let cls = "border-border bg-card hover:border-primary/40";
              if (revealedNow) {
                if (isCorrectOpt) {
                  cls = "border-emerald-500 bg-emerald-500/10 text-foreground";
                } else if (active) {
                  cls = "border-rose-500 bg-rose-500/10 text-foreground";
                } else {
                  cls = "border-border bg-card opacity-60";
                }
              } else if (active) {
                cls = "border-primary bg-primary/10 text-foreground";
              }
              return (
                <button
                  key={oi}
                  onClick={() => handlePick(q.id, oi)}
                  disabled={revealedNow}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${cls} disabled:cursor-default`}
                >
                  <span>{nativeText(opt)}</span>
                  {revealedNow && isCorrectOpt && <CheckCircle2 className="size-4 text-emerald-600" />}
                  {revealedNow && active && !isCorrectOpt && <XCircle className="size-4 text-rose-600" />}
                  {!revealedNow && active && <CheckCircle2 className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>

          {revealedNow && (
            <div className={`mt-5 rounded-2xl border p-4 text-sm ${
              timedOut
                ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                : isCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200"
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {timedOut ? (
                  <><Clock className="size-4" /> <T>时间到</T></>
                ) : isCorrect ? (
                  <><CheckCircle2 className="size-4" /> <T>回答正确</T></>
                ) : (
                  <><XCircle className="size-4" /> <T>回答错误</T></>
                )}
              </div>
              <div className="mt-1 text-xs">
                <T>正确答案</T>：<span className="font-semibold">{nativeText(q.options[q.answer])}</span>
              </div>
            </div>
          )}
        </section>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {!revealedNow ? <T>请选择一个答案</T> : <T>已记录答案，点击下方按钮继续</T>}
          </span>
          <span className="text-sm text-muted-foreground"><T>已答</T> {answered} / {TOTAL_QS}</span>
          {isLast ? (
            <Button
              onClick={finish}
              disabled={!revealedNow}
              className="bg-emerald-600 hover:bg-emerald-600/90"
            >
              <T>提交测试</T>
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!revealedNow}>
              <T>下一题</T> →
            </Button>
          )}
        </div>
      </main>
    );
  }

  // ---------------- RESULT ----------------
  if (stage === "result" && result) {
    const desc = CEFR_DESC[result.cefr];
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <PageHeader title="Test Result" subtitle="Based on CEFR" back="/" />

        <div className="overflow-hidden rounded-3xl bg-grad-title p-8 text-center text-white shadow-tile md:p-10">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Award className="size-8" />
          </div>
          <div className="text-sm opacity-90"><T>你的 CEFR 等级</T></div>
          <div className="mt-1 text-6xl font-black tracking-tight md:text-7xl">{result.cefr}</div>
          <div className="mt-2 text-base font-semibold"><T>{desc.name}</T></div>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/90"><T>{desc.tag}</T></p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="text-2xl font-extrabold">{result.ability.toFixed(1)}</div>
              <div className="text-[11px] text-white/80"><T>能力估值 (1.0–6.5)</T></div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="text-2xl font-extrabold">{result.weighted}</div>
              <div className="text-[11px] text-white/80"><T>加权得分</T></div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="text-2xl font-extrabold">{result.correct}/{result.total}</div>
              <div className="text-[11px] text-white/80"><T>答对题数</T></div>
            </div>
          </div>
        </div>

        {/* Section breakdown */}
        <section className="mt-6 rounded-3xl bg-card p-6 shadow-card md:p-8">
          <h3 className="text-lg font-bold"><T>分模块表现</T></h3>
          <div className="mt-4 space-y-3">
            {(Object.keys(SECTION_META) as Section[]).map((s) => {
              const m = SECTION_META[s];
              const r = result.bySection[s];
              const pct = r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0;
              const Icon = m.icon;
              return (
                <div key={s} className="rounded-2xl border border-border bg-secondary/30 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <div className={`grid size-9 place-items-center rounded-xl ${m.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold"><T>{m.cn}</T></div>
                      <div className="text-xs text-muted-foreground">{r.correct}/{r.total}</div>
                    </div>
                    <div className="text-lg font-extrabold">{pct}%</div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-card">
                    <div className="h-full bg-grad-title" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Overall recommendation */}
        <Link
          to={`/level/${result.recommendedLevel}`}
          className="mt-6 flex items-center gap-4 rounded-3xl border-2 border-primary/30 bg-primary/5 p-6 transition hover:bg-primary/10"
        >
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-7" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary"><T>综合推荐起点</T></div>
            <div className="mt-1 text-lg font-extrabold"><T>从 LEVEL</T> {result.recommendedLevel} <T>开始学习</T></div>
            <div className="text-sm text-muted-foreground"><T>基于四模块平均能力 · 点击进入该等级</T></div>
          </div>
          <Ear className="size-5 text-primary" />
        </Link>

        {/* Per-section study plan */}
        <section className="mt-6 rounded-3xl bg-card p-6 shadow-card md:p-8">
          <h3 className="text-lg font-bold"><T>个性化学习建议</T></h3>
          <p className="mt-1 text-xs text-muted-foreground">
            <T>根据你在 4 个模块的真实表现，分别推荐适合的 LEVEL 与单元起点。</T>
          </p>
          <div className="mt-4 space-y-3">
            {result.recommendations.map((rec) => {
              const m = SECTION_META[rec.section];
              const Icon = m.icon;
              const isWeak = result.weakest.includes(rec.section);
              return (
                <Link
                  key={rec.section}
                  to={`/level/${rec.level}`}
                  className={`block rounded-2xl border p-4 transition hover:border-primary/50 ${
                    isWeak ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid size-10 place-items-center rounded-xl ${m.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold"><T>{rec.cnSection}</T></span>
                        {isWeak && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            <T>最薄弱 · 优先强化</T>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <T>正确率</T> {rec.pct}% · <T>推荐难度</T> LEVEL {rec.level}
                      </div>
                    </div>
                    <div className="text-2xl font-black text-primary">L{rec.level}</div>
                  </div>
                  <div className="mt-3 rounded-xl bg-card p-3 text-sm">
                    <div className="font-semibold text-foreground">📚 <T>推荐起点</T>：<T>{rec.unitTitle}</T></div>
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground"><T>{rec.advice}</T></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setStage("intro")}>
            <T>重新测试</T>
          </Button>
          <Button className="flex-1" onClick={() => navigate("/")}>
            <T>返回首页</T>
          </Button>
        </div>

        {/* Hidden anchor to avoid unused warnings on unused imports */}
        <span className="hidden">
          {sectionGroups.vocab.length}
        </span>
      </main>
    );
  }

  return null;
};

export default Placement;