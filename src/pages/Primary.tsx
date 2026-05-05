import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookA, Sparkles, MessageCircle, Play, Star, Gamepad2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StreakBanner } from "@/components/StreakBanner";

type Grade = {
  id: number; name_cn: string; name_en: string;
  emoji: string | null; gradient: string | null;
};

type Pet = { name: string; level: number; xp: number; bond: number; stars: number };

const FALLBACK_GRADES: Grade[] = [
  { id: 1, name_cn: "一年级", name_en: "Grade 1", emoji: "🐣", gradient: "from-amber-300 via-yellow-300 to-orange-300" },
  { id: 2, name_cn: "二年级", name_en: "Grade 2", emoji: "🐥", gradient: "from-orange-300 via-pink-300 to-rose-300" },
  { id: 3, name_cn: "三年级", name_en: "Grade 3", emoji: "🦊", gradient: "from-rose-300 via-fuchsia-300 to-violet-300" },
  { id: 4, name_cn: "四年级", name_en: "Grade 4", emoji: "🐼", gradient: "from-violet-300 via-indigo-300 to-blue-300" },
  { id: 5, name_cn: "五年级", name_en: "Grade 5", emoji: "🦁", gradient: "from-blue-300 via-sky-300 to-cyan-300" },
  { id: 6, name_cn: "六年级", name_en: "Grade 6", emoji: "🦉", gradient: "from-cyan-300 via-teal-300 to-emerald-300" },
];

export default function Primary() {
  const nav = useNavigate();
  const [grades, setGrades] = useState<Grade[]>(FALLBACK_GRADES);
  const [pet, setPet] = useState<Pet | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [selectedGrade, setSelectedGrade] = useState<number>(() => {
    const saved = localStorage.getItem("primary:lastGrade");
    return saved ? Number(saved) : 3;
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
        const { count } = await supabase.from("user_mistakes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId).eq("is_resolved", false);
        setMistakeCount(count ?? 0);
      }
    })();
  }, []);

  function pickGrade(id: number) {
    setSelectedGrade(id);
    localStorage.setItem("primary:lastGrade", String(id));
    nav(`/primary/grade/${id}`);
  }

  function startToday() {
    nav(`/primary/grade/${selectedGrade}`);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink to="/china" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回中国学生专区
      </BackLink>

      {/* Streak / 打卡 — 留存核心 */}
      {uid && <StreakBanner userId={uid} />}

      {/* Spark pet bar */}
      <div className="mb-5 rounded-3xl bg-gradient-to-br from-amber-200 via-rose-200 to-violet-200 p-4 shadow-tile">
        <div className="flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-full bg-white/70 text-3xl">🐶</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold">{pet?.name ?? "Spark"}</span>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold text-amber-700">Lv.{pet?.level ?? 1}</span>
              <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                <Star className="size-3 fill-amber-500 stroke-amber-500" />{pet?.stars ?? 0}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/60">
              <div className="h-full bg-gradient-to-r from-amber-400 to-pink-400" style={{ width: `${Math.min(100, (pet?.xp ?? 0) % 100)}%` }} />
            </div>
            <div className="mt-1 text-[11px] text-amber-900/80">
              亲密度 {pet?.bond ?? 0}/100 · 完成今日训练 +5 ⭐
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">小学英语 · PRIMARY</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">选择你的年级</h1>
        <p className="mt-1 text-xs text-muted-foreground">教育部新课标 · 听 · 读 · 写 · 词汇全面训练</p>
      </div>

      {/* Grades grid */}
      <section className="grid grid-cols-3 gap-3">
        {grades.map((g) => {
          const active = selectedGrade === g.id;
          return (
            <button
              key={g.id}
              onClick={() => pickGrade(g.id)}
              className={`relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${g.gradient ?? "from-slate-200 to-slate-300"} p-3 text-left shadow-tile transition ${active ? "ring-4 ring-amber-400 scale-[1.02]" : "hover:-translate-y-0.5"}`}
            >
              <div className="text-3xl">{g.emoji}</div>
              <div className="absolute inset-x-3 bottom-3">
                <div className="text-sm font-extrabold text-white drop-shadow">{g.name_cn}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/90">{g.name_en}</div>
              </div>
            </button>
          );
        })}
      </section>

      {/* One-click start */}
      <button
        onClick={startToday}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 px-5 py-4 text-base font-extrabold text-white shadow-tile transition hover:-translate-y-0.5"
      >
        <Play className="size-5 fill-white" /> 开始今日训练 · {grades.find(g => g.id === selectedGrade)?.name_cn}
      </button>

      {/* Quick tools */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link to={`/primary/games/${selectedGrade}`} className="rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 p-3 text-white shadow-tile">
          <Gamepad2 className="size-5" />
          <div className="mt-2 text-sm font-extrabold leading-tight">单词游戏</div>
          <div className="text-[10px] opacity-90">4 款玩中学</div>
        </Link>
        <Link to="/primary/chat" className="rounded-2xl bg-gradient-to-br from-pink-400 to-violet-400 p-3 text-white shadow-tile">
          <MessageCircle className="size-5" />
          <div className="mt-2 text-sm font-extrabold leading-tight">Spark 对话</div>
          <div className="text-[10px] opacity-90">陪你聊英语</div>
        </Link>
        <Link to="/primary/letters" className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 p-3 text-white shadow-tile">
          <BookA className="size-5" />
          <div className="mt-2 text-sm font-extrabold leading-tight">26 字母</div>
          <div className="text-[10px] opacity-90">自然拼读</div>
        </Link>
        <Link to="/primary/vocab" className="rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 p-3 text-white shadow-tile">
          <Sparkles className="size-5" />
          <div className="mt-2 text-sm font-extrabold leading-tight">词汇专区</div>
          <div className="text-[10px] opacity-90">1000+ 核心词</div>
        </Link>
      </div>

      {/* Whole-primary mega test + parent dashboard */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Link to="/mistakes" className="rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-4 text-white shadow-tile">
          <div className="flex items-center gap-1 text-sm font-extrabold">
            <AlertCircle className="size-4" /> 错词本
          </div>
          <div className="mt-1 text-[11px] opacity-90">{mistakeCount > 0 ? `待复习 ${mistakeCount}` : "暂无错题 ✨"}</div>
        </Link>
        <Link to="/primary/games/all" className="rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-500 p-4 text-white shadow-tile">
          <div className="text-sm font-extrabold">🏆 全小学大测验</div>
          <div className="mt-1 text-[11px] opacity-90">1008 词混合 · 毕业挑战</div>
        </Link>
        <Link to="/primary/parent" className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-white shadow-tile">
          <div className="text-sm font-extrabold">👨‍👩‍👧 家长报告</div>
          <div className="mt-1 text-[11px] opacity-90">每项技能掌握度</div>
        </Link>
      </div>
    </main>
  );
}
