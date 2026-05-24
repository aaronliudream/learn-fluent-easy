import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findUnit } from "@/lib/primaryHub/courseData";
import { shuffleArray, usePrimaryHub } from "@/lib/primaryHub/context";
import { getUnitState, savePersist } from "@/lib/primaryHub/storage";
import { hubSpeak } from "@/lib/primaryHub/speech";
import { getPhonicsForUnit, phonicsPath } from "@/lib/primaryHub/phonicsRegistry";
import { loadPhonicsProgress } from "@/lib/primaryHub/phonicsStorage";
import { getPhonicsRuleText, getVocabGroups } from "@/lib/primaryHub/vocabGroupsRegistry";
import { prefetchTTSBatchKid } from "@/lib/speak";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import WordMatchingGame from "@/components/hub/WordMatchingGame";
import ReadWriteTrainingStage from "@/components/primaryHub/ReadWriteTrainingStage";
import { getReadWriteConfig } from "@/lib/primaryHub/readWriteRegistry";
import type { ListeningQuestion, QuizQuestion, UnitDef, VocabItem } from "@/lib/primaryHub/types";

type Props = {
  unitId: string;
  semId: string;
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

function highlightVocabWord(en: string, highlight?: string) {
  if (!highlight) return <span>{en}</span>;
  const lower = en.toLowerCase();
  const idx = lower.lastIndexOf(highlight.toLowerCase());
  if (idx < 0) return <span>{en}</span>;
  return (
    <>
      {en.slice(0, idx)}
      <span className="font-bold text-[#E0623F]">{en.slice(idx, idx + highlight.length)}</span>
      {en.slice(idx + highlight.length)}
    </>
  );
}

function VocabStage({
  vocabulary,
  onFinish,
  grade,
  unitId,
  semId,
  stageIdx,
}: {
  vocabulary: VocabItem[];
  onFinish: () => void;
  grade: number;
  unitId: string;
  semId: string;
  stageIdx: number;
}) {
  const nav = useNavigate();
  const phonics = getPhonicsForUnit(unitId);
  const phonicsProgress = phonics ? loadPhonicsProgress(unitId) : null;
  const [activeGroup, setActiveGroup] = useState<1 | 2 | 3>(1);
  const [viewed, setViewed] = useState<Set<number>>(() => new Set());
  const [flipped, setFlipped] = useState<Set<number>>(() => new Set());

  const groups = getVocabGroups(unitId, vocabulary);
  const activeGroupDef = groups?.find((g) => g.id === activeGroup) ?? null;
  const activeItems = activeGroupDef?.items ?? vocabulary;
  const activeOffset = activeGroupDef?.offset ?? 0;
  const phonicsRule = activeGroupDef?.showPhonicsRule ? getPhonicsRuleText(phonics) : null;

  const markViewed = (globalIdx: number) => {
    setViewed((prev) => {
      if (prev.has(globalIdx)) return prev;
      const next = new Set(prev);
      next.add(globalIdx);
      return next;
    });
  };

  const toggleCard = (localIdx: number) => {
    const v = activeItems[localIdx];
    if (!v) return;
    const globalIdx = activeOffset + localIdx;
    const isFlipped = flipped.has(globalIdx);
    markViewed(globalIdx);
    if (!isFlipped) {
      setFlipped((prev) => new Set(prev).add(globalIdx));
      hubSpeak(v.en, 0.85, grade);
    } else {
      setFlipped((prev) => {
        const next = new Set(prev);
        next.delete(globalIdx);
        return next;
      });
    }
  };

  const speakWord = (word: string, globalIdx: number) => {
    markViewed(globalIdx);
    hubSpeak(word, 0.85, grade);
  };

  useEffect(() => {
    prefetchTTSBatchKid(
      vocabulary.map((v) => v.en),
      { grade },
    );
  }, [grade, vocabulary]);

  const requiredViewed = vocabulary.length;
  const allViewed = viewed.size >= requiredViewed;
  const remainingViewed = Math.max(0, requiredViewed - viewed.size);

  const groupViewedCount = (group: NonNullable<typeof groups>[number]) =>
    group.items.reduce((n, _item, i) => (viewed.has(group.offset + i) ? n + 1 : n), 0);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 text-base font-semibold">
        📖 {groups ? `认识 ${vocabulary.length} 个单词` : "认识单词"}
      </div>
      {groups && (
        <div className="mb-3 flex gap-2">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setActiveGroup(g.id)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                activeGroup === g.id
                  ? "bg-[#FF6B35] text-white"
                  : "bg-[#F4F0E6] text-[#888780]"
              }`}
            >
              {g.label} ({groupViewedCount(g)}/{g.items.length})
            </button>
          ))}
        </div>
      )}
      {activeGroupDef?.header && (
        <div className="mb-2 text-[15px] font-semibold text-[#FF6B35]">{activeGroupDef.header}</div>
      )}
      {phonicsRule && (
        <div className="mb-3 rounded-lg border border-[#FF6B35]/30 bg-[#FFF8F0] px-3 py-2 text-[14px] leading-snug text-[#555]">
          <span className="font-semibold text-[#FF6B35]">🔤 er 发音：</span>
          {phonicsRule}
        </div>
      )}
      <div className="mb-3 text-[14px] text-[#888780]">
        💡 点击卡片翻转看中文；点击 🔊 或单词也会计入已查看
      </div>
      <div className="grid grid-cols-2 gap-2">
            {activeItems.map((v, i) => {
              const globalIdx = activeOffset + i;
              const isFlipped = flipped.has(globalIdx);
              return (
            <div
              key={`${v.en}-${globalIdx}`}
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
                  <div
                    className="mt-1 text-[20px] font-semibold leading-tight"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(v.en, globalIdx);
                    }}
                  >
                    {highlightVocabWord(v.en, v.highlight)}
                  </div>
                  {v.phonetic && (
                    <div className="mt-0.5 text-[12px] text-[#888780]">{v.phonetic}</div>
                  )}
                  <span
                    role="button"
                    tabIndex={0}
                    className="mt-2 inline-block rounded-full bg-[#378ADD] px-2 py-0.5 text-xs text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(v.en, globalIdx);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        speakWord(v.en, globalIdx);
                      }
                    }}
                  >
                    🔊
                  </span>
                </>
              ) : (
                <>
                  <div className="text-2xl">{v.emoji}</div>
                  <div className="mt-1 text-[20px] font-bold text-[#FF6B35]">{v.cn}</div>
                  <div
                    className="mt-1 text-[14px] text-[#888780]"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(v.en, globalIdx);
                    }}
                  >
                    {highlightVocabWord(v.en, v.highlight)}
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    className="mt-2 inline-block rounded-full bg-[#378ADD] px-2 py-0.5 text-xs text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(v.en, globalIdx);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        speakWord(v.en, globalIdx);
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
      {activeGroup === 3 && phonics && (
        <div className="mt-4 rounded-xl border-2 border-dashed border-[#FF6B35]/50 bg-[#FFF8F0] p-4 text-center">
          <p className="text-[15px] font-semibold">自然拼读 · er 专项练习</p>
          <p className="mt-1 text-[14px] text-[#888780]">听辨 + 挑战，巩固 er 发音</p>
          {phonicsProgress?.finished && (
            <p className="mt-2 text-xs font-semibold text-[#6FA92A]">✓ 拼读练习已完成</p>
          )}
          <PrimaryButton
            className="mt-3"
            onClick={() => nav(phonicsPath(grade, semId, unitId, stageIdx))}
          >
            {phonicsProgress?.finished ? "再练一次拼读 →" : "开始拼读练习 →"}
          </PrimaryButton>
        </div>
      )}
      <div className="mt-3 text-center text-[14px] text-[#888780]">
        已查看：{viewed.size} / {requiredViewed}
        {groups && !allViewed && ` · 还需 ${remainingViewed} 张，请切换「日常用词」「拼读词」标签`}
      </div>
      <PrimaryButton disabled={!allViewed} onClick={onFinish}>
        {allViewed
          ? "✓ 进入下一关 →"
          : remainingViewed > 0
            ? `还需查看 ${remainingViewed} 张卡片（共 ${requiredViewed} 张）`
            : "查看完所有卡片再继续"}
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
  const isSentenceListen = title.includes("句");

  useEffect(() => {
    prefetchTTSBatchKid(
      questions.map((item) => item.audio),
      { grade },
    );
  }, [grade, questions]);

  const speakPrompt = useCallback(() => {
    const text = q?.audio?.trim();
    if (!text) return;
    // Sentence prompts use the slow kid-voice path (<0.75) for clearer playback.
    hubSpeak(text, isSentenceListen ? 0.74 : 0.8, grade);
  }, [q, grade, isSentenceListen]);

  const speakCorrectAnswer = useCallback(() => {
    const text = q?.opts[q.answer]?.trim();
    if (!text) return;
    hubSpeak(text, 0.7, grade);
  }, [q, grade]);

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
          <button
            type="button"
            className="ml-2 rounded-lg bg-[#378ADD] px-2.5 py-1 text-xs text-white"
            onClick={speakCorrectAnswer}
          >
            🔊 慢速
          </button>
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
    optionCount: q?.opts.length ?? 0,
    answered,
    onPick: handlePick,
    onNext: next,
    enabled: !!q,
  });

  if (!q) {
    return (
      <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
        <div className="text-sm text-[#888780]">暂无听力题目</div>
      </div>
    );
  }

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
          onClick={speakPrompt}
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

function SentenceStage({
  dialogues,
  grade,
  onFinish,
}: {
  dialogues: UnitDef["dialogues"];
  grade: number;
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

  useEffect(() => {
    const texts = patterns.flatMap((s) => [s.q, s.a].filter(Boolean));
    if (texts.length) prefetchTTSBatchKid(texts, { grade });
  }, [grade, patterns]);

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

export default function PrimaryHubStagePlay({ unitId, semId, stageIdx, onComplete, onBack }: Props) {
  const { grade, state, setState, addMistake, completeStage } = usePrimaryHub();
  const unit = findUnit(unitId);
  const stage = unit?.stages[stageIdx];
  const readWriteConfig = getReadWriteConfig(unitId, stageIdx);

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
        return (
          <VocabStage
            vocabulary={unit.vocabulary}
            onFinish={handleFinish}
            grade={grade}
            unitId={unitId}
            semId={semId}
            stageIdx={stageIdx}
          />
        );
      case "listenWord":
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
      case "sentence":
        return <SentenceStage dialogues={unit.dialogues} onFinish={handleFinish} grade={grade} />;
      case "write":
        return (
          <WriteStage
            vocabulary={unit.vocabulary}
            grade={grade}
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
            grade={grade}
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
      case "readWrite":
        return readWriteConfig ? (
          <ReadWriteTrainingStage
            config={readWriteConfig}
            onFinish={handleFinish}
            onAwardPoints={addStar}
          />
        ) : (
          <div className="rounded-2xl bg-white p-4 text-center text-sm text-[#888780]">
            读写训练内容即将上线
          </div>
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
