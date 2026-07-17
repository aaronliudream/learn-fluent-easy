/**
 * 图书馆(/library/:bookKey)· 书籍详情页。
 * 封面 + 英文简介(默认)/显示中文切换 + 年龄徽章 + 完成度/时长 + 开始/继续阅读 + 章节目录。
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Play, Languages, Volume2, Square, ChevronDown, ChevronRight, Compass, RotateCcw, List, Users, BarChart3 } from "lucide-react";
import { T } from "@/i18n/T";
import { cn } from "@/lib/utils";
import { speak, speakSequence, stopSpeaking, unlockAudioSync } from "@/lib/speak";
import {
  getBookByKey,
  chapterOutline,
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

/**
 * 把导读/简介按空行切成段落块;emoji 开头的单行块识别为小标题(加粗放大)。
 * 每个块内再切句,句子带全局递增 idx —— 与逐句朗读的扁平句序对齐,高亮才准。
 */
type ProseSentence = { text: string; idx: number };
type ProseBlock = { heading: boolean; sentences: ProseSentence[] };
function parseProse(text: string): { blocks: ProseBlock[]; sentences: string[] } {
  const sentences: string[] = [];
  const blocks: ProseBlock[] = [];
  const raw = text.split(/\n\s*\n/).map((b) => b.replace(/\s+$/, "")).filter((b) => b.trim().length > 0);
  for (const rb of raw) {
    const heading = /^\p{Extended_Pictographic}/u.test(rb) && !rb.includes("\n");
    const parts = heading ? [rb.trim()] : splitIntoSentences(rb);
    const withIdx = parts.map((p) => {
      const idx = sentences.length;
      sentences.push(p);
      return { text: p, idx };
    });
    blocks.push({ heading, sentences: withIdx });
  }
  return { blocks, sentences };
}

/** 渲染导读正文:小标题加粗放大、段落留白;activeIdx 命中的句子高亮(朗读时)。 */
function ProseBody({ blocks, activeIdx }: { blocks: ProseBlock[]; activeIdx: number }) {
  return (
    <div>
      {blocks.map((b, bi) => (
        <p
          key={bi}
          className={cn(
            "first:mt-0",
            b.heading
              ? "mt-5 text-[17px] font-bold text-slate-900"
              : "mt-3 whitespace-pre-line text-[15px] leading-relaxed text-slate-700",
          )}
        >
          {b.sentences.map((s) => (
            <span
              key={s.idx}
              className={cn("rounded transition-colors", s.idx === activeIdx && "bg-amber-100 text-slate-900")}
            >
              {s.text}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}小时${m % 60}分`;
  if (m > 0) return `${m}分`;
  return `${sec}秒`;
}

// 页码:每 PAGE_SIZE 句算一"页"(阅读器是滚动式,页是展示用的估算单位)。
const PAGE_SIZE = 8;
const pageOfSeq = (seq: number) => Math.floor(Math.max(0, seq) / PAGE_SIZE) + 1;
const pagesOfCount = (n?: number) => (n && n > 0 ? Math.max(1, Math.ceil(n / PAGE_SIZE)) : 0);

/** 相对时间:上次阅读多久前(本地时间戳 ms)。 */
function relTime(ms: number): string {
  if (!ms) return "";
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

/** 蓝卡里的白色进度环(显示完成度百分比)。 */
function ProgressRing({ pct }: { pct: number }) {
  const R = 26, C = 2 * Math.PI * R, len = (Math.min(100, Math.max(0, pct)) / 100) * C;
  return (
    <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="6" />
        <circle cx="32" cy="32" r={R} fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${len} ${C - len}`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm font-bold tabular-nums text-white">{pct}%</div>
    </div>
  );
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
  const [showGuideZh, setShowGuideZh] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false); // 导读较长,默认收起(读前可选看)
  const [guidePlaying, setGuidePlaying] = useState(false);
  const [guideIdx, setGuideIdx] = useState(-1);

  // 简介英文切句(高亮 + 逐句朗读共用同一份,索引对齐)。
  const introSentences = useMemo(
    () => (book?.intro_en ? splitIntoSentences(book.intro_en) : []),
    [book?.intro_en],
  );
  const guideSentences = useMemo(
    () => (book?.guide_en ? parseProse(book.guide_en).sentences : []),
    [book?.guide_en],
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
    setGuidePlaying(false);
    setGuideIdx(-1);
    setGuideOpen(false);
    (async () => {
      const b = await getBookByKey(bookKey);
      if (!alive) return;
      setBook(b);
      if (!b) {
        setLoading(false);
        return;
      }
      const chs = chapterOutline(b); // 目录取自 chapters jsonb,0 查询(不再扫全书)
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

  // 任何朗读开始前:停掉全部朗读 + 清所有播放态(简介/导读共用同一条 TTS 管线)。
  const stopAllReading = () => {
    stopSpeaking();
    setIntroPlaying(false);
    setIntroIdx(-1);
    setGuidePlaying(false);
    setGuideIdx(-1);
  };

  // 朗读书名(短句,单次 speak)。同步进手势→iOS 解锁。
  const speakTitle = () => {
    stopAllReading();
    void speak(book.title, { accent: READ_ACCENT });
  };

  // 朗读/停止 整段英文简介。逐句播 + 当前句高亮;再点一次即停。
  const toggleIntro = () => {
    if (introPlaying) {
      stopAllReading();
      return;
    }
    if (!introSentences.length) return;
    stopAllReading();
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

  // 朗读/停止 整段英文导读(复用简介那套:逐句播 + 高亮 + 停止切换)。
  const toggleGuide = () => {
    if (guidePlaying) {
      stopAllReading();
      return;
    }
    if (!guideSentences.length) return;
    stopAllReading();
    unlockAudioSync();
    setGuidePlaying(true);
    setGuideIdx(0);
    void speakSequence(guideSentences, {
      accent: READ_ACCENT,
      onIndex: (i) => setGuideIdx(i),
    }).finally(() => {
      setGuidePlaying(false);
      setGuideIdx(-1);
    });
  };

  // 收起导读时若正在朗读 → 停掉(声音不该在看不见的区块里继续)。
  const toggleGuideOpen = () => {
    setGuideOpen((v) => {
      const next = !v;
      if (!next && guidePlaying) stopAllReading();
      return next;
    });
  };

  // 切换到中文简介/导读时,英文朗读没有可高亮的载体 → 顺手停掉。
  const toggleZh = () => {
    setShowZh((v) => {
      const next = !v;
      if (next && introPlaying) stopAllReading();
      return next;
    });
  };
  const toggleGuideZh = () => {
    setShowGuideZh((v) => {
      const next = !v;
      if (next && guidePlaying) stopAllReading();
      return next;
    });
  };

  const hasZhGuide = !!book.guide_zh;
  const guideText = showGuideZh ? book.guide_zh : book.guide_en;
  const guideBlocks = parseProse(guideText || "").blocks;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link
        to="/library"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
      >
        <ArrowLeft className="size-4" /> <T>返回书架</T>
      </Link>

      {/* 头部:大封面 + 标题/作者 + 信息 pill */}
      <div className="mt-1 flex gap-4 sm:gap-5">
        <div
          className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl shadow-md sm:w-32"
          style={coverStyle(book.cover)}
        >
          {coverImageUrl(book.cover) ? (
            <img src={coverImageUrl(book.cover)!} alt={book.title} className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="flex size-full items-end p-2.5 text-white"><BookOpen className="size-4 opacity-50" /></div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <h1 className="min-w-0 text-2xl font-extrabold leading-tight text-slate-900">{book.title}</h1>
            <button
              type="button"
              onClick={speakTitle}
              aria-label="朗读书名"
              className="mt-1 shrink-0 rounded-full p-1 text-slate-300 transition hover:bg-slate-100 hover:text-sky-600 active:scale-95"
            >
              <Volume2 className="size-4" />
            </button>
          </div>
          {book.zh_title && <p className="mt-0.5 text-sm font-medium text-slate-500">{book.zh_title}</p>}
          {book.author && <p className="mt-1.5 text-sm text-slate-500">{book.author}</p>}
          <div className="mt-3 flex flex-col items-start gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
              <Users className="size-3.5 text-slate-400" />
              {book.age_band}{book.age_range ? ` · ${book.age_range}` : ""}{total > 0 ? ` · ${total} 句` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
              <BarChart3 className="size-3.5 text-slate-400" />
              <T>完成度</T> {pct}%{state && state.seconds > 0 ? ` · 已读 ${fmtDuration(state.seconds)}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* 蓝色续读卡:进度环 + 章·页 + 继续阅读 + 进度条(已开始);未开始→蓝色开始按钮 */}
      {started ? (
        <div className="mt-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <ProgressRing pct={pct} />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/60"><T>接着上次读</T></div>
              <div className="mt-0.5 text-lg font-bold leading-tight">
                <T>第</T> {state?.chapter_idx || 1} <T>章</T> · <T>第</T> {pageOfSeq(state?.last_seq ?? 0)} <T>页</T>
              </div>
              {state && state.updated_at > 0 && (
                <div className="mt-0.5 text-xs text-white/60">{relTime(state.updated_at)}</div>
              )}
            </div>
          </div>
          <Link
            to={`/library/${book.book_key}/read`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-bold text-blue-700 shadow transition hover:bg-blue-50"
          >
            <T>继续阅读</T> <Play className="size-4 fill-current" />
          </Link>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${Math.max(2, pct)}%` }} />
          </div>
        </div>
      ) : (
        <Link
          to={`/library/${book.book_key}/read`}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-105"
        >
          <Play className="size-4 fill-current" /> <T>开始阅读</T>
        </Link>
      )}

      {/* 从头开始 + 章节目录 */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          to={`/library/${book.book_key}/read?ch=1`}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <RotateCcw className="size-4" /> <T>从头开始</T>
        </Link>
        <button
          type="button"
          onClick={() => document.getElementById("lib-chapters")?.scrollIntoView({ behavior: "smooth" })}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <List className="size-4" /> <T>章节目录</T>
        </button>
      </div>

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

      {/* 导读(读前):书名含义/双关/作者背景。默认收起、可折叠;英文默认 + 显示中文 + 朗读 */}
      {(book.guide_en || book.guide_zh) && (
        <section className="mt-4">
          <button
            type="button"
            onClick={toggleGuideOpen}
            className="flex w-full items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-2.5 text-left transition hover:bg-amber-50"
            aria-expanded={guideOpen}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-amber-800">
              <Compass className="size-4" /> <T>开读前 · 导读</T>
            </span>
            <ChevronDown
              className={cn("size-4 text-amber-500 transition-transform", guideOpen && "rotate-180")}
            />
          </button>
          {guideOpen && (
            <div className="mt-2 rounded-xl border border-slate-100 bg-white px-4 py-3">
              <div className="mb-2 flex items-center justify-end gap-2">
                {!showGuideZh && book.guide_en && guideSentences.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleGuide}
                    aria-label={guidePlaying ? "停止朗读导读" : "朗读英文导读"}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition",
                      guidePlaying
                        ? "bg-sky-100 text-sky-700"
                        : "bg-slate-100 text-slate-500 hover:text-sky-600",
                    )}
                  >
                    {guidePlaying ? (
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
                {hasZhGuide && (
                  <button
                    type="button"
                    onClick={toggleGuideZh}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition",
                      showGuideZh ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    <Languages className="size-3.5" />{" "}
                    {showGuideZh ? <T>显示英文</T> : <T>显示中文</T>}
                  </button>
                )}
              </div>
              <ProseBody blocks={guideBlocks} activeIdx={showGuideZh ? -1 : guideIdx} />
            </div>
          )}
        </section>
      )}

      {/* 章节:编号 + 标题 + 页数 + 在读徽标 + chevron(章节目录锚点) */}
      {chapters.length > 1 && (
        <section id="lib-chapters" className="mt-7 scroll-mt-4">
          <h2 className="mb-3 text-lg font-extrabold text-slate-900">
            <T>章节</T>
          </h2>
          <ol className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
            {chapters.map((c) => {
              const t = chapterTitle(book, c.idx);
              const cur = started && (state?.chapter_idx || 0) === c.idx;
              const pages = pagesOfCount(t?.count);
              return (
                <Link
                  key={c.idx}
                  to={`/library/${book.book_key}/read?ch=${c.idx}`}
                  className={cn("flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50", cur && "bg-blue-50/60")}
                >
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold", cur ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
                    {c.idx}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn("truncate text-sm font-semibold", cur ? "text-blue-700" : "text-slate-700")}>
                        {t?.title_en || `Chapter ${c.idx}`}
                      </span>
                      {cur && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700"><T>在读</T></span>
                      )}
                    </span>
                    {t?.title_zh && <span className="block truncate text-xs text-slate-400">{t.title_zh}</span>}
                  </span>
                  {pages > 0 && <span className="shrink-0 text-xs tabular-nums text-slate-400">{pages} <T>页</T></span>}
                  <ChevronRight className="size-4 shrink-0 text-slate-300" />
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
