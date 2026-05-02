import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trophy, Target, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  computeMasteryScore,
  levelFromScore,
  MASTERY_LABELS,
  type MasteryLevel,
  type MasteryMatrix,
  type QuizKind,
} from "@/lib/masteryScore";
import { cn } from "@/lib/utils";

type MasteryRow = {
  item_id: string;
  mastery_matrix: MasteryMatrix | null;
  reached_master_at: string | null;
  lapses: number;
  correct_count: number;
  wrong_count: number;
  last_seen_at: string | null;
};
type VocabLite = { id: string; word: string; meaning_cn: string };

const TOTAL_VOCAB = 3500;
const FAMILY_KIND: Record<"form" | "meaning" | "use", QuizKind[]> = {
  form: ["spell", "listen"],
  meaning: ["en2cn", "cn2en", "en2en", "en2word", "syn"],
  use: ["cloze", "pos"],
};
const FAMILY_CAP = 4;

export default function MasteryDashboard({ onExit }: { onExit: () => void }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MasteryRow[]>([]);
  const [vocabMap, setVocabMap] = useState<Map<string, VocabLite>>(new Map());

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: m } = await supabase
        .from("gaokao_user_mastery")
        .select("item_id, mastery_matrix, reached_master_at, lapses, correct_count, wrong_count, last_seen_at")
        .eq("user_id", user.id)
        .eq("item_type", "vocab")
        .limit(5000);
      const list = (m ?? []) as MasteryRow[];
      setRows(list);

      if (list.length) {
        const ids = list.map((r) => r.item_id);
        const { data: vs } = await supabase
          .from("gaokao_vocab")
          .select("id, word, meaning_cn")
          .in("id", ids);
        const map = new Map<string, VocabLite>();
        (vs ?? []).forEach((v) => map.set(v.id, v as VocabLite));
        setVocabMap(map);
      }
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const levelCounts: Record<MasteryLevel, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const familySum = { form: 0, meaning: 0, use: 0 };
    let scoreSum = 0;
    let lapsesSum = 0;

    rows.forEach((r) => {
      const matrix = r.mastery_matrix ?? {};
      const score = computeMasteryScore(matrix);
      const lvl = levelFromScore(score, !!r.reached_master_at);
      levelCounts[lvl] += 1;
      scoreSum += score;
      lapsesSum += r.lapses ?? 0;

      (Object.keys(FAMILY_KIND) as Array<"form" | "meaning" | "use">).forEach((fam) => {
        const kinds = FAMILY_KIND[fam];
        let s = 0;
        kinds.forEach((k) => (s += Math.min(FAMILY_CAP, matrix[k] ?? 0)));
        familySum[fam] += s / (kinds.length * FAMILY_CAP);
      });
    });

    const studied = rows.length;
    const untouched = TOTAL_VOCAB - studied;
    levelCounts[0] = untouched > 0 ? untouched : levelCounts[0];

    const avgFamily = {
      form: studied ? familySum.form / studied : 0,
      meaning: studied ? familySum.meaning / studied : 0,
      use: studied ? familySum.use / studied : 0,
    };

    return {
      studied,
      mastered: levelCounts[4],
      proficient: levelCounts[3],
      avgScore: studied ? scoreSum / studied : 0,
      lapsesSum,
      levelCounts,
      avgFamily,
    };
  }, [rows]);

  const lapsesTop = useMemo(() => {
    return [...rows]
      .filter((r) => r.lapses > 0)
      .sort((a, b) => (b.lapses ?? 0) - (a.lapses ?? 0))
      .slice(0, 10);
  }, [rows]);

  const masteredList = useMemo(() => {
    return rows
      .filter((r) => r.reached_master_at)
      .sort((a, b) => (b.reached_master_at ?? "").localeCompare(a.reached_master_at ?? ""))
      .slice(0, 12);
  }, [rows]);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> 加载掌握度数据…
        </div>
      </main>
    );
  }

  const totalForBar = TOTAL_VOCAB;
  const masterPct = Math.round((stats.mastered / TOTAL_VOCAB) * 100);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <button
        onClick={onExit}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回
      </button>

      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">📊 掌握度仪表盘</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          基于 Nation 词汇知识模型 + FSRS-4.5 复习算法的科学评估
        </p>
      </header>

      {/* Top-line KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard
          icon={<Target className="size-5" />}
          label="已学单词"
          value={`${stats.studied}`}
          sub={`/ ${TOTAL_VOCAB}`}
          tone="primary"
        />
        <KpiCard
          icon={<Trophy className="size-5" />}
          label="已掌握 👑"
          value={`${stats.mastered}`}
          sub={`${masterPct}%`}
          tone="amber"
        />
        <KpiCard
          icon={<AlertCircle className="size-5" />}
          label="累计错误"
          value={`${stats.lapsesSum}`}
          sub="次"
          tone="rose"
        />
      </div>

      {/* Level distribution */}
      <section className="mt-6 rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">5 级掌握度分布</h2>
          <span className="text-xs text-muted-foreground">共 {totalForBar} 词</span>
        </div>
        <div className="space-y-2">
          {([4, 3, 2, 1, 0] as MasteryLevel[]).map((lvl) => {
            const count = stats.levelCounts[lvl];
            const pct = (count / totalForBar) * 100;
            const meta = MASTERY_LABELS[lvl];
            return (
              <div key={lvl} className="flex items-center gap-3">
                <div className="w-20 shrink-0 text-sm font-semibold">
                  <span className={meta.color}>{meta.emoji} {meta.label}</span>
                </div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all",
                      lvl === 4 && "bg-gradient-to-r from-fuchsia-500 to-amber-400",
                      lvl === 3 && "bg-gradient-to-r from-amber-400 to-amber-300",
                      lvl === 2 && "bg-gradient-to-r from-emerald-500 to-emerald-400",
                      lvl === 1 && "bg-gradient-to-r from-blue-500 to-blue-400",
                      lvl === 0 && "bg-muted-foreground/30",
                    )}
                    style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%` }}
                  />
                  <span className="relative z-10 ml-3 text-xs font-bold leading-6 text-foreground/90 mix-blend-difference">
                    {count} 词
                  </span>
                </div>
                <div className="w-12 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                  {pct.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Family breakdown */}
      <section className="mt-4 rounded-2xl border bg-card p-5">
        <h2 className="mb-1 text-base font-bold">三维能力（已学单词均值）</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Form 形（拼写/听辨）· Meaning 义（中英互译/同义/释义）· Use 用（搭配/词性）
        </p>
        <div className="grid grid-cols-3 gap-3">
          <FamilyDial label="Form 形" value={stats.avgFamily.form} color="rose" />
          <FamilyDial label="Meaning 义" value={stats.avgFamily.meaning} color="emerald" />
          <FamilyDial label="Use 用" value={stats.avgFamily.use} color="indigo" />
        </div>
      </section>

      {/* Lapses hotlist */}
      {lapsesTop.length > 0 && (
        <section className="mt-4 rounded-2xl border bg-card p-5">
          <h2 className="mb-3 text-base font-bold">⚠️ 易错词 Top 10</h2>
          <ul className="divide-y">
            {lapsesTop.map((r) => {
              const v = vocabMap.get(r.item_id);
              if (!v) return null;
              return (
                <li key={r.item_id} className="flex items-center justify-between py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{v.word}</div>
                    <div className="truncate text-xs text-muted-foreground">{v.meaning_cn}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    错 {r.lapses} 次
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Mastered preview */}
      {masteredList.length > 0 && (
        <section className="mt-4 rounded-2xl border bg-gradient-to-br from-fuchsia-500/5 to-amber-400/5 p-5">
          <h2 className="mb-1 flex items-center gap-2 text-base font-bold">
            <Sparkles className="size-4 text-fuchsia-500" />
            最近达成「大师」的单词
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">
            通过 21 天保留检测 + 多维度评分 ≥ 0.85
          </p>
          <div className="flex flex-wrap gap-2">
            {masteredList.map((r) => {
              const v = vocabMap.get(r.item_id);
              if (!v) return null;
              return (
                <span
                  key={r.item_id}
                  className="rounded-full border border-fuchsia-500/40 bg-card px-3 py-1 text-xs font-bold"
                  title={v.meaning_cn}
                >
                  👑 {v.word}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {stats.studied === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-muted bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          先去学一组单词吧，数据会自动出现在这里 ✨
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onExit}>返回</Button>
      </div>
    </main>
  );
}

function KpiCard({
  icon, label, value, sub, tone,
}: { icon: React.ReactNode; label: string; value: string; sub?: string; tone: "primary" | "amber" | "rose" }) {
  return (
    <div className={cn(
      "rounded-2xl border p-4",
      tone === "primary" && "border-primary/30 bg-primary/5",
      tone === "amber" && "border-amber-500/30 bg-amber-500/5",
      tone === "rose" && "border-rose-500/30 bg-rose-500/5",
    )}>
      <div className={cn(
        "mb-1 inline-flex size-8 items-center justify-center rounded-lg",
        tone === "primary" && "bg-primary/15 text-primary",
        tone === "amber" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        tone === "rose" && "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      )}>{icon}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold tabular-nums">{value}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

function FamilyDial({
  label, value, color,
}: { label: string; value: number; color: "rose" | "emerald" | "indigo" }) {
  const pct = Math.round(value * 100);
  return (
    <div className="rounded-xl border bg-background p-3 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn(
        "mt-1 text-2xl font-extrabold tabular-nums",
        color === "rose" && "text-rose-600 dark:text-rose-400",
        color === "emerald" && "text-emerald-600 dark:text-emerald-400",
        color === "indigo" && "text-indigo-600 dark:text-indigo-400",
      )}>
        {pct}%
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full",
            color === "rose" && "bg-rose-500",
            color === "emerald" && "bg-emerald-500",
            color === "indigo" && "bg-indigo-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
