import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Lock, LockOpen, BookOpen, X } from "lucide-react";
import { Link } from "react-router-dom";
import BackLink from "@/components/BackLink";
import {
  PRIMARY_STORY_BOOKS,
  getBooksSorted,
  type StoryBook,
} from "@/data/primaryStoryBooks";
import { supabase } from "@/integrations/supabase/client";

const LEVEL_META: Record<1 | 2 | 3, { label: string; sub: string }> = {
  1: { label: "Level 1 · 入门", sub: "每页 3-4 词" },
  2: { label: "Level 2 · 中等", sub: "每页 5-6 词" },
  3: { label: "Level 3 · 挑战", sub: "短句子" },
};
const DIFFICULTY_LABEL = { 1: "入门", 2: "中等", 3: "挑战" } as const;

const LOCAL_KEY = "primary_storybook_completion_v1";
const HINT_DISMISSED_KEY = "primary_storybook_hint_dismissed_v1";
const LAST_UNLOCKED_KEY = "primary_storybook_last_unlocked_id_v1";
type CompRec = { questions_correct: number; questions_total: number; read_count: number };
function loadLocal(): Record<string, CompRec> {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); } catch { return {}; }
}

export default function PrimaryStoryBooks() {
  const [completed, setCompleted] = useState<Record<string, CompRec>>(() => loadLocal());
  // 锁定卡片点击时弹的 Spark 气泡(指向当前可读的那本)
  const [lockedHint, setLockedHint] = useState<{ blocked: StoryBook; nextOpen: StoryBook | null } | null>(null);
  // 上次进入书架时,"当前可读"是哪本;若与本次不同,说明刚解锁了一本 → 触发动画
  const [justUnlockedId, setJustUnlockedId] = useState<string | null>(null);
  const initialUnlockRef = useRef<string | null>(null);

  useEffect(() => {
    document.title = "和 Spark 读绘本 · 简单绘本 | FluentPath";
    initialUnlockRef.current = localStorage.getItem(LAST_UNLOCKED_KEY);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id ?? null;
      if (!userId) return;
      const { data } = await supabase
        .from("primary_storybook_completion")
        .select("book_id,questions_correct,questions_total,read_count")
        .eq("user_id", userId);
      if (data) {
        const map: Record<string, CompRec> = {};
        for (const r of data as any[]) {
          map[r.book_id] = {
            questions_correct: r.questions_correct ?? 0,
            questions_total: r.questions_total ?? 0,
            read_count: r.read_count ?? 1,
          };
        }
        const merged = { ...loadLocal(), ...map };
        setCompleted(merged);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
      }
    })();
  }, []);

  const sorted = useMemo(() => getBooksSorted(), []);
  const completedIds = useMemo(() => new Set(Object.keys(completed)), [completed]);

  function isUnlocked(b: StoryBook): boolean {
    const idx = sorted.findIndex(x => x.id === b.id);
    if (idx <= 0) return true;
    return completedIds.has(sorted[idx - 1].id);
  }

  const totalDone = completedIds.size;
  const total = sorted.length;
  const nextB = sorted.find(b => !completedIds.has(b.id)) ?? null;

  // 与上次记录对比,判断是否刚解锁了新的"当前可读"一本
  useEffect(() => {
    const currentNextId = nextB?.id ?? null;
    if (!currentNextId) return;
    const prev = initialUnlockRef.current;
    if (prev && prev !== currentNextId && totalDone > 0) {
      // 上次入口是 prev,这次变成了 currentNextId → 说明 prev 已读完,currentNextId 刚解锁
      setJustUnlockedId(currentNextId);
      const t = setTimeout(() => setJustUnlockedId(null), 3500);
      return () => clearTimeout(t);
    }
    localStorage.setItem(LAST_UNLOCKED_KEY, currentNextId);
  }, [nextB?.id, totalDone]);

  // 解锁动画结束后再写入新值,避免下次进入还重复触发
  useEffect(() => {
    if (justUnlockedId) {
      localStorage.setItem(LAST_UNLOCKED_KEY, justUnlockedId);
    }
  }, [justUnlockedId]);

  const showFirstTimeHint =
    totalDone === 0 && localStorage.getItem(HINT_DISMISSED_KEY) !== "1";
  const [hintVisible, setHintVisible] = useState(showFirstTimeHint);
  useEffect(() => {
    if (totalDone > 0) {
      setHintVisible(false);
      localStorage.setItem(HINT_DISMISSED_KEY, "1");
    }
  }, [totalDone]);

  const grouped = useMemo(() => {
    return ([1, 2, 3] as const).map(lv => ({
      lv,
      meta: LEVEL_META[lv],
      items: PRIMARY_STORY_BOOKS
        .filter(b => b.level === lv)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 pb-24 md:px-6">
      <BackLink to="/primary" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回小学专区
      </BackLink>

      {/* Spark 顶卡 — 暖橘色书页色调 */}
      <section className="rounded-3xl bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 p-5 text-center shadow-tile dark:from-amber-950/40 dark:via-orange-950/40 dark:to-rose-950/40">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/70 text-5xl shadow-md">🦊</div>
        <p className="mx-auto mt-3 max-w-md text-base font-extrabold leading-snug text-orange-900 dark:text-orange-100">
          "和 Spark 一起读 {total} 本小绘本!"
        </p>
        <div className="mx-auto mt-3 flex max-w-xs items-center justify-between gap-3 text-xs font-bold text-orange-700 dark:text-orange-200">
          <span>已读 {totalDone} / {total}</span>
          <span>{nextB ? `当前 · ${DIFFICULTY_LABEL[nextB.level]}级` : "全部读完 ✨"}</span>
        </div>
        <div className="mx-auto mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/60">
          <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all" style={{ width: `${(totalDone / Math.max(1, total)) * 100}%` }} />
        </div>
      </section>

      {/* 首次进入(0/10)时的 Spark 解锁规则提示 — 读过任意一本后自动消失 */}
      {hintVisible && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 animate-fade-in">
          <span className="text-base leading-none">🦊</span>
          <span className="flex-1 font-bold leading-relaxed">
            "读完一本,Spark 才会带你打开下一本哦~"
          </span>
          <button
            onClick={() => { setHintVisible(false); localStorage.setItem(HINT_DISMISSED_KEY, "1"); }}
            className="shrink-0 rounded-full p-0.5 text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/40"
            aria-label="关闭提示"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 继续读 CTA */}
      {nextB && (
        <Link
          to={`/primary/reading/read/${nextB.id}`}
          className="mt-4 block rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">📖 继续读新绘本</div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold">和 Spark 读 "{nextB.title_en}"</div>
              <div className="text-xs opacity-90">你已读 {totalDone}/{total} · 约 {nextB.reading_minutes} 分钟</div>
            </div>
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">▶</div>
          </div>
        </Link>
      )}

      {/* 书架 */}
      <section className="mt-6 space-y-6">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">📚 你的绘本书架</div>
        {grouped.map(g => (
          <div key={g.lv}>
            <div className="mb-2 flex items-end gap-2">
              <span className="text-sm font-extrabold">{g.meta.label}</span>
              <span className="text-xs font-bold text-muted-foreground">· {g.items.length} 本 · {g.meta.sub}</span>
            </div>
            {/* 书架样式:底部一条木色横条 */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {g.items.map(b => {
                  const unlocked = isUnlocked(b);
                  const done = completedIds.has(b.id);
                  const rec = completed[b.id];
                  const fullScore = rec && rec.questions_total > 0 && rec.questions_correct === rec.questions_total;
                  const isJustUnlocked = unlocked && !done && b.id === justUnlockedId;
                  const card = (
                    <div className={`group relative aspect-[3/4] overflow-hidden rounded-xl rounded-l-sm border-l-4 border-amber-900/40 p-3 text-left shadow-[4px_4px_0_rgba(0,0,0,0.15)] transition ${
                      unlocked
                        ? `bg-gradient-to-br ${b.bg} text-white hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,0.2)] ${isJustUnlocked ? "animate-scale-in ring-4 ring-amber-300" : ""}`
                        : "bg-muted/70 text-muted-foreground"
                    }`}>
                      <div className="flex items-start justify-between">
                        {!unlocked
                          ? <Lock className="size-5 text-amber-700/70 dark:text-amber-300/70" strokeWidth={2.5} />
                          : isJustUnlocked
                            ? <LockOpen className="size-5 animate-scale-in" strokeWidth={2.5} />
                            : <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-sm">Lv.{b.level}</span>}
                        {done && <span className="text-base">{fullScore ? "🌟" : "✓"}</span>}
                      </div>
                      <div className={`mt-2 text-center text-3xl ${unlocked ? "" : "opacity-40 grayscale"}`}>{b.cover_emoji}</div>
                      <div className="absolute inset-x-2 bottom-2">
                        <div className="line-clamp-2 text-[11px] font-extrabold leading-tight">{b.title_en}</div>
                        {unlocked
                          ? <div className="line-clamp-1 text-[10px] opacity-90">{b.title_cn}</div>
                          : <div className="line-clamp-1 text-[10px] font-bold text-amber-700/80 dark:text-amber-300/80">读完上一本解锁</div>}
                      </div>
                      {isJustUnlocked && (
                        <div className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-amber-700 shadow-md animate-fade-in">
                          🦊 新绘本解锁啦!
                        </div>
                      )}
                    </div>
                  );
                  return unlocked ? (
                    <Link key={b.id} to={`/primary/reading/read/${b.id}`}>{card}</Link>
                  ) : (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setLockedHint({ blocked: b, nextOpen: nextB })}
                      className="text-left"
                    >{card}</button>
                  );
                })}
              </div>
              {/* 木色书架横条 */}
              <div className="mt-1 h-2 rounded-b-md bg-gradient-to-b from-amber-700 to-amber-900 shadow-md" />
            </div>
          </div>
        ))}
      </section>

      <p className="mt-8 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
        <BookOpen className="size-3" /> 顺序解锁:读完一本,下一本就会亮起
      </p>

      {/* 锁定卡片点击 → Spark 气泡 */}
      {lockedHint && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5 animate-fade-in"
          onClick={() => setLockedHint(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-2xl dark:from-amber-950 dark:to-orange-950 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLockedHint(null)}
              className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-black/5"
              aria-label="关闭"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white text-3xl shadow-md">🦊</div>
              <p className="pt-1 text-sm font-extrabold leading-relaxed text-orange-900 dark:text-orange-100">
                {lockedHint.nextOpen
                  ? <>读完《{lockedHint.nextOpen.title_en}》就能打开《{lockedHint.blocked.title_en}》啦!</>
                  : <>这本书还没解锁,先把前面的读完吧~</>}
              </p>
            </div>
            {lockedHint.nextOpen && (
              <Link
                to={`/primary/reading/read/${lockedHint.nextOpen.id}`}
                onClick={() => setLockedHint(null)}
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-3 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
              >
                去读《{lockedHint.nextOpen.title_en}》 →
              </Link>
            )}
          </div>
        </div>
      )}
    </main>
  );
}