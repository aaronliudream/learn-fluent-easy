import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Cat = { id: string; name_cn: string; emoji: string; sort_order: number };
type Pt = { id: string; category_id: string; title: string; cefr: string; grade: number; summary: string };

export default function JuniorGrammar() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [pts, setPts] = useState<Pt[]>([]);
  useEffect(() => {
    (async () => {
      const [c, p] = await Promise.all([
        supabase.from("junior_grammar_categories").select("*").order("sort_order"),
        supabase.from("junior_grammar_points").select("*").order("sort_order"),
      ]);
      setCats((c.data ?? []) as Cat[]);
      setPts((p.data ?? []) as Pt[]);
    })();
  }, []);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/junior" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回初中专区
      </BackLink>
      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">JUNIOR · GRAMMAR</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">中考语法专项</h1>
        <p className="mt-1 text-sm text-muted-foreground">按 CEFR 分级 · 每个考点配讲解 + 题库 · 答对喂宠物</p>
      </div>
      <div className="space-y-6">
        {cats.map(c => (
          <section key={c.id}>
            <h2 className="mb-2 flex items-center gap-2 text-base font-extrabold">
              <span className="text-xl">{c.emoji}</span>{c.name_cn}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {pts.filter(p => p.category_id === c.id).map(p => (
                <Link key={p.id} to={`/junior/grammar/${p.id}`}
                  className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 transition hover:-translate-y-0.5 hover:border-indigo-300">
                  <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500 text-white"><BookOpen className="size-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold">{p.title}</div>
                    <div className="text-[11px] text-muted-foreground">{p.cefr} · G{p.grade} · {p.summary}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}