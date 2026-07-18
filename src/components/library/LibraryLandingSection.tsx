/**
 * 首页 · 图书馆第五板块(与四个学段板块并列,放在其下)。
 * 整幅金色图书馆大厅背景(public/library-hall.jpg)+ 左侧暗化让文字可读 + 标题/简介/封面缩略 + 「进入图书馆」。
 * 整卡即入口链接 → /library。只读,不写库。正式上线开(无书自动隐藏)。
 */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Library, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { listBooks, coverImageUrl } from "@/lib/library/data";

/** 板块开关:Aaron 批准正式上线 → 开(2026-07-17)。无书时自动隐藏。?lib=0 可临时关。 */
const LIBRARY_HOME_ENABLED = true;

export default function LibraryLandingSection({ embedded = false }: { embedded?: boolean } = {}) {
  const [params] = useSearchParams();
  const enabled = params.get("lib") === "0" ? false : LIBRARY_HOME_ENABLED || params.get("lib") === "1";
  const { lang } = useI18n();
  const zh = lang === "zh" || lang === "zh-TW";
  const [covers, setCovers] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    (async () => {
      try {
        const books = await listBooks();
        if (!alive) return;
        setCovers(books.map((b) => coverImageUrl(b.cover)).filter(Boolean).slice(0, 3) as string[]);
      } catch { /* 拿不到封面不影响入口 */ }
      if (alive) setReady(true);
    })();
    return () => { alive = false; };
  }, [enabled]);

  if (!enabled) return null;

  const card = (
        <Link
          to="/library"
          aria-label={zh ? "进入图书馆" : "Enter Library"}
          className="group relative block overflow-hidden rounded-2xl shadow-[0_2px_14px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.18)]"
        >
          <img
            src="/library-hall.jpg"
            alt={zh ? "图书馆" : "Library"}
            className="h-60 w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 sm:h-64 md:h-72"
            loading="lazy"
          />
          {/* 左侧暗化,右侧留金色大厅;文字压在左侧可读 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/5" />

          <div className="absolute inset-0 flex flex-col justify-center gap-2.5 p-6 md:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Library className="size-3.5" /> {zh ? "图书馆" : "Library"}
            </span>
            <h2 className="max-w-md text-2xl font-extrabold leading-tight text-white md:text-3xl">
              {zh ? "读英文原著,点词即懂" : "Read real books, tap for meaning"}
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/85">
              {zh ? "公版名著 · 逐句点词查释义 · 语块高亮 · 朗读 · 收藏复习" : "Classic books · tap for meaning · chunks · listen · review"}
            </p>
            {ready && covers.length > 0 && (
              <div className="mt-0.5 flex gap-2">
                {covers.map((u, i) => (
                  <div key={i} className="h-16 w-12 overflow-hidden rounded-md shadow-md ring-1 ring-white/30">
                    <img src={u} alt="" className="size-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            )}
            <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow transition group-hover:gap-2.5">
              {zh ? "进入图书馆" : "Enter Library"} <ArrowRight className="size-4" />
            </span>
          </div>
        </Link>
  );
  // embedded:只出卡片本体(外层 section/居中容器由落地页的网格提供),用于响应式排序。
  if (embedded) return card;
  return (
    <section className="bg-[#f4f6f9] pb-10 md:pb-12">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">{card}</div>
    </section>
  );
}
