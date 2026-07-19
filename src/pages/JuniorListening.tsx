import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Headphones, Search, ChevronDown, ChevronRight, AlertTriangle, RotateCw, Play, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";
import { MasteryBadge, type MasteryStatus } from "@/components/mastery/MasteryBadge";
import { MasteryRing } from "@/components/mastery/MasteryRing";
import { cn } from "@/lib/utils";
import { JuniorGradeFilter, juniorGradeParams, type JuniorGradeKey } from "@/components/junior/JuniorGradeFilter";
import { dbPublisherFor, readJuniorPublisherParam } from "@/lib/juniorHub/publisher";

/** 从 ?grade= 参数(可能是 1/2/3 或 7/8/9)推出筛选条 chip 的当前值。 */
function gradeKeyFromParam(grade: string | null): JuniorGradeKey {
  if (!grade) return "all";
  const db = Number(grade) >= 7 ? Number(grade) : Number(grade) + 6;
  return db === 7 ? "g7" : db === 8 ? "g8" : db === 9 ? "g9" : "all";
}

type E = {id: string;title: string;topic: string | null;grade: number;difficulty: number;kind: string | null;duration_sec: number | null;};
type AttemptAgg = {total: number;correct: number;lastAt: number;};

const SECTIONS: {key: string;label: string;emoji: string;desc: string;}[] = [
{ key: "short", label: "Section A · 短对话", emoji: "💬", desc: "每段 1 题 · 听一遍即答" },
{ key: "long", label: "Section B · 长对话", emoji: "🗣️", desc: "每段 3 题 · 听两遍" },
{ key: "mono", label: "Section C · 独白短文", emoji: "📻", desc: "每段 5 题 · 含填空与判断" },
{ key: "passage", label: "Section D · 听短文填空", emoji: "📝", desc: "每篇 4 个空 · 选项填空" },
{ key: "dictation", label: "Section E · 听写句子", emoji: "🖊️", desc: "听完整句默写" }];


type FilterKey = "all" | "due" | "learned" | "untouched" | "mastered";

const FILTERS: {key: FilterKey;label: string;emoji: string;}[] = [
{ key: "all", label: "全部", emoji: "📚" },
{ key: "due", label: "待复习", emoji: "⏰" },
{ key: "learned", label: "继续突破", emoji: "🌿" },
{ key: "untouched", label: "未开始", emoji: "🌱" },
{ key: "mastered", label: "已掌握", emoji: "🌳" }];


function statusOf(agg: AttemptAgg | undefined): MasteryStatus {
  if (!agg || agg.total === 0) return "untouched";
  const pct = agg.correct / agg.total;
  // 14 天未练且不完美 → 待复习
  const days = (Date.now() - agg.lastAt) / 86_400_000;
  if (pct >= 0.95) return "expert";
  if (pct >= 0.8) {
    if (days > 14) return "due";
    return "mastered";
  }
  return "learned";
}

function pctOf(agg: AttemptAgg | undefined) {
  if (!agg || !agg.total) return null;
  return Math.round(agg.correct / agg.total * 100);
}

export default function JuniorListening() {
  const [params, setParams] = useSearchParams();
  const grade = params.get("grade");
  const dbPub = dbPublisherFor(readJuniorPublisherParam(params)); // 出版社过滤:人教='junior'(结果等价),外研社='junior_fltrp'
  const backTo = "/junior";
  const onGrade = (key: JuniorGradeKey) => {
    const { dbGrade } = juniorGradeParams(key);
    const next = new URLSearchParams(params);
    if (dbGrade != null) next.set("grade", String(dbGrade));
    else next.delete("grade");
    setParams(next, { replace: true });
  };
  const [items, setItems] = useState<E[]>([]);
  const [aggMap, setAggMap] = useState<Map<string, AttemptAgg>>(new Map());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [wrongCount, setWrongCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);

  // load exercises
  useEffect(() => {
    let q: any = (supabase as any).from("junior_listening_exercises").
    select("id,title,topic,grade,difficulty,kind,duration_sec").
    eq("publisher", dbPub).
    order("title");
    if (grade) {
      const g = Number(grade);
      const dbGrade = g <= 3 ? g + 6 : g;
      q = q.eq("grade", dbGrade);
    }
    q.then(({ data }: any) => setItems((data ?? []) as E[]));
  }, [grade, dbPub]);

  // load attempts
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {setSignedIn(false);return;}
      setSignedIn(true);
      const { data } = await (supabase as any).from("junior_listening_attempts").
      select("exercise_id,is_correct,created_at").
      eq("user_id", u.user.id);
      const m = new Map<string, AttemptAgg>();
      let wrong = 0;
      for (const r of data ?? []) {
        const id = r.exercise_id as string;
        const cur = m.get(id) ?? { total: 0, correct: 0, lastAt: 0 };
        cur.total += 1;
        if (r.is_correct) cur.correct += 1;else wrong += 1;
        const t = new Date(r.created_at).getTime();
        if (t > cur.lastAt) cur.lastAt = t;
        m.set(id, cur);
      }
      setAggMap(m);
      setWrongCount(wrong);
    })();
  }, []);

  // counts
  const counts = useMemo(() => {
    const c = { all: items.length, due: 0, learned: 0, untouched: 0, mastered: 0 };
    for (const e of items) {
      const s = statusOf(aggMap.get(e.id));
      if (s === "due") c.due += 1;else
      if (s === "learned") c.learned += 1;else
      if (s === "untouched") c.untouched += 1;else
      c.mastered += 1; // mastered + expert
    }
    return c;
  }, [items, aggMap]);

  const total = counts.all;
  const masteredAll = counts.mastered;
  const percent = total ? Math.round(masteredAll / total * 100) : 0;

  // smart resume pick
  const resume = useMemo(() => {
    if (!total) return null;
    const dueItem = items.find((e) => statusOf(aggMap.get(e.id)) === "due");
    if (dueItem) return { item: dueItem, kind: "due" as const };
    const learnItem = items.find((e) => statusOf(aggMap.get(e.id)) === "learned");
    if (learnItem) return { item: learnItem, kind: "resume" as const };
    const newItem = items.find((e) => statusOf(aggMap.get(e.id)) === "untouched");
    if (newItem) return { item: newItem, kind: "new" as const };
    return null;
  }, [items, aggMap, total]);

  // filter & search
  const visible = useMemo(() => {
    return items.filter((e) => {
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !(e.topic ?? "").toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === "all") return true;
      const s = statusOf(aggMap.get(e.id));
      if (filter === "due") return s === "due";
      if (filter === "learned") return s === "learned";
      if (filter === "untouched") return s === "untouched";
      if (filter === "mastered") return s === "mastered" || s === "expert";
      return true;
    });
  }, [items, filter, search, aggMap]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8">
      <BackLink to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回初中专区
      </BackLink>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-grad-title text-2xl font-extrabold"><T>🎧 初中听力训练</T></h1>
          <p className="mt-1 text-sm text-muted-foreground"><T>短对话 · 长对话 · 独白 · 填空 · 听写</T></p>
        </div>
      </div>

      <JuniorGradeFilter value={gradeKeyFromParam(grade)} onChange={onGrade} className="mt-4" />

      {/* === 顶部进度卡 === */}
      {signedIn && total > 0 &&
      <section className="mt-5 rounded-3xl border-2 border-border bg-gradient-to-br from-sky-50 to-blue-50 p-5 dark:from-sky-950/30 dark:to-blue-950/30">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <MasteryRing percent={percent} size={130} label="听力总进度" sublabel={`${masteredAll}/${total}`} />
            <div className="flex flex-1 flex-wrap gap-2">
              <StatPill emoji="👑🌳" label="掌握" n={counts.mastered} cls="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" onClick={() => setFilter("mastered")} active={filter === "mastered"} />
              <StatPill emoji="🌿" label="学过" n={counts.learned} cls="bg-blue-500/15 text-blue-700 dark:text-blue-300" onClick={() => setFilter("learned")} active={filter === "learned"} />
              <StatPill emoji="🌱" label="未学" n={counts.untouched} cls="bg-muted text-muted-foreground" onClick={() => setFilter("untouched")} active={filter === "untouched"} />
              <StatPill emoji="⏰" label="待复习" n={counts.due} cls="bg-orange-500/15 text-orange-700 dark:text-orange-300" onClick={() => setFilter("due")} active={filter === "due"} pulse={counts.due > 0} />
            </div>
          </div>

          {/* 智能续学 + 错题本 */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {resume &&
          <Link to={`/junior/listening/${resume.item.id}`} className="group flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:-translate-y-0.5 dark:bg-card">
                <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-white",
            resume.kind === "due" ? "bg-gradient-to-br from-orange-500 to-rose-500" :
            resume.kind === "resume" ? "bg-gradient-to-br from-indigo-500 to-violet-500" :
            "bg-gradient-to-br from-emerald-500 to-teal-500")}>
                  <Play className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {resume.kind === "due" ? "今日到期" : resume.kind === "resume" ? "继续上次" : "今日推荐"}
                  </div>
                  <div className="truncate text-sm font-extrabold">{resume.item.title}</div>
                </div>
              </Link>
          }
            {wrongCount > 0 &&
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm dark:bg-card">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                  <AlertTriangle className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><T>错题统计</T></div>
                  <div className="text-sm font-extrabold"><T>累计答错</T> {wrongCount} <T>次</T></div>
                  <div className="text-[11px] text-muted-foreground"><T>点 ⏰ 待复习筛选 · 集中订正</T></div>
                </div>
              </div>
          }
          </div>
        </section>
      }

      {grade &&
      <ModuleStageTests
        segment="junior"
        grade={Number(grade) >= 7 ? Number(grade) - 6 : Number(grade)}
        module="listening"
        className="mt-4" />

      }

      {/* === 筛选 + 搜索 === */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const n = counts[f.key];
          const active = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)}
            className={cn("rounded-full border-2 px-3 py-1 text-xs font-bold transition",
            active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40")}>
              <span className="mr-1">{f.emoji}</span><T>{f.label}</T>
              <span className="ml-1 opacity-70">({n})</span>
            </button>);

        })}
        <div className="relative ml-auto">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索标题/话题"
          className="w-44 rounded-full border-2 border-border bg-card pl-8 pr-3 py-1.5 text-xs focus:border-primary focus:outline-none" />
        </div>
      </div>

      {visible.length === 0 && items.length > 0 &&
      <p className="mt-8 text-center text-sm text-muted-foreground">
          {filter === "due" ? "🎉 没有需要复习的，继续学习新内容吧！" :
        filter === "untouched" ? "🎊 你已开始所有听力，太厉害了！" :
        filter === "mastered" ? "💪 还没有完全掌握的，继续努力！" :
        "暂无匹配结果"}
        </p>
      }
      {items.length === 0 && <p className="mt-6 text-sm text-muted-foreground"><T>暂无听力，敬请期待</T></p>}

      {/* === 分组列表（按 Section） === */}
      {SECTIONS.map((sec) => {
        const list = visible.filter((e) => (e.kind ?? "short") === sec.key);
        if (!list.length) return null;
        // sub-group by status: due → learned → untouched → mastered
        const byStatus = {
          due: list.filter((e) => statusOf(aggMap.get(e.id)) === "due"),
          learned: list.filter((e) => statusOf(aggMap.get(e.id)) === "learned"),
          untouched: list.filter((e) => statusOf(aggMap.get(e.id)) === "untouched"),
          mastered: list.filter((e) => {const s = statusOf(aggMap.get(e.id));return s === "mastered" || s === "expert";})
        };
        const collapseKey = `sec_${sec.key}`;
        const isCollapsed = collapsed[collapseKey];
        return (
          <section key={sec.key} className="mt-7">
            <button onClick={() => setCollapsed((c) => ({ ...c, [collapseKey]: !c[collapseKey] }))}
            className="flex w-full items-baseline justify-between gap-2 text-left">
              <h2 className="text-base font-extrabold">
                {isCollapsed ? <ChevronRight className="inline size-4" /> : <ChevronDown className="inline size-4" />}
                {sec.emoji} <T>{sec.label}</T>
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">{list.length} <T>段 ·</T> <T>{sec.desc}</T></span>
              </h2>
            </button>

            {!isCollapsed &&
            <div className="mt-3 space-y-4">
                <SubGroup title="⏰ 待复习" items={byStatus.due} aggMap={aggMap} defaultOpen tone="orange" />
                <SubGroup title="🌿 继续突破" items={byStatus.learned} aggMap={aggMap} defaultOpen tone="blue" />
                <SubGroup title="🌱 未开始" items={byStatus.untouched} aggMap={aggMap} defaultOpen={byStatus.due.length === 0 && byStatus.learned.length === 0} tone="muted" />
                <SubGroup title="🌳 已掌握" items={byStatus.mastered} aggMap={aggMap} defaultOpen={false} tone="emerald" />
              </div>
            }
          </section>);

      })}
    </main>);

}

function StatPill({ emoji, label, n, cls, onClick, active, pulse }: {emoji: string;label: string;n: number;cls: string;onClick?: () => void;active?: boolean;pulse?: boolean;}) {
  return (
    <button onClick={onClick}
    className={cn("flex flex-1 min-w-[90px] flex-col items-center rounded-2xl px-3 py-2 transition",
    cls,
    active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
    pulse && "animate-pulse")}>
      <div className="text-lg">{emoji}</div>
      <div className="mt-0.5 text-base font-extrabold tabular-nums">{n}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</div>
    </button>);

}

function SubGroup({ title, items, aggMap, defaultOpen, tone

}: {title: string;items: E[];aggMap: Map<string, AttemptAgg>;defaultOpen?: boolean;tone: "orange" | "blue" | "muted" | "emerald";}) {
  const [open, setOpen] = useState(!!defaultOpen);
  if (!items.length) return null;
  const toneCls = {
    orange: "border-l-orange-500",
    blue: "border-l-blue-500",
    muted: "border-l-muted-foreground/40",
    emerald: "border-l-emerald-500"
  }[tone];
  return (
    <div className={cn("border-l-4 pl-3", toneCls)}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span className="text-sm font-extrabold">{title} <span className="ml-1 text-xs font-normal text-muted-foreground">({items.length})</span></span>
        {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
      </button>
      {open &&
      <div className="mt-2 grid gap-2">
          {items.map((e) => <ExerciseCard key={e.id} e={e} agg={aggMap.get(e.id)} />)}
        </div>
      }
    </div>);

}

function ExerciseCard({ e, agg }: {e: E;agg: AttemptAgg | undefined;}) {
  const status = statusOf(agg);
  const pct = pctOf(agg);
  const wrong = agg ? agg.total - agg.correct : 0;
  const borderCls =
  status === "due" ? "border-orange-400 hover:border-orange-500" :
  status === "learned" ? "border-blue-300 hover:border-blue-500" :
  status === "expert" ? "border-amber-300 hover:border-amber-500" :
  status === "mastered" ? "border-emerald-300 hover:border-emerald-500" :
  "border-border hover:border-sky-400";
  const iconBg =
  status === "expert" ? "from-amber-400 to-yellow-600" :
  status === "mastered" ? "from-emerald-400 to-green-600" :
  status === "due" ? "from-orange-400 to-rose-600" :
  status === "learned" ? "from-blue-400 to-indigo-600" :
  "from-sky-400 to-blue-600";
  return (
    <Link to={`/junior/listening/${e.id}`}
    className={cn("flex items-center gap-3 rounded-2xl border-2 bg-card p-3 transition hover:-translate-y-0.5", borderCls)}>
      <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white", iconBg)}>
        {status === "expert" ? <Trophy className="size-5" /> :
        status === "due" ? <RotateCw className="size-5" /> :
        <Headphones className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-extrabold">{e.title}</div>
          <MasteryBadge status={status} className="shrink-0" />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          <span>{e.topic ?? "general"}</span>
          <span><T>· 难度</T> {"★".repeat(e.difficulty)}{"☆".repeat(Math.max(0, 3 - e.difficulty))}</span>
          {e.duration_sec ? <span>· {Math.round(e.duration_sec)}s</span> : null}
          {pct !== null && <span><T>· 上次</T> {pct}%</span>}
          {wrong > 0 && <span className="font-bold text-rose-600 dark:text-rose-400"><T>· ❌ 累计</T> {wrong} <T>错</T></span>}
        </div>
      </div>
      <div className="shrink-0 text-[11px] font-bold text-primary">
        {status === "untouched" ? "▶ 开始" :
        status === "due" ? "⚡ 复习" :
        status === "learned" ? "🔧 订正" :
        status === "expert" ? "🏆 挑战" : "↻ 复习"}
      </div>
    </Link>);

}