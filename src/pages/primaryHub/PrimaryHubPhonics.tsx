import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PhonicsConfig } from "@/lib/primaryHub/phonicsRegistry";
import {
  completePhonicsStage,
  loadPhonicsProgress,
  type PhonicsUnitProgress,
} from "@/lib/primaryHub/phonicsStorage";
import { phonicsAudioUrl, playPhonicsAudio, stopPhonicsAudio } from "@/lib/primaryHub/phonicsAudio";
import { hubSpeak, prefetchHubFixed } from "@/lib/primaryHub/speech";
import { HUB_FIXED_SPEAK_SPEED } from "@/lib/primaryHub/hubSpeakSpeed";
import { shuffleArray, usePrimaryHub } from "@/lib/primaryHub/context";

import { getUnitState, savePersist } from "@/lib/primaryHub/storage";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";

const ANSWER_FEEDBACK_MS = 2000;

type Props = {
  config: PhonicsConfig;
  semId: string;
  unitId: string;
  stageIdx: number;
  onBack: () => void;
};

function highlightEr(word: string) {
  const lower = word.toLowerCase();
  const idx = lower.lastIndexOf("er");
  if (idx < 0) return <span>{word}</span>;
  return (
    <>
      {word.slice(0, idx)}
      <span className="font-bold text-[#E0623F]">er</span>
      {word.slice(idx + 2)}
    </>
  );
}

function OrangeButton({
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
      className={`w-full rounded-xl bg-[#FF6B35] px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-[#E55A28] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function Shell({
  config,
  phonicsStage,
  sessionStars,
  onBack,
  children,
}: {
  config: PhonicsConfig;
  phonicsStage: number;
  sessionStars: number;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        <button type="button" onClick={onBack} className="text-xl" aria-label="返回">
          ←
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-bold">{config.title}</div>
          <div className="text-xs text-[#888780]">自然拼读 · 第 {phonicsStage + 1}/3 步</div>
        </div>
        <div className="shrink-0 text-sm font-semibold text-[#FF6B35]">⭐ {sessionStars}</div>
      </div>
      <div className="px-4 py-4">
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#F4F0E6]">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627] transition-all duration-300"
            style={{ width: `${((phonicsStage + 1) / 3) * 100}%` }}
          />
        </div>
        {children}
      </div>
    </>
  );
}

function ListenStage({
  config,
  grade,
  onComplete,
}: {
  config: PhonicsConfig;
  grade: number;
  onComplete: (stars: number) => void;
}) {
  const words = config.stage_1_listen;
  const [heard, setHeard] = useState<Set<string>>(() => new Set());

  const play = (word: string, file?: string) => {
    // 没声明录音文件 → 直接走 TTS（不去请求一个不存在的 mp3）。
    const url = file ? phonicsAudioUrl(config.audioBase, file) : null;
    playPhonicsAudio(url, word, grade);
    setHeard((prev) => new Set(prev).add(word));
  };

  useEffect(() => () => stopPhonicsAudio(), []);

  const allHeard = heard.size >= words.length;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-bold text-[#FF6B35]">听一听 · 认识 er 发音</h2>
      <p className="mb-4 rounded-xl bg-[#FFF8F0] p-3 text-[14px] leading-relaxed text-[#2C2C2A]">
        {config.rule_explanation}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {words.map((item) => {
          const done = heard.has(item.word);
          return (
            <div
              key={item.word}
              className={`rounded-xl border-2 p-3 text-center transition ${
                done ? "border-[#97C459] bg-[#EAF3DE]" : "border-[#EEEAE0] bg-[#FFF8F0]"
              }`}
            >
              <button
                type="button"
                className="mx-auto block text-3xl transition hover:scale-110 active:scale-95"
                onClick={() => play(item.word, item.audio)}
                aria-label={`听 ${item.word} 的发音`}
              >
                {item.emoji}
              </button>
              <div className="mt-2 text-[22px] font-bold leading-tight">
                {highlightEr(item.word)}
              </div>
              <div className="mt-1 text-[14px] text-[#888780]">{item.zh}</div>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#378ADD] px-3 py-1 text-xs font-semibold text-white"
                onClick={() => play(item.word, item.audio)}
              >
                🔊 听发音
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-[15px] text-[#888780]">
        已听 {heard.size}/{words.length}
      </p>
      <OrangeButton disabled={!allHeard} className="mt-3" onClick={() => onComplete(2)}>
        {allHeard ? "下一步：找一找 →" : "请先听完 6 个单词的发音"}
      </OrangeButton>
    </div>
  );
}

function FindStage({
  config,
  grade,
  onComplete,
}: {
  config: PhonicsConfig;
  grade: number;
  onComplete: (stars: number) => void;
}) {
  const items = useMemo(
    () => shuffleArray([...config.stage_2_find]),
    [config.stage_2_find],
  );
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // 与下面 toggle 播放用的 HUB_FIXED_SPEAK_SPEED 同源；原来传 { grade } 会落到
    // getKidSpeed(grade)=1.0（四年级），播放是 0.85 → 预热 100% 作废（审计 C2-2）。
    prefetchHubFixed(
      items.map((item) => item.word),
      grade,
    );
  }, [grade, items]);

  const erWords = useMemo(
    () => new Set(items.filter((w) => w.matchesRule).map((w) => w.word)),
    [items],
  );

  const toggle = (word: string) => {
    hubSpeak(word, HUB_FIXED_SPEAK_SPEED, grade);
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const reset = () => {
    setSelected(new Set());
    setChecked(false);
  };

  const allCorrect =
    selected.size === erWords.size && [...selected].every((w) => erWords.has(w));

  const wordClass = (word: string, hasEr: boolean) => {
    let cls =
      "rounded-xl border-2 px-3 py-3 text-center text-[20px] font-semibold transition ";
    if (!checked) {
      cls += selected.has(word)
        ? "border-[#378ADD] bg-[#E6F1FB]"
        : "border-[#EEEAE0] bg-white hover:border-[#FF6B35]/50";
      return cls;
    }
    if (hasEr) {
      if (selected.has(word)) cls += "border-[#6FA92A] bg-[#EAF3DE]";
      else cls += "border-[#FFB627] bg-[#FFF4D6]";
    } else if (selected.has(word)) cls += "border-[#E0623F] bg-[#FFF0EB]";
    else cls += "border-[#EEEAE0] bg-white opacity-60";
    return cls;
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-bold text-[#FF6B35]">找一找 · 选出含 er 的词</h2>
      <p className="mb-4 text-[14px] text-[#888780]">
        轻触所有末尾发 /ə(r)/ 音的单词（共 5 个）
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.word}
            type="button"
            disabled={checked}
            className={wordClass(item.word, item.matchesRule)}
            onClick={() => toggle(item.word)}
          >
            {highlightEr(item.word)}
          </button>
        ))}
      </div>
      {checked && !allCorrect && (
        <p className="feedback-box mt-3 bg-[#FFF0EB] text-[#E0623F]">
          绿色=答对 · 黄色=漏选 · 红色=多选错了，再试一次吧！
        </p>
      )}
      {checked && allCorrect && (
        <p className="feedback-box mt-3 bg-[#EAF3DE] text-[#4A7C1C]">太棒了！全部找对啦 🎉</p>
      )}
      <div className="mt-4 flex flex-col gap-2">
        {!checked ? (
          <OrangeButton disabled={selected.size === 0} onClick={() => setChecked(true)}>
            检查答案
          </OrangeButton>
        ) : allCorrect ? (
          <OrangeButton onClick={() => onComplete(2)}>下一步：挑战 →</OrangeButton>
        ) : (
          <OrangeButton onClick={reset}>重新开始</OrangeButton>
        )}
      </div>
    </div>
  );
}

function ChallengeStage({
  config,
  grade,
  onComplete,
  embedded = false,
}: {
  config: PhonicsConfig;
  grade: number;
  onComplete: (stars: number) => void;
  embedded?: boolean;
}) {
  const questions = config.stage_3_challenge;
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[qIdx];
  const isLast = qIdx >= questions.length - 1;

  const handlePick = (idx: number) => {
    hubSpeak(q.options[idx], HUB_FIXED_SPEAK_SPEED, grade);
    if (answered && picked === q.correct) return;
    setPicked(idx);
    if (idx !== q.correct) {
      setAnswered(true);
      window.setTimeout(() => {
        setPicked(null);
        setAnswered(false);
      }, ANSWER_FEEDBACK_MS);
      return;
    }
    setAnswered(true);
    if (!isLast) {
      window.setTimeout(() => {
        setQIdx((i) => i + 1);
        setPicked(null);
        setAnswered(false);
      }, ANSWER_FEEDBACK_MS);
    }
  };

  const showCelebration = () => setDone(true);

  useMcKeyboard({
    optionCount: q.options.length,
    answered,
    onPick: handlePick,
    onNext: () => {
      if (answered && picked === q.correct && isLast) showCelebration();
    },
  });

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="text-6xl">🏆</div>
        <h2 className="mt-3 text-xl font-bold text-[#FF6B35]">拼读挑战完成！</h2>
        <p className="mt-2 text-[15px] text-[#888780]">你已掌握 er 在词尾的轻声发音</p>
        <div className="mt-2 text-3xl">⭐⭐⭐</div>
        <OrangeButton className="mt-6" onClick={() => onComplete(2)}>
          {embedded ? "完成 ✓" : "完成 · 返回"}
        </OrangeButton>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-bold text-[#FF6B35]">挑战 · 看图选词</h2>
      <div className="mb-3 flex justify-between text-[14px] text-[#888780]">
        <span>
          第 {qIdx + 1} / {questions.length} 题
        </span>
      </div>
      <div className="mb-4 grid place-items-center rounded-xl bg-[#FFF8F0] py-6 text-5xl">
        {q.image}
      </div>
      <p className="mb-1 text-[20px] font-bold leading-snug">{q.sentence.replace("___", "______")}</p>
      <p className="mb-4 text-[14px] text-[#888780]">{q.hint}</p>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, j) => {
          let cls =
            "quiz-opt flex w-full items-center gap-3 rounded-xl border-2 border-[#EEEAE0] bg-white p-3 text-left text-[16px] font-medium transition disabled:cursor-not-allowed";
          if (answered) {
            if (j === q.correct) cls += " correct";
            else if (j === picked) cls += " wrong";
            else cls += " dimmed";
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={answered}
              className={cls}
              onClick={() => handlePick(j)}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#F4F0E6] text-xs font-bold text-[#888780]">
                {String.fromCharCode(65 + j)}
              </span>
              <span>{highlightEr(opt)}</span>
            </button>
          );
        })}
      </div>
      {answered && picked !== q.correct && (
        <p className="feedback-box mt-3 bg-[#FFF0EB] text-[#E0623F]">再想想，哪个词里有 er 发音？</p>
      )}
      {answered && picked === q.correct && isLast && (
        <>
          <p className="feedback-box mt-3 bg-[#EAF3DE] text-[#4A7C1C]">答对了！</p>
          <OrangeButton className="mt-3" onClick={showCelebration}>
            查看庆祝 →
          </OrangeButton>
        </>
      )}
      {answered && picked === q.correct && !isLast && (
        <p className="feedback-box mt-3 bg-[#EAF3DE] text-[#4A7C1C]">答对了！</p>
      )}
    </div>
  );
}

export function PhonicsSection({
  config,
  grade,
  unitId,
  embedded = false,
  onProgressUpdate,
}: {
  config: PhonicsConfig;
  grade: number;
  unitId: string;
  embedded?: boolean;
  onProgressUpdate?: () => void;
}) {
  const { setState } = usePrimaryHub();
  const [progress, setProgress] = useState<PhonicsUnitProgress>(() => loadPhonicsProgress(unitId));
  const [phonicsStage, setPhonicsStage] = useState(() => {
    const done = progress.completedStages;
    if (done.length >= 3) return 2;
    for (let s = 0; s < 3; s++) {
      if (!done.includes(s)) return s;
    }
    return 0;
  });

  const finishStage = useCallback(
    (idx: number, stars: number) => {
      const next = completePhonicsStage(unitId, idx, stars);
      setProgress(next);
      onProgressUpdate?.();
      if (idx < 2) {
        setPhonicsStage(idx + 1);
        return;
      }
      setState((prev) => {
        const us = getUnitState(prev, unitId);
        const updated = {
          ...prev,
          units: {
            ...prev.units,
            [unitId]: { ...us, stars: us.stars + 3 },
          },
        };
        savePersist(grade, updated);
        return updated;
      });
    },
    [grade, onProgressUpdate, setState, unitId],
  );

  const stageBody = (() => {
    switch (phonicsStage) {
      case 0:
        return (
          <ListenStage config={config} grade={grade} onComplete={(s) => finishStage(0, s)} />
        );
      case 1:
        return (
          <FindStage config={config} grade={grade} onComplete={(s) => finishStage(1, s)} />
        );
      case 2:
        return (
          <ChallengeStage
            config={config}
            grade={grade}
            onComplete={(s) => finishStage(2, s)}
            embedded={embedded}
          />
        );
      default:
        return null;
    }
  })();

  if (embedded) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[14px] text-[#888780]">
          <span className="font-semibold text-[#FF6B35]">自然拼读 · 第 {phonicsStage + 1}/3 步</span>
          <span>⭐ {progress.sessionStars}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#F4F0E6]">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627] transition-all duration-300"
            style={{ width: `${((phonicsStage + 1) / 3) * 100}%` }}
          />
        </div>
        {stageBody}
        {progress.finished && (
          <p className="text-center text-sm font-semibold text-[#6FA92A]">✓ 自然拼读已完成</p>
        )}
      </div>
    );
  }

  return stageBody;
}

export default function PrimaryHubPhonics({ config, semId, unitId, stageIdx, onBack }: Props) {
  const { grade, setState } = usePrimaryHub();
  const nav = useNavigate();
  const base = `/primary/hub/${grade}`;

  const [progress, setProgress] = useState<PhonicsUnitProgress>(() =>
    loadPhonicsProgress(unitId),
  );

  const maxUnlocked = useMemo(() => {
    if (progress.finished) return 2;
    const done = progress.completedStages;
    if (done.includes(0) && done.includes(1)) return 2;
    if (done.includes(0)) return 1;
    return 0;
  }, [progress]);

  const [phonicsStage, setPhonicsStage] = useState(() => {
    const done = progress.completedStages;
    if (done.length >= 3) return 2;
    for (let s = 0; s < 3; s++) {
      if (!done.includes(s)) return s;
    }
    return Math.min(maxUnlocked, 2);
  });

  const finishStage = useCallback(
    (idx: number, stars: number) => {
      const next = completePhonicsStage(unitId, idx, stars);
      setProgress(next);
      if (idx < 2) {
        setPhonicsStage(idx + 1);
        return;
      }
      setState((prev) => {
        const us = getUnitState(prev, unitId);
        const updated = {
          ...prev,
          units: {
            ...prev.units,
            [unitId]: { ...us, stars: us.stars + 3 },
          },
        };
        savePersist(grade, updated);
        return updated;
      });
      nav(`${base}/semester/${semId}/unit/${unitId}/stage/${stageIdx}`, {
        state: { phonicsComplete: true },
      });
    },
    [base, grade, nav, semId, setState, stageIdx, unitId],
  );

  const sessionStars = progress.sessionStars;

  const body = (() => {
    switch (phonicsStage) {
      case 0:
        return (
          <ListenStage config={config} grade={grade} onComplete={(s) => finishStage(0, s)} />
        );
      case 1:
        return <FindStage config={config} grade={grade} onComplete={(s) => finishStage(1, s)} />;
      case 2:
        return (
          <ChallengeStage config={config} grade={grade} onComplete={(s) => finishStage(2, s)} />
        );
      default:
        return null;
    }
  })();

  return (
    <Shell
      config={config}
      phonicsStage={phonicsStage}
      sessionStars={sessionStars}
      onBack={onBack}
    >
      {body}
    </Shell>
  );
}
