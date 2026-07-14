/**
 * 首页 · 图书馆一级板块(与四个学段板块平级,放在其下,分隔线隔开)。
 * ⚠️ 软上线:默认 flag 关闭 → 不渲染。预览用 ?lib=1。绝不挂进 BrandHubNav(等 Aaron 明确批准)。
 * 数据全真:封面 library_books.cover.image / 年龄段 / 阅读进度(登录才有)/ 总词数(word_count 预计算)。
 * 只读,不写库;与 P0 无关。
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookOpen, ArrowRight, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import {
  listBooks,
  currentUserId,
  coverImageUrl,
  getBookWordCounts,
  type LibraryAgeBand,
  type LibraryBookListItem,
} from "@/lib/library/data";
import { fetchProgressMap, type LibraryReadingState } from "@/lib/library/progress";

/** 首页板块开关:默认关(软上线)。Aaron 批准后改 true;或访问 ?lib=1 预览。 */
const LIBRARY_HOME_ENABLED = false;

const BANDS: { key: LibraryAgeBand | "all"; label: string; en: string }[] = [
  { key: "all", label: "全部", en: "All" },
  { key: "少儿", label: "少儿", en: "Pre-K" },
  { key: "儿童", label: "儿童", en: "Kids" },
  { key: "青少年", label: "青少年", en: "Teens" },
  { key: "成人", label: "成人", en: "Adult" },
];
const BAND_BADGE: Record<LibraryAgeBand, string> = {
  少儿: "bg-rose-100 text-rose-700",
  儿童: "bg-amber-100 text-amber-700",
  青少年: "bg-sky-100 text-sky-700",
  成人: "bg-violet-100 text-violet-700",
};

function coverStyle(cover: { c1?: string; c2?: string }) {
  return { backgroundImage: `linear-gradient(135deg, ${cover.c1 || "#334155"}, ${cover.c2 || "#0f172a"})` };
}
function fmtWords(n: number | undefined, zh: boolean): string | null {
  if (!n || n <= 0) return null;
  if (n >= 10000) return zh ? `${(n / 10000).toFixed(1)} 万词` : `${(n / 1000).toFixed(1)}k words`;
  return zh ? `${n} 词` : `${n} words`;
}
function pctOf(state: LibraryReadingState | undefined, total: number): number {
  if (!state || total <= 0 || state.furthest_seq < 0) return 0;
  return Math.min(100, Math.round(((state.furthest_seq + 1) / total) * 100));
}

export default function LibraryLandingSection() {
  const [params] = useSearchParams();
  const enabled = LIBRARY_HOME_ENABLED || params.get("lib") === "1";
  const { lang } = useI18n();
  const zh = lang === "zh" || lang === "zh-TW";

  const [books, setBooks] = useState<LibraryBookListItem[]>([]);
  const [progress, setProgress] = useState<Map<string, LibraryReadingState>>(new Map());
  const [words, setWords] = useState<Map<string, number>>(new Map());
  const [band, setBand] = useState<LibraryAgeBand | "all">("all");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    (async () => {
      const [rows, wc] = await Promise.all([listBooks(), getBookWordCounts()]);
      if (!alive) return;
      setBooks(rows);
      setWords(wc);
      const uid = await currentUserId();
      if (!alive) return;
      if (uid && rows.length) {
        const map = await fetchProgressMap(uid, rows.map((b) => b.id));
        if (alive) setProgress(map);
      }
      setReady(true);
    })();
    return () => { alive = false; };
  }, [enabled]);

  const shown = useMemo(
    () => (band === "all" ? books : books.filter((b) => b.age_band === band)),
    [books, band],
  );

  if (!enabled) return null;
  if (ready && books.length === 0) return null; // 无书自动隐藏

  return (
    <section className="border-t border-slate-200/80 bg-white py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* 板块头 */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 md:text-2xl">
              <Library className="size-6 text-sky-600" /> {zh ? "图书馆" : "Library"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {zh ? "读英文原著 · 点词查解释 · 文章朗读" : "Read real books · tap for meaning · listen aloud"}
            </p>
          </div>
          <Link
            to="/library"
            className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            {zh ? "进入图书馆" : "Open library"} <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* 年龄段筛选 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {BANDS.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setBand(b.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                band === b.key ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200",
              )}
            >
              {zh ? b.label : b.en}
            </button>
          ))}
        </div>

        {/* 书卡网格 */}
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((b) => {
            const pct = pctOf(progress.get(b.id), b.sentence_count);
            const started = pct > 0;
            const coverImg = coverImageUrl(b.cover);
            const wc = fmtWords(words.get(b.id), zh);
            return (
              <div
                key={b.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link to={`/library/${b.book_key}`} className="relative block aspect-[3/4]" style={coverStyle(b.cover)}>
                  {coverImg ? (
                    <img src={coverImg} alt={b.title} loading="lazy" className="absolute inset-0 size-full object-cover" />
                  ) : (
                    <BookOpen className="absolute right-3 top-3 size-4 text-white/50" />
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <div className="truncate text-base font-bold text-slate-800">{b.zh_title || b.title}</div>
                  {b.zh_title && b.title && (
                    <div className="truncate text-xs text-slate-400">{b.title}</div>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                    <span className={cn("rounded-full px-2 py-0.5 font-bold", BAND_BADGE[b.age_band])}>{b.age_band}</span>
                    {b.age_range && <span>{b.age_range}</span>}
                    {wc && <span>· {wc}</span>}
                  </div>
                  {started && (
                    <div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${Math.max(4, pct)}%` }} />
                      </div>
                      <div className="mt-0.5 text-[10px] tabular-nums text-slate-400">{zh ? "已读" : "read"} {pct}%</div>
                    </div>
                  )}
                  <Link
                    to={`/library/${b.book_key}`}
                    className="mt-auto inline-flex items-center justify-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-sky-600 hover:text-white"
                  >
                    {started ? (zh ? "继续阅读" : "Continue") : zh ? "开始阅读" : "Start reading"} <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
