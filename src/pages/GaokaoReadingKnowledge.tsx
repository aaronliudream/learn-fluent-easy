import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, BookMarked, Filter, Sparkles, BookOpen, Target, Trophy, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

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
  id: string; word: string; category: string; semantic: string | null;
  exam_frequency: string | null; difficulty: number | null; usage_note: string | null;
};

type Topic = {
  id: string; big_topic: string; sub_topic: string | null; high_freq_words: string | null;
  exam_frequency: string | null; difficulty: number | null; exam_angle: string | null;
};

const CATEGORIES: { code: string; name: string; icon: typeof BookMarked; color: string }[] = [
  { code: "R1", name: "题型拆解", icon: Target, color: "text-rose-600 bg-rose-500/10" },
  { code: "R2", name: "文体特征", icon: BookOpen, color: "text-amber-600 bg-amber-500/10" },
  { code: "R3", name: "话题词汇", icon: Sparkles, color: "text-emerald-600 bg-emerald-500/10" },
  { code: "R4", name: "解题策略", icon: Target, color: "text-sky-600 bg-sky-500/10" },
  { code: "R5", name: "信号词库", icon: BookMarked, color: "text-violet-600 bg-violet-500/10" },
  { code: "R6", name: "长难句", icon: Trophy, color: "text-fuchsia-600 bg-fuchsia-500/10" },
  { code: "R7", name: "七选五", icon: Target, color: "text-cyan-600 bg-cyan-500/10" },
  { code: "R8", name: "基础能力", icon: Sparkles, color: "text-lime-600 bg-lime-500/10" },
];

const GRADE_LABEL: Record<string, string> = {
  senior1: "高一", senior2: "高二", senior3: "高三", sprint: "高考冲刺", all: "通用",
};

const FREQ_ORDER: Record<string, number> = { "极高": 4, "高": 3, "中": 2, "低": 1 };

const FREQ_BADGE: Record<string, string> = {
  "极高": "bg-red-500/15 text-red-600 border-red-500/30",
  "高": "bg-orange-500/15 text-orange-600 border-orange-500/30",
  "中": "bg-amber-500/15 text-amber-600 border-amber-500/30",
  "低": "bg-muted text-muted-foreground border-border",
};

export default function GaokaoReadingKnowledge() {
  const [tab, setTab] = useState<"kp" | "signal" | "topic">("kp");
  const [activeCat, setActiveCat] = useState<string>("R1");
  const [grade, setGrade] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [kps, setKps] = useState<KP[]>([]);
  const [signals, setSignals] = useState<SignalWord[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [openKP, setOpenKP] = useState<KP | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [a, b, c] = await Promise.all([
        supabase.from("gaokao_reading_knowledge_points").select("*").order("source_id"),
        supabase.from("gaokao_reading_signal_words").select("*").order("source_id"),
        supabase.from("gaokao_reading_topics").select("*").order("source_id"),
      ]);
      setKps((a.data ?? []) as KP[]);
      setSignals((b.data ?? []) as SignalWord[]);
      setTopics((c.data ?? []) as Topic[]);
      setLoading(false);
    })();
  }, []);

  const filteredKp = useMemo(() => {
    const q = search.trim().toLowerCase();
    return kps.filter((k) => {
      if (k.category_code !== activeCat) return false;
      if (grade !== "all" && k.grade_band !== grade) return false;
      if (!q) return true;
      const blob = `${k.level1 ?? ""} ${k.level2 ?? ""} ${k.level3} ${k.example ?? ""} ${k.strategy ?? ""}`.toLowerCase();
      return blob.includes(q);
    });
  }, [kps, activeCat, grade, search]);

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

  const stats = useMemo(() => ({
    kp: kps.length, sig: signals.length, top: topics.length,
  }), [kps, signals, topics]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8">
      <Link to="/gaokao/reading" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回阅读训练
      </Link>

      <PageHeader hideReviewBanner title="阅读知识点速查" subtitle={`体系化整理 · 题型 / 文体 / 策略 / 信号词 / 话题 共 ${stats.kp + stats.sig + stats.top} 条`} />

      {/* 主 Tab */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { k: "kp", label: "知识体系", count: stats.kp },
          { k: "signal", label: "信号词库", count: stats.sig },
          { k: "topic", label: "话题词汇", count: stats.top },
        ].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as any)}
            className={cn("rounded-xl border p-3 text-left transition",
              tab === t.k ? "bg-primary/10 border-primary text-primary shadow-tile" : "bg-card border-border hover:border-primary/30")}>
            <div className="text-xs opacity-70">{t.count} 条</div>
            <div className="font-bold mt-0.5">{t.label}</div>
          </button>
        ))}
      </div>

      {/* 搜索框 */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === "signal" ? "搜索信号词,如 however / because" : tab === "topic" ? "搜索话题或词汇" : "搜索知识点关键词..."}
          className="w-full rounded-xl border bg-card pl-10 pr-10 py-2.5 text-sm outline-none focus:border-primary"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="size-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {tab === "kp" && (
        <>
          {/* 分类筛选 */}
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const cnt = kps.filter((k) => k.category_code === c.code).length;
              const active = activeCat === c.code;
              return (
                <button key={c.code} onClick={() => setActiveCat(c.code)}
                  className={cn("shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition flex items-center gap-1.5",
                    active ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/40")}>
                  <Icon className="size-3.5" />
                  {c.name}
                  <span className={cn("ml-1 rounded px-1.5 py-0.5 text-[10px] tabular-nums", active ? "bg-primary-foreground/20" : "bg-muted")}>{cnt}</span>
                </button>
              );
            })}
          </div>

          {/* 年级筛选 */}
          <div className="mb-4 flex gap-1.5 items-center text-xs">
            <Filter className="size-3.5 text-muted-foreground" />
            {["all", "senior1", "senior2", "senior3", "sprint"].map((g) => (
              <button key={g} onClick={() => setGrade(g)}
                className={cn("rounded-full px-2.5 py-1 transition",
                  grade === g ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                {g === "all" ? "全部" : GRADE_LABEL[g]}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">加载中...</p>
          ) : (
            <ul className="grid gap-2">
              {filteredKp
                .sort((a, b) => (FREQ_ORDER[b.exam_frequency ?? ""] ?? 0) - (FREQ_ORDER[a.exam_frequency ?? ""] ?? 0))
                .map((k) => (
                <li key={k.id}>
                  <button onClick={() => setOpenKP(k)} className="w-full text-left rounded-xl border bg-card p-3 hover:border-primary/40 transition">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground">{k.source_id}</span>
                      {k.exam_frequency && (
                        <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", FREQ_BADGE[k.exam_frequency] ?? "")}>
                          {k.exam_frequency}频
                        </span>
                      )}
                      {k.difficulty && (
                        <span className="text-amber-500 text-[10px]">
                          {"★".repeat(k.difficulty)}<span className="text-muted-foreground/30">{"★".repeat(5 - k.difficulty)}</span>
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">· {GRADE_LABEL[k.grade_band]}</span>
                    </div>
                    <div className="text-sm font-semibold leading-tight">{k.level3}</div>
                    {(k.level1 || k.level2) && (
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{k.level1} {k.level2 && `› ${k.level2}`}</div>
                    )}
                  </button>
                </li>
              ))}
              {filteredKp.length === 0 && (
                <li className="text-center text-sm text-muted-foreground py-8">未找到匹配的知识点</li>
              )}
            </ul>
          )}
        </>
      )}

      {tab === "signal" && (
        <div className="grid gap-3">
          {groupedSignals.map(([cat, items]) => (
            <div key={cat} className="rounded-2xl border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-sm">{cat}</h3>
                <span className="text-[10px] text-muted-foreground">{items.length} 个</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <div key={s.id} title={s.usage_note ?? ""}
                    className={cn("group rounded-lg border px-2.5 py-1.5 text-xs cursor-help",
                      s.exam_frequency === "极高" ? "border-red-500/40 bg-red-500/5"
                        : s.exam_frequency === "高" ? "border-orange-500/30 bg-orange-500/5"
                        : "border-border bg-muted/30")}>
                    <div className="font-mono font-semibold">{s.word}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{s.semantic ?? ""}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {groupedSignals.length === 0 && !loading && (
            <p className="text-center text-sm text-muted-foreground py-8">未找到匹配的信号词</p>
          )}
        </div>
      )}

      {tab === "topic" && (
        <div className="grid gap-3">
          {groupedTopics.map(([big, items]) => (
            <div key={big} className="rounded-2xl border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-sm">{big}</h3>
                <span className="text-[10px] text-muted-foreground">{items.length} 子话题</span>
              </div>
              <ul className="grid gap-2">
                {items.map((t) => (
                  <li key={t.id} className="rounded-lg bg-muted/30 p-2.5">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{t.sub_topic}</span>
                      {t.exam_frequency && (
                        <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", FREQ_BADGE[t.exam_frequency] ?? "")}>
                          {t.exam_frequency}频
                        </span>
                      )}
                    </div>
                    {t.high_freq_words && (
                      <div className="text-xs font-mono text-muted-foreground leading-relaxed">{t.high_freq_words}</div>
                    )}
                    {t.exam_angle && t.exam_angle !== "—" && (
                      <div className="mt-1 text-[11px] text-primary">📌 命题角度：{t.exam_angle}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {groupedTopics.length === 0 && !loading && (
            <p className="text-center text-sm text-muted-foreground py-8">未找到匹配的话题</p>
          )}
        </div>
      )}

      {/* KP 详情弹层 */}
      {openKP && (
        <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/40 backdrop-blur-sm" onClick={() => setOpenKP(null)}>
          <div className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl border-t sm:border max-h-[85vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-[10px] font-mono text-muted-foreground">{openKP.source_id}</div>
                <h3 className="text-lg font-bold mt-1 leading-tight">{openKP.level3}</h3>
                <div className="mt-1 text-xs text-muted-foreground">{openKP.level1} › {openKP.level2}</div>
              </div>
              <button onClick={() => setOpenKP(null)} className="shrink-0 rounded-full bg-muted p-1.5"><X className="size-4" /></button>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {openKP.exam_frequency && (
                <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", FREQ_BADGE[openKP.exam_frequency] ?? "")}>
                  {openKP.exam_frequency}频
                </span>
              )}
              {openKP.difficulty && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">难度 {openKP.difficulty}/5</span>
              )}
              <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">{GRADE_LABEL[openKP.grade_band]}</span>
            </div>

            <div className="space-y-3">
              {openKP.example && openKP.example !== "—" && (
                <Section title="📝 典型问法 / 例句" body={openKP.example} mono />
              )}
              {openKP.strategy && openKP.strategy !== "—" && (
                <Section title="🎯 解题策略" body={openKP.strategy} accent="bg-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" />
              )}
              {openKP.pitfall && openKP.pitfall !== "—" && (
                <Section title="⚠️ 易错点 / 失分原因" body={openKP.pitfall} accent="bg-red-500/5 border-red-500/30 text-red-700 dark:text-red-400" />
              )}
              {openKP.prerequisite && openKP.prerequisite !== "—" && (
                <Section title="📚 先修知识点" body={openKP.prerequisite} />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Section({ title, body, mono, accent }: { title: string; body: string; mono?: boolean; accent?: string }) {
  return (
    <div className={cn("rounded-xl border p-3", accent ?? "bg-muted/30 border-border")}>
      <div className="text-[11px] font-bold mb-1 opacity-80">{title}</div>
      <div className={cn("text-sm leading-relaxed whitespace-pre-wrap", mono && "font-mono text-xs")}>{body}</div>
    </div>
  );
}
