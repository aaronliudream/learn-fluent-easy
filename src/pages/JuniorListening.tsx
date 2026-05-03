import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link } from "react-router-dom";
import { ArrowLeft, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type E = { id: string; title: string; topic: string | null; grade: number; difficulty: number };

export default function JuniorListening() {
  const [items, setItems] = useState<E[]>([]);
  useEffect(() => {
    (supabase as any).from("junior_listening_exercises")
      .select("id,title,topic,grade,difficulty")
      .order("grade").then(({ data }: any) => setItems((data ?? []) as E[]));
  }, []);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/junior" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> 返回初中专区</BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">🎧 初中听力训练</h1>
      <p className="mt-1 text-sm text-muted-foreground">短文/对话 · 听音答题 · 答对喂宠物</p>
      <div className="mt-5 grid gap-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">暂无听力，敬请期待</p>}
        {items.map(e => (
          <Link key={e.id} to={`/junior/listening/${e.id}`} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 transition hover:-translate-y-0.5 hover:border-sky-400">
            <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white"><Headphones className="size-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-extrabold">{e.title}</div>
              <div className="text-[11px] text-muted-foreground">G{e.grade} · {e.topic ?? "general"} · 难度 {e.difficulty}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}