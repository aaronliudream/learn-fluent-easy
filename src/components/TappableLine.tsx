import React, { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Volume2, Sparkles, Bookmark, Check, Lightbulb, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { stripTags } from "@/lib/richText";
import { T } from "@/i18n/T";
import {
  addLibraryFavorite,
  removeLibraryFavorite,
  isLibraryFavorite,
  recordRecall,
  type LibraryFavoriteKind,
} from "@/lib/library/favorites";
import { isFunctionWord } from "@/lib/library/wordClass";
import { senseNormalize, type LibraryCultureNote, type LibraryWordSense } from "@/lib/library/data";

/** 精读收藏上下文:由 LibraryReader 传入(整句 cn + book_id);美语课不传 → 不渲染收藏按钮/标记。 */
export type FavoriteCtx = { bookId: string; srcZh: string };

// 默认点读样式(美语课等):默认隐形虚线,悬停显下划线。图书馆精读走 libraryTriggerClass。
const DEFAULT_TRIGGER_CLASS =
  "cursor-pointer rounded-sm border-b border-dotted border-transparent transition hover:border-primary/60 hover:text-primary focus:border-primary focus:text-primary focus:outline-none";

/**
 * 图书馆精读点读样式:默认干净、无标记。
 *  · 语块 → 珊瑚色细虚线下划线(固定搭配)
 *  · 收藏 → 淡黄底色高亮(不改字重、不下划线),像荧光笔轻扫
 *  · 悬停(桌面)/ reveal(移动端长按)→ 淡灰底,提示"这词可点"
 * 三者可叠加(收藏的语块 = 底色 + 虚线),互不打架。
 */
function libraryTriggerClass(isChunk: boolean, isFav: boolean, reveal: boolean): string {
  const c = ["cursor-pointer rounded-[3px] transition-colors focus:outline-none"];
  if (isFav) c.push("bg-amber-100"); // 收藏高亮
  else if (reveal) c.push("bg-slate-100"); // 长按揭示可点
  else c.push("hover:bg-slate-100"); // 悬停揭示可点
  if (isChunk) c.push("underline decoration-dashed decoration-1 underline-offset-[3px] decoration-[#fb7185]"); // 珊瑚色虚线=语块
  return c.join(" ");
}

type EnCnPair = { en: string; cn: string };
type LiteralWord = { word: string; meaning_cn: string; note_cn?: string };

export type Explanation = {
  phrase: string;
  pos?: string;
  one_line_cn?: string;
  literal?: LiteralWord[];
  scene_cn?: string;
  replies?: EnCnPair[];
  similar?: EnCnPair[];
  tip_cn?: string;
  example?: EnCnPair;
  // Backwards-compat with the v1 schema (still in cache for some users):
  meaning_cn?: string;
  usage_cn?: string;
  examples?: EnCnPair[];
  synonyms?: string[];
};

/**
 * Common multi-word phrases worth highlighting/grouping when present in a
 * sentence. Order matters — longer phrases first so they match before their
 * shorter substrings.
 */
export const KNOWN_PHRASES: string[] = [
  "a side of",
  "a couple of",
  "a piece of",
  "a bit of",
  "kind of",
  "sort of",
  "would you like",
  "i'd like",
  "i would like",
  "would like",
  "looking forward to",
  "look forward to",
  "by the way",
  "as well",
  "as well as",
  "in case",
  "in fact",
  "of course",
  "for sure",
  "no problem",
  "right this way",
  "right away",
  "would you mind",
  "do you mind",
  "could you",
  "would you",
  "instead of",
  "on the side",
  "to go",
  "for here",
  "check please",
  "make sense",
  "makes sense",
  "sounds good",
  "sounds great",
  "you bet",
  "thank you",
  "thanks a lot",
  "no worries",
  "go ahead",
  "hold on",
  "hang on",
  "let me",
  "let's",
  "got it",
  "i see",
  "i guess",
  "in a minute",
  "right now",
  "right here",
  "over there",
  "all right",
  "for someone",
  "for somebody",
  "have you ever",
  "used to",
  "supposed to",
  "going to",
  "wanna",
  "gonna",
  "gotta",
];

export type Token =
  | { kind: "text"; text: string }
  | { kind: "tap"; text: string; phrase: string };

/**
 * Tokenize a sentence into a flat list of clickable spans. Each
 * single word becomes a tap target; runs of words that match a known
 * phrase are merged into a single multi-word tap target.
 */
export function tokenize(sentence: string, phrases: string[] = KNOWN_PHRASES): Token[] {
  const clean = stripTags(sentence);
  // Split into words & non-word delimiters but keep delimiters.
  const parts = clean.split(/(\s+|[.,!?;:"'()\-—…])/g).filter((p) => p !== "");
  // Build word-position list to match phrases.
  const wordIdx: number[] = [];
  parts.forEach((p, i) => {
    if (/^[A-Za-z][A-Za-z'’\-]*$/.test(p)) wordIdx.push(i);
  });
  // Mark phrase ranges (start..end inclusive in parts indices).
  const phraseRanges: Array<{ from: number; to: number; phrase: string }> = [];
  const lower = parts.map((p) => p.toLowerCase());
  // 长短语优先(词数多的先匹配),避免长语块被其子串抢先切开。
  const ordered = [...phrases].sort((a, b) => b.split(" ").length - a.split(" ").length);
  for (const phrase of ordered) {
    const words = phrase.split(" ");
    for (let wi = 0; wi <= wordIdx.length - words.length; wi++) {
      let ok = true;
      for (let k = 0; k < words.length; k++) {
        if (lower[wordIdx[wi + k]] !== words[k]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        phraseRanges.push({
          from: wordIdx[wi],
          to: wordIdx[wi + words.length - 1],
          phrase,
        });
        wi += words.length - 1;
      }
    }
  }
  // Sort by start ascending, drop overlaps (keep earlier/longer first).
  phraseRanges.sort((a, b) => a.from - b.from || b.to - a.to);
  const filtered: typeof phraseRanges = [];
  let lastTo = -1;
  for (const r of phraseRanges) {
    if (r.from > lastTo) {
      filtered.push(r);
      lastTo = r.to;
    }
  }
  // Walk parts, emit tokens.
  const out: Token[] = [];
  let i = 0;
  while (i < parts.length) {
    const range = filtered.find((r) => r.from === i);
    if (range) {
      const text = parts.slice(range.from, range.to + 1).join("");
      out.push({ kind: "tap", text, phrase: range.phrase });
      i = range.to + 1;
      continue;
    }
    const p = parts[i];
    if (/^[A-Za-z][A-Za-z'’\-]*$/.test(p)) {
      out.push({ kind: "tap", text: p, phrase: p.toLowerCase() });
    } else {
      out.push({ kind: "text", text: p });
    }
    i++;
  }
  return out;
}

function ExplainPopover({
  phrase,
  contextText,
  favorite,
  isFavorited,
  triggerClassName,
  onFavoriteChange,
  note,
  sense,
  children,
}: {
  phrase: string;
  contextText: string;
  favorite?: FavoriteCtx;
  isFavorited?: boolean; // 该词已收藏 → 触发「微提取」(先回忆后揭晓)
  triggerClassName?: string; // 图书馆传入带标记的点读样式;不传 → 用默认(美语课不变)
  onFavoriteChange?: (term: string, kind: LibraryFavoriteKind, favorited: boolean) => void;
  note?: LibraryCultureNote; // 图书馆文化笔记(稀疏):有则卡底显示「💡 标题 ›」;无则整行不出现
  sense?: LibraryWordSense; // 古今异义按书覆盖:命中则用书中义(不走边缘),卡片显两义、书中义在前
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLight, setIsLight] = useState(false); // 命中 read-v1 轻卡才为 true → 才显示收藏按钮
  const [isProper, setIsProper] = useState(false); // 专名事实卡 → 不显收藏按钮(专名不进收藏/复习)
  const [fav, setFav] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [revealed, setRevealed] = useState(false); // 微提取:是否已揭晓释义

  const favKind: LibraryFavoriteKind = phrase.includes(" ") ? "chunk" : "word";
  const microRetrieval = !!isFavorited; // 只对收藏词做「先回忆后揭晓」

  const fetchExplanation = async () => {
    if (data || loading) return;
    if (sense) {
      // 古今异义覆盖命中:不走边缘,直接用【书中义】构造 data。
      // one_line_cn=书中义 → 收藏冻结 zh=书中义、复习也测书中义;isLight → 显收藏按钮。
      setData({
        phrase,
        pos: `${sense.pos ?? ""}${sense.ipa ? `  ${sense.ipa}` : ""}`.trim(),
        one_line_cn: sense.gloss_cn,
        example: sense.example_en ? { en: sense.example_en, cn: sense.example_cn ?? "" } : undefined,
      });
      setIsLight(true);
      setIsProper(!!sense.proper); // 专名覆盖行 → 隐藏收藏(古今义覆盖行 proper=false,照常显收藏)
      if (favorite && !sense.proper) isLibraryFavorite(phrase, favKind).then(setFav).catch(() => {});
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const invoke = supabase.functions.invoke(
        "explain-phrase",
        // 图书馆点读(有收藏上下文)→ prefer:"light" 让 read-v1 轻卡优先于 zh-v2 重卡;美语课不传 → 行为不变。
        { body: { phrase, context: contextText, ...(favorite ? { prefer: "light" } : {}) } },
      );
      // 图书馆点读兜底:未预生成的词会走实时 AI 生成(大陆 5-15s / 限流失败)。
      // 3 秒超时即显"暂无解释",绝不让用户干等。后台请求仍会完成并缓存,下次点即快。美语课不加超时。
      const raced = favorite
        ? Promise.race([invoke, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000))])
        : invoke;
      const { data: resp, error: fnErr } = (await raced) as Awaited<typeof invoke>;
      if (fnErr) throw fnErr;
      if (resp?.error) throw new Error(resp.error);
      setData(resp.explanation as Explanation);
      const light = !!resp.light;
      setIsLight(light);
      setIsProper(!!resp.proper);
      // 轻卡 + 有收藏上下文(精读)→ 查一次当前收藏状态
      if (light && favorite) {
        isLibraryFavorite(phrase, favKind).then(setFav).catch(() => {});
      }
    } catch (e: any) {
      if (e?.message !== "timeout") console.warn("[explain-phrase] failed", e);
      setError(e?.message === "timeout" ? "timeout" : (e?.message || "failed"));
    } finally {
      setLoading(false);
    }
  };

  // 收藏 / 取消:出处英文原句(contextText)+ 出处中文(favorite.srcZh)一并存,作天然例句/复习语境。
  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favBusy || !data || !favorite) return;
    setFavBusy(true);
    try {
      if (fav) {
        await removeLibraryFavorite(phrase, favKind);
        setFav(false);
        onFavoriteChange?.(phrase, favKind, false);
      } else {
        const posRaw = data.pos || "";
        const ipaM = posRaw.match(/\/[^/]+\//); // 卡头 "pos  /ipa/" → 拆回 pos 与 ipa
        const ipa = ipaM ? ipaM[0] : "";
        const pos = posRaw.replace(ipa, "").trim();
        await addLibraryFavorite({
          term: phrase,
          kind: favKind,
          zh: data.one_line_cn || "",
          ipa,
          pos,
          srcSentence: contextText,
          srcZh: favorite.srcZh,
          bookId: favorite.bookId,
        });
        setFav(true);
        onFavoriteChange?.(phrase, favKind, true);
      }
    } catch (err) {
      console.warn("[library favorite] toggle failed", err);
    } finally {
      setFavBusy(false);
    }
  };

  // 微提取:用户点「想起来了/想不起来」→ 记结果 → 揭晓释义卡。
  const onRecall = (remembered: boolean) => {
    void recordRecall(phrase, favKind, remembered).catch(() => {});
    setRevealed(true);
    void fetchExplanation();
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          if (microRetrieval && !revealed) {
            // 收藏词:先回忆(不 fetch),等用户点回忆按钮再揭晓。
          } else {
            // 其余:直接揭晓出卡。置 revealed → 阅读中途收藏该词不会把卡片切回回忆提示。
            setRevealed(true);
            void fetchExplanation();
          }
        } else {
          setRevealed(false); // 关闭后下次再点重新回忆
        }
      }}
    >
      <PopoverTrigger asChild>
        <button type="button" className={triggerClassName ?? DEFAULT_TRIGGER_CLASS}>
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={6}
        className="w-[340px] max-w-[94vw] p-0"
      >
        <div className="border-b border-border bg-primary/5 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-base font-bold leading-tight text-foreground">
                {phrase}
              </div>
              {data?.pos ? (
                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {data.pos}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {/* 虚词(the/of/because…)不给收藏按钮;专名(isProper)同样不给。点开仍能看释义。 */}
              {favorite && isLight && !isProper && !isFunctionWord(phrase, (data?.pos || "").split("/")[0]) && (
                <button
                  onClick={toggleFav}
                  disabled={favBusy}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                    fav
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                  aria-label={fav ? "取消收藏" : "收藏"}
                >
                  {fav ? <Check className="size-3.5" /> : <Bookmark className="size-3.5" />}
                  {fav ? <T>已收藏</T> : <T>收藏</T>}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  speak(phrase);
                }}
                className="grid size-8 place-items-center rounded-full bg-secondary text-foreground/70 transition hover:bg-primary/15 hover:text-primary"
                aria-label="play"
              >
                <Volume2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
          {microRetrieval && !revealed ? (
            // 微提取:先回忆、后揭晓。半秒的主动回忆 > 被动看一眼。
            <div className="py-3 text-center">
              <div className="mb-3 text-sm font-medium text-foreground">
                <T>还记得这个词的意思吗?</T>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onRecall(true)}
                  className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200"
                >
                  <T>想起来了</T>
                </button>
                <button
                  type="button"
                  onClick={() => onRecall(false)}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                >
                  <T>想不起来</T>
                </button>
              </div>
            </div>
          ) : (
            <>
              {loading && (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <T>正在生成讲解…</T>
                </div>
              )}
              {error && !loading && (
                <div className="py-2 text-sm text-muted-foreground">
                  {error === "timeout" || error === "not_found" ? <T>暂无解释,请稍后再试</T> : <T>暂时讲解不出来,请稍后再试。</T>}
                </div>
              )}
              {data && !loading && <LessonBody data={data} />}
              {sense && data && !loading && <SenseOverrideExtra sense={sense} />}
              {note && <CultureNoteLine note={note} />}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Section header with emoji + label. */
function SectionHeader({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-primary">
      <span>{emoji}</span>
      <T>{label}</T>
    </div>
  );
}

/** Renders an English line with a 🔊 button + Chinese translation underneath. */
function PlayableEnCn({ en, cn }: EnCnPair) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-2">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          speak(en);
        }}
        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20"
        aria-label="play"
      >
        <Volume2 className="size-3" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{en}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{cn}</div>
      </div>
    </div>
  );
}

function LessonBody({ data }: { data: Explanation }) {
  // Normalize v1 → v2 shape so old cached entries still render nicely.
  const oneLine = data.one_line_cn || data.meaning_cn || "";
  const literal = data.literal || [];
  const scene = data.scene_cn || data.usage_cn || "";
  const replies = data.replies || [];
  const similar =
    data.similar ||
    (data.synonyms || []).map((en) => ({ en, cn: "" })).filter((x) => x.en);
  const example =
    data.example ||
    (data.examples && data.examples[0] ? data.examples[0] : undefined);
  const tip = data.tip_cn || "";

  return (
    <div className="space-y-3.5">
      {oneLine ? (
        <div className="rounded-lg bg-primary/8 p-2.5">
          <SectionHeader emoji="🧠" label="一句话解释" />
          <div className="text-sm font-medium leading-relaxed text-foreground">
            👉 {oneLine}
          </div>
        </div>
      ) : null}

      {literal.length > 0 && (
        <div>
          <SectionHeader emoji="🔍" label="逐词理解" />
          <ul className="space-y-1.5">
            {literal.map((w, i) => (
              <li key={i} className="text-sm leading-relaxed">
                <span className="font-semibold text-foreground">{w.word}</span>
                <span className="text-muted-foreground"> = </span>
                <span className="text-foreground/90">{w.meaning_cn}</span>
                {w.note_cn ? (
                  <span className="ml-1 text-xs text-destructive/90">
                    ({w.note_cn})
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {scene && (
        <div>
          <SectionHeader emoji="📍" label="典型场景" />
          <div className="text-sm leading-relaxed text-foreground/90">
            {scene}
          </div>
        </div>
      )}

      {replies.length > 0 && (
        <div>
          <SectionHeader emoji="✅" label="你可以这样说" />
          <div className="space-y-1.5">
            {replies.map((r, i) => (
              <PlayableEnCn key={i} en={r.en} cn={r.cn} />
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div>
          <SectionHeader emoji="🔁" label="同义说法" />
          <div className="space-y-1.5">
            {similar.map((r, i) =>
              r.cn ? (
                <PlayableEnCn key={i} en={r.en} cn={r.cn} />
              ) : (
                <span
                  key={i}
                  className="mr-1.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  {r.en}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {example && (
        <div>
          <SectionHeader emoji="📝" label="例句" />
          <PlayableEnCn en={example.en} cn={example.cn} />
        </div>
      )}

      {tip && (
        <div className="rounded-lg border border-amber-300/40 bg-amber-50/60 p-2.5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] font-bold text-amber-700 dark:text-amber-300">
            <Sparkles className="size-3" /> <T>高分小细节</T>
          </div>
          <div className="text-sm leading-relaxed text-foreground/90">{tip}</div>
        </div>
      )}
    </div>
  );
}

/**
 * 古今异义覆盖:书中义已作为主释义(👉 一句话解释)显示;这里补【英文书中义】+【今义】对照。
 * 读者既懂本书(18 世纪)用法,又知道这词今天啥意思,不至于用现代义把整句读反。
 */
function SenseOverrideExtra({ sense }: { sense: LibraryWordSense }) {
  return (
    <div className="mt-3 space-y-2 border-t border-border pt-2.5">
      {sense.gloss_en && (
        <div className="text-sm leading-relaxed text-foreground/90">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-primary">EN</span>
          {sense.gloss_en}
        </div>
      )}
      {(sense.modern_cn || sense.modern_en) && (
        <div className="rounded-lg border border-amber-300/40 bg-amber-50/60 p-2.5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="text-[12px] font-bold text-amber-700 dark:text-amber-300">🕰 今义</div>
          <div className="mt-0.5 text-sm leading-relaxed text-foreground/90">
            {sense.modern_cn}
            {sense.modern_en ? <span className="text-muted-foreground"> · {sense.modern_en}</span> : null}
          </div>
        </div>
      )}
      <div className="text-[11px] leading-relaxed text-muted-foreground">
        📖 上方为本书(18 世纪)用义;收藏后复习测的是这个书中义。
      </div>
    </div>
  );
}

/**
 * 图书馆文化笔记 · 卡底一行「💡 标题 ›」,默认收起;点开展开 body_zh(有 body_en 则给 EN 切换)。
 * 讲的是史实/地理/气象小知识(为什么是 cyclone 不是 tornado…),稀疏,只有挂了笔记的词才出现。
 */
function CultureNoteLine({ note }: { note: LibraryCultureNote }) {
  const [open, setOpen] = useState(false);
  const [en, setEn] = useState(false);
  const body = en && note.body_en ? note.body_en : note.body_zh;
  return (
    <div className="mt-3 border-t border-amber-200/60 pt-2.5 dark:border-amber-500/25">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 text-left text-[13px] font-semibold text-amber-700 transition hover:text-amber-800 dark:text-amber-300"
      >
        <Lightbulb className="size-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{note.title}</span>
        <ChevronRight
          className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-amber-50/70 p-2.5 dark:bg-amber-500/10">
          <div className="whitespace-pre-line text-[13px] leading-relaxed text-foreground/90">
            {body}
          </div>
          {note.body_en && (
            <button
              type="button"
              onClick={() => setEn((v) => !v)}
              className="mt-2 text-[11px] font-semibold text-amber-600 transition hover:text-amber-700 dark:text-amber-400"
            >
              {en ? "看中文" : "EN"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 图书馆阅读器专用:SF Pro 的弯撇号 U+2019(’)字形右侧留白偏大,18px 正文下画出
 * 「what’ s」这种视觉假空格(不是真字符——拖选复制出来仍是 what’s)。把每个弯撇号包一层
 * .tight-apos(负 letter-spacing 收掉那点留白),纯显示层修复:span 里装的是真的 U+2019,
 * 复制/朗读/分词都不受影响。只在图书馆模式调用,美语课不变。
 */
function renderTight(text: string): React.ReactNode {
  if (!text.includes("’")) return text;
  return text
    .split(/(’)/)
    .map((p, i) => (p === "’" ? <span key={i} className="tight-apos">{p}</span> : p));
}

/**
 * Render a sentence where each word and known phrase is tappable. On tap it
 * shows a small explanation card (meaning, usage, English examples with
 * Chinese translation, and a TTS button).
 */
export function TappableLine({
  sentence,
  favorite,
  favoritedTerms,
  reveal,
  chunkPhrases,
  cultureNotes,
  wordSenses,
  onFavoriteChange,
}: {
  sentence: string;
  /** 传入 → 图书馆精读模式:轻卡收藏按钮 + 语块虚线 + 收藏高亮 + 悬停揭示 + 微提取。
   *  不传 → 默认点读(美语课等),行为零变化。 */
  favorite?: FavoriteCtx;
  /** 已收藏词/语块的小写集合 → 高亮 + 微提取判定。仅图书馆传。 */
  favoritedTerms?: Set<string>;
  /** 移动端长按 → 揭示本页所有可点词(淡底)。仅图书馆传。 */
  reveal?: boolean;
  /** 本书本章语块(表面形式)→ 正文虚线标这些。仅图书馆传;不传 → 用通用 KNOWN_PHRASES(美语课不变)。 */
  chunkPhrases?: string[];
  /** 本书文化笔记(归一化 term → 笔记)。稀疏,仅命中的词卡底显示「💡 标题」。仅图书馆传。 */
  cultureNotes?: Map<string, LibraryCultureNote>;
  /** 本书古今异义覆盖(归一化 → 覆盖)。命中的词用书中义(不走边缘、卡片显两义)。仅图书馆传。 */
  wordSenses?: Map<string, LibraryWordSense>;
  onFavoriteChange?: (term: string, kind: LibraryFavoriteKind, favorited: boolean) => void;
}) {
  const tokens = useMemo(() => tokenize(sentence, chunkPhrases ?? KNOWN_PHRASES), [sentence, chunkPhrases]);
  const contextText = useMemo(() => stripTags(sentence), [sentence]);
  const libraryMode = !!favorite;
  return (
    <span>
      {tokens.map((tok, i) => {
        // 图书馆模式:把弯撇号包进 .tight-apos 收掉 SF Pro 的字形假空格;美语课原样。
        const rendered = libraryMode ? renderTight(tok.text) : tok.text;
        if (tok.kind === "text") return <span key={i}>{rendered}</span>;
        const isChunk = tok.phrase.includes(" ");
        const isFav = !!favoritedTerms?.has(tok.phrase);
        const note = cultureNotes?.get(tok.phrase);
        const sense = wordSenses?.get(senseNormalize(tok.phrase));
        return (
          <ExplainPopover
            key={i}
            phrase={tok.phrase}
            contextText={contextText}
            favorite={favorite}
            isFavorited={isFav}
            triggerClassName={libraryMode ? libraryTriggerClass(isChunk, isFav, !!reveal) : undefined}
            note={note}
            sense={sense}
            onFavoriteChange={onFavoriteChange}
          >
            <span>{rendered}</span>
          </ExplainPopover>
        );
      })}
    </span>
  );
}