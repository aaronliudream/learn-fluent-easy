import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import HubSpeakSpeedControl from "@/components/primaryHub/HubSpeakSpeedControl";
import { useHubSpeakSpeed } from "@/hooks/useHubSpeakSpeed";
import type { HubSpeakSpeed } from "@/lib/primaryHub/hubSpeakSpeed";
import { hubSpeakAtSpeed } from "@/lib/primaryHub/speech";
import { prefetchTTSBatchKid } from "@/lib/speak";
import {
  countSubmoduleDone,
  getSentenceCompletedIds,
  getSentenceLessonPercent,
  isSentenceLessonComplete,
  isSubmoduleComplete,
  isSubmoduleUnlocked,
} from "@/lib/primaryHub/sentenceProgress";
import type { SentenceItem, SentenceLessonConfig, SentenceLine, SentenceSubModule } from "@/lib/primaryHub/sentenceTypes";
import { getUnitState, savePersist } from "@/lib/primaryHub/storage";
import { usePrimaryHub } from "@/lib/primaryHub/context";

const sentenceColorClass = {
  blue: "border-l-4 border-[#378ADD] bg-[#E6F1FB]",
  pink: "border-l-4 border-[#D4537E] bg-[#FBEAF0]",
} as const;

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

function AudioBtn({
  text,
  grade,
  speed,
  label,
}: {
  text: string;
  grade: number;
  speed: HubSpeakSpeed;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label ?? "播放"}
      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#378ADD] text-xs text-white"
      onClick={() => hubSpeakAtSpeed(text, speed, grade)}
    >
      🔊
    </button>
  );
}

function LessonPanel({ speed, onSpeedChange, children }: { speed: HubSpeakSpeed; onSpeedChange: (s: HubSpeakSpeed) => void; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <HubSpeakSpeedControl speed={speed} onChange={onSpeedChange} className="mb-3" />
      {children}
    </div>
  );
}

function SentenceCard({
  item,
  index,
  color,
  grade,
  speed,
  completed,
  onComplete,
}: {
  item: SentenceItem;
  index: number;
  color: keyof typeof sentenceColorClass;
  grade: number;
  speed: HubSpeakSpeed;
  completed: boolean;
  onComplete: () => void;
}) {
  const [expanded, setExpanded] = useState(completed);

  useEffect(() => {
    if (completed) setExpanded(true);
  }, [completed]);

  const expand = () => {
    setExpanded(true);
    if (!completed) onComplete();
  };

  return (
    <div className={`mb-3 rounded-xl p-3 ${sentenceColorClass[color]}`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">
          句 {index + 1}
        </span>
        <span className="rounded-md bg-white/60 px-1.5 py-0.5 text-[10px] font-medium opacity-80">{item.tag}</span>
      </div>
      <div className="flex items-center gap-2">
        <AudioBtn text={item.question.en} grade={grade} speed={speed} label="播放英文" />
        <div className="flex-1 text-base font-semibold">{item.question.en}</div>
        {completed && <span className="text-sm text-[#3B6D11]">✓</span>}
      </div>
      {expanded ? (
        <div className="mt-2 border-t border-black/10 pt-2">
          <div className="text-sm">中文：{item.question.zh}</div>
          {item.answer && (
            <>
              <div className="mt-2 flex items-center gap-2">
                <AudioBtn text={item.answer.en} grade={grade} speed={speed} label="播放回答英文" />
                <div className="text-sm font-semibold">回答：{item.answer.en}</div>
              </div>
              <div className="mt-1 pl-10 text-sm">{item.answer.zh}</div>
            </>
          )}
        </div>
      ) : (
        <button type="button" className="mt-2 text-xs opacity-70" onClick={expand}>
          点击展开 ↓
        </button>
      )}
    </div>
  );
}

function StarBurst({ n }: { n: number }) {
  const color = n >= 10 ? "text-[#FF6B35]" : n > 0 ? "text-[#6FA92A]" : "text-[#888780]";
  return <span className={`inline-block animate-bounce text-lg font-extrabold ${color}`}>+{n} ⭐</span>;
}

/** What the 🔊 button reads for a training drill (fill_word reads the completed sentence). */
function trainingAudioText(item: SentenceItem): string {
  const t = item.training;
  if (!t) return item.question.en;
  const correct = (t.options ?? []).find((o) => o.correct)?.text ?? item.question.en;
  switch (t.type) {
    case "fill_word":
      return (t.sentenceTemplate ?? "___").replace("___", correct);
    case "sentence_choice":
    case "structure_transfer":
      return correct;
    default:
      return item.question.en;
  }
}

function shuffleIdx(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 连线题:英文句 ↔ 中文意思配对,全部配对成功 → onSolved。自带交互状态,不依赖单选逻辑。 */
function MatchDrill({ pairs, resolved, onSolved }: { pairs: SentenceLine[]; resolved: boolean; onSolved: () => void }) {
  const [selEn, setSelEn] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [wrong, setWrong] = useState<{ en: number; zh: number } | null>(null);
  const enOrder = useMemo(() => shuffleIdx(pairs.length), [pairs.length]);
  const zhOrder = useMemo(() => shuffleIdx(pairs.length), [pairs.length]);

  const pickEn = (i: number) => {
    if (resolved || matched.has(i)) return;
    setWrong(null);
    setSelEn(i);
  };
  const pickZh = (i: number) => {
    if (resolved || matched.has(i) || selEn == null) return;
    if (selEn === i) {
      const next = new Set(matched).add(i);
      setMatched(next);
      setSelEn(null);
      if (next.size === pairs.length) onSolved();
    } else {
      const s = selEn;
      setWrong({ en: s, zh: i });
      setSelEn(null);
      window.setTimeout(() => setWrong((w) => (w && w.en === s && w.zh === i ? null : w)), 500);
    }
  };
  const cls = (done: boolean, sel: boolean, isWrong: boolean) =>
    `w-full rounded-lg border-2 px-2 py-2 text-left text-sm font-medium transition ${
      done
        ? "border-[#6FA92A] bg-[#EAF3DE] text-[#3B6D11]"
        : isWrong
          ? "border-[#E24B4A] bg-[#FFF0EB] text-[#A32D2D]"
          : sel
            ? "border-[#FF6B35] bg-white text-[#2C2C2A]"
            : "border-[#EEEAE0] bg-white text-[#2C2C2A]"
    }`;

  return (
    <div className="mb-2 flex gap-3">
      <div className="flex-1 space-y-2">
        {enOrder.map((pi) => (
          <button key={`me-${pi}`} type="button" disabled={resolved || matched.has(pi)} onClick={() => pickEn(pi)} className={cls(matched.has(pi), selEn === pi, wrong?.en === pi)}>
            {pairs[pi].en}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-2">
        {zhOrder.map((pi) => (
          <button key={`mz-${pi}`} type="button" disabled={resolved || matched.has(pi)} onClick={() => pickZh(pi)} className={cls(matched.has(pi), false, wrong?.zh === pi)}>
            {pairs[pi].zh}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 连词成句:按顺序点词块,排满后与正确顺序比对;对 → onSolved,错 → 短暂提示后清空重排。 */
function OrderDrill({ tokens, answer, resolved, onSolved }: { tokens: string[]; answer: string[]; resolved: boolean; onSolved: () => void }) {
  const [placed, setPlaced] = useState<number[]>([]);
  const [wrong, setWrong] = useState(false);
  const placedSet = new Set(placed);
  const built = placed.map((i) => tokens[i]);

  const place = (i: number) => {
    if (resolved || placedSet.has(i)) return;
    const next = [...placed, i];
    setPlaced(next);
    setWrong(false);
    if (next.length === tokens.length) {
      if (next.map((k) => tokens[k]).join(" ") === answer.join(" ")) onSolved();
      else {
        setWrong(true);
        window.setTimeout(() => { setPlaced([]); setWrong(false); }, 700);
      }
    }
  };

  return (
    <div className="mb-2">
      <div className={`mb-2 flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-lg border-2 border-dashed p-2 ${wrong ? "border-[#E24B4A] bg-[#FFF0EB]" : "border-[#FFB627] bg-[#FFF8F0]"}`}>
        {built.length === 0 ? (
          <span className="text-xs text-[#888780]">点下面的词块，按顺序排成句子</span>
        ) : (
          built.map((tok, i) => (
            <span key={`b-${i}`} className="rounded-md bg-[#FF6B35] px-2 py-1 text-sm font-semibold text-white">{tok}</span>
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tokens.map((tok, i) => (
          <button
            key={`t-${i}`}
            type="button"
            disabled={resolved || placedSet.has(i)}
            onClick={() => place(i)}
            className={`rounded-md border-2 px-2 py-1 text-sm font-semibold transition ${
              placedSet.has(i) ? "border-[#EEEAE0] bg-[#F4F0E6] text-[#C8C4BC]" : "border-[#EEEAE0] bg-white text-[#2C2C2A] hover:border-[#FF6B35]/50"
            }`}
          >
            {tok}
          </button>
        ))}
      </div>
      {placed.length > 0 && !resolved && (
        <button type="button" onClick={() => { setPlaced((p) => p.slice(0, -1)); setWrong(false); }} className="mt-2 text-xs font-semibold text-[#FF6B35]">↩ 撤回一个</button>
      )}
    </div>
  );
}

/** Training-mode card (3-choice drill). Marks the sentence complete on a correct answer
 * or after the answer is revealed (2nd wrong). Awards +10 first-try / +5 retry / +0 revealed
 * via onAwardPoints; reports first-try correct via onFirstCorrect (for the 满星 badge). */
function TrainingCard({
  item,
  index,
  color,
  grade,
  speed,
  completed,
  onComplete,
  onAwardPoints,
  onFirstCorrect,
}: {
  item: SentenceItem;
  index: number;
  color: keyof typeof sentenceColorClass;
  grade: number;
  speed: HubSpeakSpeed;
  completed: boolean;
  onComplete: () => void;
  onAwardPoints?: (n: number) => void;
  onFirstCorrect?: () => void;
}) {
  const t = item.training!;
  const options = t.options ?? [];
  const [phase, setPhase] = useState<"ready" | "wrong1" | "correct" | "revealed">(
    completed ? "revealed" : "ready",
  );
  const [picked, setPicked] = useState<number | null>(null);
  const [awarded, setAwarded] = useState<number | null>(completed ? null : null);
  const resolved = phase === "correct" || phase === "revealed";
  const audioText = trainingAudioText(item);

  const pick = (i: number) => {
    if (resolved) return;
    setPicked(i);
    if (options[i]?.correct) {
      if (phase === "ready") {
        setAwarded(10);
        onAwardPoints?.(10);
        onFirstCorrect?.();
      } else {
        setAwarded(5);
        onAwardPoints?.(5);
      }
      setPhase("correct");
      onComplete();
    } else if (phase === "ready") {
      setPhase("wrong1");
    } else {
      setAwarded(0);
      setPhase("revealed");
    }
  };

  // 连线/排序解出后,走与"答对"一样的给分+完成流程(不改 pick 单选路径)。
  const markSolved = () => {
    if (resolved) return;
    setAwarded(10);
    onAwardPoints?.(10);
    onFirstCorrect?.();
    setPhase("correct");
    onComplete();
  };

  const optionClass = (i: number) => {
    const base = "w-full rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition disabled:cursor-default ";
    if (!resolved) {
      if (phase === "wrong1" && picked === i) return base + "border-[#E24B4A] bg-[#FFF0EB] text-[#A32D2D]";
      return base + "border-[#EEEAE0] bg-white hover:border-[#FF6B35]/50";
    }
    if (options[i]?.correct) return base + "border-[#6FA92A] bg-[#EAF3DE] text-[#3B6D11]";
    if (picked === i) return base + "border-[#E24B4A] bg-[#FFF0EB] text-[#A32D2D]";
    return base + "border-[#EEEAE0] bg-white opacity-50";
  };

  const before = t.sentenceTemplate?.split("___")[0] ?? "";
  const after = t.sentenceTemplate?.split("___")[1] ?? "";

  return (
    <div className={`mb-3 rounded-xl p-3 ${sentenceColorClass[color]}`}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">句 {index + 1}</span>
        <span className="rounded-md bg-white/60 px-1.5 py-0.5 text-[10px] font-medium opacity-80">{item.tag}</span>
      </div>

      {t.scenarioZh && (
        <div className="mb-2 rounded-lg bg-white/60 px-2.5 py-1.5 text-xs text-[#555]">🎬 {t.scenarioZh}</div>
      )}
      {t.promptZh && <div className="mb-2 text-sm font-bold text-[#2C2C2A]">{t.promptZh}</div>}

      {t.type === "fill_word" && t.sentenceTemplate && (
        <div className="mb-2 text-base font-semibold">
          {before}
          <span className="mx-1 inline-block min-w-[2.5ch] border-b-2 border-dashed border-[#FF6B35] text-center text-[#FF6B35]">
            {resolved ? options.find((o) => o.correct)?.text : "＿＿"}
          </span>
          {after}
        </div>
      )}

      <div className="mb-2 flex items-center gap-2">
        <AudioBtn text={audioText} grade={grade} speed={speed} label="播放" />
        <span className="text-xs text-[#888780]">点 🔊 听一听</span>
      </div>

      {/* 新增题型:连线 / 连词成句(旧 5 种 type 不进这里,options 为空→下方单选块渲染空) */}
      {t.type === "match" && t.pairs && t.pairs.length > 0 && (
        <MatchDrill pairs={t.pairs} resolved={resolved} onSolved={markSolved} />
      )}
      {t.type === "sentence_order" && t.tokens && t.answer && (
        <OrderDrill tokens={t.tokens} answer={t.answer} resolved={resolved} onSolved={markSolved} />
      )}

      <div className="flex flex-col gap-2">
        {options.map((o, i) => (
          <button key={`${item.id}-${i}`} type="button" disabled={resolved} className={optionClass(i)} onClick={() => pick(i)}>
            {o.text}
          </button>
        ))}
      </div>

      {phase === "wrong1" && <div className="mt-2 text-sm font-semibold text-[#E24B4A]">💡 再试一次？</div>}

      {resolved && (
        <div className="mt-3 border-t border-black/10 pt-2">
          <div className="flex items-center gap-2">
            <AudioBtn text={item.question.en} grade={grade} speed={speed} label="播放英文" />
            <div className="flex-1 text-base font-semibold">{item.question.en}</div>
            {awarded !== null && <StarBurst n={awarded} />}
          </div>
          <div className="mt-1 text-sm">{item.question.zh}</div>
          {item.answer && (
            <div className="mt-2 flex items-center gap-2">
              <AudioBtn text={item.answer.en} grade={grade} speed={speed} label="播放回答" />
              <div className="text-sm">
                <span className="font-semibold">回答：{item.answer.en}</span>
                <span className="ml-1 text-[#888780]">{item.answer.zh}</span>
              </div>
            </div>
          )}
          {t.explanationZh && (
            <div className="mt-2 rounded-lg bg-white/60 px-2.5 py-1.5 text-xs text-[#555]">📘 {t.explanationZh}</div>
          )}
          {phase === "revealed" && !completed && (
            <button type="button" className="mt-2 text-xs font-semibold text-[#FF6B35]" onClick={onComplete}>
              继续 →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

type View = "pick" | "module" | "transition";

type Props = {
  lesson: SentenceLessonConfig;
  unitId: string;
  stageIdx: number;
  grade: number;
  onFinish: () => void;
  onProgress?: (percent: number) => void;
  onRegisterBack: (handler: (() => void) | null) => void;
  onAwardPoints?: (n: number) => void;
};

export default function SentenceLessonStage({
  lesson,
  unitId,
  stageIdx,
  grade,
  onFinish,
  onProgress,
  onRegisterBack,
  onAwardPoints,
}: Props) {
  const { grade: hubGrade, state, setState } = usePrimaryHub();
  const g = grade || hubGrade;
  const persistGrade = hubGrade;
  const { speed, setSpeed } = useHubSpeakSpeed();

  const us = getUnitState(state, unitId);
  const completed = useMemo(() => getSentenceCompletedIds(us), [us.sentenceCompleted]);
  const firstCorrect = useMemo(() => new Set(us.sentenceFirstCorrect ?? []), [us.sentenceFirstCorrect]);

  const modA = lesson.subModules[0];
  const modB = lesson.subModules[1];

  /** True when every training (non skip_chant) sentence of a module was first-try correct. */
  const moduleStarred = useCallback(
    (mod: SentenceSubModule) => {
      const ids = mod.sentences
        .filter((s) => s.training && s.training.type !== "skip_chant")
        .map((s) => s.id);
      return ids.length > 0 && ids.every((id) => firstCorrect.has(id));
    },
    [firstCorrect],
  );

  const [view, setView] = useState<View>("pick");
  const [activeModule, setActiveModule] = useState<SentenceSubModule | null>(null);
  // 一次一题:当前显示的句子下标。进入子模块时跳到第一道未完成的句子(支持续做)。
  const [cursor, setCursor] = useState(0);
  useEffect(() => {
    if (!activeModule) return;
    const firstUndone = activeModule.sentences.findIndex((s) => !completed.has(s.id));
    setCursor(firstUndone < 0 ? 0 : firstUndone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule?.id]);

  const markSentence = useCallback(
    (sentenceId: string) => {
      setState((prev) => {
        const unitState = getUnitState(prev, unitId);
        const ids = new Set(unitState.sentenceCompleted ?? []);
        if (ids.has(sentenceId)) return prev;
        ids.add(sentenceId);
        unitState.sentenceCompleted = [...ids];
        const pct = getSentenceLessonPercent(lesson, ids);
        unitState.stageProgress = {
          ...(unitState.stageProgress ?? {}),
          [stageIdx]: Math.min(99, pct),
        };
        const next = { ...prev, units: { ...prev.units, [unitId]: { ...unitState } } };
        savePersist(persistGrade, next);
        return next;
      });
    },
    [lesson, persistGrade, setState, stageIdx, unitId],
  );

  const markFirstCorrect = useCallback(
    (sentenceId: string) => {
      setState((prev) => {
        const unitState = getUnitState(prev, unitId);
        const ids = new Set(unitState.sentenceFirstCorrect ?? []);
        if (ids.has(sentenceId)) return prev;
        ids.add(sentenceId);
        unitState.sentenceFirstCorrect = [...ids];
        const next = { ...prev, units: { ...prev.units, [unitId]: { ...unitState } } };
        savePersist(persistGrade, next);
        return next;
      });
    },
    [persistGrade, setState, unitId],
  );

  const lessonDone = isSentenceLessonComplete(lesson, completed);

  useEffect(() => {
    const pct = getSentenceLessonPercent(lesson, completed);
    onProgress?.(pct);
  }, [completed, lesson, onProgress]);

  useEffect(() => {
    const texts: string[] = [];
    for (const mod of lesson.subModules) {
      for (const s of mod.sentences) {
        texts.push(s.question.en);
        if (s.answer) {
          texts.push(s.answer.en);
        }
      }
    }
    if (texts.length) prefetchTTSBatchKid(texts, { grade: g, speed });
  }, [g, lesson, speed]);

  useEffect(() => {
    if (view === "pick") {
      onRegisterBack(null);
      return;
    }
    if (view === "transition") {
      onRegisterBack(() => setView("pick"));
      return;
    }
    onRegisterBack(() => {
      setActiveModule(null);
      setView("pick");
    });
  }, [view, onRegisterBack]);

  useEffect(() => {
    if (view !== "transition") return;
    const t = window.setTimeout(() => {
      const b = lesson.subModules.find((m) => m.id === "B");
      if (b) {
        setActiveModule(b);
        setView("module");
      }
    }, 2000);
    return () => window.clearTimeout(t);
  }, [view, lesson.subModules]);

  const openModule = (mod: SentenceSubModule) => {
    if (!isSubmoduleUnlocked(mod, lesson.subModules, completed)) return;
    setActiveModule(mod);
    setView("module");
  };

  const onModuleSentenceComplete = (mod: SentenceSubModule, sentenceId: string) => {
    markSentence(sentenceId);
    const nextCompleted = new Set(completed);
    nextCompleted.add(sentenceId);
    if (mod.id === "A" && isSubmoduleComplete(mod, nextCompleted)) {
      setView("transition");
    }
  };

  if (view === "transition") {
    return (
      <LessonPanel speed={speed} onSpeedChange={setSpeed}>
      <div className="py-2 text-center">
        <div className="text-3xl">🎉</div>
        <div className="mt-2 text-lg font-bold">子模块 A 完成!</div>
        <p className="mt-3 text-sm text-[#888780]">{lesson.transitionMessage}</p>
        <PrimaryButton
          onClick={() => {
            const b = lesson.subModules.find((m) => m.id === "B");
            if (b) {
              setActiveModule(b);
              setView("module");
            }
          }}
        >
          进入子模块 B →
        </PrimaryButton>
      </div>
      </LessonPanel>
    );
  }

  if (view === "module" && activeModule) {
    const modDone = isSubmoduleComplete(activeModule, completed);
    const doneCount = countSubmoduleDone(activeModule, completed);
    // 一次一题:只渲染当前 cursor 指向的这一道;做完(答对/解出)再点"下一题"翻下一道。
    const sentences = activeModule.sentences;
    const idx = Math.min(cursor, sentences.length - 1);
    const item = sentences[idx];
    const itemDone = !!item && completed.has(item.id);
    const isLastSentence = idx >= sentences.length - 1;

    return (
      <LessonPanel speed={speed} onSpeedChange={setSpeed}>
        <p className="mb-1 text-xs text-[#888780]">{activeModule.title}</p>
        <p className="mb-3 text-sm">{activeModule.description}</p>
        <div className="mb-3 flex items-center justify-between text-xs text-[#888780]">
          <span>第 {idx + 1} / {sentences.length} 句 · 已完成 {doneCount}/{sentences.length}</span>
          {modDone && <span className="font-semibold text-[#3B6D11]">✓ 本子模块已完成</span>}
        </div>
        {item && (item.training && item.training.type !== "skip_chant" ? (
          <TrainingCard
            key={item.id}
            item={item}
            index={idx}
            color={activeModule.color}
            grade={g}
            speed={speed}
            completed={completed.has(item.id)}
            onComplete={() => onModuleSentenceComplete(activeModule, item.id)}
            onAwardPoints={onAwardPoints}
            onFirstCorrect={() => markFirstCorrect(item.id)}
          />
        ) : (
          <SentenceCard
            key={item.id}
            item={item}
            index={idx}
            color={activeModule.color}
            grade={g}
            speed={speed}
            completed={completed.has(item.id)}
            onComplete={() => onModuleSentenceComplete(activeModule, item.id)}
          />
        ))}
        {itemDone && !isLastSentence && (
          <PrimaryButton onClick={() => setCursor((c) => c + 1)}>下一题 →</PrimaryButton>
        )}
        {modDone && moduleStarred(activeModule) && (
          <div className="mb-2 rounded-xl bg-[#FFF8E6] px-3 py-2 text-center text-sm font-bold text-[#B8860B]">
            🎉🌟 满星通关！全部首次答对！
          </div>
        )}
        {modDone && activeModule.id === "B" && lessonDone ? (
          <PrimaryButton onClick={onFinish}>✓ 句型学完！返回单元 →</PrimaryButton>
        ) : modDone ? (
          <PrimaryButton onClick={() => { setActiveModule(null); setView("pick"); }}>
            返回子模块列表 →
          </PrimaryButton>
        ) : null}
      </LessonPanel>
    );
  }

  const aCount = modA ? countSubmoduleDone(modA, completed) : 0;
  const bCount = modB ? countSubmoduleDone(modB, completed) : 0;

  return (
    <LessonPanel speed={speed} onSpeedChange={setSpeed}>
      <div className="mb-3 text-center text-xs font-medium text-[#888780]">
        A: {aCount}/3 | B: {bCount}/3
      </div>
      <p className="mb-3 text-sm">💬 分两个场景学习核心句型，先完成 A 再解锁 B</p>

      {lesson.subModules.map((mod) => {
        const unlocked = isSubmoduleUnlocked(mod, lesson.subModules, completed);
        const done = isSubmoduleComplete(mod, completed);
        const count = countSubmoduleDone(mod, completed);
        const total = mod.sentences.length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <button
            key={mod.id}
            type="button"
            disabled={!unlocked}
            onClick={() => openModule(mod)}
            className={`mb-3 flex w-full flex-col rounded-xl border p-4 text-left transition ${
              unlocked
                ? "border-[#EEEAE0] bg-white shadow-sm hover:border-[#FF6B35]/40"
                : "cursor-not-allowed border-[#EEEAE0] bg-[#F4F0E6] opacity-70"
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">💬</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-bold">
                  <span>子模块 {mod.id}</span>
                  {!unlocked && <span className="text-sm">🔒</span>}
                  {done && <span className="text-sm text-[#3B6D11]">✓</span>}
                  {moduleStarred(mod) && (
                    <span className="rounded-full bg-[#FFF3C4] px-1.5 text-xs font-bold text-[#B8860B]" title="满星">
                      🌟 满星
                    </span>
                  )}
                </div>
                <div className="text-sm text-[#888780]">{mod.title}</div>
                <div className="mt-1 text-xs text-[#888780]">
                  {mod.sentences.length} 个核心句 · 约 {mod.estimatedMinutes} 分钟
                </div>
              </div>
              <span className="text-[#888780]">›</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4F0E6]">
                <div
                  className={`h-full ${done ? "bg-[#6FA92A]" : "bg-gradient-to-r from-[#FF6B35] to-[#FFB627]"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums text-[#888780]">
                {count}/{total}
              </span>
            </div>
            {!unlocked && mod.lockedUntil && (
              <div className="mt-1 text-xs text-[#888780]">完成子模块 {mod.lockedUntil} 后解锁</div>
            )}
          </button>
        );
      })}

      {lessonDone && (
        <PrimaryButton onClick={onFinish}>✓ 句型全部学完！完成本关 →</PrimaryButton>
      )}
    </LessonPanel>
  );
}
