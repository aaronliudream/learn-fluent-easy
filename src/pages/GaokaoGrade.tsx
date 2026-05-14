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

function Grade1Page({ streak, coins, pet }: { streak: number; coins: number; pet: any }) {
  const navigate = useNavigate();
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
            <div className="mt-1 text-[22px] font-bold leading-none">42<span className="text-[12px] ml-0.5"><T>天</T></span></div>
            <div className="mt-1 opacity-70"><T>每周目标 4 个新点</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>本周新知重点</T></div>
            <div className="mt-1 space-y-1">
              {["现在完成时", "there be 句型", "情态推测"].map((k, i) => (
                <div key={k} className="flex items-center gap-1">
                  <span className="rounded-sm bg-white/20 px-1.5 py-0.5 text-[9px] font-bold">
                    <T>{i === 0 ? "今日" : "本周"}</T>
                  </span>
                  <span className="text-[10px] truncate"><T>{k}</T></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Today's AI prescription */}
      <section className="mt-5">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>今日 AI 处方</T>
            <span className="ml-2 text-[10px] font-normal opacity-60">
              <T>30 分钟 · 学 1 新 + 巩固 1 旧 · 🪙 ×35</T>
            </span>
          </div>
          <button className="text-[11px]" style={{ color: NAVY, opacity: 0.6 }}>
            <T>换一组 ↻</T>
          </button>
        </div>
        <div className="mt-3 space-y-2">
          <TaskCard num={1} title="学习 · 现在完成时 (have done)" sub="微课 3 分钟 → 规则卡 → 5 道引导题 → 评估" meta="15 分钟" coin={20} active onClick={() => navigate(`/gaokao/grammar?grade=1`)} />
          <TaskCard num={2} title="突破 · 一般过去时易错点" sub="上周学过你错了 2 道，掌握度 52% · 完成后 70%+" meta="10 分钟" coin={10} onClick={() => navigate(`/gaokao/grammar?grade=1`)} />
          <TaskCard num={3} title="复习 · 8 个词到了遗忘节点" sub="两周前掌握的高频词 · 不复习预计 2 天遗忘" meta="5 分钟" coin={5} onClick={() => navigate(`/gaokao/vocab?grade=1&mode=srs`)} />
        </div>
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
          <StatBox label="已学" value="12" sub="本周 +3" />
          <StatBox label="本周学" value="3" sub="进行中" />
          <StatBox label="待学" value="80" sub="高一余 80" highlight />
          <StatBox label="词汇" value="412" sub="/3500 高频核心" />
          <StatBox label="连续" value={`${streak}`} sub="🔥" />
        </div>

        <div
          className="mt-4 rounded-xl border p-4"
          style={{ background: "#EFEAFB", borderColor: "#D6CDF1" }}
        >
          <div className="text-[12px] font-bold" style={{ color: "#4A3E8C" }}>
            <T>小明，你还在打基础阶段</T>
            {/* TODO: 等 AI 处方引擎 prompt 后替换学生姓名 + 阶段判断 */}
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

function Grade2Page({ streak, coins, pet }: { streak: number; coins: number; pet: any }) {
  const navigate = useNavigate();
  return (
    <>
      <GradeHeader grade="2" streak={streak} coins={coins} />

      <section
        className="mt-4 rounded-2xl p-5 text-white"
        style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #1f4378 100%)` }}
      >
        <div className="grid grid-cols-3 gap-4 text-[11px]">
          <div>
            <div className="opacity-75"><T>学情水平</T></div>
            <div className="mt-1 text-[22px] font-bold leading-none">94<span className="text-[12px] ml-0.5">/150 ↑5</span></div>
            <div className="mt-1 opacity-70"><T>预估当前高考分</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>距期末</T></div>
            <div className="mt-1 text-[22px] font-bold leading-none">58<span className="text-[12px] ml-0.5"><T>天</T></span></div>
            <div className="mt-1 opacity-70"><T>高二上学期</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>本周重点</T></div>
            <div className="mt-1 space-y-1">
              {["学定语从句", "突破完成时", "巩固宾从"].map((k) => (
                <div key={k} className="flex items-center gap-1">
                  <span className="rounded-sm bg-white/20 px-1.5 py-0.5 text-[9px] font-bold"><T>本周</T></span>
                  <span className="text-[10px] truncate"><T>{k}</T></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>今日 AI 处方</T>
            <span className="ml-2 text-[10px] font-normal opacity-60"><T>28 分钟 · 学 1 新 + 练 1 + 复习 1 · 🪙 ×25</T></span>
          </div>
          <button className="text-[11px]" style={{ color: NAVY, opacity: 0.6 }}><T>换一组 ↻</T></button>
        </div>
        <div className="mt-3 space-y-2">
          <TaskCard num={1} title="学习 · 定语从句关系副词" sub="微课 → 规则 → 5 道引导题 · 学完掌握度 0% → 65%" meta="12 分钟" coin={15} active onClick={() => navigate(`/gaokao/grammar?grade=2`)} />
          <TaskCard num={2} title="突破 · 完成时易错点（高频）" sub="上周新学 · 掌握度 48% · 完成后预计 70%+" meta="10 分钟" coin={8} onClick={() => navigate(`/gaokao/grammar?grade=2`)} />
          <TaskCard num={3} title="复习 · 6 个词到了遗忘节点" sub="上次掌握 5 天前 · 不复习预计 2 天内遗忘" meta="6 分钟" coin={5} onClick={() => navigate(`/gaokao/vocab?grade=2&mode=srs`)} />
        </div>
      </section>

      {/* Ability map */}
      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>能力地图 · 高考备考度</T>
          </div>
          <div className="text-[11px]" style={{ color: NAVY, opacity: 0.6 }}>
            <T>距高考 1 年 145 天</T>
          </div>
        </div>

        <div
          className="mt-3 rounded-xl p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #284c80 100%)` }}
        >
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] opacity-75"><T>高考备考度</T></div>
              <div className="mt-1 text-[28px] font-bold leading-none">62%</div>
              <div className="mt-1 text-[10px] opacity-70"><T>已掌握 67/286 知识点 · 本月 +12 个</T></div>
            </div>
            <div className="text-right">
              <div className="text-[10px] opacity-70"><T>高二结束目标</T></div>
              <div className="mt-1 text-[18px] font-bold">≥80%</div>
              <div className="text-[10px] opacity-70"><T>还差 18%</T></div>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white/85" style={{ width: "62%" }} />
          </div>
          <div className="mt-1 flex justify-between text-[9px] opacity-60">
            <span>0</span><span>▲ 当前</span><span>▲ 目标</span><span>100%</span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-2">
          <StatBox label="听力" value="22/30" sub="高一稳了" />
          <StatBox label="阅读" value="26/50" sub="攻长难句" />
          <StatBox label="词汇" value="9/15" sub="1840/3500" />
          <StatBox label="语法" value="5/15" sub="本学期重点" highlight />
          <StatBox label="写作" value="12/40" sub="高三决胜" />
        </div>

        <div className="mt-3 rounded-xl border border-[#E7E1D2] bg-[#FAF8F1] p-3 text-[12px]" style={{ color: NAVY }}>
          💡 <span className="font-bold"><T>本学期教学重点：</T></span>
          <T>从句体系（语法）+ 长难句拆解（阅读）</T>
          <div className="mt-1 opacity-75 text-[11px]">
            <T>长线累积：词汇每周 80-120 词 · 写作每周 1 篇打底</T>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[#E7E1D2] bg-white p-3 text-[11px]" style={{ color: NAVY }}>
          <div className="opacity-60"><T>同期前 30% 学生轨迹 · 匿名</T></div>
          <div className="mt-1.5">
            <T>他们高二下学期末备考度通常 75%+ · 你目前 62%</T>
          </div>
          <div className="mt-1 opacity-75"><T>差距集中在 语法 / 写作</T></div>
          <div className="mt-1 opacity-60">→ <T>AI 建议：未来 4 个月每周多投入 30 分钟在语法系统课</T></div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]" style={{ color: NAVY }}>
          <div className="rounded-lg border border-[#E7E1D2] bg-white p-2.5">
            <div className="opacity-60"><T>本月提分</T></div>
            <div className="mt-0.5 text-[14px] font-bold">+12 <span className="text-[10px] font-normal"><T>分</T></span></div>
            <div className="opacity-55 text-[10px]">82 → 94</div>
          </div>
          <div className="rounded-lg border border-[#E7E1D2] bg-white p-2.5">
            <div className="opacity-60"><T>本月新学</T></div>
            <div className="mt-0.5 text-[14px] font-bold">23 <span className="text-[10px] font-normal"><T>个知识点</T></span></div>
            <div className="opacity-55 text-[10px]"><T>超额完成 +8</T></div>
          </div>
          <div className="rounded-lg border border-[#E7E1D2] bg-white p-2.5">
            <div className="opacity-60">286 <T>知识点</T></div>
            <div className="mt-0.5 text-[14px] font-bold"><T>已掌握 67</T> · 23%</div>
            <div className="opacity-55 text-[10px]"><T>本周 +6 个</T></div>
          </div>
        </div>
      </section>

      <PetBar pet={pet} />
      <PracticeChips grade="2" />
    </>
  );
}

/* ------------ G3 page ------------ */

function Grade3Page({ streak, coins, pet }: { streak: number; coins: number; pet: any }) {
  const navigate = useNavigate();
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
            <div className="mt-1 text-[24px] font-bold leading-none">118<span className="text-[12px] ml-0.5">/150 ↑3</span></div>
            <div className="mt-1 opacity-70"><T>目标 130 · 差 12 分</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>距高考</T></div>
            <div className="mt-1 text-[24px] font-bold leading-none">87<span className="text-[12px] ml-0.5"><T>天</T></span></div>
            <div className="mt-1 opacity-70"><T>每日需提 0.14 分</T></div>
          </div>
          <div>
            <div className="opacity-75"><T>AI 攻克 · 弱点 TOP 3</T></div>
            <div className="mt-1 space-y-1">
              {[["今日", "读后续写 38%"], ["明日", "虚拟语气 42%"], ["后日", "长难句 56%"]].map(([d, k]) => (
                <div key={k} className="flex items-center gap-1">
                  <span className="rounded-sm bg-white/20 px-1.5 py-0.5 text-[9px] font-bold"><T>{d}</T></span>
                  <span className="text-[10px] truncate"><T>{k}</T></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>今日 AI 处方</T>
            <span className="ml-2 text-[10px] font-normal opacity-60"><T>25 分钟 · 完成 +0.5 分 · 🪙 ×30</T></span>
          </div>
          <button className="text-[11px]" style={{ color: NAVY, opacity: 0.6 }}><T>换一组 ↻</T></button>
        </div>
        <div className="mt-3 space-y-2">
          <TaskCard num={1} title="复习 · 5 个词到了遗忘节点" sub="上次掌握 4 周前 · 复习后下次出现在 9 天后" meta="5 分钟" coin={5} onClick={() => navigate(`/gaokao/vocab?grade=3&mode=srs`)} />
          <TaskCard num={2} title="突破 · 针对你的 #1 弱点 · 读后续写情绪刻画" sub="完成后续写掌握度 38% → 55% · 预计提分 +0.3" meta="12 分钟" coin={15} active onClick={() => navigate(`/gaokao/exam`)} />
          <TaskCard num={3} title='新知 · "倒装句"专题' sub="AI 判定你还未系统学过 · 近 3 年高考出现 7 次" meta="8 分钟" coin={10} onClick={() => navigate(`/gaokao/grammar?grade=3`)} />
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <div className="text-[14px] font-bold" style={{ color: NAVY }}>
            <T>能力地图 · 距目标分数</T>
          </div>
          <div className="text-[11px]" style={{ color: NAVY, opacity: 0.6 }}>
            <T>总目标 130 · 距高考 87 天</T>
          </div>
        </div>

        <div className="mt-3 rounded-xl p-3 text-white" style={{ background: "#9C2A1F" }}>
          <div className="text-[12px] font-bold">⏰ <T>今日不练 = 预计损失 0.14 分</T><span className="opacity-80 font-normal text-[11px]"> （按 12 分差 ÷ 87 天均摊）</span></div>
          <div className="mt-1 text-[10px] opacity-85"><T>连续 7 天打卡 · 比平均同学领先 8 天</T></div>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-2">
          <StatBox label="听力" value="24/30" sub="✓ 已达标" />
          <StatBox label="阅读" value="34/50" sub="差 9 分" />
          <StatBox label="词汇" value="11/15" sub="差 2 分" />
          <StatBox label="语法" value="8/15" sub="差 5 分" />
          <StatBox label="写作" value="26/40" sub="差 8 分" alert />
        </div>

        <div className="mt-3 rounded-xl border-l-4 border-[#5BA374] bg-[#F1F8F2] p-3">
          <div className="flex items-baseline justify-between">
            <div className="text-[12px] font-bold" style={{ color: "#2E5238" }}>
              🎯 <T>AI 提分性价比 · 哪里下功夫最值</T>
            </div>
            <div className="text-[10px]" style={{ color: "#2E5238", opacity: 0.7 }}><T>每周更新</T></div>
          </div>
          <ul className="mt-2 space-y-1.5 text-[11px]" style={{ color: "#2E5238" }}>
            {[
              ["① 写作情绪刻画 · 12→18 分（最薄弱）", "+0.8 分/h", 1],
              ["② 完形限时训练 · 慢 78 秒/题", "+0.6 分/h", 1],
              ["③ 长难句拆解 · 嵌套 3 层正确率 38%", "+0.5 分/h", 0.7],
              ["④ 听力短对话 · 已掌握度高", "+0.1 分/h", 0.45],
            ].map(([label, roi, op]) => (
              <li key={label as string} className="flex items-center justify-between gap-2" style={{ opacity: op as number }}>
                <span className="truncate"><T>{label as string}</T></span>
                <span className="rounded bg-white px-2 py-0.5 font-mono font-bold">{roi as string}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-[10px]" style={{ color: "#2E5238", opacity: 0.65 }}>
            <T>ROI = (距目标分差 × 学习速度) ÷ 当前已掌握度 · 高三剩余时间最稀缺，按性价比下手最划算</T>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]" style={{ color: NAVY }}>
          <div className="rounded-lg border border-[#E7E1D2] bg-white p-2.5">
            <div className="opacity-60">30 <T>天提分</T></div>
            <div className="mt-0.5 text-[14px] font-bold">+8 <T>分</T></div>
            <div className="opacity-55 text-[10px]">110 → 118</div>
          </div>
          <div className="rounded-lg border border-[#E7E1D2] bg-white p-2.5">
            <div className="opacity-60"><T>AI 帮你跳过</T></div>
            <div className="mt-0.5 text-[14px] font-bold">47 <span className="text-[10px] font-normal"><T>已掌握的重复题</T></span></div>
            <div className="opacity-55 text-[10px]"><T>约省 3.2 小时</T></div>
          </div>
          <div className="rounded-lg border border-[#E7E1D2] bg-white p-2.5">
            <div className="opacity-60">286 <T>知识点</T></div>
            <div className="mt-0.5 text-[14px] font-bold"><T>已掌握 142</T> · 50%</div>
            <div className="opacity-55 text-[10px]"><T>本周 +9 个</T></div>
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

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(180deg, #F8F6EF 0%, #EFECDF 100%)" }}>
      <div className="mx-auto max-w-2xl px-5 py-5">
        {loading && (
          <div className="mb-3 h-8 animate-pulse rounded bg-black/5" />
        )}
        {g === "1" && <Grade1Page streak={streak} coins={coins} pet={pet} />}
        {g === "2" && <Grade2Page streak={streak} coins={coins} pet={pet} />}
        {g === "3" && <Grade3Page streak={streak} coins={coins} pet={pet} />}
      </div>
    </main>
  );
}