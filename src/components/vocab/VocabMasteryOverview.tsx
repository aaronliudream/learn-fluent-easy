import { BarChart3, Crown, Sparkles, Clock, Flame } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const isChineseUi = (lang: string) => lang === "zh" || lang === "zh-TW";

export type VocabMasteryOverviewProps = {
  total: number;
  mastered: number;
  studied: number;
  dueCount: number;
  avgStability: number;
  loading?: boolean;
};

function MiniStat({
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
        {hint && (
          <span className="ml-0.5 text-[9px] font-bold text-muted-foreground">{hint}</span>
        )}
      </div>
      <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

/** Shared FSRS mastery summary — used on junior & gaokao vocab hubs. */
export default function VocabMasteryOverview({
  total,
  mastered,
  studied,
  dueCount,
  avgStability,
  loading,
}: VocabMasteryOverviewProps) {
  const { lang } = useI18n();
  const zh = isChineseUi(lang);

  const masteredPct = total > 0 ? Math.round((mastered / total) * 1000) / 10 : 0;
  const studiedPct = total > 0 ? Math.round((studied / total) * 1000) / 10 : 0;
  const learningPct =
    total > 0 ? Math.max(0, Math.round(((studiedPct - masteredPct) * 10) / 10)) : 0;

  if (loading) {
    return (
      <section className="mb-5 rounded-2xl bg-card p-4 shadow-tile animate-pulse">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="mt-3 h-3 w-full rounded bg-muted" />
        <div className="mt-3 h-12 w-full rounded bg-muted" />
      </section>
    );
  }

  return (
    <section className="mb-5 rounded-2xl bg-card p-4 shadow-tile">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-fuchsia-600" />
          <h3 className="text-sm font-bold text-foreground">
            {zh ? "我的词汇掌握度" : "My vocabulary mastery"}
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {zh ? "FSRS 遗忘曲线 · 多维评判" : "FSRS review curve · multi-signal scoring"}
        </span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <div className="text-3xl font-extrabold leading-none text-fuchsia-600">
          {mastered.toLocaleString()}
        </div>
        <div className="pb-1 text-xs text-muted-foreground">
          / {total.toLocaleString()}{" "}
          {zh
            ? `词彻底掌握 (${masteredPct}%)`
            : `words mastered (${masteredPct}%)`}
        </div>
      </div>
      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="bg-gradient-to-r from-fuchsia-500 to-pink-500"
          style={{ width: `${total ? (mastered / total) * 100 : 0}%` }}
        />
        <div
          className="bg-gradient-to-r from-amber-400 to-orange-400"
          style={{
            width: `${total ? (Math.max(0, studied - mastered) / total) * 100 : 0}%`,
          }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-fuchsia-500" />{" "}
          {zh ? "掌握" : "Mastered"} {masteredPct}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-amber-400" />{" "}
          {zh ? "学习中" : "Learning"} {learningPct}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-muted-foreground/30" />{" "}
          {zh ? "未开始" : "Not started"}{" "}
          {Math.max(0, Math.round((100 - studiedPct) * 10) / 10)}%
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        <MiniStat
          icon={<Crown className="size-3.5" />}
          label={zh ? "👑 掌握" : "👑 Mastered"}
          value={mastered}
          tone="from-fuchsia-500 to-pink-500"
        />
        <MiniStat
          icon={<Sparkles className="size-3.5" />}
          label={zh ? "🌟 学习中" : "🌟 Learning"}
          value={Math.max(0, studied - mastered)}
          tone="from-amber-400 to-orange-500"
        />
        <MiniStat
          icon={<Clock className="size-3.5" />}
          label={zh ? "⏰ 待复习" : "⏰ Due"}
          value={dueCount}
          tone="from-blue-500 to-indigo-600"
        />
        <MiniStat
          icon={<Flame className="size-3.5" />}
          label={zh ? "📈 平均稳定" : "📈 Avg stability"}
          value={Math.round(avgStability * 10) / 10}
          tone="from-emerald-500 to-teal-500"
          hint={zh ? "天" : "d"}
        />
      </div>
    </section>
  );
}
