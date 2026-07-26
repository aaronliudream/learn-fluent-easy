/**
 * 图书馆(/library)· 书架首页。
 * 年龄段筛选 chips + 书目网格(渐变封面 + 进度)。只列 is_published=true(RLS 已保证)。
 * v1 不做:个人书架 / 我的主页 / 词库 / 成就(留 v2)。未挂 BrandHubNav 入口(软上线,敲 URL 访问)。
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, BookMarked, Lock } from "lucide-react";
import { T } from "@/i18n/T";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import {
  listBooks,
  currentUserId,
  coverImageUrl,
  getBookVisibility,
  type LibraryAgeBand,
  type LibraryBookListItem,
} from "@/lib/library/data";
import { fetchProgressMap, type LibraryReadingState } from "@/lib/library/progress";
import { getLibrarySegment, type LibrarySegmentInfo } from "@/lib/library/segment";
import { trackVocabEntryView, trackVocabEntryClick } from "@/lib/library/vocabFunnel";

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
  const [visibility, setVisibility] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // 书目加载失败(弱网/抖动)→ 显重试,不再卡死在加载态
  const [reloadKey, setReloadKey] = useState(0); // 重试:bump 触发 load effect 重跑
  // 分段信息(null=未加载,先按默认句显示,确认收藏为 0 才切引导句,避免闪现)。
  // 入口曝光埋点等它算完再报 —— 报的是"看到时是哪类用户 + 多少词待复习",半成品数据没有分析价值。
  const [seg, setSeg] = useState<LibrarySegmentInfo | null>(null);
  const favCount = seg?.favTotal ?? null;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const info = await getLibrarySegment();
        if (!alive) return;
        setSeg(info);
        trackVocabEntryView(info); // 每次会话只报一次(模块内自带去重)
      } catch {
        /* 分段/埋点失败绝不影响书架:副文案退回默认句 */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const [list, vis] = await Promise.all([
          listBooks(band === "all" ? undefined : band),
          getBookVisibility(),
        ]);
        if (!alive) return;
        setBooks(list);
        setVisibility(vis);
        setLoading(false);
        // 进度是次要数据:失败不该让整页报错(书目已可读),单独兜住。
        try {
          const uid = await currentUserId();
          if (!alive) return;
          const map = await fetchProgressMap(
            uid,
            list.map((b) => b.id),
          );
          if (alive) setProgress(map);
        } catch {
          /* 进度加载失败:忽略,书照读 */
        }
      } catch {
        // 书目加载失败(弱网/网络抖动):停在重试态,不再无限转圈。
        if (!alive) return;
        setError(true);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [band, reloadKey]);

  const empty = useMemo(() => !loading && books.length === 0, [loading, books]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8">
      <BackLink
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> <T>返回首页</T>
      </BackLink>
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold text-slate-900">
          <T>📚 图书馆</T>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          <T>点词查解释 · 文章朗读</T>
        </p>
      </div>

      {/* 我的词库入口:整幅醒目卡,居中显眼(原来藏在标题右侧,用户看不到) */}
      <Link
        to="/library/vocab"
        onClick={() => {
          if (seg) trackVocabEntryClick(seg); // 不 await、不挡跳转;分段没算出来就不报,不猜
        }}
        className="group mt-5 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 px-5 py-4 text-white shadow-md transition hover:shadow-lg hover:brightness-105 active:scale-[0.99]"
      >
        <span className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/20">
            <BookMarked className="size-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold"><T>我的词库</T></span>
            {favCount === 0 ? (
              <span className="block text-[12px] text-sky-100"><T>还没有收藏的词 · 读书时点一下生词就能加进来</T></span>
            ) : (
              <span className="block whitespace-nowrap text-[12px] text-sky-100"><T>读书点词 → 收藏 → 复习测试</T></span>
            )}
          </span>
        </span>
        <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-0.5" />
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
      {error && !loading && (
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-slate-500">
            <T>书目没加载出来,可能是网络不太稳</T>
          </p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="rounded-full bg-sky-500 px-5 py-2 text-sm font-bold text-white transition active:scale-95"
          >
            <T>重试</T>
          </button>
        </div>
      )}
      {empty && !error && (
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
                {visibility.get(b.id) === "private" && (
                  <span
                    className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
                    title="私享 · 仅授权账号可见"
                  >
                    <Lock className="size-3" /> 私享
                  </span>
                )}
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
                  <div className="truncate text-base font-bold text-slate-800">{b.zh_title}</div>
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
