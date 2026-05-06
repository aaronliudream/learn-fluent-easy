import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Volume2, Check, X, Loader2, Sparkles, Trophy, RotateCw, Headphones, BookOpen, Gamepad2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";
import { speak } from "@/lib/speak";
import { bumpVocabMastery, recordAttempt } from "@/lib/gaokaoMastery";
import { cn } from "@/lib/utils";
import { celebrateScore } from "@/lib/feedback";
import { markBrowseDone } from "@/components/primary/MasteryPath";

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
  // 进入词汇浏览即视为完成「① 认词」这一步
  useEffect(() => { if (mode === "browse") markBrowseDone(grade); }, [mode, grade]);
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
  // Session = 6 questions, 3 mixed types (en→cn / cn→en / listen→en)
  // Inspired by Duolingo Kids & Lingokids "micro-lesson" structure
  type QType = "en2cn" | "cn2en" | "listen2en";
  type Q = { type: QType; word: Vocab; options: string[]; answer: string };

  const params = useParams<{ grade?: string }>();
  const grade = Number(params.grade ?? "1");

  // Parent-configurable: read session size + type mix from profile
  const [sessionSize, setSessionSize] = useState(6);
  const [mix, setMix] = useState<{ en2cn: number; cn2en: number; listen2en: number }>({ en2cn: 2, cn2en: 2, listen2en: 2 });
  // Adaptive: per-word mastery rows for current grade
  const [masteryMap, setMasteryMap] = useState<Map<string, any>>(new Map());
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u?.user?.id; if (!id) return;
      const { data } = await supabase.from("profiles").select("quiz_session_size,quiz_type_mix").eq("user_id", id).maybeSingle();
      if (data) {
        if ((data as any).quiz_session_size) setSessionSize((data as any).quiz_session_size);
        const m = (data as any).quiz_type_mix;
        if (m) setMix({ en2cn: m.en2cn ?? 2, cn2en: m.cn2en ?? 2, listen2en: m.listen2en ?? 2 });
      }
      const { data: mr } = await supabase
        .from("primary_word_mastery")
        .select("word_id,mastery_level,quiz_correct,quiz_wrong,listen_correct,listen_wrong,spell_correct,spell_wrong,match_correct,match_wrong,last_seen_at")
        .eq("user_id", id).eq("grade", grade);
      const mp = new Map<string, any>();
      (mr ?? []).forEach((r: any) => mp.set(r.word_id, r));
      setMasteryMap(mp);
    })();
  }, [grade]);

  // Adaptive scoring: higher = more in need of practice
  // - Unlearned (no record): ~100
  // - Recently wrong: 80 + wrongRate*20
  // - Low mastery level: 60 - lvl*15
  // - Mastered (lvl>=3): ~5  (still occasionally surface for spaced review)
  const scoreWord = (w: Vocab): number => {
    const r = masteryMap.get(w.id);
    if (!r) return 100 + Math.random() * 5;
    const lvl = r.mastery_level ?? 0;
    const correct = (r.quiz_correct ?? 0) + (r.listen_correct ?? 0) + (r.spell_correct ?? 0) + (r.match_correct ?? 0);
    const wrong = (r.quiz_wrong ?? 0) + (r.listen_wrong ?? 0) + (r.spell_wrong ?? 0) + (r.match_wrong ?? 0);
    if (lvl >= 3) return 5 + Math.random() * 5;
    if (wrong > 0) {
      const wrongRate = wrong / Math.max(1, wrong + correct);
      return 80 + wrongRate * 20 + Math.random() * 3;
    }
    return 60 - lvl * 15 + Math.random() * 6;
  };

  const session: Q[] = useMemo(() => {
    if (words.length < 4) return [];
    const ratio: [QType, number][] = [
      ["en2cn", Math.max(0, mix.en2cn)],
      ["cn2en", Math.max(0, mix.cn2en)],
      ["listen2en", Math.max(0, mix.listen2en)],
    ];
    const totalRatio = ratio.reduce((a, [, n]) => a + n, 0);
    const types: QType[] = [];
    if (totalRatio === 0) {
      for (let i = 0; i < sessionSize; i++) types.push("en2cn");
    } else {
      const counts = ratio.map(([t, n]) => [t, Math.floor((n / totalRatio) * sessionSize)] as [QType, number]);
      let used = counts.reduce((a, [, n]) => a + n, 0);
      counts.sort((a, b) => b[1] - a[1]);
      let i = 0;
      while (used < sessionSize) { counts[i % counts.length][1] += 1; used++; i++; }
      counts.forEach(([t, n]) => { for (let k = 0; k < n; k++) types.push(t); });
    }
    const tShuffled = shuffle(types).slice(0, sessionSize);

    // Adaptive pick: weighted toward weakest / unlearned / recently-wrong words.
    // Take top (sessionSize * 3) by score, then sample sessionSize for variety.
    const ranked = words
      .map(w => ({ w, s: scoreWord(w) }))
      .sort((a, b) => b.s - a.s);
    const candidatePool = ranked.slice(0, Math.max(sessionSize, Math.min(ranked.length, sessionSize * 3)));
    const picks = shuffle(candidatePool).slice(0, sessionSize).map(x => x.w);
    return picks.map((w, i): Q => {
      const type = tShuffled[i % tShuffled.length];
      // 排除中文/英文与正确答案相同的干扰项，避免歧义
      const wrongPool = shuffle(
        words.filter(x => x.id !== w.id && x.word !== w.word && x.meaning_cn !== w.meaning_cn)
      );
      if (type === "en2cn") {
        const opts = shuffle([w.meaning_cn, ...wrongPool.slice(0, 3).map(x => x.meaning_cn)]);
        return { type, word: w, options: opts, answer: w.meaning_cn };
      }
      // cn2en & listen2en: pick the correct English word
      const opts = shuffle([w.word, ...wrongPool.slice(0, 3).map(x => x.word)]);
      return { type, word: w, options: opts, answer: w.word };
    });
  }, [words, sessionSize, mix.en2cn, mix.cn2en, mix.listen2en, masteryMap]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  // Track wrong words from this session for the "复习错题" mini-quiz
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [reviewSession, setReviewSession] = useState<Q[] | null>(null);

  const buildReviewSession = (): Q[] => {
    const wrongWords = words.filter(w => wrongIds.has(w.id));
    if (wrongWords.length === 0) return [];
    const types: QType[] = ["en2cn", "cn2en", "listen2en"];
    return wrongWords.map((w, i): Q => {
      const type = types[i % types.length];
      const wrongPool = shuffle(words.filter(x => x.id !== w.id));
      if (type === "en2cn") {
        const opts = shuffle([w.meaning_cn, ...wrongPool.slice(0, 3).map(x => x.meaning_cn)]);
        return { type, word: w, options: opts, answer: w.meaning_cn };
      }
      const opts = shuffle([w.word, ...wrongPool.slice(0, 3).map(x => x.word)]);
      return { type, word: w, options: opts, answer: w.word };
    });
  };

  const activeSession = reviewSession ?? session;
  const cur = activeSession[idx];

  // 听力题：播放次数 + 倒计时
  const LISTEN_MAX_PLAYS = 3;
  const LISTEN_SECONDS = 12;
  const [playsLeft, setPlaysLeft] = useState(LISTEN_MAX_PLAYS);
  const [secondsLeft, setSecondsLeft] = useState(LISTEN_SECONDS);

  // Auto-play audio for listen-type questions
  useEffect(() => {
    setPlaysLeft(LISTEN_MAX_PLAYS);
    setSecondsLeft(LISTEN_SECONDS);
    if (cur?.type === "listen2en") {
      const t = setTimeout(() => {
        speak(cur.word.word);
        setPlaysLeft(p => Math.max(0, p - 1));
      }, 250);
      return () => clearTimeout(t);
    }
  }, [cur]);

  // 听力题倒计时：每秒-1，归零自动进入下一题（按未作答处理）
  useEffect(() => {
    if (cur?.type !== "listen2en" || picked) return;
    if (secondsLeft <= 0) {
      // 超时：记为错题，自动进入下一题
      setScore(s => ({ correct: s.correct, total: s.total + 1 }));
      setWrongIds(prev => { const n = new Set(prev); n.add(cur.word.id); return n; });
      bumpVocabMastery({ vocabId: cur.word.id, isCorrect: false, kind: "listen" }).catch(() => {});
      recordAttempt({ questionType: "vocab", questionId: cur.word.id, userAnswer: "(timeout)", isCorrect: false }).catch(() => {});
      const t = setTimeout(() => { setPicked(null); setIdx(i => i + 1); }, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cur, picked, secondsLeft]);

  if (!cur && activeSession.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
        <Trophy className="mx-auto size-10 text-amber-500" />
        <p className="mt-2 text-sm text-muted-foreground">单词不足 4 个，无法生成测验</p>
      </div>
    );
  }

  if (idx >= activeSession.length) {
    const pct = Math.round((score.correct / score.total) * 100);
    if (typeof window !== "undefined" && !(activeSession as any).__celebrated) {
      (activeSession as any).__celebrated = true;
      celebrateScore(pct);
    }
    const wrongCount = wrongIds.size;
    return (
      <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
        <Trophy className="mx-auto size-12 text-amber-500" />
        <h3 className="mt-2 text-2xl font-extrabold">
          {pct >= 90 ? "🌟 太棒了！" : pct >= 70 ? "👍 不错！" : "💪 继续加油！"}
        </h3>
        <p className="mt-1 text-base text-muted-foreground">
          答对 {score.correct} / {score.total} ({pct}%)
        </p>

        {/* 错题复习入口 — 优先级最高 */}
        {wrongCount > 0 && (
          <button
            onClick={() => {
              const rs = buildReviewSession();
              if (rs.length === 0) return;
              setReviewSession(rs);
              setIdx(0); setPicked(null); setScore({ correct: 0, total: 0 });
              (rs as any).__celebrated = false;
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-orange-50 p-4 text-base font-extrabold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-rose-950/30 dark:to-orange-950/30 dark:text-rose-300"
          >
            <AlertCircle className="size-5" />
            复习错题 · {wrongCount} 词
          </button>
        )}
        {reviewSession && wrongCount === 0 && (
          <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            🎉 错题已全部攻克！
          </p>
        )}

        {/* "继续玩" 出口 — 与一年级其他活动联动 */}
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <button
            onClick={() => {
              setReviewSession(null);
              setWrongIds(new Set());
              setIdx(0); setPicked(null); setScore({ correct: 0, total: 0 });
            }}
            className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-violet-300 bg-violet-50 p-3 text-sm font-extrabold text-violet-700 transition hover:-translate-y-0.5 dark:bg-violet-950/30 dark:text-violet-300"
          >
            <RotateCw className="size-4" /> 再来 {sessionSize} 题
          </button>
          <Link
            to={`/primary/games/${grade}/listen`}
            className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-sky-300 bg-sky-50 p-3 text-sm font-extrabold text-sky-700 transition hover:-translate-y-0.5 dark:bg-sky-950/30 dark:text-sky-300"
          >
            <Headphones className="size-4" /> 听力游戏
          </Link>
          <Link
            to={`/primary/reading/grade/${grade}`}
            className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3 text-sm font-extrabold text-emerald-700 transition hover:-translate-y-0.5 dark:bg-emerald-950/30 dark:text-emerald-300"
          >
            <BookOpen className="size-4" /> 去阅读
          </Link>
        </div>
        <Link
          to={`/primary/games/${grade}`}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Gamepad2 className="size-3.5" /> 或玩个单词游戏 →
        </Link>
      </div>
    );
  }

  const onPick = async (m: string) => {
    if (picked) return;
    setPicked(m);
    const correct = m === cur.answer;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (!correct) {
      setWrongIds(prev => {
        const n = new Set(prev); n.add(cur.word.id); return n;
      });
    } else if (reviewSession) {
      // 在错题复习中答对 → 从错题集合移除
      setWrongIds(prev => {
        const n = new Set(prev); n.delete(cur.word.id); return n;
      });
    }
    if (cur.type !== "listen2en") speak(cur.word.word);
    await Promise.all([
      bumpVocabMastery({
        vocabId: cur.word.id,
        isCorrect: correct,
        kind: cur.type === "listen2en" ? "listen" : cur.type,
      }).catch(() => {}),
      recordAttempt({
        questionType: "vocab",
        questionId: cur.word.id,
        userAnswer: m,
        isCorrect: correct,
      }).catch(() => {}),
    ]);
    setTimeout(() => {
      setPicked(null);
      setIdx((i) => i + 1);
    }, 800);
  };

  const promptLabel =
    cur.type === "en2cn" ? "请选择正确的中文意思" :
    cur.type === "cn2en" ? "请选择正确的英文单词" :
    "🎧 听一听，选出对应的单词";

  return (
    <div className="space-y-4">
      {/* Progress bar — Duolingo-style */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {reviewSession ? "🔁 错题复习 · " : ""}第 {idx + 1} / {activeSession.length} 题
          </span>
          <span className="font-extrabold text-emerald-600">✅ {score.correct} / {score.total}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
            style={{ width: `${(idx / activeSession.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {promptLabel}
        </div>

        {cur.type === "en2cn" && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-3xl font-black md:text-4xl">{cur.word.word}</span>
            <button onClick={() => speak(cur.word.word)} className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
              <Volume2 className="size-5" />
            </button>
          </div>
        )}
        {cur.type === "cn2en" && (
          <div className="mt-3 text-3xl font-black md:text-4xl">{cur.word.meaning_cn}</div>
        )}
        {cur.type === "listen2en" && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <button
              onClick={() => {
                if (playsLeft <= 0 || picked) return;
                speak(cur.word.word);
                setPlaysLeft(p => Math.max(0, p - 1));
              }}
              disabled={playsLeft <= 0 || !!picked}
              className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-500 text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="再听一次"
            >
              <Volume2 className="size-9" />
            </button>
            <div className="flex items-center gap-3 text-xs">
              <span className={cn("font-bold", playsLeft === 0 ? "text-rose-600" : "text-muted-foreground")}>
                🔊 剩 {playsLeft} / {LISTEN_MAX_PLAYS} 次
              </span>
              <span className={cn("font-extrabold tabular-nums", secondsLeft <= 3 ? "text-rose-600" : "text-sky-600")}>
                ⏱ {secondsLeft}s
              </span>
            </div>
            <div className="h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-secondary">
              <div
                className={cn("h-full transition-all", secondsLeft <= 3 ? "bg-rose-500" : "bg-sky-500")}
                style={{ width: `${(secondsLeft / LISTEN_SECONDS) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {cur.options.map((m) => {
          const isCorrect = m === cur.answer;
          const showRight = picked && isCorrect;
          const showWrong = picked === m && !isCorrect;
          return (
            <button
              key={m}
              onClick={() => onPick(m)}
              disabled={!!picked}
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 p-4 text-left text-base font-bold transition",
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
