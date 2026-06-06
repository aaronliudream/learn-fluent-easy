import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { findUnit } from "@/lib/juniorHub/courseData";
import { shuffleArray, useJuniorHub } from "@/lib/juniorHub/context";
import { getUnitState, savePersist } from "@/lib/juniorHub/storage";
import { hubSpeak } from "@/lib/primaryHub/speech";
import { prefetchTTSBatchKid } from "@/lib/speak";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import WordMatchingGame from "@/components/hub/WordMatchingGame";
import type { ListeningQuestion, QuizQuestion, UnitDef, VocabItem } from "@/lib/juniorHub/types";
import { Link } from "react-router-dom";
import { useGrammarPointId } from "@/hooks/useGrammarPointId";

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
      { grade },
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
                  <div className="text-2xl">{v.emoji}</div>
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
                  <div className="text-2xl">{v.emoji}</div>
                  <div className="mt-1 text-sm font-bold text-[#FF6B35]">{v.cn}</div>
                  <div className="mt-1 text-xs text-[#888780]">{v.en}</div>
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
  questions: Array<{ audio: string; opts: string[]; answer: number; point?: string }>;
  grade: number;
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (q: { audio: string; opts: string[]; answer: number; point?: string }) => void;
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
      { grade },
    );
  }, [grade, questions]);

  const handlePick = (optIdx: number) => {
    if (answered) return;
    setAnswered(true);
    setPicked(optIdx);
    const isCorrect = optIdx === q.answer;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      onCorrect();
      setFeedback(<div className="feedback-box success">✨ {title.includes("句") ? "听力真棒！" : "听对了！"}</div>);
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
            <span className="text-2xl">{v.emoji}</span>
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
  onFinish,
  onCorrect,
  onWrong,
}: {
  questions: QuizQuestion[];
  unitId: string;
  unitTitle: string;
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (q: QuizQuestion) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<React.ReactNode>(null);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  const handlePick = (optIdx: number) => {
    if (answered) return;
    setAnswered(true);
    setPicked(optIdx);
    const isCorrect = optIdx === q.answer;
    if (isCorrect) {
      onCorrect();
      setFeedback(<div className="feedback-box success">✨ 答对了！</div>);
    } else {
      onWrong({ ...q, unitId, unitTitle });
      setFeedback(
        <div className="feedback-box warning">
          💡 正确答案：<strong>{q.opts[q.answer]}</strong>
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

function ReadingStage({
  unit,
  onFinish,
  onWrong,
}: {
  unit: UnitDef;
  onFinish: () => void;
  onWrong: (q: QuizQuestion) => void;
}) {
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

function WritingStage({ unit, onFinish }: { unit: UnitDef; onFinish: () => void }) {
  const w = unit.writing;
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

  const listenWordQuestions = useMemo(() => {
    if (!unit) return [];
    const shuffled = shuffleArray([...unit.vocabulary]);
    return shuffled.slice(0, 6).map((target) => {
      const distractors = shuffleArray(unit.vocabulary.filter((v) => v.en !== target.en)).slice(0, 3);
      const allOpts = shuffleArray([target, ...distractors]);
      return {
        audio: target.en,
        opts: allOpts.map((o) => o.en),
        answer: allOpts.findIndex((o) => o.en === target.en),
        point: "听力",
      };
    });
  }, [unit]);

  const listenSentQuestions = useMemo(() => {
    if (!unit) return [];
    return shuffleArray([...unit.listeningQuestions]).slice(0, 6);
  }, [unit]);

  const finalQuizQuestions = useMemo(() => {
    if (!unit) return [];
    return shuffleArray([...unit.quizQuestions]).slice(0, 10);
  }, [unit]);

  if (!unit || !stage) return null;

  const stageBody = (() => {
    switch (stage.type) {
      case "vocab":
        return <VocabStage vocabulary={unit.vocabulary} grade={grade} onFinish={handleFinish} />;
      case "listenWord":
        // 数据源 unit.vocabulary 现场生成;空 vocab → 0 题 → 走兜底,不挂载 ListenMcStage。
        if (listenWordQuestions.length === 0)
          return <EmptyStageNotice onContinue={handleFinish} />;
        return (
          <ListenMcStage
            title="听音辨词"
            instruction="🎧 听一听，是哪个单词？"
            questions={listenWordQuestions}
            grade={grade}
            onFinish={handleFinish}
            onCorrect={addStar}
            onWrong={(q) =>
              addMistake({
                q: `听音选词：${q.audio}`,
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
      case "match":
        return (
          <WordMatchingGame
            vocabulary={unit.vocabulary}
            grade={grade}
            onFinish={handleFinish}
            onMatch={addStar}
          />
        );
      case "grammar":
        // 数据源 unit.grammarQuiz;空时走兜底(GrammarStage 内部用它喂 FinalQuizStage,会白屏)。
        if (unit.grammarQuiz.length === 0)
          return <EmptyStageNotice onContinue={handleFinish} />;
        return <GrammarStage unit={unit} grade={grade} onFinish={handleFinish} />;
      case "reading":
        return (
          <ReadingStage
            unit={unit}
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
      case "listening":
        // 数据源 unit.listeningQuestions;空时走兜底,不挂载 ListenMcStage。
        if (listenSentQuestions.length === 0)
          return <EmptyStageNotice onContinue={handleFinish} />;
        return (
          <ListenMcStage
            title="听力短文"
            instruction="🎧 听一听，选正确答案"
            questions={listenSentQuestions as ListeningQuestion[]}
            grade={grade}
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
        return <WritingStage unit={unit} onFinish={handleFinish} />;
      case "finalQuiz":
        // 数据源 unit.quizQuestions;空时走兜底,不挂载 FinalQuizStage。
        if (finalQuizQuestions.length === 0)
          return <EmptyStageNotice onContinue={handleFinish} />;
        return (
          <FinalQuizStage
            questions={finalQuizQuestions}
            unitId={unitId}
            unitTitle={unit.title}
            onFinish={handleFinish}
            onCorrect={addStar}
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
