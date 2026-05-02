import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";

type Point = {
  id: string;
  title: string;
  slug: string;
  difficulty: number;
};

export default function GaokaoGrammar() {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gaokao_grammar_points")
        .select("id, title, slug, difficulty")
        .order("sort_order");
      setPoints(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <Link to="/gaokao" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回高考英语
      </Link>
      <PageHeader hideReviewBanner title="语法考点" subtitle="每个考点都有讲解 + 题库 + 错题智能追加" />

      {loading && <p className="text-sm text-muted-foreground">加载中...</p>}

      <ul className="grid gap-3">
        {points.map((p) => (
          <li key={p.id}>
            <Link
              to={`/gaokao/grammar/${p.slug}`}
              className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-tile"
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold leading-tight">{p.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  难度 {"★".repeat(p.difficulty)}{"☆".repeat(5 - p.difficulty)}
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      {!loading && points.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          还没有语法考点，请稍后再来。
        </p>
      )}
    </main>
  );
}