import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type R = { id: string; title: string; topic: string | null; word_count: number | null; difficulty: number; grade: number };

export default function JuniorReading() {
  const [params] = useSearchParams();
  const grade = params.get("grade");
  const backTo = grade ? `/junior/g/${grade}` : "/junior";
  const [items, setItems] = useState<R[]>([]);
  useEffect(() => {
    let q = supabase.from("junior_reading").select("id,title,topic,word_count,difficulty,grade").order("grade");
    if (grade) q = q.eq("grade", Number(grade));
    q.then(({ data }) => setItems((data ?? []) as R[]));
  }, [grade]);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> {grade ? `返回初${grade}` : "返回初中专区"}</BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">📖 初中阅读训练</h1>
      <p className="mt-1 text-sm text-muted-foreground">主题阅读 · 答题解析 · 答对喂宠物</p>
      <div className="mt-5 grid gap-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">暂无文章，敬请期待</p>}
        {items.map(r => (
          <Link key={r.id} to={`/junior/reading/${r.id}`} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 transition hover:-translate-y-0.5 hover:border-emerald-300">
            <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white"><FileText className="size-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-extrabold">{r.title}</div>
              <div className="text-[11px] text-muted-foreground">G{r.grade} · {r.topic ?? "general"} · {r.word_count ?? "?"} 词 · 难度 {r.difficulty}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}