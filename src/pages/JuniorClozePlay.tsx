import { T } from "@/i18n/T";
import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, RotateCcw, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { recordMastery, loadMastery, MasteryRow, PASS_PCT } from "@/lib/masteryProgress";
import { bumpMistakeCorrect } from "@/lib/mistakeStreak";
import { toast } from "sonner";
import { celebrateScore } from "@/lib/feedback";
import { ExamPaper, ExamContainer, ExamCard, ExamOption, ExamProgress } from "@/components/exam/ExamPaper";

type Q = { q: string; options: string[]; answer: string; explanation?: string };
type C = { id: string; title: string; body: string; word_count: number | null; grade: number; questions: Q[] };

// 渲染解析里的 **加粗** 标记
function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-bold text-foreground">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export default function JuniorClozePlay() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  // 从单元闯关完形关进入时带 ?returnTo=<hub关URL>;有则返回出口回 Hub 关。
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [c, setC] = useState<C | null>(null);
  const [, setMastery] = useState<Record<string, MasteryRow>>({});
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(1);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from("junior_cloze")
        .select("id,title,body,word_count,grade,questions")
        .eq("id", id)
        .maybeSingle();
      setC(data as unknown as C);
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        setUserId(u.user.id);
        setMastery(await loadMastery("junior_cloze"));
      }
    })();
  }, [id]);

  const allAnswered = c ? c.questions.every((_, i) => picks[i]) : false;
  const correctCount = c ? c.questions.filter((q, i) => picks[i] === q.answer).length : 0;

  const pick = (qi: number, letter: string) => {
    if (!c || picks[qi]) return;
    setPicks((p) => ({ ...p, [qi]: letter }));
  };

  const handleSubmit = async () => {
    if (!c) return;
    if (!allAnswered) {
      toast.error("请先完成所有空");
      return;
    }
    setSubmitted(true);
    const pct = Math.round((correctCount / c.questions.length) * 100);
    if (userId) {
      const updated = await recordMastery({ module: "junior_cloze", itemId: c.id, pct });
      if (updated) setMastery((m) => ({ ...m, [c.id]: updated }));

      // 错题完整快照(自包含,不依赖题库表):整篇挖空正文 + 所有空(题干/选项) + 每空正确答案
      // + 学生每空作答 + 对错。提交这刻 c+picks 全在手边。一篇一条(onConflict 覆盖),
      // wrong_count=错空数(按空不按次)。不动判分/recordMastery,失败仅告警、绝不阻断做题。
      const wrongCount = c.questions.filter((q, i) => picks[i] !== q.answer).length;
      if (wrongCount > 0) {
        const LETTERS = ["A", "B", "C", "D", "E", "F"];
        const snapshot = {
          source: "cloze",
          title: c.title,
          body: c.body,
          grade: c.grade,
          questions: c.questions.map((q, i) => ({
            no: i + 1,
            stem: q.q,
            options: Object.fromEntries(q.options.map((opt, oi) => [LETTERS[oi] ?? String(oi), opt])),
            correct_answer: q.answer,
            user_answer: picks[i] ?? null,
            is_correct: picks[i] === q.answer,
            explanation: q.explanation ?? null,
          })),
          wrong_count: wrongCount,
        };
        const { error: snapErr } = await supabase.from("user_mistakes").upsert({
          user_id: userId,
          module: "junior_cloze",
          source_key: `junior_cloze_passage_${c.id}`,
          source_label: c.title,
          question: c.title ?? "",
          snapshot,
          wrong_count: wrongCount,
          is_resolved: false,
          correct_streak: 0,
          last_correct_date: null,
          last_wrong_at: new Date().toISOString(),
        }, { onConflict: "user_id,module,source_key" });
        if (snapErr) console.warn("[junior cloze mistake snapshot] upsert failed", snapErr);
      } else {
        // 本次全对 → 跨3天连对累计(唯一移出途径)
        await bumpMistakeCorrect("junior_cloze", `junior_cloze_passage_${c.id}`);
      }
    }
    celebrateScore(pct);
  };

  const retry = () => {
    setPicks({});
    setSubmitted(false);
    setAttempt((a) => a + 1);
  };

  if (!c)
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        <T>加载中…</T>
      </main>
    );

  const pct = Math.round((correctCount / c.questions.length) * 100);
  const passed = pct >= PASS_PCT;
  const progressStates = c.questions.map((q, i) => {
    const p = picks[i];
    if (!p) return "todo" as const;
    return p === q.answer ? ("correct" as const) : ("wrong" as const);
  });

  // 提交后从 Hub 单元关进入 → 极简完成态,回单元关。
  if (submitted && returnTo) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-card">
          <div className="text-4xl">{pct === 100 ? "🌟" : passed ? "✅" : "📝"}</div>
          <p className="mt-3 text-lg font-extrabold text-foreground">
            <T>完成！答对</T> {correctCount} / {c.questions.length} <T>空</T>
          </p>
          <div className="mt-5 flex gap-2">
            {pct < 100 && (
              <button onClick={retry} className="flex-1 rounded-xl border border-indigo-200 py-2.5 text-sm font-semibold text-indigo-600">
                <T>重做</T>
              </button>
            )}
            <Link
              to={returnTo}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white"
            >
              <T>返回单元</T> →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <ExamPaper className="pb-32">
      <ExamContainer max="7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b exam-divider">
          <BackLink to={returnTo ?? "/junior/reading"} className="inline-flex items-center gap-1.5 text-[13px] exam-soft hover:exam-ink transition">
            <ArrowLeft className="size-4" /> <T>{returnTo ? "返回单元" : "返回"}</T>
          </BackLink>
          <div className="flex items-center gap-3">
            <ExamProgress states={progressStates} label={`${progressStates.filter((s) => s !== "todo").length} / ${c.questions.length}`} />
            {attempt > 1 && (
              <span className="exam-skill-tag">
                <T>第</T> {attempt} <T>次</T>
              </span>
            )}
          </div>
        </div>

        <header className="mb-8">
          <div className="exam-eyebrow mb-2">
            <T>初中英语 · 完形填空</T>
          </div>
          <h1 className="exam-display text-[clamp(24px,3.2vw,36px)] leading-[1.1]">{c.title}</h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10 items-start">
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto exam-passage-scroll">
            <article className="exam-card p-6 sm:p-8">
              <div className="exam-eyebrow mb-3">
                <T>Passage 短文（含编号空格）</T>
              </div>
              {/* 顶部大标题已显示篇名,此处不再重复;正文调大字号+行距便于阅读。 */}
              <div className="exam-passage whitespace-pre-wrap text-[17px] leading-[1.9]">{c.body}</div>
            </article>
          </div>
          <div>
            <div className="space-y-5">
              {c.questions.map((q, i) => {
                const picked = picks[i];
                const isCorrect = picked === q.answer;
                return (
                  <ExamCard key={i}>
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                      <span className="exam-q-num">空 {String(i + 1).padStart(2, "0")}</span>
                      <span className="exam-skill-tag">
                        <T>完形填空</T>
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {q.options.map((opt, oi) => {
                        const L = ["A", "B", "C", "D"][oi] as "A" | "B" | "C" | "D";
                        let state: "idle" | "selected" | "correct" | "wrong" | "dim" = "idle";
                        if (picked) {
                          if (L === q.answer) state = "correct";
                          else if (picked === L) state = "wrong";
                          else state = "dim";
                        }
                        return <ExamOption key={L} letter={L} text={opt} state={state} disabled={!!picked} onClick={() => pick(i, L)} />;
                      })}
                    </div>
                    {picked && (
                      <div className={cn("exam-feedback", isCorrect ? "exam-feedback-correct" : "exam-feedback-wrong")}>
                        <span className="exam-fb-label">{isCorrect ? "✓ Correct" : `✗ Answer: ${q.answer}`}</span>
                        {q.explanation && <div className="text-[13.5px] leading-relaxed exam-soft">{renderBold(q.explanation)}</div>}
                      </div>
                    )}
                  </ExamCard>
                );
              })}
            </div>

            <div className="mt-6 exam-card p-5">
              {!submitted ? (
                <button onClick={handleSubmit} disabled={!allAnswered} className="exam-btn exam-btn-primary w-full">
                  <T>提交 (</T>
                  {correctCount}/{c.questions.length})
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="exam-display text-[18px]">
                    <T>得分：</T>
                    {correctCount}/{c.questions.length}
                  </div>
                  <div
                    className={cn("exam-feedback", pct === 100 && "exam-feedback-correct")}
                    style={pct < 100 ? { borderLeftColor: "hsl(var(--exam-gold))", background: "hsl(var(--exam-gold-soft))" } : undefined}
                  >
                    {pct === 100 ? <T>🌟 全对！完美完形</T> : passed ? <T>✅ 通过 · 看每空解析巩固</T> : <T>❌ 再练一次,逐空看解析</T>}
                  </div>
                  <div className="flex gap-2">
                    {pct < 100 && (
                      <button onClick={retry} className="exam-btn exam-btn-ghost flex-1">
                        <RotateCcw className="size-4" /> <T>重做</T>
                      </button>
                    )}
                    {returnTo && (
                      <button onClick={() => nav(returnTo)} className="exam-btn exam-btn-primary flex-1">
                        <T>返回单元</T> <ChevronRight className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ExamContainer>
    </ExamPaper>
  );
}
