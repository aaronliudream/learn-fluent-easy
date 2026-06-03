import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * 「按考点抽题」入口区块 —— 列出指定分类(按年级过滤)的考点,链到统一抽题页
 * /junior/kp/:id/practice。复用于阅读页(reading+cloze)与词汇页(vocab_comm)。
 *
 * 该年级下无对应分类考点时整块不渲染(避免空区/死入口)。
 */
type Kp = { id: string; code: string; title: string; grade: number };

export function JuniorKpPracticeSection({
  categoryCodes,
  gradeNum,
  title,
  subtitle,
}: {
  categoryCodes: string[];
  gradeNum: number | null;
  title: string;
  subtitle?: string;
}) {
  const [kps, setKps] = useState<Kp[]>([]);
  const [loaded, setLoaded] = useState(false);
  const codesKey = categoryCodes.join(",");

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      const { data: cats } = await supabase
        .from("junior_grammar_categories")
        .select("id,code")
        .in("code", categoryCodes);
      const catIds = (cats ?? []).map((c) => c.id);
      if (!catIds.length) {
        if (!cancelled) {
          setKps([]);
          setLoaded(true);
        }
        return;
      }
      let q = supabase
        .from("junior_grammar_points")
        .select("id,code,title,grade,category_id")
        .in("category_id", catIds);
      if (gradeNum) q = q.eq("grade", gradeNum);
      const { data } = await q.order("grade").order("code");
      if (!cancelled) {
        setKps((data ?? []) as Kp[]);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codesKey, gradeNum]);

  if (!loaded || kps.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="size-4 text-[#FF6B35]" />
        <h2 className="text-sm font-extrabold">{title}</h2>
      </div>
      {subtitle && <p className="mb-2 text-[11px] text-muted-foreground">{subtitle}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {kps.map((k) => (
          <Link
            key={k.id}
            to={`/junior/kp/${k.id}/practice`}
            className="flex items-center gap-2 rounded-2xl border bg-card p-3 transition hover:-translate-y-0.5 hover:border-[#FF6B35]/50"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{k.title}</span>
              <span className="block text-[11px] text-muted-foreground">{k.code} · 按考点 AI 抽题</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}
