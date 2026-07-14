/**
 * 图书馆(/library/:bookKey)· 书籍详情页。
 * 封面 + 英文简介(默认)/显示中文切换 + 年龄徽章 + 完成度/时长 + 开始/继续阅读 + 章节目录。
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Play, Languages, Volume2, Square } from "lucide-react";
import { T } from "@/i18n/T";
import { cn } from "@/lib/utils";
import { speak, speakSequence, stopSpeaking, unlockAudioSync } from "@/lib/speak";
import {
  getBookByKey,
  getChapterList,
  chapterTitle,
  currentUserId,
  coverImageUrl,
  type LibraryBook as LibraryBookT,
  type LibraryChapter,
} from "@/lib/library/data";
import { fetchProgressMap, type LibraryReadingState } from "@/lib/library/progress";

const READ_ACCENT = "US" as const; // 与阅读器一致(v1 样书统一美音)

function coverStyle(cover: { c1?: string; c2?: string }) {
  const c1 = cover.c1 || "#334155";
  const c2 = cover.c2 || "#0f172a";
  return { backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})` };
}

/**
 * 把整段简介切成句子。每个 chunk 连同其句末标点与尾随空白一起保留,
 * 拼回去 = 原文(高亮 span 不改变排版);朗读时 speak() 自会 trim。
 */
function splitIntoSentences(text: string): string[] {
  const parts = text.match(/[^.!?…]+[.!?…]*\s*/g);
  const chunks = (parts ?? [text]).filter((s) => s.trim().length > 0);
  return chunks.length ? chunks : (text.trim() ? [text] : []);
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}小时${m % 60}分`;
  if (m > 0) return `${m}分`;
  return `${sec}秒`;
}

export default function LibraryBook() {
  const { bookKey = "" } = useParams();
  const [book, setBook] = useState<LibraryBookT | null>(null);
  const [chapters, setChapters] = useState<LibraryChapter[]>([]);
  const [state, setState] = useState<LibraryReadingState | null>(null);
  const [showZh, setShowZh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [introIdx, setIntroIdx] = useState(-1); // 正在朗读的简介句(高亮用)

  // 简介英文切句(高亮 + 逐句朗读共用同一份,索引对齐)。
  const introSentences = useMemo(
    () => (book?.intro_en ? splitIntoSentences(book.intro_en) : []),
    [book?.intro_en],
  );

  // 离开详情页 / 切换书籍时停掉朗读,别让声音跟到别处。
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    stopSpeaking();
    setIntroPlaying(false);
    setIntroIdx(-1);
    (async () => {
      const b = await getBookByKey(bookKey);
      if (!alive) return;
      setBook(b);
      if (!b) {
        setLoading(false);
        return;
      }
      const chs = await getChapterList(b.id);
      if (!alive) return;
      setChapters(chs);
      setLoading(false);
      const uid = await currentUserId();
      if (!alive) return;
      const map = await fetchProgressMap(uid, [b.id]);
      if (!alive) return;
      setState(map.get(b.id) ?? null);
    })();
    return () => {
      alive = false;
    };
  }, [bookKey]);

  const total = book?.sentence_count || 0;
  const pct =
    state && state.furthest_seq >= 0 && total > 0
      ? Math.round(((state.furthest_seq + 1) / total) * 100)
      : 0;
  const started = pct > 0;

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center text-sm text-slate-400">
        <T>加载中…</T>
      </main>
    );
  }
  if (!book) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-slate-500">
          <T>没有找到这本书。</T>
        </p>
        <Link to="/library" className="mt-4 inline-block text-sm font-semibold text-sky-600">
          <T>← 返回书架</T>
        </Link>
      </main>
    );
  }

  const intro = showZh ? book.intro_zh : book.intro_en;
  const hasZhIntro = !!book.intro_zh;

  // 朗读书名(短句,单次 speak;先停掉正在播的简介)。同步进手势→iOS 解锁。
  const speakTitle = () => {
    stopSpeaking();
    setIntroPlaying(false);
    setIntroIdx(-1);
    void speak(book.title, { accent: READ_ACCENT });
  };

  // 朗读/停止 整段英文简介。逐句播 + 当前句高亮;再点一次即停。
  const toggleIntro = () => {
    if (introPlaying) {
      stopSpeaking();
      setIntroPlaying(false);
      setIntroIdx(-1);
      return;
    }
    if (!introSentences.length) return;
    unlockAudioSync(); // 手势内同步解锁 iOS 音频
    setIntroPlaying(true);
    setIntroIdx(0);
    void speakSequence(introSentences, {
      accent: READ_ACCENT,
      onIndex: (i) => setIntroIdx(i),
    }).finally(() => {
      setIntroPlaying(false);
      setIntroIdx(-1);
    });
  };

  // 切换到中文简介时,英文朗读没有可高亮的载体 → 顺手停掉。
  const toggleZh = () => {
    setShowZh((v) => {
      const next = !v;
      if (next && introPlaying) {
        stopSpeaking();
        setIntroPlaying(false);
        setIntroIdx(-1);
      }
      return next;
    });
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link
        to="/library"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
      >
        <ArrowLeft className="size-4" /> <T>返回书架</T>
      </Link>

      {/* 头部:封面 + 元信息 */}
      <div className="flex gap-4">
        <div
          className="relative flex aspect-[3/4] w-28 shrink-0 items-end overflow-hidden rounded-xl p-2.5 text-white shadow-md"
          style={coverStyle(book.cover)}
        >
          {coverImageUrl(book.cover) ? (
            <img
              src={coverImageUrl(book.cover)!}
              alt={book.title}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <BookOpen className="size-4 opacity-50" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <h1 className="min-w-0 text-xl font-bold leading-tight text-slate-900">{book.title}</h1>
            <button
              type="button"
              onClick={speakTitle}
              aria-label="朗读书名"
              className="mt-0.5 shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-sky-600 active:scale-95"
            >
              <Volume2 className="size-4" />
            </button>
          </div>
          {book.zh_title && <p className="mt-0.5 text-sm text-slate-500">{book.zh_title}</p>}
          {book.author && <p className="mt-1 text-xs text-slate-400">{book.author}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-600">
              {book.age_band}
            </span>
            {book.age_range && <span>{book.age_range}</span>}
            {total > 0 && (
              <span>
                · {total} <T>句</T>
              </span>
            )}
          </div>
          {started && (
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="tabular-nums">
                <T>完成度</T> {pct}%
              </span>
              {state && state.seconds > 0 && (
                <span className="tabular-nums">
                  <T>阅读</T> {fmtDuration(state.seconds)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 开始/继续阅读 */}
      <Link
        to={`/library/${book.book_key}/read`}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
      >
        <Play className="size-4" /> {started ? <T>继续阅读</T> : <T>开始阅读</T>}
      </Link>

      {/* 简介:英文默认 + 显示中文切换 */}
      {(book.intro_en || book.intro_zh) && (
        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-700">
                <T>简介</T>
              </h2>
              {!showZh && book.intro_en && introSentences.length > 0 && (
                <button
                  type="button"
                  onClick={toggleIntro}
                  aria-label={introPlaying ? "停止朗读简介" : "朗读英文简介"}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition",
                    introPlaying
                      ? "bg-sky-100 text-sky-700"
                      : "bg-slate-100 text-slate-500 hover:text-sky-600",
                  )}
                >
                  {introPlaying ? (
                    <>
                      <Square className="size-3 fill-current" /> <T>停止</T>
                    </>
                  ) : (
                    <>
                      <Volume2 className="size-3.5" /> <T>朗读</T>
                    </>
                  )}
                </button>
              )}
            </div>
            {hasZhIntro && (
              <button
                type="button"
                onClick={toggleZh}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition",
                  showZh ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500",
                )}
              >
                <Languages className="size-3.5" /> {showZh ? <T>显示英文</T> : <T>显示中文</T>}
              </button>
            )}
          </div>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
            {!showZh && introSentences.length > 0
              ? introSentences.map((s, i) => (
                  <span
                    key={i}
                    className={cn(
                      "rounded transition-colors",
                      i === introIdx && "bg-amber-100 text-slate-900",
                    )}
                  >
                    {s}
                  </span>
                ))
              : intro}
          </p>
        </section>
      )}

      {/* 章节目录 */}
      {chapters.length > 1 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-slate-700">
            <T>目录</T>
          </h2>
          <ol className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
            {chapters.map((c) => {
              const t = chapterTitle(book, c.idx);
              return (
                <Link
                  key={c.idx}
                  to={`/library/${book.book_key}/read?ch=${c.idx}`}
                  className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-slate-50"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                    {c.idx}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-700">
                      {t?.title_en || c.first}
                    </span>
                    {t?.title_zh && (
                      <span className="block truncate text-xs text-slate-400">{t.title_zh}</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </ol>
        </section>
      )}

      {book.copyright_note && (
        <p className="mt-8 text-[11px] leading-relaxed text-slate-300">{book.copyright_note}</p>
      )}
    </main>
  );
}
