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

/* ---------- Web Audio 合成音(零素材、零网络、不和 TTS 抢通道) ---------- */
let _ac: AudioContext | null = null;
function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!_ac) _ac = new Ctx();
    if (_ac.state === "suspended") void _ac.resume();
    return _ac;
  } catch {
    return null;
  }
}
function blip(f0: number, f1: number, dur: number, type: OscillatorType, gain: number) {
  const ctx = audioCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}
const popSound = () => blip(700, 180, 0.12, "triangle", 0.18); // 短促"啵"
const comboSound = () => blip(520, 1100, 0.22, "sine", 0.2); // 更亮的上升音

type Bubble = {
  key: string;
  en: string;
  isTarget: boolean;
  left: number;
  top: number;
  color: string;
  dur: number;
  delay: number;
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
      dur: 3.5 + Math.random() * 2.5,
      delay: Math.random() * 1.5,
    };
  });
}

const comboMult = (combo: number) => (combo >= 5 ? 2 : combo >= 3 ? 1.5 : 1);

export default function VocabBubbleGame() {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const base = `/primary/hub/${grade}`;
  const pool = useMemo(() => getArcadePool(grade), [grade]);

  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const words = useMemo(() => selectWords(pool, ROUND), [round, pool]);

  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [missed, setMissed] = useState(false);
  const [poppedKey, setPoppedKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [hintOn, setHintOn] = useState(false);
  const [burst, setBurst] = useState<{ left: number; top: number; key: string } | null>(null);
  const [milestone, setMilestone] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const cur = words[idx];
  const bubbles = useMemo(() => (cur ? buildBubbles(cur, pool) : []), [cur, pool, round]);

  useEffect(() => {
    if (!started || done || !cur) return;
    setAnswered(false);
    setMissed(false);
    setPoppedKey(null);
    setWrongKey(null);
    setHintOn(false);
    setBurst(null);
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
      popSound();
      setHits((h) => h + 1);
      setBurst({ left: b.left, top: b.top, key: b.key });
      setPoppedKey(b.key);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore((s) => s + Math.round(10 * comboMult(newCombo)));
      if (newCombo === 3 || newCombo === 5 || newCombo === 10) {
        comboSound();
        setMilestone(newCombo >= 10 ? "🌈 Perfect!" : newCombo >= 5 ? "⚡ Combo x5" : "🔥 Combo x3");
        window.setTimeout(() => setMilestone(null), 900);
      }
      window.setTimeout(() => {
        setBurst(null);
        advance();
      }, 480);
    } else {
      if (!missed) {
        recordResult(cur.id, false);
        setMissed(true);
        setCombo(0);
        setHintOn(true);
      }
      setWrongKey(b.key);
      window.setTimeout(() => setWrongKey((k) => (k === b.key ? null : k)), 450);
    }
  };

  const begin = () => {
    unlockAudioSync(); // iOS:TTS 通道解锁(同步)
    audioCtx(); // 同一手势里创建/恢复 Web Audio 上下文
    prefetchHubVocabulary(words.map((w) => w.en), 4);
    setStarted(true);
  };
  const again = () => {
    setDone(false);
    setStarted(false);
    setIdx(0);
    setHits(0);
    setScore(0);
    setCombo(0);
    setRound((r) => r + 1);
  };

  if (!started) {
    return (
      <Intro
        title="听音泡泡"
        emoji="🫧"
        hint="听英文发音,戳破写着那个单词的泡泡。听不清可以点🔊再听!连对有连击加分哦!"
        onStart={begin}
        onBack={() => navigate(`${base}/vocab-games`)}
      />
    );
  }

  const stars = hits >= 9 ? 3 : hits >= 7 ? 2 : hits >= 4 ? 1 : 0;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#1b2a52] to-[#3a5ba0] px-4 pb-4 pt-3 text-white">
      <div className="z-10 flex items-center text-sm font-bold">
        <button type="button" onClick={() => navigate(`${base}/vocab-games`)} aria-label="返回">
          ✕
        </button>
        <div className="ml-3">分 {score}</div>
        <div className="ml-auto">
          {idx + 1}/{words.length} · 命中 {hits}
        </div>
        {combo >= 2 && <div className="ml-3 text-[#FFE08A]">🔥 {combo}</div>}
      </div>

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
                outline: highlight ? "4px solid #FFE08A" : "none",
              }}
            >
              {b.en}
            </button>
          );
        })}

        {/* 戳破星星迸发 + POP! */}
        {burst && (
          <div
            className="pointer-events-none absolute"
            style={{ left: `${burst.left}%`, top: `${burst.top}%`, width: 92, height: 92 }}
          >
            <div className="absolute inset-0 grid place-items-center text-lg font-black text-[#FFE08A]">POP!</div>
            {[0, 1, 2, 3, 4].map((i) => {
              const ang = (i / 5) * Math.PI * 2;
              return (
                <span
                  key={i}
                  className="vg-star-fly absolute left-1/2 top-1/2 text-xl"
                  style={
                    {
                      "--dx": `${Math.cos(ang) * 60}px`,
                      "--dy": `${Math.sin(ang) * 60}px`,
                    } as React.CSSProperties
                  }
                >
                  ✨
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 连击里程碑 */}
      {milestone && (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 z-20 text-center text-3xl font-black text-[#FFE08A] drop-shadow">
          {milestone}
        </div>
      )}

      {done && (
        <GameResult
          title="泡泡全破！"
          emoji="🫧"
          stars={stars}
          lines={[`命中 ${hits} / ${words.length}`, `得分 ${score}`]}
          onAgain={again}
          onHome={() => navigate(`${base}/vocab-games`)}
        />
      )}
    </div>
  );
}
