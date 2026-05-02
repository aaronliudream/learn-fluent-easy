import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";

type Passage = { id: string; title: string; topic: string | null; difficulty: number; word_count: number | null };

export default function GaokaoReading() {
  const [items, setItems] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gaokao_reading_passages")
        .select("id, title, topic, difficulty, word_count")
        .order("difficulty");
      setItems(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <Link to="/gaokao" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回高考英语
      </Link>
      <PageHeader hideReviewBanner title="阅读理解" subtitle="文章结构分析 + 每个选项为什么对 / 错" />

      {loading && <p className="text-sm text-muted-foreground">加载中...</p>}

      <ul className="grid gap-3">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              to={`/gaokao/reading/${p.id}`}
              className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-tile"
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-600">
                <FileText className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold leading-tight">{p.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  难度 {"★".repeat(p.difficulty)}{"☆".repeat(5 - p.difficulty)}
                  {p.word_count && ` · ${p.word_count} 词`}
                  {p.topic && ` · ${p.topic}`}
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      {!loading && items.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">还没有阅读文章。</p>
      )}
    </main>
  );
}