import { T } from "@/i18n/T";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, LayoutGrid, MessageCircle, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { celebrateScore } from "@/lib/feedback";
import NoCopyGuard from "@/components/NoCopyGuard";
import { getExam, type ExamQuestion, type ExamPaper } from "@/data/exams";
import {
  type ExamMode,
  getSectionMeta,
  MODE_LABELS,
  groupQuestionsBySection,
  examAutoScore,
  sectionScore,
  checkCorrect,
  isAutoGraded,
  questionNum,
  formatTimer,
  getReadingBlocks,
  readingBlockQuestions,
  questionsInUnit,
  isUnitComplete,
  unitLabelForQuestion,
  shouldShowExplanation,
  normalizePassageBlanks,
} from "@/lib/suzhouExamUtils";
import {
  assistantLockedHint,
  buildExamSnapshot,
  buildQuestionSnapshot,
  isAssistantUnlocked,
  SUZHOU_TUTOR_STARTERS,
} from "@/lib/suzhouExamAi";
import { isReviewUnlocked, markSuzhouModeComplete, getSuzhouExamDraft, saveSuzhouExamDraft, clearSuzhouExamDraft } from "@/lib/suzhouExamProgress";
import {
  buildReportPayload,
  findFirstWrongQuestion,
  saveSuzhouMistakes,
} from "@/lib/suzhouExamDiagnosis";
import {
  buildSuzhouReport,
  getLatestLocalReport,
  persistSuzhouReport,
  type SuzhouExamReport,
} from "@/lib/suzhouExamReports";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { ExamPaper as ExamPaperShell, ExamContainer, ExamCard, ExamProgress } from "@/components/exam/ExamPaper";
import { SuzhouExamReportPanel } from "@/components/exam/SuzhouExamReportPanel";
import QuestionRenderer from "@/components/exam/QuestionRenderer";
import FavoriteButton from "@/components/exam/FavoriteButton";
import { InlineTutorChat } from "@/components/exam/InlineTutorChat";
import TutorChat from "@/components/tutor/TutorChat";
import { PassageWithBlanks, MusicFestivalPoster, LibraryHolidayPoster, EggReadingArticle, AnswerSheet } from "@/components/exam/SuzhouExamParts";
import { WritingTaskPanel, EssayWritingArea, getWritingTemplate, type WritingPromptData } from "@/components/exam/WritingTaskPanel";
import { EssayAiFeedback, buildWritingAiPrompt } from "@/components/exam/EssayAiFeedback";
import { SuzhouPracticeBooster } from "@/components/exam/SuzhouPracticeBooster";

const VALID_MODES: ExamMode[] = ["exam", "practice", "review"];

function buildBlankMap(questions: ExamQuestion[]): Record<number, string> {
  const map: Record<number, string> = {};
  for (const q of questions) {
    map[questionNum(q.id)] = q.id;
  }
  return map;
}

function InlineExplanation({
  q,
  userAnswer,
  examId,
  examTitle,
  exam,
  onAskAi,
}: {
  q: ExamQuestion;
  userAnswer: string;
  examId: string;
  examTitle: string;
  exam: ExamPaper;
  onAskAi: (q: ExamQuestion) => void;
}) {
  const ok = checkCorrect(q, userAnswer);
  return (
    <ExamCard>
      <div data-qid={q.id}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="exam-q-num">No. {String(questionNum(q.id)).padStart(2, "0")}</span>
          <span className="exam-skill-tag">{q.knowledge_point}</span>
          <div className="ml-auto flex items-center gap-1">
            <FavoriteButton examId={examId} examTitle={examTitle} question={q} />
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
              onClick={() => onAskAi(q)}>
              <Sparkles className="size-3.5" />
              <T>问 AI</T>
            </button>
          </div>
        </div>
        <div className="exam-explanation rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4 border-l-4 border-amber-400">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
            {ok ? <CheckCircle2 className="size-4 text-emerald-500" /> : <XCircle className="size-4 text-rose-500" />}
            <span><T>正确答案：</T>{q.answer}</span>
            <span className="text-xs text-muted-foreground font-normal"><T>你的答案：</T>{userAnswer || "未作答"}</span>
          </div>
          <div className="mt-2 text-sm leading-relaxed whitespace-pre-line exam-soft">{q.explanation}</div>
        </div>
        <SuzhouPracticeBooster exam={exam} question={q} userAnswer={userAnswer} />
      </div>
    </ExamCard>
  );
}

export default function SuzhouExamPlay() {
  const { examId } = useParams<{ examId: string }>();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get("mode") as ExamMode | null;
  const jumpQ = searchParams.get("q");
  const exam = examId ? getExam(examId) : undefined;

  const mode: ExamMode | null = modeParam && VALID_MODES.includes(modeParam) ? modeParam : null;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [remainingSec, setRemainingSec] = useState(exam?.duration_seconds ?? 6000);
  const [currentQid, setCurrentQid] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tutorFor, setTutorFor] = useState<ExamQuestion | null>(null);
  const [showReviewChat, setShowReviewChat] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [savedReport, setSavedReport] = useState<SuzhouExamReport | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reportPersistedRef = useRef(false);

  const assistantUnlocked = exam && mode
    ? isAssistantUnlocked(exam, mode, submitted, answers)
    : false;

  const examSnapshot = useMemo(() => {
    if (!exam || !mode || !assistantUnlocked) return undefined;
    return buildExamSnapshot(exam, answers, mode, submitted);
  }, [exam, mode, assistantUnlocked, answers, submitted]);

  useRegisterAssistant(
    exam && mode
      ? {
          context: "junior_suzhou_exam",
          ref: `${exam.id}:${mode}`,
          topic: `苏州中考真题 · ${exam.title} · ${MODE_LABELS[mode]}`,
          mode: "full-test",
          unlocked: assistantUnlocked,
          lockedHint: assistantLockedHint(mode),
          pageTitle: "💬 小月 · 苏州真题复盘",
          starters: SUZHOU_TUTOR_STARTERS,
          snapshot: examSnapshot,
        }
      : null,
  );

  useEffect(() => {
    if (!exam || !mode || mode === "review") {
      setDraftLoaded(true);
      return;
    }
    const draft = getSuzhouExamDraft(exam.id, mode);
    if (draft?.answers && Object.keys(draft.answers).length > 0) {
      setAnswers(draft.answers);
      if (draft.submitted) setSubmitted(true);
      if (typeof draft.remainingSec === "number" && mode === "exam") {
        setRemainingSec(draft.remainingSec);
      }
      setLastSavedAt(draft.savedAt);
      toast.info("已恢复上次未提交的作答进度", { duration: 2500 });
    }
    setDraftLoaded(true);
  }, [exam?.id, mode]);

  useEffect(() => {
    if (!exam || !mode || mode === "review" || !draftLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveSuzhouExamDraft(exam.id, mode, {
        answers,
        submitted,
        remainingSec: mode === "exam" ? remainingSec : undefined,
      });
      setLastSavedAt(new Date().toISOString());
    }, 400);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [exam?.id, mode, answers, submitted, remainingSec, draftLoaded]);

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
    if (!jumpQ || !exam) return;
    const t = setTimeout(() => {
      document.querySelector(`[data-qid="${jumpQ}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => clearTimeout(t);
  }, [jumpQ, exam?.id]);

  const finalizeSubmit = useCallback(async (timedOut = false) => {
    if (!exam || !mode || mode === "review" || reportPersistedRef.current) return;

    const score = examAutoScore(exam, answers);
    const pctNow = score.max ? Math.round((score.earned / score.max) * 100) : 0;
    const unanswered = exam.questions.filter((q) => !answers[q.id]?.trim()).length;

    setSubmitted(true);
    reportPersistedRef.current = true;

    saveSuzhouExamDraft(exam.id, mode, {
      answers,
      submitted: true,
      remainingSec: mode === "exam" ? (timedOut ? 0 : remainingSec) : undefined,
    });
    markSuzhouModeComplete(exam.id, mode);

    const payload = buildReportPayload({ exam, answers, mode, autoScore: score });
    const report = buildSuzhouReport(payload);
    const stored = await persistSuzhouReport(report);
    setSavedReport(stored);
    await saveSuzhouMistakes(exam, answers);

    celebrateScore(pctNow);
    if (timedOut) {
      toast.warning(`考试时间到，已自动提交 · 客观题 ${score.earned}/${score.max}`);
    } else {
      toast.success(
        unanswered > 0
          ? `已提交（${unanswered} 题未作答）· 客观题 ${score.earned}/${score.max} · 诊断报告已生成`
          : `提交成功 · 客观题 ${score.earned}/${score.max} · 诊断报告已生成`,
      );
    }

    requestAnimationFrame(() => {
      document.getElementById("suzhou-diagnosis-report")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [exam, mode, answers, remainingSec]);

  useEffect(() => {
    if (mode !== "exam" || submitted || !exam) return;
    if (remainingSec <= 0) {
      void finalizeSubmit(true);
      return;
    }
    const t = setInterval(() => setRemainingSec((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [mode, submitted, remainingSec, exam, finalizeSubmit]);

  useEffect(() => {
    if (!exam || !mode || mode === "review" || !submitted || savedReport) return;

    const existing = getLatestLocalReport(exam.id, mode);
    if (existing) {
      setSavedReport(existing);
      reportPersistedRef.current = true;
      return;
    }

    const score = examAutoScore(exam, answers);
    const report = buildSuzhouReport(buildReportPayload({ exam, answers, mode, autoScore: score }));
    setSavedReport(report);
    reportPersistedRef.current = true;
    void persistSuzhouReport(report).then(setSavedReport);
    void saveSuzhouMistakes(exam, answers);
  }, [exam, mode, submitted, answers, savedReport]);

  useEffect(() => {
    if (!exam || !mode || mode === "review") return;
    reportPersistedRef.current = false;
    setSavedReport(null);
  }, [exam?.id, mode]);

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

  if (mode === "review" && !isReviewUnlocked(exam.id)) {
    return <Navigate to={`/junior/suzhou/${exam.id}/mode`} replace />;
  }

  const sections = groupQuestionsBySection(exam);
  const autoScore = examAutoScore(exam, answers);
  const pct = autoScore.max ? Math.round((autoScore.earned / autoScore.max) * 100) : 0;

  const showExplanationFor = (q: ExamQuestion) =>
    shouldShowExplanation(mode, exam, q, answers, submitted);

  const unitPracticeHint = (unitQs: ExamQuestion[]) => {
    if (mode !== "practice") return null;
    const done = isUnitComplete(unitQs, answers);
    const started = unitQs.some((q) => !!answers[q.id]?.trim());
    const label = unitQs[0] ? unitLabelForQuestion(exam, unitQs[0]) : "";
    if (done) {
      return (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-center text-xs text-emerald-800">
          <T>✓ {label} 已全部作答，下方为答案与解析</T>
        </p>
      );
    }
    if (started) {
      return (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-center text-xs exam-soft">
          <T>答完 {label} 全部 {unitQs.length} 小题后，才会显示答案与解析</T>
        </p>
      );
    }
    return null;
  };

  const inputsDisabled = mode === "review" || (mode === "exam" && submitted);

  const answeredCount = exam.questions.filter((q) => !!answers[q.id]?.trim()).length;
  const unansweredCount = exam.questions.length - answeredCount;

  const progressStates = exam.questions.map((q) => {
    const a = answers[q.id];
    if (!a?.trim()) return "todo" as const;
    if (!showExplanationFor(q)) return "answered" as const;
    const ok = checkCorrect(q, a);
    if (ok === null) return "answered" as const;
    return ok ? ("correct" as const) : ("wrong" as const);
  });

  const doSubmit = () => {
    void finalizeSubmit(false);
  };

  const handleSubmit = () => {
    if (unansweredCount > 0) {
      const ok = window.confirm(
        `还有 ${unansweredCount} 道题未作答（含书面表达/翻译等），确定现在提交吗？\n\n已作答内容会自动保存，可随时返回继续。`,
      );
      if (!ok) return;
    }
    doSubmit();
  };

  const handleRetry = () => {
    if (mode && mode !== "review") clearSuzhouExamDraft(exam.id, mode);
    setAnswers({});
    setSubmitted(false);
    setSavedReport(null);
    reportPersistedRef.current = false;
    setRemainingSec(exam.duration_seconds);
    setLastSavedAt(null);
    toast.info("已清空作答，重新开始");
  };

  const openReportAi = () => {
    const wrong = findFirstWrongQuestion(exam, answers);
    if (wrong) {
      setTutorFor(wrong);
      return;
    }
    setShowReviewChat(true);
    document.getElementById("suzhou-ai-review")?.scrollIntoView({ behavior: "smooth" });
  };

  const jumpToQuestion = (qid: string) => {
    document.querySelector(`[data-qid="${qid}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setSheetOpen(false);
  };

  const openTutor = (q: ExamQuestion) => {
    if (!showExplanationFor(q)) {
      toast.error(mode === "exam" ? "请先提交试卷后再问 AI" : "请先完成本题所在题组");
      return;
    }
    if (!answers[q.id]?.trim() && mode !== "review") {
      toast.error("请先作答后再问 AI");
      return;
    }
    setTutorFor(q);
  };

  const sheetGroups = sections.map((g) => ({
    section: g.section,
    label: getSectionMeta(exam, g.section).title.split("·")[0]?.trim() ?? g.section,
    questions: g.questions.map((q) => ({ id: q.id, num: questionNum(q.id) })),
  }));

  const renderSectionPassage = (sectionKey: string, questions: ExamQuestion[]) => {
    const passage = exam.passages[sectionKey];
    if (!passage) return null;

    if (sectionKey === "cloze") {
      const qMap = Object.fromEntries(questions.map((q) => [q.id, q]));
      const passageText = normalizePassageBlanks(passage);
      return (
        <ExamCard className="mb-6">
          <div className="exam-eyebrow mb-2"><T>完形填空 · 阅读材料</T></div>
          <PassageWithBlanks
            text={passageText}
            blankIds={buildBlankMap(questions)}
            answers={answers}
            onChange={setAnswer}
            disabled={inputsDisabled}
            inputType="select"
            getSelectOptions={(qid) => qMap[qid]?.options ?? {}}
          />
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

  const renderEssayCard = (q: ExamQuestion) => {
    const num = questionNum(q.id);
    const canAsk = showExplanationFor(q);
    const writingPrompt = exam.resources?.writing_prompt;
    const template = getWritingTemplate(writingPrompt);
    const { promptEn, promptCn } = buildWritingAiPrompt(writingPrompt, exam.title);
    const locked = mode === "review";
    const disabled = locked || (mode === "exam" && submitted);
    const essayText = answers[q.id] ?? "";
    const canGradeEssay = Boolean(
      essayText.trim() && (submitted || (mode === "practice" && canAsk)),
    );

    return (
      <ExamCard key={q.id}>
        <div data-qid={q.id} className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="exam-q-num">No. {String(num).padStart(2, "0")}</span>
          <span className="exam-skill-tag">{q.knowledge_point}</span>
          <div className="ml-auto flex items-center gap-1">
            {canAsk && (
              <>
                <FavoriteButton examId={exam.id} examTitle={exam.title} question={q} />
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                  onClick={() => openTutor(q)}>
                  <Sparkles className="size-3.5" />
                  <T>问 AI 讲解</T>
                </button>
              </>
            )}
          </div>
        </div>
        <EssayWritingArea
          value={essayText}
          onChange={(v) => setAnswer(q.id, v)}
          disabled={disabled}
          template={template}
        />
        <EssayAiFeedback
          className="mt-4"
          text={essayText}
          promptEn={promptEn}
          promptCn={promptCn}
          lessonTitle={`${exam.title} · 书面表达`}
          canGrade={canGradeEssay}
        />
        {canAsk && q.explanation && (
          <div className="exam-explanation mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4 border-l-4 border-amber-400">
            <div className="text-sm leading-relaxed whitespace-pre-line exam-soft">{q.explanation}</div>
          </div>
        )}
      </ExamCard>
    );
  };

  const renderQuestionCard = (q: ExamQuestion) => {
    const num = questionNum(q.id);
    const canAsk = showExplanationFor(q);
    return (
      <ExamCard key={q.id}>
        <div className="mb-2 flex flex-wrap items-center justify-end gap-1">
          {canAsk && (
            <>
              <FavoriteButton examId={exam.id} examTitle={exam.title} question={q} />
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                onClick={() => openTutor(q)}>
                <Sparkles className="size-3.5" />
                <T>问 AI</T>
              </button>
            </>
          )}
        </div>
        <QuestionRenderer
          question={q}
          qNum={num}
          mode={mode}
          submitted={submitted}
          value={answers[q.id] ?? ""}
          onChange={(v) => setAnswer(q.id, v)}
          showExplanation={canAsk}
        />
        {canAsk && (
          <SuzhouPracticeBooster
            exam={exam}
            question={q}
            userAnswer={answers[q.id] ?? ""}
          />
        )}
      </ExamCard>
    );
  };

  const renderReadingSection = (questions: ExamQuestion[]) => (
    <div className="space-y-8">
      {getReadingBlocks(exam).map((block) => {
        const blockQs = readingBlockQuestions(questions, block.from, block.to);
        if (!blockQs.length) return null;
        const passageKey = block.passageKey ?? `reading_${block.label}`;
        return (
          <div key={block.label} className="space-y-5">
            <ExamCard>
              <div className="exam-eyebrow mb-2">
                <T>Passage {block.label}</T>
                {block.title ? ` · ${block.title}` : ""}
              </div>
              {block.kind === "poster" ? (
                <MusicFestivalPoster data={(exam.resources?.poster_A ?? {}) as Record<string, unknown>} />
              ) : block.kind === "library_poster" ? (
                <LibraryHolidayPoster
                  data={(exam.resources?.[block.resourceKey ?? "library_poster_A"] ?? {}) as Record<string, unknown>}
                />
              ) : block.kind === "egg_article" ? (
                <EggReadingArticle
                  data={(exam.resources?.[block.resourceKey ?? "egg_article_B"] ?? {}) as Record<string, unknown>}
                />
              ) : (
                exam.passages[passageKey] && (
                  <div className="exam-passage whitespace-pre-wrap">{exam.passages[passageKey]}</div>
                )
              )}
            </ExamCard>
            <div className="space-y-5">
              {blockQs.map(renderQuestionCard)}
            </div>
            {unitPracticeHint(blockQs)}
          </div>
        );
      })}
    </div>
  );

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
              {lastSavedAt && mode !== "review" && !submitted && (
                <span className="hidden sm:inline text-[11px] exam-mute">
                  <T>已自动保存</T>
                </span>
              )}
              {mode !== "review" && !submitted && (
                <button type="button" className="exam-btn exam-btn-primary h-9 px-4" onClick={handleSubmit}>
                  <CheckCircle2 className="size-4" />
                  <T>提交试卷</T>
                  <span className="text-[11px] opacity-80">({answeredCount}/{exam.questions.length})</span>
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

        {submitted && mode !== "review" && (
          <div className="mb-6 rounded-xl border border-emerald-300/80 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            <CheckCircle2 className="mr-1.5 inline size-4" />
            <T>试卷已提交并保存。</T>
            {unansweredCount > 0 && (
              <span className="ml-1"><T>仍有 {unansweredCount} 题未作答，可在「重做」后补完。</T></span>
            )}
          </div>
        )}

        <header className="mb-6">
          <div className="exam-eyebrow mb-2"><T>苏州中考英语真题</T></div>
          <h1 className="exam-display text-[clamp(22px,3vw,32px)] leading-tight">{exam.title}</h1>
        </header>

        {/* 诊断报告（交卷后） */}
        {submitted && savedReport && mode !== "review" && (
          <div className="mb-10">
            <SuzhouExamReportPanel report={savedReport} onAskAI={openReportAi} />
          </div>
        )}

        {(mode === "review" || (submitted && !savedReport)) && (
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
              {mode === "review" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {sections.filter((s) => s.questions.some(isAutoGraded)).map((g) => {
                    const sc = sectionScore(g.questions.filter(isAutoGraded), answers, exam);
                    return (
                      <div key={g.section} className="rounded-lg bg-white/60 dark:bg-black/20 px-3 py-2">
                        <div className="exam-mute truncate">{getSectionMeta(exam, g.section).title.split("·")[0]?.trim()}</div>
                        <div className="font-bold">{sc.earned}/{sc.max}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={containerRef} className="grid gap-8 lg:grid-cols-[1fr_240px] items-start">
          <div className="space-y-10 min-w-0">
            {sections.map(({ section, questions }) => {
              const meta = getSectionMeta(exam, section);
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

                  {section === "reading" ? (
                    renderReadingSection(questions)
                  ) : (
                    <>
                      {passageKey && renderSectionPassage(passageKey, questions)}

                      {section === "writing" && exam.resources?.writing_prompt && (
                        <ExamCard className="mb-6">
                          <div className="exam-eyebrow mb-4"><T>书面表达 · 题目要求</T></div>
                          <WritingTaskPanel data={exam.resources.writing_prompt as WritingPromptData} />
                        </ExamCard>
                      )}

                      <div className="space-y-5">
                        {questions.map((q) => {
                          const isInlineSection =
                            section === "cloze" || section === "restore" ||
                            section === "vocab_bank" || section === "passage_fill";

                          if (isInlineSection) {
                            if (!showExplanationFor(q)) return null;
                            return (
                              <InlineExplanation
                                key={q.id}
                                q={q}
                                userAnswer={answers[q.id] ?? ""}
                                examId={exam.id}
                                examTitle={exam.title}
                                exam={exam}
                                onAskAi={openTutor}
                              />
                            );
                          }

                          if (section === "writing" && q.type === "essay") {
                            return renderEssayCard(q);
                          }

                          return renderQuestionCard(q);
                        })}
                        {unitPracticeHint(questions)}
                      </div>
                    </>
                  )}
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
        <div className={cn(
          "lg:hidden fixed right-4 z-30",
          mode !== "review" && !submitted ? "bottom-[5.5rem]" : "bottom-4",
        )}>
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

      {/* 移动端底部提交栏 */}
      {mode !== "review" && !submitted && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t exam-divider bg-[hsl(var(--exam-paper))]/98 backdrop-blur px-4 py-3 lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1 text-xs exam-soft">
              <div className="font-semibold exam-display">
                <T>已完成</T> {answeredCount}/{exam.questions.length}
                {unansweredCount > 0 && (
                  <span className="ml-1 font-normal exam-mute">· {unansweredCount} <T>题未答</T></span>
                )}
              </div>
              {lastSavedAt && <div className="exam-mute"><T>作答已自动保存</T></div>}
            </div>
            <button type="button" className="exam-btn exam-btn-primary h-10 shrink-0 px-5" onClick={handleSubmit}>
              <CheckCircle2 className="size-4" /> <T>提交试卷</T>
            </button>
          </div>
        </div>
      )}

      {(submitted || mode === "review") && examSnapshot && (
        <ExamContainer max="7xl" className="mt-8 pb-8" id="suzhou-ai-review">
          {!showReviewChat ? (
            <ExamCard className="text-center">
              <MessageCircle className="mx-auto mb-2 size-8 text-indigo-500" />
              <p className="mb-3 text-sm exam-soft"><T>想和小月复盘整张试卷？苏格拉底式讲解 + 同类小测</T></p>
              <button
                type="button"
                className="exam-btn exam-btn-primary h-10 px-5"
                onClick={() => setShowReviewChat(true)}>
                <Sparkles className="size-4" />
                <T>开始 AI 复盘对话</T>
              </button>
            </ExamCard>
          ) : (
            <InlineTutorChat
              sessionKey={`junior-suzhou:${exam.id}:${mode}`}
              context="junior_suzhou_exam"
              questionRef={exam.id}
              questionSnapshot={examSnapshot}
              mode="free"
              title="小月"
              subtitle="苏州真题复盘 · 可追问错题、要同类小测"
              starters={SUZHOU_TUTOR_STARTERS}
            />
          )}
        </ExamContainer>
      )}

      {tutorFor && mode && (
        <TutorChat
          context="junior_suzhou_exam"
          questionRef={`${exam.id}:${tutorFor.id}`}
          questionSnapshot={buildQuestionSnapshot(exam, tutorFor, answers, mode)}
          open={!!tutorFor}
          onClose={() => setTutorFor(null)}
          title="小月 · 本题答疑"
        />
      )}
    </ExamPaperShell>
  );
}
