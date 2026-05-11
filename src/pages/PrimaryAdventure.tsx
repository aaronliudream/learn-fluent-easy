import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Play, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BackLink from "@/components/BackLink";
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
  // 用今天的日期做 memo key,避免页面跨午夜后还显示昨天的轮换步骤
  const todayKey = new Date().toDateString();

  useEffect(() => {
    document.title = "今日冒险 · 陪 Spark 出发 | FluentPath";
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
      }
      setLoading(false);
    })();
  }, [grade]);

  const steps: AdventureStep[] = useMemo(
    () => buildDailyAdventure({ grade, nextLessonId }),
    [grade, nextLessonId, todayKey]
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
        title: "今日冒险完成!",
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

      {/* G2-G6 内容尚未补齐 — 给孩子一个温和的提示 + 返回一年级的快捷入口 */}
      {grade > 1 && (
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
              : `"已经完成 ${doneCount} 件啦,再陪 Spark 一下吧!"`}
        </p>
        <div className="mx-auto mt-4 max-w-xs">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-200">
            <span>今日冒险</span>
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

      {/* 快捷探索工具栏 — 自由学习入口,不参与每日 4 步 */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            想玩什么?
          </h2>
        </div>
        <div className="-mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-stretch gap-2">
            {[
              { to: "/primary/phonics",    emoji: "🔤", label: "读字母", grad: "from-sky-400 to-indigo-400" },
              { to: "/primary/sight-words",emoji: "🟣", label: "小词卡", grad: "from-violet-400 to-fuchsia-400" },
              { to: "/primary/roleplays",  emoji: "🎭", label: "演一段", grad: "from-rose-400 to-pink-400" },
              { to: "/primary/listening",  emoji: "🎧", label: "听聊天", grad: "from-amber-400 to-orange-400" },
              { to: "/primary/reading",    emoji: "📚", label: "读绘本", grad: "from-emerald-400 to-teal-400" },
            ].map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className={`group flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-br ${it.grad} p-2.5 text-white shadow-sm transition hover:-translate-y-0.5`}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-white/25 text-2xl">{it.emoji}</span>
                <span className="text-[12px] font-extrabold leading-none">{it.label}</span>
              </Link>
            ))}
          </div>
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
          return (
            <article
              key={step.kind}
              className={`rounded-3xl border-2 p-4 transition ${
                done
                  ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-700 dark:from-emerald-950/30 dark:to-teal-950/30"
                  : isCurrent
                    ? "border-rose-300 bg-card shadow-tile"
                    : "border-border bg-card opacity-70"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`grid size-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-sm ${done ? "bg-gradient-to-br from-emerald-400 to-teal-400" : "bg-gradient-to-br from-amber-300 to-rose-300"}`}>
                  {done ? <Check className="size-6 stroke-white" /> : step.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    第 {idx + 1} 步 · 约 {step.estMinutes} 分钟
                  </div>
                  <h2 className="text-base font-extrabold leading-tight">{step.title}</h2>
                  <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">"{step.sparkLine}"</p>
                </div>
              </div>

              {!done && (
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => confirmStep(step)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
                    aria-label={`已经做完${step.title}`}
                  >
                    我做完了 ✓
                  </button>
                  <button
                    onClick={() => go(step)}
                    disabled={!isCurrent}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 px-4 py-2 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    <Play className="size-4 fill-white" /> {step.cta}
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
            {allDone ? "完成今日冒险,喂饱 Spark!" : `还有 ${steps.length - doneCount} 件事 ✨`}
          </button>
          {pet && (
            <p className="mt-2 text-xs text-muted-foreground">
              Spark 等级 {pet.level} · 小心心 {pet.bond}/100
            </p>
          )}
        </div>
      )}

      {/* 退路 — 偶尔孩子想自己挑 */}
      <div className="mt-6 text-center">
        <Link to={`/primary/grade/${grade}`} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          想自己挑课程?去完整学习地图 →
        </Link>
      </div>
    </main>
  );
}