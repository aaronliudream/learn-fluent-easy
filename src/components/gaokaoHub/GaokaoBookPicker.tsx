import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Lock } from "lucide-react";
import { T } from "@/i18n/T";

/** 高中 7 册(必修一~选必四)。volume = junior_* 表里的 volume 值。 */
export const GAOKAO_BOOKS: { volume: string; cn: string; emoji: string }[] = [
  { volume: "required1", cn: "必修一", emoji: "📘" },
  { volume: "required2", cn: "必修二", emoji: "📗" },
  { volume: "required3", cn: "必修三", emoji: "📙" },
  { volume: "elective1", cn: "选必一", emoji: "📕" },
  { volume: "elective2", cn: "选必二", emoji: "📓" },
  { volume: "elective3", cn: "选必三", emoji: "📔" },
  { volume: "elective4", cn: "选必四", emoji: "📒" },
];

/**
 * 6 大专项板块通用「选册」骨架:7 册卡片,只有有真实内容的册可点(available),
 * 其余显示「整理中」。某册内容灌库后(junior_* 出现该 volume)自动可点。
 * basePath 例:'/gaokao/grammar' → 点必修一去 '/gaokao/grammar?book=required1'。
 */
export default function GaokaoBookPicker({
  boardTitle,
  boardEmoji,
  basePath,
  available,
  backTo = "/gaokao",
  subtitle,
}: {
  boardTitle: string;
  boardEmoji: string;
  basePath: string;
  available: Set<string>;
  backTo?: string;
  subtitle?: string;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 space-y-5">
      <BackLink to={backTo} />
      <header className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-5 dark:from-indigo-950/30 dark:to-violet-950/20">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="mr-2">{boardEmoji}</span>{boardTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle ?? "选择课本分册开始练习"}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GAOKAO_BOOKS.map((b) => {
          const ok = available.has(b.volume);
          if (!ok) {
            return (
              <div
                key={b.volume}
                className="relative flex flex-col items-start gap-1 rounded-2xl border border-dashed border-border bg-muted/30 p-4 opacity-70"
              >
                <span className="text-2xl">{b.emoji}</span>
                <span className="font-bold text-muted-foreground">{b.cn}</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Lock className="size-3" /> <T>整理中</T>
                </span>
              </div>
            );
          }
          return (
            <Link
              key={b.volume}
              to={`${basePath}?book=${b.volume}`}
              className="group flex flex-col items-start gap-1 rounded-2xl border-2 border-indigo-200 bg-white p-4 shadow-sm transition hover:border-indigo-400 hover:shadow-md dark:border-indigo-900/50 dark:bg-card"
            >
              <span className="text-2xl">{b.emoji}</span>
              <span className="font-extrabold text-foreground">{b.cn}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                <BookOpen className="size-3" /> <T>开始</T>
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

function BackLink({ to }: { to: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> <T>返回高中专区</T>
    </Link>
  );
}
