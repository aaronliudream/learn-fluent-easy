import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, Lock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type R = { id: string; title: string; topic: string | null; word_count: number | null; difficulty: number; grade: number };

export default function JuniorReading() {
  const [params] = useSearchParams();
  const grade = params.get("grade");
  const backTo = grade ? `/junior/g/${grade}` : "/junior";
  const [items, setItems] = useState<R[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  useEffect(() => {
    const gradeMap: Record<string, number> = { "1": 7, "2": 8, "3": 9 };
    const dbGrade = grade ? (gradeMap[grade] ?? Number(grade)) : null;
    let q = supabase.from("junior_reading").select("id,title,topic,word_count,difficulty,grade").order("grade").order("created_at", { ascending: true });
    if (dbGrade) q = q.eq("grade", dbGrade);
    q.then(({ data }) => setItems((data ?? []) as R[]));
    supabase.auth.getUser().then(async ({ data: u }) => {
      if (!u?.user) return;
      const { data: comps } = await supabase.from("junior_reading_completions")
        .select("reading_id").eq("user_id", u.user.id).eq("perfect", true);
      setDone(new Set((comps ?? []).map((c: any) => c.reading_id)));
    });
  }, [grade]);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> {grade ? `返回初${grade}` : "返回初中专区"}</BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">📖 初中阅读训练</h1>
      <p className="mt-1 text-sm text-muted-foreground">闯关式阅读 · 全对解锁下一篇 · 防截屏保护</p>
      <div className="mt-5 grid gap-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">暂无文章，敬请期待</p>}
        {items.map((r, idx) => {
          const prev = items[idx - 1];
          const locked = idx > 0 && prev && !done.has(prev.id);
          const completed = done.has(r.id);
          const handleClick = (e: React.MouseEvent) => {
            if (locked) { e.preventDefault(); toast.error("请先完成上一篇并全对"); }
          };
          return (
            <Link key={r.id} to={`/junior/reading/${r.id}`} onClick={handleClick}
              className={cn("flex items-center gap-3 rounded-2xl border-2 p-3 transition",
                locked ? "border-border/50 bg-muted/40 opacity-60 cursor-not-allowed" : "border-border bg-card hover:-translate-y-0.5 hover:border-emerald-300")}>
              <div className={cn("grid size-11 place-items-center rounded-xl text-white",
                completed ? "bg-gradient-to-br from-emerald-500 to-emerald-600" :
                locked ? "bg-muted-foreground/40" : "bg-gradient-to-br from-emerald-400 to-teal-500")}>
                {completed ? <CheckCircle2 className="size-5" /> : locked ? <Lock className="size-5" /> : <FileText className="size-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-extrabold">{r.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  G{r.grade} · {r.topic ?? "general"} · {r.word_count ?? "?"} 词 · 难度 {r.difficulty}
                  {completed && <span className="ml-1 text-emerald-600 font-bold">· 已解锁 ✓</span>}
                  {locked && <span className="ml-1 text-orange-500 font-bold">· 需先完成上一篇</span>}
                </div>
              </div>
            </Link>
          );
        })}
        <div className="mt-3 text-[11px] text-muted-foreground">
          🔒 必须 5/5 全对 + 满足最短阅读时间，才能解锁下一篇 · 答错的题会立刻显示答案与解析
        </div>
      </div>
    </main>
  );
}