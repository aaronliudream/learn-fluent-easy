import { useEffect, useMemo, useState } from "react";
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
const BUBBLES = 6;
const COLORS = ["#7C5CFF", "#FF6B35", "#378ADD", "#3FB23C", "#B45EFF", "#FF8A5B"];

type Bubble = {
  key: string;
  en: string;
  isTarget: boolean;
  left: number; // %
  top: number; // %
  color: string;
  dur: number; // s
  delay: number; // s
};

function buildBubbles(target: GameWord, pool: GameWord[]): Bubble[] {
  const distract = pool
    .filter((w) => w.id !== target.id && w.volume === target.volume && w.en !== target.en)
    .sort(() => Math.random() - 0.5)
    .slice(0, BUBBLES - 1)
    .map((w) => w.en);
  const ens = [target.en, ...distract].sort(() => Math.random() - 0.5);
  return ens.map((en, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return {
      key: `${en}-${i}`,
      en,
      isTarget: en === target.en,
      left: 8 + col * 30 + (Math.random() * 10 - 5),
      top: 8 + row * 40 + (Math.random() * 10 - 5),
      color: COLORS[(i + Math.floor(Math.random() * COLORS.length)) % COLORS.length],
      dur: 3 + Math.random() * 2,
      delay: Math.random() * 1.5,
    };
  });
}

export default function VocabBubbleGame() {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const base = `/primary/hub/${grade}`;
  const pool = useMemo(() => getArcadePool(), []);

  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const words = useMemo(() => selectWords(pool, ROUND), [round, pool]);

  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [combo, setCombo] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [missed, setMissed] = useState(false); // 本题是否已记过一次错(避免狂点刷错)
  const [poppedKey, setPoppedKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [hintOn, setHintOn] = useState(false);
  const [done, setDone] = useState(false);

  const cur = words[idx];
  const bubbles = useMemo(() => (cur ? buildBubbles(cur, pool) : []), [cur, pool, round]);

  // 每题:播目标英文发音
  useEffect(() => {
    if (!started || done || !cur) return;
    setAnswered(false);
    setMissed(false);
    setPoppedKey(null);
    setWrongKey(null);
    setHintOn(false);
    hubSpeak(cur.en, 0.85, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, started, round]);

  useEffect(() => () => stopSpeaking(), []);

  const advance = () => {
    stopSpeaking();
    if (idx >= words.length - 1) setDone(true);
    else setIdx((i) => i + 1);
  };

  const pop = (b: Bubble) => {
    if (answered || !cur || done) return;
    if (b.isTarget) {
      setAnswered(true);
      recordResult(cur.id, true);
      setHits((h) => h + 1);
      setCombo((c) => c + 1);
      setPoppedKey(b.key);
      window.setTimeout(advance, 450);
    } else {
      // 戳错:抖一下、不破、不前进;每题只记一次错,避免狂点刷低 box
      if (!missed) {
        recordResult(cur.id, false);
        setMissed(true);
        setCombo(0);
        setHintOn(true); // 给一次提示:高亮目标泡泡
      }
      setWrongKey(b.key);
      window.setTimeout(() => setWrongKey((k) => (k === b.key ? null : k)), 450);
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
    setHits(0);
    setCombo(0);
    setRound((r) => r + 1);
  };

  if (!started) {
    return (
      <Intro
        title="听音泡泡"
        emoji="🫧"
        hint="听英文发音,戳破写着那个单词的泡泡。听不清可以点🔊再听!"
        onStart={begin}
        onBack={() => navigate(`${base}/vocab-games`)}
      />
    );
  }

  const stars = hits >= 9 ? 3 : hits >= 7 ? 2 : hits >= 4 ? 1 : 0;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#1b2a52] to-[#3a5ba0] px-4 pb-4 pt-3 text-white">
      {/* HUD */}
      <div className="z-10 flex items-center text-sm font-bold">
        <button type="button" onClick={() => navigate(`${base}/vocab-games`)} aria-label="返回">
          ✕
        </button>
        <div className="ml-auto">
          {idx + 1}/{words.length} · 命中 {hits}
        </div>
        {combo >= 2 && <div className="ml-3 text-[#FFE08A]">🔥 {combo}</div>}
      </div>

      {/* 听 + 再听 */}
      <div className="z-10 mt-2 text-center">
        <div className="text-xs opacity-80">听发音,戳出这个单词</div>
        <button
          type="button"
          onClick={() => cur && hubSpeak(cur.en, 0.85, 4)}
          className="mt-1 rounded-full bg-white/20 px-5 py-2 text-base font-bold"
        >
          🔊 再听一次
        </button>
      </div>

      {/* 泡泡场 */}
      <div className="relative mt-2 flex-1">
        {bubbles.map((b) => {
          const popped = poppedKey === b.key;
          const shaking = wrongKey === b.key;
          const highlight = hintOn && b.isTarget;
          return (
            <button
              key={b.key}
              type="button"
              disabled={answered}
              onClick={() => pop(b)}
              className={`vg-bubble-float absolute grid place-items-center rounded-full text-sm font-extrabold text-white shadow-lg ${
                popped ? "vg-bubble-pop" : ""
              } ${shaking ? "fc-shake" : ""}`}
              style={{
                left: `${b.left}%`,
                top: `${b.top}%`,
                width: 92,
                height: 92,
                background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), ${b.color})`,
                animationDuration: `${b.dur}s`,
                animationDelay: `${b.delay}s`,
                boxShadow: highlight ? "0 0 0 4px #FFE08A, 0 6px 16px rgba(0,0,0,0.3)" : undefined,
              }}
            >
              {b.en}
            </button>
          );
        })}
      </div>

      {done && (
        <GameResult
          title="泡泡全破！"
          emoji="🫧"
          stars={stars}
          lines={[`命中 ${hits} / ${words.length}`]}
          onAgain={again}
          onHome={() => navigate(`${base}/vocab-games`)}
        />
      )}
    </div>
  );
}
