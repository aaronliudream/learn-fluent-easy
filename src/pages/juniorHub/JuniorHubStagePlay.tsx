import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { findUnit } from "@/lib/juniorHub/courseData";
import { shuffleArray, useJuniorHub } from "@/lib/juniorHub/context";
import { getUnitState, savePersist } from "@/lib/juniorHub/storage";
import { hubSpeak } from "@/lib/primaryHub/speech";
import { prefetchTTSBatchKid } from "@/lib/speak";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import WordMatchingGame from "@/components/hub/WordMatchingGame";
import type { ListeningQuestion, QuizQuestion, UnitDef, VocabItem } from "@/lib/juniorHub/types";
import { Link, useSearchParams } from "react-router-dom";
import { useGrammarPointId } from "@/hooks/useGrammarPointId";
import { useKnowledgePointId } from "@/hooks/useKnowledgePointId";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { loadMastery, type MasteryRow } from "@/lib/masteryProgress";
import { recordJuniorWordMastery } from "@/lib/juniorWordMastery";
import { buildFinalQuiz, type FinalQuizItem } from "@/lib/juniorFinalQuiz";
import { recordJuniorGrammarAttempt } from "@/lib/juniorGrammarFsrs";
import { awardCoins } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { celebrateScore } from "@/lib/feedback";
import { toast } from "sonner";

type Props = {
  unitId: string;
  stageIdx: number;
  onComplete: (needAiTest: boolean) => void;
  onBack: () => void;
};

const SENTENCE_PATTERNS = [
  {
    type: "询问位置",
    q: "Where's the library?",
    qCn: "图书馆在哪里？",
    a: "It's on the second floor.",
    aCn: "它在二楼。",
    color: "blue" as const,
  },
  {
    type: "确认询问",
    q: "Is this the teachers' office?",
    qCn: "这是教师办公室吗？",
    a: "No, it isn't.",
    aCn: "不，不是。",
    color: "yellow" as const,
  },
  {
    type: "询问拥有",
    q: "Do you have a music room?",
    qCn: "你们有音乐教室吗？",
    a: "Yes, we do.",
    aCn: "是的，有。",
    color: "green" as const,
  },
  {
    type: "描述位置",
    q: "It's next to the art room.",
    qCn: "它紧挨着美术教室。",
    a: "",
    aCn: "",
    color: "pink" as const,
  },
];

const sentenceColorClass = {
  blue: "border-l-4 border-[#378ADD] bg-[#E6F1FB]",
  yellow: "border-l-4 border-[#FFB627] bg-[#FFF4D6]",
  green: "border-l-4 border-[#639922] bg-[#EAF3DE]",
  pink: "border-l-4 border-[#D4537E] bg-[#FBEAF0]",
};

function PrimaryButton({
  children,
  disabled,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`mt-4 w-full rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E55A28] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function QuizOpts({
  opts,
  answer,
  picked,
  answered,
  onPick,
}: {
  opts: string[];
  answer: number;
  picked: number | null;
  answered: boolean;
  onPick: (idx: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {opts.map((opt, j) => {
        let cls =
          "quiz-opt flex w-full items-center gap-3 rounded-xl border-2 border-[#EEEAE0] bg-white p-3 text-left text-sm font-medium transition disabled:cursor-not-allowed";
        if (answered) {
          if (j === answer) cls += " correct";
          else if (j === picked && picked !== answer) cls += " wrong";
          else cls += " dimmed";
        }
        return (
          <button
            key={j}
            type="button"
            disabled={answered}
            className={cls}
            onClick={() => onPick(j)}
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[#F4F0E6] text-xs font-bold text-[#888780]">
              {String.fromCharCode(65 + j)}
            </span>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

function StageShell({
  stageIdx,
  stageTitle,
  unit,
  stars,
  onBack,
  children,
}: {
  stageIdx: number;
  stageTitle: string;
  unit: UnitDef;
  stars: number;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        <button type="button" onClick={onBack} className="text-xl">
          ←
        </button>
        <div className="text-lg font-bold">
          第 {stageIdx + 1} 关 · {stageTitle}
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-[#888780]">进度</span>
          <span className="font-semibold text-[#FF6B35]">⭐ {stars}</span>
        </div>
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#F4F0E6]">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627] transition-all"
            style={{ width: `${(stageIdx / unit.stages.length) * 100}%` }}
          />
        </div>
        {children}
      </div>
    </>
  );
}

function VocabStage({
  vocabulary,
  grade,
  onFinish,
}: {
  vocabulary: VocabItem[];
  grade: number;
  onFinish: () => void;
}) {
  const [viewed, setViewed] = useState<Set<number>>(() => new Set());
  const [flipped, setFlipped] = useState<Set<number>>(() => new Set());

  const speakWord = (word: string) => hubSpeak(word, 0.85, grade);

  useEffect(() => {
    prefetchTTSBatchKid(
      vocabulary.map((v) => v.en),
      { grade, speed: 0.85 },
    );
  }, [grade, vocabulary]);

  const toggleCard = (i: number) => {
    const v = vocabulary[i];
    const isFlipped = flipped.has(i);
    if (!isFlipped) {
      setFlipped((prev) => new Set(prev).add(i));
      setViewed((prev) => new Set(prev).add(i));
      speakWord(v.en);
    } else {
      setFlipped((prev) => {
        const next = new Set(prev);
        next.delete(i);
        return next;
      });
    }
  };

  const allViewed = viewed.size === vocabulary.length;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm">📖 认识 {vocabulary.length} 个核心单词</div>
      <div className="mb-3 text-xs text-[#888780]">💡 点击卡片看中文，点击 🔊 听发音</div>
      <div className="grid grid-cols-2 gap-2">
        {vocabulary.map((v, i) => {
          const isFlipped = flipped.has(i);
          return (
            <div
              key={v.en}
              role="button"
              tabIndex={0}
              onClick={() => toggleCard(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleCard(i);
              }}
              className={`cursor-pointer rounded-xl border-2 p-3 text-center transition ${
                isFlipped ? "border-[#97C459] bg-[#EAF3DE]" : "border-[#EEEAE0] bg-[#FFF8F0]"
              }`}
            >
              {!isFlipped ? (
                <>
                  {v.emoji && <div className="text-2xl">{v.emoji}</div>}
                  <div className="mt-1 text-sm font-semibold">{v.en}</div>
                  <span
                    role="button"
                    tabIndex={0}
                    className="mt-2 inline-block rounded-full bg-[#378ADD] px-2 py-0.5 text-xs text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(v.en);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        speakWord(v.en);
                      }
                    }}
                  >
                    🔊
                  </span>
                </>
              ) : (
                <>
                  {v.emoji && <div className="text-2xl">{v.emoji}</div>}
                  <div className="mt-1 text-sm font-bold text-[#FF6B35]">{v.cn}</div>
                  <div className="mt-1 text-xs text-[#888780]">{v.en}</div>
                  {v.chunks && v.chunks.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {v.chunks.map((c, ci) => (
                        <div
                          key={ci}
                          className="flex items-start gap-1 rounded-lg bg-[#F2F6FF] px-2 py-1 text-left"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-[#185FA5]">{c.en}</div>
                            <div className="mt-0.5 text-[10px] text-[#888780]">{c.cn}</div>
                          </div>
                          <span
                            role="button"
                            tabIndex={0}
                            className="shrink-0 cursor-pointer text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakWord(c.en);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                speakWord(c.en);
                              }
                            }}
                          >
                            🔊
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <span
                    role="button"
                    tabIndex={0}
                    className="mt-2 inline-block rounded-full bg-[#378ADD] px-2 py-0.5 text-xs text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(v.en);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        speakWord(v.en);
                      }
                    }}
                  >
                    🔊
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-center text-sm text-[#888780]">
        已查看：{viewed.size} / {vocabulary.length}
      </div>
      <PrimaryButton disabled={!allViewed} onClick={onFinish}>
        {allViewed ? "✓ 进入下一关 →" : "查看完所有卡片再继续"}
      </PrimaryButton>
    </div>
  );
}

function ListenMcStage({
  title,
  instruction,
  questions,
  grade,
  onFinish,
  onCorrect,
  onWrong,
}: {
  title: string;
  instruction: string;
  questions: Array<{ audio: string; opts: string[]; answer: number; point?: string; cn?: string; example?: { en: string; cn: string }; wordId?: string }>;
  grade: number;
  onFinish: () => void;
  onCorrect: (q?: { audio: string; opts: string[]; answer: number; point?: string; cn?: string; example?: { en: string; cn: string }; wordId?: string }) => void;
  onWrong: (q: { audio: string; opts: string[]; answer: number; point?: string; cn?: string; example?: { en: string; cn: string }; wordId?: string }) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<React.ReactNode>(null);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  useEffect(() => {
    prefetchTTSBatchKid(
      questions.map((item) => item.audio),
      { grade, speed: 0.8 },
    );
  }, [grade, questions]);

  const handlePick = (optIdx: number) => {
    if (answered) return;
    setAnswered(true);
    setPicked(optIdx);
    const isCorrect = optIdx === q.answer;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      onCorrect(q);
      setFeedback(
        <div className="feedback-box success">
          ✨ {title.includes("句") ? "听力真棒！" : "听对了！"}
          {q.cn && (
            <div className="mt-2 rounded-lg bg-white/70 px-2.5 py-1.5 text-left text-xs leading-relaxed text-[#2C2C2A]">
              <div>
                <strong>{q.opts[q.answer]}</strong> = {q.cn}
              </div>
              {q.example && (
                <div className="mt-0.5 text-[#5C5751]">📘 {q.example.en} — {q.example.cn}</div>
              )}
            </div>
          )}
        </div>,
      );
    } else {
      onWrong(q);
      setFeedback(
        <div className="feedback-box warning">
          💡 正确答案：<strong>{q.opts[q.answer]}</strong>
          {!title.includes("句") && (
            <button
              type="button"
              className="ml-2 rounded-lg bg-[#378ADD] px-2.5 py-1 text-xs text-white"
              onClick={() => hubSpeak(q.opts[q.answer], 0.7, grade)}
            >
              🔊 慢速
            </button>
          )}
        </div>,
      );
    }
  };

  const next = () => {
    if (isLast) {
      onFinish();
      return;
    }
    setIdx((i) => i + 1);
    setAnswered(false);
    setPicked(null);
    setFeedback(null);
  };

  useMcKeyboard({
    optionCount: q.opts.length,
    answered,
    onPick: handlePick,
    onNext: next,
  });

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex justify-between text-sm">
        <span className="text-[#888780]">
          第 {idx + 1} / {questions.length} 题
        </span>
        <span>✓ {correctCount}</span>
      </div>
      <div className="mb-4 rounded-xl bg-[#E6F1FB] p-5 text-center">
        <div className="mb-3 text-sm font-medium text-[#185FA5]">{instruction}</div>
        <button
          type="button"
          className="mx-auto grid size-16 place-items-center rounded-full bg-[#378ADD] text-2xl text-white shadow-md"
          onClick={() => hubSpeak(q.audio, 0.8, grade)}
        >
          🔊
        </button>
        <div className="mt-2 text-xs text-[#185FA5]">可多次点击重复听</div>
      </div>
      <QuizOpts opts={q.opts} answer={q.answer} picked={picked} answered={answered} onPick={handlePick} />
      {feedback}
      {answered && (
        <PrimaryButton onClick={next} className="mt-3">
          {isLast ? "本关完成 →" : "下一题 →"}
        </PrimaryButton>
      )}
    </div>
  );
}

// 听音辨词(第2关):读 junior_vocab 全单元词(34-77),按 grade+volume+unit;
// 一组 12 题,做完弹"还有 X 词,继续下一组吗";选对显示中文释义(+有例句则显);答对/答错写词汇掌握度(listen 通道)。
// 无 DB 词(grade7/Starter 等)→ 回退 JSON unit.vocabulary(含 chunk 例句)。
type LWWord = { wordId?: string; word: string; cn: string; example?: { en: string; cn: string } };
const LW_GROUP = 12;

function ListenWordStage({
  unit,
  grade,
  onFinish,
  onCorrect,
  onWrong,
}: {
  unit: UnitDef;
  grade: number;
  onFinish: () => void;
  onCorrect: (q: { wordId?: string }) => void;
  onWrong: (q: { audio: string; opts: string[]; answer: number; wordId?: string }) => void;
}) {
  const [words, setWords] = useState<LWWord[] | null>(null);
  const [groupIdx, setGroupIdx] = useState(0);
  const [between, setBetween] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("junior_vocab")
        .select("word_id,word,meaning_cn,example_en,example_cn")
        .eq("grade", grade)
        .eq("volume", unit.book)
        .eq("unit", unit.unitKey);
      if (cancelled) return;
      const rows = (data ?? []) as Array<{
        word_id: string;
        word: string;
        meaning_cn: string | null;
        example_en: string | null;
        example_cn: string | null;
      }>;
      const valid = rows.filter((r) => r.word && r.meaning_cn);
      if (valid.length > 0) {
        setWords(
          valid.map((r) => ({
            wordId: r.word_id,
            word: r.word.trim(),
            cn: r.meaning_cn as string,
            example: r.example_en && r.example_cn ? { en: r.example_en, cn: r.example_cn } : undefined,
          })),
        );
      } else {
        // 回退:无 DB 词 → JSON unit.vocabulary(grade7/Starter)
        setWords(unit.vocabulary.map((v) => ({ word: v.en, cn: v.cn, example: v.chunks?.[0] })));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unit.id, unit.book, unit.unitKey, grade]);

  const groups = useMemo(() => {
    if (!words) return [];
    const shuffled = shuffleArray([...words]);
    const out: LWWord[][] = [];
    for (let i = 0; i < shuffled.length; i += LW_GROUP) out.push(shuffled.slice(i, i + LW_GROUP));
    return out;
  }, [words]);

  const groupQuestions = useMemo(() => {
    if (!words || !groups[groupIdx]) return [];
    const dCount = Math.min(3, Math.max(1, words.length - 1));
    return groups[groupIdx].map((target) => {
      const distractors = shuffleArray(words.filter((w) => w.word !== target.word)).slice(0, dCount);
      const allOpts = shuffleArray([target, ...distractors]);
      return {
        audio: target.word,
        opts: allOpts.map((o) => o.word),
        answer: allOpts.findIndex((o) => o.word === target.word),
        point: "听力",
        cn: target.cn,
        example: target.example,
        wordId: target.wordId,
      };
    });
  }, [words, groups, groupIdx]);

  if (words === null)
    return <div className="rounded-2xl bg-white p-4 text-center text-sm text-[#5C5751]">加载中…</div>;
  if (groupQuestions.length === 0) return <EmptyStageNotice onContinue={onFinish} />;

  const tested = Math.min(words.length, (groupIdx + 1) * LW_GROUP);
  const remaining = words.length - tested;
  const isLastGroup = groupIdx >= groups.length - 1;

  if (between) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-card">
        <div className="mb-2 text-lg font-bold text-[#2C2C2A] dark:text-foreground">本组完成 🎉</div>
        <div className="mb-4 text-sm text-[#5C5751] dark:text-muted-foreground">
          本单元还有 <strong>{remaining}</strong> 个词没测,继续测下一组吗?
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            className="rounded-xl bg-[#378ADD] px-5 py-2 text-sm font-bold text-white"
            onClick={() => {
              setGroupIdx((g) => g + 1);
              setBetween(false);
            }}
          >
            继续下一组 →
          </button>
          <button
            type="button"
            className="rounded-xl border-2 border-[#EEEAE0] px-5 py-2 text-sm font-bold text-[#5C5751] dark:border-border dark:text-muted-foreground"
            onClick={onFinish}
          >
            先完成本关
          </button>
        </div>
      </div>
    );
  }

  return (
    <ListenMcStage
      key={groupIdx}
      title="听音辨词"
      instruction={`🎧 听一听,是哪个单词?(第 ${groupIdx + 1}/${groups.length} 组)`}
      questions={groupQuestions}
      grade={grade}
      onFinish={() => (isLastGroup ? onFinish() : setBetween(true))}
      onCorrect={(q) => onCorrect({ wordId: q?.wordId })}
      onWrong={onWrong}
    />
  );
}

function SentenceStage({ grade, onFinish }: { grade: number; onFinish: () => void }) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  const expand = (i: number) => {
    setExpanded((prev) => new Set(prev).add(i));
  };

  const allExpanded = expanded.size === SENTENCE_PATTERNS.length;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm">💬 学会 4 个核心句型，点击 🔊 听发音，展开看中文</div>
      {SENTENCE_PATTERNS.map((s, i) => (
        <div key={s.q} className={`mb-3 rounded-xl p-3 ${sentenceColorClass[s.color]}`}>
          <div className="mb-1.5 text-xs font-semibold">
            句型 {i + 1}：{s.type}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-[#378ADD] text-xs text-white"
              onClick={() => hubSpeak(s.q, 0.85, grade)}
            >
              🔊
            </button>
            <div className="flex-1 text-base font-semibold">{s.q}</div>
          </div>
          {expanded.has(i) ? (
            <div className="mt-2 border-t border-black/10 pt-2">
              <div className="text-sm">中文：{s.qCn}</div>
              {s.a && (
                <>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#378ADD] text-xs text-white"
                      onClick={() => hubSpeak(s.a, 0.85, grade)}
                    >
                      🔊
                    </button>
                    <div className="text-sm font-semibold">回答：{s.a}</div>
                  </div>
                  <div className="ml-10 mt-1 text-sm">{s.aCn}</div>
                </>
              )}
            </div>
          ) : (
            <button type="button" className="mt-2 text-xs opacity-70" onClick={() => expand(i)}>
              点击展开 ↓
            </button>
          )}
        </div>
      ))}
      <PrimaryButton disabled={!allExpanded} onClick={onFinish}>
        {allExpanded ? "✓ 句型学完！进入下一关 →" : "展开所有句型再继续"}
      </PrimaryButton>
    </div>
  );
}

function WriteStage({
  vocabulary,
  grade,
  onFinish,
  onCorrect,
  onWrong,
}: {
  vocabulary: VocabItem[];
  grade: number;
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (m: { q: string; opts: string[]; answer: number; point: string }) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [correct, setCorrect] = useState<Set<number>>(() => new Set());
  const [values, setValues] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, React.ReactNode>>({});
  const [disabled, setDisabled] = useState<Set<number>>(() => new Set());
  const [retrying, setRetrying] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    prefetchTTSBatchKid(
      vocabulary.map((v) => v.en),
      { grade },
    );
  }, [grade, vocabulary]);

  useEffect(() => {
    if (vocabulary.length > 0) {
      requestAnimationFrame(() => inputRefs.current[0]?.focus());
    }
  }, [vocabulary.length]);

  const focusNextUnanswered = useCallback(
    (afterIndex: number, answered: Set<number>) => {
      for (let j = afterIndex + 1; j < vocabulary.length; j++) {
        if (!answered.has(j)) {
          requestAnimationFrame(() => inputRefs.current[j]?.focus());
          return;
        }
      }
    },
    [vocabulary.length],
  );

  const check = (i: number, answer: string) => {
    if (disabled.has(i)) return;
    const userAnswer = (values[i] ?? "").trim().toLowerCase();
    const correctAnswer = answer.toLowerCase();
    if (userAnswer === "") {
      setFeedbacks((prev) => ({ ...prev, [i]: "⚠️ 请输入英文" }));
      return;
    }
    if (userAnswer === correctAnswer) {
      setFeedbacks((prev) => ({
        ...prev,
        [i]: <span className="font-semibold text-[#3B6D11]">✅ 完全正确！</span>,
      }));
      setDisabled((prev) => new Set(prev).add(i));
      setRetrying((prev) => {
        const next = new Set(prev);
        next.delete(i);
        return next;
      });
      setCorrect((prev) => {
        const next = new Set(prev).add(i);
        focusNextUnanswered(i, next);
        return next;
      });
      onCorrect();
      hubSpeak(answer, 0.85, grade);
    } else {
      setFeedbacks((prev) => ({
        ...prev,
        [i]: (
          <span className="text-[#A32D2D]">
            ❌ 正确答案：<strong>{answer}</strong> — 请重新输入
          </span>
        ),
      }));
      setValues((prev) => ({ ...prev, [i]: "" }));
      setRetrying((prev) => new Set(prev).add(i));
      onWrong({
        q: `默写：${vocabulary[i].cn}`,
        opts: [answer],
        answer: 0,
        point: "单词拼写",
      });
      hubSpeak(answer, 0.7, grade);
      requestAnimationFrame(() => inputRefs.current[i]?.focus());
    }
  };

  const done = correct.size === vocabulary.length;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm">✏️ 看中文输入英文</div>
      <div className="mb-3 text-xs text-[#888780]">💡 点击 🔊 可以听发音帮助记忆</div>
      {vocabulary.map((v, i) => (
        <div key={v.en} className="mb-4 border-b border-[#F4F0E6] pb-4 last:border-0">
          <div className="mb-2 flex items-center gap-2">
            {v.emoji && <span className="text-2xl">{v.emoji}</span>}
            <span className="flex-1 text-sm font-semibold">{v.cn}</span>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-full bg-[#378ADD] text-xs text-white"
              onClick={() => hubSpeak(v.en, 0.7, grade)}
            >
              🔊
            </button>
          </div>
          <div className="flex gap-2">
            <input
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              value={values[i] ?? ""}
              disabled={disabled.has(i)}
              placeholder={retrying.has(i) ? "请重新输入正确拼写..." : "输入英文..."}
              autoComplete="off"
              className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm outline-none ${
                disabled.has(i)
                  ? "border-[#97C459] bg-[#EAF3DE]"
                  : retrying.has(i)
                    ? "border-[#E24B4A] bg-[#FFF5F5] focus:border-[#E24B4A]"
                    : "border-[#EEEAE0] bg-white focus:border-[#FF6B35]"
              }`}
              onChange={(e) => setValues((prev) => ({ ...prev, [i]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  check(i, v.en);
                }
              }}
            />
            <button
              type="button"
              disabled={disabled.has(i)}
              className="rounded-xl bg-[#FF6B35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              onClick={() => check(i, v.en)}
            >
              检查
            </button>
          </div>
          {feedbacks[i] && <div className="mt-1.5 min-h-[14px] text-xs">{feedbacks[i]}</div>}
        </div>
      ))}
      <div className="rounded-xl bg-[#E6F1FB] p-2.5 text-center text-sm text-[#185FA5]">
        已答对：<span className="font-semibold">{correct.size}</span> / {vocabulary.length}
      </div>
      <PrimaryButton disabled={!done} onClick={onFinish}>
        {done ? "✓ 默写完成！进入下一关 →" : "完成默写再继续"}
      </PrimaryButton>
    </div>
  );
}

function FinalQuizStage({
  questions,
  unitId,
  unitTitle,
  grade,
  onFinish,
  onCorrect,
  onWrong,
  onAnswered,
}: {
  questions: FinalQuizItem[];
  unitId: string;
  unitTitle: string;
  grade?: number;
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (q: FinalQuizItem) => void;
  onAnswered?: (q: FinalQuizItem, isCorrect: boolean) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<React.ReactNode>(null);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  // 进关即预热听力题的 audio_text(云端 TTS 冷合成 ~1-3s)→ 用户做到听力题时 MP3 已在缓存,点🔊瞬时。
  useEffect(() => {
    const audios = questions.map((item) => item.audio).filter((a): a is string => !!a);
    if (audios.length) prefetchTTSBatchKid(audios, { grade, speed: 0.8 });
  }, [grade, questions]);

  const handlePick = (optIdx: number) => {
    if (answered) return;
    setAnswered(true);
    setPicked(optIdx);
    const isCorrect = optIdx === q.answer;
    onAnswered?.(q, isCorrect);
    if (isCorrect) {
      onCorrect();
      setFeedback(
        <div className="feedback-box success">
          ✨ 答对了！
          {q.explanation && <div className="mt-1 text-xs font-normal text-[#5C5751]">{q.explanation}</div>}
        </div>,
      );
    } else {
      onWrong({ ...q, unitTitle });
      setFeedback(
        <div className="feedback-box warning">
          💡 正确答案：<strong>{q.opts[q.answer]}</strong>
          {q.explanation && <div className="mt-1 text-xs font-normal text-[#5C5751]">{q.explanation}</div>}
        </div>,
      );
    }
  };

  const next = () => {
    if (isLast) {
      onFinish();
      return;
    }
    setIdx((i) => i + 1);
    setAnswered(false);
    setPicked(null);
    setFeedback(null);
  };

  useMcKeyboard({
    optionCount: q.opts.length,
    answered,
    onPick: handlePick,
    onNext: next,
  });

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex justify-between text-sm">
        <span className="text-[#888780]">
          第 {idx + 1} / {questions.length} 题
        </span>
        {q.point && (
          <span className="rounded-lg bg-[#FFE9AD] px-2 py-0.5 text-[11px] font-semibold text-[#854F0B]">
            {q.point}
          </span>
        )}
      </div>
      <div className="mb-4 text-base font-semibold leading-relaxed">{q.q}</div>
      {q.kind === "listening" && q.audio && (
        <button
          type="button"
          onClick={() => hubSpeak(q.audio!, 0.8, grade)}
          className="mb-4 inline-flex items-center gap-2 rounded-xl bg-[#FFE9AD] px-4 py-2 text-sm font-bold text-[#854F0B] active:scale-95"
        >
          🔊 播放句子
        </button>
      )}
      <QuizOpts opts={q.opts} answer={q.answer} picked={picked} answered={answered} onPick={handlePick} />
      {feedback}
      {answered && (
        <PrimaryButton onClick={next} className="mt-3">
          {isLast ? "查看成绩 →" : "下一题 →"}
        </PrimaryButton>
      )}
    </div>
  );
}

function GrammarStage({
  unit,
  grade,
  onFinish,
}: {
  unit: UnitDef;
  grade: number;
  onFinish: () => void;
}) {
  const pointId = useGrammarPointId(unit.grammarCode);
  const masteryPath = pointId ? `/junior/grammar/${pointId}/mastery` : null;
  const kpPracticeId = useKnowledgePointId(unit.grammarKpCode);

  // 单知识点专项：配了 grammarKpCode 的单元只练该 kp(优先于综合测/单点闯关)。
  if (unit.grammarKpCode && kpPracticeId) {
    const returnTo = encodeURIComponent(window.location.pathname);
    const kpPath = `/junior/grammar/kp/${kpPracticeId}?returnTo=${returnTo}`;
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm text-[#5C5751]">本单元语法专项练习：连续答对即点亮掌握度，成绩计入你的语法掌握。</p>
        <Link
          to={kpPath}
          className="mb-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white"
        >
          进入专项练习 →
        </Link>
        <button
          type="button"
          onClick={onFinish}
          className="w-full rounded-xl border border-indigo-200 py-2 text-sm text-indigo-600"
        >
          已完成，标记本关通过
        </button>
      </div>
    );
  }

  // 多语法点单元：走「综合测试」(合并抽题 + 按点算 Unit 掌握度)。
  if (unit.grammarCodes && unit.grammarCodes.length > 0) {
    const testPath = `/junior/unit-grammar/${grade}/${unit.id}`;
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm text-[#5C5751]">
          本单元语法综合测试：{unit.grammarCodes.length} 个语法点混合抽题，成绩计入你的掌握度。
        </p>
        <Link
          to={testPath}
          className="mb-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white"
        >
          进入综合测试 →
        </Link>
        <button
          type="button"
          onClick={onFinish}
          className="w-full rounded-xl border border-indigo-200 py-2 text-sm text-indigo-600"
        >
          已完成，标记本关通过
        </button>
      </div>
    );
  }

  // 接了考点的单元：只走真题题库的语法测试，不再铺写死的 grammarQuiz 水题。
  if (masteryPath) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm text-[#5C5751]">本单元语法用真题题库测练，成绩计入你的掌握度。</p>
        <Link
          to={masteryPath}
          className="mb-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white"
        >
          进入语法测试 →
        </Link>
        <button
          type="button"
          onClick={onFinish}
          className="w-full rounded-xl border border-indigo-200 py-2 text-sm text-indigo-600"
        >
          已完成，标记本关通过
        </button>
      </div>
    );
  }

  // 未接考点的单元（如 Starter）保留内联兜底测验。
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <FinalQuizStage
        questions={shuffleArray([...unit.grammarQuiz]).slice(0, 6)}
        unitId={unit.id}
        unitTitle={unit.title}
        onFinish={onFinish}
        onCorrect={() => {}}
        onWrong={() => {}}
      />
    </div>
  );
}

/** Hub 显示层清理 DB 题卷标题:去「七上/七下」「Unit\d+」「(X卷)」→ 只留主题;撞名保留卷别区分。不改 DB。 */
function cleanStageTitle(t: string): string {
  const s = (t || "")
    .replace(/七[上下]/g, "")
    .replace(/Unit\s*\d+/gi, "")
    .replace(/[（(][^)）]*[)）]/g, "")
    .replace(/阅读/g, "")
    .replace(/听力/g, "")
    .replace(/\s+/g, "")
    .replace(/^[·\-—、:：]+|[·\-—、:：]+$/g, "")
    .trim();
  return s || t;
}
function volMark(t: string): string {
  const m = (t || "").match(/[（(]\s*([^)）]+?)\s*[)）]/);
  return m ? m[1].trim() : "";
}
function buildDisplayTitles(
  rows: { id: string; title: string }[],
): { id: string; title: string; display: string }[] {
  const base = rows.map((r) => ({ ...r, b: cleanStageTitle(r.title), v: volMark(r.title) }));
  const counts: Record<string, number> = {};
  base.forEach((r) => (counts[r.b] = (counts[r.b] || 0) + 1));
  return base.map((r) => ({
    id: r.id,
    title: r.title,
    display: counts[r.b] > 1 && r.v ? `${r.b}·${r.v}` : r.b,
  }));
}

type JrRow = { id: string; title: string; word_count: number | null; difficulty: number | null };

function ReadingStage({
  unit,
  grade,
  onFinish,
  onWrong,
  markComplete,
}: {
  unit: UnitDef;
  grade: number;
  onFinish: () => void;
  onWrong: (q: QuizQuestion) => void;
  markComplete: () => void;
}) {
  // 有 DB 内容(已回填 volume/unit 的单元)→ 卡片列表(状态/词数/难度/成绩)+ 做过≥1篇标记本关通过;
  // 无 DB 内容(grade8/9/Starter)→ 回退原内联逻辑,行为不变。可复用:任何单元有对应 DB 阅读即此样式。
  const [dbRows, setDbRows] = useState<JrRow[] | null>(null);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const markedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [res, m] = await Promise.all([
        supabase
          .from("junior_reading")
          .select("id,title,word_count,difficulty")
          .eq("grade", grade)
          .eq("volume", unit.book)
          .eq("unit", unit.unitKey)
          .order("difficulty", { ascending: true }),
        loadMastery("junior_reading"),
      ]);
      if (cancelled) return;
      setDbRows((res.data ?? []) as JrRow[]);
      setMastery(m);
    })();
    return () => {
      cancelled = true;
    };
  }, [unit.id, unit.book, unit.unitKey, grade]);

  // 做过≥1篇 → 只标记本关通过(不跳总览、幂等);停留在卡片列表。
  useEffect(() => {
    if (!dbRows || dbRows.length === 0) return;
    const tried = dbRows.filter((r) => !!mastery[r.id]).length;
    if (tried >= 1 && !markedRef.current) {
      markedRef.current = true;
      markComplete();
    }
  }, [dbRows, mastery]); // eslint-disable-line react-hooks/exhaustive-deps

  if (dbRows === null) {
    return (
      <div className="rounded-2xl bg-white p-4 text-center text-sm text-[#5C5751]">加载中…</div>
    );
  }

  // ① 有 DB 内容:卡片列表(状态 ✓/▶/○ + 词数 + 难度★ + 最高分 + 操作)
  if (dbRows.length > 0) {
    const disp = buildDisplayTitles(dbRows);
    const cards = dbRows.map((r) => {
      const row = mastery[r.id];
      const best = row?.best_pct ?? null;
      const status: "done" | "progress" | "new" =
        !row ? "new" : best != null && best >= 80 ? "done" : "progress";
      return {
        id: r.id,
        word_count: r.word_count,
        difficulty: Math.max(1, r.difficulty ?? 1),
        display: disp.find((d) => d.id === r.id)?.display ?? r.title,
        best,
        status,
      };
    });
    const total = cards.length;
    const tried = cards.filter((c) => c.status !== "new").length;
    const pct = total ? Math.round((tried / total) * 100) : 0;
    const rec =
      cards.find((c) => c.status === "progress") ?? cards.find((c) => c.status === "new") ?? null;
    const enc = encodeURIComponent(window.location.pathname);
    const diffColor = (d: number) =>
      d >= 3 ? "text-rose-500" : d === 2 ? "text-amber-500" : "text-emerald-500";

    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-card">
        {/* 本关进度条 */}
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#2C2C2A] dark:text-foreground">
          <span>📖 本关进度</span>
          <span className="tabular-nums">{tried}/{total} 篇 · {pct}%</span>
        </div>
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mb-3 text-xs text-[#5C5751] dark:text-muted-foreground">选一篇开始 · 做过会标记 · 可反复练</p>

        {/* 卡片列表 */}
        <div className="space-y-2">
          {cards.map((c) => (
            <Link
              key={c.id}
              to={`/junior/reading/${c.id}?returnTo=${enc}`}
              className="flex items-center gap-3 rounded-2xl border border-[#EEEAE0] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow active:scale-[0.99] dark:border-border dark:bg-background/40"
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                  c.status === "done"
                    ? "bg-emerald-500/15 text-emerald-600"
                    : c.status === "progress"
                    ? "bg-amber-500/15 text-amber-600"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {c.status === "done" ? "✓" : c.status === "progress" ? "▶" : "○"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-[#2C2C2A] dark:text-foreground">
                  {c.display}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{c.word_count ?? "?"} 词</span>
                  <span className={diffColor(c.difficulty)}>{"★".repeat(c.difficulty)}</span>
                  {c.status === "done" && (
                    <span className="font-bold text-emerald-600">最高 {c.best}%</span>
                  )}
                  {c.status === "progress" && (
                    <span className="font-bold text-amber-600">最高 {c.best}%</span>
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white",
                  c.status === "done"
                    ? "bg-emerald-600"
                    : c.status === "progress"
                    ? "bg-amber-500"
                    : "bg-indigo-600",
                )}
              >
                {c.status === "done" ? "复习" : c.status === "progress" ? "继续" : "开始"}
              </span>
            </Link>
          ))}
        </div>

        {/* 建议下一篇 */}
        {rec ? (
          <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            👉 建议下一篇：{rec.display}
          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            🎉 本关全部完成，可随时复习
          </div>
        )}
      </div>
    );
  }

  // ② 无 DB 内容 → 回退原内联逻辑(其他单元/Starter,零变化)
  const reading = unit.reading;
  if (!reading?.questions.length) {
    return (
      <div className="rounded-2xl bg-white p-4 text-center text-sm">
        暂无阅读题
        <PrimaryButton onClick={onFinish} className="mt-4">
          继续
        </PrimaryButton>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-4 rounded-xl bg-[#F0F4FF] p-3 text-sm leading-relaxed">
        <p className="mb-2">{reading.passage}</p>
      </div>
      <FinalQuizStage
        questions={shuffleArray(reading.questions).slice(0, 6)}
        unitId={unit.id}
        unitTitle={unit.title}
        onFinish={onFinish}
        onCorrect={() => {}}
        onWrong={onWrong}
      />
    </div>
  );
}

// 完形填空关:读 junior_cloze 取本单元完形 → 卡片列表 → 跳 /junior/cloze/:id?returnTo;
// 做过 ≥1 篇 markComplete 本关通过。无 DB 完形 → 空兜底(其它单元/未灌数据时)。
function ClozeStage({
  unit,
  grade,
  onFinish,
  markComplete,
}: {
  unit: UnitDef;
  grade: number;
  onFinish: () => void;
  markComplete: () => void;
}) {
  const [dbRows, setDbRows] = useState<JrRow[] | null>(null);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const markedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [res, m] = await Promise.all([
        supabase
          .from("junior_cloze")
          .select("id,title,word_count,difficulty")
          .eq("grade", grade)
          .eq("volume", unit.book)
          .eq("unit", unit.unitKey)
          .order("sort_order", { ascending: true }),
        loadMastery("junior_cloze"),
      ]);
      if (cancelled) return;
      setDbRows((res.data ?? []) as JrRow[]);
      setMastery(m);
    })();
    return () => {
      cancelled = true;
    };
  }, [unit.id, unit.book, unit.unitKey, grade]);

  useEffect(() => {
    if (!dbRows || dbRows.length === 0) return;
    const tried = dbRows.filter((r) => !!mastery[r.id]).length;
    if (tried >= 1 && !markedRef.current) {
      markedRef.current = true;
      markComplete();
    }
  }, [dbRows, mastery]); // eslint-disable-line react-hooks/exhaustive-deps

  if (dbRows === null) {
    return <div className="rounded-2xl bg-white p-4 text-center text-sm text-[#5C5751]">加载中…</div>;
  }
  if (dbRows.length === 0) {
    return <EmptyStageNotice onContinue={onFinish} />;
  }

  // 完形标题取冒号后的英文部分(保留单词间空格;不用 buildDisplayTitles——它会去掉英文空格)。
  const clozeDisplay = (t: string) => {
    const p = (t || "").split(/[:：]/);
    return ((p.length > 1 ? p.slice(1).join(":") : t).trim() || t);
  };
  const cards = dbRows.map((r) => {
    const row = mastery[r.id];
    const best = row?.best_pct ?? null;
    const status: "done" | "progress" | "new" = !row ? "new" : best != null && best >= 80 ? "done" : "progress";
    return { id: r.id, word_count: r.word_count, difficulty: Math.max(1, r.difficulty ?? 1), display: clozeDisplay(r.title), best, status };
  });
  const total = cards.length;
  const tried = cards.filter((c) => c.status !== "new").length;
  const pct = total ? Math.round((tried / total) * 100) : 0;
  const rec = cards.find((c) => c.status === "progress") ?? cards.find((c) => c.status === "new") ?? null;
  const enc = encodeURIComponent(window.location.pathname);
  const diffColor = (d: number) => (d >= 3 ? "text-rose-500" : d === 2 ? "text-amber-500" : "text-emerald-500");

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-card">
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#2C2C2A] dark:text-foreground">
        <span>📝 本关进度</span>
        <span className="tabular-nums">{tried}/{total} 篇 · {pct}%</span>
      </div>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mb-3 text-xs text-[#5C5751] dark:text-muted-foreground">选一篇完形开始 · 做过会标记 · 可反复练</p>

      <div className="space-y-2">
        {cards.map((c) => (
          <Link
            key={c.id}
            to={`/junior/cloze/${c.id}?returnTo=${enc}`}
            className="flex items-center gap-3 rounded-2xl border border-[#EEEAE0] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow active:scale-[0.99] dark:border-border dark:bg-background/40"
          >
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold", c.status === "done" ? "bg-emerald-500/15 text-emerald-600" : c.status === "progress" ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground")}>
              {c.status === "done" ? "✓" : c.status === "progress" ? "▶" : "○"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-[#2C2C2A] dark:text-foreground">{c.display}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{c.word_count ?? "?"} 词</span>
                <span className={diffColor(c.difficulty)}>{"★".repeat(c.difficulty)}</span>
                {(c.status === "done" || c.status === "progress") && <span className={cn("font-bold", c.status === "done" ? "text-emerald-600" : "text-amber-600")}>最高 {c.best}%</span>}
              </div>
            </div>
            <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white", c.status === "done" ? "bg-emerald-600" : c.status === "progress" ? "bg-amber-500" : "bg-indigo-600")}>
              {c.status === "done" ? "复习" : c.status === "progress" ? "继续" : "开始"}
            </span>
          </Link>
        ))}
      </div>

      {rec ? (
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">👉 建议下一篇：{rec.display}</div>
      ) : (
        <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">🎉 本关全部完成，可随时复习</div>
      )}
    </div>
  );
}

function ListeningStage({
  unit,
  grade,
  inlineQuestions,
  markComplete,
  onFinish,
  onCorrect,
  onWrong,
}: {
  unit: UnitDef;
  grade: number;
  inlineQuestions: ListeningQuestion[];
  markComplete: () => void;
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (q: ListeningQuestion) => void;
}) {
  // 有 DB 内容(已回填 volume/unit)→ 卡片列表(状态/题数/最高分)+ 做过≥1条标记本关通过(镜像阅读);
  // 无 DB 内容(grade8/9/Starter,volume/unit 为 NULL)→ 回退原内联 ListenMcStage,行为不变。
  const [dbRows, setDbRows] = useState<{ id: string; title: string; qCount: number }[] | null>(null);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const markedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [res, m] = await Promise.all([
        supabase
          .from("junior_listening_exercises")
          .select("id,title,questions")
          .eq("grade", grade)
          .eq("volume", unit.book)
          .eq("unit", unit.unitKey)
          .order("difficulty", { ascending: true }),
        loadMastery("junior_listening"),
      ]);
      if (cancelled) return;
      const rows = ((res.data ?? []) as { id: string; title: string; questions: unknown }[]).map((r) => ({
        id: r.id,
        title: r.title,
        qCount: Array.isArray(r.questions) ? r.questions.length : 0,
      }));
      setDbRows(rows);
      setMastery(m);
    })();
    return () => {
      cancelled = true;
    };
  }, [unit.id, unit.book, unit.unitKey, grade]);

  // 做过≥1条 → 只标记本关通过(不跳总览、幂等);停留卡片列表(同阅读)。
  useEffect(() => {
    if (!dbRows || dbRows.length === 0) return;
    const tried = dbRows.filter((r) => !!mastery[r.id]).length;
    if (tried >= 1 && !markedRef.current) {
      markedRef.current = true;
      markComplete();
    }
  }, [dbRows, mastery]); // eslint-disable-line react-hooks/exhaustive-deps

  if (dbRows === null) {
    return (
      <div className="rounded-2xl bg-white p-4 text-center text-sm text-[#5C5751]">加载中…</div>
    );
  }

  // ① 有 DB 内容:卡片列表(状态 ✓/▶/○ + 题数 + 最高分 + 操作);难度★省略(听力全★1,无梯度)
  if (dbRows.length > 0) {
    // 标题取中点 · 后部分,保留英文空格(不用 buildDisplayTitles——它经 cleanStageTitle 会删英文词间空格)。
    // 旧库"…听力·短对话(C卷)"→"短对话(C卷)"(含卷号区分同单元多条);新库"…听力·The Fox and the Grapes"→保留空格。
    const listeningDisplay = (t: string) => {
      const p = (t || "").split("·");
      return ((p.length > 1 ? p.slice(1).join("·") : t).trim() || t);
    };
    // 新库标题格式"…听力·中文 English":首个空格前为中文(主行),其后为英文(副行)。
    // 无空格(旧标题/纯中文)则全部当主行、副行空。
    const splitTitle = (d: string) => {
      const i = d.indexOf(" ");
      return i < 0 ? { zh: d, en: "" } : { zh: d.slice(0, i), en: d.slice(i + 1) };
    };
    const cards = dbRows.map((r) => {
      const row = mastery[r.id];
      const best = row?.best_pct ?? null;
      const status: "done" | "progress" | "new" =
        !row ? "new" : best != null && best >= 80 ? "done" : "progress";
      return {
        id: r.id,
        qCount: r.qCount,
        display: listeningDisplay(r.title),
        best,
        status,
      };
    });
    const total = cards.length;
    const tried = cards.filter((c) => c.status !== "new").length;
    const pct = total ? Math.round((tried / total) * 100) : 0;
    const rec =
      cards.find((c) => c.status === "progress") ?? cards.find((c) => c.status === "new") ?? null;
    const enc = encodeURIComponent(window.location.pathname);

    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-card">
        {/* 本关进度条 */}
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#2C2C2A] dark:text-foreground">
          <span>🎧 本关进度</span>
          <span className="tabular-nums">{tried}/{total} 条 · {pct}%</span>
        </div>
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mb-3 text-xs text-[#5C5751] dark:text-muted-foreground">选一条开始 · 做过会标记 · 可反复练</p>

        {/* 卡片列表 */}
        <div className="space-y-2">
          {cards.map((c) => (
            <Link
              key={c.id}
              to={`/junior/listening/${c.id}?returnTo=${enc}`}
              className="flex items-center gap-3 rounded-2xl border border-[#EEEAE0] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow active:scale-[0.99] dark:border-border dark:bg-background/40"
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                  c.status === "done"
                    ? "bg-emerald-500/15 text-emerald-600"
                    : c.status === "progress"
                    ? "bg-amber-500/15 text-amber-600"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {c.status === "done" ? "✓" : c.status === "progress" ? "▶" : "○"}
              </span>
              <div className="min-w-0 flex-1">
                {(() => {
                  const { zh, en } = splitTitle(c.display);
                  return (
                    <div className="truncate text-sm font-bold leading-snug text-[#2C2C2A] dark:text-foreground">
                      {zh}
                      {en && (
                        <span className="ml-1.5 font-medium text-[#8A857D] dark:text-muted-foreground">
                          {en}
                        </span>
                      )}
                    </div>
                  );
                })()}
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{c.qCount} 题</span>
                  {c.status === "done" && (
                    <span className="font-bold text-emerald-600">最高 {c.best}%</span>
                  )}
                  {c.status === "progress" && (
                    <span className="font-bold text-amber-600">最高 {c.best}%</span>
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white",
                  c.status === "done"
                    ? "bg-emerald-600"
                    : c.status === "progress"
                    ? "bg-amber-500"
                    : "bg-indigo-600",
                )}
              >
                {c.status === "done" ? "复习" : c.status === "progress" ? "继续" : "开始"}
              </span>
            </Link>
          ))}
        </div>

        {/* 建议下一条 */}
        {rec ? (
          <div className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
            👉 建议下一条：{rec.display}
          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            🎉 本关全部完成，可随时复习
          </div>
        )}
      </div>
    );
  }

  // ② 无 DB 内容 → 回退原内联 ListenMcStage(其他单元/Starter,零变化)
  if (inlineQuestions.length === 0) return <EmptyStageNotice onContinue={onFinish} />;
  return (
    <ListenMcStage
      title="听力短文"
      instruction="🎧 听一听，选正确答案"
      questions={inlineQuestions}
      grade={grade}
      onFinish={onFinish}
      onCorrect={onCorrect}
      onWrong={onWrong}
    />
  );
}

type WritingResult = {
  score: number;
  overall: string;
  mistakes: { original: string; corrected: string; explanation: string }[];
  suggestions: string[];
  improved: string;
  model_essay?: string; // 独立优秀范文(向后兼容:旧后端无此字段则为空)
};

/** 单元写作关合成 prompt_id(无FK,稳定可复现):按 book+unitKey 派生 uuid,用于 attempts 存档/掌握度。 */
function writingPromptId(unit: UnitDef): string {
  const key = `${unit.book}-${unit.unitKey}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const hex = h.toString(16).padStart(8, "0");
  return `a7717b00-0000-4000-8000-0000${hex}`;
}

function WritingStage({ unit, grade, onFinish }: { unit: UnitDef; grade: number; onFinish: () => void }) {
  const w = unit.writing;
  // 真写作(AI批改):7B 全 8 单元(内联 writing prompt 均就绪);其余年级(7A/Starter/8/9)走原"水关"逻辑不变。
  const realWriting = unit.book === "7B";
  // hooks 必须无条件先执行(放在任何 early-return 之前)。
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WritingResult | null>(null);
  const minWords = w?.minWords ?? 40;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  // ── 原水关(非 7B U1):行为零变化 ──
  if (!realWriting) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 text-lg font-bold">✍️ 写作练习</div>
        <p className="mb-2 text-sm">{w?.promptCn}</p>
        <p className="mb-3 text-xs text-[#888780]">{w?.prompt}</p>
        {w?.sampleWords?.length ? (
          <p className="mb-3 text-xs">建议用词：{w.sampleWords.join(", ")}</p>
        ) : null}
        <textarea
          className="mb-3 min-h-[120px] w-full rounded-xl border border-[#EEEAE0] p-3 text-sm"
          placeholder="在这里写下你的英文句子…"
        />
        <PrimaryButton onClick={onFinish}>完成写作关 →</PrimaryButton>
      </div>
    );
  }

  // ── 真写作关(7B U1):textarea → check-writing 批改 → 反馈 + 存档 + 奖励;提交即过关 ──
  const submit = async () => {
    if (loading) return;
    if (wordCount < minWords) {
      toast.error(`再写一点吧，至少 ${minWords} 词`); // 词数不够温和提示,不报错不阻塞
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-writing", {
        body: {
          prompt: w?.prompt ?? "",
          promptCn: w?.promptCn ?? "",
          sample: "",
          text,
          lessonTitle: w?.topic ?? unit.title,
          targetLanguage: "Chinese",
        },
      });
      if (error) throw error;
      const r = data as WritingResult;
      setResult(r);
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        await supabase.from("junior_writing_attempts").insert({
          user_id: u.user.id,
          prompt_id: writingPromptId(unit),
          text,
          word_count: wordCount,
          overall_score: Math.round(r.score),
          feedback_cn: r.overall,
          corrections: r.mistakes ?? [],
          highlights: r.suggestions ?? [],
        });
      }
      // 低分也奖励(鼓励),分数越高奖励越多。
      const reward = Math.max(5, Math.min(30, Math.round((r.score ?? 0) / 5)));
      await awardCoins(reward, "junior_writing");
      await bumpPetSkill("writer_pen", 1);
      recordUnifiedAttempt({
        stage: "junior",
        grade,
        module: "writing",
        item_type: "essay",
        item_id: writingPromptId(unit),
        item_label: w?.topic ?? unit.title,
        is_correct: true, // 提交即记为完成(写作不卡分)
        context: { score: Math.round(r.score ?? 0), word_count: wordCount },
      }).catch(() => {});
      celebrateScore(Math.round(r.score ?? 0));
    } catch (e) {
      toast.error((e as Error)?.message || "批改失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-card">
      <div className="mb-2 text-lg font-bold">✍️ 写作练习</div>
      <p className="mb-1 text-sm">{w?.promptCn}</p>
      <p className="mb-2 text-xs text-[#888780]">{w?.prompt}</p>
      {w?.sampleWords?.length ? (
        <p className="mb-3 text-xs text-[#888780]">建议用词：{w.sampleWords.join(", ")}</p>
      ) : null}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder={`请用英语写作（建议 ${minWords} 词以上）…`}
        className="mb-2 min-h-[140px] w-full rounded-xl border border-[#EEEAE0] p-3 text-sm leading-relaxed"
      />
      <div className="mb-3 flex items-center justify-between text-xs text-[#888780]">
        <span>{wordCount} 词 · 目标 {minWords}+ 词</span>
        {!result && (
          <button
            disabled={loading}
            onClick={submit}
            className="rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-600 px-5 py-2 text-sm font-extrabold text-white shadow disabled:opacity-60"
          >
            {loading ? "AI 批改中…" : "✨ 提交 AI 批改"}
          </button>
        )}
      </div>
      {/* 低调兜底:check-writing 偶发故障/超时时,孩子写了却卡住 → 可跳过(不存档/不奖励)。主路径仍是写+提交+看反馈。 */}
      {!result && !loading && (
        <div className="mb-2 text-right">
          <button
            onClick={onFinish}
            className="text-[11px] text-[#B5B0A8] underline-offset-2 hover:underline"
          >
            遇到问题？跳过本关
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 p-4 text-white">
            <div className="text-xs uppercase tracking-wider opacity-80">AI 综合评分</div>
            <div className="mt-1 text-3xl font-black">
              {Math.round(result.score ?? 0)} <span className="text-sm font-bold opacity-80">/ 100</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed">{result.overall}</p>
          </div>
          {result.mistakes?.length > 0 && (
            <div className="rounded-2xl border bg-card p-3">
              <div className="text-sm font-extrabold">✏️ 修改建议（{result.mistakes.length}）</div>
              <ul className="mt-2 space-y-2 text-xs">
                {result.mistakes.map((m, i) => (
                  <li key={i} className="rounded-lg bg-muted/50 p-2">
                    <div className="text-rose-500 line-through">{m.original}</div>
                    <div className="font-bold text-emerald-600">{m.corrected}</div>
                    <div className="mt-1 text-muted-foreground">{m.explanation}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.suggestions?.length > 0 && (
            <div className="rounded-2xl border bg-card p-3">
              <div className="text-sm font-extrabold">💡 提升建议</div>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {result.improved && (
            <div className="rounded-2xl border bg-card p-3">
              <div className="text-sm font-extrabold">⭐ AI 改写范文（你这篇修好的样子）</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{result.improved}</div>
            </div>
          )}
          {result.model_essay && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-900/40 dark:bg-sky-950/20">
              <div className="text-sm font-extrabold text-sky-700 dark:text-sky-300">📖 优秀范文（参考）</div>
              <p className="mt-1 text-[11px] text-sky-700/80 dark:text-sky-400/80">
                这是一篇同题目的参考范文，学学里面的表达和句式，下次试着用上 💪
              </p>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-sky-950 dark:text-sky-100">
                {result.model_essay}
              </div>
            </div>
          )}
          <PrimaryButton onClick={onFinish}>完成写作关 →</PrimaryButton>
        </div>
      )}
    </div>
  );
}

/**
 * 空数据关卡统一兜底:在分发层(switch)挂载题目组件之前判空,空数据时渲染本兜底而非
 * 挂载 ListenMcStage / FinalQuizStage(它们对空题目数组会在 q.opts 处白屏)。
 * 判空放在组件外、不进组件内部 early-return,避免踩 React hooks 规则。
 */
function EmptyStageNotice({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center text-sm">
      本关内容正在完善中,敬请期待
      <PrimaryButton onClick={onContinue} className="mt-4">
        继续
      </PrimaryButton>
    </div>
  );
}

export default function JuniorHubStagePlay({ unitId, stageIdx, onComplete, onBack }: Props) {
  const { grade, state, setState, addMistake, completeStage } = useJuniorHub();
  const unit = findUnit(unitId);
  const stage = unit?.stages[stageIdx];

  const us = getUnitState(state, unitId);
  const stars = state.units[unitId]?.stars ?? us.stars;

  const addStar = useCallback(() => {
    setState((prev) => {
      const current = prev.units[unitId] ?? {
        completedStages: [],
        stars: 0,
        firstCompleteDate: null,
        lastAiTestAtProgress: 0,
      };
      const next = {
        ...prev,
        units: {
          ...prev.units,
          [unitId]: { ...current, stars: current.stars + 1 },
        },
      };
      savePersist(grade, next);
      return next;
    });
  }, [grade, setState, unitId]);

  const handleFinish = useCallback(() => {
    const needAi = completeStage(unitId, stageIdx);
    onComplete(needAi);
  }, [completeStage, onComplete, stageIdx, unitId]);

  // 从专区 play 页做完后带 ?done=1 返回 → 标记本关通过(替代旧"标记本关通过"按钮)。ref 防重。
  const [hubSearch] = useSearchParams();
  const doneHandledRef = useRef(false);
  useEffect(() => {
    if (hubSearch.get("done") === "1" && !doneHandledRef.current) {
      doneHandledRef.current = true;
      handleFinish();
    }
  }, [hubSearch, handleFinish]);

  const listenSentQuestions = useMemo(() => {
    if (!unit) return [];
    return shuffleArray([...unit.listeningQuestions]).slice(0, 6);
  }, [unit]);

  const finalQuizQuestions = useMemo(() => {
    if (!unit) return [];
    return shuffleArray([...unit.quizQuestions]).slice(0, 10);
  }, [unit]);

  // 自适应单元综合测验:7B 全 8 单元 + 八年级(8A/8B)16 单元。
  // 语法走 DB(grammarCodes 抽 7 题·自适应),听力 8 年级无 junior_listening_items → 内联 listeningQuestions 回退(TTS),词汇 vocabulary 动态生成 2 题 = 12 题。
  // 其余年级(7A/Starter/9, book 不在表内)仍走内联 quizQuestions;空池/失败也回退内联。
  const adaptiveFinalUnit = !!unit && ["7B", "8A", "8B"].includes(unit.book);
  // undefined = 加载中;null = 用内联回退;数组 = 自适应题目。
  const [finalAdaptive, setFinalAdaptive] = useState<FinalQuizItem[] | null | undefined>(undefined);
  useEffect(() => {
    if (!unit || stage?.type !== "finalQuiz" || !adaptiveFinalUnit) {
      setFinalAdaptive(null); // 非自适应单元/非本关 → 直接走内联回退
      return;
    }
    let cancelled = false;
    setFinalAdaptive(undefined);
    buildFinalQuiz(unit)
      .then((items) => {
        if (!cancelled) setFinalAdaptive(items); // items 为 null(空池)时也回退内联
      })
      .catch((e) => {
        console.error("[finalQuiz] buildFinalQuiz", e);
        if (!cancelled) setFinalAdaptive(null);
      });
    return () => {
      cancelled = true;
    };
  }, [unit, stage?.type, adaptiveFinalUnit]);

  if (!unit || !stage) return null;

  const stageBody = (() => {
    switch (stage.type) {
      case "vocab":
        return <VocabStage vocabulary={unit.vocabulary} grade={grade} onFinish={handleFinish} />;
      case "listenWord":
        // 数据源:junior_vocab 全单元词(分组12);无 DB 词回退 JSON。选对加星+写词汇掌握度(listen)。
        return (
          <ListenWordStage
            unit={unit}
            grade={grade}
            onFinish={handleFinish}
            onCorrect={(q) => {
              addStar();
              if (q.wordId) void recordJuniorWordMastery({ wordId: q.wordId, grade, kind: "listen", isCorrect: true });
            }}
            onWrong={(q) => {
              addMistake({
                q: `听音选词：${q.audio}`,
                opts: q.opts,
                answer: q.answer,
                point: "听力",
                audio: q.audio,
                unitId,
                unitTitle: unit.title,
              });
              if (q.wordId) void recordJuniorWordMastery({ wordId: q.wordId, grade, kind: "listen", isCorrect: false });
            }}
          />
        );
      case "match":
        return (
          <WordMatchingGame
            vocabulary={unit.vocabulary}
            grade={grade}
            onFinish={handleFinish}
            onMatch={addStar}
            batchSize={8}
          />
        );
      case "grammar":
        // 数据源 unit.grammarQuiz(内联水题);空时走兜底(GrammarStage 内部用它喂 FinalQuizStage,会白屏)。
        // 例外:有 grammarCodes 的单元走 JuniorUnitGrammarTest 从 DB 按 point 抽题,不依赖 grammarQuiz,放行进 GrammarStage。
        if (unit.grammarQuiz.length === 0 && !(unit.grammarCodes && unit.grammarCodes.length > 0) && !unit.grammarKpCode)
          return <EmptyStageNotice onContinue={handleFinish} />;
        return <GrammarStage unit={unit} grade={grade} onFinish={handleFinish} />;
      case "reading":
        return (
          <ReadingStage
            unit={unit}
            grade={grade}
            markComplete={() => completeStage(unitId, stageIdx)}
            onFinish={handleFinish}
            onWrong={(q) =>
              addMistake({
                q: q.q,
                opts: q.opts,
                answer: q.answer,
                point: q.point ?? "阅读",
                unitId,
                unitTitle: unit.title,
              })
            }
          />
        );
      case "cloze":
        // 完形关:读 junior_cloze 取本单元完形 → 卡片列表 → /junior/cloze/:id?returnTo。无数据走空兜底。
        return (
          <ClozeStage
            unit={unit}
            grade={grade}
            markComplete={() => completeStage(unitId, stageIdx)}
            onFinish={handleFinish}
          />
        );
      case "listening":
        // 有 DB(volume/unit)→ Link 专区 play + returnTo 回单元关;无则回退内联 ListenMcStage。
        return (
          <ListeningStage
            unit={unit}
            grade={grade}
            inlineQuestions={listenSentQuestions as ListeningQuestion[]}
            markComplete={() => completeStage(unitId, stageIdx)}
            onFinish={handleFinish}
            onCorrect={addStar}
            onWrong={(q) =>
              addMistake({
                q: `听力：${q.audio}`,
                opts: q.opts,
                answer: q.answer,
                point: "听力",
                audio: q.audio,
                unitId,
                unitTitle: unit.title,
              })
            }
          />
        );
      case "writing":
        return <WritingStage unit={unit} grade={grade} onFinish={handleFinish} />;
      case "finalQuiz": {
        // 自适应单元(7B + 八年级 8A/8B):加载中显示提示;失败/空池 finalAdaptive=null → 回退内联静态题。
        if (adaptiveFinalUnit && finalAdaptive === undefined)
          return (
            <div className="rounded-2xl bg-white p-4 text-center text-sm text-[#5C5751]">
              正在为你组卷…
            </div>
          );
        // finalAdaptive 为数组用自适应,否则回退内联 quizQuestions。
        const finalItems: FinalQuizItem[] =
          finalAdaptive && finalAdaptive.length > 0
            ? finalAdaptive
            : (finalQuizQuestions as FinalQuizItem[]);
        if (finalItems.length === 0)
          return <EmptyStageNotice onContinue={handleFinish} />;
        return (
          <FinalQuizStage
            questions={finalItems}
            unitId={unitId}
            unitTitle={unit.title}
            grade={grade}
            onFinish={handleFinish}
            onCorrect={addStar}
            onAnswered={(item, isCorrect) => {
              // 语法题写 junior_user_mastery(和语法专区/错题复习同步);听力/词汇不写。
              if (item.kind === "grammar" && item.pointId) {
                recordJuniorGrammarAttempt({
                  pointId: item.pointId,
                  kpId: item.kpId ?? undefined,
                  questionId: item.questionId,
                  questionType: "mcq",
                  isCorrect,
                }).catch(() => {});
              }
            }}
            onWrong={(q) =>
              addMistake({
                q: q.q,
                opts: q.opts,
                answer: q.answer,
                point: q.point ?? "综合",
                unitId,
                unitTitle: unit.title,
              })
            }
          />
        );
      }
      default:
        return null;
    }
  })();

  return (
    <StageShell stageIdx={stageIdx} stageTitle={stage.title} unit={unit} stars={stars} onBack={onBack}>
      {stageBody}
    </StageShell>
  );
}
