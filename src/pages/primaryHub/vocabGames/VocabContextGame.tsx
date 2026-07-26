import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { getWordsForGrade } from "@/lib/primaryHub/vocabGames/words";
import { selectWords, recordResult } from "@/lib/primaryHub/vocabGames/srs";
import {
  buildContextItems,
  wordsWithContext,
  pickDistractors,
  type ContextItem,
} from "@/lib/primaryHub/vocabGames/context";
import type { GameWord } from "@/lib/primaryHub/vocabGames/types";
import { hubSpeak, prefetchHubFixed } from "@/lib/primaryHub/speech";
import { HUB_FIXED_SPEAK_SPEED } from "@/lib/primaryHub/hubSpeakSpeed";
import { unlockAudioSync, stopSpeaking } from "@/lib/speak";
import GameResult from "./GameResult";
import { Intro } from "./VocabMatchGame";

const ROUND = 8;

type Q = { item: ContextItem; full: string; options: string[] };

// 为每个词挑一道情景题 + 3 个同年级干扰词
function buildQuestions(picks: GameWord[], pool: GameWord[]): Q[] {
  const byWord = new Map<string, ContextItem[]>();
  for (const it of buildContextItems(pool)) {
    const arr = byWord.get(it.wordId) ?? [];
    arr.push(it);
    byWord.set(it.wordId, arr);
  }
  const out: Q[] = [];
  picks.forEach((word, i) => {
    const cand = byWord.get(word.id);
    if (!cand || cand.length === 0) return;
    const item = cand[i % cand.length]; // 稳定地在该词的多道题里轮换
    const seed = word.id.split("").reduce((s, c) => s + c.charCodeAt(0), i);
    const distractors = pickDistractors(word, item.cloze, pool, seed);
    if (distractors.length < 3) return; // 凑不齐 3 个像样干扰项就跳过该题
    const options = [item.answer, ...distractors];
    options.sort(
      (a, b) => ((a.length * 31 + seed) % 7) - ((b.length * 31 + seed) % 7) || a.localeCompare(b),
    );
    const full = item.full; // 语块原文,不从挖空回填(见 ContextItem.full 注释)
    out.push({ item, full, options });
  });
  return out;
}

export default function VocabContextGame() {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const base = `/primary/hub/${grade}`;

  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const pool = useMemo(() => getWordsForGrade(grade), [grade]);
  const questions = useMemo(() => {
    const eligible = wordsWithContext(pool);
    return buildQuestions(selectWords(eligible, ROUND), pool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, grade]);

  const q = questions[idx];

  const begin = () => {
    unlockAudioSync();
    // 本关播的是整句 q.full，不是答案单词；原来预热 item.answer 等于预热了
    // 一批本关永远不播的 key（审计 C2-3）。
    prefetchHubFixed(
      questions.map((x) => x.full),
      grade,
    );
    setStarted(true);
  };

  const choose = (opt: string) => {
    if (picked) return;
    const isCorrect = opt === q.item.answer;
    setPicked(opt);
    recordResult(q.item.wordId, isCorrect);
    if (isCorrect) setCorrectCount((c) => c + 1);
    hubSpeak(q.full, HUB_FIXED_SPEAK_SPEED, grade); // 读出完整正确短语
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
        title="情景闯关"
        emoji="🗺️"
        hint={`在真实短语里选出缺的词。本轮 ${ROUND} 题，练的是"用得出来"。`}
        onStart={begin}
        onBack={() => navigate(`${base}/vocab-games`)}
      />
    );
  }

  if (!q) {
    return (
      <Intro
        title="情景闯关"
        emoji="🗺️"
        hint="这个年级还没有足够的情景题，先玩玩别的吧。"
        onStart={() => navigate(`${base}/vocab-games`)}
        onBack={() => navigate(`${base}/vocab-games`)}
      />
    );
  }

  // 把 ____ 渲染成高亮空格
  const [before, after] = q.item.cloze.split("____");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7EE] to-[#F4EFE6] px-4 pb-24 pt-4">
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
            className="h-full rounded-full bg-gradient-to-r from-[#9B6BFF] to-[#6A8BFF] transition-all"
            style={{ width: `${((idx + (picked ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <div className="text-sm font-bold text-[#999]">
          {idx + 1}/{questions.length}
        </div>
      </div>

      {/* 题干：带空格的短语 + 中文提示 */}
      <div className="mx-auto mt-10 max-w-md rounded-3xl bg-white p-6 text-center shadow-sm">
        <div className="text-2xl font-extrabold leading-relaxed text-[#2b2b2b]">
          {before}
          <span
            className={`mx-1 inline-block min-w-[3.5rem] rounded-lg px-2 pb-0.5 ${
              picked
                ? "bg-[#EAF8E9] text-[#2b7a2b]"
                : "border-b-4 border-dashed border-[#C9B8FF] text-[#C9B8FF]"
            }`}
          >
            {picked ? q.item.answer : "?"}
          </span>
          {after}
        </div>
        <div className="mt-3 text-sm text-[#999]">{q.item.cn}</div>
      </div>

      {/* 选项 */}
      <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const isTarget = opt === q.item.answer;
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
              className={`rounded-2xl px-3 py-4 text-base font-bold shadow-sm transition active:scale-[0.98] ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mx-auto mt-6 max-w-md text-center">
          <button
            type="button"
            onClick={() => hubSpeak(q.full, HUB_FIXED_SPEAK_SPEED, grade)}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-[#7C5CFF] shadow-sm"
          >
            🔊 {q.full}
          </button>
          <button
            type="button"
            onClick={next}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#6A8BFF] py-3 text-lg font-bold text-white shadow"
          >
            {idx + 1 >= questions.length ? "看结果 🎉" : "下一题 →"}
          </button>
        </div>
      )}

      {done && (
        <GameResult
          title={correctCount === questions.length ? "全对！情景大师" : "本轮完成"}
          emoji={correctCount === questions.length ? "🏆" : "🎉"}
          stars={
            correctCount >= questions.length ? 3 : correctCount >= questions.length * 0.6 ? 2 : 1
          }
          lines={[`答对 ${correctCount}/${questions.length} 题`, "在搭配里记住的词，用起来更顺 ✅"]}
          onAgain={again}
          onHome={() => navigate(`${base}/vocab-games`)}
        />
      )}
    </div>
  );
}
