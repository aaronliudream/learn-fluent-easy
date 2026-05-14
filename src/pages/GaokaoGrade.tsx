import { T } from "@/i18n/T";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import {
  useDailyPrescription,
  useRegeneratePrescription,
  type PrescriptionTask,
} from "@/hooks/useDailyPrescription";

const NAVY = "#0E2746";
const BLUE = "#2D5896";
const TERRA = "#C8896A";

type GradeKey = "1" | "2" | "3";

/* ------------ shared header / footer ------------ */

function GradeHeader({ grade, streak, coins }: { grade: GradeKey; streak: number; coins: number }) {
  const navigate = useNavigate();
  const tabs: { k: GradeKey; label: string }[] = [
    { k: "1", label: "高一" },
    { k: "2", label: "高二" },
    { k: "3", label: "高三" },
  ];
  return (
    <header className="flex items-center justify-between gap-3">
      <button
        onClick={() => navigate("/gaokao")}
        className="grid size-8 place-items-center rounded-full hover:bg-black/5"
        aria-label="back"
        style={{ color: NAVY }}
      >
        <ArrowLeft className="size-4" />
      </button>
      <div className="flex items-center gap-1.5">
        <span
          className="text-[14px] font-bold mr-2"
          style={{ color: NAVY, fontFamily: "'Noto Serif SC', serif" }}
        >
          <T>高中英语</T>
        </span>
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => navigate(`/gaokao/g/${t.k}`)}
            className={`rounded-full px-3 py-1 text-[12px] font-bold transition ${
              t.k === grade ? "text-white" : "hover:bg-black/5"
            }`}
            style={{ background: t.k === grade ? NAVY : "transparent", color: t.k === grade ? "#fff" : NAVY }}
          >
            <T>{t.label}</T>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[12px] font-bold" style={{ color: NAVY }}>
        <span className="inline-flex items-center gap-1">
          <Flame className="size-3.5" style={{ color: "#E85D3A" }} /> {streak}
        </span>
        <span className="inline-flex items-center gap-1">🪙 {coins}</span>
      </div>
    </header>
  );
}

function PetBar({ pet }: { pet: { nickname?: string; level?: number; species_id?: string } | null }) {
  const exp = (pet as any)?.exp ?? 0;
  const expToNext = Math.max(0, 100 - (exp % 100));
  return (
    <div className="mt-6 flex items-center justify-between rounded-xl border border-[#E7E1D2] bg-white p-3">
      <div className="flex items-center gap-3">
        <div
          className="grid size-10 place-items-center rounded-full text-xl"
          style={{ background: "#FAF1DC" }}
          aria-hidden
        >
          🐣
        </div>
        <div>
          <div className="text-[13px] font-bold" style={{ color: NAVY }}>
            {pet?.nickname || <T>小鸡</T>} · Lv.{pet?.level ?? 2}
          </div>
          <div className="text-[11px]" style={{ color: NAVY, opacity: 0.6 }}>
            {pet ? (
              <>还差 {expToNext} 经验升级</>
            ) : (
              <T>领养宠物后开始陪学</T>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticeChips({ grade }: { grade: GradeKey }) {
  const navigate = useNavigate();
  const chips: { label: string; to: string }[] = [
    { label: grade === "1" ? "单元同步学习" : "AI 题型工坊", to: `/gaokao/grammar?grade=${grade}` },
    { label: grade === "3" ? "AI 模拟卷生成" : "期中模拟", to: "/gaokao/exam" },
    { label: "错题智能重组", to: "/gaokao/mistakes" },
    { label: grade === "3" ? "3500 词情境记忆" : "3500 词从零开始", to: `/gaokao/vocab?grade=${grade}` },
  ];
  return (
    <div className="mt-5">
      <div className="text-[11px]" style={{ color: NAVY, opacity: 0.55 }}>
        <T>{grade === "3" ? "想自己练？(AI 推荐通常更高效)" : "想自己练？"}</T>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={() => navigate(c.to)}
            className="rounded-full border border-[#E7E1D2] bg-white px-3 py-1.5 text-[12px] hover:border-[#0E2746]/30"
            style={{ color: NAVY }}
          >
            <T>{c.label}</T>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------ small UI atoms ------------ */

function StatBox({
  label, value, sub, highlight, alert,
}: { label: string; value: string; sub?: string; highlight?: boolean; alert?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        highlight ? "border-[#C8896A]/60 bg-[#FBEDE3]" : alert ? "border-[#E85D3A]/40 bg-[#FDEEEA]" : "border-[#E7E1D2] bg-white"
      }`}
    >
      <div className="text-[10px]" style={{ color: NAVY, opacity: 0.6 }}>
        <T>{label}</T>
      </div>
      <div className="mt-0.5 text-[15px] font-bold" style={{ color: NAVY }}>
        {value}
      </div>
      {sub && (
        <div className="text-[10px]" style={{ color: NAVY, opacity: 0.55 }}>
          <T>{sub}</T>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  num, title, sub, meta, coin, active, onClick,
}: { num: number; title: string; sub: string; meta: string; coin: number; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition hover:border-[#0E2746]/30 ${
        active ? "border-[#C8896A] bg-[#FCEEE5]" : "border-[#E7E1D2] bg-white"
      }`}
    >
      <div
        className="grid size-10 shrink-0 place-items-center rounded-lg text-base"
        style={{ background: active ? "#C8896A22" : "#F4EFE0", color: NAVY }}
      >
        {["📊", "🎯", "🧠"][num - 1]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold" style={{ color: NAVY }}>
          <span className="mr-1">{["①", "②", "③"][num - 1]}</span>
          <T>{title}</T>
        </div>
        <div className="mt-0.5 text-[11px]" style={{ color: NAVY, opacity: 0.65 }}>
          <T>{sub}</T>
        </div>
      </div>
      <div className="text-right text-[10px]" style={{ color: NAVY, opacity: 0.7 }}>
        <div><T>{meta}</T></div>
        <div className="mt-0.5 inline-flex items-center gap-0.5">🪙 {coin}</div>
        <div className="mt-1 font-bold" style={{ color: TERRA }}>
          <T>开始 →</T>
        </div>
      </div>
    </button>
  );
}

/* ------------ data hooks ------------ */

function useGradeData() {
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) {
        if (!cancelled) setLoading(false);
        return;
      }
      const [{ data: cur }, { data: pets }, streakRes] = await Promise.all([
        supabase.from("user_currencies").select("seeds").eq("user_id", uid).maybeSingle(),
        supabase.from("user_pets").select("*").eq("user_id", uid).eq("is_active", true).maybeSingle(),
        supabase.rpc("get_user_streak_stats"),
      ]);
      if (cancelled) return;
      setCoins(cur?.seeds ?? 0);
      setPet(pets ?? null);
      const sr: any = Array.isArray(streakRes.data) ? streakRes.data[0] : streakRes.data;
      setStreak(sr?.current_streak ?? 0);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return { coins, streak, pet, loading };
}

/* ------------ G1 page ------------ */

type GradePageProps = {
  streak: number; coins: number; pet: any;
  displayName?: string;
  tasks?: PrescriptionTask[];
  weekly?: Array<{ kp_id: string; kp_title: string; skill_area?: string }>;
  weakTop3?: Array<{ kp_id: string; kp_title: string; mastery?: number; skill_area?: string }>;
  days?: Record<string, number>;
  kpStats?: { total: number; mastered: number; this_week_new: number };
  dims?: Record<string, { score: number; max: number; mastery_pct: number }>;
  targetScore?: number;
  rxLoading?: boolean;
  rxError?: boolean;
  guidance?: string;
  onRegen?: () => void;
  regenPending?: boolean;
};

function RxBlock({ tasks, rxLoading, rxError, guidance, onRegen, regenPending, fallback }: {
  tasks?: PrescriptionTask[]; rxLoading?: boolean; rxError?: boolean;
  guidance?: string; onRegen?: () => void; regenPending?: boolean;
  fallback: React.ReactNode;
}) {
  const navigate = useNavigate();
  if (rxLoading) return <div className="mt-3 h-32 animate-pulse rounded-xl bg-black/5" />;
  if (rxError) return (
    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
      <T>处方加载失败</T>
      {onRegen && <button onClick={onRegen} className="ml-2 underline"><T>重试</T></button>}
    </div>
  );
  if (guidance) return (
    <div className="mt-3 rounded-xl border border-[#E7E1D2] bg-[#FBEDE3] p-4 text-[12px]" style={{ color: NAVY }}>
      💡 {guidance}
    </div>
  );
  if (!tasks || tasks.length === 0) return <>{fallback}</>;
  const skillRoute = (s?: string) => {
    if (s === "vocab") return "/gaokao/vocab";
    if (s === "reading") return "/gaokao/reading";
    if (s === "cloze") return "/gaokao/cloze";
    if (s === "writing") return "/gaokao/exam";
    if (s === "listening") return "/gaokao/exam";
    return "/gaokao/grammar";
  };
  const typeLabel = (t: string) => t === "learn" ? "学习" : t === "breakthrough" ? "突破" : t === "consolidate" ? "巩固" : "复习";
  return (
    <div className="mt-3 space-y-2">
      {tasks.slice(0, 3).map((t, i) => (
        <TaskCard
          key={t.kp_id || i}
          num={i + 1}
          title={`${typeLabel(t.type)} · ${t.kp_title}`}
          sub={t.why_this || `掌握度 ${t.mastery_before}% → 预计 ${t.mastery_after_estimated}%`}
          meta={`${t.est_minutes} 分钟`}
          coin={t.est_coins}
          active={i === 0}
          onClick={() => navigate(skillRoute(t.skill_area))}
        />
      ))}
      {onRegen && (
        <button onClick={onRegen} disabled={regenPending}
          className="mt-1 text-[11px] underline" style={{ color: NAVY, opacity: 0.6 }}>
          {regenPending ? <T>生成中…</T> : <T>换一组 ↻</T>}
        </button>
      )}
    </div>
  );
}

function WeeklyChips({ weekly, fallback }: { weekly?: Array<{ kp_title: string }>; fallback: string[] }) {
  const items = weekly && weekly.length > 0 ? weekly.slice(0, 3).map(w => w.kp_title) : fallback;
  return (
    <div className="mt-1 space-y-1">
      {items.map((k, i) => (
        <div key={k + i} className="flex items-center gap-1">
          <span className="rounded-sm bg-white/20 px-1.5 py-0.5 text-[9px] font-bold">
            <T>{i === 0 ? "今日" : "本周"}</T>
          </span>
          <span className="text-[10px] truncate"><T>{k}</T></span>
        </div>
      ))}
    </div>
  );
}

function Grade1Page({ streak, coins, pet, displayName, tasks, weekly, days, kpStats, rxLoading, rxError, guidance, onRegen, regenPending }: GradePageProps) {
  const navigate = useNavigate();
  const finalsDays = days?.finals ?? 42;
  const mastered = kpStats?.mastered ?? 0;
  const total = kpStats?.total ?? 0;
  const thisWeek = kpStats?.this_week_new ?? 0;
  return (
    <>
      <GradeHeader grade="1" streak={streak} coins={coins} />

      {/* Top info bar */}
      <section
        className="mt-4 rounded-2xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #1f4378 100%)` }}
      >
        <div className="grid grid-cols-3 gap-4 text-[11px]">
          <div>
            <div className="opacity-75"><T>学期进度</T></div>
            <div className="mt-1 text-[22px] font-bold leading-none">28<span className="text-[12px] ml-0.5">%</span></div>
            <div className="mt-1 opacity-70"><T>高一上 · 已学 8 单元</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>距期末</T></div>
            <div className="mt-1 text-[22px] font-bold leading-none">{finalsDays}<span className="text-[12px] ml-0.5"><T>天</T></span></div>
            <div className="mt-1 opacity-70"><T>每周目标 4 个新点</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>本周新知重点</T></div>
            <WeeklyChips weekly={weekly} fallback={["现在完成时", "there be 句型", "情态推测"]} />
          </div>
        </div>
      </section>

      {/* Today's AI prescription */}
      <section className="mt-5">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>今日 AI 处方</T>
          </div>
        </div>
        <RxBlock tasks={tasks} rxLoading={rxLoading} rxError={rxError} guidance={guidance} onRegen={onRegen} regenPending={regenPending}
          fallback={
            <div className="mt-3 space-y-2">
              <TaskCard num={1} title="学习 · 现在完成时 (have done)" sub="微课 3 分钟 → 规则卡 → 5 道引导题 → 评估" meta="15 分钟" coin={20} active onClick={() => navigate(`/gaokao/grammar?grade=1`)} />
              <TaskCard num={2} title="突破 · 一般过去时易错点" sub="上周学过你错了 2 道，掌握度 52% · 完成后 70%+" meta="10 分钟" coin={10} onClick={() => navigate(`/gaokao/grammar?grade=1`)} />
              <TaskCard num={3} title="复习 · 8 个词到了遗忘节点" sub="两周前掌握的高频词 · 不复习预计 2 天遗忘" meta="5 分钟" coin={5} onClick={() => navigate(`/gaokao/vocab?grade=1&mode=srs`)} />
            </div>
          } />
      </section>

      {/* Knowledge map */}
      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>高一上 · 知识地图</T>
          </div>
          <div className="text-[11px]" style={{ color: NAVY, opacity: 0.6 }}>
            <T>高一阶段需掌握 95 个</T>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          <StatBox label="已学" value={String(mastered)} sub={`本周 +${thisWeek}`} />
          <StatBox label="本周学" value={String(thisWeek)} sub="进行中" />
          <StatBox label="待学" value={String(Math.max(0, total - mastered))} sub={`总 ${total}`} highlight />
          <StatBox label="词汇" value="412" sub="/3500 高频核心" />
          <StatBox label="连续" value={`${streak}`} sub="🔥" />
        </div>

        <div
          className="mt-4 rounded-xl border p-4"
          style={{ background: "#EFEAFB", borderColor: "#D6CDF1" }}
        >
          <div className="text-[12px] font-bold" style={{ color: "#4A3E8C" }}>
            {displayName}<T>，你还在打基础阶段</T>
          </div>
          <div className="mt-1 text-[11px] leading-relaxed" style={{ color: "#4A3E8C", opacity: 0.85 }}>
            <T>这里不和你聊高考分数——先把高一这学期的 23 个核心知识点稳稳学会。AI 会按你的节奏推内容，遇到难的我们慢下来。</T>
          </div>
        </div>
      </section>

      <PetBar pet={pet} />
      <PracticeChips grade="1" />
    </>
  );
}

/* ------------ G2 page ------------ */

function Grade2Page({
  streak, coins, pet, displayName, tasks, weekly, days, kpStats, dims,
  rxLoading, rxError, guidance, onRegen, regenPending,
}: GradePageProps) {
  const navigate = useNavigate();
  const finalsDays = days?.finals ?? 58;
  const gaokaoDays = days?.gaokao ?? 510;
  const total = kpStats?.total ?? 0;
  const mastered = kpStats?.mastered ?? 0;
  const readinessPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const targetPct = 80;
  const dimEntries: [string, { score: number; max: number }][] = [
    ["听力", dims?.listening ?? { score: 0, max: 30 }],
    ["阅读", dims?.reading ?? { score: 0, max: 50 }],
    ["词汇", dims?.vocab ?? { score: 0, max: 15 }],
    ["语法", dims?.grammar ?? { score: 0, max: 15 }],
    ["写作", dims?.writing ?? { score: 0, max: 40 }],
  ];
  const hasDims = dims && Object.keys(dims).length > 0;
  return (
    <>
      <GradeHeader grade="2" streak={streak} coins={coins} />

      <section
        className="mt-4 rounded-2xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #1f4378 100%)` }}
      >
        <div className="grid grid-cols-3 gap-4 text-[11px]">
          <div>
            <div className="opacity-75"><T>高考备考度</T></div>
            <div className="mt-1 text-[22px] font-bold leading-none">{readinessPct}<span className="text-[12px] ml-0.5">%</span></div>
            <div className="mt-1 opacity-70">{mastered}/{total} <T>知识点</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>距期末</T></div>
            <div className="mt-1 text-[22px] font-bold leading-none">{finalsDays}<span className="text-[12px] ml-0.5"><T>天</T></span></div>
            <div className="mt-1 opacity-70"><T>高二阶段</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>本周重点</T></div>
            <WeeklyChips weekly={weekly} fallback={["定语从句", "完成时态", "宾语从句"]} />
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>今日 AI 处方</T>
          </div>
        </div>
        <RxBlock tasks={tasks} rxLoading={rxLoading} rxError={rxError} guidance={guidance} onRegen={onRegen} regenPending={regenPending}
          fallback={
            <div className="mt-3 rounded-xl border border-[#E7E1D2] bg-[#FAF8F1] p-4 text-[12px]" style={{ color: NAVY }}>
              <T>做几道题后 AI 会为你定制处方 →</T>
            </div>
          } />
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>能力地图 · 高考备考度</T>
          </div>
          <div className="text-[11px]" style={{ color: NAVY, opacity: 0.6 }}>
            <T>距高考</T> {gaokaoDays} <T>天</T>
          </div>
        </div>

        <div className="mt-3 rounded-xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #284c80 100%)` }}>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] opacity-75"><T>高考备考度</T></div>
              <div className="mt-1 text-[28px] font-bold leading-none">{readinessPct}%</div>
              <div className="mt-1 text-[10px] opacity-70"><T>已掌握</T> {mastered}/{total} <T>知识点</T></div>
            </div>
            <div className="text-right">
              <div className="text-[10px] opacity-70"><T>高二结束目标</T></div>
              <div className="mt-1 text-[18px] font-bold">≥{targetPct}%</div>
              <div className="text-[10px] opacity-70"><T>还差</T> {Math.max(0, targetPct - readinessPct)}%</div>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white/85" style={{ width: `${readinessPct}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[9px] opacity-60">
            <span>0</span><span>▲ <T>当前</T></span><span>▲ <T>目标</T></span><span>100%</span>
          </div>
        </div>

        {hasDims ? (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {dimEntries.map(([label, d]) => (
              <StatBox key={label} label={label} value={`${d.score}/${d.max}`} />
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-[#E7E1D2] bg-white p-3 text-[12px]" style={{ color: NAVY }}>
            <T>完成入门快测后这里会显示你的 5 维分数 →</T>
          </div>
        )}

        <div className="mt-3 rounded-xl border border-[#E7E1D2] bg-[#FAF8F1] p-3 text-[12px]" style={{ color: NAVY }}>
          💡 <span className="font-bold">{displayName}<T>，本学期重点：</T></span>
          <T>从句体系（语法）+ 长难句拆解（阅读）</T>
        </div>
      </section>

      <PetBar pet={pet} />
      <PracticeChips grade="2" />
    </>
  );
}

/* ------------ G3 page ------------ */

function Grade3Page({
  streak, coins, pet, displayName, tasks, weakTop3, days, kpStats, dims,
  targetScore, rxLoading, rxError, guidance, onRegen, regenPending,
}: GradePageProps) {
  const gaokaoDays = days?.gaokao ?? 87;
  const target = targetScore ?? 130;
  const total = kpStats?.total ?? 0;
  const mastered = kpStats?.mastered ?? 0;
  // Estimated score: scale mastery to /150
  const estimatedScore = total > 0 ? Math.round((mastered / total) * 150) : 0;
  const scoreGap = Math.max(0, target - estimatedScore);
  const dailyNeed = gaokaoDays > 0 ? (scoreGap / gaokaoDays).toFixed(2) : "0";

  const dimEntries: [string, { score: number; max: number }, string][] = [
    ["听力", dims?.listening ?? { score: 0, max: 30 }, "listening"],
    ["阅读", dims?.reading ?? { score: 0, max: 50 }, "reading"],
    ["词汇", dims?.vocab ?? { score: 0, max: 15 }, "vocab"],
    ["语法", dims?.grammar ?? { score: 0, max: 15 }, "grammar"],
    ["写作", dims?.writing ?? { score: 0, max: 40 }, "writing"],
  ];
  const hasDims = dims && Object.keys(dims).length > 0;

  // ROI = score_gap_for_dim / current_mastery_pct (lower mastery + bigger gap = higher ROI)
  const roiList = (weakTop3 ?? []).slice(0, 4).map((w, i) => {
    const dim = w.skill_area && dims?.[w.skill_area];
    const dimGap = dim ? Math.max(0, dim.max - dim.score) : 0;
    const mPct = w.mastery ?? dim?.mastery_pct ?? 30;
    const roi = (dimGap > 0 ? dimGap : 5) / Math.max(20, mPct) * 2;
    return {
      label: `${["①", "②", "③", "④"][i]} ${w.kp_title}`,
      roi: `+${roi.toFixed(1)} 分/h`,
      op: i < 2 ? 1 : i === 2 ? 0.7 : 0.45,
    };
  });

  return (
    <>
      <GradeHeader grade="3" streak={streak} coins={coins} />

      <section
        className="mt-4 rounded-2xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1a3760 100%)` }}
      >
        <div className="grid grid-cols-3 gap-4 text-[11px]">
          <div>
            <div className="opacity-75"><T>AI 预估高考</T></div>
            <div className="mt-1 text-[24px] font-bold leading-none">{estimatedScore}<span className="text-[12px] ml-0.5">/150</span></div>
            <div className="mt-1 opacity-70"><T>目标</T> {target} · <T>差</T> {scoreGap} <T>分</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>距高考</T></div>
            <div className="mt-1 text-[24px] font-bold leading-none">{gaokaoDays}<span className="text-[12px] ml-0.5"><T>天</T></span></div>
            <div className="mt-1 opacity-70"><T>每日需提</T> {dailyNeed} <T>分</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>AI 攻克 · 弱点 TOP 3</T></div>
            {weakTop3 && weakTop3.length > 0 ? (
              <div className="mt-1 space-y-1">
                {weakTop3.slice(0, 3).map((w, i) => (
                  <div key={w.kp_id} className="flex items-center gap-1">
                    <span className="rounded-sm bg-white/20 px-1.5 py-0.5 text-[9px] font-bold">
                      <T>{i === 0 ? "今日" : i === 1 ? "明日" : "后日"}</T>
                    </span>
                    <span className="text-[10px] truncate"><T>{w.kp_title}</T></span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-1 text-[10px] opacity-70"><T>做几套题 AI 即定位弱点 →</T></div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>今日 AI 处方</T>
          </div>
        </div>
        <RxBlock tasks={tasks} rxLoading={rxLoading} rxError={rxError} guidance={guidance} onRegen={onRegen} regenPending={regenPending}
          fallback={
            <div className="mt-3 rounded-xl border border-[#E7E1D2] bg-[#FAF8F1] p-4 text-[12px]" style={{ color: NAVY }}>
              <T>今日任务正在生成… 完成入门快测后即出处方</T>
            </div>
          } />
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>能力地图 · 距目标分数</T>
          </div>
          <div className="text-[11px]" style={{ color: NAVY, opacity: 0.6 }}>
            <T>总目标</T> {target} · <T>距高考</T> {gaokaoDays} <T>天</T>
          </div>
        </div>

        <div className="mt-3 rounded-xl p-3 text-white" style={{ background: "#9C2A1F" }}>
          <div className="text-[12px] font-bold">⏰ <T>今日不练 = 预计损失</T> {dailyNeed} <T>分</T></div>
          <div className="mt-1 text-[10px] opacity-85"><T>连续</T> {streak} <T>天打卡</T></div>
        </div>

        {hasDims ? (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {dimEntries.map(([label, d]) => {
              const gap = Math.max(0, d.max - d.score);
              return (
                <StatBox key={label} label={label} value={`${d.score}/${d.max}`}
                  sub={gap === 0 ? "✓ 已达标" : `差 ${gap} 分`}
                  alert={gap > d.max * 0.5} />
              );
            })}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-[#E7E1D2] bg-white p-3 text-[12px]" style={{ color: NAVY }}>
            <T>完成入门快测后这里会显示你的 5 维分数 →</T>
          </div>
        )}

        <div className="mt-3 rounded-xl border-l-4 border-[#5BA374] bg-[#F1F8F2] p-3">
          <div className="flex items-baseline justify-between">
            <div className="text-[12px] font-bold" style={{ color: "#2E5238" }}>
              🎯 <T>AI 提分性价比 · 哪里下功夫最值</T>
            </div>
            <div className="text-[10px]" style={{ color: "#2E5238", opacity: 0.7 }}><T>每周更新</T></div>
          </div>
          {roiList.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-[11px]" style={{ color: "#2E5238" }}>
              {roiList.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-2" style={{ opacity: r.op }}>
                  <span className="truncate"><T>{r.label}</T></span>
                  <span className="rounded bg-white px-2 py-0.5 font-mono font-bold">{r.roi}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-2 text-[11px]" style={{ color: "#2E5238" }}>
              {displayName}<T>，做几套题后 AI 会算出你的提分性价比 →</T>
            </div>
          )}
          <div className="mt-2 text-[10px]" style={{ color: "#2E5238", opacity: 0.65 }}>
            <T>ROI = 距目标分差 ÷ 当前掌握度 · 高三剩余时间最稀缺</T>
          </div>
        </div>
      </section>

      <PetBar pet={pet} />
      <PracticeChips grade="3" />
    </>
  );
}

/* ------------ root ------------ */

export default function GaokaoGrade() {
  const { grade } = useParams<{ grade: string }>();
  const g: GradeKey = grade === "2" ? "2" : grade === "3" ? "3" : "1";
  const { coins, streak, pet, loading } = useGradeData();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const {
    data: prescription,
    isLoading: rxLoading,
    error: rxError,
  } = useDailyPrescription();
  const regen = useRegeneratePrescription();

  const displayName = summary?.profile?.display_name || "同学";
  const tasks: PrescriptionTask[] = (prescription?.tasks as PrescriptionTask[]) ?? [];
  const weekly = prescription?.weekly_focus ?? [];
  const days = summary?.days_remaining ?? {};
  const dims = summary?.dimensions ?? {};
  const kpStats = summary?.kp_stats ?? { total: 0, mastered: 0, this_week_new: 0 };

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(180deg, #F8F6EF 0%, #EFECDF 100%)" }}>
      <div className="mx-auto max-w-2xl px-5 py-5">
        {(loading || summaryLoading) && (
          <div className="mb-3 h-8 animate-pulse rounded bg-black/5" />
        )}
        {g === "1" && (
          <Grade1Page
            streak={streak} coins={coins} pet={pet}
            displayName={displayName} tasks={tasks} weekly={weekly}
            days={days} kpStats={kpStats}
            rxLoading={rxLoading} rxError={!!rxError}
            guidance={prescription?.guidance}
            onRegen={() => regen.mutate()}
            regenPending={regen.isPending}
          />
        )}
        {g === "2" && (
          <Grade2Page
            streak={streak} coins={coins} pet={pet}
            displayName={displayName} tasks={tasks} weekly={weekly}
            days={days} kpStats={kpStats} dims={dims}
            rxLoading={rxLoading} rxError={!!rxError}
            guidance={prescription?.guidance}
            onRegen={() => regen.mutate()}
            regenPending={regen.isPending}
          />
        )}
        {g === "3" && (
          <Grade3Page
            streak={streak} coins={coins} pet={pet}
            displayName={displayName} tasks={tasks} weekly={weekly}
            weakTop3={prescription?.weak_top3 ?? []}
            days={days} kpStats={kpStats} dims={dims}
            targetScore={summary?.profile?.target_score ?? 130}
            rxLoading={rxLoading} rxError={!!rxError}
            guidance={prescription?.guidance}
            onRegen={() => regen.mutate()}
            regenPending={regen.isPending}
          />
        )}
      </div>
    </main>
  );
}