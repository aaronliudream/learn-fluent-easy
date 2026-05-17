import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Lock, LockOpen, BookOpen, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import {
  PRIMARY_STORY_BOOKS,
  type StoryBook } from
"@/data/primaryStoryBooks";
import { PRIMARY_STORY_BOOKS_G2 } from "@/data/primaryStoryBooksG2";
import { supabase } from "@/integrations/supabase/client";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { primaryAdventurePath, primaryReadingListPath } from "@/lib/primaryGrade";

const LEVEL_META: Record<1 | 2 | 3, {label: string;sub: string;}> = {
  1: { label: "第 1 阶段 · 简单", sub: "每页 3-4 词" },
  2: { label: "第 2 阶段 · 中等", sub: "每页 5-6 词" },
  3: { label: "第 3 阶段 · 有点难", sub: "短句子" }
};
const DIFFICULTY_LABEL = { 1: "简单", 2: "一般", 3: "有点难" } as const;

// 散落星星位置(克制装饰,不动画)
const BG_STARS = [
{ top: "8%", left: "6%", size: 14 },
{ top: "22%", left: "92%", size: 10 },
{ top: "40%", left: "4%", size: 12 },
{ top: "55%", left: "88%", size: 16 },
{ top: "70%", left: "10%", size: 10 },
{ top: "82%", left: "94%", size: 14 },
{ top: "92%", left: "20%", size: 12 }];


const LOCAL_KEY = "primary_storybook_completion_v1";
const HINT_DISMISSED_KEY = "primary_storybook_hint_dismissed_v1";
const LAST_UNLOCKED_KEY = "primary_storybook_last_unlocked_id_v1";
type CompRec = {questions_correct: number;questions_total: number;read_count: number;};
function loadLocal(): Record<string, CompRec> {
  try {return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");} catch {return {};}
}

export default function PrimaryStoryBooks() {
  const [sp] = useSearchParams();
  const isG2 = sp.get("grade") === "2";
  const DATA = isG2 ? PRIMARY_STORY_BOOKS_G2 : PRIMARY_STORY_BOOKS;
  const gradeQ = isG2 ? "?grade=2" : "";
  const shelfGrade = isG2 ? 2 : 1;
  const gradeHome = primaryAdventurePath(shelfGrade);
  const readPath = (id: string) => `/primary/storybooks/read/${id}${gradeQ}`;
  const [completed, setCompleted] = useState<Record<string, CompRec>>(() => loadLocal());
  // 锁定卡片点击时弹的 Spark 气泡(指向当前可读的那本)
  const [lockedHint, setLockedHint] = useState<{blocked: StoryBook;nextOpen: StoryBook | null;} | null>(null);
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
      const { data } = await supabase.
      from("primary_storybook_completion").
      select("book_id,questions_correct,questions_total,read_count").
      eq("user_id", userId);
      if (data) {
        const map: Record<string, CompRec> = {};
        for (const r of data as any[]) {
          map[r.book_id] = {
            questions_correct: r.questions_correct ?? 0,
            questions_total: r.questions_total ?? 0,
            read_count: r.read_count ?? 1
          };
        }
        const merged = { ...loadLocal(), ...map };
        setCompleted(merged);
        localStorage.setItem(LOCAL_KEY, JSON.stringify(merged));
      }
    })();
  }, []);

  const sorted = useMemo(
    () => [...DATA].sort((a, b) => a.sortOrder - b.sortOrder),
    [DATA]
  );
  // Only count books that belong to the current grade pool — local cache may
  // contain ids from the other grade (G1 + G2 share localStorage), which would
  // otherwise inflate totalDone past `total` (e.g. "11/10").
  const poolIds = useMemo(() => new Set(DATA.map((b) => b.id)), [DATA]);
  const completedIds = useMemo(
    () => new Set(Object.keys(completed).filter((id) => poolIds.has(id))),
    [completed, poolIds]
  );

  // 让小月在书架页就能聊"这里是哪些书 / 哪本可读 / 该挑哪本"。
  // 把整个书架的状态作为 snapshot 注入,小月就不会瞎答。
  useRegisterAssistant({
    context: "primary_storybooks_shelf",
    ref: "shelf",
    topic: "小学绘本书架(和 Spark 一起读绘本)",
    mode: "free",
    unlocked: true,
    pageTitle: "💬 小月 · 绘本书架答疑",
    starters: [
    "我现在该读哪一本？",
    "下一本怎么解锁？",
    "这些绘本有什么不一样？"],

    snapshot: {
      page: "绘本书架(/primary/reading)",
      hint: "用户当前正在浏览绘本书架。请只回答和这个书架/这些绘本相关的问题(每本书讲了什么、难度差别、推荐先读哪一本、怎么解锁下一本等)。不要回答和绘本无关的英语问题。",
      total_books: sorted.length,
      books: sorted.map((b, i) => ({
        order: i + 1,
        id: b.id,
        title_cn: b.title_cn,
        title_en: b.title_en,
        level: b.level,
        description_cn: b.description_cn,
        reading_minutes: b.reading_minutes,
        unlocked: i === 0 || completedIds.has(sorted[i - 1].id),
        completed: completedIds.has(b.id)
      }))
    }
  });

  function isUnlocked(b: StoryBook): boolean {
    const idx = sorted.findIndex((x) => x.id === b.id);
    if (idx <= 0) return true;
    return completedIds.has(sorted[idx - 1].id);
  }

  const totalDone = completedIds.size;
  const total = sorted.length;
  const nextB = sorted.find((b) => !completedIds.has(b.id)) ?? null;

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
    return ([1, 2, 3] as const).map((lv) => ({
      lv,
      meta: LEVEL_META[lv],
      items: DATA.
      filter((b) => b.level === lv).
      sort((a, b) => a.sortOrder - b.sortOrder)
    }));
  }, [DATA]);

  return (
    <main
      className="relative mx-auto min-h-screen max-w-3xl px-4 py-6 pb-24 md:px-6"
      style={{ backgroundColor: "#3a2f6b" }}>
      
      {/* 背景散落金色小星星 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {BG_STARS.map((s, i) =>
        <svg
          key={i}
          className="absolute opacity-30"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          viewBox="0 0 24 24"
          fill="#f5b400">
          
            <path d="M12 2l2.6 6.6L21.5 9l-5.2 4.5L18 21l-6-3.6L6 21l1.7-7.5L2.5 9l6.9-.4L12 2z" />
          </svg>
        )}
      </div>
      <div className="relative">
      <BackLink to={gradeHome} className="mb-3 inline-flex items-center gap-1 text-sm text-amber-100/80 hover:text-amber-50">
        <ArrowLeft className="size-4" /> <T>{isG2 ? "返回二年级冒险" : "返回小学专区"}</T>
      </BackLink>

      {/* Spark 顶卡 — 暖橘色书页色调 */}
      <section
          className="rounded-3xl p-5 text-center shadow-tile"
          style={{ backgroundColor: "#4a3d7a" }}>
          
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/70 text-5xl shadow-md">🦊</div>
        <p className="mx-auto mt-3 max-w-md text-base font-extrabold leading-snug text-amber-100">
          <T>"和 Spark 一起读</T> {total} <T>本小绘本!"</T>
        </p>
        <div className="mx-auto mt-3 flex max-w-xs items-center justify-between gap-3 text-xs font-bold text-amber-200/90">
          <span><T>已经读了</T> {totalDone} / {total}</span>
          <span><T>{nextB ? `现在 · 第 ${nextB.level} 阶段` : "全部读完 ✨"}</T></span>
        </div>
        <div className="mx-auto mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/20">
          <div className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all" style={{ width: `${totalDone / Math.max(1, total) * 100}%` }} />
        </div>
        <p className="mt-3">
          <Link
            to={primaryReadingListPath(shelfGrade)}
            className="text-xs font-bold text-amber-100 underline-offset-2 hover:text-white hover:underline">
            <T>也试试「趣味阅读」10 篇闯关 →</T>
          </Link>
        </p>
      </section>

      {/* 首次进入(0/10)时的 Spark 解锁规则提示 — 读过任意一本后自动消失 */}
      {hintVisible &&
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 animate-fade-in">
          <span className="text-base leading-none">🦊</span>
          <span className="flex-1 font-bold leading-relaxed">
            <T>"读完一本,Spark 才会带你打开下一本哦~"</T>
          </span>
          <button
            onClick={() => {setHintVisible(false);localStorage.setItem(HINT_DISMISSED_KEY, "1");}}
            className="shrink-0 rounded-full p-0.5 text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/40"
            aria-label="关闭提示">
            
            <X className="size-3.5" />
          </button>
        </div>
        }

      {/* 继续读 CTA */}
      {nextB &&
        <Link
          to={readPath(nextB.id)}
          className="mt-4 block rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5">
          
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80"><T>📖 继续读新绘本</T></div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold"><T>和 Spark 读 "</T>{nextB.title_en}"</div>
              <div className="text-xs opacity-90">
                <T>{completedIds.has(nextB.id)
                  ? `重读一遍 · 约 ${nextB.reading_minutes} 分钟`
                  : `还没读过 · 约 ${nextB.reading_minutes} 分钟`}</T>
              </div>
            </div>
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">▶</div>
          </div>
        </Link>
        }

      {/* 书架 */}
      <section className="mt-6 space-y-6">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-200/80"><T>📚 你的绘本书架</T></div>
        {grouped.map((g) =>
          <div key={g.lv}>
            <div className="mb-2 flex items-end gap-2">
              <span className="text-sm font-extrabold text-amber-100"><T>{g.meta.label}</T></span>
              <span className="text-xs font-bold text-amber-200/70">· {g.items.length} <T>本 ·</T> {g.meta.sub}</span>
            </div>
            {/* 书架样式:底部一条木色横条 + Spark 角落小头像 */}
            <div className="relative">
              <div
                className="grid gap-2 sm:gap-3"
                style={{ gridTemplateColumns: `repeat(${g.items.length}, minmax(0, 1fr))` }}>
                
                {g.items.map((b) => {
                  const unlocked = isUnlocked(b);
                  const done = completedIds.has(b.id);
                  const rec = completed[b.id];
                  const fullScore = rec && rec.questions_total > 0 && rec.questions_correct === rec.questions_total;
                  const isJustUnlocked = unlocked && !done && b.id === justUnlockedId;
                  const isCurrent = unlocked && !done && b.id === nextB?.id;
                  const card =
                  <div
                    className={`group relative aspect-[5/7] overflow-hidden rounded-xl rounded-l-sm border-l-4 border-amber-900/40 p-3 text-left transition bg-gradient-to-br ${b.bg} text-white ${
                    unlocked ?
                    `hover:-translate-y-1 ${isJustUnlocked ? "animate-scale-in ring-4 ring-amber-300" : ""}` :
                    "opacity-[0.42]"}`
                    }
                    style={
                    isCurrent ?
                    { boxShadow: "0 0 0 3px #ffd66b, 0 0 24px rgba(255,214,107,0.55), 4px 4px 0 rgba(0,0,0,0.2)" } :
                    unlocked ?
                    { boxShadow: "0 0 18px rgba(255, 214, 107, 0.35), 4px 4px 0 rgba(0,0,0,0.18)" } :
                    { boxShadow: "4px 4px 0 rgba(0,0,0,0.15)" }
                    }>
                    
                      <div className="flex items-start justify-between">
                        {!unlocked ?
                      <Lock className="size-5 text-white drop-shadow" strokeWidth={2.5} /> :
                      isJustUnlocked ?
                      <LockOpen className="size-5 animate-scale-in" strokeWidth={2.5} /> :
                      <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-sm">Lv.{b.level}</span>}
                        {done &&
                      <span
                        className="grid size-6 place-items-center rounded-full bg-white/90 text-base shadow"
                        title={fullScore ? "满分" : "已读完"}>
                        
                            ⭐
                          </span>
                      }
                      </div>
                      {/* 封面 emoji 居中放大 */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-[58%] text-center text-5xl drop-shadow-sm sm:text-6xl">
                        {b.cover_emoji}
                      </div>
                      {/* 页数 + 时长 标签(顶部居中) */}
                      <div className="absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 shadow-sm backdrop-blur-sm">
                        {b.pages.length} <T>页 ·</T> {b.reading_minutes} <T>分钟</T>
                      </div>
                      <div className="absolute inset-x-1.5 bottom-2 text-center">
                        <div
                        className="line-clamp-2 text-[15px] font-extrabold leading-tight drop-shadow-sm sm:text-[16px]"
                        style={{ fontFamily: 'Fredoka, Quicksand, "Comic Sans MS", system-ui, sans-serif' }}>
                        
                          {b.title_en}
                        </div>
                        {unlocked ?
                      <div className="line-clamp-1 text-[12px] opacity-95"><T>{b.title_cn}</T></div> :
                      <div className="line-clamp-1 text-[10px] font-bold text-white/90"><T>🔒 读完上一本解锁</T></div>}
                      </div>
                      {isJustUnlocked &&
                    <div className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-amber-700 shadow-md animate-fade-in">
                          <T>🦊 新绘本解锁啦!</T>
                        </div>
                    }
                    </div>;

                  return unlocked ?
                  <Link key={b.id} to={readPath(b.id)}>{card}</Link> :

                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setLockedHint({ blocked: b, nextOpen: nextB })}
                    className="text-left">
                    {card}</button>;

                })}
              </div>
              {/* 木色书架横条 + 木纹 + 角落 Spark */}
              <div className="relative mt-1 h-3 rounded-b-md bg-gradient-to-b from-amber-700 to-amber-900 shadow-md overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                    "repeating-linear-gradient(90deg, #000 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, transparent 0 24px, #000 24px 25px)"
                  }} />
                
              </div>
              <div className="pointer-events-none absolute -bottom-1 right-1 grid size-10 place-items-center rounded-full bg-white text-2xl shadow-md ring-2 ring-amber-300">
                🦊
              </div>
            </div>
          </div>
          )}
      </section>

      <p className="mt-8 flex items-center justify-center gap-1 text-[11px] text-amber-200/70">
        <BookOpen className="size-3" /> <T>一本一本读,下一本就会亮起来!</T>
      </p>

      {/* G1 全部读完 → 解锁 G2 入口 */}
      {!isG2 && totalDone >= sorted.length && sorted.length > 0 &&
        <Link
          to="/primary/storybooks?grade=2"
          className="mt-4 block rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-4 text-center text-white shadow-tile transition hover:-translate-y-0.5">
          
          <div className="text-base font-extrabold"><T>🎉 G1 绘本全部读完!</T></div>
          <div className="mt-1 text-xs opacity-90"><T>去解锁 G2 绘本 →</T></div>
        </Link>
        }

      {/* 书架底部 Spark 陪伴语 */}
      <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-amber-100 backdrop-blur-sm">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-xl shadow ring-2 ring-amber-300">🦊</span>
        <span><T>Spark 也在看你读书呢~ 加油!</T></span>
      </div>

      {/* 锁定卡片点击 → Spark 气泡 */}
      {lockedHint &&
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5 animate-fade-in"
          onClick={() => setLockedHint(null)}>
          
          <div
            className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-2xl dark:from-amber-950 dark:to-orange-950 animate-scale-in"
            onClick={(e) => e.stopPropagation()}>
            
            <button
              onClick={() => setLockedHint(null)}
              className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-black/5"
              aria-label="关闭">
              
              <X className="size-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white text-3xl shadow-md">🦊</div>
              <p className="pt-1 text-sm font-extrabold leading-relaxed text-orange-900 dark:text-orange-100">
                {lockedHint.nextOpen ?
                <><T>读完《</T>{lockedHint.nextOpen.title_en}<T>》就能打开《</T>{lockedHint.blocked.title_en}<T>》啦!</T></> :
                <><T>这本书还没解锁,先把前面的读完吧~</T></>}
              </p>
            </div>
            {lockedHint.nextOpen &&
            <Link
              to={readPath(lockedHint.nextOpen.id)}
              onClick={() => setLockedHint(null)}
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-3 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5">
                <T>去读《</T>
              {lockedHint.nextOpen.title_en}》 →
              </Link>
            }
          </div>
        </div>
        }
      </div>
    </main>);

}