import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, TrendingDown, Minus, BookOpen, Target, Clock, Flame, AlertTriangle, GraduationCap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { T, useT } from "@/i18n/T";

type Words = { mastered: number; proficient: number; familiar: number; touched: number };
type Dash = {
  minutes_total: number; minutes_7d: number;
  minutes_by_segment: { primary: number; junior: number; gaokao: number };
  primary: { words: Words; sessions: number; accuracy: number; reading_done: number; active_days: number };
  junior:  { words: Words; sessions: number; accuracy: number; reading_correct: number; reading_attempts: number; active_days: number };
  gaokao:  { words: Words; attempts: number; correct: number; active_days: number };
  weakness: any[];
};

function summarize(d: Dash) {
  const m = d.minutes_by_segment;
  const minutes = m.primary + m.junior + m.gaokao;
  const wordsMastered = d.primary.words.mastered + d.junior.words.mastered + d.gaokao.words.mastered;
  const wordsTouched =
    d.primary.words.mastered + d.primary.words.proficient + d.primary.words.familiar + d.primary.words.touched +
    d.junior.words.mastered + d.junior.words.proficient + d.junior.words.familiar + d.junior.words.touched +
    d.gaokao.words.mastered + d.gaokao.words.proficient + d.gaokao.words.familiar + d.gaokao.words.touched;
  const attempts = d.primary.sessions + d.junior.sessions + d.gaokao.attempts;
  const correct =
    Math.round(d.primary.sessions * (d.primary.accuracy ?? 0)) +
    Math.round(d.junior.sessions * (d.junior.accuracy ?? 0)) +
    d.gaokao.correct;
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  const activeDays = Math.max(d.primary.active_days, d.junior.active_days, d.gaokao.active_days);
  const reading = d.primary.reading_done + d.junior.reading_correct;
  const weakness = d.weakness?.length ?? 0;
  return { minutes, wordsMastered, wordsTouched, attempts, correct, accuracy, activeDays, reading, weakness };
}

export default function ProgressSnapshot() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [thisWeek, setThisWeek] = useState<ReturnType<typeof summarize> | null>(null);
  const [lastWeek, setLastWeek] = useState<ReturnType<typeof summarize> | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user?.id) { setLoading(false); return; }
      const [d7, d14] = await Promise.all([
        supabase.rpc("get_parent_dashboard", { _days: 7 }),
        supabase.rpc("get_parent_dashboard", { _days: 14 }),
      ]);
      if (d7.data && d14.data) {
        const s7 = summarize(d7.data as unknown as Dash);
        const s14 = summarize(d14.data as unknown as Dash);
        // previous week (days 8-14) ≈ s14 - s7 for cumulative-style metrics; for accuracy, recompute
        const prevAttempts = Math.max(0, s14.attempts - s7.attempts);
        const prevCorrect = Math.max(0, s14.correct - s7.correct);
        const prev = {
          ...s14,
          minutes: Math.max(0, s14.minutes - s7.minutes),
          wordsMastered: Math.max(0, s14.wordsMastered - s7.wordsMastered),
          attempts: prevAttempts,
          correct: prevCorrect,
          accuracy: prevAttempts > 0 ? Math.round((prevCorrect / prevAttempts) * 100) : 0,
          reading: Math.max(0, s14.reading - s7.reading),
          activeDays: Math.max(0, s14.activeDays - s7.activeDays),
        };
        setThisWeek(s7);
        setLastWeek(prev);
      }
      setLoading(false);
    })();
  }, []);

  const cards = useMemo(() => {
    if (!thisWeek || !lastWeek) return [];
    return [
      { key: "minutes",   label: t("学习时长"),   icon: Clock,         unit: t("分钟"), color: "from-emerald-500 to-teal-500",   higherBetter: true,  now: thisWeek.minutes,       prev: lastWeek.minutes },
      { key: "words",     label: t("新掌握单词"), icon: BookOpen,      unit: t("个"),   color: "from-sky-500 to-blue-500",       higherBetter: true,  now: thisWeek.wordsMastered, prev: lastWeek.wordsMastered },
      { key: "attempts",  label: t("做题数量"),   icon: Target,        unit: t("题"),   color: "from-violet-500 to-fuchsia-500", higherBetter: true,  now: thisWeek.attempts,      prev: lastWeek.attempts },
      { key: "accuracy",  label: t("正确率"),     icon: Sparkles,      unit: "%",      color: "from-amber-500 to-orange-500",   higherBetter: true,  now: thisWeek.accuracy,      prev: lastWeek.accuracy },
      { key: "active",    label: t("活跃天数"),   icon: Flame,         unit: t("天"),   color: "from-rose-500 to-pink-500",      higherBetter: true,  now: thisWeek.activeDays,    prev: lastWeek.activeDays },
      { key: "weakness",  label: t("待攻克薄弱"), icon: AlertTriangle, unit: t("题"),   color: "from-slate-500 to-zinc-500",     higherBetter: false, now: thisWeek.weakness,      prev: lastWeek.weakness },
    ];
  }, [thisWeek, lastWeek, t]);

  if (loading) {
    return (
      <section className="mb-4 rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-sky-50 p-6 dark:border-emerald-900 dark:from-emerald-950/30 dark:to-sky-950/20">
        <div className="flex items-center justify-center text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin" /> <T>加载本周对比…</T></div>
      </section>
    );
  }
  if (!thisWeek) return null;

  // Headline summary
  const improved = cards.filter(c => {
    const delta = c.now - c.prev;
    return c.higherBetter ? delta > 0 : delta < 0;
  }).length;
  const declined = cards.filter(c => {
    const delta = c.now - c.prev;
    return c.higherBetter ? delta < 0 : delta > 0;
  }).length;

  const headline =
    improved > declined ? { tone: "emerald", emoji: "📈", text: t("本周明显进步") } :
    improved < declined ? { tone: "rose",    emoji: "📉", text: t("本周略有下滑，建议陪练") } :
                          { tone: "amber",   emoji: "➖", text: t("本周与上周持平") };

  return (
    <section className={cn(
      "mb-4 overflow-hidden rounded-3xl border-2 shadow-sm",
      headline.tone === "emerald" && "border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:border-emerald-900 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-sky-950/20",
      headline.tone === "rose"    && "border-rose-300 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 dark:border-rose-900 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-amber-950/20",
      headline.tone === "amber"   && "border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:border-amber-900 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/20",
    )}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/40 bg-white/40 px-5 py-3 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-5 text-violet-600" />
          <h2 className="text-base font-extrabold md:text-lg"><T>📊 本周 vs 上周 · 一目了然</T></h2>
        </div>
        <div className={cn(
          "rounded-full px-3 py-1 text-xs font-extrabold",
          headline.tone === "emerald" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
          headline.tone === "rose"    && "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
          headline.tone === "amber"   && "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
        )}>
          {headline.emoji} {headline.text} · <T>↑</T>{improved} <T>·</T> <T>↓</T>{declined}
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 md:p-5">
        {cards.map(c => <DeltaCard key={c.key} {...c} />)}
      </div>
      <div className="border-t border-white/40 bg-white/40 px-5 py-2 text-[11px] text-muted-foreground dark:bg-black/20">
        💡 <T>对比口径：本周（近 7 天）vs 上周（前 7 天）。所有学段（小学/初中/高中）合并统计。</T>
      </div>
    </section>
  );
}

function DeltaCard({
  label, icon: Icon, unit, color, higherBetter, now, prev,
}: {
  label: string; icon: any; unit: string; color: string; higherBetter: boolean; now: number; prev: number;
}) {
  const delta = now - prev;
  const pct = prev > 0 ? Math.round((delta / prev) * 100) : (now > 0 ? 100 : 0);
  const good = higherBetter ? delta > 0 : delta < 0;
  const bad  = higherBetter ? delta < 0 : delta > 0;
  const flat = delta === 0;

  return (
    <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-black/30">
      <div className="mb-1.5 flex items-center justify-between">
        <div className={cn("inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white", color)}>
          <Icon className="size-3" /> {label}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black tabular-nums md:text-4xl">{now}</span>
        <span className="text-base font-bold text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground"><T>上周</T> <b className="text-foreground">{prev}{unit}</b></span>
        <span className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-extrabold",
          good && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
          bad  && "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
          flat && "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
        )}>
          {good && <TrendingUp className="size-3.5" />}
          {bad  && <TrendingDown className="size-3.5" />}
          {flat && <Minus className="size-3.5" />}
          {flat ? "持平" : `${delta > 0 ? "+" : ""}${delta}${unit}`}
          {!flat && prev > 0 && <span className="opacity-80">({pct > 0 ? "+" : ""}{pct}%)</span>}
        </span>
      </div>
    </div>
  );
}
