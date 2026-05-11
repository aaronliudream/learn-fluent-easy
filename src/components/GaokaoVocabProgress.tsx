import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Sparkles, Clock, Flame, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  computeMasteryScore,
  levelFromScore,
  type MasteryLevel,
  type MasteryMatrix } from
"@/lib/masteryScore";

const TOTAL_VOCAB = 3500;

type MasteryRow = {
  mastery_matrix: MasteryMatrix | null;
  reached_master_at: string | null;
  lapses: number | null;
  stability: number | null;
  due_at: string | null;
};

interface Overview {
  total_words: number;
  mastered: number;
  proficient: number;
  familiar: number;
  encountered: number;
  untouched: number;
  due_today: number;
  due_within_7d: number;
  mastered_due_within_7d: number;
  avg_stability_days: number;
  total_lapses: number;
}

export function GaokaoVocabProgress() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancel) {
          setData({
            total_words: TOTAL_VOCAB,
            mastered: 0,
            proficient: 0,
            familiar: 0,
            encountered: 0,
            untouched: TOTAL_VOCAB,
            due_today: 0,
            due_within_7d: 0,
            mastered_due_within_7d: 0,
            avg_stability_days: 0,
            total_lapses: 0
          });
          setLoading(false);
        }
        return;
      }

      // Use the SAME source + algorithm as MasteryDashboard, so numbers match exactly.
      const { data: rows } = await supabase.
      from("gaokao_user_mastery").
      select("mastery_matrix, reached_master_at, lapses, stability, due_at").
      eq("user_id", user.id).
      eq("item_type", "vocab").
      limit(5000);

      if (cancel) return;
      const list = (rows ?? []) as MasteryRow[];

      const levelCounts: Record<MasteryLevel, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
      let lapsesSum = 0;
      let stabilitySum = 0;
      let stabilityCount = 0;
      let dueToday = 0;
      let due7d = 0;
      let masteredDue7d = 0;
      const now = Date.now();
      const in7d = now + 7 * 24 * 3600 * 1000;

      list.forEach((r) => {
        const matrix = r.mastery_matrix ?? {};
        const score = computeMasteryScore(matrix);
        const lvl = levelFromScore(score, !!r.reached_master_at);
        levelCounts[lvl] += 1;
        lapsesSum += r.lapses ?? 0;
        if (r.stability != null && r.stability > 0) {
          stabilitySum += r.stability;
          stabilityCount += 1;
        }
        if (r.due_at) {
          const t = new Date(r.due_at).getTime();
          if (t <= now) dueToday += 1;
          if (t <= in7d) {
            due7d += 1;
            if (lvl === 4) masteredDue7d += 1;
          }
        }
      });

      const studied = list.length;
      const untouched = Math.max(0, TOTAL_VOCAB - studied);
      // Align with dashboard: untouched fills L0 if no rows fall there.
      levelCounts[0] = untouched > 0 ? untouched : levelCounts[0];

      setData({
        total_words: TOTAL_VOCAB,
        mastered: levelCounts[4],
        proficient: levelCounts[3],
        familiar: levelCounts[2],
        encountered: levelCounts[1],
        untouched,
        due_today: dueToday,
        due_within_7d: due7d,
        mastered_due_within_7d: masteredDue7d,
        avg_stability_days: stabilityCount > 0 ? stabilitySum / stabilityCount : 0,
        total_lapses: lapsesSum
      });
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-card p-4 shadow-tile animate-pulse">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="mt-3 h-3 w-full rounded bg-muted" />
        <div className="mt-3 h-12 w-full rounded bg-muted" />
      </div>);

  }

  if (!data || data.total_words === 0) return null;

  const total = data.total_words;
  const learning = data.proficient + data.familiar + data.encountered;
  const masteredPct = Math.round(data.mastered / total * 1000) / 10;
  const learningPct = Math.round(learning / total * 1000) / 10;
  const untouchedPct = Math.round(data.untouched / total * 1000) / 10;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-tile">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-fuchsia-600" />
          <h3 className="text-sm font-bold text-foreground"><T>我的词汇掌握度</T></h3>
        </div>
        <span className="text-[10px] text-muted-foreground"><T>FSRS 遗忘曲线 · 多维评判</T></span>
      </div>

      {/* Big number */}
      <div className="mt-3 flex items-end gap-2">
        <div className="text-3xl font-extrabold leading-none text-fuchsia-600">
          {data.mastered.toLocaleString()}
        </div>
        <div className="pb-1 text-xs text-muted-foreground">
          / {total.toLocaleString()} <T>词彻底掌握 (</T>{masteredPct}%)
        </div>
      </div>

      {/* Stacked progress bar */}
      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="bg-gradient-to-r from-fuchsia-500 to-pink-500 transition-all"
          style={{ width: `${data.mastered / total * 100}%` }}
          title={`彻底掌握 ${data.mastered}`} />
        
        <div
          className="bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
          style={{ width: `${learning / total * 100}%` }}
          title={`学习中 ${learning}`} />
        
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-fuchsia-500" /> <T>掌握</T> {masteredPct}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-amber-400" /> <T>学习中</T> {learningPct}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-muted-foreground/30" /> <T>未开始</T> {untouchedPct}%
        </span>
      </div>

      {/* 4 stat tiles */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <StatTile
          icon={<Crown className="size-3.5" />}
          label="👑 彻底掌握"
          value={data.mastered}
          tone="from-fuchsia-500 to-pink-500"
          hint="≥21天保留检查" />
        
        <StatTile
          icon={<Sparkles className="size-3.5" />}
          label="🌟 学习中"
          value={learning}
          tone="from-amber-400 to-orange-500"
          hint="初识 / 熟悉 / 熟练" />
        
        <StatTile
          icon={<BookOpen className="size-3.5" />}
          label="💤 未开始"
          value={data.untouched}
          tone="from-slate-400 to-slate-500"
          hint={`还有 ${data.untouched} 词`} />
        
        <StatTile
          icon={<Clock className="size-3.5" />}
          label="⏰ 7天内复习"
          value={data.due_within_7d}
          tone="from-blue-500 to-indigo-600"
          hint={`含已掌握 ${data.mastered_due_within_7d}`} />
        
      </div>

      {/* Detail breakdown */}
      <div className="mt-3 rounded-xl bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span><T>🌟 熟练</T> <b className="text-foreground">{data.proficient}</b></span>
          <span><T>🌳 熟悉</T> <b className="text-foreground">{data.familiar}</b></span>
          <span><T>🌿 初识</T> <b className="text-foreground">{data.encountered}</b></span>
          {data.avg_stability_days > 0 &&
          <span><T>📈 平均记忆稳定</T> <b className="text-foreground">{data.avg_stability_days.toFixed(1)} <T>天</T></b></span>
          }
          {data.total_lapses > 0 &&
          <span className="flex items-center gap-0.5">
              <Flame className="size-3 text-orange-500" /> <T>累计遗忘</T> <b className="text-foreground">{data.total_lapses}</b>
            </span>
          }
        </div>
      </div>

      {/* CTA */}
      {data.due_today > 0 ?
      <Link
        to="/gaokao/vocab"
        className="mt-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-3 text-white shadow-tile transition hover:-translate-y-0.5">
        
          <div>
            <div className="text-sm font-bold"><T>⏰ 今日有</T> {data.due_today} <T>词到期复习</T></div>
            <div className="text-[11px] opacity-90"><T>遗忘曲线提醒：现在复习记得最牢</T></div>
          </div>
          <span className="text-xs font-bold"><T>去复习 →</T></span>
        </Link> :

      <Link
        to="/gaokao/vocab"
        className="mt-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 p-3 text-white shadow-tile transition hover:-translate-y-0.5">
        
          <div>
            <div className="text-sm font-bold">
              {data.untouched > 0 ? `开始学习 ${data.untouched} 个新词` : "继续巩固已学词汇"}
            </div>
            <div className="text-[11px] opacity-90">
              {data.untouched > 0 ? "按词频从最高频开始" : "全部词汇都在遗忘曲线监控中"}
            </div>
          </div>
          <span className="text-xs font-bold"><T>开始 →</T></span>
        </Link>
      }
    </div>);

}

function StatTile({
  icon,
  label,
  value,
  tone,
  hint






}: {icon: React.ReactNode;label: string;value: number;tone: string;hint?: string;}) {
  return (
    <div className="rounded-xl bg-muted/40 p-2 text-center">
      <div
        className={`mx-auto flex size-7 items-center justify-center rounded-lg bg-gradient-to-br ${tone} text-white`}>
        
        {icon}
      </div>
      <div className="mt-1 text-base font-extrabold leading-none text-foreground">
        {value.toLocaleString()}
      </div>
      <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{label}</div>
      {hint && <div className="mt-0.5 text-[9px] leading-tight text-muted-foreground/70">{hint}</div>}
    </div>);

}