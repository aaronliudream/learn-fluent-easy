import { useCallback, useEffect, useMemo, useState } from "react";
import { hubSpeak } from "@/lib/primaryHub/speech";
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

function AudioBtn({ text, grade, label }: { text: string; grade: number; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label ?? "播放"}
      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#378ADD] text-xs text-white"
      onClick={() => hubSpeak(text, 0.85, grade)}
    >
      🔊
    </button>
  );
}

function SentenceCard({
  item,
  index,
  color,
  grade,
  completed,
  onComplete,
}: {
  item: SentenceItem;
  index: number;
  color: keyof typeof sentenceColorClass;
  grade: number;
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
        <AudioBtn text={item.question.en} grade={grade} label="播放英文" />
        <div className="flex-1 text-base font-semibold">{item.question.en}</div>
        {completed && <span className="text-sm text-[#3B6D11]">✓</span>}
      </div>
      {expanded ? (
        <div className="mt-2 border-t border-black/10 pt-2">
          <div className="flex items-center gap-2">
            <AudioBtn text={item.question.zh} grade={grade} label="播放中文" />
            <div className="text-sm">中文：{item.question.zh}</div>
          </div>
          {item.answer && (
            <>
              <div className="mt-2 flex items-center gap-2">
                <AudioBtn text={item.answer.en} grade={grade} label="播放回答英文" />
                <div className="text-sm font-semibold">回答：{item.answer.en}</div>
              </div>
              <div className="mt-1 flex items-center gap-2 pl-10">
                <AudioBtn text={item.answer.zh} grade={grade} label="播放回答中文" />
                <div className="text-sm">{item.answer.zh}</div>
              </div>
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

type View = "pick" | "module" | "transition";

type Props = {
  lesson: SentenceLessonConfig;
  unitId: string;
  stageIdx: number;
  grade: number;
  onFinish: () => void;
  onProgress?: (percent: number) => void;
  onRegisterBack: (handler: (() => void) | null) => void;
};

export default function SentenceLessonStage({
  lesson,
  unitId,
  stageIdx,
  grade,
  onFinish,
  onProgress,
  onRegisterBack,
}: Props) {
  const { grade: hubGrade, state, setState } = usePrimaryHub();
  const g = grade || hubGrade;
  const persistGrade = hubGrade;

  const us = getUnitState(state, unitId);
  const completed = useMemo(() => getSentenceCompletedIds(us), [us.sentenceCompleted]);

  const modA = lesson.subModules[0];
  const modB = lesson.subModules[1];

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

  const lessonDone = isSentenceLessonComplete(lesson, completed);

  useEffect(() => {
    const pct = getSentenceLessonPercent(lesson, completed);
    onProgress?.(pct);
  }, [completed, lesson, onProgress]);

  useEffect(() => {
    const texts: string[] = [];
    for (const mod of lesson.subModules) {
      for (const s of mod.sentences) {
        texts.push(s.question.en, s.question.zh);
        if (s.answer) {
          texts.push(s.answer.en, s.answer.zh);
        }
      }
    }
    if (texts.length) prefetchTTSBatchKid(texts, { grade: g });
  }, [g, lesson]);

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
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
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
    );
  }

  if (view === "module" && activeModule) {
    const modDone = isSubmoduleComplete(activeModule, completed);
    const doneCount = countSubmoduleDone(activeModule, completed);

    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-1 text-xs text-[#888780]">{activeModule.title}</p>
        <p className="mb-3 text-sm">{activeModule.description}</p>
        <div className="mb-3 flex items-center justify-between text-xs text-[#888780]">
          <span>进度 {doneCount}/{activeModule.sentences.length}</span>
          {modDone && <span className="font-semibold text-[#3B6D11]">✓ 本子模块已完成</span>}
        </div>
        {activeModule.sentences.map((item, i) => (
          <SentenceCard
            key={item.id}
            item={item}
            index={i}
            color={activeModule.color}
            grade={g}
            completed={completed.has(item.id)}
            onComplete={() => onModuleSentenceComplete(activeModule, item.id)}
          />
        ))}
        {modDone && activeModule.id === "B" && lessonDone ? (
          <PrimaryButton onClick={onFinish}>✓ 句型学完！返回单元 →</PrimaryButton>
        ) : modDone ? (
          <PrimaryButton onClick={() => { setActiveModule(null); setView("pick"); }}>
            返回子模块列表 →
          </PrimaryButton>
        ) : (
          <p className="mt-2 text-center text-xs text-[#888780]">展开并完成全部句子后继续</p>
        )}
      </div>
    );
  }

  const aCount = modA ? countSubmoduleDone(modA, completed) : 0;
  const bCount = modB ? countSubmoduleDone(modB, completed) : 0;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
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
    </div>
  );
}
