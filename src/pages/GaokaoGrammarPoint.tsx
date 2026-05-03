import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Eye, Lightbulb, Dumbbell, Target, ClipboardCheck, ChevronRight, Crown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { recordAttempt } from "@/lib/gaokaoMastery";
import {
  recordGrammarAttempt,
  loadGrammarMastery,
  LEVEL_META,
  ERROR_REASON_LABELS,
  type GrammarMastery,
  type GrammarErrorReason,
} from "@/lib/grammarFsrs";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import { toast } from "sonner";

type Point = {
  id: string;
  title: string;
  explanation: string;
  typical_example: string | null;
  common_mistake: string | null;
  exam_frequency: string | null;
  difficulty: number;
};

type Question = {
  id: string;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  irt_difficulty: number | null;
  question_type: string;
};

type Stage = "diagnose" | "notice" | "explain" | "practice" | "apply" | "reflect";

const STAGES: { id: Stage; label: string; icon: typeof Eye; sub: string }[] = [
  { id: "diagnose", label: "诊断", icon: Target, sub: "30 秒定位你的水平" },
  { id: "notice", label: "观察", icon: Eye, sub: "对比错例与正例" },
  { id: "explain", label: "拆解", icon: Lightbulb, sub: "公式 + 例句 + 易错点" },
  { id: "practice", label: "练习", icon: Dumbbell, sub: "由易到难混合题型" },
  { id: "apply", label: "应用", icon: ClipboardCheck, sub: "高考真题语境" },
  { id: "reflect", label: "复盘", icon: CheckCircle2, sub: "自评 + 安排复习" },
];

const REASONS: { key: GrammarErrorReason; emoji: string }[] = [
  { key: "rule_unknown", emoji: "📖" },
  { key: "confusion", emoji: "🔀" },
  { key: "careless", emoji: "💨" },
  { key: "vocab", emoji: "📚" },
  { key: "speed", emoji: "⏱" },
];

export default function GaokaoGrammarPoint() {
  const { slug } = useParams<{ slug: string }>();
  const [point, setPoint] = useState<Point | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [mastery, setMastery] = useState<GrammarMastery | null>(null);
  const [loading, setLoading] = useState(true);

  const [stage, setStage] = useState<Stage>("diagnose");
  const [diagIdx, setDiagIdx] = useState(0);
  const [diagPicks, setDiagPicks] = useState<{ qid: string; correct: boolean }[]>([]);
  const [diagPicked, setDiagPicked] = useState<string | null>(null);
  const [diagShowExp, setDiagShowExp] = useState(false);

  const [pracIdx, setPracIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [showExp, setShowExp] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [askReason, setAskReason] = useState(false);
  const [questionStartTs, setQuestionStartTs] = useState<number>(Date.now());
  const [confidence, setConfidence] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: pt } = await supabase
        .from("gaokao_grammar_points")
        .select("id, title, explanation, typical_example, common_mistake, exam_frequency, difficulty")
        .eq("slug", slug)
        .maybeSingle();
      if (!pt) { setLoading(false); return; }
      setPoint(pt as Point);
      const { data: qs } = await supabase
        .from("gaokao_grammar_questions")
        .select("id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, irt_difficulty, question_type")
        .eq("point_id", pt.id);
      // sort by IRT difficulty asc (easy → hard)
      const sorted = ((qs ?? []) as Question[]).sort(
        (a, b) => (a.irt_difficulty ?? 0) - (b.irt_difficulty ?? 0),
      );
      setAllQuestions(sorted);
      const ms = await loadGrammarMastery(pt.id);
      setMastery(ms);
      // returning users with progress: skip diagnose
      if (ms && (ms.correct_count + ms.wrong_count) >= 3) {
        setStage("notice");
      }
      setLoading(false);
    })();
  }, [slug]);

  // Diagnose questions = 3 easiest
  const diagQuestions = useMemo(() => allQuestions.slice(0, 3), [allQuestions]);
  // Practice questions = the rest, plus diag if too few
  const practiceQuestions = useMemo(() => {
    const rest = allQuestions.slice(3);
    return rest.length >= 3 ? rest : allQuestions;
  }, [allQuestions]);

  if (loading) return <p className="p-8 text-sm text-muted-foreground">加载中...</p>;
  if (!point) return <p className="p-8">考点不存在。<BackLink to="/gaokao/grammar" className="text-primary underline">返回</BackLink></p>;

  const stageIdx = STAGES.findIndex((s) => s.id === stage);
  const meta = LEVEL_META[mastery?.mastery_level ?? 0];
  const score = (mastery?.mastery_level ?? 0) / 4;
  const ringColor = score >= 0.85 ? "stroke-yellow-500" : score >= 0.6 ? "stroke-amber-500" : score >= 0.3 ? "stroke-emerald-500" : score >= 0.1 ? "stroke-sky-500" : "stroke-muted";

  // ----- Diagnose handlers -----
  const onDiagPick = (letter: string) => {
    if (diagPicked) return;
    const q = diagQuestions[diagIdx];
    setDiagPicked(letter);
    setDiagShowExp(true);
    setDiagPicks((prev) => [...prev, { qid: q.id, correct: letter === q.correct_answer }]);
  };
  const nextDiag = () => {
    setDiagPicked(null);
    setDiagShowExp(false);
    if (diagIdx + 1 >= diagQuestions.length) {
      const correct = [...diagPicks, { correct: diagPicked === diagQuestions[diagIdx].correct_answer }].filter((d: any) => d.correct).length;
      const total = diagQuestions.length;
      const acc = total ? correct / total : 0;
      // route based on diagnosis
      if (acc >= 0.85) {
        toast.success(`基础不错！${correct}/${total} 正确，跳到练习巩固。`);
        setStage("practice");
      } else if (acc >= 0.5) {
        toast.info(`部分掌握 ${correct}/${total}，先看核心拆解。`);
        setStage("explain");
      } else {
        toast(`基础薄弱 ${correct}/${total}，从对比例句开始。`);
        setStage("notice");
      }
    } else {
      setDiagIdx((i) => i + 1);
    }
  };

  // ----- Practice handlers -----
  const q = practiceQuestions[pracIdx];
  const options = q ? [["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d]] as const : [];

  const onPickPractice = async (letter: string) => {
    if (picked) return;
    setPicked(letter);
    setShowExp(true);
    const isCorrect = letter === q.correct_answer;
    setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), wrong: s.wrong + (isCorrect ? 0 : 1) }));
    if (!isCorrect) setAskReason(true);

    const latencyMs = Date.now() - questionStartTs;
    await recordAttempt({ questionType: "grammar", questionId: q.id, userAnswer: letter, isCorrect });
    const res = await recordGrammarAttempt({
      pointId: point.id,
      questionType: q.question_type || "multiple_choice",
      isCorrect,
      latencyMs,
      // wait for user-tagged reason if wrong; pass undefined for now
    });
    if (res?.justMastered) {
      toast.success("🏆 恭喜！本考点已掌握 (Master 级别)", { duration: 5000 });
    } else if (res) {
      const m = LEVEL_META[res.newLevel];
      setMastery((prev) =>
        prev
          ? { ...prev, mastery_level: res.newLevel, correct_count: prev.correct_count + (isCorrect ? 1 : 0), wrong_count: prev.wrong_count + (isCorrect ? 0 : 1) }
          : null,
      );
      if (isCorrect) toast(`${m.emoji} ${m.label} · ${res.intervalDays} 天后复习`, { duration: 2000 });
    }
  };

  const tagErrorReason = async (reason: GrammarErrorReason) => {
    setAskReason(false);
    // re-run record with reason (lightweight: store on next attempt; here we update matrix directly)
    const ms = await loadGrammarMastery(point.id);
    if (!ms) return;
    const matrix = ms.mastery_matrix || { types: {}, recent: [], errors: {} };
    matrix.errors = matrix.errors || {};
    matrix.errors[reason] = (matrix.errors[reason] || 0) + 1;
    await supabase.from("gaokao_user_mastery").update({ mastery_matrix: matrix }).eq("id", ms.id!);
    toast(`已标记: ${ERROR_REASON_LABELS[reason]} — 后续会针对性推题`);
  };

  const next = () => {
    setPicked(null);
    setShowExp(false);
    setAskReason(false);
    setQuestionStartTs(Date.now());
    if (pracIdx + 1 >= practiceQuestions.length) {
      setStage("apply");
    } else {
      setPracIdx((i) => i + 1);
    }
  };

  const reset = () => {
    setPracIdx(0); setPicked(null); setShowExp(false); setStats({ correct: 0, wrong: 0 });
    setStage("practice"); setQuestionStartTs(Date.now());
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8 pb-24">
      <BackLink to="/gaokao/grammar" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回语法地图
      </BackLink>
      <PageHeader title={point.title} hideReviewBanner />

      {/* ===== 顶部：掌握度 + 阶段进度 ===== */}
      <div className="mb-6 rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-4">
          <MasteryRing value={score} size={64} stroke={6} colorClass={ringColor}>
            <div className="text-2xl">{meta.emoji}</div>
          </MasteryRing>
          <div className="flex-1 min-w-0">
            <div className={`text-base font-bold ${meta.color}`}>{meta.label}</div>
            <div className="text-[11px] text-muted-foreground">
              累计 ✓{mastery?.correct_count ?? 0} · ✗{mastery?.wrong_count ?? 0}
              {mastery?.due_at && new Date(mastery.due_at).getTime() <= Date.now() && (
                <span className="ml-2 text-rose-600 font-bold">⚠ 已到复习时间</span>
              )}
            </div>
          </div>
          {(mastery?.mastery_level ?? 0) === 4 && <Crown className="size-7 text-yellow-500" />}
        </div>
        {/* Stage stepper */}
        <div className="mt-4 flex items-center gap-1 overflow-x-auto">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const active = s.id === stage;
            const done = i < stageIdx;
            return (
              <button
                key={s.id}
                onClick={() => setStage(s.id)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition ${
                  active ? "bg-primary text-primary-foreground" : done ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="size-3" /> {s.label}
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 text-[11px] text-muted-foreground">{STAGES[stageIdx]?.sub}</div>
      </div>

      {/* ===== Stage content ===== */}
      {stage === "diagnose" && (
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">🎯 快速诊断 · {diagIdx + 1}/{diagQuestions.length}</div>
            <h3 className="text-lg font-bold">3 道题定位你的起点</h3>
            <p className="text-xs text-muted-foreground mt-1">不是考试，目的是帮系统选最适合你的学习路径</p>
          </div>
          {diagQuestions[diagIdx] && (
            <>
              <p className="mb-4 text-base font-medium leading-relaxed">{diagQuestions[diagIdx].stem}</p>
              <div className="space-y-2">
                {(["A", "B", "C", "D"] as const).map((letter) => {
                  const text = (diagQuestions[diagIdx] as any)[`option_${letter.toLowerCase()}`];
                  const isPicked = diagPicked === letter;
                  const isAnswer = diagQuestions[diagIdx].correct_answer === letter;
                  let cls = "border-border hover:border-primary/40";
                  if (diagPicked) {
                    if (isAnswer) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
                    else if (isPicked) cls = "border-rose-500 bg-rose-50 dark:bg-rose-950/30";
                    else cls = "border-border opacity-60";
                  }
                  return (
                    <button key={letter} onClick={() => onDiagPick(letter)} disabled={!!diagPicked}
                      className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${cls}`}>
                      <span className="font-bold">{letter}.</span>
                      <span className="flex-1">{text}</span>
                      {diagPicked && isAnswer && <CheckCircle2 className="size-5 text-emerald-600" />}
                      {diagPicked && isPicked && !isAnswer && <XCircle className="size-5 text-rose-600" />}
                    </button>
                  );
                })}
              </div>
              {diagShowExp && (
                <div className="mt-4 rounded-xl bg-muted/50 p-4 text-sm">
                  <div className="mb-1 font-bold text-xs">解析</div>
                  <p className="text-muted-foreground text-[13px] leading-relaxed">{diagQuestions[diagIdx].explanation}</p>
                  <Button onClick={nextDiag} className="mt-3 w-full">
                    {diagIdx + 1 >= diagQuestions.length ? "查看诊断结果" : "下一题"}
                  </Button>
                </div>
              )}
            </>
          )}
          <div className="mt-4 text-center">
            <button onClick={() => setStage("notice")} className="text-xs text-muted-foreground hover:text-foreground underline">
              跳过诊断，直接学习 →
            </button>
          </div>
        </section>
      )}

      {stage === "notice" && (
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">👀 观察对比 · 先看，再总结规律</div>
          {point.common_mistake ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border-2 border-rose-300 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 p-4">
                <div className="text-xs font-bold text-rose-600 mb-2">❌ 常见错误</div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{point.common_mistake}</div>
              </div>
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900 p-4">
                <div className="text-xs font-bold text-emerald-600 mb-2">✅ 正确表达</div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{point.typical_example || "见下一阶段拆解"}</div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
              本考点暂无对比例句，请继续到"拆解"阶段。
            </div>
          )}
          <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs">
            💡 <strong>停一下：</strong>你能看出区别在哪里吗？带着这个问题进入下一步会更高效。
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setStage("diagnose")}>← 上一步</Button>
            <Button onClick={() => setStage("explain")} className="flex-1">下一步：看拆解 →</Button>
          </div>
        </section>
      )}

      {stage === "explain" && (
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">💡 拆解 · 公式 + 例句 + 易错点</div>
          <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold">
            <ReactMarkdown>{point.explanation}</ReactMarkdown>
          </article>
          {point.typical_example && (
            <div className="mt-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">📌 典型例句</div>
              <p className="text-sm whitespace-pre-wrap">{point.typical_example}</p>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setStage("notice")}>← 上一步</Button>
            <Button onClick={() => { setStage("practice"); setQuestionStartTs(Date.now()); }} className="flex-1">
              我懂了，开始练习 →
            </Button>
          </div>
        </section>
      )}

      {stage === "practice" && (
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-primary">🏋️ 练习 · {Math.min(pracIdx + 1, practiceQuestions.length)}/{practiceQuestions.length}</span>
            <span className="text-muted-foreground">本轮 ✓{stats.correct} · ✗{stats.wrong}</span>
          </div>
          {q ? (
            <>
              {/* Confidence pre-rating */}
              {!picked && confidence === null && (
                <div className="mb-3 rounded-xl bg-muted/40 p-3 text-xs">
                  <div className="mb-2 text-muted-foreground">看完题目，先评估你的把握 (元认知训练)：</div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <button key={n} onClick={() => setConfidence(n)}
                        className="flex-1 rounded-lg border bg-card px-2 py-1.5 hover:border-primary transition">
                        {n === 1 ? "🤔 不确定" : n === 2 ? "😐 一般" : "💪 很有把握"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="mb-4 text-base font-medium leading-relaxed">{q.stem}</p>
              <div className="space-y-2">
                {options.map(([letter, text]) => {
                  const isPicked = picked === letter;
                  const isAnswer = q.correct_answer === letter;
                  let cls = "border-border hover:border-primary/40";
                  if (picked) {
                    if (isAnswer) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
                    else if (isPicked) cls = "border-rose-500 bg-rose-50 dark:bg-rose-950/30";
                    else cls = "border-border opacity-60";
                  }
                  return (
                    <button key={letter} onClick={() => onPickPractice(letter)} disabled={!!picked}
                      className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${cls}`}>
                      <span className="font-bold">{letter}.</span>
                      <span className="flex-1">{text}</span>
                      {picked && isAnswer && <CheckCircle2 className="size-5 text-emerald-600" />}
                      {picked && isPicked && !isAnswer && <XCircle className="size-5 text-rose-600" />}
                    </button>
                  );
                })}
              </div>

              {askReason && (
                <div className="mt-4 rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3">
                  <div className="text-xs font-bold mb-2">📝 这道题为什么错？(帮系统给你推对的题)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {REASONS.map((r) => (
                      <button key={r.key} onClick={() => tagErrorReason(r.key)}
                        className="rounded-lg border bg-card px-2 py-1.5 text-[11px] hover:border-primary transition">
                        {r.emoji} {ERROR_REASON_LABELS[r.key]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showExp && (
                <div className="mt-4 rounded-xl bg-muted/50 p-4 text-sm">
                  <div className="mb-1 font-bold">
                    {picked === q.correct_answer ? "✓ 正确" : `✗ 正确答案: ${q.correct_answer}`}
                  </div>
                  <p className="text-muted-foreground text-[13px] leading-relaxed">{q.explanation}</p>
                  <Button onClick={() => { setConfidence(null); next(); }} className="mt-3 w-full">
                    {pracIdx + 1 >= practiceQuestions.length ? "完成练习 →" : "下一题"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">该考点暂无题目。</p>
          )}
        </section>
      )}

      {stage === "apply" && (
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">🎯 真题应用</div>
          <div className="rounded-xl bg-muted/30 p-4 text-sm">
            <p className="mb-3">本轮成绩：<strong className="text-emerald-600">{stats.correct}</strong> 对 / <strong className="text-rose-600">{stats.wrong}</strong> 错 ({practiceQuestions.length ? Math.round((stats.correct / practiceQuestions.length) * 100) : 0}%)</p>
            <p className="text-muted-foreground text-xs">
              建议接下来：在阅读训练中遇到本考点的句子时，会自动高亮提醒你。也可以做几道更难的混合题。
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={reset}><RotateCcw className="mr-1 size-4" /> 再练一轮</Button>
            <Button onClick={() => setStage("reflect")} className="flex-1">下一步：复盘 →</Button>
          </div>
        </section>
      )}

      {stage === "reflect" && (
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">📋 学完复盘</div>
          <div className="text-center py-4">
            <div className="text-4xl mb-2">{LEVEL_META[mastery?.mastery_level ?? 0].emoji}</div>
            <div className={`text-xl font-bold ${LEVEL_META[mastery?.mastery_level ?? 0].color}`}>
              当前等级：{LEVEL_META[mastery?.mastery_level ?? 0].label}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              累计 ✓{mastery?.correct_count ?? 0} · ✗{mastery?.wrong_count ?? 0}
              {mastery?.due_at && (
                <span className="block mt-1">
                  下次复习：{new Date(mastery.due_at).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                </span>
              )}
            </p>
          </div>
          {(mastery?.mastery_level ?? 0) < 4 && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs">
              💡 距离 👑 掌握级还需：
              <ul className="mt-1.5 ml-4 list-disc space-y-0.5 text-muted-foreground">
                {(mastery?.correct_count ?? 0) < 12 && <li>累计答对 {12 - (mastery?.correct_count ?? 0)} 题</li>}
                {(mastery?.stability ?? 0) < 21 && <li>记忆抗遗忘力达 21 天 (当前 {Math.round(mastery?.stability ?? 0)} 天)</li>}
                {!mastery?.reached_master_at && <li>间隔 ≥7 天后再次答对 (证明长期记住了)</li>}
              </ul>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" asChild className="flex-1"><BackLink to="/gaokao/grammar">返回地图</BackLink></Button>
            <Button onClick={reset} className="flex-1"><RotateCcw className="mr-1 size-4" /> 再练一轮</Button>
          </div>
        </section>
      )}
    </main>
  );
}
