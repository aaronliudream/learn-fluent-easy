import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Star, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StreakBanner } from "@/components/StreakBanner";
import MonthlyPostcard from "@/components/pet/MonthlyPostcard";
import EvolutionTree from "@/components/pet/EvolutionTree";

type Grade = {
  id: number; name_cn: string; name_en: string;
  emoji: string | null; gradient: string | null;
};

type Pet = { name: string; level: number; xp: number; bond: number; stars: number; hunger?: number; mood?: number; stage?: number };

const FALLBACK_GRADES: Grade[] = [
  { id: 1, name_cn: "一年级", name_en: "Grade 1", emoji: "🐣", gradient: "from-amber-300 via-yellow-300 to-orange-300" },
  { id: 2, name_cn: "二年级", name_en: "Grade 2", emoji: "🐥", gradient: "from-orange-300 via-pink-300 to-rose-300" },
  { id: 3, name_cn: "三年级", name_en: "Grade 3", emoji: "🦊", gradient: "from-rose-300 via-fuchsia-300 to-violet-300" },
  { id: 4, name_cn: "四年级", name_en: "Grade 4", emoji: "🐼", gradient: "from-violet-300 via-indigo-300 to-blue-300" },
  { id: 5, name_cn: "五年级", name_en: "Grade 5", emoji: "🦁", gradient: "from-blue-300 via-sky-300 to-cyan-300" },
  { id: 6, name_cn: "六年级", name_en: "Grade 6", emoji: "🦉", gradient: "from-cyan-300 via-teal-300 to-emerald-300" },
];

// Spark greeting — tries to make Spark feel like it knows the child.
// Pure function over (pet, streak, daysSinceLastVisit, isFirstVisit, isWeekend).
// Order matters: most "personal" signals win.
function pickSparkLine(opts: {
  pet: Pet | null;
  streak: number;
  daysSinceLastVisit: number | null; // null = first ever visit
  isWeekend: boolean;
}): string {
  const { pet, streak, daysSinceLastVisit, isWeekend } = opts;

  // 1. First time ever — warm intro
  if (daysSinceLastVisit == null) {
    return "嗨!我是 Spark,今天我们一起冒险吗?";
  }
  // 2. Long absence (7+ days) — guilt-free, missed-you tone
  if (daysSinceLastVisit >= 7) {
    return "我有点想你了… 你回来啦!";
  }
  // 3. Skipped yesterday — gentle nudge
  if (daysSinceLastVisit >= 2) {
    return "我昨天等你了一整天… 今天有空吗?";
  }
  // 4. About to level up — concrete next-step framing
  if (pet && pet.bond >= 90) {
    return "我快升级啦!再做一件事就行!";
  }
  // 5. Healthy streaks
  if (streak >= 7) return `我们已经一起冒险 ${streak} 天啦,继续吗?`;
  if (streak >= 3) return `连续 ${streak} 天啦,我每天都在等你 ✨`;
  // 6. Weekend variant
  if (isWeekend) return "今天也要陪我吗?周末也别忘了我哦~";
  // 7. Hunger fallback (pet exists but neglected today)
  if (pet && (pet.hunger ?? 50) < 25) return "我有点饿啦,陪我学一会儿好吗?";
  // 8. Level milestones
  if (pet && pet.level >= 5) return "我变强好多!这都是你的功劳~";
  // 9. Same-day return
  if (daysSinceLastVisit === 0) return "你又回来啦!我们再做一件事?";
  // 10. Default
  return "今天也要一起冒险吗?";
}

const LAST_VISIT_KEY = "primary:lastVisitDate";
function readLastVisit(): string | null {
  try { return localStorage.getItem(LAST_VISIT_KEY); } catch { return null; }
}
function writeLastVisit() {
  try { localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString().slice(0, 10)); } catch { /* noop */ }
}
function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / (24 * 3600 * 1000));
}

export default function Primary() {
  const nav = useNavigate();
  const [grades, setGrades] = useState<Grade[]>(FALLBACK_GRADES);
  const [pet, setPet] = useState<Pet | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [grade, setGrade] = useState<number | null>(() => {
    const saved = localStorage.getItem("primary:lastGrade");
    return saved ? Number(saved) : null;
  });
  // Stable across the render — captured once when the page mounts so the
  // greeting doesn't change mid-session after we mark today as visited.
  const [visitContext] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const last = readLastVisit();
    return {
      daysSinceLastVisit: last ? Math.max(0, daysBetween(last, today)) : null,
      isWeekend: [0, 6].includes(new Date().getDay()),
    };
  });

  useEffect(() => {
    (async () => {
      // SEO: title + meta description
      document.title = "小学英语 G1-G6 · 自然拼读 · 词汇 · 听说读写 | FluentPath";
      const desc = "教育部新课标小学英语 1-6 年级：自然拼读、核心词汇、听力对话、阅读闯关、AI 口语陪练，孩子每天 10 分钟。";
      let m = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
      m.content = desc;

      const { data } = await supabase.from("primary_grades").select("*").order("sort_order");
      if (data && data.length) setGrades(data as Grade[]);
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id ?? null;
      setUid(userId);
      if (userId) {
        const { data: p } = await supabase.from("pet_state").select("*").eq("user_id", userId).maybeSingle();
        if (p) setPet(p as Pet);
        else {
          const { data: created } = await supabase.from("pet_state").insert({ user_id: userId }).select().maybeSingle();
          if (created) setPet(created as Pet);
        }
      }
      // Record this visit *after* we've captured visitContext above.
      writeLastVisit();
    })();
  }, []);

  function pickGrade(id: number) {
    setGrade(id);
    localStorage.setItem("primary:lastGrade", String(id));
  }

  function goAdventure() {
    if (grade == null) return;
    nav(`/primary/adventure`);
  }

  // First-time visitor → inline grade picker, then immediately show CTA.
  const needsGrade = grade == null;
  const sparkLine = pickSparkLine({
    pet,
    streak,
    daysSinceLastVisit: visitContext.daysSinceLastVisit,
    isWeekend: visitContext.isWeekend,
  });
  const currentGradeName = grades.find(g => g.id === grade)?.name_cn ?? "";

  // Visualize bond as 10 hearts so kids read it instantly.
  const bondNow = Math.max(0, Math.min(100, pet?.bond ?? 0));
  const bondHearts = Math.round(bondNow / 10);
  const bondToLevel = Math.max(0, 100 - bondNow);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-6">
      <BackLink to="/#stages" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回学习阶段
      </BackLink>

      {/* === Phase 1: Spark 主屏 === 单一中心 = Spark + 一句话 + 一个 CTA === */}
      {needsGrade ? (
        <section className="mt-6 rounded-3xl border-2 border-border bg-card p-6 text-center shadow-tile">
          <div className="text-5xl">👋</div>
          <h1 className="mt-3 text-xl font-extrabold">嗨,Spark 想认识你!</h1>
          <p className="mt-1 text-sm text-muted-foreground">先告诉我你在几年级,我会按你的进度陪你学。</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {grades.map((g) => (
              <button
                key={g.id}
                onClick={() => pickGrade(g.id)}
                className={`relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${g.gradient ?? "from-slate-200 to-slate-300"} p-3 text-left shadow-tile transition hover:-translate-y-0.5`}
              >
                <div className="text-3xl">{g.emoji}</div>
                <div className="absolute inset-x-3 bottom-3">
                  <div className="text-sm font-extrabold text-white drop-shadow">{g.name_cn}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <>
          {/* Spark 主屏 — 大头像 + 它说的话 + 唯一 CTA */}
          <section className="mt-4 rounded-3xl bg-gradient-to-br from-pink-200 via-rose-200 to-amber-200 p-6 text-center shadow-tile dark:from-pink-950/40 dark:via-rose-950/40 dark:to-amber-950/40">
            <Link to="/pets" className="inline-block transition hover:scale-105">
              <div className="mx-auto grid size-28 place-items-center rounded-full bg-white/70 text-7xl shadow-md">
                🦊
              </div>
            </Link>
            <div className="mt-4 inline-flex flex-col items-center gap-1 rounded-2xl bg-white/85 px-4 py-2 text-xs font-bold text-rose-700 shadow-sm">
              <div className="flex items-center gap-2">
                <span>Spark · Lv.{pet?.level ?? 1}</span>
                <span className="text-rose-300">·</span>
                <span aria-label={`亲密度 ${bondNow} / 100`} className="tracking-tight">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i}>{i < bondHearts ? "❤️" : "🤍"}</span>
                  ))}
                </span>
              </div>
              <div className="text-[10px] font-semibold text-rose-500">
                {bondToLevel === 0
                  ? "马上就要升级啦!"
                  : `距离升级还差 ${bondToLevel} ❤️`}
              </div>
            </div>
            <p className="mx-auto mt-3 max-w-md text-lg font-extrabold leading-snug text-rose-900 dark:text-rose-100">
              "{sparkLine}"
            </p>
            <button
              onClick={goAdventure}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 px-8 py-4 text-lg font-extrabold text-white shadow-tile transition hover:-translate-y-0.5 hover:scale-105"
              aria-label="陪 Spark 出发吧"
            >
              <Play className="size-5 fill-white" /> 陪 Spark 出发吧
            </button>
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-rose-700/80 dark:text-rose-300/80">
              <span>{currentGradeName}</span>
              <span>·</span>
              <button onClick={() => setGrade(null)} className="underline underline-offset-2 hover:text-rose-900">
                切换年级
              </button>
            </div>
          </section>

          {/* Streak 退到次要位置 */}
          {uid && <div className="mt-4"><StreakBanner userId={uid} /></div>}

          {/* Phase 5 — 复活宠物资产 */}
          {pet && (
            <div className="mt-4">
              <EvolutionTree stage={pet.stage ?? 0} level={pet.level ?? 1} nickname={pet.name} />
            </div>
          )}
          <div className="mt-4">
            <MonthlyPostcard />
          </div>

          {/* 唯一二级入口 — 周计划 & 进度(给家长) */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            <Link
              to="/parent"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-bold text-muted-foreground transition hover:text-foreground"
            >
              <Calendar className="size-3.5" /> 📅 周计划 &amp; 进度
            </Link>
            <Link
              to={`/primary/grade/${grade}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-bold text-muted-foreground transition hover:text-foreground"
            >
              <Star className="size-3.5" /> 完整学习地图
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
