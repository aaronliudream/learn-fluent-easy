import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRevealScroll } from "@/lib/useRevealScroll";
import { findUnit } from "@/lib/juniorHub/courseData";
import { shuffleArray, useJuniorHub } from "@/lib/juniorHub/context";
import { getUnitState, savePersist } from "@/lib/juniorHub/storage";
import { hubSpeak } from "@/lib/primaryHub/speech";
import { prefetchTTSBatchKid } from "@/lib/speak";
import { JUNIOR_SPEAK_SPEED, prefetchJuniorWriteStage } from "@/lib/juniorHub/speakSpeeds";
import { useMcKeyboard } from "@/hooks/useMcKeyboard";
import WordMatchingGame from "@/components/hub/WordMatchingGame";
import type { ListeningQuestion, QuizQuestion, UnitDef, VocabItem } from "@/lib/juniorHub/types";
import { useUnitVocab, useRankedUnitVocab } from "@/lib/juniorHub/useUnitVocab";
import { REAL_WRITING_BOOKS } from "@/lib/juniorHub/realWritingBooks";
import { loadProgressForCodes } from "@/lib/juniorGrammarUnits";
import { publisherForBasePath } from "@/lib/gaokaoHub/publisher";
import { gpct, type GrammarProgress } from "@/lib/juniorGrammarQuestionMastery";
import { Link, useSearchParams } from "react-router-dom";
import { useGrammarPointId } from "@/hooks/useGrammarPointId";
import { useKnowledgePointId } from "@/hooks/useKnowledgePointId";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { loadMastery, type MasteryRow } from "@/lib/masteryProgress";
import { recordJuniorWordMastery, recordJuniorWordViewed } from "@/lib/juniorWordMastery";
import GrammarTipsCard from "@/components/grammar/GrammarTipsCard";
import { buildFinalQuiz, type FinalQuizItem } from "@/lib/juniorFinalQuiz";
import { recordJuniorGrammarAttempt } from "@/lib/juniorGrammarFsrs";
import { awardCoins } from "@/lib/coins";
import { bumpPetSkill } from "@/lib/petSkills";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { recordHubMistake } from "@/lib/recordHubMistake";
import { recordFinalQuizMistake } from "@/lib/finalQuizMistake";
import { celebrateScore } from "@/lib/feedback";
import { toast } from "sonner";

type Props = {
  unitId: string;
  stageIdx: number;
  onComplete: (needAiTest: boolean) => void;
  onBack: () => void;
  /** 路由外壳:初中默认 '/junior',高中传 '/gaokao'(子页镜像路由,全程不掉初中)。换壳不换芯。 */
  basePath?: string;
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
  optsCn,
  optsPhrase,
}: {
  opts: string[];
  answer: number;
  picked: number | null;
  answered: boolean;
  onPick: (idx: number) => void;
  /** 听音辨词:答完后每个选项跟一行中文释义(从 junior_vocab.meaning_cn 传入)。缺失则该项不显。 */
  optsCn?: (string | null | undefined)[];
  /** 听音辨词:答完后再跟一行英文短语/语块(junior_vocab.phrase_en)。缺失则该行不显。 */
  optsPhrase?: (string | null | undefined)[];
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
            <span className="flex min-w-0 flex-col">
              <span>{opt}</span>
              {answered && optsCn?.[j] && (
                <span className="mt-0.5 text-[11px] font-normal text-[#888780]">{optsCn[j]}</span>
              )}
              {answered && optsPhrase?.[j] && (
                <span className="text-[11px] font-normal italic text-[#185FA5]">{optsPhrase[j]}</span>
              )}
            </span>
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
  prominentBack = false,
}: {
  stageIdx: number;
  stageTitle: string;
  unit: UnitDef;
  stars: number;
  onBack: () => void;
  children: React.ReactNode;
  /** 高中(方案B)用醒目的"返回单元"按钮;初中保持原样的裸"←"(零变化)。 */
  prominentBack?: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-[#EEEAE0] bg-white px-4 py-3">
        {prominentBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 active:scale-95"
          >
            ← 返回单元
          </button>
        ) : (
          <button type="button" onClick={onBack} className="text-xl">
            ←
          </button>
        )}
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

// 核心词汇(第1关):从 junior_vocab DB 读全单元词(useUnitVocab,与听音辨词/词义配对同源),
// 每组 12 词分组浏览(仿听音辨词:本组看完→"还有 X 词,继续下一组吗")。纯显示分组,不碰掌握度/进度。
const VOCAB_GROUP = 12;

function VocabStage({
  unit,
  grade,
  onFinish,
  publisher,
}: {
  unit: UnitDef;
  grade: number;
  onFinish: () => void;
  publisher?: string | null;
}) {
  const { state, setVocabGroup } = useJuniorHub();
  const savedGroup = getUnitState(state, unit.id).vocabGroup ?? 0;
  const words = useUnitVocab(unit, grade, publisher);
  const [groupIdx, setGroupIdx] = useState(savedGroup); // 跨设备续学:从上次看到的组开始
  const [between, setBetween] = useState(false);
  const [viewed, setViewed] = useState<Set<number>>(() => new Set());
  const [flipped, setFlipped] = useState<Set<number>>(() => new Set());
  const topRef = useRef<HTMLDivElement | null>(null);

  const speakWord = (word: string) => hubSpeak(word, JUNIOR_SPEAK_SPEED.normal, grade);

  // 切组 / 进中转卡时滚到顶部,让新内容(中转卡 / 下一组卡片)立即可见。
  // 否则手机端用户停在底部点"本组完成"后,短中转卡在屏幕上方,看起来像"没反应"。
  useEffect(() => {
    if (between || groupIdx > 0) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [between, groupIdx]);

  // 进关预热整单元发音(分组浏览时下一组也已暖)
  useEffect(() => {
    if (!words) return;
    prefetchTTSBatchKid(
      words.map((v) => v.en),
      { grade, speed: JUNIOR_SPEAK_SPEED.normal },
    );
  }, [grade, words]);

  // 切组时重置本组浏览状态(纯显示,不动任何进度/掌握度)
  useEffect(() => {
    setViewed(new Set());
    setFlipped(new Set());
  }, [groupIdx]);

  const groups = useMemo<VocabItem[][]>(() => {
    if (!words) return [];
    const out: VocabItem[][] = [];
    for (let i = 0; i < words.length; i += VOCAB_GROUP) out.push(words.slice(i, i + VOCAB_GROUP));
    return out;
  }, [words]);

  // 词表加载后:若续学的组号越界(词表变动)→ 夹到最后一组
  useEffect(() => {
    if (groups.length && groupIdx > groups.length - 1) setGroupIdx(groups.length - 1);
  }, [groups.length, groupIdx]);

  // 记"看到第几组"(只进不退,存 junior_hub_progress.state 云同步;不写掌握度)
  useEffect(() => {
    if (groups.length) setVocabGroup(unit.id, Math.min(groupIdx, groups.length - 1));
  }, [groupIdx, groups.length, unit.id, setVocabGroup]);

  if (words === null)
    return <div className="rounded-2xl bg-white p-4 text-center text-sm text-[#5C5751]">加载中…</div>;

  const currentGroup = groups[groupIdx] ?? [];
  const isLastGroup = groupIdx >= groups.length - 1;
  const tested = Math.min(words.length, (groupIdx + 1) * VOCAB_GROUP);
  const remaining = words.length - tested;
  const allViewed = currentGroup.length > 0 && viewed.size === currentGroup.length;

  // 本组完成中转卡(与听音辨词一致的交互)
  if (between) {
    return (
      <div ref={topRef} className="rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-card">
        <div className="mb-2 text-lg font-bold text-[#2C2C2A] dark:text-foreground">
          第 {groupIdx + 1} / {groups.length} 组完成 🎉
        </div>
        <div className="mb-4 text-sm text-[#5C5751] dark:text-muted-foreground">
          本单元还有 <strong>{remaining}</strong> 个词没看,继续看下一组吗?
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
        </div>
      </div>
    );
  }

  const toggleCard = (i: number) => {
    const v = currentGroup[i];
    if (!v) return;
    const isFlipped = flipped.has(i);
    if (!isFlipped) {
      setFlipped((prev) => new Set(prev).add(i));
      setViewed((prev) => new Set(prev).add(i));
      speakWord(v.en);
      // 点开看中文 → 按词记"看过"(建 junior_word_mastery 行,不动游戏计数)→ 完成度绿环=点开词数。
      if (v.id) void recordJuniorWordViewed(v.id, grade);
    } else {
      setFlipped((prev) => {
        const next = new Set(prev);
        next.delete(i);
        return next;
      });
    }
  };

  const onPrimary = () => {
    if (isLastGroup) onFinish();
    else setBetween(true);
  };

  return (
    <div ref={topRef} className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#FF6B35] px-3 py-1 text-sm font-bold text-white">
          第 {groupIdx + 1} / {groups.length} 组
        </span>
        <span className="text-xs text-[#888780]">
          已学 {groupIdx + 1}/{groups.length} 组 · {Math.round(((groupIdx + 1) / groups.length) * 100)}%
        </span>
      </div>
      <div className="mb-3 text-xs text-[#888780]">💡 共 {words.length} 词 · 本组 {currentGroup.length} 个;点卡片看中文，点 🔊 听发音</div>
      <div className="grid grid-cols-2 gap-2">
        {currentGroup.map((v, i) => {
          const isFlipped = flipped.has(i);
          return (
            <div
              key={`${groupIdx}-${v.en}`}
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
                  {v.phonetic && <div className="text-[11px] text-[#888780]">{v.phonetic}</div>}
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
                  {v.phonetic && <div className="text-[11px] text-[#888780]">{v.phonetic}</div>}
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
        已查看：{viewed.size} / {currentGroup.length}
      </div>
      <PrimaryButton disabled={!allViewed} onClick={onPrimary}>
        {allViewed ? (isLastGroup ? "✓ 进入下一关 →" : "本组完成 →") : "查看完本组卡片再继续"}
      </PrimaryButton>
    </div>
  );
}

// 词义配对(match 关):未掌握优先(match 通道:match_consec≥2 沉底,排序非过滤),每组 12 词分批。
// 配对成功 → 加星(原行为)+ recordJuniorWordMastery(kind:"match",isCorrect:true);错配不记。
function MatchStage({
  unit,
  grade,
  onFinish,
  onMatch,
  publisher,
}: {
  unit: UnitDef;
  grade: number;
  onFinish: () => void;
  onMatch: () => void;
  publisher?: string | null;
}) {
  const ranked = useRankedUnitVocab(unit, grade, "match", publisher);
  const idByEn = useMemo(() => {
    const m = new Map<string, string>();
    for (const w of ranked.words ?? []) if (w.id) m.set(w.en, w.id);
    return m;
  }, [ranked.words]);

  if (ranked.words === null)
    return <div className="rounded-2xl bg-white p-4 text-center text-sm text-[#5C5751]">加载中…</div>;

  const handleMatch = (en: string) => {
    onMatch(); // 加星(原行为)
    const id = idByEn.get(en);
    if (id) void recordJuniorWordMastery({ wordId: id, grade, kind: "match", isCorrect: true }); // 只记成功
  };

  return (
    <div className="space-y-2">
      <div className="text-center text-xs text-[#888780]">
        已掌握 {ranked.masteredCount}/{ranked.total} 词(配对)
      </div>
      <WordMatchingGame
        vocabulary={ranked.words}
        grade={grade}
        onFinish={onFinish}
        onMatch={handleMatch}
        batchSize={VOCAB_GROUP}
        preserveOrder
      />
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
  questions: Array<{ audio: string; opts: string[]; answer: number; point?: string; cn?: string; optsCn?: (string | null | undefined)[]; optsPhrase?: (string | null | undefined)[]; example?: { en: string; cn: string }; wordId?: string }>;
  grade: number;
  onFinish: () => void;
  onCorrect: (q?: { audio: string; opts: string[]; answer: number; point?: string; cn?: string; optsCn?: (string | null | undefined)[]; optsPhrase?: (string | null | undefined)[]; example?: { en: string; cn: string }; wordId?: string }) => void;
  onWrong: (q: { audio: string; opts: string[]; answer: number; point?: string; cn?: string; optsCn?: (string | null | undefined)[]; optsPhrase?: (string | null | undefined)[]; example?: { en: string; cn: string }; wordId?: string; picked?: number }) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<React.ReactNode>(null);
  const actionRef = useRevealScroll<HTMLDivElement>(answered);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  useEffect(() => {
    prefetchTTSBatchKid(
      questions.map((item) => item.audio),
      { grade, speed: JUNIOR_SPEAK_SPEED.listen },
    );
  }, [grade, questions]);

  // 选完答案后把"下一题"按钮滚进视口 —— 见 useRevealScroll。
  // 原实现滚的是按钮之后的零高度哨兵、且只等 80ms:反馈区渲染完会把按钮再顶下去,
  // 于是手机上仍要手滑(真机在听音辨词撞到)。改成滚按钮本身 + 等一帧 + block:'nearest'。

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
      onWrong({ ...q, picked: optIdx });
      setFeedback(
        <div className="feedback-box warning">
          💡 正确答案：<strong>{q.opts[q.answer]}</strong>
          {!title.includes("句") && (
            <button
              type="button"
              className="ml-2 rounded-lg bg-[#378ADD] px-2.5 py-1 text-xs text-white"
              onClick={() => hubSpeak(q.opts[q.answer], JUNIOR_SPEAK_SPEED.slow, grade)}
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
          onClick={() => hubSpeak(q.audio, JUNIOR_SPEAK_SPEED.listen, grade)}
        >
          🔊
        </button>
        <div className="mt-2 text-xs text-[#185FA5]">可多次点击重复听</div>
      </div>
      <QuizOpts opts={q.opts} answer={q.answer} picked={picked} answered={answered} onPick={handlePick} optsCn={q.optsCn} optsPhrase={q.optsPhrase} />
      {feedback}
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

// 听音辨词(第2关):读 junior_vocab 全单元词(34-77),按 grade+volume+unit;
// 一组 12 题,做完弹"还有 X 词,继续下一组吗";选对显示中文释义(+有例句则显);答对/答错写词汇掌握度(listen 通道)。
// 无 DB 词(grade7/Starter 等)→ 回退 JSON unit.vocabulary(含 chunk 例句)。
type LWWord = { wordId?: string; word: string; cn: string; phrase?: string; example?: { en: string; cn: string } };
const LW_GROUP = 12;

function ListenWordStage({
  unit,
  grade,
  onFinish,
  onCorrect,
  onWrong,
  publisher,
}: {
  unit: UnitDef;
  grade: number;
  onFinish: () => void;
  onCorrect: (q: { wordId?: string }) => void;
  onWrong: (q: { audio: string; opts: string[]; answer: number; wordId?: string }) => void;
  publisher?: string | null;
}) {
  // 未掌握优先排序(listen 通道:listen_correct≥2 沉底),排序非过滤——掌握词保留在后面的组。
  const ranked = useRankedUnitVocab(unit, grade, "listen", publisher);
  const [groupIdx, setGroupIdx] = useState(0);
  const [between, setBetween] = useState(false);

  const words = useMemo<LWWord[] | null>(() => {
    if (!ranked.words) return null;
    return ranked.words.map((v) => ({
      wordId: v.id, // junior_word_mastery.word_id = junior_vocab.id(uuid)
      word: v.en,
      cn: v.cn,
      phrase: v.phrase, // 英文短语/语块,缺则不显
      example: v.example ?? v.chunks?.[0], // DB 例句优先;JSON 回退用 chunk
    }));
  }, [ranked.words]);

  // 已按未掌握优先排好序,直接切组(不再 shuffle,保住"未掌握在前"的顺序)
  const groups = useMemo(() => {
    if (!words) return [];
    const out: LWWord[][] = [];
    for (let i = 0; i < words.length; i += LW_GROUP) out.push(words.slice(i, i + LW_GROUP));
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
        optsCn: allOpts.map((o) => o.cn), // 选对后每个选项跟一行中文释义,一眼过 4 个词
        optsPhrase: allOpts.map((o) => o.phrase), // 再跟一行英文短语/语块(phrase_en)
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
          本单元还有 <strong>{remaining}</strong> 个词没测。
          <br />
          <span className="text-xs opacity-80">全部测完才算通关;想先离开可直接返回,进度已保存。</span>
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
        </div>
      </div>
    );
  }

  return (
    <ListenMcStage
      key={groupIdx}
      title="听音辨词"
      instruction={`🎧 听一听,是哪个单词?(第 ${groupIdx + 1}/${groups.length} 组 · 已掌握 ${ranked.masteredCount}/${ranked.total} 词)`}
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
              onClick={() => hubSpeak(s.q, JUNIOR_SPEAK_SPEED.normal, grade)}
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
                      onClick={() => hubSpeak(s.a, JUNIOR_SPEAK_SPEED.normal, grade)}
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
    // 默写关同一批词会按两档播（答对 normal / 答错·点读 slow），必须两档都热。
    // 原来写 { grade } 会漏传 speed → 落到 getKidSpeed(7/8/9)=1.0，预热 100% 作废。
    prefetchJuniorWriteStage(
      vocabulary.map((v) => v.en),
      grade,
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
      hubSpeak(answer, JUNIOR_SPEAK_SPEED.normal, grade);
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
      hubSpeak(answer, JUNIOR_SPEAK_SPEED.slow, grade);
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
              onClick={() => hubSpeak(v.en, JUNIOR_SPEAK_SPEED.slow, grade)}
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
    if (audios.length) prefetchTTSBatchKid(audios, { grade, speed: JUNIOR_SPEAK_SPEED.listen });
  }, [grade, questions]);

  const handlePick = (optIdx: number) => {
    if (answered) return;
    setAnswered(true);
    setPicked(optIdx);
    const isCorrect = optIdx === q.answer;
    onAnswered?.(q, isCorrect);
    // 答题后"学到一个词/句":听力题→原文;词汇题→完整释义+例句;语法/阅读→解析(已有)。
    const learnMore = (
      <>
        {q.kind === "listening" && q.audio && (
          <div className="mt-1 text-xs font-normal text-[#5C5751]">🔊 原文：{q.audio}</div>
        )}
        {q.kind === "vocab" && (q.meaningFull || q.exampleEn) && (
          <div className="mt-1 text-xs font-normal text-[#5C5751]">
            {q.meaningFull && <div>释义：{q.meaningFull}</div>}
            {q.exampleEn && (
              <div className="mt-0.5">
                例：{q.exampleEn}
                {q.exampleCn ? ` ${q.exampleCn}` : ""}
              </div>
            )}
          </div>
        )}
        {q.explanation && <div className="mt-1 text-xs font-normal text-[#5C5751]">{q.explanation}</div>}
      </>
    );
    if (isCorrect) {
      onCorrect();
      setFeedback(
        <div className="feedback-box success">
          ✨ 答对了！
          {learnMore}
        </div>,
      );
    } else {
      onWrong({ ...q, unitTitle, picked: optIdx });
      setFeedback(
        <div className="feedback-box warning">
          💡 正确答案：<strong>{q.opts[q.answer]}</strong>
          {learnMore}
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
      <div className="mb-4 whitespace-pre-line text-base font-semibold leading-relaxed">{q.q?.replace(/\\n/g, "\n")}</div>
      {q.kind === "listening" && q.audio && (
        <button
          type="button"
          onClick={() => hubSpeak(q.audio!, JUNIOR_SPEAK_SPEED.listen, grade)}
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

// 第4关语法关顶部:显示该单元 完成度/掌握度(与语法专项页 L2 同源同口径)。
function UnitGrammarProgress({ codes, publisher }: { codes: string[]; publisher?: string | null }) {
  const [prog, setProg] = useState<GrammarProgress | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await loadProgressForCodes(codes, publisher ?? undefined);
      if (!cancelled) setProg(p);
    })();
    return () => {
      cancelled = true;
    };
  }, [codes.join(","), publisher]);
  if (!prog || prog.total === 0) return null;
  return (
    <div className="mb-3 grid grid-cols-2 gap-2">
      <GrammarProgPill label="完成度" value={gpct(prog.done, prog.total)} sub={`${prog.done}/${prog.total} 题`} color="emerald" />
      <GrammarProgPill label="掌握度" value={gpct(prog.mastered, prog.total)} sub={`${prog.mastered}/${prog.total} 题`} color="amber" />
    </div>
  );
}

function GrammarProgPill({ label, value, sub, color }: { label: string; value: number; sub: string; color: "emerald" | "amber" }) {
  const bar = color === "emerald" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <div className="rounded-xl border border-[#EEEAE0] bg-[#FAF8F3] p-2 dark:border-border dark:bg-muted/30">
      <div className="flex items-center justify-between text-[10px] font-bold text-[#5C5751] dark:text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${bar}`} style={{ width: `${Math.max(2, value)}%` }} />
      </div>
      <div className="mt-0.5 text-[9px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function GrammarStage({
  unit,
  grade,
  onFinish,
  basePath = "/junior",
  publisher,
}: {
  unit: UnitDef;
  grade: number;
  onFinish: () => void;
  basePath?: string;
  publisher?: string | null;
}) {
  const pointId = useGrammarPointId(unit.grammarCode);
  // 优先用上层传入的 publisher(已含 ?publisher=);未传则按 basePath 推(/gaokao→pep,/junior→null,行为不变)。
  const pub = publisher !== undefined ? publisher : publisherForBasePath(basePath);
  // returnTo = 当前关 URL(高中=/gaokao/hub/...);子页带它返回 → 全程不掉初中。
  const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
  // 子页带上 publisher(非 pep 时),让综合测/真题测按出版社取题与算掌握度;pep/junior(null)不加,URL 干净零回归。
  const pubQ = pub && pub !== "pep" ? `&publisher=${pub}` : "";
  const masteryPath = pointId ? `${basePath}/grammar/${pointId}/mastery?returnTo=${returnTo}${pubQ}` : null;
  const kpPracticeId = useKnowledgePointId(unit.grammarKpCode);

  // ★完成判据(Aaron 2026-07-27 收紧)★:本单元语法题**全部做过**才自动通关。
  // 旧判据是三个「已完成,标记本关通过」按钮 —— 学生自己声明,最弱的一种。
  // 这里读 loadProgressForCodes 的 done/total(题级,与语法专项页/单元综合测试同源),
  // done === total 时自动 onFinish(ref 防重)。历史 ✓ 按方案 B 保留,不回收。
  const [gp, setGp] = useState<{ done: number; total: number } | null>(null);
  const gDoneRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    const codes = unit.grammarCodes ?? [];
    if (!codes.length) return;
    (async () => {
      const p = await loadProgressForCodes(codes, pub ?? undefined);
      if (!cancelled) setGp({ done: p.done, total: p.total });
    })();
    return () => {
      cancelled = true;
    };
  }, [unit.id, pub]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (gp && gp.total > 0 && gp.done >= gp.total && !gDoneRef.current) {
      gDoneRef.current = true;
      onFinish();
    }
  }, [gp]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 语法关底部的进度提示 —— 取代原来的「标记本关通过」按钮。 */
  const grammarProgressHint = gp && gp.total > 0 ? (
    <p className="mt-2 text-center text-xs text-[#888780]">
      本单元语法题 {gp.done}/{gp.total} 已做过{gp.done >= gp.total ? " · 已通关 ✓" : " · 全部做过即自动通关"}
    </p>
  ) : null;

  // 单知识点专项：配了 grammarKpCode 的单元只练该 kp(优先于综合测/单点闯关)。
  if (unit.grammarKpCode && kpPracticeId) {
    const kpPath = `${basePath}/grammar/kp/${kpPracticeId}?returnTo=${returnTo}${pubQ}`;
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <GrammarTipsCard volume={unit.book} unit={unit.unitKey} publisher={pub} />
        <p className="mb-3 text-sm text-[#5C5751]">本单元语法专项练习：连续答对即点亮掌握度，成绩计入你的语法掌握。</p>
        <Link
          to={kpPath}
          className="mb-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white"
        >
          进入专项练习 →
        </Link>
        {grammarProgressHint}
      </div>
    );
  }

  // 多语法点单元：走「综合测试」(合并抽题 + 按点算 Unit 掌握度)。
  if (unit.grammarCodes && unit.grammarCodes.length > 0) {
    const testPath = `${basePath}/unit-grammar/${grade}/${unit.id}?returnTo=${returnTo}${pubQ}`;
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm text-[#5C5751]">
          本单元语法综合测试：{unit.grammarCodes.length} 个语法点混合抽题，成绩计入你的掌握度。
        </p>
        <GrammarTipsCard volume={unit.book} unit={unit.unitKey} publisher={pub} />
        <UnitGrammarProgress codes={unit.grammarCodes} publisher={pub} />
        <Link
          to={testPath}
          className="mb-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white"
        >
          进入综合测试 →
        </Link>
        {grammarProgressHint}
      </div>
    );
  }

  // 接了考点的单元：只走真题题库的语法测试，不再铺写死的 grammarQuiz 水题。
  if (masteryPath) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <GrammarTipsCard volume={unit.book} unit={unit.unitKey} publisher={pub} />
        <p className="mb-3 text-sm text-[#5C5751]">本单元语法用真题题库测练，成绩计入你的掌握度。</p>
        <Link
          to={masteryPath}
          className="mb-3 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white"
        >
          进入语法测试 →
        </Link>
        {grammarProgressHint}
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
    .replace(/\s+/g, " ")
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
  basePath = "/junior",
  publisher,
}: {
  unit: UnitDef;
  grade: number;
  onFinish: () => void;
  onWrong: (q: QuizQuestion) => void;
  markComplete: () => void;
  basePath?: string;
  publisher?: string | null;
}) {
  // 有 DB 内容(已回填 volume/unit 的单元)→ 卡片列表(状态/词数/难度/成绩)+ 做过≥1篇标记本关通过;
  // 无 DB 内容(grade8/9/Starter)→ 回退原内联逻辑,行为不变。可复用:任何单元有对应 DB 阅读即此样式。
  const [dbRows, setDbRows] = useState<JrRow[] | null>(null);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const markedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pub = publisher !== undefined ? publisher : publisherForBasePath(basePath);
      let rq = supabase
        .from("junior_reading")
        .select("id,title,word_count,difficulty")
        .eq("grade", grade)
        .eq("volume", unit.book)
        .eq("unit", unit.unitKey);
      if (pub) rq = rq.eq("publisher", pub);
      const [res, m] = await Promise.all([
        rq.order("difficulty", { ascending: true }),
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

  // ★完成判据(Aaron 2026-07-27 收紧)★:本单元**全部篇目都做过**才算通关。
  // 旧判据是 tried >= 1 —— 做 1 篇就打 ✓,于是单元卡显示 100% 而学生只读了 1/5 篇,
  // 「完成度」失去意义。改成 tried === total(UI 上本来就在显示 {tried}/{total} 篇)。
  // 历史数据按方案 B 保留:已打过的 ✓ 不回收,新判据只对新行为生效。
  useEffect(() => {
    if (!dbRows || dbRows.length === 0) return;
    const tried = dbRows.filter((r) => !!mastery[r.id]).length;
    if (tried >= dbRows.length && !markedRef.current) {
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
    const enc = encodeURIComponent(window.location.pathname + window.location.search);
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
              to={`${basePath}/reading/${c.id}?returnTo=${enc}`}
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

        {/* 建议下一篇:仅在≥2篇时提示(单篇无"下一篇"可推,隐藏) */}
        {rec && cards.length > 1 ? (
          <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            👉 建议下一篇：{rec.display}
          </div>
        ) : !rec ? (
          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            🎉 本关全部完成，可随时复习
          </div>
        ) : null}
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
  basePath = "/junior",
  publisher,
}: {
  unit: UnitDef;
  grade: number;
  onFinish: () => void;
  markComplete: () => void;
  basePath?: string;
  publisher?: string | null;
}) {
  const [dbRows, setDbRows] = useState<JrRow[] | null>(null);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const markedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [res, m] = await Promise.all([
        (() => {
          let cq = supabase
            .from("junior_cloze")
            .select("id,title,word_count,difficulty")
            .eq("grade", grade)
            .eq("volume", unit.book)
            .eq("unit", unit.unitKey);
          const pub = publisher !== undefined ? publisher : publisherForBasePath(basePath);
          if (pub) cq = cq.eq("publisher", pub);
          return cq.order("sort_order", { ascending: true });
        })(),
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
    // ★完成判据收紧(同阅读关)★:全部篇/条做过才通关,不再是做 1 条就 ✓。
    if (tried >= dbRows.length && !markedRef.current) {
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
  const enc = encodeURIComponent(window.location.pathname + window.location.search);
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
            to={`${basePath}/cloze/${c.id}?returnTo=${enc}`}
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

      {rec && cards.length > 1 ? (
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">👉 建议下一篇：{rec.display}</div>
      ) : !rec ? (
        <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">🎉 本关全部完成，可随时复习</div>
      ) : null}
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
  basePath = "/junior",
  publisher,
}: {
  unit: UnitDef;
  grade: number;
  inlineQuestions: ListeningQuestion[];
  markComplete: () => void;
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (q: ListeningQuestion) => void;
  basePath?: string;
  publisher?: string | null;
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
        (() => {
          let lq = supabase
            .from("junior_listening_exercises")
            .select("id,title,questions")
            .eq("grade", grade)
            .eq("volume", unit.book)
            .eq("unit", unit.unitKey);
          const pub = publisher !== undefined ? publisher : publisherForBasePath(basePath);
          if (pub) lq = lq.eq("publisher", pub);
          return lq.order("difficulty", { ascending: true });
        })(),
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
    // ★完成判据收紧(同阅读关)★:全部篇/条做过才通关,不再是做 1 条就 ✓。
    if (tried >= dbRows.length && !markedRef.current) {
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
    const enc = encodeURIComponent(window.location.pathname + window.location.search);

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
              to={`${basePath}/listening/${c.id}?returnTo=${enc}`}
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

        {/* 建议下一条:仅在≥2条时提示(单条无"下一条"可推,隐藏) */}
        {rec && cards.length > 1 ? (
          <div className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">
            👉 建议下一条：{rec.display}
          </div>
        ) : !rec ? (
          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            🎉 本关全部完成，可随时复习
          </div>
        ) : null}
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

// 真写作(AI批改)白名单:内联 writing prompt 就绪的册。加册改数组即可,不动逻辑,防 `||` 越加越漏。

function WritingStage({ unit, grade, onFinish }: { unit: UnitDef; grade: number; onFinish: () => void }) {
  const w = unit.writing;
  // 白名单册走真写作;其余(8/9/pep-7A/Starter 等)走原"水关"逻辑不变。
  const realWriting = REAL_WRITING_BOOKS.has(unit.book);
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
        module: "junior_writing", // 带前缀→落老师端保留名单(裸 'writing' 被 PHASE7 排除集挡掉)
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

export default function JuniorHubStagePlay({ unitId, stageIdx, onComplete, onBack, basePath = "/junior" }: Props) {
  const { grade, state, setState, addMistake, completeStage } = useJuniorHub();
  const unit = findUnit(unitId);
  const stage = unit?.stages[stageIdx];
  const [hubSearch] = useSearchParams();
  // /gaokao→读 ?publisher=(默认 'pep');/junior→null(共用组件初中路径不过滤,字节级不变)。
  const publisher = publisherForBasePath(basePath, hubSearch);

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

  // ★已删除 ?done=1 后门(Aaron 2026-07-27)★
  // 它绕开所有关卡判据:URL 上带一个参数就把本关标记通过。删除前全仓查证:
  // **没有任何代码拼出过 done=1**(只剩两条注释提到它),即这条后门早已是死路径。
  // 从专区 play 页返回后的正路 = 各关自己的判据(阅读/完形/听力 = 全部篇目做过)。

  const listenSentQuestions = useMemo(() => {
    if (!unit) return [];
    return shuffleArray([...unit.listeningQuestions]).slice(0, 6);
  }, [unit]);

  const finalQuizQuestions = useMemo(() => {
    if (!unit) return [];
    return shuffleArray([...unit.quizQuestions]).slice(0, 10);
  }, [unit]);

  // 自适应单元综合测验:7B 全 8 单元 + 八年级(8A/8B)16 单元 + 九年级(volume '9')。
  // 语法走 DB(grammarCodes 抽 7 题·自适应),听力 8 年级无 junior_listening_items → 内联 listeningQuestions 回退(TTS),词汇 vocabulary 动态生成 2 题 = 12 题。
  // 其余年级(7A/Starter, book 不在表内)仍走内联 quizQuestions;空池/失败也回退内联。
  const adaptiveFinalUnit =
    !!unit && (["7B", "8A", "8B", "g9", "9"].includes(unit.book) || /^(required|elective)/.test(unit.book));
  // undefined = 加载中;null = 用内联回退;数组 = 自适应题目。
  const [finalAdaptive, setFinalAdaptive] = useState<FinalQuizItem[] | null | undefined>(undefined);
  useEffect(() => {
    if (!unit || stage?.type !== "finalQuiz" || !adaptiveFinalUnit) {
      setFinalAdaptive(null); // 非自适应单元/非本关 → 直接走内联回退
      return;
    }
    let cancelled = false;
    setFinalAdaptive(undefined);
    buildFinalQuiz(unit, grade, publisher)
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
  }, [unit, stage?.type, adaptiveFinalUnit, grade, publisher]);

  if (!unit || !stage) return null;

  const stageBody = (() => {
    switch (stage.type) {
      case "vocab":
        return <VocabStage unit={unit} grade={grade} publisher={publisher} onFinish={handleFinish} />;
      case "listenWord":
        // 数据源:junior_vocab 全单元词(分组12);无 DB 词回退 JSON。选对加星+写词汇掌握度(listen)。
        return (
          <ListenWordStage
            unit={unit}
            grade={grade}
            publisher={publisher}
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
        // 词源改读 junior_vocab DB(完整 unit 词,与核心词汇关同源),每组 12 词分批。
        return <MatchStage unit={unit} grade={grade} publisher={publisher} onFinish={handleFinish} onMatch={addStar} />;
      case "grammar":
        // 数据源 unit.grammarQuiz(内联水题);空时走兜底(GrammarStage 内部用它喂 FinalQuizStage,会白屏)。
        // 例外:有 grammarCodes 的单元走 JuniorUnitGrammarTest 从 DB 按 point 抽题,不依赖 grammarQuiz,放行进 GrammarStage。
        if (unit.grammarQuiz.length === 0 && !(unit.grammarCodes && unit.grammarCodes.length > 0) && !unit.grammarKpCode)
          return <EmptyStageNotice onContinue={handleFinish} />;
        return <GrammarStage unit={unit} grade={grade} basePath={basePath} publisher={publisher} onFinish={handleFinish} />;
      case "reading":
        return (
          <ReadingStage
            unit={unit}
            grade={grade}
            basePath={basePath}
            publisher={publisher}
            markComplete={() => completeStage(unitId, stageIdx)}
            onFinish={handleFinish}
            onWrong={(q) => {
              addMistake({
                q: q.q,
                opts: q.opts,
                answer: q.answer,
                point: q.point ?? "阅读",
                unitId,
                unitTitle: unit.title,
              });
              void recordHubMistake({
                grade, module: "hub_reading", unitId, unitTitle: unit.title,
                stem: q.q, opts: q.opts, answerIdx: q.answer, pickedIdx: q.picked, explanation: q.explanation,
              });
            }}
          />
        );
      case "cloze":
        // 完形关:读 junior_cloze 取本单元完形 → 卡片列表 → /junior/cloze/:id?returnTo。无数据走空兜底。
        return (
          <ClozeStage
            unit={unit}
            grade={grade}
            basePath={basePath}
            publisher={publisher}
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
            basePath={basePath}
            publisher={publisher}
            inlineQuestions={listenSentQuestions as ListeningQuestion[]}
            markComplete={() => completeStage(unitId, stageIdx)}
            onFinish={handleFinish}
            onCorrect={addStar}
            onWrong={(q) => {
              addMistake({
                q: `听力：${q.audio}`,
                opts: q.opts,
                answer: q.answer,
                point: "听力",
                audio: q.audio,
                unitId,
                unitTitle: unit.title,
              });
              void recordHubMistake({
                grade, module: "hub_listening", unitId, unitTitle: unit.title,
                stem: q.audio, opts: q.opts, answerIdx: q.answer, pickedIdx: q.picked, audio: q.audio,
              });
            }}
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
            onWrong={(q) => {
              addMistake({
                q: q.q,
                opts: q.opts,
                answer: q.answer,
                point: q.point ?? "综合",
                unitId,
                unitTitle: unit.title,
              });
              // 块②:finalQuiz 做错额外写统一错题本(按 kind 分流;vocab 跳过)。
              void recordFinalQuizMistake({
                dim: q.kind ?? q.dim,
                unitId,
                unitTitle: unit.title,
                stem: q.q,
                opts: q.opts,
                answerIdx: q.answer,
                pickedIdx: q.picked ?? null,
                audio: q.audio ?? null,
                // 不传 audioUrl：单元通关的听力题没有预生成 MP3，错题本按 audio 文本走 TTS。
                // （原来这里传的是 junior_listening_items.audio_url，而那张表根本没有这一列。）
                explanation: q.explanation ?? null,
                idSuffix: q.questionId ?? q.q,
              });
            }}
          />
        );
      }
      default:
        return null;
    }
  })();

  return (
    <StageShell stageIdx={stageIdx} stageTitle={stage.title} unit={unit} stars={stars} onBack={onBack} prominentBack={basePath.startsWith("/gaokao")}>
      {stageBody}
    </StageShell>
  );
}
