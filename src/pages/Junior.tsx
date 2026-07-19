import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import {
  JUNIOR_PUBLISHER_META,
  JUNIOR_PUBLISHER_ORDER,
  readJuniorPublisherParam,
  withJuniorPublisher,
  type JuniorPublisher,
} from "@/lib/juniorHub/publisher";
import { supabase } from "@/integrations/supabase/client";
import { useMasteryOverview } from "@/hooks/useMasteryOverview";
import { useJuniorClassroomSync } from "@/hooks/useJuniorClassroomSync";
import { useStreakStats } from "@/hooks/useStreakStats";
import {
  GRADE_LABELS,
  juniorGradeParams,
  type JuniorGradeKey,
} from "@/components/junior/JuniorGradeFilter";
import { listExams } from "@/data/exams";
import { isReviewUnlocked } from "@/lib/suzhouExamProgress";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useExamWhitelisted } from "@/lib/gaokaoHub/examGate";
import JuniorComingSoon from "@/components/junior/JuniorComingSoon";
import { isJuniorGradeOpen } from "@/lib/juniorHub/access";

const LS_KEY = "junior:gradeFilter";

/* 预览配色(docs/junior-home-preview.html):金 / 墨蓝 / 米色 */
const C = {
  ink: "#1c2433",
  inkSoft: "#46506a",
  cream: "#f4efe6",
  paper: "#fbf8f2",
  gold: "#b8893b",
  goldSoft: "#d9b877",
  line: "#e6dccb",
};
const SHADOW = "0 18px 40px -22px rgba(28,36,51,.45)";
const IMG = (name: string) => `/images/junior/${name}.webp`;

const SERIF = "font-['Noto_Serif_SC',serif]";
const SANS = "font-['Noto_Sans_SC',sans-serif]";
const DISPLAY = "font-['Cormorant_Garamond',serif]";

const GRADES: { id: JuniorGradeKey; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "g7", label: "初一" },
  { id: "g8", label: "初二" },
  { id: "g9", label: "初三" },
];

/** 6 张学科卡 — 背景图 + 路由 + 对应 mastery 模块 key */
const CARDS = [
  { key: "vocab", img: "card-vocab", tag: "词汇 · 基础积累", title: "词汇", sub: "核心词汇 · 5 种游戏", moduleKey: "vocab", to: (q: string) => `/junior/vocab${q}` },
  { key: "grammar", img: "card-grammar", tag: "语法 · 规则应用", title: "语法", sub: "初中语法专项", moduleKey: "grammar", to: (q: string) => `/junior/grammar${q}` },
  { key: "reading", img: "card-reading", tag: "阅读 · 理解提升", title: "阅读", sub: "阅读理解训练", moduleKey: "reading", to: (q: string) => `/junior/reading${q}` },
  { key: "listening", img: "card-listening", tag: "听力 · 听说提升", title: "听力", sub: "听力短文训练", moduleKey: "listening", to: (q: string) => `/junior/listening${q}` },
  { key: "writing", img: "card-writing", tag: "写作 · 表达输出", title: "写作", sub: "中考写作训练", moduleKey: "writing", to: (q: string) => `/junior/writing${q}` },
  { key: "exam", img: "card-exam", tag: "真题 · 备考冲刺", title: "中考真题", sub: "历年真题模考", moduleKey: "exam", to: () => "/junior/suzhou" },
] as const;

function readSavedGrade(): JuniorGradeKey {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === "g7" || saved === "g8" || saved === "g9" || saved === "all") return saved;
    if (saved === "7") return "g7";
    if (saved === "8") return "g8";
    if (saved === "9") return "g9";
  } catch {
    /* ignore */
  }
  return "all";
}

/** 中考真题进度:已解锁复习的卷数 / 总卷数(来源:listExams + isReviewUnlocked) */
function examProgress(): { done: number; total: number; percent: number } {
  const exams = listExams();
  const total = exams.length;
  const done = exams.filter((e) => isReviewUnlocked(e.id)).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/* ============ 出版社选择页(裸进 /junior,无 publisher 参数时) ============ */
function JuniorPublisherChooser() {
  return (
    <div
      className={`min-h-screen ${SANS}`}
      style={{
        color: C.ink,
        background: `radial-gradient(1200px 500px at 80% -10%, #eadfca 0%, transparent 60%), ${C.cream}`,
      }}
    >
      <header
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{ background: "rgba(251,248,242,.86)", borderBottom: `1px solid ${C.line}` }}
      >
        <div className="mx-auto flex h-[66px] max-w-[1080px] items-center gap-3 px-[22px]">
          <Link
            to="/#courses"
            className="inline-flex flex-none items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium shadow-sm transition-transform hover:-translate-y-px"
            style={{ background: C.ink, color: C.goldSoft, border: `1px solid ${C.gold}` }}
          >
            <ArrowLeft className="size-4" />
            返回首页
          </Link>
          <Link to="/#courses" className="flex items-center gap-2.5 font-bold">
            <span
              className="grid size-[30px] flex-none place-items-center rounded-lg"
              style={{ background: `linear-gradient(135deg, ${C.ink}, #2f3b56)`, color: C.goldSoft }}
            >
              <BookOpen className="size-[17px]" />
            </span>
            <span className={`hidden text-[20px] tracking-wide lg:inline ${DISPLAY}`}>Middle&nbsp;School&nbsp;English</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[860px] px-[22px] py-10">
        <div className="mb-1">
          <h1 className={`text-3xl ${SERIF}`} style={{ color: C.ink }}>选择教材版本</h1>
          <p className="mt-2 text-sm" style={{ color: C.inkSoft }}>
            不同出版社的分册与单元不同。选定后进入该版本的课本同步与专项练习。
          </p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {JUNIOR_PUBLISHER_ORDER.map((code) => {
            const meta = JUNIOR_PUBLISHER_META[code];
            return (
              <Link
                key={code}
                to={`/junior?publisher=${code}`}
                className="flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: C.line }}
              >
                <span className="text-5xl">{meta.emoji}</span>
                <span className="mt-3 text-xl font-extrabold" style={{ color: C.ink }}>{meta.name}</span>
                <span className="mt-1 text-xs" style={{ color: C.inkSoft }}>{meta.sub}</span>
                <span className="mt-3 text-[13px] leading-snug" style={{ color: C.inkSoft }}>{meta.tagline}</span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

/* ============ 两层入口:裸进 → 选择页;带 ?publisher= → 该社内容 ============ */
export default function Junior() {
  const [sp] = useSearchParams();
  // ★判定用 has() 而非解析结果★:否则人教默认解析成 pep,选择页永远进不去(自引用死循环)。
  if (!sp.has("publisher")) return <JuniorPublisherChooser />;
  return <JuniorContent pub={readJuniorPublisherParam(sp)} />;
}

function JuniorContent({ pub }: { pub: JuniorPublisher }) {
  const [grade, setGrade] = useState<JuniorGradeKey>(() => readSavedGrade());
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null); // profiles.display_name → username
  const [practiced, setPracticed] = useState<number | null>(null);     // get_user_practiced_count() distinct 题
  const [totalMinutes, setTotalMinutes] = useState<number | null>(null); // get_user_total_minutes() 累计分钟

  const examOk = useExamWhitelisted();                   // 中考真题仅 email 白名单可见(纯前端藏入口,对齐高考真题)
  const overview = useMasteryOverview("junior");        // 学科卡进度 + 已掌握单词 + 完成课程%
  const classroom = useJuniorClassroomSync(grade);       // 课堂同步掌握度(项已掌握 + 百分比)
  const { stats: streak } = useStreakStats(userId);      // 连续学习天数

  useEffect(() => {
    localStorage.setItem(LS_KEY, grade);
  }, [grade]);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUserId(data.user?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setDisplayName(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("display_name, username")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const n = data?.display_name?.trim() || data?.username?.trim() || "";
        setDisplayName(n || null);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // 已练习题数(distinct)+ 累计学习分钟 —— 两个 security-definer RPC,内部锁 auth.uid()
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 新建 RPC,types.ts 未重生成,故 rpc 名做 string 转义
        const rpc = supabase.rpc.bind(supabase) as (fn: string) => Promise<{ data: unknown }>;
        const [pc, tm] = await Promise.all([
          rpc("get_user_practiced_count"),
          rpc("get_user_total_minutes"),
        ]);
        if (cancelled) return;
        const pcVal = Number(pc?.data ?? 0);
        const tmVal = Number(tm?.data ?? 0);
        setPracticed(Number.isFinite(pcVal) ? pcVal : 0);
        setTotalMinutes(Number.isFinite(tmVal) ? tmVal : 0);
      } catch {
        if (!cancelled) {
          setPracticed(0);
          setTotalMinutes(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const { query } = juniorGradeParams(grade);

  /** module key → { done, total, percent } */
  const statByKey = useMemo(() => {
    const map: Record<string, { done: number; total: number; percent: number }> = {};
    for (const m of overview.modules) {
      if (!m.comingSoon) map[m.key] = { done: m.mastered, total: m.total, percent: m.percent };
    }
    map.exam = examProgress();
    return map;
  }, [overview.modules]);

  const vocabMastered = statByKey.vocab?.done ?? 0;       // 已掌握单词(junior_word_mastery lvl≥3)
  const coursePercent = overview.percent;                 // 完成课程%(全模块 mastered/total)
  const streakDays = streak?.current_streak ?? 0;         // 连续学习天数(get_user_streak_stats)
  const totalHours = Math.floor((totalMinutes ?? 0) / 60); // 累计学习时长(小时,get_user_total_minutes/60)
  const practicedCount = practiced ?? 0;                  // 已练习题数(get_user_practiced_count)

  const gradeLabel = grade === "all" ? "初一至初三" : GRADE_LABELS[grade];

  // 年级开放状态走单一来源 access.ts(OPEN_JUNIOR_GRADES);受限年级非管理员 → 占位。
  // 现 7/8/9 全开放,此处实际不再拦截;保留逻辑以便未来若收某年级自动跟随。
  const { isAdmin } = useIsAdmin();
  const GRADE_NUM: Record<string, number> = { g7: 7, g8: 8, g9: 9 };
  const gradeNum = GRADE_NUM[grade] ?? null;
  const restricted = gradeNum != null && !isJuniorGradeOpen(gradeNum) && !isAdmin;

  const classroomTo =
    grade === "g8" ? "/junior/hub/8" : grade === "g9" ? "/junior/hub/9" : "/junior/hub/7";

  const classroomSub =
    grade === "all" ? "教材配套学习 · 初一至初三综合" : `教材配套学习 · ${GRADE_LABELS[grade]}`;

  const pubName = JUNIOR_PUBLISHER_META[pub].name;
  const classroomDesc =
    grade === "all"
      ? `${pubName}同步 · 词汇/语法/阅读/听力/写作 · 已掌握 ${classroom.mastered}/${classroom.total} 项`
      : `${GRADE_LABELS[grade]}${pubName}同步 · 每单元 8 关 · 10% 进度 AI 小测 · ${classroom.mastered}/${classroom.total} 项已掌握`;

  const ringPct = classroom.percent; // 掌握度 %（classroom.mastered ÷ classroom.total，五模块+阶段测试）

  return (
    <div
      className={`min-h-screen ${SANS}`}
      style={{
        color: C.ink,
        background: `radial-gradient(1200px 500px at 80% -10%, #eadfca 0%, transparent 60%), ${C.cream}`,
      }}
    >
      {/* ===== Header ===== */}
      <header
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{ background: "rgba(251,248,242,.86)", borderBottom: `1px solid ${C.line}` }}
      >
        <div className="mx-auto flex h-[66px] max-w-[1080px] items-center gap-3 px-[22px] sm:gap-4">
          {/* 返回 Big Moon English 总首页(小学/初中/高中/成人 入口区) */}
          <Link
            to="/#courses"
            className="inline-flex flex-none items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium shadow-sm transition-transform hover:-translate-y-px"
            style={{ background: C.ink, color: C.goldSoft, border: `1px solid ${C.gold}` }}
          >
            <ArrowLeft className="size-4" />
            返回首页
          </Link>

          <Link to="/#courses" className="flex items-center gap-2.5 font-bold">
            <span
              className="grid size-[30px] flex-none place-items-center rounded-lg"
              style={{ background: `linear-gradient(135deg, ${C.ink}, #2f3b56)`, color: C.goldSoft }}
            >
              <BookOpen className="size-[17px]" />
            </span>
            <span className={`hidden text-[20px] tracking-wide lg:inline ${DISPLAY}`}>Middle&nbsp;School&nbsp;English</span>
          </Link>

          <div className="ml-auto flex min-w-0 items-center gap-3.5">
            <span
              className="inline-flex flex-none items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium"
              style={{ border: `1px solid ${C.line}` }}
            >
              <span className="size-1.5 rounded-full" style={{ background: C.gold }} />
              已连续学习 <b className="px-0.5">{streakDays}</b> 天
            </span>

            {/* 已练习题数(distinct)—— get_user_practiced_count();窄屏(<sm)隐藏以防顶栏溢出 */}
            <span
              className="hidden flex-none items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex"
              style={{ background: "#fff7e8", border: "1px solid #ecd9ab", color: "#8a6a2c" }}
            >
              📝 已练习 <b className="px-0.5">{practicedCount}</b> 道题
            </span>

            {/* 问候语:名字可变长,单行省略号截断(title 看全名);头像/pill 位置固定不被挤压 */}
            <div className="hidden min-w-0 text-right text-[13px] leading-tight sm:block">
              <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                <span className="flex-none">Hello,</span>
                {displayName ? (
                  <>
                    <span
                      className="inline-block max-w-[6em] truncate align-bottom md:max-w-[8em]"
                      title={displayName}
                    >
                      {displayName}
                    </span>
                    <span className="hidden flex-none md:inline">同学</span>
                  </>
                ) : (
                  <span className="flex-none">同学</span>
                )}
              </div>
              <small className="text-[11.5px]" style={{ color: C.inkSoft }}>{gradeLabel} · 学习中</small>
            </div>
            <div className="size-[34px] flex-none rounded-full" style={{ background: "linear-gradient(135deg,#c9a25a,#8a6a2c)" }} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-[22px]">
        {/* ===== 当前出版社 + 换版本 ===== */}
        <div
          className="mt-[18px] flex items-center justify-between rounded-xl bg-white px-4 py-2 shadow-sm"
          style={{ border: `1px solid ${C.line}` }}
        >
          <span className="text-sm font-bold" style={{ color: C.ink }}>
            {JUNIOR_PUBLISHER_META[pub].emoji} 当前：{pubName}
          </span>
          <Link to="/junior" className="text-xs font-semibold text-indigo-600 hover:underline">
            换教材版本 →
          </Link>
        </div>

        {/* ===== Hero ===== */}
        <section
          className="relative mt-[22px] flex min-h-[260px] items-center overflow-hidden rounded-2xl text-white sm:min-h-[300px]"
          style={{ boxShadow: SHADOW }}
        >
          <img
            src={IMG("hero")}
            alt="莫奈《日出·印象》"
            className="absolute inset-0 size-full object-cover"
            /* hero 关键图,首屏渲染,不 lazy */
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg,rgba(20,28,44,.62) 0%,rgba(20,28,44,.18) 55%,transparent 80%)" }}
          />
          <div className="relative px-8 py-10 sm:px-11">
            <div className={`text-sm uppercase tracking-[0.3em] ${DISPLAY}`} style={{ color: C.goldSoft }}>
              Middle School English
            </div>
            <h1 className={`my-3 text-4xl leading-[1.05] sm:text-[46px] ${SERIF}`} style={{ textShadow: "0 2px 18px rgba(0,0,0,.3)" }}>
              初中英语专区
            </h1>
            <p className="max-w-[440px] text-[15px] text-[#eef1f4]">用世界名画开启你的英语学习之旅</p>
            {/* 【已删除】精选 · 专业 · 有趣 · 高效 */}

            {/* 年级选择 —— 叠在 Hero 背景图上,大标题正下方约 2cm,与标题左对齐 */}
            <div className="mt-10 flex items-center gap-2.5 text-sm">
              <span className="text-white/85" style={{ textShadow: "0 1px 8px rgba(0,0,0,.55)" }}>年级选择：</span>
              <div
                className="inline-flex rounded-full p-[3px] backdrop-blur-md"
                style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.32)" }}
              >
                {GRADES.map((g) => {
                  const on = grade === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGrade(g.id)}
                      className="rounded-full px-4 py-1.5 transition-colors"
                      style={on ? { background: "#fff", color: C.ink } : { color: "rgba(255,255,255,.85)" }}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {restricted ? (
          <JuniorComingSoon gradeLabel={gradeLabel} />
        ) : (
        <>
        {/* ===== 统计卡条(4 格) ===== */}
        <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon="📖"
            iconBg="#2f5d8c"
            label="累计学习"
            value={totalHours} /* get_user_total_minutes() / 60,向下取整 */
            unit="小时"
          />
          <StatCard icon="🔤" iconBg="#3d6db0" label="已掌握单词" value={vocabMastered} unit="个" />
          <StatCard icon="◴" iconBg="#3f9a6e" label="完成课程" value={coursePercent} unit="%" />
          <StatCard icon="🔥" iconBg="#d6792b" label="连续学习" value={streakDays} unit="天" />
        </section>

        {/* ===== 课堂同步 banner ===== */}        
        <section className="relative my-[22px] overflow-hidden rounded-2xl text-white" style={{ boxShadow: SHADOW }}>
          <img
            src={IMG("banner-sync")}
            alt="葛饰北斋《神奈川冲浪里》"
            className="absolute inset-0 size-full object-cover"
            /* banner 首屏图,不 lazy */
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(120deg,rgba(15,30,58,.86) 0%,rgba(20,42,74,.72) 45%,rgba(28,52,92,.55) 100%)" }} />
          <div className="relative flex flex-wrap items-center gap-6 p-8 sm:px-9">
            <div className="min-w-[240px] flex-1">
              <span className="inline-block rounded-full px-2.5 py-1 text-[11.5px]" style={{ background: "rgba(255,255,255,.16)" }}>
                教材同步 · {pubName}
              </span>
              <h2 className={`mt-3 text-3xl ${SERIF}`}>课堂同步</h2>
              <div className="mt-1.5 text-[13px] text-[#cdd9ea]">{classroomSub}</div>
              <div className="my-3 max-w-[460px] text-[13px] text-[#cdd9ea]">{classroomDesc}</div>
              <Link
                to={withJuniorPublisher(classroomTo, pub)}
                className="inline-flex items-center gap-2 rounded-[10px] px-[18px] py-2.5 text-[13.5px] font-medium"
                style={{ background: C.goldSoft, color: "#2a2410" }}
              >
                继续学习 →
              </Link>
            </div>

            {/* 环形:掌握度 %(classroom.mastered ÷ classroom.total) */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="grid size-[120px] place-items-center rounded-full"
                style={{ background: `conic-gradient(${C.goldSoft} 0 ${ringPct}%, rgba(255,255,255,.18) ${ringPct}% 100%)` }}
              >
                <div className="grid size-[90px] place-items-center rounded-full" style={{ background: "#1a3258" }}>
                  <span className={`text-3xl ${DISPLAY}`}>{ringPct}%</span>
                </div>
              </div>
              <div className="text-[11.5px] text-[#aebfd6]">已掌握 {classroom.mastered} / {classroom.total} 项</div>
            </div>
          </div>
        </section>

        {/* ===== 学科卡片 3×2 ===== */}
        <section className="mb-10 grid grid-cols-1 gap-[18px] sm:grid-cols-2 md:grid-cols-3">
          {CARDS.filter((card) => card.key !== "exam" || examOk).map((card) => {
            const s = statByKey[card.moduleKey] ?? { done: 0, total: 0, percent: 0 };
            const pct = Math.max(0, Math.min(100, s.percent));
            const label = pct > 0 ? "继续学习 →" : "开始学习 →"; // 真按进度驱动
            return (
              <Link
                key={card.key}
                to={withJuniorPublisher(card.to(query), pub)}
                className="group relative flex min-h-[230px] flex-col justify-end overflow-hidden rounded-2xl text-white transition-transform duration-300 hover:-translate-y-1"
                style={{ boxShadow: SHADOW, isolation: "isolate" }}
              >
                <img
                  src={IMG(card.img)}
                  alt={card.title}
                  loading="lazy"
                  className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* 半透明深色叠层(参考预览 .ov),保证文字可读 */}
                <div
                  className="absolute inset-0 -z-10"
                  style={{ background: "linear-gradient(180deg,rgba(18,22,33,.15) 0%,rgba(18,22,33,.5) 55%,rgba(18,22,33,.82) 100%)" }}
                />
                <div className="p-5">
                  <div className="mb-2 text-[11px] opacity-85">{card.tag}</div>
                  <h3 className={`mb-1.5 text-[27px] leading-none ${SERIF}`}>{card.title}</h3>
                  <div className="mb-3.5 text-[12.5px] text-[#e7e2d7]">{card.sub}</div>
                  <div className="mb-1.5 flex items-center justify-between text-[11.5px] text-[#e7e2d7]">
                    <span>已完成 {s.done} / {s.total} 节</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="mb-3.5 h-[5px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.22)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.goldSoft }} />
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-[9px] px-3.5 py-2 text-[12.5px] font-medium"
                    style={{ background: "rgba(255,255,255,.92)", color: "#2a2410" }}
                  >
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </section>
        </>
        )}
        {/* 【已删除】底部功能条:AI智能学习 / 名画主题学习 / 学情分析报告 / 家长监督模式 / 了解更多 */}

        <footer className="border-t py-6 text-center text-xs" style={{ borderColor: C.line, color: "#9a937f" }}>
          初中英语专区 · 用世界名画开启英语学习
        </footer>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  unit,
}: {
  icon: string;
  iconBg: string;
  label: string;
  value: number | string;
  unit: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-[18px] py-4"
      style={{ background: C.paper, border: `1px solid ${C.line}` }}
    >
      <div className="grid size-[42px] flex-none place-items-center rounded-xl text-[19px] text-white" style={{ background: iconBg }}>
        {icon}
      </div>
      <div>
        <div className="mb-0.5 text-[12.5px]" style={{ color: C.inkSoft }}>{label}</div>
        <div className={`text-[26px] leading-none ${DISPLAY}`} style={{ fontWeight: 600 }}>
          {value}
          <small className={`ml-0.5 text-[13px] ${SANS}`} style={{ color: C.inkSoft }}>{unit}</small>
        </div>
      </div>
    </div>
  );
}
