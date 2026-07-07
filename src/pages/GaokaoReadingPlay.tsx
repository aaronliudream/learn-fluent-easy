import { T } from "@/i18n/T";import { useEffect, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { GuestBanner } from "@/components/GuestBanner";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { recordAttempt } from "@/lib/gaokaoMastery";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { awardForCorrect, notifyWrong, awardForBlock } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { ExamPaper, ExamContainer, ExamCard, ExamOption, ExamProgress } from "@/components/exam/ExamPaper";

type Passage = {id: string;title: string;body: string;structure_analysis: string | null;};
type Question = {
  id: string;
  stem: string;
  option_a: string;option_b: string;option_c: string;option_d: string;
  correct_answer: string;
  explanation_a: string | null;explanation_b: string | null;explanation_c: string | null;explanation_d: string | null;
  question_type: string;
};

const TYPE_LABEL: Record<string, string> = {
  main_idea: "主旨题", detail: "细节题", inference: "推断题", vocabulary: "词义题"
};

export default function GaokaoReadingPlay() {
  const { id } = useParams<{id: string;}>();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Full-test lock: AI may only discuss the reading once every question is answered.
  const allAnswered = questions.length > 0 && questions.every((q) => picks[q.id]);
  useRegisterAssistant(
    passage ?
    {
      context: "gaokao_reading",
      ref: passage.id,
      topic: `高考阅读 · ${passage.title}`,
      mode: "full-test",
      unlocked: allAnswered,
      lockedHint: "请先做完本篇所有阅读题再来找我哦，避免提前看到答案 ✨",
      pageTitle: "💬 小月 · 阅读复盘",
      snapshot: allAnswered ?
      {
        title: passage.title,
        passage_excerpt: passage.body.slice(0, 1200),
        questions: questions.map((q) => ({
          id: q.id,
          type: q.question_type,
          stem: q.stem,
          options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
          correct_answer: q.correct_answer,
          user_answer: picks[q.id],
          is_correct: picks[q.id] === q.correct_answer
        }))
      } :
      undefined
    } :
    null
  );

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: p }, { data: qs }] = await Promise.all([
      supabase.from("gaokao_reading_passages").select("id, title, body, structure_analysis").eq("id", id).maybeSingle(),
      supabase.from("gaokao_reading_questions").select("*").eq("passage_id", id).order("sort_order")]
      );
      setPassage(p);
      setQuestions((qs ?? []) as Question[]);
      setLoading(false);
    })();
  }, [id]);

  const qStartRef = useRef<Record<string, number>>({});
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (celebratedRef.current) return;
    if (questions.length === 0) return;
    const answered = questions.filter((q) => picks[q.id]).length;
    if (answered < questions.length) return;
    celebratedRef.current = true;
    const correct = questions.filter((q) => picks[q.id] === q.correct_answer).length;
    celebrateScore(Math.round(correct / questions.length * 100));

    // 错题完整快照(自包含,不依赖题库表):整篇原文 + 全题(题干/选项) + 每题正确答案 + 学生每题作答 + 对错。
    // 比照初中阅读;高中阅读无提交按钮,故在"全题答完"这次一次性写入。提交这刻 passage+questions+picks 全在手边。
    // 一篇一条(onConflict 覆盖),wrong_count=错题数(按题不按次)。题库重灌换 id 不影响此快照。
    // 不动判分/onPick/gaokao_user_attempts/recordUnifiedAttempt,失败仅告警、绝不阻断做题。
    if (passage) {
      const wrongCount = questions.filter((q) => picks[q.id] !== q.correct_answer).length;
      if (wrongCount > 0) {
        const explOf = (q: Question) => {
          const m: Record<string, string | null> = {
            A: q.explanation_a, B: q.explanation_b, C: q.explanation_c, D: q.explanation_d,
          };
          return m[q.correct_answer] ?? null;   // 存正确项解析(每选项解析里最有用的一条)
        };
        const snapshot = {
          source: "reading",
          title: passage.title,
          body: passage.body,
          questions: questions.map((q, i) => ({
            no: i + 1,
            stem: q.stem,
            options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
            correct_answer: q.correct_answer,
            user_answer: picks[q.id] ?? null,
            is_correct: picks[q.id] === q.correct_answer,
            explanation: explOf(q),
          })),
          wrong_count: wrongCount,
        };
        (async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;   // 游客不写
            const { error } = await supabase.from("user_mistakes").upsert({
              user_id: user.id,
              module: "reading",
              source_key: `gaokao_reading_passage_${passage.id}`,
              source_label: passage.title,
              question: passage.title ?? "",
              snapshot,
              wrong_count: wrongCount,
              is_resolved: false,
              last_wrong_at: new Date().toISOString(),
            }, { onConflict: "user_id,module,source_key" });
            if (error) console.warn("[gaokao reading mistake snapshot] upsert failed", error);
          } catch (e) {
            console.warn("[gaokao reading mistake snapshot] error", e);
          }
        })();
      }
    }
  }, [picks, questions, passage]);
  const onPick = async (q: Question, letter: string) => {
    if (picks[q.id]) return;
    const ms = Date.now() - (qStartRef.current[q.id] ?? Date.now());
    qStartRef.current[q.id] = Date.now();
    setPicks((prev) => ({ ...prev, [q.id]: letter }));
    const ok = letter === q.correct_answer;
    if (ok) {
      const next = streak + 1;
      setStreak(next);
      await awardForCorrect(next, "gaokao_reading", q.id, "gaokao_reading", ms);
      await bumpPetSkill("reading_owl", 1);
      const cc = correctCount + 1;
      setCorrectCount(cc);
      if (cc % 5 === 0) await awardForBlock("gaokao_reading");
    } else {
      setStreak(0);
      notifyWrong();
    }
    await recordAttempt({
      questionType: "reading",
      questionId: q.id,
      userAnswer: letter,
      isCorrect: ok
    });
    if (!ok) {
      supabase.functions.invoke("classify-mistake-cause", {
        body: {
          question_text: q.stem,
          correct_answer: q.correct_answer,
          user_answer: letter,
          time_spent_seconds: Math.round(ms / 1000),
          kp_id: (q as any).point_id || null,
          skill_area: "reading",
        },
      }).catch((e) => console.error("classify-mistake-cause failed:", e));
    }
    recordUnifiedAttempt({
      stage: "senior",
      grade: 10,
      module: "reading",
      item_type: "reading_question",
      item_id: q.id,
      item_label: passage?.title,
      is_correct: ok,
      user_answer: letter,
      correct_answer: q.correct_answer,
      context: { passage_id: passage?.id, qtype: q.question_type }
    }).catch(() => {});
  };

  if (loading) return <p className="p-8 text-sm text-muted-foreground"><T>加载中...</T></p>;
  if (!passage) return <p className="p-8"><T>文章不存在。</T><BackLink to="/gaokao/reading" className="text-primary underline"><T>返回</T></BackLink></p>;

  const progressStates = questions.map((q) => {
    const pick = picks[q.id];
    if (!pick) return "todo" as const;
    return pick === q.correct_answer ? ("correct" as const) : ("wrong" as const);
  });

  return (
    <ExamPaper>
      <ExamContainer max="7xl">
        <GuestBanner />

        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-4 pb-4 border-b exam-divider">
          <BackLink to="/gaokao/reading" className="inline-flex items-center gap-1.5 text-[13px] exam-soft hover:exam-ink transition">
            <ArrowLeft className="size-4" /> <T>返回阅读列表</T>
          </BackLink>
          <ExamProgress
            states={progressStates}
            label={`${progressStates.filter((s) => s !== "todo").length} / ${questions.length}`}
          />
        </div>

        {/* Title block */}
        <header className="mb-8">
          <div className="exam-eyebrow mb-2"><T>高考英语 · 阅读理解</T></div>
          <h1 className="exam-display text-[clamp(28px,4vw,44px)] leading-[1.1]">
            {passage.title}
          </h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10 items-start">
          {/* PASSAGE */}
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto exam-passage-scroll">
            <article className="exam-card p-7 sm:p-9">
              <div className="exam-eyebrow mb-2"><T>Passage 阅读材料</T></div>
              <div className="exam-passage-title">{passage.title}</div>
              <div className="exam-passage">
                {passage.body.split("\n\n").map((para, i) => (
                  <p key={i}>
                    <span className="exam-para-num">{i + 1}</span>
                    {para}
                  </p>
                ))}
              </div>

              {passage.structure_analysis && (
                <details
                  className="mt-6 pt-5 border-t exam-divider"
                  onToggle={(e) => setShowAnalysis((e.target as HTMLDetailsElement).open)}
                >
                  <summary className="cursor-pointer text-[13px] font-semibold exam-soft hover:exam-ink">
                    <span className="exam-eyebrow mr-2">▸</span>
                    {showAnalysis ? "收起" : "展开"}<T>文章结构分析</T>
                  </summary>
                  <div className="prose prose-sm mt-3 max-w-none">
                    <ReactMarkdown>{passage.structure_analysis}</ReactMarkdown>
                  </div>
                </details>
              )}
            </article>
          </div>

          {/* QUESTIONS */}
          <div className="space-y-5">
            {questions.map((q, i) => {
              const picked = picks[q.id];
              const explanations: Record<string, string | null> = {
                A: q.explanation_a, B: q.explanation_b, C: q.explanation_c, D: q.explanation_d
              };
              const isCorrect = picked === q.correct_answer;
              return (
                <ExamCard key={q.id}>
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    <span className="exam-q-num">No. {String(i + 1).padStart(2, "0")}</span>
                    <span className="exam-skill-tag">{TYPE_LABEL[q.question_type] ?? q.question_type}</span>
                  </div>
                  <p className="exam-stem mb-5">{q.stem}</p>
                  <div className="flex flex-col gap-2.5">
                    {(["A", "B", "C", "D"] as const).map((letter) => {
                      const text = (q as any)[`option_${letter.toLowerCase()}`];
                      let state: "idle" | "selected" | "correct" | "wrong" | "dim" = "idle";
                      if (picked) {
                        if (q.correct_answer === letter) state = "correct";
                        else if (picked === letter) state = "wrong";
                        else state = "dim";
                      }
                      return (
                        <ExamOption
                          key={letter}
                          letter={letter}
                          text={text}
                          state={state}
                          onClick={() => onPick(q, letter)}
                          disabled={!!picked}
                        />
                      );
                    })}
                  </div>

                  {picked && (
                    <div className={`exam-feedback ${isCorrect ? "exam-feedback-correct" : "exam-feedback-wrong"}`}>
                      <div className="exam-display text-[16px] mb-2" style={{
                        color: isCorrect ? "hsl(var(--exam-green))" : "hsl(var(--exam-accent))"
                      }}>
                        {isCorrect ? "✓ Correct" : "✗ Not quite"}
                        <span className="ml-2 text-[13px] exam-mute font-normal exam-body-italic">
                          正确答案：{q.correct_answer}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {(["A", "B", "C", "D"] as const).map((l) =>
                          explanations[l] ? (
                            <div key={l} className="text-[13px] leading-relaxed exam-soft">
                              <span className="exam-display-italic mr-1.5" style={{
                                color: l === q.correct_answer ? "hsl(var(--exam-green))" : "hsl(var(--exam-ink-mute))"
                              }}>{l}.</span>
                              {explanations[l]}
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </ExamCard>
              );
            })}

            {/* Footer nav */}
            <div className="mt-10 pt-6 border-t exam-divider flex flex-wrap gap-2 justify-center">
              <BackLink to="/gaokao/reading" className="exam-btn exam-btn-primary">
                <ArrowLeft className="size-4" /> <T>返回阅读列表</T>
              </BackLink>
              <Link to="/gaokao" className="exam-btn exam-btn-ghost"><T>高考首页</T></Link>
            </div>
          </div>
        </div>
      </ExamContainer>
    </ExamPaper>);

}