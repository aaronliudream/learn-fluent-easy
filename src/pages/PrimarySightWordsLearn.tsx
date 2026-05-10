import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { speakKid } from "@/lib/speak";
import { SIGHT_WORDS } from "@/data/sightWords";
import { bumpSightWordLevel } from "@/lib/sightWordMastery";

/**
 * 学一个新高频词 — 大字 + 中文 + 例句 + 跟读 → "我会啦" 进入小测.
 */
export default function PrimarySightWordsLearn() {
  const { wordId } = useParams<{ wordId: string }>();
  const nav = useNavigate();
  const item = useMemo(() => SIGHT_WORDS.find((w) => w.id === wordId), [wordId]);

  useEffect(() => {
    document.title = item ? `学 ${item.word} | FluentPath` : "高频词";
    if (item) {
      const t = setTimeout(() => speakKid(item.word), 350);
      return () => clearTimeout(t);
    }
  }, [item]);

  if (!item) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-10 text-center">
        <BackLink to="/primary/sightwords" className="text-sm text-muted-foreground">
          ← 返回高频词
        </BackLink>
        <p className="mt-6 text-sm text-muted-foreground">找不到这个词。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-24 md:px-6">
      <BackLink
        to="/primary/sightwords"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回高频词
      </BackLink>

      <div className="space-y-5 rounded-3xl border-2 border-border bg-card p-6 shadow-tile">
        <div className="text-center">
          <div className="text-7xl font-black text-sky-600 dark:text-sky-300 md:text-8xl">
            {item.word}
          </div>
          <div className="mt-2 text-lg font-bold text-muted-foreground">{item.cn}</div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => speakKid(item.word)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-base font-bold text-primary-foreground shadow"
          >
            <Volume2 className="size-5" /> 听 Lily 老师读
          </button>
        </div>

        {item.example && (
          <div className="rounded-2xl bg-muted/50 p-4 text-center">
            <div className="text-base font-bold">{item.example}</div>
            <button
              onClick={() => speakKid(item.example!)}
              className="mt-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              🔊 听例句
            </button>
          </div>
        )}

        <button
          onClick={async () => {
            await bumpSightWordLevel(item.id, 1, 1); // 学过 → level 1
            nav(`/primary/sightwords/quiz/word/${item.id}`);
          }}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 p-4 text-base font-extrabold text-white shadow-tile"
        >
          我会啦,小测一下 <ArrowRight className="ml-1 inline size-4" />
        </button>
      </div>
    </main>
  );
}