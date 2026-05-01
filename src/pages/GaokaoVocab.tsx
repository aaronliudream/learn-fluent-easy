import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { speak } from "@/lib/speak";
import { bumpMastery, recordAttempt } from "@/lib/gaokaoMastery";

type Vocab = { id: string; word: string; pos: string | null; meaning_cn: string; example_en: string | null; example_cn: string | null };

export default function GaokaoVocab() {
  const [list, setList] = useState<Vocab[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ known: 0, unknown: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gaokao_vocab")
        .select("*")
        .order("frequency_band")
        .order("word")
        .limit(50);
      setList((data ?? []) as Vocab[]);
      setLoading(false);
    })();
  }, []);

  const v = list[idx];

  const mark = async (known: boolean) => {
    if (!v) return;
    setStats((s) => ({ known: s.known + (known ? 1 : 0), unknown: s.unknown + (known ? 0 : 1) }));
    await recordAttempt({ questionType: "vocab", questionId: v.id, isCorrect: known });
    await bumpMastery({ itemType: "vocab", itemId: v.id, isCorrect: known });
    setRevealed(false);
    setIdx((i) => i + 1);
  };

  if (loading) return <p className="p-8 text-sm text-muted-foreground">加载中...</p>;

  const finished = idx >= list.length;

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <Link to="/gaokao" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回高考英语
      </Link>
      <PageHeader title="高考词汇" subtitle="左滑/右滑标记，已掌握的不再重复推送" />

      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>第 {Math.min(idx + 1, list.length)} / {list.length} 词</span>
        <span>✓ {stats.known} · ✗ {stats.unknown}</span>
      </div>

      {finished ? (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <div className="text-lg font-bold">本轮完成 🎉</div>
          <div className="mt-2 text-sm text-muted-foreground">
            掌握 {stats.known} / 不熟 {stats.unknown}
          </div>
          <Button asChild className="mt-4"><Link to="/gaokao">返回</Link></Button>
        </div>
      ) : v ? (
        <div className="rounded-3xl border bg-card p-8 text-center shadow-tile">
          <button
            onClick={() => speak(v.word)}
            className="mx-auto mb-2 inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight"
          >
            {v.word} <Volume2 className="size-5 text-primary" />
          </button>
          {v.pos && <div className="text-xs text-muted-foreground">{v.pos}</div>}

          {revealed ? (
            <div className="mt-6 space-y-3 text-left">
              <div className="rounded-xl bg-muted/50 p-3 text-sm font-medium">{v.meaning_cn}</div>
              {v.example_en && (
                <div className="rounded-xl border p-3 text-sm">
                  <div>{v.example_en}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{v.example_cn}</div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => mark(false)}>
                  <X className="mr-1 size-4" /> 还不熟
                </Button>
                <Button className="flex-1" onClick={() => mark(true)}>
                  <Check className="mr-1 size-4" /> 已掌握
                </Button>
              </div>
            </div>
          ) : (
            <Button className="mt-6" onClick={() => setRevealed(true)}>显示释义</Button>
          )}
        </div>
      ) : null}
    </main>
  );
}