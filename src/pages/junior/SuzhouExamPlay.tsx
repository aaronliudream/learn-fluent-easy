import { T } from "@/i18n/T";
import { useCallback, useEffect, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, LayoutGrid, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { celebrateScore } from "@/lib/feedback";
import NoCopyGuard from "@/components/NoCopyGuard";
import { getExam, type ExamQuestion } from "@/data/exams";
import {
  type ExamMode,
  SECTION_META,
  MODE_LABELS,
  groupQuestionsBySection,
  examAutoScore,
  sectionScore,
  checkCorrect,
  isAutoGraded,
  questionNum,
  formatTimer,
} from "@/lib/suzhouExamUtils";
import { ExamPaper as ExamPaperShell, ExamContainer, ExamCard, ExamProgress } from "@/components/exam/ExamPaper";
import { DiagnosisTable } from "@/components/exam/DiagnosisExtras";
import QuestionRenderer from "@/components/exam/QuestionRenderer";
import { PassageWithBlanks, MusicFestivalPoster, AnswerSheet } from "@/components/exam/SuzhouExamParts";
import { supabase } from "@/integrations/supabase/client";

const VALID_MODES: ExamMode[] = ["exam", "practice", "review"];

function buildBlankMap(questions: ExamQuestion[]): Record<number, string> {
  const map: Record<number, string> = {};
  for (const q of questions) {
    map[questionNum(q.id)] = q.id;
  }
  return map;
}

function InlineExplanation({ q, userAnswer }: { q: ExamQuestion; userAnswer: string }) {
  const ok = checkCorrect(q, userAnswer);
  return (
    <ExamCard>
      <div data-qid={q.id}>
        <div className="mb-2 flex items-center gap-2">
          <span className="exam-q-num">No. {String(questionNum(q.id)).padStart(2, "0")}</span>
          <span className="exam-skill-tag">{q.knowledge_point}</span>
        </div>
        <div className="exam-explanation rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4 border-l-4 border-amber-400">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
            {ok ? <CheckCircle2 className="size-4 text-emerald-500" /> : <XCircle className="size-4 text-rose-500" />}
            <span><T>正确答案：</T>{q.answer}</span>
            <span className="text-xs text-muted-foreground font-normal"><T>你的答案：</T>{userAnswer || "未作答"}</span>
          </div>
          <div className="mt-2 text-sm leading-relaxed whitespace-pre-line exam-soft">{q.explanation}</div>
        </div>
      </div>
    </ExamCard>
  );
}

export default function SuzhouExamPlay() {
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode") as ExamMode | null;
  const exam = examId ? getExam(examId) : undefined;

  const mode: ExamMode | null = modeParam && VALID_MODES.includes(modeParam) ? modeParam : null;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [remainingSec, setRemainingSec] = useState(exam?.duration_seconds ?? 6000);
  const [currentQid, setCurrentQid] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [aiGrading, setAiGrading] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exam || mode !== "review") return;
    const prefilled: Record<string, string> = {};
    for (const q of exam.questions) {
      if (q.type === "multiple_choice" || q.type === "letter_choice") {
        prefilled[q.id] = q.answer.toUpperCase();
      } else if (isAutoGraded(q)) {
        prefilled[q.id] = q.answer;
      }
    }
    setAnswers(prefilled);
    setSubmitted(true);
  }, [exam, mode]);

  useEffect(() => {
    if (mode !== "exam" || submitted || !exam) return;
    if (remainingSec <= 0) {
      setSubmitted(true);
      toast.warning("考试时间到，已自动提交");
      return;
    }
    const t = setInterval(() => setRemainingSec((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [mode, submitted, remainingSec, exam]);

  /** IntersectionObserver：threshold 0.5，追踪当前视窗内题目 */
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const nodes = root.querySelectorAll("[data-qid]");
    if (!nodes.length) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.qid;
          if (!id) continue;
          if (entry.isIntersecting) visible.set(id, entry.intersectionRatio);
          else visible.delete(id);
        }
        if (visible.size === 0) return;
        let bestId: string | null = null;
        let bestRatio = 0;
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestId) setCurrentQid(bestId);
      },
      { root: null, threshold: 0.5 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [exam, submitted, answers]);

  const setAnswer = useCallback((qid: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  }, []);

  if (!exam) {
    return (
      <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        <T>试卷未找到</T>
      </main>
    );
  }

  if (!mode) {
    return <Navigate to={`/junior/suzhou/${exam.id}/mode`} replace />;
  }

  const sections = groupQuestionsBySection(exam);
  const autoScore = examAutoScore(exam, answers);
  const pct = autoScore.max ? Math.round((autoScore.earned / autoScore.max) * 100) : 0;

  const showExplanationFor = (q: ExamQuestion) => {
    if (mode === "review") return true;
    if (mode === "exam") return submitted;
    return !!answers[q.id]?.trim();
  };

  const inputsDisabled = mode === "review" || (mode === "exam" && submitted);

  const allRequiredAnswered = exam.questions.every((q) => {
    if (mode === "review") return true;
    return !!answers[q.id]?.trim();
  });

  const progressStates = exam.questions.map((q) => {
    const a = answers[q.id];
    if (!a?.trim()) return "todo" as const;
    if (!showExplanationFor(q)) return "answered" as const;
    const ok = checkCorrect(q, a);
    if (ok === null) return "answered" as const;
    return ok ? ("correct" as const) : ("wrong" as const);
  });

  const handleSubmit = () => {
    if (!allRequiredAnswered) {
      toast.error("请先完成所有题目");
      return;
    }
    setSubmitted(true);
    celebrateScore(pct);
    toast.success(`客观题得分 ${autoScore.earned}/${autoScore.max}`);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setRemainingSec(exam.duration_seconds);
  };

  const jumpToQuestion = (qid: string) => {
    document.querySelector(`[data-qid="${qid}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setSheetOpen(false);
  };

  const askAiGrade = async (q: ExamQuestion) => {
    const userAns = answers[q.id] ?? "";
    if (!userAns.trim()) {
      toast.error("请先填写答案");
      return;
    }
    setAiGrading(q.id);
    try {
      const { data, error } = await supabase.functions.invoke("tutor-chat", {
        body: {
          messages: [{ role: "user", content: `请点评我的答案（${q.stem}）\n\n我的答案：${userAns}\n\n参考答案：${q.answer}` }],
          context: "general",
        },
      });
      if (error) throw error;
      const reply = (data as { reply?: string })?.reply ?? "AI 暂时无法点评，请稍后再试";
      toast.message("AI 点评", { description: reply.slice(0, 200) });
    } catch {
      toast.error("AI 点评请求失败");
    } finally {
      setAiGrading(null);
    }
  };

  const sheetGroups = sections.map((g) => ({
    section: g.section,
    label: SECTION_META[g.section].title.split("·")[0]?.trim() ?? g.section,
    questions: g.questions.map((q) => ({ id: q.id, num: questionNum(q.id) })),
  }));

  const renderSectionPassage = (sectionKey: string, questions: ExamQuestion[]) => {
    const passage = exam.passages[sectionKey];
    if (!passage) return null;

    if (sectionKey === "cloze") {
      const qMap = Object.fromEntries(questions.map((q) => [q.id, q]));
      return (
        <ExamCard className="mb-6">
          <div className="exam-eyebrow mb-2"><T>完形填空 · 阅读材料</T></div>
          <PassageWithBlanks
            text={passage}
            blankIds={buildBlankMap(questions)}
            answers={answers}
            onChange={setAnswer}
            disabled={inputsDisabled}
            inputType="select"
            getSelectOptions={(qid) => qMap[qid]?.options ?? {}}
          />
          <div className="mt-4 space-y-2 border-t exam-divider pt-4">
            {questions.map((q) => (
              <div key={q.id} className="text-sm exam-soft">
                <strong>{questionNum(q.id)}.</strong>{" "}
                {q.options && Object.entries(q.options).map(([k, v]) => `${k}. ${v}`).join("  ")}
              </div>
            ))}
          </div>
        </ExamCard>
      );
    }

    if (sectionKey === "restore") {
      const opts = (exam.resources?.restore_options ?? {}) as Record<string, string>;
      return (
        <ExamCard className="mb-6">
          <div className="exam-eyebrow mb-2"><T>信息还原 · 阅读材料</T></div>
          <PassageWithBlanks
            text={passage}
            blankIds={buildBlankMap(questions)}
            answers={answers}
            onChange={setAnswer}
            disabled={inputsDisabled}
            inputType="select"
            selectOptions={opts}
          />
          <div className="mt-4 pt-4 border-t exam-divider space-y-1 text-sm exam-soft">
            {Object.entries(opts).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => (
              <div key={k}><strong>{k}.</strong> {v}</div>
            ))}
          </div>
        </ExamCard>
      );
    }

    if (sectionKey === "vocab_bank") {
      const bank = (exam.resources?.word_bank ?? []) as string[];
      return (
        <ExamCard className="mb-6">
          <div className="exam-eyebrow mb-2"><T>词库</T></div>
          <div className="mb-4 flex flex-wrap gap-2">
            {bank.map((w) => (
              <span key={w} className="exam-vocab-chip">{w}</span>
            ))}
          </div>
          <PassageWithBlanks
            text={passage}
            blankIds={buildBlankMap(questions)}
            answers={answers}
            onChange={setAnswer}
            disabled={inputsDisabled}
          />
        </ExamCard>
      );
    }

    if (sectionKey === "passage_fill") {
      return (
        <ExamCard className="mb-6">
          <div className="exam-eyebrow mb-2"><T>短文填空 · 阅读材料</T></div>
          <PassageWithBlanks
            text={passage}
            blankIds={buildBlankMap(questions)}
            answers={answers}
            onChange={setAnswer}
            disabled={inputsDisabled}
          />
        </ExamCard>
      );
    }

    if (sectionKey === "response") {
      return (
        <ExamCard className="mb-6">
          <div className="exam-eyebrow mb-2"><T>阅读表达 · 阅读材料</T></div>
          <div className="exam-passage whitespace-pre-wrap">{passage}</div>
        </ExamCard>
      );
    }

    return (
      <ExamCard className="mb-6">
        <div className="exam-passage whitespace-pre-wrap">{passage}</div>
      </ExamCard>
    );
  };

  return (
    <ExamPaperShell className="pb-28">
      <NoCopyGuard />
      <ExamContainer max="7xl">
        {/* 粘性顶栏 */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-3 mb-4 bg-[hsl(var(--exam-paper))]/95 backdrop-blur border-b exam-divider">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BackLink
              to={`/junior/suzhou/${exam.id}/mode`}
              className="inline-flex items-center gap-1.5 text-[13px] exam-soft hover:text-[hsl(var(--exam-ink))]">
              <ArrowLeft className="size-4" /> <T>换模式</T>
            </BackLink>
            <div className="flex flex-wrap items-center gap-3">
              <span className="exam-skill-tag">{MODE_LABELS[mode]}</span>
              {mode === "exam" && !submitted && (
                <span className={cn("exam-timer flex items-center gap-1 text-sm font-bold", remainingSec < 600 && "text-rose-600")}>
                  <Clock className="size-4" /> {formatTimer(remainingSec)}
                </span>
              )}
              <ExamProgress
                states={progressStates}
                label={`${progressStates.filter((s) => s !== "todo").length}/${exam.questions.length}`}
              />
              {mode !== "review" && !submitted && (
                <button type="button" className="exam-btn exam-btn-primary h-9 px-4" onClick={handleSubmit}>
                  <CheckCircle2 className="size-4" /> <T>提交</T>
                </button>
              )}
              {submitted && mode !== "review" && (
                <button type="button" className="exam-btn exam-btn-ghost h-9 px-3" onClick={handleRetry}>
                  <RotateCcw className="size-4" /> <T>重做</T>
                </button>
              )}
            </div>
          </div>
        </div>

        <header className="mb-6">
          <div className="exam-eyebrow mb-2"><T>苏州中考英语真题</T></div>
          <h1 className="exam-display text-[clamp(22px,3vw,32px)] leading-tight">{exam.title}</h1>
        </header>

        {/* 总分卡片 */}
        {(submitted || mode === "review" || (mode === "practice" && Object.keys(answers).length > 0)) && (
          <div className="mb-8 exam-card p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-sm exam-mute"><T>客观题得分</T></div>
                <div className="exam-display text-4xl font-extrabold text-amber-700 dark:text-amber-300">
                  {autoScore.earned}<span className="text-xl opacity-60">/{autoScore.max}</span>
                </div>
                <div className="text-sm exam-soft mt-1">
                  {autoScore.correct}/{autoScore.total} <T>题正确 ·</T> {pct}%
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {sections.filter((s) => s.questions.some(isAutoGraded)).map((g) => {
                  const sc = sectionScore(g.questions.filter(isAutoGraded), answers);
                  return (
                    <div key={g.section} className="rounded-lg bg-white/60 dark:bg-black/20 px-3 py-2">
                      <div className="exam-mute truncate">{SECTION_META[g.section].title.split("·")[0]?.trim()}</div>
                      <div className="font-bold">{sc.earned}/{sc.max}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {submitted && (
          <div className="mb-8">
            <DiagnosisTable
              rows={exam.questions.filter(isAutoGraded).map((q) => ({
                index: questionNum(q.id),
                point: q.knowledge_point,
                isCorrect: checkCorrect(q, answers[q.id]) === true,
                trap: checkCorrect(q, answers[q.id]) === false ? "知识盲区" : null,
              }))}
              subtitle="各题考点对错一览（仅客观题）"
            />
          </div>
        )}

        <div ref={containerRef} className="grid gap-8 lg:grid-cols-[1fr_240px] items-start">
          <div className="space-y-10 min-w-0">
            {sections.map(({ section, questions }) => {
              const meta = SECTION_META[section];
              const passageKey =
                section === "reading" ? null :
                section === "writing" ? null :
                section;

              return (
                <section key={section} id={`section-${section}`}>
                  <div className="mb-4">
                    <h2 className="exam-display text-xl">{meta.title}</h2>
                    <p className="mt-1 text-[13px] exam-soft">{meta.instruction}</p>
                    <p className="text-[12px] exam-mute">{meta.scoreLabel}</p>
                  </div>

                  {section === "reading" && (
                    <ExamCard className="mb-6">
                      <div className="exam-eyebrow mb-2"><T>Passage A · Music Festival</T></div>
                      <MusicFestivalPoster data={(exam.resources?.poster_A ?? {}) as Record<string, unknown>} />
                    </ExamCard>
                  )}

                  {passageKey && renderSectionPassage(passageKey, questions)}

                  {section === "reading" && ["reading_B", "reading_C", "reading_D"].map((key) => (
                    exam.passages[key] && (
                      <ExamCard key={key} className="mb-6">
                        <div className="exam-eyebrow mb-2">{key.replace("reading_", "Passage ")}</div>
                        <div className="exam-passage whitespace-pre-wrap">{exam.passages[key]}</div>
                      </ExamCard>
                    )
                  ))}

                  {section === "writing" && exam.resources?.writing_prompt && (
                    <ExamCard className="mb-6">
                      <div className="exam-eyebrow mb-2"><T>书面表达 · 题目要求</T></div>
                      {(() => {
                        const wp = exam.resources!.writing_prompt as Record<string, unknown>;
                        return (
                          <div className="space-y-2 text-sm exam-soft">
                            <div className="font-bold text-base exam-display">{String(wp.title)}</div>
                            <ul className="list-decimal list-inside">
                              {(wp.requirements as string[] ?? []).map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                            <p className="text-xs exam-mute">{String(wp.notes)}</p>
                            <p className="italic exam-passage">{String(wp.opening)}</p>
                          </div>
                        );
                      })()}
                    </ExamCard>
                  )}

                  <div className="space-y-5">
                    {questions.map((q) => {
                      const num = questionNum(q.id);
                      const isInlineSection =
                        section === "cloze" || section === "restore" ||
                        section === "vocab_bank" || section === "passage_fill";

                      if (isInlineSection) {
                        if (!showExplanationFor(q)) return null;
                        return <InlineExplanation key={q.id} q={q} userAnswer={answers[q.id] ?? ""} />;
                      }

                      return (
                        <ExamCard key={q.id}>
                          <QuestionRenderer
                            question={q}
                            qNum={num}
                            mode={mode}
                            submitted={submitted}
                            value={answers[q.id] ?? ""}
                            onChange={(v) => setAnswer(q.id, v)}
                            showExplanation={showExplanationFor(q)}
                          />
                          {!isAutoGraded(q) && showExplanationFor(q) && answers[q.id]?.trim() && (
                            <button
                              type="button"
                              disabled={aiGrading === q.id}
                              className="mt-3 exam-btn exam-btn-ghost h-9 text-sm"
                              onClick={() => askAiGrade(q)}>
                              <Sparkles className="size-4" />
                              {aiGrading === q.id ? <T>AI 点评中…</T> : <T>让 AI 点评我的答案</T>}
                            </button>
                          )}
                        </ExamCard>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {/* 桌面答题卡 */}
          <div className="hidden lg:block lg:sticky lg:top-24">
            <AnswerSheet
              groups={sheetGroups}
              answers={answers}
              submitted={submitted}
              mode={mode}
              onJump={jumpToQuestion}
            />
          </div>
        </div>

        {/* 移动浮窗答题卡 */}
        <div className="lg:hidden fixed bottom-4 right-4 z-30">
          <button
            type="button"
            onClick={() => setSheetOpen((o) => !o)}
            className="exam-btn exam-btn-primary size-14 rounded-full shadow-lg">
            <LayoutGrid className="size-6" />
          </button>
        </div>
        {sheetOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSheetOpen(false)}>
            <div className="absolute bottom-0 inset-x-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-[hsl(var(--exam-paper))] p-4" onClick={(e) => e.stopPropagation()}>
              <AnswerSheet
                groups={sheetGroups}
                answers={answers}
                submitted={submitted}
                mode={mode}
                onJump={jumpToQuestion}
              />
            </div>
          </div>
        )}
      </ExamContainer>
    </ExamPaperShell>
  );
}
