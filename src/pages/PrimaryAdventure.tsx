import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Play, Settings, Sparkles, Volume2, VolumeX, Award, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BackLink from "@/components/BackLink";
import { isSfxEnabled, setSfxEnabled } from "@/lib/soundEffects";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import {
  buildDailyAdventure,
  loadAdventureProgress,
  markStepDone,
  isAdventureComplete,
  takeCelebrationOnce,
  type AdventureStep } from
"@/lib/dailyAdventure";
import { bondOnAdventureComplete } from "@/lib/petGrowth";
import {
  primaryGradeMapPath,
  primaryReadingEntryPath,
  resolvePrimaryGrade,
  writePrimaryGradeToStorage,
} from "@/lib/primaryGrade";
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
function moonTitle(bond: number): {emoji: string;label: string;} {
  if (bond <= 25) return { emoji: "🌑", label: "新月伙伴" };
  if (bond <= 50) return { emoji: "🌒", label: "银月小伙" };
  if (bond <= 75) return { emoji: "🌕", label: "满月好友" };
  return { emoji: "✨", label: "月光好朋友" };
}

type ProgressRow = {emoji: string;label: string;done: number;total: number;color: string;comingSoon?: boolean;};

// Phase 2 — Daily Adventure.
// One linear flow that strings vocab → lesson → reading → culture
// with Spark narrating each step. No menus, no choice paralysis.

type Pet = {name: string;level: number;bond: number;};

export default function PrimaryAdventure() {
  const nav = useNavigate();
  // Grade comes from the URL first (so "陪 Spark 出发吧" always lands on the
  // grade the kid just picked), and falls back to last-picked grade for
  // direct visits / refresh. Writing back to localStorage keeps the rest of
  // the app in sync if the kid deep-linked into a different grade.
  const { grade: gradeParam } = useParams<{grade?: string;}>();
  const grade = resolvePrimaryGrade(gradeParam);
  useEffect(() => {
    writePrimaryGradeToStorage(grade);
  }, [grade]);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [progress, setProgress] = useState<Record<string, true>>(() => loadAdventureProgress());
  const [loading, setLoading] = useState(true);
  const [myProgress, setMyProgress] = useState<ProgressRow[] | null>(null);
  const [swMasteredCount, setSwMasteredCount] = useState(0);
  const [g2LessonsDone, setG2LessonsDone] = useState(0);
  const [sfxOn, setSfxOnState] = useState<boolean>(() => isSfxEnabled());
  const [progressOpen, setProgressOpen] = useState(false);
  // 用今天的日期做 memo key,避免页面跨午夜后还显示昨天的轮换步骤
  const todayKey = new Date().toDateString();

  useEffect(() => {
    document.title = "今天的冒险 · 陪 Spark 出发 | FluentPath";
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id ?? null;
      // Today's first incomplete lesson for this grade
      const { data: lessons } = await supabase.
      from("primary_lessons").
      select("id,sort_order,unit:primary_units!inner(grade,sort_order),progress:primary_lesson_progress(completed_at)").
      eq("unit.grade", grade).
      order("sort_order");
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
        const swItems = isG2 ? SIGHT_WORD_ITEMS_G2 : SIGHT_WORD_ITEMS;
        const lsItems = isG2 ? PRIMARY_LISTENING_DIALOGUES_G2 : PRIMARY_LISTENING_DIALOGUES;
        const rpItems = isG2 ? PRIMARY_ROLE_PLAYS_G2 : PRIMARY_ROLE_PLAYS;
        const sbItems = isG2 ? PRIMARY_STORY_BOOKS_G2 : PRIMARY_STORY_BOOKS;

        const [phRows, swRows, lsRows, rpRows, sbRows] = await Promise.all([
        supabase.from("primary_phonics_mastery").select("phonics_id,mastery_level").eq("user_id", uid),
        supabase.from("primary_sight_word_mastery").select("word_id,mastery_level").eq("user_id", uid),
        supabase.from("primary_listening_completion").select("dialogue_id").eq("user_id", uid),
        supabase.from("primary_roleplay_completion").select("roleplay_id").eq("user_id", uid),
        supabase.from("primary_storybook_completion").select("book_id").eq("user_id", uid)]
        );

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

        const countIn = (set: Set<string>, items: {id: string;}[]) =>
        items.filter((it) => set.has(it.id)).length;

        // G2: also pull AI lesson completions (30 节,只在 G2 显示)
        let g2LessonDone = 0;
        if (isG2) {
          const { data: lessonRows } = await supabase.
          from("primary_lesson_completion").
          select("lesson_key").
          eq("user_id", uid);
          const doneKeys = new Set((lessonRows ?? []).map((r: any) => r.lesson_key as string));
          g2LessonDone = G2_LESSON_KEYS.filter((k) => doneKeys.has(k)).length;
          setG2LessonsDone(g2LessonDone);
        }

        const baseRows: ProgressRow[] = [
        { emoji: "🔤", label: "字母拼读", done: countIn(phMastered, phonicsItems), total: phonicsItems.length, color: "from-sky-400 to-indigo-400" },
        { emoji: "🟣", label: "常见小词", done: countIn(swMastered, swItems), total: swItems.length, color: "from-violet-400 to-fuchsia-400" },
        { emoji: "🎧", label: "听一听", done: countIn(lsDone, lsItems), total: lsItems.length, color: "from-amber-400 to-orange-400" },
        { emoji: "📚", label: "读绘本", done: countIn(sbDone, sbItems), total: sbItems.length, color: "from-emerald-400 to-teal-400" },
        { emoji: "🎭", label: "演故事", done: countIn(rpDone, rpItems), total: rpItems.length, color: "from-rose-400 to-pink-400" }];

        if (isG2) {
          baseRows.push({
            emoji: "📝", label: "一节课", done: g2LessonDone, total: G2_LESSON_KEYS.length,
            color: "from-indigo-400 to-purple-400"
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
        subtitle: `Spark +30 亲密度 · 经验 +100`
      });
    }
    setTimeout(() => nav("/primary"), 2400);
  }

  // 找到当前需要做的下一步(=第一个未完成步骤)。
  const nextStepIdx = steps.findIndex((s) => !progress[s.kind]);
  const nextStep = nextStepIdx >= 0 ? steps[nextStepIdx] : null;

  function toggleSfx() {
    const v = !sfxOn;
    setSfxEnabled(v);
    setSfxOnState(v);
  }

  const isG2 = grade === 2;
  const gradeQ = isG2 ? "?grade=2" : "";
  const moduleLinks = [
  { to: `/primary/phonics${gradeQ}`, emoji: "🔤", label: "字母拼读" },
  { to: `/primary/sight-words${gradeQ}`, emoji: "🟣", label: "常见小词" },
  { to: `/primary/listening${gradeQ}`, emoji: "🎧", label: "听一听" },
  { to: `/primary/roleplays${gradeQ}`, emoji: "🎭", label: "演故事" },
  { to: primaryReadingEntryPath(grade), emoji: "📚", label: "读绘本" },
  ...(isG2 ? [{ to: "/lesson?grade=2", emoji: "📝", label: "G2 课程(30 节)" }] : [])];


  // 我的进度合计(用于折叠头部小字)
  const totalDone = (myProgress ?? []).reduce((a, r) => a + r.done, 0);
  const totalAll = (myProgress ?? []).reduce((a, r) => a + r.total, 0);

  // “想做点别的?” — Reading / Listening / Roleplay 三个模块的快捷入口,
  // 防止主页改造后这 3 个模块失去入口。进度数字直接复用 myProgress。
  const findRow = (label: string) => (myProgress ?? []).find((r) => r.label === label);
  const exploreCards = [
  { to: primaryReadingEntryPath(grade), emoji: "📚", label: "读绘本", row: findRow("读绘本") },
  { to: `/primary/listening${gradeQ}`, emoji: "🎧", label: "听对话", row: findRow("听一听") },
  { to: `/primary/roleplays${gradeQ}`, emoji: "🎭", label: "演角色", row: findRow("演故事") }];


  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6 pb-24">
      {/* 顶部:返回 + 🔊 + 🏅 + ⚙️ */}
      <div className="mb-3 flex items-center justify-between">
        <BackLink to="/primary" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>回到主屏</T>
        </BackLink>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSfx}
            aria-label={sfxOn ? "关闭声音" : "打开声音"}
            className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground">
            
            {sfxOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          {isG2 &&
          <Link
            to="/primary/badges"
            aria-label="我的徽章"
            className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground">
            
              <Award className="size-4" />
            </Link>
          }
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="设置"
              className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground">
              
              <Settings className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel><T>所有模块</T></DropdownMenuLabel>
              {moduleLinks.map((m) =>
              <DropdownMenuItem key={m.to} asChild>
                  <Link to={m.to} className="cursor-pointer">
                    <span className="mr-2">{m.emoji}</span>
                    <T>{m.label}</T>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={primaryGradeMapPath(grade)} className="cursor-pointer">
                  <span className="mr-2">🗺️</span><T>完整学习地图</T>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* G3-G6 教材同步提示 */}
      {grade > 2 &&
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
          <span><T>📚 教材同步模式：对应人教/外研社版主线内容，Spark 带你一课一课过。</T></span>
        </div>
      }

      {/* === Spark 卡 + 今日任务主入口 === */}
      <section className="rounded-3xl bg-gradient-to-br from-pink-200 via-rose-200 to-amber-200 p-6 text-center shadow-tile dark:from-pink-950/40 dark:via-rose-950/40 dark:to-amber-950/40">
        <div className="mx-auto grid size-24 place-items-center rounded-full bg-white/70 text-6xl shadow-md spark-bob">🦊</div>
        <p className="mx-auto mt-3 max-w-md text-lg font-extrabold leading-snug text-rose-900 dark:text-rose-100">
          <T>{allDone
            ? '"我们今天一起做了好多事!"'
            : nextStep
            ? `"嘿!${nextStep.sparkLine}"`
            : '"我准备好啦,我们出发吧!"'}</T>
        </p>

        {!loading && nextStep && !allDone &&
        <div className="mx-auto mt-4 max-w-sm rounded-2xl border-2 border-amber-300 bg-white/90 p-4 text-left shadow-md dark:border-amber-700 dark:bg-card/90">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              <Star className="mr-1 inline size-3 fill-current" />
              <T>今日主任务 · 第</T> {nextStepIdx + 1} <T>步 /</T> {steps.length}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-3xl">{nextStep.emoji}</span>
              <h1 className="text-xl font-extrabold leading-tight text-rose-900 dark:text-rose-100"><T>{nextStep.title}</T></h1>
            </div>
            <div className="mt-1 text-xs font-bold text-muted-foreground"><T>约</T> {nextStep.estMinutes} <T>分钟</T></div>
            <button
            onClick={() => go(nextStep)}
            disabled={nextStep.placeholder}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 px-6 py-3 text-base font-extrabold text-white shadow-tile transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0">
            
              <Play className="size-5 fill-white" /> <T>{nextStep.cta}</T> →
            </button>
            <button
            onClick={() => confirmStep(nextStep)}
            className="mt-2 w-full text-[11px] font-bold text-muted-foreground hover:text-foreground">
              <T>我做完了 ✓</T>
            
          </button>
          </div>
        }

        {!loading && allDone &&
        <div className="mx-auto mt-4 max-w-sm rounded-2xl border-2 border-emerald-300 bg-white/90 p-4 text-center shadow-md dark:border-emerald-700 dark:bg-card/90">
            <div className="text-3xl">🎉</div>
            <div className="mt-1 text-lg font-extrabold text-emerald-700 dark:text-emerald-300"><T>今天的冒险完成啦!</T></div>
            <div className="mt-3 flex flex-col gap-2">
              <button
              onClick={finishAdventure}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5">
              
                <Sparkles className="size-4" /> <T>喂饱 Spark · 休息一下</T>
              </button>
              {isG2 &&
            <Link
              to="/lesson?grade=2"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-rose-300 bg-card px-5 py-2.5 text-sm font-extrabold text-rose-700 dark:text-rose-300">
                  <T>🚀 继续闯关挑战</T>
                
            </Link>
            }
            </div>
          </div>
        }

        {/* 副信息:今日冒险 + 火箭齿轮(G2) */}
        <div className="mx-auto mt-4 text-xs font-bold text-rose-700 dark:text-rose-200">
          <T>今天的冒险</T> {doneCount} / {steps.length}
          {isG2 && <> · 🚀 {g2LessonsDone} <T>/ 30 齿轮</T></>}
        </div>
      </section>

      {/* === Adventure 5 步精简单行列表 === */}
      {/* === 想做点别的? — Reading / Listening / Roleplay 入口 === */}
      <section className="mt-5">
        <div className="mb-2 px-1 text-xs font-bold text-muted-foreground"><T>想做点别的?</T></div>
        <div className="grid grid-cols-3 gap-2">
          {exploreCards.map((c) =>
          <Link
            key={c.to}
            to={c.to}
            className="rounded-2xl border border-border bg-muted/40 p-3 text-center transition hover:-translate-y-0.5 hover:bg-muted">
            
              <div className="text-2xl">{c.emoji}</div>
              <div className="mt-1 text-sm font-bold text-foreground"><T>{c.label}</T></div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {c.row ? `${c.row.done} / ${c.row.total}` : "—"}
              </div>
            </Link>
          )}
        </div>
      </section>

      {!loading && steps.length > 0 &&
      <section className="mt-5 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="mb-2 px-1 text-xs font-bold text-muted-foreground"><T>今天的冒险</T></div>
          <ul className="divide-y divide-border">
            {steps.map((step, idx) => {
            const done = !!progress[step.kind];
            const isCurrent = idx === nextStepIdx;
            const clickable = isCurrent && !step.placeholder;
            const handle = () => clickable && go(step);
            return (
              <li key={step.kind}>
                  <button
                  type="button"
                  onClick={handle}
                  disabled={!clickable}
                  className={`flex w-full items-center gap-3 px-1 py-2 text-left text-sm transition ${
                  done ?
                  "text-emerald-700 dark:text-emerald-400" :
                  isCurrent ?
                  "font-extrabold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30" :
                  "text-muted-foreground"} ${
                  clickable ? "cursor-pointer rounded-lg" : "cursor-default"}`}>
                  
                    <span className="w-5 text-center">
                      {done ? <Check className="mx-auto size-4 stroke-emerald-600" /> : isCurrent ? "📍" : <span className="opacity-40">{step.emoji}</span>}
                    </span>
                    <span className="flex-1 truncate"><T>{step.title}</T></span>
                    {isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500"><T>当前</T></span>}
                  </button>
                </li>);

          })}
          </ul>
        </section>
      }

      {/* === 我的进度(默认折叠)=== */}
      {myProgress &&
      <section className="mt-4 rounded-2xl border border-border bg-card shadow-sm">
          <button
          type="button"
          onClick={() => setProgressOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-bold text-muted-foreground"
          aria-expanded={progressOpen}>
          
            <span className="inline-flex items-center gap-1.5">
              <span className="text-sm">📊</span>
              <T>我的进度</T>
              <span className="ml-1 text-muted-foreground/70">· {totalDone} / {totalAll}</span>
            </span>
            {progressOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          {progressOpen &&
        <ul className="space-y-1.5 px-3 pb-3">
              {myProgress.map((r) => {
            const pct = r.total > 0 ? Math.min(100, r.done / r.total * 100) : 0;
            return (
              <li key={r.label} className="flex h-7 items-center gap-2 text-[12px]">
                    <span className="w-4 text-center">{r.emoji}</span>
                    <span className="w-16 shrink-0 font-bold"><T>{r.label}</T></span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full bg-gradient-to-r ${r.color} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-20 shrink-0 text-right tabular-nums font-bold text-muted-foreground">
                      {r.comingSoon ? <T>📦 准备中</T> : `${r.done} / ${r.total}`}
                    </span>
                  </li>);

          })}
            </ul>
        }
        </section>
      }

      {pet &&
      <p className="mt-4 text-center text-xs font-bold text-muted-foreground">
          {moonTitle(pet.bond).emoji} Spark · <T>{moonTitle(pet.bond).label}</T> · {pet.bond}/100
        </p>
      }

      {loading &&
      <div className="mt-5 rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <T>Spark 正在准备今天的冒险…</T>
        </div>
      }
    </main>);

}