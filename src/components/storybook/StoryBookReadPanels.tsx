import { T } from "@/i18n/T";
import type { StoryBook, StoryBookPage } from "@/data/primaryStoryBooks";
import { BigMoonStoryIllustration, hasBigMoonArt, isStoryBookImagePath } from "./BigMoonStoryArt";

export function StoryBookHeader({ book }: { book: StoryBook }) {
  if (book.cover_art && isStoryBookImagePath(book.cover_art)) {
    return (
      <div className="overflow-hidden rounded-3xl border-2 border-amber-900/20 bg-white shadow-tile">
        <div className="relative">
          <img
            src={book.cover_art}
            alt={book.title_en}
            className="h-36 w-full object-cover object-top md:h-44"
            loading="eager"
          />
          {book.ai_picture_book && (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-extrabold text-violet-700 shadow">
              Big Moon AI 绘本
            </span>
          )}
        </div>
        <div className="border-t border-amber-100 bg-amber-50/80 px-4 py-2">
          <div className="truncate text-sm font-extrabold text-amber-950">{book.title_en}</div>
          <div className="truncate text-[11px] font-bold text-amber-800">{book.title_cn}</div>
          <div className="mt-0.5 text-[10px] font-bold text-muted-foreground">
            <T>第</T> {book.level} <T>阶段 ·</T> {book.reading_minutes} <T>分钟</T>
          </div>
        </div>
      </div>
    );
  }
  if (book.cover_art && hasBigMoonArt(book.cover_art)) {
    return (
      <div className="overflow-hidden rounded-3xl border-2 border-amber-900/20 bg-white shadow-tile">
        <div className="relative">
          <BigMoonStoryIllustration id={book.cover_art} className="h-36 w-full md:h-44" />
          {book.ai_picture_book && (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-extrabold text-violet-700 shadow">
              Big Moon AI 绘本
            </span>
          )}
        </div>
        <div className="border-t border-amber-100 bg-amber-50/80 px-4 py-2">
          <div className="truncate text-sm font-extrabold text-amber-950">{book.title_en}</div>
          <div className="truncate text-[11px] font-bold text-amber-800">{book.title_cn}</div>
          <div className="mt-0.5 text-[10px] font-bold text-muted-foreground">
            <T>第</T> {book.level} <T>阶段 ·</T> {book.reading_minutes} <T>分钟</T>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`rounded-3xl bg-gradient-to-r ${book.bg} px-5 py-4 text-white shadow-tile`}>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{book.cover_emoji}</span>
        <div className="min-w-0">
          <div className="text-xs font-bold opacity-90">
            <T>第</T> {book.level} <T>阶段 ·</T> {book.reading_minutes} <T>分钟左右</T>
          </div>
          <div className="truncate text-lg font-extrabold">{book.title_en}</div>
          <div className="truncate text-[11px] font-bold opacity-90">{book.title_cn}</div>
        </div>
      </div>
    </div>
  );
}

export function StoryBookPageIllustration({ page }: { page: StoryBookPage }) {
  if (page.image && isStoryBookImagePath(page.image)) {
    return (
      <div className="mb-4 overflow-hidden rounded-2xl border-[3px] border-amber-900/30 bg-[#fffef5] shadow-inner">
        <img
          src={page.image}
          alt={page.text_en}
          className="mx-auto w-full max-h-[280px] object-contain"
          loading="lazy"
        />
      </div>
    );
  }
  if (page.illustration && hasBigMoonArt(page.illustration)) {
    return (
      <div className="mb-4 overflow-hidden rounded-2xl border-[3px] border-amber-900/30 bg-[#fffef5] shadow-inner">
        <BigMoonStoryIllustration id={page.illustration} className="w-full" />
      </div>
    );
  }
  return (
    <div className="text-[120px] leading-[0.9] md:text-[160px]" aria-hidden>
      {page.emojiParts && page.emojiParts.length > 0 ? (
        <>
          <div className="flex items-end justify-center gap-3">
            {page.emojiParts
              .filter((p) => !p.ground)
              .map((p, i) => (
                <span key={i} style={{ fontSize: `${p.scale ?? 1}em`, lineHeight: 1 }}>
                  {p.char}
                </span>
              ))}
          </div>
          {page.emojiParts.some((p) => p.ground) && (
            <div className="mt-1 flex items-center justify-center gap-2 tracking-widest">
              {page.emojiParts
                .filter((p) => p.ground)
                .map((p, i) => (
                  <span
                    key={i}
                    style={{ fontSize: `${p.scale ?? 0.4}em`, lineHeight: 1 }}
                    className="opacity-80">
                    {p.char}
                  </span>
                ))}
            </div>
          )}
        </>
      ) : (
        page.emoji.split("\n").map((line, i) => <div key={i}>{line}</div>)
      )}
    </div>
  );
}
