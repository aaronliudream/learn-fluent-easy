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
  Brain,
  Loader2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  XCircle,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/speak";
import { T, useT } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
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
  computeQuestionTimeLimit,
} from "@/lib/placement";

const TEST_MINUTES = 25;
const SECTIONS: Section[] = ["vocab", "grammar", "reading", "listening"];
const QS_MIN_PER_SECTION = 4; // never stop a section before this many items
const QS_MAX_PER_SECTION = 7; // hard cap per section
const STOP_CONFIDENCE = 0.45; // half-width threshold (in CEFR levels)
const TOTAL_QS = SECTIONS.length * QS_MAX_PER_SECTION; // 28 (upper bound)

// Listening audio may be replayed at most this many times per question.
// Real proficiency tests (TOEFL/IELTS) typically allow ONE play. We grant
// 2 to account for short clips + first-time UI familiarity, but never more.
const LISTENING_MAX_PLAYS = 2;

// Section-level lower bounds shown in the intro UI (the actual time for any
// individual question is computed dynamically from its content length and
// CEFR tier — see computeQuestionTimeLimit in lib/placement.ts).
const SECTION_TIME_RANGE: Record<Section, string> = {
  vocab: "12–60s",
  grammar: "15–70s",
  reading: "30–180s",
  listening: "20–120s",
};

const NEEDS_NATIVE_TRANSLATION_RE = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
const SECTION_META: Record<Section, { cn: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  vocab: { cn: "Vocabulary", icon: BookOpen, color: "bg-pink-500/15 text-pink-500" },
  grammar: { cn: "Grammar", icon: FileText, color: "bg-sky-500/15 text-sky-500" },
  reading: { cn: "Reading", icon: Languages, color: "bg-violet-500/15 text-violet-500" },
  listening: { cn: "Listening", icon: Headphones, color: "bg-indigo-500/15 text-indigo-500" },
};

type Stage = "intro" | "test" | "result";
type ReviewStage = "ask" | "review" | "skip";

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
  // True once the user has confirmed their answer (or time ran out). The
  // current question is then locked, the correct answer + explanation are
  // shown, and only "Next" is actionable.
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  // Per-question seconds remaining. Resets when a new question is shown.
  const [questionSecondsLeft, setQuestionSecondsLeft] = useState(0);
  // How many times the user has played the listening audio for the current Q.
  const [listeningPlays, setListeningPlays] = useState<Record<string, number>>({});
  // Wrong-answer review flow shown after results.
  const [reviewStage, setReviewStage] = useState<ReviewStage>("ask");
  const [reviewIdx, setReviewIdx] = useState(0);
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
    setRevealed({});
    setListeningPlays({});
    setSecondsLeft(TEST_MINUTES * 60);
    setResult(null);
    finishedRef.current = false;
    setStage("test");
    setReviewStage("ask");
    setReviewIdx(0);
    // Seed per-question timer for the first question
    const first = poolRef.current ? null : null; void first;
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

  // Per-question timer. Resets whenever the visible question changes.
  // When it reaches 0 we lock-in whatever pick the user has (or no pick
  // at all → counted as wrong) and reveal the correct answer.
  useEffect(() => {
    if (stage !== "test") return;
    const q = questions[idx];
    if (!q) return;
    if (revealed[q.id]) return; // already revealed → no countdown
    setQuestionSecondsLeft(
      computeQuestionTimeLimit(q, { listeningMaxPlays: LISTENING_MAX_PLAYS }),
    );
    const t = setInterval(() => {
      setQuestionSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          // Time-up auto-reveal. If user has no pick, it remains undefined,
          // which scoreTest() already treats as incorrect.
          setRevealed((prev) => ({ ...prev, [q.id]: true }));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, idx, questions.length]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const r = scoreTest(questions, picks);
    setResult(r);
    setStage("result");
    setReviewStage("ask");
    setReviewIdx(0);
    window.scrollTo({ top: 0 });
    void persistAndAnalyze(r);
  };

  // ----- Persisted result + AI report -----
  const [resultRowId, setResultRowId] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string>("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [previousResult, setPreviousResult] = useState<{
    cefr: string; ability: number; recommended_level: number; created_at: string;
  } | null>(null);

  const persistAndAnalyze = async (r: PlacementResult) => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) {
      // Anonymous user → still try AI report, don't persist
      void streamReport(r, null);
      return;
    }
    // Fetch previous result BEFORE inserting (so the comparison shows real "last")
    try {
      const { data: prev } = await supabase
        .from("placement_results")
        .select("cefr,ability,recommended_level,created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prev) setPreviousResult(prev as any);
    } catch (e) {
      console.warn("prev result fetch", e);
    }
    // Build the question log for diagnosis
    const wrongQuestions = questions
      .filter((q) => picks[q.id] !== undefined && picks[q.id] !== q.answer)
      .map((q) => ({
        id: q.id,
        section: q.section,
        level: q.level,
        prompt: q.prompt,
        context: q.context,
        options: q.options,
        answer: q.answer,
        picked: picks[q.id],
        explain: q.explain,
      }));
    const fullLog = questions.map((q) => ({
      id: q.id, section: q.section, level: q.level,
      picked: picks[q.id] ?? null, correct: picks[q.id] === q.answer,
    }));
    const durationSeconds = Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000));
    try {
      const { data: inserted, error } = await supabase
        .from("placement_results")
        .insert({
          user_id: uid,
          cefr: r.cefr,
          ability: r.ability,
          weighted: r.weighted,
          recommended_level: r.recommendedLevel,
          by_section: r.bySection,
          weakest: r.weakest,
          question_log: fullLog,
          duration_seconds: durationSeconds,
        })
        .select("id")
        .single();
      if (error) throw error;
      setResultRowId(inserted.id);
    } catch (e) {
      console.warn("persist placement result", e);
    }
    void streamReport(r, wrongQuestions);
  };

  const streamReport = async (r: PlacementResult, wrongQuestions: any[] | null) => {
    setAiBusy(true);
    setAiError(null);
    setAiReport("");
    try {
      const wq = wrongQuestions ?? questions
        .filter((q) => picks[q.id] !== undefined && picks[q.id] !== q.answer)
        .map((q) => ({
          section: q.section, level: q.level, prompt: q.prompt,
          context: q.context, options: q.options, answer: q.answer,
          picked: picks[q.id], explain: q.explain,
        }));
      const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/placement-report`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          cefr: r.cefr,
          ability: r.ability,
          weighted: r.weighted,
          recommendedLevel: r.recommendedLevel,
          bySection: r.bySection,
          weakest: r.weakest,
          wrongQuestions: wq,
        }),
      });
      if (!resp.ok || !resp.body) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assembled = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const payload = t.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const obj = JSON.parse(payload);
            if (obj.delta) {
              assembled += obj.delta;
              setAiReport(assembled);
            } else if (obj.error) {
              throw new Error(obj.error);
            }
          } catch (e) {
            // ignore malformed
          }
        }
      }
      // Persist the AI report on the row (best-effort)
      if (resultRowId && assembled) {
        await supabase
          .from("placement_results")
          .update({ ai_report: { markdown: assembled, model: "gemini-2.5-flash" } })
          .eq("id", resultRowId);
      }
    } catch (e) {
      console.error("AI report stream", e);
      setAiError(e instanceof Error ? e.message : "Failed to load AI report");
    } finally {
      setAiBusy(false);
    }
  };

  const regenerateReport = () => {
    if (!result) return;
    void streamReport(result, null);
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
            <li className="flex items-start gap-2"><Clock className="mt-0.5 size-4 shrink-0 text-primary" /> <T>每题独立倒计时，依据题目长度与 CEFR 难度动态计算（词汇 {SECTION_TIME_RANGE.vocab} · 语法 {SECTION_TIME_RANGE.grammar} · 阅读 {SECTION_TIME_RANGE.reading} · 听力 {SECTION_TIME_RANGE.listening}），超时按错处理</T></li>
            <li className="flex items-start gap-2"><Headphones className="mt-0.5 size-4 shrink-0 text-primary" /> <T>听力题最多播放 2 次（仿真 TOEFL/IELTS 标准），杜绝反复听</T></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> <T>每题作答后立即显示正确答案与讲解，让你心服口服</T></li>
            <li className="flex items-start gap-2"><GraduationCap className="mt-0.5 size-4 shrink-0 text-primary" /> <T>测试结束可一键复习全部错题，把测试变成真正的学习</T></li>
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
    const isRevealed = !!revealed[q.id];
    const isCorrect = isRevealed && picked === q.answer;
    const playsUsed = listeningPlays[q.id] ?? 0;
    const playsLeft = LISTENING_MAX_PLAYS - playsUsed;
    const perQTotal = computeQuestionTimeLimit(q, { listeningMaxPlays: LISTENING_MAX_PLAYS });
    const perQLow = !isRevealed && questionSecondsLeft <= 10;
    // Predict whether answering this one finishes the test:
    // every other section is already done AND this section will be done after the answer.
    const stateNow = sectionStateRef.current[q.section];
    const willBeAnswered = stateNow.answered + 1;
    const otherSectionsDone = SECTIONS.every(
      (s) => s === q.section || sectionDoneRef.current[s],
    );
    const thisWillBeDone =
      willBeAnswered >= QS_MAX_PER_SECTION ||
      (willBeAnswered >= QS_MIN_PER_SECTION &&
        sectionConfidenceHalfWidth({
          ...stateNow,
          answered: willBeAnswered,
        }) <= STOP_CONFIDENCE);
    const isLast = otherSectionsDone && thisWillBeDone;
    // Estimated total: sum of (already done = answered, otherwise = max((answered+1), MIN))
    const estTotal = SECTIONS.reduce((acc, s) => {
      const st = sectionStateRef.current[s];
      if (sectionDoneRef.current[s]) return acc + st.answered;
      return acc + Math.max(QS_MIN_PER_SECTION, st.answered + 1);
    }, 0);

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
              <div className="text-[11px] text-muted-foreground">{idx + 1} / ~{Math.max(estTotal, idx + 1)}</div>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-sm font-bold ${lowTime ? "bg-rose-500/15 text-rose-600" : "bg-secondary text-foreground"}`}>
            <Clock className="size-4" /> {fmtTime(secondsLeft)}
          </div>
        </div>

        {/* Overall progress */}
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-grad-title transition-all"
            style={{ width: `${Math.min(100, ((idx + 1) / Math.max(estTotal, idx + 1)) * 100)}%` }}
          />
        </div>

        {/* Per-question timer bar */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isRevealed
                  ? "bg-muted-foreground/40"
                  : perQLow
                    ? "bg-rose-500"
                    : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.max(0, (questionSecondsLeft / perQTotal) * 100)}%`,
              }}
            />
          </div>
          <div
            className={`min-w-[64px] text-right font-mono text-xs font-bold ${
              isRevealed ? "text-muted-foreground" : perQLow ? "text-rose-600" : "text-foreground"
            }`}
          >
            {isRevealed ? <T>已作答</T> : `${questionSecondsLeft}s / ${perQTotal}s`}
          </div>
        </div>

        {/* Question card */}
        <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
          {q.section === "listening" && q.context && (
            <div className="mb-5">
              <button
                onClick={() => {
                  if (playsLeft <= 0 || isRevealed) return;
                  speak(q.context!);
                  setListeningPlays((p) => ({ ...p, [q.id]: (p[q.id] ?? 0) + 1 }));
                }}
                disabled={playsLeft <= 0 || isRevealed}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white shadow-tile transition ${
                  playsLeft <= 0 || isRevealed
                    ? "cursor-not-allowed bg-muted-foreground/40"
                    : "bg-grad-title hover:opacity-90"
                }`}
              >
                <Volume2 className="size-5" />
                {playsLeft <= 0 ? <T>已用完播放次数</T> : <T>播放音频</T>}
              </button>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Info className="size-3" />
                <T>仿照真实考试 · 最多可播放</T> {LISTENING_MAX_PLAYS} <T>次</T>
                <span className="ml-1 font-semibold">
                  ({playsUsed}/{LISTENING_MAX_PLAYS})
                </span>
              </div>
            </div>
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
              const isAnswerOpt = oi === q.answer;
              let cls = "border-border bg-card hover:border-primary/40";
              if (isRevealed) {
                if (isAnswerOpt) {
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
                  onClick={() => {
                    if (isRevealed) return;
                    setPicks({ ...picks, [q.id]: oi });
                  }}
                  disabled={isRevealed}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${cls}`}
                >
                  <span>{nativeText(opt)}</span>
                  {isRevealed && isAnswerOpt && <CheckCircle2 className="size-4 text-emerald-600" />}
                  {isRevealed && !isAnswerOpt && active && <XCircle className="size-4 text-rose-600" />}
                  {!isRevealed && active && <CheckCircle2 className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>

          {/* Instant feedback */}
          {isRevealed && (
            <div
              className={`mt-5 rounded-2xl border p-4 text-sm ${
                isCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-rose-500/40 bg-rose-500/10"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-600" />
                    <span className="text-emerald-700"><T>回答正确</T></span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-5 text-rose-600" />
                    <span className="text-rose-700">
                      {picked === undefined ? <T>未作答 · 时间到</T> : <T>回答错误</T>}
                    </span>
                  </>
                )}
              </div>
              {!isCorrect && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <T>正确答案</T>：<span className="font-semibold text-foreground">{nativeText(q.options[q.answer])}</span>
                </div>
              )}
              {q.explain && (
                <div className="mt-2 text-xs leading-relaxed text-foreground/80">
                  💡 <T>{q.explain}</T>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {isRevealed
              ? <T>查看解析后点击继续</T>
              : picked === undefined
                ? <T>请选择一个答案</T>
                : <T>选定后点击「确认答案」查看解析</T>}
          </span>
          <span className="text-sm text-muted-foreground"><T>已答</T> {answered} / ~{Math.max(estTotal, answered)}</span>
          {!isRevealed ? (
            <Button
              onClick={() => setRevealed((r) => ({ ...r, [q.id]: true }))}
              disabled={picked === undefined}
            >
              <T>确认答案</T>
            </Button>
          ) : isLast ? (
            <Button
              onClick={finish}
              className="bg-emerald-600 hover:bg-emerald-600/90"
            >
              <T>提交测试</T>
            </Button>
          ) : (
            <Button onClick={goNext}>
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
    const wrongList = questions.filter(
      (q) => picks[q.id] === undefined || picks[q.id] !== q.answer,
    );

    // ----- Review mode: show wrong questions one-by-one with explanation -----
    if (reviewStage === "review" && wrongList.length > 0) {
      const rq = wrongList[reviewIdx];
      const rmeta = SECTION_META[rq.section];
      const RIcon = rmeta.icon;
      const userPick = picks[rq.id];
      const isLastReview = reviewIdx >= wrongList.length - 1;
      return (
        <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReviewStage("skip")}
                className="grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label={tt("退出复习")}
              >
                <ArrowLeft className="size-4" />
              </button>
              <div className={`grid size-9 place-items-center rounded-xl ${rmeta.color}`}>
                <RIcon className="size-4" />
              </div>
              <div>
                <div className="text-sm font-bold">
                  <T>复习错题</T>{" "}
                  <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    L{rq.level}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {reviewIdx + 1} / {wrongList.length}
                </div>
              </div>
            </div>
            <div className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-700">
              <T>{rmeta.cn}</T>
            </div>
          </div>

          <section className="rounded-3xl bg-card p-6 shadow-card md:p-8">
            {rq.section === "listening" && rq.context && (
              <button
                onClick={() => speak(rq.context!)}
                className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-grad-title py-3 font-semibold text-white shadow-tile"
              >
                <Volume2 className="size-5" /> <T>播放音频</T> · <T>复习时不限次数</T>
              </button>
            )}
            {rq.section === "reading" && rq.context && (
              <div className="mb-5 rounded-2xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed">
                {nativeText(rq.context)}
              </div>
            )}

            <p className="mb-4 text-lg font-semibold">{nativeText(rq.prompt)}</p>
            {rq.section === "grammar" && rq.context && (
              <p className="mb-3 text-xs text-muted-foreground">{nativeText(rq.context)}</p>
            )}

            <div className="grid gap-2 md:grid-cols-2">
              {rq.options.map((opt, oi) => {
                const isAns = oi === rq.answer;
                const wasUserPick = oi === userPick;
                let cls = "border-border bg-card opacity-60";
                if (isAns) cls = "border-emerald-500 bg-emerald-500/10";
                else if (wasUserPick) cls = "border-rose-500 bg-rose-500/10";
                return (
                  <div key={oi} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${cls}`}>
                    <span>{nativeText(opt)}</span>
                    {isAns && <CheckCircle2 className="size-4 text-emerald-600" />}
                    {!isAns && wasUserPick && <XCircle className="size-4 text-rose-600" />}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 text-sm">
              <div className="mb-1 flex items-center gap-2 font-bold text-violet-700">
                <Brain className="size-4" /> <T>讲解</T>
              </div>
              <div className="text-xs leading-relaxed text-foreground/85">
                {rq.explain ? <T>{rq.explain}</T> : <T>请记住正确选项，并尝试用同类句型再造一句。</T>}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <T>正确答案</T>：<span className="font-semibold text-foreground">{nativeText(rq.options[rq.answer])}</span>
                {userPick !== undefined && (
                  <>
                    {" · "}
                    <T>你选择了</T>：<span className="font-semibold text-foreground">{nativeText(rq.options[userPick])}</span>
                  </>
                )}
                {userPick === undefined && (
                  <>{" · "}<span className="font-semibold text-rose-600"><T>当时未作答</T></span></>
                )}
              </div>
            </div>
          </section>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setReviewIdx((i) => Math.max(0, i - 1))} disabled={reviewIdx === 0}>
              ← <T>上一题</T>
            </Button>
            {isLastReview ? (
              <Button className="bg-emerald-600 hover:bg-emerald-600/90" onClick={() => setReviewStage("skip")}>
                <T>完成复习</T>
              </Button>
            ) : (
              <Button onClick={() => setReviewIdx((i) => i + 1)}>
                <T>下一题</T> →
              </Button>
            )}
          </div>
        </main>
      );
    }

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

        {/* Review-wrong-answers prompt */}
        {wrongList.length > 0 && reviewStage === "ask" && (
          <section className="mt-5 overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 shadow-card md:p-6">
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                <GraduationCap className="size-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold"><T>要不要复习刚才答错的题？</T></h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  <T>本次共有</T>{" "}
                  <span className="font-bold text-amber-700">{wrongList.length}</span>{" "}
                  <T>题答错或超时未答。逐题复习能直接把弱点变成提升点 —— 既然花了这么久测试，别让它白费。</T>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-600/90"
                    onClick={() => {
                      setReviewIdx(0);
                      setReviewStage("review");
                      window.scrollTo({ top: 0 });
                    }}
                  >
                    <T>开始复习错题</T> ({wrongList.length}) →
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReviewStage("skip")}>
                    <T>稍后再说</T>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {wrongList.length > 0 && reviewStage === "skip" && (
          <button
            onClick={() => {
              setReviewIdx(0);
              setReviewStage("review");
              window.scrollTo({ top: 0 });
            }}
            className="mt-5 flex w-full items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-500/5 px-5 py-3 text-left text-sm transition hover:bg-amber-500/10"
          >
            <span className="flex items-center gap-2 font-semibold text-amber-700">
              <GraduationCap className="size-4" />
              <T>重新复习错题</T> ({wrongList.length})
            </span>
            <span className="text-xs text-muted-foreground">→</span>
          </button>
        )}

        {/* Previous vs current comparison */}
        {previousResult && (() => {
          const prevAb = Number(previousResult.ability) || 0;
          const diff = +(result.ability - prevAb).toFixed(1);
          const upgraded = result.recommendedLevel > previousResult.recommended_level;
          const downgraded = result.recommendedLevel < previousResult.recommended_level;
          const sameDay = false;
          const Trend = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus;
          const trendCls = diff > 0 ? "text-emerald-600 bg-emerald-500/15" :
                            diff < 0 ? "text-rose-600 bg-rose-500/15" :
                                       "text-muted-foreground bg-secondary";
          const dateStr = new Date(previousResult.created_at).toLocaleDateString();
          void sameDay;
          return (
            <section className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className={`grid size-10 place-items-center rounded-xl ${trendCls}`}>
                  <Trend className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground"><T>对比上次测评</T> · {dateStr}</div>
                  <div className="text-sm font-bold">
                    {previousResult.cefr} <span className="text-muted-foreground">→</span> {result.cefr}
                    <span className="ml-2 text-xs font-semibold">
                      {diff > 0 ? `+${diff}` : diff} <T>能力值</T>
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {upgraded && <span className="text-emerald-600"><T>推荐起步等级提升</T> ↑</span>}
                    {downgraded && <span className="text-rose-600"><T>推荐起步等级回落</T> ↓</span>}
                    {!upgraded && !downgraded && <span><T>推荐起步等级持平</T></span>}
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

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

        {/* AI Diagnostic Report */}
        <section className="mt-6 rounded-3xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-6 shadow-card md:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md">
              <Brain className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-extrabold"><T>AI 诊断报告</T></h3>
              <p className="text-xs text-muted-foreground">
                <T>基于你的答题轨迹，给出考点归因与 4 周提升计划</T>
              </p>
            </div>
            {!aiBusy && aiReport && (
              <button
                onClick={regenerateReport}
                className="grid size-9 place-items-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label={tt("重新生成")}
              >
                <RefreshCw className="size-4" />
              </button>
            )}
          </div>

          {aiBusy && !aiReport && (
            <div className="flex items-center gap-3 rounded-2xl bg-card p-5 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-violet-500" />
              <span><T>AI 正在分析你的错题与能力分布… 通常 5–15 秒</T></span>
            </div>
          )}

          {aiError && !aiReport && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-700">
              <div className="font-semibold"><T>报告生成失败</T></div>
              <div className="mt-1 text-xs">{aiError}</div>
              <Button size="sm" variant="outline" className="mt-3" onClick={regenerateReport}>
                <RefreshCw className="mr-1.5 size-3.5" /> <T>重试</T>
              </Button>
            </div>
          )}

          {aiReport && (
            <article className="prose prose-sm dark:prose-invert max-w-none rounded-2xl bg-card p-5 leading-relaxed text-foreground/90 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-extrabold [&_h2]:text-violet-700 dark:[&_h2]:text-violet-400 [&_h2:first-child]:mt-0 [&_ul]:my-2 [&_li]:my-1 [&_strong]:text-foreground">
              <ReactMarkdown>{aiReport}</ReactMarkdown>
              {aiBusy && (
                <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-violet-500 align-middle" />
              )}
            </article>
          )}
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