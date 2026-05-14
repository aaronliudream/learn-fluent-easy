import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Target, Clock, FlaskConical, RefreshCw } from "lucide-react";
import { useDeepDiagnosis } from "@/hooks/useDeepDiagnosis";
import { Button } from "@/components/ui/button";
import BackLink from "@/components/BackLink";

const SKILL_LABEL: Record<string, string> = {
  reading: "阅读",
  cloze: "完形填空",
  grammar: "语法填空",
  listening: "听力",
  vocab: "词汇",
  writing: "写作",
};

const ERROR_META: Record<string, { label: string; emoji: string; barClass: string }> = {
  knowledge_gap: { label: "真不会（知识漏洞）", emoji: "🧩", barClass: "bg-rose-500" },
  speed: { label: "知道但太慢（速度问题）", emoji: "⏱", barClass: "bg-amber-500" },
  strategy: { label: "策略错（理解偏差）", emoji: "💭", barClass: "bg-violet-500" },
  careless: { label: "粗心（明明会）", emoji: "😅", barClass: "bg-slate-400" },
};
const ERROR_ORDER = ["knowledge_gap", "speed", "strategy", "careless"] as const;

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">{label}</div>
      <div className="mt-2 font-serif text-2xl font-extrabold text-white">{value}</div>
      {sub && <div className="mt-1 text-xs text-white/70">{sub}</div>}
    </div>
  );
}

export default function GaokaoDeepDiagnosis() {
  const nav = useNavigate();
  const { data, isLoading, refetch, isFetching } = useDeepDiagnosis();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0E2746] text-white">
        <div className="text-sm opacity-70">正在生成深度诊断…</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0E2746] text-white">
        <div className="text-center">
          <p className="text-sm opacity-70">请先登录后查看 AI 深度诊断</p>
          <Button className="mt-4" onClick={() => nav("/auth")}>去登录</Button>
        </div>
      </main>
    );
  }

  // Empty state
  if (!data.has_enough_data) {
    const pct = Math.round((data.current_attempts / data.min_required) * 100);
    return (
      <main className="min-h-screen bg-[#0E2746] text-white">
        <div className="mx-auto max-w-3xl px-5 py-10">
          <BackLink to="/gaokao" className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
            <ArrowLeft className="size-3.5" /> 返回
          </BackLink>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">数据不足</div>
            <h1 className="mt-2 font-serif text-2xl font-extrabold">先答 {Math.max(data.min_required - data.current_attempts, 0)} 道题，AI 才能给你靠谱诊断</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              AI 深度诊断需要至少 {data.min_required} 道题的数据才能识别你的错因模式、速度瓶颈与知识漏洞。
              你已答 <span className="font-bold text-white">{data.current_attempts}/{data.min_required}</span>。
            </p>
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <Button className="mt-6 w-full bg-white text-[#0E2746] hover:bg-white/90" onClick={() => nav("/gaokao")}>
              去答题 <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const p = data.portrait_30d;
  const n = data.narrative;
  const errorBreakdown = data.error_breakdown ?? {};
  const totalWrong = data.error_total_wrong ?? 0;

  return (
    <main className="min-h-screen bg-[#0a1d36] pb-20 text-white">
      <div className="mx-auto max-w-3xl px-5 py-8">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <BackLink to="/gaokao" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
            <ArrowLeft className="size-3.5" /> 返回
          </BackLink>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/20"
          >
            <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} /> 重新分析
          </button>
        </div>

        {/* ============ Opening narration banner ============ */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1b3a6b] via-[#0E2746] to-[#0a1d36] p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-amber-300 text-xl">🦊</div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">小狐说</div>
              <div className="text-xs text-white/70">{n?.opening_narration?.subtitle ?? "AI 正在为你生成观察…"}</div>
            </div>
          </div>
          <h1 className="mt-4 font-serif text-[26px] font-extrabold leading-tight md:text-[30px]">
            {n?.opening_narration?.headline ?? "你的高考英语学情画像"}
          </h1>
          {n?.has_ai_narrative === false && (
            <p className="mt-2 text-[11px] text-white/50">AI 暂时不可用，已使用兜底分析</p>
          )}
        </section>

        {/* ============ 30-day portrait ============ */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-base font-extrabold text-white">📊 30 天学习画像</h2>
            {data.days_to_gaokao != null && (
              <span className="rounded-full bg-rose-500/20 px-3 py-1 text-[11px] font-bold text-rose-300">距高考 {data.days_to_gaokao} 天</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="实际练习" value={`${p.total_attempts} 题`} sub={`${p.total_time_minutes} 分钟`} />
            <StatCard label="综合正确率" value={`${p.correct_rate}%`} sub={p.correct_rate_delta ? `↑ +${p.correct_rate_delta}%` : "稳步推进"} />
            <StatCard label="真实掌握" value={`${p.mastered_count}`} sub={`/ ${p.total_kp} 知识点`} />
            <StatCard label="同年级排名" value={`前 ${p.rank_pct}%`} sub={`/ ${p.cohort_size.toLocaleString()} (TODO)`} />
          </div>
        </section>

        {/* ============ Error root cause analysis ============ */}
        <section className="mb-6 rounded-3xl bg-white p-6 text-slate-900 shadow-xl">
          <div className="flex items-center gap-2">
            <FlaskConical className="size-5 text-rose-500" />
            <h2 className="font-serif text-base font-extrabold">错误根因分析 · 这是你最该看的</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">基于 {totalWrong} 道错题</p>
          <div className="mt-5 space-y-4">
            {ERROR_ORDER.map((key) => {
              const meta = ERROR_META[key];
              const item = errorBreakdown[key];
              const pct = item?.pct ?? 0;
              const cnt = item?.count ?? 0;
              const rec = item?.recommendation ?? "暂无相关错题";
              return (
                <div key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">
                      <span className="mr-1.5">{meta.emoji}</span>{meta.label}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{cnt} 题 · {pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${meta.barClass} transition-all`} style={{ width: `${Math.max(pct, 0)}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-600">→ 解药：{rec}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============ AI specific situations ============ */}
        {n?.specific_situations?.length ? (
          <section className="mb-6">
            <h2 className="mb-3 font-serif text-base font-extrabold">
              <Target className="mr-1 inline size-4 text-amber-300" />
              AI 发现的 {n.specific_situations.length} 个特定情况 · 必看
            </h2>
            <div className="space-y-3">
              {n.specific_situations.map((s, i) => {
                const tones = [
                  "from-rose-500/20 to-rose-500/5 border-rose-400/40",
                  "from-amber-500/20 to-amber-500/5 border-amber-400/40",
                  "from-violet-500/20 to-violet-500/5 border-violet-400/40",
                ];
                return (
                  <div key={i} className={`rounded-2xl border bg-gradient-to-br p-4 backdrop-blur ${tones[i % 3]}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/90">情况 {i + 1}</span>
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold">置信度 {s.confidence}%</span>
                    </div>
                    <h3 className="mt-2 text-base font-extrabold leading-tight">{s.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/80">{s.detail}</p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-amber-200">
                      <Sparkles className="size-3" /> {s.actionable_hint}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* ============ Time analysis ============ */}
        {data.time_analysis?.length ? (
          <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="font-serif text-base font-extrabold">
              <Clock className="mr-1 inline size-4 text-cyan-300" />
              时间维度 · 你不是不会，是太慢
            </h2>
            <p className="mt-1 text-xs text-white/60">和同年级前 30% 学生比，你各题型用时差距：</p>
            <div className="mt-4 space-y-3">
              {data.time_analysis.map((t) => {
                const slow = t.delta_seconds > 0;
                const ratio = Math.min(100, Math.abs(t.delta_seconds) / Math.max(t.baseline_time, 1) * 100 + 20);
                return (
                  <div key={t.skill_area}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold">{SKILL_LABEL[t.skill_area] ?? t.skill_area}</span>
                      <span className={`font-bold ${slow ? "text-rose-300" : "text-emerald-300"}`}>
                        {t.avg_time}s/题 · {slow ? `慢 +${t.delta_seconds}s` : `快 ${t.delta_seconds}s`}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full ${slow ? "bg-rose-400" : "bg-emerald-400"}`} style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* ============ 7-day plan ============ */}
        {n?.seven_day_plan?.length ? (
          <section className="mb-6">
            <h2 className="mb-3 font-serif text-base font-extrabold">🚀 AI 7 天提分计划</h2>
            <div className="space-y-3">
              {n.seven_day_plan.map((p, i) => {
                const tones = [
                  "from-rose-600 to-rose-700",
                  "from-blue-600 to-blue-700",
                  "from-emerald-600 to-emerald-700",
                ];
                return (
                  <div key={i} className={`rounded-2xl bg-gradient-to-br ${tones[i % 3]} p-5 shadow-lg`}>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">{p.day_range}</span>
                      <span className="text-sm font-extrabold">{p.est_points_gain}</span>
                    </div>
                    <h3 className="mt-2.5 text-lg font-extrabold leading-tight">{p.task_title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/85">{p.detail}</p>
                    <div className="mt-2.5 text-[11px] text-white/70">每天约 {p.est_minutes_per_day} 分钟</div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* ============ Footer ============ */}
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-xs text-emerald-100">
          🤖 这份报告每周更新一次 · 数据来源：你最近 30 天的真实答题与错因记录
        </div>
      </div>
    </main>
  );
}