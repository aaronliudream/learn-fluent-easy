import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronDown, ChevronRight, Loader2, RefreshCw, Zap, MapPin } from "lucide-react";
import BackLink from "@/components/BackLink";
import { supabase } from "@/integrations/supabase/client";
import { useDiagnostic } from "@/hooks/useDiagnostic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MasteryBar, MasteryCounts } from "@/components/learning-center/MasteryBar";
import { ItemListDrawer, type ItemState, type StageKey } from "@/components/learning-center/ItemListDrawer";

/**
 * GPS Dashboard · v8 (Completion v3)
 * - 4-state strict palette (master/fluent/weak/none)
 * - Two views: by-stage and by-module
 * - Drill-down to item list drawer
 */

type StageK = StageKey;
interface Counts { master: number; fluent: number; weak: number; none: number; total: number; score_pct: number }
interface ProportionRow extends Counts { proportion_pct: number }
interface StageProp extends ProportionRow { stage: StageK }
interface ModuleProp extends ProportionRow { module: string }
interface ScopeRow extends ProportionRow { stage: StageK; grade: number; module: string }
interface Snap { snap_date: string; score_pct: number }

const STAGES: { key: StageK; label: string; grades: number[]; sub: string; route: string }[] = [
  { key: "primary", label: "小学", grades: [1, 2, 3, 4, 5, 6], sub: "G1-G6", route: "/primary" },
  { key: "junior",  label: "初中", grades: [7, 8, 9],          sub: "G7-G9 · 中考", route: "/junior" },
  { key: "senior",  label: "高中", grades: [10, 11, 12],       sub: "G10-G12 · 高考", route: "/gaokao" },
];

const MODULE_LABEL: Record<string, string> = {
  vocab: "词汇", grammar: "语法", reading: "阅读", listening: "听力",
  writing: "写作", cloze: "完形", phonics: "拼读", lesson: "课文",
};
const MODULE_EMOJI: Record<string, string> = {
  vocab: "📖", grammar: "🔤", reading: "📃", listening: "🎧",
  writing: "✍️", cloze: "🧩", phonics: "🔠", lesson: "📚",
};
const STATE_LABEL: Record<ItemState, string> = {
  master: "已掌握", fluent: "熟练", weak: "薄弱（必练）", none: "未学",
};

/** 按 2022 版义务教育 / 普通高中英语课程标准定义的模块清单。
 *  即使某模块尚无题库数据，也会在年级展开时显示为「未学」占位行。 */
const CURRICULUM_MODULES: Record<StageK, string[]> = {
  primary: ["vocab", "phonics", "listening", "reading", "writing"],
  junior:  ["vocab", "grammar", "listening", "reading", "cloze", "writing"],
  senior:  ["vocab", "grammar", "listening", "reading", "cloze", "writing"],
};

function emptyScope(stage: StageK, grade: number, module: string): ScopeRow {
  return { stage, grade, module,
    master: 0, fluent: 0, weak: 0, none: 0,
    total: 0, score_pct: 0, proportion_pct: 0 };
}

/** Pad the actual scopes for one (stage, grade) with curriculum placeholders. */
function padCurriculum(stage: StageK, grade: number, rows: ScopeRow[]): ScopeRow[] {
  const byMod = new Map(rows.map((r) => [r.module, r]));
  return CURRICULUM_MODULES[stage].map((m) => byMod.get(m) ?? emptyScope(stage, grade, m));
}

const ZERO: Counts = { master: 0, fluent: 0, weak: 0, none: 0, total: 0, score_pct: 0 };

export default function LearningCenter() {
  const [overall, setOverall] = useState<Counts>(ZERO);
  const [stageProps, setStageProps] = useState<StageProp[]>([]);
  const [moduleProps, setModuleProps] = useState<ModuleProp[]>([]);
  const [scopes, setScopes] = useState<ScopeRow[]>([]); // mastery_with_proportions
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);
  const { data: diag, loading: diagLoading, refresh } = useDiagnostic(true);

  const [drawer, setDrawer] = useState<{ stage: StageK; module: string; state: ItemState; grade?: number; title: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) { setSignedIn(false); setLoading(false); } return; }

      const [ovR, spR, mpR, scR, snR] = await Promise.all([
        supabase.from("mastery_overall").select("*").maybeSingle(),
        supabase.from("mastery_stage_proportion").select("*"),
        supabase.from("mastery_module_proportion").select("*"),
        supabase.from("mastery_with_proportions").select("*"),
        supabase.from("mastery_snapshots").select("snap_date,score_pct,stage,grade,module")
          .is("stage", null).is("grade", null).is("module", null)
          .order("snap_date", { ascending: false }).limit(2000),
      ]);
      if (cancelled) return;

      setOverall(coerceOverall(ovR.data));
      setStageProps(((spR.data ?? []) as any[]).map(coerceStageProp));
      setModuleProps(((mpR.data ?? []) as any[]).map(coerceModuleProp));
      setScopes(((scR.data ?? []) as any[]).map(coerceScope));
      setSnaps(((snR.data ?? []) as any[]).map((r) => ({ snap_date: r.snap_date, score_pct: Number(r.score_pct) || 0 })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const timeline = useMemo(() => {
    const now = Date.now();
    const day = 86400000;
    const buckets = [
      { key: "5y", label: "5 年前", cutoff: now - 5 * 365 * day },
      { key: "1y", label: "1 年前", cutoff: now - 365 * day },
      { key: "1mo",label: "1 月前", cutoff: now - 30 * day },
      { key: "1w", label: "1 周前", cutoff: now - 7 * day },
      { key: "last", label: "上次",  cutoff: now - day },
    ];
    const sorted = [...snaps].sort((a, b) => +new Date(a.snap_date) - +new Date(b.snap_date));
    return buckets.map((b) => {
      const found = [...sorted].reverse().find((s) => +new Date(s.snap_date) <= b.cutoff);
      return { ...b, score: found ? Math.round(found.score_pct) : 0 };
    }).concat([{ key: "now", label: "现在", cutoff: now, score: Math.round(overall.score_pct ?? 0) }]);
  }, [snaps, overall]);

  if (!signedIn && !loading) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-center">
        <h1 className="text-2xl font-medium">学习中心</h1>
        <p className="mt-3 text-sm text-muted-foreground">登录后查看你的 GPS Dashboard</p>
        <Link to="/auth" className="mt-4 inline-block rounded-full border border-border px-4 py-2 text-sm font-medium">登录</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 [font-variant-numeric:tabular-nums]">
      <BackLink to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        ← 返回
      </BackLink>

      {/* === AI 诊断卡 === */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-l-4 border-[hsl(210_70%_50%)] bg-[hsl(210_70%_97%)] px-4 py-2 dark:bg-[hsl(210_30%_15%)]">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[hsl(210_70%_45%)]" />
            <span className="text-sm font-medium">AI 学习诊断</span>
            <span className="rounded-full bg-card px-2 py-0.5 text-[10px] text-muted-foreground">基于近 30 天</span>
          </div>
          <button
            onClick={() => refresh(true)}
            disabled={diagLoading}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {diagLoading ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
          </button>
        </div>
        <div className="divide-y divide-border">
          {diag?.insights?.length ? (
            diag.insights.slice(0, 4).map((line, i) => (<DiagnosticRow key={i} text={line} index={i} />))
          ) : (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              {diagLoading ? "诊断生成中…" : "做几道题后,AI 会给你 3 条最值得练的方向。"}
            </div>
          )}
        </div>
      </section>

      {/* === 全局总览大卡 === */}
      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-5">
          <Ring size={110} stroke={12} score={overall.score_pct} c={overall} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold">整个英语学习总进度</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              共 <strong className="font-medium text-foreground">{overall.total.toLocaleString()}</strong> 项 · 全部要学的内容
            </div>
            <div className="mt-2.5">
              <MasteryBar master={overall.master} fluent={overall.fluent} weak={overall.weak} none={overall.none} />
            </div>
            <MasteryCounts
              className="mt-2"
              master={overall.master} fluent={overall.fluent} weak={overall.weak} none={overall.none}
            />
          </div>
        </div>
      </section>

      {/* === 时间轴 === */}
      <section className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4">
        <div className="flex min-w-max items-end gap-1">
          {timeline.map((t, i) => {
            const isNow = t.key === "now";
            return (
              <div key={t.key} className="flex flex-1 flex-col items-center px-1">
                <div className={`text-[10px] ${isNow ? "font-medium text-foreground" : "text-muted-foreground"}`}>{t.label}</div>
                <div className={`mt-0.5 text-base ${isNow ? "font-medium text-gps-master" : "text-foreground/80"}`}>{t.score}%</div>
                {isNow && <MapPin className="mt-0.5 size-3 text-gps-master" />}
                {!isNow && i < timeline.length - 1 && <ChevronRight className="mt-1 size-3 text-muted-foreground/40" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* === 双视图 Tabs === */}
      <Tabs defaultValue="stage" className="mt-5">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="stage">按学段</TabsTrigger>
          <TabsTrigger value="module">按模块</TabsTrigger>
        </TabsList>

        <TabsContent value="stage" className="mt-3">
          <StageView
            stageProps={stageProps}
            scopes={scopes}
            onOpenList={(p) => setDrawer(p)}
          />
        </TabsContent>

        <TabsContent value="module" className="mt-3">
          <ModuleView
            moduleProps={moduleProps}
            scopes={scopes}
            onOpenList={(p) => setDrawer(p)}
          />
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> 加载中…
        </div>
      )}

      {drawer && (
        <ItemListDrawer
          open={!!drawer}
          onOpenChange={(v) => { if (!v) setDrawer(null); }}
          stage={drawer.stage}
          module={drawer.module}
          state={drawer.state}
          grade={drawer.grade}
          title={drawer.title}
        />
      )}
    </main>
  );
}

/* ============ Stage View ============ */
function StageView({
  stageProps, scopes, onOpenList,
}: {
  stageProps: StageProp[];
  scopes: ScopeRow[];
  onOpenList: (p: { stage: StageK; module: string; state: ItemState; grade?: number; title: string }) => void;
}) {
  const [openStage, setOpenStage] = useState<StageK | null>(null);
  const [openGrade, setOpenGrade] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {/* 三张学段卡 */}
      <div className="grid gap-2 sm:grid-cols-3">
        {STAGES.map((s) => {
          const sp = stageProps.find((r) => r.stage === s.key);
          const c: Counts = sp ?? ZERO;
          const prop = sp?.proportion_pct ?? 0;
          const isOpen = openStage === s.key;
          return (
            <button
              key={s.key}
              onClick={() => { setOpenStage(isOpen ? null : s.key); setOpenGrade(null); }}
              className={`flex flex-col gap-2 rounded-2xl border p-3 text-left transition ${
                isOpen ? "border-foreground/40 bg-muted/40" : "border-border bg-card hover:bg-muted/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <Ring size={64} stroke={8} score={c.score_pct} c={c} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">{s.label}</div>
                  <div className="text-[10px] text-muted-foreground">{s.sub}</div>
                </div>
              </div>
              <MasteryBar master={c.master} fluent={c.fluent} weak={c.weak} none={c.none} height={6} />
              <MasteryCounts master={c.master} fluent={c.fluent} weak={c.weak} none={c.none} className="text-[10px]" />
            </button>
          );
        })}
      </div>

      {/* 展开学段 → 年级行 */}
      {openStage && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-medium text-muted-foreground">
            {STAGES.find((s) => s.key === openStage)!.label} · 各年级
          </div>
          <div className="divide-y divide-border">
            {STAGES.find((s) => s.key === openStage)!.grades.map((g) => {
              const stageScopes = scopes.filter((r) => r.stage === openStage && r.grade === g);
              const agg = aggregate(stageScopes);
              const stageTotal = stageProps.find((r) => r.stage === openStage)?.total ?? 0;
              const inStagePct = stageTotal > 0 ? Math.round((agg.total / stageTotal) * 1000) / 10 : 0;
              const gradeKey = `${openStage}-${g}`;
              const expanded = openGrade === gradeKey;
              return (
                <div key={g}>
                  <button
                    onClick={() => setOpenGrade(expanded ? null : gradeKey)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/20"
                  >
                    <div className="w-10 shrink-0 text-[11px] font-bold text-muted-foreground">G{g}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between text-[11px]">
                        <span className="font-medium tabular-nums">{Math.round(agg.score_pct)}%</span>
                        <span className="text-muted-foreground">占{STAGES.find((s) => s.key === openStage)!.label} {inStagePct}%</span>
                      </div>
                      <MasteryBar className="mt-1" master={agg.master} fluent={agg.fluent} weak={agg.weak} none={agg.none} height={6} />
                      <MasteryCounts className="mt-1 text-[10px]" master={agg.master} fluent={agg.fluent} weak={agg.weak} none={agg.none} />
                    </div>
                    <ChevronDown className={`size-4 text-muted-foreground transition ${expanded ? "rotate-180" : ""}`} />
                  </button>

                  {expanded && (
                    <div className="space-y-1.5 border-t border-border bg-muted/20 px-4 py-3">
                      <p className="mb-1 text-[10px] text-muted-foreground">
                        按 2022 新课标 · {STAGES.find((s) => s.key === openStage)!.label}英语模块
                      </p>
                      {padCurriculum(openStage, g, stageScopes).map((m) => (
                        <ModuleScopeRow
                          key={m.module}
                          stage={openStage}
                          grade={g}
                          row={m}
                          onOpenList={onOpenList}
                          titlePrefix={`${STAGES.find((s) => s.key === openStage)!.label} G${g} · ${MODULE_LABEL[m.module] ?? m.module}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Module View ============ */
function ModuleView({
  moduleProps, scopes, onOpenList,
}: {
  moduleProps: ModuleProp[];
  scopes: ScopeRow[];
  onOpenList: (p: { stage: StageK; module: string; state: ItemState; grade?: number; title: string }) => void;
}) {
  const [openModule, setOpenModule] = useState<string | null>(null);

  if (moduleProps.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground">
        还没有任何模块数据，先去做几道题。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {moduleProps
          .slice()
          .sort((a, b) => b.total - a.total)
          .map((m) => {
            const c: Counts = m;
            const isOpen = openModule === m.module;
            return (
              <button
                key={m.module}
                onClick={() => setOpenModule(isOpen ? null : m.module)}
                className={`flex flex-col gap-2 rounded-2xl border p-3 text-left transition ${
                  isOpen ? "border-foreground/40 bg-muted/40" : "border-border bg-card hover:bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Ring size={56} stroke={7} score={c.score_pct} c={c} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm font-bold">
                      <span aria-hidden>{MODULE_EMOJI[m.module] ?? "🧠"}</span>
                      {MODULE_LABEL[m.module] ?? m.module}
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      共 <strong className="font-medium text-foreground tabular-nums">{m.total}</strong> 项 · 点击看各年级掌握情况
                    </div>
                  </div>
                </div>
                <MasteryBar master={c.master} fluent={c.fluent} weak={c.weak} none={c.none} height={6} />
                <MasteryCounts master={c.master} fluent={c.fluent} weak={c.weak} none={c.none} className="text-[10px]" />
              </button>
            );
          })}
      </div>

      {openModule && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-medium text-muted-foreground">
            {MODULE_LABEL[openModule] ?? openModule} · 三学段分布
          </div>
          <div className="divide-y divide-border">
            {STAGES.map((s) => {
              const rows = scopes.filter((r) => r.module === openModule && r.stage === s.key);
              if (rows.length === 0) return null;
              const agg = aggregate(rows);
              const moduleTotal = moduleProps.find((r) => r.module === openModule)?.total ?? 0;
              const inModulePct = moduleTotal > 0 ? Math.round((agg.total / moduleTotal) * 1000) / 10 : 0;
              return (
                <div key={s.key} className="px-4 py-3">
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="font-bold">{s.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      掌握度 <span className="tabular-nums font-bold text-foreground">{Math.round(agg.score_pct)}%</span> · 共 {agg.total} 项
                    </span>
                  </div>
                  <MasteryBar className="mt-1.5" master={agg.master} fluent={agg.fluent} weak={agg.weak} none={agg.none} height={6} />
                  {/* —— 各年级掌握度（点击可下钻到题目列表） —— */}
                  <div className="mt-2.5 space-y-1.5">
                    <div className="text-[10px] font-medium text-muted-foreground">各年级掌握度</div>
                    {s.grades.map((g) => {
                      const gRow = rows.find((r) => r.grade === g);
                      const c: Counts = gRow ?? ZERO;
                      const empty = c.total === 0;
                      return (
                        <div
                          key={g}
                          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                            empty ? "border-dashed border-border/60 bg-muted/10" : "border-border bg-background"
                          }`}
                        >
                          <span className="w-9 shrink-0 text-[10px] font-bold text-muted-foreground">G{g}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between text-[10px]">
                              {empty ? (
                                <span className="text-muted-foreground">未学</span>
                              ) : (
                                <>
                                  <span className="tabular-nums font-medium">{Math.round(c.score_pct)}%</span>
                                  <span className="text-muted-foreground tabular-nums">{c.total} 项</span>
                                </>
                              )}
                            </div>
                            <MasteryBar className="mt-1" master={c.master} fluent={c.fluent} weak={c.weak} none={c.none} height={4} />
                          </div>
                          <div className="hidden gap-1 sm:flex">
                            {(["master", "fluent", "weak", "none"] as ItemState[]).map((st) => {
                              const n = (c as any)[st] as number;
                              return (
                                <button
                                  key={st}
                                  disabled={n === 0}
                                  onClick={() => onOpenList({
                                    stage: s.key, module: openModule, state: st, grade: g,
                                    title: `${s.label} G${g} · ${MODULE_LABEL[openModule] ?? openModule} · ${STATE_LABEL[st]}`,
                                  })}
                                  className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] transition hover:bg-muted ${
                                    n === 0 ? "opacity-30" : ""
                                  }`}
                                  title={`${STATE_LABEL[st]}: ${n}`}
                                >
                                  <span className={`size-1.5 rounded-full bg-gps-${st}`} />
                                  <span className="tabular-nums">{n}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* —— 学段汇总分状态入口 —— */}
                  <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {(["master", "fluent", "weak", "none"] as ItemState[]).map((st) => {
                      const n = (agg as any)[st] as number;
                      const dot = `bg-gps-${st}`;
                      return (
                        <button
                          key={st}
                          disabled={n === 0}
                          onClick={() => onOpenList({
                            stage: s.key,
                            module: openModule,
                            state: st,
                            title: `${s.label} · ${MODULE_LABEL[openModule] ?? openModule} · ${STATE_LABEL[st]}`,
                          })}
                          className={`flex items-center justify-between rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] transition hover:bg-muted ${
                            n === 0 ? "opacity-40" : ""
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className={`size-2 rounded-full ${dot}`} />
                            {STATE_LABEL[st]}
                          </span>
                          <span className="font-medium tabular-nums">{n}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleScopeRow({
  stage, grade, row, titlePrefix, onOpenList,
}: {
  stage: StageK; grade: number; row: ScopeRow; titlePrefix: string;
  onOpenList: (p: { stage: StageK; module: string; state: ItemState; grade?: number; title: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const empty = row.total === 0;
  return (
    <div className={`rounded-xl border bg-card ${empty ? "border-dashed border-border/60" : "border-border"}`}>
      <button
        onClick={() => !empty && setOpen(!open)}
        disabled={empty}
        className="flex w-full items-center gap-3 px-3 py-2 text-left"
      >
        <span className="text-base" aria-hidden>{MODULE_EMOJI[row.module] ?? "🧠"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between text-[11px]">
            <span className={`font-bold ${empty ? "text-muted-foreground" : ""}`}>
              {MODULE_LABEL[row.module] ?? row.module}
            </span>
            {empty ? (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                未开放
              </span>
            ) : (
              <span className="text-muted-foreground tabular-nums">{Math.round(row.score_pct)}%</span>
            )}
          </div>
          <MasteryBar className="mt-1" master={row.master} fluent={row.fluent} weak={row.weak} none={row.none} height={5} />
        </div>
        {!empty && <ChevronDown className={`size-3.5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />}
      </button>
      {open && !empty && (
        <div className="grid grid-cols-2 gap-1.5 border-t border-border bg-muted/20 px-3 py-2 sm:grid-cols-4">
          {(["master", "fluent", "weak", "none"] as ItemState[]).map((st) => {
            const n = (row as any)[st] as number;
            const dot = `bg-gps-${st}`;
            return (
              <button
                key={st}
                disabled={n === 0}
                onClick={() => onOpenList({
                  stage, module: row.module, state: st, grade,
                  title: `${titlePrefix} · ${STATE_LABEL[st]}`,
                })}
                className={`flex items-center justify-between rounded-md border border-border bg-background px-2 py-1 text-[10px] hover:bg-muted ${
                  n === 0 ? "opacity-40" : ""
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className={`size-1.5 rounded-full ${dot}`} />
                  {STATE_LABEL[st]}
                </span>
                <span className="font-medium tabular-nums">{n}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ helpers ============ */

function num(v: any) { return Number(v) || 0; }

function coerceOverall(r: any): Counts {
  if (!r) return ZERO;
  return { master: num(r.master), fluent: num(r.fluent), weak: num(r.weak), none: num(r.none),
           total: num(r.total), score_pct: num(r.score_pct) };
}
function coerceStageProp(r: any): StageProp {
  return { stage: r.stage as StageK,
           master: num(r.master_count), fluent: num(r.fluent_count), weak: num(r.weak_count), none: num(r.none_count),
           total: num(r.stage_total), score_pct: num(r.score_pct), proportion_pct: num(r.proportion_pct) };
}
function coerceModuleProp(r: any): ModuleProp {
  return { module: r.module,
           master: num(r.master_count), fluent: num(r.fluent_count), weak: num(r.weak_count), none: num(r.none_count),
           total: num(r.module_total), score_pct: num(r.score_pct), proportion_pct: num(r.proportion_pct) };
}
function coerceScope(r: any): ScopeRow {
  return { stage: r.stage as StageK, grade: num(r.grade), module: r.module,
           master: num(r.master_count), fluent: num(r.fluent_count), weak: num(r.weak_count), none: num(r.none_count),
           total: num(r.scope_total), score_pct: num(r.score_pct), proportion_pct: num(r.proportion_of_total) };
}
function aggregate(rows: ScopeRow[]): Counts {
  const a = { master: 0, fluent: 0, weak: 0, none: 0, total: 0, score_pct: 0 };
  for (const r of rows) { a.master += r.master; a.fluent += r.fluent; a.weak += r.weak; a.none += r.none; a.total += r.total; }
  if (a.total > 0) a.score_pct = Math.round(((a.master + a.fluent * 0.7 + a.weak * 0.3) / a.total) * 1000) / 10;
  return a;
}

/* ---- Ring (SVG, 4-color segmented) ---- */
function Ring({ size, stroke, score, c, hideLabel }: { size: number; stroke: number; score: number; c: Counts; hideLabel?: boolean }) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const total = Math.max(1, c.total);
  const seg = (n: number) => (n / total) * C;
  const off = { master: 0, fluent: seg(c.master), weak: seg(c.master) + seg(c.fluent) };
  const cx = size / 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} stroke="hsl(var(--gps-none))" strokeWidth={stroke} fill="none" />
        {c.total > 0 && (
          <>
            <circle cx={cx} cy={cx} r={r} stroke="hsl(var(--gps-master))" strokeWidth={stroke} fill="none"
              strokeDasharray={`${seg(c.master)} ${C}`} strokeDashoffset={-off.master} />
            <circle cx={cx} cy={cx} r={r} stroke="hsl(var(--gps-fluent))" strokeWidth={stroke} fill="none"
              strokeDasharray={`${seg(c.fluent)} ${C}`} strokeDashoffset={-off.fluent} />
            <circle cx={cx} cy={cx} r={r} stroke="hsl(var(--gps-weak))" strokeWidth={stroke} fill="none"
              strokeDasharray={`${seg(c.weak)} ${C}`} strokeDashoffset={-off.weak} />
          </>
        )}
      </svg>
      {!hideLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-base font-medium leading-none">{Math.round(score)}%</div>
          <div className="mt-0.5 text-[9px] text-muted-foreground">掌握度</div>
        </div>
      )}
    </div>
  );
}

function DiagnosticRow({ text, index }: { text: string; index: number }) {
  const tones = [
    { bar: "bg-gps-master/15", icon: "📈", btn: "继续学" },
    { bar: "bg-gps-weak/15",   icon: "⚠️",  btn: "立即训练" },
    { bar: "bg-gps-fluent/15", icon: "⏰", btn: "5 分钟复习" },
    { bar: "bg-muted",          icon: "💡", btn: "去看看" },
  ];
  const t = tones[index] ?? tones[3];
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${t.bar}`}>
      <span className="text-base">{t.icon}</span>
      <div className="flex-1 text-xs leading-relaxed">{text}</div>
      <button className="shrink-0 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium hover:bg-muted">
        {t.btn}
      </button>
    </div>
  );
}
