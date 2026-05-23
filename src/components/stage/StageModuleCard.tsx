import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type StageArtworkEntry = {
  image: string;
  artist: string;
  work: string;
  gradient: string;
};

type Props = {
  title: string;
  subtitle: string;
  description: string;
  artwork: StageArtworkEntry;
  progress?: number;
  to: string;
  className?: string;
};

export function StageModuleCard({
  title,
  subtitle,
  description,
  artwork,
  progress = 0,
  to,
  className,
}: Props) {
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <Link
      to={to}
      className={cn(
        "group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl",
        "shadow-lg transition-all duration-500 ease-out",
        "hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl",
        "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2",
        className,
      )}
    >
      <img
        src={artwork.image}
        alt={`${artwork.artist} - ${artwork.work}`}
        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />

      <div className={cn("absolute inset-0 bg-gradient-to-t", artwork.gradient)} />

      <div className="relative z-10 flex h-full flex-col p-5 text-white">
        <span className="inline-flex w-fit items-center rounded-full bg-white/25 px-2.5 py-1 text-[10px] font-medium tracking-wider backdrop-blur-sm font-['Noto_Serif_SC',serif]">
          {artwork.artist} · {artwork.work}
        </span>

        <div className="min-h-[40px] flex-1" />

        <div className="space-y-3">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight drop-shadow-md font-['Noto_Serif_SC',serif]">
              {title}
            </h3>
            <p className="mt-1 text-sm font-medium opacity-95 font-['Noto_Serif_SC',serif]">{subtitle}</p>
          </div>

          <p className="line-clamp-2 text-xs leading-relaxed opacity-90">{description}</p>

          <div className="pt-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-medium opacity-90 font-['Noto_Serif_SC',serif]">学习进度</span>
              <span className="font-display text-sm font-bold num">{pct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/15 backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-white/95 transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );
}
