import { Crown } from "lucide-react";
import { SLANG_DIMS, type SlangDim, type SlangMatrix } from "@/lib/slangMastery";
import { T } from "@/i18n/T";

/** Tiny 4-dot row showing the learner's progress on each mastery dim.
 *  Each dim fills up at score >= 2 (the same threshold that marks 👑).
 *  This visualises why "answering more en2cn" alone won't crown a slang —
 *  the user must also hit the recall/use drills. */
const LABELS: Record<SlangDim, string> = {
  recognize: "认",
  hear: "听",
  recall: "想",
  use: "用",
};

export default function SlangMasteryDots({
  matrix,
  isMaster,
  className = "",
}: {
  matrix: SlangMatrix;
  isMaster: boolean;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      title="认 / 听 / 想 / 用 — 全部 ≥ 2 即 👑"
    >
      {SLANG_DIMS.map((d) => {
        const v = matrix[d] ?? 0;
        const filled = v >= 2;
        const partial = v === 1;
        return (
          <span key={d} className="inline-flex flex-col items-center gap-0.5">
            <span
              className={`block size-1.5 rounded-full transition ${
                filled
                  ? "bg-emerald-500"
                  : partial
                    ? "bg-amber-400"
                    : "bg-muted-foreground/25"
              }`}
            />
            <span className="text-[8px] font-bold text-muted-foreground">
              <T>{LABELS[d]}</T>
            </span>
          </span>
        );
      })}
      {isMaster && <Crown className="ml-1 size-3 text-amber-500" />}
    </div>
  );
}
