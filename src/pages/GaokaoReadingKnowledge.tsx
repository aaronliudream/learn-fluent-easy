import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Search, Filter, Sparkles, BookOpen, Target, Trophy, X,
  CheckCircle2, Circle, Clock, Flame, TrendingUp, Award, Zap, BookMarked, ChevronRight } from
"lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type KP = {
  id: string;
  source_id: string;
  category_code: string;
  category_name: string;
  level1: string | null;
  level2: string | null;
  level3: string;
  exam_frequency: string | null;
  difficulty: number | null;
  example: string | null;
  strategy: string | null;
  pitfall: string | null;
  prerequisite: string | null;
  grade_band: string;
};

type SignalWord = {
  id: string;word: string;category: string;semantic: string | null;
  exam_frequency: string | null;difficulty: number | null;usage_note: string | null;
};

type Topic = {
  id: string;big_topic: string;sub_topic: string | null;high_freq_words: string | null;
  exam_frequency: string | null;difficulty: number | null;exam_angle: string | null;
};

type MasteryRow = {item_id: string;mastery_level: number;correct_count: number;wrong_count: number;};
// 状态: 0 未学 | 1-2 学习中 | 3+ 已掌握

const CATEGORIES: {code: string;name: string;icon: typeof BookMarked;gradient: string;ring: string;}[] = [
{ code: "R1", name: "题型拆解", icon: Target, gradient: "from-rose-500 to-pink-600", ring: "ring-rose-500/30" },
{ code: "R2", name: "文体特征", icon: BookOpen, gradient: "from-amber-500 to-orange-600", ring: "ring-amber-500/30" },
{ code: "R4", name: "解题策略", icon: Zap, gradient: "from-sky-500 to-blue-600", ring: "ring-sky-500/30" },
{ code: "R6", name: "长难句", icon: Trophy, gradient: "from-fuchsia-500 to-purple-600", ring: "ring-fuchsia-500/30" },
{ code: "R7", name: "七选五", icon: Target, gradient: "from-cyan-500 to-teal-600", ring: "ring-cyan-500/30" },
{ code: "R8", name: "基础能力", icon: Sparkles, gradient: "from-lime-500 to-emerald-600", ring: "ring-lime-500/30" },
{ code: "R0", name: "题型概览", icon: BookMarked, gradient: "from-slate-500 to-zinc-600", ring: "ring-slate-500/30" },
{ code: "R3", name: "话题词汇", icon: Sparkles, gradient: "from-emerald-500 to-green-600", ring: "ring-emerald-500/30" },
{ code: "R5", name: "信号词库", icon: BookMarked, gradient: "from-violet-500 to-indigo-600", ring: "ring-violet-500/30" }];


const GRADE_LABEL: Record<string, string> = {
  senior1: "高一", senior2: "高二", senior3: "高三", sprint: "高考冲刺", all: "通用"
};

const FREQ_ORDER: Record<string, number> = { "极高": 4, "高": 3, "中": 2, "低": 1 };

const FREQ_BADGE: Record<string, string> = {
  "极高": "bg-red-500/15 text-red-600 border-red-500/30",
  "高": "bg-orange-500/15 text-orange-600 border-orange-500/30",
  "中": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "低": "bg-muted text-muted-foreground border-border"
};

function statusOf(m?: MasteryRow): "new" | "learning" | "mastered" {
  if (!m) return "new";
  if (m.mastery_level >= 3) return "mastered";
  if (m.mastery_level >= 1 || m.correct_count > 0 || m.wrong_count > 0) return "learning";
  return "new";
}

export default function GaokaoReadingKnowledge() {
  const [tab, setTab] = useState<"kp" | "signal" | "topic">("kp");
  const [activeCat, setActiveCat] = useState<string>("R1");
  const [grade, setGrade] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "learning" | "mastered">("all");
  const [kps, setKps] = useState<KP[]>([]);
  const [signals, setSignals] = useState<SignalWord[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mastery, setMastery] = useState<Record<string, MasteryRow>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openKP, setOpenKP] = useState<KP | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id ?? null;
      setUserId(uid);
      const [a, b, c, m] = await Promise.all([
      supabase.from("gaokao_reading_knowledge_points").select("*").order("source_id"),
      supabase.from("gaokao_reading_signal_words").select("*").order("source_id"),
      supabase.from("gaokao_reading_topics").select("*").order("source_id"),
      uid ? supabase.from("gaokao_user_mastery").select("item_id,mastery_level,correct_count,wrong_count").
      eq("user_id", uid).eq("item_type", "reading_kp") :
      Promise.resolve({ data: [] as any[] })]
      );
      setKps((a.data ?? []) as KP[]);
      setSignals((b.data ?? []) as SignalWord[]);
      setTopics((c.data ?? []) as Topic[]);
      const map: Record<string, MasteryRow> = {};
      ((m.data ?? []) as MasteryRow[]).forEach((r) => {map[r.item_id] = r;});
      setMastery(map);
      setLoading(false);
    })();
  }, []);

  // ======== 全局统计 ========
  const overall = useMemo(() => {
    const total = kps.length;
    let mastered = 0,learning = 0;
    for (const k of kps) {
      const s = statusOf(mastery[k.id]);
      if (s === "mastered") mastered++;else
      if (s === "learning") learning++;
    }
    const newCount = total - mastered - learning;
    const pct = total ? Math.round(mastered / total * 100) : 0;
    return { total, mastered, learning, newCount, pct };
  }, [kps, mastery]);

  // ======== 每分类统计 ========
  const catStats = useMemo(() => {
    const stats: Record<string, {total: number;mastered: number;learning: number;}> = {};
    for (const c of CATEGORIES) stats[c.code] = { total: 0, mastered: 0, learning: 0 };
    for (const k of kps) {
      const st = stats[k.category_code];
      if (!st) continue;
      st.total++;
      const s = statusOf(mastery[k.id]);
      if (s === "mastered") st.mastered++;else
      if (s === "learning") st.learning++;
    }
    return stats;
  }, [kps, mastery]);

  // ======== 智能推荐：高频未掌握 Top 3 ========
  const recommendations = useMemo(() => {
    return kps.
    filter((k) => statusOf(mastery[k.id]) !== "mastered").
    sort((a, b) => {
      const fa = FREQ_ORDER[a.exam_frequency ?? ""] ?? 0;
      const fb = FREQ_ORDER[b.exam_frequency ?? ""] ?? 0;
      if (fb !== fa) return fb - fa;
      // learning 优先于 new
      const la = statusOf(mastery[a.id]) === "learning" ? 1 : 0;
      const lb = statusOf(mastery[b.id]) === "learning" ? 1 : 0;
      return lb - la;
    }).
    slice(0, 3);
  }, [kps, mastery]);

  const filteredKp = useMemo(() => {
    const q = search.trim().toLowerCase();
    return kps.filter((k) => {
      if (k.category_code !== activeCat) return false;
      if (grade !== "all" && k.grade_band !== grade) return false;
      if (statusFilter !== "all" && statusOf(mastery[k.id]) !== statusFilter) return false;
      if (!q) return true;
      const blob = `${k.level1 ?? ""} ${k.level2 ?? ""} ${k.level3} ${k.example ?? ""} ${k.strategy ?? ""}`.toLowerCase();
      return blob.includes(q);
    });
  }, [kps, activeCat, grade, search, statusFilter, mastery]);

  const groupedSignals = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = signals.filter((s) => !q || s.word.toLowerCase().includes(q) || (s.category ?? "").includes(q));
    const m = new Map<string, SignalWord[]>();
    for (const s of filtered) {
      const k = s.category ?? "其他";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(s);
    }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [signals, search]);

  const groupedTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = topics.filter((t) => !q || t.big_topic.toLowerCase().includes(q) || (t.sub_topic ?? "").toLowerCase().includes(q) || (t.high_freq_words ?? "").toLowerCase().includes(q));
    const m = new Map<string, Topic[]>();
    for (const t of filtered) {
      if (!m.has(t.big_topic)) m.set(t.big_topic, []);
      m.get(t.big_topic)!.push(t);
    }
    return [...m.entries()];
  }, [topics, search]);

  // ======== 标记掌握 / 学习中 ========
  async function setMasteryFor(kp: KP, level: number) {
    if (!userId) {
      toast.error("请先登录以保存学习进度");
      return;
    }
    const existing = mastery[kp.id];
    const payload = {
      user_id: userId,
      item_type: "reading_kp",
      item_id: kp.id,
      mastery_level: level,
      correct_count: existing?.correct_count ?? 0,
      wrong_count: existing?.wrong_count ?? 0,
      last_seen_at: new Date().toISOString(),
      ...(level >= 3 ? { reached_master_at: new Date().toISOString() } : {})
    };
    // upsert
    const { error } = await supabase.from("gaokao_user_mastery").upsert(payload, {
      onConflict: "user_id,item_type,item_id"
    });
    if (error) {console.warn(error);toast.error("保存失败");return;}
    setMastery((p) => ({ ...p, [kp.id]: { item_id: kp.id, mastery_level: level, correct_count: payload.correct_count, wrong_count: payload.wrong_count } }));
    toast.success(level >= 3 ? "🎉 已标记为掌握！" : level >= 1 ? "📖 已标记为学习中" : "已重置");
  }

  // ======== CEFR 能力估算（简化版：基于掌握率）========
  const cefr = useMemo(() => {
    const p = overall.pct;
    if (p >= 85) return { label: "C1", desc: "高阶阅读" };
    if (p >= 65) return { label: "B2", desc: "高考目标" };
    if (p >= 40) return { label: "B1", desc: "中级进阶" };
    if (p >= 15) return { label: "A2", desc: "基础起步" };
    return { label: "A1", desc: "刚刚启程" };
  }, [overall.pct]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8">
      <BackLink to="/gaokao/reading" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回阅读训练</T>
      </BackLink>

      <PageHeader hideReviewBanner title="阅读知识手册" subtitle="题型怎么辨 · 套路怎么用 · 易错点在哪" back />

      {/* ============= 顶部仪表盘 ============= */}
      <section className="mb-6 rounded-3xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 size-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative grid sm:grid-cols-[auto_1fr] gap-5 sm:gap-6 items-center">
          {/* 进度环 */}
          <div className="relative shrink-0 mx-auto sm:mx-0">
            <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke="url(#prog)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${overall.pct / 100 * 326.7} 326.7`}
                className="transition-all duration-700" />
              
              <defs>
                <linearGradient id="prog" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-3xl font-extrabold tabular-nums leading-none">{overall.pct}<span className="text-lg">%</span></div>
                <div className="text-[10px] text-muted-foreground mt-1"><T>总掌握度</T></div>
              </div>
            </div>
          </div>

          {/* 右侧统计 */}
          <div className="grid gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-bold shadow-sm">
                <Award className="size-3.5" /> <T>当前</T> <T>{cefr.label}</T> · <T>{cefr.desc}</T>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-card border px-2.5 py-1 text-[11px] text-muted-foreground">
                <Flame className="size-3 text-orange-500" /> <T>共</T> {overall.total} <T>个核心知识点</T>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <StatCell color="emerald" label="已掌握" value={overall.mastered} icon={CheckCircle2} />
              <StatCell color="amber" label="学习中" value={overall.learning} icon={Clock} />
              <StatCell color="slate" label="未学习" value={overall.newCount} icon={Circle} />
            </div>

            {/* 分段进度条 */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${overall.mastered / Math.max(overall.total, 1) * 100}%` }} />
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${overall.learning / Math.max(overall.total, 1) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* 智能推荐 */}
        {recommendations.length > 0 &&
        <div className="relative mt-5 pt-5 border-t border-border/60">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="size-4 text-primary" />
              <h3 className="font-bold text-sm"><T>今日推荐 · 高频必学</T></h3>
              <span className="text-[10px] text-muted-foreground"><T>基于考试频率与你的进度</T></span>
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              {recommendations.map((k) => {
              const cat = CATEGORIES.find((c) => c.code === k.category_code);
              const st = statusOf(mastery[k.id]);
              return (
                <button key={k.id} onClick={() => {setActiveCat(k.category_code);setOpenKP(k);}}
                className="text-left rounded-xl bg-card border hover:border-primary/50 hover:shadow-md transition p-3 group">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {cat && <span className={cn("rounded-md bg-gradient-to-br text-white text-[10px] font-bold px-1.5 py-0.5", cat.gradient)}><T>{cat.name}</T></span>}
                      {k.exam_frequency && <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", FREQ_BADGE[k.exam_frequency] ?? "")}>{k.exam_frequency}<T>频</T></span>}
                    </div>
                    <div className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">{k.level3}</div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{st === "learning" ? "🟡 学习中" : "⚪ 未开始"}</span>
                      <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
                    </div>
                  </button>);

            })}
            </div>
          </div>
        }
      </section>

      {/* 主 Tab */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
        { k: "kp", label: "知识体系", count: kps.length, icon: Target },
        { k: "signal", label: "信号词库", count: signals.length, icon: BookMarked },
        { k: "topic", label: "话题词汇", count: topics.length, icon: Sparkles }].
        map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.k} onClick={() => setTab(t.k as any)}
            className={cn("rounded-xl border p-3 text-left transition",
            tab === t.k ? "bg-primary text-primary-foreground border-primary shadow-tile" : "bg-card border-border hover:border-primary/30")}>
              <div className="flex items-center gap-1.5 text-xs opacity-80"><Icon className="size-3.5" />{t.count} <T>条</T></div>
              <div className="font-bold mt-0.5"><T>{t.label}</T></div>
            </button>);

        })}
      </div>

      {/* 搜索框 */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === "signal" ? "搜索信号词,如 however / because" : tab === "topic" ? "搜索话题或词汇" : "搜索知识点关键词..."}
          className="w-full rounded-xl border bg-card pl-10 pr-10 py-2.5 text-sm outline-none focus:border-primary" />
        
        {search &&
        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="size-4 text-muted-foreground" />
          </button>
        }
      </div>

      {tab === "kp" &&
      <>
          {/* 分类卡片网格 — 显示进度 */}
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const s = catStats[c.code] ?? { total: 0, mastered: 0, learning: 0 };
            const pct = s.total ? Math.round(s.mastered / s.total * 100) : 0;
            const active = activeCat === c.code;
            return (
              <button key={c.code} onClick={() => setActiveCat(c.code)}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-3 text-left transition group",
                active ? `bg-gradient-to-br ${c.gradient} text-white border-transparent shadow-lg ring-2 ${c.ring}` : "bg-card hover:border-primary/40 hover:-translate-y-0.5"
              )}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div className={cn("rounded-lg p-1.5", active ? "bg-white/25" : `bg-gradient-to-br ${c.gradient} text-white`)}>
                      <Icon className="size-3.5" />
                    </div>
                    <div className={cn("text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md", active ? "bg-white/25" : "bg-muted")}>
                      {s.mastered}/{s.total}
                    </div>
                  </div>
                  <div className="font-bold text-sm leading-tight"><T>{c.name}</T></div>
                  <div className={cn("mt-1.5 h-1.5 rounded-full overflow-hidden", active ? "bg-white/25" : "bg-muted")}>
                    <div className={cn("h-full transition-all", active ? "bg-white" : "bg-gradient-to-r " + c.gradient)} style={{ width: `${pct}%` }} />
                  </div>
                  <div className={cn("mt-1 text-[10px]", active ? "text-white/90" : "text-muted-foreground")}>
                    {pct}<T>% 掌握 ·</T> {s.learning} <T>学习中</T>
                  </div>
                </button>);

          })}
          </div>

          {/* 状态 + 年级筛选 */}
          <div className="mb-4 flex flex-wrap gap-1.5 items-center text-xs">
            <Filter className="size-3.5 text-muted-foreground" />
            {([
          { k: "all", label: "全部", c: "" },
          { k: "new", label: "未学", c: "before:bg-slate-400" },
          { k: "learning", label: "学习中", c: "before:bg-amber-500" },
          { k: "mastered", label: "已掌握", c: "before:bg-emerald-500" }] as
          const).map((s) =>
          <button key={s.k} onClick={() => setStatusFilter(s.k)}
          className={cn(
            "relative rounded-full px-2.5 py-1 transition inline-flex items-center gap-1.5",
            s.c && `before:size-1.5 before:rounded-full before:inline-block ${s.c}`,
            statusFilter === s.k ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}>
                <T>{s.label}</T>
              </button>
          )}
            <span className="mx-1 h-3 w-px bg-border" />
            {["all", "senior1", "senior2", "senior3", "sprint"].map((g) =>
          <button key={g} onClick={() => setGrade(g)}
          className={cn("rounded-full px-2.5 py-1 transition",
          grade === g ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                {g === "all" ? "全部年级" : GRADE_LABEL[g]}
              </button>
          )}
          </div>

          {loading ?
        <p className="text-sm text-muted-foreground"><T>加载中...</T></p> :

        <ul className="grid gap-2">
              {filteredKp.
          sort((a, b) => {
            // 学习中优先 > 未学 > 已掌握；同状态下高频优先
            const sa = statusOf(mastery[a.id]);const sb = statusOf(mastery[b.id]);
            const ord = (s: string) => s === "learning" ? 0 : s === "new" ? 1 : 2;
            if (ord(sa) !== ord(sb)) return ord(sa) - ord(sb);
            return (FREQ_ORDER[b.exam_frequency ?? ""] ?? 0) - (FREQ_ORDER[a.exam_frequency ?? ""] ?? 0);
          }).
          map((k) => {
            const st = statusOf(mastery[k.id]);
            return (
              <li key={k.id}>
                      <button onClick={() => setOpenKP(k)} className={cn(
                  "w-full text-left rounded-xl border p-3 transition flex items-start gap-3",
                  st === "mastered" ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60" :
                  st === "learning" ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60" :
                  "bg-card hover:border-primary/40")}>
                        {/* 状态徽标 */}
                        <div className="shrink-0 mt-0.5">
                          {st === "mastered" ? <CheckCircle2 className="size-5 text-emerald-500" /> :
                    st === "learning" ? <Clock className="size-5 text-amber-500" /> :
                    <Circle className="size-5 text-muted-foreground/40" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-mono text-muted-foreground">{k.source_id}</span>
                            {k.exam_frequency &&
                      <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", FREQ_BADGE[k.exam_frequency] ?? "")}>
                                {k.exam_frequency}<T>频</T>
                              </span>
                      }
                            {k.difficulty &&
                      <span className="text-amber-500 text-[10px]">
                                {"★".repeat(k.difficulty)}<span className="text-muted-foreground/30">{"★".repeat(5 - k.difficulty)}</span>
                              </span>
                      }
                            <span className="text-[10px] text-muted-foreground">· {GRADE_LABEL[k.grade_band]}</span>
                          </div>
                          <div className="text-sm font-semibold leading-tight">{k.level3}</div>
                          {(k.level1 || k.level2) &&
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{k.level1} {k.level2 && `› ${k.level2}`}</div>
                    }
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-1" />
                      </button>
                    </li>);

          })}
              {filteredKp.length === 0 &&
          <li className="text-center text-sm text-muted-foreground py-8"><T>未找到匹配的知识点</T></li>
          }
            </ul>
        }
        </>
      }

      {tab === "signal" &&
      <div className="grid gap-3">
          {groupedSignals.map(([cat, items]) =>
        <div key={cat} className="rounded-2xl border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-sm">{cat}</h3>
                <span className="text-[10px] text-muted-foreground">{items.length} <T>个</T></span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((s) =>
            <div key={s.id} title={s.usage_note ?? ""}
            className={cn("group rounded-lg border px-2.5 py-1.5 text-xs cursor-help",
            s.exam_frequency === "极高" ? "border-red-500/40 bg-red-500/5" :
            s.exam_frequency === "高" ? "border-orange-500/30 bg-orange-500/5" :
            "border-border bg-muted/30")}>
                    <div className="font-mono font-semibold">{s.word}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{s.semantic ?? ""}</div>
                  </div>
            )}
              </div>
            </div>
        )}
          {groupedSignals.length === 0 && !loading &&
        <p className="text-center text-sm text-muted-foreground py-8"><T>未找到匹配的信号词</T></p>
        }
        </div>
      }

      {tab === "topic" &&
      <div className="grid gap-3">
          {groupedTopics.map(([big, items]) =>
        <div key={big} className="rounded-2xl border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-sm">{big}</h3>
                <span className="text-[10px] text-muted-foreground">{items.length} <T>子话题</T></span>
              </div>
              <ul className="grid gap-2">
                {items.map((t) =>
            <li key={t.id} className="rounded-lg bg-muted/30 p-2.5">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{t.sub_topic}</span>
                      {t.exam_frequency &&
                <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", FREQ_BADGE[t.exam_frequency] ?? "")}>
                          {t.exam_frequency}<T>频</T>
                        </span>
                }
                    </div>
                    {t.high_freq_words &&
              <div className="text-xs font-mono text-muted-foreground leading-relaxed">{t.high_freq_words}</div>
              }
                    {t.exam_angle && t.exam_angle !== "—" &&
              <div className="mt-1 text-[11px] text-primary"><T>📌 命题角度：</T>{t.exam_angle}</div>
              }
                  </li>
            )}
              </ul>
            </div>
        )}
          {groupedTopics.length === 0 && !loading &&
        <p className="text-center text-sm text-muted-foreground py-8"><T>未找到匹配的话题</T></p>
        }
        </div>
      }

      {/* KP 详情弹层 */}
      {openKP && (() => {
        const st = statusOf(mastery[openKP.id]);
        return (
          <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/40 backdrop-blur-sm" onClick={() => setOpenKP(null)}>
            <div className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border-t sm:border max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* 顶部状态条 */}
              <div className={cn("px-5 pt-5 pb-3",
              st === "mastered" ? "bg-emerald-500/10" : st === "learning" ? "bg-amber-500/10" : "bg-muted/40")}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {st === "mastered" ? <CheckCircle2 className="size-5 text-emerald-500" /> :
                    st === "learning" ? <Clock className="size-5 text-amber-500" /> :
                    <Circle className="size-5 text-muted-foreground" />}
                    <span className="text-xs font-bold">
                      {st === "mastered" ? "已掌握" : st === "learning" ? "学习中" : "未学习"}
                    </span>
                  </div>
                  <button onClick={() => setOpenKP(null)} className="shrink-0 rounded-full bg-background/60 p-1.5"><X className="size-4" /></button>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">{openKP.source_id}</div>
                <h3 className="text-lg font-bold mt-0.5 leading-tight">{openKP.level3}</h3>
                <div className="mt-1 text-xs text-muted-foreground">{openKP.level1} › {openKP.level2}</div>
              </div>

              <div className="p-5">
                <div className="flex gap-2 flex-wrap mb-4">
                  {openKP.exam_frequency &&
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", FREQ_BADGE[openKP.exam_frequency] ?? "")}>
                      {openKP.exam_frequency}<T>频</T>
                    </span>
                  }
                  {openKP.difficulty &&
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs"><T>难度</T> {openKP.difficulty}/5</span>
                  }
                  <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">{GRADE_LABEL[openKP.grade_band]}</span>
                </div>

                <div className="space-y-3">
                  {openKP.example && openKP.example !== "—" &&
                  <Section title="📝 典型问法 / 例句" body={openKP.example} mono />
                  }
                  {openKP.strategy && openKP.strategy !== "—" &&
                  <Section title="🎯 解题策略" body={openKP.strategy} accent="bg-emerald-500/5 border-emerald-500/30" />
                  }
                  {openKP.pitfall && openKP.pitfall !== "—" &&
                  <Section title="⚠️ 易错点 / 失分原因" body={openKP.pitfall} accent="bg-red-500/5 border-red-500/30" />
                  }
                  {openKP.prerequisite && openKP.prerequisite !== "—" &&
                  <Section title="📚 先修知识点" body={openKP.prerequisite} />
                  }
                </div>

                {/* 操作按钮 */}
                <div className="mt-5 grid grid-cols-3 gap-2 sticky bottom-0">
                  <button onClick={() => setMasteryFor(openKP, 0)}
                  className={cn("rounded-xl border py-2.5 text-xs font-semibold transition",
                  st === "new" ? "bg-muted border-foreground/20" : "bg-card hover:bg-muted")}>
                    <T>⚪ 重置</T>
                  </button>
                  <button onClick={() => setMasteryFor(openKP, 1)}
                  className={cn("rounded-xl border py-2.5 text-xs font-semibold transition",
                  st === "learning" ? "bg-amber-500 border-amber-500 text-white" : "bg-amber-500/10 border-amber-500/30 text-amber-700 hover:bg-amber-500/20")}>
                    <T>🟡 学习中</T>
                  </button>
                  <button onClick={() => setMasteryFor(openKP, 3)}
                  className={cn("rounded-xl border py-2.5 text-xs font-semibold transition",
                  st === "mastered" ? "bg-emerald-500 border-emerald-500 text-white" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/20")}>
                    <T>✅ 已掌握</T>
                  </button>
                </div>
              </div>
            </div>
          </div>);

      })()}
    </main>);

}

function StatCell({ color, label, value, icon: Icon }: {color: "emerald" | "amber" | "slate";label: string;value: number;icon: typeof Circle;}) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    slate: "bg-muted text-muted-foreground border-border"
  }[color];
  return (
    <div className={cn("rounded-xl border px-2.5 py-2", colors)}>
      <div className="flex items-center gap-1 text-[10px] opacity-80"><Icon className="size-3" />{label}</div>
      <div className="text-xl font-extrabold tabular-nums leading-tight">{value}</div>
    </div>);

}

function Section({ title, body, mono, accent }: {title: string;body: string;mono?: boolean;accent?: string;}) {
  return (
    <div className={cn("rounded-xl border p-3", accent ?? "bg-muted/30 border-border")}>
      <div className="text-[11px] font-bold mb-1 opacity-80">{title}</div>
      <div className={cn("text-sm leading-relaxed whitespace-pre-wrap", mono && "font-mono text-xs")}>{body}</div>
    </div>);

}