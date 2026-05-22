import { JUNIOR_LEVEL_META } from "@/lib/juniorGrammarFsrs";
import { cn } from "@/lib/utils";

export type GrammarMapNodeProps = {
  index: number;
  title: string;
  level: number; // 0..4
  isCurrent?: boolean;
  isDue?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
};

const HEX_BG: Record<number, string> = {
  0: "bg-muted text-muted-foreground border-2 border-dashed border-border",
  1: "bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-md",
  2: "bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-md",
  3: "bg-gradient-to-b from-amber-400 to-amber-600 text-white shadow-md",
  4: "bg-gradient-to-b from-yellow-400 to-yellow-600 text-white shadow-md ring-4 ring-yellow-500/25",
};

export function GrammarMapNode({
  index,
  title,
  level,
  isCurrent,
  isDue,
  dimmed,
  onClick,
}: GrammarMapNodeProps) {
  const meta = JUNIOR_LEVEL_META[level] ?? JUNIOR_LEVEL_META[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-[88px] flex-col items-center gap-1.5 outline-none transition",
        "hover:-translate-y-1 focus-visible:-translate-y-1",
        dimmed && "pointer-events-none opacity-20 saturate-50",
      )}
    >
      {isCurrent && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-purple-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-[0_0_14px_rgba(168,85,247,.7)]">
          YOU ARE HERE
        </span>
      )}

      <span
        className={cn(
          "relative grid h-14 w-14 place-items-center rounded-2xl text-base font-extrabold tabular-nums",
          HEX_BG[level],
          isCurrent &&
            "outline outline-[3px] outline-offset-[3px] outline-purple-500 animate-pulse",
        )}
      >
        {String(index + 1).padStart(2, "0")}
        {level > 0 && (
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border-2 border-background text-[10px]",
              level === 4 && "bg-yellow-500 text-white",
              level === 3 && "bg-amber-500 text-white",
              level === 2 && "bg-emerald-500 text-white",
              level === 1 && "bg-sky-500 text-white",
            )}
          >
            {meta.emoji}
          </span>
        )}
        {isDue && (
          <span className="absolute -left-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
            ↻
          </span>
        )}
      </span>

      <small className="max-w-[88px] text-center text-[11px] leading-tight text-foreground/80 group-hover:text-foreground">
        {title}
      </small>
    </button>
  );
}
