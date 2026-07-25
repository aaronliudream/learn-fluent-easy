/**
 * 图书馆「绘本模式」渲染组件(试点 · 白名单章专用)。
 *
 * 与原阅读器**共存**:LibraryReader 只在 isPictureBookChapter(书,章) 命中时改渲染这个组件,
 * 其余章一行不变(见 lib/library/pictureBook.ts)。本组件不碰 TTS 逻辑 —— 播放全部回调给
 * LibraryReader 的 playChapterFrom/stopAll(复用现有 audio_url / 实时合成 / iOS unlockAudioSync)。
 *
 * 交互约定(与规格一一对应):
 *  · 点画面**不翻页** —— 点击留给单词收藏(TappableLine),避免误收藏;翻页只走左右箭头 + 左右滑。
 *  · 文字卡浮在图片底部内侧,卡片最高 = 图高 50%,超出卡内滚动 → 图片高度恒定不被顶开。
 *  · 图片固定 4:3,宽度撑满;加载中显示骨架,不跳版。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { TappableLine } from "@/components/TappableLine";
import { illustrationUrl, type LibraryCultureNote, type LibraryWordSense } from "@/lib/library/data";
import type { PictureBookPage } from "@/lib/library/pictureBook";
import type { LibraryFavoriteKind } from "@/lib/library/favorites";

type Mode = "en" | "both" | "cn";

export type ReadingPictureBookProps = {
  pages: PictureBookPage[];
  mode: Mode;
  /** 正在朗读的句子(章内下标)· 连播状态 —— 用于高亮 + 自动翻页 + 播放键状态。 */
  current: number;
  playingAll: boolean;
  /** 播本页:调 LibraryReader 的 playChapterFrom(start, end),读完本页停。 */
  onPlayPage: (startIdx: number, endIdx: number) => void;
  onStop: () => void;
  /** 翻到某页 → 把该页首句当阅读锚点记进度(复用 bump)。 */
  onPageEnter: (sentenceIdx: number) => void;
  /** 句子 DOM 注册回 liRefs(时长心跳的"视口可见词数"与预热观察器要用)。 */
  registerRef: (i: number, el: HTMLElement | null) => void;
  // ---- 点词/收藏透传(与原阅读器同一套,能力不缩水)----
  bookId: string;
  favTerms: Set<string>;
  chunkTerms: string[];
  cultureNotes: Map<string, LibraryCultureNote>;
  wordSenses: Map<string, LibraryWordSense>;
  reveal: boolean;
  onFavoriteChange: (term: string, kind: LibraryFavoriteKind, favorited: boolean) => void;
  /** 移动端长按揭示可点词(与原阅读器一致,可不传)。 */
  onLongPressStart?: () => void;
  onLongPressCancel?: () => void;
};

const SWIPE_MIN_X = 50; // 判定为翻页的最小水平位移
const SWIPE_MAX_Y = 40; // 竖向位移超过它按"滚动/误触"处理,不翻页

export default function ReadingPictureBook(props: ReadingPictureBookProps) {
  const {
    pages,
    mode,
    current,
    playingAll,
    onPlayPage,
    onStop,
    onPageEnter,
    registerRef,
    bookId,
    favTerms,
    chunkTerms,
    cultureNotes,
    wordSenses,
    reveal,
    onFavoriteChange,
    onLongPressStart,
    onLongPressCancel,
  } = props;

  const [page, setPage] = useState(0);
  const [imgReady, setImgReady] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const total = pages.length;
  const cur = pages[Math.min(page, Math.max(0, total - 1))];

  // 换章/换页 → 图片重新走"骨架 → 就绪",不复用上一张的状态(否则新图未到就先显旧尺寸)。
  useEffect(() => {
    setImgReady(false);
    setImgFailed(false);
  }, [cur?.image]);

  // 章切换后页数变了 → 回第一页(pages 引用变化即视为换章/换内容)。
  useEffect(() => {
    setPage(0);
  }, [pages]);

  // 连播推进到下一页的句子 → 自动翻页(「朗读本章」每页播完自动翻到下一页的实现)。
  useEffect(() => {
    if (!playingAll || current < 0) return;
    const idx = pages.findIndex((p) => current >= p.startIdx && current < p.endIdx);
    if (idx >= 0 && idx !== page) setPage(idx);
  }, [current, playingAll, pages, page]);

  // 落地某页 → 记阅读锚点(续读/完成度用)。
  useEffect(() => {
    const start = pages[page]?.startIdx;
    if (typeof start === "number") onPageEnter(start);
  }, [page, pages, onPageEnter]);

  const goto = useCallback(
    (next: number) => {
      if (next < 0 || next >= total || next === page) return;
      onStop(); // 翻页立即打断上一页音频
      setPage(next);
    },
    [total, page, onStop],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      onLongPressStart?.();
      if (e.touches.length !== 1) {
        touchRef.current = null;
        return;
      }
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    [onLongPressStart],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      onLongPressCancel?.();
      const start = touchRef.current;
      touchRef.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      // 只认清晰的左右滑;竖向为主的手势留给卡片内滚动。点击(位移≈0)天然不触发 → 不抢单词收藏。
      if (Math.abs(dx) < SWIPE_MIN_X || Math.abs(dy) > SWIPE_MAX_Y) return;
      goto(dx < 0 ? page + 1 : page - 1);
    },
    [goto, page, onLongPressCancel],
  );

  const onTouchMove = useCallback(() => onLongPressCancel?.(), [onLongPressCancel]);

  if (!cur) return null;

  const playingThisPage = playingAll && current >= cur.startIdx && current < cur.endIdx;
  const src = cur.image ? (/^https?:\/\//.test(cur.image) ? cur.image : illustrationUrl(cur.image)) : null;
  const cnJoined = cur.items.map((x) => x.s.text_cn ?? "").join("");

  return (
    <div className="mx-auto max-w-[660px]">
      {/* 画面:固定 4:3,高度只由宽度决定,不随文字长短变化 */}
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-slate-100 shadow-md shadow-slate-900/5 dark:bg-slate-800"
        style={{ aspectRatio: "4 / 3" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        onTouchCancel={onTouchMove}
      >
        {/* 骨架:图未到/加载失败时占位,布局不跳动 */}
        {(!imgReady || imgFailed || !src) && (
          <div
            className={`absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 ${
              !imgFailed && src ? "animate-pulse" : ""
            }`}
            aria-hidden
          />
        )}
        {src && !imgFailed && (
          <img
            src={src}
            alt={`第 ${cur.page} 页插图`}
            loading={cur.page === 1 ? "eager" : "lazy"}
            onLoad={() => setImgReady(true)}
            onError={() => setImgFailed(true)}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
              imgReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* 本页播放键(40px):播放中变暂停图标,点了即停 */}
        <button
          type="button"
          onClick={() => (playingThisPage ? onStop() : onPlayPage(cur.startIdx, cur.endIdx))}
          aria-label={playingThisPage ? "暂停朗读" : `朗读第 ${cur.page} 页`}
          className="absolute right-3 top-3 z-20 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-sky-600 shadow-md backdrop-blur transition hover:bg-white dark:bg-slate-900/80 dark:text-sky-300 dark:hover:bg-slate-900"
        >
          {playingThisPage ? <Pause className="size-5" /> : <Play className="size-5 translate-x-px" />}
        </button>

        {/* 文字卡:浮在图片底部内侧(左右各 10px、底 10px);最高 = 图高 50%,超出卡内滚动 */}
        <div className="absolute inset-x-[10px] bottom-[10px] z-10 max-h-[50%] overflow-y-auto overscroll-contain rounded-xl bg-[rgba(255,255,255,0.92)] px-3.5 py-3 shadow-lg shadow-slate-900/10 backdrop-blur-sm dark:bg-[rgba(15,23,42,0.92)]">
          {mode !== "cn" && (
            <p className="text-[17px] leading-[1.85] text-slate-800 dark:text-slate-100">
              {cur.items.map(({ s, i }) => (
                <span
                  key={s.id}
                  data-sidx={i}
                  ref={(el) => registerRef(i, el)}
                  className={`rounded transition ${current === i ? "bg-sky-100 dark:bg-sky-900/60" : ""}`}
                >
                  <TappableLine
                    sentence={s.text_en}
                    favorite={{ bookId, srcZh: s.text_cn ?? "" }}
                    favoritedTerms={favTerms}
                    reveal={reveal}
                    chunkPhrases={chunkTerms}
                    cultureNotes={cultureNotes}
                    wordSenses={wordSenses}
                    onFavoriteChange={onFavoriteChange}
                  />{" "}
                </span>
              ))}
            </p>
          )}
          {mode !== "en" && cnJoined && (
            <p
              className={
                mode === "cn"
                  ? "text-[16px] leading-[1.9] text-slate-800 dark:text-slate-100"
                  : "mt-1.5 text-[14px] leading-relaxed text-slate-500 dark:text-slate-300"
              }
            >
              {cnJoined}
            </p>
          )}
        </div>
      </div>

      {/* 翻页:左右箭头 + 页码圆点(点画面不翻页,避免和单词收藏抢点击) */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goto(page - 1)}
          disabled={page === 0}
          aria-label="上一页"
          className="inline-flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition enabled:hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-slate-300"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex items-center gap-2" aria-label="绘本页码">
          {pages.map((p, i) => (
            <button
              key={p.page}
              type="button"
              aria-current={i === page ? "page" : undefined}
              aria-label={`第 ${p.page} 页,共 ${total} 页`}
              onClick={() => goto(i)}
              className={`size-2.5 rounded-full transition ${
                i === page ? "scale-125 bg-sky-500" : "bg-slate-300 hover:bg-slate-400 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goto(page + 1)}
          disabled={page >= total - 1}
          aria-label="下一页"
          className="inline-flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition enabled:hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-slate-300"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
