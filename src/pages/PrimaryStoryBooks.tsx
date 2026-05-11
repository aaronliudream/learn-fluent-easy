import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lock, BookOpen } from "lucide-react";
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
type CompRec = { questions_correct: number; questions_total: number; read_count: number };
function loadLocal(): Record<string, CompRec> {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); } catch { return {}; }
}

export default function PrimaryStoryBooks() {
  const [completed, setCompleted] = useState<Record<string, CompRec>>(() => loadLocal());

  useEffect(() => {
    document.title = "和 Spark 读绘本 · 简单绘本 | FluentPath";
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
                  const card = (
                    <div className={`group relative aspect-[3/4] overflow-hidden rounded-xl rounded-l-sm border-l-4 border-amber-900/40 p-3 text-left text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] transition ${
                      unlocked ? `bg-gradient-to-br ${b.bg} hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,0.2)]` : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}>
                      <div className="flex items-start justify-between">
                        {!unlocked ? <Lock className="size-4" /> : <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-sm">Lv.{b.level}</span>}
                        {done && <span className="text-base">{fullScore ? "🌟" : "✓"}</span>}
                      </div>
                      <div className="mt-2 text-center text-3xl">{b.cover_emoji}</div>
                      <div className="absolute inset-x-2 bottom-2">
                        <div className="line-clamp-2 text-[11px] font-extrabold leading-tight">{b.title_en}</div>
                        <div className="line-clamp-1 text-[10px] opacity-90">{b.title_cn}</div>
                      </div>
                    </div>
                  );
                  return unlocked ? (
                    <Link key={b.id} to={`/primary/reading/read/${b.id}`}>{card}</Link>
                  ) : (
                    <div key={b.id}>{card}</div>
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
    </main>
  );
}