import { useCallback, useMemo, useState } from "react";
import { findUnit } from "@/lib/primaryHub/courseData";
import { shuffleArray, usePrimaryHub } from "@/lib/primaryHub/context";
import { getUnitState, savePersist } from "@/lib/primaryHub/storage";
import { hubSpeak } from "@/lib/primaryHub/speech";
import type { ListeningQuestion, QuizQuestion, UnitDef, VocabItem } from "@/lib/primaryHub/types";

type Props = {
  unitId: string;
  stageIdx: number;
  onComplete: (needAiTest: boolean) => void;
  onBack: () => void;
};

const SENTENCE_COLORS = ["blue", "yellow", "green", "pink"] as const;

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
  onFinish,
}: {
  vocabulary: VocabItem[];
  onFinish: () => void;
}) {
  const [viewed, setViewed] = useState<Set<number>>(() => new Set());
  const [flipped, setFlipped] = useState<Set<number>>(() => new Set());

  const toggleCard = (i: number) => {
    const v = vocabulary[i];
    const isFlipped = flipped.has(i);
    if (!isFlipped) {
      setFlipped((prev) => new Set(prev).add(i));
      setViewed((prev) => new Set(prev).add(i));
      hubSpeak(v.en);
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
                      hubSpeak(v.en);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        hubSpeak(v.en);
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
                      hubSpeak(v.en);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        hubSpeak(v.en);
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
  onFinish,
  onCorrect,
  onWrong,
}: {
  title: string;
  instruction: string;
  questions: Array<{ audio: string; opts: string[]; answer: number; point?: string }>;
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
              onClick={() => hubSpeak(q.opts[q.answer], 0.7)}
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
          onClick={() => hubSpeak(q.audio, 0.8)}
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

function MatchStage({
  vocabulary,
  onFinish,
  onMatch,
}: {
  vocabulary: VocabItem[];
  onFinish: () => void;
  onMatch: () => void;
}) {
  const enItems = useMemo(() => shuffleArray([...vocabulary]), [vocabulary]);
  const cnItems = useMemo(() => shuffleArray([...vocabulary]), [vocabulary]);
  const [matched, setMatched] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<{ side: "en" | "cn"; value: string } | null>(null);
  const [wrongKey, setWrongKey] = useState<string | null>(null);

  const tryMatch = (side: "en" | "cn", value: string) => {
    if (matched.has(value)) return;
    if (side === "en") hubSpeak(value);

    if (!selected) {
      setSelected({ side, value });
      return;
    }

    if (selected.side === side) {
      setSelected({ side, value });
      return;
    }

    if (selected.value === value) {
      setMatched((prev) => new Set(prev).add(value));
      onMatch();
      setSelected(null);
    } else {
      const wrongId = `${side}-${value}`;
      setWrongKey(wrongId);
      setSelected(null);
      window.setTimeout(() => setWrongKey(null), 600);
    }
  };

  const done = matched.size === vocabulary.length;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm">🎮 点击英文（自动朗读）和中文进行配对</div>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-2">
          {enItems.map((v) => {
            const isMatched = matched.has(v.en);
            const isSelected = selected?.side === "en" && selected.value === v.en;
            const isWrong = wrongKey === `en-${v.en}`;
            return (
              <button
                key={`en-${v.en}`}
                type="button"
                disabled={isMatched}
                onClick={() => tryMatch("en", v.en)}
                className={`match-btn rounded-xl border-2 border-[#EEEAE0] bg-white px-3 py-2.5 text-left text-sm font-medium transition ${
                  isSelected ? "selected" : ""
                } ${isMatched ? "matched" : ""} ${isWrong ? "wrong" : ""}`}
              >
                {v.emoji} {v.en}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {cnItems.map((v) => {
            const isMatched = matched.has(v.en);
            const isSelected = selected?.side === "cn" && selected.value === v.en;
            const isWrong = wrongKey === `cn-${v.en}`;
            return (
              <button
                key={`cn-${v.en}`}
                type="button"
                disabled={isMatched}
                onClick={() => tryMatch("cn", v.en)}
                className={`match-btn rounded-xl border-2 border-[#EEEAE0] bg-white px-3 py-2.5 text-left text-sm font-medium transition ${
                  isSelected ? "selected" : ""
                } ${isMatched ? "matched" : ""} ${isWrong ? "wrong" : ""}`}
              >
                {v.cn}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-3 rounded-xl bg-[#FFF8F0] p-2.5 text-center text-sm">
        🎯 已配对：<strong>{matched.size}</strong> / {vocabulary.length}
      </div>
      <PrimaryButton disabled={!done} onClick={onFinish}>
        {done ? "✓ 太棒了！进入下一关 →" : "完成所有配对再继续"}
      </PrimaryButton>
    </div>
  );
}

function SentenceStage({
  dialogues,
  onFinish,
}: {
  dialogues: UnitDef["dialogues"];
  onFinish: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  const patterns = useMemo(() => {
    const out: Array<{ title: string; q: string; qCn: string; a: string; aCn: string; color: (typeof SENTENCE_COLORS)[number] }> = [];
    for (const dialogue of dialogues) {
      const lines = dialogue.lines;
      for (let i = 0; i < lines.length && out.length < 4; i += 2) {
        const qLine = lines[i];
        const aLine = lines[i + 1];
        out.push({
          title: dialogue.title,
          q: qLine.text,
          qCn: qLine.cn,
          a: aLine?.text ?? "",
          aCn: aLine?.cn ?? "",
          color: SENTENCE_COLORS[out.length % SENTENCE_COLORS.length],
        });
      }
    }
    return out;
  }, [dialogues]);

  const expand = (i: number) => {
    setExpanded((prev) => new Set(prev).add(i));
  };

  const allExpanded = patterns.length === 0 || expanded.size === patterns.length;

  if (patterns.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
        <div className="text-sm text-[#888780]">本单元暂无句型对话，可直接进入下一关</div>
        <PrimaryButton onClick={onFinish}>进入下一关 →</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm">💬 学会 {patterns.length} 个核心句型，点击 🔊 听发音，展开看中文</div>
      {patterns.map((s, i) => (
        <div key={`${s.q}-${i}`} className={`mb-3 rounded-xl p-3 ${sentenceColorClass[s.color]}`}>
          <div className="mb-1.5 text-xs font-semibold">
            句型 {i + 1}：{s.title}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-[#378ADD] text-xs text-white"
              onClick={() => hubSpeak(s.q)}
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
                      onClick={() => hubSpeak(s.a)}
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
  onFinish,
  onCorrect,
  onWrong,
}: {
  vocabulary: VocabItem[];
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (m: { q: string; opts: string[]; answer: number; point: string }) => void;
}) {
  const [correct, setCorrect] = useState<Set<number>>(() => new Set());
  const [values, setValues] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, React.ReactNode>>({});
  const [disabled, setDisabled] = useState<Set<number>>(() => new Set());

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
      setCorrect((prev) => new Set(prev).add(i));
      onCorrect();
      hubSpeak(answer);
    } else {
      setFeedbacks((prev) => ({
        ...prev,
        [i]: (
          <span className="text-[#A32D2D]">
            ❌ 正确答案：<strong>{answer}</strong>
          </span>
        ),
      }));
      onWrong({
        q: `默写：${vocabulary[i].cn}`,
        opts: [answer],
        answer: 0,
        point: "单词拼写",
      });
      hubSpeak(answer, 0.7);
      window.setTimeout(() => {
        setValues((prev) => ({ ...prev, [i]: "" }));
        setFeedbacks((prev) => ({ ...prev, [i]: null }));
      }, 2500);
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
              onClick={() => hubSpeak(v.en, 0.7)}
            >
              🔊
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={values[i] ?? ""}
              disabled={disabled.has(i)}
              placeholder="输入英文..."
              autoComplete="off"
              className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm outline-none ${
                disabled.has(i)
                  ? "border-[#97C459] bg-[#EAF3DE]"
                  : "border-[#EEEAE0] bg-white focus:border-[#FF6B35]"
              }`}
              onChange={(e) => setValues((prev) => ({ ...prev, [i]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") check(i, v.en);
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

export default function PrimaryHubStagePlay({ unitId, stageIdx, onComplete, onBack }: Props) {
  const { grade, state, setState, addMistake, completeStage } = usePrimaryHub();
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
        reviewSchedule: [],
        reviewHistory: [],
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
        return <VocabStage vocabulary={unit.vocabulary} onFinish={handleFinish} />;
      case "listenWord":
        return (
          <ListenMcStage
            title="听音辨词"
            instruction="🎧 听一听，是哪个单词？"
            questions={listenWordQuestions}
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
        return <MatchStage vocabulary={unit.vocabulary} onFinish={handleFinish} onMatch={addStar} />;
      case "sentence":
        return <SentenceStage dialogues={unit.dialogues} onFinish={handleFinish} />;
      case "write":
        return (
          <WriteStage
            vocabulary={unit.vocabulary}
            onFinish={handleFinish}
            onCorrect={addStar}
            onWrong={(m) => addMistake({ ...m, unitId, unitTitle: unit.title })}
          />
        );
      case "listenSent":
        return (
          <ListenMcStage
            title="听力测试"
            instruction="🎧 听一听，是哪一句？"
            questions={listenSentQuestions as ListeningQuestion[]}
            onFinish={handleFinish}
            onCorrect={addStar}
            onWrong={(q) =>
              addMistake({
                q: `听力理解：${q.audio}`,
                opts: q.opts,
                answer: q.answer,
                point: "听力理解",
                audio: q.audio,
                unitId,
                unitTitle: unit.title,
              })
            }
          />
        );
      case "finalQuiz":
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
