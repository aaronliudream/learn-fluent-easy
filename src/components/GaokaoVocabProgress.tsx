import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, Sparkles, Clock, Flame, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
      const { data: rows, error } = await supabase.rpc("get_vocab_mastery_overview");
      if (cancel) return;
      if (!error && rows && rows.length > 0) setData(rows[0] as Overview);
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
      </div>
    );
  }

  if (!data || data.total_words === 0) return null;

  const total = data.total_words;
  const learning = data.proficient + data.familiar + data.encountered;
  const masteredPct = Math.round((data.mastered / total) * 1000) / 10;
  const learningPct = Math.round((learning / total) * 1000) / 10;
  const untouchedPct = Math.round((data.untouched / total) * 1000) / 10;

  return (
    <div className="rounded-2xl bg-card p-4 shadow-tile">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-fuchsia-600" />
          <h3 className="text-sm font-bold text-foreground">我的词汇掌握度</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">FSRS 遗忘曲线 · 多维评判</span>
      </div>

      {/* Big number */}
      <div className="mt-3 flex items-end gap-2">
        <div className="text-3xl font-extrabold leading-none text-fuchsia-600">
          {data.mastered.toLocaleString()}
        </div>
        <div className="pb-1 text-xs text-muted-foreground">
          / {total.toLocaleString()} 词彻底掌握 ({masteredPct}%)
        </div>
      </div>

      {/* Stacked progress bar */}
      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="bg-gradient-to-r from-fuchsia-500 to-pink-500 transition-all"
          style={{ width: `${(data.mastered / total) * 100}%` }}
          title={`彻底掌握 ${data.mastered}`}
        />
        <div
          className="bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
          style={{ width: `${(learning / total) * 100}%` }}
          title={`学习中 ${learning}`}
        />
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-fuchsia-500" /> 掌握 {masteredPct}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-amber-400" /> 学习中 {learningPct}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-muted-foreground/30" /> 未开始 {untouchedPct}%
        </span>
      </div>

      {/* 4 stat tiles */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <StatTile
          icon={<Crown className="size-3.5" />}
          label="👑 彻底掌握"
          value={data.mastered}
          tone="from-fuchsia-500 to-pink-500"
          hint="≥21天保留检查"
        />
        <StatTile
          icon={<Sparkles className="size-3.5" />}
          label="🌟 学习中"
          value={learning}
          tone="from-amber-400 to-orange-500"
          hint="初识 / 熟悉 / 熟练"
        />
        <StatTile
          icon={<BookOpen className="size-3.5" />}
          label="💤 未开始"
          value={data.untouched}
          tone="from-slate-400 to-slate-500"
          hint={`还有 ${data.untouched} 词`}
        />
        <StatTile
          icon={<Clock className="size-3.5" />}
          label="⏰ 7天内复习"
          value={data.due_within_7d}
          tone="from-blue-500 to-indigo-600"
          hint={`含已掌握 ${data.mastered_due_within_7d}`}
        />
      </div>

      {/* Detail breakdown */}
      <div className="mt-3 rounded-xl bg-muted/40 p-2.5 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>🌟 熟练 <b className="text-foreground">{data.proficient}</b></span>
          <span>🌳 熟悉 <b className="text-foreground">{data.familiar}</b></span>
          <span>🌿 初识 <b className="text-foreground">{data.encountered}</b></span>
          {data.avg_stability_days > 0 && (
            <span>📈 平均记忆稳定 <b className="text-foreground">{data.avg_stability_days.toFixed(1)} 天</b></span>
          )}
          {data.total_lapses > 0 && (
            <span className="flex items-center gap-0.5">
              <Flame className="size-3 text-orange-500" /> 累计遗忘 <b className="text-foreground">{data.total_lapses}</b>
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      {data.due_today > 0 ? (
        <Link
          to="/gaokao/vocab"
          className="mt-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-3 text-white shadow-tile transition hover:-translate-y-0.5"
        >
          <div>
            <div className="text-sm font-bold">⏰ 今日有 {data.due_today} 词到期复习</div>
            <div className="text-[11px] opacity-90">遗忘曲线提醒：现在复习记得最牢</div>
          </div>
          <span className="text-xs font-bold">去复习 →</span>
        </Link>
      ) : (
        <Link
          to="/gaokao/vocab"
          className="mt-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 p-3 text-white shadow-tile transition hover:-translate-y-0.5"
        >
          <div>
            <div className="text-sm font-bold">
              {data.untouched > 0 ? `开始学习 ${data.untouched} 个新词` : "继续巩固已学词汇"}
            </div>
            <div className="text-[11px] opacity-90">
              {data.untouched > 0 ? "按词频从最高频开始" : "全部词汇都在遗忘曲线监控中"}
            </div>
          </div>
          <span className="text-xs font-bold">开始 →</span>
        </Link>
      )}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/40 p-2 text-center">
      <div
        className={`mx-auto flex size-7 items-center justify-center rounded-lg bg-gradient-to-br ${tone} text-white`}
      >
        {icon}
      </div>
      <div className="mt-1 text-base font-extrabold leading-none text-foreground">
        {value.toLocaleString()}
      </div>
      <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{label}</div>
      {hint && <div className="mt-0.5 text-[9px] leading-tight text-muted-foreground/70">{hint}</div>}
    </div>
  );
}