import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Volume2, Check, X, Loader2, Sparkles, Trophy, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { bumpVocabMastery, recordAttempt } from "@/lib/gaokaoMastery";
import { cn } from "@/lib/utils";

type Vocab = {
  id: string;
  word: string;
  phonetic: string | null;
  pos: string | null;
  meaning_cn: string;
  meaning_en: string | null;
  example_en: string | null;
  example_cn: string | null;
  star_level: number | null;
  theme: string | null;
  freq_rank: number | null;
};

type Theme = {
  code: string;
  name_cn: string;
  emoji: string;
};

type Mode = "browse" | "quiz";

export default function PrimaryVocab() {
  const [words, setWords] = useState<Vocab[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>("all");
  const [mode, setMode] = useState<Mode>("browse");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from("gaokao_vocab")
        .select("id,word,phonetic,pos,meaning_cn,meaning_en,example_en,example_cn,star_level,theme,freq_rank")
        .eq("stage", "primary")
        .order("freq_rank", { ascending: true })
        .limit(500),
      supabase
        .from("gaokao_vocab_themes")
        .select("code,name_cn,emoji")
        .eq("stage", "primary")
        .order("sort_order"),
    ]).then(([w, t]) => {
      setWords((w.data ?? []) as Vocab[]);
      setThemes((t.data ?? []) as Theme[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => (activeTheme === "all" ? words : words.filter((w) => w.theme === activeTheme)),
    [words, activeTheme],
  );

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 md:px-6 md:py-10">
      <Link
        to="/primary"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回小学专区
      </Link>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            CORE VOCABULARY
          </div>
          <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">
            小学核心词汇
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            教育部新课标 · 共 {words.length} 词 · 已选 {filtered.length} 词
          </p>
        </div>
        <div className="inline-flex rounded-full bg-secondary p-1 text-xs font-bold">
          <button
            onClick={() => setMode("browse")}
            className={cn(
              "rounded-full px-3 py-1.5",
              mode === "browse" ? "bg-card shadow" : "text-muted-foreground",
            )}
          >
            📖 浏览
          </button>
          <button
            onClick={() => setMode("quiz")}
            className={cn(
              "rounded-full px-3 py-1.5",
              mode === "quiz" ? "bg-card shadow" : "text-muted-foreground",
            )}
          >
            🎯 测验
          </button>
        </div>
      </div>

      {/* 主题 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <ThemeChip
          active={activeTheme === "all"}
          onClick={() => setActiveTheme("all")}
          label="🌈 全部"
        />
        {themes.map((t) => (
          <ThemeChip
            key={t.code}
            active={activeTheme === t.code}
            onClick={() => setActiveTheme(t.code)}
            label={`${t.emoji} ${t.name_cn}`}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> 加载中…
        </div>
      ) : mode === "browse" ? (
        <BrowseGrid words={filtered} />
      ) : (
        <QuizMode words={filtered} />
      )}
    </main>
  );
}

function ThemeChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-bold transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40",
      )}
    >
      {label}
    </button>
  );
}

function BrowseGrid({ words }: { words: Vocab[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {words.map((w) => (
        <div
          key={w.id}
          className="group rounded-2xl border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold">{w.word}</span>
                {w.pos && (
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {w.pos}
                  </span>
                )}
              </div>
              {w.phonetic && (
                <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {w.phonetic}
                </div>
              )}
            </div>
            <button
              onClick={() => speak(w.word)}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
              aria-label="朗读"
            >
              <Volume2 className="size-4" />
            </button>
          </div>
          <div className="mt-2 text-sm font-bold">{w.meaning_cn}</div>
          {w.example_en && (
            <div className="mt-2 rounded-lg bg-secondary/50 p-2">
              <button
                onClick={() => speak(w.example_en!)}
                className="flex items-start gap-1.5 text-left text-xs leading-relaxed"
              >
                <Volume2 className="mt-0.5 size-3 shrink-0 text-primary" />
                <span>
                  {w.example_en}
                  {w.example_cn && (
                    <span className="mt-0.5 block text-muted-foreground">
                      {w.example_cn}
                    </span>
                  )}
                </span>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuizMode({ words }: { words: Vocab[] }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const queue = useMemo(() => shuffle(words).slice(0, 20), [words]);
  const cur = queue[idx];

  const options = useMemo(() => {
    if (!cur) return [];
    const distractors = shuffle(words.filter((w) => w.id !== cur.id))
      .slice(0, 3)
      .map((w) => w.meaning_cn);
    return shuffle([cur.meaning_cn, ...distractors]);
  }, [cur, words]);

  if (!cur) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
        <Trophy className="mx-auto size-10 text-amber-500" />
        <p className="mt-2 text-sm text-muted-foreground">没有可用单词</p>
      </div>
    );
  }

  if (idx >= queue.length) {
    const pct = Math.round((score.correct / score.total) * 100);
    return (
      <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
        <Trophy className="mx-auto size-12 text-amber-500" />
        <h3 className="mt-2 text-xl font-extrabold">
          {pct >= 90 ? "🌟 太棒了！" : pct >= 70 ? "👍 不错！" : "💪 继续加油！"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          答对 {score.correct} / {score.total} ({pct}%)
        </p>
        <button
          onClick={() => {
            setIdx(0);
            setPicked(null);
            setScore({ correct: 0, total: 0 });
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
        >
          <RotateCw className="size-4" /> 再来一组
        </button>
      </div>
    );
  }

  const onPick = async (m: string) => {
    if (picked) return;
    setPicked(m);
    const correct = m === cur.meaning_cn;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    speak(cur.word);
    await Promise.all([
      bumpVocabMastery({ vocabId: cur.id, isCorrect: correct, kind: "en2cn" }).catch(() => {}),
      recordAttempt({
        questionType: "vocab",
        questionId: cur.id,
        userAnswer: m,
        isCorrect: correct,
      }).catch(() => {}),
    ]);
    setTimeout(() => {
      setPicked(null);
      setIdx((i) => i + 1);
    }, 900);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          第 {idx + 1} / {queue.length} 题
        </span>
        <span className="font-bold">
          ✅ {score.correct} / {score.total}
        </span>
      </div>
      <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          请选择正确的中文意思
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="text-3xl font-black md:text-4xl">{cur.word}</span>
          <button
            onClick={() => speak(cur.word)}
            className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"
          >
            <Volume2 className="size-5" />
          </button>
        </div>
        {cur.phonetic && (
          <div className="mt-1 font-mono text-sm text-muted-foreground">
            {cur.phonetic}
          </div>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((m) => {
          const isCorrect = m === cur.meaning_cn;
          const showRight = picked && isCorrect;
          const showWrong = picked === m && !isCorrect;
          return (
            <button
              key={m}
              onClick={() => onPick(m)}
              disabled={!!picked}
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 p-4 text-left text-sm font-bold transition",
                showRight && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
                showWrong && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40",
                !picked && "border-border bg-card hover:border-primary/40",
                picked && !showRight && !showWrong && "opacity-60",
              )}
            >
              <span>{m}</span>
              {showRight && <Check className="size-5" />}
              {showWrong && <X className="size-5" />}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
        <Sparkles className="size-3" /> 答题数据已自动接入智能复习系统
      </div>
    </div>
  );
}
