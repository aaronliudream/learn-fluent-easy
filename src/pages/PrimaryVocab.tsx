import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Volume2, Check, X, Loader2, Sparkles, Trophy, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";
import { speak } from "@/lib/speak";
import { bumpVocabMastery, recordAttempt } from "@/lib/gaokaoMastery";
import { cn } from "@/lib/utils";
import { celebrateScore } from "@/lib/feedback";

type Vocab = {
  id: string;
  word: string;
  pos: string | null;
  meaning_cn: string;
  example_en: string | null;
  example_cn: string | null;
  theme: string | null;
  grade: number;
};

type Mode = "browse" | "quiz";

export default function PrimaryVocab() {
  const { grade: gradeParam } = useParams<{ grade?: string }>();
  const [sp] = useSearchParams();
  const focus = sp.get("focus"); // "weak" → 智能抽取薄弱词
  const lockedGrade = gradeParam ? Number(gradeParam) : null;
  const [words, setWords] = useState<Vocab[]>([]);
  const [grade, setGrade] = useState<number>(() =>
    lockedGrade ?? Number(localStorage.getItem("primary:lastGrade") ?? "1")
  );
  useEffect(() => { if (lockedGrade) setGrade(lockedGrade); }, [lockedGrade]);
  const [activeTheme, setActiveTheme] = useState<string>("all");
  const [mode, setMode] = useState<Mode>(focus === "weak" ? "quiz" : "browse");
  const [loading, setLoading] = useState(true);
  const [weakIds, setWeakIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("primary_vocab")
        .select("id,word,pos,meaning_cn,example_en,example_cn,theme,grade")
        .eq("grade", grade);
      const all = (data ?? []) as Vocab[];
      setWords(all);
      setActiveTheme("all");

      if (focus === "weak") {
        const { data: u } = await supabase.auth.getUser();
        const uid = u?.user?.id;
        if (uid && all.length) {
          const { data: m } = await supabase
            .from("primary_word_mastery")
            .select("word_id,mastery_level,quiz_correct,quiz_wrong,listen_correct,listen_wrong,spell_correct,spell_wrong,match_correct,match_wrong")
            .eq("user_id", uid).eq("grade", grade);
          const mMap = new Map<string, any>();
          (m ?? []).forEach((r: any) => mMap.set(r.word_id, r));
          // 评分：未学=100，做错过=80+错率*20，掌握度低 = 50-(level*10)，已掌握=0
          const scored = all.map(w => {
            const r = mMap.get(w.id);
            if (!r) return { w, score: 100 + Math.random() * 5 };
            const lvl = r.mastery_level ?? 0;
            const correct = (r.quiz_correct ?? 0) + (r.listen_correct ?? 0) + (r.spell_correct ?? 0) + (r.match_correct ?? 0);
            const wrong = (r.quiz_wrong ?? 0) + (r.listen_wrong ?? 0) + (r.spell_wrong ?? 0) + (r.match_wrong ?? 0);
            if (lvl >= 3) return { w, score: 5 + Math.random() * 5 };
            if (wrong > 0) {
              const wrongRate = wrong / Math.max(1, wrong + correct);
              return { w, score: 80 + wrongRate * 20 };
            }
            return { w, score: 60 - lvl * 15 + Math.random() * 5 };
          });
          scored.sort((a, b) => b.score - a.score);
          setWeakIds(new Set(scored.slice(0, 10).map(x => x.w.id)));
        }
      } else {
        setWeakIds(null);
      }
      setLoading(false);
    })();
  }, [grade]);

  const themes = useMemo(() => {
    const m = new Map<string, number>();
    words.forEach(w => { if (w.theme) m.set(w.theme, (m.get(w.theme) ?? 0) + 1); });
    return Array.from(m.entries()).map(([name, count]) => ({ name, count }));
  }, [words]);

  const filtered = useMemo(
    () => {
      if (weakIds) return words.filter(w => weakIds.has(w.id));
      return activeTheme === "all" ? words : words.filter((w) => w.theme === activeTheme);
    },
    [words, activeTheme, weakIds],
  );

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 md:px-6 md:py-10">
      <BackLink
        to={lockedGrade ? `/primary/grade/${lockedGrade}` : "/primary"}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {lockedGrade ? `返回 ${["一","二","三","四","五","六"][lockedGrade-1] ?? lockedGrade}年级` : "返回小学专区"}
      </BackLink>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            CORE VOCABULARY
          </div>
          <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">
            小学核心词汇
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {["一","二","三","四","五","六"][grade-1]}年级 · 共 {words.length} 词 · 已选 {filtered.length} 词
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

      <ModuleStageTests segment="primary" grade={grade} module="vocab" />

      {/* 年级 */}
      {!lockedGrade && (
        <div className="mb-3 flex flex-wrap gap-2">
          {[1,2,3,4,5,6].map(g => (
            <button
              key={g}
              onClick={() => { setGrade(g); localStorage.setItem("primary:lastGrade", String(g)); }}
              className={cn(
                "rounded-full border-2 px-3 py-1 text-xs font-extrabold transition",
                g === grade ? "border-amber-400 bg-amber-400 text-white" : "border-border bg-card hover:border-amber-300"
              )}
            >G{g}</button>
          ))}
        </div>
      )}

      {/* 主题 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <ThemeChip
          active={activeTheme === "all"}
          onClick={() => setActiveTheme("all")}
          label="🌈 全部"
        />
        {themes.map((t) => (
          <ThemeChip
            key={t.name}
            active={activeTheme === t.name}
            onClick={() => setActiveTheme(t.name)}
            label={`${t.name} · ${t.count}`}
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
    if (typeof window !== "undefined" && !(queue as any).__celebrated) {
      (queue as any).__celebrated = true;
      celebrateScore(pct);
    }
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
