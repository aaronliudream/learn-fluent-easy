import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Loader2, Sparkles, Headphones, PenLine, Brain, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Mastery = {
  grade: number; mastery_level: number;
  quiz_correct: number; quiz_wrong: number;
  listen_correct: number; listen_wrong: number;
  spell_correct: number; spell_wrong: number;
  match_correct: number; match_wrong: number;
};

const TOTALS: Record<number, number> = { 1:80, 2:120, 3:160, 4:200, 5:220, 6:228 };

export default function PrimaryParent() {
  const [rows, setRows] = useState<Mastery[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      setAuthed(!!uid);
      if (!uid) { setLoading(false); return; }
      const { data } = await supabase
        .from("primary_word_mastery")
        .select("grade,mastery_level,quiz_correct,quiz_wrong,listen_correct,listen_wrong,spell_correct,spell_wrong,match_correct,match_wrong")
        .eq("user_id", uid);
      setRows((data ?? []) as Mastery[]);
      setLoading(false);
    })();
  }, []);

  const byGrade = useMemo(() => {
    const map: Record<number, Mastery[]> = {};
    rows.forEach(r => { (map[r.grade] ??= []).push(r); });
    return map;
  }, [rows]);

  const overallStats = (list: Mastery[]) => {
    const counts = [0,0,0,0]; // new(0)/learning/familiar/mastered
    list.forEach(r => counts[r.mastery_level ?? 0]++);
    const skill = (c: number, w: number) => {
      const t = c + w; return { acc: t ? Math.round(c/t*100) : 0, attempts: t };
    };
    const sum = (k: keyof Mastery) => list.reduce((s, r) => s + (Number(r[k]) || 0), 0);
    return {
      counts,
      quiz:   skill(sum("quiz_correct"),   sum("quiz_wrong")),
      listen: skill(sum("listen_correct"), sum("listen_wrong")),
      spell:  skill(sum("spell_correct"),  sum("spell_wrong")),
      match:  skill(sum("match_correct"),  sum("match_wrong")),
    };
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <Link to="/primary" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回小学专区
      </Link>
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">PARENT · DASHBOARD</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">👨‍👩‍👧 家长进度报告</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          基于 Cambridge YLE × FSRS 间隔重复 · 每个单词追踪 4 项技能
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> 加载中…
        </div>
      ) : authed === false ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          请先登录后再查看孩子的学习数据
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-2 text-[11px]">
            <Tag color="bg-slate-200 text-slate-700">⚪ 未学</Tag>
            <Tag color="bg-amber-200 text-amber-800">🟡 学习中</Tag>
            <Tag color="bg-sky-200 text-sky-800">🔵 熟悉</Tag>
            <Tag color="bg-emerald-300 text-emerald-900">🟢 已掌握</Tag>
          </div>

          <section className="grid gap-3">
            {[1,2,3,4,5,6].map(g => {
              const list = byGrade[g] ?? [];
              const total = TOTALS[g] ?? list.length;
              const s = overallStats(list);
              const mastered = s.counts[3];
              const familiar = s.counts[2];
              const learning = s.counts[1];
              const seen = mastered + familiar + learning;
              const newCount = Math.max(0, total - seen);
              const masteredPct = Math.round((mastered/total)*100);
              const seenPct = Math.round((seen/total)*100);
              return (
                <div key={g} className="rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="size-4 text-amber-500" />
                      <span className="text-base font-extrabold">{g} 年级</span>
                      <span className="text-xs text-muted-foreground">· 共 {total} 词</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-extrabold text-emerald-600">{masteredPct}%</span>
                      <span className="text-muted-foreground"> 已掌握</span>
                    </div>
                  </div>

                  {/* Stacked bar */}
                  <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-secondary">
                    <div className="bg-emerald-400" style={{ width: `${(mastered/total)*100}%` }} />
                    <div className="bg-sky-400"     style={{ width: `${(familiar/total)*100}%` }} />
                    <div className="bg-amber-400"   style={{ width: `${(learning/total)*100}%` }} />
                  </div>
                  <div className="mt-1 grid grid-cols-4 gap-2 text-center text-[11px] text-muted-foreground">
                    <div><b className="text-emerald-600">{mastered}</b> 已掌握</div>
                    <div><b className="text-sky-600">{familiar}</b> 熟悉</div>
                    <div><b className="text-amber-600">{learning}</b> 学习中</div>
                    <div><b>{newCount}</b> 未学</div>
                  </div>

                  {/* Per-skill accuracy */}
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <SkillBar icon={Target} label="选义" data={s.quiz} color="from-rose-400 to-pink-500" />
                    <SkillBar icon={Headphones} label="听音" data={s.listen} color="from-sky-400 to-cyan-500" />
                    <SkillBar icon={Brain} label="翻牌" data={s.match} color="from-violet-400 to-fuchsia-500" />
                    <SkillBar icon={PenLine} label="拼写" data={s.spell} color="from-amber-400 to-orange-500" />
                  </div>

                  <div className="mt-3 flex justify-between gap-2">
                    <Link to={`/primary/games/${g}`} className="flex-1 rounded-xl bg-secondary py-2 text-center text-xs font-bold hover:bg-secondary/70">
                      去练习 →
                    </Link>
                    <Link to={`/primary/grade/${g}`} className="flex-1 rounded-xl bg-secondary py-2 text-center text-xs font-bold hover:bg-secondary/70">
                      课程 →
                    </Link>
                  </div>
                </div>
              );
            })}
          </section>

          <div className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
            <div className="flex items-center gap-1 font-extrabold"><Sparkles className="size-3.5" /> 科学说明</div>
            <p className="mt-1 leading-relaxed">
              每个单词需要在 <b>选义/听音/翻牌/拼写</b> 中至少 3 项正确、且综合正确率 ≥ 85% 才算"已掌握"。
              这套标准对齐 Cambridge YLE 与 CEFR Pre-A1~A2，确保孩子既会读、会听，也会写。
            </p>
          </div>
        </>
      )}
    </main>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className={`rounded-full px-2 py-0.5 font-bold ${color}`}>{children}</span>;
}

function SkillBar({ icon: Icon, label, data, color }: { icon: any; label: string; data: { acc: number; attempts: number }; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-2">
      <div className="flex items-center gap-1 text-[11px] font-bold">
        <Icon className="size-3" /> {label}
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${data.acc}%` }} />
      </div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{data.acc}% · {data.attempts} 次</div>
    </div>
  );
}
