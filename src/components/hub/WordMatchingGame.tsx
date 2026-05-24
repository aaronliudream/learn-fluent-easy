import { useMemo, useState } from "react";
import { hubSpeak } from "@/lib/primaryHub/speech";

export type WordMatchVocab = { en: string; cn: string; emoji?: string };

type MatchCard = {
  key: string;
  pairId: string;
  text: string;
  side: "en" | "cn";
};

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type WordMatchingGameProps = {
  vocabulary: WordMatchVocab[];
  /** Primary grades 1–6 use speakKid via hubSpeak. */
  grade?: number;
  onMatch?: () => void;
  onFinish: () => void;
  finishLabel?: string;
  finishDisabledLabel?: string;
};

export default function WordMatchingGame({
  vocabulary,
  grade,
  onMatch,
  onFinish,
  finishLabel = "✓ 太棒了！进入下一关 →",
  finishDisabledLabel = "完成所有配对再继续",
}: WordMatchingGameProps) {
  const totalPairs = vocabulary.length;
  const cards = useMemo<MatchCard[]>(() => {
    const all: MatchCard[] = [];
    for (const v of vocabulary) {
      all.push({ key: `${v.en}-en`, pairId: v.en, text: v.en, side: "en" });
      all.push({ key: `${v.en}-cn`, pairId: v.en, text: v.cn, side: "cn" });
    }
    return shuffleArray(all);
  }, [vocabulary]);

  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(() => new Set());
  const [picked, setPicked] = useState<MatchCard | null>(null);
  const [wrongKeys, setWrongKeys] = useState<Set<string>>(() => new Set());
  const [errors, setErrors] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lockInput, setLockInput] = useState(false);

  const matchedCount = matchedPairs.size;
  const remaining = totalPairs - matchedCount;
  const done = matchedCount === totalPairs;
  const progressPct = totalPairs > 0 ? (matchedCount / totalPairs) * 100 : 0;

  const visibleCards = useMemo(
    () => cards.filter((card) => !matchedPairs.has(card.pairId)),
    [cards, matchedPairs],
  );

  const pickCard = (card: MatchCard) => {
    if (lockInput || matchedPairs.has(card.pairId)) return;
    if (card.side === "en") hubSpeak(card.text, 0.85, grade);

    if (!picked) {
      setPicked(card);
      return;
    }
    if (picked.key === card.key) {
      setPicked(null);
      return;
    }
    if (picked.side === card.side) {
      setPicked(card);
      return;
    }

    if (picked.pairId === card.pairId) {
      setMatchedPairs((prev) => new Set(prev).add(card.pairId));
      onMatch?.();
      setCombo((c) => {
        const next = c + 1;
        setBestCombo((b) => Math.max(b, next));
        return next;
      });
      setPicked(null);
      return;
    }

    setErrors((e) => e + 1);
    setCombo(0);
    setWrongKeys(new Set([picked.key, card.key]));
    setPicked(null);
    setLockInput(true);
    window.setTimeout(() => {
      setWrongKeys(new Set());
      setLockInput(false);
    }, 600);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-sm font-semibold tabular-nums">
          <span className="text-[#888780]">配对进度</span>
          <span className="text-[#185FA5]">
            {matchedCount}/{totalPairs}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#F4F0E6]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#378ADD] to-[#6FA92A] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {visibleCards.map((card) => {
          const isPicked = picked?.key === card.key;
          const isWrong = wrongKeys.has(card.key);
          const isEn = card.side === "en";

          return (
            <button
              key={card.key}
              type="button"
              disabled={lockInput}
              onClick={() => pickCard(card)}
              className={`match-pair-card relative min-h-[72px] rounded-xl border-2 px-2 py-2.5 text-center text-sm font-semibold leading-snug transition-all duration-300 ease-out ${
                isEn
                  ? "border-[#B8D4EF] bg-[#E6F1FB] text-[#185FA5]"
                  : "border-[#F0C4D4] bg-[#FBEAF0] text-[#C41E3A]"
              } ${isPicked ? "match-pair-card--picked scale-[1.03] shadow-md" : ""} ${
                isWrong ? "match-pair-card--wrong" : ""
              }`}
            >
              <span
                className={`absolute right-1.5 top-1 rounded px-1 py-px text-[9px] font-bold leading-none ${
                  isEn ? "bg-[#378ADD]/15 text-[#185FA5]" : "bg-[#D4537E]/15 text-[#C41E3A]"
                }`}
              >
                {isEn ? "EN" : "中"}
              </span>
              <span className="flex min-h-[44px] items-center justify-center break-words px-1 pt-3">
                {card.text}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl bg-[#FFF8F0] px-3 py-2.5 text-center text-xs text-[#888780] tabular-nums sm:text-sm">
        剩余 <strong className="text-[#2C2C2A]">{remaining}</strong> 对 · 错误{" "}
        <strong className="text-[#E0623F]">{errors}</strong> · 最佳连击{" "}
        <strong className="text-[#378ADD]">{bestCombo}</strong>
        {combo > 1 && (
          <span className="ml-1 font-semibold text-[#6FA92A]">🔥 {combo} 连击</span>
        )}
      </div>

      <button
        type="button"
        disabled={!done}
        onClick={onFinish}
        className="mt-4 w-full rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E55A28] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {done ? finishLabel : finishDisabledLabel}
      </button>
    </div>
  );
}
