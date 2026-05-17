import { T } from "@/i18n/T";
import type { StoryBook, StoryBookCover, StoryBookPage } from "@/data/primaryStoryBooks";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { speak, stopSpeaking } from "@/lib/speak";
import { pickStoryVoice } from "@/lib/storyVoice";

/** 朗读当前页英文；优先项目 TTS（speak），失败时回退浏览器 speechSynthesis */
export function speakStoryLine(page: StoryBookPage) {
  const v = pickStoryVoice(page.speaker);
  const text = page.text_en;
  return speak(text, { voiceId: v.voiceId, speed: v.speed }).catch(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  });
}

function speakCoverLine(cover: StoryBookCover) {
  const text = cover.title_en;
  return speak(text, { speed: 0.95 }).catch(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  });
}

type Spread =
  | { kind: "cover"; cover: StoryBookCover }
  | { kind: "page"; page: StoryBookPage; pageNumber: number };

export type BarbecueCardReaderProps = {
  book: StoryBook;
  spreadIdx: number;
  onSpreadChange: (next: number) => void;
  /** 最后一页点击「完成，开始答题」— 由父组件接入测验 */
  onFinishRead: () => void;
};

export function BarbecueCardReader({
  book,
  spreadIdx,
  onSpreadChange,
  onFinishRead,
}: BarbecueCardReaderProps) {
  const spreads: Spread[] = [];
  if (book.reader_cover) {
    spreads.push({ kind: "cover", cover: book.reader_cover });
  }
  book.pages.forEach((p) => {
    spreads.push({ kind: "page", page: p, pageNumber: p.page });
  });

  const total = spreads.length;
  const current = spreads[spreadIdx];
  const isFirst = spreadIdx === 0;
  const isLast = spreadIdx === total - 1;

  const cardBg =
    current?.kind === "cover" ?
      current.cover.bg ?? "#ebe3d6"
    : current?.kind === "page" ?
      current.page.panel_bg ?? "#faf6ee"
    : "#faf6ee";

  const handleListen = () => {
    stopSpeaking();
    if (current?.kind === "cover") speakCoverLine(current.cover);
    else if (current?.kind === "page") speakStoryLine(current.page);
  };

  return (
    <section className="mt-2">
      <div
        className="overflow-hidden rounded-3xl border border-amber-200/80 shadow-lg"
        style={{ backgroundColor: cardBg }}>
        <div className="px-4 pb-3 pt-5 text-center md:px-6 md:pt-6">
          {current?.kind === "cover" ?
            <>
              {current.cover.series_badge && (
                <p className="text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 md:text-xs">
                  {current.cover.series_badge}
                </p>
              )}
              <h1
                className="mt-2 font-serif text-2xl font-extrabold leading-tight text-[#3d2914] md:text-3xl"
                style={{ fontFamily: 'Fredoka, "Comic Sans MS", Georgia, serif' }}>
                {current.cover.title_en}
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-600">{current.cover.author_line}</p>
              <button
                type="button"
                onClick={handleListen}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-[#ea580c]">
                <Volume2 className="size-4" aria-hidden />
                <T>听 Spark</T>
              </button>
            </>
          : current?.kind === "page" ?
            <>
              <h2
                className="text-xl font-extrabold leading-snug text-[#4a3728] md:text-2xl"
                style={{ fontFamily: 'Fredoka, "Comic Sans MS", system-ui, sans-serif' }}>
                {current.page.text_en}
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500 md:text-base">{current.page.text_cn}</p>
              <button
                type="button"
                onClick={handleListen}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-extrabold text-white shadow-md hover:bg-[#ea580c]">
                <Volume2 className="size-4" aria-hidden />
                <span aria-hidden>🔊</span> <T>听 Spark</T>
              </button>
            </>
          : null}
        </div>

        <div className="mt-2 px-3 pb-4 md:px-4 md:pb-5">
          <div
            className="flex min-h-[200px] w-full items-center justify-center rounded-2xl bg-white/40 md:min-h-[280px] lg:min-h-[320px]"
            style={{ maxHeight: "min(52vh, 480px)" }}>
            {current?.kind === "cover" && current.cover.image ?
              <img
                src={current.cover.image}
                alt=""
                className="max-h-[min(52vh,480px)] w-full max-w-full object-contain object-center"
                style={{ height: "auto", width: "auto", maxWidth: "100%" }}
                loading="eager"
                decoding="async"
              />
            : current?.kind === "page" && current.page.panel_image ?
              <img
                src={current.page.panel_image}
                alt=""
                className="max-h-[min(52vh,480px)] w-full max-w-full object-contain object-center"
                style={{ height: "auto", width: "auto", maxWidth: "100%" }}
                loading="lazy"
                decoding="async"
              />
            : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          disabled={isFirst}
          onClick={() => onSpreadChange(spreadIdx - 1)}
          className="inline-flex items-center gap-1 rounded-2xl border-2 border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 md:text-sm">
          <ChevronLeft className="size-4" />
          <T>上一页</T>
        </button>

        <div className="flex-1 text-center text-xs font-bold text-slate-500 md:text-sm">
          {current?.kind === "cover" ?
            <T>封面</T>
          : current?.kind === "page" ?
            <>
              <T>第</T> {current.pageNumber} / {book.pages.length} <T>页</T>
            </>
          : null}
          <span className="mx-1 text-slate-300">·</span>
          {spreadIdx + 1} / {total}
        </div>

        {!isLast ?
          <button
            type="button"
            onClick={() => onSpreadChange(spreadIdx + 1)}
            className="inline-flex items-center gap-1 rounded-2xl border-2 border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 md:text-sm">
            <T>下一页</T>
            <ChevronRight className="size-4" />
          </button>
        : (
          <button
            type="button"
            onClick={onFinishRead}
            className="inline-flex items-center gap-1 rounded-2xl bg-[#f97316] px-3 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-[#ea580c] md:px-4 md:text-sm">
            <T>完成，开始答题 →</T>
          </button>
        )}
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-[#f97316] transition-all duration-300"
          style={{ width: `${((spreadIdx + 1) / total) * 100}%` }}
        />
      </div>
    </section>
  );
}
