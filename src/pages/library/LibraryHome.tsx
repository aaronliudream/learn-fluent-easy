/**
 * 图书馆(/library)· 书架首页。
 * 年龄段筛选 chips + 书目网格(渐变封面 + 进度)。只列 is_published=true(RLS 已保证)。
 * v1 不做:个人书架 / 我的主页 / 词库 / 成就(留 v2)。未挂 BrandHubNav 入口(软上线,敲 URL 访问)。
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, BookMarked } from "lucide-react";
import { T } from "@/i18n/T";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import {
  listBooks,
  currentUserId,
  coverImageUrl,
  type LibraryAgeBand,
  type LibraryBookListItem,
} from "@/lib/library/data";
import { fetchProgressMap, type LibraryReadingState } from "@/lib/library/progress";

const BANDS: { key: LibraryAgeBand | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "少儿", label: "少儿" },
  { key: "儿童", label: "儿童" },
  { key: "青少年", label: "青少年" },
  { key: "成人", label: "成人" },
];

const BAND_BADGE: Record<LibraryAgeBand, string> = {
  少儿: "bg-pink-100 text-pink-700",
  儿童: "bg-amber-100 text-amber-700",
  青少年: "bg-sky-100 text-sky-700",
  成人: "bg-violet-100 text-violet-700",
};

function coverStyle(cover: { c1?: string; c2?: string }) {
  const c1 = cover.c1 || "#334155";
  const c2 = cover.c2 || "#0f172a";
  return { backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})` };
}

function pctOf(state: LibraryReadingState | undefined, total: number): number {
  if (!state || total <= 0 || state.furthest_seq < 0) return 0;
  return Math.round(((state.furthest_seq + 1) / total) * 100);
}

export default function LibraryHome() {
  const [band, setBand] = useState<LibraryAgeBand | "all">("all");
  const [books, setBooks] = useState<LibraryBookListItem[]>([]);
  const [progress, setProgress] = useState<Map<string, LibraryReadingState>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const list = await listBooks(band === "all" ? undefined : band);
      if (!alive) return;
      setBooks(list);
      setLoading(false);
      const uid = await currentUserId();
      if (!alive) return;
      const map = await fetchProgressMap(
        uid,
        list.map((b) => b.id),
      );
      if (!alive) return;
      setProgress(map);
    })();
    return () => {
      alive = false;
    };
  }, [band]);

  const empty = useMemo(() => !loading && books.length === 0, [loading, books]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8">
      <BackLink
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> <T>返回首页</T>
      </BackLink>
      <h1 className="text-2xl font-extrabold text-slate-900">
        <T>📚 图书馆</T>
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        <T>分级读物 · 点词查中文 · 整章朗读 · 断点续读</T>
      </p>

      <Link
        to="/library/vocab"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
      >
        <BookMarked className="size-4" /> <T>我的词库</T>
      </Link>

      {/* 年龄段筛选 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {BANDS.map((b) => (
          <button
            key={b.key}
            onClick={() => setBand(b.key)}
            className={cn(
              "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition",
              band === b.key
                ? "border-sky-500 bg-sky-500 text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-sky-300",
            )}
          >
            <T>{b.label}</T>
          </button>
        ))}
      </div>

      {/* 书目网格 */}
      {empty && (
        <p className="mt-10 text-center text-sm text-slate-400">
          <T>这个年龄段暂时还没有书,敬请期待</T>
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {books.map((b) => {
          const pct = pctOf(progress.get(b.id), b.sentence_count);
          const coverImg = coverImageUrl(b.cover);
          return (
            <Link
              key={b.id}
              to={`/library/${b.book_key}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="relative flex aspect-[3/4] items-end p-3 text-white"
                style={coverStyle(b.cover)}
              >
                {coverImg ? (
                  <img
                    src={coverImg}
                    alt={b.title}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <>
                    <BookOpen className="absolute right-3 top-3 size-4 opacity-40" />
                    <div className="min-w-0">
                      <div className="line-clamp-3 text-base font-bold leading-tight drop-shadow-sm">
                        {b.title}
                      </div>
                      {b.author && (
                        <div className="mt-1 truncate text-[11px] opacity-80">{b.author}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                {b.zh_title && (
                  <div className="truncate text-xs font-semibold text-slate-600">{b.zh_title}</div>
                )}
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", BAND_BADGE[b.age_band])}
                  >
                    {b.age_band}
                  </span>
                  {b.age_range && <span className="text-[10px] text-slate-400">{b.age_range}</span>}
                </div>
                {pct > 0 && (
                  <div className="mt-auto">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                    <div className="mt-0.5 text-[10px] tabular-nums text-slate-400">
                      <T>已读</T> {pct}%
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
