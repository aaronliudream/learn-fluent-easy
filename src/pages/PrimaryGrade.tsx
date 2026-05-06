import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Play, Sparkles, Star, Award, Target, Flame, Trophy, Map as MapIcon, Eye, Ear, MousePointerClick, PenLine, Mic, MessageCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";

const buildSkills = (g: number) => [
  { key: "games", title: "🎮 单词游戏中心", desc: "选义 · 听音 · 翻牌 · 拼词", gradient: "from-rose-400 to-orange-400", to: `/primary/games/${g}` },
  { key: "listening", title: "🎧 听力", desc: "听词选图 · 短对话理解", gradient: "from-sky-400 to-cyan-400", to: `/primary/games/${g}/listen` },
  { key: "reading", title: "📖 阅读", desc: "5 步通关：热身·听读·跟读·思考·宝藏关", gradient: "from-emerald-400 to-teal-400", to: `/primary/reading/grade/${g}` },
  { key: "writing", title: "✍️ 写作", desc: "拼写 · 填空 · 看图写句", gradient: "from-violet-400 to-fuchsia-400", to: `/primary/games/${g}/spell` },
  { key: "vocab", title: "📚 词汇", desc: "本年级核心词", gradient: "from-amber-400 to-orange-400", to: `/primary/vocab/${g}` },
  { key: "culture", title: "🌍 西方文化小课堂", desc: "节日 · 礼仪 · 校园 · 生活 · 课标核心素养", gradient: "from-indigo-400 to-purple-400", to: `/primary/culture/${g}` },
  { key: "chat", title: "💬 Spark 对话", desc: "AI 陪你说英语", gradient: "from-pink-400 to-rose-400", to: "/primary/chat" },
];

// 课标对照：1-2 年级 → CEFR Pre-A1 启蒙阶段
const CEFR_BY_GRADE: Record<number, { label: string; cn: string; goal: string }> = {
  1: { label: "Pre-A1", cn: "启蒙阶段", goal: "课标一级 · 累计认读约 150 词" },
  2: { label: "Pre-A1", cn: "启蒙阶段", goal: "课标一级 · 累计认读约 200 词" },
  3: { label: "A1", cn: "入门阶段", goal: "课标二级 · 累计认读约 400 词" },
  4: { label: "A1", cn: "入门阶段", goal: "课标二级 · 累计认读约 500 词" },
  5: { label: "A2", cn: "基础阶段", goal: "课标三级 · 累计认读约 600 词" },
  6: { label: "A2", cn: "基础阶段", goal: "课标三级 · 累计认读约 700 词" },
};

// 教育学推荐学习路径：输入 → 内化 → 输出
const LEARNING_PATH = [
  {
    stage: 1, emoji: "👂", title: "听一听", subtitle: "Listen",
    desc: "听字母 · 听单词 · 听小故事",
    bg: "from-sky-300 to-cyan-400", ring: "ring-sky-300",
    items: [
      { label: "🔤 字母歌", to: (g: number) => `/primary/games/${g}/listen` },
      { label: "🎧 听词选图", to: (g: number) => `/primary/games/${g}/listen` },
    ],
  },
  {
    stage: 2, emoji: "👀", title: "看一看", subtitle: "Look",
    desc: "看图认词 · 翻牌配对",
    bg: "from-amber-300 to-orange-400", ring: "ring-amber-300",
    items: [
      { label: "📚 图卡词汇", to: (g: number) => `/primary/vocab/${g}` },
      { label: "🃏 翻牌找朋友", to: (g: number) => `/primary/games/${g}` },
    ],
  },
  {
    stage: 3, emoji: "✋", title: "玩一玩", subtitle: "Play",
    desc: "拖字母拼单词 · 闯关得星",
    bg: "from-violet-300 to-fuchsia-400", ring: "ring-fuchsia-300",
    items: [
      { label: "🧩 拼字母", to: (g: number) => `/primary/games/${g}/spell` },
      { label: "🎮 游戏中心", to: (g: number) => `/primary/games/${g}` },
    ],
  },
  {
    stage: 4, emoji: "🗣️", title: "说一说", subtitle: "Speak",
    desc: "跟 Spark 对话 · 大声说出来",
    bg: "from-rose-300 to-pink-400", ring: "ring-rose-300",
    items: [
      { label: "💬 Spark 对话", to: (_g: number) => `/primary/chat` },
      { label: "🌍 文化卡片", to: (g: number) => `/primary/culture/${g}` },
    ],
  },
];

type LessonRow = {
  id: string; title_cn: string; title_en: string | null; estimated_minutes: number;
  primary_skill: string; sort_order: number;
  unit: { id: string; title_cn: string; emoji: string | null; sort_order: number };
  progress?: { stars: number; completed_at: string | null }[];
};

// 词汇 6 步掌握闭环（牛津 Word Learning Cycle + 艾宾浩斯）
const VOCAB_6_STEPS = [
  { n: 1, icon: Eye, label: "看见", desc: "图+词+音", to: (g: number) => `/primary/vocab/${g}` },
  { n: 2, icon: Ear, label: "听辨", desc: "听音选图", to: (g: number) => `/primary/games/${g}/listen` },
  { n: 3, icon: MousePointerClick, label: "识别", desc: "看图选词", to: (g: number) => `/primary/games/${g}` },
  { n: 4, icon: PenLine, label: "拼写", desc: "字母拖拽", to: (g: number) => `/primary/games/${g}/spell` },
  { n: 5, icon: Mic, label: "开口", desc: "AI 跟读", to: (_g: number) => `/primary/chat` },
  { n: 6, icon: MessageCircle, label: "运用", desc: "情景对话", to: (_g: number) => `/primary/chat` },
];

// 勋章定义（基于已有数据派生）
type BadgeDef = { key: string; emoji: string; title: string; check: (s: BadgeStats) => boolean; hint: string };
type BadgeStats = { totalDone: number; totalStars: number; perfectLessons: number; streak: number; unitsCleared: number; cultureSeen: boolean };
const BADGES: BadgeDef[] = [
  { key: "first", emoji: "🌱", title: "启程", hint: "完成 1 课", check: s => s.totalDone >= 1 },
  { key: "five", emoji: "🚀", title: "小火箭", hint: "完成 5 课", check: s => s.totalDone >= 5 },
  { key: "ten", emoji: "⭐", title: "十全十美", hint: "完成 10 课", check: s => s.totalDone >= 10 },
  { key: "perfect", emoji: "💎", title: "三星达人", hint: "3 课全 ⭐⭐⭐", check: s => s.perfectLessons >= 3 },
  { key: "streak3", emoji: "🔥", title: "三日连击", hint: "连续 3 天", check: s => s.streak >= 3 },
  { key: "streak7", emoji: "🏆", title: "七日王者", hint: "连续 7 天", check: s => s.streak >= 7 },
  { key: "stars30", emoji: "✨", title: "星光熠熠", hint: "累计 30 颗星", check: s => s.totalStars >= 30 },
  { key: "unit", emoji: "🏝️", title: "登岛者", hint: "通关 1 个单元", check: s => s.unitsCleared >= 1 },
];

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const days = new Set(dates.map(d => d.slice(0, 10)));
  let streak = 0;
  const cur = new Date();
  for (let i = 0; i < 365; i++) {
    const key = cur.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cur.setDate(cur.getDate() - 1);
    } else if (i === 0) {
      // 今天没学，看昨天起算
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// 能力雷达图（SVG，无依赖）
function RadarChart({ scores }: { scores: { label: string; value: number }[] }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 65;
  const n = scores.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, v: number) => {
    const rr = r * Math.max(0.05, Math.min(1, v));
    return [cx + Math.cos(angle(i)) * rr, cy + Math.sin(angle(i)) * rr];
  };
  const polygon = scores.map((s, i) => point(i, s.value).join(",")).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-full">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={scores.map((_, i) => {
            const [x, y] = [cx + Math.cos(angle(i)) * r * f, cy + Math.sin(angle(i)) * r * f];
            return `${x},${y}`;
          }).join(" ")}
          className="fill-none stroke-muted-foreground/15"
          strokeWidth={1}
        />
      ))}
      {scores.map((_, i) => {
        const [x, y] = [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="stroke-muted-foreground/15" strokeWidth={1} />;
      })}
      <polygon points={polygon} className="fill-primary/30 stroke-primary" strokeWidth={2} />
      {scores.map((s, i) => {
        const [x, y] = [cx + Math.cos(angle(i)) * (r + 12), cy + Math.sin(angle(i)) * (r + 12)];
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[9px] font-bold">
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

export default function PrimaryGrade() {
  const { grade } = useParams<{ grade: string }>();
  const g = Number(grade ?? "3");
  const SKILLS = buildSkills(g);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("primary_lessons")
        .select("id,title_cn,title_en,estimated_minutes,primary_skill,sort_order,unit:primary_units!inner(id,title_cn,emoji,sort_order,grade),progress:primary_lesson_progress(stars,completed_at)")
        .eq("unit.grade", g)
        .order("sort_order");
      setLessons((data ?? []) as any);
      setLoading(false);
    })();
  }, [g]);

  const nextLesson = lessons.find(l => !(l.progress && l.progress.length)) ?? lessons[0];

  // 能力雷达：按 primary_skill 分组完成率
  const skillBuckets: Record<string, { done: number; total: number }> = {
    listening: { done: 0, total: 0 },
    reading: { done: 0, total: 0 },
    speaking: { done: 0, total: 0 },
    writing: { done: 0, total: 0 },
    vocab: { done: 0, total: 0 },
  };
  lessons.forEach((l) => {
    const k = (l.primary_skill || "vocab").toLowerCase();
    const bucket = skillBuckets[k] ?? skillBuckets.vocab;
    bucket.total += 1;
    if (l.progress?.[0]?.completed_at) bucket.done += 1;
  });
  const radarScores = [
    { label: "听", value: skillBuckets.listening.total ? skillBuckets.listening.done / skillBuckets.listening.total : 0.05 },
    { label: "说", value: skillBuckets.speaking.total ? skillBuckets.speaking.done / skillBuckets.speaking.total : 0.05 },
    { label: "读", value: skillBuckets.reading.total ? skillBuckets.reading.done / skillBuckets.reading.total : 0.05 },
    { label: "写", value: skillBuckets.writing.total ? skillBuckets.writing.done / skillBuckets.writing.total : 0.05 },
    { label: "词", value: skillBuckets.vocab.total ? skillBuckets.vocab.done / skillBuckets.vocab.total : 0.05 },
  ];
  const totalDone = lessons.filter((l) => l.progress?.[0]?.completed_at).length;
  const totalAll = lessons.length;
  const overallPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;

  const cefr = CEFR_BY_GRADE[g] ?? CEFR_BY_GRADE[1];

  // 勋章 & 连续打卡 数据
  const completedDates = lessons.map(l => l.progress?.[0]?.completed_at).filter(Boolean) as string[];
  const totalStars = lessons.reduce((sum, l) => sum + (l.progress?.[0]?.stars ?? 0), 0);
  const perfectLessons = lessons.filter(l => (l.progress?.[0]?.stars ?? 0) >= 3).length;
  const streak = computeStreak(completedDates);
  // 按 unit 分组
  const unitsMap = new Map<string, { id: string; title_cn: string; emoji: string | null; sort_order: number; lessons: LessonRow[] }>();
  lessons.forEach(l => {
    const u = unitsMap.get(l.unit.id);
    if (u) u.lessons.push(l);
    else unitsMap.set(l.unit.id, { ...l.unit, lessons: [l] });
  });
  const units = Array.from(unitsMap.values()).sort((a, b) => a.sort_order - b.sort_order);
  const unitsCleared = units.filter(u => u.lessons.every(l => l.progress?.[0]?.completed_at)).length;
  const badgeStats: BadgeStats = { totalDone, totalStars, perfectLessons, streak, unitsCleared, cultureSeen: false };
  const earnedCount = BADGES.filter(b => b.check(badgeStats)).length;
  // 解锁逻辑：上一个单元全部通关才解锁下一个
  let unlockedSoFar = true;
  const unitStates = units.map((u, idx) => {
    const isUnlocked = idx === 0 || unlockedSoFar;
    const allDone = u.lessons.every(l => l.progress?.[0]?.completed_at);
    if (!allDone) unlockedSoFar = false;
    const doneCount = u.lessons.filter(l => l.progress?.[0]?.completed_at).length;
    const totalCount = u.lessons.length;
    return { ...u, isUnlocked, allDone, doneCount, totalCount, current: isUnlocked && !allDone };
  });

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink to="/primary" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回年级选择
      </BackLink>
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">PRIMARY · G{g}</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">{g} 年级 · 四大能力</h1>
        <p className="mt-1 text-xs text-muted-foreground">输入 → 理解 → 练习 → 输出 → 测试 · 每天一键开始</p>
      </div>

      {/* CEFR 国际等级 + 课标对照 */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-primary/20 bg-primary/5 p-3">
        <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white shadow-sm">
          <Award className="size-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground">CEFR {cefr.label}</span>
            <span className="text-[11px] font-bold text-foreground">{cefr.cn}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{cefr.goal}</div>
        </div>
        <div className="text-right">
          <div className="text-base font-extrabold text-primary">{overallPct}%</div>
          <div className="text-[10px] text-muted-foreground">总进度</div>
        </div>
      </div>

      {/* 连续打卡 + 勋章 + 家长入口 */}
      <section className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-rose-50 p-2.5 text-center">
          <Flame className="mx-auto size-5 text-orange-500" />
          <div className="mt-0.5 text-lg font-extrabold text-orange-600">{streak}</div>
          <div className="text-[10px] font-bold text-muted-foreground">连续打卡(天)</div>
        </div>
        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-2.5 text-center">
          <Trophy className="mx-auto size-5 text-amber-500" />
          <div className="mt-0.5 text-lg font-extrabold text-amber-600">{earnedCount}/{BADGES.length}</div>
          <div className="text-[10px] font-bold text-muted-foreground">已获勋章</div>
        </div>
        <Link to="/primary/parent" className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-2.5 text-center transition hover:-translate-y-0.5">
          <Users className="mx-auto size-5 text-emerald-500" />
          <div className="mt-0.5 text-lg font-extrabold text-emerald-600">家长</div>
          <div className="text-[10px] font-bold text-muted-foreground">查看周报</div>
        </Link>
      </section>

      {/* 勋章墙 */}
      <section className="mb-4 rounded-2xl border-2 border-border bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold text-muted-foreground">
          <Trophy className="size-3.5 text-amber-500" /> 勋章墙 · 收集你的成就
        </div>
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map(b => {
            const got = b.check(badgeStats);
            return (
              <div key={b.key} title={b.hint} className={`rounded-xl border-2 p-2 text-center transition ${got ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50" : "border-border bg-muted/30 opacity-50 grayscale"}`}>
                <div className="text-2xl">{b.emoji}</div>
                <div className="mt-0.5 text-[10px] font-extrabold">{b.title}</div>
                <div className="text-[9px] text-muted-foreground leading-tight">{b.hint}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 词汇 6 步掌握闭环 */}
      <section className="mb-4 rounded-2xl border-2 border-border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-muted-foreground">
            <Sparkles className="size-3.5 text-violet-500" /> 词汇 6 步掌握闭环 · 牛津学习环
          </div>
          <span className="text-[9px] text-muted-foreground">每个新词走完 6 步 = 真正学会</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {VOCAB_6_STEPS.map(s => {
            const Icon = s.icon;
            return (
              <Link key={s.n} to={s.to(g)} className="group rounded-xl border-2 border-border bg-gradient-to-br from-violet-50 to-fuchsia-50 p-1.5 text-center transition hover:-translate-y-0.5 hover:border-violet-300">
                <div className="mx-auto grid size-6 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 text-[10px] font-extrabold text-white">{s.n}</div>
                <Icon className="mx-auto mt-1 size-3.5 text-violet-500" />
                <div className="mt-0.5 text-[10px] font-extrabold">{s.label}</div>
                <div className="text-[8px] text-muted-foreground leading-tight">{s.desc}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 教育学学习路径：输入 → 内化 → 输出 */}
      <section className="mb-4">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-extrabold">
          <Target className="size-4 text-rose-500" />
          <span>每天这样学最棒 🌈</span>
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">听 → 看 → 玩 → 说</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {LEARNING_PATH.map((p) => (
            <div
              key={p.stage}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${p.bg} p-3 text-white shadow-tile ring-2 ${p.ring} ring-offset-2 ring-offset-background`}
            >
              <span className="pointer-events-none absolute -right-4 -top-4 size-16 rounded-full bg-white/25 blur-xl" />
              <div className="relative flex items-center gap-2">
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/30 text-2xl backdrop-blur-sm">
                  {p.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-wider opacity-90">Step {p.stage} · {p.subtitle}</div>
                  <div className="text-base font-extrabold leading-tight">{p.title}</div>
                </div>
              </div>
              <div className="relative mt-1.5 text-[11px] font-medium opacity-95">{p.desc}</div>
              <div className="relative mt-2 grid gap-1.5">
                {p.items.map((it) => (
                  <Link
                    key={it.label}
                    to={it.to(g)}
                    className="flex items-center justify-between rounded-xl bg-white/90 px-2.5 py-1.5 text-[11px] font-bold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <span className="truncate">{it.label}</span>
                    <span className="text-muted-foreground">▶</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 能力雷达图 */}
      <section className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3">
        <div className="size-32 shrink-0">
          <RadarChart scores={radarScores} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-extrabold">五维能力雷达</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">基于已完成课程，对照课标核心素养</div>
          <div className="mt-2 grid grid-cols-5 gap-1 text-center">
            {radarScores.map((s) => (
              <div key={s.label} className="rounded-lg bg-muted/50 px-1 py-1">
                <div className="text-[10px] font-bold text-muted-foreground">{s.label}</div>
                <div className="text-[11px] font-extrabold text-primary">{Math.round(s.value * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's lesson big CTA */}
      {nextLesson && (
        <Link to={`/primary/lesson/${nextLesson.id}`}
          className="mb-5 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-amber-500 p-5 text-white shadow-tile transition hover:-translate-y-0.5">
          <div className="grid size-14 place-items-center rounded-2xl bg-white/25 text-3xl">{nextLesson.unit.emoji ?? "📖"}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">今日推荐 · 5 步学透</div>
            <div className="truncate text-lg font-extrabold">{nextLesson.title_cn}</div>
            <div className="text-xs opacity-90">{nextLesson.unit.title_cn} · 约 {nextLesson.estimated_minutes} 分钟</div>
          </div>
          <Play className="size-7 fill-white" />
        </Link>
      )}

      {/* 学习地图（按单元分岛） */}
      {!loading && units.length > 0 && (
        <section className="mb-6">
          <ModuleStageTests segment="primary" grade={g} module="vocab" />
          <div className="mb-2 flex items-center gap-2 text-sm font-extrabold">
            <MapIcon className="size-4 text-emerald-500" /> 学习地图 · 探险路线
            <span className="ml-auto text-[10px] font-normal text-muted-foreground">{totalDone}/{totalAll} 课 · {totalStars} ⭐</span>
          </div>
          <div className="space-y-3">
            {unitStates.map((u, idx) => (
              <div key={u.id} className={`rounded-2xl border-2 p-3 transition ${u.current ? "border-rose-300 bg-gradient-to-br from-rose-50 to-amber-50 shadow-tile" : u.allDone ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50" : u.isUnlocked ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"}`}>
                <div className="mb-2 flex items-center gap-2">
                  <div className={`grid size-10 place-items-center rounded-2xl text-xl shadow-sm ${u.allDone ? "bg-gradient-to-br from-emerald-400 to-teal-400 text-white" : u.isUnlocked ? "bg-gradient-to-br from-amber-300 to-rose-300" : "bg-muted"}`}>
                    {u.isUnlocked ? (u.emoji ?? "🏝️") : "🔒"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">岛屿 {idx + 1} {u.current && "· 你在这里"}</div>
                    <div className="truncate text-sm font-extrabold">{u.title_cn}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-extrabold text-foreground">{u.doneCount}/{u.totalCount}</div>
                    <div className="h-1 w-14 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all" style={{ width: `${u.totalCount ? (u.doneCount / u.totalCount) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
                {u.isUnlocked && (
                  <div className="flex flex-wrap gap-1.5">
                    {u.lessons.map(l => {
                      const stars = l.progress?.[0]?.stars ?? 0;
                      const done = !!l.progress?.[0]?.completed_at;
                      return (
                        <Link key={l.id} to={`/primary/lesson/${l.id}`}
                          className={`group flex items-center gap-1.5 rounded-xl border-2 px-2 py-1.5 text-[11px] font-bold transition hover:-translate-y-0.5 ${done ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border bg-card text-foreground hover:border-amber-300"}`}>
                          <span className="truncate max-w-[110px]">{l.title_cn}</span>
                          <span className="flex items-center gap-0">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Star key={i} className={`size-2.5 ${i < stars ? "fill-amber-400 stroke-amber-500" : "stroke-muted-foreground/40"}`} />
                            ))}
                          </span>
                          {done && <span className="text-emerald-500">✓</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
                {!u.isUnlocked && (
                  <div className="text-center text-[11px] text-muted-foreground">通关上一个岛屿即可解锁 🔓</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-3">
        {SKILLS.map((s) => (
          <Link key={s.key} to={s.to} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-tile transition hover:-translate-y-0.5`}>
            <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
            <div className="text-base font-extrabold">{s.title}</div>
            <div className="mt-1 text-xs opacity-90">{s.desc}</div>
            {s.to === "#" && <div className="mt-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">即将上线</div>}
          </Link>
        ))}
      </section>
    </main>
  );
}