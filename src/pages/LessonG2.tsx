import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Check, Volume2, Sparkles, Lock, ChevronDown, ChevronUp } from "lucide-react";
import BackLink from "@/components/BackLink";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { celebrateScore } from "@/lib/feedback";
import G2_LESSONS from "@/data/aiLessonsG2.json";
import {
  G2_CHAPTERS,
  type G2Chapter,
  isChapterUnlocked,
  isChapterCompleted,
  isLessonUnlocked,
  getCurrentChapter,
  getChapterByLessonId,
  lessonIdToIdx,
  pickSparkLine,
} from "@/data/g2LessonChapters";
import LessonStageEngine from "@/components/LessonStageEngine";
import { G2_ALL_LESSON_STAGES } from "@/data/g2AllLessonStages";
import { pickPhrase } from "@/data/sparkPhrases";
import SparkBubble from "@/components/SparkBubble";
import { pickGreetingByTime } from "@/data/sparkMoods";
import RocketProgress, {
  ROCKET_PARTS,
  TOTAL_LESSONS,
  detectUnlockedPart,
  nextUnlockHint,
} from "@/components/RocketProgress";
import RocketLiftoff from "@/components/RocketLiftoff";

type Expr = { en: string; cn: string; scene?: string };
type Vocab = { word: string; pron?: string; meaning?: string; example?: string; example_cn?: string };
type Grammar = { title: string; explain: string; examples?: { en: string; cn: string }[] };
type LessonContent = {
  expressions?: Expr[];
  vocab?: Vocab[];
  grammar?: Grammar[];
  quiz?: any;
  listening?: any;
  fillBlanks?: any;
  reading?: any;
  output?: any;
};

const G2_MAP = G2_LESSONS as unknown as Record<string, LessonContent>;
const G2_KEYS = Object.keys(G2_MAP);

/** "How's the weather today? · 二年级第 1 课:今天天气怎样" → { en, cn, idx } */
function parseKey(key: string) {
  const [enRaw, cnRaw] = key.split("·").map((s) => s.trim());
  const en = enRaw ?? key;
  const cn = cnRaw ?? "";
  const m = cn.match(/第\s*(\d+)/);
  const idx = m ? Number(m[1]) : 0;
  return { en, cn, idx };
}

export default function LessonG2() {
  const [params] = useSearchParams();
  const grade = Number(params.get("grade") || "2");
  const lessonKey = params.get("lesson");

  // For now this page only serves G2. If grade is not 2, send users back to /primary.
  if (grade !== 2) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="mb-3 text-muted-foreground">这个页面目前仅服务二年级课程。</p>
        <Link to="/primary" className="text-primary underline">回到主屏</Link>
      </main>
    );
  }

  return lessonKey ? <LessonView lessonKey={lessonKey} /> : <LessonList />;
}

/* ---------------- 列表 ---------------- */
const LESSON_EMOJI: Record<number, string> = {
  1: "☀️", 2: "🌧", 3: "⏰", 4: "📅", 5: "👕", 6: "🛏",
  7: "⚽", 8: "🥎", 9: "👩‍⚕️", 10: "🚌",
  11: "📞", 12: "💊", 13: "🧹", 14: "👫", 15: "🍱", 16: "🎂",
  17: "🦒", 18: "🐰", 19: "➕", 20: "🎨",
  21: "💰", 22: "🍪", 23: "🌸", 24: "🍂", 25: "👀",
  26: "🌈", 27: "😊", 28: "💯", 29: "🎄", 30: "🧧",
};

function lessonIdToKey(lessonId: string): string | null {
  const idx = lessonIdToIdx(lessonId);
  if (!idx) return null;
  for (const k of G2_KEYS) {
    if (parseKey(k).idx === idx) return k;
  }
  return null;
}

function keyToLessonId(key: string): string {
  const idx = parseKey(key).idx;
  return `g2_l${String(idx).padStart(2, "0")}`;
}

function LessonList() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const chapterDoneId = Number(params.get("chapter_done") || "0");

  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [openChapter, setOpenChapter] = useState<number | null>(null);
  const [sparkLine] = useState(() => pickSparkLine());
  const [greeting] = useState(() => pickGreetingByTime());
  const [showChapterModal, setShowChapterModal] = useState<G2Chapter | null>(null);

  const doneIds = useMemo(() => {
    const s = new Set<string>();
    doneKeys.forEach((k) => s.add(keyToLessonId(k)));
    return s;
  }, [doneKeys]);

  useEffect(() => {
    document.title = "二年级 · 和 Spark 的英语冒险 | FluentPath";
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (u?.user) {
        const { data } = await supabase
          .from("primary_lesson_completion")
          .select("lesson_key")
          .eq("user_id", u.user.id);
        const set = new Set((data ?? []).map((r: any) => r.lesson_key as string));
        setDoneKeys(set);
        const ids = new Set<string>();
        set.forEach((k) => ids.add(keyToLessonId(k)));
        setOpenChapter(getCurrentChapter(ids).id);
      } else {
        setOpenChapter(1);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!chapterDoneId) return;
    const c = G2_CHAPTERS.find((x) => x.id === chapterDoneId);
    if (c) setShowChapterModal(c);
  }, [chapterDoneId]);

  const totalDone = doneIds.size;
  const totalChapters = G2_CHAPTERS.filter((c) => isChapterCompleted(c, doneIds)).length;
  const currentChapter = getCurrentChapter(doneIds);

  function dismissModal() {
    const next = showChapterModal ? showChapterModal.id + 1 : 0;
    setShowChapterModal(null);
    if (next && next <= G2_CHAPTERS.length) setOpenChapter(next);
    nav("/lesson?grade=2", { replace: true });
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6 pb-24">
      <BackLink to="/primary/adventure/2" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回二年级
      </BackLink>

      <div className="mb-4 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 shadow-tile dark:border-amber-700 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30">
        <div className="flex items-start gap-3">
          <SparkBubble mood="default" size="lg" />
          <div className="min-w-0 flex-1">
            <div className="text-base font-extrabold">和 Spark 的英语冒险</div>
            <div className="mt-0.5 text-sm text-amber-800 dark:text-amber-200">"{greeting} {sparkLine}"</div>
            <div className="mt-3">
              <RocketProgress completedCount={totalDone} size="md" />
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60 dark:bg-amber-950/40">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${(totalDone / TOTAL_LESSONS) * 100}%` }} />
            </div>
            <div className="mt-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
              {loading ? "…" : `已集齐 ${totalDone} / ${TOTAL_LESSONS} 个齿轮 · ${nextUnlockHint(totalDone)}`}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {G2_CHAPTERS.map((ch) => {
          const unlocked = isChapterUnlocked(ch, doneIds);
          const completed = isChapterCompleted(ch, doneIds);
          const isOpen = openChapter === ch.id;
          const isCurrent = !completed && unlocked && currentChapter.id === ch.id;
          const doneInChapter = ch.lesson_ids.filter((id) => doneIds.has(id)).length;
          return (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              unlocked={unlocked}
              completed={completed}
              isCurrent={isCurrent}
              isOpen={isOpen}
              doneInChapter={doneInChapter}
              doneIds={doneIds}
              onToggle={() => setOpenChapter(isOpen ? null : ch.id)}
            />
          );
        })}
      </div>

      {showChapterModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border-4 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 text-center shadow-2xl dark:border-amber-600 dark:from-amber-950/60 dark:via-orange-950/60 dark:to-rose-950/60">
            <div className="text-6xl">🎉</div>
            <div className="mt-3 text-sm text-muted-foreground">恭喜你完成了</div>
            <div className="text-xl font-extrabold">第 {showChapterModal.id} 章 · {showChapterModal.title_cn}</div>
            <div className="mt-5 text-7xl">{showChapterModal.badge_emoji}</div>
            <div className="mt-2 text-base font-bold">「{showChapterModal.badge_name}」</div>
            {showChapterModal.id < G2_CHAPTERS.length && (
              <div className="mt-4 rounded-2xl bg-white/70 px-3 py-2 text-sm font-bold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                解锁了下一章:第 {showChapterModal.id + 1} 章 · {G2_CHAPTERS[showChapterModal.id].title_cn}
              </div>
            )}
            <button
              onClick={dismissModal}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 py-3 text-base font-extrabold text-white shadow-tile transition hover:-translate-y-0.5"
            >
              继续探险 →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function ChapterCard({
  chapter, unlocked, completed, isCurrent, isOpen, doneInChapter, doneIds, onToggle,
}: {
  chapter: G2Chapter; unlocked: boolean; completed: boolean; isCurrent: boolean;
  isOpen: boolean; doneInChapter: number; doneIds: Set<string>; onToggle: () => void;
}) {
  const headerCls = completed
    ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-700 dark:from-emerald-950/30 dark:to-teal-950/30"
    : isCurrent
    ? "border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-600 dark:from-orange-950/30 dark:to-amber-950/30"
    : unlocked
    ? "border-border bg-card"
    : "border-muted bg-muted/30 opacity-70";

  return (
    <div className={`rounded-3xl border-2 p-4 shadow-tile transition ${headerCls}`}>
      <button onClick={unlocked ? onToggle : undefined} className="flex w-full items-center gap-3 text-left">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-background">
          {completed ? "✅" : isCurrent ? "📍" : !unlocked ? "🔒" : chapter.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold text-muted-foreground">第 {chapter.id} 章</div>
            {completed && <span className="text-base">{chapter.badge_emoji}</span>}
          </div>
          <div className="truncate text-base font-extrabold">{chapter.title_cn}</div>
          <div className="truncate text-xs text-muted-foreground">
            {!unlocked ? `完成第 ${chapter.id - 1} 章解锁` : `"${chapter.narrative}" · ${doneInChapter}/${chapter.lesson_ids.length}`}
          </div>
        </div>
        {unlocked && (isOpen ? <ChevronUp className="size-5 shrink-0 text-muted-foreground" /> : <ChevronDown className="size-5 shrink-0 text-muted-foreground" />)}
        {!unlocked && <Lock className="size-5 shrink-0 text-muted-foreground" />}
      </button>

      {isOpen && unlocked && (
        <div className="mt-4">
          {chapter.lesson_ids.map((lid, i) => {
            const idx = lessonIdToIdx(lid);
            const key = lessonIdToKey(lid);
            const lessonDone = doneIds.has(lid);
            const lessonUnlocked = isLessonUnlocked(chapter, i, doneIds);
            const isActive = lessonUnlocked && !lessonDone;
            const meta = key ? parseKey(key) : { en: lid, cn: "", idx };
            const emoji = LESSON_EMOJI[idx] || "📘";

            const stationCls = lessonDone
              ? "border-emerald-400 bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
              : isActive
              ? "border-orange-500 bg-gradient-to-br from-orange-400 to-rose-500 text-white animate-pulse"
              : !lessonUnlocked
              ? "border-muted bg-muted text-muted-foreground"
              : "border-amber-300 bg-gradient-to-br from-amber-100 to-rose-100 text-amber-900 dark:border-amber-700 dark:from-amber-950/40 dark:to-rose-950/40 dark:text-amber-200";

            const inner = (
              <div className={`flex items-center gap-3 rounded-2xl border-2 p-3 shadow-sm transition ${stationCls}`}>
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/30 text-xl">
                  {lessonDone ? <Check className="size-5" /> : !lessonUnlocked ? <Lock className="size-4" /> : emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold">
                    {emoji} {meta.cn.replace(/^.*?:/, "") || meta.en}
                  </div>
                  <div className="truncate text-[11px] opacity-80">{meta.en}</div>
                </div>
                {isActive && <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-orange-600 shadow-sm">开始 →</span>}
                {lessonDone && <span className="text-sm">⭐⭐⭐</span>}
              </div>
            );

            return (
              <div key={lid}>
                {key && lessonUnlocked ? (
                  <Link to={`/lesson?grade=2&lesson=${encodeURIComponent(key)}`}>{inner}</Link>
                ) : (
                  <div className="cursor-not-allowed">{inner}</div>
                )}
                {i < chapter.lesson_ids.length - 1 && (
                  <div className="my-1 ml-[2.5rem] h-3 w-0.5 bg-amber-300/60 dark:bg-amber-700/60" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- 单课 ---------------- */
function LessonView({ lessonKey }: { lessonKey: string }) {
  const nav = useNavigate();
  const data = G2_MAP[lessonKey];
  const meta = parseKey(lessonKey);
  const [t0] = useState(Date.now());
  const [completing, setCompleting] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [celebratePhrase] = useState(() => pickPhrase("lessonComplete"));
  const [newCount, setNewCount] = useState<number>(0);
  const [unlockedPart, setUnlockedPart] = useState<typeof ROCKET_PARTS[number] | null>(null);
  const [showLiftoff, setShowLiftoff] = useState(false);

  const lessonId = `g2_l${String(meta.idx).padStart(2, "0")}`;
  const stagedLesson = G2_ALL_LESSON_STAGES[lessonId];

  useEffect(() => {
    document.title = `${meta.en} · 二年级 | FluentPath`;
  }, [meta.en]);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <BackLink to="/lesson?grade=2" className="text-sm text-primary">← 返回列表</BackLink>
        <p className="mt-3 text-muted-foreground">课程不存在</p>
      </main>
    );
  }

  // 5-stage engine path (MVP: only g2_l01)
  if (stagedLesson) {
    const ch = getChapterByLessonId(lessonId);
    const nextLessonId = ch ? ch.lesson_ids[ch.lesson_ids.indexOf(lessonId) + 1] : undefined;
    const nextLessonKey = nextLessonId ? lessonIdToKey(nextLessonId) : null;
    return (
      <>
        <LessonStageEngine
          lesson_id={lessonId}
          stages={stagedLesson}
          onExit={() => nav("/lesson?grade=2")}
          onComplete={async () => {
            setShowCelebrate(true);
            // Fire-and-forget DB write
            try { await markDone({ navigateAfter: false }); } catch { /* noop */ }
          }}
        />
        {showCelebrate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-500/95 via-rose-500/95 to-amber-500/95 p-6 text-white">
            <div className="w-full max-w-sm rounded-3xl bg-white/10 p-8 text-center backdrop-blur">
              <div className="relative h-24">
                <div className="text-7xl">🎉</div>
                {/* Gear flies up to the rocket bar at top */}
                <div
                  key={`gear-${newCount}`}
                  className="gear-fly pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 text-5xl"
                >
                  ⚙️
                </div>
              </div>
              <div className="mt-4 text-2xl font-extrabold">{celebratePhrase}</div>
              <div className="mt-2 text-sm opacity-90">
                {newCount > 0
                  ? `已集齐 ${newCount} / ${TOTAL_LESSONS} 个齿轮 · ${nextUnlockHint(newCount)}`
                  : "Spark 的火箭离起飞更近了!"}
              </div>
              {/* Live rocket strip */}
              {newCount > 0 && (
                <div className="mt-4 flex justify-center">
                  <RocketProgress
                    completedCount={newCount}
                    highlightPart={unlockedPart?.name}
                    size="md"
                  />
                </div>
              )}
              {/* Big part-unlock reveal */}
              {unlockedPart && (
                <div className="mt-5 rounded-2xl bg-white/20 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-90">解锁了新部件</div>
                  <div className="mt-1 text-7xl spark-pulse">{unlockedPart.icon}</div>
                  <div className="mt-1 text-base font-extrabold">「{unlockedPart.name}」</div>
                </div>
              )}
              <div className="mt-8 flex flex-col gap-3">
                {nextLessonKey && (
                  <button
                    onClick={() => {
                      setShowCelebrate(false);
                      nav(`/lesson?grade=2&lesson=${encodeURIComponent(nextLessonKey)}`);
                    }}
                    className="rounded-full bg-white px-6 py-3 text-base font-extrabold text-rose-600 shadow-tile"
                  >
                    继续下一节 →
                  </button>
                )}
                <button
                  onClick={() => nav("/lesson?grade=2")}
                  className="rounded-full border-2 border-white/60 px-6 py-3 text-base font-bold text-white"
                >
                  回到地图
                </button>
              </div>
            </div>
          </div>
        )}
        {showLiftoff && (
          <RocketLiftoff
            onClose={() => setShowLiftoff(false)}
            onBackToMap={() => nav("/lesson?grade=2")}
          />
        )}
      </>
    );
  }

  async function markDone(opts: { navigateAfter?: boolean } = { navigateAfter: true }) {
    setCompleting(true);
    let returnUrl = "/lesson?grade=2";
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (uid) {
        await supabase
          .from("primary_lesson_completion")
          .upsert(
            { user_id: uid, lesson_key: lessonKey, completed_at: new Date().toISOString() },
            { onConflict: "user_id,lesson_key" }
          );
        await supabase.from("learning_events").insert({
          user_id: uid,
          event_type: "lesson_complete",
          lesson_key: `g2_lesson_${lessonKey.slice(0, 80)}`,
          study_minutes: Math.max(1, Math.round((Date.now() - t0) / 60000)),
        });
        try {
          const c = await import("@/lib/coins");
          await c.awardCoins(10, "g2_lesson_complete");
          c.petReact("happy", { coins: 10 });
        } catch { /* noop */ }

        // 章节通关检测:如果本节是某章节的最后未完成节,写入章节进度并触发弹窗
        try {
          const thisLessonId = `g2_l${String(meta.idx).padStart(2, "0")}`;
          const ch = getChapterByLessonId(thisLessonId);
          if (ch) {
            const { data: doneRows } = await supabase
              .from("primary_lesson_completion")
              .select("lesson_key")
              .eq("user_id", uid);
            const doneIds = new Set<string>();
            (doneRows ?? []).forEach((r: any) => {
              const i = parseKey(r.lesson_key as string).idx;
              if (i) doneIds.add(`g2_l${String(i).padStart(2, "0")}`);
            });
            const isComplete = ch.lesson_ids.every((id) => doneIds.has(id));
            if (isComplete) {
              await supabase.from("primary_lesson_chapter_progress").upsert(
                { user_id: uid, grade: 2, chapter_id: ch.id, completed_at: new Date().toISOString() },
                { onConflict: "user_id,grade,chapter_id" }
              );
              returnUrl = `/lesson?grade=2&chapter_done=${ch.id}`;
            }
          }
        } catch { /* noop */ }
      }
      celebrateScore(100);
    } finally {
      if (opts.navigateAfter !== false) {
        setTimeout(() => nav(returnUrl), 600);
      } else {
        setCompleting(false);
      }
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6 pb-24">
      <BackLink to="/lesson?grade=2" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回 G2 课程列表
      </BackLink>

      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        G2 · 第 {meta.idx} 课
      </div>
      <h1 className="text-grad-title text-2xl font-extrabold md:text-3xl">{meta.en}</h1>
      <p className="text-sm text-muted-foreground">{meta.cn}</p>

      {/* Expressions */}
      {!!data.expressions?.length && (
        <Section title="🗣️ 今日句子" subtitle="点一下听 Spark 念">
          <div className="space-y-2">
            {data.expressions.map((e, i) => (
              <button
                key={i}
                onClick={() => speak(e.en)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-white to-violet-50 p-4 text-left shadow-tile transition hover:-translate-y-0.5 dark:border-violet-800 dark:from-violet-950/30 dark:to-fuchsia-950/30"
              >
                <div className="min-w-0">
                  <div className="text-base font-extrabold">{e.en}</div>
                  <div className="text-xs text-muted-foreground">{e.cn}</div>
                  {e.scene && <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-violet-500">· {e.scene}</div>}
                </div>
                <Volume2 className="size-5 shrink-0 text-violet-500" />
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Vocab */}
      {!!data.vocab?.length && (
        <Section title="📒 生词" subtitle="新词加音标和例句">
          <div className="grid gap-2 sm:grid-cols-2">
            {data.vocab.map((v, i) => (
              <button
                key={i}
                onClick={() => speak(v.word)}
                className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-white to-sky-50 p-4 text-left shadow-tile transition hover:-translate-y-0.5 dark:border-sky-800 dark:from-sky-950/30 dark:to-cyan-950/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black">{v.word}</span>
                  <Volume2 className="size-4 text-sky-500" />
                </div>
                {v.pron && <div className="text-xs text-muted-foreground">{v.pron}</div>}
                {v.meaning && <div className="mt-1 text-sm font-bold">{v.meaning}</div>}
                {v.example && (
                  <div className="mt-2 rounded-lg bg-sky-100/60 p-2 text-xs dark:bg-sky-950/40">
                    <div>{v.example}</div>
                    {v.example_cn && <div className="text-muted-foreground">{v.example_cn}</div>}
                  </div>
                )}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Grammar */}
      {!!data.grammar?.length && (
        <Section title="📐 语法点" subtitle="一句话讲明白">
          <div className="space-y-3">
            {data.grammar.map((g, i) => (
              <div key={i} className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50 p-4 shadow-tile dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="text-sm font-extrabold">{g.title}</div>
                <p className="mt-1 text-xs text-muted-foreground">{g.explain}</p>
                {!!g.examples?.length && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {g.examples.map((ex, k) => (
                      <li key={k} className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                        <span><span className="font-bold">{ex.en}</span> <span className="text-muted-foreground">— {ex.cn}</span></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 完成按钮 */}
      <button
        onClick={() => markDone()}
        disabled={completing}
        className="mt-8 w-full rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 py-4 text-base font-extrabold text-white shadow-tile transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {completing ? "完成中…" : "✅ 我学完啦"}
      </button>
    </main>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2">
        <h2 className="text-base font-extrabold">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}