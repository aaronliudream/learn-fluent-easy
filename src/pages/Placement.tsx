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
  type SectionState,
  initSectionState,
  updateSectionState,
  sectionConfidenceHalfWidth,
} from "@/lib/placement";

const TEST_MINUTES = 25;
const SECTIONS: Section[] = ["vocab", "grammar", "reading", "listening"];
const QS_MIN_PER_SECTION = 4; // never stop a section before this many items
const QS_MAX_PER_SECTION = 7; // hard cap per section
const STOP_CONFIDENCE = 0.45; // half-width threshold (in CEFR levels)
const TOTAL_QS = SECTIONS.length * QS_MAX_PER_SECTION; // 28 (upper bound)
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
  // Per-section adaptive state (CAT). Stable refs avoid stale closures during
  // the rapid setState chain after each answer.
  const sectionStateRef = useRef<Record<Section, SectionState>>({
    vocab: initSectionState(),
    grammar: initSectionState(),
    reading: initSectionState(),
    listening: initSectionState(),
  });
  const sectionDoneRef = useRef<Record<Section, boolean>>({
    vocab: false, grammar: false, reading: false, listening: false,
  });
  const startedAtRef = useRef<number>(Date.now());
  const [secondsLeft, setSecondsLeft] = useState(TEST_MINUTES * 60);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const finishedRef = useRef(false);

  const start = () => {
    const pool = buildSectionPool();
    poolRef.current = pool;
    usedRef.current = new Set();
    sectionStateRef.current = {
      vocab: initSectionState(),
      grammar: initSectionState(),
      reading: initSectionState(),
      listening: initSectionState(),
    };
    sectionDoneRef.current = { vocab: false, grammar: false, reading: false, listening: false };
    startedAtRef.current = Date.now();

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
    setIdx(0);
    setSecondsLeft(TEST_MINUTES * 60);
    setResult(null);
    finishedRef.current = false;
    setStage("test");
    window.scrollTo({ top: 0 });
  };

  // Timer
  useEffect(() => {
    if (stage !== "test") return;
    import("@/lib/guestProgress").then(m => m.recordVisit("placement"));
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const r = scoreTest(questions, picks);
    setResult(r);
    setStage("result");
    window.scrollTo({ top: 0 });
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

    // 1) Update CAT state for the section we just answered in
    const sec = cur.section;
    const newState = updateSectionState(sectionStateRef.current[sec], cur.level, correct);
    sectionStateRef.current[sec] = newState;

    // 2) Decide if this section is "done" (enough info or hit cap)
    const halfWidth = sectionConfidenceHalfWidth(newState);
    const sectionDone =
      newState.answered >= QS_MAX_PER_SECTION ||
      (newState.answered >= QS_MIN_PER_SECTION && halfWidth <= STOP_CONFIDENCE);
    sectionDoneRef.current[sec] = sectionDone;

    // 3) All sections done → finish
    if (SECTIONS.every((s) => sectionDoneRef.current[s])) {
      finish();
      return;
    }

    // 4) Pick the next section: round-robin across sections that aren't done,
    //    preferring the one with the fewest answered items so progress feels even.
    const remaining = SECTIONS.filter((s) => !sectionDoneRef.current[s]);
    let nextSec: Section = remaining[0];
    let minAnswered = Infinity;
    for (const s of remaining) {
      const a = sectionStateRef.current[s].answered;
      if (a < minAnswered) {
        minAnswered = a;
        nextSec = s;
      }
    }

    const desiredLv = sectionStateRef.current[nextSec].level;
    const nextQ = pickAdaptive(pool, nextSec, desiredLv, usedRef.current);
    if (!nextQ) {
      // Bank exhausted at every level for this section → mark done & try again
      sectionDoneRef.current[nextSec] = true;
      if (SECTIONS.every((s) => sectionDoneRef.current[s])) {
        finish();
        return;
      }
      // Try the remaining sections one more time
      for (const s of SECTIONS) {
        if (sectionDoneRef.current[s]) continue;
        const fallback = pickAdaptive(pool, s, sectionStateRef.current[s].level, usedRef.current);
        if (fallback) {
          usedRef.current.add(fallback.id);
          setQuestions((qs) => [...qs, fallback]);
          setIdx(idx + 1);
          return;
        }
        sectionDoneRef.current[s] = true;
      }
      finish();
      return;
    }
    usedRef.current.add(nextQ.id);
    setQuestions((qs) => [...qs, nextQ]);
    setIdx(idx + 1);
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
              <Clock className="mb-1 size-5" />
              <div className="text-lg font-bold">≤ 25 min</div>
              <div className="text-[11px] text-white/80"><T>限时</T></div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <Target className="mb-1 size-5" />
              <div className="text-lg font-bold">~{QS_MIN_PER_SECTION * 4}–{TOTAL_QS} Q</div>
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
                    <div className="text-xs text-muted-foreground">{QS_MIN_PER_SECTION}–{QS_MAX_PER_SECTION} · <T>难度自动调节</T></div>
                  </div>
                </div>
              );
            })}
          </div>

          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> <T>独立题库 · 覆盖 A1 → C2 全六级，全部题目唯一不重复</T></li>
            <li className="flex items-start gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> <T>自适应难度：答对升一级，答错降一级，快速锁定真实水平</T></li>
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
    const answered = Object.keys(picks).length;
    const lowTime = secondsLeft <= 60;
    const isLast = questions.length >= TOTAL_QS && idx === questions.length - 1;

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
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-sm font-bold ${lowTime ? "bg-rose-500/15 text-rose-600" : "bg-secondary text-foreground"}`}>
            <Clock className="size-4" /> {fmtTime(secondsLeft)}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-grad-title transition-all"
            style={{ width: `${((idx + 1) / TOTAL_QS) * 100}%` }}
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
              return (
                <button
                  key={oi}
                  onClick={() => setPicks({ ...picks, [q.id]: oi })}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span>{nativeText(opt)}</span>
                  {active && <CheckCircle2 className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {picked === undefined ? <T>请选择一个答案</T> : <T>已记录答案，点击下方按钮继续</T>}
          </span>
          <span className="text-sm text-muted-foreground"><T>已答</T> {answered} / {TOTAL_QS}</span>
          {isLast ? (
            <Button
              onClick={finish}
              disabled={picked === undefined}
              className="bg-emerald-600 hover:bg-emerald-600/90"
            >
              <T>提交测试</T>
            </Button>
          ) : (
            <Button onClick={goNext} disabled={picked === undefined}>
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