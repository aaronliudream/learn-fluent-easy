import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Sparkles, Loader2, RefreshCw, AlertTriangle, Clock, Sprout, Trophy } from "lucide-react";
import BackLink from "@/components/BackLink";
import { supabase } from "@/integrations/supabase/client";
import { useDiagnostic } from "@/hooks/useDiagnostic";
import { CompositionDrawer } from "@/components/learning-center/CompositionDrawer";

/**
 * GPS Dashboard — 学习中心首页
 * 严格 4 色（master/fluent/weak/none），无渐变 / 无 3D / 无玻璃 / 无粒子。
 */

interface Overall { master: number; fluent: number; weak: number; none: number; total: number; score_pct: number }
interface ModuleStat { module: string; master: number; fluent: number; weak: number; none: number; total: number; score_pct: number }

const MODULE_LABEL: Record<string, string> = {
  vocab: "词汇", grammar: "语法", reading: "阅读", listening: "听力",
  writing: "写作", cloze: "完形", phonics: "拼读",
};
const MODULE_LINK: Record<string, string> = {
  vocab: "/junior/vocab", grammar: "/junior/grammar", reading: "/junior/reading",
  listening: "/junior/listening", writing: "/junior/writing", cloze: "/gaokao/cloze", phonics: "/primary/letters",
};

export default function LearningCenter() {
  const [overall, setOverall] = useState<Overall | null>(null);
  const [modules, setModules] = useState<ModuleStat[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: diag, loading: diagLoading, refresh } = useDiagnostic(true);

  useEffect(() => {
    (async () => {
      const { data: ov } = await supabase.from("mastery_overall").select("*").maybeSingle();
      setOverall((ov as any) || { master: 0, fluent: 0, weak: 0, none: 0, total: 0, score_pct: 0 });
      const { data: mods } = await supabase
        .from("mastery_by_module_overall")
        .select("module, master, fluent, weak, none, total, score_pct");
      setModules((mods as any) || []);
    })();
  }, []);

  const t = Math.max(1, overall?.total ?? 1);
  const pct = (n: number) => Math.round((n / t) * 100);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink to="/dashboard" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        ← 返回 Dashboard
      </BackLink>

      <header className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">LEARNING CENTER</div>
        <h1 className="mt-1 text-2xl font-extrabold">学习地图</h1>
        <p className="mt-1 text-xs text-muted-foreground">按教育部新课标 2022 · 不计入情景对话与口语</p>
      </header>

      {/* 顶部 GPS 总览卡 — 4 色分段 */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground">总掌握度</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-5xl font-black text-gps-master">{Math.round(overall?.score_pct ?? 0)}</span>
              <span className="text-base font-bold text-muted-foreground">%</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{overall?.master ?? 0} / {overall?.total ?? 0} 已掌握</div>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            <Layers className="size-3.5" /> 学习构成
          </button>
        </div>

        {/* 4 色分段条 */}
        <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-gps-none">
          {overall && overall.total > 0 && (
            <>
              <div className="h-full bg-gps-master" style={{ width: `${pct(overall.master)}%` }} />
              <div className="h-full bg-gps-fluent" style={{ width: `${pct(overall.fluent)}%` }} />
              <div className="h-full bg-gps-weak"   style={{ width: `${pct(overall.weak)}%`   }} />
            </>
          )}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-[11px]">
          <Legend dot="bg-gps-master" label="掌握" n={overall?.master ?? 0} />
          <Legend dot="bg-gps-fluent" label="熟练" n={overall?.fluent ?? 0} />
          <Legend dot="bg-gps-weak"   label="薄弱" n={overall?.weak ?? 0} />
          <Legend dot="bg-gps-none"   label="未学" n={overall?.none ?? 0} />
        </div>
      </section>

      {/* AI 诊断卡 — 复用阶段 3 引擎 */}
      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gps-weak" />
            <h2 className="text-sm font-bold">AI 诊断</h2>
            {diag?.source === "cache" && <span className="text-[10px] text-muted-foreground">已缓存</span>}
            {diag?.source === "template" && <span className="text-[10px] text-muted-foreground">规则建议</span>}
          </div>
          <button
            onClick={() => refresh(true)}
            disabled={diagLoading}
            className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[11px] font-bold text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            {diagLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />} 刷新
          </button>
        </div>
        {diag ? (
          <>
            <p className="mt-2 text-sm text-foreground">{diag.summary}</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {diag.insights.map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gps-master" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {diag.expected_gain > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gps-fluent/15 px-3 py-1 text-[11px] font-bold text-gps-master">
                坚持一周预计 +{diag.expected_gain}%
              </div>
            )}
          </>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">{diagLoading ? "诊断生成中…" : "暂无诊断"}</p>
        )}
      </section>

      {/* 模块清单 */}
      <section className="mt-4">
        <h2 className="mb-2 text-sm font-bold text-muted-foreground">按模块</h2>
        <ul className="space-y-2">
          {modules.map((m) => {
            const total = Math.max(1, m.total);
            return (
              <li key={m.module}>
                <Link
                  to={MODULE_LINK[m.module] ?? "/dashboard"}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:bg-muted/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{MODULE_LABEL[m.module] ?? m.module}</span>
                      <span className="text-xs font-mono text-muted-foreground">{Math.round(m.score_pct ?? 0)}%</span>
                    </div>
                    <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-gps-none">
                      <div className="h-full bg-gps-master" style={{ width: `${(m.master / total) * 100}%` }} />
                      <div className="h-full bg-gps-fluent" style={{ width: `${(m.fluent / total) * 100}%` }} />
                      <div className="h-full bg-gps-weak"   style={{ width: `${(m.weak   / total) * 100}%` }} />
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {m.master} 掌握 · {m.fluent} 熟练 · {m.weak} 薄弱 · {m.none} 未学
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
          {modules.length === 0 && (
            <li className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              还没有数据
            </li>
          )}
        </ul>
      </section>

      <CompositionDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* 5 清单入口 — 按状态 / 按学段 */}
      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold text-muted-foreground">清单</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <CohortTile to="/learning-center/list?cohort=weak"   icon={AlertTriangle} label="高频薄弱" tone="text-gps-weak"   n={overall?.weak ?? 0} />
          <CohortTile to="/learning-center/list?cohort=due"    icon={Clock}         label="今日到期" tone="text-gps-weak"   />
          <CohortTile to="/learning-center/list?cohort=none"   icon={Sprout}        label="全部未学" tone="text-muted-foreground" n={overall?.none ?? 0} />
          <CohortTile to="/learning-center/list?cohort=master" icon={Trophy}        label="已掌握"   tone="text-gps-master" n={overall?.master ?? 0} />
          <CohortTile to="/learning-center/list?cohort=recent" icon={Sparkles}      label="最近练习" tone="text-gps-fluent" />
        </div>
      </section>
    </main>
  );
}

function CohortTile({ to, icon: Icon, label, tone, n }: { to: string; icon: any; label: string; tone: string; n?: number }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3 transition hover:bg-muted/40"
    >
      <Icon className={`size-5 ${tone}`} />
      <span className="text-xs font-bold">{label}</span>
      {typeof n === "number" && <span className="text-[10px] font-mono text-muted-foreground">{n}</span>}
    </Link>
  );
}

function Legend({ dot, label, n }: { dot: string; label: string; n: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${dot}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-mono font-bold text-foreground">{n}</span>
    </div>
  );
}