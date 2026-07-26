import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRevealScroll } from "@/lib/useRevealScroll";
import { useNavigate } from "react-router-dom";
import { findUnit } from "@/lib/primaryHub/courseData";
import listenWordAudio from "@/data/primaryHub/listenWordAudio.json";
import { shuffleArray, usePrimaryHub } from "@/lib/primaryHub/context";
import { getUnitState, readUnitState, savePersist } from "@/lib/primaryHub/storage";
import { hubSpeak, hubSpeakAtSpeed, isOClockVocabToken, prefetchHubFixed, prefetchHubVocabulary, toHubTtsText } from "@/lib/primaryHub/speech";
import { OClockVocabLabel } from "@/lib/primaryHub/OClockVocabLabel";
import { getPhonicsForUnit } from "@/lib/primaryHub/phonicsRegistry";
import { loadPhonicsProgress } from "@/lib/primaryHub/phonicsStorage";
import { getPhonicsRuleText, getVocabGroups } from "@/lib/primaryHub/vocabGroupsRegistry";
import { PhonicsSection } from "@/pages/primaryHub/PrimaryHubPhonics";
import { prefetchTTSBatchKid } from "@/lib/speak";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import WordMatchingGame from "@/components/hub/WordMatchingGame";
import ReadWriteTrainingStage from "@/components/primaryHub/ReadWriteTrainingStage";
import HubSpeakSpeedControl from "@/components/primaryHub/HubSpeakSpeedControl";
import SentenceLessonStage from "@/components/primaryHub/SentenceLessonStage";
import SpellingStage from "@/components/primaryHub/SpellingStage";
import ListenWordStage from "@/components/primaryHub/ListenWordStage";
import type { GradeKey } from "@/lib/primaryHub/spellingStageConfig";
import { getListenWordConfig } from "@/lib/primaryHub/listenWordStageConfig";
import { HUB_FIXED_SPEAK_SPEED } from "@/lib/primaryHub/hubSpeakSpeed";
import { useHubSpeakSpeed } from "@/hooks/useHubSpeakSpeed";
import { getReadWriteConfig } from "@/lib/primaryHub/readWriteRegistry";
import { getSentenceLesson } from "@/lib/primaryHub/sentenceRegistry";
import { reportPrimaryAttempt } from "@/lib/primaryHub/reportAttempt";
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
          "quiz-opt flex w-full items-center gap-3 rounded-xl border-2 border-[#EEEAE0] bg-white p-3 text-left text-base font-medium transition disabled:cursor-not-allowed";
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
  headerTitle,
  children,
}: {
  stageIdx: number;
  stageTitle: string;
  unit: UnitDef;
  stars: number;
  onBack: () => void;
  headerTitle?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        <button type="button" onClick={onBack} className="text-xl">
          ←
        </button>
        <div className="text-lg font-bold">
          {headerTitle ?? `第 ${stageIdx + 1} 关 · ${stageTitle}`}
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
  if (isOClockVocabToken(en) && !highlight) return <OClockVocabLabel />;
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

function stepFromSavedPercent(savedPercent: number, total: number): number {
  if (total <= 0 || savedPercent <= 0) return 0;
  return Math.min(total - 1, Math.floor((savedPercent / 100) * total));
}

function VocabStage({
  vocabulary,
  vocabGroups,
  onFinish,
  grade,
  unitId,
  semId,
  stageIdx,
  onProgress,
  initialVocabViewed,
  onVocabViewedChange,
}: {
  vocabulary: VocabItem[];
  vocabGroups?: UnitDef["vocabGroups"];
  onFinish: () => void;
  grade: number;
  unitId: string;
  semId: string;
  stageIdx: number;
  onProgress?: (percent: number) => void;
  initialVocabViewed?: number[];
  onVocabViewedChange?: (indices: number[]) => void;
}) {
  const phonics = getPhonicsForUnit(unitId);
  const [phonicsProgress, setPhonicsProgress] = useState(() =>
    phonics ? loadPhonicsProgress(unitId) : null,
  );
  const [activeGroup, setActiveGroup] = useState<1 | 2 | 3 | 4>(1);
  const [viewed, setViewed] = useState<Set<number>>(() => new Set(initialVocabViewed ?? []));
  const [flipped, setFlipped] = useState<Set<number>>(() => new Set());
  // Category-switch guidance: toast + the pending auto-switch / toast-dismiss timers.
  const [switchToast, setSwitchToast] = useState<string | null>(null);
  const autoSwitchTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const autoAdvancedFrom = useRef<Set<number>>(new Set()); // tabs we've already auto-advanced from
  const autoSwitchInited = useRef(false);

  useEffect(() => {
    if (initialVocabViewed?.length) {
      setViewed((prev) => {
        const merged = new Set([...prev, ...initialVocabViewed]);
        if (merged.size === prev.size) return prev;
        return merged;
      });
    }
  }, [initialVocabViewed]);

  useEffect(() => {
    onVocabViewedChange?.([...viewed].sort((a, b) => a - b));
  }, [viewed, onVocabViewedChange]);

  const groups = useMemo(
    () => getVocabGroups({ vocabulary, vocabGroups }),
    [vocabulary, vocabGroups],
  );
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

  const revealCard = (globalIdx: number, word: string) => {
    markViewed(globalIdx);
    setFlipped((prev) => {
      if (prev.has(globalIdx)) return prev;
      return new Set(prev).add(globalIdx);
    });
    hubSpeak(word, HUB_FIXED_SPEAK_SPEED, grade);
  };

  const toggleCard = (localIdx: number) => {
    const v = activeItems[localIdx];
    if (!v) return;
    const globalIdx = activeOffset + localIdx;
    const isFlipped = flipped.has(globalIdx);
    if (!isFlipped) {
      revealCard(globalIdx, v.en);
    } else {
      setFlipped((prev) => {
        const next = new Set(prev);
        next.delete(globalIdx);
        return next;
      });
    }
  };

  const speakWord = (word: string, globalIdx: number) => {
    revealCard(globalIdx, word);
  };

  useEffect(() => {
    prefetchHubVocabulary(
      vocabulary.map((v) => v.en),
      grade,
      HUB_FIXED_SPEAK_SPEED,
    );
  }, [grade, vocabulary]);

  const requiredViewed = vocabulary.length;
  const allViewed = viewed.size >= requiredViewed;
  const remainingViewed = Math.max(0, requiredViewed - viewed.size);
  const phonicsDone = !phonics || phonicsProgress?.finished;
  const canFinish = allViewed && phonicsDone;

  useEffect(() => {
    if (!onProgress) return;
    const viewPct = requiredViewed > 0 ? viewed.size / requiredViewed : 0;
    if (!phonics) {
      onProgress(Math.round(viewPct * 100));
      return;
    }
    const phPct = phonicsProgress?.finished ? 1 : (phonicsProgress?.completedStages.length ?? 0) / 3;
    onProgress(Math.round(viewPct * 85 + phPct * 15));
  }, [
    onProgress,
    viewed.size,
    requiredViewed,
    phonics,
    phonicsProgress?.finished,
    phonicsProgress?.completedStages.length,
  ]);

  const refreshPhonicsProgress = () => {
    if (phonics) setPhonicsProgress(loadPhonicsProgress(unitId));
  };

  const phonicsTabLabel = phonicsProgress?.finished
    ? "✓"
    : `${phonicsProgress?.completedStages.length ?? 0}/3`;

  const groupViewedCount = (group: NonNullable<typeof groups>[number]) =>
    group.items.reduce((n, _item, i) => (viewed.has(group.offset + i) ? n + 1 : n), 0);

  const groupComplete = (group: NonNullable<typeof groups>[number]) =>
    groupViewedCount(group) >= group.items.length;

  // All tabs (word categories + optional phonics) the kid must clear, in tab order.
  // A tab is incomplete if its cards aren't all viewed (or, for phonics, not finished).
  const guidanceTabs: { id: 1 | 2 | 3 | 4; label: string; complete: boolean }[] = [
    ...(groups ?? []).map((g) => ({ id: g.id, label: g.label, complete: groupComplete(g) })),
    ...(phonics ? [{ id: 4 as const, label: "自然拼读", complete: !!phonicsDone }] : []),
  ];
  const activeTab = guidanceTabs.find((t) => t.id === activeGroup) ?? null;
  // The next entry the kid still needs to open — the target for both the red dot
  // guidance and the auto-switch.
  const nextIncompleteOther = guidanceTabs.find((t) => t.id !== activeGroup && !t.complete) ?? null;
  // Cards still unviewed in the *current* word category (0 for the phonics tab).
  const activeWordGroup = activeGroup !== 4 ? (groups?.find((g) => g.id === activeGroup) ?? null) : null;
  const activeWordRemaining = activeWordGroup
    ? activeWordGroup.items.length - groupViewedCount(activeWordGroup)
    : 0;

  // When the active tab is finished, nudge the kid onward: after a 1.5s "done" beat,
  // auto-switch to the next incomplete tab and toast it. Cancelled if they switch
  // tabs themselves (activeGroup change tears down this effect). Tabs already
  // complete on entry are suppressed so we don't auto-switch the moment they land.
  useEffect(() => {
    if (!groups) return;
    if (!autoSwitchInited.current) {
      autoSwitchInited.current = true;
      guidanceTabs.forEach((t) => t.complete && autoAdvancedFrom.current.add(t.id));
      return;
    }
    if (canFinish) return; // everything done — let the finish button take over
    if (!activeTab?.complete || autoAdvancedFrom.current.has(activeGroup)) return;
    if (!nextIncompleteOther) return;
    autoAdvancedFrom.current.add(activeGroup);
    const fromLabel = activeTab.label;
    const target = nextIncompleteOther;
    autoSwitchTimer.current = window.setTimeout(() => {
      setActiveGroup(target.id);
      setSwitchToast(`✓ ${fromLabel}完成！自动切换到「${target.label}」`);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setSwitchToast(null), 2000);
    }, 1500);
    return () => {
      if (autoSwitchTimer.current) {
        window.clearTimeout(autoSwitchTimer.current);
        autoSwitchTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup, viewed, phonicsDone, canFinish, groups]);

  useEffect(
    () => () => {
      if (autoSwitchTimer.current) window.clearTimeout(autoSwitchTimer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  return (
    <div className="relative rounded-2xl bg-white p-4 shadow-sm">
      {switchToast && (
        <div className="pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2C2C2A] px-4 py-2 text-sm font-bold text-white shadow-lg">
          {switchToast}
        </div>
      )}
      <div className="mb-2 text-base font-semibold">
        📖 {groups ? `认识 ${vocabulary.length} 个单词` : "认识单词"}
      </div>
      {groups && (
        <div className="mb-3 flex flex-wrap gap-2">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setActiveGroup(g.id)}
              className={`relative min-w-[calc(50%-0.25rem)] flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors duration-300 ${
                activeGroup === g.id
                  ? "bg-[#FF6B35] text-white"
                  : "bg-[#F4F0E6] text-[#888780]"
              }`}
            >
              {g.label} ({groupViewedCount(g)}/{g.items.length})
              {activeGroup !== g.id && !groupComplete(g) && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#E24B4A]" aria-hidden />
              )}
            </button>
          ))}
          {phonics && (
            <button
              type="button"
              onClick={() => setActiveGroup(4)}
              className={`relative min-w-[calc(50%-0.25rem)] flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors duration-300 ${
                activeGroup === 4
                  ? "bg-[#FF6B35] text-white"
                  : "bg-[#F4F0E6] text-[#888780]"
              }`}
            >
              🔤 自然拼读 ({phonicsTabLabel})
              {activeGroup !== 4 && !phonicsDone && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#E24B4A]" aria-hidden />
              )}
            </button>
          )}
        </div>
      )}
      {activeGroup !== 4 && activeGroupDef?.header && (
        <div className="mb-2 text-[15px] font-semibold text-[#FF6B35]">{activeGroupDef.header}</div>
      )}
      {activeGroup === 4 && phonics ? (
        <PhonicsSection
          config={phonics}
          grade={grade}
          unitId={unitId}
          embedded
          onProgressUpdate={refreshPhonicsProgress}
        />
      ) : (
        <>
      {phonicsRule && (
        <div className="mb-3 rounded-lg border border-[#FF6B35]/30 bg-[#FFF8F0] px-3 py-2 text-[14px] leading-snug text-[#555]">
          <span className="font-semibold text-[#FF6B35]">🔤 er 发音：</span>
          {phonicsRule}
        </div>
      )}
      <div className="mb-3 text-[14px] text-[#888780]">
        💡 点击卡片、单词或 🔊 都会翻转显示中文并计入已查看
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
        </>
      )}
      <div className="mt-3 text-center text-[14px] text-[#888780]">
        已查看：{viewed.size} / {requiredViewed}
        {groups && activeWordRemaining > 0 && ` · 本类还需 ${activeWordRemaining} 张`}
        {groups && activeWordRemaining === 0 && nextIncompleteOther && ` · 请点击上方「${nextIncompleteOther.label}」继续`}
      </div>
      <PrimaryButton disabled={!canFinish} onClick={onFinish}>
        {canFinish
          ? "✓ 进入下一关 →"
          : !groups || activeWordRemaining > 0
            ? remainingViewed > 0
              ? `还需查看 ${remainingViewed} 张卡片（共 ${requiredViewed} 张）`
              : phonics && !phonicsDone
                ? "请先完成「自然拼读」三个步骤"
                : "查看完所有卡片再继续"
            : nextIncompleteOther
              ? nextIncompleteOther.id === 4
                ? "📌 单词已看完，请点击上方「自然拼读」继续"
                : `📌 还需查看 ${remainingViewed} 张，请点击上方「${nextIncompleteOther.label}」继续`
              : phonics && !phonicsDone
                ? "请先完成「自然拼读」三个步骤"
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
  unitId,
  onFinish,
  onCorrect,
  onWrong,
  initialIdx = 0,
  onProgress,
}: {
  title: string;
  instruction: string;
  questions: Array<{ audio: string; opts: string[]; answer: number; point?: string; cn?: string }>;
  grade: number;
  unitId?: string;
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (q: { audio: string; opts: string[]; answer: number; point?: string; cn?: string }) => void;
  initialIdx?: number;
  onProgress?: (percent: number) => void;
}) {
  const [idx, setIdx] = useState(initialIdx);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  // 选完答案后把"下一题"按钮滚进视口(手机上它常在选项下方屏外)
  const actionRef = useRevealScroll<HTMLDivElement>(answered);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<React.ReactNode>(null);
  const { speed, setSpeed } = useHubSpeakSpeed();
  const isSentenceAudio = title.includes("句") || instruction.includes("句");
  const useAdjustableSpeakSpeed = isSentenceAudio;

  const q = questions[idx];
  const isLast = idx === questions.length - 1;
  const isSentenceListen = isSentenceAudio;

  useEffect(() => {
    if (!questions.length || !onProgress) return;
    onProgress(((idx + (answered ? 1 : 0)) / questions.length) * 100);
  }, [idx, answered, questions.length, onProgress]);

  useEffect(() => {
    prefetchTTSBatchKid(
      questions.map((item) => toHubTtsText(item.audio)),
      useAdjustableSpeakSpeed ? { grade, speed } : { grade },
    );
  }, [grade, questions, speed, useAdjustableSpeakSpeed]);

  const speakPrompt = useCallback(() => {
    const text = q?.audio?.trim();
    if (!text) return;
    if (useAdjustableSpeakSpeed) {
      hubSpeakAtSpeed(text, speed, grade);
      return;
    }
    // Sentence prompts use the slow kid-voice path (<0.75) for clearer playback.
    hubSpeak(text, isSentenceListen ? 0.74 : 0.8, grade);
  }, [q, grade, isSentenceListen, speed, useAdjustableSpeakSpeed]);

  const speakCorrectAnswer = useCallback(() => {
    const text = q?.opts[q.answer]?.trim();
    if (!text) return;
    if (useAdjustableSpeakSpeed) {
      hubSpeakAtSpeed(text, speed, grade);
      return;
    }
    hubSpeak(text, 0.7, grade);
  }, [q, grade, speed, useAdjustableSpeakSpeed]);

  const handlePick = (optIdx: number) => {
    if (answered) return;
    setAnswered(true);
    setPicked(optIdx);
    const isCorrect = optIdx === q.answer;
    reportPrimaryAttempt({ grade, module: "listening", itemType: "listen", itemId: q.audio, itemLabel: q.audio, isCorrect });
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
      {useAdjustableSpeakSpeed && (
        <HubSpeakSpeedControl speed={speed} onChange={setSpeed} className="mb-3" />
      )}
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
      {answered && q.cn && (
        <div className="mt-2 rounded-xl bg-[#F4F6F9] px-3 py-2 text-center text-sm text-[#5A5750]">
          {q.cn}
        </div>
      )}
      {answered && (
        <div ref={actionRef}>
          <PrimaryButton onClick={next} className="mt-3">
            {isLast ? "本关完成 →" : "下一题 →"}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}

function SentenceStage({
  dialogues,
  grade,
  onFinish,
  onProgress,
}: {
  dialogues: UnitDef["dialogues"];
  grade: number;
  onFinish: () => void;
  onProgress?: (percent: number) => void;
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
    if (!patterns.length || !onProgress) return;
    onProgress((expanded.size / patterns.length) * 100);
  }, [expanded.size, patterns.length, onProgress]);

  useEffect(() => {
    const texts = patterns.flatMap((s) => [s.q, s.a].filter(Boolean));
    // 必须走 prefetchHubFixed：它与下面播放用的 HUB_FIXED_SPEAK_SPEED 同源。
    // 原来写 prefetchTTSBatchKid(texts, { grade }) 时 speed 落到 getKidSpeed(grade)，
    // 四~六年级预热成 1.0，而播放是 0.85 → 整关预热全部作废（审计 C2-1）。
    if (texts.length) prefetchHubFixed(texts, grade);
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
              onClick={() => hubSpeak(s.q, HUB_FIXED_SPEAK_SPEED, grade)}
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
                      onClick={() => hubSpeak(s.a, HUB_FIXED_SPEAK_SPEED, grade)}
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

function FinalQuizStage({
  questions,
  unitId,
  unitTitle,
  onFinish,
  onCorrect,
  onWrong,
  initialIdx = 0,
  onProgress,
}: {
  questions: QuizQuestion[];
  unitId: string;
  unitTitle: string;
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (q: QuizQuestion) => void;
  initialIdx?: number;
  onProgress?: (percent: number) => void;
}) {
  const [idx, setIdx] = useState(initialIdx);
  const [answered, setAnswered] = useState(false);
  // 选完答案后把"下一题"按钮滚进视口(手机上它常在选项下方屏外)
  const actionRef = useRevealScroll<HTMLDivElement>(answered);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<React.ReactNode>(null);
  // Synchronous guard against double-advance: a held Enter (key repeat) or a
  // double-click/tap on 下一题 fires next() twice before React commits the
  // answered=false re-render, jumping idx by 2 and skipping a question.
  const advancingRef = useRef(false);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  // Release the advance lock once the new question is on screen.
  useEffect(() => {
    advancingRef.current = false;
  }, [idx]);

  useEffect(() => {
    if (!questions.length || !onProgress) return;
    onProgress(((idx + (answered ? 1 : 0)) / questions.length) * 100);
  }, [idx, answered, questions.length, onProgress]);

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
    if (advancingRef.current) return;
    advancingRef.current = true;
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
      </div>
      <div className="mb-4 text-base font-semibold leading-relaxed">{q.q}</div>
      <QuizOpts opts={q.opts} answer={q.answer} picked={picked} answered={answered} onPick={handlePick} />
      {feedback}
      {answered && (
        <div ref={actionRef}>
          <PrimaryButton onClick={next} className="mt-3">
            {isLast ? "查看成绩 →" : "下一题 →"}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}

export default function PrimaryHubStagePlay({ unitId, semId, stageIdx, onComplete, onBack }: Props) {
  const { grade, userId, state, setState, addMistake, completeStage, updateStageProgress, updateVocabViewed } =
    usePrimaryHub();
  const unit = findUnit(unitId);
  const stage = unit?.stages[stageIdx];
  const readWriteConfig = getReadWriteConfig(unitId, stageIdx);
  const sentenceLesson = getSentenceLesson(unitId, stageIdx);
  const sentenceBackRef = useRef<(() => void) | null>(null);

  const registerSentenceBack = useCallback((handler: (() => void) | null) => {
    sentenceBackRef.current = handler;
  }, []);

  const handleShellBack = useCallback(() => {
    if (sentenceBackRef.current) {
      sentenceBackRef.current();
      return;
    }
    onBack();
  }, [onBack]);

  const us = readUnitState(state, unitId);
  const stars = state.units[unitId]?.stars ?? us.stars;
  const savedStagePercent = us.stageProgress?.[stageIdx] ?? 0;

  const reportStageProgress = useCallback(
    (percent: number) => updateStageProgress(unitId, stageIdx, percent),
    [updateStageProgress, unitId, stageIdx],
  );

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
    const count = getListenWordConfig(`g${grade}` as GradeKey).questionCount;
    const shuffled = shuffleArray([...unit.vocabulary]);
    const audioMap = listenWordAudio as Record<string, string>;
    return shuffled.slice(0, count).map((target) => {
      const distractors = shuffleArray(unit.vocabulary.filter((v) => v.en !== target.en)).slice(0, 3);
      const allOpts = shuffleArray([target, ...distractors]);
      return {
        audio: target.en,
        audioUrl: audioMap[`${grade}|${target.en}`], // 预生成秒播,缺则 undefined → 关卡回退实时 TTS
        opts: allOpts.map((o) => ({ en: o.en, cn: o.cn })),
        answer: allOpts.findIndex((o) => o.en === target.en),
        point: "听力",
      };
    });
  }, [unit, grade]);

  const listenSentQuestions = useMemo(() => {
    if (!unit) return [];
    return shuffleArray([...unit.listeningQuestions]).slice(0, 6);
  }, [unit]);

  const finalQuizQuestions = useMemo(() => {
    if (!unit) return [];
    // Shuffle question order AND each question's options, so the correct answer
    // isn't pinned to a fixed position (kids can't pattern-match "always pick A").
    // useMemo keeps the layout stable for the life of the stage.
    return shuffleArray([...unit.quizQuestions]).map((q) => {
      const correctOpt = q.opts[q.answer];
      const opts = shuffleArray([...q.opts]);
      return { ...q, opts, answer: opts.indexOf(correctOpt) };
    });
  }, [unit]);

  // Read/write training answers live in static JSON in a fixed slot, and the stage
  // renders them in order — so a kid can memorize positions across replays. Shuffle
  // both question order and each question's options (the `correct` flag rides along,
  // so no index recompute is needed). useMemo keeps it stable for the stage's life.
  const readWriteConfigShuffled = useMemo(() => {
    if (!readWriteConfig) return null;
    return {
      ...readWriteConfig,
      questions: shuffleArray([...readWriteConfig.questions]).map((q) => ({
        ...q,
        options: shuffleArray([...q.options]),
      })),
    };
  }, [readWriteConfig]);

  if (!unit || !stage) return null;

  const stageBody = (() => {
    switch (stage.type) {
      case "vocab":
        return (
          <VocabStage
            vocabulary={unit.vocabulary}
            vocabGroups={unit.vocabGroups}
            onFinish={handleFinish}
            grade={grade}
            unitId={unitId}
            semId={semId}
            stageIdx={stageIdx}
            onProgress={reportStageProgress}
            initialVocabViewed={us.vocabViewed}
            onVocabViewedChange={(indices) => updateVocabViewed(unitId, indices)}
          />
        );
      case "listenWord":
        return (
          <ListenWordStage
            questions={listenWordQuestions}
            gradeKey={`g${grade}` as GradeKey}
            grade={grade}
            userId={userId}
            unitId={unitId}
            onFinish={handleFinish}
            onCorrect={addStar}
            initialIdx={stepFromSavedPercent(savedStagePercent, listenWordQuestions.length)}
            onProgress={reportStageProgress}
            onWrong={(q) =>
              addMistake({
                q: `听音选词：${q.audio}`,
                opts: q.opts.map((o) => o.en),
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
            onMatch={(en) => { addStar(); reportPrimaryAttempt({ grade, module: "vocab", itemType: "match", itemId: en, itemLabel: en, isCorrect: true }); }}
            onProgressChange={reportStageProgress}
          />
        );
      case "sentence":
        return sentenceLesson ? (
          <SentenceLessonStage
            lesson={sentenceLesson}
            unitId={unitId}
            stageIdx={stageIdx}
            grade={grade}
            onFinish={handleFinish}
            onProgress={reportStageProgress}
            onRegisterBack={registerSentenceBack}
            onAwardPoints={(n) => {
              for (let i = 0; i < n; i++) addStar();
            }}
          />
        ) : (
          <SentenceStage
            dialogues={unit.dialogues}
            onFinish={handleFinish}
            grade={grade}
            onProgress={reportStageProgress}
          />
        );
      case "write":
        return (
          <SpellingStage
            vocabulary={unit.vocabulary}
            gradeKey={`g${grade}` as GradeKey}
            unitId={unitId}
            userId={userId}
            grade={grade}
            onFinish={handleFinish}
            onCorrect={addStar}
            onProgress={reportStageProgress}
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
            unitId={unitId}
            onFinish={handleFinish}
            onCorrect={addStar}
            initialIdx={stepFromSavedPercent(savedStagePercent, listenSentQuestions.length)}
            onProgress={reportStageProgress}
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
        return readWriteConfigShuffled ? (
          <ReadWriteTrainingStage
            config={readWriteConfigShuffled}
            onFinish={handleFinish}
            onAwardPoints={addStar}
            initialQIdx={stepFromSavedPercent(savedStagePercent, readWriteConfigShuffled.questions.length)}
            onProgress={reportStageProgress}
          />
        ) : (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <div className="text-4xl" aria-hidden>
              🚧
            </div>
            <h2 className="mt-3 text-base font-bold text-[#333]">读写训练内容准备中</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#888780]">
              该关卡内容正在制作中，敬请期待。请先完成前面的学习环节。
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-5 w-full rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-semibold text-white hover:bg-[#E55A28]"
            >
              返回单元
            </button>
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
            initialIdx={stepFromSavedPercent(savedStagePercent, finalQuizQuestions.length)}
            onProgress={reportStageProgress}
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
    <StageShell
      stageIdx={stageIdx}
      stageTitle={stage.title}
      unit={unit}
      stars={stars}
      onBack={handleShellBack}
      headerTitle={sentenceLesson ? stage.title : undefined}
    >
      {stageBody}
    </StageShell>
  );
}
