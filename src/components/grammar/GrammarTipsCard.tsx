import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TipContent = {
  title?: string;
  intro?: string;
  table?: { headers: string[]; rows: string[][] }; // 通用速查表(2列:用法/句型 → 例句/规则)
  specialRules?: { rule: string; mark?: string }[];
  why?: string[];
  gaokaoPoints?: string[];
  examVsReal?: { exam: string; real: string; note?: string }[];
};

/**
 * 📖 语法小知识卡片(进入综合测试上方,可跳过):读 junior_grammar_tips(volume+unit),
 * 渲染速查表 / 特例 / 为什么 / 高考考点 / 「考试vs真实」对照。初中高中通用(挂 GrammarStage)。
 * 无内容(该单元还没写 grammar_tips)→ 不渲染(纯加法,不挡做题)。
 */
export default function GrammarTipsCard({ volume, unit, publisher }: { volume?: string; unit?: string; publisher?: string | null }) {
  const [tip, setTip] = useState<TipContent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!volume || !unit) return;
    let cancelled = false;
    (async () => {
      let q = supabase
        .from("junior_grammar_tips")
        .select("content")
        .eq("volume", volume)
        .eq("unit", unit);
      if (publisher) q = q.eq("publisher", publisher); // /gaokao→'pep';/junior→不传(行为不变)
      const { data } = await q.maybeSingle();
      if (!cancelled) setTip((data?.content as TipContent) ?? null);
    })();
    return () => { cancelled = true; };
  }, [volume, unit, publisher]);

  if (!tip) return null;

  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <BookOpen className="size-4 shrink-0 text-amber-600" />
        <span className="flex-1 text-sm font-extrabold text-amber-800 dark:text-amber-300">
          📖 语法小知识{tip.title ? `:${tip.title}` : ""}
        </span>
        <span className="text-[11px] text-amber-600">浏览后做题更有把握</span>
        {open ? <ChevronUp className="size-4 text-amber-600" /> : <ChevronDown className="size-4 text-amber-600" />}
      </button>

      {open && (
        <div className="space-y-3 px-4 pb-4 text-sm">
          {tip.intro && <p className="text-[#5C5751] dark:text-muted-foreground">{tip.intro}</p>}

          {tip.table && tip.table.rows.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-amber-200 dark:border-amber-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-100/70 dark:bg-amber-950/40">
                  <tr>{(tip.table.headers ?? []).map((h, i) => <th key={i} className="px-3 py-1.5 font-bold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {tip.table.rows.map((row, i) => (
                    <tr key={i} className="border-t border-amber-100 dark:border-amber-900/30">
                      {row.map((cell, j) => (
                        <td key={j} className={`px-3 py-1.5 ${j === 1 ? "font-bold text-amber-700 dark:text-amber-300" : ""}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tip.specialRules && tip.specialRules.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-extrabold text-foreground">特殊规则(重点)</h4>
              {tip.specialRules.map((r, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-1.5 dark:bg-card">
                  <span className="font-bold text-foreground">{r.rule}</span>
                  {r.mark && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">{r.mark}</span>}
                </div>
              ))}
            </div>
          )}

          {tip.why && tip.why.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-extrabold text-foreground">为什么</h4>
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-[#5C5751] dark:text-muted-foreground">
                {tip.why.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {tip.gaokaoPoints && tip.gaokaoPoints.length > 0 && (
            <div>
              <h4 className="mb-1 flex items-center gap-1 text-xs font-extrabold text-foreground"><Sparkles className="size-3 text-amber-500" /> 高考考点</h4>
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-[#5C5751] dark:text-muted-foreground">
                {tip.gaokaoPoints.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}

          {tip.examVsReal && tip.examVsReal.length > 0 && (
            <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-900/40 dark:bg-sky-950/20">
              <h4 className="mb-2 text-xs font-extrabold text-sky-800 dark:text-sky-300">📌 考试要这么填,但真实英语更灵活</h4>
              <div className="space-y-2">
                {tip.examVsReal.map((e, i) => (
                  <div key={i} className="text-xs">
                    <div><span className="font-bold text-emerald-700 dark:text-emerald-400">考试 ✅ </span>{e.exam}</div>
                    <div><span className="font-bold text-sky-700 dark:text-sky-400">日常也说 </span>{e.real}</div>
                    {e.note && <div className="text-[11px] text-muted-foreground">{e.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
