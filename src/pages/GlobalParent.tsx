import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BackLink from "@/components/BackLink";
import {
  ArrowLeft, Loader2, Coins, BookOpen, GraduationCap, School, Backpack,
  TrendingUp, AlertTriangle, Clock, Flame, Target, Sparkles, Download,
  Briefcase, MessageCircle, Mic, Layers, Hash,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import DelaySettings from "@/components/parent/DelaySettings";
import FamilyGoalSettings from "@/components/parent/FamilyGoalSettings";
import CardLearningSection from "@/components/parent/CardLearningSection";
import SkillMasteryPanel from "@/components/parent/SkillMasteryPanel";
import PacingSettings from "@/components/parent/PacingSettings";
import { T, useT } from "@/i18n/T";

type Words = { mastered: number; proficient: number; familiar: number; touched: number };
type Dashboard = {
  days_window: number;
  minutes_total: number;
  minutes_7d: number;
  minutes_by_segment: {
    primary: number; junior: number; gaokao: number;
    workplace?: number; scenes?: number; talk?: number;
    systematic?: number; slang?: number; other?: number;
  };
  tracks_activity?: Record<"workplace"|"scenes"|"talk"|"systematic"|"slang", { days: number; items: number }>;
  primary: { words: Words; reading_done: number; reading_avg_score: number; sessions: number; accuracy: number; active_days: number };
  junior: { words: Words; reading_attempts: number; reading_correct: number; sessions: number; accuracy: number; active_days: number };
  gaokao: { words: Words; attempts: number; correct: number; active_days: number; by_type: { qt: string; attempts: number; correct: number }[] };
  weakness: { module: string; parent_label: string | null; snapshot: any; wrong_count: number; last_wrong_at: string }[];
  daily_minutes: { d: string; mins: number }[];
};

const SEG_META = {
  primary: { label: "小学 / Primary", icon: Backpack, color: "from-sky-500 to-cyan-500", route: "/primary" },
  junior:  { label: "初中 / Lower Secondary", icon: School, color: "from-violet-500 to-indigo-500", route: "/junior" },
  gaokao:  { label: "高中 / Upper Secondary", icon: GraduationCap, color: "from-rose-500 to-orange-500", route: "/gaokao" },
} as const;

const TRACK_META = {
  workplace:  { labelKey: "Business / Workplace English", icon: Briefcase,    color: "from-amber-500 to-orange-500",   route: "/workplace" },
  scenes:     { labelKey: "Daily Scenes",                  icon: MessageCircle,color: "from-emerald-500 to-teal-500",  route: "/scenes" },
  talk:       { labelKey: "AI Conversation",               icon: Mic,          color: "from-pink-500 to-rose-500",      route: "/talk" },
  systematic: { labelKey: "Systematic Course",             icon: Layers,       color: "from-indigo-500 to-blue-500",   route: "/level" },
  slang:      { labelKey: "Slang & Idioms",                icon: Hash,         color: "from-fuchsia-500 to-purple-500", route: "/slang" },
} as const;
type TrackKey = keyof typeof TRACK_META;

function useFmtMinutes() {
  const t = useT();
  return (m: number): string => {
    if (m < 60) return `${m} ${t("分钟")}`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r ? `${h} ${t("小时")} ${r} ${t("分")}` : `${h} ${t("小时")}`;
  };
}

function useModuleLabel() {
  const t = useT();
  return (m: string): string => {
    const map: Record<string, string> = {
      vocab: t("单词"), grammar: t("语法"), reading: t("阅读"), cloze: t("完形"),
      listening: t("听力"), writing: t("写作"),
    };
    return map[m] ?? m;
  };
}

export default function GlobalParent() {
  const t = useT();
  const fmtMinutes = useFmtMinutes();
  const moduleLabel = useModuleLabel();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Dashboard | null>(null);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [slangAcc, setSlangAcc] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      setAuthed(!!uid);
      if (!uid) { setLoading(false); return; }
      const [dash, c, s] = await Promise.all([
        supabase.rpc("get_parent_dashboard", { _days: 30 }),
        supabase.from("user_coins").select("balance").eq("user_id", uid).maybeSingle(),
        supabase.rpc("get_user_streak_stats"),
      ]);
      if (dash.data) setData(dash.data as unknown as Dashboard);
      if (c.data) setCoins((c.data as any).balance ?? 0);
      if (s.data?.[0]) setStreak((s.data[0] as any).current_streak ?? 0);
      const { data: sm } = await supabase
        .from("slang_mastery")
        .select("correct_count,wrong_count")
        .eq("user_id", uid);
      if (sm) {
        const correct = sm.reduce((a: number, r: any) => a + (r.correct_count ?? 0), 0);
        const wrong = sm.reduce((a: number, r: any) => a + (r.wrong_count ?? 0), 0);
        setSlangAcc({ correct, total: correct + wrong });
      }
      setLoading(false);
    })();
  }, []);

  // 主修学段 = 时长占比最高的学段
  const mainSeg = useMemo<keyof typeof SEG_META | null>(() => {
    if (!data) return null;
    const m = data.minutes_by_segment;
    const arr: [keyof typeof SEG_META, number][] = [
      ["primary", m.primary], ["junior", m.junior], ["gaokao", m.gaokao],
    ];
    arr.sort((a, b) => b[1] - a[1]);
    return arr[0][1] > 0 ? arr[0][0] : null;
  }, [data]);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>加载中…</T>
        </div>
      </main>
    );
  }

  if (authed === false) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
        <BackLink to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> <T>返回</T>
        </BackLink>
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground"><T>请先登录后再查看</T></div>
      </main>
    );
  }

  const d = data!;
  const m = d.minutes_by_segment;
  const segTotal =
    m.primary + m.junior + m.gaokao +
    (m.workplace ?? 0) + (m.scenes ?? 0) + (m.talk ?? 0) +
    (m.systematic ?? 0) + (m.slang ?? 0);
  // 真实有效学习 = 所有学习类时长之和（不计入家长中心/登录页等浏览时长）
  const totalMin = segTotal;

  // 只显示孩子实际学过的部分（全球化：日本/韩国/西语家长不会三段都学）
  const segActivity = {
    primary: d.minutes_by_segment.primary + d.primary.sessions + d.primary.words.mastered + d.primary.words.touched,
    junior:  d.minutes_by_segment.junior + d.junior.sessions + d.junior.words.mastered + d.junior.words.touched,
    gaokao:  d.minutes_by_segment.gaokao + d.gaokao.attempts + d.gaokao.words.mastered + d.gaokao.words.touched,
  };
  const activeSegs = (["primary","junior","gaokao"] as const).filter(s => segActivity[s] > 0);

  // 非 K-12 学习轨迹（商务、场景、AI 口语、系统课、俚语…）
  const tracksAct = d.tracks_activity ?? ({} as NonNullable<Dashboard["tracks_activity"]>);
  const activeTracks = (Object.keys(TRACK_META) as TrackKey[]).filter(k => {
    const mins = (m as any)[k] ?? 0;
    const a = tracksAct[k];
    return mins > 0 || (a && (a.days > 0 || a.items > 0));
  });

  const hasAnyActivity = activeSegs.length > 0 || activeTracks.length > 0;

  const allWords =
    d.primary.words.mastered + d.junior.words.mastered + d.gaokao.words.mastered;

  const totalAttempts =
    d.primary.sessions + d.junior.sessions + d.gaokao.attempts;
  const totalCorrect =
    Math.round(d.primary.sessions * d.primary.accuracy) +
    Math.round(d.junior.sessions * d.junior.accuracy) +
    d.gaokao.correct;

  const radar = [
    { key: "vocab",   label: t("单词"), value: clamp01(allWords / 500) },
    { key: "reading", label: t("阅读"), value: clamp01((d.primary.reading_done + d.junior.reading_correct + d.gaokao.correct) / 50) },
    { key: "grammar", label: t("语法"), value: avgAccByType(d, "grammar") },
    { key: "listening", label: t("听力"), value: avgAccByType(d, "listening") },
    // 口语：基于实际做题量，不再用浏览时长，避免新用户 0 题也显示进度
    { key: "speaking", label: t("口语"), value: clamp01(totalAttempts / 100) },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <BackLink to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回</T>
      </BackLink>

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">LEARNING CENTER</div>
          <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">📊 <T>学习中心 / Learning Center</T></h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {mainSeg ? <><T>主修</T>：<b>{SEG_META[mainSeg].label}</b> · </> : null}
            <T>近 30 天 有效学习</T> <b>{fmtMinutes(totalMin)}</b> · <T>连续学习</T> <b>{streak}</b> <T>天</T> 🔥
          </p>
        </div>
        <Link to="/pets" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow">
          <Coins className="size-4" /> {coins} <T>星币</T>
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="print:hidden inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm hover:bg-muted"
          aria-label={t("导出 PDF / 打印报告")}
          title={t("导出 PDF（在打印对话框中选择「另存为 PDF」）")}
        >
          <Download className="size-4" /> <T>导出 PDF</T>
        </button>
      </div>

      {/* Top KPI strip */}
      <section className="mb-4 grid gap-3 sm:grid-cols-4">
        <Kpi icon={Clock}  label={t("本周专注")} value={fmtMinutes(Math.min(d.minutes_7d, segTotal))} color="from-emerald-500 to-teal-500" />
        <Kpi icon={Flame}  label={t("连续学习")} value={`${streak} ${t("天")}`}            color="from-orange-500 to-amber-500" />
        <Kpi icon={Target} label={t("掌握单词")} value={`${allWords}`}              color="from-sky-500 to-blue-500" />
        <Kpi icon={AlertTriangle} label={t("待攻克薄弱")} value={`${d.weakness.length}`} color="from-rose-500 to-pink-500" />
      </section>

      {/* Knowledge-card scan-and-quiz timeline */}
      <CardLearningSection />

      {/* 各项技能掌握度（按年级） */}
      <SkillMasteryPanel />

      {/* 学习节奏 & 个性化周计划 */}
      <PacingSettings />

      {/* 完全没有任何学习数据 → 引导诊断 */}
      {!hasAnyActivity && (
        <section className="mb-4 rounded-3xl border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 to-sky-50 p-6 text-center">
          <div className="text-3xl">🌱</div>
          <div className="mt-2 text-base font-extrabold"><T>孩子还没开始学习</T></div>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            <T>让孩子先完成 5 分钟免费诊断，我们会根据 CEFR 等级自动推荐适合的学习路径——无论你在中国、日本、韩国还是任何国家。</T>
          </p>
          <Link to="/placement" className="mt-4 inline-block rounded-full bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-2 text-sm font-extrabold text-white shadow">
            <T>开始免费诊断 →</T>
          </Link>
        </section>
      )}

      {/* 跨学段足迹 */}
      {hasAnyActivity && (
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
        <div className="mb-2 flex items-center gap-1 text-sm font-extrabold">
          <Sparkles className="size-4 text-violet-500" /> <T>学习足迹（按有效时长占比）</T>
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">· <T>百分比 = 该主题占总学习时间的比例，非正确率</T></span>
        </div>
        <div className="space-y-2">
            {activeSegs.map(seg => {
              const M = SEG_META[seg];
              const mins = d.minutes_by_segment[seg];
              const pct = Math.round((mins / Math.max(1, segTotal)) * 100);
              return (
                <div key={seg}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={cn("inline-grid size-5 place-items-center rounded bg-gradient-to-br text-white", M.color)}>
                        <M.icon className="size-3" />
                      </span>
                      {M.label} {seg === mainSeg && <span className="rounded bg-amber-100 px-1.5 text-[10px] text-amber-700"><T>主修</T></span>}
                    </span>
                    <span className="text-muted-foreground">{fmtMinutes(mins)} · {pct}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className={cn("h-full bg-gradient-to-r transition-all", M.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {activeTracks.map(k => {
              const M = TRACK_META[k];
              const mins = (d.minutes_by_segment as any)[k] ?? 0;
              const pct = Math.round((mins / Math.max(1, segTotal)) * 100);
              return (
                <div key={k}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={cn("inline-grid size-5 place-items-center rounded bg-gradient-to-br text-white", M.color)}>
                        <M.icon className="size-3" />
                      </span>
                      <T>{M.labelKey}</T>
                    </span>
                    <span className="text-muted-foreground">{fmtMinutes(mins)} · {pct}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className={cn("h-full bg-gradient-to-r transition-all", M.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
        </div>
      </section>
      )}

      {/* 各主题正确率 */}
      {hasAnyActivity && (
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
        <div className="mb-3 flex items-center gap-1 text-sm font-extrabold">
          <Target className="size-4 text-emerald-500" /> <T>各主题正确率</T>
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">· <T>基于实际答题</T></span>
        </div>
        <div className="space-y-2">
          {(() => {
            const rows: { key: string; label: string; correct: number; total: number; color: string }[] = [];
            if (slangAcc && slangAcc.total > 0) rows.push({ key: "slang", label: t("Slang & Idioms"), correct: slangAcc.correct, total: slangAcc.total, color: "from-fuchsia-500 to-purple-500" });
            if (d.primary.sessions > 0) rows.push({ key: "primary", label: t("小学 / Primary"), correct: Math.round(d.primary.sessions * d.primary.accuracy), total: d.primary.sessions, color: "from-sky-500 to-cyan-500" });
            if (d.junior.sessions > 0) rows.push({ key: "junior", label: t("初中 / Lower Secondary"), correct: Math.round(d.junior.sessions * d.junior.accuracy), total: d.junior.sessions, color: "from-violet-500 to-indigo-500" });
            if (d.gaokao.attempts > 0) rows.push({ key: "gaokao", label: t("高中 / Upper Secondary"), correct: d.gaokao.correct, total: d.gaokao.attempts, color: "from-rose-500 to-orange-500" });
            if (rows.length === 0) {
              return <div className="py-4 text-center text-xs text-muted-foreground"><T>还没有可统计的答题记录</T></div>;
            }
            return rows.map(r => {
              const pct = Math.round((r.correct / Math.max(1, r.total)) * 100);
              return (
                <div key={r.key}>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{r.label}</span>
                    <span className={cn(pct < 60 ? "text-rose-600" : pct < 80 ? "text-amber-600" : "text-emerald-600")}>
                      {r.correct}/{r.total} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className={cn("h-full bg-gradient-to-r", r.color)} style={{ width: `${Math.max(2, pct)}%` }} />
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </section>
      )}

      {/* 掌握度雷达 (条形版，更易读) */}
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
        <div className="mb-3 flex items-center gap-1 text-sm font-extrabold">
          <BookOpen className="size-4 text-emerald-500" /> <T>各模块掌握度</T>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {radar.map(r => (
            <div key={r.key} className="rounded-2xl border border-border p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">{r.label}</span>
                <span className={cn("font-extrabold", r.value < 0.4 ? "text-rose-600" : r.value < 0.7 ? "text-amber-600" : "text-emerald-600")}>
                  {Math.round(r.value * 100)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full", r.value < 0.4 ? "bg-rose-500" : r.value < 0.7 ? "bg-amber-500" : "bg-emerald-500")}
                  style={{ width: `${Math.max(2, r.value * 100)}%` }}
                />
              </div>
              {r.value < 0.4 && <div className="mt-1 text-[10px] text-rose-600">⚠️ <T>薄弱，建议本周重点练习</T></div>}
            </div>
          ))}
        </div>
      </section>

      {/* 薄弱点 Top 5 */}
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
        <div className="mb-3 flex items-center gap-1 text-sm font-extrabold">
          <AlertTriangle className="size-4 text-rose-500" /> <T>本周需要关注（近 14 天未解决错题）</T>
        </div>
        {d.weakness.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">🎉 <T>没有未解决的薄弱点，状态非常好！</T></div>
        ) : (
          <ul className="space-y-2">
            {d.weakness.map((w, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-2xl border border-border px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold">
                    <span className="mr-2 inline-block rounded bg-rose-100 px-1.5 text-[10px] text-rose-700">{moduleLabel(w.module)}</span>
                    <span className="truncate">{w.parent_label || w.snapshot?.title || w.snapshot?.stem || t("题目")}</span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground"><T>错</T> {w.wrong_count} <T>次</T> · {new Date(w.last_wrong_at).toLocaleDateString()}</div>
                </div>
                <Link to="/gaokao/mistakes" className="shrink-0 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-extrabold text-white hover:bg-rose-600">
                  <T>陪练 10 分钟 →</T>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 学段详情卡片 — 只显示孩子实际学过的部分 */}
      {hasAnyActivity && (
      <section className={cn("mb-4 grid gap-3", activeSegs.length === 1 ? "md:grid-cols-1" : activeSegs.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
        {activeSegs.includes("primary") && (
          <SegCard
            seg="primary"
            words={d.primary.words}
            extra={[
              { k: t("做题次数"), v: `${d.primary.sessions}` },
              { k: t("平均正确率"), v: `${Math.round(d.primary.accuracy * 100)}%` },
              { k: t("阅读完成"), v: `${d.primary.reading_done} ${t("篇")}` },
              { k: t("活跃天数"), v: `${d.primary.active_days} ${t("天")}` },
            ]}
          />
        )}
        {activeSegs.includes("junior") && (
          <SegCard
            seg="junior"
            words={d.junior.words}
            extra={[
              { k: t("做题次数"), v: `${d.junior.sessions}` },
              { k: t("平均正确率"), v: `${Math.round(d.junior.accuracy * 100)}%` },
              { k: t("阅读正确"), v: `${d.junior.reading_correct}/${d.junior.reading_attempts}` },
              { k: t("活跃天数"), v: `${d.junior.active_days} ${t("天")}` },
            ]}
          />
        )}
        {activeSegs.includes("gaokao") && (
          <SegCard
            seg="gaokao"
            words={d.gaokao.words}
            extra={[
              { k: t("做题次数"), v: `${d.gaokao.attempts}` },
              { k: t("正确率"), v: `${d.gaokao.attempts ? Math.round(d.gaokao.correct / d.gaokao.attempts * 100) : 0}%` },
              { k: t("正确题数"), v: `${d.gaokao.correct}` },
              { k: t("活跃天数"), v: `${d.gaokao.active_days} ${t("天")}` },
            ]}
          />
        )}
      </section>
      )}

      {/* 其它学习轨迹（商务、场景、AI 口语、系统课、俚语…） */}
      {activeTracks.length > 0 && (
        <section className={cn(
          "mb-4 grid gap-3",
          activeTracks.length === 1 ? "md:grid-cols-1" :
          activeTracks.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        )}>
          {activeTracks.map(k => {
            const M = TRACK_META[k];
            const mins = (d.minutes_by_segment as any)[k] ?? 0;
            const a = tracksAct[k] ?? { days: 0, items: 0 };
            return (
              <div key={k} className="rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
                <div className="mb-3 flex items-center gap-2">
                  <div className={cn("grid size-9 place-items-center rounded-xl bg-gradient-to-br text-white shadow", M.color)}>
                    <M.icon className="size-4" />
                  </div>
                  <div className="text-sm font-extrabold"><T>{M.labelKey}</T></div>
                </div>
                <div className="mb-3 rounded-2xl bg-secondary/50 p-2 text-center">
                  <div className="text-[10px] text-muted-foreground"><T>有效学习</T></div>
                  <div className="text-2xl font-black">{fmtMinutes(mins)}</div>
                  <div className="text-[10px] text-muted-foreground"><T>活跃天数</T> {a.days} · <T>已学条目</T> {a.items}</div>
                </div>
                <Link to={M.route} className={cn("mt-1 block rounded-xl bg-gradient-to-r py-2 text-center text-xs font-extrabold text-white shadow", M.color)}>
                  <T>继续学习</T> →
                </Link>
              </div>
            );
          })}
        </section>
      )}

      {/* 每日学习时长曲线 */}
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
        <div className="mb-2 flex items-center gap-1 text-sm font-extrabold">
          <TrendingUp className="size-4 text-emerald-500" /> <T>近 14 天 每日有效学习时长</T>
        </div>
        {d.daily_minutes.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground"><T>暂无数据</T></div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={d.daily_minutes.map(x => ({ d: x.d.slice(5), mins: x.mins }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="m" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="mins" stroke="hsl(160 70% 45%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
        <div className="flex items-center gap-1 font-extrabold"><Sparkles className="size-3.5" /> <T>数据说明</T></div>
        <p className="mt-1 leading-relaxed">
          <T>① 有效学习时长：仅在屏幕可见 + 60 秒内有交互时计入，自动剔除挂机。</T><br/>
          <T>② 学习足迹：孩子可能跨年级学习，系统按时长自动判定主修学段，所有正确答题都计入掌握。</T><br/>
          <T>③ 薄弱点：近 14 天未解决的错题，按错误次数排序，点击右侧按钮可立即陪练。</T><br/>
          <T>④ 数据每次进入页面刷新；如刚做完题未显示，请稍候重新进入。</T>
        </p>
      </div>

      <div className="mt-6">
        <DelaySettings />
      </div>

      <div className="mt-4">
        <FamilyGoalSettings />
      </div>
    </main>
  );
}

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

function avgAccByType(d: Dashboard, qt: string): number {
  const row = d.gaokao.by_type.find(r => (r.qt || "").toLowerCase().includes(qt));
  if (!row || !row.attempts) return 0;
  return row.correct / row.attempts;
}

function Kpi({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-card p-3 shadow-tile">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", color)} />
      <div className="relative flex items-center gap-2">
        <div className={cn("grid size-9 place-items-center rounded-xl bg-gradient-to-br text-white shadow", color)}>
          <Icon className="size-4" />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">{label}</div>
          <div className="text-lg font-black leading-none">{value}</div>
        </div>
      </div>
    </div>
  );
}

function SegCard({ seg, words, extra }: {
  seg: "primary" | "junior" | "gaokao";
  words: Words;
  extra: { k: string; v: string }[];
}) {
  const M = SEG_META[seg];
  const t = useT();
  return (
    <div className="rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
      <div className="mb-3 flex items-center gap-2">
        <div className={cn("grid size-9 place-items-center rounded-xl bg-gradient-to-br text-white shadow", M.color)}>
          <M.icon className="size-4" />
        </div>
        <div className="text-sm font-extrabold">{M.label} <T>详情</T></div>
      </div>
      <div className="mb-3 rounded-2xl bg-secondary/50 p-2 text-center">
        <div className="text-[10px] text-muted-foreground"><T>单词掌握</T></div>
        <div className="text-2xl font-black">{words.mastered}</div>
        <div className="text-[10px] text-muted-foreground"><T>熟练</T> {words.proficient} · <T>见过</T> {words.familiar}</div>
      </div>
      <div className="space-y-1.5 text-xs">
        {extra.map(e => (
          <div key={e.k} className="flex items-center justify-between">
            <span className="text-muted-foreground">{e.k}</span>
            <span className="font-bold">{e.v}</span>
          </div>
        ))}
      </div>
      <Link to={M.route} className={cn("mt-3 block rounded-xl bg-gradient-to-r py-2 text-center text-xs font-extrabold text-white shadow", M.color)}>
        <T>进入</T>{M.label} →
      </Link>
    </div>
  );
}