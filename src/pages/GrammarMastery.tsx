import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useGrammarMastery, type MergedPoint } from "@/hooks/useGrammarMastery";
import { bandOf, BAND_META, type MasteryBand } from "@/lib/grammarMastery";

type Stage = "primary" | "junior" | "gaokao";
type Filter = "all" | "mastered" | "learning" | "weak";

function StageView({ stage }: { stage: Stage }) {
  const { signedIn, loading, points } = useGrammarMastery(stage);
  const [filter, setFilter] = useState<Filter>("all");

  const stats = useMemo(() => {
    const total = points.length;
    const avg = total ? Math.round(points.reduce((s, p) => s + p.score, 0) / total) : 0;
    let mastered = 0, learning = 0, weak = 0;
    for (const p of points) {
      const b = bandOf(p.score, p.attempts);
      if (b === "expert" || b === "mastered") mastered++;
      else if (b === "ok") learning++;
      else if (b === "weak") weak++;
    }
    return { total, avg, mastered, learning, weak };
  }, [points]);

  const filtered = useMemo(() => {
    return points.filter((p) => {
      const b = bandOf(p.score, p.attempts);
      if (filter === "all") return true;
      if (filter === "mastered") return b === "expert" || b === "mastered";
      if (filter === "learning") return b === "ok";
      if (filter === "weak") return b === "weak" || b === "untouched";
      return true;
    });
  }, [points, filter]);

  // Sort weakest → strongest for the histogram
  const sorted = useMemo(() => [...points].sort((a, b) => b.score - a.score), [points]);

  const grouped = useMemo(() => {
    const map = new Map<string, MergedPoint[]>();
    for (const p of filtered) {
      const arr = map.get(p.category) || [];
      arr.push(p);
      map.set(p.category, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <Sparkles className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">登录后即可查看你的语法掌握全景</p>
        <Link to="/auth" className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          立即登录 <ArrowRight className="size-3.5" />
        </Link>
      </div>
    );
  }

  if (loading) return <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">加载中…</div>;

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        该学段尚未配置语法考点（敬请期待）。
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Overview */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat n={`${stats.avg}%`} label="平均掌握度" tone="text-primary" hint={`共 ${stats.total} 个考点`} />
        <Stat n={stats.mastered}  label="🌳 已掌握"   tone="text-emerald-600 dark:text-emerald-400" hint={stats.total ? `占比 ${Math.round(stats.mastered/stats.total*100)}%` : ""} />
        <Stat n={stats.learning}  label="🌿 学习中"   tone="text-amber-600 dark:text-amber-400"   hint="掌握度 55-74%" />
        <Stat n={stats.weak}      label="⚠️ 需加强"   tone="text-rose-600 dark:text-rose-400"     hint="掌握度 < 55%" />
      </section>

      {/* Histogram */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-bold">掌握度分布</h3>
        <div className="flex h-24 items-end gap-1">
          {sorted.map((p) => {
            const b = bandOf(p.score, p.attempts);
            const h = Math.max(8, Math.round(p.score));
            return (
              <div
                key={p.id}
                title={`${p.name} · ${Math.round(p.score)}%`}
                className={`flex-1 rounded-t ${BAND_META[b].bar}`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          {(Object.keys(BAND_META) as MasteryBand[]).map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5">
              <span className={`inline-block size-2.5 rounded ${BAND_META[b].bar}`} />
              {BAND_META[b].label}
            </span>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap gap-2">
        {([
          ["all",      `全部考点 (${stats.total})`],
          ["mastered", `✅ 已掌握 (${stats.mastered})`],
          ["learning", `⏳ 学习中 (${stats.learning})`],
          ["weak",     `⚠️ 需加强 (${stats.weak + Math.max(0, stats.total - stats.mastered - stats.learning - stats.weak)})`],
        ] as [Filter, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      {/* Groups */}
      {grouped.map(([cat, items]) => (
        <section key={cat} className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-bold">{cat}</h3>
          <div className="space-y-2.5">
            {items.map((p) => {
              const b = bandOf(p.score, p.attempts);
              const meta = BAND_META[b];
              return (
                <div key={p.id} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {p.grade} · 已练 {p.attempts} 题 · 正确 {p.correct}
                      </div>
                    </div>
                    <div className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.tone} bg-muted`}>
                      {meta.label.split(" ")[0]} {Math.round(p.score)}%
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${meta.bar} transition-all`} style={{ width: `${Math.max(2, p.score)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Quick action */}
      <Link
        to="/grammar-lab/subjunctive"
        className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-4 text-white shadow-tile transition-all hover:-translate-y-0.5"
      >
        <div className="grid size-12 place-items-center rounded-xl bg-white/20 text-2xl">▶</div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-85">📍 去练一练</div>
          <div className="text-base font-extrabold">虚拟语气全攻克</div>
        </div>
        <ArrowRight className="size-5" />
      </Link>
    </div>
  );
}

function Stat({ n, label, tone, hint }: { n: number | string; label: string; tone: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold tabular-nums ${tone}`}>{n}</div>
      {hint && <div className="mt-0.5 text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export default function GrammarMastery() {
  const [stage, setStage] = useState<Stage>("gaokao");
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <PageHeader title="📊 语法掌握全景图" subtitle="按学段查看每个语法考点的掌握度，弱项一目了然" back="/dashboard" />
      <Tabs value={stage} onValueChange={(v) => setStage(v as Stage)} className="mt-4">
        <TabsList className="grid w-full max-w-sm grid-cols-3">
          <TabsTrigger value="primary">小学</TabsTrigger>
          <TabsTrigger value="junior">初中</TabsTrigger>
          <TabsTrigger value="gaokao">高中</TabsTrigger>
        </TabsList>
        <TabsContent value="primary" className="mt-5"><StageView stage="primary" /></TabsContent>
        <TabsContent value="junior" className="mt-5"><StageView stage="junior" /></TabsContent>
        <TabsContent value="gaokao" className="mt-5"><StageView stage="gaokao" /></TabsContent>
      </Tabs>
    </main>
  );
}