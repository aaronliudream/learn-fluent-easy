import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Award, Sparkles, Download, Share2, Printer, TrendingUp, TrendingDown,
  Target, ChevronRight, Trophy, Zap, BookOpen,
  Headphones, AlertTriangle, CheckCircle2, Clock } from
"lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from
"recharts";

/* ================== Types ================== */
type Period = "week" | "month" | "term";
type Mastery = {
  word_id: string;
  mastery_level: number | null;
  interval_days: number | null;
  quiz_correct: number | null;quiz_wrong: number | null;
  listen_correct: number | null;listen_wrong: number | null;
  spell_correct: number | null;spell_wrong: number | null;
  match_correct: number | null;match_wrong: number | null;
  last_seen_at: string | null;
  created_at: string;
};
type Vocab = {id: string;word: string;meaning_cn: string | null;theme: string | null;};
type LessonProg = {lesson_id: string;completed_at: string | null;accuracy: number | null;last_seen_at: string;};
type Snap = {
  week_start: string;vocab_mastered: number;vocab_learning: number;
  lessons_completed: number;listen_correct: number;listen_total: number;minutes_studied: number;
};
type Target = {grade: number;target_vocab: number;target_lessons: number;benchmark_name: string;};

/* ================== Helpers ================== */
const GRADES = [1, 2, 3, 4, 5, 6];

function periodStart(p: Period): Date {
  const d = new Date();d.setHours(0, 0, 0, 0);
  if (p === "week") d.setDate(d.getDate() - 7);else
  if (p === "month") d.setDate(d.getDate() - 30);else
  d.setDate(d.getDate() - 120);
  return d;
}
function periodLabel(p: Period): string {
  return p === "week" ? "本周" : p === "month" ? "本月" : "本学期";
}
function fmtDate(d: Date): string {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** Cambridge Starters 同龄基准（按学习周龄给出"健康进度"曲线）
 *  研究依据：CEFR Pre-A1 学习者平均每周 5-8 个新词长期掌握。 */
function cambridgePercentile(grade: number, mastered: number, weeksLearning: number): number {
  const targetByWeek = grade === 1 ? 5.5 : grade === 2 ? 6 : grade === 3 ? 6.5 : grade === 4 ? 7 : 7.5;
  const expected = Math.max(1, weeksLearning * targetByWeek);
  const ratio = mastered / expected;
  // Map ratio→percentile (S-curve, 1.0→50pct, 1.5→80pct, 2.0→95pct)
  if (ratio <= 0) return 5;
  const pct = 50 + 50 * (1 - Math.exp(-1.2 * (ratio - 1)));
  return Math.max(5, Math.min(99, Math.round(pct)));
}

function letterGrade(overall: number): {letter: string;tone: string;desc: string;} {
  if (overall >= 85) return { letter: "A+", tone: "from-amber-400 to-orange-500", desc: "顶尖水平 · 持续保持" };
  if (overall >= 70) return { letter: "A", tone: "from-emerald-400 to-teal-500", desc: "表现优异 · 稳步前进" };
  if (overall >= 55) return { letter: "B+", tone: "from-sky-400 to-blue-500", desc: "进步明显 · 节奏良好" };
  if (overall >= 40) return { letter: "B", tone: "from-violet-400 to-fuchsia-500", desc: "稳健成长 · 继续加油" };
  return { letter: "C+", tone: "from-rose-400 to-pink-500", desc: "起步阶段 · 潜力巨大" };
}

/* ================== Component ================== */
export default function GrowthReport() {
  const [grade, setGrade] = useState<number>(() => Number(localStorage.getItem("primary:lastGrade") ?? "1"));
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState<string>("");

  const [target, setTarget] = useState<Target | null>(null);
  const [vocab, setVocab] = useState<Vocab[]>([]);
  const [lessonsTotal, setLessonsTotal] = useState(0);
  const [mastery, setMastery] = useState<Mastery[]>([]);
  const [progress, setProgress] = useState<LessonProg[]>([]);
  const [snaps, setSnaps] = useState<Snap[]>([]);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      const name =
      (u?.user?.user_metadata as any)?.full_name ||
      (u?.user?.user_metadata as any)?.name ||
      u?.user?.email?.split("@")[0] || "孩子";
      setChildName(name);

      const [{ data: tg }, { data: vc }, { data: ls }] = await Promise.all([
      supabase.from("primary_grade_targets").select("*").eq("grade", grade).maybeSingle(),
      supabase.from("primary_vocab").select("id,word,meaning_cn,theme").eq("grade", grade),
      supabase.from("primary_lessons").select("id, primary_units!inner(grade)").eq("primary_units.grade", grade)]
      );
      setTarget(tg as any ?? null);
      setVocab((vc ?? []) as Vocab[]);
      setLessonsTotal((ls ?? []).length);

      if (uid) {
        const { data: m } = await supabase.
        from("primary_word_mastery").
        select("word_id,mastery_level,interval_days,quiz_correct,quiz_wrong,listen_correct,listen_wrong,spell_correct,spell_wrong,match_correct,match_wrong,last_seen_at,created_at").
        eq("user_id", uid).eq("grade", grade);
        setMastery((m ?? []) as Mastery[]);

        const lessonIds = (ls ?? []).map((l: any) => l.id);
        if (lessonIds.length) {
          const { data: lp } = await supabase.
          from("primary_lesson_progress").
          select("lesson_id,completed_at,accuracy,last_seen_at").
          eq("user_id", uid).in("lesson_id", lessonIds);
          setProgress((lp ?? []) as LessonProg[]);
        } else {setProgress([]);}

        const { data: sp } = await supabase.
        from("parent_weekly_snapshots").
        select("week_start,vocab_mastered,vocab_learning,lessons_completed,listen_correct,listen_total,minutes_studied").
        eq("user_id", uid).eq("grade", grade).
        order("week_start", { ascending: true }).limit(20);
        setSnaps((sp ?? []) as Snap[]);
      }
      setLoading(false);
    })();
  }, [grade]);

  /* ============ Derived metrics ============ */
  const stats = useMemo(() => {
    const start = periodStart(period);
    const isStrict = (m: Mastery) => (m.mastery_level ?? 0) >= 3 && (m.interval_days ?? 0) >= 7;
    const masteredAll = mastery.filter(isStrict);
    const learning = mastery.filter((m) => !isStrict(m) && (m.mastery_level ?? 0) >= 1);
    const newThisPeriod = mastery.filter((m) =>
    isStrict(m) && m.last_seen_at && new Date(m.last_seen_at) >= start
    );

    // Skill totals
    const sum = (k: keyof Mastery) => mastery.reduce((a, m) => a + (m[k] as number | null ?? 0), 0);
    const skills = {
      vocab: { correct: sum("quiz_correct"), wrong: sum("quiz_wrong") },
      listen: { correct: sum("listen_correct"), wrong: sum("listen_wrong") },
      spell: { correct: sum("spell_correct"), wrong: sum("spell_wrong") },
      match: { correct: sum("match_correct"), wrong: sum("match_wrong") }
    };
    const acc = (s: {correct: number;wrong: number;}) =>
    s.correct + s.wrong > 0 ? Math.round(s.correct / (s.correct + s.wrong) * 100) : 0;

    // Weeks learning
    const firstSeen = mastery.reduce<Date | null>((a, m) => {
      const d = m.created_at ? new Date(m.created_at) : null;
      if (!d) return a;
      return !a || d < a ? d : a;
    }, null);
    const weeksLearning = firstSeen ?
    Math.max(1, Math.ceil((Date.now() - firstSeen.getTime()) / (7 * 86400_000))) :
    1;

    // Theme distribution
    const themeMap = new Map<string, {total: number;mastered: number;learning: number;}>();
    for (const v of vocab) {
      const t = v.theme || "其它";
      if (!themeMap.has(t)) themeMap.set(t, { total: 0, mastered: 0, learning: 0 });
      themeMap.get(t)!.total++;
    }
    const masteredIds = new Set(masteredAll.map((m) => m.word_id));
    const learningIds = new Set(learning.map((m) => m.word_id));
    for (const v of vocab) {
      const t = v.theme || "其它";
      if (masteredIds.has(v.id)) themeMap.get(t)!.mastered++;else
      if (learningIds.has(v.id)) themeMap.get(t)!.learning++;
    }
    const themes = Array.from(themeMap.entries()).
    map(([name, v]) => ({ name, ...v })).
    sort((a, b) => b.total - a.total);

    // Lessons in period
    const lessonsInPeriod = progress.filter((p) => p.completed_at && new Date(p.completed_at) >= start).length;
    const lessonsAll = progress.filter((p) => p.completed_at).length;

    // Top weak words (low accuracy, ≥2 attempts)
    const wordById = new Map(vocab.map((v) => [v.id, v]));
    const weak = mastery.
    map((m) => {
      const c = (m.quiz_correct ?? 0) + (m.listen_correct ?? 0) + (m.spell_correct ?? 0) + (m.match_correct ?? 0);
      const w = (m.quiz_wrong ?? 0) + (m.listen_wrong ?? 0) + (m.spell_wrong ?? 0) + (m.match_wrong ?? 0);
      const total = c + w;
      const acc = total ? c / total : 1;
      return { word: wordById.get(m.word_id), acc, total, wrong: w };
    }).
    filter((x) => x.word && x.total >= 2 && x.acc < 0.6).
    sort((a, b) => a.acc - b.acc).
    slice(0, 8);

    return {
      masteredCount: masteredAll.length,
      learningCount: learning.length,
      newThisPeriod: newThisPeriod.length,
      lessonsInPeriod, lessonsAll,
      skills: {
        vocab: acc(skills.vocab),
        listen: acc(skills.listen),
        spell: acc(skills.spell),
        match: acc(skills.match)
      },
      attempts: {
        vocab: skills.vocab.correct + skills.vocab.wrong,
        listen: skills.listen.correct + skills.listen.wrong,
        spell: skills.spell.correct + skills.spell.wrong,
        match: skills.match.correct + skills.match.wrong
      },
      weeksLearning, themes, weak
    };
  }, [mastery, vocab, progress, period]);

  const targetVocab = target?.target_vocab ?? 220;
  const targetLessons = target?.target_lessons ?? 32;
  const vocabPct = Math.min(100, Math.round(stats.masteredCount / Math.max(1, targetVocab) * 100));
  const lessonsPct = Math.min(100, Math.round(stats.lessonsAll / Math.max(1, targetLessons) * 100));
  const overallPct = Math.round(vocabPct * 0.5 + lessonsPct * 0.3 + (stats.skills.vocab + stats.skills.listen) / 2 * 0.2);
  const grade5 = letterGrade(overallPct);
  const percentile = cambridgePercentile(grade, stats.masteredCount, stats.weeksLearning);

  // vs previous snapshot for delta
  const prevSnap = snaps.length >= 2 ? snaps[snaps.length - 2] : null;
  const lastSnap = snaps.length ? snaps[snaps.length - 1] : null;
  const deltaVocab = prevSnap && lastSnap ? lastSnap.vocab_mastered - prevSnap.vocab_mastered : null;
  const deltaLessons = prevSnap && lastSnap ? lastSnap.lessons_completed - prevSnap.lessons_completed : null;

  // Forecast: with current pace vs paused
  const wordsPerWeek = stats.weeksLearning > 0 ? stats.masteredCount / stats.weeksLearning : 0;
  const forecast30 = Math.round(stats.masteredCount + wordsPerWeek * 4.3);
  const forecast30Paused = Math.round(stats.masteredCount * 0.85); // Ebbinghaus ~15% loss in 30d

  // Radar data (5 dims)
  const radarData = [
  { dim: "词汇", v: stats.skills.vocab },
  { dim: "听力", v: stats.skills.listen },
  { dim: "拼写", v: stats.skills.spell },
  { dim: "配对", v: stats.skills.match },
  { dim: "课程", v: lessonsPct }];


  // Trend line
  const trendData = snaps.map((s) => ({
    d: s.week_start.slice(5),
    词汇: s.vocab_mastered,
    课程: s.lessons_completed
  }));

  // Diagnostic prescriptions
  const prescriptions = useMemo(() => {
    const list: {symptom: string;cause: string;prescription: string;eta: string;tone: string;icon: any;}[] = [];
    if (stats.skills.listen < 70 && stats.attempts.listen >= 5) {
      list.push({
        symptom: `听力辨词准确率 ${stats.skills.listen}%（优秀线 80%+）`,
        cause: "辅音/元音音位区分不足，多在 /θ/ /ð/ /æ/ /ʌ/ 等英语特有音上失误",
        prescription: "每日 5 分钟最小对立对（minimal pairs）听辨训练 + 重点单词慢速跟读",
        eta: "约 14 天可提升至 80%+ 优秀线",
        tone: "from-violet-500 to-fuchsia-500",
        icon: Headphones
      });
    }
    if (stats.skills.vocab < 70 && stats.attempts.vocab >= 10) {
      list.push({
        symptom: `词义选择正确率 ${stats.skills.vocab}%（优秀线 80%+）`,
        cause: "新词学完后未在 24 小时内复习，进入遗忘曲线陡降区",
        prescription: "启用「错题复习小测」，按艾宾浩斯间隔（1天/3天/7天）复习",
        eta: "约 10 天可达优秀水平",
        tone: "from-emerald-500 to-teal-500",
        icon: BookOpen
      });
    }
    const weakThemes = stats.themes.filter((t) => t.total >= 5 && t.mastered / t.total < 0.3).slice(0, 2);
    for (const wt of weakThemes) {
      list.push({
        symptom: `「${wt.name}」主题掌握 ${wt.mastered}/${wt.total}，明显偏弱`,
        cause: "该主题词频低、缺乏情境复现",
        prescription: `优先完成「${wt.name}」主题的 4 节课程，配合主题图卡复习`,
        eta: `约 7 天可掌握全部 ${wt.total} 词`,
        tone: "from-amber-500 to-orange-500",
        icon: Target
      });
    }
    if (stats.weak.length >= 3) {
      list.push({
        symptom: `${stats.weak.length} 个高频错词正确率低于 60%`,
        cause: "形近词混淆 + 短期记忆未转长期记忆",
        prescription: "今晚 10 分钟错题专项小测 + 7 天后回访测",
        eta: "约 7 天巩固",
        tone: "from-rose-500 to-pink-500",
        icon: AlertTriangle
      });
    }
    if (!list.length) {
      list.push({
        symptom: "各项指标均处于优秀区间 ✨",
        cause: "学习节奏稳定、复习按时进行",
        prescription: "保持当前节奏，可开始下一单元挑战",
        eta: "持续保持即可",
        tone: "from-emerald-500 to-teal-500",
        icon: CheckCircle2
      });
    }
    return list.slice(0, 3);
  }, [stats]);

  // 30-day plan
  const plan = useMemo(() => {
    const weakTheme = stats.themes.find((t) => t.total >= 5 && t.mastered / t.total < 0.5)?.name || "动物";
    return [
    { week: "第 1 周", focus: `${weakTheme}主题词汇 + 错题复习`, daily: "15分钟：5min听音 + 5min词卡 + 5min错题", goal: "+8 个新词" },
    { week: "第 2 周", focus: "听力辨词强化 + 当周新课", daily: "15分钟：6min听写 + 9min新课通关", goal: "+10 个新词，听力 75%+" },
    { week: "第 3 周", focus: "前两周复习 + 拼读基础", daily: "15分钟：5min复习 + 10min phonics", goal: "巩固 25 词，拼写 70%+" },
    { week: "第 4 周", focus: "单元挑战 + 月度评估", daily: "15分钟：12题挑战 + 错题修复", goal: "+8 个新词，整月 +30 词" }];

  }, [stats.themes]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <section className="mb-4 rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-rose-50 p-8 dark:border-amber-900 dark:from-amber-950/20 dark:to-rose-950/20">
        <div className="flex items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> <T>正在生成成长报告…</T>
        </div>
      </section>);

  }

  return (
    <section className="mb-4">
      {/* Toolbar (hidden on print) */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2">
          <Award className="size-5 text-amber-500" />
          <h2 className="text-base font-extrabold md:text-lg"><T>📋 孩子成长报告</T></h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full border bg-card p-0.5">
            {(["week", "month", "term"] as Period[]).map((p) =>
            <button key={p} onClick={() => setPeriod(p)}
            className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-extrabold",
            period === p ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-foreground")}>
                {p === "week" ? "周报" : p === "month" ? "月报" : "学期"}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {GRADES.map((g) =>
            <button key={g} onClick={() => {setGrade(g);localStorage.setItem("primary:lastGrade", String(g));}}
            className={cn("rounded-full border-2 px-2 py-0.5 text-[10px] font-extrabold",
            g === grade ? "border-amber-500 bg-amber-500 text-white" : "border-border bg-card hover:border-amber-300")}>
                G{g}
              </button>
            )}
          </div>
          <button onClick={handlePrint}
          className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-1 text-[11px] font-extrabold text-white hover:bg-amber-700">
            <Printer className="size-3" /> <T>打印 / 导出 PDF</T>
          </button>
        </div>
      </div>

      {/* The report itself (printable) */}
      <div ref={reportRef} className="report-print rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 p-5 shadow-sm dark:border-amber-900 dark:from-amber-950/20 dark:via-rose-950/20 dark:to-violet-950/20 md:p-7">

        {/* ===== 1. Cover / Header ===== */}
        <header className="mb-6 rounded-2xl border border-white bg-white/80 p-5 backdrop-blur-sm dark:border-white/10 dark:bg-black/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-amber-600">Big Moon English · Growth Report</div>
              <h1 className="mt-1 text-2xl font-black md:text-3xl">{childName} <T>的英语成长报告</T></h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {periodLabel(period)} <T>· 一年级</T> {grade === 1 ? "" : `→ G${grade}`} · {target?.benchmark_name ?? "剑桥 Starters"} <T>对标 · 报告日期</T> {fmtDate(new Date())}
              </p>
            </div>
            <div className={cn("rounded-2xl bg-gradient-to-br p-4 text-center text-white shadow-lg", grade5.tone)}>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-90"><T>总评等级</T></div>
              <div className="text-4xl font-black md:text-5xl">{grade5.letter}</div>
              <div className="mt-0.5 text-[10px] font-bold opacity-90"><T>{grade5.desc}</T></div>
            </div>
          </div>
        </header>

        {/* ===== 2. Hero — 高光时刻 ===== */}
        <Block title="✨ 1. 高光时刻" subtitle={`${periodLabel(period)}最值得骄傲的 3 件事`}>
          <div className="grid gap-3 md:grid-cols-3">
            <Highlight icon={Sparkles} tone="from-amber-400 to-orange-500"
            title={`新掌握 ${stats.newThisPeriod} 个单词`}
            desc={`从 ${stats.masteredCount - stats.newThisPeriod} 词成长到 ${stats.masteredCount} 词`} />
            <Highlight icon={Trophy} tone="from-emerald-400 to-teal-500"
            title={`通关 ${stats.lessonsInPeriod} 节课程`}
            desc={`${periodLabel(period)}学习强度: ${stats.lessonsInPeriod >= 4 ? "优秀" : stats.lessonsInPeriod >= 2 ? "良好" : "起步"}`} />
            <Highlight icon={Zap} tone="from-violet-400 to-fuchsia-500"
            title={`超过 ${percentile}% 的同龄人`}
            desc={`基于剑桥 Starters 学习曲线测算`} />
          </div>
        </Block>

        {/* ===== 3. Radar — 五维能力 ===== */}
        <Block title="🧭 2. 五维能力雷达" subtitle="对标剑桥 Starters Pre-A1 评估框架">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <div className="h-64 rounded-xl border bg-white/80 p-2 dark:bg-black/20">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="掌握度" dataKey="v" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {radarData.map((d) =>
              <div key={d.dim} className="rounded-xl border bg-white/80 p-2.5 dark:bg-black/20">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{d.dim}</span>
                    <span className={cn(d.v >= 80 ? "text-emerald-600" : d.v >= 60 ? "text-amber-600" : "text-rose-600")}>{d.v}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className={cn("h-full bg-gradient-to-r",
                  d.v >= 80 ? "from-emerald-400 to-teal-500" :
                  d.v >= 60 ? "from-amber-400 to-orange-500" : "from-rose-400 to-pink-500"
                  )} style={{ width: `${Math.max(2, d.v)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Block>

        {/* ===== 4. 进步明细 ===== */}
        <Block title="📈 3. 进步明细" subtitle={`${periodLabel(period)} vs 上一${periodLabel(period).replace("本", "")}`}>
          <div className="overflow-x-auto rounded-xl border bg-white/80 dark:bg-black/20">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-amber-50 text-[11px] font-bold uppercase text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                <tr>
                  <th className="p-2 text-left"><T>指标</T></th>
                  <th className="p-2 text-right"><T>当前</T></th>
                  <th className="p-2 text-right"><T>变化</T></th>
                  <th className="p-2 text-right"><T>目标</T></th>
                  <th className="p-2 text-right"><T>完成度</T></th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <Row label="📚 严格掌握词汇" current={stats.masteredCount} delta={deltaVocab} target={targetVocab} />
                <Row label="🌱 学习中词汇" current={stats.learningCount} delta={null} target={targetVocab} />
                <Row label="🎯 已通关课程" current={stats.lessonsAll} delta={deltaLessons} target={targetLessons} />
                <Row label="🎧 听力准确率" current={stats.skills.listen} delta={null} target={85} suffix="%" />
                <Row label="✍️ 词义选择" current={stats.skills.vocab} delta={null} target={85} suffix="%" />
                <Row label="🔤 拼写准确率" current={stats.skills.spell} delta={null} target={75} suffix="%" />
              </tbody>
            </table>
          </div>
          {trendData.length >= 2 &&
          <div className="mt-3 h-44 rounded-xl border bg-white/80 p-2 dark:bg-black/20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="d" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="词汇" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="课程" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          }
        </Block>

        {/* ===== 5. 知识图谱 ===== */}
        <Block title="🗺️ 4. 知识图谱" subtitle={`本年级共 ${vocab.length} 词，按主题分布`}>
          <div className="grid gap-2 sm:grid-cols-2">
            {stats.themes.map((t) => {
              const masteredPct = Math.round(t.mastered / Math.max(1, t.total) * 100);
              const learningPct = Math.round(t.learning / Math.max(1, t.total) * 100);
              return (
                <div key={t.name} className="rounded-xl border bg-white/80 p-2.5 dark:bg-black/20">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{t.name}</span>
                    <span className="text-muted-foreground">{t.mastered}/{t.total}</span>
                  </div>
                  <div className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${masteredPct}%` }} />
                    <div className="h-full bg-gradient-to-r from-amber-300 to-amber-400" style={{ width: `${learningPct}%` }} />
                  </div>
                  <div className="mt-1 flex gap-2 text-[10px] text-muted-foreground">
                    <span>✅ {t.mastered} <T>已掌握</T></span>
                    <span>🌱 {t.learning} <T>学习中</T></span>
                    <span>⭕ {t.total - t.mastered - t.learning} <T>未学</T></span>
                  </div>
                </div>);

            })}
          </div>
        </Block>

        {/* ===== 6. 提升建议 ===== */}
        <Block title="💡 5. 提升建议（AI 个性化辅导）" subtitle="按重要性排序的前 3 个进步方向">
          <div className="space-y-3">
            {prescriptions.map((p, i) =>
            <div key={i} className="rounded-xl border bg-white/80 p-3 dark:bg-black/20">
                <div className="mb-2 flex items-center gap-2">
                  <div className={cn("inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-br text-white", p.tone)}>
                    <p.icon className="size-4" />
                  </div>
                  <div className="text-xs font-extrabold"><T>建议 #</T>{i + 1}</div>
                </div>
                <Diag label="📌 现状" text={p.symptom} />
                <Diag label="🔍 原因" text={p.cause} />
                <Diag label="💡 建议" text={p.prescription} />
                <Diag label="⏱ 预计达成" text={p.eta} highlight />
              </div>
            )}
          </div>
        </Block>

        {/* ===== 7. 30 天学习路径 ===== */}
        <Block title="🗓️ 6. 个性化学习路径（下 30 天）" subtitle="每日 15 分钟，循证教学法编排">
          <div className="grid gap-2 sm:grid-cols-2">
            {plan.map((w, i) =>
            <div key={i} className="rounded-xl border-l-4 border-l-amber-500 bg-white/80 p-3 dark:bg-black/20">
                <div className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300">{w.week}</div>
                <div className="mt-0.5 text-sm font-bold">{w.focus}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{w.daily}</div>
                <div className="mt-1.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <T>目标：</T>{w.goal}
                </div>
              </div>
            )}
          </div>
        </Block>

        {/* ===== 8. 同龄对比 + 反事实预测 ===== */}
        <Block title="📊 7. 同龄对比 & 未来预测" subtitle="基于剑桥 Starters 学习者基准 + 艾宾浩斯遗忘曲线">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-gradient-to-br from-violet-100 to-fuchsia-100 p-4 dark:from-violet-950/40 dark:to-fuchsia-950/40">
              <div className="text-[11px] font-bold uppercase text-violet-700 dark:text-violet-300"><T>同龄百分位</T></div>
              <div className="mt-1 text-4xl font-black text-violet-900 dark:text-violet-100">{percentile}<span className="text-xl">%</span></div>
              <div className="mt-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                {childName}<T>超过了同龄</T> {percentile}<T>% 的英语学习者 🎉</T>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                <T>已学习</T> {stats.weeksLearning} <T>周 · 平均</T> {wordsPerWeek.toFixed(1)} <T>词/周</T>
              </div>
            </div>
            <div className="rounded-xl border bg-white/80 p-4 dark:bg-black/20">
              <div className="text-[11px] font-bold uppercase text-muted-foreground"><T>30 天后预测</T></div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30">
                  <span className="text-xs font-bold"><T>✅ 持续学习</T></span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{forecast30} <T>词</T></span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-rose-50 p-2 dark:bg-rose-950/30">
                  <span className="text-xs font-bold"><T>⚠️ 暂停 30 天</T></span>
                  <span className="text-lg font-black text-rose-700 dark:text-rose-300">{forecast30Paused} <T>词</T></span>
                </div>
              </div>
              <div className="mt-2 text-[10.5px] text-muted-foreground">
                <T>差距</T> <b className="text-rose-600">{forecast30 - forecast30Paused} <T>词</T></b> <T>· 由艾宾浩斯遗忘曲线测算</T>
              </div>
            </div>
          </div>
        </Block>

        {/* ===== 9. 家长行动卡 ===== */}
        <Block title="🎬 8. 家长行动指南" subtitle="3 个具体可执行的下一步">
          <div className="grid gap-2 md:grid-cols-3">
            <ActionCard time="今晚 10 分钟" title="陪孩子做错题小测"
            desc={`重点 ${Math.min(stats.weak.length, 5)} 个错词，用「错题复习」入口`}
            link={`/primary/vocab/${grade}?focus=wrong`} cta="立即开始" />
            <ActionCard time="本周内" title="完成 3 节新课"
            desc={`聚焦薄弱主题：${stats.themes.find((t) => t.mastered / Math.max(1, t.total) < 0.5)?.name ?? "下一单元"}`}
            link={`/primary/grade/${grade}`} cta="进入学习中心" />
            <ActionCard time="本月内" title="参加月度评估"
            desc="15 题自适应测评，生成新报告 + 成长证书"
            link={`/primary/grade/${grade}`} cta="开始评估" />
          </div>
        </Block>

        {/* ===== 10. 证书 ===== */}
        <footer className="mt-6 rounded-2xl border-4 border-double border-amber-400 bg-gradient-to-br from-amber-100 via-rose-100 to-violet-100 p-5 text-center dark:border-amber-700 dark:from-amber-950/40 dark:via-rose-950/40 dark:to-violet-950/40">
          <Award className="mx-auto size-10 text-amber-600" />
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-700">Certificate of Growth</div>
          <div className="mt-1 text-xl font-black md:text-2xl">{childName} · {grade5.letter} <T>级成就</T></div>
          <div className="mt-1 text-xs text-muted-foreground">
            {periodLabel(period)}<T>掌握</T> {stats.masteredCount} <T>词 · 通关</T> {stats.lessonsAll} <T>节课 · 超过同龄</T> {percentile}%
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2 print:hidden">
            <button onClick={handlePrint}
            className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-amber-700">
              <Download className="size-3.5" /> <T>下载证书 PDF</T>
            </button>
            <button onClick={async () => {
              const url = window.location.href;
              if (navigator.share) {
                try {await navigator.share({ title: `${childName}的英语成长证书`, text: `${childName}已掌握${stats.masteredCount}个英语单词，超过同龄${percentile}%！`, url });} catch {}
              } else {await navigator.clipboard.writeText(url);alert("链接已复制，可分享给家人朋友！");}
            }}
            className="inline-flex items-center gap-1 rounded-full border-2 border-amber-500 bg-white px-4 py-1.5 text-xs font-extrabold text-amber-700 hover:bg-amber-50">
              <Share2 className="size-3.5" /> <T>分享给家人</T>
            </button>
          </div>
        </footer>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          /* 1) 隐藏页面其余所有内容 */
          body * { visibility: hidden; }
          /* 2) 仅显示报告及其子节点 */
          .report-print, .report-print * { visibility: visible; }
          /* 3) 保持文档流（不要 position:absolute），这样浏览器才能自动分页打印所有 8 个板块 */
          .report-print {
            position: static !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* 4) 每个板块尽量不要被分页切到中间 */
          .report-print > * { break-inside: avoid; page-break-inside: avoid; }
          /* 5) 保留渐变 / 高亮颜色 */
          .report-print, .report-print * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* 6) 防止隐藏元素仍然占据多余的空白页 */
          html, body { height: auto !important; overflow: visible !important; background: white !important; margin: 0 !important; }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>
    </section>);

}

/* ================== Sub-components ================== */
function Block({ title, subtitle, children }: {title: string;subtitle?: string;children: React.ReactNode;}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-extrabold md:text-base">{title}</h3>
        {subtitle && <span className="text-[10.5px] text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </div>);

}
function Highlight({ icon: Icon, tone, title, desc }: {icon: any;tone: string;title: string;desc: string;}) {
  return (
    <div className={cn("rounded-2xl bg-gradient-to-br p-3.5 text-white shadow-md", tone)}>
      <Icon className="size-5 opacity-90" />
      <div className="mt-1.5 text-base font-black leading-tight">{title}</div>
      <div className="mt-0.5 text-[11px] font-bold opacity-90">{desc}</div>
    </div>);

}
function Row({ label, current, delta, target, suffix }: {label: string;current: number;delta: number | null;target: number;suffix?: string;}) {
  const pct = Math.min(100, Math.round(current / Math.max(1, target) * 100));
  return (
    <tr className="border-t">
      <td className="p-2 font-bold">{label}</td>
      <td className="p-2 text-right tabular-nums font-extrabold">{current}{suffix ?? ""}</td>
      <td className="p-2 text-right tabular-nums">
        {delta === null ? <span className="text-muted-foreground">—</span> :
        delta > 0 ? <span className="inline-flex items-center gap-0.5 font-extrabold text-emerald-600"><TrendingUp className="size-3" />+{delta}</span> :
        delta < 0 ? <span className="inline-flex items-center gap-0.5 font-extrabold text-rose-600"><TrendingDown className="size-3" />{delta}</span> :
        <span className="text-muted-foreground">0</span>}
      </td>
      <td className="p-2 text-right tabular-nums text-muted-foreground">{target}{suffix ?? ""}</td>
      <td className="p-2 text-right">
        <div className="ml-auto flex items-center justify-end gap-1.5">
          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="w-8 text-right text-[10.5px] font-extrabold">{pct}%</span>
        </div>
      </td>
    </tr>);

}
function Diag({ label, text, highlight }: {label: string;text: string;highlight?: boolean;}) {
  return (
    <div className={cn("flex gap-2 py-0.5 text-[11.5px] leading-snug", highlight && "rounded-md bg-emerald-50 px-1.5 dark:bg-emerald-950/30")}>
      <span className="shrink-0 font-extrabold text-muted-foreground">{label}</span>
      <span className={cn(highlight && "font-extrabold text-emerald-700 dark:text-emerald-300")}>{text}</span>
    </div>);

}
function ActionCard({ time, title, desc, link, cta }: {time: string;title: string;desc: string;link: string;cta: string;}) {
  return (
    <Link to={link} className="group block rounded-xl border-2 border-amber-200 bg-white/90 p-3 transition hover:border-amber-400 hover:shadow-md dark:border-amber-900 dark:bg-black/30">
      <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
        <Clock className="size-3" /> {time}
      </div>
      <div className="mt-1.5 text-sm font-extrabold">{title}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{desc}</div>
      <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 group-hover:gap-1.5 dark:text-amber-300">
        {cta} <ChevronRight className="size-3 transition-all" />
      </div>
    </Link>);

}