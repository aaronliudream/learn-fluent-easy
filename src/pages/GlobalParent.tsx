import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Coins, Backpack, School, GraduationCap, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TodayGrowthCard } from "@/components/TodayGrowthCard";

// Lazy import the existing primary parent dashboard – it already does deep drill-down per grade.
const PrimaryParentInline = lazy(() => import("./PrimaryParent"));

type Stage = "primary" | "junior" | "senior";
type Score = { game_type: string; grade: number | null; accuracy: number | null; created_at: string };

const STAGES: { key: Stage; label: string; icon: any; color: string; route: string }[] = [
  { key: "primary", label: "小学 G1-G6", icon: Backpack, color: "from-sky-500 to-cyan-500", route: "/primary" },
  { key: "junior",  label: "初中 G7-G9", icon: School,  color: "from-violet-500 to-indigo-500", route: "/junior" },
  { key: "senior",  label: "高中 / 高考", icon: GraduationCap, color: "from-rose-500 to-orange-500", route: "/gaokao" },
];

export default function GlobalParent() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>("primary");
  const [coins, setCoins] = useState({ balance: 0, total_earned: 0 });
  const [primaryScores, setPrimaryScores] = useState<Score[]>([]);
  const [juniorScores, setJuniorScores] = useState<Score[]>([]);
  const [gaokaoAttempts, setGaokaoAttempts] = useState<{ created_at: string; is_correct: boolean; question_type: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      setAuthed(!!uid);
      if (!uid) { setLoading(false); return; }
      const since = new Date(Date.now() - 30*24*3600*1000).toISOString();
      const [c, ps, js, ga] = await Promise.all([
        supabase.from("user_coins").select("balance,total_earned").eq("user_id", uid).maybeSingle(),
        supabase.from("primary_game_scores").select("game_type,grade,accuracy,created_at").eq("user_id", uid).gte("created_at", since).order("created_at"),
        supabase.from("junior_game_scores").select("game_type,grade,accuracy,created_at").eq("user_id", uid).gte("created_at", since).order("created_at"),
        supabase.from("gaokao_user_attempts").select("created_at,is_correct,question_type").eq("user_id", uid).gte("created_at", since).order("created_at"),
      ]);
      if (c.data) setCoins(c.data as any);
      setPrimaryScores((ps.data ?? []) as Score[]);
      setJuniorScores((js.data ?? []) as Score[]);
      setGaokaoAttempts((ga.data ?? []) as any);
      setLoading(false);
    })();
  }, []);

  const summary = useMemo(() => {
    const sumScores = (rows: Score[]) => {
      if (rows.length === 0) return { sessions: 0, avgAcc: 0, days: 0 };
      const days = new Set(rows.map(r => r.created_at.slice(0,10)));
      const acc = rows.reduce((s,r)=>s + (r.accuracy ?? 0), 0) / rows.length;
      return { sessions: rows.length, avgAcc: Math.round(acc * 100), days: days.size };
    };
    const sumGaokao = () => {
      if (gaokaoAttempts.length === 0) return { sessions: 0, avgAcc: 0, days: 0 };
      const days = new Set(gaokaoAttempts.map(r => r.created_at.slice(0,10)));
      const c = gaokaoAttempts.filter(a => a.is_correct).length;
      return { sessions: gaokaoAttempts.length, avgAcc: Math.round(c / gaokaoAttempts.length * 100), days: days.size };
    };
    return { primary: sumScores(primaryScores), junior: sumScores(juniorScores), senior: sumGaokao() };
  }, [primaryScores, juniorScores, gaokaoAttempts]);

  const trend = useMemo(() => {
    const map: Record<string, { date: string; primary: number[]; junior: number[]; senior: number[] }> = {};
    const push = (d: string, k: "primary"|"junior"|"senior", v: number) => {
      if (!map[d]) map[d] = { date: d, primary: [], junior: [], senior: [] };
      map[d][k].push(v);
    };
    primaryScores.forEach(r => push(r.created_at.slice(5,10), "primary", (r.accuracy ?? 0) * 100));
    juniorScores.forEach(r => push(r.created_at.slice(5,10), "junior", (r.accuracy ?? 0) * 100));
    // bucket gaokao attempts by day → daily accuracy
    const ga: Record<string, { c: number; t: number }> = {};
    gaokaoAttempts.forEach(a => {
      const d = a.created_at.slice(5,10);
      if (!ga[d]) ga[d] = { c: 0, t: 0 };
      ga[d].t++; if (a.is_correct) ga[d].c++;
    });
    Object.entries(ga).forEach(([d,v]) => push(d, "senior", v.c/v.t*100));
    return Object.values(map).sort((a,b)=>a.date.localeCompare(b.date)).map(d => ({
      date: d.date,
      primary: d.primary.length ? Math.round(d.primary.reduce((a,b)=>a+b,0)/d.primary.length) : null,
      junior:  d.junior.length  ? Math.round(d.junior.reduce((a,b)=>a+b,0)/d.junior.length) : null,
      senior:  d.senior.length  ? Math.round(d.senior.reduce((a,b)=>a+b,0)/d.senior.length) : null,
    }));
  }, [primaryScores, juniorScores, gaokaoAttempts]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 md:px-6 md:py-10">
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回首页
      </Link>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">PARENT CENTER · K-12</div>
          <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">👨‍👩‍👧 全局家长中心</h1>
          <p className="mt-1 text-xs text-muted-foreground">小学 / 初中 / 高中 全学段进度、薄弱点、近 30 天趋势一目了然</p>
        </div>
        <Link to="/pets" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow">
          <Coins className="size-4" /> {coins.balance} 星币
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin" /> 加载中…</div>
      ) : authed === false ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">请先登录后再查看</div>
      ) : (
        <>
          {/* Today's growth — same data the student sees */}
          <section className="mb-4">
            <TodayGrowthCard />
          </section>

          {/* Stage cards */}
          <section className="mb-4 grid gap-3 sm:grid-cols-3">
            {STAGES.map(s => {
              const data = (summary as any)[s.key];
              return (
                <button key={s.key} onClick={() => setStage(s.key)}
                  className={cn("group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition",
                    stage === s.key ? "border-amber-400 shadow-lg" : "border-border hover:border-amber-300")}>
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10 transition group-hover:opacity-20", s.color)} />
                  <div className="relative flex items-center gap-2">
                    <div className={cn("grid size-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow", s.color)}>
                      <s.icon className="size-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">{s.label}</div>
                      <div className="text-[10px] text-muted-foreground">{data.days} 天活跃 · {data.sessions} 次练习</div>
                    </div>
                  </div>
                  <div className="relative mt-3">
                    <div className="text-xs text-muted-foreground">综合准确率</div>
                    <div className="text-2xl font-black">{data.avgAcc}<span className="text-sm font-bold text-muted-foreground">%</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className={cn("h-full bg-gradient-to-r", s.color)} style={{ width: `${data.avgAcc}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

          {/* Combined trend */}
          <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
            <div className="mb-2 flex items-center gap-1 text-sm font-extrabold">
              <TrendingUp className="size-4 text-emerald-500" /> 近 30 天 全学段准确率趋势
            </div>
            {trend.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">暂无练习记录，去玩一局后再看 ✨</div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0,100]} tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Line type="monotone" dataKey="primary" name="小学" stroke="hsl(200 90% 50%)" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                    <Line type="monotone" dataKey="junior"  name="初中" stroke="hsl(260 80% 60%)" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                    <Line type="monotone" dataKey="senior"  name="高中" stroke="hsl(10 85% 55%)"  strokeWidth={2} dot={{ r: 2 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Stage-specific deep view */}
          {stage === "primary" && (
            <Suspense fallback={<div className="py-10 text-center text-muted-foreground"><Loader2 className="inline size-4 animate-spin" /> 加载小学详情…</div>}>
              <div className="rounded-3xl border border-dashed border-border p-1">
                <PrimaryParentInline />
              </div>
            </Suspense>
          )}
          {stage === "junior" && <JuniorDetail scores={juniorScores} />}
          {stage === "senior" && <SeniorDetail attempts={gaokaoAttempts} />}

          <div className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
            <div className="flex items-center gap-1 font-extrabold"><Sparkles className="size-3.5" /> 如何看这个报告？</div>
            <p className="mt-1 leading-relaxed">
              ① 顶部三张卡片显示三个学段的最近 30 天活跃情况；点击切换到对应学段查看详情。<br/>
              ② 学习产生的星币可用于宠物中心喂养、冒险、领养。家长可凭此判断孩子学习投入度。<br/>
              ③ 小学详情含每词四技能掌握度（选/听/拼/配），符合 Cambridge YLE × CEFR Pre-A1~A2 can-do 标准。<br/>
              ④ 初中/高中详情显示按题型的正确率分布与练习量。
            </p>
          </div>
        </>
      )}
    </main>
  );
}

function JuniorDetail({ scores }: { scores: Score[] }) {
  const byType = useMemo(() => {
    const m: Record<string, { c: number; t: number }> = {};
    scores.forEach(s => {
      const k = s.game_type ?? "other";
      if (!m[k]) m[k] = { c: 0, t: 0 };
      m[k].t++;
      m[k].c += s.accuracy ?? 0;
    });
    return Object.entries(m).map(([k,v]) => ({ type: k, sessions: v.t, avg: Math.round(v.c/v.t*100) }));
  }, [scores]);
  return (
    <section className="rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
      <div className="mb-3 flex items-center gap-1 text-sm font-extrabold"><Trophy className="size-4 text-violet-500" /> 初中练习详情（近 30 天）</div>
      {byType.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">还没有初中练习记录，去 /junior 开始吧</div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {byType.map(b => (
            <div key={b.type} className="rounded-2xl border border-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">{labelType(b.type)}</div>
                <div className="text-xs text-muted-foreground">{b.sessions} 次</div>
              </div>
              <div className="mt-1 text-2xl font-black">{b.avg}<span className="text-sm font-bold text-muted-foreground">%</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-gradient-to-r from-violet-400 to-indigo-500" style={{ width: `${b.avg}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <Link to="/junior" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:underline">→ 进入初中专区</Link>
    </section>
  );
}

function SeniorDetail({ attempts }: { attempts: { is_correct: boolean; question_type: string }[] }) {
  const byType = useMemo(() => {
    const m: Record<string, { c: number; t: number }> = {};
    attempts.forEach(a => {
      const k = a.question_type ?? "other";
      if (!m[k]) m[k] = { c: 0, t: 0 };
      m[k].t++; if (a.is_correct) m[k].c++;
    });
    return Object.entries(m).map(([k,v]) => ({ type: k, attempts: v.t, acc: Math.round(v.c/v.t*100) }));
  }, [attempts]);
  return (
    <section className="rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
      <div className="mb-3 flex items-center gap-1 text-sm font-extrabold"><Trophy className="size-4 text-rose-500" /> 高中练习详情（近 30 天）</div>
      {byType.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">还没有高中练习记录，去 /gaokao 开始吧</div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {byType.map(b => (
            <div key={b.type} className="rounded-2xl border border-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">{labelType(b.type)}</div>
                <div className="text-xs text-muted-foreground">{b.attempts} 题</div>
              </div>
              <div className="mt-1 text-2xl font-black">{b.acc}<span className="text-sm font-bold text-muted-foreground">%</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-gradient-to-r from-rose-400 to-orange-500" style={{ width: `${b.acc}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <Link to="/gaokao" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline">→ 进入高考专区</Link>
    </section>
  );
}

function labelType(t: string): string {
  const map: Record<string, string> = {
    quiz: "选义", listen: "听力", spell: "拼写", match: "配对",
    vocab: "词汇", grammar: "语法", reading: "阅读", cloze: "完形",
  };
  return map[t] ?? t;
}