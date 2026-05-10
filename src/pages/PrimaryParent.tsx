import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles, Headphones, PenLine, Brain, Target, TrendingUp, Volume2, ChevronRight, AlertTriangle, Play, Heart, Calendar, Mic, Eye, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

type Mastery = {
  word_id: string;
  grade: number;
  mastery_level: number;
  quiz_correct: number; quiz_wrong: number;
  listen_correct: number; listen_wrong: number;
  spell_correct: number; spell_wrong: number;
  match_correct: number; match_wrong: number;
  last_seen_at: string | null;
};
type Word = { id: string; word: string; meaning_cn: string; grade: number };
type ScoreRow = { game_type: string; grade: number | null; accuracy: number | null; created_at: string };

const TOTALS: Record<number, number> = { 1:80, 2:120, 3:160, 4:200, 5:220, 6:228 };
const SKILLS = [
  { key: "all",    label: "综合",  icon: Sparkles,    color: "from-pink-500 to-rose-500", c: "quiz_correct", w: "quiz_wrong" },
  { key: "quiz",   label: "选义",  icon: Target,      color: "from-rose-400 to-pink-500", c: "quiz_correct", w: "quiz_wrong" },
  { key: "listen", label: "听力",  icon: Headphones,  color: "from-sky-400 to-cyan-500",  c: "listen_correct", w: "listen_wrong" },
  { key: "spell",  label: "拼写",  icon: PenLine,     color: "from-amber-400 to-orange-500", c: "spell_correct", w: "spell_wrong" },
  { key: "match",  label: "配对",  icon: Brain,       color: "from-violet-400 to-fuchsia-500", c: "match_correct", w: "match_wrong" },
] as const;
type SkillKey = typeof SKILLS[number]["key"];

export default function PrimaryParent() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [grade, setGrade] = useState<number>(1);
  const [skill, setSkill] = useState<SkillKey>("all");
  const [filter, setFilter] = useState<"all"|"new"|"learning"|"familiar"|"mastered">("all");
  const [pet, setPet] = useState<{ level: number; bond: number; xp: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      setAuthed(!!uid);
      if (!uid) { setLoading(false); return; }
      const since = new Date(Date.now() - 30*24*3600*1000).toISOString();
      const [m, w, s] = await Promise.all([
        supabase.from("primary_word_mastery")
          .select("word_id,grade,mastery_level,quiz_correct,quiz_wrong,listen_correct,listen_wrong,spell_correct,spell_wrong,match_correct,match_wrong,last_seen_at")
          .eq("user_id", uid),
        supabase.from("primary_vocab").select("id,word,meaning_cn,grade"),
        supabase.from("primary_game_scores")
          .select("game_type,grade,accuracy,created_at")
          .eq("user_id", uid).gte("created_at", since).order("created_at"),
      ]);
      setMastery((m.data ?? []) as Mastery[]);
      setWords((w.data ?? []) as Word[]);
      setScores((s.data ?? []) as ScoreRow[]);
      const { data: ps } = await supabase
        .from("pet_state").select("level,bond,xp").eq("user_id", uid).maybeSingle();
      if (ps) setPet({ level: ps.level ?? 1, bond: ps.bond ?? 0, xp: ps.xp ?? 0 });
      setLoading(false);
    })();
  }, []);

  const gradeWords = useMemo(() => words.filter(w => w.grade === grade), [words, grade]);
  const masteryByWord = useMemo(() => {
    const m: Record<string, Mastery> = {};
    mastery.forEach(r => { if (r.grade === grade) m[r.word_id] = r; });
    return m;
  }, [mastery, grade]);

  // skill stats for current grade
  const stats = useMemo(() => {
    const list = mastery.filter(r => r.grade === grade);
    const total = TOTALS[grade] ?? gradeWords.length;
    const counts = [0,0,0,0];
    list.forEach(r => counts[r.mastery_level ?? 0]++);
    const seen = counts[1]+counts[2]+counts[3];
    counts[0] = Math.max(0, total - seen);
    const sumK = (k: keyof Mastery) => list.reduce((s,r)=>s+(Number(r[k])||0), 0);
    const skillAcc = (cKey: keyof Mastery, wKey: keyof Mastery) => {
      const c = sumK(cKey), w = sumK(wKey), t = c+w;
      return { acc: t ? Math.round(c/t*100) : 0, attempts: t, correct: c };
    };
    return {
      total, counts,
      quiz:   skillAcc("quiz_correct","quiz_wrong"),
      listen: skillAcc("listen_correct","listen_wrong"),
      spell:  skillAcc("spell_correct","spell_wrong"),
      match:  skillAcc("match_correct","match_wrong"),
    };
  }, [mastery, grade, gradeWords]);

  // 30-day trend per game-type for this grade
  const trend = useMemo(() => {
    const days: Record<string, { date: string; quiz?: number; listen?: number; spell?: number; match?: number; all?: number; counts: Record<string,number[]> }> = {};
    const all = scores.filter(s => s.grade === grade);
    all.forEach(s => {
      const d = s.created_at.slice(5,10);
      if (!days[d]) days[d] = { date: d, counts: { quiz:[], listen:[], spell:[], match:[], all:[] } };
      const acc = (s.accuracy ?? 0) * 100;
      days[d].counts[s.game_type]?.push(acc);
      days[d].counts.all.push(acc);
    });
    return Object.values(days).map(d => {
      const avg = (a: number[]) => a.length ? Math.round(a.reduce((x,y)=>x+y,0)/a.length) : null;
      return { date: d.date, quiz: avg(d.counts.quiz), listen: avg(d.counts.listen), spell: avg(d.counts.spell), match: avg(d.counts.match), all: avg(d.counts.all) };
    });
  }, [scores, grade]);

  const filteredWords = useMemo(() => {
    return gradeWords.filter(w => {
      if (filter === "all") return true;
      const lv = masteryByWord[w.id]?.mastery_level ?? 0;
      return ({ new:0, learning:1, familiar:2, mastered:3 } as any)[filter] === lv;
    });
  }, [gradeWords, masteryByWord, filter]);

  const skillCfg = SKILLS.find(s => s.key === skill)!;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink to="/primary" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回小学专区
      </BackLink>
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">PARENT · DASHBOARD</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">👨‍👩‍👧 家长进度报告</h1>
        <p className="mt-1 text-xs text-muted-foreground">Cambridge YLE × FSRS · 按年级与技能查看掌握度、趋势、词表</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin" /> 加载中…</div>
      ) : authed === false ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">请先登录后再查看</div>
      ) : (
        <>
          {/* Grade tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {[1,2,3,4,5,6].map(g => (
              <button key={g} onClick={() => setGrade(g)}
                className={cn("rounded-full border-2 px-4 py-1.5 text-sm font-extrabold transition",
                  g === grade ? "border-amber-400 bg-amber-400 text-white" : "border-border bg-card hover:border-amber-300")}>
                G{g}
              </button>
            ))}
          </div>

          {/* Skill tabs */}
          <div className="mb-4 grid grid-cols-5 gap-1 rounded-2xl bg-secondary p-1">
            {SKILLS.map(s => (
              <button key={s.key} onClick={() => setSkill(s.key)}
                className={cn("flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-bold transition",
                  skill === s.key ? `bg-gradient-to-br ${s.color} text-white shadow` : "text-muted-foreground hover:text-foreground")}>
                <s.icon className="size-4" />
                {s.label}
              </button>
            ))}
          </div>

          {/* 🆕 五项技能阵列 — 听 / 说 / 读 / 看 / 写 (新课标对齐) */}
          <FiveSkillArray stats={stats} grade={grade} />

          {/* 🆕 Spark 状态卡 */}
          <SparkStatusCard pet={pet} />

          {/* 🆕 本周学习计划 */}
          <WeeklyPlanCard scores={scores} />

          {/* Mastery overview card */}
          <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold">{grade} 年级 · {skillCfg.label}掌握情况</div>
              <div className="text-xs text-muted-foreground">共 {stats.total} 词</div>
            </div>
            {skill === "all" ? (
              <>
                <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-secondary">
                  <div className="bg-emerald-400" style={{ width: `${(stats.counts[3]/stats.total)*100}%` }} />
                  <div className="bg-sky-400"     style={{ width: `${(stats.counts[2]/stats.total)*100}%` }} />
                  <div className="bg-amber-400"   style={{ width: `${(stats.counts[1]/stats.total)*100}%` }} />
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[11px]">
                  <Stat label="已掌握" value={stats.counts[3]} color="text-emerald-600" />
                  <Stat label="熟悉"   value={stats.counts[2]} color="text-sky-600" />
                  <Stat label="学习中" value={stats.counts[1]} color="text-amber-600" />
                  <Stat label="未学"   value={stats.counts[0]} color="text-muted-foreground" />
                </div>
              </>
            ) : (
              <SkillDetail s={(stats as any)[skill]} colorClass={skillCfg.color} />
            )}
          </section>

          {/* Trend chart */}
          <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
            <div className="mb-2 flex items-center gap-1 text-sm font-extrabold">
              <TrendingUp className="size-4 text-emerald-500" /> 近 30 天准确率趋势 · {skillCfg.label}
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
                    <Line type="monotone" dataKey={skill} stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Weak words & action plan */}
          <WeakPlan grade={grade} words={gradeWords} masteryByWord={masteryByWord} />

          {/* Word drill-down */}
          <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-extrabold">📖 {grade} 年级词表（{filteredWords.length}）</div>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5 text-[11px]">
              {[
                { k: "all", l: "全部", c: "bg-secondary text-foreground" },
                { k: "mastered", l: "🟢 已掌握", c: "bg-emerald-100 text-emerald-700" },
                { k: "familiar", l: "🔵 熟悉",   c: "bg-sky-100 text-sky-700" },
                { k: "learning", l: "🟡 学习中", c: "bg-amber-100 text-amber-700" },
                { k: "new",      l: "⚪ 未学",   c: "bg-slate-100 text-slate-600" },
              ].map(o => (
                <button key={o.k} onClick={() => setFilter(o.k as any)}
                  className={cn("rounded-full px-2.5 py-1 font-bold transition", o.c, filter === o.k && "ring-2 ring-amber-400")}>
                  {o.l}
                </button>
              ))}
            </div>
            <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
              {filteredWords.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">该筛选下没有单词</div>
              )}
              {filteredWords.map(w => {
                const m = masteryByWord[w.id];
                const lv = m?.mastery_level ?? 0;
                const dot = ["bg-slate-300","bg-amber-400","bg-sky-400","bg-emerald-500"][lv];
                return (
                  <div key={w.id} className="flex items-center gap-3 py-2.5">
                    <span className={cn("size-2.5 shrink-0 rounded-full", dot)} />
                    <button onClick={() => speak(w.word)} className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground hover:bg-amber-100 hover:text-amber-700">
                      <Volume2 className="size-3.5" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold">{w.word}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{w.meaning_cn}</div>
                    </div>
                    <div className="hidden gap-1 text-[10px] text-muted-foreground sm:flex">
                      <SkillPill label="选" c={m?.quiz_correct} w={m?.quiz_wrong} />
                      <SkillPill label="听" c={m?.listen_correct} w={m?.listen_wrong} />
                      <SkillPill label="拼" c={m?.spell_correct} w={m?.spell_wrong} />
                      <SkillPill label="配" c={m?.match_correct} w={m?.match_wrong} />
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </section>

          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
            <div className="flex items-center gap-1 font-extrabold"><Sparkles className="size-3.5" /> 科学说明</div>
            <p className="mt-1 leading-relaxed">
              掌握度需要孩子在 <b>选义/听音/拼写/配对</b> 至少 3 项中正确，且综合准确率 ≥ 85%。
              此标准对齐 Cambridge YLE 与 CEFR Pre-A1~A2 的 can-do statements。
            </p>
          </div>
        </>
      )}
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return <div><div className={cn("text-lg font-black", color)}>{value}</div><div className="text-muted-foreground">{label}</div></div>;
}

function SkillDetail({ s, colorClass }: { s: { acc: number; attempts: number; correct: number }; colorClass: string }) {
  return (
    <>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-3xl font-black">{s.acc}<span className="text-base font-bold text-muted-foreground">%</span></div>
        <div className="text-xs text-muted-foreground">{s.correct} 对 / {s.attempts} 次</div>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full bg-gradient-to-r ${colorClass}`} style={{ width: `${s.acc}%` }} />
      </div>
    </>
  );
}

function SkillPill({ label, c, w }: { label: string; c?: number; w?: number }) {
  const cc = c ?? 0, ww = w ?? 0, t = cc+ww;
  const acc = t ? Math.round(cc/t*100) : 0;
  return (
    <span className={cn("rounded px-1.5 py-0.5", t ? (acc>=80 ? "bg-emerald-100 text-emerald-700" : acc>=50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700") : "bg-secondary")}>
      {label}{t ? ` ${acc}%` : ""}
    </span>
  );
}

type WeakSkillKey = "listen" | "spell" | "match" | "quiz";
const WEAK_SKILLS: { key: WeakSkillKey; label: string; icon: any; color: string; cKey: keyof Mastery; wKey: keyof Mastery; tip: string; route: (g:number)=>string }[] = [
  { key: "listen", label: "听力", icon: Headphones, color: "from-sky-400 to-cyan-500", cKey: "listen_correct", wKey: "listen_wrong",
    tip: "先听 3 遍发音再选词。建议每天 5 分钟，重点听元音差异。",
    route: (g) => `/primary/games/${g}/listen` },
  { key: "spell",  label: "拼写", icon: PenLine, color: "from-amber-400 to-orange-500", cKey: "spell_correct", wKey: "spell_wrong",
    tip: "看汉语 → 听发音 → 默写。注意首字母大小写、双写字母。",
    route: (g) => `/primary/games/${g}/spell` },
  { key: "match",  label: "配对", icon: Brain, color: "from-violet-400 to-fuchsia-500", cKey: "match_correct", wKey: "match_wrong",
    tip: "翻牌时大声说出单词与中文，建立『看-听-说』三联结。",
    route: (g) => `/primary/games/${g}/match` },
  { key: "quiz",   label: "选义", icon: Target, color: "from-rose-400 to-pink-500", cKey: "quiz_correct", wKey: "quiz_wrong",
    tip: "用单词造一个生活短句，把意思和场景挂钩。",
    route: (g) => `/primary/games/${g}/quiz` },
];

function WeakPlan({ grade, words, masteryByWord }: { grade: number; words: Word[]; masteryByWord: Record<string, Mastery> }) {
  // For each skill, find weak words: attempts >= 1 and acc < 70%, OR mastered overall but never attempted in this skill.
  const buckets = WEAK_SKILLS.map(s => {
    const list = words.map(w => {
      const m = masteryByWord[w.id];
      const c = (m?.[s.cKey] as number) ?? 0;
      const wr = (m?.[s.wKey] as number) ?? 0;
      const t = c + wr;
      const acc = t ? c/t : -1; // -1 = never tried
      return { word: w, acc, attempts: t, score: t === 0 ? 0.5 : 1 - acc }; // higher = weaker
    })
    .filter(x => x.acc >= 0 ? x.acc < 0.7 : (masteryByWord[x.word.id]?.mastery_level ?? 0) >= 1) // not-tried but seen elsewhere → still suggest
    .sort((a,b) => b.score - a.score)
    .slice(0, 8);
    return { skill: s, list };
  });

  const anyWeak = buckets.some(b => b.list.length > 0);
  if (!anyWeak) {
    return (
      <section className="mb-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50/60 p-4 shadow-tile">
        <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-700">
          <Sparkles className="size-4" /> 太棒了！{grade} 年级暂无明显薄弱词
        </div>
        <p className="mt-1 text-xs text-emerald-700/80">继续保持每天一局练习，巩固长期记忆 🌱</p>
      </section>
    );
  }

  return (
    <section className="mb-4 rounded-3xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-amber-50 p-4 shadow-tile">
      <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-rose-700">
        <AlertTriangle className="size-4" /> 智能薄弱词汇 · 今日推荐练习
      </div>
      <div className="grid gap-3">
        {buckets.map(({ skill: s, list }) => (
          <div key={s.key} className="rounded-2xl border border-border bg-card p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className={`grid size-8 place-items-center rounded-xl bg-gradient-to-br ${s.color} text-white`}>
                <s.icon className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-extrabold">{s.label} · {list.length} 个薄弱词</div>
                <div className="text-[11px] text-muted-foreground">{s.tip}</div>
              </div>
              {list.length > 0 && (
                <Link to={s.route(grade)} className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${s.color} px-3 py-1 text-[11px] font-extrabold text-white shadow`}>
                  <Play className="size-3 fill-white" /> 立即练
                </Link>
              )}
            </div>
            {list.length === 0 ? (
              <div className="rounded-lg bg-emerald-50 px-2 py-1.5 text-[11px] text-emerald-700">✓ 此项暂无薄弱词</div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {list.map(({ word: w, acc, attempts }) => (
                  <button key={w.id} onClick={() => speak(w.word)}
                    className="group inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px] hover:border-rose-300">
                    <Volume2 className="size-3 text-muted-foreground group-hover:text-rose-500" />
                    <b className="text-foreground">{w.word}</b>
                    <span className="text-muted-foreground">{w.meaning_cn}</span>
                    <span className={cn("rounded px-1 py-0.5 text-[9px] font-bold",
                      attempts === 0 ? "bg-slate-100 text-slate-600" : acc < 0.4 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>
                      {attempts === 0 ? "未练" : `${Math.round(acc*100)}%`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
