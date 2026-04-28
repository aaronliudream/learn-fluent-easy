import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
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

const TEST_MINUTES = 25;
const SECTIONS: Section[] = ["vocab", "grammar", "reading", "listening"];
const QS_PER_SECTION = 6; // adaptive: shorter but more accurate
const TOTAL_QS = SECTIONS.length * QS_PER_SECTION; // 24
const SECTION_META: Record<Section, { cn: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  vocab: { cn: "词汇", icon: BookOpen, color: "bg-pink-500/15 text-pink-500" },
  grammar: { cn: "语法", icon: FileText, color: "bg-sky-500/15 text-sky-500" },
  reading: { cn: "阅读", icon: Languages, color: "bg-violet-500/15 text-violet-500" },
  listening: { cn: "听力", icon: Headphones, color: "bg-indigo-500/15 text-indigo-500" },
};

type Stage = "intro" | "test" | "result";

const fmtTime = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const Placement = () => {
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
  const [secondsLeft, setSecondsLeft] = useState(TEST_MINUTES * 60);
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

  // ---------------- INTRO ----------------
  if (stage === "intro") {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
        <PageHeader title="英语水平测试" subtitle="自适应难度 · 找到你真正的等级" back="/" />

        <div className="overflow-hidden rounded-3xl bg-grad-title p-7 text-white shadow-tile md:p-9">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <TrendingUp className="size-3.5" /> 自适应难度 · 参照 CEFR 标准
          </div>
          <h2 className="text-2xl font-extrabold md:text-3xl">英语水平定级测试</h2>
          <p className="mt-2 text-sm text-white/90 md:text-base">
            参照欧洲共同语言参考框架 (CEFR) 的 A1–C1 等级标准，
            通过自适应算法判断你的真实水平：答对升级，答错降级，
            用最少的题目得到最准确的结果。
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <Clock className="mb-1 size-5" />
              <div className="text-lg font-bold">≤ 25 分钟</div>
              <div className="text-[11px] text-white/80">限时</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <Target className="mb-1 size-5" />
              <div className="text-lg font-bold">{TOTAL_QS} 题</div>
              <div className="text-[11px] text-white/80">四模块自适应</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <Award className="mb-1 size-5" />
              <div className="text-lg font-bold">A1–C2</div>
              <div className="text-[11px] text-white/80">CEFR 全六级</div>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-3xl bg-card p-6 shadow-card md:p-8">
          <h3 className="text-lg font-bold">测试包含 4 个模块</h3>
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
                    <div className="font-bold">{m.cn}</div>
                    <div className="text-xs text-muted-foreground">{QS_PER_SECTION} 题 · 难度自动调节</div>
                  </div>
                </div>
              );
            })}
          </div>

          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> 独立题库 · 覆盖 A1 → C2 全六级，全部题目唯一不重复</li>
            <li className="flex items-start gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> 自适应难度：答对升一级，答错降一级，快速锁定真实水平</li>
            <li className="flex items-start gap-2"><Sparkles className="mt-0.5 size-4 shrink-0 text-primary" /> 完成后给出 CEFR 等级 + 推荐 LEVEL 1–6 的具体学习起点</li>
          </ul>

          <div className="mt-5 flex gap-3 rounded-2xl border border-border bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <strong className="text-foreground">关于"权威性"的说明：</strong>
              本测试为本平台的<strong>内部水平评估</strong>，依据 CEFR 公开等级描述设计，
              用于推荐合适的学习起点。它<strong>不是</strong>剑桥、雅思、托福、CEFR 官方认证考试，
              结果仅供学习参考，不可作为留学/求职的官方证明。
            </div>
          </div>

          <Button size="lg" className="mt-6 w-full" onClick={start}>
            开始测试 →
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            建议在安静环境中一次性完成，途中关闭页面会丢失进度
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
            <div className={`grid size-9 place-items-center rounded-xl ${meta.color}`}>
              <Icon className="size-4" />
            </div>
            <div>
              <div className="text-sm font-bold">{meta.cn} <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">L{q.level}</span></div>
              <div className="text-[11px] text-muted-foreground">第 {idx + 1} / {TOTAL_QS} 题</div>
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
              <Volume2 className="size-5" /> 播放音频
            </button>
          )}
          {q.section === "reading" && q.context && (
            <div className="mb-5 rounded-2xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed">
              {q.context}
            </div>
          )}

          <div className="mb-5">
            <p className="text-lg font-semibold">{q.prompt}</p>
            {q.section === "grammar" && q.context && (
              <p className="mt-1 text-xs text-muted-foreground">{q.context}</p>
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
                  <span>{opt}</span>
                  {active && <CheckCircle2 className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {picked === undefined ? "请选择一个答案" : "已记录答案，点击下方按钮继续"}
          </span>
          <span className="text-sm text-muted-foreground">已答 {answered} / {TOTAL_QS}</span>
          {isLast ? (
            <Button
              onClick={finish}
              disabled={picked === undefined}
              className="bg-emerald-600 hover:bg-emerald-600/90"
            >
              提交测试
            </Button>
          ) : (
            <Button onClick={goNext} disabled={picked === undefined}>
              下一题 →
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
        <PageHeader title="测试结果" subtitle="基于 CEFR 标准评估" back="/" />

        <div className="overflow-hidden rounded-3xl bg-grad-title p-8 text-center text-white shadow-tile md:p-10">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Award className="size-8" />
          </div>
          <div className="text-sm opacity-90">你的 CEFR 等级</div>
          <div className="mt-1 text-6xl font-black tracking-tight md:text-7xl">{result.cefr}</div>
          <div className="mt-2 text-base font-semibold">{desc.name}</div>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/90">{desc.tag}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="text-2xl font-extrabold">{result.ability.toFixed(1)}</div>
              <div className="text-[11px] text-white/80">能力估值 (1.0–4.5)</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="text-2xl font-extrabold">{result.weighted}</div>
              <div className="text-[11px] text-white/80">加权得分</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="text-2xl font-extrabold">{result.correct}/{result.total}</div>
              <div className="text-[11px] text-white/80">答对题数</div>
            </div>
          </div>
        </div>

        {/* Section breakdown */}
        <section className="mt-6 rounded-3xl bg-card p-6 shadow-card md:p-8">
          <h3 className="text-lg font-bold">分模块表现</h3>
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
                      <div className="font-bold">{m.cn}</div>
                      <div className="text-xs text-muted-foreground">{r.correct}/{r.total} 答对</div>
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

        {/* Recommendation */}
        <Link
          to={`/level/${result.recommendedLevel}`}
          className="mt-6 flex items-center gap-4 rounded-3xl border-2 border-primary/30 bg-primary/5 p-6 transition hover:bg-primary/10"
        >
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-7" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">为你推荐</div>
            <div className="mt-1 text-lg font-extrabold">从 LEVEL {result.recommendedLevel} 开始学习</div>
            <div className="text-sm text-muted-foreground">最适合你当前水平的起点</div>
          </div>
          <Ear className="size-5 text-primary" />
        </Link>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setStage("intro")}>
            重新测试
          </Button>
          <Button className="flex-1" onClick={() => navigate("/")}>
            返回首页
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