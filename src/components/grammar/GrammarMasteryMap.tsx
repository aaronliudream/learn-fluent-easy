import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, MapPin, RotateCcw, ChevronRight } from "lucide-react";
import { MasteryRing } from "@/components/grammar/MasteryRing";
import {
  GrammarMapNode,
} from "@/components/grammar/GrammarMapNode";
import {
  GrammarMapDrawer,
  type GrammarMapDrawerPoint,
} from "@/components/grammar/GrammarMapDrawer";
import {
  JUNIOR_LEVEL_META,
  type JuniorGrammarMastery,
} from "@/lib/juniorGrammarFsrs";
import { cn } from "@/lib/utils";
import { T } from "@/i18n/T";

export type GrammarMapCategory = {
  id: string;
  name_cn: string;
  emoji: string;
  sort_order: number;
};

export type GrammarMapPoint = {
  id: string;
  category_id: string;
  title: string;
  cefr: string;
  grade: number;
  summary: string;
  content_depth: number | null;
};

type Props = {
  categories: GrammarMapCategory[];
  points: GrammarMapPoint[];
  mastery: Record<string, JuniorGrammarMastery>;
  currentPointId?: string | null;
};

type StateKey = "all" | "unlearned" | "learning" | "familiar" | "proficient" | "mastered";

const STATE_FROM_LEVEL: Record<number, Exclude<StateKey, "all">> = {
  0: "unlearned",
  1: "learning",
  2: "familiar",
  3: "proficient",
  4: "mastered",
};

const STATE_META: Record<
  Exclude<StateKey, "all">,
  { label: string; dot: string; emoji: string }
> = {
  unlearned:  { label: "未开始", dot: "bg-muted-foreground/50", emoji: "🌱" },
  learning:   { label: "初学",   dot: "bg-sky-500",             emoji: "🌿" },
  familiar:   { label: "熟悉",   dot: "bg-emerald-500",         emoji: "🌳" },
  proficient: { label: "熟练",   dot: "bg-amber-500",           emoji: "⭐" },
  mastered:   { label: "掌握",   dot: "bg-yellow-500",          emoji: "👑" },
};

const ringColorByScore = (s: number) =>
  s >= 0.85 ? "stroke-yellow-500"
  : s >= 0.6 ? "stroke-amber-500"
  : s >= 0.3 ? "stroke-emerald-500"
  : s >= 0.1 ? "stroke-sky-500"
  : "stroke-muted";

export function GrammarMasteryMap({
  categories,
  points,
  mastery,
  currentPointId,
}: Props) {
  const [filter, setFilter] = useState<StateKey>("all");
  const [drawerPoint, setDrawerPoint] = useState<GrammarMapDrawerPoint | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const catById = useMemo(() => {
    const m = new Map<string, GrammarMapCategory>();
    for (const c of categories) m.set(c.id, c);
    return m;
  }, [categories]);

  // Group points by grade — points already store an absolute grade (7/8/9)
  const lanes = useMemo(() => {
    const byGrade: Record<number, GrammarMapPoint[]> = { 7: [], 8: [], 9: [] };
    for (const p of points) {
      const g = p.grade >= 7 ? p.grade : p.grade + 6; // normalize 1/2/3 → 7/8/9
      if (!byGrade[g]) byGrade[g] = [];
      byGrade[g].push(p);
    }
    return byGrade;
  }, [points]);

  // Totals + state counts
  const counts = useMemo(() => {
    const out = {
      total: points.length,
      mastered: 0, proficient: 0, familiar: 0, learning: 0, unlearned: 0,
      due: 0, scoreSum: 0,
    };
    for (const p of points) {
      const lvl = mastery[p.id]?.mastery_level ?? 0;
      out.scoreSum += lvl / 4;
      const k = STATE_FROM_LEVEL[lvl];
      // @ts-expect-error key narrows
      out[k] += 1;
      const due = mastery[p.id]?.due_at;
      if (due && new Date(due).getTime() <= Date.now()) out.due += 1;
    }
    return out;
  }, [points, mastery]);

  const overallPercent = points.length
    ? Math.round((counts.scoreSum / points.length) * 100)
    : 0;

  // Per-category aggregate for the sidebar
  const categoryStats = useMemo(() => {
    return categories.map((c) => {
      const ps = points.filter((p) => p.category_id === c.id);
      let mastered = 0, scoreSum = 0;
      for (const p of ps) {
        const lvl = mastery[p.id]?.mastery_level ?? 0;
        scoreSum += lvl / 4;
        if (lvl === 4) mastered += 1;
      }
      return {
        cat: c,
        total: ps.length,
        mastered,
        score: ps.length ? scoreSum / ps.length : 0,
      };
    }).filter((x) => x.total > 0);
  }, [categories, points, mastery]);

  const currentPoint = useMemo(
    () => (currentPointId ? points.find((p) => p.id === currentPointId) ?? null : null),
    [currentPointId, points],
  );
  const currentMeta = currentPoint
    ? {
        level: mastery[currentPoint.id]?.mastery_level ?? 0,
        cat: catById.get(currentPoint.category_id),
      }
    : null;

  function openPoint(p: GrammarMapPoint) {
    const cat = catById.get(p.category_id);
    const ms = mastery[p.id];
    setDrawerPoint({
      id: p.id,
      title: p.title,
      cefr: p.cefr,
      summary: p.summary,
      grade: p.grade,
      categoryName: cat?.name_cn,
      categoryEmoji: cat?.emoji,
      level: ms?.mastery_level ?? 0,
      isDue: !!(ms?.due_at && new Date(ms.due_at).getTime() <= Date.now()),
      hasRichContent: (p.content_depth ?? 0) >= 1,
    });
    setDrawerOpen(true);
  }

  return (
    <section className="space-y-5">
      {/* ───── YOU ARE HERE banner ───── */}
      {currentPoint && currentMeta && (
        <div className="grid items-center gap-3 rounded-2xl border border-purple-400/40 bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-sky-500/10 p-4 md:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-700 dark:text-purple-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-600" />
              </span>
              <MapPin className="size-3" />
              <T>你在这里</T>
            </span>
            <h3 className="mt-1 text-base font-extrabold">
              {currentMeta.cat?.emoji} {currentPoint.title}
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                · 初{currentPoint.grade >= 7 ? currentPoint.grade - 6 : currentPoint.grade} · CEFR {currentPoint.cefr}
              </span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {JUNIOR_LEVEL_META[currentMeta.level].emoji} {JUNIOR_LEVEL_META[currentMeta.level].label} ·{" "}
              <T>系统智能推荐 · 从薄弱模块开始</T>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/junior/grammar/${currentPoint.id}`}
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              <T>继续学习</T> <ChevronRight className="size-3.5" />
            </Link>
            <button
              onClick={() => {
                const p = points.find((x) => x.id === currentPoint.id);
                if (p) openPoint(p);
              }}
              className="rounded-xl border bg-card px-3 py-2 text-sm font-bold hover:bg-muted"
            >
              <T>详情</T>
            </button>
          </div>
        </div>
      )}

      {/* ───── Filter chips ───── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Filter className="size-3" /> <T>筛选状态</T>
        </span>
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          <T>全部</T> ({counts.total})
        </FilterChip>
        {(["mastered","proficient","familiar","learning","unlearned"] as const).map((k) => {
          const m = STATE_META[k];
          const n = counts[k];
          return (
            <FilterChip key={k} active={filter === k} onClick={() => setFilter(k)}>
              <span className={cn("mr-1 inline-block size-2 rounded-full align-middle", m.dot)} />
              {m.emoji} {m.label} ({n})
            </FilterChip>
          );
        })}
        {filter !== "all" && (
          <button
            onClick={() => setFilter("all")}
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" /> <T>重置</T>
          </button>
        )}
      </div>

      {/* ───── Map + Sidebar ───── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Skill map: 3 lanes */}
        <div className="rounded-2xl border bg-card p-4">
          {[7, 8, 9].map((g) => {
            const lanePts = lanes[g] ?? [];
            if (lanePts.length === 0) return null;
            const masteredInLane = lanePts.filter(
              (p) => (mastery[p.id]?.mastery_level ?? 0) === 4,
            ).length;
            return (
              <div key={g} className="border-b border-dashed py-4 last:border-b-0">
                <div className="mb-3 flex items-center gap-3 px-1">
                  <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-sky-500 text-sm font-extrabold text-primary-foreground">
                    {g - 6}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">
                      <T>初{(g - 6) === 1 ? "一" : (g - 6) === 2 ? "二" : "三"}</T>{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        · {lanePts.length} <T>个考点</T>
                      </span>
                    </h4>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {masteredInLane} / {lanePts.length} <T>掌握</T> ·{" "}
                    {Math.round((masteredInLane / lanePts.length) * 100)}%
                  </div>
                </div>

                <div className="flex flex-wrap items-start gap-x-4 gap-y-3 px-1">
                  {lanePts.map((p, i) => {
                    const lvl = mastery[p.id]?.mastery_level ?? 0;
                    const state = STATE_FROM_LEVEL[lvl];
                    const dimmed = filter !== "all" && filter !== state;
                    const isDue = !!(mastery[p.id]?.due_at &&
                      new Date(mastery[p.id]!.due_at!).getTime() <= Date.now());
                    return (
                      <GrammarMapNode
                        key={p.id}
                        index={i}
                        title={p.title}
                        level={lvl}
                        isCurrent={p.id === currentPointId}
                        isDue={isDue}
                        dimmed={dimmed}
                        onClick={() => openPoint(p)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <aside className="space-y-3">
          {/* Overall */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <MasteryRing
                value={overallPercent / 100}
                size={56}
                stroke={6}
                colorClass={ringColorByScore(overallPercent / 100)}
              >
                <div className="text-center">
                  <div className="text-sm font-extrabold tabular-nums leading-none">
                    {overallPercent}%
                  </div>
                </div>
              </MasteryRing>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground"><T>总掌握度</T></div>
                <div className="text-base font-extrabold tabular-nums">
                  {counts.mastered}
                  <span className="text-xs font-normal text-muted-foreground"> / {counts.total}</span>
                </div>
                {counts.due > 0 && (
                  <div className="mt-0.5 text-[11px] font-bold text-rose-600">
                    ⚠ {counts.due} <T>待复习</T>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="rounded-2xl border bg-card p-4">
            <h5 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <T>按主题熟练度</T>
            </h5>
            <ul className="space-y-2">
              {categoryStats.map((s) => (
                <li key={s.cat.id} className="flex items-center gap-3">
                  <MasteryRing
                    value={s.score}
                    size={36}
                    stroke={4}
                    colorClass={ringColorByScore(s.score)}
                  >
                    <span className="text-xs">{s.cat.emoji}</span>
                  </MasteryRing>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold">{s.cat.name_cn}</div>
                    <div className="text-[10px] text-muted-foreground tabular-nums">
                      {s.mastered} / {s.total} <T>掌握</T> · {Math.round(s.score * 100)}%
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Legend */}
          <div className="rounded-2xl border bg-muted/30 p-4">
            <h5 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <T>状态图例</T>
            </h5>
            <ul className="space-y-1.5 text-[11px]">
              {(["mastered","proficient","familiar","learning","unlearned"] as const).map((k) => {
                const m = STATE_META[k];
                return (
                  <li key={k} className="flex items-center gap-2">
                    <span className={cn("inline-block size-2 rounded-full", m.dot)} />
                    <span>{m.emoji}</span>
                    <span className="font-bold">{m.label}</span>
                  </li>
                );
              })}
              <li className="flex items-center gap-2 pt-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-600" />
                </span>
                <span className="font-bold"><T>当前焦点</T></span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <GrammarMapDrawer
        point={drawerPoint}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition",
        active
          ? "border-primary bg-primary/15 font-bold text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
