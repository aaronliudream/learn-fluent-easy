import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Play, Settings, Sparkles, Volume2, VolumeX, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BackLink from "@/components/BackLink";
import { isSfxEnabled, setSfxEnabled } from "@/lib/soundEffects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  buildDailyAdventure,
  loadAdventureProgress,
  markStepDone,
  isAdventureComplete,
  takeCelebrationOnce,
  type AdventureStep,
} from "@/lib/dailyAdventure";
import { bondOnAdventureComplete } from "@/lib/petGrowth";
import { celebratePet } from "@/components/pet/EvolutionCelebration";
import { PHONICS_ITEMS } from "@/data/primaryPhonics";
import { SIGHT_WORD_ITEMS } from "@/data/primarySightWords";
import { PRIMARY_LISTENING_DIALOGUES } from "@/data/primaryListeningDialogues";
import { PRIMARY_ROLE_PLAYS } from "@/data/primaryRolePlays";
import { PRIMARY_ROLE_PLAYS_G2 } from "@/data/primaryRolePlaysG2";
import { PRIMARY_STORY_BOOKS } from "@/data/primaryStoryBooks";
import { PRIMARY_STORY_BOOKS_G2 } from "@/data/primaryStoryBooksG2";
import { PHONICS_ITEMS_G2 } from "@/data/primaryPhonicsG2";
import { SIGHT_WORD_ITEMS_G2 } from "@/data/primarySightWordsG2";
import { PRIMARY_LISTENING_DIALOGUES_G2 } from "@/data/primaryListeningDialoguesG2";
import G2_LESSONS from "@/data/aiLessonsG2.json";
const G2_LESSON_KEYS = Object.keys(G2_LESSONS as Record<string, unknown>);

// 月亮称号 — 强化 Big Moon English 品牌
function moonTitle(bond: number): { emoji: string; label: string } {
  if (bond <= 25) return { emoji: "🌑", label: "新月伙伴" };
  if (bond <= 50) return { emoji: "🌒", label: "银月小伙" };
  if (bond <= 75) return { emoji: "🌕", label: "满月好友" };
  return { emoji: "✨", label: "月光好朋友" };
}

type ProgressRow = { emoji: string; label: string; done: number; total: number; color: string; comingSoon?: boolean };

// Phase 2 — Daily Adventure.
// One linear flow that strings vocab → lesson → reading → culture
// with Spark narrating each step. No menus, no choice paralysis.

type Pet = { name: string; level: number; bond: number };

export default function PrimaryAdventure() {
  const nav = useNavigate();
  // Grade comes from the URL first (so "陪 Spark 出发吧" always lands on the
  // grade the kid just picked), and falls back to last-picked grade for
  // direct visits / refresh. Writing back to localStorage keeps the rest of
  // the app in sync if the kid deep-linked into a different grade.
  const { grade: gradeParam } = useParams<{ grade?: string }>();
  const grade = Number(gradeParam || localStorage.getItem("primary:lastGrade") || "1");
  useEffect(() => {
    if (gradeParam) localStorage.setItem("primary:lastGrade", String(grade));
  }, [gradeParam, grade]);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [progress, setProgress] = useState<Record<string, true>>(() => loadAdventureProgress());
  const [loading, setLoading] = useState(true);
  const [myProgress, setMyProgress] = useState<ProgressRow[] | null>(null);
  const [swMasteredCount, setSwMasteredCount] = useState(0);
  // 用今天的日期做 memo key,避免页面跨午夜后还显示昨天的轮换步骤
  const todayKey = new Date().toDateString();

  useEffect(() => {
    document.title = "今天的冒险 · 陪 Spark 出发 | FluentPath";
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id ?? null;
      // Today's first incomplete lesson for this grade
      const { data: lessons } = await supabase
        .from("primary_lessons")
        .select("id,sort_order,unit:primary_units!inner(grade,sort_order),progress:primary_lesson_progress(completed_at)")
        .eq("unit.grade", grade)
        .order("sort_order");
      const nextLesson =
        (lessons ?? []).find((l: any) => !l.progress?.[0]?.completed_at) ??
        (lessons ?? [])[0];
      setNextLessonId(nextLesson?.id ?? null);

      if (uid) {
        const { data: p } = await supabase.from("pet_state").select("name,level,bond").eq("user_id", uid).maybeSingle();
        if (p) setPet(p as Pet);

        // 按 grade 切换数据池;mastery 用 level >= 2 口径,completion 用 row 存在即算
        const isG2 = grade === 2;
        const phonicsItems = isG2 ? PHONICS_ITEMS_G2 : PHONICS_ITEMS;
        const swItems      = isG2 ? SIGHT_WORD_ITEMS_G2 : SIGHT_WORD_ITEMS;
        const lsItems      = isG2 ? PRIMARY_LISTENING_DIALOGUES_G2 : PRIMARY_LISTENING_DIALOGUES;
        const rpItems      = isG2 ? PRIMARY_ROLE_PLAYS_G2 : PRIMARY_ROLE_PLAYS;
        const sbItems      = isG2 ? PRIMARY_STORY_BOOKS_G2 : PRIMARY_STORY_BOOKS;

        const [phRows, swRows, lsRows, rpRows, sbRows] = await Promise.all([
          supabase.from("primary_phonics_mastery").select("phonics_id,mastery_level").eq("user_id", uid),
          supabase.from("primary_sight_word_mastery").select("word_id,mastery_level").eq("user_id", uid),
          supabase.from("primary_listening_completion").select("dialogue_id").eq("user_id", uid),
          supabase.from("primary_roleplay_completion").select("roleplay_id").eq("user_id", uid),
          supabase.from("primary_storybook_completion").select("book_id").eq("user_id", uid),
        ]);

        const phMastered = new Set(
          (phRows.data ?? []).filter((r: any) => (r.mastery_level ?? 0) >= 2).map((r: any) => r.phonics_id)
        );
        const swMastered = new Set(
          (swRows.data ?? []).filter((r: any) => (r.mastery_level ?? 0) >= 2).map((r: any) => r.word_id)
        );
        // 单词游戏冷启动门控:用 mastery_level >= 1 即视为「掌握」(更宽松,鼓励解锁)
        const swReady = new Set(
          (swRows.data ?? []).filter((r: any) => (r.mastery_level ?? 0) >= 1).map((r: any) => r.word_id)
        );
        setSwMasteredCount(swItems.filter((it) => swReady.has(it.id)).length);
        const lsDone = new Set((lsRows.data ?? []).map((r: any) => r.dialogue_id));
        const rpDone = new Set((rpRows.data ?? []).map((r: any) => r.roleplay_id));
        const sbDone = new Set((sbRows.data ?? []).map((r: any) => r.book_id));

        const countIn = (set: Set<string>, items: { id: string }[]) =>
          items.filter((it) => set.has(it.id)).length;

        // G2: also pull AI lesson completions (30 节,只在 G2 显示)
        let g2LessonDone = 0;
        if (isG2) {
          const { data: lessonRows } = await supabase
            .from("primary_lesson_completion")
            .select("lesson_key")
            .eq("user_id", uid);
          const doneKeys = new Set((lessonRows ?? []).map((r: any) => r.lesson_key as string));
          g2LessonDone = G2_LESSON_KEYS.filter((k) => doneKeys.has(k)).length;
        }

        const baseRows: ProgressRow[] = [
          { emoji: "🔤", label: "字母拼读", done: countIn(phMastered, phonicsItems), total: phonicsItems.length, color: "from-sky-400 to-indigo-400" },
          { emoji: "🟣", label: "常见小词", done: countIn(swMastered, swItems),     total: swItems.length,     color: "from-violet-400 to-fuchsia-400" },
          { emoji: "🎧", label: "听一听",   done: countIn(lsDone, lsItems),         total: lsItems.length,     color: "from-amber-400 to-orange-400" },
          { emoji: "📚", label: "读绘本",   done: countIn(sbDone, sbItems), total: sbItems.length,  color: "from-emerald-400 to-teal-400" },
          { emoji: "🎭", label: "演故事",   done: countIn(rpDone, rpItems), total: rpItems.length,  color: "from-rose-400 to-pink-400" },
        ];
        if (isG2) {
          baseRows.push({
            emoji: "📝", label: "一节课", done: g2LessonDone, total: G2_LESSON_KEYS.length,
            color: "from-indigo-400 to-purple-400",
          });
        }
        setMyProgress(baseRows);
      }
      setLoading(false);
    })();
  }, [grade]);

  const steps: AdventureStep[] = useMemo(
    () => buildDailyAdventure({ grade, nextLessonId, sightWordsMasteredCount: swMasteredCount }),
    [grade, nextLessonId, swMasteredCount, todayKey]
  );

  const doneCount = steps.filter((s) => progress[s.kind]).length;
  const allDone = steps.length > 0 && isAdventureComplete(steps);

  function refreshProgress() {
    setProgress(loadAdventureProgress());
  }

  function go(step: AdventureStep) {
    nav(step.to);
  }

  function confirmStep(step: AdventureStep) {
    markStepDone(step.kind);
    refreshProgress();
  }

  // When the page becomes visible again (returning from a sub-activity),
  // re-read progress so manually-confirmed steps reflect immediately.
  useEffect(() => {
    const onFocus = () => refreshProgress();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  function finishAdventure() {
    if (!allDone) return;
    if (takeCelebrationOnce()) {
      bondOnAdventureComplete();
      celebratePet({
        kind: "levelup",
        emoji: "🦊",
        title: "今天的冒险完成啦!",
        subtitle: `Spark +30 亲密度 · 经验 +100`,
      });
    }
    setTimeout(() => nav("/primary"), 2400);
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6 pb-24">
      <BackLink to="/primary" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 回到主屏
      </BackLink>

      {/* G2 — Phonics 已开放,其他模块还在准备 */}
      {grade === 2 && (
        <div className="mb-3 space-y-2 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 dark:text-emerald-200">
          <div className="font-extrabold">✨ 二年级已开放 6 个模块(全部完成!):</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>📖 Phonics(25 个新音)</span>
            <Link to="/primary/phonics?grade=2" className="font-bold underline">去 G2 Phonics →</Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>🟣 Sight Words(100 个新词)</span>
            <Link to="/primary/sight-words?grade=2" className="font-bold underline">去 G2 高频词 →</Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>🎧 Listening(20 个新对话)</span>
            <Link to="/primary/listening?grade=2" className="font-bold underline">去 G2 听力 →</Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>🎭 Roleplay(15 个新场景)</span>
            <Link to="/primary/roleplays?grade=2" className="font-bold underline">去 G2 角色扮演 →</Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>📚 Reading(10 本新绘本)</span>
            <Link to="/primary/reading?grade=2" className="font-bold underline">去 G2 绘本 →</Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>📝 Lesson(30 节新课程)</span>
            <Link to="/lesson?grade=2" className="font-bold underline">去 G2 课程 →</Link>
          </div>
          <div className="text-xs opacity-80">🎉 二年级全部就绪!</div>
        </div>
      )}
      {/* G3-G6 内容尚未补齐 */}
      {grade > 2 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <span>✨ 这个年级的完整内容正在准备中。你可以先在一年级和 Spark 一起冒险!</span>
          <Link to="/primary/adventure/1" className="font-bold underline">返回一年级 →</Link>
        </div>
      )}

      {/* Spark 顶栏 + 进度条 */}
      <section className="rounded-3xl bg-gradient-to-br from-pink-200 via-rose-200 to-amber-200 p-5 text-center shadow-tile dark:from-pink-950/40 dark:via-rose-950/40 dark:to-amber-950/40">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/70 text-5xl shadow-md">🦊</div>
        <p className="mx-auto mt-3 max-w-md text-base font-extrabold leading-snug text-rose-900 dark:text-rose-100">
          {allDone
            ? '"我们今天一起做了好多事!"'
            : doneCount === 0
              ? '"我准备好啦,我们出发吧!"'
              : `"已经做了 ${doneCount} 件啦,再陪 Spark 一下吧!"`}
        </p>
        <div className="mx-auto mt-4 max-w-xs">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-200">
            <span>今天的冒险</span>
            <span>{doneCount}/{steps.length}</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 transition-all"
              style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      </section>

      {/* 我的进度 — 5 个主路径模块 */}
      {myProgress && (
        <section className="mt-4 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <span className="text-sm">📊</span>
            <span>你的进度</span>
          </div>
          <ul className="space-y-1.5">
            {myProgress.map((r) => {
              const pct = r.total > 0 ? Math.min(100, (r.done / r.total) * 100) : 0;
              return (
                <li key={r.label} className="flex h-7 items-center gap-2 text-[12px]">
                  <span className="w-4 text-center">{r.emoji}</span>
                  <span className="w-16 shrink-0 font-bold">{r.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full bg-gradient-to-r ${r.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right tabular-nums font-bold text-muted-foreground">
                    {r.comingSoon ? "📦 准备中" : `${r.done} / ${r.total}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 快捷探索工具栏 — 自由学习入口,不参与每日 4 步 */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground">
            想玩什么?
          </h2>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {(() => { const gradeQ = grade === 2 ? "?grade=2" : ""; return [
            { to: "/primary/phonics",    emoji: "🔤", label: "读字母", grad: "from-sky-400 to-indigo-400" },
            { to: "/primary/sight-words",emoji: "🟣", label: "小词卡", grad: "from-violet-400 to-fuchsia-400" },
            { to: "/primary/roleplays",  emoji: "🎭", label: "演一段", grad: "from-rose-400 to-pink-400" },
            { to: "/primary/listening",  emoji: "🎧", label: "听聊天", grad: "from-amber-400 to-orange-400" },
            { to: "/primary/reading",    emoji: "📚", label: "读绘本", grad: "from-emerald-400 to-teal-400" },
          ].map((it) => ({ ...it, to: `${it.to}${gradeQ}` })); })().map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={`group flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${it.grad} px-2 py-3 text-white shadow-sm transition hover:-translate-y-0.5`}
            >
              <span className="grid size-12 place-items-center rounded-xl bg-white/25 text-3xl">{it.emoji}</span>
              <span className="text-[15px] font-extrabold leading-none">{it.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4 步剧情卡 */}
      <section className="mt-5 space-y-3">
        {loading && (
          <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Spark 正在准备今天的冒险…
          </div>
        )}
        {!loading && steps.map((step, idx) => {
          const done = !!progress[step.kind];
          const isCurrent = !done && steps.slice(0, idx).every((s) => progress[s.kind]);
          const isMain = idx === 0; // 第 1 步:今日主任务大卡
          return (
            <article
              key={step.kind}
              className={`rounded-3xl border-2 transition ${
                isMain && !done ? "p-5" : "p-4"
              } ${
                done
                  ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-700 dark:from-emerald-950/30 dark:to-teal-950/30"
                  : isMain
                    ? "border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:border-amber-700 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30"
                    : isCurrent
                      ? "border-rose-300 bg-card shadow-tile"
                      : "border-border bg-card opacity-70"
              }`}
              style={
                isMain && !done
                  ? { boxShadow: "0 0 0 3px rgba(255, 214, 107, 0.4), 0 8px 24px -8px rgba(255, 180, 0, 0.35)", minHeight: 200 }
                  : undefined
              }
            >
              {isMain && !done && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                  <Star className="size-3 fill-white" /> 今日主任务
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className={`grid shrink-0 place-items-center rounded-2xl shadow-sm ${
                  isMain && !done ? "size-16 text-3xl" : "size-12 text-2xl"
                } ${done ? "bg-gradient-to-br from-emerald-400 to-teal-400" : "bg-gradient-to-br from-amber-300 to-rose-300"}`}>
                  {done ? <Check className="size-6 stroke-white" /> : step.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    第 {idx + 1} 步 · {step.estMinutes} 分钟左右
                  </div>
                  <h2 className={`font-extrabold leading-tight ${isMain && !done ? "text-xl" : "text-base"}`}>{step.title}</h2>
                  <p className={`mt-1 text-rose-700 dark:text-rose-300 ${isMain && !done ? "text-base" : "text-sm"}`}>"{step.sparkLine}"</p>
                </div>
              </div>

              {!done && (
                <div className="mt-3 flex items-center justify-end gap-2">
                  {step.placeholder && step.fallbackTo && (
                    <Link
                      to={step.fallbackTo}
                      className="mr-auto text-[11px] font-bold text-amber-700 underline-offset-2 hover:underline dark:text-amber-300"
                    >
                      📦 {step.fallbackLabel ?? "去复习 G1 内容"} →
                    </Link>
                  )}
                  <button
                    onClick={() => confirmStep(step)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
                    aria-label={`已经做完${step.title}`}
                  >
                    我做完了 ✓
                  </button>
                  <button
                    onClick={() => go(step)}
                    disabled={!isCurrent || step.placeholder}
                    className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 font-extrabold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 ${
                      isMain ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"
                    }`}
                  >
                    <Play className={`fill-white ${isMain ? "size-5" : "size-4"}`} /> {step.cta}
                  </button>
                </div>
              )}
              {done && (
                <div className="mt-2 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  已完成 ✓
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* 收尾按钮 — 全部完成才能点 */}
      {!loading && steps.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={finishAdventure}
            disabled={!allDone}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-4 text-lg font-extrabold text-white shadow-tile transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <Sparkles className="size-5" />
            {allDone ? "完成今天的冒险,喂饱 Spark!" : `还有 ${steps.length - doneCount} 件事 ✨`}
          </button>
          {pet && (
            <p className="mt-2 text-xs font-bold text-muted-foreground">
              {moonTitle(pet.bond).emoji} Spark · {moonTitle(pet.bond).label} · {pet.bond}/100
            </p>
          )}
        </div>
      )}

      {/* 退路 — 偶尔孩子想自己挑 */}
      <div className="mt-6 text-center">
        <Link to={`/primary/grade/${grade}`} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          想自己选?去看全部 →
        </Link>
      </div>
    </main>
  );
}