import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrimaryHub } from "@/lib/primaryHub/context";
import { getArcadePool } from "@/lib/primaryHub/vocabGames/words";
import { selectWords, recordResult } from "@/lib/primaryHub/vocabGames/srs";
import { hubSpeak, prefetchHubVocabulary } from "@/lib/primaryHub/speech";
import { unlockAudioSync, stopSpeaking } from "@/lib/speak";
import GameResult from "./GameResult";
import { Intro } from "./VocabMatchGame";

const ROUND = 8;

type Tile = { id: number; ch: string; used: boolean };

function shuffleTiles(word: string): Tile[] {
  const tiles = word.split("").map((ch, id) => ({ id, ch, used: false }));
  // 打乱;若洗出原顺序就再洗一次(尽量)
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

export default function VocabSpellGame() {
  const { grade } = usePrimaryHub();
  const navigate = useNavigate();
  const base = `/primary/hub/${grade}`;
  const pool = useMemo(() => getArcadePool(), []);

  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const words = useMemo(() => selectWords(pool, ROUND), [round, pool]);

  const [idx, setIdx] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [build, setBuild] = useState<number[]>([]); // 已选 tile id 顺序
  const [hintUsed, setHintUsed] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [done, setDone] = useState(false);

  const cur = words[idx];

  // 每题重置拼字状态
  useEffect(() => {
    if (!started || !cur) return;
    setTiles(shuffleTiles(cur.en));
    setBuild([]);
    setHintUsed(false);
    setWrong(false);
    hubSpeak(cur.en, 0.85, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, started, round]);

  useEffect(() => () => stopSpeaking(), []);

  const next = (recorded: boolean | null) => {
    if (cur && recorded !== null) recordResult(cur.id, recorded);
    if (idx >= words.length - 1) {
      stopSpeaking();
      setDone(true);
    } else {
      setIdx((i) => i + 1);
    }
  };

  const tapTile = (t: Tile) => {
    if (t.used || !cur) return;
    const nextBuild = [...build, t.id];
    setTiles((ts) => ts.map((x) => (x.id === t.id ? { ...x, used: true } : x)));
    setBuild(nextBuild);
    setWrong(false);
    // 拼满即判定
    if (nextBuild.length === cur.en.length) {
      const word = nextBuild.map((id) => tiles.find((x) => x.id === id)?.ch ?? "").join("");
      if (word === cur.en) {
        // 拼对:用了提示则不计入掌握(中性),否则记一次答对
        setSolvedCount((c) => c + 1);
        window.setTimeout(() => next(hintUsed ? null : true), 450);
      } else {
        setWrong(true);
        // 退回重拼(保留瓦片,清空已选)
        window.setTimeout(() => {
          setTiles((ts) => ts.map((x) => ({ ...x, used: false })));
          setBuild([]);
          setWrong(false);
        }, 700);
      }
    }
  };

  const backspace = () => {
    if (build.length === 0) return;
    const lastId = build[build.length - 1];
    setBuild((b) => b.slice(0, -1));
    setTiles((ts) => ts.map((x) => (x.id === lastId ? { ...x, used: false } : x)));
  };

  const hint = () => {
    if (!cur || build.length > 0) return; // 仅在还没开始拼时给首字母
    setHintUsed(true);
    const firstCh = cur.en[0];
    const t = tiles.find((x) => !x.used && x.ch === firstCh);
    if (t) tapTile(t);
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
    setSolvedCount(0);
    setRound((r) => r + 1);
  };

  if (!started) {
    return (
      <Intro
        title="拼字接龙"
        emoji="🔤"
        hint="看中文和图,听发音,把打乱的字母按顺序拼成单词。可以用提示哦!"
        onStart={begin}
        onBack={() => navigate(`${base}/vocab-games`)}
      />
    );
  }

  const stars = solvedCount >= 8 ? 3 : solvedCount >= 6 ? 2 : solvedCount >= 3 ? 1 : 0;

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-[#1f6b3a] to-[#3FB23C] px-4 pb-6 pt-3 text-white">
      <div className="flex items-center text-sm font-bold">
        <button type="button" onClick={() => navigate(`${base}/vocab-games`)} aria-label="返回">
          ✕
        </button>
        <div className="ml-auto">
          {idx + 1}/{words.length} · 拼对 {solvedCount}
        </div>
      </div>

      {/* 题面 */}
      <div className="mt-4 rounded-2xl bg-white/15 p-5 text-center">
        <div className="text-5xl">{cur?.emoji ?? "📝"}</div>
        <div className="mt-2 text-2xl font-extrabold">{cur?.cn}</div>
        <button
          type="button"
          onClick={() => cur && hubSpeak(cur.en, 0.85, 4)}
          className="mt-2 rounded-full bg-white/25 px-3 py-1 text-sm font-bold"
        >
          🔊 听一听
        </button>
      </div>

      {/* 拼写槽 */}
      <div className={`mt-5 flex flex-wrap justify-center gap-1.5 ${wrong ? "fc-shake" : ""}`}>
        {cur &&
          Array.from({ length: cur.en.length }).map((_, i) => {
            const ch = build[i] != null ? tiles.find((t) => t.id === build[i])?.ch : "";
            return (
              <div
                key={i}
                className={`grid h-11 w-9 place-items-center rounded-lg border-2 text-xl font-extrabold ${
                  wrong ? "border-red-300 bg-red-100 text-red-600" : "border-white/50 bg-white/90 text-[#1f6b3a]"
                }`}
              >
                {ch}
              </div>
            );
          })}
      </div>

      {/* 字母瓦片 */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {tiles.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={t.used}
            onClick={() => tapTile(t)}
            className="grid h-12 w-10 place-items-center rounded-xl bg-white text-xl font-extrabold text-[#1f6b3a] shadow active:scale-90 disabled:opacity-20"
          >
            {t.ch}
          </button>
        ))}
      </div>

      {/* 操作 */}
      <div className="mt-auto flex items-center justify-center gap-3 pt-4">
        <button type="button" onClick={backspace} className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold">
          ⌫ 退格
        </button>
        <button
          type="button"
          onClick={hint}
          disabled={build.length > 0}
          className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold disabled:opacity-40"
        >
          💡 提示首字母
        </button>
        <button type="button" onClick={() => next(false)} className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold">
          跳过 →
        </button>
      </div>

      {done && (
        <GameResult
          title="拼写大师！"
          emoji="🌟"
          stars={stars}
          lines={[`拼对 ${solvedCount} / ${words.length}`]}
          onAgain={again}
          onHome={() => navigate(`${base}/vocab-games`)}
        />
      )}
    </div>
  );
}
