import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BackLink from "@/components/BackLink";
import {
  ArrowLeft, Loader2, Coins, BookOpen, GraduationCap, School, Backpack,
  TrendingUp, AlertTriangle, Clock, Flame, Target, Sparkles, Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import DelaySettings from "@/components/parent/DelaySettings";
import FamilyGoalSettings from "@/components/parent/FamilyGoalSettings";

type Words = { mastered: number; proficient: number; familiar: number; touched: number };
type Dashboard = {
  days_window: number;
  minutes_total: number;
  minutes_7d: number;
  minutes_by_segment: { primary: number; junior: number; gaokao: number; other: number };
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

function fmtMinutes(m: number): string {
  if (m < 60) return `${m} 分钟`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} 小时 ${r} 分` : `${h} 小时`;
}

function moduleLabel(m: string): string {
  const map: Record<string, string> = {
    vocab: "单词", grammar: "语法", reading: "阅读", cloze: "完形",
    listening: "听力", writing: "写作",
  };
  return map[m] ?? m;
}

export default function GlobalParent() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Dashboard | null>(null);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);

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
          <Loader2 className="mr-2 size-5 animate-spin" /> 加载中…
        </div>
      </main>
    );
  }

  if (authed === false) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
        <BackLink to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </BackLink>
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">请先登录后再查看</div>
      </main>
    );
  }

  const d = data!;
  const segTotal = d.minutes_by_segment.primary + d.minutes_by_segment.junior + d.minutes_by_segment.gaokao;
  // 真实有效学习 = 三学段时长之和（不计入家长中心/登录页等浏览时长）
  const totalMin = segTotal;

  // 只显示孩子实际学过的部分（全球化：日本/韩国/西语家长不会三段都学）
  const segActivity = {
    primary: d.minutes_by_segment.primary + d.primary.sessions + d.primary.words.mastered + d.primary.words.touched,
    junior:  d.minutes_by_segment.junior + d.junior.sessions + d.junior.words.mastered + d.junior.words.touched,
    gaokao:  d.minutes_by_segment.gaokao + d.gaokao.attempts + d.gaokao.words.mastered + d.gaokao.words.touched,
  };
  const activeSegs = (["primary","junior","gaokao"] as const).filter(s => segActivity[s] > 0);
  const hasAnyActivity = activeSegs.length > 0;

  const allWords =
    d.primary.words.mastered + d.junior.words.mastered + d.gaokao.words.mastered;

  const totalAttempts =
    d.primary.sessions + d.junior.sessions + d.gaokao.attempts;
  const totalCorrect =
    Math.round(d.primary.sessions * d.primary.accuracy) +
    Math.round(d.junior.sessions * d.junior.accuracy) +
    d.gaokao.correct;

  const radar = [
    { key: "vocab",   label: "单词", value: clamp01(allWords / 500) },
    { key: "reading", label: "阅读", value: clamp01((d.primary.reading_done + d.junior.reading_correct + d.gaokao.correct) / 50) },
    { key: "grammar", label: "语法", value: avgAccByType(d, "grammar") },
    { key: "listening", label: "听力", value: avgAccByType(d, "listening") },
    // 口语：基于实际做题量，不再用浏览时长，避免新用户 0 题也显示进度
    { key: "speaking", label: "口语", value: clamp01(totalAttempts / 100) },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <BackLink to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回
      </BackLink>

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">PARENT CENTER</div>
          <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">👨‍👩‍👧 全局家长中心</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {mainSeg ? <>主修：<b>{SEG_META[mainSeg].label}</b> · </> : null}
            近 30 天 有效学习 <b>{fmtMinutes(totalMin)}</b> · 连续学习 <b>{streak}</b> 天 🔥
          </p>
        </div>
        <Link to="/pets" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow">
          <Coins className="size-4" /> {coins} 星币
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="print:hidden inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-sm hover:bg-muted"
          aria-label="导出 PDF / 打印报告"
          title="导出 PDF（在打印对话框中选择「另存为 PDF」）"
        >
          <Download className="size-4" /> 导出 PDF
        </button>
      </div>

      {/* Top KPI strip */}
      <section className="mb-4 grid gap-3 sm:grid-cols-4">
        <Kpi icon={Clock}  label="本周专注" value={fmtMinutes(Math.min(d.minutes_7d, segTotal))} color="from-emerald-500 to-teal-500" />
        <Kpi icon={Flame}  label="连续学习" value={`${streak} 天`}            color="from-orange-500 to-amber-500" />
        <Kpi icon={Target} label="掌握单词" value={`${allWords}`}              color="from-sky-500 to-blue-500" />
        <Kpi icon={AlertTriangle} label="待攻克薄弱" value={`${d.weakness.length}`} color="from-rose-500 to-pink-500" />
      </section>

      {/* 完全没有任何学习数据 → 引导诊断 */}
      {!hasAnyActivity && (
        <section className="mb-4 rounded-3xl border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 to-sky-50 p-6 text-center">
          <div className="text-3xl">🌱</div>
          <div className="mt-2 text-base font-extrabold">孩子还没开始学习 / No learning data yet</div>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
            让孩子先完成 5 分钟免费诊断，我们会根据 CEFR 等级自动推荐适合的学习路径——无论你在中国、日本、韩国还是任何国家。
          </p>
          <Link to="/placement" className="mt-4 inline-block rounded-full bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-2 text-sm font-extrabold text-white shadow">
            开始免费诊断 →
          </Link>
        </section>
      )}

      {/* 跨学段足迹 */}
      {hasAnyActivity && (
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
        <div className="mb-2 flex items-center gap-1 text-sm font-extrabold">
          <Sparkles className="size-4 text-violet-500" /> 学习足迹（按有效时长占比）
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
                      {M.label} {seg === mainSeg && <span className="rounded bg-amber-100 px-1.5 text-[10px] text-amber-700">主修</span>}
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

      {/* 掌握度雷达 (条形版，更易读) */}
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
        <div className="mb-3 flex items-center gap-1 text-sm font-extrabold">
          <BookOpen className="size-4 text-emerald-500" /> 各模块掌握度
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
              {r.value < 0.4 && <div className="mt-1 text-[10px] text-rose-600">⚠️ 薄弱，建议本周重点练习</div>}
            </div>
          ))}
        </div>
      </section>

      {/* 薄弱点 Top 5 */}
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
        <div className="mb-3 flex items-center gap-1 text-sm font-extrabold">
          <AlertTriangle className="size-4 text-rose-500" /> 本周需要关注（近 14 天未解决错题）
        </div>
        {d.weakness.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">🎉 没有未解决的薄弱点，状态非常好！</div>
        ) : (
          <ul className="space-y-2">
            {d.weakness.map((w, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-2xl border border-border px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold">
                    <span className="mr-2 inline-block rounded bg-rose-100 px-1.5 text-[10px] text-rose-700">{moduleLabel(w.module)}</span>
                    <span className="truncate">{w.parent_label || w.snapshot?.title || w.snapshot?.stem || "题目"}</span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">错 {w.wrong_count} 次 · {new Date(w.last_wrong_at).toLocaleDateString("zh-CN")}</div>
                </div>
                <Link to="/gaokao/mistakes" className="shrink-0 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-extrabold text-white hover:bg-rose-600">
                  陪练 10 分钟 →
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
              { k: "做题次数", v: `${d.primary.sessions}` },
              { k: "平均正确率", v: `${Math.round(d.primary.accuracy * 100)}%` },
              { k: "阅读完成", v: `${d.primary.reading_done} 篇` },
              { k: "活跃天数", v: `${d.primary.active_days} 天` },
            ]}
          />
        )}
        {activeSegs.includes("junior") && (
          <SegCard
            seg="junior"
            words={d.junior.words}
            extra={[
              { k: "做题次数", v: `${d.junior.sessions}` },
              { k: "平均正确率", v: `${Math.round(d.junior.accuracy * 100)}%` },
              { k: "阅读正确", v: `${d.junior.reading_correct}/${d.junior.reading_attempts}` },
              { k: "活跃天数", v: `${d.junior.active_days} 天` },
            ]}
          />
        )}
        {activeSegs.includes("gaokao") && (
          <SegCard
            seg="gaokao"
            words={d.gaokao.words}
            extra={[
              { k: "做题次数", v: `${d.gaokao.attempts}` },
              { k: "正确率", v: `${d.gaokao.attempts ? Math.round(d.gaokao.correct / d.gaokao.attempts * 100) : 0}%` },
              { k: "正确题数", v: `${d.gaokao.correct}` },
              { k: "活跃天数", v: `${d.gaokao.active_days} 天` },
            ]}
          />
        )}
      </section>
      )}

      {/* 每日学习时长曲线 */}
      <section className="mb-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
        <div className="mb-2 flex items-center gap-1 text-sm font-extrabold">
          <TrendingUp className="size-4 text-emerald-500" /> 近 14 天 每日有效学习时长
        </div>
        {d.daily_minutes.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">暂无数据</div>
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
        <div className="flex items-center gap-1 font-extrabold"><Sparkles className="size-3.5" /> 数据说明</div>
        <p className="mt-1 leading-relaxed">
          ① <b>有效学习时长</b>：仅在屏幕可见 + 60 秒内有交互时计入，自动剔除挂机。<br/>
          ② <b>跨学段足迹</b>：孩子可能跨年级学习，系统按时长自动判定主修学段，所有正确答题都计入掌握。<br/>
          ③ <b>薄弱点</b>：近 14 天未解决的错题，按错误次数排序，点击右侧按钮可立即陪练。<br/>
          ④ 数据每次进入页面刷新；如刚做完题未显示，请稍候重新进入。
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
  return (
    <div className="rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
      <div className="mb-3 flex items-center gap-2">
        <div className={cn("grid size-9 place-items-center rounded-xl bg-gradient-to-br text-white shadow", M.color)}>
          <M.icon className="size-4" />
        </div>
        <div className="text-sm font-extrabold">{M.label}详情</div>
      </div>
      <div className="mb-3 rounded-2xl bg-secondary/50 p-2 text-center">
        <div className="text-[10px] text-muted-foreground">单词掌握</div>
        <div className="text-2xl font-black">{words.mastered}</div>
        <div className="text-[10px] text-muted-foreground">熟练 {words.proficient} · 见过 {words.familiar}</div>
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
        进入{M.label}专区 →
      </Link>
    </div>
  );
}