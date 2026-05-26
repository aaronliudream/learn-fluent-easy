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
import type { SentenceItem, SentenceLessonConfig, SentenceSubModule } from "@/lib/primaryHub/sentenceTypes";
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

    return (
      <LessonPanel speed={speed} onSpeedChange={setSpeed}>
        <p className="mb-1 text-xs text-[#888780]">{activeModule.title}</p>
        <p className="mb-3 text-sm">{activeModule.description}</p>
        <div className="mb-3 flex items-center justify-between text-xs text-[#888780]">
          <span>进度 {doneCount}/{activeModule.sentences.length}</span>
          {modDone && <span className="font-semibold text-[#3B6D11]">✓ 本子模块已完成</span>}
        </div>
        {activeModule.sentences.map((item, i) =>
          item.training && item.training.type !== "skip_chant" ? (
            <TrainingCard
              key={item.id}
              item={item}
              index={i}
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
              index={i}
              color={activeModule.color}
              grade={g}
              speed={speed}
              completed={completed.has(item.id)}
              onComplete={() => onModuleSentenceComplete(activeModule, item.id)}
            />
          ),
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
        ) : (
          <p className="mt-2 text-center text-xs text-[#888780]">展开并完成全部句子后继续</p>
        )}
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
