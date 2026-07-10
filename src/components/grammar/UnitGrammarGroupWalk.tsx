import { useCallback, useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { ArrowLeft, RotateCw, Loader2, Trophy } from "lucide-react";
import { GrammarQuestionCard, type AnswerResult } from "@/components/grammar/GrammarQuestionCard";
import type { GrammarQuestion } from "@/components/grammar/GrammarQuestionCard";
import { loadPointQuestions } from "@/lib/juniorGrammarUnits";
import {
  recordGrammarQuestionMastery,
  loadGrammarQuestionMastery,
  computeGrammarProgress,
  gpct,
  type GrammarProgress,
} from "@/lib/juniorGrammarQuestionMastery";
import { recordJuniorGrammarAttempt, type JuniorGrammarErrorReason } from "@/lib/juniorGrammarFsrs";
import { recordSkillAttemptsForQuestion } from "@/lib/recordSkillAttempts";
import { recordSeniorGrammarMistake } from "@/lib/seniorGrammarMistake";
import { awardForCorrect, notifyWrong } from "@/lib/coins";
import { fireEmojiConfetti } from "@/lib/feedback";
import { T } from "@/i18n/T";

export type WalkGroup = { pointId: string; title: string };

function shuffle<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/**
 * 单元语法「分组走」——组 = 语法点,每组 = 该点全部题。
 * 进入即显示「第 N/共 X 组」(橙色药丸,风格同词汇关);做完一组弹中转卡再进下一组。
 * 只管走组 + 显示;判分(GrammarQuestionCard)+ 掌握度记录沿用既有口径,不改。
 * L3 语法页 与 hub 第4关(新单元)共用。
 */
export default function UnitGrammarGroupWalk({
  groups,
  startIndex = 0,
  backTo,
  unitLabel,
}: {
  groups: WalkGroup[];
  startIndex?: number;
  backTo: string;
  unitLabel?: string;
}) {
  const [groupIdx, setGroupIdx] = useState(Math.max(0, Math.min(startIndex, groups.length - 1)));
  const [questions, setQuestions] = useState<GrammarQuestion[] | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [phase, setPhase] = useState<"quiz" | "between" | "done">("quiz");
  const [unitProg, setUnitProg] = useState<GrammarProgress | null>(null);

  const group = groups[groupIdx];

  // 载入当前组的题
  useEffect(() => {
    let cancelled = false;
    setQuestions(null);
    setQIdx(0);
    setAnswered(false);
    (async () => {
      const qs = await loadPointQuestions(group.pointId);
      if (!cancelled) setQuestions(shuffle(qs));
    })();
    return () => {
      cancelled = true;
    };
  }, [group.pointId]);

  const activeQ = questions && qIdx < questions.length ? questions[qIdx] : null;

  const handleAnswered = (res: AnswerResult) => {
    if (answered || !activeQ) return;
    setAnswered(true);
    const isOk = res.kind === "correct" || res.kind === "acceptable";
    // 块②:补写统一错题本(新式单元走本组件,此前漏写)。做对自动移出。
    void recordSeniorGrammarMistake({ question: activeQ, result: res, isCorrect: isOk, sourceLabel: group.title });
    void recordGrammarQuestionMastery(activeQ.id, isOk);
    void recordJuniorGrammarAttempt({
      pointId: group.pointId,
      questionType: activeQ.question_type || "mcq",
      isCorrect: isOk,
      latencyMs: res.latencyMs,
      questionId: activeQ.id,
      errorReason: res.kind === "wrong" ? (res.errorReason as JuniorGrammarErrorReason | undefined) : undefined,
    });
    void recordSkillAttemptsForQuestion(activeQ.id, isOk);
    if (isOk) awardForCorrect(0, "junior_grammar", activeQ.id, "junior_grammar", res.latencyMs);
    else notifyWrong();
  };

  const finishUnit = useCallback(async () => {
    // 汇总全单元题 id → 算完成/掌握
    const all = await Promise.all(groups.map((g) => loadPointQuestions(g.pointId)));
    const ids = all.flat().map((q) => q.id);
    const m = await loadGrammarQuestionMastery(ids);
    const pr = computeGrammarProgress(ids, m);
    setUnitProg(pr);
    setPhase("done");
    if (pr.mastered === pr.total && pr.total > 0) fireEmojiConfetti({ vibrate: true, count: 60 });
  }, [groups]);

  const handleNext = () => {
    if (!questions) return;
    const isLastQ = qIdx >= questions.length - 1;
    if (!isLastQ) {
      setQIdx((i) => i + 1);
      setAnswered(false);
      return;
    }
    // 本组最后一题
    if (groupIdx < groups.length - 1) setPhase("between");
    else void finishUnit();
  };

  const restart = () => {
    setGroupIdx(0);
    setPhase("quiz");
    setUnitProg(null);
    setQIdx(0);
    setAnswered(false);
  };

  // ── done ──
  if (phase === "done" && unitProg) {
    const allMastered = unitProg.total > 0 && unitProg.mastered === unitProg.total;
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-10">
        <div className="rounded-3xl border bg-card p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-emerald-400 text-3xl">
            {allMastered ? "👑" : "💪"}
          </div>
          <h1 className="mt-3 text-xl font-extrabold">{unitLabel ?? "本单元语法"}</h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
            <Trophy className="size-4" /> 完成度 {gpct(unitProg.done, unitProg.total)}% · 掌握度 {gpct(unitProg.mastered, unitProg.total)}%
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {groups.length} 组 · 掌握 {unitProg.mastered}/{unitProg.total} 题（每题累计答对 2 次即掌握）
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <BackLink to={backTo} className="rounded-full border border-border px-5 py-2 text-sm font-bold"><T>返回</T></BackLink>
            <button onClick={restart} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              <RotateCw className="size-4" /> <T>再做一遍</T>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── between groups ──
  if (phase === "between") {
    const remaining = groups.length - (groupIdx + 1);
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-10">
        <GroupPill groupIdx={groupIdx} total={groups.length} title={group.title} />
        <div className="mt-4 rounded-2xl border bg-card p-6 text-center shadow-sm">
          <div className="mb-2 text-lg font-bold">本组完成 🎉</div>
          <div className="mb-4 text-sm text-muted-foreground">
            本单元还有 <strong>{remaining}</strong> 组没做,继续下一组吗?
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
              onClick={() => {
                setGroupIdx((g) => g + 1);
                setPhase("quiz");
              }}
            >
              继续下一组 →
            </button>
            <button
              type="button"
              className="rounded-xl border border-border px-5 py-2 text-sm font-bold"
              onClick={() => void finishUnit()}
            >
              先看结果
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── quiz ──
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-4">
      <BackLink to={backTo} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回</T>
      </BackLink>

      <GroupPill groupIdx={groupIdx} total={groups.length} title={group.title} />

      {questions === null ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>加载中…</T>
        </div>
      ) : questions.length === 0 ? (
        <p className="text-sm text-muted-foreground"><T>本组暂无题目</T></p>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">第 {Math.min(qIdx + 1, questions.length)} / {questions.length} 题</div>
          {activeQ && (
            <div className="space-y-3">
              <GrammarQuestionCard key={activeQ.id} question={activeQ} index={qIdx} onAnswered={handleAnswered} large />
              {answered && (
                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 px-4 py-2 text-sm font-bold text-white"
                  >
                    {qIdx >= questions.length - 1
                      ? groupIdx >= groups.length - 1
                        ? "查看结果 →"
                        : "本组完成 →"
                      : "下一题 →"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

/** 橙色「第 N/共 X 组」药丸 + 当前组标题(风格同词汇关分组)。 */
function GroupPill({ groupIdx, total, title }: { groupIdx: number; total: number; title: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-extrabold text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
        第 {groupIdx + 1} / {total} 组
      </span>
      <span className="text-base font-bold text-foreground">{title}</span>
    </div>
  );
}
