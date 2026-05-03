import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link } from "react-router-dom";
import { ArrowLeft, Volume2, Sparkles, Music, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { cn } from "@/lib/utils";

type ExampleWord = { word: string; ipa: string; meaning_cn: string; emoji: string };
type Letter = {
  id: string;
  letter_upper: string;
  letter_lower: string;
  sort_order: number;
  letter_name_ipa: string;
  phonics_short_ipa: string | null;
  phonics_long_ipa: string | null;
  mouth_tip_cn: string | null;
  stroke_order_cn: string | null;
  chant_cn: string | null;
  chant_en: string | null;
  example_words: ExampleWord[];
  fun_fact_cn: string | null;
};

export default function PrimaryLetters() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [active, setActive] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("primary_letters")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        const list = (data ?? []) as unknown as Letter[];
        setLetters(list);
        if (list.length) setActive(list[0]);
        setLoading(false);
      });
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 md:px-6 md:py-10">
      <BackLink
        to="/primary"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回小学专区
      </BackLink>
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          26 LETTERS · PHONICS
        </div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">
          26 个字母 · 自然拼读
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> 加载中…
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          {/* 字母网格 */}
          <div className="grid grid-cols-6 gap-2 md:grid-cols-4">
            {letters.map((l) => (
              <button
                key={l.id}
                onClick={() => setActive(l)}
                className={cn(
                  "aspect-square rounded-xl border-2 text-lg font-extrabold transition-all",
                  active?.id === l.id
                    ? "border-primary bg-primary/10 text-primary scale-105 shadow-lg"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                {l.letter_upper}
                <span className="ml-0.5 text-muted-foreground">{l.letter_lower}</span>
              </button>
            ))}
          </div>

          {/* 字母详情 */}
          {active && <LetterCard letter={active} />}
        </div>
      )}
    </main>
  );
}

function LetterCard({ letter: l }: { letter: Letter }) {
  const sayName = () => speak(l.letter_upper);
  const sayShort = () =>
    l.example_words[0] ? speak(l.example_words[0].word) : speak(l.letter_upper);

  return (
    <div className="space-y-4">
      {/* 字母大卡 */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6 text-white shadow-tile">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[80px] font-black leading-none">
              {l.letter_upper}
              <span className="text-white/80">{l.letter_lower}</span>
            </div>
            <div className="mt-1 text-sm font-mono opacity-90">
              字母名 {l.letter_name_ipa}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={sayName}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur-sm hover:bg-white/30"
            >
              <Volume2 className="size-4" /> 字母名
            </button>
            {l.phonics_short_ipa && (
              <button
                onClick={sayShort}
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur-sm hover:bg-white/30"
              >
                <Sparkles className="size-4" /> 拼读音
              </button>
            )}
          </div>
        </div>
        {(l.phonics_short_ipa || l.phonics_long_ipa) && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {l.phonics_short_ipa && (
              <span className="rounded-full bg-white/25 px-3 py-1 font-mono">
                短音 {l.phonics_short_ipa}
              </span>
            )}
            {l.phonics_long_ipa && (
              <span className="rounded-full bg-white/25 px-3 py-1 font-mono">
                长音 {l.phonics_long_ipa}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 口型 + 笔顺 */}
      <div className="grid gap-3 sm:grid-cols-2">
        {l.mouth_tip_cn && (
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="text-xs font-bold text-muted-foreground">👄 发音口型</div>
            <p className="mt-1 text-sm">{l.mouth_tip_cn}</p>
          </div>
        )}
        {l.stroke_order_cn && (
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="text-xs font-bold text-muted-foreground">✍️ 书写笔顺</div>
            <p className="mt-1 text-sm">{l.stroke_order_cn}</p>
          </div>
        )}
      </div>

      {/* 儿歌 */}
      {(l.chant_cn || l.chant_en) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Music className="size-4" /> 字母儿歌
            </div>
            {l.chant_en && (
              <button
                onClick={() => speak(l.chant_en!)}
                className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[11px] font-bold text-white hover:bg-amber-600"
              >
                <Volume2 className="size-3" /> 听
              </button>
            )}
          </div>
          {l.chant_en && <p className="mt-1.5 text-sm font-bold">{l.chant_en}</p>}
          {l.chant_cn && (
            <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-200">
              {l.chant_cn}
            </p>
          )}
        </div>
      )}

      {/* 例词 emoji 卡 */}
      <div>
        <div className="mb-2 text-xs font-bold text-muted-foreground">🎴 拼读例词</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {l.example_words.map((w, i) => (
            <button
              key={i}
              onClick={() => speak(w.word)}
              className="group flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
            >
              <div className="text-3xl">{w.emoji}</div>
              <div className="text-sm font-extrabold">{w.word}</div>
              <div className="text-[10px] font-mono text-muted-foreground">
                {w.ipa}
              </div>
              <div className="text-xs text-muted-foreground">{w.meaning_cn}</div>
              <Volume2 className="size-3 text-primary opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      {l.fun_fact_cn && (
        <div className="rounded-2xl bg-violet-50 p-3 text-xs text-violet-800 dark:bg-violet-950/30 dark:text-violet-300">
          💡 <span className="font-bold">小知识：</span>
          {l.fun_fact_cn}
        </div>
      )}
    </div>
  );
}
