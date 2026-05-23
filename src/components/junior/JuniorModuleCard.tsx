import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type JuniorModuleIcon =
  | "vocabulary"
  | "grammar"
  | "reading"
  | "listening"
  | "writing"
  | "exam"
  | "classroom";

type Props = {
  title: string;
  subtitle: string;
  description: string;
  icon: JuniorModuleIcon;
  progress?: number;
  to: string;
  className?: string;
};

const artworkConfig = {
  vocabulary: {
    image: "/images/vocabulary-monet.jpg",
    artist: "莫奈",
    work: "睡莲",
    gradient: "from-rose-500/85 via-pink-500/75 to-sky-400/80",
  },
  grammar: {
    image: "/images/grammar-mondrian.jpg",
    artist: "蒙德里安",
    work: "构成",
    gradient: "from-red-500/80 via-white/60 to-blue-500/80",
  },
  reading: {
    image: "/images/reading-vermeer.jpg",
    artist: "维米尔",
    work: "读信少女",
    gradient: "from-amber-700/85 via-amber-500/70 to-yellow-400/75",
  },
  listening: {
    image: "/images/listening-kandinsky.jpg",
    artist: "康定斯基",
    work: "构成VIII",
    gradient: "from-violet-600/85 via-purple-500/75 to-orange-400/80",
  },
  writing: {
    image: "/images/writing-vangogh.jpg",
    artist: "梵高",
    work: "向日葵",
    gradient: "from-amber-500/85 via-yellow-400/75 to-orange-500/80",
  },
  exam: {
    image: "/images/exam-raphael.jpg",
    artist: "拉斐尔",
    work: "雅典学院",
    gradient: "from-stone-700/85 via-stone-500/75 to-amber-600/80",
  },
  classroom: {
    image: "/images/classroom-hokusai.jpg",
    artist: "葛饰北斋",
    work: "神奈川冲浪里",
    gradient: "from-indigo-700/85 via-blue-500/75 to-cyan-400/80",
  },
} as const;

export function JuniorModuleCard({
  title,
  subtitle,
  description,
  icon,
  progress = 0,
  to,
  className,
}: Props) {
  const artwork = artworkConfig[icon];
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
        <span className="inline-flex w-fit items-center rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-medium tracking-wider backdrop-blur-sm font-['Noto_Serif_SC',serif]">
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

          <p className="line-clamp-2 text-xs leading-relaxed opacity-85">{description}</p>

          <div className="pt-2">
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
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );
}
