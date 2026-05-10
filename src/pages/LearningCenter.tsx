import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronDown, ChevronRight, Loader2, RefreshCw, Zap, MapPin } from "lucide-react";
import BackLink from "@/components/BackLink";
import { supabase } from "@/integrations/supabase/client";
import { useDiagnostic } from "@/hooks/useDiagnostic";

/**
 * GPS Dashboard · v7 阶段 4
 * 严格 4 色（master/fluent/weak/none）· 字重 500 · tabular-nums · 无渐变/3D/玻璃
 */

type StageKey = "primary" | "junior" | "senior";
interface Counts { master: number; fluent: number; weak: number; none: number; total: number; score_pct: number }
interface StageRow extends Counts { stage: StageKey }
interface GradeRow extends Counts { stage: StageKey; grade: number }
interface ModuleRow extends Counts { stage: StageKey; grade: number; module: string }
interface Snap { snap_date: string; score_pct: number }

const STAGES: { key: StageKey; label: string; grades: number[]; sub: string; route: string }[] = [
  { key: "primary", label: "小学", grades: [1, 2, 3, 4, 5, 6], sub: "G1-G6", route: "/primary" },
  { key: "junior",  label: "初中", grades: [7, 8, 9],          sub: "G7-G9 · 中考", route: "/junior" },
  { key: "senior",  label: "高中", grades: [10, 11, 12],       sub: "G10-G12 · 高考", route: "/gaokao" },
];

const MODULE_LABEL: Record<string, string> = {
  vocab: "词汇", grammar: "语法", reading: "阅读", listening: "听力",
  writing: "写作", cloze: "完形", phonics: "拼读",
};

const ZERO: Counts = { master: 0, fluent: 0, weak: 0, none: 0, total: 0, score_pct: 0 };

export default function LearningCenter() {
  const [overall, setOverall] = useState<Counts>(ZERO);
  const [byStage, setByStage] = useState<Record<StageKey, Counts>>({ primary: ZERO, junior: ZERO, senior: ZERO });
  const [byGrade, setByGrade] = useState<GradeRow[]>([]);
  const [byModule, setByModule] = useState<ModuleRow[]>([]);
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);
  const [openStage, setOpenStage] = useState<StageKey | null>("senior");
  const { data: diag, loading: diagLoading, refresh } = useDiagnostic(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) { setSignedIn(false); setLoading(false); } return; }

      const [ovR, stR, grR, modR, snR] = await Promise.all([
        supabase.from("mastery_overall").select("*").maybeSingle(),
        supabase.from("mastery_by_stage").select("*"),
        supabase.from("mastery_by_grade").select("*"),
        supabase.from("mastery_by_module").select("*"),
        supabase.from("mastery_snapshots").select("snap_date,score_pct,stage,grade,module")
          .is("stage", null).is("grade", null).is("module", null)
          .order("snap_date", { ascending: false }).limit(2000),
      ]);
      if (cancelled) return;

      setOverall(coerce(ovR.data) ?? ZERO);
      const stageMap: Record<StageKey, Counts> = { primary: ZERO, junior: ZERO, senior: ZERO };
      for (const r of (stR.data ?? []) as any[]) {
        if (r.stage && (r.stage in stageMap)) stageMap[r.stage as StageKey] = coerce(r);
      }
      setByStage(stageMap);
      setByGrade(((grR.data ?? []) as any[]).map((r) => ({ ...coerce(r), stage: r.stage, grade: r.grade })));
      setByModule(((modR.data ?? []) as any[]).map((r) => ({ ...coerce(r), stage: r.stage, grade: r.grade, module: r.module })));
      setSnaps(((snR.data ?? []) as any[]).map((r) => ({ snap_date: r.snap_date, score_pct: Number(r.score_pct) || 0 })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  /** Timeline: pick closest snapshot at-or-before each cutoff. */
  const timeline = useMemo(() => {
    const now = Date.now();
    const day = 86400000;
    const buckets = [
      { key: "5y", label: "5 年前", cutoff: now - 5 * 365 * day },
      { key: "3y", label: "3 年前", cutoff: now - 3 * 365 * day },
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

      {/* === 1. AI 诊断卡（蓝条顶部） === */}
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
            diag.insights.slice(0, 4).map((line, i) => (
              <DiagnosticRow key={i} text={line} index={i} />
            ))
          ) : (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              {diagLoading ? "诊断生成中…" : "做几道题后,AI 会给你 3 条最值得练的方向。"}
            </div>
          )}
        </div>

        {diag?.expected_gain && diag.expected_gain > 0 ? (
          <div className="border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
            💡 本周完成上述 3 项 · 预计提升 +{diag.expected_gain}%
          </div>
        ) : null}
      </section>

      {/* === 2. 三大学段圆环 KPI === */}
      <section className="mt-4 grid grid-cols-3 gap-2">
        {STAGES.map((s) => {
          const c = byStage[s.key] ?? ZERO;
          const totalAll = Math.max(1, overall.total);
          const share = ((c.total / totalAll) * 100).toFixed(1);
          return (
            <button
              key={s.key}
              onClick={() => setOpenStage(s.key)}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                openStage === s.key ? "border-foreground/40 bg-muted/40" : "border-border bg-card hover:bg-muted/20"
              }`}
            >
              <Ring size={70} stroke={9} score={c.score_pct} c={c} />
              <div className="min-w-0">
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-[10px] text-muted-foreground">{s.sub}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">占总学习 {share}%</div>
              </div>
            </button>
          );
        })}
      </section>

      {/* === 3. 全局总进度大圆 + 看学习构成 === */}
      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-5">
          <Ring size={110} stroke={12} score={overall.score_pct} c={overall} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">整个英语学习总进度</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              小学 + 初中 + 高中 共 <strong className="font-medium text-foreground">{overall.total.toLocaleString()}</strong> 项 · 全部要学的内容
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              <Pill dot="bg-gps-master" label="已掌握" n={overall.master} />
              <Pill dot="bg-gps-weak"   label="不熟练" n={overall.weak} />
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[10px] text-muted-foreground">距离全部掌握还差</div>
            <div className="text-2xl font-medium">{(overall.total - overall.master).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">项</div>
          </div>
        </div>
        <button
          onClick={() => { /* TODO: phase 5 drawer */ }}
          className="mt-3 flex w-full items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground hover:bg-muted/50"
        >
          <span>想知道这 {overall.total.toLocaleString()} 项都是什么?词汇、语法、阅读各占多少?</span>
          <ChevronRight className="size-3.5" />
        </button>
      </section>

      {/* === 4. 时间轴 === */}
      <section className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card p-4">
        <div className="flex min-w-max items-end gap-1">
          {timeline.map((t, i) => {
            const isNow = t.key === "now";
            return (
              <div key={t.key} className="flex flex-1 flex-col items-center px-1">
                <div className={`text-[10px] ${isNow ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {t.label}
                </div>
                <div className={`mt-0.5 text-base ${isNow ? "font-medium text-gps-master" : "text-foreground/80"}`}>
                  {t.score}%
                </div>
                {isNow && <MapPin className="mt-0.5 size-3 text-gps-master" />}
                {!isNow && i < timeline.length - 1 && (
                  <ChevronRight className="mt-1 size-3 text-muted-foreground/40" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* === 5. 4 状态卡 === */}
      <section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StateCard color="bg-gps-master" label="已掌握"  n={overall.master} to="/dashboard/list/all/master" />
        <StateCard color="bg-gps-fluent" label="熟练中"  n={overall.fluent} to="/dashboard/list/all/fluent" />
        <StateCard color="bg-gps-weak"   label="不熟练"  n={overall.weak}   to="/dashboard/list/all/weak" />
        <StateCard color="bg-gps-none"   label="还没做"  n={overall.none}   to="/dashboard/list/all/none" />
      </section>

      {/* === 6. 年级面板 === */}
      <section className="mt-4 space-y-2">
        {STAGES.map((s) => {
          const open = openStage === s.key;
          const sc = byStage[s.key] ?? ZERO;
          return (
            <div key={s.key} className="overflow-hidden rounded-2xl border border-border bg-card">
              <button
                onClick={() => setOpenStage(open ? null : s.key)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <Ring size={36} stroke={5} score={sc.score_pct} c={sc} hideLabel />
                  <div>
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {sc.master} 掌握 · {sc.fluent} 熟练 · {sc.weak} 薄弱 · {sc.none} 未学
                    </div>
                  </div>
                </div>
                <ChevronDown className={`size-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="divide-y divide-border border-t border-border">
                  {s.grades.map((g) => {
                    const row = byGrade.find((r) => r.stage === s.key && r.grade === g);
                    const c = row ?? { ...ZERO };
                    const trainTo = trainRoute(s.key, g);
                    return (
                      <div key={g} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="w-12 shrink-0 text-[11px] font-medium text-muted-foreground">G{g}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex h-2 w-full overflow-hidden rounded-full bg-gps-none">
                            {c.total > 0 && (
                              <>
                                <div className="h-full bg-gps-master" style={{ width: `${(c.master / c.total) * 100}%` }} />
                                <div className="h-full bg-gps-fluent" style={{ width: `${(c.fluent / c.total) * 100}%` }} />
                                <div className="h-full bg-gps-weak"   style={{ width: `${(c.weak   / c.total) * 100}%` }} />
                              </>
                            )}
                          </div>
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {c.total > 0
                              ? `${Math.round(c.score_pct)}% · ${c.master}/${c.total}`
                              : "还没开始"}
                          </div>
                        </div>
                        <Link
                          to={trainTo}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:bg-muted"
                        >
                          <Zap className="size-3" /> 立即训练
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> 加载中…
        </div>
      )}
    </main>
  );
}

/* ============ helpers ============ */

function coerce(r: any): Counts {
  if (!r) return ZERO;
  return {
    master: Number(r.master) || 0,
    fluent: Number(r.fluent) || 0,
    weak:   Number(r.weak)   || 0,
    none:   Number(r.none)   || 0,
    total:  Number(r.total)  || 0,
    score_pct: Number(r.score_pct) || 0,
  };
}

function trainRoute(stage: StageKey, grade: number): string {
  if (stage === "primary") return `/primary/grade/${grade}`;
  if (stage === "junior")  return `/junior/g/${grade}`;
  return `/gaokao/vocab?grade=${grade - 9}`;
}

/* ---- Ring (SVG, 4-color segmented) ---- */
function Ring({ size, stroke, score, c, hideLabel }: { size: number; stroke: number; score: number; c: Counts; hideLabel?: boolean }) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const total = Math.max(1, c.total);
  const seg = (n: number) => (n / total) * C;
  const off = { master: 0, fluent: seg(c.master), weak: seg(c.master) + seg(c.fluent), none: seg(c.master) + seg(c.fluent) + seg(c.weak) };
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
  // colour-code by position: 0 = positive (green), 1 = warning (red), 2 = info (amber)
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

function Pill({ dot, label, n }: { dot: string; label: string; n: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${dot}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium">{n.toLocaleString()}</span>
    </div>
  );
}

function StateCard({ color, label, n, to }: { color: string; label: string; n: number; to: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-3 transition hover:bg-muted/30"
    >
      <div className="flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${color}`} />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-medium leading-tight">{n.toLocaleString()}</div>
    </Link>
  );
}
