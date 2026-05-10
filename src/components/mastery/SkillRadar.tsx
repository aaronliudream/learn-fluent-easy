import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

type Row = {
  skill: string;
  total: number;
  master_count: number;
  fluent_count: number;
  weak_count: number;
  none_count: number;
  score_pct: number | null;
  accuracy_pct: number | null;
};

const SKILL_LABELS: Record<string, string> = {
  grammar: "语法",
  reading: "阅读",
  vocab: "词汇",
  listening: "听力",
  writing: "写作",
  cloze: "完形",
  speaking: "口语",
  lesson: "课程",
};

const SKILL_ORDER = ["grammar", "reading", "vocab", "listening", "writing", "cloze", "speaking"];

/**
 * AI 能力雷达图：从 mastery_by_skill 视图实时聚合，
 * 显示当前用户在 7 大维度（语法/阅读/词汇/听力/写作/完形/口语）的掌握度。
 * score_pct = (master + 0.5*fluent) / total，0–100。
 */
export function SkillRadar() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) { setRows([]); setLoading(false); }
        return;
      }
      const { data } = await supabase
        .from("mastery_by_skill")
        .select("skill,total,master_count,fluent_count,weak_count,none_count,score_pct,accuracy_pct")
        .eq("user_id", user.id);
      if (!cancelled) {
        setRows((data ?? []) as Row[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="h-64 animate-pulse rounded-2xl bg-muted/40" />
      </div>
    );
  }

  const byKey = new Map(rows?.map((r) => [r.skill, r]) ?? []);
  const data = SKILL_ORDER.map((k) => {
    const r = byKey.get(k);
    return {
      skill: SKILL_LABELS[k] ?? k,
      key: k,
      score: r ? Number(r.score_pct ?? 0) : 0,
      accuracy: r ? Number(r.accuracy_pct ?? 0) : 0,
      total: r?.total ?? 0,
    };
  });

  const hasAny = data.some((d) => d.total > 0);
  // 找出最弱的 3 个有数据的维度
  const weakest = data
    .filter((d) => d.total > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  if (!hasAny) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-6 text-center">
        <Sparkles className="mx-auto size-8 text-muted-foreground" />
        <div className="mt-3 text-sm font-bold">AI 能力雷达图</div>
        <div className="mt-1 text-xs text-muted-foreground">
          完成第一道题，雷达图就会出现 ✨
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">AI · 能力雷达</div>
          <h3 className="mt-0.5 text-base font-extrabold">你的 7 维英语能力地图</h3>
        </div>
      </div>

      <div className="mt-3 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="78%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              formatter={(value: number, name: string, p: any) => {
                if (name === "掌握度") return [`${Number(value).toFixed(0)}% (共 ${p?.payload?.total ?? 0} 项)`, name];
                return [`${Number(value).toFixed(0)}%`, name];
              }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Radar
              name="掌握度"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.35}
            />
            <Radar
              name="正确率"
              dataKey="accuracy"
              stroke="hsl(142 76% 45%)"
              fill="hsl(142 76% 45%)"
              fillOpacity={0.12}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {weakest.length > 0 && (
        <div className="mt-3 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-4 dark:from-rose-500/10 dark:to-orange-500/10">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-400">
            🎯 今日待突破
          </div>
          <ul className="mt-2 space-y-1.5">
            {weakest.map((w) => (
              <li key={w.key} className="flex items-center justify-between text-sm">
                <span className="font-bold">{w.skill}</span>
                <span className="flex items-center gap-2">
                  <span className="tabular-nums text-rose-600 dark:text-rose-400">{w.score.toFixed(0)}%</span>
                  <span className="text-[11px] text-muted-foreground">/ {w.total} 项</span>
                  <Link
                    to={`/learning-center?skill=${w.key}`}
                    className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-bold text-background hover:opacity-90"
                  >
                    去练
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-2.5 rounded-sm bg-primary/60" /> 掌握度 = 已掌握 + ½ 熟练
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2.5 rounded-sm" style={{ background: "hsl(142 76% 45%)" }} /> 正确率 = 累计答对 / 答过
        </span>
      </div>
    </section>
  );
}