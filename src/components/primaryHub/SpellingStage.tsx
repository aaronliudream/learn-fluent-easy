import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { VocabItem } from "@/lib/primaryHub/types";
import { toHubTtsText } from "@/lib/primaryHub/speech";
import { speakKid, stopSpeaking, prefetchTTSBatchKid } from "@/lib/speak";
import { isWebSpeechSupported, speakWebSpeech } from "@/lib/webSpeech";
import {
  type GradeKey,
  getGradeConfig,
  isBossWord,
  loadRexXp,
  saveRexXp,
  rexStageFromXp,
  rexStageProgress,
  REX_STAGE_META,
  loadWrongPool,
  saveWrongPool,
  nextReviewDelayMs,
  type WrongPool,
} from "@/lib/primaryHub/spellingStageConfig";

type Props = {
  vocabulary: VocabItem[];
  gradeKey: GradeKey;
  unitId: string;
  grade: number;
  onFinish: () => void;
  onCorrect: () => void;
  onWrong: (m: { q: string; opts: string[]; answer: number; point: string }) => void;
  onProgress?: (percent: number) => void;
  features?: { rexEnabled?: boolean; bonusBoxEnabled?: boolean; bossEnabled?: boolean; letterSlots?: boolean };
};

type QueueItem = { word: VocabItem; isReview: boolean; isTreasure: boolean; isBoss: boolean };
type SlotStatus = "empty" | "typed" | "correct" | "hint" | "wrong";
const PRAISE = ["✨ Nice!", "✔ Good!", "⭐ Great!", "💫 Sweet!"];
const MAX_SHIELDS = 2;
const TREASURE_RATE = 0.28;
/** Space and hyphen auto-fill (occupy a slot, no typing needed). Apostrophe is typed. */
const isAutoChar = (c: string) => c === " " || c === "-";

let praiseIdx = 0;

function Confetti({ kind }: { kind: "star" | "gold" | "purple" }) {
  const colors =
    kind === "gold"
      ? ["#FFD64B", "#BA7517", "#FFE9AD", "#FF9F1C"]
      : kind === "purple"
        ? ["#534AB7", "#B9B3F0", "#7C6FE8", "#EFEAFE"]
        : ["#FFD64B", "#97C459", "#FF6B35", "#378ADD"];
  const n = kind === "star" ? 8 : 14;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {Array.from({ length: n }).map((_, i) => {
        const left = 10 + Math.random() * 80;
        const delay = Math.random() * 0.15;
        const dur = 0.7 + Math.random() * 0.4;
        const tx = (Math.random() - 0.5) * 120;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: "40%",
              color: colors[i % colors.length],
              fontSize: kind === "star" ? 16 : 13,
              animation: `spell-confetti ${dur}s ease-out ${delay}s forwards`,
              ["--tx" as string]: `${tx}px`,
            }}
          >
            {kind === "purple" ? "✦" : "★"}
          </span>
        );
      })}
    </div>
  );
}

export default function SpellingStage({
  vocabulary,
  gradeKey,
  unitId,
  grade,
  onFinish,
  onCorrect,
  onWrong,
  onProgress,
  features,
}: Props) {
  const cfg = getGradeConfig(gradeKey);
  const useRex = features?.rexEnabled ?? cfg.useRex;
  const useBoss = features?.bossEnabled ?? true;
  const useTreasure = features?.bonusBoxEnabled ?? true;
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ---- Build the question queue once: due review words first, then the rest. ----
  const queue = useMemo<QueueItem[]>(() => {
    const pool = loadWrongPool(unitId);
    const now = Date.now();
    const byEn = new Map(vocabulary.map((v) => [v.en, v]));
    const due: VocabItem[] = [];
    for (const [en, entry] of Object.entries(pool)) {
      const v = byEn.get(en);
      if (v && entry.nextReviewAt <= now) due.push(v);
    }
    const dueSet = new Set(due.map((v) => v.en));
    const rest = vocabulary.filter((v) => !dueSet.has(v.en));
    const ordered = [...due, ...rest];
    return ordered.map((word) => {
      const boss = useBoss && isBossWord(word.en, gradeKey);
      return {
        word,
        isReview: dueSet.has(word.en),
        isBoss: boss,
        isTreasure: useTreasure && !boss && Math.random() < TREASURE_RATE,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocabulary, unitId, gradeKey]);

  const total = queue.length;
  const [qi, setQi] = useState(0);
  const current = queue[qi];
  const target = (current?.word.en ?? "").replace(/’/g, "'"); // normalize curly → straight apostrophe

  // ---- Per-question letter-slot state ----
  const [values, setValues] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<SlotStatus[]>([]);
  const initSlots = useCallback((word: string) => {
    const vals = word.split("").map((c) => (isAutoChar(c) ? c : ""));
    const sts: SlotStatus[] = word.split("").map((c) => (isAutoChar(c) ? "correct" : "empty"));
    setValues(vals);
    setStatuses(sts);
  }, []);

  // ---- Game state ----
  const [gameScore, setGameScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [shields, setShields] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [rexXp, setRexXp] = useState(() => (useRex ? loadRexXp(gradeKey) : 0));
  const [rexMood, setRexMood] = useState<"happy" | "sad">("happy");
  const [phase, setPhase] = useState<"typing" | "resolved" | "done">("typing");
  const [popup, setPopup] = useState<{ text: string; tone: "good" | "close" | "boss" | "bonus" | "combo" } | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [confetti, setConfetti] = useState<"star" | "gold" | "purple" | null>(null);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [started, setStarted] = useState(false); // intro screen until the kid taps 开始挑战 (unlocks audio)
  const timers = useRef<number[]>([]);

  const after = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const rexStage = rexStageFromXp(rexXp, gradeKey);
  const rexPct = rexStageProgress(rexXp, gradeKey);
  const dueCount = queue.filter((q) => q.isReview).length;

  // The start tap is the user gesture that unlocks audio (Chrome autoplay policy),
  // so the first question's auto-play works.
  const handleStart = async () => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        const ctx = new Ctx();
        await ctx.resume();
      }
    } catch {
      /* ignore */
    }
    try {
      const silent = new Audio(
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
      );
      silent.volume = 0;
      await silent.play().catch(() => {});
    } catch {
      /* ignore */
    }
    setStarted(true);
  };

  const bumpRexXp = useCallback(
    (delta: number) => {
      if (!useRex) return;
      setRexXp((prev) => {
        const nextXp = Math.max(0, prev + delta);
        const before = rexStageFromXp(prev, gradeKey);
        const now = rexStageFromXp(nextXp, gradeKey);
        if (now > before) {
          setFlash(true);
          setBanner(`🎊 Rex 进化了！${REX_STAGE_META[now].emoji} ${REX_STAGE_META[now].label}`);
          after(450, () => setFlash(false));
          after(1600, () => setBanner(null));
        }
        saveRexXp(gradeKey, nextXp);
        return nextXp;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gradeKey, useRex],
  );

  // ---- Speech: ElevenLabs (kid voice, content-addressed cache → no repeat cost),
  // with Web Speech fallback + toast on failure so a TTS error never blocks the kid. ----
  const playWord = useCallback(
    (word: string) => {
      if (!word) return;
      stopSpeaking();
      setSpeaking(true);
      const spoken = toHubTtsText(word);
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          setSpeaking(false);
        }
      };
      speakKid(spoken, { grade, speed: cfg.speechRate })
        .then(done)
        .catch((err) => {
          console.error("[spelling] ElevenLabs speak failed, falling back:", err);
          if (isWebSpeechSupported()) {
            void speakWebSpeech(spoken, cfg.speechRate);
          } else {
            setToast("发音加载失败，请稍后再试");
            after(2200, () => setToast(null));
          }
          done();
        });
      after(2500, done); // safety: never leave the 🔊 button stuck in loading
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cfg.speechRate, grade],
  );

  // Warm the ElevenLabs cache for this unit's words on entry (avoids first-play lag/fail).
  useEffect(() => {
    prefetchTTSBatchKid(
      vocabulary.map((v) => v.en),
      { grade, speed: cfg.speechRate },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!started || !current) return; // no audio before the start gesture (Chrome autoplay policy)
    initSlots(target);
    setPhase("typing");
    setPopup(null);
    const id = window.setTimeout(() => {
      playWord(target);
      requestAnimationFrame(() => inputRef.current?.focus());
    }, 250);
    timers.current.push(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, total, started]);

  useEffect(() => {
    if (onProgress && total) onProgress(Math.min(99, Math.round((qi / total) * 100)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, total]);

  // A slot needs typing (letter or apostrophe); space/hyphen are auto-filled.
  const letterIdx = (i: number) => !isAutoChar(target[i]);
  const cursor = values.findIndex((v, i) => letterIdx(i) && v === "");

  const recordWrongPool = useCallback(
    (en: string, opts: { incrementWrong: boolean; outcome: "wrong" | "skipped" }) => {
      const pool: WrongPool = loadWrongPool(unitId);
      const now = Date.now();
      const e = pool[en] ?? { wrongCount: 0, lastWrongAt: 0, nextReviewAt: 0, masteredCount: 0 };
      if (opts.incrementWrong) e.wrongCount += 1;
      e.lastWrongAt = now;
      e.masteredCount = 0;
      e.lastOutcome = opts.outcome;
      e.nextReviewAt = now + nextReviewDelayMs(e.wrongCount);
      pool[en] = e;
      saveWrongPool(unitId, pool);
    },
    [unitId],
  );

  const markReviewCorrect = useCallback(
    (en: string) => {
      const pool = loadWrongPool(unitId);
      const e = pool[en];
      if (!e) return;
      e.masteredCount += 1;
      if (e.masteredCount >= 3) delete pool[en];
      saveWrongPool(unitId, pool);
    },
    [unitId],
  );

  const advance = useCallback(() => {
    setConfetti(null);
    if (qi + 1 >= total) {
      setPhase("done");
    } else {
      setQi((i) => i + 1);
    }
  }, [qi, total]);

  const handleType = (raw: string) => {
    if (phase !== "typing") return;
    let ch = raw.slice(-1);
    if (ch === "’") ch = "'"; // curly → straight
    if (!/[a-z']/i.test(ch)) return; // letters (any case) + apostrophe
    // keep the kid's keystroke as-typed (judging is case-insensitive; display stays honest)
    const c = cursor;
    if (c < 0) return;
    setValues((prev) => {
      const next = [...prev];
      next[c] = ch;
      return next;
    });
    setStatuses((prev) => {
      const next = [...prev];
      next[c] = "typed";
      return next;
    });
  };

  const handleBackspace = () => {
    if (phase !== "typing") return;
    for (let i = values.length - 1; i >= 0; i--) {
      if (letterIdx(i) && statuses[i] === "typed" && values[i] !== "") {
        setValues((prev) => {
          const n = [...prev];
          n[i] = "";
          return n;
        });
        setStatuses((prev) => {
          const n = [...prev];
          n[i] = "empty";
          return n;
        });
        return;
      }
    }
  };

  const useHint = () => {
    if (phase !== "typing") return;
    const c = cursor;
    if (c < 0) return;
    setValues((prev) => {
      const n = [...prev];
      n[c] = target[c]; // original case (hint reveals the real letter)
      return n;
    });
    setStatuses((prev) => {
      const n = [...prev];
      n[c] = "hint";
      return n;
    });
    setGameScore((s) => Math.max(0, s - 2));
  };

  // Teaching mode: reveal the answer in yellow, say it once, no XP change, re-queue for review.
  const skip = () => {
    if (phase !== "typing" || !current) return;
    setPhase("resolved");
    setValues(target.split(""));
    setStatuses(target.split("").map((c) => (isAutoChar(c) ? "correct" : "hint")));
    playWord(target);
    setBanner("📖 记住啦！下次再来");
    after(1400, () => setBanner(null));
    recordWrongPool(current.word.en, { incrementWrong: true, outcome: "skipped" });
    setCombo(0); // neutral on XP, but the streak still breaks
    after(1500, advance);
  };

  const check = () => {
    if (phase !== "typing" || !current) return;
    if (cursor >= 0) return; // not all letters filled yet
    const guess = values.join("").toLowerCase();
    const answer = target.toLowerCase();
    const letterPositions = target.split("").map((_, i) => i).filter(letterIdx);
    const correctCount = letterPositions.filter((i) => (values[i] || "").toLowerCase() === answer[i]).length;

    if (guess === answer) {
      // ---- CORRECT ----
      setStatuses(target.split("").map(() => "correct"));
      setPhase("resolved");
      const newCombo = combo + 1;
      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));
      const comboBonus = Math.min(newCombo * 2, 10);
      let gained = 10 + comboBonus;
      if (current.isBoss) gained *= 2;
      setGameScore((s) => s + gained);
      onCorrect();
      bumpRexXp(current.isBoss ? 24 : 12);
      setRexMood("happy");
      if (current.isReview) markReviewCorrect(current.word.en);

      if (current.isBoss) {
        setPopup({ text: "👑 BOSS DOWN! ×2", tone: "boss" });
        setConfetti("gold");
        setFlash(true);
        setShake(true);
        after(450, () => { setFlash(false); setShake(false); });
      } else {
        setPopup({ text: PRAISE[praiseIdx++ % PRAISE.length], tone: "good" });
        setConfetti("star");
      }

      // combo milestones
      if (newCombo === 3) setBanner("🔥 COMBO ×3!");
      else if (newCombo === 5) {
        setBanner("🔥🔥 COMBO ×5! 🛡️ +1");
        setShields((s) => Math.min(MAX_SHIELDS, s + 1));
        setFlash(true);
        setConfetti("gold");
        after(450, () => setFlash(false));
      } else if (newCombo === 8) {
        setBanner("🔥🔥🔥 ON FIRE!");
        setShake(true);
        after(450, () => setShake(false));
      }
      if (newCombo === 3 || newCombo === 5 || newCombo === 8) after(1400, () => setBanner(null));

      let advanceDelay = 1200;
      if (current.isTreasure) {
        const bonus = 20 + Math.floor(Math.random() * 21); // 20–40
        advanceDelay = 1600;
        after(800, () => {
          setGameScore((s) => s + bonus);
          setPopup({ text: `🎁 BONUS! +${bonus}`, tone: "bonus" });
          setConfetti("purple");
        });
      }
      after(advanceDelay, advance);
    } else {
      // ---- WRONG ----
      setStatuses((prev) =>
        prev.map((st, i) => {
          if (!letterIdx(i)) return "correct";
          if (st === "hint" || st === "correct") return st;
          if ((values[i] || "").toLowerCase() === answer[i]) return "correct"; // lock the right letters (keep)
          return "wrong";
        }),
      );
      // clear the wrong letters after a brief red flash
      after(450, () => {
        setValues((prev) => prev.map((v, i) => (statuses[i] === "hint" || (letterIdx(i) && (v || "").toLowerCase() === answer[i]) ? v : letterIdx(i) ? "" : v)));
        setStatuses((prev) => prev.map((st, i) => (!letterIdx(i) ? "correct" : st === "wrong" ? "empty" : st)));
        requestAnimationFrame(() => inputRef.current?.focus());
      });
      setShake(true);
      after(450, () => setShake(false));
      setRexMood("sad");
      after(1000, () => setRexMood("happy"));
      bumpRexXp(-8);
      onWrong({ q: `拼写：${current.word.cn}`, opts: [target], answer: 0, point: "单词拼写" });
      recordWrongPool(current.word.en, { incrementWrong: true, outcome: "wrong" });

      const ratio = letterPositions.length ? correctCount / letterPositions.length : 0;

      // combo shield
      if (combo >= 3 && shields > 0) {
        setShields((s) => s - 1);
        setBanner("🛡️ COMBO SAVED!");
        after(1400, () => setBanner(null));
      } else {
        setCombo(0);
      }
      setPopup({ text: ratio >= 0.6 ? "🟡 SO CLOSE!" : "再试一次", tone: ratio >= 0.6 ? "close" : "good" });
      after(900, () => setPopup(null));
    }
  };

  const focusInput = () => inputRef.current?.focus();

  // ---------- INTRO (start gesture unlocks audio) ----------
  if (!started) {
    return (
      <div className="mx-auto max-w-[480px] rounded-2xl border-2 border-[#EEEAE0] bg-[#FFF8F0] p-8 text-center shadow-sm">
        <div className="text-[80px] leading-none">{useRex ? REX_STAGE_META[rexStage].emoji : "✏️"}</div>
        <div className="mt-2 text-lg font-bold text-[#2C2C2A]">{useRex ? "Rex 在等你！" : "拼写挑战"}</div>
        {useRex && (
          <div className="mt-1 text-sm text-[#854F0B]">
            Lv.{rexStage + 1} · {REX_STAGE_META[rexStage].label} · 经验 {rexXp}
          </div>
        )}
        <button
          type="button"
          onClick={handleStart}
          className="mx-auto mt-6 block w-[220px] rounded-2xl bg-[#FF6B35] px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-[#E55A28]"
        >
          ▶️ 开始挑战
        </button>
        <div className="mt-4 text-xs text-[#888780]">
          共 {total} 题
          {dueCount > 0 && <span className="ml-2 rounded-full bg-[#FAEEDA] px-2 py-0.5 font-semibold text-[#854F0B]">📖 {dueCount} 个错词复习</span>}
        </div>
      </div>
    );
  }

  // ---------- DONE ----------
  if (phase === "done") {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <div className="text-5xl">🏆</div>
        <h2 className="mt-2 text-xl font-bold text-[#FF6B35]">拼写挑战完成！</h2>
        <p className="mt-2 text-sm text-[#2C2C2A]">
          本关得分 <span className="font-bold text-[#FF6B35]">{gameScore}</span> · 最高连击 <span className="font-bold">{bestCombo}</span>
        </p>
        {useRex && (
          <p className="mt-1 text-sm text-[#888780]">
            Rex {REX_STAGE_META[rexStage].emoji} {REX_STAGE_META[rexStage].label} · 经验 {rexXp}
          </p>
        )}
        <button
          type="button"
          onClick={onFinish}
          className="mt-4 w-full rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E55A28]"
        >
          ✓ 完成本关 →
        </button>
      </div>
    );
  }

  if (!current) return null;

  // Responsive slot sizing: fit on one line down to 22px; wrap only when >12 letters won't fit.
  const cells = target.length;
  const lettersOnly = target.replace(/[^a-zA-Z]/g, "").length;
  const rawW = Math.floor((330 - 6 * Math.max(0, cells - 1)) / Math.max(1, cells));
  const slotW = Math.max(22, Math.min(32, rawW));
  const slotH = Math.max(30, Math.min(40, slotW + 8));
  const slotFont = Math.max(13, Math.min(18, Math.round(slotW * 0.56)));
  const wrapSlots = lettersOnly > 12 || rawW < 22;

  const slotColor = (st: SlotStatus, isCursor: boolean) => {
    if (st === "correct") return "border-[#639922] bg-[#EAF3DE] text-[#3B6D11]";
    if (st === "hint") return "border-[#EF9F27] bg-[#FAEEDA] text-[#854F0B]";
    if (st === "wrong") return "border-[#E24B4A] bg-[#FCEBEB] text-[#A32D2D]";
    if (isCursor) return "border-[#FF6B35] bg-white text-[#2C2C2A]";
    return "border-[#EEEAE0] bg-white text-[#2C2C2A]";
  };

  return (
    <div className="relative mx-auto max-w-[480px]">
      <style>{`
        @keyframes spell-confetti { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--tx),-90px) scale(.6);opacity:0} }
        @keyframes spell-pop { 0%{transform:translate(-50%,0) scale(.7);opacity:0} 25%{opacity:1} 100%{transform:translate(-50%,-46px) scale(1);opacity:0} }
        @keyframes spell-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(3px)} }
        @keyframes spell-blink { 0%,100%{opacity:1} 50%{opacity:.25} }
      `}</style>

      {/* Rex + score bar */}
      <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-[#FFF8F0] px-3 py-2">
        {useRex ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="text-2xl">{rexMood === "sad" ? "😢" : REX_STAGE_META[rexStage].emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-[#854F0B]">Rex · {REX_STAGE_META[rexStage].label}</div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-[#F4E3C8]">
                <div className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB627]" style={{ width: `${Math.round(rexPct * 100)}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs font-semibold text-[#854F0B]">拼写挑战</div>
        )}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="text-[#FF6B35]">{gameScore}分</span>
          {combo > 1 && <span className="rounded-full bg-[#FFE9AD] px-1.5 py-0.5 text-[#854F0B]">🔥×{combo}</span>}
          <span title="连击护盾">{"🛡️".repeat(shields) || "·"}</span>
        </div>
      </div>

      {/* progress */}
      <div className="mb-3 flex items-center justify-between text-xs text-[#888780]">
        <span>第 {qi + 1} / {total} 题{current.isReview ? " · 🔁 复习" : ""}</span>
        <div className="ml-2 h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4F0E6]">
          <div className="h-full bg-[#97C459]" style={{ width: `${Math.round((qi / total) * 100)}%` }} />
        </div>
      </div>

      {/* card */}
      <div
        onClick={focusInput}
        className={`relative cursor-text rounded-2xl border-2 p-5 shadow-sm ${
          current.isBoss ? "border-[#BA7517] bg-[#FAEEDA]" : "border-[#EEEAE0] bg-white"
        } ${shake ? "" : ""}`}
        style={shake ? { animation: "spell-shake .4s" } : undefined}
      >
        {flash && <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl bg-[#FFD64B]/40" style={{ animation: "spell-pop .45s" }} />}
        {confetti && <Confetti kind={confetti} />}
        {banner && (
          <div className="pointer-events-none absolute left-1/2 top-2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2C2C2A]/88 px-4 py-1.5 text-sm font-bold text-white">
            {banner}
          </div>
        )}

        {current.isBoss && (
          <div className="mb-2 inline-block rounded-full bg-[#BA7517] px-2 py-0.5 text-xs font-bold text-white">👑 BOSS WORD</div>
        )}

        <div className="flex flex-col items-center">
          <div className="text-[58px] leading-none">{current.word.emoji}</div>
          <button
            type="button"
            disabled={speaking}
            onClick={(e) => { e.stopPropagation(); playWord(target); }}
            className="mt-2 flex items-center gap-1 rounded-full bg-[#378ADD] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            {speaking ? "🔊 …" : "🔊 点击听音"}
          </button>

          {/* letter slots — shrink to one line down to a 22px floor; wrap only past ~12 letters */}
          <div
            className="mt-4 flex items-end justify-center gap-1.5"
            style={{ flexWrap: wrapSlots ? "wrap" : "nowrap" }}
          >
            {target.split("").map((ch, i) => {
              if (ch === " ") return <span key={i} style={{ width: Math.round(slotW * 0.4) }} />;
              if (ch === "-")
                return (
                  <span
                    key={i}
                    className="grid place-items-center font-bold text-[#888780]"
                    style={{ width: Math.round(slotW * 0.55), height: slotH, fontSize: slotFont }}
                  >
                    –
                  </span>
                );
              return (
                <span
                  key={i}
                  style={{ width: slotW, height: slotH, fontSize: slotFont }}
                  className={`relative grid place-items-center rounded-md border-2 font-bold ${slotColor(statuses[i], i === cursor)}`}
                >
                  {statuses[i] === "correct" || statuses[i] === "hint" ? ch : values[i]}
                  {i === cursor && statuses[i] === "empty" && (
                    <span
                      className="absolute bottom-1 bg-[#FF6B35]"
                      style={{ height: 2, width: Math.round(slotW * 0.5), animation: "spell-blink 1s infinite" }}
                    />
                  )}
                </span>
              );
            })}
          </div>

          {/* feedback popup */}
          {popup && (
            <div
              className={`pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 whitespace-nowrap text-[22px] font-extrabold ${
                popup.tone === "close"
                  ? "text-[#854F0B]"
                  : popup.tone === "boss"
                    ? "text-[#BA7517]"
                    : popup.tone === "bonus"
                      ? "text-[#534AB7]"
                      : "text-[#3B6D11]"
              }`}
              style={{ animation: "spell-pop 1s forwards" }}
            >
              {popup.text}
            </div>
          )}

          {toast && (
            <div className="pointer-events-none absolute left-1/2 top-1 z-40 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#2C2C2A]/85 px-3 py-1.5 text-xs text-white">
              🔇 {toast}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value=""
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            style={{ position: "absolute", left: -9999, opacity: 0 }}
            onChange={(e) => handleType(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); check(); }
              else if (e.key === "Backspace") { e.preventDefault(); handleBackspace(); }
            }}
          />
        </div>

        {/* actions */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); useHint(); }} className="rounded-xl border-2 border-[#EF9F27] bg-[#FAEEDA] px-3 py-2 text-xs font-semibold text-[#854F0B]">💡 提示 (扣 2 分)</button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); check(); }}
            disabled={cursor >= 0}
            className="rounded-xl bg-[#FF6B35] px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            检查 (Enter)
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); skip(); }} className="rounded-xl border-2 border-[#EEEAE0] bg-white px-3 py-2 text-xs font-semibold text-[#888780]">⏭️ 跳过</button>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-[#888780]">看图 + 听音，拼出单词；拼对的字母会保留 🟢</p>
    </div>
  );
}
