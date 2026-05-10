import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Star, Calendar, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StreakBanner } from "@/components/StreakBanner";

type Grade = {
  id: number; name_cn: string; name_en: string;
  emoji: string | null; gradient: string | null;
};

type Pet = { name: string; level: number; xp: number; bond: number; stars: number; hunger?: number; mood?: number };

const FALLBACK_GRADES: Grade[] = [
  { id: 1, name_cn: "一年级", name_en: "Grade 1", emoji: "🐣", gradient: "from-amber-300 via-yellow-300 to-orange-300" },
  { id: 2, name_cn: "二年级", name_en: "Grade 2", emoji: "🐥", gradient: "from-orange-300 via-pink-300 to-rose-300" },
  { id: 3, name_cn: "三年级", name_en: "Grade 3", emoji: "🦊", gradient: "from-rose-300 via-fuchsia-300 to-violet-300" },
  { id: 4, name_cn: "四年级", name_en: "Grade 4", emoji: "🐼", gradient: "from-violet-300 via-indigo-300 to-blue-300" },
  { id: 5, name_cn: "五年级", name_en: "Grade 5", emoji: "🦁", gradient: "from-blue-300 via-sky-300 to-cyan-300" },
  { id: 6, name_cn: "六年级", name_en: "Grade 6", emoji: "🦉", gradient: "from-cyan-300 via-teal-300 to-emerald-300" },
];

// Phase 1 — Spark greeting lines, picked from pet state. No LLM.
function pickSparkLine(pet: Pet | null, streak: number): string {
  if (!pet) return "嗨,我是 Spark。我们今天一起开始吧?";
  const h = pet.hunger ?? 50;
  if (h < 25) return "我有点想你了… 一起练 5 分钟好吗?";
  if (streak >= 7) return `我们已经一起 ${streak} 天啦!今天也要继续吗?`;
  if (streak >= 3) return `连续 ${streak} 天啦,我每天都在等你 ✨`;
  if (pet.level >= 5) return "我变强好多!这都是你的功劳~";
  if (pet.bond >= 80) return "再陪我一会儿,我马上就要升级了!";
  return "今天也要一起冒险吗?";
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
  const sparkLine = pickSparkLine(pet, streak);
  const currentGradeName = grades.find(g => g.id === grade)?.name_cn ?? "";

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
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-rose-700 shadow-sm">
              Spark · Lv.{pet?.level ?? 1}
              <span className="text-rose-400">·</span>
              <Heart className="size-3 fill-rose-500 stroke-rose-600" />
              {pet?.bond ?? 0}/100
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
