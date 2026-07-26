import { useMemo, useState } from "react";
import { useRevealScroll } from "@/lib/useRevealScroll";
import { useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { getWordsForGrade } from "@/lib/primaryHub/vocabGames/words";
import { selectWords, recordResult } from "@/lib/primaryHub/vocabGames/srs";
import type { GameWord } from "@/lib/primaryHub/vocabGames/types";
import { hubSpeak, prefetchHubVocabulary } from "@/lib/primaryHub/speech";
import { HUB_FIXED_SPEAK_SPEED } from "@/lib/primaryHub/hubSpeakSpeed";
import { unlockAudioSync, stopSpeaking } from "@/lib/speak";
import GameResult from "./GameResult";
import { Intro } from "./VocabMatchGame";

const ROUND = 8; // 每轮 8 题

type Q = { word: GameWord; options: string[] };

// 给目标词配 3 个同年级干扰项（英文不同、中文尽量不同）
function buildQuestions(picks: GameWord[], pool: GameWord[]): Q[] {
  return picks.map((word, i) => {
    const distractors: GameWord[] = [];
    // 用打乱后的池子挑不同义的词；随机种子跟着 index 变，避免每题一样
    const shuffled = [...pool].sort((a, b) => {
      const ka = (a.id.charCodeAt(0) + i * 7) % 97;
      const kb = (b.id.charCodeAt(0) + i * 13) % 97;
      return ka - kb || a.id.localeCompare(b.id);
    });
    for (const w of shuffled) {
      if (distractors.length >= 3) break;
      if (w.id === word.id) continue;
      if (w.cn === word.cn || w.en === word.en) continue;
      if (distractors.some((d) => d.en === w.en || d.cn === w.cn)) continue;
      distractors.push(w);
    }
    const options = [word.en, ...distractors.map((d) => d.en)];
    // 用词条 id 的字符和做稳定打乱，保证正确项位置不总在第一个
    const seed = word.id.split("").reduce((s, c) => s + c.charCodeAt(0), i);
    options.sort((a, b) => ((a.length * 31 + seed) % 7) - ((b.length * 31 + seed) % 7) || a.localeCompare(b));
    return { word, options };
  });
}

export default function VocabQuizGame() {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const base = `/primary/hub/${grade}`;

  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  // 选完答案后把操作区滚进视口(手机上它常在选项下方屏外)
  const actionRef = useRevealScroll<HTMLDivElement>(!!picked);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const pool = useMemo(() => getWordsForGrade(grade), [grade]);
  const questions = useMemo(
    () => buildQuestions(selectWords(pool, ROUND), pool),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round, grade],
  );

  const q = questions[idx];

  const begin = () => {
    unlockAudioSync();
    // 揭晓后语块按钮也会朗读（:196），必须一起预热，否则点语块是冷合成（审计 C2-3）。
    prefetchHubVocabulary(
      [
        ...questions.map((x) => x.word.en),
        ...questions.flatMap((x) => (x.word.chunks ?? []).map((c) => c.en)),
      ],
      grade,
    );
    setStarted(true);
  };

  const choose = (opt: string) => {
    if (picked) return; // 已作答本题
    const isCorrect = opt === q.word.en;
    setPicked(opt);
    recordResult(q.word.id, isCorrect);
    if (isCorrect) setCorrectCount((c) => c + 1);
    hubSpeak(q.word.en, HUB_FIXED_SPEAK_SPEED, grade); // 揭晓即读出正确单词
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      stopSpeaking();
      setDone(true);
      return;
    }
    setPicked(null);
    setIdx((i) => i + 1);
  };

  const again = () => {
    setDone(false);
    setStarted(false);
    setIdx(0);
    setPicked(null);
    setCorrectCount(0);
    setRound((r) => r + 1);
  };

  if (!started) {
    return (
      <Intro
        title="智能选义"
        emoji="🧠"
        hint={`看中文，选出对应的英文单词。本轮 ${ROUND} 题，答完能看到地道搭配。`}
        onStart={begin}
        onBack={() => navigate(`${base}/vocab-games`)}
      />
    );
  }

  if (!q) {
    // 词太少凑不齐题（不应发生），兜底返回
    return (
      <Intro
        title="智能选义"
        emoji="🧠"
        hint="这个年级的词汇还不够，先玩玩别的吧。"
        onStart={() => navigate(`${base}/vocab-games`)}
        onBack={() => navigate(`${base}/vocab-games`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7EE] to-[#F4EFE6] px-4 pb-24 pt-4">
      {/* 顶部：返回 + 进度 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`${base}/vocab-games`)}
          className="text-xl"
          aria-label="返回"
        >
          ←
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF8A00] to-[#FFB627] transition-all"
            style={{ width: `${((idx + (picked ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <div className="text-sm font-bold text-[#999]">
          {idx + 1}/{questions.length}
        </div>
      </div>

      {/* 题干：中文释义 */}
      <div className="mt-8 text-center">
        {q.word.emoji && <div className="text-6xl">{q.word.emoji}</div>}
        <div className="mt-3 text-3xl font-extrabold text-[#2b2b2b]">{q.word.cn}</div>
        <div className="mt-1 text-sm text-[#999]">选出对应的英文</div>
      </div>

      {/* 选项 */}
      <div className="mx-auto mt-6 grid max-w-md grid-cols-1 gap-3">
        {q.options.map((opt) => {
          const isTarget = opt === q.word.en;
          const isPicked = picked === opt;
          let cls = "border-2 border-[#EFE7DA] bg-white text-[#2b2b2b]";
          if (picked) {
            if (isTarget) cls = "border-2 border-[#3FB23C] bg-[#EAF8E9] text-[#2b7a2b]";
            else if (isPicked) cls = "border-2 border-[#FF6B6B] bg-[#FDECEC] text-[#c0392b]";
            else cls = "border-2 border-[#EFE7DA] bg-white text-[#bbb]";
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={!!picked}
              onClick={() => choose(opt)}
              className={`rounded-2xl px-5 py-4 text-lg font-bold shadow-sm transition active:scale-[0.98] ${cls}`}
            >
              {opt}
              {picked && isTarget && <span className="ml-2">✅</span>}
              {picked && isPicked && !isTarget && <span className="ml-2">❌</span>}
            </button>
          );
        })}
      </div>

      {/* 揭晓后：地道搭配 chunks + 下一题 */}
      {picked && (
        <div ref={actionRef} className="mx-auto mt-6 max-w-md">
          <button
            type="button"
            onClick={() => hubSpeak(q.word.en, HUB_FIXED_SPEAK_SPEED, grade)}
            className="mx-auto mb-3 block rounded-full bg-white px-4 py-1.5 text-sm font-bold text-[#FF6B35] shadow-sm"
          >
            🔊 {q.word.en} {q.word.phonetic ?? ""}
          </button>
          {q.word.chunks && q.word.chunks.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-2 text-xs font-bold text-[#999]">💡 地道搭配</div>
              <div className="space-y-2">
                {q.word.chunks.map((c) => (
                  <button
                    key={c.en}
                    type="button"
                    onClick={() => hubSpeak(c.en, HUB_FIXED_SPEAK_SPEED, grade)}
                    className="flex w-full items-center justify-between rounded-xl bg-[#FFF7EE] px-3 py-2 text-left active:scale-[0.98]"
                  >
                    <span className="font-bold text-[#2b2b2b]">{c.en}</span>
                    <span className="text-sm text-[#888]">{c.cn}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={next}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627] py-3 text-lg font-bold text-white shadow"
          >
            {idx + 1 >= questions.length ? "看结果 🎉" : "下一题 →"}
          </button>
        </div>
      )}

      {done && (
        <GameResult
          title={correctCount === questions.length ? "全对！太棒了" : "本轮完成"}
          emoji={correctCount === questions.length ? "🏆" : "🎉"}
          stars={correctCount >= questions.length ? 3 : correctCount >= questions.length * 0.6 ? 2 : 1}
          lines={[`答对 ${correctCount}/${questions.length} 题`, "错的词会更快再出现，学过的记一次复习 ✅"]}
          onAgain={again}
          onHome={() => navigate(`${base}/vocab-games`)}
        />
      )}
    </div>
  );
}
