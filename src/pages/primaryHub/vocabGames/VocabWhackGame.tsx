import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { getArcadePool } from "@/lib/primaryHub/vocabGames/words";
import { selectWords, recordResult } from "@/lib/primaryHub/vocabGames/srs";
import type { GameWord } from "@/lib/primaryHub/vocabGames/types";
import { hubSpeak, prefetchHubVocabulary } from "@/lib/primaryHub/speech";
import { unlockAudioSync, stopSpeaking } from "@/lib/speak";
import GameResult from "./GameResult";
import { Intro } from "./VocabMatchGame";

const ROUND = 10;
const HOLES = 6;
const PER_Q_MS = 8000; // 每题限时（毫秒）。想更宽松/更紧张就改这个数。

/** 6 个地洞的英文:1 个目标 + 5 个干扰,打乱。 */
function buildHoles(target: GameWord, pool: GameWord[]): string[] {
  const distract = pool
    .filter((w) => w.id !== target.id && w.en !== target.en)
    .sort(() => Math.random() - 0.5)
    .slice(0, HOLES - 1)
    .map((w) => w.en);
  return [target.en, ...distract].sort(() => Math.random() - 0.5);
}

export default function VocabWhackGame() {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const base = `/primary/hub/${grade}`;
  const pool = useMemo(() => getArcadePool(grade), [grade]);

  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const prompts = useMemo(() => selectWords(pool, ROUND), [round, pool]);

  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [flash, setFlash] = useState<"hit" | "miss" | "timeout" | null>(null);
  const [flashAt, setFlashAt] = useState<number | null>(null);
  const [remainMs, setRemainMs] = useState(PER_Q_MS);
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);
  const tick = useRef<number | null>(null);

  const cur = prompts[idx];
  const holes = useMemo(() => (cur ? buildHoles(cur, pool) : []), [cur, pool]);

  const clearT = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  const clearTick = () => {
    if (tick.current !== null) {
      window.clearInterval(tick.current);
      tick.current = null;
    }
  };

  const advance = useCallback(() => {
    clearT();
    clearTick();
    if (idx >= prompts.length - 1) {
      stopSpeaking();
      setDone(true);
    } else {
      setIdx((i) => i + 1);
    }
  }, [idx, prompts.length]);

  // 每题:播报目标英文 + 限时 + 倒计时条
  useEffect(() => {
    if (!started || done || !cur) return;
    setAnswered(false);
    setRemainMs(PER_Q_MS);
    hubSpeak(cur.en, 0.85, grade);
    clearTick();
    tick.current = window.setInterval(() => {
      setRemainMs((m) => Math.max(0, m - 100));
    }, 100);
    timer.current = window.setTimeout(() => {
      clearTick();
      setAnswered(true);
      setRemainMs(0);
      // 超时不计错:只揭示正确答案(⏰),不 recordResult、不扣掌握度
      setFlashAt(holes.indexOf(cur.en));
      setFlash("timeout");
      window.setTimeout(() => {
        setFlash(null);
        setFlashAt(null);
        advance();
      }, 800);
    }, PER_Q_MS);
    return () => {
      clearT();
      clearTick();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, started, round]);

  useEffect(
    () => () => {
      stopSpeaking();
      clearTick();
    },
    [],
  );

  const whack = (en: string, i: number) => {
    if (answered || !cur || done) return;
    setAnswered(true);
    clearT();
    clearTick();
    const correct = en === cur.en;
    recordResult(cur.id, correct);
    if (correct) setHits((h) => h + 1);
    setFlashAt(i);
    setFlash(correct ? "hit" : "miss");
    window.setTimeout(
      () => {
        setFlash(null);
        setFlashAt(null);
        advance();
      },
      correct ? 450 : 650,
    );
  };

  const begin = () => {
    unlockAudioSync();
    prefetchHubVocabulary(
      prompts.map((w) => w.en),
      grade,
    );
    setStarted(true);
  };
  const again = () => {
    setDone(false);
    setStarted(false);
    setIdx(0);
    setHits(0);
    setRound((r) => r + 1);
  };

  if (!started) {
    return (
      <Intro
        title="打地鼠"
        emoji="🔨"
        hint="看屏幕上方的中文,听发音,敲中顶着对应英文单词的地鼠。注意上方倒计时条!"
        onStart={begin}
        onBack={() => navigate(`${base}/vocab-games`)}
      />
    );
  }

  const stars = hits >= 9 ? 3 : hits >= 7 ? 2 : hits >= 4 ? 1 : 0;

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#6b4a2b] to-[#a3713f] px-4 pb-6 pt-3 text-white">
      <div className="flex items-center text-sm font-bold">
        <button type="button" onClick={() => navigate(`${base}/vocab-games`)} aria-label="返回">
          ✕
        </button>
        <div className="ml-auto">
          {idx + 1}/{prompts.length} · 命中 {hits}
        </div>
      </div>

      {/* 目标中文 + 重听 */}
      <div className="mt-3 rounded-2xl bg-white/15 p-4 text-center">
        <div className="text-xs opacity-80">敲出下面这个词</div>
        <div className="mt-1 flex items-center justify-center gap-2 text-3xl font-extrabold">
          {cur?.emoji && <span>{cur.emoji}</span>}
          {cur?.cn}
          <button
            type="button"
            onClick={() => cur && hubSpeak(cur.en, 0.85, grade)}
            className="rounded-full bg-white/25 px-2 py-1 text-base"
            aria-label="再听"
          >
            🔊
          </button>
        </div>
      </div>

      {/* 倒计时条 */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white/85 transition-[width] duration-100 ease-linear"
          style={{ width: `${(remainMs / PER_Q_MS) * 100}%` }}
        />
      </div>

      {/* 地洞 */}
      <div className="mt-5 grid flex-1 grid-cols-3 content-center gap-3">
        {holes.map((en, i) => (
          <button
            key={`${round}-${idx}-${i}`}
            type="button"
            disabled={answered}
            onClick={() => whack(en, i)}
            className="fc-fade-in-up relative grid aspect-square place-items-center rounded-2xl bg-[#3a2415] p-2 shadow-inner active:scale-90 disabled:opacity-70"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="rounded-lg bg-[#caa472] px-2 py-1 text-center text-sm font-bold leading-tight text-[#3a2415]">
              {en}
            </span>
            {flash && flashAt === i && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center text-5xl">
                {flash === "hit" ? "💥" : flash === "timeout" ? "⏰" : "😵"}
              </span>
            )}
          </button>
        ))}
      </div>

      {done && (
        <GameResult
          title="地鼠打完啦！"
          emoji="🏆"
          stars={stars}
          lines={[`命中 ${hits} / ${prompts.length}`]}
          onAgain={again}
          onHome={() => navigate(`${base}/vocab-games`)}
        />
      )}
    </div>
  );
}
