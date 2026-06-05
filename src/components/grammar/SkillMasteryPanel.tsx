import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = { name: string; score: number; attempts: number };

export function SkillMasteryPanel({ pointCode }: { pointCode: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid) { if (!cancelled) setRows([]); return; }

        const { data: pts } = await supabase
          .from("junior_grammar_points").select("id").eq("code", pointCode).maybeSingle();
        if (!pts) { if (!cancelled) setRows([]); return; }

        const { data: skills } = await supabase
          .from("junior_skills").select("id, name").eq("point_id", pts.id);
        if (!skills?.length) { if (!cancelled) setRows([]); return; }

        const ids = skills.map((s: any) => s.id);
        const { data: mastery } = await supabase
          .from("user_skill_mastery")
          .select("skill_id, score, attempts")
          .eq("user_id", uid)
          .in("skill_id", ids);

        const byId: Record<string, any> = {};
        (mastery ?? []).forEach((m: any) => { byId[m.skill_id] = m; });

        const merged: Row[] = skills.map((s: any) => ({
          name: s.name,
          score: Math.round(byId[s.id]?.score ?? 0),
          attempts: byId[s.id]?.attempts ?? 0,
        })).sort((a, b) => a.score - b.score);

        if (!cancelled) setRows(merged);
      } catch {
        if (!cancelled) setRows([]);
      }
    })();
    return () => { cancelled = true; };
  }, [pointCode]);

  if (!rows || rows.length === 0) return null;

  return (
    <div style={{ margin: "16px 0", padding: "16px 18px", borderRadius: 16, background: "#1c2433", color: "#fff" }}>
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>本考点 · 技能掌握度(从弱到强)</div>
      {rows.map((r, i) => {
        const practiced = r.attempts > 0;
        const color = !practiced ? "#8a8f99" : r.score >= 90 ? "#5fc28a" : r.score >= 60 ? "#d9b877" : "#e07a7a";
        return (
          <div key={i} style={{ marginBottom: i === rows.length - 1 ? 0 : 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span>{r.name}</span>
              <span style={{ color }}>{practiced ? `${r.score}%` : "未练习"}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,.15)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${r.score}%`, background: color, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
