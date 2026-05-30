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

const ROUND = 12;
const LIVES = 3;

/** 4 个中文选项:正确 + 3 个同册干扰。 */
function buildOptions(target: GameWord, pool: GameWord[]): string[] {
  const distract = pool
    .filter((w) => w.id !== target.id && w.volume === target.volume && w.cn !== target.cn)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((w) => w.cn);
  return [target.cn, ...distract].sort(() => Math.random() - 0.5);
}

export default function VocabRainGame() {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const base = `/primary/hub/${grade}`;
  const pool = useMemo(() => getArcadePool(), []);

  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const words = useMemo(() => selectWords(pool, ROUND), [round, pool]);

  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [hits, setHits] = useState(0);
  const [combo, setCombo] = useState(0);
  const [drop, setDrop] = useState(0); // 0..88 (%)
  const [answered, setAnswered] = useState(false);
  const [flash, setFlash] = useState<"hit" | "miss" | null>(null);
  const [done, setDone] = useState(false);
  const landTimer = useRef<number | null>(null);

  const cur = words[idx];
  const options = useMemo(() => (cur ? buildOptions(cur, pool) : []), [cur, pool]);
  const fallMs = Math.max(3200, 6000 - idx * 240);

  const clearLand = () => {
    if (landTimer.current !== null) {
      window.clearTimeout(landTimer.current);
      landTimer.current = null;
    }
  };

  const advance = useCallback(
    (nextLives: number) => {
      clearLand();
      if (nextLives <= 0 || idx >= words.length - 1) {
        stopSpeaking();
        setDone(true);
        return;
      }
      setIdx((i) => i + 1);
    },
    [idx, words.length],
  );

  // 每个单词:出现即播音、从顶部下落,fallMs 后没答到算落地(miss)
  useEffect(() => {
    if (!started || done || !cur) return;
    setAnswered(false);
    setDrop(0);
    const raf = requestAnimationFrame(() => setDrop(88));
    hubSpeak(cur.en, 0.85, 4);
    landTimer.current = window.setTimeout(() => {
      // 落地未答中 → miss
      setAnswered(true);
      recordResult(cur.id, false);
      setCombo(0);
      setFlash("miss");
      setLives((lv) => {
        const next = lv - 1;
        window.setTimeout(() => {
          setFlash(null);
          advance(next);
        }, 650);
        return next;
      });
    }, fallMs);
    return () => {
      cancelAnimationFrame(raf);
      clearLand();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, started, round]);

  // 卸载时停音
  useEffect(() => () => stopSpeaking(), []);

  const pick = (cn: string) => {
    if (answered || !cur || done) return;
    setAnswered(true);
    clearLand();
    const correct = cn === cur.cn;
    recordResult(cur.id, correct);
    if (correct) {
      setHits((h) => h + 1);
      setCombo((c) => c + 1);
      setFlash("hit");
      window.setTimeout(() => {
        setFlash(null);
        advance(lives);
      }, 500);
    } else {
      setCombo(0);
      setFlash("miss");
      setLives((lv) => {
        const next = lv - 1;
        window.setTimeout(() => {
          setFlash(null);
          advance(next);
        }, 650);
        return next;
      });
    }
  };

  const begin = () => {
    unlockAudioSync();
    prefetchHubVocabulary(words.map((w) => w.en), 4);
    setStarted(true);
  };
  const again = () => {
    setDone(false);
    setStarted(false);
    setIdx(0);
    setLives(LIVES);
    setHits(0);
    setCombo(0);
    setRound((r) => r + 1);
  };

  if (!started) {
    return (
      <Intro
        title="单词雨"
        emoji="🌧️"
        hint="英文单词从天上掉下来,听发音,在落地前点对应的中文。3 条命!"
        onStart={begin}
        onBack={() => navigate(`${base}/vocab-games`)}
      />
    );
  }

  const stars = hits >= 11 ? 3 : hits >= 8 ? 2 : hits >= 5 ? 1 : 0;

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#2b3a67] to-[#5BA8FF] px-4 pb-4 pt-3 text-white">
      {/* HUD */}
      <div className="flex items-center text-sm font-bold">
        <button type="button" onClick={() => navigate(`${base}/vocab-games`)} aria-label="返回">
          ✕
        </button>
        <div className="ml-3">{"❤️".repeat(Math.max(0, lives))}</div>
        <div className="ml-auto">命中 {hits}</div>
        {combo >= 2 && <div className="ml-3 text-[#FFE08A]">🔥 连击 {combo}</div>}
      </div>

      {/* 下落区 */}
      <div className="relative mt-2 flex-1 overflow-hidden rounded-2xl bg-white/10">
        {cur && (
          <div
            key={`${round}-${idx}`}
            className="absolute left-1/2 -translate-x-1/2 rounded-xl bg-white px-4 py-2 text-2xl font-extrabold text-[#2b3a67] shadow-lg"
            style={{ top: `${drop}%`, transition: `top ${fallMs}ms linear` }}
          >
            {cur.en}
          </div>
        )}
        {flash && (
          <div className="absolute inset-0 grid place-items-center text-6xl">
            {flash === "hit" ? "⭐" : "💧"}
          </div>
        )}
      </div>

      {/* 中文选项 */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((cn, i) => (
          <button
            key={i}
            type="button"
            disabled={answered}
            onClick={() => pick(cn)}
            className="rounded-xl bg-white/95 py-3 text-base font-bold text-[#2b3a67] shadow active:scale-95 disabled:opacity-60"
          >
            {cn}
          </button>
        ))}
      </div>

      {done && (
        <GameResult
          title={lives > 0 ? "过关啦！" : "再接再厉！"}
          emoji={lives > 0 ? "🏆" : "💪"}
          stars={stars}
          lines={[`命中 ${hits} / ${words.length} 个单词`]}
          onAgain={again}
          onHome={() => navigate(`${base}/vocab-games`)}
        />
      )}
    </div>
  );
}
