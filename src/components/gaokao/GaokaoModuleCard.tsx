import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { GAOKAO_ARTWORK } from "@/components/stage/stageArtwork";

export type GaokaoModuleIcon = keyof typeof GAOKAO_ARTWORK;

type Props = {
  title: string;
  subtitle: string;
  description: string;
  icon: GaokaoModuleIcon;
  progress?: number;
  to: string;
  className?: string;
  /** 右上角小角标(如「从这里开始」)。 */
  badge?: string;
  /** 配角卡:更矮、文字更收。 */
  compact?: boolean;
  /** 文字居中(分组大卡用)。 */
  centered?: boolean;
};

export function GaokaoModuleCard({
  title,
  subtitle,
  description,
  icon,
  progress = 0,
  to,
  className,
  badge,
  compact = false,
  centered = false,
}: Props) {
  const artwork = GAOKAO_ARTWORK[icon];
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <Link
      to={to}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl",
        compact ? "min-h-[168px]" : "min-h-[224px]",
        "shadow-lg transition-all duration-500 ease-out",
        "hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className,
      )}
    >
      <div className="absolute inset-0">
        <img
          src={artwork.image}
          alt={`${artwork.artist} ${artwork.work}`}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-105 saturate-125 contrast-105"
          loading="lazy"
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t", artwork.gradient)} />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
      </div>

      {badge && (
        <span className="absolute right-3 top-3 z-20 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-[#0E2746] shadow-md font-['Noto_Serif_SC',serif]">
          {badge}
        </span>
      )}

      <div
        className={cn(
          "relative z-10 flex h-full flex-col text-white",
          compact ? "p-4" : "p-5",
          centered && "items-center text-center",
        )}
      >
        <span className="inline-flex w-fit items-center rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium tracking-wider backdrop-blur-sm font-['Noto_Serif_SC',serif]">
          {artwork.artist} · {artwork.work}
        </span>

        <div className="min-h-[24px] flex-1" />

        <div className={cn("w-full", compact ? "space-y-2" : "space-y-3")}>
          <div>
            <h3
              className={cn(
                "font-bold tracking-tight font-['Noto_Serif_SC',serif] [text-shadow:0_2px_6px_rgba(0,0,0,0.95)]",
                compact ? "text-2xl" : "text-3xl",
              )}
            >
              {title}
            </h3>
            <p className="mt-1 text-sm font-semibold opacity-100 font-['Noto_Serif_SC',serif] [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
              {subtitle}
            </p>
          </div>

          {!compact && (
            <p className="line-clamp-2 text-xs font-medium leading-relaxed opacity-95 [text-shadow:0_1px_3px_rgba(0,0,0,0.85)]">
              {description}
            </p>
          )}

          {!centered && (
            <div className={compact ? "pt-1" : "pt-2"}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-medium opacity-80 font-['Noto_Serif_SC',serif]">学习进度</span>
                <span className="font-display text-sm font-bold num">{pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-black/20 backdrop-blur-sm">
                <div
                  className="h-full rounded-full bg-white/90 transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
