/**
 * 图书馆精读(/library/vocab)· 我的词库 + 复习专区。
 * 顶部「今日待复习」行动条(点进复习 due 子集)+ 累计掌握成就区(只增不减)+ 最近掌握;
 * 三维筛选(状态/书/收藏日期,默认今日待复习)+ 单词/语块栏;每项带 ●●○ 掌握进度、收藏日期、「移除(误收藏)」。
 * 数据只写三处(DECISIONS.md D14):mastery_progress / library_vocab_favorites / user_mistakes。此页仅读 + 删收藏。
 */
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Volume2, Trash2, BookMarked, GraduationCap, Sparkles } from "lucide-react";
import { T } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";
import { speak, unlockAudioSync } from "@/lib/speak";
import { currentUserId, listBooks, getBookCoreCounts, type BookCore } from "@/lib/library/data";
import {
  listLibraryFavorites,
  removeLibraryFavorite,
  bjToday,
  vocabStreakOf,
  vocabIsMastered,
  vocabIsDueToday,
  vocabIsLearning,
  VOCAB_MASTER_STREAK,
  type LibraryFavorite,
  type LibraryFavoriteKind,
  type VocabStatus,
} from "@/lib/library/favorites";
import LibraryReview from "@/pages/library/LibraryReview";
import type { ReviewMode } from "@/lib/library/reviewQuestions";
import { isFunctionWord } from "@/lib/library/wordClass";
import VocabGrowthChart from "@/components/library/VocabGrowthChart";
import { getReviewStreak, effectiveStreak, type ReviewStreak } from "@/lib/library/reviewStreak";

const REVIEW_MODE_KEY = "library.reviewMode";
/** 默认模式:懂中文(zh/zh-TW)→ 中文学习者;其余一律英语母语者。localStorage 覆盖优先。 */
function initialReviewMode(lang: string): ReviewMode {
  try {
    const saved = localStorage.getItem(REVIEW_MODE_KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch { /* ignore */ }
  return lang === "zh" || lang === "zh-TW" ? "zh" : "en";
}

const TABS: { key: LibraryFavoriteKind; label: string }[] = [
  { key: "word", label: "单词" },
  { key: "chunk", label: "语块" },
];

type StatusFilter = VocabStatus | "all";
type DateFilter = "all" | "today" | "week" | "month";

/** 收藏时间(ISO)→ 北京日 YYYY-MM-DD。 */
function bjDateOf(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}
/** 本周一(北京)的 YYYY-MM-DD。 */
function bjWeekStart(): string {
  const bjNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  const dow = (bjNow.getDay() + 6) % 7; // 周一=0
  const mon = new Date(bjNow);
  mon.setDate(bjNow.getDate() - dow);
  return mon.toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}

/** 把出处句里的 term(整词、忽略大小写)高亮。 */
function highlight(sentence: string, term: string) {
  if (!sentence || !term) return sentence;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${esc})`, "ig");
  const parts = sentence.split(re);
  return parts.map((p, i) =>
    p.toLowerCase() === term.toLowerCase() ? (
      <strong key={i} className="font-bold text-sky-700">
        {p}
      </strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

/** ●●○ 掌握进度:已掌握=绿标;否则实心=streak、空心补到 3,附「再对 N 次毕业」。 */
function MasteryDots({ streak, en }: { streak: number; en: boolean }) {
  if (streak >= VOCAB_MASTER_STREAK) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
        <Sparkles className="size-3" /> {en ? "Mastered" : "已掌握"}
      </span>
    );
  }
  const filled = Math.max(0, Math.min(streak, VOCAB_MASTER_STREAK));
  const left = VOCAB_MASTER_STREAK - filled;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
      <span className="tracking-[0.15em] text-sky-500">
        {"●".repeat(filled)}
        <span className="text-slate-300">{"○".repeat(left)}</span>
      </span>
      {en ? `${left} more to graduate` : `再对 ${left} 次毕业`}
    </span>
  );
}

export default function LibraryVocab() {
  const [tab, setTab] = useState<LibraryFavoriteKind>("word");
  const [favs, setFavs] = useState<LibraryFavorite[]>([]);
  const [bookTitles, setBookTitles] = useState<Map<string, string>>(new Map());
  const [streak, setStreak] = useState<ReviewStreak | null>(null);
  const [bookCore, setBookCore] = useState<Map<string, BookCore>>(new Map());
  const [signedIn, setSignedIn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("due");
  const [bookFilter, setBookFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const { lang } = useI18n();
  const [reviewMode, setReviewMode] = useState<ReviewMode>(() => initialReviewMode(lang));
  const en = reviewMode === "en";

  const pickMode = (m: ReviewMode) => {
    setReviewMode(m);
    try { localStorage.setItem(REVIEW_MODE_KEY, m); } catch { /* ignore */ }
  };

  const reload = useCallback(async () => {
    const uid = await currentUserId();
    setSignedIn(!!uid);
    if (!uid) { setLoading(false); return; }
    const [rows, books, rs, core] = await Promise.all([
      listLibraryFavorites(),
      listBooks(),
      getReviewStreak(),
      getBookCoreCounts(),
    ]);
    setFavs(rows);
    setBookTitles(new Map(books.map((b) => [b.id, b.zh_title || b.title || b.book_key])));
    setStreak(rs);
    setBookCore(core);
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => { if (alive) await reload(); })();
    return () => { alive = false; };
  }, [reload]);

  // ---- 统计(纯前端)。虚词(the/of/because…)不可复习,从复习集/计数里剔除(它们是待清理脏数据,列表仍显示以便移除)。----
  const reviewable = useMemo(() => favs.filter((f) => !isFunctionWord(f.term, f.pos)), [favs]);
  const dueFavs = useMemo(() => reviewable.filter(vocabIsDueToday), [reviewable]);
  const stat = useMemo(() => ({
    due: dueFavs.length,
    learning: reviewable.filter(vocabIsLearning).length,
    mastered: reviewable.filter(vocabIsMastered).length,
    masteredWord: reviewable.filter((f) => f.kind === "word" && vocabIsMastered(f)).length,
    masteredChunk: reviewable.filter((f) => f.kind === "chunk" && vocabIsMastered(f)).length,
  }), [reviewable, dueFavs]);

  const recentMastered = useMemo(
    () =>
      reviewable
        .filter(vocabIsMastered)
        .sort((a, b) => (b.last_correct_date ?? "").localeCompare(a.last_correct_date ?? ""))
        .slice(0, 6),
    [favs],
  );

  const bookOptions = useMemo(() => {
    const ids = [...new Set(favs.map((f) => f.book_id).filter(Boolean) as string[])];
    return ids.map((id) => ({ id, title: bookTitles.get(id) || id }));
  }, [favs, bookTitles]);

  const counts = useMemo(
    () => ({
      word: favs.filter((f) => f.kind === "word").length,
      chunk: favs.filter((f) => f.kind === "chunk").length,
    }),
    [favs],
  );

  // ---- 列表:kind + 状态 + 书 + 日期 ----
  const weekStart = bjWeekStart();
  const monthStart = bjToday().slice(0, 7) + "-01";
  const shown = useMemo(() => {
    return favs.filter((f) => {
      if (f.kind !== tab) return false;
      if (statusFilter !== "all") {
        if (statusFilter === "due" && !vocabIsDueToday(f)) return false;
        if (statusFilter === "learning" && !vocabIsLearning(f)) return false;
        if (statusFilter === "mastered" && !vocabIsMastered(f)) return false;
      }
      if (bookFilter !== "all" && f.book_id !== bookFilter) return false;
      if (dateFilter !== "all") {
        const d = bjDateOf(f.created_at);
        if (dateFilter === "today" && d !== bjToday()) return false;
        if (dateFilter === "week" && d < weekStart) return false;
        if (dateFilter === "month" && d < monthStart) return false;
      }
      return true;
    });
  }, [favs, tab, statusFilter, bookFilter, dateFilter, weekStart, monthStart]);

  const play = (term: string) => {
    unlockAudioSync();
    speak(term, { accent: "US" });
  };

  const onRemove = async (f: LibraryFavorite) => {
    if (!window.confirm(en ? `Remove "${f.term}" from your list? (mis-saved)` : `把「${f.term}」移出词库?(误收藏)`)) return;
    setFavs((prev) => prev.filter((x) => x.id !== f.id)); // 乐观删除
    try {
      await removeLibraryFavorite(f.term, f.kind);
    } catch {
      await reload(); // 失败回滚
    }
  };

  const STATUS_TABS: { key: StatusFilter; label: string; n?: number }[] = [
    { key: "due", label: "今日待复习", n: stat.due },
    { key: "learning", label: "学习中", n: stat.learning },
    { key: "mastered", label: "已掌握", n: stat.mastered },
    { key: "all", label: "全部" },
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <Link
        to="/library"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
      >
        <ArrowLeft className="size-4" /> <T>返回书架</T>
      </Link>

      <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
        <BookMarked className="size-5 text-sky-600" /> <T>我的词库</T>
      </h1>

      {reviewing ? (
        <>
          {/* 模式切换:懂中文用中文提示型,想沉浸/英语母语用纯英文型 */}
          <div className="mx-auto mt-4 flex max-w-xs rounded-full bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => pickMode("zh")}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                reviewMode === "zh" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
              }`}
            >
              <T>中文提示</T>
            </button>
            <button
              type="button"
              onClick={() => pickMode("en")}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                reviewMode === "en" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
              }`}
            >
              English only
            </button>
          </div>
          <LibraryReview
            key={reviewMode}
            favs={dueFavs}
            poolFavs={favs}
            mode={reviewMode}
            onExit={() => { setReviewing(false); void reload(); }}
          />
        </>
      ) : loading ? (
        <p className="py-16 text-center text-sm text-slate-400"><T>加载中…</T></p>
      ) : !signedIn ? (
        <p className="py-16 text-center text-sm text-slate-500"><T>登录后才能收藏和查看词库。</T></p>
      ) : (
        <>
          {/* 今日行动条:待复习是「要做的事」,做完归零 */}
          <button
            type="button"
            disabled={stat.due === 0}
            onClick={() => setReviewing(true)}
            className={`mt-4 flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition ${
              stat.due === 0
                ? "cursor-default bg-emerald-50"
                : "bg-sky-600 text-white shadow-sm hover:bg-sky-700"
            }`}
          >
            <span className="flex items-center gap-2">
              <GraduationCap className={`size-5 ${stat.due === 0 ? "text-emerald-500" : ""}`} />
              {stat.due === 0 ? (
                <span className="font-semibold text-emerald-700"><T>今日已清零,明天再来 🎉</T></span>
              ) : (
                <span>
                  <span className="text-lg font-bold">{stat.due}</span>{" "}
                  <span className="text-sm font-semibold opacity-90"><T>个词今日待复习</T></span>
                </span>
              )}
            </span>
            {stat.due > 0 && <span className="text-sm font-semibold"><T>开始复习</T> ›</span>}
          </button>

          {/* 连续学习天数 🔥(断了当前归 0,longest 仍保留)*/}
          {(() => {
            const cur = effectiveStreak(streak);
            const longest = streak?.longest_streak ?? 0;
            if (cur === 0 && longest === 0) return null;
            return (
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-2.5 text-sm">
                <span className="text-base">🔥</span>
                {cur > 0 ? (
                  <span className="text-orange-800">
                    <T>连续学习</T> <span className="font-bold">{cur}</span> <T>天</T>
                    {longest > cur && (
                      <span className="text-orange-600/70"> · <T>最长</T> {longest} <T>天</T></span>
                    )}
                  </span>
                ) : (
                  <span className="text-orange-700/80">
                    <T>最长连续</T> <span className="font-bold">{longest}</span> <T>天 · 今天复习就能接上</T>
                  </span>
                )}
              </div>
            );
          })()}

          {/* 成就区:累计掌握(只增不减)+ 最近掌握(用词本身,不用会掉的数)*/}
          {stat.mastered > 0 && (
            <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <span className="text-base">🌕</span>
                <span>
                  <T>已掌握</T> <span className="font-bold">{stat.masteredWord}</span> <T>个单词</T>
                  {stat.masteredChunk > 0 && (
                    <> · <span className="font-bold">{stat.masteredChunk}</span> <T>个语块</T></>
                  )}
                </span>
              </div>
              {recentMastered.length > 0 && (
                <div className="mt-1.5 text-xs text-amber-700/80">
                  <T>最近掌握:</T>{" "}
                  {recentMastered.map((f, i) => (
                    <Fragment key={f.id}>
                      {i > 0 && " · "}
                      <span className="font-medium">{f.term}</span>
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 词汇成长图表:每月新掌握(绝对数·按书上色),不画增长率 */}
          <VocabGrowthChart favs={reviewable} bookTitles={bookTitles} bookCore={bookCore} bjMonth={bjToday().slice(0, 7)} en={en} />

          {/* 状态筛选(默认今日待复习)*/}
          <div className="mt-5 flex flex-wrap gap-2">
            {STATUS_TABS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatusFilter(s.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === s.key ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <T>{s.label}</T>
                {typeof s.n === "number" && <span className="ml-1 tabular-nums opacity-70">{s.n}</span>}
              </button>
            ))}
          </div>

          {/* 书 + 日期筛选 */}
          <div className="mt-2 flex flex-wrap gap-2">
            <select
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
            >
              <option value="all">{en ? "All books" : "全部书"}</option>
              {bookOptions.map((b) => (
                <option key={b.id} value={b.id}>《{b.title}》</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600"
            >
              <option value="all">{en ? "Any date" : "全部日期"}</option>
              <option value="today">{en ? "Today" : "今天"}</option>
              <option value="week">{en ? "This week" : "本周"}</option>
              <option value="month">{en ? "This month" : "本月"}</option>
            </select>
          </div>

          {/* 单词 / 语块 切换 */}
          <div className="mt-3 flex rounded-full bg-slate-100 p-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  tab === t.key ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
                }`}
              >
                <T>{t.label}</T>
                <span className="ml-1 tabular-nums text-xs text-slate-400">{counts[t.key]}</span>
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">
              {statusFilter === "due"
                ? <T>这个筛选下没有待复习的词。换个筛选,或去精读多收藏几个。</T>
                : <T>这个筛选下还没有词。</T>}
            </p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {shown.map((f) => (
                <li key={f.id} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-lg font-bold text-slate-900">{f.term}</span>
                        {f.ipa && <span className="text-sm text-slate-400">{f.ipa}</span>}
                        {f.pos && <span className="text-xs text-slate-400">{f.pos}</span>}
                      </div>
                      {f.zh && <div className="mt-0.5 text-sm text-slate-700">{f.zh}</div>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => play(f.term)}
                        aria-label="朗读"
                        className="grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-sky-50 hover:text-sky-600"
                      >
                        <Volume2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(f)}
                        aria-label={en ? "Remove (mis-saved)" : "移除(误收藏)"}
                        title={en ? "Remove (mis-saved)" : "移除(误收藏)"}
                        className="grid size-8 place-items-center rounded-full text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  {f.src_sentence && (
                    <div className="mt-2 rounded-lg bg-slate-50 p-2">
                      <div className="text-[13px] leading-relaxed text-slate-600">
                        {highlight(f.src_sentence, f.term)}
                      </div>
                      {f.src_zh && <div className="mt-0.5 text-xs text-slate-400">{f.src_zh}</div>}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <MasteryDots streak={vocabStreakOf(f)} en={en} />
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      {f.book_id && bookTitles.get(f.book_id) && (
                        <span><T>来自</T> 《{bookTitles.get(f.book_id)}》</span>
                      )}
                      <span className="tabular-nums">{bjDateOf(f.created_at)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
