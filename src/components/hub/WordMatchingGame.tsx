import { useMemo, useState, useEffect } from "react";
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

function chunk<T>(arr: T[], size: number): T[][] {
  if (!size || size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out.length ? out : [[]];
}

export type WordMatchingGameProps = {
  vocabulary: WordMatchVocab[];
  /** Primary grades 1–6 use speakKid via hubSpeak. */
  grade?: number;
  /** 配对成功时回调,带该词英文(=pairId),供调用方记掌握度。 */
  onMatch?: (en: string) => void;
  onFinish: () => void;
  onProgressChange?: (percent: number) => void;
  finishLabel?: string;
  finishDisabledLabel?: string;
  /** 若提供,则把词表按每组 batchSize 个分批配对(做完一组询问是否继续)。不提供=不分组(原行为)。 */
  batchSize?: number;
  /** true=不整体打乱,保持传入顺序切组(用于"未掌握优先"已排好序的词表)。组内卡片仍乱序。 */
  preserveOrder?: boolean;
};

export default function WordMatchingGame({
  vocabulary,
  grade,
  onMatch,
  onFinish,
  onProgressChange,
  finishLabel = "✓ 太棒了！进入下一关 →",
  finishDisabledLabel = "完成所有配对再继续",
  batchSize,
  preserveOrder,
}: WordMatchingGameProps) {
  const totalPairs = vocabulary.length;

  // preserveOrder=true 保持传入顺序(未掌握优先);否则整体打乱。再按 batchSize 切组(不传=单组)。
  const batches = useMemo<WordMatchVocab[][]>(
    () => chunk(preserveOrder ? vocabulary : shuffleArray(vocabulary), batchSize ?? vocabulary.length),
    [vocabulary, batchSize, preserveOrder],
  );

  const [batchIdx, setBatchIdx] = useState(0);
  const currentBatch = batches[batchIdx] ?? [];
  const batchTotal = currentBatch.length;
  const batchCount = batches.length;
  const isBatched = batchCount > 1;
  const hasNextBatch = batchIdx < batchCount - 1;
  const matchedBeforeBatch = useMemo(
    () => batches.slice(0, batchIdx).reduce((n, b) => n + b.length, 0),
    [batches, batchIdx],
  );

  const cards = useMemo<MatchCard[]>(() => {
    const all: MatchCard[] = [];
    for (const v of currentBatch) {
      all.push({ key: `${v.en}-en`, pairId: v.en, text: v.en, side: "en" });
      all.push({ key: `${v.en}-cn`, pairId: v.en, text: v.cn, side: "cn" });
    }
    return shuffleArray(all);
  }, [currentBatch]);

  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(() => new Set());
  const [picked, setPicked] = useState<MatchCard | null>(null);
  const [wrongKeys, setWrongKeys] = useState<Set<string>>(() => new Set());
  const [errors, setErrors] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lockInput, setLockInput] = useState(false);

  // 切换到下一组时重置本组状态(errors/bestCombo 作为整关统计保留)
  useEffect(() => {
    setMatchedPairs(new Set());
    setPicked(null);
    setWrongKeys(new Set());
    setCombo(0);
    setLockInput(false);
  }, [batchIdx]);

  const batchMatched = matchedPairs.size;
  const overallMatched = matchedBeforeBatch + batchMatched;
  const remainingAll = totalPairs - overallMatched;
  const batchDone = batchTotal > 0 && batchMatched === batchTotal;
  const lastBatchDone = batchDone && !hasNextBatch;
  const progressPct = totalPairs > 0 ? (overallMatched / totalPairs) * 100 : 0;

  useEffect(() => {
    onProgressChange?.(progressPct);
  }, [progressPct, onProgressChange]);

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
      onMatch?.(card.pairId);
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
          <span className="text-[#888780]">
            配对进度
            {isBatched && (
              <span className="ml-1 text-[#B0AEA6]">
                · 第 {batchIdx + 1}/{batchCount} 组
              </span>
            )}
          </span>
          <span className="text-[#185FA5]">
            {overallMatched}/{totalPairs}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#F4F0E6]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#378ADD] to-[#6FA92A] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {batchDone && hasNextBatch ? (
        // 本组完成 → 询问是否继续剩余的词
        <div className="rounded-xl bg-[#F3FAEC] px-4 py-8 text-center">
          <div className="text-3xl">🎉</div>
          <p className="mt-2 text-base font-bold text-[#2C2C2A]">
            本组 {batchTotal} 个词全部配对完成！
          </p>
          <p className="mt-1 text-sm text-[#888780]">
            还剩 <strong className="text-[#E0623F]">{remainingAll}</strong> 个词，全部配完才算通关。
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setBatchIdx((i) => i + 1)}
              className="w-full rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E55A28]"
            >
              再来一组 →（剩 {remainingAll} 个）
            </button>
          </div>
        </div>
      ) : (
        <>
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
            本组剩余 <strong className="text-[#2C2C2A]">{batchTotal - batchMatched}</strong> 对 · 错误{" "}
            <strong className="text-[#E0623F]">{errors}</strong> · 最佳连击{" "}
            <strong className="text-[#378ADD]">{bestCombo}</strong>
            {combo > 1 && (
              <span className="ml-1 font-semibold text-[#6FA92A]">🔥 {combo} 连击</span>
            )}
          </div>

          <button
            type="button"
            disabled={!lastBatchDone}
            onClick={onFinish}
            className="mt-4 w-full rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E55A28] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {lastBatchDone ? finishLabel : finishDisabledLabel}
          </button>
        </>
      )}
    </div>
  );
}
